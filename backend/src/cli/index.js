#!/usr/bin/env node

const { Command } = require('commander');
const { createWalletCommand } = require('./wallet');
const { sendTokenCommand } = require('./transfer');
const { createTokenCommand } = require('./token');
const { swapTokenCommand } = require('./swap');
const { getBalanceCommand } = require('./balance');
const { listTokensCommand } = require('./listTokens');

const program = new Command();

program
  .name('psnchain-cli')
  .description('CLI for interacting with PSNChain')
  .version('1.0.0');

program
  .command('create-wallet')
  .description('Create a new wallet')
  .action(createWalletCommand);

program
  .command('get-balance')
  .description('Get wallet balance')
  .argument('<address>', 'Wallet address')
  .action(getBalanceCommand);

program
  .command('send-token')
  .description('Send PSN tokens to another wallet')
  .option('-a, --amount <amount>', 'Amount to send')
  .option('-t, --to <recipient>', 'Recipient address')
  .option('-f, --from <sender>', 'Sender private key')
  .action(sendTokenCommand);

program
  .command('create-token')
  .description('Create a new fungible token')
  .option('-n, --name <name>', 'Token name')
  .option('-s, --symbol <symbol>', 'Token symbol')
  .option('-t, --total-supply <supply>', 'Total supply')
  .option('-d, --decimals <decimals>', 'Number of decimals')
  .option('-f, --from <sender>', 'Sender private key')
  .action(createTokenCommand);

program
  .command('swap-token')
  .description('Swap tokens using AMM')
  .option('-p, --pool <poolId>', 'Liquidity pool ID')
  .option('-i, --token-in <tokenId>', 'Token to swap')
  .option('-a, --amount <amount>', 'Amount to swap')
  .option('-m, --min-out <minAmount>', 'Minimum output amount')
  .option('-f, --from <sender>', 'Sender private key')
  .action(swapTokenCommand);

program
  .command('list-tokens')
  .description('List all community tokens')
  .action(listTokensCommand);

program.parse();