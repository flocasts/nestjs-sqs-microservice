import { BaseRpcContext } from '@nestjs/microservices';
import { SingleOrBatchMessage, SqsMessageHandlerOptions } from '../common';

type AwsSQSMessageContextArgs = [
    // The incoming message
    SingleOrBatchMessage,
    // The message ID
    string,
    // The raw handler metadata
    SqsMessageHandlerOptions,
];

/**
 * Context for an incoming AWS SQS message
 */
export class AwsSQSMessageContext extends BaseRpcContext<AwsSQSMessageContextArgs> {
    constructor(args: AwsSQSMessageContextArgs) {
        super(args);
    }

    /**
     * Returns the AWS SQS Message instance
     */
    public getMessage(): SingleOrBatchMessage {
        return this.args[0];
    }

    /**
     * Returns the AWS SQS Message id
     */
    public getMessageId(): string {
        return this.args[1];
    }

    /**
     * Returns the raw metadata for the handler
     */
    public getRawMetadata(): SqsMessageHandlerOptions {
        return this.args[2];
    }
}
