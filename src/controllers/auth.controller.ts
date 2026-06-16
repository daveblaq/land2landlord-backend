import { Request, Response } from 'express';
import authService from '../services/auth.service';
import catchAsync from '../utils/catchAsync';
import { userValidator, loginValidator, profileUpdateSchema, changePasswordSchema } from '../validation/user.validate';
import { ZodError } from 'zod';
import httpStatus from 'http-status';
import userService from '../services/user.service';
import { CustomRequest } from '../middleware/auth.middleware';
import User from '../models/user.model';

export const register = catchAsync(async (req: Request, res: Response) => {
  // Validate request body with Zod
  try {
    userValidator.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: err.errors.map((e) => e.message).join(', '),
        data: null,
      });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unknown error occurred',
      data: null,
    });
  }

  // Call the auth service to create the user
  const regData = await authService.createUser(req.body);

  // Respond with the result of the user creation
  return res.status(regData.status).json({
    status: regData.status,
    message: regData.message,
    data: regData.data,
  });
});

// Login
export const login = catchAsync(async (req: Request, res: Response) => {
  // Validate request body
  try {
    loginValidator.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: err.errors.map((e) => e.message).join(', '),
        data: null,
      });
    }
  }

  const loginData = await authService.loginUser(req.body);

  return res.status(loginData.status).json({
    status: loginData.status,
    message: loginData.message,
    data: loginData.data,
  });
});

//Endpoint to retrieve user's data from Auth Token
export const me = async (
  req: CustomRequest,
  res: Response,
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: 'User not found in request',
      });
    }
    const user = await userService.getUserById(req.user._id);
    return res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
    });
  }
};

// Logout
export const logout = catchAsync(async (req: Request, res: Response) => {
  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Logout successful',
    data: null,
  });
});

// Update Profile
export const updateProfile = catchAsync(async (req: CustomRequest, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      status: httpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
      data: null,
    });
  }

  // Validate request body
  try {
    profileUpdateSchema.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: err.errors.map((e) => e.message).join(', '),
        data: null,
      });
    }
  }

  const userId = req.user._id;
  const { fullname, username, email, country } = req.body;

  // Check email availability
  if (email) {
    const isEmailTaken = await User.isEmailTaken(email, userId);
    if (isEmailTaken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: 'Email is already taken',
        data: null,
      });
    }
  }

  // Check username availability
  if (username) {
    const isUsernameTaken = await User.isUsernameTaken(username, userId);
    if (isUsernameTaken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: 'Username is already taken',
        data: null,
      });
    }
  }

  // Update profile
  const updatedUser = await userService.updateUser(userId, {
    fullname,
    username,
    country,
    email,
  } as any);

  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
});

// Change Password
export const changePassword = catchAsync(async (req: CustomRequest, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      status: httpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
      data: null,
    });
  }

  // Validate request body
  try {
    changePasswordSchema.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: err.errors.map((e) => e.message).join(', '),
        data: null,
      });
    }
  }

  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  // Retrieve user with password selected
  const user = await User.findById(userId).select('+password');
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'User not found',
      data: null,
    });
  }

  // Compare passwords
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Incorrect current password',
      data: null,
    });
  }

  // Set new password (will trigger pre-save hashing hook)
  user.password = newPassword;
  await user.save();

  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Password changed successfully',
    data: null,
  });
});