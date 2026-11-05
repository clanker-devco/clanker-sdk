import { type Mock, mock, spyOn } from 'bun:test';
import {
  type Address,
  decodeAbiParameters,
  type Hex,
  hexToBytes,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { base } from 'viem/chains';
import type { ClankerConfig, TaxAddresses } from '../../src/v5/index.js';

export const caller = '0x1111111111111111111111111111111111111111' as const;
export const creator = '0x3333333333333333333333333333333333333333' as const;
export const recipient = '0x4444444444444444444444444444444444444444' as const;
export const other = '0x5555555555555555555555555555555555555555' as const;
export const addresses: TaxAddresses = {
  factory: '0x6666666666666666666666666666666666666666',
  tokenDeployer: '0x2222222222222222222222222222222222222222',
  hook: '0x7777777777777777777777777777777777777777',
  escrow: '0x8888888888888888888888888888888888888888',
  dividendClaimHelper: '0x9999999999999999999999999999999999999999',
};
export const initCodeHash =
  '0xd003426e799329b8dca093f3bbab55a5e4e9f3c40160fc942068eef712ae88ad' as const;
export const salt = '0x0000000000000000000000000000000000000000000000000000000000000001' as const;
export const knownVanitySalt =
  '0xf33bbcfdcf9da02843023edaee99b473569a85ea101943bb5a7cf85281cca687' as const;
/** These salts give a cccc address at once for `caller` and `initCodeHash` with a real deployer. */
export const baseDeployer = '0xc25FfE6374EdcCb5bFCcA3b9684046a426AbCE6A' as const;
export const baseDeployerSalt =
  '0x758e7d97dfc1fbb451497eea8842a88def82c8e2b43a0011be0d3108ad983e13' as const;
export const releaseDeployer = '0xE76c413b26c7006CF3ac747b46A8F05E0Ccf3287' as const;
export const releaseDeployerSalt =
  '0xcb1a0a821617671f5c3a87f0dd0b38838c234d64376fd80e3cc4fa0c0a46778c' as const;

export function mockTaxEntropy(
  start: Hex = knownVanitySalt
): Mock<typeof globalThis.crypto.getRandomValues> {
  return spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
    (array as Uint8Array).set(hexToBytes(start));
    return array;
  });
}

export function decodeSwapXRoute(data: Hex) {
  const [routes] = decodeAbiParameters(
    [
      {
        type: 'tuple[]',
        components: [
          { name: 'swapType', type: 'uint8' },
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'poolAddress', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickSpacing', type: 'int24' },
          { name: 'hooks', type: 'address' },
          { name: 'hookData', type: 'bytes' },
        ],
      },
    ],
    data
  );
  return routes;
}
export const baseToken = { name: 'Tax Token', symbol: 'TAX', buyFee: 1, sellFee: 1 };
export const supply = 1_000_000_000n * 10n ** 18n;
export const conversion = {
  caller,
  chainId: 8453,
  creatorSalt: salt,
  configVersion: 7n,
  deadline: 2000n,
  launchSupply: supply,
};

export type ReadCall = {
  address: Address;
  functionName: string;
  args?: readonly unknown[];
  blockNumber?: bigint;
};

type MockClients = {
  publicClient: PublicClient;
  wallet: ClankerConfig['wallet'];
  readContract: Mock<(call: ReadCall) => Promise<unknown>>;
  simulateContract: Mock<
    (
      request: Record<string, unknown>
    ) => Promise<{ request: Record<string, unknown>; result: unknown }>
  >;
  estimateContractGas: Mock<(request: Record<string, unknown>) => Promise<bigint>>;
  writeContract: Mock<(request: Record<string, unknown>) => Promise<Hex>>;
  waitForTransactionReceipt: Mock<(request: { hash: Hex }) => Promise<unknown>>;
};

export function mockClients(overrides: Record<string, unknown> = {}): MockClients {
  const readContract = mock(async (call: ReadCall) => {
    const values: Record<string, unknown> = {
      isLaunchToken: false,
      creatorRights: { poolId: salt, creatorFeeRecipient: creator, currentCreator: creator },
      poolConfig: [
        true,
        false,
        other,
        '0x0000000000000000000000000000000000000000',
        creator,
        creator,
      ],
      poolFeeSlots: [
        { admin: creator, recipient, weightBps: 6000, isCreator: true },
        { admin: other, recipient, weightBps: 4000, isCreator: false },
      ],
      launchBuyAdapterWrappedNative: '0x4200000000000000000000000000000000000006',
      wrappedNative: '0x4200000000000000000000000000000000000006',
      launchCreationEnabled: true,
      configVersion: 7n,
      nativeLaunchFee: 100n,
      launchSupply: supply,
      tokenDeployer: addresses.tokenDeployer,
      launchTokenInitCodeHash: initCodeHash,
      quoteConfig: [true, 18, -230400],
      launchBuyAdapter: other,
      hook: addresses.hook,
      tickSpacing: 200,
      taxPolicy: {
        taxFeeBounds: {
          minimumBuyTaxRate: 1_000_000,
          maximumBuyTaxRate: 10_000_000,
          minimumSellTaxRate: 1_000_000,
          maximumSellTaxRate: 10_000_000,
        },
      },
      ...overrides,
    };
    return values[call.functionName];
  });
  const simulateContract = mock(
    async (
      request: Record<string, unknown>
    ): Promise<{ request: Record<string, unknown>; result: unknown }> => ({
      request,
      result: undefined,
    })
  );
  const writeContract = mock(async (_request: Record<string, unknown>): Promise<Hex> => salt);
  const estimateContractGas = mock(async (_request: Record<string, unknown>) => 100_000n);
  const waitForTransactionReceipt = mock(
    async (_request: { hash: Hex }): Promise<unknown> => ({ status: 'success', logs: [] })
  );
  const publicClient = {
    chain: base,
    getBlock: mock(async () => ({ number: 42n, timestamp: 1000n })),
    getBlockNumber: mock(async () => 42n),
    readContract,
    simulateContract,
    estimateContractGas,
    waitForTransactionReceipt,
  } as unknown as PublicClient;
  const wallet = {
    chain: base,
    account: { address: caller, type: 'json-rpc' },
    writeContract,
  } as unknown as WalletClient as ClankerConfig['wallet'];
  return {
    publicClient,
    wallet,
    readContract,
    simulateContract,
    estimateContractGas,
    writeContract,
    waitForTransactionReceipt,
  };
}
