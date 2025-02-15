require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
  phoneNumber: String,
  loginTimes: [String],
  logoutTimes: [String],
  stocks: [
    {
      name: String,
      currentPrice: Number,
      triggeredPrice: Number,
      currencyType: String, // Add currencyType field
    },
  ],
});

const User = mongoose.model('User', userSchema);

const getCurrentStockPrice = async (symbol) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVEDATA_API_KEY}`);
    const stockData = await response.json();
    if (stockData.price) {
      return parseFloat(stockData.price);
    } else {
      throw new Error(`No price data available for symbol: ${symbol}`);
    }
  } catch (error) {
    console.error('Error fetching stock price:', error);
    throw error;
  }
};

const getExchangeRate = async () => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    const exchangeData = await response.json();
    return exchangeData.rates.INR;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
};

const updateStocks = async (existingStocks, newStocks, isUSD) => {
  if (!newStocks) return existingStocks;

  const exchangeRate = await getExchangeRate();
  const fixedRate = 86.84; // Fixed conversion rate from USD to INR

  const updatedStocks = await Promise.all(newStocks.map(async (newStock) => {
    const currentPriceUSD = await getCurrentStockPrice(newStock.name);
    const currentPriceINR = currentPriceUSD * exchangeRate;
    const existingStock = existingStocks.find(stock => stock.name === newStock.name);
    const triggeredPrice = isUSD
      ? newStock.triggeredPrice * fixedRate
      : newStock.triggeredPrice || (existingStock ? existingStock.triggeredPrice : 0);
    const currencyType = isUSD ? 'USD' : 'INR'; // Determine currency type based on user selection
    return {
      name: newStock.name,
      currentPrice: currentPriceINR,
      triggeredPrice: triggeredPrice,
      currencyType: currencyType, // Add currencyType to the stock object
    };
  }));

  // Retain existing stocks that are not in the new stocks list
  const retainedStocks = existingStocks.filter(stock => !newStocks.some(newStock => newStock.name === stock.name));

  return [...retainedStocks, ...updatedStocks];
};

app.post('/api/users/login', async (req, res) => {
  const { name, email, stocks, isUSD } = req.body;
  const loginTime = moment().format('DD-MM-YYYY hh:mm A');
  console.log(`Login request received: ${name}, ${email}, ${stocks}, ${loginTime}`);
  
  try {
    const user = await User.findOne({ email });
    const existingStocks = user ? user.stocks : [];
    const updatedStocks = await updateStocks(existingStocks, stocks, isUSD);

    const updateData = { name, stocks: updatedStocks, $push: { loginTimes: loginTime } }; // Always push loginTime

    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true, upsert: true }
    );
    console.log('User saved:', updatedUser);
    res.status(201).send(updatedUser);
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.stocks.length === 0) {
      await User.deleteOne({ email });
      console.log('User deleted:', email);
      return res.status(200).send('User deleted');
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $push: { logoutTimes: logoutTime } }, // Append new logout time to the array
      { new: true }
    );
    console.log('User updated:', updatedUser);
    res.status(200).send(updatedUser);
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
      // Ensure all stocks have the required fields
      user.stocks = await updateStocks(user.stocks, user.stocks, false);
      await user.save();
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
  const { email, stocks, phoneNumber, isUSD } = req.body;
  try {
    const user = await User.findOne({ email });
    const existingStocks = user ? user.stocks : [];
    const updatedStocks = await updateStocks(existingStocks, stocks, isUSD);

    const updateData = { stocks: updatedStocks };
    if (phoneNumber) {
      updateData.phoneNumber = phoneNumber;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true }
    );
    console.log('User updated:', updatedUser);
    res.status(200).send(updatedUser);
  } catch (err) {
    console.error('Error updating user', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/users/delete-stock', async (req, res) => {
  const { email, stockName } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.stocks = user.stocks.filter(stock => stock.name !== stockName);

    if (user.stocks.length === 0) {
      await User.deleteOne({ email });
      console.log('User deleted:', email);
      return res.status(200).send('User deleted');
    }

    await user.save();
    console.log('Stock deleted:', stockName);
    res.status(200).send(user);
  } catch (err) {
    console.error('Error deleting stock', err);
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

    res.status(200).send('Notification sent');
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});