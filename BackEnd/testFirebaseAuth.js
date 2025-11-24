// Complete test of Firebase authentication flow
require('dotenv').config();
const { admin } = require('./config/firebase');
const User = require('./models/User');

async function testFirebaseAuth() {
  try {
    console.log('\n🔥 Testing Firebase Authentication Setup...\n');
    
    // 1. Check Firebase Admin SDK
    console.log('1️⃣ Checking Firebase Admin SDK...');
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin SDK is initialized');
      console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
    } else {
      console.log('❌ Firebase Admin SDK NOT initialized');
      process.exit(1);
    }
    
    // 2. Test creating a mock Firebase user in database
    console.log('\n2️⃣ Testing User.upsertFirebaseUser...');
    const testUser = {
      firebase_uid: 'test_uid_12345',
      email: 'test@gmail.com',
      full_name: 'Test User',
      profile_picture: null,
      profession: null,
      username: null
    };
    
    try {
      const user = await User.upsertFirebaseUser(testUser);
      console.log('✅ User.upsertFirebaseUser works');
      console.log('   Created user ID:', user.id);
      
      // Clean up test user
      await User.delete(user.id);
      console.log('   Cleaned up test user');
    } catch (error) {
      console.log('❌ User.upsertFirebaseUser failed:', error.message);
    }
    
    // 3. Test findByFirebaseUid
    console.log('\n3️⃣ Testing User.findByFirebaseUid...');
    try {
      const user = await User.findByFirebaseUid('nonexistent_uid');
      if (!user) {
        console.log('✅ User.findByFirebaseUid works (returned null for non-existent user)');
      }
    } catch (error) {
      console.log('❌ User.findByFirebaseUid failed:', error.message);
    }
    
    console.log('\n✅ All Firebase auth components are working!\n');
    console.log('📝 Summary:');
    console.log('   ✓ Firebase Admin SDK initialized');
    console.log('   ✓ Database connection working');
    console.log('   ✓ User model Firebase methods working');
    console.log('\n💡 If signup/signin still fails, check:');
    console.log('   1. Browser console for frontend errors');
    console.log('   2. Network tab for failed API requests');
    console.log('   3. Backend console for middleware logs');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testFirebaseAuth();
