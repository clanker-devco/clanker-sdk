import { describe, expect, test } from 'bun:test';
import { arbitrum, base, mainnet } from 'viem/chains';
// Import the actual ABIs for comparison
import { Clanker_v4_abi } from '../../src/abi/v4/Clanker.js';
import { ClankerAirdropv2_v4_abi } from '../../src/abi/v4/ClankerAirdropV2.js';
import { ClankerFeeLocker_abi } from '../../src/abi/v4/ClankerFeeLocker.js';
import { ClankerHook_StaticFee_v4_abi } from '../../src/abi/v4/ClankerHookStaticFee.js';
import { ClankerToken_v4_abi } from '../../src/abi/v4/ClankerToken.js';
import { ClankerUniV4EthDevBuy_v4_abi } from '../../src/abi/v4/ClankerUniV4EthDevBuy.js';
import { ClankerVault_v4_abi } from '../../src/abi/v4/ClankerVault.js';
import { ClankerToken_v4_1_mainnet_abi } from '../../src/abi/v4.1.mainnet/ClankerToken.js';
import {
  getClankerAbi,
  getClankerAirdropV2Abi,
  getClankerFeeLockerAbi,
  getClankerHookStaticFeeAbi,
  getClankerTokenAbi,
  getClankerUniV4EthDevBuyAbi,
  getClankerVaultAbi,
} from '../../src/utils/abi-selector.js';

describe('ABI Selector', () => {
  describe('Mainnet (chainId: 1)', () => {
    test('should return mainnet ABIs for mainnet chain', () => {
      expect(getClankerTokenAbi(mainnet.id)).toBe(ClankerToken_v4_1_mainnet_abi);
    });

    test('should return v4 ABIs for non-mainnet chains', () => {
      expect(getClankerAbi(base.id)).toBe(Clanker_v4_abi);
      expect(getClankerTokenAbi(base.id)).toBe(ClankerToken_v4_abi);
      expect(getClankerVaultAbi(base.id)).toBe(ClankerVault_v4_abi);
      expect(getClankerFeeLockerAbi(base.id)).toBe(ClankerFeeLocker_abi);
      expect(getClankerAirdropV2Abi(base.id)).toBe(ClankerAirdropv2_v4_abi);
      expect(getClankerHookStaticFeeAbi(base.id)).toBe(ClankerHook_StaticFee_v4_abi);
      expect(getClankerUniV4EthDevBuyAbi(base.id)).toBe(ClankerUniV4EthDevBuy_v4_abi);
    });

    test('should return v4 ABIs for arbitrum', () => {
      expect(getClankerAbi(arbitrum.id)).toBe(Clanker_v4_abi);
      expect(getClankerTokenAbi(arbitrum.id)).toBe(ClankerToken_v4_abi);
      expect(getClankerVaultAbi(arbitrum.id)).toBe(ClankerVault_v4_abi);
      expect(getClankerFeeLockerAbi(arbitrum.id)).toBe(ClankerFeeLocker_abi);
    });
  });

  describe('ABI Differences', () => {
    test('mainnet ABIs should be different from v4 ABIs', () => {
      expect(ClankerToken_v4_1_mainnet_abi).not.toBe(ClankerToken_v4_abi);
    });

    test('mainnet ABIs should have different lengths (where applicable)', () => {
      // Some ABIs may have the same length but different content
      // We'll check the actual lengths and log them for verification
      console.log('ABI Lengths:');
      console.log(
        `Token: v4=${ClankerToken_v4_abi.length}, mainnet=${ClankerToken_v4_1_mainnet_abi.length}`
      );

      // At least some ABIs should have different lengths
      const hasDifferentLengths =
        Number(ClankerToken_v4_1_mainnet_abi.length) !== Number(ClankerToken_v4_abi.length);
      expect(hasDifferentLengths).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle unknown chain IDs by defaulting to v4 ABIs', () => {
      const unknownChainId = 999999;

      expect(getClankerAbi(unknownChainId)).toBe(Clanker_v4_abi);
      expect(getClankerTokenAbi(unknownChainId)).toBe(ClankerToken_v4_abi);
      expect(getClankerVaultAbi(unknownChainId)).toBe(ClankerVault_v4_abi);
      expect(getClankerFeeLockerAbi(unknownChainId)).toBe(ClankerFeeLocker_abi);
    });

    test('should handle zero chain ID by defaulting to v4 ABIs', () => {
      expect(getClankerAbi(0)).toBe(Clanker_v4_abi);
      expect(getClankerTokenAbi(0)).toBe(ClankerToken_v4_abi);
      expect(getClankerVaultAbi(0)).toBe(ClankerVault_v4_abi);
      expect(getClankerFeeLockerAbi(0)).toBe(ClankerFeeLocker_abi);
    });
  });

  describe('Consistency', () => {
    test('should return consistent results for the same chain ID', () => {
      const mainnetAbi1 = getClankerAbi(mainnet.id);
      const mainnetAbi2 = getClankerAbi(mainnet.id);
      const baseAbi1 = getClankerAbi(base.id);
      const baseAbi2 = getClankerAbi(base.id);

      expect(mainnetAbi1).toBe(mainnetAbi2);
      expect(baseAbi1).toBe(baseAbi2);
    });

    test('should return consistent results across all ABI functions for the same chain', () => {
      const mainnetChainId = mainnet.id;
      const baseChainId = base.id;

      // All mainnet ABIs should be mainnet versions

      expect(getClankerTokenAbi(mainnetChainId)).toBe(ClankerToken_v4_1_mainnet_abi);

      // All base ABIs should be v4 versions
      expect(getClankerAbi(baseChainId)).toBe(Clanker_v4_abi);
      expect(getClankerTokenAbi(baseChainId)).toBe(ClankerToken_v4_abi);
      expect(getClankerVaultAbi(baseChainId)).toBe(ClankerVault_v4_abi);
      expect(getClankerFeeLockerAbi(baseChainId)).toBe(ClankerFeeLocker_abi);
    });
  });
});
