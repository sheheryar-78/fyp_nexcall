import mongoose from "mongoose";

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Build URI from separate credentials if MONGO_URI is not set
    if (!uri && process.env.MONGO_HOST) {
      const user = encodeURIComponent(process.env.MONGO_USER);
      const pass = encodeURIComponent(process.env.MONGO_PASS);
      const host = process.env.MONGO_HOST;
      const db = process.env.MONGO_DB || "nexcall";
      uri = `mongodb+srv://${user}:${pass}@${host}/${db}?appName=Cluster0`;
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;