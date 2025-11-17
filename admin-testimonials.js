// Check authentication
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'admin.html';
    }
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        window.location.href = 'admin.html';
    });
});

const db = firebase.firestore();
const testimonialsCollection = db.collection('testimonials');
let editingId = null;

// Show message
function showMessage(text, type = 'success') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    setTimeout(() => {
        messageEl.className = 'message';
    }, 5000);
}

// Load testimonials
function loadTestimonials() {
    testimonialsCollection.orderBy('displayOrder', 'asc').get()
        .then((querySnapshot) => {
            const container = document.getElementById('testimonials-list');

            if (querySnapshot.empty) {
                container.innerHTML = '<div class="empty-state">No testimonials yet. Add your first one above!</div>';
                return;
            }

            container.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const testimonialEl = createTestimonialElement(doc.id, data);
                container.appendChild(testimonialEl);
            });
        })
        .catch((error) => {
            console.error('Error loading testimonials:', error);
            showMessage('Error loading testimonials: ' + error.message, 'error');
        });
}

// Create testimonial element
function createTestimonialElement(id, data) {
    const div = document.createElement('div');
    div.className = 'testimonial-item';
    div.innerHTML = `
        <div class="testimonial-item-header">
            <div>
                <div class="testimonial-author">${escapeHtml(data.authorName)}</div>
                <div class="testimonial-location">${escapeHtml(data.location)}</div>
            </div>
            <div style="color: var(--slate-light); font-size: 0.9rem;">Order: ${data.displayOrder || 0}</div>
        </div>
        <div class="testimonial-quote">"${escapeHtml(data.quote)}"</div>
        <div class="testimonial-actions">
            <button class="btn btn-edit btn-sm" onclick="editTestimonial('${id}')">Edit</button>
            <button class="btn btn-delete btn-sm" onclick="deleteTestimonial('${id}')">Delete</button>
        </div>
    `;
    return div;
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

// Edit testimonial
window.editTestimonial = function(id) {
    testimonialsCollection.doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                editingId = id;

                document.getElementById('testimonial-id').value = id;
                document.getElementById('author-name').value = data.authorName;
                document.getElementById('location').value = data.location;
                document.getElementById('quote').value = data.quote;
                document.getElementById('display-order').value = data.displayOrder || 0;

                document.getElementById('form-title').textContent = 'Edit Testimonial';
                document.getElementById('cancel-edit').style.display = 'inline-block';

                // Scroll to form
                document.querySelector('.testimonial-form').scrollIntoView({ behavior: 'smooth' });
            }
        })
        .catch((error) => {
            console.error('Error loading testimonial:', error);
            showMessage('Error loading testimonial: ' + error.message, 'error');
        });
};

// Delete testimonial
window.deleteTestimonial = function(id) {
    if (confirm('Are you sure you want to delete this testimonial?')) {
        testimonialsCollection.doc(id).delete()
            .then(() => {
                showMessage('Testimonial deleted successfully!');
                loadTestimonials();
            })
            .catch((error) => {
                console.error('Error deleting testimonial:', error);
                showMessage('Error deleting testimonial: ' + error.message, 'error');
            });
    }
};

// Cancel edit
document.getElementById('cancel-edit').addEventListener('click', () => {
    resetForm();
});

// Reset form
function resetForm() {
    editingId = null;
    document.getElementById('testimonial-form').reset();
    document.getElementById('testimonial-id').value = '';
    document.getElementById('form-title').textContent = 'Add New Testimonial';
    document.getElementById('cancel-edit').style.display = 'none';
}

// Submit form
document.getElementById('testimonial-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const testimonialData = {
        authorName: document.getElementById('author-name').value.trim(),
        location: document.getElementById('location').value.trim(),
        quote: document.getElementById('quote').value.trim(),
        displayOrder: parseInt(document.getElementById('display-order').value) || 0,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (editingId) {
        // Update existing testimonial
        testimonialsCollection.doc(editingId).update(testimonialData)
            .then(() => {
                showMessage('Testimonial updated successfully!');
                resetForm();
                loadTestimonials();
            })
            .catch((error) => {
                console.error('Error updating testimonial:', error);
                showMessage('Error updating testimonial: ' + error.message, 'error');
            });
    } else {
        // Add new testimonial
        testimonialData.createdAt = firebase.firestore.FieldValue.serverTimestamp();

        testimonialsCollection.add(testimonialData)
            .then(() => {
                showMessage('Testimonial added successfully!');
                resetForm();
                loadTestimonials();
            })
            .catch((error) => {
                console.error('Error adding testimonial:', error);
                showMessage('Error adding testimonial: ' + error.message, 'error');
            });
    }
});

// Initial load
loadTestimonials();
