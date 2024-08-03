import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    console.log('Already connected to database:', mongoose.connections[0].name);
    return;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI!, {
      
      dbName: 'clock-em', // Ensure the correct database name
      serverSelectionTimeoutMS: 30000,
    });
    console.log('MongoDB connected to database:', connection.connection.name); // Log the database name
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

export default connectDB;
