import { Request, Response } from 'express';
import statsService from '../services/stats.service';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';

export const getStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await statsService.getStats();
  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Dashboard stats retrieved successfully',
    data: stats,
  });
});
