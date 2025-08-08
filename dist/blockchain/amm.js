"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMM = void 0;
class AMM {
    constructor() {
        this.pools = new Map();
    }
    createPool(tokenA, tokenB, initialReserveA, initialReserveB, fee = 0.3) {
        const poolId = `pool_${tokenA}_${tokenB}_${Date.now()}`;
        const pool = {
            id: poolId,
            tokenA,
            tokenB,
            reserveA: initialReserveA,
            reserveB: initialReserveB,
            fee
        };
        this.pools.set(poolId, pool);
        return poolId;
    }
    swap(poolId, tokenIn, amountIn) {
        const pool = this.pools.get(poolId);
        if (!pool) {
            throw new Error('Liquidity pool does not exist');
        }
        let tokenOut;
        let reserveIn;
        let reserveOut;
        if (tokenIn === pool.tokenA) {
            tokenOut = pool.tokenB;
            reserveIn = pool.reserveA;
            reserveOut = pool.reserveB;
        }
        else if (tokenIn === pool.tokenB) {
            tokenOut = pool.tokenA;
            reserveIn = pool.reserveB;
            reserveOut = pool.reserveA;
        }
        else {
            throw new Error('Token not in liquidity pool');
        }
        const feeMultiplier = 1 - (pool.fee / 100);
        const amountInWithFee = amountIn * feeMultiplier;
        const amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);
        if (tokenIn === pool.tokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        }
        else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }
        this.pools.set(poolId, pool);
        return { tokenOut, amountOut };
    }
    addLiquidity(poolId, tokenA, amountA, tokenB, amountB) {
        const pool = this.pools.get(poolId);
        if (!pool) {
            throw new Error('Liquidity pool does not exist');
        }
        if ((tokenA !== pool.tokenA || tokenB !== pool.tokenB) &&
            (tokenA !== pool.tokenB || tokenB !== pool.tokenA)) {
            throw new Error('Tokens do not match the liquidity pool');
        }
        if (tokenA === pool.tokenA) {
            pool.reserveA += amountA;
            pool.reserveB += amountB;
        }
        else {
            pool.reserveA += amountB;
            pool.reserveB += amountA;
        }
        this.pools.set(poolId, pool);
    }
    getPoolInfo(poolId) {
        return this.pools.get(poolId);
    }
    getAllPools() {
        return Array.from(this.pools.values());
    }
}
exports.AMM = AMM;
//# sourceMappingURL=amm.js.map