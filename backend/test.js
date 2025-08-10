console.log('Testing...');

const crypto = require('crypto');

const privateKey = '63c4c418f196d6b537435397b0698bf333bfa849c0e51907a5188a1aa18ce091';
const publicKey = crypto.createHash('sha256').update(privateKey).digest('hex');
const address = 'psn' + publicKey.substring(publicKey.length - 40);

console.log('Private Key:', privateKey);
console.log('Public Key:', publicKey);
console.log('Address:', address);
console.log('Expected:', 'psnfd242e4b83661362f1ff1b764d99355773f2f41f');
console.log('Match:', address === 'psnfd242e4b83661362f1ff1b764d99355773f2f41f');
