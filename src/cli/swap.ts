import { amm } from '../index';

export const swapTokenCommand = (options: { 
  pool?: string; 
  'token-in'?: string; 
  amount?: string; 
  'min-out'?: string; 
  from?: string 
}) => {
  try {
    // Validate options
    if (!options.pool || !options['token-in'] || !options.amount || !options.from) {
      console.error('Missing required options: --pool, --token-in, --amount, --from');
      return;
    }
    
    const amount = parseFloat(options.amount);
    if (isNaN(amount) || amount <= 0) {
      console.error('Invalid amount. Must be a positive number.');
      return;
    }
    
    // Validate pool ID
    if (options.pool.length < 10) {
      console.error('Invalid pool ID format.');
      return;
    }
    
    // Validate token ID
    if (options['token-in'].length < 5) {
      console.error('Invalid token ID format.');
      return;
    }
    
    // Validate sender address
    if (options.from.length !== 40) {
      console.error('Invalid sender address format. Address must be 40 characters long.');
      return;
    }
    
    // Perform swap
    const result = amm.swap(options.pool, options['token-in'], amount);
    
    console.log('Token swap executed successfully!');
    console.log(`Pool ID: ${options.pool}`);
    console.log(`Token In: ${options['token-in']}`);
    console.log(`Amount In: ${amount}`);
    console.log(`Token Out: ${result.tokenOut}`);
    console.log(`Amount Out: ${result.amountOut}`);
  } catch (error) {
    console.error('Failed to swap tokens:', error);
  }
};