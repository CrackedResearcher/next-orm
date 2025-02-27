import { Next, Context } from "hono";
import { z, ZodError } from 'zod';
import * as _ from 'lodash';

export function validateData(schema: z.ZodObject<any, any>) {
  return async (c: Context, next: Next) => {
    try {
      schema.parse(c.body);
      c.cleanBody = _.pick(c.body, Object.keys(schema.shape));
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: z.ZodIssue) => ({
          message: `${issue.path.join('.')} is ${issue.message}`,
        }));
        return c.json({ error: 'Invalid data', details: errorMessages }, 400);
      } else {
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  };
}
