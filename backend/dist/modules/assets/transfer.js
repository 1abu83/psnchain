"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferAsset = void 0;
const lisk_sdk_1 = require("lisk-sdk");
class TransferAsset extends lisk_sdk_1.BaseAsset {
    constructor() {
        super(...arguments);
        this.name = 'transfer';
        this.id = 0;
        this.schema = {
            $id: 'psnchain/transfer-asset',
            type: 'object',
            required: ['amount', 'recipientAddress', 'data'],
            properties: {
                amount: {
                    dataType: 'uint64',
                    fieldNumber: 1,
                },
                recipientAddress: {
                    dataType: 'bytes',
                    fieldNumber: 2,
                    minLength: 20,
                    maxLength: 20,
                },
                data: {
                    dataType: 'string',
                    fieldNumber: 3,
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
        if (senderAccount.psnchain.balance < asset.amount) {
            throw new Error('Sender does not have enough balance');
        }
        senderAccount.psnchain.balance -= asset.amount;
        recipientAccount.psnchain.balance += asset.amount;
        await stateStore.account.set(senderAddress, senderAccount);
        await stateStore.account.set(asset.recipientAddress, recipientAccount);
    }
}
exports.TransferAsset = TransferAsset;
//# sourceMappingURL=transfer.js.map