export interface LiquidityPool {
    id: string;
    tokenA: string;
    tokenB: string;
    reserveA: number;
    reserveB: number;
    fee: number;
}
export declare class AMM {
    private pools;
    constructor();
    createPool(tokenA: string, tokenB: string, initialReserveA: number, initialReserveB: number, fee?: number): string;
    swap(poolId: string, tokenIn: string, amountIn: number): {
        tokenOut: string;
        amountOut: number;
    };
    addLiquidity(poolId: string, tokenA: string, amountA: number, tokenB: string, amountB: number): void;
    getPoolInfo(poolId: string): LiquidityPool | undefined;
    getAllPools(): LiquidityPool[];
}
//# sourceMappingURL=amm.d.ts.map