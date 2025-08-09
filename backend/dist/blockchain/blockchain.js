"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blockchain = void 0;
const block_1 = require("./block");
const wallet_1 = require("../utils/wallet");
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    createGenesisBlock() {
        return new block_1.Block(0, Date.now(), [], '0');
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    minePendingTransactions(miningRewardAddress) {
        const block = new block_1.Block(this.chain.length, Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        this.pendingTransactions = [
            {
                sender: 'PSNCHAIN_MINING_REWARD',
                recipient: miningRewardAddress,
                amount: this.miningReward,
                timestamp: Date.now()
            }
        ];
    }
    createTransaction(transaction) {
        if (!transaction.sender || !transaction.recipient) {
            throw new Error('Transaction must include sender and recipient');
        }
        if (transaction.amount <= 0) {
            throw new Error('Transaction amount must be greater than 0');
        }
        if (transaction.sender !== 'PSNCHAIN_MINING_REWARD') {
            if (!transaction.signature) {
                throw new Error('Transaction must be signed');
            }
            const { signature, ...unsignedTransaction } = transaction;
            if (!(0, wallet_1.verifySignature)(unsignedTransaction, signature, transaction.sender)) {
                throw new Error('Invalid transaction signature');
            }
        }
        this.pendingTransactions.push(transaction);
    }
    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.sender === address) {
                    balance -= transaction.amount;
                }
                if (transaction.recipient === address) {
                    balance += transaction.amount;
                }
            }
        }
        return balance;
    }
    isChainValid() {
        const genesis = JSON.stringify(this.createGenesisBlock());
        const firstBlock = JSON.stringify(this.chain[0]);
        if (genesis !== firstBlock) {
            return false;
        }
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}
exports.Blockchain = Blockchain;
//# sourceMappingURL=blockchain.js.map