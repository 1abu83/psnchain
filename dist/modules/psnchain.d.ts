import { BaseModule, ModuleMetadata } from 'lisk-sdk';
import { TransferAsset } from './assets/transfer';
export declare class PSNChainModule extends BaseModule {
    name: string;
    id: number;
    accountSchema: {
        type: string;
        properties: {
            balance: {
                fieldNumber: number;
                dataType: string;
            };
        };
        default: {
            balance: bigint;
        };
    };
    init(args: ModuleMetadata): Promise<void>;
    get genesisConfig(): {
        communityIdentifier: string;
        totalAmount: bigint;
    };
    get actions(): {};
    get events(): any[];
    get reducers(): {};
    get transactionAssets(): TransferAsset[];
    beforeTransactionsExecute(): Promise<void>;
    afterTransactionsExecute(): Promise<void>;
    afterBlockExecute(): Promise<void>;
}
//# sourceMappingURL=psnchain.d.ts.map