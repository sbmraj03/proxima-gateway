const http = require('http');
const logger = require('./logger');
const { recordFailure, recordSuccess } = require('../middleware/circuitBreaker');

const healthStatus = {};

function checkHealth(target) {
    const url = new URL(target);

    const options = {
        hostname: url.hostname,
        port: url.port,
        path: '/health',
        method: 'GET',
        timeout: 3000
    };

    const req = http.request(options, (res) => {
        res.resume(); // body consume karo
        if (res.statusCode === 200) {
            healthStatus[target] = 'healthy';
            recordSuccess(target);
            logger.info(`Health check passed for ${target}`);
        } else {
            healthStatus[target] = 'unhealthy';
            recordFailure(target);
            logger.error(`Health check failed for ${target} - status ${res.statusCode}`);
        }
    });

    req.on('error', () => {
        healthStatus[target] = 'unhealthy';
        recordFailure(target);
        logger.error(`Health check failed for ${target} - unreachable`);
    });

    req.on('timeout', () => {
        healthStatus[target] = 'unhealthy';
        recordFailure(target);
        req.destroy();
        logger.error(`Health check timed out for ${target}`);
    });

    req.end();
}

function startHealthChecks(targets, intervalMs = 30000) {
    targets.forEach(target => {
        checkHealth(target);
        setInterval(() => checkHealth(target), intervalMs);
    });
}

function getHealthStatus() {
    return healthStatus;
}

module.exports = { startHealthChecks, getHealthStatus };