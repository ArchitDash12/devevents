import mongoose, { type ConnectOptions, type Mongoose } from "mongoose";

/**
 * Interface representing our cached Mongoose connection object.
 * Caches both the resolved connection instance and any in-flight connection promise.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Extend Node.js global type definition to include our Mongoose cache.
 * In development, Next.js clears Node.js require cache on rebuilds (Hot Module Replacement),
 * which can cause new database connections to be created on every request.
 * By storing the connection on the global object, the connection is preserved across reloads.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI: string = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Initialize or retrieve the cached connection object from Node's global scope.
 */
const cached: MongooseCache = global.mongoose ?? {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB using Mongoose and caches the connection instance.
 *
 * Prevents multiple simultaneous connections during development and reuses
 * existing connections across serverless function invocations.
 *
 * @returns {Promise<Mongoose>} The active Mongoose connection instance
 */
export async function connectDB(): Promise<Mongoose> {
  // Return the active connection if it has already been established
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise isn't already pending, create a new one
  if (!cached.promise) {
    const opts: ConnectOptions = {
      // Disable command buffering so operations fail immediately if not connected
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance: Mongoose) => {
        return mongooseInstance;
      });
  }

  try {
    // Await the pending connection promise and cache the resolved instance
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the cached promise on failure to allow subsequent retries
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

// Convenient alias exports for common naming preferences
export const connectToDatabase = connectDB;
export const dbConnect = connectDB;

// Default export
export default connectDB;

