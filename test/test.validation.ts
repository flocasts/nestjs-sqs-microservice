import { BadRequestException, Logger, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
    private logger: Logger = new Logger(ZodValidationPipe.name);
    constructor(private schema: ZodSchema) {}

    transform(value: unknown) {
        const parsedValue = this.schema.safeParse(value);
        if (parsedValue.success) {
            return parsedValue.data;
        } else {
            this.logger.error({ msg: 'Zod Validation failed!', error: parsedValue.error });
            throw new BadRequestException('Validation failed', { cause: parsedValue.error });
        }
    }
}
