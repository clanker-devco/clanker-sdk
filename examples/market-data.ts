import * as dotenv from 'dotenv';
import { MarketDataClient } from '../src';

// Load environment variables
dotenv.config();

// Get API keys from environment
const duneApiKey = process.env.DUNE_API_KEY;
const graphApiKey = process.env.GRAPH_API_KEY;
const geckoApiKey = process.env.COINGECKO_API_KEY;

// Validate required API key
if (!duneApiKey) {
  throw new Error('Missing DUNE_API_KEY in environment variables');
}

async function marketDataExample(): Promise<void> {
  // Initialize the market data client with all available API keys
  const marketData = new MarketDataClient(duneApiKey, graphApiKey, geckoApiKey);

  try {
    // Example token addresses and IDs
    const tokenAddress = '0x1234567890123456789012345678901234567890';
    const geckoTokenIds = ['ethereum', 'bitcoin', 'uniswap'];

    console.log('\n1. Fetching CoinGecko market data...');
    if (geckoApiKey) {
      try {
        const geckoData = await marketData.getGeckoTokenData(geckoTokenIds);
        console.log('CoinGecko data:', JSON.stringify(geckoData, null, 2));
      } catch (error) {
        console.error('Failed to fetch CoinGecko data:', error);
      }
    } else {
      console.log('Skipping CoinGecko data (COINGECKO_API_KEY not provided)');
    }

    console.log('\n2. Fetching Clanker dictionary...');
    if (duneApiKey) {
      try {
        const dictionary = await marketData.getClankerDictionary();
        console.log('Dictionary data:', JSON.stringify(dictionary, null, 2));

        console.log('\n3. Fetching DEX pair stats...');
        const dexStats = await marketData.getDexPairStats('ethereum', tokenAddress);
        console.log('DEX stats:', JSON.stringify(dexStats, null, 2));
      } catch (error) {
        console.error('Failed to fetch Dune data:', error);
      }
    } else {
      console.log('Skipping Dune data (DUNE_API_KEY not provided)');
    }

    console.log('\n4. Fetching Uniswap data...');
    if (graphApiKey) {
      try {
        const uniswapData = await marketData.getUniswapData([
          tokenAddress,
          '0x0987654321098765432109876543210987654321'
        ]);
        console.log('Uniswap data:', JSON.stringify(uniswapData, null, 2));
      } catch (error) {
        console.error('Failed to fetch Uniswap data:', error);
      }
    } else {
      console.log('Skipping Uniswap data (GRAPH_API_KEY not provided)');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the example and handle any unhandled promise rejections
void marketDataExample().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 