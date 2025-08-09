const elliptic = require('elliptic');
const sha256 = require('sha256');

const ec = new elliptic.ec('secp256k1');

const createWallet = () => {
  // Generate key pair
  const keyPair = ec.genKeyPair();
  
  // Get public key
  const publicKey = keyPair.getPublic('hex');
  
  // Get private key
  const privateKey = keyPair.getPrivate('hex');
  
  // Generate address from public key
  const address = generateAddressFromPublicKey(publicKey);
  
  return {
    publicKey,
    privateKey,
    address,
  };
};

const generateAddressFromPublicKey = (publicKey) => {
  // Hash the public key with SHA256
  const publicKeyHash = sha256(publicKey);
  
  // Take the last 20 bytes as the address
  const address = publicKeyHash.substring(publicKeyHash.length - 40);
  
  return address;
};

const validateAddress = (address) => {
  // Check if address is a valid hex string of correct length
  const hexRegex = /^[0-9a-fA-F]{40}$/;
  return hexRegex.test(address);
};

const signTransaction = (transaction, privateKey) => {
  // Create transaction hash
  const transactionString = JSON.stringify(transaction);
  const transactionHash = sha256(transactionString);
  
  // Sign the hash
  const keyPair = ec.keyFromPrivate(privateKey, 'hex');
  const signature = keyPair.sign(transactionHash);
  
  return signature.toDER('hex');
};

const verifySignature = (transaction, signature, publicKey) => {
  // Create transaction hash
  const transactionString = JSON.stringify(transaction);
  const transactionHash = sha256(transactionString);
  
  // Verify the signature
  const keyPair = ec.keyFromPublic(publicKey, 'hex');
  return keyPair.verify(transactionHash, signature);
};

module.exports = {
  createWallet,
  generateAddressFromPublicKey,
  validateAddress,
  signTransaction,
  verifySignature
};