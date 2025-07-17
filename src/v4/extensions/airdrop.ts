import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import type { MerkleTree } from '@openzeppelin/merkle-tree/dist/merkletree.js';
import {
  type Account,
  type Chain,
  isAddressEqual,
  stringify,
  type WriteContractParameters,
} from 'viem';
import * as z from 'zod/v4';
import { ClankerAirdrop_v4_abi } from '../../abi/v4/ClankerAirdrop.js';
import {
  type Chain as ClankerChain,
  type ClankerDeployment,
  clankerConfigFor,
  type RelatedV4,
} from '../../utils/clankers.js';
import { writeClankerContract } from '../../utils/write-clanker-contracts.js';
import { addressSchema } from '../../utils/zod-onchain.js';
import type { Clanker } from '../index.js';

const AirdropEntrySchema = z.array(
  z.object({
    account: addressSchema,
    amount: z.number(),
  })
);

export type AirdropEntry = z.input<typeof AirdropEntrySchema>[0];
type MerkleEntry = [account: `0x${string}`, amount: string];

export class Airdrop {
  for(_entries: AirdropEntry[], options: { tokenDecimals: bigint } = { tokenDecimals: 18n }) {
    const entries = AirdropEntrySchema.parse(_entries);

    const values: MerkleEntry[] = entries.map(({ account, amount }) => [
      account,
      (BigInt(amount) * 10n ** options.tokenDecimals).toString(),
    ]);

    const total = entries.reduce((agg, { amount }) => amount + agg, 0);

    const tree = StandardMerkleTree.of<MerkleEntry>(values, ['address', 'uint256']);

    tree.validate();

    return {
      tree,
      root: tree.root as `0x${string}`,
      total,
    };
  }

  async register(token: `0x${string}`, tree: MerkleTree<MerkleEntry>) {
    const { success } = await fetch('www.clanker.world/api/airdrops', {
      method: 'POST',
      body: stringify({
        tokenAddress: token,
        merkleRoot: tree.root,
        tree: tree.dump(),
      }),
    }).then((r) => r.json() as Promise<{ success: boolean }>);

    return success;
  }

  getProofs(
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

  getClaimTransaction({
    token,
    recipient,
    amount,
    proof,
    chain,
    account,
  }: {
    account: Account;
    chain: Chain;
    token: `0x${string}`;
    recipient: `0x${string}`;
    amount: bigint;
    proof: `0x${string}`[];
  }): WriteContractParameters<typeof ClankerAirdrop_v4_abi, 'claim'> {
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);

    return {
      account,
      address: config.related.airdrop,
      chain,
      abi: ClankerAirdrop_v4_abi,
      functionName: 'claim',
      args: [token, recipient, amount, proof],
    };
  }

  //   "AirdropNotUnlocked()": "b8d22dea",
  //   "InvalidProof()": "09bde339",
  //   "ZeroToClaim()": "0001549d"
  claim(data: {
    clanker: Clanker;
    token: `0x${string}`;
    recipient: `0x${string}`;
    amount: bigint;
    proof: `0x${string}`[];
  }) {
    if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
    if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');
    const tx = this.getClaimTransaction(data);

    return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
  }
}
