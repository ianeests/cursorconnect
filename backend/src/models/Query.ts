import mongoose, { Schema } from 'mongoose';
import { QueryDocument, QueryMetadata } from '../types';

const QuerySchema: Schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: [true, 'Please add a query'],
      trim: true,
    },
    response: {
      type: String,
      required: [true, 'Response is required'],
    },
    metadata: {
      type: Schema.Types.Mixed,
      validate: {
        validator: function(v: unknown) {
          // Ensure metadata is an object
          return typeof v === 'object' && v !== null;
        },
        message: 'Metadata must be an object'
      },
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for user + createdAt for efficient recent queries
QuerySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<QueryDocument>('Query', QuerySchema); 