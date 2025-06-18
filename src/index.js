const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { loadEnv } = require('./config/env');
const { buildOrderXML } = require('./services/xmlBuilder');
const { uploadToFTP } = require('./services/ftpUploader');
const logger = require('./utils/logger');
const { initializeCronJobs } = require('./services/cronService');

// Load environment variables
loadEnv();

// Initialize express app
const app = express();

// Constants
const WEBHOOK_PATH = '/webhook/order/create';

// Middleware setup
app.use(bodyParser.raw({ type: 'application/json' }));

// Webhook verification middleware
const verifyWebhook = (req, res, next) => {
    const hmac = req.get('X-Shopify-Hmac-Sha256');
    
    const genHash = crypto
        .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
        .update(req.body)
        .digest('base64');

    if (genHash !== hmac) {
        logger.error('Webhook verification failed');
        return res.status(401).send('Could not verify request');
    }

    logger.info('Webhook verification successfully');
    next();
};

// Webhook handler
const handleWebhook = async (req, res) => {
    const topic = req.headers['x-shopify-topic'];
    const shop = req.headers['x-shopify-shop-domain'];

    try {
        const order = JSON.parse(req.body);
        logger.info(`Verified webhook from ${shop} for ${topic}`);
        logger.info(`Processing Order ID: ${order?.order_number}`);

        const xmlContent = buildOrderXML(order);
        const fileName = `order_${order?.order_number}.xml`;

        await uploadToFTP(xmlContent, fileName);
        logger.info(`Successfully uploaded: ${fileName}`);
        
        res.status(200).send('OK');
    } catch (error) {
        logger.error('Webhook processing failed:', error);
        res.status(500).send('Error processing webhook');
    }
};

// Routes
app.post(WEBHOOK_PATH, verifyWebhook, handleWebhook);
// app.post(WEBHOOK_PATH, handleWebhook);

// Initialize cron jobs
initializeCronJobs();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
});
