import {
  type Address,
  bytesToHex,
  encodeAbiParameters,
  getAddress,
  getContractAddress,
  type Hex,
  hexToBytes,
  keccak256,
} from 'viem';
import { generatePrivateKey } from 'viem/accounts';

export type TaxPredictionInput = {
  caller: Address;
  tokenDeployer: Address;
  initCodeHash: Hex;
};

export type TaxVanityResult = { creatorSalt: Hex; token: Address };

export function scopeTaxSalt(caller: Address, creatorSalt: Hex): Hex {
  return keccak256(
    encodeAbiParameters([{ type: 'address' }, { type: 'bytes32' }], [caller, creatorSalt])
  );
}

export function predictTaxTokenAddress(input: TaxPredictionInput & { creatorSalt: Hex }): Address {
  return getContractAddress({
    opcode: 'CREATE2',
    from: input.tokenDeployer,
    salt: scopeTaxSalt(input.caller, input.creatorSalt),
    bytecodeHash: input.initCodeHash,
  });
}

export function freshTaxSalt(): Hex {
  // Node 18 has no global Web Crypto without a flag. viem's random source falls back to node:crypto there.
  if (!globalThis.crypto?.getRandomValues) return generatePrivateKey();
  return bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(32)));
}

/** Each search starts from a fresh cryptographic salt. */
export async function mineTaxSalt(
  input: TaxPredictionInput,
  options: { maxTries?: number; signal?: AbortSignal } = {}
): Promise<TaxVanityResult> {
  const maxTries = options.maxTries ?? 1_000_000;
  if (!Number.isSafeInteger(maxTries) || maxTries < 1 || maxTries > 1_000_000) {
    throw new Error('v5 salt maxTries must be an integer from 1 to 1000000.');
  }
  const scope = hexToBytes(
    encodeAbiParameters([{ type: 'address' }, { type: 'bytes32' }], [input.caller, freshTaxSalt()])
  );
  const preimage = new Uint8Array(85);
  preimage[0] = 255;
  preimage.set(hexToBytes(input.tokenDeployer), 1);
  const initCodeHash = hexToBytes(input.initCodeHash);
  if (initCodeHash.length !== 32) throw new Error('Token init code hash must contain 32 bytes.');
  preimage.set(initCodeHash, 53);
  for (let attempt = 0; attempt < maxTries; attempt++) {
    if (attempt % 2048 === 0) {
      options.signal?.throwIfAborted();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    preimage.set(keccak256(scope, 'bytes'), 21);
    const hash = keccak256(preimage, 'bytes');
    if (hash[30] === 0xcc && hash[31] === 0xcc) {
      return {
        creatorSalt: bytesToHex(scope.subarray(32)),
        token: getAddress(bytesToHex(hash.subarray(12))),
      };
    }
    for (let index = 63; index >= 32; index--) {
      scope[index] = (scope[index] + 1) & 255;
      if (scope[index] !== 0) break;
    }
  }
  throw new Error(
    `No cccc token address found after ${maxTries} local attempts. Start a new search.`
  );
}
