require("dotenv").config();
const express = require("express");

// Binance Node

const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: '',
  APISECRET: '',
});

// SQLite3 setup
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('binance.db');

// Record order function
const recordOrder = (symbol, orderId) => {
    const timeDate = new Date().toISOString();
    db.run(`INSERT INTO orders (symbol, order_id, time_date) VALUES (?, ?, ?)`, [symbol, orderId, timeDate]);
  };

// Function getLastOrder from DataBase

  const getLastOrder = (symbol) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM orders WHERE symbol = ? ORDER BY time_date DESC LIMIT 1`,
        [symbol],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  };

// Function closePosition on Binance

const closePosition = async (symbol, quantity) => {
    const lastOrder = await getLastOrder(symbol);
    if (lastOrder) {
      const positionSide = await binance.futuresPositionSideDual();
      if (positionSide === "both") {
        const position = await binance.futuresPositionInformation(symbol);
        if (position) {
          if (position.side === "BUY") {
            await binance.futuresMarketSell(symbol, quantity);
          } else {
            await binance.futuresMarketBuy(symbol, quantity);
          }
        }
      } else {
        const openOrders = await binance.futuresOpenOrders(symbol);
        const orderToCancel = openOrders.find((order) => order.orderId === lastOrder.order_id);
        if (orderToCancel) {
          if (orderToCancel.side === "BUY") {
            await binance.futuresMarketSell(symbol, quantity);
          } else {
            await binance.futuresMarketBuy(symbol, quantity);
          }
        }
      }
    }
  };

// Webhook

const app = express();
app.use(express.json());

app.use('/buy', async (reg, res, next) => {
    console.log(reg.originalUrl);
    console.log(reg.body);
    const symbol = reg.query.symbol;
    const quantity = reg.query.quantity;
    await closePosition(symbol, quantity);
    response = await binance.futuresMarketBuy( symbol, quantity );
    console.info(response);
    recordOrder(symbol, response.orderId);
    res.send(binance);
})

app.use('/sell', async (reg, res, next) => {
    console.log(reg.originalUrl);
    console.log(reg.body);
    const symbol = reg.query.symbol;
    const quantity = reg.query.quantity;
    await closePosition(symbol, quantity);
    response = await binance.futuresMarketSell( symbol, quantity )
    console.info(response);
    recordOrder(symbol, response.orderId);
    res.send(binance);
})

app.listen(process.env.PORT, () => {
    console.log("Server Started at " + process.env.PORT);
});