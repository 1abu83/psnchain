export interface Transaction {
    sender: string;
    recipient: string;
    amount: number;
    timestamp: number;
    signature?: string;
}
export declare class Block {
    index: number;
    timestamp: number;
    transactions: Transaction[];
    previousHash: string;
    nonce: number;
    hash: string;
    constructor(index: number, timestamp: number, transactions: Transaction[], previousHash?: string);
    calculateHash(): string;
    mineBlock(difficulty: number): void;
}
//# sourceMappingURL=block.d.ts.map