import User from "../models/User.js";
import Chat from "../models/Chat.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, sessionId } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    if (sessionId) {
      const anonChat = await Chat.findOne({ sessionId });
      if (anonChat && anonChat.messages?.length) {
        const userChat = new Chat({
          userId: user._id,
          messages: anonChat.messages
        });
        await userChat.save();
        await Chat.deleteOne({ sessionId });
      }
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register therapist (with license document)
export const registerTherapist = async (req, res) => {
  try {
    const { name, email, password, sessionId, license, licenseType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "License document (photo or PDF) is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const licenseTrimmed = (license || "").trim();
    const licenseTypeTrimmed = (licenseType || "").trim();
    if (!licenseTrimmed) {
      return res.status(400).json({ message: "License number is required" });
    }
    if (!licenseTypeTrimmed) {
      return res.status(400).json({ message: "License type is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const documentUrl = `/uploads/licenses/${file.filename}`;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "therapist",
      therapistVerification: "pending",
      license: licenseTrimmed,
      licenseType: licenseTypeTrimmed,
      licenseDocumentUrl: documentUrl
    });

    if (sessionId) {
      const anonChat = await Chat.findOne({ sessionId });
      if (anonChat && anonChat.messages?.length) {
        const userChat = new Chat({
          userId: user._id,
          messages: anonChat.messages
        });
        await userChat.save();
        await Chat.deleteOne({ sessionId });
      }
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration submitted. Your credentials will be reviewed.",
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "7d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: "Login successful",
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update profile (name, email with password verification)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, currentPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = {};

    if (name !== undefined && name?.trim()) {
      updates.name = name.trim();
    }

    if (email !== undefined && email?.trim()) {
      if (email !== user.email) {
        const existing = await User.findOne({ email: email.trim(), _id: { $ne: userId } });
        if (existing) {
          return res.status(400).json({ message: "Email already in use" });
        }
        if (!currentPassword) {
          return res.status(400).json({ message: "Current password required to change email" });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
        updates.email = email.trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid updates provided" });
    }

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true });
    const userResponse = updated.toObject();
    delete userResponse.password;

    res.json({ message: "Profile updated", user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
