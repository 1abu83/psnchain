"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignature = exports.signTransaction = exports.validateAddress = exports.generateAddressFromPublicKey = exports.createWallet = void 0;
const elliptic_1 = __importDefault(require("elliptic"));
const sha256_1 = __importDefault(require("sha256"));
const ec = new elliptic_1.default.ec('secp256k1');
const createWallet = () => {
    const keyPair = ec.genKeyPair();
    const publicKey = keyPair.getPublic('hex');
    const privateKey = keyPair.getPrivate('hex');
    const address = (0, exports.generateAddressFromPublicKey)(publicKey);
    return {
        publicKey,
        privateKey,
        address,
    };
};
exports.createWallet = createWallet;
const generateAddressFromPublicKey = (publicKey) => {
    const publicKeyHash = (0, sha256_1.default)(publicKey);
    const address = publicKeyHash.substring(publicKeyHash.length - 40);
    return address;
};
exports.generateAddressFromPublicKey = generateAddressFromPublicKey;
const validateAddress = (address) => {
    const hexRegex = /^[0-9a-fA-F]{40}$/;
    return hexRegex.test(address);
};
exports.validateAddress = validateAddress;
const signTransaction = (transaction, privateKey) => {
    const transactionString = JSON.stringify(transaction);
    const transactionHash = (0, sha256_1.default)(transactionString);
    const keyPair = ec.keyFromPrivate(privateKey, 'hex');
    const signature = keyPair.sign(transactionHash);
    return signature.toDER('hex');
};
exports.signTransaction = signTransaction;
const verifySignature = (transaction, signature, publicKey) => {
    const transactionString = JSON.stringify(transaction);
    const transactionHash = (0, sha256_1.default)(transactionString);
    const keyPair = ec.keyFromPublic(publicKey, 'hex');
    return keyPair.verify(transactionHash, signature);
};
exports.verifySignature = verifySignature;
//# sourceMappingURL=wallet.js.map