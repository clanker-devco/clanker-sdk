import { type Address, isAddress, isAddressEqual, zeroAddress } from 'viem';

export type TaxAddresses = {
  factory: Address;
  hook: Address;
  escrow: Address;
  tokenDeployer: Address;
  dividendClaimHelper: Address;
};

export type TaxAddressConfig = { [K in keyof TaxAddresses]: Address | '' };

export const ARC_CHAIN_ID = 5042;
export const ARC_USDC: Address = '0x3600000000000000000000000000000000000000';

// New launches are closed on these chains. Their addresses stay so existing tokens can still
// claim fees, rewards and dividends and be managed.
export const RETIRED_LAUNCH_CHAIN_IDS: readonly number[] = [1, 42161, 130];

export function assertLaunchesOpen(chainId: number): void {
  if (RETIRED_LAUNCH_CHAIN_IDS.includes(chainId))
    throw new Error(`Launches are not open on chain ${chainId}.`);
}

export const TAX_ADDRESSES: Readonly<Record<number, Readonly<TaxAddressConfig>>> = {
  8453: {
    factory: '0x572e88D3cD7f23E4241EB6ceDD96667271bF09A0',
    hook: '0x5E320eA6278107968C119942E57d876c5F922AcC',
    escrow: '0x5dd237d1f716C65426CCd2FAe82B95109825FA61',
    tokenDeployer: '0xc25FfE6374EdcCb5bFCcA3b9684046a426AbCE6A',
    dividendClaimHelper: '0xe896454E417400a9d7766497764e4dEBf91534BD',
  },
  56: {
    factory: '0xcA111dcdd2cE924c3378d6514fDCbC46217bcA16',
    hook: '0xA8F0c64D5E5CF05379c13263EbdD03e8A835EACC',
    escrow: '0xFBB6e837A2eA96d6b4beb4788c2749Cf34A997e7',
    tokenDeployer: '0xE76c413b26c7006CF3ac747b46A8F05E0Ccf3287',
    dividendClaimHelper: '0xdb525d50c70b9303115bA19503761756136d2B49',
  },
  143: {
    factory: '0xcA111dcdd2cE924c3378d6514fDCbC46217bcA16',
    hook: '0x58E0cE0ba45002DFF608e2f04C0B88075eD4aAcC',
    escrow: '0xFBB6e837A2eA96d6b4beb4788c2749Cf34A997e7',
    tokenDeployer: '0xE76c413b26c7006CF3ac747b46A8F05E0Ccf3287',
    dividendClaimHelper: '0xdb525d50c70b9303115bA19503761756136d2B49',
  },
  196: {
    factory: '0xcA111dcdd2cE924c3378d6514fDCbC46217bcA16',
    hook: '0x9A935223eabd30b00fA680a5F3F8e7485e26aacC',
    escrow: '0xFBB6e837A2eA96d6b4beb4788c2749Cf34A997e7',
    tokenDeployer: '0xE76c413b26c7006CF3ac747b46A8F05E0Ccf3287',
    dividendClaimHelper: '0xdb525d50c70b9303115bA19503761756136d2B49',
  },
  4663: {
    factory: '0xcA111dcdd2cE924c3378d6514fDCbC46217bcA16',
    hook: '0x565189a6780D1a50FC1792F64db8e4881119AaCC',
    escrow: '0xFBB6e837A2eA96d6b4beb4788c2749Cf34A997e7',
    tokenDeployer: '0xE76c413b26c7006CF3ac747b46A8F05E0Ccf3287',
    dividendClaimHelper: '0xdb525d50c70b9303115bA19503761756136d2B49',
  },
  5042: {
    factory: '0xcA111dcdd2cE924c3378d6514fDCbC46217bcA16',
    hook: '0x565189a6780D1a50FC1792F64db8e4881119AaCC',
    escrow: '0xFBB6e837A2eA96d6b4beb4788c2749Cf34A997e7',
    tokenDeployer: '0xE76c413b26c7006CF3ac747b46A8F05E0Ccf3287',
    dividendClaimHelper: '0xdb525d50c70b9303115bA19503761756136d2B49',
  },
  1: {
    factory: '0xcA111dcdd2cE924c3378d6514fDCbC46217bcA16',
    hook: '0x486Cb719652974B5143a1Ae34003de8428a2EAcc',
    escrow: '0xFBB6e837A2eA96d6b4beb4788c2749Cf34A997e7',
    tokenDeployer: '0xE76c413b26c7006CF3ac747b46A8F05E0Ccf3287',
    dividendClaimHelper: '0xdb525d50c70b9303115bA19503761756136d2B49',
  },
  42161: {
    factory: '0xcA111dcdd2cE924c3378d6514fDCbC46217bcA16',
    hook: '0x9A935223eabd30b00fA680a5F3F8e7485e26aacC',
    escrow: '0xFBB6e837A2eA96d6b4beb4788c2749Cf34A997e7',
    tokenDeployer: '0xE76c413b26c7006CF3ac747b46A8F05E0Ccf3287',
    dividendClaimHelper: '0xdb525d50c70b9303115bA19503761756136d2B49',
  },
  130: {
    factory: '0xcA111dcdd2cE924c3378d6514fDCbC46217bcA16',
    hook: '0xe31AdA373832b1FC35D3b6Ec7901Df8Afe14aAcC',
    escrow: '0xFBB6e837A2eA96d6b4beb4788c2749Cf34A997e7',
    tokenDeployer: '0xE76c413b26c7006CF3ac747b46A8F05E0Ccf3287',
    dividendClaimHelper: '0xdb525d50c70b9303115bA19503761756136d2B49',
  },
};

export function taxAddressFor(
  chainId: number,
  key: keyof TaxAddresses,
  overrides?: Partial<TaxAddresses>
): Address {
  const address = overrides?.[key] ?? TAX_ADDRESSES[chainId]?.[key];
  if (!address || !isAddress(address) || isAddressEqual(address, zeroAddress)) {
    throw new Error(
      `Clanker v5 ${key} address is unset for chain ${chainId}. Pass addresses.${key}.`
    );
  }
  return address;
}
