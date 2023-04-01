require("dotenv").config();
const express = require("express");

// Webhook

const app = express();
app.use(express.json());

app.use('/buy', async (reg, res, next) => {
    console.log(reg.originalUrl);
    console.log(reg.body);
    const symbol = reg.query.symbol;
    const order = await Buy(symbol, "0.01")
    console.log(order)
    res.send(order)    
})

app.use('/sell', async (reg, res, next) => {
    console.log(reg.originalUrl);8888
    console.log(reg.body);
    const symbol = reg.query.symbol;
    const order = await Sell(symbol, "0.01")
    console.log(order)
    res.send(order)      
})

app.listen(process.env.PORT, () => {
    console.log("Server Started at " + process.env.PORT);
});

// Binance Axios 
const axios = require('axios');
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.SECRET_KEY;

// Buy Function
async function Buy(symbol, quantity) {
  const { data: serverTime } = await axios.get('https://api.binance.com/api/v3/time');
  const timestamp = serverTime.serverTime;
  const params = `symbol=${symbol}&side=BUY&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;
  const signature = require('crypto')
    .createHmac('sha256', API_SECRET)
    .update(params)
    .digest('hex');
  const url = `https://testnet.binance.vision/api/v3/order?symbol=${symbol}&side=BUY&type=MARKET&quantity=${quantity}&timestamp=${timestamp}&signature=${signature}`;
  try {
    const response = await axios.post(url, null, {
      headers: { 'X-MBX-APIKEY': API_KEY },
    });
    console.log('Market buy order placed:', response.data);
  } catch (error) {
    console.error('Error placing market buy order:', error);
  }
}

// Buy Function
async function Sell(symbol, quantity) {
  const { data: serverTime } = await axios.get('https://api.binance.com/api/v3/time');
  const timestamp = serverTime.serverTime;
  const params = `symbol=${symbol}&side=SELL&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;
  const signature = require('crypto')
    .createHmac('sha256', API_SECRET)
    .update(params)
    .digest('hex');
  const url = `https://testnet.binance.vision/api/v3/order?symbol=${symbol}&side=SELL&type=MARKET&quantity=${quantity}&timestamp=${timestamp}&signature=${signature}`;
  try {
    const response = await axios.post(url, null, {
      headers: { 'X-MBX-APIKEY': API_KEY },
    });
    console.log('Market sell order placed:', response.data);
  } catch (error) {
    console.error('Error placing market sell order:', error);
  }
}