import { Controller, Logger } from '@nestjs/common';
import {
    SqsAttributes,
    SqsMessageAttributes,
    SqsMessageBody,
    SqsMessageHandler,
    SqsMessageId,
    SqsQueueEventHandler,
} from '../lib/index.js';
import { ZodValidationPipe } from './test.validation.js';
import { TestSchema, testSchema } from './test.schema.js';
import { Events } from 'sqs-consumer';

@Controller()
export class TestSqsController {
    private readonly logger = new Logger(TestSqsController.name);

    @SqsMessageHandler({
        queueUrl: process.env.SQS_QUEUE_URL!,
        attributeNames: ['All'],
    })
    public async messageHandler(
        // This will extract the message body from the SQS message
        @SqsMessageBody(new ZodValidationPipe(testSchema)) body: TestSchema,
        // This will extract the message ID from the SQS message
        @SqsMessageId() messageId: string,
        // This will extract the attributes  from the SQS message
        @SqsAttributes() attributes: unknown,
        @SqsAttributes('SenderId') senderId: unknown,
        // This will extract the message attributes from the SQS message
        @SqsMessageAttributes() messageAttributes: unknown,
    ): Promise<void> {
        this.logger.log({ msg: 'A message was received!', messageId, messageAttributes, attributes, body, senderId });
    }

    @SqsQueueEventHandler({
        queueUrl: process.env.SQS_QUEUE_URL!,
        event: 'error',
    })
    public async eventHandler([error, message]: Events['error']): Promise<void> {
        this.logger.log({ msg: 'An event was received!', error, message });
    }

    // @SqsMessageHandler({
    //     queueUrl: process.env.SQS_QUEUE_URL!,
    //     batch: true,
    // })
    // public async batchMessageHandler(@SqsBatchMessages() messages: Message[]): Promise<void> {
    //     this.logger.log({ msg: 'A batch message was received!', messages });
    // }
}
