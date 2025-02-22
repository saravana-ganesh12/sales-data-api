//Import dependencies
const cron = require('node-cron');
const { loadRefreshData } = require('../utils/loadRefreshdb');
require('dotenv').config();


// Schedule a cron job to refresh data every day 02:00
cron.schedule('0 2 * * *', async () => {
  try {
    
    //Call the refresh function for utils
    await loadRefreshData(process.env.CSV_FILE_PATH);

  } 
  catch (error) {
    console.error('Failed data refresh:', error);
  }
});
