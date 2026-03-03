import mongoose from "mongoose";

const connectDB = async () => {
  let uri = (process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/mindcare-ai").trim();
  // Atlas requires these options - add if missing
  if (uri.includes("mongodb.net") && !uri.includes("retryWrites")) {
    uri += uri.includes("?") ? "&" : "?";
    uri += "retryWrites=true&w=majority";
  }

  try {
    const options = {};
    if (uri.includes("mongodb.net")) {
      options.autoSelectFamily = false;
      options.family = 4;
    }
    await mongoose.connect(uri, options);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    if (error.message.includes("TLSV1_ALERT") || error.message.includes("ERR_SSL")) {
      console.error("\n--- MongoDB Atlas TLS Fix ---");
      console.error("Atlas SSL handshake failed. Try:");
      console.error("1. Disable VPN if running");
      console.error("2. Use local MongoDB: MONGO_URI=mongodb://localhost:27017/mindcare-ai");
      console.error("3. Install MongoDB locally: https://www.mongodb.com/try/download/community");
      console.error("------------------------\n");
    } else if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
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
