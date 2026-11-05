// Generated from the contract ABI.
export const TaxDividendClaimHelper_abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'launchHook',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'MAX_BATCH_SIZE',
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
    name: 'claimDividends',
    inputs: [
      {
        name: 'claims',
        type: 'tuple[]',
        internalType: 'struct ITaxDividendClaimHelper.Claim[]',
        components: [
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'unwrapWrappedNative',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'paidCount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'paid',
        type: 'bool[]',
        internalType: 'bool[]',
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
    name: 'hook',
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
    name: 'DividendsClaimed',
    inputs: [
      {
        name: 'holder',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'requestedCount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'paidCount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'DuplicateToken',
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
    name: 'InvalidBatch',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidConfiguration',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidDividend',
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
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
] as const;
