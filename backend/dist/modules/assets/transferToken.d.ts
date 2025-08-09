import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
interface TransferTokenAssetParams {
    readonly tokenId: Buffer;
    readonly amount: bigint;
    readonly recipientAddress: Buffer;
    readonly data: string;
}
export declare class TransferTokenAsset extends BaseAsset {
    name: string;
    id: number;
    schema: {
        $id: string;
        type: string;
        required: string[];
        properties: {
            tokenId: {
                dataType: string;
                fieldNumber: number;
                minLength: number;
                maxLength: number;
            };
            amount: {
                dataType: string;
                fieldNumber: number;
            };
            recipientAddress: {
                dataType: string;
                fieldNumber: number;
                minLength: number;
                maxLength: number;
            };
            data: {
                dataType: string;
                fieldNumber: number;
                minLength: number;
                maxLength: number;
            };
        };
    };
    validate({ asset }: ValidateAssetContext<TransferTokenAssetParams>): void;
    apply({ asset, senderAddress, stateStore, }: ApplyAssetContext<TransferTokenAssetParams>): Promise<void>;
}
export {};
//# sourceMappingURL=transferToken.d.ts.map