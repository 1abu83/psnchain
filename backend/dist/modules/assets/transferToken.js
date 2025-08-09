"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferTokenAsset = void 0;
const lisk_sdk_1 = require("lisk-sdk");
class TransferTokenAsset extends lisk_sdk_1.BaseAsset {
    constructor() {
        super(...arguments);
        this.name = 'transferToken';
        this.id = 1;
        this.schema = {
            $id: 'token/transferToken-asset',
            type: 'object',
            required: ['tokenId', 'amount', 'recipientAddress', 'data'],
            properties: {
                tokenId: {
                    dataType: 'bytes',
                    fieldNumber: 1,
                    minLength: 20,
                    maxLength: 32,
                },
                amount: {
                    dataType: 'uint64',
                    fieldNumber: 2,
                },
                recipientAddress: {
                    dataType: 'bytes',
                    fieldNumber: 3,
                    minLength: 20,
                    maxLength: 20,
                },
                data: {
                    dataType: 'string',
                    fieldNumber: 4,
                    minLength: 0,
                    maxLength: 64,
                },
            },
        };
    }
    validate({ asset }) {
        if (asset.amount <= BigInt(0)) {
            throw new Error('Amount must be greater than 0');
        }
        if (asset.data.length > 64) {
            throw new Error('Data must not exceed 64 characters');
        }
    }
    async apply({ asset, senderAddress, stateStore, }) {
        const senderAccount = await stateStore.account.getOrDefault(senderAddress);
        const recipientAccount = await stateStore.account.getOrDefault(asset.recipientAddress);
        const senderTokenIndex = senderAccount.token.tokens.findIndex((token) => token.tokenId.equals(asset.tokenId));
        if (senderTokenIndex === -1) {
            throw new Error('Sender does not own this token');
        }
        if (senderAccount.token.tokens[senderTokenIndex].balance < asset.amount) {
            throw new Error('Sender does not have enough token balance');
        }
        senderAccount.token.tokens[senderTokenIndex].balance -= asset.amount;
        const recipientTokenIndex = recipientAccount.token.tokens.findIndex((token) => token.tokenId.equals(asset.tokenId));
        if (recipientTokenIndex === -1) {
            const senderToken = senderAccount.token.tokens[senderTokenIndex];
            recipientAccount.token.tokens.push({
                tokenId: asset.tokenId,
                balance: asset.amount,
                symbol: senderToken.symbol,
                name: senderToken.name,
            });
        }
        else {
            recipientAccount.token.tokens[recipientTokenIndex].balance += asset.amount;
        }
        await stateStore.account.set(senderAddress, senderAccount);
        await stateStore.account.set(asset.recipientAddress, recipientAccount);
    }
}
exports.TransferTokenAsset = TransferTokenAsset;
//# sourceMappingURL=transferToken.js.map