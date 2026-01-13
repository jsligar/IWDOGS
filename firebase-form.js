// Firebase Form Handler - Saves contact form submissions to Firebase Firestore

// This file overrides the localStorage functionality from script.js
// and saves submissions to Firebase instead

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm && typeof firebase !== 'undefined') {
        // Remove the existing submit handler from script.js
        // and add our Firebase handler
        contactForm.addEventListener('submit', handleFirebaseSubmit);

        // Clear errors on input
        const formFields = contactForm.querySelectorAll('input, textarea');
        formFields.forEach(field => {
            field.addEventListener('input', function() {
                clearFieldError(this.id);
            });
        });
    }

    // Helper function to show field error
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + '-error');

        if (field && errorDiv) {
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
            errorDiv.textContent = message;
        }
    }

    // Helper function to clear field error
    function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + '-error');

        if (field && errorDiv) {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
            errorDiv.textContent = '';
        }
    }

    // Helper function to clear all errors
    function clearAllErrors() {
        const errorDivs = contactForm.querySelectorAll('.field-error');
        errorDivs.forEach(div => div.textContent = '');

        const fields = contactForm.querySelectorAll('input, textarea');
        fields.forEach(field => {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
        });

        const errorSummary = document.getElementById('form-error-summary');
        if (errorSummary) {
            errorSummary.style.display = 'none';
            errorSummary.innerHTML = '';
        }
    }

    // Helper function to show error summary
    function showErrorSummary(errors) {
        const errorSummary = document.getElementById('form-error-summary');
        if (errorSummary && errors.length > 0) {
            errorSummary.innerHTML = `
                <h4>Please correct the following errors:</h4>
                <ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>
            `;
            errorSummary.style.display = 'block';
            errorSummary.focus();
        }
    }

    function handleFirebaseSubmit(e) {
        e.preventDefault();
        e.stopImmediatePropagation(); // Stop other handlers

        // Clear previous errors
        clearAllErrors();

        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();

        // Basic validation
        let isValid = true;
        const errors = [];

        if (name === '') {
            isValid = false;
            showFieldError('name', 'Please enter your name.');
            errors.push('Name is required.');
        }

        if (email === '') {
            isValid = false;
            showFieldError('email', 'Please enter your email address.');
            errors.push('Email is required.');
        } else if (!isValidEmail(email)) {
            isValid = false;
            showFieldError('email', 'Please enter a valid email address.');
            errors.push('Email address is not valid.');
        }

        if (message === '') {
            isValid = false;
            showFieldError('message', 'Please enter a message.');
            errors.push('Message is required.');
        }

        if (!isValid) {
            showErrorSummary(errors);
            // Focus on first error field
            const firstErrorField = contactForm.querySelector('.error');
            if (firstErrorField) {
                firstErrorField.focus();
            }
            return false;
        }

        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');

        // Prepare submission data
        const submission = {
            name: name,
            email: email,
            phone: phone || '',
            message: message,
            timestamp: new Date().toISOString(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Save to Firebase Firestore
        firebase.firestore().collection('contact-submissions')
            .add(submission)
            .then((docRef) => {
                console.log('Submission saved with ID:', docRef.id);

                // Track successful submission in Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submission', {
                        'event_category': 'Contact',
                        'event_label': 'Contact Form',
                        'value': 1
                    });
                }

                // Reset button
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
                submitBtn.setAttribute('aria-busy', 'false');

                // Show success message
                showFormSuccess();

                // Reset form
                contactForm.reset();
            })
            .catch((error) => {
                console.error('Error saving submission:', error);

                // Track error in Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'exception', {
                        'description': 'Form submission failed: ' + error.message,
                        'fatal': false
                    });
                }

                // Reset button
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
                submitBtn.setAttribute('aria-busy', 'false');

                // Show user-friendly error message
                showErrorSummary(['There was an error submitting your message. Please try again or contact us directly via email or phone.']);
            });

        return false;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showFormSuccess() {
        const formContainer = document.querySelector('.contact-form-container');

        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success-message';
        successMessage.innerHTML = `
            <h3 style="color: var(--primary-color);">Thank You!</h3>
            <p>Your message has been received. We'll get back to you as soon as possible.</p>
            <p>You can also reach us directly at:</p>
            <p><strong>Email:</strong> <a href="mailto:iwdogs@yahoo.com">iwdogs@yahoo.com</a><br>
            <strong>Phone:</strong> <a href="tel:+17752401276">(775) 240-1276</a></p>
        `;
        successMessage.style.padding = 'var(--spacing-md)';
        successMessage.style.backgroundColor = '#d4edda';
        successMessage.style.border = '2px solid var(--primary-color)';
        successMessage.style.borderRadius = '8px';
        successMessage.style.marginTop = 'var(--spacing-sm)';

        // Insert success message after form
        const existingMessage = contactForm.parentNode.querySelector('.form-success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);

        // Hide form temporarily
        contactForm.style.display = 'none';

        // Remove success message and show form again after 10 seconds
        setTimeout(() => {
            successMessage.remove();
            contactForm.style.display = 'block';
        }, 10000);
    }
});
