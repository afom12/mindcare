import "../config/env.js";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const email = process.argv[2] || process.env.ADMIN_EMAIL;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

async function createAdmin() {
  if (!email || !password) {
    console.error("Usage: node createAdmin.js <email> <password>");
    console.error("Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    const hashed = await bcrypt.hash(password, 10);
    const updated = await User.findByIdAndUpdate(
      existing._id,
      { role: "admin", password: hashed },
      { new: true }
    );
    console.log("Existing user promoted to admin:", updated.email, "(password updated)");
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: "Admin",
    email,
    password: hashed,
    role: "admin"
  });
  console.log("Admin created:", user.email);
  process.exit(0);
}

createAdmin().catch((e) => {
  console.error(e);
  process.exit(1);
});
