// Waitlist Management JavaScript

let waitlistData = [];

firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'admin.html';
        return;
    }
    loadWaitlist();
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
    firebase.auth().signOut().then(() => window.location.href = 'admin.html');
});

async function loadWaitlist() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('waitlist-container');
    const emptyState = document.getElementById('empty-state');

    try {
        const snapshot = await firebase.firestore()
            .collection('waitlist')
            .orderBy('addedAt', 'desc')
            .get();

        loading.style.display = 'none';

        if (snapshot.empty) {
            emptyState.style.display = 'block';
            container.style.display = 'none';
            return;
        }

        waitlistData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        emptyState.style.display = 'none';
        container.style.display = 'block';
        renderWaitlist();
    } catch (error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        showMessage('Error loading waitlist: ' + error.message, 'error');
    }
}

function renderWaitlist() {
    const grid = document.getElementById('waitlist-grid');
    grid.innerHTML = '';

    waitlistData.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'waitlist-card';
        const date = entry.addedAt ? new Date(entry.addedAt.toDate ? entry.addedAt.toDate() : entry.addedAt).toLocaleDateString() : 'Unknown';

        card.innerHTML = `
            <div class="waitlist-header">
                <h3>${escapeHtml(entry.name || 'Unnamed')}</h3>
                <span class="priority-badge ${entry.priority || 'normal'}">${capitalizeFirst(entry.priority || 'normal')}</span>
            </div>
            <div class="waitlist-info">
                <p><strong>Email:</strong> ${escapeHtml(entry.email)}</p>
                <p><strong>Phone:</strong> ${escapeHtml(entry.phone || 'N/A')}</p>
                <p><strong>Added:</strong> ${date}</p>
                ${entry.preferredGender ? `<p><strong>Preference:</strong> ${capitalizeFirst(entry.preferredGender)}</p>` : ''}
                ${entry.notes ? `<p><strong>Notes:</strong> ${escapeHtml(entry.notes)}</p>` : ''}
            </div>
            <div class="waitlist-actions">
                <button onclick="updatePriority('${entry.id}')" class="btn btn-sm btn-primary">Set Priority</button>
                <button onclick="deleteEntry('${entry.id}')" class="btn btn-sm btn-danger">Remove</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

window.updatePriority = async function(id) {
    const priority = prompt('Enter priority (high/normal/low):');
    if (!priority || !['high', 'normal', 'low'].includes(priority.toLowerCase())) {
        alert('Invalid priority');
        return;
    }

    try {
        await firebase.firestore()
            .collection('waitlist')
            .doc(id)
            .update({ priority: priority.toLowerCase() });
        showMessage('Priority updated!');
        loadWaitlist();
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
};

window.deleteEntry = function(id) {
    if (confirm('Remove from waitlist?')) {
        firebase.firestore().collection('waitlist').doc(id).delete()
            .then(() => { showMessage('Removed from waitlist!'); loadWaitlist(); })
            .catch((error) => showMessage('Error: ' + error.message, 'error'));
    }
};

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text || '').replace(/[&<>"']/g, (m) => map[m]);
}

function showMessage(text, type = 'success') {
    const el = document.getElementById('message');
    if (!el) return;
    el.textContent = text;
    el.className = `message ${type}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 5000);
}
