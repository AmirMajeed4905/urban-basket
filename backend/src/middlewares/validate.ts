import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

// Generic validation middleware
// Usage: router.post("/login", validate(loginSchema), controller)

export const validate = (schema: AnyZodObject) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error); // ZodError — errorHandler handle karega
    }
  };
};
