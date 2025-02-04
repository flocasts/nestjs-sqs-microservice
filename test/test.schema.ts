import { z } from 'zod';

export const testSchema = z.object({
    test: z.string(),
});

export type TestSchema = z.infer<typeof testSchema>;
