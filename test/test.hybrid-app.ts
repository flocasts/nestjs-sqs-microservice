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
