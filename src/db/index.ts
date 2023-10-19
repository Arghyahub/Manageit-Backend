import mongoose, { ConnectOptions } from 'mongoose';

const connectDB = async () => {
  try {
    const dbUrl = process.env.ATLAS_URI || "";

    await mongoose.connect(dbUrl, {
      useUnifiedTopology: true,
    } as ConnectOptions);

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export default connectDB;
