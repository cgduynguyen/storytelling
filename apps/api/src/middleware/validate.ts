import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError, HttpStatus } from './errorHandler';

/**
 * Validation target in request
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware to validate request data against Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, query, params)
 *
 * @example
 * router.post('/stories', validate(createStorySchema), handler);
 * router.get('/stories/:id', validate(storyIdSchema, 'params'), handler);
 */
export const validate = (
  schema: AnyZodObject,
  target: ValidationTarget = 'body'
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      const validated = await schema.parseAsync(data);

      // Replace request data with validated data (with defaults applied)
      req[target] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // ZodError will be handled by errorHandler middleware
        next(error);
      } else {
        next(new AppError(HttpStatus.BAD_REQUEST, 'Validation failed'));
      }
    }
  };
};

/**
 * Validate multiple targets (body + query + params)
 *
 * @example
 * router.put('/stories/:id', validateAll({
 *   params: storyIdSchema,
 *   body: updateStorySchema
 * }), handler);
 */
export const validateAll = (schemas: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate each target sequentially
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(new AppError(HttpStatus.BAD_REQUEST, 'Validation failed'));
      }
    }
  };
};
