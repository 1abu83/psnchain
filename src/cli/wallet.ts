import { createWallet } from '../utils/wallet';

export const createWalletCommand = () => {
  try {
    const wallet = createWallet();
    
    console.log('Wallet created successfully!');
    console.log('==========================');
    console.log(`Address: ${wallet.address}`);
    console.log(`Public Key: ${wallet.publicKey}`);
    console.log(`Private Key: ${wallet.privateKey}`);
    console.log('');
    console.log('⚠️  WARNING: Keep your private key secure! Never share it with anyone.');
  } catch (error) {
    console.error('Failed to create wallet:', error);
  }
};