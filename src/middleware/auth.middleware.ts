/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import httpStatus from 'http-status';

export interface CustomRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(httpStatus.UNAUTHORIZED).json({
      status: httpStatus.UNAUTHORIZED,
      message: 'No token provided. Please log in to continue.',
    });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

   
      // Regular user token
      const user = await User.findById(decoded.id);
      if (!user) {
        res
          .status(httpStatus.NOT_FOUND)
          .json({ status: httpStatus.NOT_FOUND, message: 'User not found' });
        return;
      }

      if (user.status === false) {
        res.status(httpStatus.UNAUTHORIZED).json({
          status: httpStatus.UNAUTHORIZED,
          message: 'Account disabled. Please contact the administrator.',
        });
        return;
      }

      req.user = user;
 

    next();
  } catch (error: unknown) {
    let errorMessage = 'Failed to authenticate token';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res
      .status(httpStatus.FORBIDDEN)
      .json({ status: httpStatus.FORBIDDEN, message: errorMessage });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(httpStatus.UNAUTHORIZED).json({
        status: httpStatus.UNAUTHORIZED,
        message: 'Unauthorized. Please log in first.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(httpStatus.FORBIDDEN).json({
        status: httpStatus.FORBIDDEN,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};