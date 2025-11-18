// Firebase Configuration
// Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your Apps > Web App

const firebaseConfig = {
    apiKey: "AIzaSyAK2UzysoQe83NlEH289QdrPZXDJP1-Rp0",
    authDomain: "iwdogs-2e4c1.firebaseapp.com",
    projectId: "iwdogs-2e4c1",
    storageBucket: "iwdogs-2e4c1.appspot.com",
    messagingSenderId: "685239360237",
    appId: "1:685239360237:web:ec6f3d94f3202bbfbd0ae4",
    measurementId: "G-E39305GHEE"
};

// Initialize Firebase (will be imported in other files)
// DO NOT edit below this line unless you know what you're doing

let app, auth, db, storage;

if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    
    // Only initialize Firestore if the SDK is loaded
    if (firebase.firestore) {
        db = firebase.firestore();
    }
    
    // Only initialize Storage if the SDK is loaded
    if (firebase.storage) {
        storage = firebase.storage();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, app, auth, db, storage };
}
