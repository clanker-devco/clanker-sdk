import type { Abi, ExtractAbiErrorNames } from 'abitype';
import { BaseError, ContractFunctionRevertedError, InsufficientFundsError } from 'viem';
import type { ClankerContract } from './clanker-contracts.js';

// biome-ignore lint/suspicious/noExplicitAny: ClankerContract is a union of typeof ABIs that needs type coercion
type ClankerErrorName = ExtractAbiErrorNames<ClankerContract extends Abi ? ClankerContract : any>;

type ClankerErrorType = 'caller' | 'state' | 'unknown';
type ClankerErrorData = {
  type: ClankerErrorType;
  label: string;
  rawName: string;
};

export class ClankerError extends Error {
  static unknown(e: Error, name?: string) {
    return new ClankerError(e, {
      type: 'unknown',
      label: 'Something went wrong',
      rawName: name || 'unknown',
    });
  }

  constructor(
    readonly error: Error,
    readonly data: ClankerErrorData
  ) {
    super(data.label);
  }
}

const SignatureToError: Record<`0x${string}`, ClankerErrorData> = {
  '0x7e5ba1ad': {
    type: 'state',
    label: 'Hook not enabled.',
    rawName: 'HookNotEnabled',
  },
  '0x8b063d73': {
    type: 'state',
    label: 'Too little received (likely dev buy).',
    rawName: 'V4TooLittleReceived',
  },
};

const ErrorMapping: Partial<Record<ClankerErrorName, ClankerErrorData>> = {
  NoFeesToClaim: {
    type: 'state',
    label: 'No fees to claim',
    rawName: 'NoFeesToClaim',
  },
  InvalidVaultConfiguration: {
    type: 'caller',
    label: 'Invalid vault configuration',
    rawName: 'InvalidVault',
  },
  BaseFeeTooLow: {
    type: 'caller',
    label: 'Base fee is set too low',
    rawName: 'BaseFeeTooLow',
  },
};

export const understandErrorCode = (e: `0x${string}`): ClankerError => {
  return new ClankerError(
    new Error(e),
    SignatureToError[e] || {
      type: 'caller',
      label: 'Contract error.',
      rawName: `Unknown hex: ${e}`,
    }
  );
};

export const understandError = (e: unknown): ClankerError => {
  if (!(e instanceof Error)) return ClankerError.unknown(new Error(`${e}`));
  if (!(e instanceof BaseError)) return ClankerError.unknown(e);

  const revertError = e.walk((e) => e instanceof ContractFunctionRevertedError);
  if (revertError instanceof ContractFunctionRevertedError) {
    const errorName = revertError.data?.errorName ?? '';

    const mapping = ErrorMapping[errorName as ClankerErrorName];
    if (mapping) return new ClankerError(e, mapping);

    const signatureToError = SignatureToError[revertError.signature || '0x'];
    if (signatureToError) return new ClankerError(e, signatureToError);

    return ClankerError.unknown(e, errorName);
  }

  const fundsError = e.walk((e) => e instanceof InsufficientFundsError);
  if (fundsError instanceof InsufficientFundsError) {
    return new ClankerError(fundsError, {
      type: 'caller',
      label: 'Insufficient funds.',
      rawName: 'InsufficientFundsError',
    });
  }

  return ClankerError.unknown(e);
};
