import { EventPattern } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { Events } from 'sqs-consumer';
import { SQS_TRANSPORT } from './constants.js';

export interface SQSQueueEventHandlerOptions {
    event: keyof Events;
    queueUrl: string;
}

/**
 * Sets this method to be a handler for SQS messages, as configured in the options provided.
 *
 * @param options The options to use for the SQS consumer.
 */
export function SqsQueueEventHandler(options: SQSQueueEventHandlerOptions): MethodDecorator {
    return EventPattern(randomUUID(), SQS_TRANSPORT, {
        queueEventOptions: options,
    });
}
