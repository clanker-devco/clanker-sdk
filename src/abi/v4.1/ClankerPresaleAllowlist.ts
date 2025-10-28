export const Clanker_PresaleAllowlist_v4_1_abi = [
  {
    type: 'constructor',
    inputs: [{ name: 'presale_', type: 'address', internalType: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowlists',
    inputs: [{ name: 'presaleId', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      { name: 'presaleOwner', type: 'address', internalType: 'address' },
      { name: 'merkleRoot', type: 'bytes32', internalType: 'bytes32' },
      { name: 'enabled', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllowedAmountForBuyer',
    inputs: [
      { name: 'presaleId', type: 'uint256', internalType: 'uint256' },
      { name: 'buyer', type: 'address', internalType: 'address' },
      { name: 'proof', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      { name: 'presaleId', type: 'uint256', internalType: 'uint256' },
      { name: 'presaleOwner', type: 'address', internalType: 'address' },
      { name: 'initializationData', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'presale',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setAddressOverride',
    inputs: [
      { name: 'presaleId', type: 'uint256', internalType: 'uint256' },
      { name: 'buyer', type: 'address', internalType: 'address' },
      { name: 'allowedAmount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAllowlistEnabled',
    inputs: [
      { name: 'presaleId', type: 'uint256', internalType: 'uint256' },
      { name: 'enabled', type: 'bool', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMerkleRoot',
    inputs: [
      { name: 'presaleId', type: 'uint256', internalType: 'uint256' },
      { name: 'merkleRoot', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'Initialize',
    inputs: [
      { name: 'presaleId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'presaleOwner', type: 'address', indexed: true, internalType: 'address' },
      { name: 'merkleRoot', type: 'bytes32', indexed: false, internalType: 'bytes32' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SetAddressOverride',
    inputs: [
      { name: 'presaleId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'buyer', type: 'address', indexed: true, internalType: 'address' },
      { name: 'allowedAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SetAllowlistEnabled',
    inputs: [
      { name: 'presaleId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'enabled', type: 'bool', indexed: false, internalType: 'bool' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SetMerkleRoot',
    inputs: [
      { name: 'presaleId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'merkleRoot', type: 'bytes32', indexed: false, internalType: 'bytes32' },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'InvalidProof', inputs: [] },
  { type: 'error', name: 'MerkleRootNotSet', inputs: [] },
  { type: 'error', name: 'Unauthorized', inputs: [] },
] as const;
