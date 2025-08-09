import { BaseModule, ModuleMetadata } from 'lisk-sdk';
import { CreateTokenAsset } from './assets/createToken';
import { TransferTokenAsset } from './assets/transferToken';
export declare class TokenModule extends BaseModule {
    name: string;
    id: number;
    accountSchema: {
        type: string;
        properties: {
            tokens: {
                type: string;
                fieldNumber: number;
                items: {
                    type: string;
                    properties: {
                        tokenId: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        balance: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        symbol: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        name: {
                            dataType: string;
                            fieldNumber: number;
                        };
                    };
                    required: string[];
                };
            };
        };
        default: {
            tokens: any[];
        };
    };
    constructor();
    init(args: ModuleMetadata): Promise<void>;
    get genesisConfig(): {};
    get actions(): {
        getAllTokens: () => Promise<any[]>;
    };
    get events(): any[];
    get reducers(): {};
    get transactionAssets(): (CreateTokenAsset | TransferTokenAsset)[];
    beforeTransactionsExecute(): Promise<void>;
    afterTransactionsExecute(): Promise<void>;
    afterBlockExecute(): Promise<void>;
}
//# sourceMappingURL=token.d.ts.map