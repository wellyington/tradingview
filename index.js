require("dotenv").config();
const express = require("express");

// Binance Node

const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: '',
  APISECRET: '',
});



// Webhook

const app = express();
app.use(express.json());

app.use('/buy', async (reg, res, next) => {
    console.log(reg.originalUrl);
    console.log(reg.body);
    const symbol = reg.query.symbol;
    const quantity = reg.query.quantity;
    console.info( await binance.futuresMarketBuy( symbol, quantity ) );
    res.send(binance) 
 
})

app.use('/sell', async (reg, res, next) => {
    console.log(reg.originalUrl);
    console.log(reg.body);
    const symbol = reg.query.symbol;
    const quantity = reg.query.quantity;
    console.info( await binance.futuresMarketSell( symbol, quantity ) );
    res.send(binance) 
})

app.listen(process.env.PORT, () => {
    console.log("Server Started at " + process.env.PORT);
});