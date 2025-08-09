"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWalletCommand = void 0;
const wallet_1 = require("../utils/wallet");
const createWalletCommand = () => {
    try {
        const wallet = (0, wallet_1.createWallet)();
        console.log('Wallet created successfully!');
        console.log('==========================');
        console.log(`Address: ${wallet.address}`);
        console.log(`Public Key: ${wallet.publicKey}`);
        console.log(`Private Key: ${wallet.privateKey}`);
        console.log('');
        console.log('⚠️  WARNING: Keep your private key secure! Never share it with anyone.');
    }
    catch (error) {
        console.error('Failed to create wallet:', error);
    }
};
exports.createWalletCommand = createWalletCommand;
//# sourceMappingURL=wallet.js.map