const jwt = require('jsonwebtoken');

const SECRET_KEY = 'proxima_secret_key';

const token = jwt.sign(
    { userId: 1, role: 'admin' },
    SECRET_KEY,
    { expiresIn: '10h' }
);

console.log('Token:', token);