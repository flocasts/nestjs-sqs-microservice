import { BaseRpcContext } from '@nestjs/microservices';
import { SQSQueueEventArguments, SQSQueueEventHandlerOptions } from '../common';

type AwsSQSEventContextArgs = [
    // The incoming message
    SQSQueueEventArguments,
    // The message ID
    string,
    // The raw handler metadata
    SQSQueueEventHandlerOptions,
];

/**
 * Context for an incoming AWS SQS event
 */
export class AwsSQSEventContext extends BaseRpcContext<AwsSQSEventContextArgs> {
    constructor(args: AwsSQSEventContextArgs) {
        super(args);
    }

    /**
     * Returns the AWS SQS Event Args instance
     */
    public getMessage(): SQSQueueEventArguments {
        return this.args[0];
    }

    /**
     * Returns the AWS SQS event message ID instance
     */
    public getMessageId(): string {
        return this.args[1];
    }

    /**
     * Returns the raw metadata for the handler
     */
    public getRawMetadata(): SQSQueueEventHandlerOptions {
        return this.args[2];
    }
}
