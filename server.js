//Import dependencies
const express = require('express');
const { pool } = require('./config/database');
const { loadRefreshData } = require('./utils/loadRefreshdb');

require('dotenv').config();

//Initialize express app
const app = express();
const port = process.env.PORT || 3000;

//Manual Refresh
app.post('/datarefresh', async (req, res) => {
    try {
        await loadRefreshData(process.env.CSV_FILE_PATH);
        res.status(200).json({result: "Data refreshed successfully"});
    } 
    catch (error) {
        res.status(500).json({error:"Failed to refresh data"});
    }
  });
  
//Total revenue for the sales
app.get('/getrevenue', async (req, res) => {
    const client = await pool.connect();
    try{
        const { startDate, endDate } = req.query;
        const result = await client.query(
          "SELECT SUM(price * quantity) FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_date BETWEEN $1 AND $2",
          [startDate, endDate]
        );
        res.status(200).json({result:result.rows[0]});
        }
        catch (error) {
            res.status(500).json({error:"Failed to get revenue data"});
        }
        finally {
            client.release();
        }
});
  
  //Get top products
  app.get('/gettopproducts', async (req, res) => {
    const client = await pool.connect();
    try {
        const { startDate, endDate, limit } = req.query;
        const result = await client.query(
          "SELECT p.product_name, SUM(oi.quantity_sold) AS total_sold FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_date BETWEEN $1 AND $2 GROUP BY p.product_name ORDER BY total_sold DESC LIMIT $3",
          [startDate, endDate, limit]
        );
        res.status(200).json({result:result.rows});
    }
    catch (error) {
        res.status(500).json({error:"Failed to get revenue data"});
    }
    finally {
        client.release();
    }
});

//Listen for request from port 3000
app.listen(port, () => console.log("Server running on port 3000"));