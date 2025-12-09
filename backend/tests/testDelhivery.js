// backend/test/testDelhivery.js
/**
 * Test script for Delhivery API integration
 * Run: node test/testDelhivery.js
 */

require('dotenv').config();
const delhiveryService = require('../src/services/delhiveryService');

const TEST_PINCODES = [
  '560103', // Bangalore
  '400001', // Mumbai
  '110001', // Delhi
  '600001', // Chennai
  '700001'  // Kolkata
];

async function testDelhiveryAPI() {
  console.log('\n🧪 ========== DELHIVERY API TEST ==========\n');
  
  // Check environment variables
  console.log('📋 Configuration Check:');
  console.log(`   API Token: ${process.env.DELHIVERY_API_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Warehouse PIN: ${process.env.WAREHOUSE_PINCODE || 'Using default: 110001'}`);
  console.log('\n');

  // Test 1: Health Check
  console.log('🏥 Test 1: Health Check');
  try {
    const health = await delhiveryService.healthCheck();
    console.log('   Result:', health.healthy ? '✅ Healthy' : '❌ Unhealthy');
    console.log('   Status:', health.status);
    if (health.error) console.log('   Error:', health.error);
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message);
  }
  console.log('\n');

  // Test 2: Pincode Serviceability
  console.log('📍 Test 2: Pincode Serviceability');
  for (const pin of TEST_PINCODES.slice(0, 2)) { // Test first 2 pincodes
    try {
      console.log(`\n   Testing PIN: ${pin}`);
      const result = await delhiveryService.checkPincodeServiceability(pin);
      console.log(`   Serviceable: ${result.serviceable ? '✅ Yes' : '❌ No'}`);
      if (result.serviceable) {
        console.log(`   Location: ${result.city}, ${result.state}`);
        console.log(`   COD: ${result.features.cod ? '✅' : '❌'}`);
        console.log(`   Prepaid: ${result.features.prepaid ? '✅' : '❌'}`);
      }
      await sleep(1000); // Rate limiting
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  console.log('\n');

  // Test 3: TAT (Turn Around Time)
  console.log('⏱️  Test 3: Estimated Delivery Time (TAT)');
  const testPin = TEST_PINCODES[0];
  
  // Test Surface mode
  try {
    console.log(`\n   Testing Surface delivery to ${testPin}`);
    const surfaceTAT = await delhiveryService.getEstimatedTAT(testPin, { mode: 'S' });
    console.log(`   Success: ${surfaceTAT.success ? '✅' : '❌'}`);
    console.log(`   Estimated Days: ${surfaceTAT.estimatedDays || 'N/A'}`);
    console.log(`   Delivery Date: ${surfaceTAT.expectedDeliveryDate || 'N/A'}`);
    if (surfaceTAT.fallback) console.log('   ⚠️  Using fallback values');
  } catch (error) {
    console.log(`   ❌ Surface TAT error: ${error.message}`);
  }

  await sleep(1000);

  // Test Express mode
  try {
    console.log(`\n   Testing Express delivery to ${testPin}`);
    const expressTAT = await delhiveryService.getEstimatedTAT(testPin, { mode: 'E' });
    console.log(`   Success: ${expressTAT.success ? '✅' : '❌'}`);
    console.log(`   Estimated Days: ${expressTAT.estimatedDays || 'N/A'}`);
    console.log(`   Delivery Date: ${expressTAT.expectedDeliveryDate || 'N/A'}`);
    if (expressTAT.fallback) console.log('   ⚠️  Using fallback values');
  } catch (error) {
    console.log(`   ❌ Express TAT error: ${error.message}`);
  }
  console.log('\n');

  // Test 4: Combined Delivery Check
  console.log('📦 Test 4: Combined Delivery Check');
  try {
    console.log(`\n   Full check for PIN: ${testPin}`);
    const deliveryInfo = await delhiveryService.checkDelivery(testPin);
    
    console.log(`   Serviceable: ${deliveryInfo.serviceable ? '✅ Yes' : '❌ No'}`);
    
    if (deliveryInfo.serviceable) {
      console.log(`   Location: ${deliveryInfo.location.city}, ${deliveryInfo.location.state}`);
      
      if (deliveryInfo.deliveryOptions.surface) {
        console.log(`   Surface: ${deliveryInfo.deliveryOptions.surface.estimatedDays} days`);
      } else {
        console.log('   Surface: ❌ Not available');
      }
      
      if (deliveryInfo.deliveryOptions.express) {
        console.log(`   Express: ${deliveryInfo.deliveryOptions.express.estimatedDays} days`);
      } else {
        console.log('   Express: ❌ Not available');
      }
      
      if (deliveryInfo.bestOption) {
        console.log(`   Best Option: ${deliveryInfo.bestOption.mode} (${deliveryInfo.bestOption.estimatedDays} days)`);
      } else {
        console.log('   ⚠️  No TAT data available - using fallback values');
      }
    }
  } catch (error) {
    console.log(`   ❌ Combined check error: ${error.message}`);
  }
  console.log('\n');

  console.log('🎯 ========== TEST COMPLETE ==========\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
testDelhiveryAPI().catch(error => {
  console.error('\n💥 Test suite failed:', error);
  process.exit(1);
});