import { Module } from '@nestjs/common';
import { TestSqsController } from './test.sqs-controller.js';
import { TestController } from './test.controller.js';

@Module({
    controllers: [TestController, TestSqsController],
})
export class TestModule {}
