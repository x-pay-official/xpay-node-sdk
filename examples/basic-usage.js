/**
 * X-Pay SDK Basic Usage Example
 * 
 * This example demonstrates how to use the X-Pay SDK to create payout and collection orders,
 * check order status, and handle webhook notifications.
 */

// In a real application, you would import from the package
// const { XPay } = require('xpay-sdk');
// For this example, we'll import from the local source
const { XPay } = require('../dist');

// Initialize the SDK with your API credentials
const xpay = new XPay({
  apiKey: '',
  apiSecret: '',
  // Use the production environment URL
  baseUrl: 'https://api.x-pay.fun',
});

// Example: Create a payout order (merchant sends crypto to user)
async function createPayoutExample() {
  try {
    console.log('Creating a new payout order...');
    
    const payout = await xpay.createPayout({
      amount: 100,
      symbol: 'USDT',
      chain: 'TRON',
      orderId: `order-${Date.now()}`, // Generate a unique order ID
      uid: 'user123', // Optional user ID
      receiveAddress: 'TXmVthgn6yT1kANGJHTHcbEGEKYDLLGJGp' // User's wallet address
    });
    
    console.log('Payout created successfully:');
    console.log('- Code:', payout.code);
    console.log('- Message:', payout.msg);
    
    if (payout.data) {
      console.log('- Order ID:', payout.data.orderId);
      console.log('- Status:', payout.data.status);
      console.log('- Amount:', payout.data.amount, payout.data.symbol);
      console.log('- Chain:', payout.data.chain);
      console.log('- Receiving Address:', payout.data.receiveAddress);
    }
    
    return payout;
  } catch (error) {
    console.error('Error creating payout:');
    console.error('- Message:', error.message);
    if (error.status) {
      console.error('- Status:', error.status);
      console.error('- Code:', error.code);
      console.error('- Data:', error.data);
    }
  }
}

// Example: Create a collection order (merchant receives crypto from user)
async function createCollectionExample() {
  try {
    console.log('Creating a new collection order...');
    
    const collection = await xpay.createCollection({
      amount: 50,
      symbol: 'USDT',
      chain: 'TRON',
      orderId: `order-${Date.now()}`, // Generate a unique order ID
      uid: 'user123', // Optional user ID
    });
    
    console.log('Collection created successfully:');
    console.log('- Code:', collection.code);
    console.log('- Message:', collection.msg);
    
    if (collection.data) {
      console.log('- Order ID:', collection.data.orderId);
      console.log('- Address:', collection.data.address);
      console.log('- Amount:', collection.data.amount, collection.data.symbol);
      console.log('- Chain:', collection.data.chain);
      console.log('- Expires at:', new Date(collection.data.expiredTime * 1000).toLocaleString());
    }
    
    return collection;
  } catch (error) {
    console.error('Error creating collection:');
    console.error('- Message:', error.message);
    if (error.status) {
      console.error('- Status:', error.status);
      console.error('- Code:', error.code);
      console.error('- Data:', error.data);
    }
  }
}

// Example: Check order status
async function checkOrderStatus(orderId) {
  try {
    console.log(`Checking status of order ${orderId}...`);
    
    const order = await xpay.getOrderStatus(orderId);
    
    console.log('Order details:');
    console.log('- Code:', order.code);
    console.log('- Message:', order.msg);
    
    if (order.data) {
      console.log('- Order ID:', order.data.orderId);
      console.log('- Order Type:', order.data.orderType);
      console.log('- Status:', order.data.status);
      
      // Transaction details
      if (order.data.transaction) {
        console.log('- Transaction:');
        console.log('  - Amount:', order.data.transaction.amount);
        console.log('  - To Address:', order.data.transaction.to);
        
        if (order.data.transaction.chain) {
          console.log('  - Chain:', order.data.transaction.chain);
        }
        
        if (order.data.transaction.symbol) {
          console.log('  - Symbol:', order.data.transaction.symbol);
        }
        
        if (order.data.transaction.txid) {
          console.log('  - Transaction Hash:', order.data.transaction.txid);
        }
        
        console.log('  - Confirmations:', order.data.transaction.confirmedNum);
      }
    }
    
    return order;
  } catch (error) {
    console.error('Error checking order status:', error.message);
  }
}

// Example: Get supported symbols
async function getSupportedSymbols() {
  try {
    console.log('Getting supported symbols...');
    
    const symbols = await xpay.getSupportedSymbols();
    
    console.log('Supported symbols:');
    symbols?.data?.forEach(symbol => {
      console.log(`- ${symbol.symbol} on ${symbol.chain} (decimals: ${symbol.decimals})`);
      if (symbol.contract) {
        console.log(`  Contract: ${symbol.contract}`);
      }
      if (symbol.minAmount) {
        console.log(`  Min: ${symbol.minAmount}, Max: ${symbol.maxAmount || 'unlimited'}`);
      }
    });
    
    return symbols;
  } catch (error) {
    console.error('Error getting supported symbols:', error.message);
  }
}

// Example: Process webhook
function processWebhook(body, signature, timestamp) {
  console.log('Processing webhook...');
  
  const event = xpay.parseWebhook(body, signature, timestamp);
  
  if (!event) {
    console.error('Invalid webhook signature');
    return null;
  }
  
  console.log('Webhook verified successfully');
  console.log('- Notify Type:', event.notifyType);
  console.log('- Timestamp:', event.timestamp);
  
  // Handle different notification types
  if (event.notifyType.startsWith('ORDER_')) {
    // Order-related notifications
    switch (event.notifyType) {
      case 'ORDER_PENDING':
        console.log('Order is pending');
        break;
      case 'ORDER_PENDING_CONFIRMATION':
        console.log('Order is pending confirmation');
        break;
      case 'ORDER_SUCCESS':
        console.log('Order has been completed successfully');
        console.log('- Order ID:', event.data.orderId);
        console.log('- Order Type:', event.data.orderType);
        console.log('- Status:', event.data.status);
        break;
      case 'ORDER_FAILED':
        console.log('Order has failed');
        break;
      case 'ORDER_EXPIRED':
        console.log('Order has expired');
        break;
      default:
        console.log('Unhandled order notification type');
    }
  } else if (event.notifyType.startsWith('COLLECT_')) {
    // Collection-related notifications
    switch (event.notifyType) {
      case 'COLLECT_PENDING':
        console.log('Collection is pending');
        break;
      case 'COLLECT_SUCCESS':
        console.log('Collection has been completed successfully');
        console.log('- Collected Amount:', event.data.collectAmount);
        console.log('- Fee:', event.data.fee);
        console.log('- Fee Ratio:', event.data.feeRatio);
        break;
      case 'COLLECT_FAILED':
        console.log('Collection has failed');
        break;
      default:
        console.log('Unhandled collection notification type');
    }
  } else {
    console.log('Unknown notification type');
  }
  
  // Log transaction details if available
  if (event.data.transaction) {
    console.log('- Transaction:');
    console.log('  - Chain:', event.data.transaction.chain);
    console.log('  - Symbol:', event.data.transaction.symbol);
    console.log('  - Amount:', event.data.transaction.amount);
    console.log('  - From:', event.data.transaction.from);
    console.log('  - To:', event.data.transaction.to);
    console.log('  - Tx Hash:', event.data.transaction.txid);
    console.log('  - Block Number:', event.data.transaction.blockNum);
    console.log('  - Confirmations:', event.data.transaction.confirmedNum);
    console.log('  - Status:', event.data.transaction.status);
  }
  
  return event;
}

// Example: Test webhook processing
function testWebhook() {
  console.log('\nTesting webhook processing...');
  
  // Example 1: ORDER_SUCCESS webhook
  console.log('\n=== Example 1: ORDER_SUCCESS Webhook ===');
  const orderWebhookBody = JSON.stringify({"sign":"8bd2b33a50733f9fdf0214341eec132a6912338e1bc93be10244defe1780b287","timestamp":1753429736,"nonce":"c96dcec92d494906b95baf542c71ec61","notifyType":"ORDER_SUCCESS","data":{"orderId":"20240101111111011","orderType":"COLLECTION","reason":null,"status":"SUCCESS","transaction":{"chain":"TRON","symbol":"USDT","blockNum":73971843,"txid":"938d4d20f049bfe45f429f1c3cb62de7c57d3f7505ae691b79aa9a024f23ef87","contractAddress":"TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t","from":"TGyjjt1esfqJWrPncpygq3QA43epY46V8D","to":"TW8ArYLg5PuwYugmYM8QSux5oXxfUbXA8c","amount":1.5,"timestamp":1752573867000,"txGas":27.35985,"confirmedNum":196573,"status":"SUCCESS"}}});
  
  // Parse the webhook body to get the components
  const orderWebhookData = JSON.parse(orderWebhookBody);
  const orderSignature = orderWebhookData.sign;
  const orderTimestamp = orderWebhookData.timestamp.toString();
  
  console.log('ORDER_SUCCESS Webhook payload:', orderWebhookData);
  
  // Process the ORDER_SUCCESS webhook
  const orderEvent = processWebhook(orderWebhookBody, orderSignature, orderTimestamp);
  
  if (orderEvent) {
    console.log('\nORDER_SUCCESS webhook processed successfully!');
    
    // In a real application, you would update your database, notify users, etc.
    console.log('\nOrder completed successfully! You should:');
    console.log('1. Update the order status in your database');
    console.log('2. Notify the user that their payment was successful');
    console.log('3. Deliver the purchased goods or services');
  }
  
  // Example 2: COLLECT_SUCCESS webhook
  console.log('\n=== Example 2: COLLECT_SUCCESS Webhook ===');
  const collectWebhookBody = JSON.stringify({"sign":"e4a909d64a342c73161d05843cdde356b434df3777bc225a1cfb27e7a59df85b","timestamp":1753429382,"nonce":"592d64ff364244bca7ec92384dad09d8","notifyType":"COLLECT_SUCCESS","data":{"collectAmount":3.555057,"fee":0.017775,"feeRatio":0.5,"reason":null,"transaction":{"chain":"TRON","symbol":"TRX","blockNum":74167604,"txid":"676ac25e8627a231d9d699cbb8f4df30f71127d0e0640674629cab23d90e17f7","contractAddress":null,"from":"TW8ArYLg5PuwYugmYM8QSux5oXxfUbXA8c","to":"TCyFHUZg2Y373uCYyx6QVbQJc4LZeaDre1","amount":3.537281,"timestamp":1753161312000,"txGas":0,"confirmedNum":648,"status":"SUCCESS"}}});
  
  // Parse the webhook body to get the components
  const collectWebhookData = JSON.parse(collectWebhookBody);
  const collectSignature = collectWebhookData.sign;
  const collectTimestamp = collectWebhookData.timestamp.toString();
  
  console.log('COLLECT_SUCCESS Webhook payload:', collectWebhookData);
  
  // Process the COLLECT_SUCCESS webhook
  const collectEvent = processWebhook(collectWebhookBody, collectSignature, collectTimestamp);
  
  if (collectEvent) {
    console.log('\nCOLLECT_SUCCESS webhook processed successfully!');
    
    // In a real application, you would update your database, notify users, etc.
    console.log('\nCollection completed successfully! You should:');
    console.log('1. Update your balance in the database');
    console.log('2. Record the transaction details for accounting');
    console.log('3. Notify your finance team about the received funds');
  }
}

// Run the examples
async function runExamples() {
  // Create a payout order
  const payout = await createPayoutExample();
  
  // Create a collection order
  const collection = await createCollectionExample();
  
  // Check order status if we have an order ID
  if (payout && payout.data && payout.data.orderId) {
    await checkOrderStatus('order-1753380643035');
  } else if (collection && collection.data && collection.data.orderId) {
    await checkOrderStatus(collection.data.orderId);
  }
  
  // Get supported symbols
  await getSupportedSymbols();
  
  // Test webhook processing
  testWebhook();
  
  console.log('\nAll examples completed!');
}

runExamples().catch(console.error);
