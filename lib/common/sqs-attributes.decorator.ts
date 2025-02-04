import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AwsSQSMessageContext } from '../ctx-host/index.js';
import { isSQSMessage } from './interfaces.js';

/**
 * Extracts attributes from the SQS message.
 *
 * @example
 * public async messageHandler(@sSqsMessageAttributes() attributes: unknown)
 *
 * @example
 * public async messageHandler(@SqsMessageAttributes('myKey') attributes: unknown)
 */
export const SqsAttributes = createParamDecorator(
    (key: string | undefined, ctx: ExecutionContext): string | Record<string, unknown> | undefined => {
        const message = ctx.switchToRpc().getContext<AwsSQSMessageContext>().getMessage();

        if (isSQSMessage(message)) {
            try {
                const attributes = message.Attributes as Record<string, string> | undefined;
                if (!attributes) {
                    return undefined;
                }

                if (key != null) {
                    return attributes[key];
                }
                return attributes;
            } catch {
                return undefined;
            }
        }
        return undefined;
    },
);
