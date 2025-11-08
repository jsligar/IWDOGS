// Firebase Configuration
// Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your Apps > Web App

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (will be imported in other files)
// DO NOT edit below this line unless you know what you're doing

let app, auth, db, storage;

if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, app, auth, db, storage };
}
