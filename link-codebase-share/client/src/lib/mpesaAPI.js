import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Initialize M-Pesa payment
export const initiateMpesaPayment = async (paymentData) => {
  try {
    console.log('🔥 Initiating M-Pesa payment:', paymentData);
    
    const initiateMpesa = httpsCallable(functions, 'initiateMpesaPayment');
    const result = await initiateMpesa(paymentData);
    
    console.log('✅ M-Pesa payment initiated:', result.data);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('❌ M-Pesa payment error:', error);
    return { success: false, error: error.message };
  }
};

// Query M-Pesa payment status
export const queryMpesaPayment = async (checkoutRequestId) => {
  try {
    console.log('🔍 Querying M-Pesa payment status:', checkoutRequestId);
    
    const queryMpesa = httpsCallable(functions, 'queryMpesaPayment');
    const result = await queryMpesa({ checkoutRequestId });
    
    console.log('✅ M-Pesa payment status:', result.data);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('❌ M-Pesa query error:', error);
    return { success: false, error: error.message };
  }
};

// Simulate M-Pesa STK Push for demo/testing
export const simulateMpesaPayment = async (paymentData) => {
  return new Promise((resolve) => {
    console.log('🧪 Simulating M-Pesa STK Push for demo:', paymentData);
    
    // Simulate the flow
    setTimeout(() => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: 'STK Push sent successfully',
          checkoutRequestId: 'ws_CO_' + Date.now(),
          merchantRequestId: 'ws_MR_' + Date.now()
        }
      };
      
      resolve(mockResponse);
    }, 1000);
  });
};

// Simulate payment completion for demo
export const simulatePaymentCompletion = async (checkoutRequestId) => {
  return new Promise((resolve) => {
    console.log('🧪 Simulating payment completion for:', checkoutRequestId);
    
    setTimeout(() => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          status: 'completed',
          resultDesc: 'The service request is processed successfully.',
          mpesaReceiptNumber: 'MP' + Date.now()
        }
      };
      
      resolve(mockResponse);
    }, 2000);
  });
};

// Format phone number for M-Pesa
export const formatPhoneNumber = (phone) => {
  let formatted = phone.toString().replace(/\s+/g, '');
  
  // Remove country code prefix
  if (formatted.startsWith('+254')) {
    formatted = formatted.substring(4);
  } else if (formatted.startsWith('254')) {
    formatted = formatted.substring(3);
  }
  
  // Remove leading zero
  if (formatted.startsWith('0')) {
    formatted = formatted.substring(1);
  }
  
  // Add Kenya country code
  return '254' + formatted;
};

// Validate phone number
export const validatePhoneNumber = (phone) => {
  const formatted = formatPhoneNumber(phone);
  const kenyaMobileRegex = /^254[17]\d{8}$/;
  return kenyaMobileRegex.test(formatted);
};

// Generate account reference
export const generateAccountReference = (tenantId, propertyId) => {
  return `RENT-${tenantId.substring(0, 8)}-${propertyId?.substring(0, 8) || 'PROP'}`;
};

export const mpesaAPI = {
  initiate: initiateMpesaPayment,
  query: queryMpesaPayment,
  simulate: simulateMpesaPayment,
  simulateCompletion: simulatePaymentCompletion,
  formatPhone: formatPhoneNumber,
  validatePhone: validatePhoneNumber,
  generateReference: generateAccountReference
};
