import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AwsSQSMessageContext } from '../ctx-host/index.js';
import { isSQSMessage } from './interfaces.js';

/**
 * Extracts message attributes from the SQS message.
 *
 * @example
 * public async messageHandler(@sSqsMessageAttributes() attributes: unknown)
 *
 * @example
 * public async messageHandler(@SqsMessageAttributes('myKey') attributes: unknown)
 */
export const SqsMessageAttributes = createParamDecorator<
    string | undefined,
    string | Record<string, unknown> | undefined
>((key, ctx: ExecutionContext) => {
    const message = ctx.switchToRpc().getContext<AwsSQSMessageContext>().getMessage();

    if (isSQSMessage(message)) {
        try {
            const attributes = message.MessageAttributes as Record<string, string> | undefined;
            if (!attributes) {
                return undefined;
            }

            if (key != null) {
                return attributes[key] as string;
            }
            return attributes;
        } catch {
            return undefined;
        }
    }
    return undefined;
});
