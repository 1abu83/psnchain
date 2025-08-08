"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTokensCommand = void 0;
const index_1 = require("../index");
const listTokensCommand = () => {
    try {
        const tokens = index_1.tokenManager.getAllTokens();
        if (tokens.length === 0) {
            console.log('No tokens found.');
            return;
        }
        console.log('Community Tokens:');
        console.log('=================');
        for (const token of tokens) {
            console.log(`Name: ${token.name}`);
            console.log(`Symbol: ${token.symbol}`);
            console.log(`Total Supply: ${token.totalSupply}`);
            console.log(`Decimals: ${token.decimals}`);
            console.log(`Token ID: ${token.id}`);
            console.log(`Creator: ${token.creator}`);
            console.log('-----------------');
        }
        console.log(`Total tokens: ${tokens.length}`);
    }
    catch (error) {
        console.error('Failed to list tokens:', error);
    }
};
exports.listTokensCommand = listTokensCommand;
//# sourceMappingURL=listTokens.js.map