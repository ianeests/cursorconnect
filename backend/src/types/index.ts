import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  getSignedJwtToken(): string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface QueryMetadata {
  model: string;
  tokens: number;
  promptTokens?: number;
  completionTokens?: number;
  processingTime: number;
  isMock?: boolean;
  startTime?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface QueryDocument extends Document {
  _id: Types.ObjectId;
  user: string | Types.ObjectId | UserDocument;
  query: string;
  response: string;
  metadata: QueryMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestWithUser extends Request {
  user?: UserDocument;
}

export interface AIResponse {
  rawResponse: string;
  formattedResponse: string;
  metadata: QueryMetadata;
}

export interface Config {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  OPENAI_API_KEY?: string;
  OPENAI_API_ENDPOINT: string;
  OPENAI_MODEL: string;
} 