import { Blockchain } from './blockchain/blockchain';
import { TokenManager } from './blockchain/token';
import { AMM } from './blockchain/amm';
import { createWallet, signTransaction } from './utils/wallet';
declare const blockchain: Blockchain;
declare const tokenManager: TokenManager;
declare const amm: AMM;
export { blockchain, tokenManager, amm, createWallet, signTransaction };
//# sourceMappingURL=index.d.ts.map