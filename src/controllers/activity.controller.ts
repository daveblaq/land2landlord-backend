import { Request, Response } from 'express';
import activityService from '../services/activity.service';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';

export const getRecentActivities = catchAsync(async (req: Request, res: Response) => {
  const activities = await activityService.getRecentActivities();
  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Recent activities retrieved successfully',
    data: activities,
  });
});
