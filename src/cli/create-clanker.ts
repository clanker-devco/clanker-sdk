#!/usr/bin/env node

import inquirer from 'inquirer';
import { Clanker } from '../index.js';
import { createPublicClient, createWalletClient, http, PublicClient, WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import * as dotenv from 'dotenv';
import { parseUnits } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Main function that will be exported
export default async function createClanker() {
  // Check command line arguments
  const args = process.argv.slice(2);
  if (args.length === 0 || (args[0] !== '--create' && args[0] !== 'create')) {
    console.log('\n🚀 Clanker SDK CLI\n');
    console.log('Available commands:');
    console.log('  --create    Create a new token');
    console.log('\nExample:');
    console.log('  npx clanker-sdk --create\n');
    process.exit(0);
  }

  const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
  const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS as `0x${string}`;
  const RPC_URL = process.env.RPC_URL;
  const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
  const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

  function checkEnvironment(): boolean {
    const missingVars = [];
    
    if (!PRIVATE_KEY) missingVars.push('PRIVATE_KEY');
    if (!FACTORY_ADDRESS) missingVars.push('FACTORY_ADDRESS');
    
    if (missingVars.length > 0) {
      console.log('\n❌ Missing required environment variables:');
      console.log(missingVars.join(', '));
      console.log('\n📝 Please create a .env file in your current directory with the following variables:');
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
    salt?: `0x${string}`;
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
      creatorReward: number;
      creatorAdmin: `0x${string}`;
      creatorRewardRecipient: `0x${string}`;
      interfaceAdmin: `0x${string}`;
      interfaceRewardRecipient: `0x${string}`;
    };
  }

  const validateAddress = (input: string) => {
    if (!input) return 'Address cannot be empty';
    if (!/^0x[a-fA-F0-9]{40}$/.test(input)) return 'Invalid Ethereum address';
    return true;
  };

  const validatePercentage = (input: string) => {
    const num = Number(input);
    if (isNaN(num)) return 'Must be a number';
    if (num < 0 || num > 100) return 'Percentage must be between 0 and 100';
    return true;
  };

  const validateSymbol = (input: string) => {
    if (!input) return 'Symbol cannot be empty';
    if (!/^[A-Z0-9]+$/.test(input)) return 'Symbol must contain only uppercase letters and numbers';
    if (input.length > 10) return 'Symbol must be 10 characters or less';
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

  const validateHexString = (input: string) => {
    if (!input) return true; // Optional
    if (!/^0x[a-fA-F0-9]+$/.test(input)) return 'Must be a valid hex string starting with 0x';
    return true;
  };

  const validateSlippage = (input: string) => {
    const num = Number(input);
    if (isNaN(num)) return 'Must be a number';
    if (num < 0 || num > 100) return 'Slippage must be between 0 and 100';
    return true;
  };

  const validateVaultPercentage = (input: string) => {
    const num = Number(input);
    if (isNaN(num)) return 'Must be a number';
    if (num < 0 || num > 30) return 'Vault percentage must be between 0 and 30%';
    return true;
  };

  const validateVaultDuration = (input: string) => {
    const num = Number(input);
    if (isNaN(num)) return 'Must be a number';
    if (num < 30) return 'Vault duration must be at least 30 days';
    return true;
  };

  const validateCreatorReward = (input: string) => {
    const num = Number(input);
    if (isNaN(num)) return 'Must be a number';
    if (num < 0 || num > 80) return 'Creator reward must be between 0 and 80%';
    return true;
  };

  const validateUrl = (input: string) => {
    if (!input) return true; // Optional
    try {
      new URL(input);
      return true;
    } catch (e) {
      return 'Please enter a valid URL';
    }
  };

  async function promptUser(): Promise<ClankerAnswers> {
    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Token name:',
        validate: (input: string) => input.length > 0 || 'Name cannot be empty',
      },
      {
        type: 'input',
        name: 'symbol',
        message: 'Token symbol:',
        validate: validateSymbol,
      },
      {
        type: 'list',
        name: 'pairedTokenChoice',
        message: 'Select quote token:',
        choices: [
          { name: 'WETH', value: 'WETH' },
          { name: 'USDC', value: 'USDC' },
          { name: 'Custom Address', value: 'CUSTOM' }
        ],
        default: 'WETH'
      },
      {
        type: 'input',
        name: 'customPairedToken',
        message: 'Enter custom token address:',
        validate: validateAddress,
        when: (answers: ClankerAnswers) => answers.pairedTokenChoice === 'CUSTOM'
      },
      {
        type: 'input',
        name: 'initialMarketCapUsd',
        message: (answers: ClankerAnswers) => 
          `Enter initial market cap in ${answers.pairedTokenChoice === 'CUSTOM' ? 'quote token' : answers.pairedTokenChoice}:`,
        validate: validateAmount,
        default: (answers: ClankerAnswers) => 
          answers.pairedTokenChoice === 'WETH' ? '1' : 
          answers.pairedTokenChoice === 'USDC' ? '1000' : '1',
      },
      {
        type: 'input',
        name: 'customMarketCap',
        message: 'Enter custom market cap in quote token:',
        validate: validateAmount,
        when: (answers: any) => answers.initialMarketCapUsd === 'CUSTOM'
      },
      {
        type: 'input',
        name: 'image',
        message: 'Enter the IPFS URI for the token image:',
        validate: validateIpfsUri,
      },
      {
        type: 'list',
        name: 'devBuy.ethAmount',
        message: 'Creator buy amount (optional):',
        choices: [
          { name: 'None', value: '0' },
          { name: '0.00005 ETH', value: '0.00005' },
          { name: '0.1 ETH', value: '0.1' },
          { name: '0.5 ETH', value: '0.5' },
          { name: '1.0 ETH', value: '1.0' },
          { name: 'Custom', value: 'CUSTOM' }
        ],
        default: '0'
      },
      {
        type: 'input',
        name: 'customDevBuy',
        message: 'Enter custom dev buy amount in ETH:',
        validate: validateAmount,
        when: (answers: any) => answers.devBuy.ethAmount === 'CUSTOM'
      },
      {
        type: 'input',
        name: 'devBuy.maxSlippage',
        message: 'Maximum slippage percentage (0-100):',
        validate: validateSlippage,
        default: '5',
        when: (answers: any) => answers.devBuy.ethAmount !== '0'
      },
      {
        type: 'list',
        name: 'vaultConfig.vaultPercentage',
        message: 'Vault percentage (optional):',
        choices: [
          { name: 'None', value: '0' },
          { name: '5%', value: '5' },
          { name: '15%', value: '15' },
          { name: '30%', value: '30' },
          { name: 'Custom', value: 'CUSTOM' }
        ],
        default: '0'
      },
      {
        type: 'input',
        name: 'customVaultPercentage',
        message: 'Enter custom vault percentage (0-30):',
        validate: validateVaultPercentage,
        when: (answers: any) => answers.vaultConfig.vaultPercentage === 'CUSTOM'
      },
      {
        type: 'list',
        name: 'vaultConfig.durationInDays',
        message: 'Vault duration:',
        choices: [
          { name: '31 days', value: '31' },
          { name: '90 days', value: '90' },
          { name: '180 days', value: '180' },
          { name: 'Custom', value: 'CUSTOM' }
        ],
        default: '31',
        when: (answers: any) => answers.vaultConfig.vaultPercentage !== '0'
      },
      {
        type: 'input',
        name: 'customVaultDuration',
        message: 'Enter custom vault duration in days (minimum 30):',
        validate: validateVaultDuration,
        when: (answers: any) => answers.vaultConfig.durationInDays === 'CUSTOM'
      },
      {
        type: 'input',
        name: 'metadata.description',
        message: 'Token description:',
        default: (answers: ClankerAnswers) => `${answers.name} token deployed via Clanker CLI`,
        validate: (input: string) => input.length > 0 || 'Description cannot be empty',
      },
      {
        type: 'input',
        name: 'metadata.telegram',
        message: 'Telegram URL (optional):',
        validate: validateUrl,
      },
      {
        type: 'input',
        name: 'metadata.website',
        message: 'Website URL (optional):',
        validate: validateUrl,
      },
      {
        type: 'input',
        name: 'metadata.twitter',
        message: 'X/Twitter URL (optional):',
        validate: validateUrl,
      },
      {
        type: 'input',
        name: 'metadata.farcaster',
        message: 'Farcaster URL (optional):',
        validate: validateUrl,
      },
    ];

    const answers = await inquirer.prompt(questions);

    // Process custom values
    if (answers.initialMarketCapUsd === 'CUSTOM') {
      answers.initialMarketCapUsd = answers.customMarketCap || '0';
    }
    if (answers.devBuy.ethAmount === 'CUSTOM') {
      answers.devBuy.ethAmount = answers.customDevBuy || '0';
    }

    // Convert string values to numbers for vault config
    const vaultPercentage = answers.vaultConfig.vaultPercentage === 'CUSTOM' 
      ? parseInt(answers.customVaultPercentage || '0', 10)
      : parseInt(answers.vaultConfig.vaultPercentage, 10);

    const vaultDuration = answers.vaultConfig.durationInDays === 'CUSTOM'
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
      auditUrls: []
    };

    // Return the final config with proper types
    return {
      ...answers,
      metadata,
      vaultConfig: {
        vaultPercentage: vaultPercentage.toString(),
        durationInDays: vaultDuration.toString()
      }
    };
  }

  async function deployToken(answers: ClankerAnswers) {
    if (!PRIVATE_KEY || !FACTORY_ADDRESS) {
      throw new Error('Missing required environment variables (PRIVATE_KEY, FACTORY_ADDRESS)');
    }

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = RPC_URL ? http(RPC_URL) : http();
    
    // Initialize the wallet and public client with explicit typing
    const publicClient = createPublicClient({
      chain: base,
      transport,
    }) as PublicClient;

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport,
    }) as WalletClient;

    // Initialize Clanker SDK
    const clanker = new Clanker({
      wallet: walletClient,
      publicClient,
      factoryAddress: FACTORY_ADDRESS,
    });

    console.log('\n🔄 Preparing deployment configuration...');

    // Determine quote token address and decimals
    let quoteToken: string;
    let decimals: number;
    
    switch (answers.pairedTokenChoice) {
      case 'WETH':
        quoteToken = WETH_ADDRESS;
        decimals = 18;
        break;
      case 'USDC':
        quoteToken = USDC_ADDRESS;
        decimals = 6;
        break;
      case 'CUSTOM':
        quoteToken = answers.customPairedToken!;
        decimals = 18; // Default to 18 for custom tokens
        break;
      default:
        quoteToken = WETH_ADDRESS;
        decimals = 18;
    }

    // Deploy token with configuration
    const tokenAddress = await clanker.deployToken({
      name: answers.name,
      symbol: answers.symbol,
      salt: answers.salt || '0x0000000000000000000000000000000000000000000000000000000000000000',
      image: answers.image,
      metadata: {
        description: `${answers.name} token deployed via Clanker CLI`,
        socialMediaUrls: [],
        auditUrls: [],
      },
      context: {
        interface: 'Clanker CLI',
        platform: 'Clanker',
        messageId: `CLI-${Date.now()}`,
        id: `${answers.symbol}-${Date.now()}`,
      },
      vault: answers.vaultConfig.vaultPercentage !== '0' ? {
        percentage: parseInt(answers.vaultConfig.vaultPercentage, 10),
        durationInDays: parseInt(answers.vaultConfig.durationInDays, 10),
      } : undefined,
      pool: {
        quoteToken: quoteToken as `0x${string}`,
        initialMarketCap: answers.initialMarketCapUsd, // Pass raw value, SDK will handle decimals
      },
      devBuy: answers.devBuy.ethAmount !== '0' ? {
        ethAmount: answers.devBuy.ethAmount,
        maxSlippage: answers.devBuy.maxSlippage,
      } : undefined,
    });

    return tokenAddress;
  }

  async function main() {
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
        },
      ]);

      if (confirm) {
        console.log('\n🔄 Deploying your token...');
        try {
          const tokenAddress = await deployToken(answers);
          console.log('\n✨ Token deployed successfully!');
          console.log('📍 Token address:', tokenAddress);
          console.log('\n🌐 View on Basescan:');
          console.log(`https://basescan.org/token/${tokenAddress}`);
        } catch (error) {
          console.error('\n❌ Deployment failed:', error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      } else {
        console.log('\n❌ Deployment cancelled');
      }
      
    } catch (error) {
      console.error('\n❌ Error:', error);
      process.exit(1);
    }
  }

  await main();
}

createClanker(); 