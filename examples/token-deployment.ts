import { ClankerSDK } from '../src';

async function deployTokenExample(): Promise<void> {
  // Initialize the SDK with your API key
  const clanker = new ClankerSDK(process.env.CLANKER_API_KEY || 'your_api_key_here');

  try {
    // Basic token deployment
    console.log('Deploying a basic token...');
    const basicToken = await clanker.deployToken({
      name: "Community Token",
      symbol: "CMTY",
      image: "https://example.com/community-token.png",
      requestorAddress: "0x1234567890123456789012345678901234567890",
    });
    console.log('Basic token deployed:', basicToken);

    // Token deployment with splits
    console.log('\nDeploying a token with splits...');
    const splitToken = await clanker.deployTokenWithSplits({
      name: "Creator Token",
      symbol: "CRTR",
      image: "https://example.com/creator-token.png",
      requestorAddress: "0x1234567890123456789012345678901234567890",
      splitAddress: "0x935Ce0B6bBE179B45061BD5477A4BBA304fc3FFe",
    });
    console.log('Split token deployed:', splitToken);

    // Check deployment status
    console.log('\nFetching deployed tokens...');
    const deployedTokens = await clanker.fetchDeployedByAddress(
      "0x1234567890123456789012345678901234567890"
    );
    console.log('Deployed tokens:', deployedTokens);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
deployTokenExample(); 