const crypto = require('crypto');
const { createWallet } = require('./src/utils/wallet.js');

console.log('🔍 Testing Wallet Generation Algorithms\n');

// Test 1: Backend wallet generation
console.log('📋 Test 1: Backend Wallet Generation');
console.log('=====================================');

const backendWallet = createWallet();
console.log(`Private Key: ${backendWallet.privateKey}`);
console.log(`Public Key: ${backendWallet.publicKey}`);
console.log(`Address: ${backendWallet.address}`);
console.log('');

// Test 2: Frontend-style wallet generation (simulated)
console.log('📋 Test 2: Frontend-Style Wallet Generation (Simulated)');
console.log('=====================================');

function generatePrivateKeyFrontend() {
  const array = new Uint8Array(32);
  crypto.randomFillSync(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function derivePublicKeyFrontend(privateKey) {
  const hash = crypto.createHash('sha256').update(privateKey).digest('hex');
  return hash;
}

async function deriveAddressFrontend(publicKey) {
  const hash = crypto.createHash('sha256').update(publicKey).digest('hex');
  return 'psn' + hash.substring(0, 40);
}

const frontendPrivateKey = generatePrivateKeyFrontend();
console.log(`Private Key: ${frontendPrivateKey}`);

derivePublicKeyFrontend(frontendPrivateKey).then(publicKey => {
  console.log(`Public Key: ${publicKey}`);
  
  return deriveAddressFrontend(publicKey);
}).then(address => {
  console.log(`Address: ${address}`);
  console.log('');
  
  // Test 3: Compare with developer wallet
  console.log('📋 Test 3: Developer Wallet Comparison');
  console.log('=====================================');
  
  const developerPrivateKey = '63c4c418f196d6b537435397b0698bf333bfa849c0e51907a5188a1aa18ce091';
  console.log(`Developer Private Key: ${developerPrivateKey}`);
  
  derivePublicKeyFrontend(developerPrivateKey).then(devPublicKey => {
    console.log(`Developer Public Key: ${devPublicKey}`);
    
    return deriveAddressFrontend(devPublicKey);
  }).then(devAddress => {
    console.log(`Developer Address (Frontend): ${devAddress}`);
    console.log(`Developer Address (Backend): psnfd242e4b83661362f1ff1b764d99355773f2f41f`);
    console.log('');
    
    if (devAddress === 'psnfd242e4b83661362f1ff1b764d99355773f2f41f') {
      console.log('✅ SUCCESS: Frontend and backend generate same address!');
    } else {
      console.log('❌ MISMATCH: Frontend and backend generate different addresses!');
      console.log('This explains why the balance is not showing up.');
    }
  });
});

console.log('⏳ Testing in progress...\n');
