import mongoose, { ConnectOptions } from 'mongoose';

const connectDB = async () => {
  try {
    // Replace 'your-mongodb-url' with your actual MongoDB connection URL
    const dbUrl = 'mongodb://127.0.0.1:27017/testDB';

    await mongoose.connect(dbUrl, {
      useUnifiedTopology: true,
    } as ConnectOptions);

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export default connectDB;
