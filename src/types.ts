/**
 * X-Pay SDK Types
 */

export interface XPayConfig {
  /** API Key for authentication */
  apiKey: string;
  /** API Secret for authentication */
  apiSecret: string;
  /** Base URL for API requests */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Payout Request - Merchant initiates a payout via API
 */
export interface PayoutRequest {
  /** Payment amount */
  amount: number;
  /** Currency symbol (e.g., USDT) */
  symbol: string;
  /** Blockchain network (e.g., TRON, ETH, BTC) */
  chain: string;
  /** Your internal order ID */
  orderId: string;
  /** User ID */
  uid?: string;
  /** Receiving address */
  receiveAddress?: string;
}

/**
 * Payout Response
 */
export interface PayoutResponse {
  /** Response code */
  code: number;
  /** Response message */
  msg: string;
  /** Response data */
  data?: {
    /** Order ID */
    orderId: string;
    /** Order status */
    status: OrderStatus;
    /** Payment amount */
    amount: string;
    /** Currency symbol */
    symbol: string;
    /** Blockchain network */
    chain: string;
    /** User ID */
    uid: string;
    /** Receiving address */
    receiveAddress: string;
    /** Other order details */
    [key: string]: any;
  };
}

/**
 * Collection Request - Merchant initiates a collection via API
 */
export interface CollectionRequest {
  /** Payment amount */
  amount: number;
  /** Currency symbol (e.g., USDT) */
  symbol: string;
  /** Blockchain network (e.g., TRON, ETH, BTC) */
  chain: string;
  /** Your internal order ID */
  orderId: string;
  /** User ID */
  uid?: string;
}

/**
 * Collection Response
 */
export interface CollectionResponse {
  /** Response code */
  code: number;
  /** Response message */
  msg: string;
  /** Response data */
  data?: {
    /** Payment address */
    address: string;
    /** Payment amount */
    amount: string;
    /** Currency symbol */
    symbol: string;
    /** Blockchain network */
    chain: string;
    /** User ID */
    uid: string;
    /** Order ID */
    orderId: string;
    /** Expiration time */
    expiredTime: number;
  };
}

/**
 * Order Details
 */
export interface OrderDetails {
  /** Response code */
  code: number;
  /** Response message */
  msg: string;
  /** Order data */
  data?: {
    /** Order ID */
    orderId: string;
    /** Order type */
    orderType: string;
    /** Order status */
    status: OrderStatus;
    /** Reason for failure (if any) */
    reason?: string;
    /** Transaction details */
    transaction: {
      /** Blockchain network */
      chain: string | null;
      /** Currency symbol */
      symbol: string | null;
      /** Block number */
      blockNum: number | null;
      /** Transaction ID */
      txid: string | null;
      /** Contract address */
      contractAddress: string | null;
      /** From address */
      from: string | null;
      /** To address */
      to: string | null;
      /** Amount */
      amount: string;
      /** Transaction timestamp */
      timestamp: number | null;
      /** Gas fee */
      txGas: string | null;
      /** Number of confirmations */
      confirmedNum: number;
      /** Transaction status */
      status: string | null;
    };
  };
}

/**
 * Supported Symbol
 */
export interface SupportedSymbol {
  /** Symbol name (e.g., USDT) */
  symbol: string;
  /** Blockchain network (e.g., TRON) */
  chain: string;
  /** Decimal places */
  decimals: number;
  /** Contract address */
  contract?: string;
  /** Minimum amount */
  minAmount?: number;
  /** Maximum amount */
  maxAmount?: number;
}

/**
 * Webhook Event
 */
export interface WebhookEvent {
  /** Signature for verification */
  sign: string;
  /** Timestamp of the event */
  timestamp: number;
  /** Nonce for signature verification */
  nonce: string;
  /** Notification type */
  notifyType: WebhookNotifyType;
  /** Event data */
  data: OrderWebhookData | CollectWebhookData;
}

/**
 * Order Webhook Data
 */
export interface OrderWebhookData {
  /** Order ID */
  orderId: string;
  /** Order type */
  orderType: string;
  /** Order status */
  status: OrderStatus;
  /** Reason for failure (if any) */
  reason?: string;
  /** Transaction details */
  transaction: WebhookTransaction;
}

/**
 * Collect Webhook Data
 */
export interface CollectWebhookData {
  /** Collected amount */
  collectAmount: number;
  /** Fee amount */
  fee: number;
  /** Fee ratio */
  feeRatio: number;
  /** Reason for failure (if any) */
  reason?: string;
  /** Transaction details */
  transaction: WebhookTransaction;
}

/**
 * Webhook Transaction Details
 */
export interface WebhookTransaction {
  /** Blockchain network */
  chain: string;
  /** Currency symbol */
  symbol: string;
  /** Block number */
  blockNum: number;
  /** Transaction ID */
  txid: string;
  /** Contract address */
  contractAddress?: string;
  /** From address */
  from: string;
  /** To address */
  to: string;
  /** Amount */
  amount: number;
  /** Transaction timestamp */
  timestamp: number;
  /** Gas fee */
  txGas: number;
  /** Number of confirmations */
  confirmedNum: number;
  /** Transaction status */
  status: string;
}

/**
 * Order Status
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  SUCCESS = 'SUCCESS',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED'
}

/**
 * Order Type
 */
export enum OrderType {
  PAYOUT = 'PAYOUT',
  COLLECTION = 'COLLECTION'
}

/**
 * Webhook Notification Types
 */
export enum WebhookNotifyType {
  ORDER_PENDING = 'ORDER_PENDING',
  ORDER_PENDING_CONFIRMATION = 'ORDER_PENDING_CONFIRMATION',
  ORDER_SUCCESS = 'ORDER_SUCCESS',
  ORDER_FAILED = 'ORDER_FAILED',
  ORDER_EXPIRED = 'ORDER_EXPIRED',
  COLLECT_PENDING = 'COLLECT_PENDING',
  COLLECT_SUCCESS = 'COLLECT_SUCCESS',
  COLLECT_FAILED = 'COLLECT_FAILED'
}

/**
 * Error Response
 */
export interface ErrorResponse {
  /** Success status */
  success: false;
  /** Error code */
  code: number;
  /** Error message */
  message: string;
  /** Additional error details */
  data?: any;
}
