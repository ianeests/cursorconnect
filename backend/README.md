# CursorConnect Backend

Backend API for the CursorConnect application that connects users with AI-powered responses using OpenAI.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Express Validator
- OpenAI API Integration

## Architecture

The application follows a layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and interact with models
- **Models**: Define data schemas and interact with the database
- **Routes**: Define API endpoints and connect them to controllers
- **Middleware**: Handle cross-cutting concerns like authentication and validation
- **Validation**: Define input validation rules
- **Config**: Centralized configuration management
  - `config.js`: Environment variables and defaults
  - `db.js`: Database connection

## Setup Instructions

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies: `npm install`
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
   OPENAI_MODEL=gpt-3.5-turbo
   ```
5. Run the development server: `npm run dev`
6. Build for production: `npm run build`
7. Start production server: `npm start`

## OpenAI API Integration

The application integrates with the OpenAI API to provide AI-generated responses. To set up the integration:

1. Sign up for an OpenAI account at [https://openai.com](https://openai.com)
2. Navigate to the API section and create an API key
3. Add the API key to your `.env` file as `OPENAI_API_KEY`
4. Configure the OpenAI model by setting `OPENAI_MODEL` in your `.env` file (defaults to 'gpt-3.5-turbo')
5. (Optional) Configure a custom OpenAI endpoint by setting `OPENAI_API_ENDPOINT` in your `.env` file

If the API key is not provided, the application will use a mock implementation for testing purposes.

### Response Format

The AI responses are formatted before being sent to the frontend:

- **Raw Response**: The complete API response is stored in the database for reference
- **Formatted Response**: A cleaned version is sent to the frontend for display
- **Metadata**: Additional information like token count, model used, and processing time

## Database Configuration

The application uses MongoDB for data storage:

1. Uses Mongoose for schema definition and validation
2. Implements indexes for efficient queries:
   - User email (for authentication lookups)
   - Query user + createdAt (for efficient history retrieval)
3. Stores complete API responses with metadata for analysis

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user (Protected)

### Generate AI Responses

- `POST /api/generate` - Generate AI response (Protected)
- `GET /api/generate/recent` - Get recent interactions (Protected)

### Query History

- `GET /api/history` - Get all queries for a user (Protected)
- `GET /api/history/:id` - Get single query (Protected)
- `DELETE /api/history/:id` - Delete query (Protected)
- `DELETE /api/history` - Delete all queries for a user (Protected)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected routes, you need to include the JWT token in the Authorization header:

```
Authorization: Bearer your_token_here
```

## Development with TypeScript

This project is built with TypeScript for improved type safety and developer experience. Here are some key notes:

1. **File Structure**:
   - Source files are in `src/` directory
   - Compiled output goes to `dist/` directory

2. **Development Workflow**:
   - Run in development mode: `npm run dev` (uses ts-node for on-the-fly compilation)
   - Build for production: `npm run build` (compiles TS to JS)
   - Start production server: `npm start` (runs compiled JS code)
   - Check for type errors: `npx tsc --noEmit`

3. **TypeScript Configuration**:
   - Type definitions can be found in `src/types/index.ts`
   - TypeScript config in `tsconfig.json` 