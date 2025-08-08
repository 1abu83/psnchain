import { blockchain, signTransaction } from '../index';
import { Transaction } from '../blockchain/block';

export const sendTokenCommand = (options: { amount?: string; to?: string; from?: string }) => {
  try {
    // Validate options
    if (!options.amount || !options.to || !options.from) {
      console.error('Missing required options: --amount, --to, --from');
      return;
    }
    
    const amount = parseFloat(options.amount);
    if (isNaN(amount) || amount <= 0) {
      console.error('Invalid amount. Must be a positive number.');
      return;
    }
    
    // Validate recipient address
    if (options.to.length !== 40) {
      console.error('Invalid recipient address format. Address must be 40 characters long.');
      return;
    }
    
    // Validate private key
    if (options.from.length !== 64) {
      console.error('Invalid private key format. Private key must be 64 characters long.');
      return;
    }
    
    // Create transaction
    const transaction: Transaction = {
      sender: options.from,
      recipient: options.to,
      amount: amount,
      timestamp: Date.now()
    };
    
    // Sign transaction
    const signature = signTransaction(transaction, options.from);
    transaction.signature = signature;
    
    // Add transaction to blockchain
    blockchain.createTransaction(transaction);
    
    console.log('Transaction created successfully!');
    console.log(`Amount: ${amount} PSN`);
    console.log(`To: ${options.to}`);
    console.log(`From: ${options.from}`);
    console.log(`Signature: ${signature}`);
    
    console.log('\nTransaction added to pending transactions.');
    console.log('Mine a block to confirm the transaction.');
  } catch (error) {
    console.error('Failed to send token:', error);
  }
};