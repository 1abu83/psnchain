class AMM {
  constructor() {
    this.pools = new Map();
  }

  createPool(tokenA, tokenB, initialReserveA, initialReserveB, fee = 0.3) {
    // Generate unique pool ID
    const poolId = `pool_${tokenA}_${tokenB}_${Date.now()}`;
    
    // Create liquidity pool
    const pool = {
      id: poolId,
      tokenA,
      tokenB,
      reserveA: initialReserveA,
      reserveB: initialReserveB,
      fee
    };
    
    // Add pool to registry
    this.pools.set(poolId, pool);
    
    return poolId;
  }

  swap(poolId, tokenIn, amountIn) {
    // Check if pool exists
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error('Liquidity pool does not exist');
    }
    
    // Determine which token is being swapped in
    let tokenOut;
    let reserveIn;
    let reserveOut;
    
    if (tokenIn === pool.tokenA) {
      tokenOut = pool.tokenB;
      reserveIn = pool.reserveA;
      reserveOut = pool.reserveB;
    } else if (tokenIn === pool.tokenB) {
      tokenOut = pool.tokenA;
      reserveIn = pool.reserveB;
      reserveOut = pool.reserveA;
    } else {
      throw new Error('Token not in liquidity pool');
    }
    
    // Calculate output amount with fee
    const feeMultiplier = 1 - (pool.fee / 100);
    const amountInWithFee = amountIn * feeMultiplier;
    
    // Constant product formula: (x + Δx) * (y - Δy) = x * y
    // Solving for Δy: Δy = (y * Δx) / (x + Δx)
    const amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);
    
    // Update reserves
    if (tokenIn === pool.tokenA) {
      pool.reserveA += amountIn;
      pool.reserveB -= amountOut;
    } else {
      pool.reserveB += amountIn;
      pool.reserveA -= amountOut;
    }
    
    // Update pool in registry
    this.pools.set(poolId, pool);
    
    return { tokenOut, amountOut };
  }

  addLiquidity(poolId, tokenA, amountA, tokenB, amountB) {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error('Liquidity pool does not exist');
    }
    
    // Check if tokens match the pool
    if ((tokenA !== pool.tokenA || tokenB !== pool.tokenB) && 
        (tokenA !== pool.tokenB || tokenB !== pool.tokenA)) {
      throw new Error('Tokens do not match the liquidity pool');
    }
    
    // Update reserves
    if (tokenA === pool.tokenA) {
      pool.reserveA += amountA;
      pool.reserveB += amountB;
    } else {
      pool.reserveA += amountB;
      pool.reserveB += amountA;
    }
    
    // Update pool in registry
    this.pools.set(poolId, pool);
  }

  getPoolInfo(poolId) {
    return this.pools.get(poolId);
  }

  getAllPools() {
    return Array.from(this.pools.values());
  }
}

module.exports = {
  AMM
};