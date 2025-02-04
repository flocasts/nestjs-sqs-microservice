import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Body, Controller, Post } from '@nestjs/common';

@Controller()
export class TestController {
    private readonly sqsClient = new SQSClient();

    @Post()
    public async messageHandler(@Body() body: unknown): Promise<void> {
        this.sqsClient.send(
            new SendMessageCommand({
                QueueUrl: process.env.SQS_QUEUE_URL,
                MessageBody: typeof body === 'string' ? body : JSON.stringify(body),
            }),
        );
    }
}
