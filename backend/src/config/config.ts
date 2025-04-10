import dotenv from 'dotenv';
import path from 'path';
import { Config } from '../types';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config: Config = {
  // Server config
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB config
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cursorconnect',
  
  // JWT config
  JWT_SECRET: process.env.JWT_SECRET || 'your_default_jwt_secret_key_for_dev',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  // OpenAI API config (legacy)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_API_ENDPOINT: process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  
  // Gemini API config
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_API_ENDPOINT: process.env.GEMINI_API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash'
};

export default config; 