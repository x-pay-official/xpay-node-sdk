# X-Pay Node.js SDK

Official Node.js SDK for the X-Pay cryptocurrency payment gateway.

## Installation

```bash
npm install xpay-sdk
# or
yarn add xpay-sdk
```

## Features

- Create cryptocurrency payout orders (merchant sends crypto to user)
- Create cryptocurrency collection orders (merchant receives crypto from user)
- Check order status
- Get supported cryptocurrencies and chains
- Verify and parse webhook notifications
- TypeScript support with full type definitions

## Quick Start

```typescript
import { XPay } from 'xpay-sdk';

// Initialize the SDK with your API credentials
const xpay = new XPay({
  apiKey: 'your-api-token',
  apiSecret: 'your-api-secret',
  baseUrl: 'https://api.x-pay.fun', // Optional, defaults to production API
});

// Create a payout order (merchant sends crypto to user)
async function createPayout() {
  try {
    const payout = await xpay.createPayout({
      amount: 100,
      symbol: 'USDT',
      chain: 'TRON',
      orderId: `order-${Date.now()}`, // Optional order ID
      uid: 'user123', // Required user ID
      receiveAddress: 'TXmVthgn6yT1kANGJHTHcbEGEKYDLLGJGp' // User's wallet address
    });
    
    console.log('Payout created successfully:');
    console.log('- Code:', payout.code);
    console.log('- Message:', payout.msg);
    console.log('- Order ID:', payout.data?.orderId);
    
    return payout;
  } catch (error) {
    console.error('Error creating payout:', error);
  }
}
```

## API Reference

### Configuration

```typescript
const xpay = new XPay({
  apiKey: 'your-api-token',
  apiSecret: 'your-api-secret',
  baseUrl: 'https://api.x-pay.fun', // Optional, defaults to production API
  timeout: 30000, // Optional, request timeout in milliseconds
});
```

### Payout Orders

#### Create a payout order (merchant sends crypto to user)

```typescript
const payout = await xpay.createPayout({
  amount: 100,
  symbol: 'USDT',
  chain: 'TRON',
  orderId: 'order-123', // Optional order ID
  uid: 'user123', // Required user ID
  receiveAddress: 'TXmVthgn6yT1kANGJHTHcbEGEKYDLLGJGp' // User's wallet address
});

// Response structure
{
  code: 200,
  msg: 'Success',
  data: {
    orderId: 'order-123',
    status: 'PENDING',
    amount: '100.00000000',
    symbol: 'USDT',
    chain: 'TRON',
    uid: 'user123',
    receiveAddress: 'TXmVthgn6yT1kANGJHTHcbEGEKYDLLGJGp'
  }
}
```

### Collection Orders

#### Create a collection order (merchant receives crypto from user)

```typescript
const collection = await xpay.createCollection({
  amount: 50,
  symbol: 'USDT',
  chain: 'TRON',
  orderId: 'order-123', // Optional order ID
  uid: 'user123', // Required user ID
});

// Response structure
{
  code: 200,
  msg: 'Success',
  data: {
    orderId: 'order-123',
    address: 'TW8ArYLg5PuwYugmYM8QSux5oXxfUbXA8c',
    amount: '50.00000000',
    symbol: 'USDT',
    chain: 'TRON',
    uid: 'user123',
    expiredTime: 1753380643035
  }
}
```

### Order Status

#### Get order status

```typescript
const orderDetails = await xpay.getOrderStatus('order-123');

// Response structure
{
  code: 200,
  msg: 'Success',
  data: {
    orderId: 'order-123',
    orderType: 'PAYOUT',
    status: 'SUCCESS',
    reason: '',
    transaction: {
      chain: 'TRON',
      symbol: 'USDT',
      blockNum: 73971843,
      txid: '938d4d20f049bfe45f429f1c3cb62de7c57d3f7505ae691b79aa9a024f23ef87',
      contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      from: 'TGyjjt1esfqJWrPncpygq3QA43epY46V8D',
      to: 'TXmVthgn6yT1kANGJHTHcbEGEKYDLLGJGp',
      amount: '100.00000000',
      timestamp: 1752573867000,
      txGas: 27.35985,
      confirmedNum: 196573,
      status: 'SUCCESS'
    }
  }
}
```

### Supported Symbols

#### Get supported symbols

```typescript
// Get all supported symbols
const allSymbols = await xpay.getSupportedSymbols();

// Response structure
{
  code: 200,
  msg: 'Success',
  data: [
    {
      symbol: 'USDT',
      chain: 'TRON',
      decimals: 6,
      contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      minAmount: 1,
      maxAmount: 100000
    },
    // Other supported symbols...
  ]
}
```

### Webhooks

#### Verify and parse webhook

```typescript
// Express.js example
app.post('/webhook', express.json(), (req, res) => {
  const webhookData = req.body;
  const signature = webhookData.sign;
  const timestamp = webhookData.timestamp.toString();
  const body = JSON.stringify(webhookData);
  
  const event = xpay.parseWebhook(body, signature, timestamp);
  
  if (!event) {
    return res.status(400).send('Invalid webhook signature or timestamp expired');
  }
  
  // Process the webhook event
  switch (event.notifyType) {
    case 'ORDER_SUCCESS':
      // Handle order success notification
      const orderData = event.data;
      console.log(`Order ${orderData.orderId} completed successfully!`);
      break;
    case 'COLLECT_SUCCESS':
      // Handle collection success notification
      const collectData = event.data;
      console.log(`Collection completed successfully! Amount: ${collectData.collectAmount}`);
      break;
    // Handle other notification types...
  }
  
  res.status(200).send('Webhook received');
});
```

## Error Handling

The SDK throws detailed errors that include status codes and error messages from the API:

```typescript
try {
  const payout = await xpay.createPayout({
    // ...payout details
  });
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error(`Status: ${error.status}`);
  console.error(`Code: ${error.code}`);
  console.error(`Data: ${JSON.stringify(error.data)}`);
}
```

## TypeScript Support

This SDK includes comprehensive TypeScript definitions for all methods and data structures.

## License

MIT
