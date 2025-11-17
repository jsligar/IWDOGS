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
const faqCollection = db.collection('faqs');
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

// Load FAQs
function loadFAQs() {
    faqCollection.orderBy('displayOrder', 'asc').get()
        .then((querySnapshot) => {
            const container = document.getElementById('faq-list');

            if (querySnapshot.empty) {
                container.innerHTML = '<div class="empty-state">No FAQs yet. Add your first one above!</div>';
                return;
            }

            container.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const faqEl = createFAQElement(doc.id, data);
                container.appendChild(faqEl);
            });
        })
        .catch((error) => {
            console.error('Error loading FAQs:', error);
            showMessage('Error loading FAQs: ' + error.message, 'error');
        });
}

// Create FAQ element
function createFAQElement(id, data) {
    const div = document.createElement('div');
    div.className = 'faq-item';
    div.innerHTML = `
        <div class="faq-item-header">
            <div class="faq-question">${escapeHtml(data.question)}</div>
            <div style="color: var(--slate-light); font-size: 0.9rem;">Order: ${data.displayOrder || 0}</div>
        </div>
        <div class="faq-answer">${escapeHtml(data.answer)}</div>
        <div class="faq-actions">
            <button class="btn btn-edit btn-sm" onclick="editFAQ('${id}')">Edit</button>
            <button class="btn btn-delete btn-sm" onclick="deleteFAQ('${id}')">Delete</button>
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

// Edit FAQ
window.editFAQ = function(id) {
    faqCollection.doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                editingId = id;

                document.getElementById('faq-id').value = id;
                document.getElementById('question').value = data.question;
                document.getElementById('answer').value = data.answer;
                document.getElementById('display-order').value = data.displayOrder || 0;

                document.getElementById('form-title').textContent = 'Edit FAQ';
                document.getElementById('cancel-edit').style.display = 'inline-block';

                // Scroll to form
                document.querySelector('.faq-form').scrollIntoView({ behavior: 'smooth' });
            }
        })
        .catch((error) => {
            console.error('Error loading FAQ:', error);
            showMessage('Error loading FAQ: ' + error.message, 'error');
        });
};

// Delete FAQ
window.deleteFAQ = function(id) {
    if (confirm('Are you sure you want to delete this FAQ?')) {
        faqCollection.doc(id).delete()
            .then(() => {
                showMessage('FAQ deleted successfully!');
                loadFAQs();
            })
            .catch((error) => {
                console.error('Error deleting FAQ:', error);
                showMessage('Error deleting FAQ: ' + error.message, 'error');
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
    document.getElementById('faq-form').reset();
    document.getElementById('faq-id').value = '';
    document.getElementById('form-title').textContent = 'Add New FAQ';
    document.getElementById('cancel-edit').style.display = 'none';
}

// Submit form
document.getElementById('faq-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const faqData = {
        question: document.getElementById('question').value.trim(),
        answer: document.getElementById('answer').value.trim(),
        displayOrder: parseInt(document.getElementById('display-order').value) || 0,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (editingId) {
        // Update existing FAQ
        faqCollection.doc(editingId).update(faqData)
            .then(() => {
                showMessage('FAQ updated successfully!');
                resetForm();
                loadFAQs();
            })
            .catch((error) => {
                console.error('Error updating FAQ:', error);
                showMessage('Error updating FAQ: ' + error.message, 'error');
            });
    } else {
        // Add new FAQ
        faqData.createdAt = firebase.firestore.FieldValue.serverTimestamp();

        faqCollection.add(faqData)
            .then(() => {
                showMessage('FAQ added successfully!');
                resetForm();
                loadFAQs();
            })
            .catch((error) => {
                console.error('Error adding FAQ:', error);
                showMessage('Error adding FAQ: ' + error.message, 'error');
            });
    }
});

// Initial load
loadFAQs();
