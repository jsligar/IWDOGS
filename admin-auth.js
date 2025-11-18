// Admin Authentication Logic

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const loading = document.getElementById('loading');

    // Verify Firebase is properly initialized
    if (!firebase || !firebase.auth) {
        showError('Firebase initialization failed. Please check firebase-config.js');
        console.error('Firebase not initialized properly');
        showDebug('Firebase object not found');
        return;
    }

    console.log('Firebase Auth initialized successfully');
    console.log('Project ID:', firebase.app().options.projectId);
    showDebug(`Firebase connected to project: ${firebase.app().options.projectId}`);

    // Check if user is already logged in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, redirect to dashboard
            console.log('User already logged in:', user.email);
            window.location.href = 'dashboard.html';
        } else {
            console.log('No user currently logged in');
        }
    });

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Hide previous messages
            hideMessages();
            showLoading();

            // Sign in with Firebase Authentication
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Signed in successfully
                    const user = userCredential.user;
                    console.log('Logged in:', user.email);

                    hideLoading();
                    showSuccess('Login successful! Redirecting...');

                    // Redirect to dashboard after short delay
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                })
                .catch((error) => {
                    hideLoading();

                    const errorCode = error.code;
                    const errorMsg = error.message;
                    let message = 'Login failed. Please try again.';

                    console.error('Login error details:', {
                        code: errorCode,
                        message: errorMsg,
                        email: email
                    });

                    showDebug(`Error Code: ${errorCode}<br>Error Message: ${errorMsg}`);

                    switch (errorCode) {
                        case 'auth/invalid-email':
                            message = 'Invalid email address format.';
                            break;
                        case 'auth/user-disabled':
                            message = 'This account has been disabled.';
                            break;
                        case 'auth/user-not-found':
                            message = 'No account found with this email. Please create an admin user in Firebase Console > Authentication > Users.';
                            break;
                        case 'auth/wrong-password':
                            message = 'Incorrect password.';
                            break;
                        case 'auth/too-many-requests':
                            message = 'Too many failed attempts. Please try again later.';
                            break;
                        case 'auth/network-request-failed':
                            message = 'Network error. Please check your connection.';
                            break;
                        case 'auth/invalid-credential':
                            message = 'Invalid credentials. Email/Password sign-in may not be enabled in Firebase Console > Authentication > Sign-in method.';
                            break;
                        case 'auth/configuration-not-found':
                            message = 'Firebase Authentication not properly configured. Enable Email/Password in Firebase Console.';
                            break;
                        default:
                            message = `Login failed: ${errorCode}. Check browser console for details.`;
                    }

                    showError(message);
                });
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.classList.add('show');
    }

    function hideMessages() {
        errorMessage.classList.remove('show');
        successMessage.classList.remove('show');
    }

    function showLoading() {
        loading.classList.add('show');
        loginForm.style.opacity = '0.6';
        loginForm.style.pointerEvents = 'none';
    }

    function hideLoading() {
        loading.classList.remove('show');
        loginForm.style.opacity = '1';
        loginForm.style.pointerEvents = 'auto';
    }

    function showDebug(message) {
        const debugInfo = document.getElementById('debug-info');
        const debugText = document.getElementById('debug-text');
        if (debugInfo && debugText) {
            debugText.innerHTML = message;
            debugInfo.style.display = 'block';
        }
    }
});
