# CursorConnect

A full-stack MERN application that lets users input queries and receive AI-generated responses using Cursor AI.

## Tech Stack

- **Frontend**: React.js (Vite), TailwindCSS (to be set up), Shadcn
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **AI Integration**: Cursor AI API
- **Deployment**: Vercel (frontend/backend), MongoDB Atlas (database)

## Project Structure

```
CursorConnect/
├── frontend/           # React frontend (Vite)
│   ├── public/
│   ├── src/
│   └── package.json
├── backend/            # Express backend
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── server.js       # Entry point
│   └── package.json
└── package.json        # Root package.json for scripts
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm run install-deps
   ```
3. Create a `.env` file in the backend directory (see `.env.example`)
4. Start the development server:
   ```
   npm run dev
   ```

## Features

- User authentication (register/login)
- AI query processing via Cursor AI
- Query history storage and retrieval
- Responsive UI

## API Endpoints

- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: Login user
- `GET /api/auth/profile`: Get user profile
- `POST /api/generate`: Process query with Cursor AI
- `GET /api/history`: Get user's query history
- `GET /api/history/:id`: Get specific query details
- `DELETE /api/history/:id`: Delete query from history 