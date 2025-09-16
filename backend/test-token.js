// Test script to verify admin management functionality
const jwt = require('jsonwebtoken');

// Simulate the environment variables
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = '123qwe123';
const JWT_SECRET = 'your-jwt-secret-here'; // This should match your .env file

// Test the old token generation (like in userController.js)
const oldToken = jwt.sign(ADMIN_EMAIL + ADMIN_PASSWORD, JWT_SECRET);
console.log('Old token:', oldToken);

// Test decoding
try {
    const decoded = jwt.verify(oldToken, JWT_SECRET);
    console.log('Decoded token:', decoded);
    console.log('Token type:', typeof decoded);
    console.log('Expected string:', ADMIN_EMAIL + ADMIN_PASSWORD);
    console.log('Match:', decoded === ADMIN_EMAIL + ADMIN_PASSWORD);
} catch (error) {
    console.error('Token decode error:', error.message);
}

// Test the new token generation (like in adminController.js)
const newToken = jwt.sign({ id: 'test-id', role: 'superadmin' }, JWT_SECRET);
console.log('New token:', newToken);

try {
    const decodedNew = jwt.verify(newToken, JWT_SECRET);
    console.log('Decoded new token:', decodedNew);
} catch (error) {
    console.error('New token decode error:', error.message);
}
