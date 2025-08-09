"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTokenCommand = void 0;
const index_1 = require("../index");
const sendTokenCommand = (options) => {
    try {
        if (!options.amount || !options.to || !options.from) {
            console.error('Missing required options: --amount, --to, --from');
            return;
        }
        const amount = parseFloat(options.amount);
        if (isNaN(amount) || amount <= 0) {
            console.error('Invalid amount. Must be a positive number.');
            return;
        }
        if (options.to.length !== 40) {
            console.error('Invalid recipient address format. Address must be 40 characters long.');
            return;
        }
        if (options.from.length !== 64) {
            console.error('Invalid private key format. Private key must be 64 characters long.');
            return;
        }
        const transaction = {
            sender: options.from,
            recipient: options.to,
            amount: amount,
            timestamp: Date.now()
        };
        const signature = (0, index_1.signTransaction)(transaction, options.from);
        transaction.signature = signature;
        index_1.blockchain.createTransaction(transaction);
        console.log('Transaction created successfully!');
        console.log(`Amount: ${amount} PSN`);
        console.log(`To: ${options.to}`);
        console.log(`From: ${options.from}`);
        console.log(`Signature: ${signature}`);
        console.log('\nTransaction added to pending transactions.');
        console.log('Mine a block to confirm the transaction.');
    }
    catch (error) {
        console.error('Failed to send token:', error);
    }
};
exports.sendTokenCommand = sendTokenCommand;
//# sourceMappingURL=transfer.js.map