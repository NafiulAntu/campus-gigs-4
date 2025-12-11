// Simple test script to check jobs API
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/jobs',
  method: 'GET',
  timeout: 5000
};

console.log('Testing http://localhost:5000/api/jobs...\n');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body (first 2000 chars):');
    console.log(data.substring(0, 2000));
    
    try {
      const json = JSON.parse(data);
      console.log('\n✅ Valid JSON response');
      console.log(`Total jobs: ${json.data?.jobs?.length || 0}`);
    } catch (e) {
      console.log('\n❌ Invalid JSON response');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.on('timeout', () => {
  console.error('❌ Request timed out');
  req.destroy();
});

req.end();
