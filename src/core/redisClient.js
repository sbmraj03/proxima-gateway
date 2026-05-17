const redis = require('redis');
const logger = require('./logger');

const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
    logger.error(`Redis error: ${err.message}`);
});

client.connect();

module.exports = client;