"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = void 0;
class TokenManager {
    constructor() {
        this.tokens = new Map();
        this.balances = new Map();
    }
    createToken(name, symbol, totalSupply, decimals, creator) {
        const tokenId = `${name}_${symbol}_${Date.now()}`;
        const tokenInfo = {
            id: tokenId,
            name,
            symbol,
            totalSupply,
            decimals,
            creator
        };
        this.tokens.set(tokenId, tokenInfo);
        const balanceKey = `${creator}_${tokenId}`;
        this.balances.set(balanceKey, totalSupply);
        return tokenId;
    }
    transferToken(tokenId, fromAddress, toAddress, amount) {
        if (!this.tokens.has(tokenId)) {
            throw new Error('Token does not exist');
        }
        const fromBalanceKey = `${fromAddress}_${tokenId}`;
        const fromBalance = this.balances.get(fromBalanceKey) || 0;
        if (fromBalance < amount) {
            throw new Error('Insufficient token balance');
        }
        this.balances.set(fromBalanceKey, fromBalance - amount);
        const toBalanceKey = `${toAddress}_${tokenId}`;
        const toBalance = this.balances.get(toBalanceKey) || 0;
        this.balances.set(toBalanceKey, toBalance + amount);
    }
    getBalance(address, tokenId) {
        const balanceKey = `${address}_${tokenId}`;
        return this.balances.get(balanceKey) || 0;
    }
    getAllTokens() {
        return Array.from(this.tokens.values());
    }
    getTokenInfo(tokenId) {
        return this.tokens.get(tokenId);
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=token.js.map