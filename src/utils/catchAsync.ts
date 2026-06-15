import { Request, Response, NextFunction } from 'express';

// Define a type for an async handler
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response<unknown> | void>;

const catchAsync =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default catchAsync;