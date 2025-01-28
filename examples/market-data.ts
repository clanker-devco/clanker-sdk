import * as dotenv from 'dotenv';
import { MarketDataClient } from '../src';

// Load environment variables
dotenv.config();

const DUNE_API_KEY = process.env.DUNE_API_KEY;
if (!DUNE_API_KEY) {
  throw new Error('Missing DUNE_API_KEY in environment variables');
}

async function marketDataExample(): Promise<void> {
  // Initialize the market data client
  const marketData = new MarketDataClient(DUNE_API_KEY);

  try {
    // Get Clanker dictionary data
    console.log('Fetching Clanker dictionary...');
    const dictionary = await marketData.getClankerDictionary();
    console.log('Dictionary data:', dictionary);

    // Get DEX pair stats for a specific token on Ethereum
    console.log('\nFetching DEX pair stats...');
    const dexStats = await marketData.getDexPairStats('ethereum', '0x1234567890123456789012345678901234567890');
    console.log('DEX stats:', dexStats);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
marketDataExample(); 