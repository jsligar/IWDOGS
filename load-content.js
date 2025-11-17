// Load Testimonials from Firebase
function loadTestimonials() {
    const db = firebase.firestore();
    const testimonialsGrid = document.querySelector('#testimonials .testimonials-grid');

    if (!testimonialsGrid) return;

    // Show loading state
    testimonialsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--slate-light);">Loading testimonials...</div>';

    db.collection('testimonials')
        .orderBy('displayOrder', 'asc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                // If no testimonials in database, keep the hardcoded ones
                testimonialsGrid.innerHTML = `
                    <div class="testimonial-card">
                        <div class="testimonial-quote">
                            <p>"We got our Irish Wolfhound from Mount Olympus three years ago and couldn't be happier. The care and attention they put into their breeding program is evident in our dog's health and temperament. She's gentle, well-adjusted, and an absolute joy to have in our family."</p>
                        </div>
                        <div class="testimonial-author">
                            <strong>— Sarah & Mike T.</strong>
                            <span>California</span>
                        </div>
                    </div>
                    <div class="testimonial-card">
                        <div class="testimonial-quote">
                            <p>"The mother-daughter team at Mount Olympus provided incredible support throughout the entire process. They helped us understand the breed, prepared us for what to expect, and have been available for questions ever since. Our wolfhound is healthy, beautiful, and has the sweetest personality."</p>
                        </div>
                        <div class="testimonial-author">
                            <strong>— Jennifer L.</strong>
                            <span>Oregon</span>
                        </div>
                    </div>
                    <div class="testimonial-card">
                        <div class="testimonial-quote">
                            <p>"As first-time Irish Wolfhound owners, we were nervous about finding the right breeder. Mount Olympus exceeded all expectations. Their transparency about health testing, their knowledge of the breed, and their genuine care for their dogs made us confident in our decision. Two years later, we still keep in touch!"</p>
                        </div>
                        <div class="testimonial-author">
                            <strong>— Robert & Linda M.</strong>
                            <span>Nevada</span>
                        </div>
                    </div>
                `;
                return;
            }

            testimonialsGrid.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const testimonialCard = document.createElement('div');
                testimonialCard.className = 'testimonial-card';
                testimonialCard.innerHTML = `
                    <div class="testimonial-quote">
                        <p>"${escapeHtml(data.quote)}"</p>
                    </div>
                    <div class="testimonial-author">
                        <strong>— ${escapeHtml(data.authorName)}</strong>
                        <span>${escapeHtml(data.location)}</span>
                    </div>
                `;
                testimonialsGrid.appendChild(testimonialCard);
            });
        })
        .catch((error) => {
            console.error('Error loading testimonials:', error);
            // Keep hardcoded testimonials on error
        });
}

// Load FAQs from Firebase
function loadFAQs() {
    const db = firebase.firestore();
    const faqList = document.querySelector('#faq .faq-list');

    if (!faqList) return;

    // Show loading state
    faqList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--slate-light);">Loading FAQs...</div>';

    db.collection('faqs')
        .orderBy('displayOrder', 'asc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                // If no FAQs in database, keep the hardcoded ones
                faqList.innerHTML = `
                    <div class="faq-item">
                        <h3>How much does an Irish Wolfhound puppy cost?</h3>
                        <p>Please contact us directly for current pricing information. The cost reflects our commitment to health testing, quality care, and the extensive time we invest in each puppy.</p>
                    </div>
                    <div class="faq-item">
                        <h3>How long do Irish Wolfhounds typically live?</h3>
                        <p>Irish Wolfhounds typically live 6-10 years. We focus our breeding program on longevity and have several lines with dogs living well into their teens. Proper health testing and careful breeding can help extend lifespan.</p>
                    </div>
                    <div class="faq-item">
                        <h3>Are Irish Wolfhounds good with children?</h3>
                        <p>Yes! Irish Wolfhounds are known for their gentle, patient nature and typically do very well with children. However, due to their large size, supervision is important, especially with young children. They can accidentally knock over small children simply by being enthusiastic.</p>
                    </div>
                    <div class="faq-item">
                        <h3>How much space do Irish Wolfhounds need?</h3>
                        <p>While they are large dogs, Irish Wolfhounds are actually quite calm indoors and can adapt to various living situations. A securely fenced yard is ideal for exercise, but they don't require acres of land. Regular walks and some space to stretch their legs is sufficient.</p>
                    </div>
                    <div class="faq-item">
                        <h3>When can I take my puppy home?</h3>
                        <p>Puppies go to their new homes at 8-10 weeks of age, after they've been veterinary checked, received their first vaccinations, and are properly weaned and socialized.</p>
                    </div>
                    <div class="faq-item">
                        <h3>Do you ship puppies?</h3>
                        <p>We prefer that families pick up their puppies in person so we can meet you and ensure a smooth transition. However, we can discuss shipping options on a case-by-case basis for families who live far away.</p>
                    </div>
                    <div class="faq-item">
                        <h3>What health testing do you perform?</h3>
                        <p>All our breeding dogs undergo comprehensive health testing including cardiac evaluations, hip and elbow certifications (OFA), eye examinations (CERF), and genetic testing for breed-specific conditions. See our Health Testing section for more details.</p>
                    </div>
                    <div class="faq-item">
                        <h3>Do you offer a health guarantee?</h3>
                        <p>Yes! All our puppies come with a comprehensive health guarantee covering genetic conditions. We stand behind our breeding program and the health of our dogs.</p>
                    </div>
                `;
                return;
            }

            faqList.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const faqItem = document.createElement('div');
                faqItem.className = 'faq-item';
                faqItem.innerHTML = `
                    <h3>${escapeHtml(data.question)}</h3>
                    <p>${escapeHtml(data.answer)}</p>
                `;
                faqList.appendChild(faqItem);
            });
        })
        .catch((error) => {
            console.error('Error loading FAQs:', error);
            // Keep hardcoded FAQs on error
        });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Load content when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to initialize
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        loadTestimonials();
        loadFAQs();
    }
});
