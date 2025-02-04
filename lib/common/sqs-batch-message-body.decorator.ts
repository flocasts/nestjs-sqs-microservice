import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AwsSQSMessageContext } from '../ctx-host/index.js';
import { isBatchMessage } from './interfaces.js';

/**
 * Extracts messages from an SQS Batch message.
 *
 * @example
 * public async batchMessageHandler(@SqsBatchMessages() body: unknown)
 *
 */
export const SqsBatchMessages = createParamDecorator((_input, ctx: ExecutionContext) => {
    const messages = ctx.switchToRpc().getContext<AwsSQSMessageContext>().getMessage();

    if (isBatchMessage(messages)) {
        try {
            return messages;
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }
    return undefined;
});
