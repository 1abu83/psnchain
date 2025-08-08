export interface TokenInfo {
    id: string;
    name: string;
    symbol: string;
    totalSupply: number;
    decimals: number;
    creator: string;
}
export interface TokenBalance {
    tokenId: string;
    balance: number;
    address: string;
}
export declare class TokenManager {
    private tokens;
    private balances;
    constructor();
    createToken(name: string, symbol: string, totalSupply: number, decimals: number, creator: string): string;
    transferToken(tokenId: string, fromAddress: string, toAddress: string, amount: number): void;
    getBalance(address: string, tokenId: string): number;
    getAllTokens(): TokenInfo[];
    getTokenInfo(tokenId: string): TokenInfo | undefined;
}
//# sourceMappingURL=token.d.ts.map