// backend/generateGatewayHash.js
/**
 * 🔐 Gateway Password Hash Generator
 * 
 * Usage: node generateGatewayHash.js
 * Then enter your password when prompted
 */

const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 Gateway Password Hash Generator\n');

rl.question('Enter password to hash: ', async (password) => {
  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters');
    rl.close();
    process.exit(1);
  }

  console.log('\n⏳ Generating hash...\n');

  const hash = await bcrypt.hash(password, 10);

  console.log('✅ Hash generated successfully!\n');
  console.log('📋 Add this to your .env file:\n');
  console.log(`GATEWAY_ENABLED=true`);
  console.log(`GATEWAY_PASSWORD_HASH=${hash}`);
  console.log(`GATEWAY_HEADER_NAME=x-gateway-token`);
  console.log(`GATEWAY_WHITELIST_CRON=false`);
  console.log('\n✅ Done!\n');

  rl.close();
});