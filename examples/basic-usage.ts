import { ClankerSDK } from '../src/ClankerSDK';

async function main() {
  // Initialize the SDK with your API key
  const clanker = new ClankerSDK('your_api_key_here');

  try {
    // Example 1: Deploy a new token
    const newToken = await clanker.deployToken({
      name: "My Token",
      symbol: "MTK",
      image: "https://example.com/token-image.png",
      requestorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    });
    console.log('Deployed token:', newToken);

    // Example 2: Get estimated uncollected fees
    const fees = await clanker.getEstimatedUncollectedFees("0x618A9840691334eE8d24445a4AdA4284Bf42417D");
    console.log('Uncollected fees:', fees);

    // Example 3: Deploy token with splits
    const tokenWithSplits = await clanker.deployTokenWithSplits({
      name: "Split Token",
      symbol: "SPLT",
      image: "https://example.com/split-token.png",
      requestorAddress: "0x1234567890123456789012345678901234567890",
      splitAddress: "0x935Ce0B6bBE179B45061BD5477A4BBA304fc3FFe",
    });
    console.log('Deployed token with splits:', tokenWithSplits);

  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 