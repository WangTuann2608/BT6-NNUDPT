const fs = require('fs');
const path = require('path');

const privateKey = fs.readFileSync(path.join(__dirname, 'private.pem'), 'utf8');
const publicKey  = fs.readFileSync(path.join(__dirname, 'public.pem'),  'utf8');

module.exports = { privateKey, publicKey };
