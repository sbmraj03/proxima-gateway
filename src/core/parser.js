const { randomUUID } = require('crypto');

function parseRequest(req) {
    return {
        requestId: randomUUID(),
        method: req.method,
        url: req.url,
        headers: req.headers,
        ip: req.socket.remoteAddress
    };
}

module.exports = { parseRequest };