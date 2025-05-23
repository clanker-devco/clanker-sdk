import { CLANKER_FACTORY_V3_1, DEFAULT_SUPPLY, WETH_ADDRESS } from '../constants.js';
import { encodeFunctionData, getAddress, isAddress, stringify } from 'viem';
import { Clanker_v3_1_abi } from '../abi/v3.1/Clanker.js';
import { ClankerMetadata, ClankerSocialContext, DeployFormData } from '../types/index.js';
import { getRelativeUnixTimestamp } from '../utils/unix-timestamp.js';
import { findVanityAddress } from './vanityAddress.js';

interface BuildTransactionProps {
  deployerAddress: `0x${string}`;
  formData: DeployFormData;
  chainId: number;
  clankerMetadata: ClankerMetadata;
  clankerSocialContext: ClankerSocialContext;
  desiredPrice: number;
}

export async function buildTransaction({
  deployerAddress,
  formData,
  chainId,
  clankerMetadata,
  clankerSocialContext,
  desiredPrice,
}: BuildTransactionProps): Promise<{
  transaction: { to: `0x${string}`; data: `0x${string}` };
  expectedAddress: `0x${string}`;
}> {
  const { name, symbol, imageUrl, lockupPercentage, vestingUnlockDate } = formData;

  const requestorAddress = deployerAddress;
  if (!requestorAddress) {
    throw new Error('No account address found');
  }

  // Extract the values we need
  const pairAddress =
    formData.pairedToken && isAddress(formData.pairedToken)
      ? getAddress(formData.pairedToken)
      : WETH_ADDRESS;
  console.log('pairAddress', pairAddress);

  // Calculate price tick using the same method as the example
  const logBase = 1.0001;
  const tickSpacing = 200;
  console.log('desiredPrice', desiredPrice);
  const rawTick = Math.log(desiredPrice) / Math.log(logBase);
  const initialTick = Math.floor(rawTick / tickSpacing) * tickSpacing;
  console.log('initialTick', initialTick);

  // Build metadata with social links like in the example
  const metadata = stringify({
    ...clankerMetadata,
    socialMediaUrls: [
      ...(clankerMetadata.socialMediaUrls || []),
      ...(formData.telegramLink ? [{ platform: 'telegram', url: formData.telegramLink }] : []),
      ...(formData.websiteLink ? [{ platform: 'website', url: formData.websiteLink }] : []),
      ...(formData.xLink ? [{ platform: 'x', url: formData.xLink }] : []),
      ...(formData.farcasterLink ? [{ platform: 'farcaster', url: formData.farcasterLink }] : []),
    ],
  });

  const socialContext = stringify(clankerSocialContext);

  // Validate all addresses to make sure they're not empty or undefined
  const validateAddress = (
    address: string | undefined,
    defaultAddress: `0x${string}`
  ): `0x${string}` => {
    if (!address || !isAddress(address)) {
      return defaultAddress;
    }
    return address;
  };

  const admin = validateAddress(formData.creatorRewardsAdmin, requestorAddress);
  const { token: expectedAddress, salt } = await findVanityAddress(
    [name, symbol, DEFAULT_SUPPLY, admin, imageUrl || '', metadata, socialContext, BigInt(chainId)],
    admin,
    '0x4b07',
    {
      chainId: chainId,
    }
  );

  // Convert absolute timestamp to duration if provided
  let vestingDuration = vestingUnlockDate
    ? getRelativeUnixTimestamp(Number(vestingUnlockDate))
    : BigInt(0);

  const tokenConfig = {
    tokenConfig: {
      name: name,
      symbol: symbol,
      salt: salt,
      image: imageUrl || '',
      metadata: metadata,
      context: socialContext,
      originatingChainId: BigInt(chainId),
    },
    poolConfig: {
      pairedToken: pairAddress,
      tickIfToken0IsNewToken: initialTick || 0,
    },
    initialBuyConfig: {
      pairedTokenPoolFee: 10000,
      pairedTokenSwapAmountOutMinimum: 0n,
    },
    vaultConfig: {
      vaultDuration: vestingDuration,
      vaultPercentage: lockupPercentage || 0,
    },
    rewardsConfig: {
      creatorReward: BigInt(Number(formData.creatorReward || 40)),
      creatorAdmin: validateAddress(formData.creatorRewardsAdmin, requestorAddress),
      creatorRewardRecipient: validateAddress(formData.creatorRewardsRecipient, requestorAddress),
      interfaceAdmin: validateAddress(formData.interfaceAdmin, requestorAddress),
      interfaceRewardRecipient: validateAddress(
        formData.interfaceRewardRecipient,
        requestorAddress
      ),
    },
  } as const;

  try {
    const deployCalldata = encodeFunctionData({
      abi: Clanker_v3_1_abi,
      functionName: 'deployToken',
      args: [tokenConfig],
    });

    return {
      transaction: {
        to: CLANKER_FACTORY_V3_1,
        data: deployCalldata,
      },
      expectedAddress,
    };
  } catch (error: any) {
    console.error('Error encoding function data:', error);
    console.error('Problematic deployArgs:', tokenConfig);
    // Re-throw with more context
    throw new Error(`Failed to encode function data: ${error.message}`);
  }
}
