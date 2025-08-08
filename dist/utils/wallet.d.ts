export interface Wallet {
    readonly publicKey: string;
    readonly privateKey: string;
    readonly address: string;
}
export declare const createWallet: () => Wallet;
export declare const generateAddressFromPublicKey: (publicKey: string) => string;
export declare const validateAddress: (address: string) => boolean;
export declare const signTransaction: (transaction: any, privateKey: string) => string;
export declare const verifySignature: (transaction: any, signature: string, publicKey: string) => boolean;
//# sourceMappingURL=wallet.d.ts.map