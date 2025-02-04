import { Message } from '@aws-sdk/client-sqs';
import { MessageHandler } from '@nestjs/microservices';
import { Events, QueueMetadata } from 'sqs-consumer';

export type SQSMessageHandler = MessageHandler;
export type SQSEventHandler = MessageHandler;
export type SingleOrBatchMessage = Message | Message[];
export type SQSQueueEventArguments = [...Events[keyof Events], QueueMetadata];
export type IsBatchMessage<InputMessage extends SingleOrBatchMessage> = InputMessage extends Message[] ? true : false;

export function isBatchMessage(inputMessage: SingleOrBatchMessage | SQSQueueEventArguments): inputMessage is Message[] {
    return Array.isArray(inputMessage);
}

export function isSQSMessage(inputMessage: SingleOrBatchMessage | SQSQueueEventArguments): inputMessage is Message {
    return (inputMessage as Message).MessageId !== undefined;
}
