export const g8keepBondingCurveFactoryArtifact = {
  abi: [
    {
      type: 'constructor',
      inputs: [
        {
          name: '_configuration',
          type: 'address',
          internalType: 'address',
        },
      ],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'G8KEEP_BONDING_CURVE_CODE',
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
      name: 'UNISWAP_POSITION_MANAGER',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'address',
          internalType: 'contract INonfungiblePositionManager',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'allowedFeeWallets',
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
      name: 'bondingCurveLPGuardTokens',
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
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'cancelOwnershipHandover',
      inputs: [],
      outputs: [],
      stateMutability: 'payable',
    },
    {
      type: 'function',
      name: 'completeOwnershipHandover',
      inputs: [
        {
          name: 'pendingOwner',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [],
      stateMutability: 'payable',
    },
    {
      type: 'function',
      name: 'deployToken',
      inputs: [
        {
          name: '_g8keepFeeWallet',
          type: 'address',
          internalType: 'address',
        },
        {
          name: '_deployer',
          type: 'address',
          internalType: 'address',
        },
        {
          name: '_name',
          type: 'string',
          internalType: 'string',
        },
        {
          name: '_symbol',
          type: 'string',
          internalType: 'string',
        },
        {
          name: '_fid',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: '_image',
          type: 'string',
          internalType: 'string',
        },
        {
          name: '_castHash',
          type: 'string',
          internalType: 'string',
        },
        {
          name: '_tokenSalt',
          type: 'bytes32',
          internalType: 'bytes32',
        },
      ],
      outputs: [
        {
          name: '_tokenAddress',
          type: 'address',
          internalType: 'address',
        },
      ],
      stateMutability: 'payable',
    },
    {
      type: 'function',
      name: 'deployerMigrationReward',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'uint112',
          internalType: 'uint112',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'deploymentFee',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'uint112',
          internalType: 'uint112',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'g8keepFee',
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
      name: 'heavySnipeExponent',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'uint8',
          internalType: 'uint8',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'heavySnipeProtectionSeconds',
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
      name: 'liquiditySupplementFee',
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
      name: 'lockerFactory',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'address',
          internalType: 'contract IG8keepLockerFactory',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'maxBundleBuyAmount',
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
          name: 'result',
          type: 'address',
          internalType: 'address',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'ownershipHandoverExpiresAt',
      inputs: [
        {
          name: 'pendingOwner',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [
        {
          name: 'result',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'removeLPGuardLiquidity',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'renounceOwnership',
      inputs: [],
      outputs: [],
      stateMutability: 'payable',
    },
    {
      type: 'function',
      name: 'requestOwnershipHandover',
      inputs: [],
      outputs: [],
      stateMutability: 'payable',
    },
    {
      type: 'function',
      name: 'setAllowedG8keepFeeWallet',
      inputs: [
        {
          name: '_g8keepFeeWallet',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'allowed',
          type: 'bool',
          internalType: 'bool',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'setDeploymentSettings',
      inputs: [
        {
          name: '_deploymentFee',
          type: 'uint112',
          internalType: 'uint112',
        },
        {
          name: '_tokenInitialSupply',
          type: 'uint112',
          internalType: 'uint112',
        },
        {
          name: '_g8keepFee',
          type: 'uint16',
          internalType: 'uint16',
        },
        {
          name: '_uniswapFeeTier',
          type: 'uint24',
          internalType: 'uint24',
        },
        {
          name: '_liquiditySupplementFee',
          type: 'uint16',
          internalType: 'uint16',
        },
        {
          name: '_deployerMigrationReward',
          type: 'uint112',
          internalType: 'uint112',
        },
        {
          name: '_tokenLiquidityShift',
          type: 'uint112',
          internalType: 'uint112',
        },
        {
          name: '_tokenMigrationLiquidity',
          type: 'uint112',
          internalType: 'uint112',
        },
        {
          name: '_snipeProtectionSeconds',
          type: 'uint24',
          internalType: 'uint24',
        },
        {
          name: '_heavySnipeProtectionSeconds',
          type: 'uint24',
          internalType: 'uint24',
        },
        {
          name: '_heavySnipeExponent',
          type: 'uint8',
          internalType: 'uint8',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'setG8keepLockerFactory',
      inputs: [
        {
          name: '_lockerFactory',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'setMaximumBundleBuy',
      inputs: [
        {
          name: '_maxBundleBuyAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'snipeProtectionSeconds',
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
      name: 'tokenInitialSupply',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'uint112',
          internalType: 'uint112',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'tokenLiquidityShift',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'uint112',
          internalType: 'uint112',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'tokenMigrationLiquidity',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'uint112',
          internalType: 'uint112',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'transferGuardTokens',
      inputs: [
        {
          name: 'to',
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
      stateMutability: 'payable',
    },
    {
      type: 'function',
      name: 'uniswapFeeTier',
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
      name: 'withdrawETH',
      inputs: [
        {
          name: 'to',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'withdrawToken',
      inputs: [
        {
          name: 'tokenAddress',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'to',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'amount',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'withdrawToken',
      inputs: [
        {
          name: 'tokenAddress',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'to',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'event',
      name: 'DeploymentSettingsUpdated',
      inputs: [
        {
          name: 'deploymentFee',
          type: 'uint112',
          indexed: false,
          internalType: 'uint112',
        },
        {
          name: 'tokenInitialSupply',
          type: 'uint112',
          indexed: false,
          internalType: 'uint112',
        },
        {
          name: 'g8keepFee',
          type: 'uint16',
          indexed: false,
          internalType: 'uint16',
        },
        {
          name: 'uniswapFeeTier',
          type: 'uint24',
          indexed: false,
          internalType: 'uint24',
        },
        {
          name: 'liquiditySupplementFee',
          type: 'uint16',
          indexed: false,
          internalType: 'uint16',
        },
        {
          name: 'deployerMigrationReward',
          type: 'uint112',
          indexed: false,
          internalType: 'uint112',
        },
        {
          name: 'tokenLiquidityShift',
          type: 'uint112',
          indexed: false,
          internalType: 'uint112',
        },
        {
          name: 'tokenMigrationLiquidity',
          type: 'uint112',
          indexed: false,
          internalType: 'uint112',
        },
        {
          name: 'snipeProtectionSeconds',
          type: 'uint24',
          indexed: false,
          internalType: 'uint24',
        },
        {
          name: 'heavySnipeProtectionSeconds',
          type: 'uint24',
          indexed: false,
          internalType: 'uint24',
        },
        {
          name: 'heavySnipeExponent',
          type: 'uint8',
          indexed: false,
          internalType: 'uint8',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'FeeWalletUpdated',
      inputs: [
        {
          name: 'feeWallet',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'allowed',
          type: 'bool',
          indexed: false,
          internalType: 'bool',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'OwnershipHandoverCanceled',
      inputs: [
        {
          name: 'pendingOwner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'OwnershipHandoverRequested',
      inputs: [
        {
          name: 'pendingOwner',
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
          name: 'oldOwner',
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
      name: 'TokenDeployed',
      inputs: [
        {
          name: 'token',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'deployer',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'symbol',
          type: 'string',
          indexed: false,
          internalType: 'string',
        },
        {
          name: 'snipeProtectionEnd',
          type: 'uint40',
          indexed: false,
          internalType: 'uint40',
        },
        {
          name: 'pairAddress',
          type: 'address',
          indexed: false,
          internalType: 'address',
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
      name: 'InvalidBundleBuy',
      inputs: [],
    },
    {
      type: 'error',
      name: 'InvalidDeploymentFee',
      inputs: [],
    },
    {
      type: 'error',
      name: 'InvalidFeeWallet',
      inputs: [],
    },
    {
      type: 'error',
      name: 'InvalidSettings',
      inputs: [],
    },
    {
      type: 'error',
      name: 'InvalidTokenAddress',
      inputs: [],
    },
    {
      type: 'error',
      name: 'NewOwnerIsZeroAddress',
      inputs: [],
    },
    {
      type: 'error',
      name: 'NoHandoverRequest',
      inputs: [],
    },
    {
      type: 'error',
      name: 'Unauthorized',
      inputs: [],
    },
    {
      type: 'error',
      name: 'WithdrawalFailed',
      inputs: [],
    },
    {
      type: 'error',
      name: 'ZeroAddress',
      inputs: [],
    },
  ],
  bytecode: {
    object:
      '0x60e0604052600180546001600160f01b0319167c640000033b2e3c9fd0803ce80000000000000000000000000000000000179055600280546001600160981b0319166c03782dace9d90000001e002710179055600380547fff00000000000000000000000000000000000000000000000000000000000000167d0e100000000000015af1d78b58c400000000000000000de0b6b3a76400001790556004805463ffffffff191663140007081790556658d15e176280006005553480156100c3575f80fd5b5060405161b2cc38038061b2cc8339810160408190526100e291610972565b5f8190505f805f80846001600160a01b03166311ef6d276040518163ffffffff1660e01b8152600401608060405180830381865afa158015610126573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061014a9190610992565b929650909450925090506001600160a01b038416158061017157506001600160a01b038316155b8061018357506001600160a01b038216155b80610191575062ffffff8116155b156101af5760405163e591f33d60e01b815260040160405180910390fd5b6101b8846104bb565b6001600160a01b03821660a08190526040805163c45a015560e01b815290515f929163c45a01559160048083019260209291908290030181865afa158015610202573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906102269190610972565b6040516322afcccb60e01b815262ffffff841660048201526001600160a01b0391909116906322afcccb90602401602060405180830381865afa15801561026f573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061029391906109ec565b90508060020b5f036102b85760405163e591f33d60e01b815260040160405180910390fd5b6006805462ffffff191662ffffff83161790556102d4816104f6565b6006805468ffffffffffff0000001916660100000000000062ffffff9384160265ffffff0000001916176301000000939092169290920217600160481b600160e81b03191669010000000000000000006001600160a01b039384160217905584165f81815260086020908152604091829020805460ff1916600190811790915591519182527f49db2f55c8e436c1dcf4b3c47cef480f2802dcf6d8a0d3b08fc2ee57e92f9cec910160405180910390a28160025f6101000a81548162ffffff021916908362ffffff16021790555060a0516001600160a01b0316634aa4a4fc6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156103e0573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906104049190610972565b6001600160a01b031660c05260a051604051869186916104239061093d565b6001600160a01b03938416815291831660208301529091166040820152606001604051809103905ff08015801561045c573d5f803e3d5ffd5b505f80546001600160a01b0319166001600160a01b03929092169190911790556040516104889061094a565b604051809103905ff0801580156104a1573d5f803e3d5ffd5b506001600160a01b031660805250610ac495505050505050565b6001600160a01b0316638b78c6d819819055805f7f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08180a350565b5f620a2772198183600281900b838161051157610511610a0c565b05029150508281016105228261052a565b949193509150565b5f805f8360020b1261053f578260020b61054c565b8260020b61054c90610a34565b905061055b620d89e719610a4e565b60020b8111156105955760405162461bcd60e51b81526020600482015260016024820152601560fa1b604482015260640160405180910390fd5b5f816001165f036105aa57600160801b6105bc565b6ffffcb933bd6fad37aa2d162d1a5940015b6001600160881b0316905060028216156105f15760806105ec826ffff97272373d413259a46990580e213a610a6e565b901c90505b600482161561061b576080610616826ffff2e50f5f656932ef12357cf3c7fdcc610a6e565b901c90505b6008821615610645576080610640826fffe5caca7e10e4e61c3624eaa0941cd0610a6e565b901c90505b601082161561066f57608061066a826fffcb9843d60f6159c9db58835c926644610a6e565b901c90505b6020821615610699576080610694826fff973b41fa98c081472e6896dfb254c0610a6e565b901c90505b60408216156106c35760806106be826fff2ea16466c96a3843ec78b326b52861610a6e565b901c90505b60808216156106ed5760806106e8826ffe5dee046a99a2a811c461f1969c3053610a6e565b901c90505b610100821615610718576080610713826ffcbe86c7900a88aedcffc83b479aa3a4610a6e565b901c90505b61020082161561074357608061073e826ff987a7253ac413176f2b074cf7815e54610a6e565b901c90505b61040082161561076e576080610769826ff3392b0822b70005940c7a398e4b70f3610a6e565b901c90505b610800821615610799576080610794826fe7159475a2c29b7443b29c7fa6e889d9610a6e565b901c90505b6110008216156107c45760806107bf826fd097f3bdfd2022b8845ad8f792aa5825610a6e565b901c90505b6120008216156107ef5760806107ea826fa9f746462d870fdf8a65dc1f90e061e5610a6e565b901c90505b61400082161561081a576080610815826f70d869a156d2a1b890bb3df62baf32f7610a6e565b901c90505b618000821615610845576080610840826f31be135f97d08fd981231505542fcfa6610a6e565b901c90505b6201000082161561087157608061086c826f09aa508b5b7a84e1c677de54f3e99bc9610a6e565b901c90505b6202000082161561089c576080610897826e5d6af8dedb81196699c329225ee604610a6e565b901c90505b620400008216156108c65760806108c1826d2216e584f5fa1ea926041bedfe98610a6e565b901c90505b620800008216156108ee5760806108e9826b048a170391f7dc42444e8fa2610a6e565b901c90505b5f8460020b131561090757610904815f19610a8b565b90505b61091664010000000082610a9e565b15610922576001610924565b5f5b6109359060ff16602083901c610ab1565b949350505050565b6121eb80613efa83390190565b6151e7806160e583390190565b80516001600160a01b038116811461096d575f80fd5b919050565b5f60208284031215610982575f80fd5b61098b82610957565b9392505050565b5f805f80608085870312156109a5575f80fd5b6109ae85610957565b93506109bc60208601610957565b92506109ca60408601610957565b9150606085015162ffffff811681146109e1575f80fd5b939692955090935050565b5f602082840312156109fc575f80fd5b81518060020b811461098b575f80fd5b634e487b7160e01b5f52601260045260245ffd5b634e487b7160e01b5f52601160045260245ffd5b5f600160ff1b8201610a4857610a48610a20565b505f0390565b5f8160020b627fffff198103610a6657610a66610a20565b5f0392915050565b8082028115828204841417610a8557610a85610a20565b92915050565b5f82610a9957610a99610a0c565b500490565b5f82610aac57610aac610a0c565b500690565b80820180821115610a8557610a85610a20565b60805160a05160c0516133aa610b505f395f8181610acb01528181610c890152611efc01525f818161049b0152818161075601528181610a4901528181610f3a0152818161101f015281816110e6015281816111be015281816112e9015281816113b5015281816116c201528181611e3c0152611faf01525f81816103f401526108f901526133aa5ff3fe60806040526004361061020f575f3560e01c8063711bb3d511610117578063e025fa01116100ac578063f04e283e1161007c578063f2fde38b11610062578063f2fde38b146106e9578063f31a8f67146106fc578063fee81cf41461071b575f80fd5b8063f04e283e146106b0578063f2cff57f146106c3575f80fd5b8063e025fa0114610608578063e55725fa14610643578063e9cfe67e14610672578063efa21fbd14610691575f80fd5b80638ec38768116100e75780638ec3876814610577578063baf2610b146105b5578063bd68a82b146105ca578063c217aac1146105e9575f80fd5b8063711bb3d5146104e4578063715018a6146105165780637fe90dc71461051e5780638da5cb5b14610544575f80fd5b806325692962116101a75780633aeac4e11161017757806351f188991161015d57806351f188991461048a57806354d1f13d146104bd578063690d8320146104c5575f80fd5b80633aeac4e1146104315780634232c71214610450575f80fd5b806325692962146103b05780632a123b16146103b85780632b37836d146103e3578063369c638a14610416575f80fd5b806306133458116101e257806306133458146102b4578063086f8d6b146102ed578063220f3ead14610344578063231ce39814610378575f80fd5b80630132ec541461021357806301e3366714610247578063028221cc146102685780630434ab20146102a0575b5f80fd5b34801561021e575f80fd5b5060025461022e9062ffffff1681565b60405162ffffff90911681526020015b60405180910390f35b348015610252575f80fd5b5061026661026136600461265a565b61074c565b005b61027b610276366004612798565b6107e9565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200161023e565b3480156102ab575f80fd5b50610266610e99565b3480156102bf575f80fd5b506102df6102ce366004612886565b60076020525f908152604090205481565b60405190815260200161023e565b3480156102f8575f80fd5b50600154610325906e01000000000000000000000000000090046dffffffffffffffffffffffffffff1681565b6040516dffffffffffffffffffffffffffff909116815260200161023e565b34801561034f575f80fd5b50600254610365906301000000900461ffff1681565b60405161ffff909116815260200161023e565b348015610383575f80fd5b50600354610325906e01000000000000000000000000000090046dffffffffffffffffffffffffffff1681565b61026661135e565b3480156103c3575f80fd5b505f5461027b9073ffffffffffffffffffffffffffffffffffffffff1681565b3480156103ee575f80fd5b5061027b7f000000000000000000000000000000000000000000000000000000000000000081565b348015610421575f80fd5b5060045461022e9062ffffff1681565b34801561043c575f80fd5b5061026661044b3660046128a8565b6113ab565b34801561045b575f80fd5b50600154610365907c0100000000000000000000000000000000000000000000000000000000900461ffff1681565b348015610495575f80fd5b5061027b7f000000000000000000000000000000000000000000000000000000000000000081565b610266611442565b3480156104d0575f80fd5b506102666104df366004612886565b61147b565b3480156104ef575f80fd5b50600454610504906301000000900460ff1681565b60405160ff909116815260200161023e565b61026661156a565b348015610529575f80fd5b50600354610325906dffffffffffffffffffffffffffff1681565b34801561054f575f80fd5b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffff748739275461027b565b348015610582575f80fd5b506105a5610591366004612886565b60086020525f908152604090205460ff1681565b604051901515815260200161023e565b3480156105c0575f80fd5b506102df60055481565b3480156105d5575f80fd5b506102666105e4366004612948565b61157d565b3480156105f4575f80fd5b50610266610603366004612886565b611b68565b348015610613575f80fd5b5060035461022e907c0100000000000000000000000000000000000000000000000000000000900462ffffff1681565b34801561064e575f80fd5b50600254610325906501000000000090046dffffffffffffffffffffffffffff1681565b34801561067d575f80fd5b5061026661068c366004612a1b565b611c06565b34801561069c575f80fd5b506102666106ab366004612886565b611c13565b6102666106be366004612886565b611c1d565b3480156106ce575f80fd5b50600154610325906dffffffffffffffffffffffffffff1681565b6102666106f7366004612886565b611c5a565b348015610707575f80fd5b50610266610716366004612a3f565b611c80565b348015610726575f80fd5b506102df610735366004612886565b63389a75e1600c9081525f91909152602090205490565b610754611d5e565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036107d9576040517f1eb00b0600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6107e4838383611d93565b505050565b73ffffffffffffffffffffffffffffffffffffffff88165f9081526008602052604081205460ff16610847576040517f3419a9e500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60015434906dffffffffffffffffffffffffffff1680821015610896576040517f9c31f11500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b80156108b2576108a68183612a98565b91506108b28b82611de6565b6005548211156108ee576040517f281dda5f00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6002546040805160207f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16803b808401830190945283835262ffffff909416935f93918491908401903c604051806102a001604052808d81526020018c81526020018b81526020018a81526020018981526020016001600e9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020018f73ffffffffffffffffffffffffffffffffffffffff1681526020016001601c9054906101000a900461ffff1661ffff168152602001600260039054906101000a900461ffff1661ffff1681526020018e73ffffffffffffffffffffffffffffffffffffffff168152602001600260059054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020017f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1681526020015f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018462ffffff1681526020017f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16815260200160035f9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020016003600e9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020016003601c9054906101000a900462ffffff1662ffffff1664ffffffffff16815260200160045f9054906101000a900462ffffff1662ffffff1664ffffffffff168152602001600460039054906101000a900460ff1660ff168152602001600660099054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815250604051602001610c119190612afd565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe081840301815290829052610c4d9291602001612dbb565b6040516020818303038152906040529050858151602083015ff5945073ffffffffffffffffffffffffffffffffffffffff85161580610cd757507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff16115b15610d0e576040517f1eb00b0600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610d188583611dff565b8315610da4576040517fcce7ec1300000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8d811660048301525f602483015286169063cce7ec139086906044015f604051808303818588803b158015610d8c575f80fd5b505af1158015610d9e573d5f803e3d5ffd5b50505050505b5f8573ffffffffffffffffffffffffffffffffffffffff1663264c80226040518163ffffffff1660e01b815260040161020060405180830381865afa158015610def573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610e139190612e1a565b90508c73ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff167fa972e8e5afb51408a9d3743f5cae264977da49f47267bd8b1ed62f31e026f08c8d846101400151856101c00151604051610e8093929190612f56565b60405180910390a3505050505098975050505050505050565b335f8181526007602052604081205490819003610ee2576040517f1eb00b0600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8281165f90815260076020526040808220829055517f99fbab880000000000000000000000000000000000000000000000000000000081526004810184905290917f000000000000000000000000000000000000000000000000000000000000000016906399fbab889060240161018060405180830381865afa158015610f80573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610fa49190612fcb565b50506040805160a0810182528d81526fffffffffffffffffffffffffffffffff851660208201525f818301819052606082015242608082015290517f0c49ccbe000000000000000000000000000000000000000000000000000000008152939b5099505073ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000169750630c49ccbe965061105d95508894505060040191506130a59050565b60408051808303815f875af1158015611078573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061109c91906130f0565b50506040517f99fbab88000000000000000000000000000000000000000000000000000000008152600481018490525f90819073ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016906399fbab889060240161018060405180830381865afa15801561112c573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906111509190612fcb565b9b509b50505050505050505050505f60405180608001604052808781526020018873ffffffffffffffffffffffffffffffffffffffff168152602001846fffffffffffffffffffffffffffffffff168152602001836fffffffffffffffffffffffffffffffff1681525090507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663fc6f7865826040518263ffffffff1660e01b815260040161127991905f6080820190508251825273ffffffffffffffffffffffffffffffffffffffff60208401511660208301526fffffffffffffffffffffffffffffffff60408401511660408301526fffffffffffffffffffffffffffffffff606084015116606083015292915050565b60408051808303815f875af1158015611294573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906112b891906130f0565b50506040517f42966c68000000000000000000000000000000000000000000000000000000008152600481018790527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906342966c68906024015f604051808303815f87803b15801561133f575f80fd5b505af1158015611351573d5f803e3d5ffd5b5050505050505050505050565b5f6202a30067ffffffffffffffff164201905063389a75e1600c52335f52806020600c2055337fdbf36a107da19e49527a7176a1babf963b4b0ff8cde35ee35d6cd8f1f9ac7e1d5f80a250565b6113b3611d5e565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611438576040517f1eb00b0600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6107e48282612057565b63389a75e1600c52335f525f6020600c2055337ffa7b8eab7da67f412cc9575ed43464468f9bfbae89d1675917346ca6d8fe3c925f80a2565b611483611d5e565b73ffffffffffffffffffffffffffffffffffffffff81166114d0576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f8173ffffffffffffffffffffffffffffffffffffffff16476040515f6040518083038185875af1925050503d805f8114611526576040519150601f19603f3d011682016040523d82523d5f602084013e61152b565b606091505b5050905080611566576040517f27fcd9d100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5050565b611572611d5e565b61157b5f6120d9565b565b611585611d5e565b69152d02c7e14af68000006dffffffffffffffffffffffffffff8b1610806115ca57506d04ee2d6d415b85acef81000000006dffffffffffffffffffffffffffff8b16115b806115d95750606461ffff8a16115b806116035750836dffffffffffffffffffffffffffff16856dffffffffffffffffffffffffffff16115b806116125750606461ffff8816115b80611623575061038462ffffff8416105b80611635575062093a8062ffffff8416115b8061164957508262ffffff168262ffffff16115b8061165a575061012c62ffffff8316105b8061166c57506206978062ffffff8316115b8061167a5750600260ff8216105b806116885750606460ff8216115b156116bf576040517fe591f33d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663c45a01556040518163ffffffff1660e01b8152600401602060405180830381865afa158015611729573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061174d9190613112565b6040517f22afcccb00000000000000000000000000000000000000000000000000000000815262ffffff8b16600482015273ffffffffffffffffffffffffffffffffffffffff91909116906322afcccb90602401602060405180830381865afa1580156117bc573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906117e0919061312d565b60065490915060020b5f03611821576040517fe591f33d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600680547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000001662ffffff83161790556118598161213e565b60066009600660036006808691906101000a81548162ffffff021916908360020b62ffffff1602179055508591906101000a81548162ffffff021916908360020b62ffffff1602179055508491906101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050508b60015f6101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff1602179055508a6001600e6101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff160217905550896001601c6101000a81548161ffff021916908361ffff1602179055508860025f6101000a81548162ffffff021916908362ffffff16021790555087600260036101000a81548161ffff021916908361ffff16021790555086600260056101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff1602179055508560035f6101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff160217905550846003600e6101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff160217905550836003601c6101000a81548162ffffff021916908362ffffff1602179055508260045f6101000a81548162ffffff021916908362ffffff16021790555081600460036101000a81548160ff021916908360ff1602179055507f34fd0dabda051fc15a9d8baaa48366a826c18f3e57a386d7ac59d56c731648178c8c8c8c8c8c8c8c8c8c8c604051611b529b9a999897969594939291906dffffffffffffffffffffffffffff9b8c168152998b1660208b015261ffff98891660408b015262ffffff97881660608b015295909716608089015292881660a088015290871660c087015290951660e08501529381166101008401521661012082015260ff919091166101408201526101600190565b60405180910390a1505050505050505050505050565b611b70611d5e565b8073ffffffffffffffffffffffffffffffffffffffff163b5f03611bc0576040517fe591f33d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f80547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b611c0e611d5e565b600555565b6115663382612057565b611c25611d5e565b63389a75e1600c52805f526020600c208054421115611c4b57636f5e88185f526004601cfd5b5f9055611c57816120d9565b50565b611c62611d5e565b8060601b611c7757637448fbae5f526004601cfd5b611c57816120d9565b611c88611d5e565b73ffffffffffffffffffffffffffffffffffffffff8216611cd5576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff82165f8181526008602090815260409182902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001685151590811790915591519182527f49db2f55c8e436c1dcf4b3c47cef480f2802dcf6d8a0d3b08fc2ee57e92f9cec910160405180910390a25050565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffff7487392754331461157b576382b429005f526004601cfd5b81601452806034526fa9059cbb0000000000000000000000005f5260205f604460105f875af18060015f511416611ddc57803d853b151710611ddc576390b8ec185f526004601cfd5b505f603452505050565b5f385f3884865af16115665763b12d13eb5f526004601cfd5b6040517f095ea7b300000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660048301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff602483015283169063095ea7b3906044016020604051808303815f875af1158015611eb0573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190611ed49190613146565b50604080516101608101825273ffffffffffffffffffffffffffffffffffffffff80851682527f00000000000000000000000000000000000000000000000000000000000000008116602083015262ffffff84168284015260065463010000008104600290810b60608501526601000000000000909104900b6080830152670de0b6b3a764000060a08301525f60c0830181905260e083018190526101008301819052306101208401524261014084015292517f883164560000000000000000000000000000000000000000000000000000000081529192917f000000000000000000000000000000000000000000000000000000000000000090911690638831645690611fe6908590600401613161565b6080604051808303815f875af1158015612002573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190612026919061324c565b50505073ffffffffffffffffffffffffffffffffffffffff9094165f90815260076020526040902093909355505050565b5f6370a082315f5230602052602060346024601c865afa601f3d1116612084576390b8ec185f526004601cfd5b8160145260345190506fa9059cbb0000000000000000000000005f5260205f604460105f875af18060015f5114166120ce57803d853b1517106120ce576390b8ec185f526004601cfd5b505f60345292915050565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffff74873927805473ffffffffffffffffffffffffffffffffffffffff9092169182907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a355565b5f7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff5d88d8183600281900b838161217557612175613285565b05029150508281016121868261218e565b949193509150565b5f805f8360020b126121a3578260020b6121b0565b8260020b6121b0906132b2565b90506121db7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff276186132e8565b60020b81111561224b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600160248201527f5400000000000000000000000000000000000000000000000000000000000000604482015260640160405180910390fd5b5f816001165f0361226d5770010000000000000000000000000000000061227f565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff16905060028216156122be5760806122b9826ffff97272373d413259a46990580e213a613324565b901c90505b60048216156122e85760806122e3826ffff2e50f5f656932ef12357cf3c7fdcc613324565b901c90505b600882161561231257608061230d826fffe5caca7e10e4e61c3624eaa0941cd0613324565b901c90505b601082161561233c576080612337826fffcb9843d60f6159c9db58835c926644613324565b901c90505b6020821615612366576080612361826fff973b41fa98c081472e6896dfb254c0613324565b901c90505b604082161561239057608061238b826fff2ea16466c96a3843ec78b326b52861613324565b901c90505b60808216156123ba5760806123b5826ffe5dee046a99a2a811c461f1969c3053613324565b901c90505b6101008216156123e55760806123e0826ffcbe86c7900a88aedcffc83b479aa3a4613324565b901c90505b61020082161561241057608061240b826ff987a7253ac413176f2b074cf7815e54613324565b901c90505b61040082161561243b576080612436826ff3392b0822b70005940c7a398e4b70f3613324565b901c90505b610800821615612466576080612461826fe7159475a2c29b7443b29c7fa6e889d9613324565b901c90505b61100082161561249157608061248c826fd097f3bdfd2022b8845ad8f792aa5825613324565b901c90505b6120008216156124bc5760806124b7826fa9f746462d870fdf8a65dc1f90e061e5613324565b901c90505b6140008216156124e75760806124e2826f70d869a156d2a1b890bb3df62baf32f7613324565b901c90505b61800082161561251257608061250d826f31be135f97d08fd981231505542fcfa6613324565b901c90505b6201000082161561253e576080612539826f09aa508b5b7a84e1c677de54f3e99bc9613324565b901c90505b62020000821615612569576080612564826e5d6af8dedb81196699c329225ee604613324565b901c90505b6204000082161561259357608061258e826d2216e584f5fa1ea926041bedfe98613324565b901c90505b620800008216156125bb5760806125b6826b048a170391f7dc42444e8fa2613324565b901c90505b5f8460020b13156125f3576125f0817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff61333b565b90505b6126026401000000008261334e565b1561260e576001612610565b5f5b6126219060ff16602083901c613361565b949350505050565b73ffffffffffffffffffffffffffffffffffffffff81168114611c57575f80fd5b803561265581612629565b919050565b5f805f6060848603121561266c575f80fd5b833561267781612629565b9250602084013561268781612629565b929592945050506040919091013590565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b604051610200810167ffffffffffffffff811182821017156126e9576126e9612698565b60405290565b5f82601f8301126126fe575f80fd5b813567ffffffffffffffff81111561271857612718612698565b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f0116810167ffffffffffffffff8111828210171561276557612765612698565b60405281815283820160200185101561277c575f80fd5b816020850160208301375f918101602001919091529392505050565b5f805f805f805f80610100898b0312156127b0575f80fd5b6127b98961264a565b97506127c760208a0161264a565b9650604089013567ffffffffffffffff8111156127e2575f80fd5b6127ee8b828c016126ef565b965050606089013567ffffffffffffffff81111561280a575f80fd5b6128168b828c016126ef565b9550506080890135935060a089013567ffffffffffffffff811115612839575f80fd5b6128458b828c016126ef565b93505060c089013567ffffffffffffffff811115612861575f80fd5b61286d8b828c016126ef565b989b979a50959894979396929550929360e00135925050565b5f60208284031215612896575f80fd5b81356128a181612629565b9392505050565b5f80604083850312156128b9575f80fd5b82356128c481612629565b915060208301356128d481612629565b809150509250929050565b6dffffffffffffffffffffffffffff81168114611c57575f80fd5b8035612655816128df565b61ffff81168114611c57575f80fd5b62ffffff81168114611c57575f80fd5b803561265581612914565b60ff81168114611c57575f80fd5b80356126558161292f565b5f805f805f805f805f805f6101608c8e031215612963575f80fd5b8b3561296e816128df565b9a5060208c013561297e816128df565b995060408c013561298e81612905565b985060608c013561299e81612914565b975060808c01356129ae81612905565b965060a08c01356129be816128df565b955060c08c01356129ce816128df565b94506129dc60e08d016128fa565b93506129eb6101008d01612924565b92506129fa6101208d01612924565b9150612a096101408d0161293d565b90509295989b509295989b9093969950565b5f60208284031215612a2b575f80fd5b5035919050565b8015158114611c57575f80fd5b5f8060408385031215612a50575f80fd5b8235612a5b81612629565b915060208301356128d481612a32565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b81810381811115612aab57612aab612a6b565b92915050565b5f81518084528060208401602086015e5f6020828601015260207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f83011685010191505092915050565b602081525f82516102a06020840152612b1a6102c0840182612ab1565b905060208401517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0848303016040850152612b558282612ab1565b9150506040840151606084015260608401517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0848303016080850152612b9b8282612ab1565b91505060808401517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08483030160a0850152612bd78282612ab1565b91505060a0840151612bfb60c08501826dffffffffffffffffffffffffffff169052565b5060c084015173ffffffffffffffffffffffffffffffffffffffff811660e08501525060e084015161ffff81166101008501525061010084015161ffff81166101208501525061012084015173ffffffffffffffffffffffffffffffffffffffff8116610140850152506101408401516dffffffffffffffffffffffffffff81166101608501525061016084015173ffffffffffffffffffffffffffffffffffffffff81166101808501525061018084015173ffffffffffffffffffffffffffffffffffffffff81166101a0850152506101a084015162ffffff81166101c0850152506101c084015173ffffffffffffffffffffffffffffffffffffffff81166101e0850152506101e08401516dffffffffffffffffffffffffffff8116610200850152506102008401516dffffffffffffffffffffffffffff81166102208501525061022084015164ffffffffff81166102408501525061024084015164ffffffffff81166102608501525061026084015160ff81166102808501525061028084015173ffffffffffffffffffffffffffffffffffffffff81166102a0850152509392505050565b5f81518060208401855e5f93019283525090919050565b5f612621612dc98386612da4565b84612da4565b805161265581612629565b8051612655816128df565b805161265581612905565b805161265581612914565b805164ffffffffff81168114612655575f80fd5b80516126558161292f565b5f610200828403128015612e2c575f80fd5b50612e356126c5565b612e3e83612dcf565b8152612e4c60208401612dda565b6020820152612e5d60408401612dcf565b6040820152612e6e60608401612de5565b6060820152612e7f60808401612dda565b6080820152612e9060a08401612de5565b60a0820152612ea160c08401612dda565b60c0820152612eb260e08401612dcf565b60e0820152612ec46101008401612df0565b610100820152612ed76101208401612dfb565b610120820152612eea6101408401612dfb565b610140820152612efd6101608401612dfb565b610160820152612f106101808401612dfb565b610180820152612f236101a08401612e0f565b6101a0820152612f366101c08401612dcf565b6101c0820152612f496101e08401612dcf565b6101e08201529392505050565b606081525f612f686060830186612ab1565b905064ffffffffff8416602083015273ffffffffffffffffffffffffffffffffffffffff83166040830152949350505050565b8051600281900b8114612655575f80fd5b80516fffffffffffffffffffffffffffffffff81168114612655575f80fd5b5f805f805f805f805f805f806101808d8f031215612fe7575f80fd5b8c516bffffffffffffffffffffffff81168114613002575f80fd5b9b5061301060208e01612dcf565b9a5061301e60408e01612dcf565b995061302c60608e01612dcf565b985061303a60808e01612df0565b975061304860a08e01612f9b565b965061305660c08e01612f9b565b955061306460e08e01612fac565b6101008e01516101208f0151919650945092506130846101408e01612fac565b91506130936101608e01612fac565b90509295989b509295989b509295989b565b5f60a082019050825182526fffffffffffffffffffffffffffffffff602084015116602083015260408301516040830152606083015160608301526080830151608083015292915050565b5f8060408385031215613101575f80fd5b505080516020909101519092909150565b5f60208284031215613122575f80fd5b81516128a181612629565b5f6020828403121561313d575f80fd5b6128a182612f9b565b5f60208284031215613156575f80fd5b81516128a181612a32565b815173ffffffffffffffffffffffffffffffffffffffff168152610160810160208301516131a7602084018273ffffffffffffffffffffffffffffffffffffffff169052565b5060408301516131be604084018262ffffff169052565b5060608301516131d3606084018260020b9052565b5060808301516131e8608084018260020b9052565b5060a083015160a083015260c083015160c083015260e083015160e083015261010083015161010083015261012083015161323c61012084018273ffffffffffffffffffffffffffffffffffffffff169052565b5061014092830151919092015290565b5f805f806080858703121561325f575f80fd5b8451935061326f60208601612fac565b6040860151606090960151949790965092505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b5f7f800000000000000000000000000000000000000000000000000000000000000082036132e2576132e2612a6b565b505f0390565b5f8160020b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff800000810361331c5761331c612a6b565b5f0392915050565b8082028115828204841417612aab57612aab612a6b565b5f8261334957613349613285565b500490565b5f8261335c5761335c613285565b500690565b80820180821115612aab57612aab612a6b56fea2646970667358221220a5866735d41e48e6b5728554be27013ef188a6f7498619126cae478e47bc37aa64736f6c634300081a003360a06040525f8054600160a01b600160f01b0319167d1770000000008cfa16800000000000000000000000000000000000000000179055348015610041575f80fd5b506040516121eb3803806121eb833981016040819052610060916100de565b6100698361008e565b5f80546001600160a01b0319166001600160a01b039384161790551660805250610128565b6001600160a01b0316638b78c6d819819055805f7f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08180a35b50565b6001600160a01b03811681146100c7575f80fd5b5f805f606084860312156100f0575f80fd5b83516100fb816100ca565b602085015190935061010c816100ca565b604085015190925061011d816100ca565b809150509250925092565b60805161209d61014e5f395f8181610142015281816103aa0152610501015261209d5ff3fe6080604052600436106100ce575f3560e01c80638da5cb5b1161007c578063d850aa8b11610057578063d850aa8b14610262578063f04e283e14610281578063f2fde38b14610294578063fee81cf4146102a7575f80fd5b80638da5cb5b146101e55780639442fd6214610218578063c415b95c14610237575f80fd5b806354d1f13d116100ac57806354d1f13d1461018957806357aa020114610191578063715018a6146101dd575f80fd5b806304554443146100d2578063256929621461012757806351f1889914610131575b5f80fd5b3480156100dd575f80fd5b505f546101099074010000000000000000000000000000000000000000900467ffffffffffffffff1681565b60405167ffffffffffffffff90911681526020015b60405180910390f35b61012f6102e6565b005b34801561013c575f80fd5b506101647f000000000000000000000000000000000000000000000000000000000000000081565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200161011e565b61012f610333565b34801561019c575f80fd5b505f546101ca907c0100000000000000000000000000000000000000000000000000000000900461ffff1681565b60405161ffff909116815260200161011e565b61012f61036c565b3480156101f0575f80fd5b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffff7487392754610164565b348015610223575f80fd5b50610164610232366004610838565b61037f565b348015610242575f80fd5b505f546101649073ffffffffffffffffffffffffffffffffffffffff1681565b34801561026d575f80fd5b5061012f61027c366004610871565b6105b5565b61012f61028f3660046108c9565b610706565b61012f6102a23660046108c9565b610743565b3480156102b2575f80fd5b506102d86102c13660046108c9565b63389a75e1600c9081525f91909152602090205490565b60405190815260200161011e565b5f6202a30067ffffffffffffffff164201905063389a75e1600c52335f52806020600c2055337fdbf36a107da19e49527a7176a1babf963b4b0ff8cde35ee35d6cd8f1f9ac7e1d5f80a250565b63389a75e1600c52335f525f6020600c2055337ffa7b8eab7da67f412cc9575ed43464468f9bfbae89d1675917346ca6d8fe3c925f80a2565b610374610769565b61037d5f61079e565b565b5f805460405174010000000000000000000000000000000000000000820467ffffffffffffffff16917f0000000000000000000000000000000000000000000000000000000000000000918791879185917c0100000000000000000000000000000000000000000000000000000000900461ffff1690889061040090610803565b73ffffffffffffffffffffffffffffffffffffffff968716815260208101959095529285166040850152606084019190915261ffff16608083015290911660a082015260c001604051809103905ff08015801561045f573d5f803e3d5ffd5b50915073ffffffffffffffffffffffffffffffffffffffff82166104af576040517f2f713b2900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6040517f23b872dd00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff8381166024830152604482018790527f000000000000000000000000000000000000000000000000000000000000000016906323b872dd906064015f604051808303815f87803b158015610542575f80fd5b505af1158015610554573d5f803e3d5ffd5b5050604080518881526020810185905273ffffffffffffffffffffffffffffffffffffffff8089169450861692507f8c9faa2a823b28da2916270ab1de36db5fc6f3a130561852c8ac553416e64f62910160405180910390a3509392505050565b6105bd610769565b61271061ffff821611156105fd576040517fe591f33d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff831661064a576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f805461ffff9092167c0100000000000000000000000000000000000000000000000000000000027fffff0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff67ffffffffffffffff90941674010000000000000000000000000000000000000000027fffffffff0000000000000000000000000000000000000000000000000000000090931673ffffffffffffffffffffffffffffffffffffffff909516949094179190911791909116919091179055565b61070e610769565b63389a75e1600c52805f526020600c20805442111561073457636f5e88185f526004601cfd5b5f90556107408161079e565b50565b61074b610769565b8060601b61076057637448fbae5f526004601cfd5b6107408161079e565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffff7487392754331461037d576382b429005f526004601cfd5b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffff74873927805473ffffffffffffffffffffffffffffffffffffffff9092169182907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a355565b61177e806108ea83390190565b803573ffffffffffffffffffffffffffffffffffffffff81168114610833575f80fd5b919050565b5f805f6060848603121561084a575f80fd5b8335925061085a60208501610810565b915061086860408501610810565b90509250925092565b5f805f60608486031215610883575f80fd5b61088c84610810565b9250602084013567ffffffffffffffff811681146108a8575f80fd5b9150604084013561ffff811681146108be575f80fd5b809150509250925092565b5f602082840312156108d9575f80fd5b6108e282610810565b939250505056fe610120604052348015610010575f80fd5b5060405161177e38038061177e83398101604081905261002f91610120565b610038846100d0565b6001600160a01b03861660a052428381011015610059575f19608052610060565b4283016080525b61ffff821660c0525f80546001600160a01b0319166001600160a01b038316179055336101005260e085905260408051868152602081018590527fcb75aa8347c098d414422e8cafbbe4e2c1a229f5b27bf425984b2b9792aa787a910160405180910390a1505050505050610195565b6001600160a01b0316638b78c6d819819055805f7f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08180a35b50565b6001600160a01b0381168114610109575f80fd5b5f805f805f8060c08789031215610135575f80fd5b86516101408161010c565b6020880151604089015191975095506101588161010c565b60608801516080890151919550935061ffff81168114610176575f80fd5b60a08801519092506101878161010c565b809150509295509295509295565b60805160a05160c05160e051610100516115276102575f395f81816103680152818161087e015261093d01525f81816102c80152818161051501528181610740015281816107f501528181610a5401528181610b420152610cf701525f818161016601528181610b0d01528181610e1b0152610e5901525f81816104bf0152818161076601528181610a9301528181610bee01528181610da2015261106d01525f818161030f0152818161042a0152818161045901526106ac01526115275ff3fe608060405260043610610140575f3560e01c8063a68aa5c7116100bb578063f04e283e11610071578063f359c2c611610057578063f359c2c614610357578063f4f3b2001461038a578063fee81cf4146103a9575f80fd5b8063f04e283e14610331578063f2fde38b14610344575f80fd5b8063d9d3a9b4116100a1578063d9d3a9b4146102b7578063e086e5ec146102ea578063e4e2b448146102fe575f80fd5b8063a68aa5c714610278578063c8796572146102a3575f80fd5b80636088e93a11610110578063715018a6116100f6578063715018a61461020857806386d1a69f146102105780638da5cb5b14610224575f80fd5b80636088e93a146101ca57806366718524146101e9575f80fd5b8063256929621461014b57806325aa0732146101555780634b680444146101a057806354d1f13d146101c2575f80fd5b3661014757005b5f80fd5b6101536103da565b005b348015610160575f80fd5b506101887f000000000000000000000000000000000000000000000000000000000000000081565b60405161ffff90911681526020015b60405180910390f35b3480156101ab575f80fd5b506101b4610427565b604051908152602001610197565b61015361047c565b3480156101d5575f80fd5b506101536101e43660046112a7565b6104b5565b3480156101f4575f80fd5b506101536102033660046112d1565b6105f9565b61015361068f565b34801561021b575f80fd5b506101536106a2565b34801561022f575f80fd5b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffff74873927545b60405173ffffffffffffffffffffffffffffffffffffffff9091168152602001610197565b348015610283575f80fd5b505f546102539073ffffffffffffffffffffffffffffffffffffffff1681565b3480156102ae575f80fd5b5061015361082d565b3480156102c2575f80fd5b506101b47f000000000000000000000000000000000000000000000000000000000000000081565b3480156102f5575f80fd5b50610153610fef565b348015610309575f80fd5b506101b47f000000000000000000000000000000000000000000000000000000000000000081565b61015361033f3660046112d1565b611000565b6101536103523660046112d1565b61103d565b348015610362575f80fd5b506102537f000000000000000000000000000000000000000000000000000000000000000081565b348015610395575f80fd5b506101536103a43660046112d1565b611063565b3480156103b4575f80fd5b506101b46103c33660046112d1565b63389a75e1600c9081525f91909152602090205490565b5f6202a30067ffffffffffffffff164201905063389a75e1600c52335f52806020600c2055337fdbf36a107da19e49527a7176a1babf963b4b0ff8cde35ee35d6cd8f1f9ac7e1d5f80a250565b5f7f000000000000000000000000000000000000000000000000000000000000000042111561045557505f90565b50427f00000000000000000000000000000000000000000000000000000000000000000390565b63389a75e1600c52335f525f6020600c2055337ffa7b8eab7da67f412cc9575ed43464468f9bfbae89d1675917346ca6d8fe3c925f80a2565b6104bd6110fe565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614801561053757507f000000000000000000000000000000000000000000000000000000000000000081145b1561056e576040517f9225b94100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6040517f23b872dd0000000000000000000000000000000000000000000000000000000081523060048201523360248201526044810182905273ffffffffffffffffffffffffffffffffffffffff8316906323b872dd906064015f604051808303815f87803b1580156105df575f80fd5b505af11580156105f1573d5f803e3d5ffd5b505050505050565b5f5473ffffffffffffffffffffffffffffffffffffffff163314610649576040517f48f5c3ed00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f80547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b6106976110fe565b6106a05f611133565b565b6106aa6110fe565b7f0000000000000000000000000000000000000000000000000000000000000000421015610704576040517f9225b94100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61070c61082d565b6040517f23b872dd0000000000000000000000000000000000000000000000000000000081523060048201523360248201527f000000000000000000000000000000000000000000000000000000000000000060448201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906323b872dd906064015f604051808303815f87803b1580156107bc575f80fd5b505af11580156107ce573d5f803e3d5ffd5b505050507fe1421c7dd281e651b805199c96c840ec9c7ec4f8d06dd20aefccee14cb2f692f7f000000000000000000000000000000000000000000000000000000000000000060405161082391815260200190565b60405180910390a1565b5f6108567fffffffffffffffffffffffffffffffffffffffffffffffffffffffff748739275490565b5f5490915073ffffffffffffffffffffffffffffffffffffffff9081169082163314610a2c577f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663c415b95c6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156108e5573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906109099190611303565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610a2c577f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16638da5cb5b6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156109a4573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906109c89190611303565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610a2c576040517f48f5c3ed00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6040517f99fbab880000000000000000000000000000000000000000000000000000000081527f000000000000000000000000000000000000000000000000000000000000000060048201525f90819073ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016906399fbab889060240161018060405180830381865afa158015610ad9573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610afd9190611360565b50505050505050509350935050507f000000000000000000000000000000000000000000000000000000000000000061ffff165f03610ceb57604080516080810182527f0000000000000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff868116602083019081526fffffffffffffffffffffffffffffffff8385018181526060850182815295517ffc6f786500000000000000000000000000000000000000000000000000000000815294516004860152915183166024850152905181166044840152925190921660648201525f9182917f00000000000000000000000000000000000000000000000000000000000000009091169063fc6f78659060840160408051808303815f875af1158015610c35573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610c59919061143a565b915091508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffffffffffffffff167f7246ff10bfeb8b33b0a900fe4a140d6cc640f44835a53c214e49765c0b2554108585604051610cdc929190918252602082015260400190565b60405180910390a45050610fe9565b604080516080810182527f0000000000000000000000000000000000000000000000000000000000000000815230602082019081526fffffffffffffffffffffffffffffffff8284018181526060840182815294517ffc6f786500000000000000000000000000000000000000000000000000000000815293516004850152915173ffffffffffffffffffffffffffffffffffffffff9081166024850152915181166044840152925190921660648201525f9182917f00000000000000000000000000000000000000000000000000000000000000009091169063fc6f78659060840160408051808303815f875af1158015610de9573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610e0d919061143a565b90925090505f612710610e447f000000000000000000000000000000000000000000000000000000000000000061ffff1685611489565b610e4e91906114a6565b90505f612710610e827f000000000000000000000000000000000000000000000000000000000000000061ffff1685611489565b610e8c91906114a6565b90505f610e9983866114de565b90505f610ea683866114de565b9050610eb3888b84611198565b610ebe878b83611198565b610ec9888a86611198565b610ed4878a85611198565b8673ffffffffffffffffffffffffffffffffffffffff168873ffffffffffffffffffffffffffffffffffffffff168b73ffffffffffffffffffffffffffffffffffffffff167f7246ff10bfeb8b33b0a900fe4a140d6cc640f44835a53c214e49765c0b2554108585604051610f53929190918252602082015260400190565b60405180910390a48673ffffffffffffffffffffffffffffffffffffffff168873ffffffffffffffffffffffffffffffffffffffff168a73ffffffffffffffffffffffffffffffffffffffff167f7246ff10bfeb8b33b0a900fe4a140d6cc640f44835a53c214e49765c0b2554108787604051610fda929190918252602082015260400190565b60405180910390a45050505050505b50505050565b610ff76110fe565b6106a0336111eb565b6110086110fe565b63389a75e1600c52805f526020600c20805442111561102e57636f5e88185f526004601cfd5b5f905561103a81611133565b50565b6110456110fe565b8060601b61105a57637448fbae5f526004601cfd5b61103a81611133565b61106b6110fe565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036110f0576040517f9225b94100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6110fa8133611204565b5050565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffff748739275433146106a0576382b429005f526004601cfd5b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffff74873927805473ffffffffffffffffffffffffffffffffffffffff9092169182907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a355565b81601452806034526fa9059cbb0000000000000000000000005f5260205f604460105f875af18060015f5114166111e157803d853b1517106111e1576390b8ec185f526004601cfd5b505f603452505050565b5f385f3847855af161103a5763b12d13eb5f526004601cfd5b5f6370a082315f5230602052602060346024601c865afa601f3d1116611231576390b8ec185f526004601cfd5b8160145260345190506fa9059cbb0000000000000000000000005f5260205f604460105f875af18060015f51141661127b57803d853b15171061127b576390b8ec185f526004601cfd5b505f60345292915050565b73ffffffffffffffffffffffffffffffffffffffff8116811461103a575f80fd5b5f80604083850312156112b8575f80fd5b82356112c381611286565b946020939093013593505050565b5f602082840312156112e1575f80fd5b81356112ec81611286565b9392505050565b80516112fe81611286565b919050565b5f60208284031215611313575f80fd5b81516112ec81611286565b805162ffffff811681146112fe575f80fd5b8051600281900b81146112fe575f80fd5b80516fffffffffffffffffffffffffffffffff811681146112fe575f80fd5b5f805f805f805f805f805f806101808d8f03121561137c575f80fd5b8c516bffffffffffffffffffffffff81168114611397575f80fd5b9b506113a560208e016112f3565b9a506113b360408e016112f3565b99506113c160608e016112f3565b98506113cf60808e0161131e565b97506113dd60a08e01611330565b96506113eb60c08e01611330565b95506113f960e08e01611341565b6101008e01516101208f0151919650945092506114196101408e01611341565b91506114286101608e01611341565b90509295989b509295989b509295989b565b5f806040838503121561144b575f80fd5b505080516020909101519092909150565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b80820281158282048414176114a0576114a061145c565b92915050565b5f826114d9577f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b500490565b818103818111156114a0576114a061145c56fea2646970667358221220ceec7893de426406628c12245a542a404dfb9298e7907413e3a75440efc6ec5b64736f6c634300081a0033a2646970667358221220306c91f773f5bd6d0cd64a9c8881ffe076763d236e8ef205f6f9582eb4f6d10664736f6c634300081a00336080604052348015600e575f80fd5b505f60405180602001601e90603c565b6020820181038252601f19601f820116604052509050805160208201f35b61519d8061004a8339019056fe610320604052348015610010575f80fd5b5060405161519d38038061519d83398101604081905261002f91610689565b3360e05280515f90610041908261092a565b506020810151600190610054908261092a565b5060a08101516001600160701b031660805260408101516002556060810151600390610080908261092a565b506080810151600490610093908261092a565b5060c0808201516001600160a01b0390811661016090815260e084015161ffff90811661024052610100808601519091166101c0908152610120808701518516610200908152610140808901516001600160701b03908116610220819052968a01518816909852610180808a015188169095526101a0808a015162ffffff16909352928801519095169091526101e08601518516918290529285015190931690915261013e916109f8565b6001600160701b039081166101e05261018051600780546080518416600160701b026001600160e01b031990911693831693909317929092179091556101a0515f9161018991610a1d565b6001600160701b031690506101bc81610180516001600160701b03166080516001600160701b03166104ed60201b60201c565b6001600160701b03166102808190526080515f916101d991610a1d565b6101a051600880546001600160701b039283166001600160e01b03199091161792909116600160701b81029290921790554264ffffffffff81811661026052610220860151166102c08190529192506102329190610a3c565b64ffffffffff9081166102a052610240840151166102e05261026083015160ff166103005260805161026d90670de0b6b3a764000090610a1d565b305f81815260096020526040812080546001600160701b0319166001600160701b0394909416939093179092556080519091905f8051602061517d833981519152906102c290670de0b6b3a764000090610a1d565b6040516001600160701b03909116815260200160405180910390a3335f8181526009602052604080822080546001600160701b031916670de0b6b3a764000090811790915590515f8051602061517d833981519152916103259190815260200190565b60405180910390a35f60c0516001600160a01b031663c45a01556040518163ffffffff1660e01b8152600401602060405180830381865afa15801561036c573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906103909190610a59565b6101405161012051604051630b4c774160e11b81523060048201526001600160a01b03928316602482015262ffffff90911660448201529192505f9190831690631698ee8290606401602060405180830381865afa1580156103f4573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906104189190610a59565b6001600160a01b03161461043f57604051630149ba8b60e11b815260040160405180910390fd5b60c05161014051610120516102808701516040516309f56ab160e11b81523060048201526001600160a01b03938416602482015262ffffff9092166044830152821660648201525f9291909116906313ead562906084016020604051808303815f875af11580156104b2573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906104d69190610a59565b6001600160a01b031660a05250610ac49350505050565b5f806104f98585610a7b565b6105038487610a8e565b61050d9190610aa5565b90506001600160701b038111156105375760405163162908e360e11b815260040160405180910390fd5b949350505050565b634e487b7160e01b5f52604160045260245ffd5b6040516102a081016001600160401b03811182821017156105765761057661053f565b60405290565b5f82601f83011261058b575f80fd5b81516001600160401b038111156105a4576105a461053f565b604051601f8201601f19908116603f011681016001600160401b03811182821017156105d2576105d261053f565b6040528181528382016020018510156105e9575f80fd5b8160208501602083015e5f918101602001919091529392505050565b80516001600160701b038116811461061b575f80fd5b919050565b6001600160a01b0381168114610634575f80fd5b50565b805161061b81610620565b805161ffff8116811461061b575f80fd5b805162ffffff8116811461061b575f80fd5b805164ffffffffff8116811461061b575f80fd5b805160ff8116811461061b575f80fd5b5f60208284031215610699575f80fd5b81516001600160401b038111156106ae575f80fd5b82016102a081850312156106c0575f80fd5b6106c8610553565b81516001600160401b038111156106dd575f80fd5b6106e98682850161057c565b82525060208201516001600160401b03811115610704575f80fd5b6107108682850161057c565b6020830152506040828101519082015260608201516001600160401b03811115610738575f80fd5b6107448682850161057c565b60608301525060808201516001600160401b03811115610762575f80fd5b61076e8682850161057c565b60808301525061078060a08301610605565b60a082015261079160c08301610637565b60c08201526107a260e08301610642565b60e08201526107b46101008301610642565b6101008201526107c76101208301610637565b6101208201526107da6101408301610605565b6101408201526107ed6101608301610637565b6101608201526108006101808301610637565b6101808201526108136101a08301610653565b6101a08201526108266101c08301610637565b6101c08201526108396101e08301610605565b6101e082015261084c6102008301610605565b61020082015261085f6102208301610665565b6102208201526108726102408301610665565b6102408201526108856102608301610679565b6102608201526108986102808301610637565b610280820152949350505050565b600181811c908216806108ba57607f821691505b6020821081036108d857634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561092557805f5260205f20601f840160051c810160208510156109035750805b601f840160051c820191505b81811015610922575f815560010161090f565b50505b505050565b81516001600160401b038111156109435761094361053f565b6109578161095184546108a6565b846108de565b6020601f821160018114610989575f83156109725750848201515b5f19600385901b1c1916600184901b178455610922565b5f84815260208120601f198516915b828110156109b85787850151825560209485019460019092019101610998565b50848210156109d557868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b634e487b7160e01b5f52601160045260245ffd5b6001600160701b038181168382160190811115610a1757610a176109e4565b92915050565b6001600160701b038281168282160390811115610a1757610a176109e4565b64ffffffffff8181168382160190811115610a1757610a176109e4565b5f60208284031215610a69575f80fd5b8151610a7481610620565b9392505050565b80820180821115610a1757610a176109e4565b8082028115828204841417610a1757610a176109e4565b5f82610abf57634e487b7160e01b5f52601260045260245ffd5b500490565b60805160a05160c05160e05161010051610120516101405161016051610180516101a0516101c0516101e05161020051610220516102405161026051610280516102a0516102c0516102e05161030051614446610d375f395f81816104ef01526131fe01525f81816104c50152818161319a01526131d201525f818161049c01528181610aec01526130f601525f818161047301528181610a84015261306901525f8181610b1a015261311c01525f818161044a01528181610abb01526130c501525f818161035001528181610a2001528181610bfc015261258101525f81816102fe015281816128e601528181612f55015261388001525f81816102d101528181610d5201528181610e2a01528181610e8a01528181610fe20152818161108901528181612e3c01528181612f34015261385f01525f8181610d0301528181611c8001526125fd01525f81816103c901528181611cab015261262801525f81816103a001528181611d29015281816132db015261345901525f61037801525f818161032601528181610698015281816125af0152612e6401525f818161019601528181610f3801528181611011015281816111fa015281816128570152818161291a01528181612c1c015261379e01525f818161041c01528181612a810152612c4b01525f8181612d7b0152612e8f01525f8181610eb2015281816115d7015261272201525f81816103f0015281816116180152818161279401528181612809015281816129d701528181612cbf0152612dad01525f8181610517015281816110b7015281816111530152818161157301526129b301525f818161025a01528181610b57015261315001526144465ff3fe608060405260043610610186575f3560e01c806395d89b41116100d1578063d96a094a1161007c578063f3ccaac011610057578063f3ccaac014610828578063fa461e331461083c578063fe330cc41461085b575f80fd5b8063d96a094a14610768578063dd62ed3e1461077b578063e66ce9fe146107bf575f80fd5b8063aea485cc116100ac578063aea485cc14610719578063c264a06314610741578063cce7ec1314610755575f80fd5b806395d89b41146106d2578063a4dac281146106e6578063a9059cbb146106fa575f80fd5b80633257b4f31161013157806384e1c22c1161010c57806384e1c22c1461061a5780638d6118ad1461062e5780638eca36f014610687575f80fd5b80633257b4f31461057a57806333d2220e1461058f57806370a08231146105c6575f80fd5b806323b872dd1161016157806323b872dd14610291578063264c8022146102b0578063313ce56714610554575f80fd5b806306fdde03146101f3578063095ea7b31461021d57806318160ddd1461024c575f80fd5b366101ef57336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146101ed576040517f48f5c3ed00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b005b5f80fd5b3480156101fe575f80fd5b5061020761087a565b6040516102149190613a7d565b60405180910390f35b348015610228575f80fd5b5061023c610237366004613ae4565b610905565b6040519015158152602001610214565b348015610257575f80fd5b507f00000000000000000000000000000000000000000000000000000000000000006001600160701b03165b604051908152602001610214565b34801561029c575f80fd5b5061023c6102ab366004613b0e565b61091b565b3480156102bb575f80fd5b5060408051610200810182526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811682526001600160701b037f0000000000000000000000000000000000000000000000000000000000000000811660208401527f000000000000000000000000000000000000000000000000000000000000000082168385015261ffff7f0000000000000000000000000000000000000000000000000000000000000000811660608501527f0000000000000000000000000000000000000000000000000000000000000000821660808501527f000000000000000000000000000000000000000000000000000000000000000090911660c08401527f00000000000000000000000000000000000000000000000000000000000000001660a08301527f0000000000000000000000000000000000000000000000000000000000000000811660e083015262ffffff7f00000000000000000000000000000000000000000000000000000000000000001661010083015264ffffffffff7f000000000000000000000000000000000000000000000000000000000000000081166101208401527f000000000000000000000000000000000000000000000000000000000000000081166101408401527f000000000000000000000000000000000000000000000000000000000000000081166101608401527f00000000000000000000000000000000000000000000000000000000000000001661018083015260ff7f0000000000000000000000000000000000000000000000000000000000000000166101a08301527f000000000000000000000000000000000000000000000000000000000000000081166101c0830152600554166101e082015290516102149190613b4c565b34801561055f575f80fd5b50610568601281565b60405160ff9091168152602001610214565b348015610585575f80fd5b5061028360025481565b34801561059a575f80fd5b506105ae6105a9366004613d08565b6109c2565b6040516001600160701b039091168152602001610214565b3480156105d1575f80fd5b506102836105e0366004613d3b565b6001600160a01b03165f908152600960205260409020546e01000000000000000000000000000081046001600160701b0390811691160190565b348015610625575f80fd5b50610283610a64565b348015610639575f80fd5b5061064d610648366004613d5d565b610ba0565b604080516001600160701b03968716815294861660208601529285169284019290925283166060830152909116608082015260a001610214565b348015610692575f80fd5b506106ba7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b039091168152602001610214565b3480156106dd575f80fd5b50610207610c5f565b3480156106f1575f80fd5b50610207610c6c565b348015610705575f80fd5b5061023c610714366004613ae4565b610c79565b348015610724575f80fd5b5061072d610c85565b604051610214989796959493929190613d76565b34801561074c575f80fd5b506101ed610d47565b6101ed610763366004613ae4565b6110b5565b6101ed610776366004613def565b61112e565b348015610786575f80fd5b50610283610795366004613e06565b6001600160a01b039182165f908152600a6020908152604080832093909416825291909152205490565b3480156107ca575f80fd5b506108136107d9366004613d3b565b6001600160a01b03165f908152600960205260409020546001600160701b03808216926e0100000000000000000000000000009092041690565b60408051928352602083019190915201610214565b348015610833575f80fd5b5061020761113b565b348015610847575f80fd5b506101ed610856366004613e3d565b611148565b348015610866575f80fd5b506101ed610875366004613eb9565b611272565b5f805461088690613ed3565b80601f01602080910402602001604051908101604052809291908181526020018280546108b290613ed3565b80156108fd5780601f106108d4576101008083540402835291602001916108fd565b820191905f5260205f20905b8154815290600101906020018083116108e057829003601f168201915b505050505081565b5f6109113384846113fc565b5060015b92915050565b6001600160a01b0383165f908152600a602090815260408083203384529091528120547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146109ac578281101561099f576040517f13be252b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6109ac85338584036113fc565b6109b78585856114dc565b506001949350505050565b5f805f806109ce611a70565b509250925092508015610a0d576040517fb4e95d9300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610a18868685611ac2565b61271061ffff7f00000000000000000000000000000000000000000000000000000000000000001682026001600160701b03160490039350610a5a8483611c69565b9695505050505050565b305f908152600960205260408120546001600160701b031664ffffffffff7f0000000000000000000000000000000000000000000000000000000000000000164210610aaf57919050565b5f610ae164ffffffffff7f00000000000000000000000000000000000000000000000000000000000000001642613f51565b90505f64ffffffffff7f000000000000000000000000000000000000000000000000000000000000000016610b3f836001600160701b037f000000000000000000000000000000000000000000000000000000000000000016613f64565b610b499190613fa8565b610b7c906001600160701b037f000000000000000000000000000000000000000000000000000000000000000016613f51565b9050808311610b8e575f935050505090565b610b988184613f51565b935050505090565b5f805f805f805f80610bb0611a70565b509250925092508015610bef576040517fb4e95d9300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6127106001600160701b037f000000000000000000000000000000000000000000000000000000000000000061ffff168b02160489039850610c318983611c69565b9850610c3d8984611ceb565b92995090975095509350610c518486613fbb565b975050505091939590929450565b6001805461088690613ed3565b6004805461088690613ed3565b5f6109113384846114dc565b6040805180820182525f8082526020918201819052825180840184528181528201819052825180840184526007546001600160701b0380821683526e010000000000000000000000000000918290048116838601528551808701909652600854808216875291909104811693850193909352600654909392908116917f000000000000000000000000000000000000000000000000000000000000000090911690808080610d31611a70565b9a9b999a98999798929791965094509092509050565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614610da9576040517f48f5c3ed00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f610db2611a70565b509250505080610dee576040517fd7b2559b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b305f908152600960205260409020546001600160701b03808216916e01000000000000000000000000000090041680821715610e5a57610e5a307f00000000000000000000000000000000000000000000000000000000000000008385016001600160701b03166114dc565b6040517fefa21fbd0000000000000000000000000000000000000000000000000000000081526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811660048301527f0000000000000000000000000000000000000000000000000000000000000000169063efa21fbd906024015f604051808303815f87803b158015610ef3575f80fd5b505af1158015610f05573d5f803e3d5ffd5b50506040517f70a082310000000000000000000000000000000000000000000000000000000081523060048201525f92507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031691506370a0823190602401602060405180830381865afa158015610f86573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610faa9190613fda565b9050801561107d576040517fa9059cbb0000000000000000000000000000000000000000000000000000000081526001600160a01b037f000000000000000000000000000000000000000000000000000000000000000081166004830152602482018390527f0000000000000000000000000000000000000000000000000000000000000000169063a9059cbb906044016020604051808303815f875af1158015611057573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061107b9190614000565b505b4780156110ae576110ae7f000000000000000000000000000000000000000000000000000000000000000082611e69565b5050505050565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316826001600160a01b031603611120576040517fd7b2559b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61112a8282611ea8565b5050565b6111383382611ea8565b50565b6003805461088690613ed3565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146111aa576040517f48f5c3ed00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f8413156111bd576111bd3033866114dc565b5f83131561126c576040517fa9059cbb000000000000000000000000000000000000000000000000000000008152336004820152602481018490527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063a9059cbb906044016020604051808303815f875af1158015611248573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906110ae9190614000565b50505050565b816001600160701b03165f036112b4576040517f2c5211c600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f805f806112c0611a70565b93509350935093508115611300576040517fb4e95d9300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f61131461130f3389886121a9565b612572565b905061132081856125e5565b9450905084801561132e5750835b8015611338575081155b1561134f5761134f816001600160701b03166126f3565b856001600160701b0316816001600160701b0316101561139b576040517fbb2875c300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6113ae33826001600160701b0316612fe2565b604080516001600160701b03808a1682528316602082015233917fed7a144fad14804d5c249145e3e0e2b63a9eb455b76aee5bc92d711e9bba3e4a910160405180910390a250505050505050565b6001600160a01b03831661143c576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6001600160a01b03821661147c576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6001600160a01b038381165f818152600a602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b03831661151c576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6001600160a01b03821661155c576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f80611566611a70565b50925050915080611727577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0385811690821614806115bd5750806001600160a01b0316866001600160a01b0316145b15611725575f6001600160a01b03871630148061160b57507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316876001600160a01b0316145b9050336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161480156116425750805b61172357336001600160a01b03831614801561166f5750816001600160a01b0316876001600160a01b0316145b801561168357506001600160a01b03861630145b80156116ac57506005547401000000000000000000000000000000000000000090046004908116145b61172357336001600160a01b0383161480156116d057506001600160a01b03871630145b80156116ed5750816001600160a01b0316866001600160a01b0316145b611723576040517fd7b2559b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b505b505b6001600160701b03831115611768576040517ff4d678b800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b825f80806117ac896001600160a01b03165f908152600960205260409020805490916001600160701b03808316926e01000000000000000000000000000090041690565b92509250925085156118ad57836001600160701b0316826001600160701b0316101561184a578082019150836001600160701b0316826001600160701b03161015611823576040517ff4d678b800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b82547fffffffff0000000000000000000000000000ffffffffffffffffffffffffffff1683555b82546001600160701b0385840381167fffffffffffffffffffffffffffffffffffff00000000000000000000000000009283161785556001600160a01b038a165f9081526009602052604090208054808316880190921691909216179055611a19565b836001600160701b0316826001600160701b031610156119ba578184036001600160701b038082169083161015611910576040517ff4d678b800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b83547fffffffff000000000000000000000000000000000000000000000000000000009081166e0100000000000000000000000000006001600160701b03848603811682029290921787556001600160a01b038c165f9081526009602052604090208054938416848416880184169081177fffffffffffffffffffffffffffffffffffff000000000000000000000000000090951617829004831690940190911602179055611a19565b82546001600160701b0385840381167fffffffffffffffffffffffffffffffffffff00000000000000000000000000009283161785556001600160a01b038a165f90815260096020526040902080548083168801909216919092161790555b6040516001600160701b03851681526001600160a01b03808a1691908b16907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a3505050505050505050565b60055474010000000000000000000000000000000000000000900460018181161490600280821614905f906008808216149060ff16848015611aaf5750835b8015611ab9575081155b92505090919293565b6001600160a01b0383165f908152600960205260408120546001600160701b03808216916e010000000000000000000000000000900416848115611b9e578415611b1a57611b108284613fbb565b92505f9150611b9e565b6008546001600160701b03808216916e010000000000000000000000000000900481169088908181169086161015611b62575083611b588185614019565b93505f9450611b72565b611b6c8186614019565b94505f93505b611b98816001600160701b0316836001600160701b0316856001600160701b0316612ffb565b96505050505b6001600160701b03811615611c5f5760078515611bb9575060085b80546001600160701b03808216916e010000000000000000000000000000900481169084908181169088161015611c1c576040517ff4d678b800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b611c268188614019565b9650611c4e816001600160701b0316836001600160701b0316856001600160701b0316612ffb565b611c589089613fbb565b9750505050505b5050509392505050565b8181610915576006546001600160701b03908116907f00000000000000000000000000000000000000000000000000000000000000008290039061271061ffff7f0000000000000000000000000000000000000000000000000000000000000000168702821604908181169083161015611ce05750805b909203949350505050565b5f805f805f8515611d00575085925082611e1a565b6007546001600160701b03808216916e0100000000000000000000000000009004165f611d4d837f0000000000000000000000000000000000000000000000000000000000000000614019565b9050896001600160701b038083169082161115611d73575080611d70818c614019565b94505b8098505f611d9d826001600160701b0316866001600160701b0316866001600160701b0316612ffb565b9050611da881613066565b9750876001600160701b0316816001600160701b03161115611e08575f611deb896001600160701b0316876001600160701b0316876001600160701b0316613286565b905080611df88489613fbb565b611e029190614019565b909a5095505b611e128a8d614019565b985050505050505b6001600160701b03811615611e5f576008546001600160701b03808216916e0100000000000000000000000000009004811690611e5a9084168383612ffb565b935050505b5092959194509250565b80471015611e7e5763b12d13eb5f526004601cfd5b5f385f388486620186a0f161112a57815f526073600b5360ff6020536016600b82f061112a573838fd5b341580611ebb57506001600160701b0334115b15611ef2576040517f2c5211c600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f805f80611efe611a70565b93509350935093508115611f3e576040517fb4e95d9300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f611f4834612572565b9050611f5481856125e5565b945090505f808080611f66858a61329c565b9c50929650909450925090505f611f7d8284613fbb565b90508a816001600160701b03161015611fc2576040517fbb2875c300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8060095f306001600160a01b03166001600160a01b031681526020019081526020015f205f015f8282829054906101000a90046001600160701b03160392506101000a8154816001600160701b0302191690836001600160701b031602179055505f60095f8e6001600160a01b03166001600160a01b031681526020019081526020015f20905083815f015f8282829054906101000a90046001600160701b03160192506101000a8154816001600160701b0302191690836001600160701b0316021790555082815f01600e8282829054906101000a90046001600160701b03160192506101000a8154816001600160701b0302191690836001600160701b031602179055508c6001600160a01b0316306001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161211a91906001600160701b0391909116815260200190565b60405180910390a35089801561212d5750885b8015612137575086155b15612145576121455f6126f3565b604080516001600160701b03878116825286811660208301528581168284015284166060820152905133917f064fb1933e186be0b289a87e98518dc18cc9856ecbc9f1353d1a138ddf733ec5919081900360800190a2505050505050505050505050565b5f805f806121ed876001600160a01b03165f908152600960205260409020805490916001600160701b03808316926e01000000000000000000000000000090041690565b91945092509050856001600160701b0382161561232d57851561221e576122148284613fbb565b92505f915061232d565b6008546001600160701b03808216916e01000000000000000000000000000090048116908990818116908616101561226657508361225c8185614019565b93505f9450612276565b6122708186614019565b94505f93505b61229c816001600160701b0316836001600160701b0316856001600160701b0316612ffb565b6008805491995089915f906122bb9084906001600160701b0316614019565b92506101000a8154816001600160701b0302191690836001600160701b031602179055508060085f01600e8282829054906101000a90046001600160701b03166123059190613fbb565b92506101000a8154816001600160701b0302191690836001600160701b031602179055505050505b6001600160701b0381161561247c5760078615612348575060085b80546001600160701b03808216916e0100000000000000000000000000009004811690849081811690881610156123ab576040517ff4d678b800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6123b58188614019565b96505f6123de826001600160701b0316846001600160701b0316866001600160701b0316612ffb565b90506123ea818b613fbb565b8554909a50819086905f906124099084906001600160701b0316614019565b92506101000a8154816001600160701b0302191690836001600160701b0316021790555081855f01600e8282829054906101000a90046001600160701b03166124529190613fbb565b92506101000a8154816001600160701b0302191690836001600160701b0316021790555050505050505b83546001600160701b038381166e010000000000000000000000000000027fffffffff0000000000000000000000000000000000000000000000000000000090921681861617919091178555305f90815260096020526040812080548a939192916124e991859116613fbb565b92506101000a8154816001600160701b0302191690836001600160701b03160217905550306001600160a01b0316886001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8960405161255f91906001600160701b0391909116815260200190565b60405180910390a3505050509392505050565b5f806127106001600160701b037f000000000000000000000000000000000000000000000000000000000000000061ffff168502160490506125dd7f0000000000000000000000000000000000000000000000000000000000000000826001600160701b0316611e69565b909103919050565b8181806126ec576006546001600160701b03908116907f00000000000000000000000000000000000000000000000000000000000000008290039061271061ffff7f000000000000000000000000000000000000000000000000000000000000000016880282160490818116908316116126ad5750600580547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff81166002740100000000000000000000000000000000000000009283900460ff161790910217905560019250805b600680547fffffffffffffffffffffffffffffffffffff0000000000000000000000000000169382016001600160701b03169390931790925550909103905b9250929050565b6004600560149054906101000a900460ff1617600560146101000a81548160ff021916908360ff1602179055507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316630434ab206040518163ffffffff1660e01b81526004015f604051808303815f87803b158015612778575f80fd5b505af115801561278a573d5f803e3d5ffd5b505050506127d9307f00000000000000000000000000000000000000000000000000000000000000007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6113fc565b6040517f095ea7b30000000000000000000000000000000000000000000000000000000081526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811660048301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60248301527f0000000000000000000000000000000000000000000000000000000000000000169063095ea7b3906044016020604051808303815f875af115801561289d573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906128c19190614000565b50305f908152600960205260408120546001600160701b039081169190839061290c907f00000000000000000000000000000000000000000000000000000000000000001647613f51565b6129169190613f51565b90507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663d0e30db0826040518263ffffffff1660e01b81526004015f604051808303818588803b158015612971575f80fd5b505af1158015612983573d5f803e3d5ffd5b50505050505f8061299d83856001600160701b03166135c1565b9150915081156129b0576110ae8561370e565b5f7f000000000000000000000000000000000000000000000000000000000000000090505f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663c45a01556040518163ffffffff1660e01b8152600401602060405180830381865afa158015612a31573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190612a559190614038565b6040517f22afcccb00000000000000000000000000000000000000000000000000000000815262ffffff7f00000000000000000000000000000000000000000000000000000000000000001660048201526001600160a01b0391909116906322afcccb90602401602060405180830381865afa158015612ad7573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190612afb9190614064565b90505f826001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa158015612b3a573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190612b5e919061408e565b5050505050509050836001600160a01b0316816001600160a01b031614612ba9575f612b8b84868961394b565b90508015612ba757612b9c8961370e565b505050505050505050565b505b5f8083600281900b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff2761881612bdf57612bdf613f7b565b0502915083600281900b620d89e881612bfa57612bfa613f7b565b050290505f604051806101600160405280306001600160a01b031681526020017f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031681526020017f000000000000000000000000000000000000000000000000000000000000000062ffffff1681526020018460020b81526020018360020b81526020018b6001600160701b031681526020018a81526020015f81526020015f8152602001306001600160a01b031681526020014281525090505f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166388316456836040518263ffffffff1660e01b8152600401612d099190614118565b6080604051808303815f875af1158015612d25573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190612d4991906141dc565b50506040517f095ea7b30000000000000000000000000000000000000000000000000000000081526001600160a01b037f000000000000000000000000000000000000000000000000000000000000000081166004830152602482018490529293507f00000000000000000000000000000000000000000000000000000000000000009092169163095ea7b391506044015f604051808303815f87803b158015612df1575f80fd5b505af1158015612e03573d5f803e3d5ffd5b50506040517f9442fd62000000000000000000000000000000000000000000000000000000008152600481018490526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301525f93507f0000000000000000000000000000000000000000000000000000000000000000169150639442fd62906064016020604051808303815f875af1158015612ed6573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190612efa9190614038565b600580547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0383161790559050612f827f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000006001600160701b0316611e69565b604080518c81526001600160701b038e1660208201526001600160a01b0380841692908b16917fb7c992d1a5a2e5be4dcae907b56ba0b4f1dee27c150539027e64fcce6f3859d9910160405180910390a350505050505050505050505050565b5f385f3884865af161112a5763b12d13eb5f526004601cfd5b5f80613007858561422c565b6130118487613f64565b61301b9190613fa8565b90506001600160701b0381111561305e576040517f2c5211c600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b949350505050565b5f7f000000000000000000000000000000000000000000000000000000000000000064ffffffffff164210613099575090565b305f908152600960205260408120546001600160701b03808516929116849003906130eb64ffffffffff7f00000000000000000000000000000000000000000000000000000000000000001642613f51565b90505f64ffffffffff7f000000000000000000000000000000000000000000000000000000000000000016613140837f000000000000000000000000000000000000000000000000000000000000000061423f565b61314a9190614261565b613174907f0000000000000000000000000000000000000000000000000000000000000000614019565b9050826001600160701b0316816001600160701b0316111561327c57600264ffffffffff7f0000000000000000000000000000000000000000000000000000000000000000166001600160701b038416101561323c5764ffffffffff7f0000000000000000000000000000000000000000000000000000000000000000166001600160701b0360ff7f00000000000000000000000000000000000000000000000000000000000000001685830302168161323057613230613f7b565b046001600160701b0316015b5f5b8181101561327957826001600160701b0316856001600160701b0316876132659190613f64565b61326f9190613fa8565b955060010161323e565b50505b5091949350505050565b5f806132928584613f51565b6130118686613f64565b5f808080848181156132b25750869350836134da565b6007546001600160701b03808216916e0100000000000000000000000000009004165f6132ff837f0000000000000000000000000000000000000000000000000000000000000000614019565b90508a6001600160701b038083169082161115613325575080613322818d614019565b94505b8099505f61334f826001600160701b0316866001600160701b0316866001600160701b0316612ffb565b905061335a81613066565b9850886001600160701b0316816001600160701b031611156133bd575f61339d8a6001600160701b0316876001600160701b0316876001600160701b0316613286565b9050806133aa8489613fbb565b6133b49190614019565b909b5095508a91505b6133c78b8e614019565b99506133d38286613fbb565b600780547fffffffffffffffffffffffffffffffffffff0000000000000000000000000000166001600160701b03831617905594506134128985614019565b600780547fffffffff0000000000000000000000000000ffffffffffffffffffffffffffff166e0100000000000000000000000000006001600160701b03938416021790557f0000000000000000000000000000000000000000000000000000000000000000811690861614965086156134d457600580547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff81166001740100000000000000000000000000000000000000009283900460ff16179091021790555b50505050505b6001600160701b038116156135b6576008546001600160701b03808216916e010000000000000000000000000000900481169061351a9084168383612ffb565b94506135268383613fbb565b600880547fffffffffffffffffffffffffffffffffffff0000000000000000000000000000166001600160701b03929092169190911790556135688582614019565b600880546001600160701b03929092166e010000000000000000000000000000027fffffffff0000000000000000000000000000ffffffffffffffffffffffffffff90921691909117905550505b509295509295909350565b5f808315806135ce575082155b156135de5750600190505f6126ec565b5f613609857fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff613fa8565b90505f60605b61361e600182901b60026143af565b915081831161363757613630816143ba565b905061360f565b5f8160600360020a6136e088858b028161365357613653613f7b565b0470ffffffffffffffffffffffffffffffffff811160071b81811c68ffffffffffffffffff1060061b1781811c64ffffffffff1060051b1781811c62ffffff1060041b1781811c620100000160b5600192831c1b0260121c80830401811c80830401811c80830401811c80830401811c80830401811c80830401811c80830401901c908190048111900390565b0290506001600160a01b038111156137025760015f95509550505050506126ec565b93505050509250929050565b6005805460ff7401000000000000000000000000000000000000000080830482166004908118600817909216027fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff909216919091179091556040517f70a0823100000000000000000000000000000000000000000000000000000000815230918101919091526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690632e1a7d4d9082906370a0823190602401602060405180830381865afa1580156137eb573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061380f9190613fda565b6040518263ffffffff1660e01b815260040161382d91815260200190565b5f604051808303815f87803b158015613844575f80fd5b505af1158015613856573d5f803e3d5ffd5b505050506138ad7f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000006001600160701b0316611e69565b305f908152600960205260408120546001600160701b0316906138d08347613f51565b600880546001600160701b038581166e010000000000000000000000000000027fffffffff00000000000000000000000000000000000000000000000000000000909216908416171790556040519091507fa27bfda2365303af1eb9ae3c438e6ab4bc7c77fd59a91e7157b1cfeed9ba4b58905f90a1505050565b6040517f128acb080000000000000000000000000000000000000000000000000000000081523060048201525f60248201819052604482018390526001600160a01b03848116606484015260a0608484015260a4830182905290919085169063128acb089060c40160408051808303815f875af11580156139ce573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906139f291906143ee565b50505f846001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa158015613a31573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190613a55919061408e565b5050505050509050806001600160a01b0316846001600160a01b031614159150509392505050565b602081525f82518060208401528060208501604085015e5f6040828501015260407fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f83011684010191505092915050565b6001600160a01b0381168114611138575f80fd5b5f8060408385031215613af5575f80fd5b8235613b0081613ad0565b946020939093013593505050565b5f805f60608486031215613b20575f80fd5b8335613b2b81613ad0565b92506020840135613b3b81613ad0565b929592945050506040919091013590565b81516001600160a01b0316815261020081016020830151613b7860208401826001600160701b03169052565b506040830151613b9360408401826001600160a01b03169052565b506060830151613ba9606084018261ffff169052565b506080830151613bc460808401826001600160701b03169052565b5060a0830151613bda60a084018261ffff169052565b5060c0830151613bf560c08401826001600160701b03169052565b5060e0830151613c1060e08401826001600160a01b03169052565b50610100830151613c2961010084018262ffffff169052565b50610120830151613c4461012084018264ffffffffff169052565b50610140830151613c5f61014084018264ffffffffff169052565b50610160830151613c7a61016084018264ffffffffff169052565b50610180830151613c9561018084018264ffffffffff169052565b506101a0830151613cac6101a084018260ff169052565b506101c0830151613cc96101c08401826001600160a01b03169052565b506101e0830151613ce66101e08401826001600160a01b03169052565b5092915050565b80356001600160701b0381168114613d03575f80fd5b919050565b5f8060408385031215613d19575f80fd5b8235613d2481613ad0565b9150613d3260208401613ced565b90509250929050565b5f60208284031215613d4b575f80fd5b8135613d5681613ad0565b9392505050565b5f60208284031215613d6d575f80fd5b613d5682613ced565b6101408101613d9b828b80516001600160701b03908116835260209182015116910152565b88516001600160701b03908116604084015260208a0151166060830152608082019790975260a081019590955292151560c085015290151560e0840152151561010083015215156101209091015292915050565b5f60208284031215613dff575f80fd5b5035919050565b5f8060408385031215613e17575f80fd5b8235613e2281613ad0565b91506020830135613e3281613ad0565b809150509250929050565b5f805f8060608587031215613e50575f80fd5b8435935060208501359250604085013567ffffffffffffffff811115613e74575f80fd5b8501601f81018713613e84575f80fd5b803567ffffffffffffffff811115613e9a575f80fd5b876020828401011115613eab575f80fd5b949793965060200194505050565b5f8060408385031215613eca575f80fd5b613d2483613ced565b600181811c90821680613ee757607f821691505b602082108103613f1e577f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b50919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b8181038181111561091557610915613f24565b808202811582820484141761091557610915613f24565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b5f82613fb657613fb6613f7b565b500490565b6001600160701b03818116838216019081111561091557610915613f24565b5f60208284031215613fea575f80fd5b5051919050565b80518015158114613d03575f80fd5b5f60208284031215614010575f80fd5b613d5682613ff1565b6001600160701b03828116828216039081111561091557610915613f24565b5f60208284031215614048575f80fd5b8151613d5681613ad0565b8051600281900b8114613d03575f80fd5b5f60208284031215614074575f80fd5b613d5682614053565b805161ffff81168114613d03575f80fd5b5f805f805f805f60e0888a0312156140a4575f80fd5b87516140af81613ad0565b96506140bd60208901614053565b95506140cb6040890161407d565b94506140d96060890161407d565b93506140e76080890161407d565b925060a088015160ff811681146140fc575f80fd5b915061410a60c08901613ff1565b905092959891949750929550565b81516001600160a01b031681526101608101602083015161414460208401826001600160a01b03169052565b50604083015161415b604084018262ffffff169052565b506060830151614170606084018260020b9052565b506080830151614185608084018260020b9052565b5060a083015160a083015260c083015160c083015260e083015160e08301526101008301516101008301526101208301516141cc6101208401826001600160a01b03169052565b5061014092830151919092015290565b5f805f80608085870312156141ef575f80fd5b845160208601519094506fffffffffffffffffffffffffffffffff81168114614216575f80fd5b6040860151606090960151949790965092505050565b8082018082111561091557610915613f24565b6001600160701b038181168382160290811690818114613ce657613ce6613f24565b5f6001600160701b0383168061427957614279613f7b565b806001600160701b0384160491505092915050565b6001815b60018411156142c9578085048111156142ad576142ad613f24565b60018416156142bb57908102905b60019390931c928002614292565b935093915050565b5f826142df57506001610915565b816142eb57505f610915565b8160018114614301576002811461430b57614327565b6001915050610915565b60ff84111561431c5761431c613f24565b50506001821b610915565b5060208310610133831016604e8410600b841016171561434a575081810a610915565b6143757fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff848461428e565b807fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048211156143a7576143a7613f24565b029392505050565b5f613d5683836142d1565b5f816143c8576143c8613f24565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b5f80604083850312156143ff575f80fd5b50508051602090910151909290915056fea2646970667358221220bdbb43e5277840ad7c56989a37e9521f443133af3447a72774612d98ac1fa84a64736f6c634300081a0033ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    sourceMap:
      '974:23515:29:-:0;;;1585:38;;;-1:-1:-1;;;;;;1834:29:29;;;;;1899:37;;;-1:-1:-1;;;;;;2184:51:29;;;;;2081:41;2303:44;;2551:46;;;;;;2696:54;;;-1:-1:-1;;2837:36:29;;;;;3003:11;2184:51;2967:47;7847:1490;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;7893:45;7980:14;7893:102;;8006:21;8029:24;8055:31;8088:22;8126:6;-1:-1:-1;;;;;8126:42:29;;:44;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;8005:165;;-1:-1:-1;8005:165:29;;-1:-1:-1;8005:165:29;-1:-1:-1;8005:165:29;-1:-1:-1;;;;;;8198:27:29;;;;:61;;-1:-1:-1;;;;;;8229:30:29;;;8198:61;:102;;;-1:-1:-1;;;;;;8263:37:29;;;8198:102;:142;;;-1:-1:-1;8320:20:29;;;;8198:142;8181:219;;;8372:17;;-1:-1:-1;;;8372:17:29;;;;;;;;;;;8181:219;8410:31;8427:13;8410:16;:31::i;:::-;-1:-1:-1;;;;;8451:79:29;;;;;;8579:34;;;-1:-1:-1;;;8579:34:29;;;;8540:18;;8451:79;8579:32;;:34;;;;;;;;;;;;;;8451:79;8579:34;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;8561:91;;-1:-1:-1;;;8561:91:29;;1122:8:44;1110:21;;8561:91:29;;;1092:40:44;-1:-1:-1;;;;;8561:74:29;;;;;;;1065:18:44;;8561:91:29;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;8540:112;;8666:12;:17;;8682:1;8666:17;8662:72;;8706:17;;-1:-1:-1;;;8706:17:29;;;;;;;;;;;8662:72;8743:11;:26;;-1:-1:-1;;8743:26:29;;;;;;;8845:40;8743:26;8845;:40::i;:::-;8780:17;8779:106;;-1:-1:-1;;8779:106:29;;;;;;;-1:-1:-1;;8779:106:29;;;;;;;;;;;;-1:-1:-1;;;;;;;;8779:106:29;;-1:-1:-1;;;;;8779:106:29;;;;;;;8895:35;;-1:-1:-1;8895:35:29;;;:17;:35;;;;;;;;;:42;;-1:-1:-1;;8895:42:29;-1:-1:-1;8895:42:29;;;;;;8952:40;;1565:41:44;;;8952:40:29;;1538:18:44;8952:40:29;;;;;;;9028:15;9011:14;;:32;;;;;;;;;;;;;;;;;;9060:24;;-1:-1:-1;;;;;9060:30:29;;:32;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;;;;;9053:39:29;;;9218:24;;9161:82;;9185:13;;9200:16;;9161:82;;;:::i;:::-;-1:-1:-1;;;;;1874:32:44;;;1856:51;;1943:32;;;1938:2;1923:18;;1916:60;2012:32;;;2007:2;1992:18;;1985:60;1844:2;1829:18;9161:82:29;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;9103:13:29;:151;;-1:-1:-1;;;;;;9103:151:29;-1:-1:-1;;;;;9103:151:29;;;;;;;;;;9301:28;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;;9265:65:29;;;-1:-1:-1;974:23515:29;;-1:-1:-1;;;;;;974:23515:29;4883:1190:22;-1:-1:-1;;;;;5793:26:22;-1:-1:-1;;5876:29:22;;;5793:26;6031:1;5991:38;6031:1;;5980:63;4883:1190;:::o;23977:510:29:-;24056:26;-1:-1:-1;;24056:26:29;24299:12;24260:36;;;;3945:7;24260:36;;;;;:::i;:::-;;:51;;-1:-1:-1;;24349:36:29;;;24420:50;24260:51;24420:27;:50::i;:::-;24399:71;23977:510;;-1:-1:-1;23977:510:29;-1:-1:-1;23977:510:29:o;1354:2588:43:-;1417:20;1449:15;1474:1;1467:4;:8;;;:57;;1518:4;1511:12;;1467:57;;;1494:4;1487:12;;1486:13;;;:::i;:::-;1449:75;-1:-1:-1;636:9:43;-1:-1:-1;;636:9:43;:::i;:::-;1561:16;;1542:7;:36;;1534:50;;;;-1:-1:-1;;;1534:50:43;;2852:2:44;1534:50:43;;;2834:21:44;2891:1;2871:18;;;2864:29;-1:-1:-1;;;2909:18:44;;;2902:31;2950:18;;1534:50:43;;;;;;;;1595:13;1611:7;1621:3;1611:13;1628:1;1611:18;:93;;-1:-1:-1;;;1611:93:43;;;1632:34;1611:93;-1:-1:-1;;;;;1595:109:43;;-1:-1:-1;1728:3:43;1718:13;;:18;1714:83;;1794:3;1747:42;:5;1755:34;1747:42;:::i;:::-;1746:51;;1738:59;;1714:83;1821:3;1811:13;;:18;1807:83;;1887:3;1840:42;:5;1848:34;1840:42;:::i;:::-;1839:51;;1831:59;;1807:83;1914:3;1904:13;;:18;1900:83;;1980:3;1933:42;:5;1941:34;1933:42;:::i;:::-;1932:51;;1924:59;;1900:83;2007:4;1997:14;;:19;1993:84;;2074:3;2027:42;:5;2035:34;2027:42;:::i;:::-;2026:51;;2018:59;;1993:84;2101:4;2091:14;;:19;2087:84;;2168:3;2121:42;:5;2129:34;2121:42;:::i;:::-;2120:51;;2112:59;;2087:84;2195:4;2185:14;;:19;2181:84;;2262:3;2215:42;:5;2223:34;2215:42;:::i;:::-;2214:51;;2206:59;;2181:84;2289:4;2279:14;;:19;2275:84;;2356:3;2309:42;:5;2317:34;2309:42;:::i;:::-;2308:51;;2300:59;;2275:84;2383:5;2373:15;;:20;2369:85;;2451:3;2404:42;:5;2412:34;2404:42;:::i;:::-;2403:51;;2395:59;;2369:85;2478:5;2468:15;;:20;2464:85;;2546:3;2499:42;:5;2507:34;2499:42;:::i;:::-;2498:51;;2490:59;;2464:85;2573:5;2563:15;;:20;2559:85;;2641:3;2594:42;:5;2602:34;2594:42;:::i;:::-;2593:51;;2585:59;;2559:85;2668:5;2658:15;;:20;2654:85;;2736:3;2689:42;:5;2697:34;2689:42;:::i;:::-;2688:51;;2680:59;;2654:85;2763:6;2753:16;;:21;2749:86;;2832:3;2785:42;:5;2793:34;2785:42;:::i;:::-;2784:51;;2776:59;;2749:86;2859:6;2849:16;;:21;2845:86;;2928:3;2881:42;:5;2889:34;2881:42;:::i;:::-;2880:51;;2872:59;;2845:86;2955:6;2945:16;;:21;2941:86;;3024:3;2977:42;:5;2985:34;2977:42;:::i;:::-;2976:51;;2968:59;;2941:86;3051:6;3041:16;;:21;3037:86;;3120:3;3073:42;:5;3081:34;3073:42;:::i;:::-;3072:51;;3064:59;;3037:86;3147:7;3137:17;;:22;3133:86;;3216:3;3170:41;:5;3178:33;3170:41;:::i;:::-;3169:50;;3161:58;;3133:86;3243:7;3233:17;;:22;3229:85;;3311:3;3266:40;:5;3274:32;3266:40;:::i;:::-;3265:49;;3257:57;;3229:85;3338:7;3328:17;;:22;3324:83;;3404:3;3361:38;:5;3369:30;3361:38;:::i;:::-;3360:47;;3352:55;;3324:83;3431:7;3421:17;;:22;3417:78;;3492:3;3454:33;:5;3462:25;3454:33;:::i;:::-;3453:42;;3445:50;;3417:78;3517:1;3510:4;:8;;;3506:47;;;3528:25;3548:5;-1:-1:-1;;3528:25:43;:::i;:::-;3520:33;;3506:47;3903:17;3912:7;3903:5;:17;:::i;:::-;:22;:30;;3932:1;3903:30;;;3928:1;3903:30;3886:48;;;;3896:2;3887:11;;;3886:48;:::i;:::-;3863:72;1354:2588;-1:-1:-1;;;;1354:2588:43:o;974:23515:29:-;;;;;;;;:::o;:::-;;;;;;;;:::o;14:177:44:-;93:13;;-1:-1:-1;;;;;135:31:44;;125:42;;115:70;;181:1;178;171:12;115:70;14:177;;;:::o;196:208::-;266:6;319:2;307:9;298:7;294:23;290:32;287:52;;;335:1;332;325:12;287:52;358:40;388:9;358:40;:::i;:::-;348:50;196:208;-1:-1:-1;;;196:208:44:o;409:534::-;505:6;513;521;529;582:3;570:9;561:7;557:23;553:33;550:53;;;599:1;596;589:12;550:53;622:40;652:9;622:40;:::i;:::-;612:50;;681:49;726:2;715:9;711:18;681:49;:::i;:::-;671:59;;749:49;794:2;783:9;779:18;749:49;:::i;:::-;739:59;;841:2;830:9;826:18;820:25;885:8;878:5;874:20;867:5;864:31;854:59;;909:1;906;899:12;854:59;409:534;;;;-1:-1:-1;409:534:44;;-1:-1:-1;;409:534:44:o;1143:277::-;1211:6;1264:2;1252:9;1243:7;1239:23;1235:32;1232:52;;;1280:1;1277;1270:12;1232:52;1312:9;1306:16;1365:5;1362:1;1351:20;1344:5;1341:31;1331:59;;1386:1;1383;1376:12;2056:127;2117:10;2112:3;2108:20;2105:1;2098:31;2148:4;2145:1;2138:15;2172:4;2169:1;2162:15;2188:127;2249:10;2244:3;2240:20;2237:1;2230:31;2280:4;2277:1;2270:15;2304:4;2301:1;2294:15;2320:136;2355:3;-1:-1:-1;;;2376:22:44;;2373:48;;2401:18;;:::i;:::-;-1:-1:-1;2441:1:44;2437:13;;2320:136::o;2461:184::-;2495:3;2542:5;2539:1;2528:20;2576:7;2572:12;2563:7;2560:25;2557:51;;2588:18;;:::i;:::-;2628:1;2624:15;;2461:184;-1:-1:-1;;2461:184:44:o;2979:168::-;3052:9;;;3083;;3100:15;;;3094:22;;3080:37;3070:71;;3121:18;;:::i;:::-;2979:168;;;;:::o;3152:120::-;3192:1;3218;3208:35;;3223:18;;:::i;:::-;-1:-1:-1;3257:9:44;;3152:120::o;3277:112::-;3309:1;3335;3325:35;;3340:18;;:::i;:::-;-1:-1:-1;3374:9:44;;3277:112::o;3394:125::-;3459:9;;;3480:10;;;3477:36;;;3493:18;;:::i;3394:125::-;974:23515:29;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
    linkReferences: {},
  },
  deployedBytecode: {
    object:
      '0x60806040526004361061020f575f3560e01c8063711bb3d511610117578063e025fa01116100ac578063f04e283e1161007c578063f2fde38b11610062578063f2fde38b146106e9578063f31a8f67146106fc578063fee81cf41461071b575f80fd5b8063f04e283e146106b0578063f2cff57f146106c3575f80fd5b8063e025fa0114610608578063e55725fa14610643578063e9cfe67e14610672578063efa21fbd14610691575f80fd5b80638ec38768116100e75780638ec3876814610577578063baf2610b146105b5578063bd68a82b146105ca578063c217aac1146105e9575f80fd5b8063711bb3d5146104e4578063715018a6146105165780637fe90dc71461051e5780638da5cb5b14610544575f80fd5b806325692962116101a75780633aeac4e11161017757806351f188991161015d57806351f188991461048a57806354d1f13d146104bd578063690d8320146104c5575f80fd5b80633aeac4e1146104315780634232c71214610450575f80fd5b806325692962146103b05780632a123b16146103b85780632b37836d146103e3578063369c638a14610416575f80fd5b806306133458116101e257806306133458146102b4578063086f8d6b146102ed578063220f3ead14610344578063231ce39814610378575f80fd5b80630132ec541461021357806301e3366714610247578063028221cc146102685780630434ab20146102a0575b5f80fd5b34801561021e575f80fd5b5060025461022e9062ffffff1681565b60405162ffffff90911681526020015b60405180910390f35b348015610252575f80fd5b5061026661026136600461265a565b61074c565b005b61027b610276366004612798565b6107e9565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200161023e565b3480156102ab575f80fd5b50610266610e99565b3480156102bf575f80fd5b506102df6102ce366004612886565b60076020525f908152604090205481565b60405190815260200161023e565b3480156102f8575f80fd5b50600154610325906e01000000000000000000000000000090046dffffffffffffffffffffffffffff1681565b6040516dffffffffffffffffffffffffffff909116815260200161023e565b34801561034f575f80fd5b50600254610365906301000000900461ffff1681565b60405161ffff909116815260200161023e565b348015610383575f80fd5b50600354610325906e01000000000000000000000000000090046dffffffffffffffffffffffffffff1681565b61026661135e565b3480156103c3575f80fd5b505f5461027b9073ffffffffffffffffffffffffffffffffffffffff1681565b3480156103ee575f80fd5b5061027b7f000000000000000000000000000000000000000000000000000000000000000081565b348015610421575f80fd5b5060045461022e9062ffffff1681565b34801561043c575f80fd5b5061026661044b3660046128a8565b6113ab565b34801561045b575f80fd5b50600154610365907c0100000000000000000000000000000000000000000000000000000000900461ffff1681565b348015610495575f80fd5b5061027b7f000000000000000000000000000000000000000000000000000000000000000081565b610266611442565b3480156104d0575f80fd5b506102666104df366004612886565b61147b565b3480156104ef575f80fd5b50600454610504906301000000900460ff1681565b60405160ff909116815260200161023e565b61026661156a565b348015610529575f80fd5b50600354610325906dffffffffffffffffffffffffffff1681565b34801561054f575f80fd5b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffff748739275461027b565b348015610582575f80fd5b506105a5610591366004612886565b60086020525f908152604090205460ff1681565b604051901515815260200161023e565b3480156105c0575f80fd5b506102df60055481565b3480156105d5575f80fd5b506102666105e4366004612948565b61157d565b3480156105f4575f80fd5b50610266610603366004612886565b611b68565b348015610613575f80fd5b5060035461022e907c0100000000000000000000000000000000000000000000000000000000900462ffffff1681565b34801561064e575f80fd5b50600254610325906501000000000090046dffffffffffffffffffffffffffff1681565b34801561067d575f80fd5b5061026661068c366004612a1b565b611c06565b34801561069c575f80fd5b506102666106ab366004612886565b611c13565b6102666106be366004612886565b611c1d565b3480156106ce575f80fd5b50600154610325906dffffffffffffffffffffffffffff1681565b6102666106f7366004612886565b611c5a565b348015610707575f80fd5b50610266610716366004612a3f565b611c80565b348015610726575f80fd5b506102df610735366004612886565b63389a75e1600c9081525f91909152602090205490565b610754611d5e565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036107d9576040517f1eb00b0600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6107e4838383611d93565b505050565b73ffffffffffffffffffffffffffffffffffffffff88165f9081526008602052604081205460ff16610847576040517f3419a9e500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60015434906dffffffffffffffffffffffffffff1680821015610896576040517f9c31f11500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b80156108b2576108a68183612a98565b91506108b28b82611de6565b6005548211156108ee576040517f281dda5f00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6002546040805160207f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16803b808401830190945283835262ffffff909416935f93918491908401903c604051806102a001604052808d81526020018c81526020018b81526020018a81526020018981526020016001600e9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020018f73ffffffffffffffffffffffffffffffffffffffff1681526020016001601c9054906101000a900461ffff1661ffff168152602001600260039054906101000a900461ffff1661ffff1681526020018e73ffffffffffffffffffffffffffffffffffffffff168152602001600260059054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020017f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1681526020015f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018462ffffff1681526020017f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16815260200160035f9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020016003600e9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020016003601c9054906101000a900462ffffff1662ffffff1664ffffffffff16815260200160045f9054906101000a900462ffffff1662ffffff1664ffffffffff168152602001600460039054906101000a900460ff1660ff168152602001600660099054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815250604051602001610c119190612afd565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe081840301815290829052610c4d9291602001612dbb565b6040516020818303038152906040529050858151602083015ff5945073ffffffffffffffffffffffffffffffffffffffff85161580610cd757507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff16115b15610d0e576040517f1eb00b0600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610d188583611dff565b8315610da4576040517fcce7ec1300000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8d811660048301525f602483015286169063cce7ec139086906044015f604051808303818588803b158015610d8c575f80fd5b505af1158015610d9e573d5f803e3d5ffd5b50505050505b5f8573ffffffffffffffffffffffffffffffffffffffff1663264c80226040518163ffffffff1660e01b815260040161020060405180830381865afa158015610def573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610e139190612e1a565b90508c73ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff167fa972e8e5afb51408a9d3743f5cae264977da49f47267bd8b1ed62f31e026f08c8d846101400151856101c00151604051610e8093929190612f56565b60405180910390a3505050505098975050505050505050565b335f8181526007602052604081205490819003610ee2576040517f1eb00b0600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8281165f90815260076020526040808220829055517f99fbab880000000000000000000000000000000000000000000000000000000081526004810184905290917f000000000000000000000000000000000000000000000000000000000000000016906399fbab889060240161018060405180830381865afa158015610f80573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610fa49190612fcb565b50506040805160a0810182528d81526fffffffffffffffffffffffffffffffff851660208201525f818301819052606082015242608082015290517f0c49ccbe000000000000000000000000000000000000000000000000000000008152939b5099505073ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000169750630c49ccbe965061105d95508894505060040191506130a59050565b60408051808303815f875af1158015611078573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061109c91906130f0565b50506040517f99fbab88000000000000000000000000000000000000000000000000000000008152600481018490525f90819073ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016906399fbab889060240161018060405180830381865afa15801561112c573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906111509190612fcb565b9b509b50505050505050505050505f60405180608001604052808781526020018873ffffffffffffffffffffffffffffffffffffffff168152602001846fffffffffffffffffffffffffffffffff168152602001836fffffffffffffffffffffffffffffffff1681525090507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663fc6f7865826040518263ffffffff1660e01b815260040161127991905f6080820190508251825273ffffffffffffffffffffffffffffffffffffffff60208401511660208301526fffffffffffffffffffffffffffffffff60408401511660408301526fffffffffffffffffffffffffffffffff606084015116606083015292915050565b60408051808303815f875af1158015611294573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906112b891906130f0565b50506040517f42966c68000000000000000000000000000000000000000000000000000000008152600481018790527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906342966c68906024015f604051808303815f87803b15801561133f575f80fd5b505af1158015611351573d5f803e3d5ffd5b5050505050505050505050565b5f6202a30067ffffffffffffffff164201905063389a75e1600c52335f52806020600c2055337fdbf36a107da19e49527a7176a1babf963b4b0ff8cde35ee35d6cd8f1f9ac7e1d5f80a250565b6113b3611d5e565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611438576040517f1eb00b0600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6107e48282612057565b63389a75e1600c52335f525f6020600c2055337ffa7b8eab7da67f412cc9575ed43464468f9bfbae89d1675917346ca6d8fe3c925f80a2565b611483611d5e565b73ffffffffffffffffffffffffffffffffffffffff81166114d0576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f8173ffffffffffffffffffffffffffffffffffffffff16476040515f6040518083038185875af1925050503d805f8114611526576040519150601f19603f3d011682016040523d82523d5f602084013e61152b565b606091505b5050905080611566576040517f27fcd9d100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5050565b611572611d5e565b61157b5f6120d9565b565b611585611d5e565b69152d02c7e14af68000006dffffffffffffffffffffffffffff8b1610806115ca57506d04ee2d6d415b85acef81000000006dffffffffffffffffffffffffffff8b16115b806115d95750606461ffff8a16115b806116035750836dffffffffffffffffffffffffffff16856dffffffffffffffffffffffffffff16115b806116125750606461ffff8816115b80611623575061038462ffffff8416105b80611635575062093a8062ffffff8416115b8061164957508262ffffff168262ffffff16115b8061165a575061012c62ffffff8316105b8061166c57506206978062ffffff8316115b8061167a5750600260ff8216105b806116885750606460ff8216115b156116bf576040517fe591f33d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663c45a01556040518163ffffffff1660e01b8152600401602060405180830381865afa158015611729573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061174d9190613112565b6040517f22afcccb00000000000000000000000000000000000000000000000000000000815262ffffff8b16600482015273ffffffffffffffffffffffffffffffffffffffff91909116906322afcccb90602401602060405180830381865afa1580156117bc573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906117e0919061312d565b60065490915060020b5f03611821576040517fe591f33d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600680547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000001662ffffff83161790556118598161213e565b60066009600660036006808691906101000a81548162ffffff021916908360020b62ffffff1602179055508591906101000a81548162ffffff021916908360020b62ffffff1602179055508491906101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050508b60015f6101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff1602179055508a6001600e6101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff160217905550896001601c6101000a81548161ffff021916908361ffff1602179055508860025f6101000a81548162ffffff021916908362ffffff16021790555087600260036101000a81548161ffff021916908361ffff16021790555086600260056101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff1602179055508560035f6101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff160217905550846003600e6101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff160217905550836003601c6101000a81548162ffffff021916908362ffffff1602179055508260045f6101000a81548162ffffff021916908362ffffff16021790555081600460036101000a81548160ff021916908360ff1602179055507f34fd0dabda051fc15a9d8baaa48366a826c18f3e57a386d7ac59d56c731648178c8c8c8c8c8c8c8c8c8c8c604051611b529b9a999897969594939291906dffffffffffffffffffffffffffff9b8c168152998b1660208b015261ffff98891660408b015262ffffff97881660608b015295909716608089015292881660a088015290871660c087015290951660e08501529381166101008401521661012082015260ff919091166101408201526101600190565b60405180910390a1505050505050505050505050565b611b70611d5e565b8073ffffffffffffffffffffffffffffffffffffffff163b5f03611bc0576040517fe591f33d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f80547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b611c0e611d5e565b600555565b6115663382612057565b611c25611d5e565b63389a75e1600c52805f526020600c208054421115611c4b57636f5e88185f526004601cfd5b5f9055611c57816120d9565b50565b611c62611d5e565b8060601b611c7757637448fbae5f526004601cfd5b611c57816120d9565b611c88611d5e565b73ffffffffffffffffffffffffffffffffffffffff8216611cd5576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff82165f8181526008602090815260409182902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001685151590811790915591519182527f49db2f55c8e436c1dcf4b3c47cef480f2802dcf6d8a0d3b08fc2ee57e92f9cec910160405180910390a25050565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffff7487392754331461157b576382b429005f526004601cfd5b81601452806034526fa9059cbb0000000000000000000000005f5260205f604460105f875af18060015f511416611ddc57803d853b151710611ddc576390b8ec185f526004601cfd5b505f603452505050565b5f385f3884865af16115665763b12d13eb5f526004601cfd5b6040517f095ea7b300000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660048301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff602483015283169063095ea7b3906044016020604051808303815f875af1158015611eb0573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190611ed49190613146565b50604080516101608101825273ffffffffffffffffffffffffffffffffffffffff80851682527f00000000000000000000000000000000000000000000000000000000000000008116602083015262ffffff84168284015260065463010000008104600290810b60608501526601000000000000909104900b6080830152670de0b6b3a764000060a08301525f60c0830181905260e083018190526101008301819052306101208401524261014084015292517f883164560000000000000000000000000000000000000000000000000000000081529192917f000000000000000000000000000000000000000000000000000000000000000090911690638831645690611fe6908590600401613161565b6080604051808303815f875af1158015612002573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190612026919061324c565b50505073ffffffffffffffffffffffffffffffffffffffff9094165f90815260076020526040902093909355505050565b5f6370a082315f5230602052602060346024601c865afa601f3d1116612084576390b8ec185f526004601cfd5b8160145260345190506fa9059cbb0000000000000000000000005f5260205f604460105f875af18060015f5114166120ce57803d853b1517106120ce576390b8ec185f526004601cfd5b505f60345292915050565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffff74873927805473ffffffffffffffffffffffffffffffffffffffff9092169182907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a355565b5f7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff5d88d8183600281900b838161217557612175613285565b05029150508281016121868261218e565b949193509150565b5f805f8360020b126121a3578260020b6121b0565b8260020b6121b0906132b2565b90506121db7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff276186132e8565b60020b81111561224b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600160248201527f5400000000000000000000000000000000000000000000000000000000000000604482015260640160405180910390fd5b5f816001165f0361226d5770010000000000000000000000000000000061227f565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff16905060028216156122be5760806122b9826ffff97272373d413259a46990580e213a613324565b901c90505b60048216156122e85760806122e3826ffff2e50f5f656932ef12357cf3c7fdcc613324565b901c90505b600882161561231257608061230d826fffe5caca7e10e4e61c3624eaa0941cd0613324565b901c90505b601082161561233c576080612337826fffcb9843d60f6159c9db58835c926644613324565b901c90505b6020821615612366576080612361826fff973b41fa98c081472e6896dfb254c0613324565b901c90505b604082161561239057608061238b826fff2ea16466c96a3843ec78b326b52861613324565b901c90505b60808216156123ba5760806123b5826ffe5dee046a99a2a811c461f1969c3053613324565b901c90505b6101008216156123e55760806123e0826ffcbe86c7900a88aedcffc83b479aa3a4613324565b901c90505b61020082161561241057608061240b826ff987a7253ac413176f2b074cf7815e54613324565b901c90505b61040082161561243b576080612436826ff3392b0822b70005940c7a398e4b70f3613324565b901c90505b610800821615612466576080612461826fe7159475a2c29b7443b29c7fa6e889d9613324565b901c90505b61100082161561249157608061248c826fd097f3bdfd2022b8845ad8f792aa5825613324565b901c90505b6120008216156124bc5760806124b7826fa9f746462d870fdf8a65dc1f90e061e5613324565b901c90505b6140008216156124e75760806124e2826f70d869a156d2a1b890bb3df62baf32f7613324565b901c90505b61800082161561251257608061250d826f31be135f97d08fd981231505542fcfa6613324565b901c90505b6201000082161561253e576080612539826f09aa508b5b7a84e1c677de54f3e99bc9613324565b901c90505b62020000821615612569576080612564826e5d6af8dedb81196699c329225ee604613324565b901c90505b6204000082161561259357608061258e826d2216e584f5fa1ea926041bedfe98613324565b901c90505b620800008216156125bb5760806125b6826b048a170391f7dc42444e8fa2613324565b901c90505b5f8460020b13156125f3576125f0817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff61333b565b90505b6126026401000000008261334e565b1561260e576001612610565b5f5b6126219060ff16602083901c613361565b949350505050565b73ffffffffffffffffffffffffffffffffffffffff81168114611c57575f80fd5b803561265581612629565b919050565b5f805f6060848603121561266c575f80fd5b833561267781612629565b9250602084013561268781612629565b929592945050506040919091013590565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b604051610200810167ffffffffffffffff811182821017156126e9576126e9612698565b60405290565b5f82601f8301126126fe575f80fd5b813567ffffffffffffffff81111561271857612718612698565b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f0116810167ffffffffffffffff8111828210171561276557612765612698565b60405281815283820160200185101561277c575f80fd5b816020850160208301375f918101602001919091529392505050565b5f805f805f805f80610100898b0312156127b0575f80fd5b6127b98961264a565b97506127c760208a0161264a565b9650604089013567ffffffffffffffff8111156127e2575f80fd5b6127ee8b828c016126ef565b965050606089013567ffffffffffffffff81111561280a575f80fd5b6128168b828c016126ef565b9550506080890135935060a089013567ffffffffffffffff811115612839575f80fd5b6128458b828c016126ef565b93505060c089013567ffffffffffffffff811115612861575f80fd5b61286d8b828c016126ef565b989b979a50959894979396929550929360e00135925050565b5f60208284031215612896575f80fd5b81356128a181612629565b9392505050565b5f80604083850312156128b9575f80fd5b82356128c481612629565b915060208301356128d481612629565b809150509250929050565b6dffffffffffffffffffffffffffff81168114611c57575f80fd5b8035612655816128df565b61ffff81168114611c57575f80fd5b62ffffff81168114611c57575f80fd5b803561265581612914565b60ff81168114611c57575f80fd5b80356126558161292f565b5f805f805f805f805f805f6101608c8e031215612963575f80fd5b8b3561296e816128df565b9a5060208c013561297e816128df565b995060408c013561298e81612905565b985060608c013561299e81612914565b975060808c01356129ae81612905565b965060a08c01356129be816128df565b955060c08c01356129ce816128df565b94506129dc60e08d016128fa565b93506129eb6101008d01612924565b92506129fa6101208d01612924565b9150612a096101408d0161293d565b90509295989b509295989b9093969950565b5f60208284031215612a2b575f80fd5b5035919050565b8015158114611c57575f80fd5b5f8060408385031215612a50575f80fd5b8235612a5b81612629565b915060208301356128d481612a32565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b81810381811115612aab57612aab612a6b565b92915050565b5f81518084528060208401602086015e5f6020828601015260207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f83011685010191505092915050565b602081525f82516102a06020840152612b1a6102c0840182612ab1565b905060208401517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0848303016040850152612b558282612ab1565b9150506040840151606084015260608401517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0848303016080850152612b9b8282612ab1565b91505060808401517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08483030160a0850152612bd78282612ab1565b91505060a0840151612bfb60c08501826dffffffffffffffffffffffffffff169052565b5060c084015173ffffffffffffffffffffffffffffffffffffffff811660e08501525060e084015161ffff81166101008501525061010084015161ffff81166101208501525061012084015173ffffffffffffffffffffffffffffffffffffffff8116610140850152506101408401516dffffffffffffffffffffffffffff81166101608501525061016084015173ffffffffffffffffffffffffffffffffffffffff81166101808501525061018084015173ffffffffffffffffffffffffffffffffffffffff81166101a0850152506101a084015162ffffff81166101c0850152506101c084015173ffffffffffffffffffffffffffffffffffffffff81166101e0850152506101e08401516dffffffffffffffffffffffffffff8116610200850152506102008401516dffffffffffffffffffffffffffff81166102208501525061022084015164ffffffffff81166102408501525061024084015164ffffffffff81166102608501525061026084015160ff81166102808501525061028084015173ffffffffffffffffffffffffffffffffffffffff81166102a0850152509392505050565b5f81518060208401855e5f93019283525090919050565b5f612621612dc98386612da4565b84612da4565b805161265581612629565b8051612655816128df565b805161265581612905565b805161265581612914565b805164ffffffffff81168114612655575f80fd5b80516126558161292f565b5f610200828403128015612e2c575f80fd5b50612e356126c5565b612e3e83612dcf565b8152612e4c60208401612dda565b6020820152612e5d60408401612dcf565b6040820152612e6e60608401612de5565b6060820152612e7f60808401612dda565b6080820152612e9060a08401612de5565b60a0820152612ea160c08401612dda565b60c0820152612eb260e08401612dcf565b60e0820152612ec46101008401612df0565b610100820152612ed76101208401612dfb565b610120820152612eea6101408401612dfb565b610140820152612efd6101608401612dfb565b610160820152612f106101808401612dfb565b610180820152612f236101a08401612e0f565b6101a0820152612f366101c08401612dcf565b6101c0820152612f496101e08401612dcf565b6101e08201529392505050565b606081525f612f686060830186612ab1565b905064ffffffffff8416602083015273ffffffffffffffffffffffffffffffffffffffff83166040830152949350505050565b8051600281900b8114612655575f80fd5b80516fffffffffffffffffffffffffffffffff81168114612655575f80fd5b5f805f805f805f805f805f806101808d8f031215612fe7575f80fd5b8c516bffffffffffffffffffffffff81168114613002575f80fd5b9b5061301060208e01612dcf565b9a5061301e60408e01612dcf565b995061302c60608e01612dcf565b985061303a60808e01612df0565b975061304860a08e01612f9b565b965061305660c08e01612f9b565b955061306460e08e01612fac565b6101008e01516101208f0151919650945092506130846101408e01612fac565b91506130936101608e01612fac565b90509295989b509295989b509295989b565b5f60a082019050825182526fffffffffffffffffffffffffffffffff602084015116602083015260408301516040830152606083015160608301526080830151608083015292915050565b5f8060408385031215613101575f80fd5b505080516020909101519092909150565b5f60208284031215613122575f80fd5b81516128a181612629565b5f6020828403121561313d575f80fd5b6128a182612f9b565b5f60208284031215613156575f80fd5b81516128a181612a32565b815173ffffffffffffffffffffffffffffffffffffffff168152610160810160208301516131a7602084018273ffffffffffffffffffffffffffffffffffffffff169052565b5060408301516131be604084018262ffffff169052565b5060608301516131d3606084018260020b9052565b5060808301516131e8608084018260020b9052565b5060a083015160a083015260c083015160c083015260e083015160e083015261010083015161010083015261012083015161323c61012084018273ffffffffffffffffffffffffffffffffffffffff169052565b5061014092830151919092015290565b5f805f806080858703121561325f575f80fd5b8451935061326f60208601612fac565b6040860151606090960151949790965092505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b5f7f800000000000000000000000000000000000000000000000000000000000000082036132e2576132e2612a6b565b505f0390565b5f8160020b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff800000810361331c5761331c612a6b565b5f0392915050565b8082028115828204841417612aab57612aab612a6b565b5f8261334957613349613285565b500490565b5f8261335c5761335c613285565b500690565b80820180821115612aab57612aab612a6b56fea2646970667358221220a5866735d41e48e6b5728554be27013ef188a6f7498619126cae478e47bc37aa64736f6c634300081a0033',
    sourceMap:
      '974:23515:29:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1899:37;;;;;;;;;;-1:-1:-1;1899:37:29;;;;;;;;;;;285:8:44;273:21;;;255:40;;243:2;228:18;1899:37:29;;;;;;;;19726:280;;;;;;;;;;-1:-1:-1;19726:280:29;;;;;:::i;:::-;;:::i;:::-;;10343:2997;;;;;;:::i;:::-;;:::i;:::-;;;4097:42:44;4085:55;;;4067:74;;4055:2;4040:18;10343:2997:29;3921:226:44;21898:1271:29;;;;;;;;;;;;;:::i;3634:61::-;;;;;;;;;;-1:-1:-1;3634:61:29;;;;;:::i;:::-;;;;;;;;;;;;;;;;;4550:25:44;;;4538:2;4523:18;3634:61:29;4404:177:44;1678:55:29;;;;;;;;;;-1:-1:-1;1678:55:29;;;;;;;;;;;;;;4882:30:44;4870:43;;;4852:62;;4840:2;4825:18;1678:55:29;4706:214:44;2081:41:29;;;;;;;;;;-1:-1:-1;2081:41:29;;;;;;;;;;;;;;5194:6:44;5182:19;;;5164:38;;5152:2;5137:18;2081:41:29;5020:188:44;2409:49:29;;;;;;;;;;-1:-1:-1;2409:49:29;;;;;;;;;;;9021:617:22;;;:::i;1372:41:29:-;;;;;;;;;;-1:-1:-1;1372:41:29;;;;;;;;1095:50;;;;;;;;;;;;;;;2696:54;;;;;;;;;;-1:-1:-1;2696:54:29;;;;;;;;19094:259;;;;;;;;;;-1:-1:-1;19094:259:29;;;;;:::i;:::-;;:::i;1834:29::-;;;;;;;;;;-1:-1:-1;1834:29:29;;;;;;;;;;;1224:69;;;;;;;;;;;;;;;9720:456:22;;;:::i;20248:230:29:-;;;;;;;;;;-1:-1:-1;20248:230:29;;;;;:::i;:::-;;:::i;2837:36::-;;;;;;;;;;-1:-1:-1;2837:36:29;;;;;;;;;;;;;;6387:4:44;6375:17;;;6357:36;;6345:2;6330:18;2837:36:29;6215:184:44;8762:100:22;;;:::i;2303:44:29:-;;;;;;;;;;-1:-1:-1;2303:44:29;;;;;;;;11408:182:22;;;;;;;;;;-1:-1:-1;11562:11:22;11556:18;11408:182;;3746:50:29;;;;;;;;;;-1:-1:-1;3746:50:29;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;6569:14:44;;6562:22;6544:41;;6532:2;6517:18;3746:50:29;6404:187:44;2967:47:29;;;;;;;;;;;;;;;;14586:2797;;;;;;;;;;-1:-1:-1;14586:2797:29;;;;;:::i;:::-;;:::i;17627:240::-;;;;;;;;;;-1:-1:-1;17627:240:29;;;;;:::i;:::-;;:::i;2551:46::-;;;;;;;;;;-1:-1:-1;2551:46:29;;;;;;;;;;;2184:51;;;;;;;;;;-1:-1:-1;2184:51:29;;;;;;;;;;;18072:134;;;;;;;;;;-1:-1:-1;18072:134:29;;;;;:::i;:::-;;:::i;23302:114::-;;;;;;;;;;-1:-1:-1;23302:114:29;;;;;:::i;:::-;;:::i;10363:708:22:-;;;;;;:::i;:::-;;:::i;1585:38:29:-;;;;;;;;;;-1:-1:-1;1585:38:29;;;;;;;;8348:349:22;;;;;;:::i;:::-;;:::i;18476:306:29:-;;;;;;;;;;-1:-1:-1;18476:306:29;;;;;:::i;:::-;;:::i;11693:435:22:-;;;;;;;;;;-1:-1:-1;11693:435:22;;;;;:::i;:::-;11963:19;11957:4;11950:33;;;11812:14;11996:26;;;;12106:4;12090:21;;12084:28;;11693:435;19726:280:29;12517:13:22;:11;:13::i;:::-;19856:24:29::1;19832:49;;:12;:49;;::::0;19828:108:::1;;19904:21;;;;;;;;;;;;;;19828:108;19945:54;19974:12;19988:2;19992:6;19945:28;:54::i;:::-;19726:280:::0;;;:::o;10343:2997::-;10668:35;;;10630:21;10668:35;;;:17;:35;;;;;;;;10663:92;;10726:18;;;;;;;;;;;;;;10663:92;10834:13;;10790:9;;10834:13;;10861:26;;;10857:61;;;10896:22;;;;;;;;;;;;;;10857:61;10932:18;;10928:161;;10966:33;10985:14;10966:33;;:::i;:::-;;;11013:65;11045:16;11063:14;11013:31;:65::i;:::-;11120:18;;11102:15;:36;11098:92;;;11161:18;;;;;;;;;;;;;;11098:92;11225:14;;11299:30;;;;:25;:30;;;;;;;;;;;;;;;11225:14;;;;;-1:-1:-1;;11299:30:29;-1:-1:-1;;11299:30:29;;;;;11371:1184;;;;;;;;11416:5;11371:1184;;;;11457:7;11371:1184;;;;11491:4;11371:1184;;;;11524:6;11371:1184;;;;11563:9;11371:1184;;;;11608:18;;;;;;;;;;;11371:1184;;;;;;11667:16;11371:1184;;;;;;11717:9;;;;;;;;;;;11371:1184;;;;;;11774:22;;;;;;;;;;;11371:1184;;;;;;11828:9;11371:1184;;;;;;11876:23;;;;;;;;;;;11371:1184;;;;;;11947:24;11371:1184;;;;;;12009:13;;;;;;;;;;11371:1184;;;;;;12062:15;11371:1184;;;;;;12105:4;11371:1184;;;;;;12148:19;;;;;;;;;;;11371:1184;;;;;;12218:23;;;;;;;;;;;11371:1184;;;;;;12289:22;;;;;;;;;;;11371:1184;;;;;;;;12373:27;;;;;;;;;;;11371:1184;;;;;;;;12461:18;;;;;;;;;;;11371:1184;;;;;;12519:17;;;;;;;;;;;11371:1184;;;;;11343:1226;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;11273:1306;;;11343:1226;11273:1306;;:::i;:::-;;;;;;;;;;;;;11249:1330;;12678:10;12667:8;12661:15;12654:4;12644:8;12640:19;12637:1;12629:60;12612:77;-1:-1:-1;12713:27:29;;;;;:51;;;12760:4;12744:20;;:13;:20;;;12713:51;12709:110;;;12787:21;;;;;;;;;;;;;;12709:110;12829:52;12850:13;12865:15;12829:20;:52::i;:::-;12896:19;;12892:134;;12931:84;;;;;:46;14247:55:44;;;12931:84:29;;;14229:74:44;13013:1:29;14319:18:44;;;14312:34;12931:46:29;;;;;12985:15;;14202:18:44;;12931:84:29;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;12892:134;13036:34;13100:13;13073:59;;;:61;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;13036:98;;13244:9;13202:131;;13229:13;13202:131;;;13255:7;13264:13;:32;;;13298:13;:25;;;13202:131;;;;;;;;:::i;:::-;;;;;;;;10653:2687;;;;;10343:2997;;;;;;;;;;:::o;21898:1271::-;21974:10;21951:20;22015:39;;;:25;:39;;;;;;;22068:14;;;22064:73;;22105:21;;;;;;;;;;;;;;22064:73;22146:39;;;;22188:1;22146:39;;;:25;:39;;;;;;:43;;;22234:45;;;;;;;4550:25:44;;;22188:1:29;;22234:24;:34;;;;4523:18:44;;22234:45:29;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;;22366:235:29;;;;;;;;;;;;;;;;;;22289:74;22366:235;;;;;;;;;;22575:15;22366:235;;;;22612:59;;;;;22200:79;;-1:-1:-1;22366:235:29;-1:-1:-1;;22612:42:29;:24;:42;;-1:-1:-1;22612:42:29;;-1:-1:-1;22612:59:29;;-1:-1:-1;22366:235:29;;-1:-1:-1;;22612:59:29;;;-1:-1:-1;22612:59:29;;-1:-1:-1;22612:59:29:i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;;22738:45:29;;;;;;;;4550:25:44;;;22694:19:29;;;;22738:34;:24;:34;;;;4523:18:44;;22738:45:29;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;22682:101;;;;;;;;;;;;;;22793:62;22858:196;;;;;;;;22923:9;22858:196;;;;22957:12;22858:196;;;;;;22995:11;22858:196;;;;;;23032:11;22858:196;;;;;22793:261;;23064:24;:32;;;23097:13;23064:47;;;;;;;;;;;;;;19999:4:44;20041:3;20030:9;20026:19;20018:27;;20078:6;20072:13;20061:9;20054:32;20154:42;20146:4;20138:6;20134:17;20128:24;20124:73;20117:4;20106:9;20102:20;20095:103;20266:34;20258:4;20250:6;20246:17;20240:24;20236:65;20229:4;20218:9;20214:20;20207:95;20370:34;20362:4;20354:6;20350:17;20344:24;20340:65;20333:4;20322:9;20318:20;20311:95;19843:569;;;;;23064:47:29;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;;23122:40:29;;;;;;;;4550:25:44;;;23122:24:29;:29;;;;;4523:18:44;;23122:40:29;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;21941:1228;;;;;;;21898:1271::o;9021:617:22:-;9114:15;7972:9;9132:46;;:15;:46;9114:64;;9346:19;9340:4;9333:33;9396:8;9390:4;9383:22;9452:7;9445:4;9439;9429:21;9422:38;9599:8;9552:45;9549:1;9546;9541:67;9248:374;9021:617::o;19094:259:29:-;12517:13:22;:11;:13::i;:::-;19208:24:29::1;19184:49;;:12;:49;;::::0;19180:108:::1;;19256:21;;;;;;;;;;;;;;19180:108;19297:49;19329:12;19343:2;19297:31;:49::i;9720:456:22:-:0;9922:19;9916:4;9909:33;9968:8;9962:4;9955:22;10020:1;10013:4;10007;9997:21;9990:32;10151:8;10105:44;10102:1;10099;10094:66;9720:456::o;20248:230:29:-;12517:13:22;:11;:13::i;:::-;20314:16:29::1;::::0;::::1;20310:42;;20339:13;;;;;;;;;;;;;;20310:42;20364:12;20381:2;:7;;20396:21;20381:41;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;20363:59;;;20437:7;20432:39;;20453:18;;;;;;;;;;;;;;20432:39;20300:178;20248:230:::0;:::o;8762:100:22:-;12517:13;:11;:13::i;:::-;8834:21:::1;8852:1;8834:9;:21::i;:::-;8762:100::o:0;14586:2797:29:-;12517:13:22;:11;:13::i;:::-;5448::29::1;15079:54;::::0;::::1;;::::0;:128:::1;;-1:-1:-1::0;5630:25:29::1;15153:54;::::0;::::1;;15079:128;:167;;;-1:-1:-1::0;4089:3:29::1;15211:35;::::0;::::1;;15079:167;:234;;;;15289:24;15266:47;;:20;:47;;;15079:234;:316;;;-1:-1:-1::0;4256:3:29::1;15333:62;::::0;::::1;;15079:316;:398;;;-1:-1:-1::0;4427:10:29::1;15415:62;::::0;::::1;;15079:398;:480;;;-1:-1:-1::0;4600:6:29::1;15497:62;::::0;::::1;;15079:480;:554;;;;15610:23;15579:54;;:28;:54;;;15079:554;:647;;;-1:-1:-1::0;4784:9:29::1;15653:73;::::0;::::1;;15079:647;:740;;;-1:-1:-1::0;4967:6:29::1;15746:73;::::0;::::1;;15079:740;:814;;;-1:-1:-1::0;5123:1:29::1;15839:54;::::0;::::1;;15079:814;:888;;;-1:-1:-1::0;5275:3:29::1;15913:54;::::0;::::1;;15079:888;15062:965;;;15999:17;;;;;;;;;;;;;;15062:965;16037:18;16076:24;:32;;;:34;;;;;;;;;;;;;;;;;;;;;;;;;;;;::::0;::::1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;16058:91;::::0;;;;285:8:44;273:21;;16058:91:29::1;::::0;::::1;255:40:44::0;16058:74:29::1;::::0;;;::::1;::::0;::::1;::::0;228:18:44;;16058:91:29::1;;;;;;;;;;;;;;;;;::::0;::::1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;16163:11;::::0;16037:112;;-1:-1:-1;16163:11:29::1;;;:16:::0;16159:71:::1;;16202:17;;;;;;;;;;;;;;16159:71;16239:11;:26:::0;;;::::1;;::::0;;::::1;::::0;;16341:40:::1;16239:26:::0;16341::::1;:40::i;:::-;16276:17;;16295:20;;16317;::::0;16275:106:::1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;16408:14;16392:13;;:30;;;;;;;;;;;;;;;;;;16453:19;16432:18;;:40;;;;;;;;;;;;;;;;;;16494:10;16482:9;;:22;;;;;;;;;;;;;;;;;;16531:15;16514:14;;:32;;;;;;;;;;;;;;;;;;16581:23;16556:22;;:48;;;;;;;;;;;;;;;;;;16640:24;16614:23;;:50;;;;;;;;;;;;;;;;;;16696:20;16674:19;;:42;;;;;;;;;;;;;;;;;;16752:24;16726:23;;:50;;;;;;;;;;;;;;;;;;16811:23;16786:22;;:48;;;;;;;;;;;;;;;;;;16874:28;16844:27;;:58;;;;;;;;;;;;;;;;;;16933:19;16912:18;;:40;;;;;;;;;;;;;;;;;;16968:408;17007:14;17035:19;17068:10;17092:15;17121:23;17158:24;17196:20;17230:24;17268:23;17305:28;17347:19;16968:408;;;;;;;;;;;;;;;21536:30:44::0;21524:43;;;21506:62;;21604:43;;;21599:2;21584:18;;21577:71;21696:6;21684:19;;;21679:2;21664:18;;21657:47;21752:8;21740:21;;;21735:2;21720:18;;21713:49;21799:19;;;;21793:3;21778:19;;21771:48;21856:43;;;21850:3;21835:19;;21828:72;4652:42;;;21951:3;21936:19;;4640:55;4652:42;;;22007:3;21992:19;;4640:55;79:20;;;22062:3;22047:19;;67:33;79:20;22117:3;22102:19;;67:33;6202:4;6191:16;;;;22172:3;22157:19;;6179:29;21493:3;21478:19;;21092:1091;16968:408:29::1;;;;;;;;15052:2331;14586:2797:::0;;;;;;;;;;;:::o;17627:240::-;12517:13:22;:11;:13::i;:::-;17716:14:29::1;:26;;;17746:1;17716:31:::0;17712:86:::1;;17770:17;;;;;;;;;;;;;;17712:86;17808:13;:52:::0;;;::::1;;::::0;;;::::1;::::0;;;::::1;::::0;;17627:240::o;18072:134::-;12517:13:22;:11;:13::i;:::-;18159:18:29::1;:40:::0;18072:134::o;23302:114::-;23362:47;23394:10;23406:2;23362:31;:47::i;10363:708:22:-;12517:13;:11;:13::i;:::-;10597:19:::1;10591:4;10584:33;10643:12;10637:4;10630:26;10705:4;10699;10689:21;10811:12;10805:19;10792:11;10789:36;10786:157;;;10857:10;10851:4;10844:24;10924:4;10918;10911:18;10786:157;11020:1;10999:23:::0;;11041::::1;11051:12:::0;11041:9:::1;:23::i;:::-;10363:708:::0;:::o;8348:349::-;12517:13;:11;:13::i;:::-;8520:8:::1;8516:2;8512:17;8502:150;;8562:10;8556:4;8549:24;8633:4;8627;8620:18;8502:150;8671:19;8681:8;8671:9;:19::i;18476:306:29:-:0;12517:13:22;:11;:13::i;:::-;18584:30:29::1;::::0;::::1;18580:81;;18637:13;;;;;;;;;;;;;;18580:81;18671:35;::::0;::::1;;::::0;;;:17:::1;:35;::::0;;;;;;;;:45;;;::::1;::::0;::::1;;::::0;;::::1;::::0;;;18732:43;;6544:41:44;;;18732:43:29::1;::::0;6517:18:44;18732:43:29::1;;;;;;;18476:306:::0;;:::o;7292:355:22:-;7504:11;7498:18;7488:8;7485:32;7475:156;;7550:10;7544:4;7537:24;7612:4;7606;7599:18;13125:887:24;13288:2;13282:4;13275:16;13345:6;13339:4;13332:20;13410:34;13404:4;13397:48;13606:4;13600;13594;13588;13585:1;13578:5;13571;13566:45;13658:7;13654:1;13647:4;13641:11;13638:18;13634:32;13624:275;;13749:7;13730:16;13721:5;13709:18;13702:26;13699:48;13696:61;13686:199;;13794:10;13788:4;13781:24;13862:4;13856;13849:18;13686:199;13624:275;13925:1;13919:4;13912:15;13125:887;;;:::o;3909:342::-;4111:4;4099:10;4093:4;4081:10;4073:6;4069:2;4062:5;4057:59;4047:188;;4149:10;4143:4;4136:24;4216:4;4210;4203:18;20871:847:29;20966:103;;;;;:49;21024:24;14247:55:44;;20966:103:29;;;14229:74:44;21051:17:29;14319:18:44;;;14312:34;20966:49:29;;;;;14202:18:44;;20966:103:29;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;21135:442:29;;;;;;;;;;;;;;21238:4;21135:442;;;;;;;;;;;;;21302:20;;;;;;;;;21135:442;;;;21347:20;;;;;;21135:442;;;;21397:7;21135:442;;;;21080:52;21135:442;;;;;;;;;;;;21302:20;21135:442;;;;;21522:4;21135:442;;;;21551:15;21135:442;;;;21613:37;;;;;21135:442;;21080:52;21613:24;:29;;;;;;:37;;21135:442;;21613:37;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;;;21660:39:29;;;;;;;;:25;:39;;;;;:51;;;;-1:-1:-1;;;20871:847:29:o;14123:1560:24:-;14193:14;14298:10;14292:4;14285:24;14391:9;14385:4;14378:23;14751:4;14745;14739;14733;14726:5;14719;14708:48;14650:4;14632:16;14629:26;14544:230;14517:386;;14820:10;14814:4;14807:24;14884:4;14878;14871:18;14517:386;14929:2;14923:4;14916:16;14989:4;14983:11;14973:21;;15081:34;15075:4;15068:48;15277:4;15271;15265;15259;15256:1;15249:5;15242;15237:45;15329:7;15325:1;15318:4;15312:11;15309:18;15305:32;15295:275;;15420:7;15401:16;15392:5;15380:18;15373:26;15370:48;15367:61;15357:199;;15465:10;15459:4;15452:24;15533:4;15527;15520:18;15357:199;15295:275;15596:1;15590:4;15583:15;14123:1560;;;;:::o;6145:1089:22:-;6857:11;7093:16;;6941:26;;;;;;;7053:38;7050:1;;7042:78;7177:27;6145:1089::o;23977:510:29:-;24056:26;3945:7;24056:26;24299:12;24260:36;;;;3945:7;24260:36;;;;;:::i;:::-;;:51;;-1:-1:-1;;24349:36:29;;;24420:50;24260:51;24420:27;:50::i;:::-;24399:71;23977:510;;-1:-1:-1;23977:510:29;-1:-1:-1;23977:510:29:o;1354:2588:43:-;1417:20;1449:15;1474:1;1467:4;:8;;;:57;;1518:4;1511:12;;1467:57;;;1494:4;1487:12;;1486:13;;;:::i;:::-;1449:75;-1:-1:-1;636:9:43;476:7;636:9;:::i;:::-;1561:16;;1542:7;:36;;1534:50;;;;;;;25391:2:44;1534:50:43;;;25373:21:44;25430:1;25410:18;;;25403:29;25468:3;25448:18;;;25441:31;25489:18;;1534:50:43;;;;;;;;1595:13;1611:7;1621:3;1611:13;1628:1;1611:18;:93;;1669:35;1611:93;;;1632:34;1611:93;1595:109;;;-1:-1:-1;1728:3:43;1718:13;;:18;1714:83;;1794:3;1747:42;:5;1755:34;1747:42;:::i;:::-;1746:51;;1738:59;;1714:83;1821:3;1811:13;;:18;1807:83;;1887:3;1840:42;:5;1848:34;1840:42;:::i;:::-;1839:51;;1831:59;;1807:83;1914:3;1904:13;;:18;1900:83;;1980:3;1933:42;:5;1941:34;1933:42;:::i;:::-;1932:51;;1924:59;;1900:83;2007:4;1997:14;;:19;1993:84;;2074:3;2027:42;:5;2035:34;2027:42;:::i;:::-;2026:51;;2018:59;;1993:84;2101:4;2091:14;;:19;2087:84;;2168:3;2121:42;:5;2129:34;2121:42;:::i;:::-;2120:51;;2112:59;;2087:84;2195:4;2185:14;;:19;2181:84;;2262:3;2215:42;:5;2223:34;2215:42;:::i;:::-;2214:51;;2206:59;;2181:84;2289:4;2279:14;;:19;2275:84;;2356:3;2309:42;:5;2317:34;2309:42;:::i;:::-;2308:51;;2300:59;;2275:84;2383:5;2373:15;;:20;2369:85;;2451:3;2404:42;:5;2412:34;2404:42;:::i;:::-;2403:51;;2395:59;;2369:85;2478:5;2468:15;;:20;2464:85;;2546:3;2499:42;:5;2507:34;2499:42;:::i;:::-;2498:51;;2490:59;;2464:85;2573:5;2563:15;;:20;2559:85;;2641:3;2594:42;:5;2602:34;2594:42;:::i;:::-;2593:51;;2585:59;;2559:85;2668:5;2658:15;;:20;2654:85;;2736:3;2689:42;:5;2697:34;2689:42;:::i;:::-;2688:51;;2680:59;;2654:85;2763:6;2753:16;;:21;2749:86;;2832:3;2785:42;:5;2793:34;2785:42;:::i;:::-;2784:51;;2776:59;;2749:86;2859:6;2849:16;;:21;2845:86;;2928:3;2881:42;:5;2889:34;2881:42;:::i;:::-;2880:51;;2872:59;;2845:86;2955:6;2945:16;;:21;2941:86;;3024:3;2977:42;:5;2985:34;2977:42;:::i;:::-;2976:51;;2968:59;;2941:86;3051:6;3041:16;;:21;3037:86;;3120:3;3073:42;:5;3081:34;3073:42;:::i;:::-;3072:51;;3064:59;;3037:86;3147:7;3137:17;;:22;3133:86;;3216:3;3170:41;:5;3178:33;3170:41;:::i;:::-;3169:50;;3161:58;;3133:86;3243:7;3233:17;;:22;3229:85;;3311:3;3266:40;:5;3274:32;3266:40;:::i;:::-;3265:49;;3257:57;;3229:85;3338:7;3328:17;;:22;3324:83;;3404:3;3361:38;:5;3369:30;3361:38;:::i;:::-;3360:47;;3352:55;;3324:83;3431:7;3421:17;;:22;3417:78;;3492:3;3454:33;:5;3462:25;3454:33;:::i;:::-;3453:42;;3445:50;;3417:78;3517:1;3510:4;:8;;;3506:47;;;3528:25;3548:5;3528:17;:25;:::i;:::-;3520:33;;3506:47;3903:17;3912:7;3903:5;:17;:::i;:::-;:22;:30;;3932:1;3903:30;;;3928:1;3903:30;3886:48;;;;3896:2;3887:11;;;3886:48;:::i;:::-;3863:72;1354:2588;-1:-1:-1;;;;1354:2588:43:o;306:154:44:-;392:42;385:5;381:54;374:5;371:65;361:93;;450:1;447;440:12;465:134;533:20;;562:31;533:20;562:31;:::i;:::-;465:134;;;:::o;604:508::-;681:6;689;697;750:2;738:9;729:7;725:23;721:32;718:52;;;766:1;763;756:12;718:52;805:9;792:23;824:31;849:5;824:31;:::i;:::-;874:5;-1:-1:-1;931:2:44;916:18;;903:32;944:33;903:32;944:33;:::i;:::-;604:508;;996:7;;-1:-1:-1;;;1076:2:44;1061:18;;;;1048:32;;604:508::o;1117:184::-;1169:77;1166:1;1159:88;1266:4;1263:1;1256:15;1290:4;1287:1;1280:15;1306:247;1373:2;1367:9;1415:3;1403:16;;1449:18;1434:34;;1470:22;;;1431:62;1428:88;;;1496:18;;:::i;:::-;1532:2;1525:22;1306:247;:::o;1558:864::-;1601:5;1654:3;1647:4;1639:6;1635:17;1631:27;1621:55;;1672:1;1669;1662:12;1621:55;1712:6;1699:20;1742:18;1734:6;1731:30;1728:56;;;1764:18;;:::i;:::-;1833:2;1827:9;1899:4;1887:17;;1980:66;1883:90;;;1975:2;1879:99;1875:172;1863:185;;2078:18;2063:34;;2099:22;;;2060:62;2057:88;;;2125:18;;:::i;:::-;2161:2;2154:22;2185;;;2226:19;;;2247:4;2222:30;2219:39;-1:-1:-1;2216:59:44;;;2271:1;2268;2261:12;2216:59;2335:6;2328:4;2320:6;2316:17;2309:4;2301:6;2297:17;2284:58;2390:1;2362:19;;;2383:4;2358:30;2351:41;;;;2366:6;1558:864;-1:-1:-1;;;1558:864:44:o;2427:1357::-;2589:6;2597;2605;2613;2621;2629;2637;2645;2698:3;2686:9;2677:7;2673:23;2669:33;2666:53;;;2715:1;2712;2705:12;2666:53;2738:29;2757:9;2738:29;:::i;:::-;2728:39;;2786:38;2820:2;2809:9;2805:18;2786:38;:::i;:::-;2776:48;;2875:2;2864:9;2860:18;2847:32;2902:18;2894:6;2891:30;2888:50;;;2934:1;2931;2924:12;2888:50;2957;2999:7;2990:6;2979:9;2975:22;2957:50;:::i;:::-;2947:60;;;3060:2;3049:9;3045:18;3032:32;3089:18;3079:8;3076:32;3073:52;;;3121:1;3118;3111:12;3073:52;3144;3188:7;3177:8;3166:9;3162:24;3144:52;:::i;:::-;3134:62;-1:-1:-1;;3265:3:44;3250:19;;3237:33;;-1:-1:-1;3347:3:44;3332:19;;3319:33;3377:18;3364:32;;3361:52;;;3409:1;3406;3399:12;3361:52;3432;3476:7;3465:8;3454:9;3450:24;3432:52;:::i;:::-;3422:62;;;3537:3;3526:9;3522:19;3509:33;3567:18;3557:8;3554:32;3551:52;;;3599:1;3596;3589:12;3551:52;3622;3666:7;3655:8;3644:9;3640:24;3622:52;:::i;:::-;2427:1357;;;;-1:-1:-1;2427:1357:44;;;;;;;;-1:-1:-1;3612:62:44;;3747:3;3732:19;3719:33;;-1:-1:-1;;2427:1357:44:o;4152:247::-;4211:6;4264:2;4252:9;4243:7;4239:23;4235:32;4232:52;;;4280:1;4277;4270:12;4232:52;4319:9;4306:23;4338:31;4363:5;4338:31;:::i;:::-;4388:5;4152:247;-1:-1:-1;;;4152:247:44:o;5474:388::-;5542:6;5550;5603:2;5591:9;5582:7;5578:23;5574:32;5571:52;;;5619:1;5616;5609:12;5571:52;5658:9;5645:23;5677:31;5702:5;5677:31;:::i;:::-;5727:5;-1:-1:-1;5784:2:44;5769:18;;5756:32;5797:33;5756:32;5797:33;:::i;:::-;5849:7;5839:17;;;5474:388;;;;;:::o;6596:142::-;6682:30;6675:5;6671:42;6664:5;6661:53;6651:81;;6728:1;6725;6718:12;6743:134;6811:20;;6840:31;6811:20;6840:31;:::i;6882:117::-;6967:6;6960:5;6956:18;6949:5;6946:29;6936:57;;6989:1;6986;6979:12;7004:119;7089:8;7082:5;7078:20;7071:5;7068:31;7058:59;;7113:1;7110;7103:12;7128:132;7195:20;;7224:30;7195:20;7224:30;:::i;7265:114::-;7349:4;7342:5;7338:16;7331:5;7328:27;7318:55;;7369:1;7366;7359:12;7384:130;7450:20;;7479:29;7450:20;7479:29;:::i;7519:1427::-;7661:6;7669;7677;7685;7693;7701;7709;7717;7725;7733;7741:7;7795:3;7783:9;7774:7;7770:23;7766:33;7763:53;;;7812:1;7809;7802:12;7763:53;7851:9;7838:23;7870:31;7895:5;7870:31;:::i;:::-;7920:5;-1:-1:-1;7977:2:44;7962:18;;7949:32;7990:33;7949:32;7990:33;:::i;:::-;8042:7;-1:-1:-1;8101:2:44;8086:18;;8073:32;8114;8073;8114;:::i;:::-;8165:7;-1:-1:-1;8224:2:44;8209:18;;8196:32;8237;8196;8237;:::i;:::-;8288:7;-1:-1:-1;8347:3:44;8332:19;;8319:33;8361:32;8319:33;8361:32;:::i;:::-;8412:7;-1:-1:-1;8492:3:44;8477:19;;8464:33;8506;8464;8506;:::i;:::-;8558:7;-1:-1:-1;8638:3:44;8623:19;;8610:33;8652;8610;8652;:::i;:::-;8704:7;-1:-1:-1;8730:39:44;8764:3;8749:19;;8730:39;:::i;:::-;8720:49;;8788:38;8821:3;8810:9;8806:19;8788:38;:::i;:::-;8778:48;;8845:38;8878:3;8867:9;8863:19;8845:38;:::i;:::-;8835:48;;8903:37;8935:3;8924:9;8920:19;8903:37;:::i;:::-;8892:48;;7519:1427;;;;;;;;;;;;;;:::o;8951:226::-;9010:6;9063:2;9051:9;9042:7;9038:23;9034:32;9031:52;;;9079:1;9076;9069:12;9031:52;-1:-1:-1;9124:23:44;;8951:226;-1:-1:-1;8951:226:44:o;9182:118::-;9268:5;9261:13;9254:21;9247:5;9244:32;9234:60;;9290:1;9287;9280:12;9305:382;9370:6;9378;9431:2;9419:9;9410:7;9406:23;9402:32;9399:52;;;9447:1;9444;9437:12;9399:52;9486:9;9473:23;9505:31;9530:5;9505:31;:::i;:::-;9555:5;-1:-1:-1;9612:2:44;9597:18;;9584:32;9625:30;9584:32;9625:30;:::i;9692:184::-;9744:77;9741:1;9734:88;9841:4;9838:1;9831:15;9865:4;9862:1;9855:15;9881:128;9948:9;;;9969:11;;;9966:37;;;9983:18;;:::i;:::-;9881:128;;;;:::o;10014:348::-;10056:3;10094:5;10088:12;10121:6;10116:3;10109:19;10177:6;10170:4;10163:5;10159:16;10152:4;10147:3;10143:14;10137:47;10229:1;10222:4;10213:6;10208:3;10204:16;10200:27;10193:38;10351:4;10281:66;10276:2;10268:6;10264:15;10260:88;10255:3;10251:98;10247:109;10240:116;;;10014:348;;;;:::o;10468:3092::-;10655:2;10644:9;10637:21;10618:4;10693:6;10687:13;10736:6;10731:2;10720:9;10716:18;10709:34;10766:52;10813:3;10802:9;10798:19;10784:12;10766:52;:::i;:::-;10752:66;;10867:2;10859:6;10855:15;10849:22;10935:66;10923:9;10915:6;10911:22;10907:95;10902:2;10891:9;10887:18;10880:123;11026:41;11060:6;11044:14;11026:41;:::i;:::-;11012:55;;;11121:2;11113:6;11109:15;11103:22;11098:2;11087:9;11083:18;11076:50;11175:2;11167:6;11163:15;11157:22;11244:66;11232:9;11224:6;11220:22;11216:95;11210:3;11199:9;11195:19;11188:124;11335:41;11369:6;11353:14;11335:41;:::i;:::-;11321:55;;;11425:3;11417:6;11413:16;11407:23;11495:66;11483:9;11475:6;11471:22;11467:95;11461:3;11450:9;11446:19;11439:124;11586:41;11620:6;11604:14;11586:41;:::i;:::-;11572:55;;;11676:3;11668:6;11664:16;11658:23;11690:55;11740:3;11729:9;11725:19;11709:14;4663:30;4652:42;4640:55;;4586:115;11690:55;-1:-1:-1;11794:3:44;11782:16;;11776:23;3866:42;3855:54;;11858:3;11843:19;;3843:67;-1:-1:-1;11912:3:44;11900:16;;11894:23;5001:6;4990:18;;11975:3;11960:19;;4978:31;-1:-1:-1;12029:3:44;12017:16;;12011:23;5001:6;4990:18;;12092:3;12077:19;;4978:31;-1:-1:-1;12146:3:44;12134:16;;12128:23;3866:42;3855:54;;12210:3;12195:19;;3843:67;-1:-1:-1;12264:3:44;12252:16;;12246:23;4663:30;4652:42;;12328:3;12313:19;;4640:55;-1:-1:-1;12383:3:44;12371:16;;12365:23;3866:42;3855:54;;12448:3;12433:19;;3843:67;-1:-1:-1;12503:3:44;12491:16;;12485:23;3866:42;3855:54;;12568:3;12553:19;;3843:67;-1:-1:-1;12623:3:44;12611:16;;12605:23;90:8;79:20;;12687:3;12672:19;;67:33;-1:-1:-1;12742:3:44;12730:16;;12724:23;3866:42;3855:54;;12807:3;12792:19;;3843:67;-1:-1:-1;12862:3:44;12850:16;;12844:23;4663:30;4652:42;;12927:3;12912:19;;4640:55;-1:-1:-1;12982:3:44;12970:16;;12964:23;4663:30;4652:42;;13047:3;13032:19;;4640:55;-1:-1:-1;13102:3:44;13090:16;;13084:23;10443:12;10432:24;;13166:3;13151:19;;10420:37;-1:-1:-1;13221:3:44;13209:16;;13203:23;10443:12;10432:24;;13285:3;13270:19;;10420:37;-1:-1:-1;13340:3:44;13328:16;;13322:23;6202:4;6191:16;;13403:3;13388:19;;6179:29;-1:-1:-1;13458:3:44;13446:16;;13440:23;3866:42;3855:54;;13523:6;13508:22;;3843:67;-1:-1:-1;13548:6:44;10468:3092;-1:-1:-1;;;10468:3092:44:o;13565:211::-;13606:3;13644:5;13638:12;13688:6;13681:4;13674:5;13670:16;13665:3;13659:36;13750:1;13714:16;;13739:13;;;-1:-1:-1;13714:16:44;;13565:211;-1:-1:-1;13565:211:44:o;13781:261::-;13956:3;13981:55;14006:29;14031:3;14023:6;14006:29;:::i;:::-;13998:6;13981:55;:::i;14357:138::-;14436:13;;14458:31;14436:13;14458:31;:::i;14500:138::-;14579:13;;14601:31;14579:13;14601:31;:::i;14643:136::-;14721:13;;14743:30;14721:13;14743:30;:::i;14784:136::-;14862:13;;14884:30;14862:13;14884:30;:::i;14925:169::-;15003:13;;15056:12;15045:24;;15035:35;;15025:63;;15084:1;15081;15074:12;15099:134;15176:13;;15198:29;15176:13;15198:29;:::i;15238:1591::-;15340:6;15400:3;15388:9;15379:7;15375:23;15371:33;15416:2;15413:22;;;15431:1;15428;15421:12;15413:22;-1:-1:-1;15473:17:44;;:::i;:::-;15513:40;15543:9;15513:40;:::i;:::-;15506:5;15499:55;15586:49;15631:2;15620:9;15616:18;15586:49;:::i;:::-;15581:2;15574:5;15570:14;15563:73;15668:49;15713:2;15702:9;15698:18;15668:49;:::i;:::-;15663:2;15656:5;15652:14;15645:73;15750:48;15794:2;15783:9;15779:18;15750:48;:::i;:::-;15745:2;15738:5;15734:14;15727:72;15832:50;15877:3;15866:9;15862:19;15832:50;:::i;:::-;15826:3;15819:5;15815:15;15808:75;15916:49;15960:3;15949:9;15945:19;15916:49;:::i;:::-;15910:3;15903:5;15899:15;15892:74;15999:50;16044:3;16033:9;16029:19;15999:50;:::i;:::-;15993:3;15986:5;15982:15;15975:75;16083:50;16128:3;16117:9;16113:19;16083:50;:::i;:::-;16077:3;16070:5;16066:15;16059:75;16167:49;16211:3;16200:9;16196:19;16167:49;:::i;:::-;16161:3;16154:5;16150:15;16143:74;16250:49;16294:3;16283:9;16279:19;16250:49;:::i;:::-;16244:3;16237:5;16233:15;16226:74;16333:49;16377:3;16366:9;16362:19;16333:49;:::i;:::-;16327:3;16320:5;16316:15;16309:74;16416:49;16460:3;16449:9;16445:19;16416:49;:::i;:::-;16410:3;16403:5;16399:15;16392:74;16499:49;16543:3;16532:9;16528:19;16499:49;:::i;:::-;16493:3;16486:5;16482:15;16475:74;16582:48;16625:3;16614:9;16610:19;16582:48;:::i;:::-;16576:3;16569:5;16565:15;16558:73;16664:50;16709:3;16698:9;16694:19;16664:50;:::i;:::-;16658:3;16651:5;16647:15;16640:75;16748:50;16793:3;16782:9;16778:19;16748:50;:::i;:::-;16742:3;16731:15;;16724:75;16735:5;15238:1591;-1:-1:-1;;;15238:1591:44:o;16834:428::-;17037:2;17026:9;17019:21;17000:4;17057:45;17098:2;17087:9;17083:18;17075:6;17057:45;:::i;:::-;17049:53;;17150:12;17142:6;17138:25;17133:2;17122:9;17118:18;17111:53;17212:42;17204:6;17200:55;17195:2;17184:9;17180:18;17173:83;16834:428;;;;;;:::o;17267:164::-;17344:13;;17397:1;17386:20;;;17376:31;;17366:59;;17421:1;17418;17411:12;17436:192;17515:13;;17568:34;17557:46;;17547:57;;17537:85;;17618:1;17615;17608:12;17633:1290;17796:6;17804;17812;17820;17828;17836;17844;17852;17860;17868;17876:7;17885;17939:3;17927:9;17918:7;17914:23;17910:33;17907:53;;;17956:1;17953;17946:12;17907:53;17988:9;17982:16;18038:26;18031:5;18027:38;18020:5;18017:49;18007:77;;18080:1;18077;18070:12;18007:77;18103:5;-1:-1:-1;18127:49:44;18172:2;18157:18;;18127:49;:::i;:::-;18117:59;;18195:49;18240:2;18229:9;18225:18;18195:49;:::i;:::-;18185:59;;18263:49;18308:2;18297:9;18293:18;18263:49;:::i;:::-;18253:59;;18331:49;18375:3;18364:9;18360:19;18331:49;:::i;:::-;18321:59;;18399:48;18442:3;18431:9;18427:19;18399:48;:::i;:::-;18389:58;;18466:48;18509:3;18498:9;18494:19;18466:48;:::i;:::-;18456:58;;18533:50;18578:3;18567:9;18563:19;18533:50;:::i;:::-;18649:3;18634:19;;18628:26;18746:3;18731:19;;18725:26;18523:60;;-1:-1:-1;18628:26:44;-1:-1:-1;18725:26:44;-1:-1:-1;18797:50:44;18842:3;18827:19;;18797:50;:::i;:::-;18786:61;;18867:50;18912:3;18901:9;18897:19;18867:50;:::i;:::-;18856:61;;17633:1290;;;;;;;;;;;;;;:::o;18928:562::-;19104:4;19146:3;19135:9;19131:19;19123:27;;19183:6;19177:13;19166:9;19159:32;19259:34;19251:4;19243:6;19239:17;19233:24;19229:65;19222:4;19211:9;19207:20;19200:95;19351:4;19343:6;19339:17;19333:24;19326:4;19315:9;19311:20;19304:54;19414:4;19406:6;19402:17;19396:24;19389:4;19378:9;19374:20;19367:54;19477:4;19469:6;19465:17;19459:24;19452:4;19441:9;19437:20;19430:54;18928:562;;;;:::o;19495:343::-;19574:6;19582;19635:2;19623:9;19614:7;19610:23;19606:32;19603:52;;;19651:1;19648;19641:12;19603:52;-1:-1:-1;;19696:16:44;;19802:2;19787:18;;;19781:25;19696:16;;19781:25;;-1:-1:-1;19495:343:44:o;20627:251::-;20697:6;20750:2;20738:9;20729:7;20725:23;20721:32;20718:52;;;20766:1;20763;20756:12;20718:52;20798:9;20792:16;20817:31;20842:5;20817:31;:::i;20883:204::-;20951:6;21004:2;20992:9;20983:7;20979:23;20975:32;20972:52;;;21020:1;21017;21010:12;20972:52;21043:38;21071:9;21043:38;:::i;22490:245::-;22557:6;22610:2;22598:9;22589:7;22585:23;22581:32;22578:52;;;22626:1;22623;22616:12;22578:52;22658:9;22652:16;22677:28;22699:5;22677:28;:::i;22836:1173::-;23060:13;;3866:42;3855:54;3843:67;;23028:3;23013:19;;23132:4;23124:6;23120:17;23114:24;23147:54;23195:4;23184:9;23180:20;23166:12;3866:42;3855:54;3843:67;;3789:127;23147:54;;23250:4;23242:6;23238:17;23232:24;23265:55;23314:4;23303:9;23299:20;23283:14;90:8;79:20;67:33;;14:92;23265:55;;23369:4;23361:6;23357:17;23351:24;23384:54;23432:4;23421:9;23417:20;23401:14;22815:1;22804:20;22792:33;;22740:91;23384:54;;23487:4;23479:6;23475:17;23469:24;23502:54;23550:4;23539:9;23535:20;23519:14;22815:1;22804:20;22792:33;;22740:91;23502:54;;23612:4;23604:6;23600:17;23594:24;23587:4;23576:9;23572:20;23565:54;23675:4;23667:6;23663:17;23657:24;23650:4;23639:9;23635:20;23628:54;23738:4;23730:6;23726:17;23720:24;23713:4;23702:9;23698:20;23691:54;23803:6;23795;23791:19;23785:26;23776:6;23765:9;23761:22;23754:58;23861:6;23853;23849:19;23843:26;23878:58;23928:6;23917:9;23913:22;23897:14;3866:42;3855:54;3843:67;;3789:127;23878:58;-1:-1:-1;23994:6:44;23982:19;;;23976:26;23952:22;;;;23945:58;22836:1173;:::o;24014:542::-;24111:6;24119;24127;24135;24188:3;24176:9;24167:7;24163:23;24159:33;24156:53;;;24205:1;24202;24195:12;24156:53;24250:16;;;-1:-1:-1;24309:49:44;24354:2;24339:18;;24309:49;:::i;:::-;24424:2;24409:18;;24403:25;24520:2;24505:18;;;24499:25;24014:542;;24299:59;;-1:-1:-1;24014:542:44;-1:-1:-1;;;24014:542:44:o;24561:184::-;24613:77;24610:1;24603:88;24710:4;24707:1;24700:15;24734:4;24731:1;24724:15;24750:191;24785:3;24816:66;24809:5;24806:77;24803:103;;24886:18;;:::i;:::-;-1:-1:-1;24926:1:44;24922:13;;24750:191::o;24946:238::-;24980:3;25027:5;25024:1;25013:20;25057:66;25048:7;25045:79;25042:105;;25127:18;;:::i;:::-;25167:1;25163:15;;24946:238;-1:-1:-1;;24946:238:44:o;25518:168::-;25591:9;;;25622;;25639:15;;;25633:22;;25619:37;25609:71;;25660:18;;:::i;25691:120::-;25731:1;25757;25747:35;;25762:18;;:::i;:::-;-1:-1:-1;25796:9:44;;25691:120::o;25816:112::-;25848:1;25874;25864:35;;25879:18;;:::i;:::-;-1:-1:-1;25913:9:44;;25816:112::o;25933:125::-;25998:9;;;26019:10;;;26016:36;;;26032:18;;:::i',
    linkReferences: {},
    immutableReferences: {
      '42175': [
        {
          start: 1012,
          length: 32,
        },
        {
          start: 2297,
          length: 32,
        },
      ],
      '42179': [
        {
          start: 1179,
          length: 32,
        },
        {
          start: 1878,
          length: 32,
        },
        {
          start: 2633,
          length: 32,
        },
        {
          start: 3898,
          length: 32,
        },
        {
          start: 4127,
          length: 32,
        },
        {
          start: 4326,
          length: 32,
        },
        {
          start: 4542,
          length: 32,
        },
        {
          start: 4841,
          length: 32,
        },
        {
          start: 5045,
          length: 32,
        },
        {
          start: 5826,
          length: 32,
        },
        {
          start: 7740,
          length: 32,
        },
        {
          start: 8111,
          length: 32,
        },
      ],
      '42186': [
        {
          start: 2763,
          length: 32,
        },
        {
          start: 3209,
          length: 32,
        },
        {
          start: 7932,
          length: 32,
        },
      ],
    },
  },
  methodIdentifiers: {
    'G8KEEP_BONDING_CURVE_CODE()': '2b37836d',
    'UNISWAP_POSITION_MANAGER()': '51f18899',
    'allowedFeeWallets(address)': '8ec38768',
    'bondingCurveLPGuardTokens(address)': '06133458',
    'cancelOwnershipHandover()': '54d1f13d',
    'completeOwnershipHandover(address)': 'f04e283e',
    'deployToken(address,address,string,string,uint256,string,string,bytes32)': '028221cc',
    'deployerMigrationReward()': 'e55725fa',
    'deploymentFee()': 'f2cff57f',
    'g8keepFee()': '4232c712',
    'heavySnipeExponent()': '711bb3d5',
    'heavySnipeProtectionSeconds()': '369c638a',
    'liquiditySupplementFee()': '220f3ead',
    'lockerFactory()': '2a123b16',
    'maxBundleBuyAmount()': 'baf2610b',
    'owner()': '8da5cb5b',
    'ownershipHandoverExpiresAt(address)': 'fee81cf4',
    'removeLPGuardLiquidity()': '0434ab20',
    'renounceOwnership()': '715018a6',
    'requestOwnershipHandover()': '25692962',
    'setAllowedG8keepFeeWallet(address,bool)': 'f31a8f67',
    'setDeploymentSettings(uint112,uint112,uint16,uint24,uint16,uint112,uint112,uint112,uint24,uint24,uint8)':
      'bd68a82b',
    'setG8keepLockerFactory(address)': 'c217aac1',
    'setMaximumBundleBuy(uint256)': 'e9cfe67e',
    'snipeProtectionSeconds()': 'e025fa01',
    'tokenInitialSupply()': '086f8d6b',
    'tokenLiquidityShift()': '7fe90dc7',
    'tokenMigrationLiquidity()': '231ce398',
    'transferGuardTokens(address)': 'efa21fbd',
    'transferOwnership(address)': 'f2fde38b',
    'uniswapFeeTier()': '0132ec54',
    'withdrawETH(address)': '690d8320',
    'withdrawToken(address,address)': '3aeac4e1',
    'withdrawToken(address,address,uint256)': '01e33667',
  },
  rawMetadata:
    '{"compiler":{"version":"0.8.26+commit.8a97fa7a"},"language":"Solidity","output":{"abi":[{"inputs":[{"internalType":"address","name":"_configuration","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AlreadyInitialized","type":"error"},{"inputs":[],"name":"InvalidBundleBuy","type":"error"},{"inputs":[],"name":"InvalidDeploymentFee","type":"error"},{"inputs":[],"name":"InvalidFeeWallet","type":"error"},{"inputs":[],"name":"InvalidSettings","type":"error"},{"inputs":[],"name":"InvalidTokenAddress","type":"error"},{"inputs":[],"name":"NewOwnerIsZeroAddress","type":"error"},{"inputs":[],"name":"NoHandoverRequest","type":"error"},{"inputs":[],"name":"Unauthorized","type":"error"},{"inputs":[],"name":"WithdrawalFailed","type":"error"},{"inputs":[],"name":"ZeroAddress","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"deploymentFee","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"tokenInitialSupply","type":"uint112"},{"indexed":false,"internalType":"uint16","name":"g8keepFee","type":"uint16"},{"indexed":false,"internalType":"uint24","name":"uniswapFeeTier","type":"uint24"},{"indexed":false,"internalType":"uint16","name":"liquiditySupplementFee","type":"uint16"},{"indexed":false,"internalType":"uint112","name":"deployerMigrationReward","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"tokenLiquidityShift","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"tokenMigrationLiquidity","type":"uint112"},{"indexed":false,"internalType":"uint24","name":"snipeProtectionSeconds","type":"uint24"},{"indexed":false,"internalType":"uint24","name":"heavySnipeProtectionSeconds","type":"uint24"},{"indexed":false,"internalType":"uint8","name":"heavySnipeExponent","type":"uint8"}],"name":"DeploymentSettingsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"feeWallet","type":"address"},{"indexed":false,"internalType":"bool","name":"allowed","type":"bool"}],"name":"FeeWalletUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"pendingOwner","type":"address"}],"name":"OwnershipHandoverCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"pendingOwner","type":"address"}],"name":"OwnershipHandoverRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"deployer","type":"address"},{"indexed":false,"internalType":"string","name":"symbol","type":"string"},{"indexed":false,"internalType":"uint40","name":"snipeProtectionEnd","type":"uint40"},{"indexed":false,"internalType":"address","name":"pairAddress","type":"address"}],"name":"TokenDeployed","type":"event"},{"inputs":[],"name":"G8KEEP_BONDING_CURVE_CODE","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"UNISWAP_POSITION_MANAGER","outputs":[{"internalType":"contract INonfungiblePositionManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"allowedFeeWallets","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"bondingCurveLPGuardTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cancelOwnershipHandover","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"pendingOwner","type":"address"}],"name":"completeOwnershipHandover","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_g8keepFeeWallet","type":"address"},{"internalType":"address","name":"_deployer","type":"address"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint256","name":"_fid","type":"uint256"},{"internalType":"string","name":"_image","type":"string"},{"internalType":"string","name":"_castHash","type":"string"},{"internalType":"bytes32","name":"_tokenSalt","type":"bytes32"}],"name":"deployToken","outputs":[{"internalType":"address","name":"_tokenAddress","type":"address"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"deployerMigrationReward","outputs":[{"internalType":"uint112","name":"","type":"uint112"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"deploymentFee","outputs":[{"internalType":"uint112","name":"","type":"uint112"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"g8keepFee","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"heavySnipeExponent","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"heavySnipeProtectionSeconds","outputs":[{"internalType":"uint24","name":"","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"liquiditySupplementFee","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lockerFactory","outputs":[{"internalType":"contract IG8keepLockerFactory","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxBundleBuyAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"result","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"pendingOwner","type":"address"}],"name":"ownershipHandoverExpiresAt","outputs":[{"internalType":"uint256","name":"result","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"removeLPGuardLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"requestOwnershipHandover","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_g8keepFeeWallet","type":"address"},{"internalType":"bool","name":"allowed","type":"bool"}],"name":"setAllowedG8keepFeeWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint112","name":"_deploymentFee","type":"uint112"},{"internalType":"uint112","name":"_tokenInitialSupply","type":"uint112"},{"internalType":"uint16","name":"_g8keepFee","type":"uint16"},{"internalType":"uint24","name":"_uniswapFeeTier","type":"uint24"},{"internalType":"uint16","name":"_liquiditySupplementFee","type":"uint16"},{"internalType":"uint112","name":"_deployerMigrationReward","type":"uint112"},{"internalType":"uint112","name":"_tokenLiquidityShift","type":"uint112"},{"internalType":"uint112","name":"_tokenMigrationLiquidity","type":"uint112"},{"internalType":"uint24","name":"_snipeProtectionSeconds","type":"uint24"},{"internalType":"uint24","name":"_heavySnipeProtectionSeconds","type":"uint24"},{"internalType":"uint8","name":"_heavySnipeExponent","type":"uint8"}],"name":"setDeploymentSettings","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_lockerFactory","type":"address"}],"name":"setG8keepLockerFactory","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxBundleBuyAmount","type":"uint256"}],"name":"setMaximumBundleBuy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"snipeProtectionSeconds","outputs":[{"internalType":"uint24","name":"","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenInitialSupply","outputs":[{"internalType":"uint112","name":"","type":"uint112"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenLiquidityShift","outputs":[{"internalType":"uint112","name":"","type":"uint112"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenMigrationLiquidity","outputs":[{"internalType":"uint112","name":"","type":"uint112"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"transferGuardTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"uniswapFeeTier","outputs":[{"internalType":"uint24","name":"","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"withdrawETH","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"to","type":"address"}],"name":"withdrawToken","outputs":[],"stateMutability":"nonpayable","type":"function"}],"devdoc":{"errors":{"AlreadyInitialized()":[{"details":"Cannot double-initialize."}],"InvalidBundleBuy()":[{"details":"Thrown when including value for a bundle buy and it exceeds the maximum allowed."}],"InvalidDeploymentFee()":[{"details":"Thrown when the supplied value is not sufficient for the deployment fee."}],"InvalidFeeWallet()":[{"details":"Thrown when attempting to use a fee wallet that is not an allowed fee wallet."}],"InvalidSettings()":[{"details":"Thrown when the g8keepBondingCurveFactory owner is updating deployment settings andthey are not compliant with the constant guardrails."}],"InvalidTokenAddress()":[{"details":"Thrown when the token address is greater than the WETH address."}],"NewOwnerIsZeroAddress()":[{"details":"The `newOwner` cannot be the zero address."}],"NoHandoverRequest()":[{"details":"The `pendingOwner` does not have a valid handover request."}],"Unauthorized()":[{"details":"The caller is not authorized to call the function."}],"WithdrawalFailed()":[{"details":"Thrown when withdrawing native token from the contract and the withdrawal fails."}],"ZeroAddress()":[{"details":"Thrown when a supplied address that must be non-zero is zero."}]},"events":{"DeploymentSettingsUpdated(uint112,uint112,uint16,uint24,uint16,uint112,uint112,uint112,uint24,uint24,uint8)":{"details":"Emitted when the g8keepBondingCurveFactory owner updates deployment settings."},"FeeWalletUpdated(address,bool)":{"details":"Emitted when a fee wallet allowance has been updated."},"OwnershipHandoverCanceled(address)":{"details":"The ownership handover to `pendingOwner` has been canceled."},"OwnershipHandoverRequested(address)":{"details":"An ownership handover to `pendingOwner` has been requested."},"OwnershipTransferred(address,address)":{"details":"The ownership is transferred from `oldOwner` to `newOwner`. This event is intentionally kept the same as OpenZeppelin\'s Ownable to be compatible with indexers and [EIP-173](https://eips.ethereum.org/EIPS/eip-173), despite it not being as lightweight as a single argument event."},"TokenDeployed(address,address,string,uint40,address)":{"details":"Emitted when a token is deployed."}},"kind":"dev","methods":{"cancelOwnershipHandover()":{"details":"Cancels the two-step ownership handover to the caller, if any."},"completeOwnershipHandover(address)":{"details":"Allows the owner to complete the two-step ownership handover to `pendingOwner`. Reverts if there is no existing ownership handover requested by `pendingOwner`."},"constructor":{"details":"Constructs the g8keepBondingCurveFactory contract.Initialization parameters are retrieved from a configuration contract so thatthe g8keepBondingCurveFactory may be deterministically deployed on EVM chainsat the same address.","params":{"_configuration":"The address of the factory configuration contract to retrieve configuration parameters."}},"deployToken(address,address,string,string,uint256,string,string,bytes32)":{"params":{"_castHash":"Hash of the cast for the token if deployed off g8keep","_deployer":"Address of the deployer for the token.","_fid":"Farcaster ID for the token deployer.","_g8keepFeeWallet":"Address of the fee wallet for the deployment.","_image":"Image of token if deployed off g8keep","_name":"Name of the token being deployed.","_symbol":"Symbol of the token being deployed.","_tokenSalt":"Salt for token deployment to generate a deterministic address."}},"owner()":{"details":"Returns the owner of the contract."},"ownershipHandoverExpiresAt(address)":{"details":"Returns the expiry timestamp for the two-step ownership handover to `pendingOwner`."},"removeLPGuardLiquidity()":{"details":"Restricted function called by a token during migration to remove the LP guard.Reverts if the caller does not have an LP guard set."},"renounceOwnership()":{"details":"Allows the owner to renounce their ownership."},"requestOwnershipHandover()":{"details":"Request a two-step ownership handover to the caller. The request will automatically expire in 48 hours (172800 seconds) by default."},"setAllowedG8keepFeeWallet(address,bool)":{"details":"The fee wallet cannot be set to the zero address.","params":{"_g8keepFeeWallet":"Address of the g8keep fee wallet."}},"setDeploymentSettings(uint112,uint112,uint16,uint24,uint16,uint112,uint112,uint112,uint24,uint24,uint8)":{"details":"Settings parameters must be within the constant guardrails defined.","params":{"_deployerMigrationReward":"Reward to the curve deployer when a token migrates.","_deploymentFee":"Fee in native token for deploying a bonding curve.","_g8keepFee":"Fee in BPS to assess on token trades.","_heavySnipeExponent":"Exponent penalty during heavy snipe protection.","_heavySnipeProtectionSeconds":"Time in seconds for heavy snipe protection to be enabled.","_liquiditySupplementFee":"Minimum time in seconds that a deployer tokens must vest over.","_snipeProtectionSeconds":"Time in seconds for snipe protection to be enabled.","_tokenInitialSupply":"Initial supply of bonding curve tokens.","_tokenLiquidityShift":"Initial liquidity shift for a bonding curve.","_tokenMigrationLiquidity":"Liquidity required to migrate a bonding curve.","_uniswapFeeTier":"Fee tier when migrating to Uniswap."}},"setG8keepLockerFactory(address)":{"details":"The locker factory must contain code to be set. ","params":{"_lockerFactory":"Address of the locker factory."}},"setMaximumBundleBuy(uint256)":{"params":{"_maxBundleBuyAmount":"Amount to set as the max bundle buy without a revert on deployment."}},"transferGuardTokens(address)":{"details":"Allows a token contract to transfer dust remaining from guard tokens to an address it specifies."},"transferOwnership(address)":{"details":"Allows the owner to transfer the ownership to `newOwner`."},"withdrawETH(address)":{"details":"Will withdraw the entire balance.","params":{"to":"Address to withdraw the token to."}},"withdrawToken(address,address)":{"details":"Will withdraw the entire balance of the token.","params":{"to":"Address to withdraw the token to.","tokenAddress":"Address of the token to withdraw."}},"withdrawToken(address,address,uint256)":{"details":"Will withdraw the specified `amount` of token.","params":{"amount":"Amount of the token to withdraw.","to":"Address to withdraw the token to.","tokenAddress":"Address of the token to withdraw."}}},"stateVariables":{"G8KEEP_BONDING_CURVE_CODE":{"details":"Address of the storage contract for bonding curve code."},"MAX_SETTING_G8KEEP_FEE":{"details":"Guardrail for `g8keepFee` to prevent it from being set over 100 BPS."},"MAX_SETTING_HEAVY_SNIPE_EXPONENT":{"details":"Guardrail for `heavySnipeExponent` to prevent it from being set over 100."},"MAX_SETTING_HEAVY_SNIPE_PROTECTION_SECONDS":{"details":"Guardrail for `heavySnipeProtectionSeconds` to prevent it from being set over 5 days."},"MAX_SETTING_LIQUIDITY_SUPPLEMENT_FEE":{"details":"Guardrail for `liquiditySupplementFee` to prevent it from being set over 100 BPS."},"MAX_SETTING_SNIPE_PROTECTION_SECONDS":{"details":"Guardrail for `snipeProtectionSeconds` to prevent it from being set over 7 days."},"MAX_SETTING_TOKEN_INITIAL_SUPPLY":{"details":"Guardrail for `tokenInitialSupply` to prevent it from being set over 100T at 18 decimals."},"MIN_CONSTRAINED_TICK_LOWER":{"details":"Minimum value that can be set for the lower tick for pre-migration LP guard."},"MIN_SETTING_HEAVY_SNIPE_EXPONENT":{"details":"Guardrail for `heavySnipeExponent` to prevent it from being set under 2."},"MIN_SETTING_HEAVY_SNIPE_PROTECTION_SECONDS":{"details":"Guardrail for `heavySnipeProtectionSeconds` to prevent it from being set under 5 minutes."},"MIN_SETTING_SNIPE_PROTECTION_SECONDS":{"details":"Guardrail for `snipeProtectionSeconds` to prevent it from being set under 15 minutes."},"MIN_SETTING_TOKEN_INITIAL_SUPPLY":{"details":"Guardrail for `tokenInitialSupply` to prevent it from being set under 100K at 18 decimals."},"UNISWAP_POSITION_MANAGER":{"details":"Uniswap Nonfungible Position Manager address for the chain."},"WETH":{"details":"WETH address for the chain."},"allowedFeeWallets":{"details":"Mapping of allowed fee wallets."},"bondingCurveLPGuardTokens":{"details":"Mapping of token address to LP guard token ids."},"constrainedTickLower":{"details":"Uniswap V3 lower tick for the minimum viable price to set LP guard at based on the current fee tier."},"constrainedTickUpper":{"details":"Uniswap V3 upper tick for the minimum viable price to set LP guard at based on the current fee tier."},"deployerMigrationReward":{"details":"Reward to a deployer whose token migrates."},"deploymentFee":{"details":"Fee in native token, paid to g8keep, for the deployment of a bonding curve."},"g8keepFee":{"details":"Fee in BPS assessed on token trades in curve, paid to g8keep. Initial value: 1.0%"},"heavySnipeExponent":{"details":"Exponent that a deployed curve will have for heavy snipe penalties."},"heavySnipeProtectionSeconds":{"details":"Time in seconds that a deployed curve will have heavy snipe protection enabled."},"liquiditySupplementFee":{"details":"Fee in BPS assessed on token trades in curve to make upliquidity shift and deployer reward. Initial value: 0.3%"},"lockerFactory":{"details":"Uniswap Nonfungible Position Manager address for the chain."},"maxBundleBuyAmount":{"details":"Maximum amount of ETH that can be sent during deployment for a bundle buy."},"snipeProtectionSeconds":{"details":"Time in seconds that a deployed curve will have snipe protection enabled."},"startSqrtPriceX96":{"details":"Uniswap V3 sqrtPriceX96 for the lower tick to set LP guard at based on the current fee tier."},"tickSpacing":{"details":"Uniswap V3 tick spacing based on the current fee tier."},"tokenInitialSupply":{"details":"Initial supply of a deployed token."},"tokenLiquidityShift":{"details":"Initial shift in liquidity for a deployed curve."},"tokenMigrationLiquidity":{"details":"Liquidity required for a token to migrate."},"uniswapFeeTier":{"details":"Uniswap Fee Tier"}},"title":"g8keepBondingCurveFactory","version":1},"userdoc":{"kind":"user","methods":{"deployToken(address,address,string,string,uint256,string,string,bytes32)":{"notice":"Deploys a g8keepBondingCurve contract using current settings, creates an LP guard token to prevent price movement in Uniswap V3 pair prior to token migration, executes a bundle buyif value has been supplied for a bundle buy."},"setAllowedG8keepFeeWallet(address,bool)":{"notice":"Admin function to set an allowed g8keep fee wallet to receive initial liquidity fees."},"setDeploymentSettings(uint112,uint112,uint16,uint24,uint16,uint112,uint112,uint112,uint24,uint24,uint8)":{"notice":"Admin function to configure deployment parameters."},"setG8keepLockerFactory(address)":{"notice":"Admin function to set the address of the current locker factory. "},"setMaximumBundleBuy(uint256)":{"notice":"Admin function to set the maximum value of a bundle buy."},"withdrawETH(address)":{"notice":"Admin function to withdraw native token that is held by the factory contract."},"withdrawToken(address,address)":{"notice":"Admin function to withdraw a token that is held by the factory contract."},"withdrawToken(address,address,uint256)":{"notice":"Admin function to withdraw a token that is held by the factory contract."}},"notice":"Factory for managing deployment parameters and deploying g8keepbonding curve contracts.","version":1}},"settings":{"compilationTarget":{"src/g8keepBondingCurveFactory.sol":"g8keepBondingCurveFactory"},"evmVersion":"cancun","libraries":{},"metadata":{"bytecodeHash":"ipfs"},"optimizer":{"enabled":true,"runs":15000},"remappings":[":@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/",":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/",":forge-std/=lib/forge-std/src/",":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/",":openzeppelin-contracts/=lib/openzeppelin-contracts/",":solady/=lib/solady/src/",":solmate/=lib/solmate/src/"]},"sources":{"lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol":{"keccak256":"0xe06a3f08a987af6ad2e1c1e774405d4fe08f1694b67517438b467cecf0da0ef7","license":"MIT","urls":["bzz-raw://df6f0c459663c9858b6cba2cda1d14a7d05a985bed6d2de72bd8e78c25ee79db","dweb:/ipfs/QmeTTxZ7qVk9rjEv2R4CpCwdf8UMCcRqDNMvzNxHc3Fnn9"]},"lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol":{"keccak256":"0x5dc63d1c6a12fe1b17793e1745877b2fcbe1964c3edfd0a482fac21ca8f18261","license":"MIT","urls":["bzz-raw://6b7f97c5960a50fd1822cb298551ffc908e37b7893a68d6d08bce18a11cb0f11","dweb:/ipfs/QmQQvxBytoY1eBt3pRQDmvH2hZ2yjhs12YqVfzGm7KSURq"]},"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol":{"keccak256":"0x79796192ec90263f21b464d5bc90b777a525971d3de8232be80d9c4f9fb353b8","license":"MIT","urls":["bzz-raw://f6fda447a62815e8064f47eff0dd1cf58d9207ad69b5d32280f8d7ed1d1e4621","dweb:/ipfs/QmfDRc7pxfaXB2Dh9np5Uf29Na3pQ7tafRS684wd3GLjVL"]},"lib/solady/src/auth/Ownable.sol":{"keccak256":"0xc208cdd9de02bbf4b5edad18b88e23a2be7ff56d2287d5649329dc7cda64b9a3","license":"MIT","urls":["bzz-raw://e8fba079cc7230c617f7493a2e97873f88e59a53a5018fcb2e2b6ac42d8aa5a3","dweb:/ipfs/QmTXg8GSt8hsK2cZhbPFrund1mrwVdkLQmEPoQaFy4fhjs"]},"lib/solady/src/utils/FixedPointMathLib.sol":{"keccak256":"0x4913fe355ada3849fca527195135bb659092778113984a6590669d2a80106bc8","license":"MIT","urls":["bzz-raw://3f403357b46f778250e8b07430409185f99231c67dee43b65ba231fb2c383be8","dweb:/ipfs/QmUTNSrSBJSJdJUc539FFLb7pC6c7h6nmSPYG4Qb11Viq4"]},"lib/solady/src/utils/SafeTransferLib.sol":{"keccak256":"0x7d0de1ff3be5dc32635283280b000d4794015a1b61d7dae7f3ff7b0721b07210","license":"MIT","urls":["bzz-raw://e307c9eece677565e7d584ee77c56134b5db38a70f557f9d2b1b308219276c0c","dweb:/ipfs/QmTEtqaTFgRBFGpJyb5o4v2w8yrSpcNThov4bNpcLr2tTR"]},"src/Common.sol":{"keccak256":"0x88552de0d3f10f322405dfa82a856a00050b56bd0a02d12a169d70fb241dbc2d","license":"BUSL-1.1","urls":["bzz-raw://702be2dc46f6f148a24351563fbd14e424c4cb0c2f4ede2aa706f7b79f3ae51a","dweb:/ipfs/QmSifiqRYsj6bsJN2LjHpdUo6RSCZi1h8Bo3p5Mk7MX5u1"]},"src/g8keepBondingCurve.sol":{"keccak256":"0x726934dbbf5ca26c605e775b6b846c31921d6e8b47d062af23022bab71a36e96","license":"BUSL-1.1","urls":["bzz-raw://280099fd21f598a095f2f221cc1b0628641b55584111f417c2d8ffc888e29e91","dweb:/ipfs/Qmb7eCyEEPFNnErnJfXUsGV9aGFpDx9AtN2G4sWySecLiP"]},"src/g8keepBondingCurveCode.sol":{"keccak256":"0x01eb0271a040b0b4ef87e6193d87020b934b78de7a937650f7e8ab4b9219a4fc","license":"BUSL-1.1","urls":["bzz-raw://0f1a95d9e959ce1b4c41ad74152d901d15ef808f02417586f25d0ccdf082e8dd","dweb:/ipfs/QmPA6RxMYqsbDAvf5UqUudmiUHptmowo9qK6a46gBg6n7J"]},"src/g8keepBondingCurveFactory.sol":{"keccak256":"0xb6005d03c22a2807166f02741520e12f85c2784648bae1396b2e387082f8c6fb","license":"BUSL-1.1","urls":["bzz-raw://75471822269bc816ddad065f8f81da134e24e56f3d18ba4cc841a7468b44db6b","dweb:/ipfs/QmNY8kXqYMrW914i3pmPcxiYQy8xbVdEoHWPfUUPbnvtku"]},"src/g8keepBondingCurveFactoryConfiguration.sol":{"keccak256":"0xe49340806b08ea494ecdee7a822ad14deb14409c1dd8fd7b14f8723e16c9814f","license":"BUSL-1.1","urls":["bzz-raw://86987dc39c1032fc7971cf2bcf3f08bae1a25b11a1539a9bf8468678beb651d0","dweb:/ipfs/QmTmowuZNr4Ljj1RBXbyB923YBvrLYe8yhaL2Qwt4PL81y"]},"src/g8keepLiquidityLocker.sol":{"keccak256":"0x4e51e46034ca407e07a2682c8f28958f71bffd5f5289e7a9503b5aa3217ebd23","license":"MIT","urls":["bzz-raw://224c94ed0b94e474c83f5e6ef6e7b9237f80caaa2fa04c8951dd7e46a44f38bb","dweb:/ipfs/QmTDRJZHinNnx4x4QCPWsdhLQszAQ2hRkRV6aDZGzHXbyN"]},"src/g8keepLockerFactory.sol":{"keccak256":"0x6700bf22dbc836792d1f4c9341ea63625c21b3c5af8e0591c691ae625342dd87","license":"MIT","urls":["bzz-raw://f2f97dab7664c110d6981b629575b2a0c2cbbfee0c9dc411b3233dae2e7471e2","dweb:/ipfs/QmVzxJVqsBxiguYjVr8Pq7D6HSezjXmCdhvSeBDdTE3FCf"]},"src/interfaces/IG8keepLockerFactory.sol":{"keccak256":"0xabbebcca61ee1d2a27c246702308ed838f45a91c738ec4966c6662f9cac10603","license":"BUSL-1.1","urls":["bzz-raw://0e036f20b487f3247e91fbf5315aef5ab3fa50e3ceb90a8f829d89c783c7b1ba","dweb:/ipfs/QmVSr4NdbqyB2Bt7mXXLLrM6WdbYJpXmv5YyE56wwS7uhB"]},"src/interfaces/INonfungiblePositionManager.sol":{"keccak256":"0xa18f26ca03e9265c9d58d589b38d110f2756b406609dde7f53bfaf15e2352b5f","license":"GPL-2.0-or-later","urls":["bzz-raw://7d3a297b61d10b6fe8e8214e0005a673439f2faa8eb60e3df28a7ad5c070e4b8","dweb:/ipfs/QmbgKND5RUsaQt9PNrXahf1k9Q3SQywaG9steKVr2j7s1M"]},"src/interfaces/IPeripheryImmutableState.sol":{"keccak256":"0x7affcfeb5127c0925a71d6a65345e117c33537523aeca7bc98085ead8452519d","license":"GPL-2.0-or-later","urls":["bzz-raw://e16b291294210e71cb0f20cd0afe62ae2dc6878d627f5ccc19c4dc9cd80aec3f","dweb:/ipfs/QmQGitSyBr26nour81BZmpmDMyJpvZRqHQZvnCD1Acb127"]},"src/interfaces/IPoolInitializer.sol":{"keccak256":"0x9b930f0683a02d7dd50d3ee7857fe538eab7a9a77c10cf65d7dd6a5cee577c59","license":"GPL-2.0-or-later","urls":["bzz-raw://b0c5abca273afd01ad188f61b1dcf92f8153d668ddf33ae72068e6e81e2f53e4","dweb:/ipfs/QmZCPLhebWNvunmCnXQJYH7qy154Yj7vzjhjVEacyqJ2pP"]},"src/interfaces/IUniswapV3Factory.sol":{"keccak256":"0x219b37fd28756456bd9ee18e2c7ca39285612cdaf4d558638b590de6f170a2d1","license":"GPL-2.0-or-later","urls":["bzz-raw://aa809534624d60a3d8491d3c097950fb3734b4b4e1d05ffc844d50e3dd216c9f","dweb:/ipfs/QmPcyNsTriLJWEmN79Bf8LrNDkjoAEVLNFHpvPh24ygzve"]},"src/interfaces/IUniswapV3Pool.sol":{"keccak256":"0x015acf756dcfa2191e189b0fcadaa8e8316d34adf287c35438c96df680352f48","license":"GPL-2.0-or-later","urls":["bzz-raw://c8db746b1b788bd71372df71b1c56bcdbfd1df1345f3b5de175dd7e52afb98bd","dweb:/ipfs/QmSiyDEyScLaNHXmGH1rJhTN832CcYzwoYLbAYPd2QeiZP"]},"src/interfaces/IUniswapV3PoolActions.sol":{"keccak256":"0xadb1bd469e6abf42f7487db9de282a6f06998cadf9cdf26aae96da84f4418c4b","license":"GPL-2.0-or-later","urls":["bzz-raw://30d6c7cf6dbf0c435d5f2dea7160ef27b2a4a9faf05660d2251cb88a5445b638","dweb:/ipfs/QmbsoLaZdoYkzAYUn4SeBqe8sqEe73BpuvmL1ZrL1f7HzZ"]},"src/interfaces/IUniswapV3PoolImmutables.sol":{"keccak256":"0xf6e5d2cd1139c4c276bdbc8e1d2b256e456c866a91f1b868da265c6d2685c3f7","license":"GPL-2.0-or-later","urls":["bzz-raw://b99c8c9ae8e27ee6559e5866bea82cbc9ffc8247f8d15b7422a4deb287d4d047","dweb:/ipfs/QmfL8gaqt3ffAnm6nVj5ksuNpLygXuL3xq5VBqrkwC2JJ3"]},"src/interfaces/IUniswapV3PoolState.sol":{"keccak256":"0x852dc1f5df7dcf7f11e7bb3eed79f0cea72ad4b25f6a9d2c35aafb48925fd49f","license":"GPL-2.0-or-later","urls":["bzz-raw://ed63907c38ff36b0e22bc9ffc53e791ea74f0d4f0e7c257fdfb5aaf8825b1f0f","dweb:/ipfs/QmSQrckghEjs6HVsA5GVgpNpZWvTXMY5eQLF7cN6deFeEg"]},"src/interfaces/IWETH.sol":{"keccak256":"0x2191ac3788729655599bcdf479dc92a190733d6d27d983d7fc2d064278ca5a01","license":"MIT","urls":["bzz-raw://98cb54d2a0e11f22f1cde323540b200eccc7c5206098cc1d13d2f776647d92a9","dweb:/ipfs/QmbQ87begU3pEaLRp8dRe3EpYRce6unJii5C5TPY1fCcNf"]},"src/libraries/TickMath.sol":{"keccak256":"0xa3601cd7cc2b833b0ed0c2453ccf68ed99210541f8626449322e33e56b56f9b8","license":"GPL-2.0-or-later","urls":["bzz-raw://53633880332ba1d5593bece5962954425f2798f1c9f9fd4afde5d726e79291db","dweb:/ipfs/QmYtjqH4NgdKXKjKa4PCNanitxu5LKMCVXjU67UEQyEdKP"]}},"version":1}',
  metadata: {
    compiler: {
      version: '0.8.26+commit.8a97fa7a',
    },
    language: 'Solidity',
    output: {
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: '_configuration',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [],
          type: 'error',
          name: 'AlreadyInitialized',
        },
        {
          inputs: [],
          type: 'error',
          name: 'InvalidBundleBuy',
        },
        {
          inputs: [],
          type: 'error',
          name: 'InvalidDeploymentFee',
        },
        {
          inputs: [],
          type: 'error',
          name: 'InvalidFeeWallet',
        },
        {
          inputs: [],
          type: 'error',
          name: 'InvalidSettings',
        },
        {
          inputs: [],
          type: 'error',
          name: 'InvalidTokenAddress',
        },
        {
          inputs: [],
          type: 'error',
          name: 'NewOwnerIsZeroAddress',
        },
        {
          inputs: [],
          type: 'error',
          name: 'NoHandoverRequest',
        },
        {
          inputs: [],
          type: 'error',
          name: 'Unauthorized',
        },
        {
          inputs: [],
          type: 'error',
          name: 'WithdrawalFailed',
        },
        {
          inputs: [],
          type: 'error',
          name: 'ZeroAddress',
        },
        {
          inputs: [
            {
              internalType: 'uint112',
              name: 'deploymentFee',
              type: 'uint112',
              indexed: false,
            },
            {
              internalType: 'uint112',
              name: 'tokenInitialSupply',
              type: 'uint112',
              indexed: false,
            },
            {
              internalType: 'uint16',
              name: 'g8keepFee',
              type: 'uint16',
              indexed: false,
            },
            {
              internalType: 'uint24',
              name: 'uniswapFeeTier',
              type: 'uint24',
              indexed: false,
            },
            {
              internalType: 'uint16',
              name: 'liquiditySupplementFee',
              type: 'uint16',
              indexed: false,
            },
            {
              internalType: 'uint112',
              name: 'deployerMigrationReward',
              type: 'uint112',
              indexed: false,
            },
            {
              internalType: 'uint112',
              name: 'tokenLiquidityShift',
              type: 'uint112',
              indexed: false,
            },
            {
              internalType: 'uint112',
              name: 'tokenMigrationLiquidity',
              type: 'uint112',
              indexed: false,
            },
            {
              internalType: 'uint24',
              name: 'snipeProtectionSeconds',
              type: 'uint24',
              indexed: false,
            },
            {
              internalType: 'uint24',
              name: 'heavySnipeProtectionSeconds',
              type: 'uint24',
              indexed: false,
            },
            {
              internalType: 'uint8',
              name: 'heavySnipeExponent',
              type: 'uint8',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'DeploymentSettingsUpdated',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'feeWallet',
              type: 'address',
              indexed: true,
            },
            {
              internalType: 'bool',
              name: 'allowed',
              type: 'bool',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'FeeWalletUpdated',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'pendingOwner',
              type: 'address',
              indexed: true,
            },
          ],
          type: 'event',
          name: 'OwnershipHandoverCanceled',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'pendingOwner',
              type: 'address',
              indexed: true,
            },
          ],
          type: 'event',
          name: 'OwnershipHandoverRequested',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'oldOwner',
              type: 'address',
              indexed: true,
            },
            {
              internalType: 'address',
              name: 'newOwner',
              type: 'address',
              indexed: true,
            },
          ],
          type: 'event',
          name: 'OwnershipTransferred',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
              indexed: true,
            },
            {
              internalType: 'address',
              name: 'deployer',
              type: 'address',
              indexed: true,
            },
            {
              internalType: 'string',
              name: 'symbol',
              type: 'string',
              indexed: false,
            },
            {
              internalType: 'uint40',
              name: 'snipeProtectionEnd',
              type: 'uint40',
              indexed: false,
            },
            {
              internalType: 'address',
              name: 'pairAddress',
              type: 'address',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'TokenDeployed',
          anonymous: false,
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'G8KEEP_BONDING_CURVE_CODE',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'UNISWAP_POSITION_MANAGER',
          outputs: [
            {
              internalType: 'contract INonfungiblePositionManager',
              name: '',
              type: 'address',
            },
          ],
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
          name: 'allowedFeeWallets',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
          name: 'bondingCurveLPGuardTokens',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'payable',
          type: 'function',
          name: 'cancelOwnershipHandover',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'pendingOwner',
              type: 'address',
            },
          ],
          stateMutability: 'payable',
          type: 'function',
          name: 'completeOwnershipHandover',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_g8keepFeeWallet',
              type: 'address',
            },
            {
              internalType: 'address',
              name: '_deployer',
              type: 'address',
            },
            {
              internalType: 'string',
              name: '_name',
              type: 'string',
            },
            {
              internalType: 'string',
              name: '_symbol',
              type: 'string',
            },
            {
              internalType: 'uint256',
              name: '_fid',
              type: 'uint256',
            },
            {
              internalType: 'string',
              name: '_image',
              type: 'string',
            },
            {
              internalType: 'string',
              name: '_castHash',
              type: 'string',
            },
            {
              internalType: 'bytes32',
              name: '_tokenSalt',
              type: 'bytes32',
            },
          ],
          stateMutability: 'payable',
          type: 'function',
          name: 'deployToken',
          outputs: [
            {
              internalType: 'address',
              name: '_tokenAddress',
              type: 'address',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'deployerMigrationReward',
          outputs: [
            {
              internalType: 'uint112',
              name: '',
              type: 'uint112',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'deploymentFee',
          outputs: [
            {
              internalType: 'uint112',
              name: '',
              type: 'uint112',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'g8keepFee',
          outputs: [
            {
              internalType: 'uint16',
              name: '',
              type: 'uint16',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'heavySnipeExponent',
          outputs: [
            {
              internalType: 'uint8',
              name: '',
              type: 'uint8',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'heavySnipeProtectionSeconds',
          outputs: [
            {
              internalType: 'uint24',
              name: '',
              type: 'uint24',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'liquiditySupplementFee',
          outputs: [
            {
              internalType: 'uint16',
              name: '',
              type: 'uint16',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'lockerFactory',
          outputs: [
            {
              internalType: 'contract IG8keepLockerFactory',
              name: '',
              type: 'address',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'maxBundleBuyAmount',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'owner',
          outputs: [
            {
              internalType: 'address',
              name: 'result',
              type: 'address',
            },
          ],
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'pendingOwner',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
          name: 'ownershipHandoverExpiresAt',
          outputs: [
            {
              internalType: 'uint256',
              name: 'result',
              type: 'uint256',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'removeLPGuardLiquidity',
        },
        {
          inputs: [],
          stateMutability: 'payable',
          type: 'function',
          name: 'renounceOwnership',
        },
        {
          inputs: [],
          stateMutability: 'payable',
          type: 'function',
          name: 'requestOwnershipHandover',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_g8keepFeeWallet',
              type: 'address',
            },
            {
              internalType: 'bool',
              name: 'allowed',
              type: 'bool',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'setAllowedG8keepFeeWallet',
        },
        {
          inputs: [
            {
              internalType: 'uint112',
              name: '_deploymentFee',
              type: 'uint112',
            },
            {
              internalType: 'uint112',
              name: '_tokenInitialSupply',
              type: 'uint112',
            },
            {
              internalType: 'uint16',
              name: '_g8keepFee',
              type: 'uint16',
            },
            {
              internalType: 'uint24',
              name: '_uniswapFeeTier',
              type: 'uint24',
            },
            {
              internalType: 'uint16',
              name: '_liquiditySupplementFee',
              type: 'uint16',
            },
            {
              internalType: 'uint112',
              name: '_deployerMigrationReward',
              type: 'uint112',
            },
            {
              internalType: 'uint112',
              name: '_tokenLiquidityShift',
              type: 'uint112',
            },
            {
              internalType: 'uint112',
              name: '_tokenMigrationLiquidity',
              type: 'uint112',
            },
            {
              internalType: 'uint24',
              name: '_snipeProtectionSeconds',
              type: 'uint24',
            },
            {
              internalType: 'uint24',
              name: '_heavySnipeProtectionSeconds',
              type: 'uint24',
            },
            {
              internalType: 'uint8',
              name: '_heavySnipeExponent',
              type: 'uint8',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'setDeploymentSettings',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_lockerFactory',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'setG8keepLockerFactory',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: '_maxBundleBuyAmount',
              type: 'uint256',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'setMaximumBundleBuy',
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'snipeProtectionSeconds',
          outputs: [
            {
              internalType: 'uint24',
              name: '',
              type: 'uint24',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'tokenInitialSupply',
          outputs: [
            {
              internalType: 'uint112',
              name: '',
              type: 'uint112',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'tokenLiquidityShift',
          outputs: [
            {
              internalType: 'uint112',
              name: '',
              type: 'uint112',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'tokenMigrationLiquidity',
          outputs: [
            {
              internalType: 'uint112',
              name: '',
              type: 'uint112',
            },
          ],
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'to',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'transferGuardTokens',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'newOwner',
              type: 'address',
            },
          ],
          stateMutability: 'payable',
          type: 'function',
          name: 'transferOwnership',
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'uniswapFeeTier',
          outputs: [
            {
              internalType: 'uint24',
              name: '',
              type: 'uint24',
            },
          ],
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'to',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'withdrawETH',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'tokenAddress',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'to',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'withdrawToken',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'tokenAddress',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'to',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'withdrawToken',
        },
      ],
      devdoc: {
        kind: 'dev',
        methods: {
          'cancelOwnershipHandover()': {
            details: 'Cancels the two-step ownership handover to the caller, if any.',
          },
          'completeOwnershipHandover(address)': {
            details:
              'Allows the owner to complete the two-step ownership handover to `pendingOwner`. Reverts if there is no existing ownership handover requested by `pendingOwner`.',
          },
          constructor: {
            details:
              'Constructs the g8keepBondingCurveFactory contract.Initialization parameters are retrieved from a configuration contract so thatthe g8keepBondingCurveFactory may be deterministically deployed on EVM chainsat the same address.',
            params: {
              _configuration:
                'The address of the factory configuration contract to retrieve configuration parameters.',
            },
          },
          'deployToken(address,address,string,string,uint256,string,string,bytes32)': {
            params: {
              _castHash: 'Hash of the cast for the token if deployed off g8keep',
              _deployer: 'Address of the deployer for the token.',
              _fid: 'Farcaster ID for the token deployer.',
              _g8keepFeeWallet: 'Address of the fee wallet for the deployment.',
              _image: 'Image of token if deployed off g8keep',
              _name: 'Name of the token being deployed.',
              _symbol: 'Symbol of the token being deployed.',
              _tokenSalt: 'Salt for token deployment to generate a deterministic address.',
            },
          },
          'owner()': {
            details: 'Returns the owner of the contract.',
          },
          'ownershipHandoverExpiresAt(address)': {
            details:
              'Returns the expiry timestamp for the two-step ownership handover to `pendingOwner`.',
          },
          'removeLPGuardLiquidity()': {
            details:
              'Restricted function called by a token during migration to remove the LP guard.Reverts if the caller does not have an LP guard set.',
          },
          'renounceOwnership()': {
            details: 'Allows the owner to renounce their ownership.',
          },
          'requestOwnershipHandover()': {
            details:
              'Request a two-step ownership handover to the caller. The request will automatically expire in 48 hours (172800 seconds) by default.',
          },
          'setAllowedG8keepFeeWallet(address,bool)': {
            details: 'The fee wallet cannot be set to the zero address.',
            params: {
              _g8keepFeeWallet: 'Address of the g8keep fee wallet.',
            },
          },
          'setDeploymentSettings(uint112,uint112,uint16,uint24,uint16,uint112,uint112,uint112,uint24,uint24,uint8)':
            {
              details: 'Settings parameters must be within the constant guardrails defined.',
              params: {
                _deployerMigrationReward: 'Reward to the curve deployer when a token migrates.',
                _deploymentFee: 'Fee in native token for deploying a bonding curve.',
                _g8keepFee: 'Fee in BPS to assess on token trades.',
                _heavySnipeExponent: 'Exponent penalty during heavy snipe protection.',
                _heavySnipeProtectionSeconds:
                  'Time in seconds for heavy snipe protection to be enabled.',
                _liquiditySupplementFee:
                  'Minimum time in seconds that a deployer tokens must vest over.',
                _snipeProtectionSeconds: 'Time in seconds for snipe protection to be enabled.',
                _tokenInitialSupply: 'Initial supply of bonding curve tokens.',
                _tokenLiquidityShift: 'Initial liquidity shift for a bonding curve.',
                _tokenMigrationLiquidity: 'Liquidity required to migrate a bonding curve.',
                _uniswapFeeTier: 'Fee tier when migrating to Uniswap.',
              },
            },
          'setG8keepLockerFactory(address)': {
            details: 'The locker factory must contain code to be set. ',
            params: {
              _lockerFactory: 'Address of the locker factory.',
            },
          },
          'setMaximumBundleBuy(uint256)': {
            params: {
              _maxBundleBuyAmount:
                'Amount to set as the max bundle buy without a revert on deployment.',
            },
          },
          'transferGuardTokens(address)': {
            details:
              'Allows a token contract to transfer dust remaining from guard tokens to an address it specifies.',
          },
          'transferOwnership(address)': {
            details: 'Allows the owner to transfer the ownership to `newOwner`.',
          },
          'withdrawETH(address)': {
            details: 'Will withdraw the entire balance.',
            params: {
              to: 'Address to withdraw the token to.',
            },
          },
          'withdrawToken(address,address)': {
            details: 'Will withdraw the entire balance of the token.',
            params: {
              to: 'Address to withdraw the token to.',
              tokenAddress: 'Address of the token to withdraw.',
            },
          },
          'withdrawToken(address,address,uint256)': {
            details: 'Will withdraw the specified `amount` of token.',
            params: {
              amount: 'Amount of the token to withdraw.',
              to: 'Address to withdraw the token to.',
              tokenAddress: 'Address of the token to withdraw.',
            },
          },
        },
        version: 1,
      },
      userdoc: {
        kind: 'user',
        methods: {
          'deployToken(address,address,string,string,uint256,string,string,bytes32)': {
            notice:
              'Deploys a g8keepBondingCurve contract using current settings, creates an LP guard token to prevent price movement in Uniswap V3 pair prior to token migration, executes a bundle buyif value has been supplied for a bundle buy.',
          },
          'setAllowedG8keepFeeWallet(address,bool)': {
            notice:
              'Admin function to set an allowed g8keep fee wallet to receive initial liquidity fees.',
          },
          'setDeploymentSettings(uint112,uint112,uint16,uint24,uint16,uint112,uint112,uint112,uint24,uint24,uint8)':
            {
              notice: 'Admin function to configure deployment parameters.',
            },
          'setG8keepLockerFactory(address)': {
            notice: 'Admin function to set the address of the current locker factory. ',
          },
          'setMaximumBundleBuy(uint256)': {
            notice: 'Admin function to set the maximum value of a bundle buy.',
          },
          'withdrawETH(address)': {
            notice: 'Admin function to withdraw native token that is held by the factory contract.',
          },
          'withdrawToken(address,address)': {
            notice: 'Admin function to withdraw a token that is held by the factory contract.',
          },
          'withdrawToken(address,address,uint256)': {
            notice: 'Admin function to withdraw a token that is held by the factory contract.',
          },
        },
        version: 1,
      },
    },
    settings: {
      remappings: [
        '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/',
        'ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/',
        'erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/',
        'forge-std/=lib/forge-std/src/',
        'halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/',
        'openzeppelin-contracts/=lib/openzeppelin-contracts/',
        'solady/=lib/solady/src/',
        'solmate/=lib/solmate/src/',
      ],
      optimizer: {
        enabled: true,
        runs: 15000,
      },
      metadata: {
        bytecodeHash: 'ipfs',
      },
      compilationTarget: {
        'src/g8keepBondingCurveFactory.sol': 'g8keepBondingCurveFactory',
      },
      evmVersion: 'cancun',
      libraries: {},
    },
    sources: {
      'lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol': {
        keccak256: '0xe06a3f08a987af6ad2e1c1e774405d4fe08f1694b67517438b467cecf0da0ef7',
        urls: [
          'bzz-raw://df6f0c459663c9858b6cba2cda1d14a7d05a985bed6d2de72bd8e78c25ee79db',
          'dweb:/ipfs/QmeTTxZ7qVk9rjEv2R4CpCwdf8UMCcRqDNMvzNxHc3Fnn9',
        ],
        license: 'MIT',
      },
      'lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol': {
        keccak256: '0x5dc63d1c6a12fe1b17793e1745877b2fcbe1964c3edfd0a482fac21ca8f18261',
        urls: [
          'bzz-raw://6b7f97c5960a50fd1822cb298551ffc908e37b7893a68d6d08bce18a11cb0f11',
          'dweb:/ipfs/QmQQvxBytoY1eBt3pRQDmvH2hZ2yjhs12YqVfzGm7KSURq',
        ],
        license: 'MIT',
      },
      'lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol': {
        keccak256: '0x79796192ec90263f21b464d5bc90b777a525971d3de8232be80d9c4f9fb353b8',
        urls: [
          'bzz-raw://f6fda447a62815e8064f47eff0dd1cf58d9207ad69b5d32280f8d7ed1d1e4621',
          'dweb:/ipfs/QmfDRc7pxfaXB2Dh9np5Uf29Na3pQ7tafRS684wd3GLjVL',
        ],
        license: 'MIT',
      },
      'lib/solady/src/auth/Ownable.sol': {
        keccak256: '0xc208cdd9de02bbf4b5edad18b88e23a2be7ff56d2287d5649329dc7cda64b9a3',
        urls: [
          'bzz-raw://e8fba079cc7230c617f7493a2e97873f88e59a53a5018fcb2e2b6ac42d8aa5a3',
          'dweb:/ipfs/QmTXg8GSt8hsK2cZhbPFrund1mrwVdkLQmEPoQaFy4fhjs',
        ],
        license: 'MIT',
      },
      'lib/solady/src/utils/FixedPointMathLib.sol': {
        keccak256: '0x4913fe355ada3849fca527195135bb659092778113984a6590669d2a80106bc8',
        urls: [
          'bzz-raw://3f403357b46f778250e8b07430409185f99231c67dee43b65ba231fb2c383be8',
          'dweb:/ipfs/QmUTNSrSBJSJdJUc539FFLb7pC6c7h6nmSPYG4Qb11Viq4',
        ],
        license: 'MIT',
      },
      'lib/solady/src/utils/SafeTransferLib.sol': {
        keccak256: '0x7d0de1ff3be5dc32635283280b000d4794015a1b61d7dae7f3ff7b0721b07210',
        urls: [
          'bzz-raw://e307c9eece677565e7d584ee77c56134b5db38a70f557f9d2b1b308219276c0c',
          'dweb:/ipfs/QmTEtqaTFgRBFGpJyb5o4v2w8yrSpcNThov4bNpcLr2tTR',
        ],
        license: 'MIT',
      },
      'src/Common.sol': {
        keccak256: '0x88552de0d3f10f322405dfa82a856a00050b56bd0a02d12a169d70fb241dbc2d',
        urls: [
          'bzz-raw://702be2dc46f6f148a24351563fbd14e424c4cb0c2f4ede2aa706f7b79f3ae51a',
          'dweb:/ipfs/QmSifiqRYsj6bsJN2LjHpdUo6RSCZi1h8Bo3p5Mk7MX5u1',
        ],
        license: 'BUSL-1.1',
      },
      'src/g8keepBondingCurve.sol': {
        keccak256: '0x726934dbbf5ca26c605e775b6b846c31921d6e8b47d062af23022bab71a36e96',
        urls: [
          'bzz-raw://280099fd21f598a095f2f221cc1b0628641b55584111f417c2d8ffc888e29e91',
          'dweb:/ipfs/Qmb7eCyEEPFNnErnJfXUsGV9aGFpDx9AtN2G4sWySecLiP',
        ],
        license: 'BUSL-1.1',
      },
      'src/g8keepBondingCurveCode.sol': {
        keccak256: '0x01eb0271a040b0b4ef87e6193d87020b934b78de7a937650f7e8ab4b9219a4fc',
        urls: [
          'bzz-raw://0f1a95d9e959ce1b4c41ad74152d901d15ef808f02417586f25d0ccdf082e8dd',
          'dweb:/ipfs/QmPA6RxMYqsbDAvf5UqUudmiUHptmowo9qK6a46gBg6n7J',
        ],
        license: 'BUSL-1.1',
      },
      'src/g8keepBondingCurveFactory.sol': {
        keccak256: '0xb6005d03c22a2807166f02741520e12f85c2784648bae1396b2e387082f8c6fb',
        urls: [
          'bzz-raw://75471822269bc816ddad065f8f81da134e24e56f3d18ba4cc841a7468b44db6b',
          'dweb:/ipfs/QmNY8kXqYMrW914i3pmPcxiYQy8xbVdEoHWPfUUPbnvtku',
        ],
        license: 'BUSL-1.1',
      },
      'src/g8keepBondingCurveFactoryConfiguration.sol': {
        keccak256: '0xe49340806b08ea494ecdee7a822ad14deb14409c1dd8fd7b14f8723e16c9814f',
        urls: [
          'bzz-raw://86987dc39c1032fc7971cf2bcf3f08bae1a25b11a1539a9bf8468678beb651d0',
          'dweb:/ipfs/QmTmowuZNr4Ljj1RBXbyB923YBvrLYe8yhaL2Qwt4PL81y',
        ],
        license: 'BUSL-1.1',
      },
      'src/g8keepLiquidityLocker.sol': {
        keccak256: '0x4e51e46034ca407e07a2682c8f28958f71bffd5f5289e7a9503b5aa3217ebd23',
        urls: [
          'bzz-raw://224c94ed0b94e474c83f5e6ef6e7b9237f80caaa2fa04c8951dd7e46a44f38bb',
          'dweb:/ipfs/QmTDRJZHinNnx4x4QCPWsdhLQszAQ2hRkRV6aDZGzHXbyN',
        ],
        license: 'MIT',
      },
      'src/g8keepLockerFactory.sol': {
        keccak256: '0x6700bf22dbc836792d1f4c9341ea63625c21b3c5af8e0591c691ae625342dd87',
        urls: [
          'bzz-raw://f2f97dab7664c110d6981b629575b2a0c2cbbfee0c9dc411b3233dae2e7471e2',
          'dweb:/ipfs/QmVzxJVqsBxiguYjVr8Pq7D6HSezjXmCdhvSeBDdTE3FCf',
        ],
        license: 'MIT',
      },
      'src/interfaces/IG8keepLockerFactory.sol': {
        keccak256: '0xabbebcca61ee1d2a27c246702308ed838f45a91c738ec4966c6662f9cac10603',
        urls: [
          'bzz-raw://0e036f20b487f3247e91fbf5315aef5ab3fa50e3ceb90a8f829d89c783c7b1ba',
          'dweb:/ipfs/QmVSr4NdbqyB2Bt7mXXLLrM6WdbYJpXmv5YyE56wwS7uhB',
        ],
        license: 'BUSL-1.1',
      },
      'src/interfaces/INonfungiblePositionManager.sol': {
        keccak256: '0xa18f26ca03e9265c9d58d589b38d110f2756b406609dde7f53bfaf15e2352b5f',
        urls: [
          'bzz-raw://7d3a297b61d10b6fe8e8214e0005a673439f2faa8eb60e3df28a7ad5c070e4b8',
          'dweb:/ipfs/QmbgKND5RUsaQt9PNrXahf1k9Q3SQywaG9steKVr2j7s1M',
        ],
        license: 'GPL-2.0-or-later',
      },
      'src/interfaces/IPeripheryImmutableState.sol': {
        keccak256: '0x7affcfeb5127c0925a71d6a65345e117c33537523aeca7bc98085ead8452519d',
        urls: [
          'bzz-raw://e16b291294210e71cb0f20cd0afe62ae2dc6878d627f5ccc19c4dc9cd80aec3f',
          'dweb:/ipfs/QmQGitSyBr26nour81BZmpmDMyJpvZRqHQZvnCD1Acb127',
        ],
        license: 'GPL-2.0-or-later',
      },
      'src/interfaces/IPoolInitializer.sol': {
        keccak256: '0x9b930f0683a02d7dd50d3ee7857fe538eab7a9a77c10cf65d7dd6a5cee577c59',
        urls: [
          'bzz-raw://b0c5abca273afd01ad188f61b1dcf92f8153d668ddf33ae72068e6e81e2f53e4',
          'dweb:/ipfs/QmZCPLhebWNvunmCnXQJYH7qy154Yj7vzjhjVEacyqJ2pP',
        ],
        license: 'GPL-2.0-or-later',
      },
      'src/interfaces/IUniswapV3Factory.sol': {
        keccak256: '0x219b37fd28756456bd9ee18e2c7ca39285612cdaf4d558638b590de6f170a2d1',
        urls: [
          'bzz-raw://aa809534624d60a3d8491d3c097950fb3734b4b4e1d05ffc844d50e3dd216c9f',
          'dweb:/ipfs/QmPcyNsTriLJWEmN79Bf8LrNDkjoAEVLNFHpvPh24ygzve',
        ],
        license: 'GPL-2.0-or-later',
      },
      'src/interfaces/IUniswapV3Pool.sol': {
        keccak256: '0x015acf756dcfa2191e189b0fcadaa8e8316d34adf287c35438c96df680352f48',
        urls: [
          'bzz-raw://c8db746b1b788bd71372df71b1c56bcdbfd1df1345f3b5de175dd7e52afb98bd',
          'dweb:/ipfs/QmSiyDEyScLaNHXmGH1rJhTN832CcYzwoYLbAYPd2QeiZP',
        ],
        license: 'GPL-2.0-or-later',
      },
      'src/interfaces/IUniswapV3PoolActions.sol': {
        keccak256: '0xadb1bd469e6abf42f7487db9de282a6f06998cadf9cdf26aae96da84f4418c4b',
        urls: [
          'bzz-raw://30d6c7cf6dbf0c435d5f2dea7160ef27b2a4a9faf05660d2251cb88a5445b638',
          'dweb:/ipfs/QmbsoLaZdoYkzAYUn4SeBqe8sqEe73BpuvmL1ZrL1f7HzZ',
        ],
        license: 'GPL-2.0-or-later',
      },
      'src/interfaces/IUniswapV3PoolImmutables.sol': {
        keccak256: '0xf6e5d2cd1139c4c276bdbc8e1d2b256e456c866a91f1b868da265c6d2685c3f7',
        urls: [
          'bzz-raw://b99c8c9ae8e27ee6559e5866bea82cbc9ffc8247f8d15b7422a4deb287d4d047',
          'dweb:/ipfs/QmfL8gaqt3ffAnm6nVj5ksuNpLygXuL3xq5VBqrkwC2JJ3',
        ],
        license: 'GPL-2.0-or-later',
      },
      'src/interfaces/IUniswapV3PoolState.sol': {
        keccak256: '0x852dc1f5df7dcf7f11e7bb3eed79f0cea72ad4b25f6a9d2c35aafb48925fd49f',
        urls: [
          'bzz-raw://ed63907c38ff36b0e22bc9ffc53e791ea74f0d4f0e7c257fdfb5aaf8825b1f0f',
          'dweb:/ipfs/QmSQrckghEjs6HVsA5GVgpNpZWvTXMY5eQLF7cN6deFeEg',
        ],
        license: 'GPL-2.0-or-later',
      },
      'src/interfaces/IWETH.sol': {
        keccak256: '0x2191ac3788729655599bcdf479dc92a190733d6d27d983d7fc2d064278ca5a01',
        urls: [
          'bzz-raw://98cb54d2a0e11f22f1cde323540b200eccc7c5206098cc1d13d2f776647d92a9',
          'dweb:/ipfs/QmbQ87begU3pEaLRp8dRe3EpYRce6unJii5C5TPY1fCcNf',
        ],
        license: 'MIT',
      },
      'src/libraries/TickMath.sol': {
        keccak256: '0xa3601cd7cc2b833b0ed0c2453ccf68ed99210541f8626449322e33e56b56f9b8',
        urls: [
          'bzz-raw://53633880332ba1d5593bece5962954425f2798f1c9f9fd4afde5d726e79291db',
          'dweb:/ipfs/QmYtjqH4NgdKXKjKa4PCNanitxu5LKMCVXjU67UEQyEdKP',
        ],
        license: 'GPL-2.0-or-later',
      },
    },
    version: 1,
  },
  id: 29,
};
