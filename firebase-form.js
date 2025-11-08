// Firebase Form Handler - Saves contact form submissions to Firebase Firestore

// This file overrides the localStorage functionality from script.js
// and saves submissions to Firebase instead

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm && typeof firebase !== 'undefined') {
        // Remove the existing submit handler from script.js
        // and add our Firebase handler
        contactForm.addEventListener('submit', handleFirebaseSubmit);
    }

    function handleFirebaseSubmit(e) {
        e.preventDefault();
        e.stopImmediatePropagation(); // Stop other handlers

        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();

        // Basic validation
        let isValid = true;
        let errorMessage = '';

        if (name === '') {
            isValid = false;
            errorMessage += 'Please enter your name.\n';
        }

        if (email === '') {
            isValid = false;
            errorMessage += 'Please enter your email.\n';
        } else if (!isValidEmail(email)) {
            isValid = false;
            errorMessage += 'Please enter a valid email address.\n';
        }

        if (message === '') {
            isValid = false;
            errorMessage += 'Please enter a message.\n';
        }

        if (!isValid) {
            alert(errorMessage);
            return false;
        }

        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

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

                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                // Show success message
                showFormSuccess();

                // Reset form
                contactForm.reset();
            })
            .catch((error) => {
                console.error('Error saving submission:', error);

                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                // Show error
                alert('There was an error submitting your message. Please try again or contact us directly via email or phone.');
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
