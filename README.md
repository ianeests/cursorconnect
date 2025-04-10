# CursorConnect

A full-stack MERN application that lets users input queries and receive AI-generated responses using Cursor AI.

## Tech Stack

- **Frontend**: React.js (Vite), TailwindCSS, Shadcn
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **AI Integration**: OpenAI API
- **Deployment**: Vercel (frontend/backend), MongoDB Atlas (database)

## Project Structure

```
CursorConnect/
├── frontend/           # React frontend (Vite + TypeScript)
│   ├── public/         # Static assets
│   ├── src/            # Source code
│   │   ├── api/        # API client functions
│   │   ├── assets/     # Images and other assets
│   │   ├── components/ # Reusable UI components
│   │   ├── lib/        # Utility libraries
│   │   ├── pages/      # Page components
│   │   ├── styles/     # Global styles
│   │   └── utils/      # Helper functions
│   └── package.json    # Frontend dependencies
├── backend/            # Express backend with TypeScript
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# Route controllers
│   │   ├── middleware/ # Custom middleware
│   │   ├── models/     # Mongoose models
│   │   ├── routes/     # Express routes
│   │   ├── services/   # Business logic
│   │   ├── types/      # TypeScript type definitions
│   │   ├── utils/      # Helper functions
│   │   ├── validation/ # Input validation
│   │   └── server.ts   # Entry point
│   └── package.json    # Backend dependencies
└── package.json        # Root package.json for scripts
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm run install-deps
   ```
3. Create a `.env` file in the backend directory (see `.env.example`)
4. Create a `.env` file in the frontend directory (see `.env.example`)
5. Start the development server:
   ```
   npm run dev
   ```

## Features

- User authentication (register/login)
- AI query processing via OpenAI API
- Streaming AI responses
- Query history storage and retrieval
- Responsive UI

## API Endpoints

- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: Login user
- `GET /api/auth/me`: Get user profile
- `POST /api/generate/generate`: Process query with AI
- `POST /api/generate/stream`: Stream AI responses
- `GET /api/history`: Get user's query history
- `GET /api/history/:id`: Get specific query details
- `DELETE /api/history/:id`: Delete query from history

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Vercel. 