const mongoose = require('mongoose');

const connectDB = async () => {
  // Check if MongoDB URI is configured
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost')) {
    console.log('ℹ️  MongoDB not configured, using in-memory mode');
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log('⚠️  MongoDB connection failed, using in-memory mode');
    return null;
  }
};

module.exports = { connectDB };
