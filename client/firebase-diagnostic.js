// Firebase Diagnostic Script
// Run this in your browser console to diagnose Firebase issues

console.log('🔍 Firebase Diagnostic Script Starting...');

// Check if Firebase is loaded
if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK not loaded');
} else {
    console.log('✅ Firebase SDK loaded');
}

// Check Firebase configuration
const firebaseConfig = {
    apiKey: "REDACTED",
    authDomain: "dwellmate-285e8.firebaseapp.com",
    projectId: "dwellmate-285e8",
    storageBucket: "dwellmate-285e8.firebasestorage.app",
    messagingSenderId: "951413621891",
    appId: "1:951413621891:web:ab7a731b8db0e1a28687b6",
    measurementId: "G-JXTFE2L2T0"
};

console.log('🔧 Firebase Config:', firebaseConfig);

// Test network connectivity
async function testNetworkConnectivity() {
    console.log('🌐 Testing network connectivity...');
    
    try {
        // Test basic connectivity
        const response = await fetch('https://www.google.com', { mode: 'no-cors' });
        console.log('✅ Basic network connectivity working');
        
        // Test Firebase domains
        const firebaseResponse = await fetch('https://dwellmate-285e8.firebaseapp.com', { mode: 'no-cors' });
        console.log('✅ Firebase domain accessible');
        
    } catch (error) {
        console.error('❌ Network connectivity issue:', error);
    }
}

// Test Firebase services
async function testFirebaseServices() {
    console.log('🔥 Testing Firebase services...');
    
    try {
        // Import Firebase modules
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { getStorage } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
        
        console.log('✅ Firebase modules imported successfully');
        
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        console.log('✅ Firebase app initialized');
        
        // Test Firestore
        const db = getFirestore(app);
        console.log('✅ Firestore initialized');
        
        // Test Auth
        const auth = getAuth(app);
        console.log('✅ Auth initialized');
        
        // Test Storage
        const storage = getStorage(app);
        console.log('✅ Storage initialized');
        
        console.log('🎉 All Firebase services working!');
        
    } catch (error) {
        console.error('❌ Firebase services test failed:', error);
    }
}

// Run diagnostics
testNetworkConnectivity();
testFirebaseServices();

console.log('🔍 Firebase Diagnostic Script Complete');
