import mongoose from "mongoose";

const connectDB = async () => {
  let uri = (process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/mindcare-ai").trim();
  // Atlas requires these options - add if missing
  if (uri.includes("mongodb.net") && !uri.includes("retryWrites")) {
    uri += uri.includes("?") ? "&" : "?";
    uri += "retryWrites=true&w=majority";
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      console.error("\n--- MongoDB Auth Fix ---");
      console.error("1. Check username & password in MONGO_URI in .env");
      console.error("2. If password has special chars (@ # $ etc), URL-encode them:");
      console.error("   @ -> %40, # -> %23, $ -> %24, : -> %3A");
      console.error("3. In Atlas: Database Access -> Edit user -> Update password");
      console.error("4. Or use local MongoDB: MONGO_URI=mongodb://localhost:27017/mindcare-ai");
      console.error("------------------------\n");
    }
    // Don't crash - server stays up for debugging (auth routes will fail until DB connects)
    console.error("Server running without database. Fix MONGO_URI and restart.");
  }
};

export default connectDB;
