// backend/quick-test-token.js
/**
 * Quick Delhivery Token Test
 * Run from backend directory: node quick-test-token.js
 */

const axios = require('axios');

// PASTE YOUR TOKEN DIRECTLY HERE FOR TESTING
const DELHIVERY_TOKEN = '6ae37f3aa1c14d1d79c8f5159314607640b975aa';
const API_URL = 'https://track.delhivery.com'; // Production URL
const TEST_PINCODE = '110001'; // Delhi pincode

console.log('\n🔍 Testing Delhivery Token...\n');
console.log(`Token: ${DELHIVERY_TOKEN.substring(0, 20)}...`);
console.log(`API URL: ${API_URL}`);
console.log(`Test Pincode: ${TEST_PINCODE}\n`);

async function testToken() {
  try {
    console.log('📡 Sending request to Delhivery API...\n');

    const response = await axios.get(`${API_URL}/c/api/pin-codes/json/`, {
      params: {
        filter_codes: TEST_PINCODE
      },
      headers: {
        'Authorization': `Token ${DELHIVERY_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000,
      validateStatus: function (status) {
        return true; // Don't throw for any status
      }
    });

    console.log(`📊 Response Status: ${response.status}\n`);

    if (response.status === 200) {
      console.log('✅ SUCCESS! Token is valid!\n');
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      
      // Check if pincode is serviceable
      if (response.data.delivery_codes && response.data.delivery_codes.length > 0) {
        const pinData = response.data.delivery_codes[0];
        console.log('\n📍 Pincode Details:');
        console.log(`   City: ${pinData.postal_code?.city || 'N/A'}`);
        console.log(`   State: ${pinData.postal_code?.state_code || 'N/A'}`);
        console.log(`   COD: ${pinData.cod === 'Y' ? 'Yes' : 'No'}`);
        console.log(`   Prepaid: ${pinData.pre_paid === 'Y' ? 'Yes' : 'No'}`);
      } else {
        console.log('\n⚠️  Pincode is NOT serviceable (NSZ)');
      }
      
      console.log('\n✅ Your token works! Update your .env file if needed.\n');
      
    } else if (response.status === 401) {
      console.log('❌ ERROR: 401 Unauthorized\n');
      console.log('Your token is INVALID or EXPIRED.\n');
      console.log('Solutions:');
      console.log('1. Check if you copied the complete token');
      console.log('2. Verify token is for PRODUCTION (not staging)');
      console.log('3. Contact Delhivery: clientservice@delhivery.com\n');
      console.log('Response:', response.data);
      
    } else if (response.status === 403) {
      console.log('❌ ERROR: 403 Forbidden\n');
      console.log('Your token doesn\'t have required permissions.\n');
      console.log('Contact Delhivery to enable API access for your account.\n');
      console.log('Response:', response.data);
      
    } else {
      console.log(`❌ ERROR: Unexpected status ${response.status}\n`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.log('❌ REQUEST FAILED\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('Cannot connect to Delhivery API.');
      console.log('Check your internet connection.\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('Request timed out.');
      console.log('Delhivery API might be slow or unreachable.\n');
    } else {
      console.log('Error:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
    }
  }
}

// Also test staging environment
async function testStaging() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Testing STAGING Environment');
  console.log('='.repeat(60) + '\n');

  const STAGING_URL = 'https://staging-express.delhivery.com';
  
  try {
    console.log(`📡 Sending request to: ${STAGING_URL}\n`);

    const response = await axios.get(`${STAGING_URL}/c/api/pin-codes/json/`, {
      params: {
        filter_codes: TEST_PINCODE
      },
      headers: {
        'Authorization': `Token ${DELHIVERY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000,
      validateStatus: function (status) {
        return true;
      }
    });

    console.log(`📊 Staging Status: ${response.status}\n`);

    if (response.status === 200) {
      console.log('✅ Token also works on STAGING!\n');
      console.log('💡 Tip: Use staging for testing, production for live orders\n');
    } else if (response.status === 401) {
      console.log('❌ Token is INVALID for staging environment');
      console.log('💡 You might have separate tokens for staging and production\n');
    }

  } catch (error) {
    console.log('⚠️  Could not test staging:', error.message);
  }
}

// Run tests
console.log('='.repeat(60));
console.log('🧪 PRODUCTION Environment Test');
console.log('='.repeat(60) + '\n');

testToken()
  .then(() => testStaging())
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test Complete');
    console.log('='.repeat(60) + '\n');
  });