import type { Account, Address, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { TaxRWAERC20LaunchpadFactory_abi } from '../../abi/v5/TaxRWAERC20LaunchpadFactory.js';
import { ClankerError } from '../../utils/errors.js';
import { Clanker as ClankerV4 } from '../../v4/index.js';
import { TAX_ADDRESSES, taxAddressFor } from '../../v5/addresses.js';
import { Clanker as ClankerV5 } from '../../v5/index.js';
import { printSuccess } from './output.js';

export function formatClankerError(error: Error): string {
  // A viem message continues with the whole call data after its first paragraph.
  const underlying =
    error instanceof ClankerError ? error.error?.message.split('\n\n')[0] : undefined;
  if (!underlying || underlying === error.message) return error.message;
  const short = underlying.length > 300 ? `${underlying.slice(0, 300)}...` : underlying;
  return `${error.message}\n\n  Cause: ${short}`;
}

/** A simulation returns its failure as `error`, so a result needs this check before success output. */
export function printSimulation(
  message: string,
  jsonMode: boolean,
  simulation: { error?: Error; result?: unknown }
) {
  if (simulation.error) {
    throw new Error(`Simulation failed: ${formatClankerError(simulation.error)}`);
  }
  printSuccess(
    message,
    jsonMode,
    simulation.result === undefined ? undefined : { result: simulation.result }
  );
}

export async function clankerForToken({
  token,
  publicClient,
  wallet,
  v5 = false,
}: {
  token: Address;
  publicClient: PublicClient;
  wallet?: WalletClient<Transport, Chain, Account>;
  v5?: boolean;
}) {
  const chainId = publicClient.chain!.id;
  const hasV5 = Boolean(TAX_ADDRESSES[chainId]);
  if (v5 && !hasV5) throw new Error(`V5 is not available on chain ${chainId}.`);
  const config = { publicClient, wallet };
  if (!hasV5) return new ClankerV4(config);
  if (
    v5 ||
    (await publicClient.readContract({
      address: taxAddressFor(chainId, 'factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'isLaunchToken',
      args: [token],
    }))
  ) {
    return new ClankerV5(config);
  }
  return new ClankerV4(config);
}
