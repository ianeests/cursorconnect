import Query from '../models/Query';
import ErrorResponse from '../utils/errorResponse';
import { QueryDocument } from '../types';

interface PaginatedResult {
  queries: QueryDocument[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Get all queries for a user with pagination
 * @param {string} userId - User ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Results per page (default: 10)
 * @returns {Promise<PaginatedResult>} Paginated queries with metadata
 */
export const getAllQueries = async (
  userId: string, 
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedResult> => {
  // Make sure page and limit are valid numbers
  const currentPage = Math.max(1, page);
  const resultsPerPage = Math.max(1, Math.min(limit, 50)); // Cap at 50 items per page
  
  // Calculate skip value for pagination
  const skip = (currentPage - 1) * resultsPerPage;
  
  // Get total count for pagination metadata
  const total = await Query.countDocuments({ user: userId });
  
  // Get paginated queries
  const queries = await Query.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(resultsPerPage);
  
  return {
    queries,
    total,
    page: currentPage,
    limit: resultsPerPage,
    pages: Math.ceil(total / resultsPerPage)
  };
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
  let query;
  
  try {
    // Try to find by MongoDB ObjectId first (most common case)
    query = await Query.findById(queryId);
    
    // If not found, try looking up by the ID as a regular field
    if (!query) {
      query = await Query.findOne({ _id: queryId });
      
      // Try alternative fields if still not found
      if (!query) {
        query = await Query.findOne({ 'metadata.id': queryId });
      }
      
      // One more try with a simple contains match
      if (!query) {
        const allUserQueries = await Query.find({ user: userId });
        query = allUserQueries.find(q => 
          q._id.toString().includes(queryId) || 
          (q.metadata && q.metadata.id && q.metadata.id.toString().includes(queryId))
        );
      }
    }
  } catch (error) {
    console.error('Error finding query:', error);
    throw new ErrorResponse(`Error finding query with id ${queryId}`, 500);
  }
  
  if (!query) {
    console.error(`Query not found with id of ${queryId} for user ${userId}`);
    throw new ErrorResponse(`Query not found with id of ${queryId}`, 404);
  }
  
  // Check if user owns the query
  if (query.user.toString() !== userId) {
    throw new ErrorResponse(
      `User ${userId} is not authorized to delete this query`,
      401
    );
  }
  
  try {
    await query.deleteOne();
    return true;
  } catch (error) {
    console.error('Error deleting query:', error);
    throw new ErrorResponse(`Error deleting query ${queryId}`, 500);
  }
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