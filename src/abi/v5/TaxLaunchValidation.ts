// Generated from the contract ABI.
export const TaxLaunchValidation_abi = [
  {
    name: 'AntiSnipeUnavailable',
    type: 'error',
    inputs: [],
  },
  {
    name: 'InvalidConfig',
    type: 'error',
    inputs: [],
  },
  {
    name: 'InvalidFeeConfig',
    type: 'error',
    inputs: [],
  },
  {
    name: 'InvalidFeeSchedule',
    type: 'error',
    inputs: [],
  },
  {
    name: 'InvalidFeeSlots',
    type: 'error',
    inputs: [],
  },
  {
    name: 'InvalidMinimumDividendHoldingRequirement',
    type: 'error',
    inputs: [],
  },
  {
    name: 'InvalidProtocolFeeConfiguration',
    type: 'error',
    inputs: [],
  },
  {
    name: 'InvalidTaxBounds',
    type: 'error',
    inputs: [],
  },
  {
    name: 'InvalidTaxConfiguration',
    type: 'error',
    inputs: [],
  },
  {
    name: 'MisalignedOffset',
    type: 'error',
    inputs: [],
  },
  {
    name: 'OutOfBounds',
    type: 'error',
    inputs: [],
  },
  {
    name: 'previewTaxConfiguration',
    type: 'function',
    inputs: [
      {
        name: 'tax',
        type: 'tuple',
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
        internalType: 'struct TaxFeeMath.TaxConfiguration',
      },
      {
        name: 'policy',
        type: 'tuple',
        components: [
          {
            name: 'taxFeeBounds',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.TaxFeeBounds',
          },
          {
            name: 'protocolFeeConfiguration',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.ProtocolFeeConfiguration',
          },
          {
            name: 'antiSnipeConfiguration',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.AntiSnipeConfiguration',
          },
          {
            name: 'minimumDividendHoldingRequirement',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
        internalType: 'struct TaxFeeMath.TaxPolicy',
      },
      {
        name: 'supply',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'configVersion',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: 'preview',
        type: 'tuple',
        components: [
          {
            name: 'configVersion',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'buyRates',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.Rates',
          },
          {
            name: 'sellRates',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.Rates',
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
        internalType: 'struct TaxFeeMath.TaxConfigurationPreview',
      },
    ],
    stateMutability: 'pure',
  },
  {
    name: 'resolveSeedPositions',
    type: 'function',
    inputs: [
      {
        name: 'tmpl',
        type: 'tuple[]',
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
        internalType: 'struct TaxLaunchpadFactoryCore.Band[]',
      },
      {
        name: 'startTick',
        type: 'int24',
        internalType: 'int24',
      },
      {
        name: 'spacing',
        type: 'int24',
        internalType: 'int24',
      },
      {
        name: 'tokenIsCurrency0',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'supply',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'positions',
        type: 'tuple[]',
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
        internalType: 'struct TaxLaunchHook.SeedPosition[]',
      },
    ],
    stateMutability: 'pure',
  },
  {
    name: 'validateBandTemplate',
    type: 'function',
    inputs: [
      {
        name: 'newBands',
        type: 'tuple[]',
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
        internalType: 'struct TaxLaunchpadFactoryCore.Band[]',
      },
      {
        name: 'spacing',
        type: 'int24',
        internalType: 'int24',
      },
    ],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    name: 'validateFactoryWiring',
    type: 'function',
    inputs: [
      {
        name: 'factory',
        type: 'address',
        internalType: 'contract TaxLaunchpadFactoryCore',
      },
    ],
    outputs: [],
    stateMutability: 'view',
  },
  {
    name: 'validateFeeRecipient',
    type: 'function',
    inputs: [
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'factory',
        type: 'address',
        internalType: 'contract TaxLaunchpadFactoryCore',
      },
    ],
    outputs: [],
    stateMutability: 'view',
  },
  {
    name: 'validateInitialDeploymentRecipients',
    type: 'function',
    inputs: [
      {
        name: 'protocolFeeRecipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'factory',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'hook',
        type: 'address',
        internalType: 'contract TaxLaunchHook',
      },
      {
        name: 'tokenDeployer',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dividendDeployer',
        type: 'address',
        internalType: 'contract TaxDividendDeployer',
      },
    ],
    outputs: [],
    stateMutability: 'view',
  },
  {
    name: 'validateInitialTaxPolicy',
    type: 'function',
    inputs: [
      {
        name: 'policy',
        type: 'tuple',
        components: [
          {
            name: 'taxFeeBounds',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.TaxFeeBounds',
          },
          {
            name: 'protocolFeeConfiguration',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.ProtocolFeeConfiguration',
          },
          {
            name: 'antiSnipeConfiguration',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.AntiSnipeConfiguration',
          },
          {
            name: 'minimumDividendHoldingRequirement',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
        internalType: 'struct TaxFeeMath.TaxPolicy',
      },
      {
        name: 'supply',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'factory',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'hook',
        type: 'address',
        internalType: 'contract TaxLaunchHook',
      },
    ],
    outputs: [],
    stateMutability: 'view',
  },
  {
    name: 'validateLaunchRecipients',
    type: 'function',
    inputs: [
      {
        name: 'factory',
        type: 'address',
        internalType: 'contract TaxLaunchpadFactoryCore',
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
        name: 'predictedToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'scopedSalt',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'dividendsEnabled',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'view',
  },
  {
    name: 'validateLaunchTax',
    type: 'function',
    inputs: [
      {
        name: 'tax',
        type: 'tuple',
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
        internalType: 'struct TaxFeeMath.TaxConfiguration',
      },
      {
        name: 'policy',
        type: 'tuple',
        components: [
          {
            name: 'taxFeeBounds',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.TaxFeeBounds',
          },
          {
            name: 'protocolFeeConfiguration',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.ProtocolFeeConfiguration',
          },
          {
            name: 'antiSnipeConfiguration',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.AntiSnipeConfiguration',
          },
          {
            name: 'minimumDividendHoldingRequirement',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
        internalType: 'struct TaxFeeMath.TaxPolicy',
      },
      {
        name: 'supply',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'antiSnipeEnabled',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    name: 'validatePoolRegistration',
    type: 'function',
    inputs: [
      {
        name: 'registration',
        type: 'tuple',
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
            components: [
              {
                name: 'taxFeeBounds',
                type: 'tuple',
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
                internalType: 'struct TaxFeeMath.TaxFeeBounds',
              },
              {
                name: 'protocolFeeConfiguration',
                type: 'tuple',
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
                internalType: 'struct TaxFeeMath.ProtocolFeeConfiguration',
              },
              {
                name: 'antiSnipeConfiguration',
                type: 'tuple',
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
                internalType: 'struct TaxFeeMath.AntiSnipeConfiguration',
              },
              {
                name: 'minimumDividendHoldingRequirement',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
            internalType: 'struct TaxFeeMath.TaxPolicy',
          },
          {
            name: 'taxConfiguration',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.TaxConfiguration',
          },
          {
            name: 'feeSlots',
            type: 'tuple[]',
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
            internalType: 'struct TaxLaunchHook.FeeSlotInput[]',
          },
        ],
        internalType: 'struct TaxLaunchHook.PoolRegistration',
      },
    ],
    outputs: [
      {
        name: 'creatorSlotIndex',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    name: 'validateTaxPolicy',
    type: 'function',
    inputs: [
      {
        name: 'policy',
        type: 'tuple',
        components: [
          {
            name: 'taxFeeBounds',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.TaxFeeBounds',
          },
          {
            name: 'protocolFeeConfiguration',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.ProtocolFeeConfiguration',
          },
          {
            name: 'antiSnipeConfiguration',
            type: 'tuple',
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
            internalType: 'struct TaxFeeMath.AntiSnipeConfiguration',
          },
          {
            name: 'minimumDividendHoldingRequirement',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
        internalType: 'struct TaxFeeMath.TaxPolicy',
      },
      {
        name: 'supply',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'factory',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'hook',
        type: 'address',
        internalType: 'contract TaxLaunchHook',
      },
    ],
    outputs: [],
    stateMutability: 'view',
  },
] as const;
