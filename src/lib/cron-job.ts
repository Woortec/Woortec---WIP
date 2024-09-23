const cron = require('node-cron');

// Schedule the cron job to run every week (Sunday at 00:00)
cron.schedule('* * * * *', async () => {
  try {
    console.log('Cron job executed successfully:');
  } catch (error) {
    console.error('Error executing cron job:', error);
  }
});

console.log('Weekly cron job has been scheduled.');
