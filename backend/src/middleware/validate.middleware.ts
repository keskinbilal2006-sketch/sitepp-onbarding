import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

export interface RequestSchema {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

// Route bazinda body/params/query icin Zod schema takmamizi saglar.
export const validate = (schema: RequestSchema): RequestHandler => {
  return (req, _res, next) => {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }

    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }

    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }

    next();
  };
};
