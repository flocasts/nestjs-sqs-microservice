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
