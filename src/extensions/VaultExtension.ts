import { type Address, encodeAbiParameters } from "viem";
import { IClankerExtension } from "./IClankerExtension.js";
import { CLANKER_VAULT_ADDRESS } from "../constants.js";

export interface VaultExtensionData {
  admin: Address;
  lockupDuration: number;
  vestingDuration: number;
}

export class VaultExtension implements IClankerExtension {
  readonly address = CLANKER_VAULT_ADDRESS;
  readonly name = "Vault";
  readonly description =
    "Vaults a portion of the token supply with optional linear vesting";
  readonly maxAllocationPercentage = 90;
  readonly allowMultiple = false;

  encodeExtensionData(data: VaultExtensionData): `0x${string}` {
    if (!this.validateExtensionData(data)) {
      throw new Error("Invalid vault extension data");
    }

    return encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }, { type: "uint256" }],
      [data.admin, BigInt(data.lockupDuration), BigInt(data.vestingDuration)],
    );
  }

  validateExtensionData(data: unknown): boolean {
    if (!data || typeof data !== "object") return false;
    const vaultData = data as VaultExtensionData;

    return (
      typeof vaultData.admin === "string" &&
      typeof vaultData.lockupDuration === "number" &&
      typeof vaultData.vestingDuration === "number" &&
      vaultData.lockupDuration >= 0 &&
      vaultData.vestingDuration >= 0
    );
  }
}
