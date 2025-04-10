# CursorConnect Frontend

A React application built with Vite and TypeScript that allows users to interact with AI using OpenAI. This frontend connects to the CursorConnect backend API.

## Tech Stack

- React.js with TypeScript
- Vite build tool
- TailwindCSS for styling
- Shadcn/ui component library
- React Router for navigation
- Axios for API requests

## Features

- User authentication (register/login)
- Chat interface for AI interactions
- Real-time streaming of AI responses
- Query history and management
- Responsive design for mobile and desktop

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

## Project Structure

```
src/
├── api/          # API integration functions
├── assets/       # Static assets like images
├── components/   # Reusable UI components
│   ├── auth/     # Authentication components
│   ├── chat/     # Chat interface components
│   ├── layout/   # Layout components
│   └── ui/       # Basic UI components
├── lib/          # Utility libraries and configurations
├── pages/        # Page components
├── styles/       # Global styles
└── utils/        # Helper functions
```

## Connecting to the Backend

The frontend connects to the backend API using the URL specified in the `.env` file. Make sure the backend server is running when developing locally.

For production, set the `VITE_API_URL` to your deployed backend URL.

## Deployment

The frontend can be deployed to Vercel or other hosting platforms. See the main [DEPLOYMENT.md](../DEPLOYMENT.md) file for detailed instructions.

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build locally
