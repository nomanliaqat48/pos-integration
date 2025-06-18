const cron = require('node-cron');
const logger = require('../utils/logger');
const { checkAndDownloadXML } = require('./downloader');

/**
 * Initialize and start the cron jobs
 */
const initializeCronJobs = () => {
    // Start cron job for XML check (every 3 minutes)
    cron.schedule('*/3 * * * *', () => {
        checkAndDownloadXML().catch(error => {
            logger.error('XML check failed:', error);
        });
    }, {
        scheduled: true,
        timezone: "UTC"
    });

    logger.info('Cron job scheduled for XML check every 3 minutes');
};

/**
 * Stop all cron jobs
 */
const stopCronJobs = () => {
    cron.getTasks().forEach(task => {
        task.stop();
    });
    logger.info('All cron jobs stopped');
};

/**
 * Get all active cron jobs
 */
const getActiveCronJobs = () => {
    return cron.getTasks();
};

module.exports = {
    initializeCronJobs,
    stopCronJobs,
    getActiveCronJobs
}; 