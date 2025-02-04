import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AwsSQSMessageContext } from '../ctx-host/index.js';
import { isSQSMessage } from './interfaces.js';

/**
 * Extracts the message body from the SQS message.
 *
 * @param key The key of the message body to extract.
 *
 * @example
 * public async messageHandler(@SqsMessageBody() body: unknown)
 *
 * @example
 * public async messageHandler(@SqsMessageBody('myKey') body: unknown)
 */
export const SqsMessageBody = createParamDecorator<string | undefined, Record<string, unknown> | unknown>(
    (key, ctx: ExecutionContext) => {
        const message = ctx.switchToRpc().getContext<AwsSQSMessageContext>().getMessage();

        if (isSQSMessage(message)) {
            try {
                const body = typeof message.Body === 'string' ? JSON.parse(message.Body) : message.Body;
                if (key != null) {
                    return body[key];
                }
                return body;
            } catch (error) {
                console.log(error);
                return null;
            }
        }
        return undefined;
    },
);
