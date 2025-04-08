import Query from '../models/Query';
import ErrorResponse from '../utils/errorResponse';
import { QueryDocument } from '../types';

/**
 * Get all queries for a user
 * @param {string} userId - User ID
 * @returns {Promise<QueryDocument[]>} Queries for the user
 */
export const getAllQueries = async (userId: string): Promise<QueryDocument[]> => {
  const queries = await Query.find({ user: userId }).sort({
    createdAt: -1,
  });
  
  return queries;
};

/**
 * Get a specific query by ID
 * @param {string} queryId - Query ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<QueryDocument>} Query object
 */
export const getQueryById = async (queryId: string, userId: string): Promise<QueryDocument> => {
  const query = await Query.findById(queryId);
  
  if (!query) {
    throw new ErrorResponse(`Query not found with id of ${queryId}`, 404);
  }
  
  // Check if user owns the query
  if (query.user.toString() !== userId) {
    throw new ErrorResponse(
      `User ${userId} is not authorized to access this query`,
      401
    );
  }
  
  return query;
};

/**
 * Delete a query by ID
 * @param {string} queryId - Query ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
export const deleteQueryById = async (queryId: string, userId: string): Promise<boolean> => {
  const query = await Query.findById(queryId);
  
  if (!query) {
    throw new ErrorResponse(`Query not found with id of ${queryId}`, 404);
  }
  
  // Check if user owns the query
  if (query.user.toString() !== userId) {
    throw new ErrorResponse(
      `User ${userId} is not authorized to delete this query`,
      401
    );
  }
  
  await query.deleteOne();
  return true;
};

/**
 * Delete all queries for a user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteAllQueries = async (userId: string): Promise<boolean> => {
  await Query.deleteMany({ user: userId });
  return true;
};

export default {
  getAllQueries,
  getQueryById,
  deleteQueryById,
  deleteAllQueries
}; 