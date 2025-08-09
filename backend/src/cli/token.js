const { tokenManager } = require('../index');

const createTokenCommand = (options) => {
  try {
    // Validate options
    if (!options.name || !options.symbol || !options['total-supply'] || !options.from) {
      console.error('Missing required options: --name, --symbol, --total-supply, --from');
      return;
    }
    
    const totalSupply = parseFloat(options['total-supply']);
    if (isNaN(totalSupply) || totalSupply <= 0) {
      console.error('Invalid total supply. Must be a positive number.');
      return;
    }
    
    const decimals = options.decimals ? parseInt(options.decimals) : 18;
    if (isNaN(decimals) || decimals < 0 || decimals > 18) {
      console.error('Invalid decimals. Must be between 0 and 18.');
      return;
    }
    
    // Validate creator address
    if (options.from.length !== 40) {
      console.error('Invalid creator address format. Address must be 40 characters long.');
      return;
    }
    
    // Create token
    const tokenId = tokenManager.createToken(
      options.name,
      options.symbol,
      totalSupply,
      decimals,
      options.from
    );
    
    console.log('Token created successfully!');
    console.log(`Name: ${options.name}`);
    console.log(`Symbol: ${options.symbol}`);
    console.log(`Total Supply: ${totalSupply}`);
    console.log(`Decimals: ${decimals}`);
    console.log(`Token ID: ${tokenId}`);
    console.log(`Creator: ${options.from}`);
  } catch (error) {
    console.error('Failed to create token:', error);
  }
};

module.exports = {
  createTokenCommand
};