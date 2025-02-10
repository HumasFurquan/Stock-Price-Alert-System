require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Set Twilio credentials
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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
  phoneNumber: String, // Add phoneNumber field
  loginTimes: [String], // Change loginTime to an array of strings
  logoutTimes: [String], // Change logoutTime to an array of strings
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
      { 
        name, 
        $push: { loginTimes: loginTime }, // Append new login time to the array
        stocks 
      },
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
      { $push: { logoutTimes: logoutTime } }, // Append new logout time to the array
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

app.post('/api/users/update', async (req, res) => {
  const { email, stocks, phoneNumber } = req.body;
  try {
    const updateData = { stocks };
    if (phoneNumber) {
      updateData.phoneNumber = phoneNumber;
    }
    const user = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true }
    );
    console.log('User updated:', user);
    res.status(200).send(user);
  } catch (err) {
    console.error('Error updating user', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
  const msg = {
    to,
    from: 'humasfurquan2025@gmail.com', // Use your verified sender email
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent');
    res.status(200).send('Email sent');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/send-notification', async (req, res) => {
  const { email, subject, text } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Send email
    const msg = {
      to: email,
      from: 'humasfurquan2025@gmail.com', // Use your verified sender email
      subject,
      text,
    };
    await sgMail.send(msg);
    console.log('Email sent');

    // Send SMS if phoneNumber is present
    if (user.phoneNumber) {
      const message = await twilioClient.messages.create({
        body: text,
        from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
        to: user.phoneNumber, // Recipient's phone number
      });
      console.log('SMS sent:', message.sid);
    }

    res.status(200).send('Notification sent');
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});