export const ClankerHook_abi = [
  {
    type: 'function',
    name: 'FEE_DENOMINATOR',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'int128',
        internalType: 'int128',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MAX_LP_FEE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint24',
        internalType: 'uint24',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MAX_MEV_MODULE_DELAY',
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
    name: 'PROTOCOL_FEE_NUMERATOR',
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
    name: 'initializeMevModule',
    inputs: [
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
        name: 'mevModuleData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'initializePool',
    inputs: [
      {
        name: 'clanker',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pairedToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'tickIfToken0IsClanker',
        type: 'int24',
        internalType: 'int24',
      },
      {
        name: 'tickSpacing',
        type: 'int24',
        internalType: 'int24',
      },
      {
        name: '_mevModule',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'poolData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
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
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'initializePoolOpen',
    inputs: [
      {
        name: 'clanker',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pairedToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'tickIfToken0IsClanker',
        type: 'int24',
        internalType: 'int24',
      },
      {
        name: 'tickSpacing',
        type: 'int24',
        internalType: 'int24',
      },
      {
        name: 'poolData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
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
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'locker',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IClankerLpLocker',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mevModule',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'PoolId',
      },
    ],
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
    name: 'mevModuleEnabled',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'PoolId',
      },
    ],
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
    type: 'function',
    name: 'owner',
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
    name: 'poolCreationTimestamp',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'PoolId',
      },
    ],
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
    name: 'protocolFee',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint24',
        internalType: 'uint24',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [
      {
        name: 'interfaceId',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'weth',
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
    type: 'event',
    name: 'ClaimProtocolFees',
    inputs: [
      {
        name: 'token',
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
    name: 'MevModuleDisabled',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        indexed: false,
        internalType: 'PoolId',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PoolCreatedFactory',
    inputs: [
      {
        name: 'pairedToken',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'clanker',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: false,
        internalType: 'PoolId',
      },
      {
        name: 'tickIfToken0IsClanker',
        type: 'int24',
        indexed: false,
        internalType: 'int24',
      },
      {
        name: 'tickSpacing',
        type: 'int24',
        indexed: false,
        internalType: 'int24',
      },
      {
        name: 'mevModule',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PoolCreatedOpen',
    inputs: [
      {
        name: 'pairedToken',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'clanker',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: false,
        internalType: 'PoolId',
      },
      {
        name: 'tickIfToken0IsClanker',
        type: 'int24',
        indexed: false,
        internalType: 'int24',
      },
      {
        name: 'tickSpacing',
        type: 'int24',
        indexed: false,
        internalType: 'int24',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'ETHPoolNotAllowed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'HookNotImplemented',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MevModuleEnabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotPoolManager',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OnlyFactory',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'PastCreationTimestamp',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UnsupportedInitializePath',
    inputs: [],
  },
  {
    type: 'error',
    name: 'WethCannotBeClanker',
    inputs: [],
  },
] as const;
