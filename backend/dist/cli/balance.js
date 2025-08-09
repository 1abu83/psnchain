"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalanceCommand = void 0;
const index_1 = require("../index");
const getBalanceCommand = (address) => {
    try {
        if (!address || address.length !== 40) {
            console.error('Invalid address format. Address must be 40 characters long.');
            return;
        }
        const psnBalance = index_1.blockchain.getBalanceOfAddress(address);
        console.log(`PSN Balance: ${psnBalance}`);
        console.log('\nToken Balances:');
        const tokens = index_1.tokenManager.getAllTokens();
        if (tokens.length === 0) {
            console.log('No tokens found.');
            return;
        }
        let hasTokenBalance = false;
        for (const token of tokens) {
            const balance = index_1.tokenManager.getBalance(address, token.id);
            if (balance > 0) {
                console.log(`${token.symbol}: ${balance}`);
                hasTokenBalance = true;
            }
        }
        if (!hasTokenBalance) {
            console.log('No token balances found.');
        }
    }
    catch (error) {
        console.error('Failed to get balance:', error);
    }
};
exports.getBalanceCommand = getBalanceCommand;
//# sourceMappingURL=balance.js.map