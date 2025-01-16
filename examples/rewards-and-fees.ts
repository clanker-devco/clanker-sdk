import { ClankerSDK } from '../src';

async function checkRewardsAndFees(): Promise<void> {
  // Initialize the SDK with your API key
  const clanker = new ClankerSDK(process.env.CLANKER_API_KEY || 'your_api_key_here');

  try {
    // Example contract and pool addresses
    const contractAddress = '0x618A9840691334eE8d24445a4AdA4284Bf42417D';
    const poolAddress = '0x5D95E4c674d4d7169874D2d549CC26f727EB388f';

    // Check uncollected fees
    console.log('Checking uncollected fees...');
    const fees = await clanker.getEstimatedUncollectedFees(contractAddress);
    console.log('Uncollected fees:', {
      token0Symbol: fees.token0.symbol,
      token0Rewards: fees.token0UncollectedRewards,
      token1Symbol: fees.token1.symbol,
      token1Rewards: fees.token1UncollectedRewards,
    });

    // Check estimated rewards for a pool
    console.log('\nChecking estimated rewards...');
    const rewards = await clanker.getEstimatedRewardsByPoolAddress(poolAddress);
    console.log('Estimated rewards:', rewards);

    // Get detailed information about a specific Clanker
    console.log('\nFetching Clanker details...');
    const clankerDetails = await clanker.getClankerByAddress(contractAddress);
    console.log('Clanker details:', {
      name: clankerDetails.name,
      symbol: clankerDetails.symbol,
      poolAddress: clankerDetails.pool_address,
      type: clankerDetails.type,
    });

  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
}

// Run the example
checkRewardsAndFees(); 