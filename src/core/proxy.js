const http = require('http');
const { isAllowed, recordSuccess, recordFailure } = require('../middleware/circuitBreaker');
const { recordRequest } = require('../core/analytics');
const logger = require('./logger');

const MAX_RETRIES = 2;
const RETRY_DELAY = 100;

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function attemptRequest(req, res, target, requestId, bodyBuffer, attempt) {
    return new Promise(async (resolve) => {
        const url = new URL(target);

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: req.url,
            method: req.method,
            headers: { ...req.headers, 'x-request-id': requestId },
            timeout: 5000
        };

        const startTime = Date.now();

        const proxyReq = http.request(options, (proxyRes) => {
            const responseTime = Date.now() - startTime;

            if (proxyRes.statusCode >= 500) {
                recordFailure(target);
                proxyRes.resume();
                resolve({ success: false, responseTime });
                return;
            }

            recordSuccess(target);
            recordRequest(req.url, proxyRes.statusCode, responseTime);
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
            resolve({ success: true, responseTime });
        });

        proxyReq.on('error', (err) => {
            const responseTime = Date.now() - startTime;
            logger.error({ requestId, message: `Forward error: ${err.message}`, target });
            recordFailure(target);
            resolve({ success: false, responseTime });
        });

        proxyReq.on('timeout', () => {
            const responseTime = Date.now() - startTime;
            logger.error({ requestId, message: `Request timed out`, target });
            recordFailure(target);
            proxyReq.destroy();
            resolve({ success: false, responseTime });
        });

        proxyReq.write(bodyBuffer);
        proxyReq.end();
    });
}

async function forwardRequest(req, res, target, requestId) {
    if (!isAllowed(target)) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Service Unavailable - Circuit Open' }));
        return;
    }

    const bodyChunks = [];
    req.on('data', chunk => bodyChunks.push(chunk));
    req.on('end', async () => {
        const bodyBuffer = Buffer.concat(bodyChunks);

        for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
            if (attempt > 1) {
                const delay = RETRY_DELAY * Math.pow(2, attempt - 2);
                logger.info({ requestId, message: `Retrying attempt ${attempt} after ${delay}ms`, target });
                await wait(delay);
            }

            const result = await attemptRequest(req, res, target, requestId, bodyBuffer, attempt);

            if (result.success) {
                return;
            }

            if (attempt === MAX_RETRIES + 1) {
                recordRequest(req.url, 502, result.responseTime);
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Bad Gateway - All retries failed' }));
            }
        }
    });
}

module.exports = { forwardRequest };