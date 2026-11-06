// Generated from the contract ABI.
export const TaxLaunchTokenDeployer_abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'factoryInitializerAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deploy',
    inputs: [
      {
        name: 'scopedSalt',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'genesisParams',
        type: 'tuple',
        internalType: 'struct TaxLaunchToken.GenesisParams',
        components: [
          {
            name: 'factory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'dividendsEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'tokenName',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'tokenSymbol',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'tokenContractURI',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'metadataAuthority',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'initialRecipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'initialSupply',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'metadataKeys',
            type: 'string[]',
            internalType: 'string[]',
          },
          {
            name: 'metadataValues',
            type: 'string[]',
            internalType: 'string[]',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
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
    name: 'factoryInitializer',
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
    name: 'initializeFactory',
    inputs: [
      {
        name: 'factoryAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'predictTokenAddress',
    inputs: [
      {
        name: 'scopedSalt',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'genesisParams',
        type: 'tuple',
        internalType: 'struct TaxLaunchToken.GenesisParams',
        components: [
          {
            name: 'factory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'dividendsEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'tokenName',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'tokenSymbol',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'tokenContractURI',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'metadataAuthority',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'initialRecipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'initialSupply',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'metadataKeys',
            type: 'string[]',
            internalType: 'string[]',
          },
          {
            name: 'metadataValues',
            type: 'string[]',
            internalType: 'string[]',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'predictedToken',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenInitCodeHash',
    inputs: [
      {
        name: 'genesisParams',
        type: 'tuple',
        internalType: 'struct TaxLaunchToken.GenesisParams',
        components: [
          {
            name: 'factory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'dividendsEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'tokenName',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'tokenSymbol',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'tokenContractURI',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'metadataAuthority',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'initialRecipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'initialSupply',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'metadataKeys',
            type: 'string[]',
            internalType: 'string[]',
          },
          {
            name: 'metadataValues',
            type: 'string[]',
            internalType: 'string[]',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'initCodeHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'error',
    name: 'AlreadyInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidConfig',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TokenAlreadyExists',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'Unauthorized',
    inputs: [],
  },
] as const;
