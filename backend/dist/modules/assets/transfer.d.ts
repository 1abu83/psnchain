import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
interface TransferAssetParams {
    readonly amount: bigint;
    readonly recipientAddress: Buffer;
    readonly data: string;
}
export declare class TransferAsset extends BaseAsset {
    name: string;
    id: number;
    schema: {
        $id: string;
        type: string;
        required: string[];
        properties: {
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
    validate({ asset }: ValidateAssetContext<TransferAssetParams>): void;
    apply({ asset, senderAddress, stateStore, }: ApplyAssetContext<TransferAssetParams>): Promise<void>;
}
export {};
//# sourceMappingURL=transfer.d.ts.map