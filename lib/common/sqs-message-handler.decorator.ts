import { EventPattern } from '@nestjs/microservices';
import { ConsumerOptions } from 'sqs-consumer';
import { SQS_TRANSPORT } from './constants.js';
import { randomUUID } from 'node:crypto';

export type SqsMessageHandlerOptions = Omit<ConsumerOptions, 'handleMessage' | 'handleMessageBatch' | 'sqs'> & {
    batch?: boolean;
};

/**
 * Sets this method to be a handler for SQS messages, as configured in the options provided.
 *
 * @param options The options to use for the SQS consumer.
 */
export function SqsMessageHandler(options: SqsMessageHandlerOptions): MethodDecorator {
    return EventPattern(randomUUID(), SQS_TRANSPORT, {
        sqsOptions: options,
    });
}
