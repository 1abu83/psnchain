"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapAsset = void 0;
const lisk_sdk_1 = require("lisk-sdk");
class SwapAsset extends lisk_sdk_1.BaseAsset {
    constructor() {
        super(...arguments);
        this.name = 'swap';
        this.id = 0;
        this.schema = {
            $id: 'swap/swap-asset',
            type: 'object',
            required: ['poolId', 'tokenInId', 'tokenInAmount', 'minTokenOutAmount'],
            properties: {
                poolId: {
                    dataType: 'bytes',
                    fieldNumber: 1,
                    minLength: 20,
                    maxLength: 32,
                },
                tokenInId: {
                    dataType: 'bytes',
                    fieldNumber: 2,
                    minLength: 20,
                    maxLength: 32,
                },
                tokenInAmount: {
                    dataType: 'uint64',
                    fieldNumber: 3,
                },
                minTokenOutAmount: {
                    dataType: 'uint64',
                    fieldNumber: 4,
                },
            },
        };
    }
    validate({ asset }) {
        if (asset.tokenInAmount <= BigInt(0)) {
            throw new Error('Token in amount must be greater than 0');
        }
        if (asset.minTokenOutAmount <= BigInt(0)) {
            throw new Error('Minimum token out amount must be greater than 0');
        }
    }
    async apply({ asset, senderAddress, stateStore, }) {
        const senderAccount = await stateStore.account.getOrDefault(senderAddress);
        const poolIndex = senderAccount.swap.liquidityPools.findIndex((pool) => pool.poolId.equals(asset.poolId));
        if (poolIndex === -1) {
            throw new Error('Liquidity pool not found');
        }
        const pool = senderAccount.swap.liquidityPools[poolIndex];
        let tokenBalance = BigInt(0);
        let tokenIndex = -1;
        if (asset.tokenInId.equals(Buffer.from('PSN'))) {
            tokenBalance = senderAccount.psnchain.balance;
        }
        else {
            tokenIndex = senderAccount.token.tokens.findIndex((token) => token.tokenId.equals(asset.tokenInId));
            if (tokenIndex === -1) {
                throw new Error('Sender does not own the token to swap');
            }
            tokenBalance = senderAccount.token.tokens[tokenIndex].balance;
        }
        if (tokenBalance < asset.tokenInAmount) {
            throw new Error('Sender does not have enough token balance to swap');
        }
        let tokenOutAmount = BigInt(0);
        let tokenOutId = Buffer.from('');
        if (asset.tokenInId.equals(pool.tokenAId)) {
            tokenOutId = pool.tokenBId;
            const numerator = asset.tokenInAmount * pool.tokenBReserve * BigInt(997);
            const denominator = pool.tokenAReserve * BigInt(1000) + asset.tokenInAmount * BigInt(997);
            tokenOutAmount = numerator / denominator;
        }
        else if (asset.tokenInId.equals(pool.tokenBId)) {
            tokenOutId = pool.tokenAId;
            const numerator = asset.tokenInAmount * pool.tokenAReserve * BigInt(997);
            const denominator = pool.tokenBReserve * BigInt(1000) + asset.tokenInAmount * BigInt(997);
            tokenOutAmount = numerator / denominator;
        }
        else {
            throw new Error('Token not in liquidity pool');
        }
        if (tokenOutAmount < asset.minTokenOutAmount) {
            throw new Error('Swap output amount is less than minimum required');
        }
        if (asset.tokenInId.equals(Buffer.from('PSN'))) {
            senderAccount.psnchain.balance -= asset.tokenInAmount;
        }
        else {
            senderAccount.token.tokens[tokenIndex].balance -= asset.tokenInAmount;
        }
        if (tokenOutId.equals(Buffer.from('PSN'))) {
            senderAccount.psnchain.balance += tokenOutAmount;
        }
        else {
            const outTokenIndex = senderAccount.token.tokens.findIndex((token) => token.tokenId.equals(tokenOutId));
            if (outTokenIndex === -1) {
                senderAccount.token.tokens.push({
                    tokenId: tokenOutId,
                    balance: tokenOutAmount,
                    symbol: 'TOKEN',
                    name: 'Token',
                });
            }
            else {
                senderAccount.token.tokens[outTokenIndex].balance += tokenOutAmount;
            }
        }
        if (asset.tokenInId.equals(pool.tokenAId)) {
            pool.tokenAReserve += asset.tokenInAmount;
            pool.tokenBReserve -= tokenOutAmount;
        }
        else {
            pool.tokenBReserve += asset.tokenInAmount;
            pool.tokenAReserve -= tokenOutAmount;
        }
        await stateStore.account.set(senderAddress, senderAccount);
        this.emitEvent('swapExecuted', {
            poolId: asset.poolId,
            tokenInId: asset.tokenInId,
            tokenInAmount: asset.tokenInAmount,
            tokenOutId,
            tokenOutAmount,
            sender: senderAddress,
        });
    }
}
exports.SwapAsset = SwapAsset;
//# sourceMappingURL=swap.js.map