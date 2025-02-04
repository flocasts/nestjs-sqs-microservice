import { Deserializer, PacketId, ReadPacket } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { SQSQueueEventArguments, SQSQueueEventHandlerOptions } from '../common/index.js';

export class SqsEventDeserializer implements Deserializer<SQSQueueEventArguments, ReadPacket<SQSQueueEventArguments>> {
    deserialize(
        value: SQSQueueEventArguments,
        options: SQSQueueEventHandlerOptions,
    ): ReadPacket<SQSQueueEventArguments> & PacketId {
        return {
            data: value,
            pattern: options.queueUrl,
            id: randomUUID(),
        };
    }
}
