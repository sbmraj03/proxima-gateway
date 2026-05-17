require('dotenv').config();
const http = require('http');
const { parseRequest } = require('./src/core/parser');
const { registerRoute, matchRoute } = require('./src/core/router');
const { forwardRequest } = require('./src/core/proxy');
const { rateLimiter } = require('./src/middleware/rateLimiter');
const { addServer, getNextServer } = require('./src/lb/roundRobin');
const routesConfig = require('./config/routes.json');
const { authMiddleware } = require('./src/middleware/auth');
const logger = require('./src/core/logger');
const { startHealthChecks, getHealthStatus } = require('./src/core/healthCheck');
const { getAnalytics, loadFromRedis } = require('./src/core/analytics');
const { getAllStates } = require('./src/middleware/circuitBreaker');


routesConfig.routes.forEach(r => {
    const resolvedTargets = r.targets.map(t => 
        t.replace('${BACKEND1_URL}', process.env.BACKEND1_URL || 'http://localhost:4001')
         .replace('${BACKEND2_URL}', process.env.BACKEND2_URL || 'http://localhost:4002')
    );
    registerRoute(r.method, r.path, r.auth, resolvedTargets, r.rateLimit);
    resolvedTargets.forEach(target => addServer(target));
});

loadFromRedis();

const allTargets = [...new Set(routesConfig.routes.flatMap(r => 
    r.targets.map(t => 
        t.replace('${BACKEND1_URL}', process.env.BACKEND1_URL || 'http://localhost:4001')
         .replace('${BACKEND2_URL}', process.env.BACKEND2_URL || 'http://localhost:4002')
    )
))];
startHealthChecks(allTargets, 30000);

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsed = parseRequest(req);
    logger.info({ requestId: parsed.requestId, method: parsed.method, url: parsed.url, ip: parsed.ip });

    if (req.url === '/analytics' && req.method === 'GET') {
        const data = getAnalytics();
        data.healthStatus = getHealthStatus(); 
        data.circuitBreakers = getAllStates();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
    }

    const matched = matchRoute(parsed.method, parsed.url);

    if (!matched) {
        logger.info('No route found');
        res.writeHead(404);
        res.end('Route not found');
        return;
    }

    const allowed = await rateLimiter(
        parsed.ip,
        parsed.url,
        matched.rateLimit?.maxTokens,
        matched.rateLimit?.refillRate
    );

    if (!allowed) {
        logger.info(`Rate limited: ${parsed.ip} on ${parsed.url}`);
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Too many requests' }));
        return;
    }

    if (matched.auth && !authMiddleware(req)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
    }

    const target = getNextServer();
    logger.info({ requestId: parsed.requestId, message: `Route matched -> forwarding to ${target}` });
    forwardRequest(req, res, target, parsed.requestId);
});

server.listen(3000, () => {
    logger.info('Proxima is running on port 3000');
});