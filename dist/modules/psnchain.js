"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PSNChainModule = void 0;
const lisk_sdk_1 = require("lisk-sdk");
const transfer_1 = require("./assets/transfer");
class PSNChainModule extends lisk_sdk_1.BaseModule {
    constructor() {
        super(...arguments);
        this.name = 'psnchain';
        this.id = 1000;
        this.accountSchema = {
            type: 'object',
            properties: {
                balance: {
                    fieldNumber: 1,
                    dataType: 'uint64',
                },
            },
            default: {
                balance: BigInt(0),
            },
        };
    }
    async init(args) {
    }
    get genesisConfig() {
        return {
            communityIdentifier: 'PSNChain',
            totalAmount: BigInt(10000000000000000),
        };
    }
    get actions() {
        return {};
    }
    get events() {
        return [];
    }
    get reducers() {
        return {};
    }
    get transactionAssets() {
        return [new transfer_1.TransferAsset()];
    }
    async beforeTransactionsExecute() {
    }
    async afterTransactionsExecute() {
    }
    async afterBlockExecute() {
    }
}
exports.PSNChainModule = PSNChainModule;
//# sourceMappingURL=psnchain.js.map