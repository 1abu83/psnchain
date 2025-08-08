"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTokenAsset = void 0;
const lisk_sdk_1 = require("lisk-sdk");
class CreateTokenAsset extends lisk_sdk_1.BaseAsset {
    constructor() {
        super(...arguments);
        this.name = 'createToken';
        this.id = 0;
        this.schema = {
            $id: 'token/createToken-asset',
            type: 'object',
            required: ['name', 'symbol', 'totalSupply', 'decimals'],
            properties: {
                name: {
                    dataType: 'string',
                    fieldNumber: 1,
                    minLength: 1,
                    maxLength: 32,
                },
                symbol: {
                    dataType: 'string',
                    fieldNumber: 2,
                    minLength: 1,
                    maxLength: 8,
                },
                totalSupply: {
                    dataType: 'uint64',
                    fieldNumber: 3,
                },
                decimals: {
                    dataType: 'uint32',
                    fieldNumber: 4,
                },
            },
        };
    }
    validate({ asset }) {
        if (asset.name.length < 1 || asset.name.length > 32) {
            throw new Error('Token name must be between 1 and 32 characters');
        }
        if (asset.symbol.length < 1 || asset.symbol.length > 8) {
            throw new Error('Token symbol must be between 1 and 8 characters');
        }
        if (asset.totalSupply <= BigInt(0)) {
            throw new Error('Total supply must be greater than 0');
        }
        if (asset.decimals < 0 || asset.decimals > 18) {
            throw new Error('Decimals must be between 0 and 18');
        }
    }
    async apply({ asset, senderAddress, stateStore, }) {
        const tokenId = Buffer.concat([senderAddress, Buffer.from([stateStore.chain.lastBlockHeader.height])]);
        const senderAccount = await stateStore.account.getOrDefault(senderAddress);
        senderAccount.token.tokens.push({
            tokenId,
            balance: asset.totalSupply,
            symbol: asset.symbol,
            name: asset.name,
        });
        await stateStore.account.set(senderAddress, senderAccount);
        this.events.emit('tokenCreated', {
            tokenId,
            name: asset.name,
            symbol: asset.symbol,
            totalSupply: asset.totalSupply,
            creator: senderAddress,
        });
    }
}
exports.CreateTokenAsset = CreateTokenAsset;
//# sourceMappingURL=createToken.js.map