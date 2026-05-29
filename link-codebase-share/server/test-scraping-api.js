import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api/scraping';

async function testAPI() {
  console.log('Testing Scraping API endpoints...\n');
  
  try {
    // Test status endpoint
    console.log('1. Testing /status endpoint...');
    const statusResponse = await fetch(`${API_BASE}/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Status:', statusData);
    
    // Test config endpoint
    console.log('\n2. Testing /config endpoint...');
    const configResponse = await fetch(`${API_BASE}/config`);
    const configData = await configResponse.json();
    console.log('✅ Config:', configData);
    
    // Test listings endpoint
    console.log('\n3. Testing /listings endpoint...');
    const listingsResponse = await fetch(`${API_BASE}/listings?limit=5`);
    const listingsData = await listingsResponse.json();
    console.log('✅ Listings:', listingsData);
    
    console.log('\n🎉 All API endpoints are working!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();
