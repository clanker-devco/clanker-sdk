export const ClankerSniperUtil_v4_abi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_clankerSniperAuction', type: 'address', internalType: 'address' },
      { name: '_universalRouter', type: 'address', internalType: 'address' },
      { name: '_permit2', type: 'address', internalType: 'address' },
      { name: '_weth', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'bidInAuction',
    inputs: [
      {
        name: 'swapParams',
        type: 'tuple',
        internalType: 'struct IV4Router.ExactInputSingleParams',
        components: [
          {
            name: 'poolKey',
            type: 'tuple',
            internalType: 'struct PoolKey',
            components: [
              { name: 'currency0', type: 'address', internalType: 'Currency' },
              { name: 'currency1', type: 'address', internalType: 'Currency' },
              { name: 'fee', type: 'uint24', internalType: 'uint24' },
              { name: 'tickSpacing', type: 'int24', internalType: 'int24' },
              { name: 'hooks', type: 'address', internalType: 'contract IHooks' },
            ],
          },
          { name: 'zeroForOne', type: 'bool', internalType: 'bool' },
          { name: 'amountIn', type: 'uint128', internalType: 'uint128' },
          { name: 'amountOutMinimum', type: 'uint128', internalType: 'uint128' },
          { name: 'hookData', type: 'bytes', internalType: 'bytes' },
        ],
      },
      { name: 'round', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getTxGasPriceForBidAmount',
    inputs: [
      { name: 'auctionGasPeg', type: 'uint256', internalType: 'uint256' },
      { name: 'desiredBidAmount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: 'txGasPrice', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'AuctionSuccessful',
    inputs: [
      { name: 'poolId', type: 'bytes32', indexed: true, internalType: 'PoolId' },
      { name: 'round', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'payee', type: 'address', indexed: true, internalType: 'address' },
      { name: 'paymentAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'amountIn', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'amountOut', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'AuctionDidNotAdvance', inputs: [] },
  { type: 'error', name: 'GasPriceTooLow', inputs: [] },
  { type: 'error', name: 'InvalidBidAmount', inputs: [] },
  { type: 'error', name: 'InvalidBlock', inputs: [] },
  { type: 'error', name: 'InvalidRound', inputs: [] },
  { type: 'error', name: 'ReentrancyGuardReentrantCall', inputs: [] },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [{ name: 'token', type: 'address', internalType: 'address' }],
  },
  { type: 'error', name: 'ValueBidMismatch', inputs: [] },
] as const;
