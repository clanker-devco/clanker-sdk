export const ClankerAirdrop_abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "factory_",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "airdrops",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "merkleRoot",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "totalSupply",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "totalClaimed",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "lockupEndTime",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "vestingEndTime",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "amountAvailableToClaim",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "allocatedAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "claim",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "allocatedAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "proof",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "factory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "receiveTokens",
    inputs: [
      {
        name: "deploymentConfig",
        type: "tuple",
        internalType: "struct IClanker.DeploymentConfig",
        components: [
          {
            name: "tokenConfig",
            type: "tuple",
            internalType: "struct IClanker.TokenConfig",
            components: [
              {
                name: "tokenAdmin",
                type: "address",
                internalType: "address",
              },
              {
                name: "name",
                type: "string",
                internalType: "string",
              },
              {
                name: "symbol",
                type: "string",
                internalType: "string",
              },
              {
                name: "salt",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "image",
                type: "string",
                internalType: "string",
              },
              {
                name: "metadata",
                type: "string",
                internalType: "string",
              },
              {
                name: "context",
                type: "string",
                internalType: "string",
              },
              {
                name: "originatingChainId",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "poolConfig",
            type: "tuple",
            internalType: "struct IClanker.PoolConfig",
            components: [
              {
                name: "hook",
                type: "address",
                internalType: "address",
              },
              {
                name: "pairedToken",
                type: "address",
                internalType: "address",
              },
              {
                name: "tickIfToken0IsClanker",
                type: "int24",
                internalType: "int24",
              },
              {
                name: "tickSpacing",
                type: "int24",
                internalType: "int24",
              },
              {
                name: "poolData",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "lockerConfig",
            type: "tuple",
            internalType: "struct IClanker.LockerConfig",
            components: [
              {
                name: "rewardAdmins",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "rewardRecipients",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "rewardBps",
                type: "uint16[]",
                internalType: "uint16[]",
              },
              {
                name: "tickLower",
                type: "int24[]",
                internalType: "int24[]",
              },
              {
                name: "tickUpper",
                type: "int24[]",
                internalType: "int24[]",
              },
              {
                name: "positionBps",
                type: "uint16[]",
                internalType: "uint16[]",
              },
            ],
          },
          {
            name: "mevModuleConfig",
            type: "tuple",
            internalType: "struct IClanker.MevModuleConfig",
            components: [
              {
                name: "mevModule",
                type: "address",
                internalType: "address",
              },
              {
                name: "mevModuleData",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "extensionConfigs",
            type: "tuple[]",
            internalType: "struct IClanker.ExtensionConfig[]",
            components: [
              {
                name: "extension",
                type: "address",
                internalType: "address",
              },
              {
                name: "msgValue",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "extensionBps",
                type: "uint16",
                internalType: "uint16",
              },
              {
                name: "extensionData",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
        ],
      },
      {
        name: "",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "fee",
            type: "uint24",
            internalType: "uint24",
          },
          {
            name: "tickSpacing",
            type: "int24",
            internalType: "int24",
          },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "extensionSupply",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "extensionIndex",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "event",
    name: "AirdropClaimed",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "totalUserAmountClaimed",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "userAmountStillLocked",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AirdropCreated",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "merkleRoot",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "supply",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AirdropAlreadyExists",
    inputs: [],
  },
  {
    type: "error",
    name: "AirdropNotUnlocked",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidAirdropPercentage",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidMerkleRoot",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidMsgValue",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidProof",
    inputs: [],
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: [],
  },
  {
    type: "error",
    name: "TotalMaxClaimed",
    inputs: [],
  },
  {
    type: "error",
    name: "Unauthorized",
    inputs: [],
  },
  {
    type: "error",
    name: "UserMaxClaimed",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroClaim",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroToClaim",
    inputs: [],
  },
];
