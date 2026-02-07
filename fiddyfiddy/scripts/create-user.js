/**
 * Setup Script: Create First Admin User
 * 
 * Run this once to create your first organizer account:
 *   node scripts/create-user.js
 * 
 * Or use it as a reference for how to create users programmatically.
 */

const bcrypt = require('bcryptjs');

// Configuration - UPDATE THESE VALUES
const KNACK_APP_ID = process.env.KNACK_APP_ID || 'YOUR_APP_ID';
const KNACK_API_KEY = process.env.KNACK_API_KEY || 'YOUR_API_KEY';
const USERS_OBJECT = 'object_5'; // Users object

// User to create - UPDATE THESE VALUES
const NEW_USER = {
  email: 'your@email.com',
  password: 'your_password_here', // Will be hashed
  name: 'Your Name',
  role: 'Organizer', // or 'Owner'
  venmo_handle: 'YourVenmoHandle',
  phone: '',
  status: 'Active',
};

async function createUser() {
  console.log('🔐 Hashing password...');
  const hashedPassword = await bcrypt.hash(NEW_USER.password, 10);
  
  console.log('📤 Creating user in Knack...');
  
  const response = await fetch(`https://api.knack.com/v1/objects/${USERS_OBJECT}/records`, {
    method: 'POST',
    headers: {
      'X-Knack-Application-Id': KNACK_APP_ID,
      'X-Knack-REST-API-Key': KNACK_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      field_57: NEW_USER.email,        // email
      field_58: hashedPassword,         // password (hashed)
      field_59: NEW_USER.role,          // role
      field_60: NEW_USER.name,          // name
      field_61: NEW_USER.venmo_handle,  // venmo_handle
      field_62: NEW_USER.phone,         // phone
      field_63: NEW_USER.status,        // status
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }

  const user = await response.json();
  console.log('✅ User created successfully!');
  console.log('   ID:', user.id);
  console.log('   Email:', NEW_USER.email);
  console.log('   Role:', NEW_USER.role);
  console.log('\n🎉 You can now log in at /login');
}

// Also export a hash function for manual use
async function hashPassword(plain) {
  const hash = await bcrypt.hash(plain, 10);
  console.log('Password:', plain);
  console.log('Hash:', hash);
  return hash;
}

// Run if called directly
if (require.main === module) {
  // Check if we just want to hash a password
  if (process.argv[2] === '--hash') {
    const password = process.argv[3] || 'test123';
    hashPassword(password);
  } else {
    createUser().catch(console.error);
  }
}

module.exports = { hashPassword };
