// app.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = 3000;
const cors = require('cors');
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Check for MongoDB connection
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Create a mongoose schema for User
const userSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
  keyword: String,
});

// Create a mongoose model
const User = mongoose.model("User", userSchema);

// Middleware to parse JSON requests
app.use(bodyParser.json());

// GET request to fetch user information
app.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST request to add a new user
app.post("/", async (req, res) => {
  const { name, imageUrl, keyword } = req.body;
  if (!name || !keyword) {
    return res.status(400).json({ error: "Name and keyword are required fields" });
  }

  try {
    let cloudinaryUrl = imageUrl;
    if (!imageUrl.includes('cloudinary.com')) {
      const cloudinaryResponse = await cloudinary.uploader.upload(imageUrl);
      cloudinaryUrl = cloudinaryResponse.secure_url;
    }
    const newUser = new User({ name, imageUrl: cloudinaryUrl, keyword });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
