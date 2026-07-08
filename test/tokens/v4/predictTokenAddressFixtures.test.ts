import { describe, expect, it } from 'bun:test';
import type { Hex } from 'viem';
import { base } from 'viem/chains';
import { ClankerToken_v4_abi, ClankerToken_v4_bytecode } from '../../../src/abi/v4/ClankerToken.js';
import { ClankerToken_v4_bsc_bytecode } from '../../../src/abi/v4.1.bsc/ClankerToken.js';
import { DEFAULT_SUPPLY } from '../../../src/constants.js';
import { clankerConfigFor, predictTokenAddressV4 } from '../../../src/index.js';
import { robinhood } from '../../../src/utils/chains/robinhood.js';

describe('predictTokenAddressV4 on-chain fixtures', () => {
  const robinhoodConfig = clankerConfigFor(robinhood.id, 'clanker_v4');
  const baseConfig = clankerConfigFor(base.id, 'clanker_v4');
  if (!robinhoodConfig || !baseConfig) throw new Error('Config not found');

  it('uses Robinhood/BSC token bytecode for CREATE2 prediction', () => {
    expect(robinhoodConfig.token.bytecode).toBe(ClankerToken_v4_bsc_bytecode);
    expect(robinhoodConfig.token.bytecode).not.toBe(ClankerToken_v4_bytecode);
  });

  it('matches Robinhood incident deploy tx (0xab51d3e1...)', () => {
    const tokenAdmin = '0x71cbbe6eCf1a9C4d8b9115757eBcC5Ff45902177' as const;
    const salt = '0x00000000000000000000000000000000f9da93237c8b2af1b9887f87a902fffa' as Hex;
    const args = [
      'clankerwifhood',
      'clwifhood',
      DEFAULT_SUPPLY,
      tokenAdmin,
      'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/377b8283-404e-425b-d569-e28016088f00/original',
      '',
      '{"interface":"clanker","platform":"farcaster","messageId":"0x680df66f6e64537a09c457bdb2ff399aa383f108","id":"527771"}',
      BigInt(robinhood.id),
    ] as const;

    const predicted = predictTokenAddressV4(args, robinhoodConfig, salt, tokenAdmin);

    expect(predicted).toBe('0x085844F1E613f61e206df92A9Bf1Ceb75aF113b5');
    expect(predicted).not.toBe('0x75b45af4D5AB4B0bb5ceE0aC5E87293e23231B07');
  });

  it('keeps Base on generic v4 bytecode with stable prediction', () => {
    expect(baseConfig.token.bytecode).toBe(ClankerToken_v4_bytecode);
    expect(baseConfig.token.abi).toBe(ClankerToken_v4_abi);

    const tokenAdmin = '0x71cbbe6eCf1a9C4d8b9115757eBcC5Ff45902177' as const;
    const salt = '0x00000000000000000000000000000000f9da93237c8b2af1b9887f87a902fffa' as Hex;
    const args = [
      'clankerwifhood',
      'clwifhood',
      DEFAULT_SUPPLY,
      tokenAdmin,
      'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/377b8283-404e-425b-d569-e28016088f00/original',
      '',
      '{"interface":"clanker","platform":"farcaster","messageId":"0x680df66f6e64537a09c457bdb2ff399aa383f108","id":"527771"}',
      BigInt(base.id),
    ] as const;

    const predicted = predictTokenAddressV4(args, baseConfig, salt, tokenAdmin);

    expect(predicted).toBe('0xAf3edBDb6A0D7434179E56f3A77CCB72a492F9D1');
  });
});
