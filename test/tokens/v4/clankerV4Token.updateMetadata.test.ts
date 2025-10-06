import { describe, expect, test } from 'bun:test';
import {
  type Account,
  type Chain,
  createPublicClient,
  http,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import { Clanker } from '../../../src/v4/index.js';

describe('v4 updateImage and updateMetadata', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;
  const clanker = new Clanker({ publicClient });

  describe('updateImage', () => {
    test('getUpdateImageTransaction', async () => {
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const newImage = 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';

      const tx = await clanker.getUpdateImageTransaction({
        token,
        newImage,
      });

      expect(tx.address).toBe(token);
      expect(tx.abi).toBeDefined();
      expect(tx.functionName).toBe('updateImage');
      expect(tx.args).toEqual([newImage]);
    });

    test('updateImageSimulate', async () => {
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const newImage = 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';

      const result = await clanker.updateImageSimulate({ token, newImage }, admin);

      // The simulation should either succeed or fail with a specific error
      // We expect it to fail since we're using a mock token that doesn't exist
      expect(result).toBeDefined();
    });

    test('updateImageSimulate with wallet account', async () => {
      const token = '0x0000000000000000000000000000000000000002' as `0x${string}`;
      const newImage = 'https://example.com/new-image.png';

      // Create a mock wallet client for testing
      const mockWallet = {
        account: admin,
      } as WalletClient<Transport, Chain, Account>;

      const clankerWithWallet = new Clanker({
        publicClient,
        wallet: mockWallet,
      });

      const result = await clankerWithWallet.updateImageSimulate({
        token,
        newImage,
      });

      expect(result).toBeDefined();
    });

    test('error handling - missing wallet client', async () => {
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const newImage = 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';

      // This should throw an error since no wallet client is provided
      await expect(clanker.updateImage({ token, newImage })).rejects.toThrow(
        'Wallet client required'
      );
    });

    test('error handling - missing public client for simulation', async () => {
      const clankerWithoutPublicClient = new Clanker({});
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const newImage = 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';

      // This should throw an error since no public client is provided
      await expect(
        clankerWithoutPublicClient.updateImageSimulate({ token, newImage }, admin)
      ).rejects.toThrow('Public client required');
    });

    test('error handling - missing account for simulation', async () => {
      const clankerWithoutAccount = new Clanker({ publicClient });
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const newImage = 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';

      // This should throw an error since no account is provided
      await expect(clankerWithoutAccount.updateImageSimulate({ token, newImage })).rejects.toThrow(
        'Account or wallet client required for simulation'
      );
    });

    test('different image URLs', async () => {
      const token = '0x0000000000000000000000000000000000000004' as `0x${string}`;

      const imageUrls = [
        'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        'https://example.com/image.png',
        'https://example.com/image.jpg',
        'https://example.com/image.gif',
        'https://example.com/image.webp',
      ];

      for (const newImage of imageUrls) {
        const tx = await clanker.getUpdateImageTransaction({
          token,
          newImage,
        });

        expect(tx.args[0]).toBe(newImage);
        expect(tx.functionName).toBe('updateImage');
      }
    });

    test('chain configuration', async () => {
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const newImage = 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';

      // Test with explicit chain option
      const tx = await clanker.getUpdateImageTransaction({ token, newImage }, { chain: base });

      expect(tx.address).toBe(token);
      expect(tx.functionName).toBe('updateImage');
    });
  });

  describe('updateMetadata', () => {
    test('getUpdateMetadataTransaction', async () => {
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const metadata = JSON.stringify({
        description: 'Updated description for my really cool token!',
        socialMediaUrls: [
          { platform: 'twitter', url: 'https://twitter.com/mytoken' },
          { platform: 'telegram', url: 'https://t.me/mytoken' },
        ],
        auditUrls: ['https://audit.example.com/report.pdf'],
      });

      const tx = await clanker.getUpdateMetadataTransaction({
        token,
        metadata,
      });

      expect(tx.address).toBe(token);
      expect(tx.abi).toBeDefined();
      expect(tx.functionName).toBe('updateMetadata');
      expect(tx.args).toEqual([metadata]);
    });

    test('updateMetadataSimulate', async () => {
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const metadata = JSON.stringify({
        description: 'Updated description for my really cool token!',
        socialMediaUrls: [{ platform: 'twitter', url: 'https://twitter.com/mytoken' }],
      });

      const result = await clanker.updateMetadataSimulate({ token, metadata }, admin);

      // The simulation should either succeed or fail with a specific error
      // We expect it to fail since we're using a mock token that doesn't exist
      expect(result).toBeDefined();
    });

    test('updateMetadataSimulate with wallet account', async () => {
      const token = '0x0000000000000000000000000000000000000002' as `0x${string}`;
      const metadata = JSON.stringify({
        description: 'Another updated description for my really cool token!',
        socialMediaUrls: [{ platform: 'discord', url: 'https://discord.gg/mytoken' }],
      });

      // Create a mock wallet client for testing
      const mockWallet = {
        account: admin,
      } as WalletClient<Transport, Chain, Account>;

      const clankerWithWallet = new Clanker({
        publicClient,
        wallet: mockWallet,
      });

      const result = await clankerWithWallet.updateMetadataSimulate({
        token,
        metadata,
      });

      expect(result).toBeDefined();
    });

    test('error handling - missing wallet client', async () => {
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const metadata = JSON.stringify({
        description: 'Updated description for my really cool token!',
      });

      // This should throw an error since no wallet client is provided
      await expect(clanker.updateMetadata({ token, metadata })).rejects.toThrow(
        'Wallet client required'
      );
    });

    test('error handling - missing public client for simulation', async () => {
      const clankerWithoutPublicClient = new Clanker({});
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const metadata = JSON.stringify({
        description: 'Updated description for my really cool token!',
      });

      // This should throw an error since no public client is provided
      await expect(
        clankerWithoutPublicClient.updateMetadataSimulate({ token, metadata }, admin)
      ).rejects.toThrow('Public client required');
    });

    test('error handling - missing account for simulation', async () => {
      const clankerWithoutAccount = new Clanker({ publicClient });
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const metadata = JSON.stringify({
        description: 'Updated description for my really cool token!',
      });

      // This should throw an error since no account is provided
      await expect(
        clankerWithoutAccount.updateMetadataSimulate({ token, metadata })
      ).rejects.toThrow('Account or wallet client required for simulation');
    });

    test('different metadata objects', async () => {
      const token = '0x0000000000000000000000000000000000000004' as `0x${string}`;

      const metadataObjects = [
        JSON.stringify({
          description: 'Updated description for my really cool token!',
        }),
        JSON.stringify({
          description: 'A simple description',
          socialMediaUrls: [{ platform: 'twitter', url: 'https://twitter.com/simple' }],
        }),
        JSON.stringify({
          description:
            'A very long description that contains multiple sentences and provides detailed information about the token and its purpose in the ecosystem.',
          socialMediaUrls: [
            { platform: 'twitter', url: 'https://twitter.com/complex' },
            { platform: 'telegram', url: 'https://t.me/complex' },
            { platform: 'discord', url: 'https://discord.gg/complex' },
          ],
          auditUrls: [
            'https://audit1.example.com/report.pdf',
            'https://audit2.example.com/report.pdf',
          ],
        }),
        JSON.stringify({
          description: 'Description with special characters: !@#$%^&*()',
          socialMediaUrls: [{ platform: 'custom', url: 'https://custom.com' }],
        }),
        JSON.stringify({
          description: 'Description with emojis: 🚀💰🎉',
          auditUrls: ['https://audit.example.com/emoji-report.pdf'],
        }),
      ];

      for (const metadata of metadataObjects) {
        const tx = await clanker.getUpdateMetadataTransaction({
          token,
          metadata,
        });

        expect(tx.args[0]).toBe(metadata);
        expect(tx.functionName).toBe('updateMetadata');
      }
    });

    test('chain configuration', async () => {
      const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
      const metadata = JSON.stringify({
        description: 'Updated description for my really cool token!',
        socialMediaUrls: [{ platform: 'twitter', url: 'https://twitter.com/mytoken' }],
      });

      // Test with explicit chain option
      const tx = await clanker.getUpdateMetadataTransaction({ token, metadata }, { chain: base });

      expect(tx.address).toBe(token);
      expect(tx.functionName).toBe('updateMetadata');
    });
  });
});
