// Admin Authentication Logic

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const loading = document.getElementById('loading');

    // Check if user is already logged in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, redirect to dashboard
            window.location.href = 'dashboard.html';
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
                    let message = 'Login failed. Please try again.';

                    switch (errorCode) {
                        case 'auth/invalid-email':
                            message = 'Invalid email address format.';
                            break;
                        case 'auth/user-disabled':
                            message = 'This account has been disabled.';
                            break;
                        case 'auth/user-not-found':
                            message = 'No account found with this email.';
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
                    }

                    showError(message);
                    console.error('Login error:', errorCode, error.message);
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
});
