//Import all depencies
const { Pool } = require('pg');
require('dotenv').config();

//Create pool to connect to postgresql
const pool = new Pool({
    user: process.env.PGSQL_USER,
    password: process.env.PGSQL_PASSWORD,
    host: process.env.PGSQL_HOST,
    port: Number(process.env.PGSQL_PORT),
    database: process.env.PGSQL_DATABASE,
    ssl:true
});

module.exports = { pool };