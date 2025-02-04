import { Deserializer, PacketId, ReadPacket } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { SingleOrBatchMessage, SqsMessageHandlerOptions } from '../common/index.js';

export class SqsMessageDeserializer implements Deserializer<SingleOrBatchMessage, ReadPacket<SingleOrBatchMessage>> {
    deserialize(
        value: SingleOrBatchMessage,
        options: SqsMessageHandlerOptions,
    ): ReadPacket<SingleOrBatchMessage> & PacketId {
        return {
            data: value,
            pattern: options.queueUrl,
            id: randomUUID(),
        };
    }
}
