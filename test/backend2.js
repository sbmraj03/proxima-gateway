const http = require('http');
const logger = require('../src/core/logger');

const server = http.createServer((req, res) => {
    logger.info(`Backend 2 received ${req.method}, ${req.url}`);

    if (req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
        return;
    }
    
    res.writeHead(200, {'content-type' : 'application/json'});

    res.end(JSON.stringify({
        message: 'Hello from Backend 2',
        method: req.method,
        url: req.url
    }))
});

server.listen(4002, () => {
    logger.info("Backend 2 is running on port 4002");
});

