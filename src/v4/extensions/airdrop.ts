import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import type { MerkleTree } from '@openzeppelin/merkle-tree/dist/merkletree.js';
import { isAddressEqual, stringify } from 'viem';
import * as z from 'zod/v4';
import { ClankerAirdrop_v4_abi } from '../../abi/v4/ClankerAirdrop.js';
import {
  type Chain as ClankerChain,
  type ClankerDeployment,
  clankerConfigFor,
  type RelatedV4,
} from '../../utils/clankers.js';
import {
  type ClankerTransactionConfig,
  writeClankerContract,
} from '../../utils/write-clanker-contracts.js';
import { addressSchema } from '../../utils/zod-onchain.js';
import type { Clanker } from '../index.js';

const AirdropEntrySchema = z.array(
  z.object({
    account: addressSchema,
    amount: z.number(),
  })
);

export type AirdropRecipient = z.input<typeof AirdropEntrySchema>[0];
type MerkleEntry = [account: `0x${string}`, amount: string];

/**
 * Create an airdrop for the recipients.
 *
 * @param recipients Recipients recieving airdrop.
 * @param options.tokenDecimals Custom token decimals.
 * @returns Tree to save offline and Airdrop data for the smart contract.
 */
export function createAirdrop(
  recipients: AirdropRecipient[],
  options: { tokenDecimals: bigint } = { tokenDecimals: 18n }
): { tree: MerkleTree<MerkleEntry>; airdrop: { merkleRoot: `0x${string}`; amount: number } } {
  const parsedEntries = AirdropEntrySchema.parse(recipients);

  const values: MerkleEntry[] = parsedEntries.map(({ account, amount }) => [
    account,
    (BigInt(amount) * 10n ** options.tokenDecimals).toString(),
  ]);

  const amount = parsedEntries.reduce((agg, { amount }) => amount + agg, 0);

  const tree = StandardMerkleTree.of<MerkleEntry>(values, ['address', 'uint256']);

  tree.validate();

  return {
    tree,
    airdrop: {
      merkleRoot: tree.root as `0x${string}`,
      amount,
    },
  };
}

/**
 * Register an airdrop merkle tree with the Clanker service.
 *
 * @dev Requires that the associated token is already deployed and indexed. The token
 * must also have the merkle root associated with it.
 *
 * @param token The token associated with the tree.
 * @param tree The tree to register.
 * @returns Success.
 */
export async function registerAirdrop(token: `0x${string}`, tree: MerkleTree<MerkleEntry>) {
  const { success } = await fetch('https://www.clanker.world/api/airdrops', {
    method: 'POST',
    body: stringify({
      tokenAddress: token,
      merkleRoot: tree.root,
      tree: tree.dump(),
    }),
  }).then((r) => r.json() as Promise<{ success: boolean }>);

  return success;
}

/**
 * Get all proofs for an account given a merkle tree.
 *
 * @param tree The tree to check.
 * @param account The account to check for.
 * @returns All proofs and their associated entries for claiming.
 */
export function getAirdropProofs(
  tree: MerkleTree<MerkleEntry>,
  account: `0x${string}`
): { proofs: { proof: `0x${string}`[]; entry: { account: `0x${string}`; amount: bigint } }[] } {
  const indices = [];
  for (const [i, entry] of tree.entries()) {
    if (!isAddressEqual(entry[0], account)) continue;

    indices.push({ i: i, entry });
  }
  if (indices.length === 0) return { proofs: [] };

  return {
    proofs: indices.map(({ i, entry }) => ({
      proof: tree.getProof(i) as `0x${string}`[],
      entry: {
        account: entry[0],
        amount: BigInt(entry[1]),
      },
    })),
  };
}

/**
 * Get all proofs for an account given a token that has a merkle tree associated with it. The token and tree must have been registered with the Clanker service.
 *
 * @param token The token with the airdrop.
 * @param account The account to check for.
 * @returns All proofs and their associated entries for claiming.
 */
export async function fetchAirdropProofs(
  token: `0x${string}`,
  account: `0x${string}`
): Promise<{
  proofs: { proof: `0x${string}`[]; entry: { account: `0x${string}`; amount: bigint } }[];
}> {
  return fetch(
    `https://www.clanker.world/api/airdrops/claim?tokenAddress=${token}&claimerAddress=${account}`
  ).then(
    (r) =>
      r.json() as Promise<{
        proofs: { proof: `0x${string}`[]; entry: { account: `0x${string}`; amount: bigint } }[];
      }>
  );
}

/**
 * Create a transaction to claim a specific airdrop for.
 *
 * @param token The token that did the airdrop
 * @param recipient The address recieving the airdrop
 * @param amount The amount registered in the airdrop. Note, this must be the exact registered amount.
 * @param proof Merkle proof for the address and amount (see `getProofs`)
 * @returns Arguments that can be used with a viem transaction.
 */
export function getClaimAirdropTransaction({
  token,
  recipient,
  amount,
  proof,
  chainId,
}: {
  chainId: ClankerChain;
  token: `0x${string}`;
  recipient: `0x${string}`;
  amount: bigint;
  proof: `0x${string}`[];
}): ClankerTransactionConfig<typeof ClankerAirdrop_v4_abi, 'claim'> {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config) throw new Error(`Clanker is not ready on ${chainId}`);

  return {
    chainId,
    address: config.related.airdrop,
    abi: ClankerAirdrop_v4_abi,
    functionName: 'claim',
    args: [token, recipient, amount, proof],
  };
}

/**
 * Claim an airdrop
 *
 * @param clanker Clanker object used for claiming
 * @param token The token that did the airdrop
 * @param recipient The address recieving the airdrop
 * @param amount The amount registered in the airdrop. Note, this must be the exact registered amount.
 * @param proof Merkle proof for the address and amount (see `getProofs`)
 * @returns Outcome of the transaction
 */
export function claimAirdrop(data: {
  clanker: Clanker;
  token: `0x${string}`;
  recipient: `0x${string}`;
  amount: bigint;
  proof: `0x${string}`[];
}) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');
  const tx = getClaimAirdropTransaction({
    chainId: data.clanker.wallet.chain.id as ClankerChain,
    ...data,
  });

  return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
}
