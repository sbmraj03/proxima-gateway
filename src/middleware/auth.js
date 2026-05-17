const jwt = require('jsonwebtoken');

const SECRET_KEY = 'proxima_secret_key';

function authMiddleware(req) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return false;
    }

    const token = authHeader.split(' ')[1];
    console.log("token: ", token);

    if (!token) {
        return false;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log('Authenticated user:', decoded);
        return true;
    } catch (err) {
        console.error('Invalid token:', err.message);
        return false;
    }
}

module.exports = { authMiddleware, SECRET_KEY };