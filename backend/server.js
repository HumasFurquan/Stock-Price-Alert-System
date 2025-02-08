require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  loginTime: String,
  logoutTime: String,
  stocks: [
    {
      name: String,
      currentPrice: Number,
      triggeredPrice: Number,
    },
  ],
});

const User = mongoose.model('User', userSchema);

app.post('/api/users/login', async (req, res) => {
  const { name, email, stocks } = req.body;
  const loginTime = moment().format('DD-MM-YYYY hh:mm A');
  console.log(`Login request received: ${name}, ${email}, ${stocks}, ${loginTime}`);
  
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { name, loginTime, stocks },
      { new: true, upsert: true }
    );
    console.log('User saved:', user);
    res.status(201).send(user);
  } catch (err) {
    console.error('Error saving user', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/users/logout', async (req, res) => {
  const { email } = req.body;
  const logoutTime = moment().format('DD-MM-YYYY hh:mm A');
  console.log(`Logout request received: ${email}, ${logoutTime}`);
  
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { logoutTime },
      { new: true }
    );
    console.log('User updated:', user);
    res.status(200).send(user);
  } catch (err) {
    console.error('Error updating user', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error('Error fetching user', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});