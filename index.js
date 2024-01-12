// app.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();

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

  if (!name || !imageUrl || !keyword) {
    return res
      .status(400)
      .json({ error: "Name and imageUrl are required fields" });
  }

  try {
    const newUser = new User({ name, imageUrl, keyword });
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
