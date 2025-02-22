//Import all dependencies
const csv = require('csv-parser');
const fs = require('fs');
const { pool } = require('../config/database');

//To load from database
async function loadRefreshData(filePath) {
    const data = [];

  //As the data is huge we are reading the file in chunks with Read stream
  fs.createReadStream(filePath).pipe(csv()).on('data', (row) => {
      data.push(row);
    }).on('end', async () => {

      const client = await pool.connect(); 
      try {
        //Begin
        await client.query('BEGIN'); 

        for (const row of data) {

            //Insert to customers table
            await client.query(
            'INSERT INTO customers (customer_id, customer_name, customer_email, customer_address) VALUES ($1, $2, $3, $4) ON CONFLICT (customer_id) DO NOTHING',
            [row['Customer ID'], row['Customer Name'], row['Customer Email'], row['Customer Address']]
          );

          //Insert to products table
          await client.query(
            'INSERT INTO products (product_id, product_name, category, unit_price) VALUES ($1, $2, $3, $4) ON CONFLICT (product_id) DO NOTHING',
            [row['Product ID'], row['Product Name'], row['Category'], row['Unit Price']]
          );

          //Insert orders table
          await client.query(
            'INSERT INTO orders (order_id, customer_id, order_date, payment_method, shipping_cost, discount) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (order_id) DO NOTHING',
            [row['Order ID'], row['Customer ID'],row['Date of Sale'],row['Payment Method'],row['Shipping Cost'],row['Discount']]
          );


          //Insert order items table
          await client.query(
            'INSERT INTO order_items (order_id, product_id, quantity_sold) VALUES ($1, $2, $3)',
            [row['Order ID'], row['Product ID'], row['Quantity Sold']]
          );
        }

        //commit the changes to db
        await client.query('COMMIT');
      } 
      catch (err) {
        //rollback the changes
        await client.query('ROLLBACK');
        console.error('Error occurred while processing the data:', err);
      } 
      finally {
        client.release();
      }
    })
    .on('error', (err) => {
      console.error('Error processing CSV file:', err);
    });
}

loadDataToDB('sales_data.csv')
  .catch((err) => console.error('Data loading from csv to db failed:', err))
  .finally(() => {
    //end the pool connection
    pool.end();
});

module.exports = { loadRefreshData };