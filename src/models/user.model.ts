import { Schema, model } from 'mongoose';
import { IUser, IUserModel } from '../interfaces/user.interface';
import { UserTypes } from '../enums/user';
import bcrypt from 'bcryptjs';

const UserSchema: Schema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    country: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserTypes),
      default: UserTypes.USER,
    },
    isVIP: {
      type: Boolean,
      default: false,
    },
    vipType: {
      type: String,
      default: 'none',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Static methods
UserSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

UserSchema.statics.isUsernameTaken = async function (username, excludeUserId) {
  const user = await this.findOne({ username, _id: { $ne: excludeUserId } });
  return !!user;
};

// Method to compare password
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

const User = model<IUser, IUserModel>('User', UserSchema);

export default User;