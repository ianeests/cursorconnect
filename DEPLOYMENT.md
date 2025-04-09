# Deploying CursorConnect to Vercel

This guide will walk you through deploying both the frontend and backend of CursorConnect to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [GitHub repository](https://github.com/new) with your project code
3. [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register) for the database

## Step 1: Set Up MongoDB Atlas

1. Create a new cluster in MongoDB Atlas
2. Configure network access (IP whitelist) to allow connections from anywhere (0.0.0.0/0)
3. Create a database user with read/write permissions
4. Get your connection string from the "Connect" button

## Step 2: Deploy the Backend API

1. Push your code to GitHub if you haven't already
2. Log in to [Vercel](https://vercel.com)
3. Click "Add New" > "Project"
4. Import your GitHub repository
5. Select the `backend` directory as the root directory
6. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
7. Add the following environment variables:
   - `PORT`: 8080 (Vercel will override this, but include it anyway)
   - `NODE_ENV`: production
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `JWT_EXPIRE`: 30d
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `OPENAI_MODEL`: gpt-3.5-turbo (or your preferred model)
8. Click "Deploy"
9. Once deployed, note the URL (e.g., `https://cursorconnect-api.vercel.app`)

## Step 3: Deploy the Frontend

1. Create a `.env` file in your frontend directory with:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```
2. Push these changes to GitHub
3. In Vercel, click "Add New" > "Project"
4. Import your GitHub repository again
5. This time, select the `frontend` directory as the root directory
6. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
7. Add the environment variable:
   - `VITE_API_URL`: The URL of your backend API from Step 2
8. Click "Deploy"

## Step 4: Verify the Deployment

1. Visit your frontend URL to ensure it loads correctly
2. Try to register/login to verify the backend connection
3. Test the AI query functionality

## Troubleshooting

### CORS Issues

If you encounter CORS errors:
1. Verify that the backend's CORS configuration includes your frontend domain
2. Check the network requests in your browser's devtools

### Database Connection Issues

If the app can't connect to MongoDB:
1. Verify your connection string in the Vercel environment variables
2. Ensure network access is properly configured in MongoDB Atlas

### API Key Issues

If OpenAI API requests fail:
1. Verify your API key in the Vercel environment variables
2. Check usage limits on your OpenAI account

## Automatic Deployments

With the GitHub integration, Vercel will automatically deploy when you push changes to your repository:
- Backend changes will update the API deployment
- Frontend changes will update the client deployment

## Custom Domain (Optional)

1. In your Vercel project settings, go to "Domains"
2. Add your custom domain and follow the verification steps
3. Update the frontend environment variable to use your custom backend domain 