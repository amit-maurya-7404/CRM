import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

// Fallback to production Atlas URI ensures persistence across all Vercel deployments
const FALLBACK_MONGODB_URI =
  'mongodb+srv://zyntextechh_db_user:xgnVxzJbCZgkpy55@cluster0.qycbrzd.mongodb.net/zyntex_crm?retryWrites=true&w=majority';

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI || FALLBACK_MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('Connected to MongoDB Atlas successfully.');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error('MongoDB connection error:', e);
    return null;
  }

  return cached.conn;
}

export const isMongoConfigured = (): boolean => {
  return true;
};
