import { Message, SQSClient } from '@aws-sdk/client-sqs';
import { CustomTransportStrategy, ReadPacket, Server } from '@nestjs/microservices';
import { firstValueFrom, isObservable } from 'rxjs';
import { Consumer, Events } from 'sqs-consumer';
import { SqsMessageHandlerOptions, SQSQueueEventHandlerOptions } from '../common/index.js';
import {
    SQSQueueEventArguments,
    SingleOrBatchMessage,
    SQSEventHandler,
    SQSMessageHandler,
} from '../common/interfaces.js';
import { AwsSQSEventContext, AwsSQSMessageContext } from '../ctx-host/index.js';
import { SqsEventDeserializer, SqsMessageDeserializer } from '../deserializers/index.js';

export interface AwsSQSServerOptions {
    sqsClient?: SQSClient;
}

export class AwsSQSServer extends Server implements CustomTransportStrategy {
    private handlersByQueueUrl: Map<string, SQSMessageHandler> = new Map();
    private eventsByQueueUrl: Map<string, Set<SQSQueueEventHandlerOptions['event']>> = new Map();
    private sqsConsumersByQueueUrl: Map<string, Consumer> = new Map();

    protected readonly messageDeserializer = new SqsMessageDeserializer();
    protected readonly eventDeserializer = new SqsEventDeserializer();
    private readonly sqsClient: SQSClient;

    constructor(options: AwsSQSServerOptions = {}) {
        super();
        this.sqsClient = options.sqsClient ?? new SQSClient();
    }

    public async listen(callback: () => void): Promise<void> {
        await this.bindHandlers();
        callback();
    }

    private async bindHandlers() {
        // First we'll bind our message handlers
        for (const handler of this.messageHandlers.values()) {
            // If the handler has sqsOptions set then we should set up a consumer
            const sqsOptions: SqsMessageHandlerOptions = handler.extras?.sqsOptions;
            if (sqsOptions) {
                if (this.handlersByQueueUrl.has(sqsOptions.queueUrl)) {
                    this.logger.warn(
                        `Attempting to bind multiple handlers to the same queueUrl ${sqsOptions.queueUrl}, ignoring subsequent handlers`,
                    );
                    continue;
                }
                this.handlersByQueueUrl.set(sqsOptions.queueUrl, handler);
                this.logger.log(`Configuring handler to queue ${sqsOptions.queueUrl}`);

                // This consumer is what will produce the messages the handler will consume
                const consumer = new Consumer({
                    ...sqsOptions,
                    sqs: this.sqsClient,
                    // Here we call the handler with the message
                    handleMessage: !sqsOptions.batch
                        ? async (message: Message) => await this.handleMessage(message, handler, sqsOptions)
                        : undefined,
                    handleMessageBatch: sqsOptions.batch
                        ? async (messages: Message[]) => await this.handleMessage(messages, handler, sqsOptions)
                        : undefined,
                });

                this.sqsConsumersByQueueUrl.set(sqsOptions.queueUrl, consumer);
            }
        }

        // Next we'll bind our event handlers
        for (const handler of this.messageHandlers.values()) {
            // If the handler has queueEventOptions set then we should bind the handler to an existing consumer
            const sqsQueueEventOptions: SQSQueueEventHandlerOptions = handler.extras?.queueEventOptions;
            if (sqsQueueEventOptions) {
                const queueUrl = sqsQueueEventOptions.queueUrl;
                const event = sqsQueueEventOptions.event;
                if (!this.eventsByQueueUrl.has(queueUrl)) {
                    this.eventsByQueueUrl.set(queueUrl, new Set());
                }

                const eventSet = this.eventsByQueueUrl.get(queueUrl)!;

                if (eventSet.has(event)) {
                    this.logger.warn(
                        `Attempting to bind multiple handlers to the same ${event} event for ${queueUrl}, ignoring subsequent handlers`,
                    );
                    continue;
                }

                const consumer = this.sqsConsumersByQueueUrl.get(queueUrl);
                if (!consumer) {
                    this.logger.warn(
                        `Attempting to bind ${event} event handler to non-existent queue ${queueUrl}, ignoring handler`,
                    );
                    continue;
                }

                this.logger.log(`Configuring ${event} event handler for queue ${queueUrl}`);
                consumer?.on(event, async (...args) => {
                    await this.handleQueueEvent(args, handler, sqsQueueEventOptions);
                });
                eventSet.add(event);
            }
        }

        // Finally, let's start our consumers!
        for (const consumer of this.sqsConsumersByQueueUrl.values()) {
            consumer.start();
        }
    }

    private async handleMessage(
        message: SingleOrBatchMessage,
        handler: SQSMessageHandler,
        sqsOptions: SqsMessageHandlerOptions,
    ) {
        // Deserialize the message and add the context, basically we're adding sqsOptions to the context and setting the
        // NestJS message ID to match the message ID in the SQS message
        const [deserialized, ctx] = this.deserializeMessageAndAddContext([sqsOptions, message]);
        // This is what actually calls the handler, interceptors, guards, pipes, etc. are all applied already
        let result = await handler(deserialized, ctx);
        if (isObservable(result)) {
            result = await firstValueFrom(result);
        }
    }

    private async handleQueueEvent(
        eventArguments: SQSQueueEventArguments,
        handler: SQSEventHandler,
        sqsQueueEventOptions: SQSQueueEventHandlerOptions,
    ) {
        // Deserialize the message and add the context, basically we're adding sqsOptions to the context and setting the
        // NestJS message ID to match the message ID in the SQS message
        const [deserialized, ctx] = this.deserializeEventAndAddContext([sqsQueueEventOptions, eventArguments]);
        // This is what actually calls the handler, interceptors, guards, pipes, etc. are all applied already
        let result = await handler(deserialized, ctx);
        if (isObservable(result)) {
            result = await firstValueFrom(result);
        }
    }

    private deserializeMessageAndAddContext([options, message]: [SqsMessageHandlerOptions, SingleOrBatchMessage]): [
        ReadPacket<SingleOrBatchMessage>,
        AwsSQSMessageContext,
    ] {
        const deserialized = this.messageDeserializer.deserialize(message, options);
        return [deserialized, new AwsSQSMessageContext([message, deserialized.id, options])];
    }

    private deserializeEventAndAddContext([options, message]: [SQSQueueEventHandlerOptions, SQSQueueEventArguments]): [
        ReadPacket<SQSQueueEventArguments>,
        AwsSQSEventContext,
    ] {
        const deserialized = this.eventDeserializer.deserialize(message, options);
        return [deserialized, new AwsSQSEventContext([message, deserialized.id, options])];
    }

    /**
     * Triggered on application shutdown.
     */
    public close() {
        for (const [queueUrl, consumer] of this.sqsConsumersByQueueUrl) {
            const handler = this.handlersByQueueUrl.get(queueUrl);
            if (!handler) {
                this.logger.warn(`Attempting to close SQS Connections: No handler found for queueUrl ${queueUrl}`);
                continue;
            }
            consumer.stop();
        }
    }

    /**
     * You can ignore this method if you don't want transporter users
     * to be able to register event listeners. Most custom implementations
     * will not need this.
     */
    public on() {
        throw new Error('Method not implemented.');
    }

    /**
     * You can ignore this method if you don't want transporter users
     * to be able to retrieve the underlying native server. Most custom implementations
     * will not need this.
     */
    public unwrap<T = never>(): T {
        throw new Error('Method not implemented.');
    }
}
