import { ApiClient } from './api-client';
import {
  XPayConfig,
  PayoutRequest,
  PayoutResponse,
  CollectionRequest,
  CollectionResponse,
  OrderDetails,
  SupportedSymbol,
  WebhookEvent,
  WebhookNotifyType,
} from './types';
import { createHmac } from 'crypto';

/**
 * X-Pay SDK for Node.js
 * 
 * Official SDK for integrating with the X-Pay cryptocurrency payment gateway
 */
export class XPay {
  private client: ApiClient;
  private apiSecret: string;

  /**
   * Create a new XPay SDK instance
   * @param config - Configuration options
   */
  constructor(config: XPayConfig) {
    this.client = new ApiClient(config);
    this.apiSecret = config.apiSecret;
  }

  /**
   * Create a new payout order
   * @param request - Payout request data
   * @returns Payout response with order details
   */
  async createPayout(request: PayoutRequest): Promise<PayoutResponse> {
    const requestWithSignature = this.generateSignature(request);
    return this.client.post<PayoutResponse>('/v1/order/createPayout', requestWithSignature);
  }

  /**
   * Create a new collection order
   * @param request - Collection request data
   * @returns Collection response with order details
   */
  async createCollection(request: CollectionRequest): Promise<CollectionResponse> {
    const requestWithSignature = this.generateSignature(request);
    return this.client.post<CollectionResponse>('/v1/order/createCollection', requestWithSignature);
  }

  /**
   * Get order status by ID
   * @param orderId - Order ID
   * @returns Order details information
   */
  async getOrderStatus(orderId: string): Promise<OrderDetails> {
    return this.client.get<OrderDetails>(`/v1/order/status/${orderId}`);
  }

  /**
   * Get supported symbols
   * @param chain - Optional blockchain network
   * @param symbol - Optional symbol
   * @returns List of supported symbols
   */
  async getSupportedSymbols(chain?: string, symbol?: string): Promise<SupportedSymbol[]> {
    const params: Record<string, string> = {};
    if (chain) params.chain = chain;
    if (symbol) params.symbol = symbol;
    return this.client.get<SupportedSymbol[]>('/v1/symbol/supportSymbols', params);
  }

  /**
   * Generate a random nonce string
   * @returns Random nonce string
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate signature for request according to the API specification
   * @param params - Request parameters to sign
   * @returns Request object with signature, timestamp, nonce, and data
   */
  private generateSignature(params: any): Record<string, any> {
    // Generate timestamp and nonce
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = this.generateNonce();
    
    // Format the data parameter using the formatDataForSignature method
    const dataString = this.formatDataForSignature(params);
    
    // Build the signature string in the format: data={key=value, key=value}&nonce=xxx&timestamp=xxx
    const signatureString = `data={${dataString}}&nonce=${nonce}&timestamp=${timestamp}`;
    
    // Calculate HMAC-SHA256 signature
    const signature = createHmac('sha256', this.apiSecret)
      .update(signatureString)
      .digest('hex');
    
    // Return the request object with signature, timestamp, nonce, and data
    return {
      sign: signature,
      timestamp,
      nonce,
      data: params
    };
  }

  /**
   * Verify webhook signature to ensure it came from X-Pay
   * @param body - Raw webhook request body
   * @param signature - X-Signature header value or sign value from the webhook body
   * @param timestamp - X-Timestamp header value or timestamp value from the webhook body
   * @returns True if signature is valid
   */
  verifyWebhook(body: string, signature: string, timestamp: string | number): boolean {
    try {
      // Parse the webhook body to get the data
      const webhookData = JSON.parse(body);
      
      // For webhooks, the signature is already in the body as 'sign'
      // and we should use that to verify against our calculated signature
      const providedSignature = signature || webhookData.sign;
      const providedTimestamp = Number(timestamp || webhookData.timestamp);
      const providedNonce = webhookData.nonce;
      const notifyType = webhookData.notifyType;
      
      // Check if the timestamp is within 30 seconds
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTimestamp - providedTimestamp) > 30) {
        console.error('Webhook timestamp is too old (more than 30 seconds)');
        return false;
      }
      
      // Format the data parameter as a string in the format: key=value, key=value
      const dataString = this.formatDataForSignature(webhookData.data || {});
      
      // Build the signature string in the format: data={key=value, key=value}&nonce=xxx&notifyType=xxx&timestamp=xxx
      const signatureString = `data={${dataString}}&nonce=${providedNonce}&notifyType=${notifyType}&timestamp=${providedTimestamp}`;
      
      // Calculate HMAC-SHA256 signature
      const expectedSignature = createHmac('sha256', this.apiSecret)
        .update(signatureString)
        .digest('hex');
      
      return expectedSignature === providedSignature;
    } catch (error) {
      // If there's an error parsing the webhook body, fall back to the original method
      const message = `${timestamp}${body}`;
      const expectedSignature = createHmac('sha256', this.apiSecret)
        .update(message)
        .digest('hex');
      
      return expectedSignature === signature;
    }
  }
  
  /**
   * Format data object for signature calculation
   * @param data - Data object to format
   * @returns Formatted data string
   */
  private formatDataForSignature(data: Record<string, any>): string {
    return Object.entries(data)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle nested objects recursively
          if (Array.isArray(value)) {
            return `${key}=[${value.map(item => 
              typeof item === 'object' ? `{${this.formatDataForSignature(item)}}` : item
            ).join(', ')}]`;
          } else {
            return `${key}={${this.formatDataForSignature(value)}}`;
          }
        }
        
        // Preserve trailing zeros for numbers
        if (typeof value === 'number') {
          // Convert to string and check if it's a decimal number
          const strValue = value.toString();
          if (strValue.includes('.')) {
            // If the original value in the JSON had trailing zeros, preserve them
            // We need to check the original JSON string for this
            return `${key}=${strValue}`;
          }
        }
        
        return `${key}=${value}`;
      })
      .join(', ');
  }

  /**
   * Parse webhook event data
   * @param body - Webhook request body as string
   * @param signature - X-Signature header value or sign value from the webhook body
   * @param timestamp - X-Timestamp header value or timestamp value from the webhook body
   * @returns Parsed webhook event or null if invalid
   */
  parseWebhook(body: string, signature?: string, timestamp?: string | number): WebhookEvent | null {
    try {
      const webhookData = JSON.parse(body);
      
      // Use provided signature/timestamp or extract from webhook body
      const providedSignature = signature || webhookData.sign;
      const providedTimestamp = timestamp || webhookData.timestamp;
      
      if (!this.verifyWebhook(body, providedSignature, providedTimestamp)) {
        return null;
      }
      
      // Map the webhook data to our WebhookEvent interface
      return {
        sign: webhookData.sign,
        timestamp: webhookData.timestamp,
        nonce: webhookData.nonce,
        notifyType: webhookData.notifyType,
        data: webhookData.data
      } as WebhookEvent;
    } catch (error) {
      return null;
    }
  }
}