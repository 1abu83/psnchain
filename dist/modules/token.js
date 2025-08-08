"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenModule = void 0;
const lisk_sdk_1 = require("lisk-sdk");
const createToken_1 = require("./assets/createToken");
const transferToken_1 = require("./assets/transferToken");
class TokenModule extends lisk_sdk_1.BaseModule {
    constructor() {
        super();
        this.name = 'token';
        this.id = 1001;
        this.accountSchema = {
            type: 'object',
            properties: {
                tokens: {
                    type: 'array',
                    fieldNumber: 1,
                    items: {
                        type: 'object',
                        properties: {
                            tokenId: {
                                dataType: 'bytes',
                                fieldNumber: 1,
                            },
                            balance: {
                                dataType: 'uint64',
                                fieldNumber: 2,
                            },
                            symbol: {
                                dataType: 'string',
                                fieldNumber: 3,
                            },
                            name: {
                                dataType: 'string',
                                fieldNumber: 4,
                            },
                        },
                        required: ['tokenId', 'balance', 'symbol', 'name'],
                    },
                },
            },
            default: {
                tokens: [],
            },
        };
        this.stores = [];
    }
    async init(args) {
    }
    get genesisConfig() {
        return {};
    }
    get actions() {
        return {
            getAllTokens: async () => {
                return [];
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
        return [new createToken_1.CreateTokenAsset(), new transferToken_1.TransferTokenAsset()];
    }
    async beforeTransactionsExecute() {
    }
    async afterTransactionsExecute() {
    }
    async afterBlockExecute() {
    }
}
exports.TokenModule = TokenModule;
//# sourceMappingURL=token.js.map