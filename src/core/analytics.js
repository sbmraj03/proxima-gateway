const client = require('./redisClient');
const logger = require('./logger');

const ANALYTICS_KEY = 'proxima:analytics';

const defaultAnalytics = {
    totalRequests: 0,
    failedRequests: 0,
    routeStats: {},
    responseTimes: [],
    timeSeries: []
};

let analytics = { ...defaultAnalytics };

async function loadFromRedis() {
    try {
        const data = await client.get(ANALYTICS_KEY);
        if (data) {
            analytics = JSON.parse(data);
            logger.info('Analytics loaded from Redis');
        }
    } catch (err) {
        logger.error(`Failed to load analytics from Redis: ${err.message}`);
    }
}

async function saveToRedis() {
    try {
        await client.set(ANALYTICS_KEY, JSON.stringify(analytics));
    } catch (err) {
        logger.error(`Failed to save analytics to Redis: ${err.message}`);
    }
}

async function recordRequest(route, statusCode, responseTime) {
    analytics.totalRequests += 1;

    if (statusCode >= 400) {
        analytics.failedRequests += 1;
    }

    if (!analytics.routeStats[route]) {
        analytics.routeStats[route] = {
            totalRequests: 0,
            failedRequests: 0,
            avgResponseTime: 0
        };
    }

    analytics.routeStats[route].totalRequests += 1;

    if (statusCode >= 400) {
        analytics.routeStats[route].failedRequests += 1;
    }

    analytics.responseTimes.push(responseTime);

    const total = analytics.responseTimes.reduce((a, b) => a + b, 0);
    analytics.routeStats[route].avgResponseTime = total / analytics.responseTimes.length;

    const now = Date.now();
    const currentMinute = Math.floor(now / 60000) * 60000;

    const lastEntry = analytics.timeSeries[analytics.timeSeries.length - 1];

    if (lastEntry && lastEntry.timestamp === currentMinute) {
        lastEntry.requests += 1;
    } else {
        analytics.timeSeries.push({ timestamp: currentMinute, requests: 1 });
    }

    if (analytics.timeSeries.length > 60) {
        analytics.timeSeries.shift();
    }

    await saveToRedis();
}

function getAnalytics() {
    return analytics;
}

module.exports = { recordRequest, getAnalytics, loadFromRedis };