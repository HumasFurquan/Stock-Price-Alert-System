require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

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
  loginTime: Date,
  logoutTime: Date,
});

const User = mongoose.model('User', userSchema);

app.post('/api/users/login', async (req, res) => {
  const { name, email } = req.body;
  console.log(`Login request received: ${name}, ${email}`);
  const user = new User({ name, email, loginTime: new Date() });
  try {
    await user.save();
    console.log('User saved:', user);
    res.status(201).send(user);
  } catch (err) {
    console.error('Error saving user', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/users/logout', async (req, res) => {
  const { email } = req.body;
  console.log(`Logout request received: ${email}`);
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { logoutTime: new Date() },
      { new: true }
    );
    console.log('User updated:', user);
    res.status(200).send(user);
  } catch (err) {
    console.error('Error updating user', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});