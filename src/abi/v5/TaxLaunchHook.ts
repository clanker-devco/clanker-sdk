// Generated from the contract ABI.
export const TaxLaunchHook_abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'poolManagerAddress',
        type: 'address',
        internalType: 'contract IPoolManager',
      },
      {
        name: 'hookDeployer',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'BURN_SINK',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MAX_FEE_SLOTS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MAX_LAUNCH_BUY_ROUTE_DATA_LENGTH',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MAX_TOTAL_FEE_RATE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'RATE_SCALE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'afterAddLiquidity',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IPoolManager.ModifyLiquidityParams',
        components: [
          {
            name: 'tickLower',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'tickUpper',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'liquidityDelta',
            type: 'int256',
            internalType: 'int256',
          },
          {
            name: 'salt',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
      {
        name: 'delta',
        type: 'int256',
        internalType: 'BalanceDelta',
      },
      {
        name: 'feesAccrued',
        type: 'int256',
        internalType: 'BalanceDelta',
      },
      {
        name: 'hookData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
      {
        name: '',
        type: 'int256',
        internalType: 'BalanceDelta',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'afterDonate',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'amount0',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'amount1',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'hookData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'afterInitialize',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'sqrtPriceX96',
        type: 'uint160',
        internalType: 'uint160',
      },
      {
        name: 'tick',
        type: 'int24',
        internalType: 'int24',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'afterRemoveLiquidity',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IPoolManager.ModifyLiquidityParams',
        components: [
          {
            name: 'tickLower',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'tickUpper',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'liquidityDelta',
            type: 'int256',
            internalType: 'int256',
          },
          {
            name: 'salt',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
      {
        name: 'delta',
        type: 'int256',
        internalType: 'BalanceDelta',
      },
      {
        name: 'feesAccrued',
        type: 'int256',
        internalType: 'BalanceDelta',
      },
      {
        name: 'hookData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
      {
        name: '',
        type: 'int256',
        internalType: 'BalanceDelta',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'afterSwap',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IPoolManager.SwapParams',
        components: [
          {
            name: 'zeroForOne',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'amountSpecified',
            type: 'int256',
            internalType: 'int256',
          },
          {
            name: 'sqrtPriceLimitX96',
            type: 'uint160',
            internalType: 'uint160',
          },
        ],
      },
      {
        name: 'delta',
        type: 'int256',
        internalType: 'BalanceDelta',
      },
      {
        name: 'hookData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
      {
        name: '',
        type: 'int128',
        internalType: 'int128',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'beforeAddLiquidity',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IPoolManager.ModifyLiquidityParams',
        components: [
          {
            name: 'tickLower',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'tickUpper',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'liquidityDelta',
            type: 'int256',
            internalType: 'int256',
          },
          {
            name: 'salt',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
      {
        name: 'hookData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'beforeDonate',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'amount0',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'amount1',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'hookData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'beforeInitialize',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'sqrtPriceX96',
        type: 'uint160',
        internalType: 'uint160',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'beforeRemoveLiquidity',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IPoolManager.ModifyLiquidityParams',
        components: [
          {
            name: 'tickLower',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'tickUpper',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'liquidityDelta',
            type: 'int256',
            internalType: 'int256',
          },
          {
            name: 'salt',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
      {
        name: 'hookData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'beforeSwap',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IPoolManager.SwapParams',
        components: [
          {
            name: 'zeroForOne',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'amountSpecified',
            type: 'int256',
            internalType: 'int256',
          },
          {
            name: 'sqrtPriceLimitX96',
            type: 'uint160',
            internalType: 'uint160',
          },
        ],
      },
      {
        name: 'hookData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
      {
        name: '',
        type: 'int256',
        internalType: 'BeforeSwapDelta',
      },
      {
        name: '',
        type: 'uint24',
        internalType: 'uint24',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deployer',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'effectiveFeeRates',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
      {
        name: 'isBuy',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'rate',
        type: 'tuple',
        internalType: 'struct TaxFeeMath.Rates',
        components: [
          {
            name: 'quoteRate',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'burnRate',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'protocolRate',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'creatorRate',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'dividendRate',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'integratorRate',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'surchargeRate',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'exactOutputRestricted',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'executeLaunchBuy',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
      {
        name: 'request',
        type: 'tuple',
        internalType: 'struct ILaunchBuyAdapter.LaunchBuyRequest',
        components: [
          {
            name: 'originalCreator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'launchToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'quoteToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'poolKey',
            type: 'tuple',
            internalType: 'struct PoolKey',
            components: [
              {
                name: 'currency0',
                type: 'address',
                internalType: 'Currency',
              },
              {
                name: 'currency1',
                type: 'address',
                internalType: 'Currency',
              },
              {
                name: 'fee',
                type: 'uint24',
                internalType: 'uint24',
              },
              {
                name: 'tickSpacing',
                type: 'int24',
                internalType: 'int24',
              },
              {
                name: 'hooks',
                type: 'address',
                internalType: 'contract IHooks',
              },
            ],
          },
          {
            name: 'fundingToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'amountIn',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'minAmountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'deadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'routeData',
            type: 'bytes',
            internalType: 'bytes',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'amountOut',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'factory',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'feeEscrow',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getHookPermissions',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Hooks.Permissions',
        components: [
          {
            name: 'beforeInitialize',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'afterInitialize',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'beforeAddLiquidity',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'afterAddLiquidity',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'beforeRemoveLiquidity',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'afterRemoveLiquidity',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'beforeSwap',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'afterSwap',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'beforeDonate',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'afterDonate',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'beforeSwapReturnDelta',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'afterSwapReturnDelta',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'afterAddLiquidityReturnDelta',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'afterRemoveLiquidityReturnDelta',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: 'factoryAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'feeEscrowAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isDividendContract',
    inputs: [
      {
        name: 'dividend',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'registered',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'launchBuyAdapter',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'launchConsented',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
    ],
    outputs: [
      {
        name: 'accepted',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'poolConfig',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
    ],
    outputs: [
      {
        name: 'initialized',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'tokenIsCurrency0',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'quoteToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'currentCreator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'creatorFeeRecipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'protocolFeeConfiguration',
        type: 'tuple',
        internalType: 'struct TaxFeeMath.ProtocolFeeConfiguration',
        components: [
          {
            name: 'protocolTaxShare',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'minimumProtocolFeeRate',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'maximumProtocolFeeRate',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'protocolFeeRecipient',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: 'antiSnipeConfiguration',
        type: 'tuple',
        internalType: 'struct TaxFeeMath.AntiSnipeConfiguration',
        components: [
          {
            name: 'startTotalFeeRate',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'windowSeconds',
            type: 'uint32',
            internalType: 'uint32',
          },
        ],
      },
      {
        name: 'launchTime',
        type: 'uint48',
        internalType: 'uint48',
      },
      {
        name: 'antiSnipeEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'integratorFeeRecipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dividend',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'taxConfiguration',
        type: 'tuple',
        internalType: 'struct TaxFeeMath.TaxConfiguration',
        components: [
          {
            name: 'buyTaxRate',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'sellTaxRate',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'creatorAllocationShare',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'burnAllocationShare',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'dividendAllocationShare',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'integratorAllocationShare',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'minimumDividendHolding',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'poolFeeSlots',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct TaxLaunchHook.FeeSlot[]',
        components: [
          {
            name: 'recipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'admin',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'weightBps',
            type: 'uint16',
            internalType: 'uint16',
          },
          {
            name: 'isCreator',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'poolManager',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IPoolManager',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registerPool',
    inputs: [
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'registration',
        type: 'tuple',
        internalType: 'struct TaxLaunchHook.PoolRegistration',
        components: [
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'creator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'launcher',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'creatorFeeRecipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'integratorFeeRecipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'dividend',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'launchTime',
            type: 'uint48',
            internalType: 'uint48',
          },
          {
            name: 'antiSnipeEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'admittedPolicy',
            type: 'tuple',
            internalType: 'struct TaxFeeMath.TaxPolicy',
            components: [
              {
                name: 'taxFeeBounds',
                type: 'tuple',
                internalType: 'struct TaxFeeMath.TaxFeeBounds',
                components: [
                  {
                    name: 'minimumBuyTaxRate',
                    type: 'uint32',
                    internalType: 'uint32',
                  },
                  {
                    name: 'maximumBuyTaxRate',
                    type: 'uint32',
                    internalType: 'uint32',
                  },
                  {
                    name: 'minimumSellTaxRate',
                    type: 'uint32',
                    internalType: 'uint32',
                  },
                  {
                    name: 'maximumSellTaxRate',
                    type: 'uint32',
                    internalType: 'uint32',
                  },
                ],
              },
              {
                name: 'protocolFeeConfiguration',
                type: 'tuple',
                internalType: 'struct TaxFeeMath.ProtocolFeeConfiguration',
                components: [
                  {
                    name: 'protocolTaxShare',
                    type: 'uint32',
                    internalType: 'uint32',
                  },
                  {
                    name: 'minimumProtocolFeeRate',
                    type: 'uint32',
                    internalType: 'uint32',
                  },
                  {
                    name: 'maximumProtocolFeeRate',
                    type: 'uint32',
                    internalType: 'uint32',
                  },
                  {
                    name: 'protocolFeeRecipient',
                    type: 'address',
                    internalType: 'address',
                  },
                ],
              },
              {
                name: 'antiSnipeConfiguration',
                type: 'tuple',
                internalType: 'struct TaxFeeMath.AntiSnipeConfiguration',
                components: [
                  {
                    name: 'startTotalFeeRate',
                    type: 'uint32',
                    internalType: 'uint32',
                  },
                  {
                    name: 'windowSeconds',
                    type: 'uint32',
                    internalType: 'uint32',
                  },
                ],
              },
              {
                name: 'minimumDividendHoldingRequirement',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'taxConfiguration',
            type: 'tuple',
            internalType: 'struct TaxFeeMath.TaxConfiguration',
            components: [
              {
                name: 'buyTaxRate',
                type: 'uint32',
                internalType: 'uint32',
              },
              {
                name: 'sellTaxRate',
                type: 'uint32',
                internalType: 'uint32',
              },
              {
                name: 'creatorAllocationShare',
                type: 'uint32',
                internalType: 'uint32',
              },
              {
                name: 'burnAllocationShare',
                type: 'uint32',
                internalType: 'uint32',
              },
              {
                name: 'dividendAllocationShare',
                type: 'uint32',
                internalType: 'uint32',
              },
              {
                name: 'integratorAllocationShare',
                type: 'uint32',
                internalType: 'uint32',
              },
              {
                name: 'minimumDividendHolding',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'feeSlots',
            type: 'tuple[]',
            internalType: 'struct TaxLaunchHook.FeeSlotInput[]',
            components: [
              {
                name: 'recipient',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'admin',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'relativeWeightBps',
                type: 'uint16',
                internalType: 'uint16',
              },
              {
                name: 'isCreator',
                type: 'bool',
                internalType: 'bool',
              },
            ],
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'seedLiquidity',
    inputs: [
      {
        name: 'key',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          {
            name: 'currency0',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'currency1',
            type: 'address',
            internalType: 'Currency',
          },
          {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'hooks',
            type: 'address',
            internalType: 'contract IHooks',
          },
        ],
      },
      {
        name: 'positions',
        type: 'tuple[]',
        internalType: 'struct TaxLaunchHook.SeedPosition[]',
        components: [
          {
            name: 'tickLower',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'tickUpper',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'liquidity',
            type: 'uint128',
            internalType: 'uint128',
          },
        ],
      },
      {
        name: 'tokenIsCurrency0',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setLaunchBuyAdapter',
    inputs: [
      {
        name: 'newLaunchBuyAdapter',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unlockCallback',
    inputs: [
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateCreatorRights',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
      {
        name: 'newCreator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'newCreatorFeeRecipient',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateFeeSlotAdmin',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
      {
        name: 'slotIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'newAdmin',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateFeeSlotRecipient',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
      {
        name: 'slotIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'newRecipient',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'wired',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'AntiSnipeFeeCredited',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'currency',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BurnTaxCredited',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sink',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CreatorRightsUpdated',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'previousCreator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newCreator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'previousCreatorFeeRecipient',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'newCreatorFeeRecipient',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CreatorTaxCredited',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'currency',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DividendTaxCredited',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'dividend',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'currency',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DividendTaxRedirected',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'currency',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FeeSlotAdminUpdated',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'slotIndex',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'oldAdmin',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'newAdmin',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FeeSlotCreated',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'slotIndex',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'admin',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'weightBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
      {
        name: 'isCreator',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FeeSlotRecipientUpdated',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'slotIndex',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'oldRecipient',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'newRecipient',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'IntegratorAttributed',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'integratorFeeRecipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'IntegratorTaxCredited',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'currency',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LaunchConsented',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'integrator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PoolRegistered',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'originalCreator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'creatorFeeRecipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ProtocolFeeCredited',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'currency',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Seeded',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'tokenAmountSeeded',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Trade',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: true,
        internalType: 'PoolId',
      },
      {
        name: 'executor',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'referrer',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'quoteCurrency',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'quoteFeeAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'comment',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Wired',
    inputs: [
      {
        name: 'factory',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'feeEscrow',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AlreadyRegistered',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AntiSnipeUnavailable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BadWiring',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CreatorSlotManagedByFactory',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ExactOutputDisabledDuringAntiSnipe',
    inputs: [],
  },
  {
    type: 'error',
    name: 'HookNotImplemented',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientGasForLaunchConsent',
    inputs: [],
  },
  {
    type: 'error',
    name: 'IntegratorRejectedLaunch',
    inputs: [
      {
        name: 'integrator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidFeeConfig',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidFeeSchedule',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidFeeSlots',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidLaunchBuyAdapter',
    inputs: [
      {
        name: 'adapter',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidLaunchBuyDirection',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidLaunchBuyRequest',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidProtocolFeeConfiguration',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTaxConfiguration',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LaunchBuyAdapterNotConfigured',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LaunchBuyContextActive',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LaunchBuyContextMismatch',
    inputs: [
      {
        name: 'expectedPoolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
      {
        name: 'actualPoolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
      {
        name: 'expectedSwapCaller',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'actualSwapCaller',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'LaunchBuyContextMissing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LaunchBuyContextNotConsumed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LaunchBuyExactOutputUnsupported',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LaunchBuyMultipleSwaps',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LiquidityLocked',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MathOverflowedMulDiv',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotDeployer',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotFactory',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotPoolManager',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotSingleSided',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotSlotAdmin',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotWired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PartialFillUnsupported',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroLaunchBuyOutput',
    inputs: [],
  },
] as const;
