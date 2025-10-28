// setAdmin.js
const admin = require('firebase-admin');

// Path to your service account key
const serviceAccount = require('./serviceAccountKey.json'); 

// Initialize the admin app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// --- !! EDIT THIS !! ---
// Put the email address of the user you want to make an admin
const adminEmail = "swyamagarwal4@gmail.com"; 
// -----------------------

async function setAdminClaim() {
  try {
    // 1. Find the user by their email
    const user = await admin.auth().getUserByEmail(adminEmail);

    // 2. Set the custom claim { admin: true }
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log(`Success! ${adminEmail} is now an admin.`);
    console.log('You may need to sign out and sign back in for changes to take effect.');
  } catch (error) {
    console.error('Error setting admin claim:', error.message);
  }
}

setAdminClaim();