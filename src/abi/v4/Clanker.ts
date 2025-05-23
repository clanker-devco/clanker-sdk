export const Clanker_v4_abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'owner_',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'BPS',
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
    name: 'MAX_EXTENSIONS',
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
    name: 'MAX_EXTENSION_BPS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'TOKEN_SUPPLY',
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
    name: 'admins',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
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
    name: 'claimTeamFees',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deployToken',
    inputs: [
      {
        name: 'deploymentConfig',
        type: 'tuple',
        internalType: 'struct IClanker.DeploymentConfig',
        components: [
          {
            name: 'tokenConfig',
            type: 'tuple',
            internalType: 'struct IClanker.TokenConfig',
            components: [
              {
                name: 'tokenAdmin',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'name',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'symbol',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'salt',
                type: 'bytes32',
                internalType: 'bytes32',
              },
              {
                name: 'image',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'metadata',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'context',
                type: 'string',
                internalType: 'string',
              },
              {
                name: 'originatingChainId',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'poolConfig',
            type: 'tuple',
            internalType: 'struct IClanker.PoolConfig',
            components: [
              {
                name: 'hook',
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
          },
          {
            name: 'lockerConfig',
            type: 'tuple',
            internalType: 'struct IClanker.LockerConfig',
            components: [
              {
                name: 'rewardAdmins',
                type: 'address[]',
                internalType: 'address[]',
              },
              {
                name: 'rewardRecipients',
                type: 'address[]',
                internalType: 'address[]',
              },
              {
                name: 'rewardBps',
                type: 'uint16[]',
                internalType: 'uint16[]',
              },
              {
                name: 'tickLower',
                type: 'int24[]',
                internalType: 'int24[]',
              },
              {
                name: 'tickUpper',
                type: 'int24[]',
                internalType: 'int24[]',
              },
              {
                name: 'positionBps',
                type: 'uint16[]',
                internalType: 'uint16[]',
              },
            ],
          },
          {
            name: 'mevModuleConfig',
            type: 'tuple',
            internalType: 'struct IClanker.MevModuleConfig',
            components: [
              {
                name: 'mevModule',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'mevModuleData',
                type: 'bytes',
                internalType: 'bytes',
              },
            ],
          },
          {
            name: 'extensionConfigs',
            type: 'tuple[]',
            internalType: 'struct IClanker.ExtensionConfig[]',
            components: [
              {
                name: 'extension',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'msgValue',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'extensionBps',
                type: 'uint16',
                internalType: 'uint16',
              },
              {
                name: 'extensionData',
                type: 'bytes',
                internalType: 'bytes',
              },
            ],
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'tokenAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'deployTokenZeroSupply',
    inputs: [
      {
        name: 'tokenConfig',
        type: 'tuple',
        internalType: 'struct IClanker.TokenConfig',
        components: [
          {
            name: 'tokenAdmin',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'salt',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'image',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'metadata',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'context',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'originatingChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'tokenAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deploymentInfoForToken',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'hook',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deprecated',
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
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: 'locker_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'teamFeeRecipient_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAdmin',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'enabled',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setDeprecated',
    inputs: [
      {
        name: 'deprecated_',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setExtension',
    inputs: [
      {
        name: 'extension',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'enabled',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setHook',
    inputs: [
      {
        name: 'hook',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'enabled',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMevModule',
    inputs: [
      {
        name: 'mevModule',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'enabled',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTeamFeeRecipient',
    inputs: [
      {
        name: 'teamFeeRecipient_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'teamFeeRecipient',
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
    type: 'event',
    name: 'ClaimTeamFees',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'recipient',
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
    name: 'ExtensionTriggered',
    inputs: [
      {
        name: 'extension',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'extensionSupply',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'msgValue',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
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
    name: 'SetAdmin',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'enabled',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SetDeprecated',
    inputs: [
      {
        name: 'deprecated',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SetExtension',
    inputs: [
      {
        name: 'extension',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'enabled',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SetHook',
    inputs: [
      {
        name: 'hook',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'enabled',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SetMevModule',
    inputs: [
      {
        name: 'mevModule',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'enabled',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SetTeamFeeRecipient',
    inputs: [
      {
        name: 'oldTeamFeeRecipient',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'newTeamFeeRecipient',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TokenCreated',
    inputs: [
      {
        name: 'msgSender',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'tokenAddress',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenAdmin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenImage',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'tokenName',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'tokenSymbol',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'tokenMetadata',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'tokenContext',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'startingTick',
        type: 'int24',
        indexed: false,
        internalType: 'int24',
      },
      {
        name: 'poolHook',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'poolId',
        type: 'bytes32',
        indexed: false,
        internalType: 'PoolId',
      },
      {
        name: 'pairedToken',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'mevModule',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'extensionsSupply',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'extensions',
        type: 'address[]',
        indexed: false,
        internalType: 'address[]',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AlreadyInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Deprecated',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ExtensionMsgValueMismatch',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ExtensionNotEnabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'HookNotEnabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidExtension',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidHook',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidLocker',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidMevModule',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MaxExtensionBpsExceeded',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MaxExtensionsExceeded',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MevModuleNotEnabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotFound',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OnlyNonOriginatingChains',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OnlyOriginatingChain',
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
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Unauthorized',
    inputs: [],
  },
];
