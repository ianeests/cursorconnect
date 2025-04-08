import User from '../models/User';
import { ApiError, createError } from '../middleware/errorMiddleware';
import { UserDocument } from '../types';

interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResult {
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
}

/**
 * Register a new user
 * @param {RegisterUserInput} userData - User data (username, email, password)
 * @returns {Promise<AuthResult>} User object and token
 */
export const registerUser = async (userData: RegisterUserInput): Promise<AuthResult> => {
  const { username, email, password } = userData;

  // Validate input
  if (!username || !email || !password) {
    throw createError('Please provide username, email and password', 400);
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw createError('Email is already registered. Please use a different email or login', 400);
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
  });

  // Generate token
  const token = user.getSignedJwtToken();

  return {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    },
    token,
  };
};

/**
 * Login a user
 * @param {LoginCredentials} credentials - User credentials (email, password)
 * @returns {Promise<AuthResult>} User object and token
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResult> => {
  const { email, password } = credentials;

  // Validate input
  if (!email || !password) {
    throw createError('Please provide email and password', 400);
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw createError('Invalid credentials. Please check your email and password', 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw createError('Invalid credentials. Please check your email and password', 401);
  }

  // Generate token
  const token = user.getSignedJwtToken();

  return {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    },
    token,
  };
};

/**
 * Get user by ID
 * @param {String} userId - User ID
 * @returns {Promise<UserDocument>} User object
 */
export const getUserById = async (userId: string): Promise<UserDocument> => {
  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createError('User not found. The user may have been deleted', 404);
  }
  return user;
};

export default {
  registerUser,
  loginUser,
  getUserById
}; 