import { XPay } from './xpay';
import { ApiClient } from './api-client';
import { OrderStatus, WebhookNotifyType } from './types';

// Mock the ApiClient
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

jest.mock('./api-client', () => {
  return {
    ApiClient: jest.fn().mockImplementation(() => {
      return {
        get: mockGet,
        post: mockPost,
        put: mockPut,
        delete: mockDelete
      };
    })
  };
});

describe('XPay SDK', () => {
  let xpay: XPay;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new XPay instance with mock credentials
    xpay = new XPay({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
    });
  });
  
  describe('createPayout', () => {
    it('should create a payout successfully', async () => {
      // Mock the API response
      const mockPayout = {
        code: 200,
        msg: 'Success',
        data: {
          orderId: 'test-order-id',
          status: OrderStatus.PENDING,
          amount: '100',
          symbol: 'USDT',
          chain: 'TRON',
          uid: 'user123',
          receiveAddress: 'TXmVthgn6yT1kANGJHTHcbEGEKYDLLGJGp'
        }
      };
      
      // Set up the mock implementation
      mockPost.mockResolvedValueOnce(mockPayout);
      
      // Call the method
      const result = await xpay.createPayout({
        amount: 100,
        symbol: 'USDT',
        chain: 'TRON',
        orderId: 'order-123',
        uid: 'user123',
        receiveAddress: 'TXmVthgn6yT1kANGJHTHcbEGEKYDLLGJGp'
      });
      
      // Verify the result
      expect(result).toEqual(mockPayout);
      
      // Verify the API client was called correctly
      expect(mockPost).toHaveBeenCalledWith('/v1/order/createPayout', {
        amount: 100,
        symbol: 'USDT',
        chain: 'TRON',
        orderId: 'order-123',
        uid: 'user123',
        receiveAddress: 'TXmVthgn6yT1kANGJHTHcbEGEKYDLLGJGp'
      });
    });
    
    it('should handle API errors', async () => {
      // Mock an API error
      const errorMessage = 'Invalid symbol';
      mockPost.mockRejectedValueOnce(new Error(errorMessage));
      
      // Call the method and expect it to throw
      await expect(
        xpay.createPayout({
          amount: 100,
          symbol: 'INVALID',
          chain: 'TRON',
          orderId: 'order-123',
          uid: 'user123',
          receiveAddress: 'TXmVthgn6yT1kANGJHTHcbEGEKYDLLGJGp'
        })
      ).rejects.toThrow(errorMessage);
    });
  });
  
  describe('getOrderStatus', () => {
    it('should get order status successfully', async () => {
      // Mock the API response
      const mockOrderDetails = {
        code: 200,
        msg: 'Success',
        data: {
          orderId: 'test-order-id',
          orderType: 'PAYOUT',
          status: OrderStatus.SUCCESS,
          reason: null,
          transaction: {
            chain: 'TRON',
            symbol: 'USDT',
            blockNum: 73971843,
            txid: '938d4d20f049bfe45f429f1c3cb62de7c57d3f7505ae691b79aa9a024f23ef87',
            contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
            from: 'TGyjjt1esfqJWrPncpygq3QA43epY46V8D',
            to: 'TW8ArYLg5PuwYugmYM8QSux5oXxfUbXA8c',
            amount: '100.00000000',
            timestamp: 1752573867000,
            txGas: '27.35985',
            confirmedNum: 196573,
            status: 'SUCCESS'
          }
        }
      };
      
      // Set up the mock implementation
      mockGet.mockResolvedValueOnce(mockOrderDetails);
      
      // Call the method
      const result = await xpay.getOrderStatus('test-order-id');
      
      // Verify the result
      expect(result).toEqual(mockOrderDetails);
      
      // Verify the API client was called correctly
      expect(mockGet).toHaveBeenCalledWith('/v1/order/status/test-order-id');
    });
  });
  
  describe('verifyWebhook', () => {
    it('should verify a valid webhook signature', () => {
      // Create a test webhook payload
      const webhookData = {
        sign: 'test-signature',
        timestamp: Math.floor(Date.now() / 1000),
        nonce: 'test-nonce',
        notifyType: WebhookNotifyType.ORDER_SUCCESS,
        data: {
          orderId: 'test-order-id',
          orderType: 'PAYOUT',
          status: OrderStatus.SUCCESS,
          reason: null,
          transaction: {
            chain: 'TRON',
            symbol: 'USDT',
            blockNum: 73971843,
            txid: '938d4d20f049bfe45f429f1c3cb62de7c57d3f7505ae691b79aa9a024f23ef87',
            contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
            from: 'TGyjjt1esfqJWrPncpygq3QA43epY46V8D',
            to: 'TW8ArYLg5PuwYugmYM8QSux5oXxfUbXA8c',
            amount: 100,
            timestamp: 1752573867000,
            txGas: 27.35985,
            confirmedNum: 196573,
            status: 'SUCCESS'
          }
        }
      };
      
      const body = JSON.stringify(webhookData);
      
      // Mock the formatDataForSignature method to return a known string
      jest.spyOn(xpay as any, 'formatDataForSignature').mockReturnValueOnce('orderId=test-order-id, orderType=PAYOUT, status=SUCCESS');
      
      // Mock the createHmac to return a known signature
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('test-signature')
      };
      const crypto = require('crypto');
      jest.spyOn(crypto, 'createHmac').mockReturnValueOnce(mockHmac);
      
      // Verify the signature
      const isValid = xpay.verifyWebhook(body, 'test-signature', webhookData.timestamp);
      
      // It should be valid
      expect(isValid).toBe(true);
    });
    
    it('should reject an invalid webhook signature', () => {
      const body = JSON.stringify({ event: 'test' });
      const timestamp = '1690284600';
      const invalidSignature = 'invalid-signature';
      
      // Verify the signature
      const isValid = xpay.verifyWebhook(body, invalidSignature, timestamp);
      
      // It should be invalid
      expect(isValid).toBe(false);
    });
  });
  
  describe('parseWebhook', () => {
    it('should parse a valid webhook', () => {
      // Create a test webhook payload
      const webhookData = {
        sign: 'test-signature',
        timestamp: Math.floor(Date.now() / 1000),
        nonce: 'test-nonce',
        notifyType: WebhookNotifyType.ORDER_SUCCESS,
        data: {
          orderId: 'test-order-id',
          orderType: 'PAYOUT',
          status: OrderStatus.SUCCESS,
          reason: null,
          transaction: {
            chain: 'TRON',
            symbol: 'USDT',
            blockNum: 73971843,
            txid: '938d4d20f049bfe45f429f1c3cb62de7c57d3f7505ae691b79aa9a024f23ef87',
            contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
            from: 'TGyjjt1esfqJWrPncpygq3QA43epY46V8D',
            to: 'TW8ArYLg5PuwYugmYM8QSux5oXxfUbXA8c',
            amount: 100,
            timestamp: 1752573867000,
            txGas: 27.35985,
            confirmedNum: 196573,
            status: 'SUCCESS'
          }
        }
      };
      
      const body = JSON.stringify(webhookData);
      const timestamp = webhookData.timestamp.toString();
      
      // Mock the verifyWebhook method to return true
      jest.spyOn(xpay, 'verifyWebhook').mockReturnValueOnce(true);
      
      // Parse the webhook
      const result = xpay.parseWebhook(body, 'test-signature', timestamp);
      
      // It should return the parsed data
      expect(result).toEqual(webhookData);
      
      // Verify verifyWebhook was called correctly
      expect(xpay.verifyWebhook).toHaveBeenCalledWith(body, 'test-signature', timestamp);
    });
    
    it('should return null for an invalid webhook signature', () => {
      const body = JSON.stringify({ event: 'test' });
      const timestamp = '1690284600';
      
      // Mock the verifyWebhook method to return false
      jest.spyOn(xpay, 'verifyWebhook').mockReturnValueOnce(false);
      
      // Parse the webhook
      const result = xpay.parseWebhook(body, 'invalid-signature', timestamp);
      
      // It should return null
      expect(result).toBeNull();
    });
    
    it('should return null for invalid JSON', () => {
      const body = 'not-valid-json';
      const timestamp = '1690284600';
      
      // Mock the verifyWebhook method to return true
      jest.spyOn(xpay, 'verifyWebhook').mockReturnValueOnce(true);
      
      // Parse the webhook
      const result = xpay.parseWebhook(body, 'test-signature', timestamp);
      
      // It should return null
      expect(result).toBeNull();
    });
  });
});