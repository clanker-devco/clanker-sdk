import { type Address } from 'viem';

export interface IClankerExtension {
  /**
   * The address of the extension contract
   */
  readonly address: Address;

  /**
   * The name of the extension
   */
  readonly name: string;

  /**
   * The description of the extension
   */
  readonly description: string;

  /**
   * The maximum percentage of token supply that can be allocated to this extension
   */
  readonly maxAllocationPercentage: number;

  /**
   * Whether this extension can be used multiple times in a single deployment
   */
  readonly allowMultiple: boolean;

  /**
   * Encode the extension data for deployment
   * @param data The extension-specific data
   * @returns The encoded extension data
   */
  encodeExtensionData(data: unknown): `0x${string}`;

  /**
   * Validate the extension data
   * @param data The extension-specific data
   * @returns Whether the data is valid
   */
  validateExtensionData(data: unknown): boolean;
}
