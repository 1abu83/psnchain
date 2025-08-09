// Wallet utility functions using Web Crypto API

/**
 * Generate a random private key (64 character hex string)
 */
export const generatePrivateKey = () => {
  const array = new Uint8Array(32); // 32 bytes = 256 bits
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Derive public key from private key using SHA-256
 */
export const derivePublicKey = async (privateKey) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(privateKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Derive PSN address from public key
 */
export const deriveAddress = async (publicKey) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(publicKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const addressHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'psn' + addressHash.substring(0, 40);
};

/**
 * Validate private key format
 */
export const validatePrivateKey = (privateKey) => {
  if (!privateKey || typeof privateKey !== 'string') {
    return { valid: false, error: 'Private key is required' };
  }

  const cleanKey = privateKey.trim();
  
  if (cleanKey.length < 32) {
    return { valid: false, error: 'Private key must be at least 32 characters long' };
  }

  // Prefer 64-character hex format
  if (cleanKey.length === 64) {
    if (!/^[0-9a-fA-F]+$/.test(cleanKey)) {
      return { valid: false, error: 'Invalid hexadecimal format for 64-character private key' };
    }
  }

  return { valid: true, error: null };
};

/**
 * Create wallet from private key
 */
export const createWalletFromPrivateKey = async (privateKey) => {
  const validation = validatePrivateKey(privateKey);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cleanPrivateKey = privateKey.trim();
  
  try {
    const publicKey = await derivePublicKey(cleanPrivateKey);
    const address = await deriveAddress(publicKey);

    return {
      address,
      publicKey: '04' + publicKey,
      privateKey: cleanPrivateKey
    };
  } catch (error) {
    throw new Error('Failed to create wallet from private key: ' + error.message);
  }
};

/**
 * Generate a new wallet
 */
export const generateNewWallet = async () => {
  const privateKey = generatePrivateKey();
  return await createWalletFromPrivateKey(privateKey);
};

/**
 * Validate PSN address format
 */
export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Address is required' };
  }

  if (!address.startsWith('psn')) {
    return { valid: false, error: 'Address must start with "psn"' };
  }

  if (address.length !== 43) {
    return { valid: false, error: 'Address must be 43 characters long' };
  }

  const addressPart = address.substring(3);
  if (!/^[0-9a-fA-F]+$/.test(addressPart)) {
    return { valid: false, error: 'Invalid address format' };
  }

  return { valid: true, error: null };
};

/**
 * Format address for display (shortened)
 */
export const formatAddress = (address, startChars = 8, endChars = 6) => {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Export wallet to JSON format
 */
export const exportWallet = (wallet) => {
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
    createdAt: new Date().toISOString(),
    network: 'PSNChain',
    version: '1.0'
  };
};

/**
 * Import wallet from JSON format
 */
export const importWalletFromJSON = async (jsonData) => {
  try {
    const walletData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    if (!walletData.privateKey) {
      throw new Error('Invalid wallet file: missing private key');
    }

    return await createWalletFromPrivateKey(walletData.privateKey);
  } catch (error) {
    throw new Error('Failed to import wallet: ' + error.message);
  }
};