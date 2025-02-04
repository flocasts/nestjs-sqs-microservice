# NestJS SQS Microservice

This is a fully featured NestJS microservice wrapper for [sqs-consumer](https://www.npmjs.com/package/sqs-consumer),
leveraging the wonderful feature set of the NestJS Microservice ecosystem. This means you get a seamless, controller
based experience for interacting with SQS queues!

## Features

### Decorators

| Name                      | Type               | Description                                         | Options                                                                               | Batch Compatible   |
| ------------------------- | ------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------ |
| **@SqsMessage**           | Method Decorator   | Marks a Controller method as an SQS Message Handler | [ConsumerOptions](https://bbc.github.io/sqs-consumer/interfaces/ConsumerOptions.html) | :white_check_mark: |
| **@SqsMessageBody**       | Property Decorator | Extracts the message body from the SQS message      | Body key (optional)                                                                   | :x:                |
| **@SqsMessageId**         | Property Decorator | Extracts the message ID from the SQS message        |                                                                                       | :x:                |
| **@SqsAttributes**        | Property Decorator | Extracts attributes from the SQS message            | Attribute Key (optional)                                                              | :x:                |
| **@SqsMessageAttributes** | Property Decorator | Extracts message attributes from the SQS message    | Message Attribute Key (optional)                                                      | :x:                |
| **@SqsBatchMessages**     | Property Decorator | Extracts messages from an SQS Batch message         |                                                                                       | :white_check_mark: |

## Getting Started

### Setting up the Microservice

#### Hybrid Applications

In most cases you'll end up going with a hybrid application, meaning you'll use both HTTP and Microservice handlers, here's how you do that:

```typescript
import { NestFactory } from '@nestjs/core';
import { TestModule } from './test.module.js';
import { AwsSQSServer } from '../index.js';

async function bootstrap() {
    const app = await NestFactory.create(TestModule);
    app.connectMicroservice({
        strategy: new AwsSQSServer(),
    });

    await app.startAllMicroservices();
    await app.listen(3000);
}
bootstrap();
```

[Check here for the full file](./test/test.hybrid-app.ts)

#### Standalone Microservice Applications

Sometimes you do just need a microservice, though, and here's what that looks like:

```typescript
import { NestFactory } from '@nestjs/core';
import { TestModule } from './test.module.js';
import { AwsSQSServer } from '../index.js';

async function bootstrap() {
    const app = await NestFactory.createMicroservice(TestModule, {
        strategy: new AwsSQSServer(),
    });

    await app.listen();
}
bootstrap();
```

[Check here for the full file](./test/test.app.ts)

### Setting up Controllers

Here's the controller from our tests ([check here for the full thing!](./test/test.sqs-controller.ts)):

```typescript
@Controller()
export class TestSqsController {
    private readonly logger = new Logger(TestSqsController.name);

    @SqsMessageDecorator({
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
        this.logger.log({msg: 'A message was received!', messageId, messageAttributes, attributes, body, senderId });
    }
```

We also support the batch syntax, as used by `sqs-consumer`:

```typescript
@Controller()
export class TestSqsController {
    private readonly logger = new Logger(TestSqsController.name);

    @SqsMessageDecorator({
        queueUrl: process.env.SQS_QUEUE_URL!,
        batch: true,
    })
    public async batchMessageHandler(@SqsBatchMessages() messages: Message[]): Promise<void> {
        this.logger.log({ msg: 'A batch message was received!', messages });
    }
}
```
