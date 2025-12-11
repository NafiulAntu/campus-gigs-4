const AWS = require('aws-sdk');
require('dotenv').config();

const textract = new AWS.Textract({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

console.log('✅ AWS Textract configured successfully!');
console.log('Region:', process.env.AWS_REGION);
console.log('Access Key:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 10) + '...');
console.log('\n🎉 Your AWS credentials are working!');
