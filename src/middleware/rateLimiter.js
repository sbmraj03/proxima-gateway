const logger = require('../core/logger');
const client = require('../core/redisClient');

async function rateLimiter(ip, route, maxTokens = 10, refillRate = 1) {
    const key = `rate_limit:${ip}:${route}`;
    const now = Date.now();

    const data = await client.get(key);

    let tokens = maxTokens;
    let lastRefill = now;

    if (data) {
        const parsed = JSON.parse(data);
        tokens = parsed.tokens;
        lastRefill = parsed.lastRefill;

        const secondsPassed = (now - lastRefill) / 1000;
        const refillAmount = secondsPassed * refillRate;

        tokens = Math.min(maxTokens, tokens + refillAmount);
        lastRefill = now;
    }

    if (tokens < 1) {
        return false;
    }

    tokens -= 1;

    await client.set(key, JSON.stringify({ tokens, lastRefill }), { EX: 60 });

    return true;
}

module.exports = { rateLimiter };