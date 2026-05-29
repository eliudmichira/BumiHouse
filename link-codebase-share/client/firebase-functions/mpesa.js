const functions = require('firebase-functions');
const admin = require('firebase-admin');
const https = require('https');

// M-Pesa API Configuration
const MPESA_CONFIG = {
  consumerKey: functions.config().mpesa?.consumer_key || 'your_consumer_key',
  consumerSecret: functions.config().mpesa?.consumer_secret || 'your_consumer_secret',
  shortCode: functions.config().mpesa?.short_code || '174379', // Test shortcode
  passkey: functions.config().mpesa?.passkey || 'your_passkey',
  environment: functions.config().mpesa?.environment || 'sandbox' // 'sandbox' or 'live'
};

const MPESA_URLS = {
  sandbox: {
    oauth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    stkQuery: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
  },
  live: {
    oauth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    stkQuery: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
  }
};

// Get OAuth token from M-Pesa
const getMpesaToken = async () => {
  const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
  const url = MPESA_URLS[MPESA_CONFIG.environment].oauth;
  
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('Failed to get M-Pesa token'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

// Generate timestamp for M-Pesa
const getTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
};

// Generate password for M-Pesa
const generatePassword = (timestamp) => {
  const data = `${MPESA_CONFIG.shortCode}${MPESA_CONFIG.passkey}${timestamp}`;
  return Buffer.from(data).toString('base64');
};

// Initiate STK Push
exports.initiateMpesaPayment = functions.https.onCall(async (data, context) => {
  try {
    console.log('🔥 Initiating M-Pesa payment:', data);

    const { phoneNumber, amount, accountReference, transactionDesc, tenantId, propertyId } = data;

    // Validate input
    if (!phoneNumber || !amount || !tenantId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phoneNumber.toString();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Get M-Pesa access token
    const accessToken = await getMpesaToken();
    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);

    // Prepare STK Push request
    const stkRequest = {
      BusinessShortCode: MPESA_CONFIG.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount), // Ensure integer
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/mpesaCallback`,
      AccountReference: accountReference || `RENT-${tenantId}`,
      TransactionDesc: transactionDesc || 'Rent Payment via CRIBBY'
    };

    console.log('📱 STK Push request:', stkRequest);

    // Make STK Push request
    const response = await makeHttpsRequest(
      MPESA_URLS[MPESA_CONFIG.environment].stkPush,
      'POST',
      stkRequest,
      {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    );

    console.log('📱 STK Push response:', response);

    if (response.ResponseCode === '0') {
      // Save payment initiation to Firestore
      const paymentDoc = {
        tenantId,
        propertyId,
        amount: Math.round(amount),
        phoneNumber: formattedPhone,
        checkoutRequestId: response.CheckoutRequestID,
        merchantRequestId: response.MerchantRequestID,
        status: 'pending',
        initiatedAt: admin.firestore.FieldValue.serverTimestamp(),
        accountReference: accountReference || `RENT-${tenantId}`,
        transactionDesc: transactionDesc || 'Rent Payment via CRIBBY'
      };

      await admin.firestore()
        .collection('mpesaPayments')
        .doc(response.CheckoutRequestID)
        .set(paymentDoc);

      return {
        success: true,
        message: 'STK Push sent successfully',
        checkoutRequestId: response.CheckoutRequestID,
        merchantRequestId: response.MerchantRequestID
      };
    } else {
      throw new functions.https.HttpsError('internal', `M-Pesa error: ${response.errorMessage || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('❌ M-Pesa payment error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// M-Pesa callback handler
exports.mpesaCallback = functions.https.onRequest(async (req, res) => {
  try {
    console.log('📞 M-Pesa callback received:', JSON.stringify(req.body, null, 2));

    const callbackData = req.body;
    
    if (!callbackData.Body || !callbackData.Body.stkCallback) {
      console.error('❌ Invalid callback data structure');
      return res.status(400).json({ error: 'Invalid callback data' });
    }

    const stkCallback = callbackData.Body.stkCallback;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    // Update payment status in Firestore
    const paymentRef = admin.firestore().collection('mpesaPayments').doc(checkoutRequestId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      console.error('❌ Payment document not found:', checkoutRequestId);
      return res.status(404).json({ error: 'Payment not found' });
    }

    const updateData = {
      resultCode,
      resultDesc: stkCallback.ResultDesc,
      callbackProcessedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata;
      const items = callbackMetadata.Item;

      const mpesaReceiptNumber = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = items.find(item => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = items.find(item => item.Name === 'PhoneNumber')?.Value;

      updateData.status = 'completed';
      updateData.mpesaReceiptNumber = mpesaReceiptNumber;
      updateData.transactionDate = transactionDate;
      updateData.phoneNumber = phoneNumber;

      console.log('✅ Payment successful:', {
        checkoutRequestId,
        mpesaReceiptNumber,
        transactionDate
      });

      // Update tenant payment history and landlord dashboard
      const paymentData = paymentDoc.data();
      await updateTenantPaymentHistory(paymentData, {
        mpesaReceiptNumber,
        transactionDate,
        phoneNumber
      });

    } else {
      // Payment failed
      updateData.status = 'failed';
      console.log('❌ Payment failed:', {
        checkoutRequestId,
        resultCode,
        resultDesc: stkCallback.ResultDesc
      });
    }

    // Update payment document
    await paymentRef.update(updateData);

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Callback processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update tenant payment history
const updateTenantPaymentHistory = async (paymentData, mpesaDetails) => {
  try {
    const { tenantId, propertyId, amount } = paymentData;

    // Add to tenant payment history
    const paymentRecord = {
      id: mpesaDetails.mpesaReceiptNumber,
      amount,
      date: new Date().toISOString(),
      method: 'M-Pesa',
      reference: mpesaDetails.mpesaReceiptNumber,
      status: 'completed',
      transactionDate: mpesaDetails.transactionDate,
      phoneNumber: mpesaDetails.phoneNumber
    };

    // Update trial tenant data if it's a trial payment
    if (tenantId.startsWith('trial_')) {
      // For trial payments, we'll store in a separate collection
      await admin.firestore()
        .collection('trialPayments')
        .doc(mpesaDetails.mpesaReceiptNumber)
        .set({
          ...paymentRecord,
          tenantId,
          propertyId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } else {
      // For real tenants, update the tenant document
      await admin.firestore()
        .collection('tenants')
        .doc(tenantId)
        .update({
          lastPayment: admin.firestore.FieldValue.serverTimestamp(),
          paymentHistory: admin.firestore.FieldValue.arrayUnion(paymentRecord),
          balance: admin.firestore.FieldValue.increment(-amount)
        });
    }

    console.log('✅ Tenant payment history updated');

  } catch (error) {
    console.error('❌ Error updating tenant payment history:', error);
  }
};

// Helper function for HTTPS requests
const makeHttpsRequest = (url, method, data, headers) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method,
      headers: {
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Query STK Push status
exports.queryMpesaPayment = functions.https.onCall(async (data, context) => {
  try {
    const { checkoutRequestId } = data;

    if (!checkoutRequestId) {
      throw new functions.https.HttpsError('invalid-argument', 'Checkout request ID is required');
    }

    // Get payment document from Firestore
    const paymentDoc = await admin.firestore()
      .collection('mpesaPayments')
      .doc(checkoutRequestId)
      .get();

    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    const paymentData = paymentDoc.data();
    
    // If we already have a final status, return it
    if (paymentData.status === 'completed' || paymentData.status === 'failed') {
      return {
        success: true,
        status: paymentData.status,
        resultDesc: paymentData.resultDesc,
        mpesaReceiptNumber: paymentData.mpesaReceiptNumber
      };
    }

    // Otherwise, query M-Pesa API for status
    const accessToken = await getMpesaToken();
    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);

    const queryRequest = {
      BusinessShortCode: MPESA_CONFIG.shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    const response = await makeHttpsRequest(
      MPESA_URLS[MPESA_CONFIG.environment].stkQuery,
      'POST',
      queryRequest,
      {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    );

    return {
      success: true,
      status: response.ResultCode === '0' ? 'completed' : 'pending',
      resultDesc: response.ResultDesc
    };

  } catch (error) {
    console.error('❌ M-Pesa query error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
