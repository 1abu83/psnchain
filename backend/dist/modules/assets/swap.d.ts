import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
interface SwapAssetParams {
    readonly poolId: Buffer;
    readonly tokenInId: Buffer;
    readonly tokenInAmount: bigint;
    readonly minTokenOutAmount: bigint;
}
export declare class SwapAsset extends BaseAsset {
    name: string;
    id: number;
    schema: {
        $id: string;
        type: string;
        required: string[];
        properties: {
            poolId: {
                dataType: string;
                fieldNumber: number;
                minLength: number;
                maxLength: number;
            };
            tokenInId: {
                dataType: string;
                fieldNumber: number;
                minLength: number;
                maxLength: number;
            };
            tokenInAmount: {
                dataType: string;
                fieldNumber: number;
            };
            minTokenOutAmount: {
                dataType: string;
                fieldNumber: number;
            };
        };
    };
    validate({ asset }: ValidateAssetContext<SwapAssetParams>): void;
    apply({ asset, senderAddress, stateStore, }: ApplyAssetContext<SwapAssetParams>): Promise<void>;
}
export {};
//# sourceMappingURL=swap.d.ts.map