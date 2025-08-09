import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
interface CreateTokenAssetParams {
    readonly name: string;
    readonly symbol: string;
    readonly totalSupply: bigint;
    readonly decimals: number;
}
export declare class CreateTokenAsset extends BaseAsset {
    name: string;
    id: number;
    schema: {
        $id: string;
        type: string;
        required: string[];
        properties: {
            name: {
                dataType: string;
                fieldNumber: number;
                minLength: number;
                maxLength: number;
            };
            symbol: {
                dataType: string;
                fieldNumber: number;
                minLength: number;
                maxLength: number;
            };
            totalSupply: {
                dataType: string;
                fieldNumber: number;
            };
            decimals: {
                dataType: string;
                fieldNumber: number;
            };
        };
    };
    validate({ asset }: ValidateAssetContext<CreateTokenAssetParams>): void;
    apply({ asset, senderAddress, stateStore, }: ApplyAssetContext<CreateTokenAssetParams>): Promise<void>;
}
export {};
//# sourceMappingURL=createToken.d.ts.map