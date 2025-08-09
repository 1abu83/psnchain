"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapModule = void 0;
const lisk_sdk_1 = require("lisk-sdk");
const swap_1 = require("./assets/swap");
class SwapModule extends lisk_sdk_1.BaseModule {
    constructor() {
        super();
        this.name = 'swap';
        this.id = 1002;
        this.accountSchema = {
            type: 'object',
            properties: {
                liquidityPools: {
                    type: 'array',
                    fieldNumber: 1,
                    items: {
                        type: 'object',
                        properties: {
                            poolId: {
                                dataType: 'bytes',
                                fieldNumber: 1,
                            },
                            tokenAReserve: {
                                dataType: 'uint64',
                                fieldNumber: 2,
                            },
                            tokenBReserve: {
                                dataType: 'uint64',
                                fieldNumber: 3,
                            },
                            lpTokenSupply: {
                                dataType: 'uint64',
                                fieldNumber: 4,
                            },
                            tokenAId: {
                                dataType: 'bytes',
                                fieldNumber: 5,
                            },
                            tokenBId: {
                                dataType: 'bytes',
                                fieldNumber: 6,
                            },
                        },
                        required: ['poolId', 'tokenAReserve', 'tokenBReserve', 'lpTokenSupply', 'tokenAId', 'tokenBId'],
                    },
                },
            },
            default: {
                liquidityPools: [],
            },
        };
    }
    async init(args) {
    }
    get genesisConfig() {
        return {};
    }
    get actions() {
        return {
            getPoolInfo: async (params) => {
                return {};
            },
        };
    }
    get events() {
        return [];
    }
    get reducers() {
        return {};
    }
    get transactionAssets() {
        return [new swap_1.SwapAsset()];
    }
    async beforeTransactionsExecute() {
    }
    async afterTransactionsExecute() {
    }
    async afterBlockExecute() {
    }
}
exports.SwapModule = SwapModule;
//# sourceMappingURL=swap.js.map