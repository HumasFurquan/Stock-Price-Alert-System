require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000; // Changed port to 5002

app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection string from environment variables
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  loginTime: Date,
  logoutTime: Date,
});

const User = mongoose.model('User', userSchema);

app.post('/api/users/login', async (req, res) => {
  const { name, email } = req.body;
  const user = new User({ name, email, loginTime: new Date() });
  await user.save();
  res.status(201).send(user);
});

app.post('/api/users/logout', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOneAndUpdate(
    { email },
    { logoutTime: new Date() },
    { new: true }
  );
  res.status(200).send(user);
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});