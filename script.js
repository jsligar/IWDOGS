// ===========================
// Mobile Menu Toggle
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnToggle = mobileMenuToggle.contains(event.target);

            if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ===========================
    // Smooth Scrolling for Navigation
    // ===========================
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Don't prevent default for # only
            if (href === '#') return;

            e.preventDefault();

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Get the header height for offset
                const header = document.querySelector('.site-header');
                const headerHeight = header ? header.offsetHeight : 0;

                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Set focus to the target element for accessibility
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
            }
        });
    });

    // ===========================
    // Active Navigation Link Highlighting
    // ===========================
    const sections = document.querySelectorAll('section[id]');

    function highlightNavigation() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);
    highlightNavigation(); // Call once on load

    // ===========================
    // Contact Form Validation & Submission
    // ===========================
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

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
                return;
            }

            // Save submission to localStorage
            saveSubmission({
                name: name,
                email: email,
                phone: phone,
                message: message,
                timestamp: new Date().toISOString()
            });

            // Show success message
            showFormSuccess();

            // Reset form
            contactForm.reset();

            // Update export controls
            updateExportControls();
        });
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
        contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);

        // Hide form temporarily
        contactForm.style.display = 'none';

        // Remove success message and show form again after 10 seconds
        setTimeout(() => {
            successMessage.remove();
            contactForm.style.display = 'block';
        }, 10000);
    }

    // ===========================
    // Update Copyright Year
    // ===========================
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ===========================
    // Lazy Loading for Images (when added)
    // ===========================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }

                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                        img.removeAttribute('data-srcset');
                    }

                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all images with data-src attribute
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ===========================
    // Keyboard Navigation Enhancement
    // ===========================
    // Trap focus in mobile menu when open
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab' || e.keyCode === 9) {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }

            // Close menu on Escape key
            if (e.key === 'Escape' || e.keyCode === 27) {
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    mobileMenuToggle.focus();
                }
            }
        });
    }

    if (navMenu) {
        trapFocus(navMenu);
    }

    // ===========================
    // Performance: Debounce scroll events
    // ===========================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Use debounced version for scroll events
    const debouncedHighlightNav = debounce(highlightNavigation, 50);
    window.removeEventListener('scroll', highlightNavigation);
    window.addEventListener('scroll', debouncedHighlightNav);

    // ===========================
    // Animate elements on scroll
    // ===========================
    if ('IntersectionObserver' in window) {
        const animateObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements you want to animate
        const elementsToAnimate = document.querySelectorAll('.dog-card, .expectation-item, .contact-item');
        elementsToAnimate.forEach(el => animateObserver.observe(el));
    }

    // ===========================
    // Form Submission Management
    // ===========================
    const STORAGE_KEY = 'iwdogs-contact-submissions';

    function saveSubmission(data) {
        const submissions = getSubmissions();
        submissions.push(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    }

    function getSubmissions() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function clearSubmissions() {
        if (confirm('Are you sure you want to clear all submission data? This cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEY);
            updateExportControls();
            alert('All submissions have been cleared.');
        }
    }

    function updateExportControls() {
        const submissions = getSubmissions();
        const exportControls = document.getElementById('export-controls');
        const submissionCount = document.getElementById('submission-count');

        if (submissions.length > 0) {
            exportControls.style.display = 'block';
            submissionCount.textContent = submissions.length;
        } else {
            exportControls.style.display = 'none';
        }
    }

    // ===========================
    // Excel Export Functionality
    // ===========================
    function exportToExcel() {
        const submissions = getSubmissions();

        if (submissions.length === 0) {
            alert('No submissions to export.');
            return;
        }

        // Prepare data for Excel
        const excelData = submissions.map((sub, index) => ({
            'Submission #': index + 1,
            'Date & Time': new Date(sub.timestamp).toLocaleString(),
            'Name': sub.name,
            'Email': sub.email,
            'Phone': sub.phone || 'N/A',
            'Message': sub.message
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws['!cols'] = [
            { wch: 15 },  // Submission #
            { wch: 20 },  // Date & Time
            { wch: 25 },  // Name
            { wch: 30 },  // Email
            { wch: 18 },  // Phone
            { wch: 50 }   // Message
        ];

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Contact Submissions');

        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        const filename = `iwdogs-contacts-${date}.xlsx`;

        // Download the file
        XLSX.writeFile(wb, filename);
    }

    // ===========================
    // Event Listeners for Export Controls
    // ===========================
    const exportBtn = document.getElementById('export-excel-btn');
    const clearBtn = document.getElementById('clear-submissions-btn');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportToExcel);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearSubmissions);
    }

    // Initialize export controls on page load
    updateExportControls();

    // ===========================
    // Console message for developers
    // ===========================
    console.log('%cMount Olympus Irish Wolfhounds', 'font-size: 20px; font-weight: bold; color: #2c5f2d;');
    console.log('%cWebsite built with accessibility, performance, and SEO in mind.', 'font-size: 14px; color: #666;');
});

// ===========================
// Add CSS for animations (dynamically)
// ===========================
const style = document.createElement('style');
style.textContent = `
    .dog-card,
    .expectation-item,
    .contact-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .dog-card.animate-in,
    .expectation-item.animate-in,
    .contact-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
        .dog-card,
        .expectation-item,
        .contact-item {
            opacity: 1;
            transform: none;
            transition: none;
        }
    }
`;
document.head.appendChild(style);
