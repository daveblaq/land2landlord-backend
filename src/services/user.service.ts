import User from '../models/user.model';
import httpStatus from 'http-status';
import { IUser } from '../interfaces/user.interface';
import { UserUpdateInput } from '../validation/user.validate';

const findOrCreateUser = async (data: IUser) => {
  const user = await getUserByEmail(data.email);
  if (!user) {
    const user = new User(data);
    await user.save();
    return user;
  }
  return user;
};

// Get a user by email
const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ email });
  return user;
};

// Find user by ID
const getUserById = async (userId: string) => {
  const user = await User.findById(userId);
  return user;
};

//Get Users
const getAllUsers = async (): Promise<{
  status: number;
  message: string;
  data: IUser[] | null;
}> => {
  const users = await User.find();
  if (!users) {
    return {
      status: httpStatus.NOT_FOUND,
      message: 'No users found',
      data: null,
    };
  }
  return {
    status: httpStatus.OK,
    message: 'Users fetched successfully',
    data: users,
  };
};

//update user
const updateUser = async (
  userId: string,
  updateData: Partial<UserUpdateInput>,
) => {
  // Find and update the user
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

//Ban User
const banUser = async (userId: string) => {
  // Find and update the user
  const data = { status: false };
  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

//Endpoint to Delete User by id
const deleteUser = async (userId: string) => {
  // Find and delete the user
  const user = await User.findByIdAndDelete(userId);
  return user;
};

const approveUser = async (userId: string) => {
  // Find and update the user
  const data = { status: true };
  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
const userService = {
  getUserByEmail,
  getUserById,
  getAllUsers,
  deleteUser,
  updateUser,
  banUser,
  approveUser,
  findOrCreateUser,
};

export default userService;