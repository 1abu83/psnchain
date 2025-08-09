import { BaseModule, ModuleMetadata } from 'lisk-sdk';
import { SwapAsset } from './assets/swap';
export declare class SwapModule extends BaseModule {
    name: string;
    id: number;
    accountSchema: {
        type: string;
        properties: {
            liquidityPools: {
                type: string;
                fieldNumber: number;
                items: {
                    type: string;
                    properties: {
                        poolId: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        tokenAReserve: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        tokenBReserve: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        lpTokenSupply: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        tokenAId: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        tokenBId: {
                            dataType: string;
                            fieldNumber: number;
                        };
                    };
                    required: string[];
                };
            };
        };
        default: {
            liquidityPools: any[];
        };
    };
    constructor();
    init(args: ModuleMetadata): Promise<void>;
    get genesisConfig(): {};
    get actions(): {
        getPoolInfo: (params: {
            poolId: Buffer;
        }) => Promise<{}>;
    };
    get events(): any[];
    get reducers(): {};
    get transactionAssets(): SwapAsset[];
    beforeTransactionsExecute(): Promise<void>;
    afterTransactionsExecute(): Promise<void>;
    afterBlockExecute(): Promise<void>;
}
//# sourceMappingURL=swap.d.ts.map