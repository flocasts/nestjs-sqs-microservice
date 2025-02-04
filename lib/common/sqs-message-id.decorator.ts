import { Message } from '@aws-sdk/client-sqs';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AwsSQSMessageContext } from '../ctx-host/index.js';
import { isSQSMessage } from './interfaces.js';

/**
 * Extracts the message ID from the SQS message.
 *
 * @example
 * public async messageHandler(@SqsMessageId() body: unknown)
 */
export const SqsMessageId = createParamDecorator((key, ctx: ExecutionContext): Message['MessageId'] => {
    const message = ctx.switchToRpc().getContext<AwsSQSMessageContext>().getMessage();

    if (isSQSMessage(message)) {
        return message.MessageId;
    }
    return undefined;
});
