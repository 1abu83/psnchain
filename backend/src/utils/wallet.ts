import * as crypto from 'crypto';
import elliptic from 'elliptic';
import sha256 from 'sha256';

const ec = new elliptic.ec('secp256k1');

export interface Wallet {
  readonly publicKey: string;
  readonly privateKey: string;
  readonly address: string;
}

export const createWallet = (): Wallet => {
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

export const generateAddressFromPublicKey = (publicKey: string): string => {
  // Hash the public key with SHA256
  const publicKeyHash = sha256(publicKey);
  
  // Take the last 20 bytes as the address
  const address = publicKeyHash.substring(publicKeyHash.length - 40);
  
  return address;
};

export const validateAddress = (address: string): boolean => {
  // Check if address is a valid hex string of correct length
  const hexRegex = /^[0-9a-fA-F]{40}$/;
  return hexRegex.test(address);
};

export const signTransaction = (transaction: any, privateKey: string): string => {
  // Create transaction hash
  const transactionString = JSON.stringify(transaction);
  const transactionHash = sha256(transactionString);
  
  // Sign the hash
  const keyPair = ec.keyFromPrivate(privateKey, 'hex');
  const signature = keyPair.sign(transactionHash);
  
  return signature.toDER('hex');
};

export const verifySignature = (transaction: any, signature: string, publicKey: string): boolean => {
  // Create transaction hash
  const transactionString = JSON.stringify(transaction);
  const transactionHash = sha256(transactionString);
  
  // Verify the signature
  const keyPair = ec.keyFromPublic(publicKey, 'hex');
  return keyPair.verify(transactionHash, signature);
};