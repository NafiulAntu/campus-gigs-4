#!/usr/bin/env node

/**
 * Interactive OAuth Setup Script
 * This script will guide you through setting up OAuth credentials
 * for GitHub, Google, and LinkedIn
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

console.log('\n🔐 Campus Gigs OAuth Setup Wizard\n');
console.log('This will help you set up OAuth for GitHub, Google, and LinkedIn.\n');

const credentials = {
  github: { clientId: '', clientSecret: '' },
  google: { clientId: '', clientSecret: '' },
  linkedin: { clientId: '', clientSecret: '' }
};

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupGitHub() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔵 STEP 1: GitHub OAuth Setup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('1. Open: https://github.com/settings/developers');
  console.log('2. Click "New OAuth App"');
  console.log('3. Fill in:');
  console.log('   - Application name: Campus Gigs');
  console.log('   - Homepage URL: http://localhost:3004');
  console.log('   - Callback URL: http://localhost:3000/api/auth/github/callback');
  console.log('4. Click "Register application"\n');
  
  credentials.github.clientId = await question('Enter GitHub Client ID: ');
  credentials.github.clientSecret = await question('Enter GitHub Client Secret: ');
  
  console.log('\n✅ GitHub credentials saved!\n');
}

async function setupGoogle() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔴 STEP 2: Google OAuth Setup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('1. Open: https://console.cloud.google.com/');
  console.log('2. Create a new project: "Campus Gigs"');
  console.log('3. Go to: APIs & Services > Credentials');
  console.log('4. Click "Create Credentials" > "OAuth client ID"');
  console.log('5. Configure consent screen if needed (External, skip optional fields)');
  console.log('6. Application type: Web application');
  console.log('7. Add redirect URI: http://localhost:3000/api/auth/google/callback');
  console.log('8. Click "Create"\n');
  
  credentials.google.clientId = await question('Enter Google Client ID: ');
  credentials.google.clientSecret = await question('Enter Google Client Secret: ');
  
  console.log('\n✅ Google credentials saved!\n');
}

async function setupLinkedIn() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔵 STEP 3: LinkedIn OAuth Setup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('1. Open: https://www.linkedin.com/developers/apps');
  console.log('2. Click "Create app"');
  console.log('3. Fill in app details (name: Campus Gigs)');
  console.log('4. Go to "Auth" tab');
  console.log('5. Add redirect URL: http://localhost:3000/api/auth/linkedin/callback');
  console.log('6. Request "Sign In with LinkedIn" product access\n');
  
  credentials.linkedin.clientId = await question('Enter LinkedIn Client ID: ');
  credentials.linkedin.clientSecret = await question('Enter LinkedIn Client Secret: ');
  
  console.log('\n✅ LinkedIn credentials saved!\n');
}

function updateEnvFile() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💾 Updating .env file...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update GitHub credentials
  envContent = envContent.replace(
    /GITHUB_CLIENT_ID=.*/,
    `GITHUB_CLIENT_ID=${credentials.github.clientId}`
  );
  envContent = envContent.replace(
    /GITHUB_CLIENT_SECRET=.*/,
    `GITHUB_CLIENT_SECRET=${credentials.github.clientSecret}`
  );
  
  // Update Google credentials
  envContent = envContent.replace(
    /GOOGLE_CLIENT_ID=.*/,
    `GOOGLE_CLIENT_ID=${credentials.google.clientId}`
  );
  envContent = envContent.replace(
    /GOOGLE_CLIENT_SECRET=.*/,
    `GOOGLE_CLIENT_SECRET=${credentials.google.clientSecret}`
  );
  
  // Update LinkedIn credentials
  envContent = envContent.replace(
    /LINKEDIN_CLIENT_ID=.*/,
    `LINKEDIN_CLIENT_ID=${credentials.linkedin.clientId}`
  );
  envContent = envContent.replace(
    /LINKEDIN_CLIENT_SECRET=.*/,
    `LINKEDIN_CLIENT_SECRET=${credentials.linkedin.clientSecret}`
  );
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env file updated successfully!');
}

async function main() {
  try {
    const answer = await question('Do you want to set up OAuth credentials now? (yes/no): ');
    
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('\n❌ Setup cancelled. Run this script again when ready.\n');
      rl.close();
      return;
    }
    
    await setupGitHub();
    await setupGoogle();
    await setupLinkedIn();
    
    updateEnvFile();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 OAuth Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ All credentials have been saved to .env file');
    console.log('✅ Restart your server: npm run dev');
    console.log('✅ Test OAuth buttons in your app!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

main();
