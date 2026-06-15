import httpStatus from 'http-status';
import User from '../models/user.model';
import emailService from '../utils/sendPulse';
import { generateToken } from '../utils/jw.utils';
import { IUser, AuthResult } from '../interfaces/user.interface';
import { getWelcomeEmailTemplate } from '../mails/auth.mail';

/**
 * Register User
 * @param {IUser} userBody
 * @returns {Promise<AuthResult>}
 */
const createUser = async (userBody: IUser): Promise<AuthResult> => {
  const { email, username } = userBody;

  // Check if user already exists
  if (await User.isEmailTaken(email)) {
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Email already exists',
    };
  }

  if (await User.isUsernameTaken(username)) {
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Username already exists',
    };
  }

  try {
    // Create the user
    const user = await User.create({
      ...userBody,
      isEmailVerified: true,
      status: true,
    });

    // Generate login token
    const token = generateToken({ id: user._id, email: user.email });

    // Send welcome email
    const emailData = getWelcomeEmailTemplate(user.fullname);
    await emailService.sendEmail(email, emailData);

    // Convert to object and remove password
    const userObj = user.toObject();
    delete userObj.password;

    return {
      status: httpStatus.CREATED,
      message: 'User registered successfully',
      data: {
        user: userObj,
        token,
      },
    };
  } catch (error: any) {
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'An error occurred during registration',
    };
  }
};

/**
 * Login User
 * @param {Object} loginBody
 * @returns {Promise<AuthResult>}
 */
const loginUser = async (loginBody: any): Promise<AuthResult> => {
  const { email, password } = loginBody;

  // Check if user exists and select password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return {
      status: httpStatus.NOT_FOUND,
      message: 'User does not exist',
    };
  }

  // Verify password
  const isPasswordMatch = await (user as any).comparePassword(password);
  if (!isPasswordMatch) {
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Invalid email or password',
    };
  }

  // Generate token
  const token = generateToken({ id: user._id, email: user.email });

  // Convert to object and remove password
  const userObj = user.toObject();
  delete userObj.password;

  return {
    status: httpStatus.OK,
    message: 'Login successful',
    data: {
      user: userObj,
      token,
    },
  };
};

const authService = {
  createUser,
  loginUser,
};

export default authService;