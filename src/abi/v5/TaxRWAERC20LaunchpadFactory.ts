// Generated from the contract ABI.
export const TaxRWAERC20LaunchpadFactory_abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'poolManagerAddress',
        type: 'address',
        internalType: 'contract IPoolManager',
      },
      {
        name: 'launchHook',
        type: 'address',
        internalType: 'contract TaxLaunchHook',
      },
      {
        name: 'launchTokenDeployer',
        type: 'address',
        internalType: 'contract TaxLaunchTokenDeployer',
      },
      {
        name: 'launchDividendDeployer',
        type: 'address',
        internalType: 'contract TaxDividendDeployer',
      },
      {
        name: 'initialFactoryConfiguration',
        type: 'tuple',
        internalType: 'struct TaxLaunchpadFactoryCore.FactoryInitialization',
        components: [
          {
            name: 'launchSupply',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'tickSpacing',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'taxPolicy',
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
            name: 'bandTemplate',
            type: 'tuple[]',
            internalType: 'struct TaxLaunchpadFactoryCore.Band[]',
            components: [
              {
                name: 'lowerOffset',
                type: 'int24',
                internalType: 'int24',
              },
              {
                name: 'upperOffset',
                type: 'int24',
                internalType: 'int24',
              },
              {
                name: 'supplyShareBps',
                type: 'uint16',
                internalType: 'uint16',
              },
            ],
          },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'MAX_DIVIDEND_BATCH_SIZE',
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
    name: 'MAX_QUOTE_BATCH_SIZE',
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
    name: 'MAX_SUPPLY',
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
    name: 'MIN_SUPPLY',
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
    name: 'PERCENTAGE_SCALE',
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
    name: 'TOKEN_ADDRESS_SUFFIX',
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
    name: 'acceptCreatorAdmin',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'acceptCreatorRightsTransfer',
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
    name: 'acceptOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'announcementRegistry',
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
    name: 'bandTemplate',
    inputs: [],
    outputs: [
      {
        name: 'bands',
        type: 'tuple[]',
        internalType: 'struct TaxLaunchpadFactoryCore.Band[]',
        components: [
          {
            name: 'lowerOffset',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'upperOffset',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'supplyShareBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'batchRegisterQuotes',
    inputs: [
      {
        name: 'quoteRegistrations',
        type: 'tuple[]',
        internalType: 'struct IRWAQuoteRegistry.QuoteRegistration[]',
        components: [
          {
            name: 'quoteToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'startTickToken0Frame',
            type: 'int24',
            internalType: 'int24',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'batchSetQuoteStartTicks',
    inputs: [
      {
        name: 'quoteTickUpdates',
        type: 'tuple[]',
        internalType: 'struct IRWAQuoteRegistry.QuoteTickUpdate[]',
        components: [
          {
            name: 'quoteToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'newStartTickToken0Frame',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'expectedRevision',
            type: 'uint64',
            internalType: 'uint64',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'batchUnregisterQuotes',
    inputs: [
      {
        name: 'quoteTokens',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelCreatorAdminTransfer',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelCreatorRightsTransfer',
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
    name: 'configVersion',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'createLaunch',
    inputs: [
      {
        name: 'launchParams',
        type: 'tuple',
        internalType: 'struct TaxLaunchpadFactoryCore.LaunchParams',
        components: [
          {
            name: 'creator',
            type: 'address',
            internalType: 'address',
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
            name: 'creatorSalt',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'quoteToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'expectedConfigVersion',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'deadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'metadataEditable',
            type: 'bool',
            internalType: 'bool',
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
            name: 'antiSnipeEnabled',
            type: 'bool',
            internalType: 'bool',
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
      {
        name: 'poolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createLaunchAndBuy',
    inputs: [
      {
        name: 'launchParams',
        type: 'tuple',
        internalType: 'struct TaxLaunchpadFactoryCore.LaunchParams',
        components: [
          {
            name: 'creator',
            type: 'address',
            internalType: 'address',
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
            name: 'creatorSalt',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'quoteToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'expectedConfigVersion',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'deadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'metadataEditable',
            type: 'bool',
            internalType: 'bool',
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
            name: 'antiSnipeEnabled',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: 'launchBuyParams',
        type: 'tuple',
        internalType: 'struct TaxLaunchpadFactoryCore.LaunchBuyParams',
        components: [
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
            name: 'routeData',
            type: 'bytes',
            internalType: 'bytes',
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
      {
        name: 'poolId',
        type: 'bytes32',
        internalType: 'PoolId',
      },
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
    name: 'creatorAdmin',
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
    name: 'creatorRights',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'rights',
        type: 'tuple',
        internalType: 'struct TaxLaunchpadFactoryCore.CreatorRights',
        components: [
          {
            name: 'originalCreator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'currentCreator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'pendingCreator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'creatorFeeRecipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'poolId',
            type: 'bytes32',
            internalType: 'PoolId',
          },
          {
            name: 'metadataEditable',
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
    name: 'currentCreatorOf',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'currentCreator',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'defaultDividendExclusions',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'dividendDeployer',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract TaxDividendDeployer',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'dividendOf',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
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
    name: 'emergencyWithdrawDividendAssets',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'asset',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hook',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract TaxLaunchHook',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isLaunchSaltUsed',
    inputs: [
      {
        name: 'scopedSalt',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'used',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isLaunchToken',
    inputs: [
      {
        name: 'token',
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
    name: 'launchBuyAdapter',
    inputs: [],
    outputs: [
      {
        name: 'adapter',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'launchCreationEnabled',
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
    name: 'launchSupply',
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
    name: 'launchTokenInitCodeHash',
    inputs: [
      {
        name: 'launchParams',
        type: 'tuple',
        internalType: 'struct TaxLaunchpadFactoryCore.LaunchParams',
        components: [
          {
            name: 'creator',
            type: 'address',
            internalType: 'address',
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
            name: 'creatorSalt',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'quoteToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'expectedConfigVersion',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'deadline',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'metadataEditable',
            type: 'bool',
            internalType: 'bool',
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
            name: 'antiSnipeEnabled',
            type: 'bool',
            internalType: 'bool',
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
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'launchValidation',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract TaxLaunchValidation',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nativeLaunchFee',
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
    name: 'pendingCreatorAdmin',
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
    name: 'pendingOwner',
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
    name: 'previewTaxConfiguration',
    inputs: [
      {
        name: 'configuration',
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
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct TaxFeeMath.TaxConfigurationPreview',
        components: [
          {
            name: 'configVersion',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'buyRates',
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
            name: 'sellRates',
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
            name: 'dividendsEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'minimumDividendHoldingRequirement',
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
    name: 'priceUpdater',
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
    name: 'proposeCreatorRightsTransfer',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'newCreator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'quoteConfig',
    inputs: [
      {
        name: 'quoteToken',
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
      {
        name: 'quoteDecimals',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'startTickToken0Frame',
        type: 'int24',
        internalType: 'int24',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'quoteRevision',
    inputs: [
      {
        name: 'quoteToken',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'revision',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'refreshLaunchDividendShares',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'holders',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerQuote',
    inputs: [
      {
        name: 'quoteToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'startTickToken0Frame',
        type: 'int24',
        internalType: 'int24',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'revokeCreatorAdmin',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'safeTransferCreatorRights',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rightsReceiver',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'callbackData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'setAnnouncementRegistry',
    inputs: [
      {
        name: 'newAnnouncementRegistry',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAntiSnipeConfiguration',
    inputs: [
      {
        name: 'configuration',
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
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setBandTemplate',
    inputs: [
      {
        name: 'newBandTemplate',
        type: 'tuple[]',
        internalType: 'struct TaxLaunchpadFactoryCore.Band[]',
        components: [
          {
            name: 'lowerOffset',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'upperOffset',
            type: 'int24',
            internalType: 'int24',
          },
          {
            name: 'supplyShareBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setCreatorFeeRecipient',
    inputs: [
      {
        name: 'token',
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
    name: 'setDefaultDividendExclusion',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'excluded',
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
    name: 'setLaunchCreationEnabled',
    inputs: [
      {
        name: 'creationEnabled',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setLaunchDividendExclusions',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'accounts',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'excluded',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setLaunchDividendReceiver',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'holder',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setLaunchSupply',
    inputs: [
      {
        name: 'newLaunchSupply',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMinimumDividendHoldingRequirement',
    inputs: [
      {
        name: 'minimumHolding',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setNativeLaunchFee',
    inputs: [
      {
        name: 'newNativeLaunchFee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setPriceUpdater',
    inputs: [
      {
        name: 'newPriceUpdater',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setProtocolFeeConfiguration',
    inputs: [
      {
        name: 'configuration',
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
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setQuoteStartTick',
    inputs: [
      {
        name: 'quoteToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'newStartTickToken0Frame',
        type: 'int24',
        internalType: 'int24',
      },
      {
        name: 'expectedRevision',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTaxFeeBounds',
    inputs: [
      {
        name: 'bounds',
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
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTaxPolicy',
    inputs: [
      {
        name: 'policy',
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
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTickSpacing',
    inputs: [
      {
        name: 'newTickSpacing',
        type: 'int24',
        internalType: 'int24',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'taxPolicy',
    inputs: [],
    outputs: [
      {
        name: '',
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
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tickSpacing',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'int24',
        internalType: 'int24',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenDeployer',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract TaxLaunchTokenDeployer',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferCreatorAdmin',
    inputs: [
      {
        name: 'newCreatorAdmin',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'unregisterQuote',
    inputs: [
      {
        name: 'quoteToken',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateTokenContractURI',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'newContractURI',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateTokenExtraMetadata',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'metadataKey',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'metadataValue',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateTokenName',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'newName',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateTokenSymbol',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'newSymbol',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'AnnouncementRegistrySet',
    inputs: [
      {
        name: 'announcementRegistry',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BandTemplateUpdated',
    inputs: [
      {
        name: 'bandCount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ConfigVersionUpdated',
    inputs: [
      {
        name: 'newConfigVersion',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CreatorAdminRevoked',
    inputs: [
      {
        name: 'previousCreatorAdmin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CreatorAdminTransferCancelled',
    inputs: [
      {
        name: 'currentCreatorAdmin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'cancelledPendingCreatorAdmin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CreatorAdminTransferStarted',
    inputs: [
      {
        name: 'currentCreatorAdmin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'pendingCreatorAdmin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CreatorAdminTransferred',
    inputs: [
      {
        name: 'previousCreatorAdmin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newCreatorAdmin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CreatorFeeRecipientUpdated',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'previousCreatorFeeRecipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newCreatorFeeRecipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CreatorRightsTransferCancelled',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'currentCreator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'cancelledPendingCreator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CreatorRightsTransferProposed',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'currentCreator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'pendingCreator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CreatorRightsTransferred',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
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
    name: 'DefaultDividendExclusionUpdated',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'excluded',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'configVersion',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LaunchBuyAdapterUpdated',
    inputs: [
      {
        name: 'previousLaunchBuyAdapter',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newLaunchBuyAdapter',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LaunchBuyExecuted',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
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
        name: 'fundingToken',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amountIn',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'amountOut',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'launchBuyAdapter',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LaunchCreationEnabledUpdated',
    inputs: [
      {
        name: 'creationEnabled',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LaunchSupplyUpdated',
    inputs: [
      {
        name: 'previousLaunchSupply',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newLaunchSupply',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LaunchTaxConfigured',
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
        name: 'configVersion',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'admittedPolicy',
        type: 'tuple',
        indexed: false,
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
        indexed: false,
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
        name: 'integratorFeeRecipient',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'antiSnipeEnabled',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Launched',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
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
        name: 'quoteToken',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'launchSupply',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
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
    type: 'event',
    name: 'NativeLaunchFeePaid',
    inputs: [
      {
        name: 'payer',
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
    name: 'NativeLaunchFeeUpdated',
    inputs: [
      {
        name: 'previousNativeLaunchFee',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newNativeLaunchFee',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferStarted',
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
    name: 'PriceUpdaterUpdated',
    inputs: [
      {
        name: 'previousPriceUpdater',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newPriceUpdater',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'QuoteRegistered',
    inputs: [
      {
        name: 'quoteToken',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'quoteDecimals',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'startTickToken0Frame',
        type: 'int24',
        indexed: false,
        internalType: 'int24',
      },
      {
        name: 'revision',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'QuoteStartTickUpdated',
    inputs: [
      {
        name: 'quoteToken',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'previousStartTickToken0Frame',
        type: 'int24',
        indexed: false,
        internalType: 'int24',
      },
      {
        name: 'newStartTickToken0Frame',
        type: 'int24',
        indexed: false,
        internalType: 'int24',
      },
      {
        name: 'revision',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'QuoteUnregistered',
    inputs: [
      {
        name: 'quoteToken',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'revision',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TaxPolicyUpdated',
    inputs: [
      {
        name: 'configVersion',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'policy',
        type: 'tuple',
        indexed: false,
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
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TickSpacingUpdated',
    inputs: [
      {
        name: 'previousTickSpacing',
        type: 'int24',
        indexed: false,
        internalType: 'int24',
      },
      {
        name: 'newTickSpacing',
        type: 'int24',
        indexed: false,
        internalType: 'int24',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AntiSnipeUnavailable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DividendsDisabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EmptyTokenNameOrSymbol',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidConfig',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidCreatorRightsReceiver',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidFeeSchedule',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidLaunchBuyParams',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidLaunchBuyPayment',
    inputs: [
      {
        name: 'expectedValue',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'actualValue',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidMinimumDividendHoldingRequirement',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidNativeLaunchFeePayment',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidProtocolFeeConfiguration',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidQuoteToken',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTaxBounds',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTaxConfiguration',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTokenAddressSuffix',
    inputs: [
      {
        name: 'predictedToken',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'LaunchBuyAdapterNotConfigured',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LaunchCreationDisabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LaunchExpired',
    inputs: [
      {
        name: 'deadline',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'LaunchSaltUsed',
    inputs: [
      {
        name: 'scopedSalt',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'MetadataNotEditable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MisalignedOffset',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MisalignedStartTick',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NativeLaunchFeeTransferFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotCurrentCreator',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotImmutable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotOwnerOrCreatorAdmin',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotPendingCreator',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotPendingCreatorAdmin',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OutOfBounds',
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
    name: 'QuoteAlreadyRegistered',
    inputs: [],
  },
  {
    type: 'error',
    name: 'QuoteBatchNotSorted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'QuoteBatchOutOfBounds',
    inputs: [],
  },
  {
    type: 'error',
    name: 'QuoteNotRegistered',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'StaleConfig',
    inputs: [
      {
        name: 'expectedConfigVersion',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'actualConfigVersion',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'StaleQuoteRevision',
    inputs: [
      {
        name: 'quoteToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'expectedRevision',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'actualRevision',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'TokenMismatch',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UnauthorizedPriceUpdater',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UnknownLaunchToken',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UnsafeOwnershipRenunciation',
    inputs: [],
  },
] as const;
