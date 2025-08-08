"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapTokenCommand = void 0;
const index_1 = require("../index");
const swapTokenCommand = (options) => {
    try {
        if (!options.pool || !options['token-in'] || !options.amount || !options.from) {
            console.error('Missing required options: --pool, --token-in, --amount, --from');
            return;
        }
        const amount = parseFloat(options.amount);
        if (isNaN(amount) || amount <= 0) {
            console.error('Invalid amount. Must be a positive number.');
            return;
        }
        if (options.pool.length < 10) {
            console.error('Invalid pool ID format.');
            return;
        }
        if (options['token-in'].length < 5) {
            console.error('Invalid token ID format.');
            return;
        }
        if (options.from.length !== 40) {
            console.error('Invalid sender address format. Address must be 40 characters long.');
            return;
        }
        const result = index_1.amm.swap(options.pool, options['token-in'], amount);
        console.log('Token swap executed successfully!');
        console.log(`Pool ID: ${options.pool}`);
        console.log(`Token In: ${options['token-in']}`);
        console.log(`Amount In: ${amount}`);
        console.log(`Token Out: ${result.tokenOut}`);
        console.log(`Amount Out: ${result.amountOut}`);
    }
    catch (error) {
        console.error('Failed to swap tokens:', error);
    }
};
exports.swapTokenCommand = swapTokenCommand;
//# sourceMappingURL=swap.js.map