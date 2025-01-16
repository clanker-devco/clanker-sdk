/// <reference types="jest" />

import type { AxiosInstance } from 'axios';
import { ClankerSDK } from '../ClankerSDK';
import type { DeployTokenOptions, DeployTokenWithSplitsOptions } from '../types';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
  })),
}));

describe('ClankerSDK', () => {
  let sdk: ClankerSDK;
  let mockApi: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    sdk = new ClankerSDK('test-api-key');
    // @ts-expect-error - accessing private property for testing
    mockApi = sdk.api;
  });

  describe('constructor', () => {
    it('should throw error if no API key provided', () => {
      expect(() => new ClankerSDK('')).toThrow('API key is required');
    });
  });

  describe('deployToken', () => {
    const mockOptions: DeployTokenOptions = {
      name: 'Test Token',
      symbol: 'TEST',
      image: 'https://example.com/image.png',
      requestorAddress: '0x1234567890123456789012345678901234567890',
    };

    it('should validate and send deploy token request', async () => {
      const mockResponse = { data: { id: 1 } };
      mockApi.post.mockResolvedValueOnce(mockResponse);

      await sdk.deployToken(mockOptions);

      expect(mockApi.post).toHaveBeenCalledWith('/tokens/deploy', expect.objectContaining({
        ...mockOptions,
        requestKey: expect.any(String),
      }));
    });

    it('should throw error for invalid address', async () => {
      await expect(sdk.deployToken({
        ...mockOptions,
        requestorAddress: 'invalid-address',
      })).rejects.toThrow('Invalid requestor address format');
    });
  });

  describe('getEstimatedUncollectedFees', () => {
    const validAddress = '0x1234567890123456789012345678901234567890';

    it('should fetch uncollected fees', async () => {
      const mockResponse = {
        data: {
          lockerAddress: validAddress,
          lpNftId: 1,
          token0UncollectedRewards: '100',
          token1UncollectedRewards: '200',
        },
      };
      mockApi.get.mockResolvedValueOnce(mockResponse);

      await sdk.getEstimatedUncollectedFees(validAddress);

      expect(mockApi.get).toHaveBeenCalledWith(
        `/get-estimated-uncollected-fees/${validAddress}`
      );
    });

    it('should throw error for invalid address', async () => {
      await expect(
        sdk.getEstimatedUncollectedFees('invalid-address')
      ).rejects.toThrow('Invalid contract address format');
    });
  });

  describe('deployTokenWithSplits', () => {
    const mockOptions: DeployTokenWithSplitsOptions = {
      name: 'Split Token',
      symbol: 'SPLT',
      image: 'https://example.com/image.png',
      requestorAddress: '0x1234567890123456789012345678901234567890',
      splitAddress: '0x1234567890123456789012345678901234567890',
    };

    it('should validate and send deploy token with splits request', async () => {
      const mockResponse = { data: { id: 1 } };
      mockApi.post.mockResolvedValueOnce(mockResponse);

      await sdk.deployTokenWithSplits(mockOptions);

      expect(mockApi.post).toHaveBeenCalledWith('/tokens/deploy/with-splits', expect.objectContaining({
        ...mockOptions,
        requestKey: expect.any(String),
      }));
    });

    it('should throw error for invalid split address', async () => {
      await expect(sdk.deployTokenWithSplits({
        ...mockOptions,
        splitAddress: 'invalid-address',
      })).rejects.toThrow('Invalid split address format');
    });
  });
}); 