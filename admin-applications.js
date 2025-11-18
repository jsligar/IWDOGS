// Applications Management JavaScript

let applicationsData = [];

// Check authentication
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'admin.html';
        return;
    }
    loadApplications();
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        window.location.href = 'admin.html';
    });
});

// Load applications
async function loadApplications() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('applications-container');
    const emptyState = document.getElementById('empty-state');
    const grid = document.getElementById('applications-grid');

    try {
        const snapshot = await firebase.firestore()
            .collection('applications')
            .orderBy('submittedAt', 'desc')
            .get();

        loading.style.display = 'none';

        if (snapshot.empty) {
            emptyState.style.display = 'block';
            container.style.display = 'none';
            return;
        }

        applicationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        emptyState.style.display = 'none';
        container.style.display = 'block';
        renderApplications();
    } catch (error) {
        console.error('Error loading applications:', error);
        loading.style.display = 'none';
        showMessage('Error loading applications: ' + error.message, 'error');
    }
}

// Render applications
function renderApplications() {
    const grid = document.getElementById('applications-grid');
    grid.innerHTML = '';

    applicationsData.forEach(app => {
        const card = createApplicationCard(app);
        grid.appendChild(card);
    });
}

// Create application card
function createApplicationCard(app) {
    const card = document.createElement('div');
    card.className = 'application-card';

    const statusClass = app.status || 'pending';
    const date = app.submittedAt ? formatDate(app.submittedAt.toDate ? app.submittedAt.toDate() : new Date(app.submittedAt)) : 'Unknown';

    card.innerHTML = `
        <div class="application-header">
            <h3>${escapeHtml(app.applicantName || 'Unnamed Applicant')}</h3>
            <span class="status-badge ${statusClass}">${capitalizeFirst(statusClass)}</span>
        </div>
        <div class="application-info">
            <p><strong>Email:</strong> ${escapeHtml(app.email || 'N/A')}</p>
            <p><strong>Phone:</strong> ${escapeHtml(app.phone || 'N/A')}</p>
            <p><strong>Submitted:</strong> ${date}</p>
            ${app.preferredGender ? `<p><strong>Preference:</strong> ${capitalizeFirst(app.preferredGender)}</p>` : ''}
        </div>
        <div class="application-actions">
            <button onclick="viewApplication('${app.id}')" class="btn btn-sm btn-primary">View Details</button>
            <button onclick="updateStatus('${app.id}')" class="btn btn-sm btn-secondary">Update Status</button>
            <button onclick="deleteApplication('${app.id}')" class="btn btn-sm btn-danger">Delete</button>
        </div>
    `;

    return card;
}

// View application details
window.viewApplication = function(id) {
    const app = applicationsData.find(a => a.id === id);
    if (!app) return;

    const details = `
        <p><strong>Name:</strong> ${escapeHtml(app.applicantName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(app.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(app.phone || 'N/A')}</p>
        <p><strong>Preferred Gender:</strong> ${escapeHtml(app.preferredGender || 'No preference')}</p>
        <p><strong>Experience:</strong> ${escapeHtml(app.experience || 'Not provided')}</p>
        <p><strong>Living Situation:</strong> ${escapeHtml(app.livingSituation || 'Not provided')}</p>
        <p><strong>Other Pets:</strong> ${escapeHtml(app.otherPets || 'Not provided')}</p>
        <p><strong>Reason:</strong> ${escapeHtml(app.reason || 'Not provided')}</p>
        <p><strong>Notes:</strong> ${escapeHtml(app.notes || 'None')}</p>
    `;

    document.getElementById('modal-body').innerHTML = details;
    document.getElementById('view-modal').style.display = 'flex';
};

// Update status
window.updateStatus = async function(id) {
    const newStatus = prompt('Enter new status (pending/approved/rejected):');
    if (!newStatus || !['pending', 'approved', 'rejected'].includes(newStatus.toLowerCase())) {
        alert('Invalid status. Must be: pending, approved, or rejected');
        return;
    }

    try {
        await firebase.firestore()
            .collection('applications')
            .doc(id)
            .update({
                status: newStatus.toLowerCase(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        showMessage('Status updated successfully!');
        loadApplications();
    } catch (error) {
        showMessage('Error updating status: ' + error.message, 'error');
    }
};

// Delete application
window.deleteApplication = function(id) {
    if (confirm('Are you sure you want to delete this application?')) {
        firebase.firestore()
            .collection('applications')
            .doc(id)
            .delete()
            .then(() => {
                showMessage('Application deleted successfully!');
                loadApplications();
            })
            .catch((error) => {
                showMessage('Error deleting application: ' + error.message, 'error');
            });
    }
};

function closeViewModal() {
    document.getElementById('view-modal').style.display = 'none';
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text || '').replace(/[&<>"']/g, (m) => map[m]);
}

function showMessage(text, type = 'success') {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    setTimeout(() => { messageEl.style.display = 'none'; }, 5000);
}

window.onclick = function(event) {
    const modal = document.getElementById('view-modal');
    if (event.target === modal) {
        closeViewModal();
    }
};
