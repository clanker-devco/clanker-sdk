#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as dotenv from 'dotenv';
import inquirer from 'inquirer';
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker, type TokenConfig } from '../index.js';
import { validateConfig } from '../utils/validation.js';

// Load environment variables
dotenv.config();

// Read ASCII art from file
const ASCII_ART = fs.readFileSync(path.join(__dirname, 'ascii.txt'), 'utf8');

// Constants
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006' as const;
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

// Main function that will be exported
async function createClanker() {
  const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
  const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS as `0x${string}`;
  const RPC_URL = process.env.RPC_URL;

  // Initialize wallet with private key
  const account = privateKeyToAccount(PRIVATE_KEY);

  // Helper function to safely convert address to 0x-prefixed string type
  function toHexAddress(address: string | undefined): `0x${string}` | undefined {
    if (!address) return undefined;
    return address.toLowerCase() as `0x${string}`;
  }

  function checkEnvironment(): boolean {
    const missingVars = [];

    if (!PRIVATE_KEY) missingVars.push('PRIVATE_KEY');
    if (!FACTORY_ADDRESS) missingVars.push('FACTORY_ADDRESS');

    if (missingVars.length > 0) {
      console.log('\n❌ Missing required environment variables:');
      console.log(missingVars.join(', '));
      console.log(
        '\n📝 Please create a .env file in your current directory with the following variables:'
      );
      console.log(`
Required:
PRIVATE_KEY=your_private_key_here
FACTORY_ADDRESS=factory_contract_address_here

Optional:
RPC_URL=your_custom_rpc_url (if not provided, will use default Base RPC)
      `);
      console.log('\nMake sure to include the 0x prefix for addresses and private keys.');
      console.log('Never share or commit your private key!\n');
      return false;
    }

    // Validate private key format
    if (!PRIVATE_KEY.startsWith('0x') || PRIVATE_KEY.length !== 66) {
      console.log('\n❌ Invalid PRIVATE_KEY format. It should:');
      console.log('- Start with 0x');
      console.log('- Be 64 characters long (plus 0x prefix)');
      return false;
    }

    // Validate factory address format
    if (!FACTORY_ADDRESS.startsWith('0x') || FACTORY_ADDRESS.length !== 42) {
      console.log('\n❌ Invalid FACTORY_ADDRESS format. It should:');
      console.log('- Start with 0x');
      console.log('- Be 40 characters long (plus 0x prefix)');
      return false;
    }

    return true;
  }

  interface ClankerAnswers {
    name: string;
    symbol: string;
    image: string;
    pairedTokenChoice: 'WETH' | 'USDC' | 'CUSTOM';
    customPairedToken?: string;
    initialMarketCapUsd: string;
    customMarketCap?: string;
    customDevBuy?: string;
    customVaultPercentage?: string;
    customVaultDuration?: string;
    metadata: {
      description: string;
      socialMediaUrls: string[];
      auditUrls: string[];
      telegram?: string;
      website?: string;
      twitter?: string;
      farcaster?: string;
    };
    vaultConfig: {
      vaultPercentage: string;
      durationInDays: string;
    };
    devBuy: {
      ethAmount: string;
      maxSlippage: number;
    };
    rewardsConfig: {
      creatorReward: string | number;
      customCreatorReward?: string;
      creatorAdmin?: `0x${string}`;
      creatorRewardRecipient?: `0x${string}`;
      interfaceAdmin?: `0x${string}`;
      interfaceRewardRecipient?: `0x${string}`;
    };
  }

  const validateAddress = (input: string) => {
    if (!input) return 'Address cannot be empty';
    if (!/^0x[a-fA-F0-9]{40}$/.test(input)) return 'Invalid Ethereum address';
    return true;
  };

  const _validatePercentage = (input: string) => {
    const num = Number(input);
    if (Number.isNaN(num)) return 'Must be a number';
    if (num < 0 || num > 100) return 'Percentage must be between 0 and 100';
    return true;
  };

  const validateSymbol = (input: string) => {
    if (!input) return 'Symbol cannot be empty';
    if (!/^[a-zA-Z0-9]+$/.test(input)) return 'Symbol must contain only letters and numbers';
    if (input.length > 20) return 'Symbol must be 20 characters or less';
    return true;
  };

  const validateIpfsUri = (input: string) => {
    if (!input) return 'Image URI cannot be empty';
    if (!input.startsWith('ipfs://')) return 'Image URI must start with ipfs://';
    return true;
  };

  const validateAmount = (input: string) => {
    if (!input) return 'Amount cannot be empty';
    if (!/^\d*\.?\d+$/.test(input)) return 'Must be a valid number';
    return true;
  };

  const _validateHexString = (input: string) => {
    if (!input) return true; // Optional
    if (!/^0x[a-fA-F0-9]+$/.test(input)) return 'Must be a valid hex string starting with 0x';
    return true;
  };

  const validateSlippage = (input: string) => {
    const num = Number(input);
    if (Number.isNaN(num)) return 'Must be a number';
    if (num < 0 || num > 100) return 'Slippage must be between 0 and 100';
    return true;
  };

  const validateVaultPercentage = (input: string) => {
    const num = Number(input);
    if (Number.isNaN(num)) return 'Must be a number';
    if (num < 0 || num > 30) return 'Vault percentage must be between 0 and 30%';
    return true;
  };

  const validateVaultDuration = (input: string) => {
    const num = Number(input);
    if (Number.isNaN(num)) return 'Must be a number';
    if (num < 30) return 'Vault duration must be at least 30 days';
    return true;
  };

  const validateCreatorReward = (input: string) => {
    const num = Number(input);
    if (Number.isNaN(num)) return 'Must be a number';
    if (num < 0 || num > 80) return 'Creator reward must be between 0 and 80%';
    return true;
  };

  const validateUrl = (input: string) => {
    if (!input) return true; // Optional
    try {
      new URL(input);
      return true;
    } catch (_e) {
      return 'Please enter a valid URL';
    }
  };

  async function promptUser(): Promise<ClankerAnswers> {
    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Token name:',
        prefix: '',
        validate: (input: string) => input.length > 0 || 'Name cannot be empty',
      },
      {
        type: 'input',
        name: 'symbol',
        message: 'Token symbol:',
        prefix: '',
        validate: validateSymbol,
      },
      {
        type: 'list',
        name: 'pairedTokenChoice',
        message: 'Select quote token:',
        prefix: '',
        choices: [
          { name: 'WETH', value: 'WETH' },
          { name: 'USDC', value: 'USDC' },
          { name: 'Custom Address', value: 'CUSTOM' },
        ],
        default: 'WETH',
      },
      {
        type: 'input',
        name: 'customPairedToken',
        message: 'Enter custom token address:',
        prefix: '',
        validate: validateAddress,
        when: (answers: ClankerAnswers) => answers.pairedTokenChoice === 'CUSTOM',
      },
      {
        type: 'input',
        name: 'initialMarketCapUsd',
        message: (answers: ClankerAnswers) =>
          `Enter initial market cap in ${answers.pairedTokenChoice === 'CUSTOM' ? 'quote token' : answers.pairedTokenChoice}:`,
        prefix: '',
        validate: validateAmount,
        default: (answers: ClankerAnswers) =>
          answers.pairedTokenChoice === 'WETH'
            ? '1'
            : answers.pairedTokenChoice === 'USDC'
              ? '1000'
              : '1',
      },
      {
        type: 'input',
        name: 'customMarketCap',
        message: 'Enter custom market cap in quote token:',
        prefix: '',
        validate: validateAmount,
        when: (answers: ClankerAnswers) => answers.initialMarketCapUsd === 'CUSTOM',
      },
      {
        type: 'input',
        name: 'image',
        message: 'Enter the IPFS URI for the token image:',
        prefix: '',
        validate: validateIpfsUri,
      },
      {
        type: 'list',
        name: 'devBuy.ethAmount',
        message: 'Creator buy amount (optional):',
        prefix: '',
        choices: [
          { name: 'None', value: '0' },
          { name: '0.00005 ETH', value: '0.00005' },
          { name: '0.1 ETH', value: '0.1' },
          { name: '0.5 ETH', value: '0.5' },
          { name: '1.0 ETH', value: '1.0' },
          { name: 'Custom', value: 'CUSTOM' },
        ],
        default: '0',
      },
      {
        type: 'input',
        name: 'customDevBuy',
        message: 'Enter custom dev buy amount in ETH:',
        prefix: '',
        validate: validateAmount,
        when: (answers: ClankerAnswers) => answers.devBuy.ethAmount === 'CUSTOM',
      },
      {
        type: 'input',
        name: 'devBuy.maxSlippage',
        message: 'Maximum slippage percentage (0-100):',
        prefix: '',
        validate: validateSlippage,
        default: '5',
        when: (answers: ClankerAnswers) => answers.devBuy.ethAmount !== '0',
      },
      {
        type: 'list',
        name: 'vaultConfig.vaultPercentage',
        message: 'Vault percentage (optional):',
        prefix: '',
        choices: [
          { name: 'None', value: '0' },
          { name: '5%', value: '5' },
          { name: '15%', value: '15' },
          { name: '30%', value: '30' },
          { name: 'Custom', value: 'CUSTOM' },
        ],
        default: '0',
      },
      {
        type: 'input',
        name: 'customVaultPercentage',
        message: 'Enter custom vault percentage (0-30):',
        prefix: '',
        validate: validateVaultPercentage,
        when: (answers: ClankerAnswers) => answers.vaultConfig.vaultPercentage === 'CUSTOM',
      },
      {
        type: 'list',
        name: 'vaultConfig.durationInDays',
        message: 'Vault duration:',
        prefix: '',
        choices: [
          { name: '31 days', value: '31' },
          { name: '90 days', value: '90' },
          { name: '180 days', value: '180' },
          { name: 'Custom', value: 'CUSTOM' },
        ],
        default: '31',
        when: (answers: ClankerAnswers) => answers.vaultConfig.vaultPercentage !== '0',
      },
      {
        type: 'input',
        name: 'customVaultDuration',
        message: 'Enter custom vault duration in days (minimum 30):',
        prefix: '',
        validate: validateVaultDuration,
        when: (answers: ClankerAnswers) => answers.vaultConfig.durationInDays === 'CUSTOM',
      },
      {
        type: 'input',
        name: 'metadata.description',
        message: 'Token description:',
        prefix: '',
        default: (answers: ClankerAnswers) => `${answers.name} token deployed via Clanker CLI`,
        validate: (input: string) => input.length > 0 || 'Description cannot be empty',
      },
      {
        type: 'input',
        name: 'metadata.telegram',
        message: 'Telegram URL (optional):',
        prefix: '',
        validate: validateUrl,
      },
      {
        type: 'input',
        name: 'metadata.website',
        message: 'Website URL (optional):',
        prefix: '',
        validate: validateUrl,
      },
      {
        type: 'input',
        name: 'metadata.twitter',
        message: 'X/Twitter URL (optional):',
        prefix: '',
        validate: validateUrl,
      },
      {
        type: 'input',
        name: 'metadata.farcaster',
        message: 'Farcaster URL (optional):',
        prefix: '',
        validate: validateUrl,
      },

      {
        type: 'list',
        name: 'rewardsConfig.creatorReward',
        message: 'Creator reward percentage, balance remaining goes to interface:',
        prefix: '',
        choices: [
          { name: '80% (maximum)', value: 80 },
          { name: '60%', value: 60 },
          { name: '40%', value: 40 },
          { name: '20%', value: 20 },
          { name: '0% (all to interface)', value: 0 },
          { name: 'Custom', value: 'CUSTOM' },
        ],
        default: 80,
      },
      {
        type: 'input',
        name: 'rewardsConfig.customCreatorReward',
        message: 'Enter custom creator reward percentage (0-80):',
        prefix: '',
        validate: validateCreatorReward,
        when: (answers: ClankerAnswers) => answers.rewardsConfig.creatorReward === 'CUSTOM',
      },
      {
        type: 'input',
        name: 'rewardsConfig.creatorAdmin',
        message: 'Enter custom creator admin address (optional):',
        prefix: '',
        validate: validateAddress,
      },
      {
        type: 'input',
        name: 'rewardsConfig.creatorRewardRecipient',
        message: 'Enter custom creator reward recipient address (optional):',
        prefix: '',
        validate: validateAddress,
      },
      {
        type: 'input',
        name: 'rewardsConfig.interfaceAdmin',
        message: 'Enter custom interface admin address (optional):',
        prefix: '',
        validate: validateAddress,
      },
      {
        type: 'input',
        name: 'rewardsConfig.interfaceRewardRecipient',
        message: 'Enter custom interface reward recipient address (optional):',
        prefix: '',
        validate: validateAddress,
      },
    ];

    const answers = await inquirer.prompt(questions, {});

    // Process custom values
    if (answers.initialMarketCapUsd === 'CUSTOM') {
      answers.initialMarketCapUsd = answers.customMarketCap || '0';
    }
    if (answers.devBuy.ethAmount === 'CUSTOM') {
      answers.devBuy.ethAmount = answers.customDevBuy || '0';
    }

    // Convert string values to numbers for vault config
    const vaultPercentage =
      answers.vaultConfig.vaultPercentage === 'CUSTOM'
        ? parseInt(answers.customVaultPercentage || '0', 10)
        : parseInt(answers.vaultConfig.vaultPercentage, 10);

    const vaultDuration =
      answers.vaultConfig.durationInDays === 'CUSTOM'
        ? parseInt(answers.customVaultDuration || '31', 10)
        : parseInt(answers.vaultConfig.durationInDays, 10);

    // Clean up metadata
    const socialMediaUrls = [];
    if (answers.metadata.telegram) socialMediaUrls.push(answers.metadata.telegram);
    if (answers.metadata.website) socialMediaUrls.push(answers.metadata.website);
    if (answers.metadata.twitter) socialMediaUrls.push(answers.metadata.twitter);
    if (answers.metadata.farcaster) socialMediaUrls.push(answers.metadata.farcaster);

    const metadata = {
      description: answers.metadata.description,
      socialMediaUrls,
      auditUrls: [],
    };

    // Return the final config with proper types
    return {
      ...answers,
      metadata,
      vaultConfig: {
        vaultPercentage: vaultPercentage.toString(),
        durationInDays: vaultDuration.toString(),
      },
      rewardsConfig: {
        creatorReward:
          answers.rewardsConfig.creatorReward === 'CUSTOM'
            ? Number(answers.rewardsConfig.customCreatorReward)
            : Number(answers.rewardsConfig.creatorReward),
        creatorAdmin: toHexAddress(
          answers.rewardsConfig.creatorAdmin || account.address
        ) as `0x${string}`,
        creatorRewardRecipient: toHexAddress(
          answers.rewardsConfig.creatorRewardRecipient || account.address
        ) as `0x${string}`,
        interfaceAdmin: toHexAddress(
          answers.rewardsConfig.interfaceAdmin || account.address
        ) as `0x${string}`,
        interfaceRewardRecipient: toHexAddress(
          answers.rewardsConfig.interfaceRewardRecipient || account.address
        ) as `0x${string}`,
      },
    };
  }

  async function deployToken(answers: ClankerAnswers) {
    try {
      // Create transport with optional custom RPC
      const transport = RPC_URL ? http(RPC_URL) : http();

      const publicClient = createPublicClient({
        chain: base,
        transport,
      }) as PublicClient;

      const walletClient = createWalletClient({
        account,
        chain: base,
        transport,
      });

      // Initialize Clanker SDK
      const clanker = new Clanker({
        wallet: walletClient,
        publicClient,
      });

      console.log('\n🔄 Preparing deployment configuration...');

      // Determine quote token address
      const quoteToken =
        answers.pairedTokenChoice === 'WETH'
          ? WETH_ADDRESS
          : answers.pairedTokenChoice === 'USDC'
            ? USDC_ADDRESS
            : (answers.customPairedToken as `0x${string}`);

      // Prepare token configuration
      const tokenConfig: TokenConfig = {
        type: 'v3',
        name: answers.name,
        symbol: answers.symbol,
        image: answers.image,
        metadata: {
          description: answers.metadata.description,
          socialMediaUrls: answers.metadata.socialMediaUrls,
          auditUrls: answers.metadata.auditUrls,
        },
        context: {
          interface: 'Clanker CLI',
          platform: 'Clanker',
          messageId: `CLI-${Date.now()}`,
          id: `${answers.symbol}-${Date.now()}`,
        },
        pool: {
          quoteToken,
          initialMarketCap: answers.initialMarketCapUsd,
        },
        vault:
          answers.vaultConfig.vaultPercentage !== '0'
            ? {
                percentage: parseInt(answers.vaultConfig.vaultPercentage, 10),
                durationInDays: parseInt(answers.vaultConfig.durationInDays, 10),
              }
            : undefined,
        devBuy:
          answers.devBuy.ethAmount !== '0'
            ? {
                ethAmount: Number(answers.devBuy.ethAmount),
              }
            : undefined,
        rewardsConfig: {
          creatorReward:
            answers.rewardsConfig.creatorReward === 'CUSTOM'
              ? Number(answers.rewardsConfig.customCreatorReward)
              : Number(answers.rewardsConfig.creatorReward),
          creatorAdmin: toHexAddress(
            answers.rewardsConfig.creatorAdmin || account.address
          ) as `0x${string}`,
          creatorRewardRecipient: toHexAddress(
            answers.rewardsConfig.creatorRewardRecipient || account.address
          ) as `0x${string}`,
          interfaceAdmin: toHexAddress(
            answers.rewardsConfig.interfaceAdmin || account.address
          ) as `0x${string}`,
          interfaceRewardRecipient: toHexAddress(
            answers.rewardsConfig.interfaceRewardRecipient || account.address
          ) as `0x${string}`,
        },
      };

      // Validate the token configuration
      const tokenValidation = validateConfig(tokenConfig);

      if (!tokenValidation.success) {
        console.error('\n❌ Token configuration validation failed:');
        console.error(tokenValidation.error?.format());
        throw new Error('Invalid token configuration');
      }

      console.log('\n✅ Token configuration is valid!');
      console.log('\n📝 Review your token configuration:\n');
      console.log(JSON.stringify(tokenConfig, null, 2));

      // Deploy token with validated configuration
      const tokenAddress = await clanker.deployToken(tokenConfig);

      console.log('\n✨ Deployment successful!');
      console.log(`📍 Token address: ${tokenAddress}`);
      console.log('\n🌐 View on:');
      console.log(`Basescan: https://basescan.org/token/${tokenAddress}`);
      console.log(`Clanker World: https://clanker.world/clanker/${tokenAddress}`);

      return tokenAddress;
    } catch (error) {
      console.error(
        '\n❌ Deployment failed:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  async function main() {
    // Show header
    console.clear();
    console.log(ASCII_ART);
    console.log('\n🚀 Welcome to the Clanker Token Creator! 🚀\n');

    // Check environment variables first
    if (!checkEnvironment()) {
      process.exit(1);
    }

    try {
      const answers = await promptUser();

      console.log('\n📝 Review your token configuration:\n');
      console.log(JSON.stringify(answers, null, 2));

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Would you like to proceed with deployment?',
          default: false,
          prefix: '',
        },
      ]);

      if (confirm) {
        console.log('\n🔄 Deploying your token...');
        try {
          const _tokenAddress = await deployToken(answers);
          console.log(`\n✅ Token deployed to ${_tokenAddress}`);

          // Exit after successful deployment
          process.exit(0);
        } catch (error) {
          console.error(
            '\n❌ Deployment failed:',
            error instanceof Error ? error.message : 'Unknown error'
          );
          process.exit(1);
        }
      } else {
        console.log('\n❌ Deployment cancelled');
        process.exit(0);
      }
    } catch (error) {
      console.error('\n❌ Error:', error);
      process.exit(1);
    }
  }

  await main();
}

export default createClanker;

// Call the function when the script is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createClanker().catch((error) => {
    console.error('Failed to create Clanker:', error);
    process.exit(1);
  });
}
