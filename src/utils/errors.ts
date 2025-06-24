import type { ExtractAbiErrorNames } from 'abitype';
import { BaseError, ContractFunctionRevertedError, InsufficientFundsError } from 'viem';
import type { ClankerContract } from './clanker-contracts.js';

type ClankerErrorName = ExtractAbiErrorNames<ClankerContract>;

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

const ErrorMapping: Partial<Record<ClankerErrorName, ClankerErrorData>> = {
  NoFeesToClaim: {
    type: 'state',
    label: 'No fees to claim',
    rawName: 'NoFeesToClaim',
  },
};

export const understandError = (e: unknown): ClankerError => {
  if (!(e instanceof Error)) return ClankerError.unknown(new Error(`${e}`));
  if (!(e instanceof BaseError)) return ClankerError.unknown(e);

  const revertError = e.walk((e) => e instanceof ContractFunctionRevertedError);
  if (revertError instanceof ContractFunctionRevertedError) {
    const errorName = revertError.data?.errorName ?? '';

    const mapping = ErrorMapping[errorName as ClankerErrorName];
    if (!mapping) return ClankerError.unknown(e, errorName);

    return new ClankerError(e, mapping);
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
