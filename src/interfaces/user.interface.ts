import { Document, Model } from 'mongoose';
import { UserTypes } from '../enums/user';

export interface IUser extends Document {
  fullname: string;
  username: string;
  email: string;
  password?: string;
  country: string;
  role?: UserTypes;
  isVIP?: boolean;
  vipType?: string;
  isEmailVerified?: boolean;
  status?: boolean;
}

export interface IUserModel extends Model<IUser> {
  isEmailTaken(email: string): Promise<boolean>;
  isUsernameTaken(username: string): Promise<boolean>;
}

export interface AuthResult {
  status: number;
  message: string;
  token?: string;
  data?: any;
}