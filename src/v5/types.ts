import type { ContractFunctionArgs } from 'viem';
import type { TaxRWAERC20LaunchpadFactory_abi } from '../abi/v5/TaxRWAERC20LaunchpadFactory.js';

export type TaxLaunchParams = ContractFunctionArgs<
  typeof TaxRWAERC20LaunchpadFactory_abi,
  'payable',
  'createLaunch'
>[0];

export type TaxLaunchBuyParams = ContractFunctionArgs<
  typeof TaxRWAERC20LaunchpadFactory_abi,
  'payable',
  'createLaunchAndBuy'
>[1];
