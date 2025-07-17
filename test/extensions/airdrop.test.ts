import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, type Log, type PublicClient, parseEventLogs } from 'viem';
import { simulateBlocks } from 'viem/actions';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import { ClankerAirdrop_v4_abi } from '../../src/abi/v4/ClankerAirdrop.js';
import { clankerTokenV4Converter } from '../../src/config/clankerTokenV4.js';
import { Airdrop } from '../../src/v4/extensions/airdrop.js';

describe('airdrop', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;

  const airdrop = new Airdrop();

  test('claim', async () => {
    const {
      tree,
      total,
      root: merkleRoot,
    } = airdrop.for([
      { account: '0x0000000000000000000000000000000000000001', amount: 200_000_000 },
      { account: '0x0000000000000000000000000000000000000002', amount: 50_000_000 },
    ]);

    const tx = await clankerTokenV4Converter({
      name: 'Airdrop Test Token',
      symbol: 'AIRDROP',
      tokenAdmin: admin.address,
      chainId: base.id,
      airdrop: {
        merkleRoot,
        lockupDuration: 86_400, // 1 day
        vestingDuration: 0,
        amount: total,
      },
      vanity: true,
    });
    if (!tx.expectedAddress) throw new Error('Expected "expected address".');

    const { proofs: proofs1 } = airdrop.getProofs(
      tree,
      '0x0000000000000000000000000000000000000001'
    );
    const proof1 = proofs1[0];
    if (!proof1) throw new Error('Expected proofs');

    const claim1Tx = airdrop.getClaimTransaction({
      token: tx.expectedAddress,
      recipient: proof1.entry.account,
      amount: proof1.entry.amount,
      proof: proof1.proof,
      chainId: base.id,
    });

    const { proofs: proofs2 } = airdrop.getProofs(
      tree,
      '0x0000000000000000000000000000000000000002'
    );
    const proof2 = proofs2[0];
    if (!proof2) throw new Error('Expected proofs');

    const claim2Tx = airdrop.getClaimTransaction({
      token: tx.expectedAddress,
      recipient: proof2.entry.account,
      amount: proof2.entry.amount,
      proof: proof2.proof,
      chainId: base.id,
    });

    const [, claimAirdrop1Block, claimAirdrop2Block] = await simulateBlocks(publicClient, {
      blocks: [
        {
          blockOverrides: { number: 32960872n, time: 1752712528n },
          calls: [{ to: tx.address, ...tx }],
        },
        {
          blockOverrides: { number: 32960873n, time: 1752712528n + 86_400n },
          calls: [{ to: claim1Tx.address, ...claim1Tx }],
        },
        {
          blockOverrides: { number: 32960873n, time: 1752712528n + 86_401n },
          calls: [{ to: claim2Tx.address, ...claim2Tx }],
        },
      ],
    });

    const [claimAirdrop1Tx] = claimAirdrop1Block.calls;
    const claim1Log = parseEventLogs({
      abi: ClankerAirdrop_v4_abi,
      eventName: 'AirdropClaimed',
      logs: claimAirdrop1Tx.logs as Log[],
    })[0];

    expect(claim1Log.args.token).toEqual(tx.expectedAddress);
    expect(claim1Log.args.user).toEqual('0x0000000000000000000000000000000000000001');
    expect(claim1Log.args.totalUserAmountClaimed).toEqual(200000000000000000000000000n);
    expect(claim1Log.args.userAmountStillLocked).toEqual(0n);

    const [claimAirdrop2Tx] = claimAirdrop2Block.calls;
    const claim2Log = parseEventLogs({
      abi: ClankerAirdrop_v4_abi,
      eventName: 'AirdropClaimed',
      logs: claimAirdrop2Tx.logs as Log[],
    })[0];

    expect(claim2Log.args.token).toEqual(tx.expectedAddress);
    expect(claim2Log.args.user).toEqual('0x0000000000000000000000000000000000000002');
    expect(claim2Log.args.totalUserAmountClaimed).toEqual(50000000000000000000000000n);
    expect(claim2Log.args.userAmountStillLocked).toEqual(0n);
  });

  test('claim vesting', async () => {
    const {
      tree,
      total,
      root: merkleRoot,
    } = airdrop.for([
      { account: '0x0000000000000000000000000000000000000001', amount: 200_000_000 },
      { account: '0x0000000000000000000000000000000000000002', amount: 50_000_000 },
    ]);

    const tx = await clankerTokenV4Converter({
      name: 'Airdrop Test Token',
      symbol: 'AIRDROP',
      tokenAdmin: admin.address,
      chainId: base.id,
      airdrop: {
        merkleRoot,
        lockupDuration: 86_400, // 1 day
        vestingDuration: 86_400,
        amount: total,
      },
      vanity: true,
    });
    if (!tx.expectedAddress) throw new Error('Expected "expected address".');

    const { proofs: proofs1 } = airdrop.getProofs(
      tree,
      '0x0000000000000000000000000000000000000001'
    );
    const proof1 = proofs1[0];
    if (!proof1) throw new Error('Expected proofs');

    const claim1Tx = airdrop.getClaimTransaction({
      token: tx.expectedAddress,
      recipient: proof1.entry.account,
      amount: proof1.entry.amount,
      proof: proof1.proof,
      chainId: base.id,
    });

    const { proofs: proofs2 } = airdrop.getProofs(
      tree,
      '0x0000000000000000000000000000000000000002'
    );
    const proof2 = proofs2[0];
    if (!proof2) throw new Error('Expected proofs');

    const claim2Tx = airdrop.getClaimTransaction({
      token: tx.expectedAddress,
      recipient: proof2.entry.account,
      amount: proof2.entry.amount,
      proof: proof2.proof,
      chainId: base.id,
    });

    const [
      ,
      claimAirdrop1Block,
      claimAirdrop2Block,
      claimAirdrop1FullBlock,
      claimAirdrop2FullBlock,
    ] = await simulateBlocks(publicClient, {
      blocks: [
        {
          blockOverrides: { number: 32960872n, time: 1752712528n },
          calls: [{ to: tx.address, ...tx }],
        },
        {
          blockOverrides: { number: 32960873n, time: 1752712528n + 86_400n + 43_200n },
          calls: [{ to: claim1Tx.address, ...claim1Tx }],
        },
        {
          blockOverrides: { number: 32960873n, time: 1752712528n + 86_400n + 43_200n },
          calls: [{ to: claim2Tx.address, ...claim2Tx }],
        },
        {
          blockOverrides: { number: 32960874n, time: 1752712528n + 86_400n + 86_400n },
          calls: [{ to: claim1Tx.address, ...claim1Tx }],
        },
        {
          blockOverrides: { number: 32960875n, time: 1752712528n + 86_400n + 86_400n },
          calls: [{ to: claim2Tx.address, ...claim2Tx }],
        },
      ],
    });

    // console.log(claimAirdrop1Block);

    const [claimAirdrop1Tx] = claimAirdrop1Block.calls;
    const claim1Log = parseEventLogs({
      abi: ClankerAirdrop_v4_abi,
      eventName: 'AirdropClaimed',
      logs: claimAirdrop1Tx.logs as Log[],
    })[0];

    expect(claim1Log.args.token).toEqual(tx.expectedAddress);
    expect(claim1Log.args.user).toEqual('0x0000000000000000000000000000000000000001');
    expect(claim1Log.args.totalUserAmountClaimed).toEqual(100000000000000000000000000n);
    expect(claim1Log.args.userAmountStillLocked).toEqual(100000000000000000000000000n);

    const [claimAirdrop2Tx] = claimAirdrop2Block.calls;
    const claim2Log = parseEventLogs({
      abi: ClankerAirdrop_v4_abi,
      eventName: 'AirdropClaimed',
      logs: claimAirdrop2Tx.logs as Log[],
    })[0];

    expect(claim2Log.args.token).toEqual(tx.expectedAddress);
    expect(claim2Log.args.user).toEqual('0x0000000000000000000000000000000000000002');
    expect(claim2Log.args.totalUserAmountClaimed).toEqual(25000000000000000000000000n);
    expect(claim2Log.args.userAmountStillLocked).toEqual(25000000000000000000000000n);

    const [claimAirdrop1FullTx] = claimAirdrop1FullBlock.calls;
    const claim1FullLog = parseEventLogs({
      abi: ClankerAirdrop_v4_abi,
      eventName: 'AirdropClaimed',
      logs: claimAirdrop1FullTx.logs as Log[],
    })[0];

    expect(claim1FullLog.args.token).toEqual(tx.expectedAddress);
    expect(claim1FullLog.args.user).toEqual('0x0000000000000000000000000000000000000001');
    expect(claim1FullLog.args.totalUserAmountClaimed).toEqual(200000000000000000000000000n);
    expect(claim1FullLog.args.userAmountStillLocked).toEqual(0n);

    const [claimAirdrop2FullTx] = claimAirdrop2FullBlock.calls;
    const claim2FullLog = parseEventLogs({
      abi: ClankerAirdrop_v4_abi,
      eventName: 'AirdropClaimed',
      logs: claimAirdrop2FullTx.logs as Log[],
    })[0];

    expect(claim2FullLog.args.token).toEqual(tx.expectedAddress);
    expect(claim2FullLog.args.user).toEqual('0x0000000000000000000000000000000000000002');
    expect(claim2FullLog.args.totalUserAmountClaimed).toEqual(50000000000000000000000000n);
    expect(claim2FullLog.args.userAmountStillLocked).toEqual(0n);
  });
});
