#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const wallet_1 = require("./wallet");
const transfer_1 = require("./transfer");
const token_1 = require("./token");
const swap_1 = require("./swap");
const balance_1 = require("./balance");
const listTokens_1 = require("./listTokens");
const program = new commander_1.Command();
program
    .name('psnchain-cli')
    .description('CLI for interacting with PSNChain')
    .version('1.0.0');
program
    .command('create-wallet')
    .description('Create a new wallet')
    .action(wallet_1.createWalletCommand);
program
    .command('get-balance')
    .description('Get wallet balance')
    .argument('<address>', 'Wallet address')
    .action(balance_1.getBalanceCommand);
program
    .command('send-token')
    .description('Send PSN tokens to another wallet')
    .option('-a, --amount <amount>', 'Amount to send')
    .option('-t, --to <recipient>', 'Recipient address')
    .option('-f, --from <sender>', 'Sender private key')
    .action(transfer_1.sendTokenCommand);
program
    .command('create-token')
    .description('Create a new fungible token')
    .option('-n, --name <name>', 'Token name')
    .option('-s, --symbol <symbol>', 'Token symbol')
    .option('-t, --total-supply <supply>', 'Total supply')
    .option('-d, --decimals <decimals>', 'Number of decimals')
    .option('-f, --from <sender>', 'Sender private key')
    .action(token_1.createTokenCommand);
program
    .command('swap-token')
    .description('Swap tokens using AMM')
    .option('-p, --pool <poolId>', 'Liquidity pool ID')
    .option('-i, --token-in <tokenId>', 'Token to swap')
    .option('-a, --amount <amount>', 'Amount to swap')
    .option('-m, --min-out <minAmount>', 'Minimum output amount')
    .option('-f, --from <sender>', 'Sender private key')
    .action(swap_1.swapTokenCommand);
program
    .command('list-tokens')
    .description('List all community tokens')
    .action(listTokens_1.listTokensCommand);
program.parse();
//# sourceMappingURL=index.js.map