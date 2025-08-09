import { Block, Transaction } from './block';
export declare class Blockchain {
    chain: Block[];
    difficulty: number;
    pendingTransactions: Transaction[];
    miningReward: number;
    constructor();
    createGenesisBlock(): Block;
    getLatestBlock(): Block;
    minePendingTransactions(miningRewardAddress: string): void;
    createTransaction(transaction: Transaction): void;
    getBalanceOfAddress(address: string): number;
    isChainValid(): boolean;
}
//# sourceMappingURL=blockchain.d.ts.map