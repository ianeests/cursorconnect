import express from 'express';
import {
  getQueries,
  getQuery,
  deleteQuery,
  deleteAllQueries,
} from '../controllers/historyController';
import { queryIdValidation, validate } from '../validation/queryValidation';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all queries and delete all queries
router
  .route('/')
  .get(getQueries)
  .delete(deleteAllQueries);

// Get single query and delete single query
router
  .route('/:id')
  .get(queryIdValidation, validate, getQuery)
  .delete(queryIdValidation, validate, deleteQuery);

export default router; 