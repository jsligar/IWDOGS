// Puppies Management JavaScript

let currentPuppyId = null;
let puppiesData = [];
let littersData = [];

// Check authentication
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'admin.html';
        return;
    }
    loadLitters();
    loadPuppies();
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        window.location.href = 'admin.html';
    });
});

// Load litters for dropdown
async function loadLitters() {
    try {
        const snapshot = await firebase.firestore()
            .collection('litters')
            .orderBy('whelp_date', 'desc')
            .get();

        littersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        populateLitterDropdown();
    } catch (error) {
        console.error('Error loading litters:', error);
    }
}

// Populate litter dropdown
function populateLitterDropdown() {
    const select = document.getElementById('puppy-litter');
    if (!select) return;

    select.innerHTML = '<option value="">Select Litter</option>';
    littersData.forEach(litter => {
        const option = document.createElement('option');
        option.value = litter.id;
        option.textContent = `${litter.dam_name} x ${litter.sire_name} - ${formatDate(litter.whelp_date)}`;
        select.appendChild(option);
    });
}

// Load puppies
async function loadPuppies() {
    const loading = document.getElementById('loading');
    const puppiesContainer = document.getElementById('puppies-container');
    const emptyState = document.getElementById('empty-state');
    const puppiesGrid = document.getElementById('puppies-grid');

    try {
        const snapshot = await firebase.firestore()
            .collection('puppies')
            .orderBy('dateOfBirth', 'desc')
            .get();

        loading.style.display = 'none';

        if (snapshot.empty) {
            emptyState.style.display = 'block';
            puppiesContainer.style.display = 'none';
            return;
        }

        puppiesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        emptyState.style.display = 'none';
        puppiesContainer.style.display = 'block';

        renderPuppies();
    } catch (error) {
        console.error('Error loading puppies:', error);
        loading.style.display = 'none';
        showMessage('Error loading puppies: ' + error.message, 'error');
    }
}

// Render puppies
function renderPuppies() {
    const puppiesGrid = document.getElementById('puppies-grid');
    puppiesGrid.innerHTML = '';

    puppiesData.forEach(puppy => {
        const card = createPuppyCard(puppy);
        puppiesGrid.appendChild(card);
    });
}

// Create puppy card
function createPuppyCard(puppy) {
    const card = document.createElement('div');
    card.className = 'puppy-card';

    const statusClass = puppy.status || 'available';
    const statusBadge = `<span class="status-badge ${statusClass}">${capitalizeFirst(puppy.status || 'available')}</span>`;

    const age = puppy.dateOfBirth ? calculateAge(puppy.dateOfBirth.toDate ? puppy.dateOfBirth.toDate() : new Date(puppy.dateOfBirth)) : 'Unknown';

    card.innerHTML = `
        <div class="puppy-card-header">
            <div>
                <h3>${escapeHtml(puppy.name || 'Unnamed Puppy')}</h3>
                <div class="puppy-details">
                    <span class="gender-badge ${puppy.gender}">${puppy.gender === 'male' ? '♂ Male' : '♀ Female'}</span>
                    ${statusBadge}
                </div>
            </div>
        </div>
        <div class="puppy-info">
            <p><strong>Age:</strong> ${age}</p>
            <p><strong>Color:</strong> ${escapeHtml(puppy.color || 'Not specified')}</p>
            ${puppy.weight ? `<p><strong>Weight:</strong> ${puppy.weight} lbs</p>` : ''}
            ${puppy.microchip ? `<p><strong>Microchip:</strong> ${escapeHtml(puppy.microchip)}</p>` : ''}
            ${puppy.price ? `<p><strong>Price:</strong> $${puppy.price}</p>` : ''}
        </div>
        <div class="puppy-actions">
            <button onclick="editPuppy('${puppy.id}')" class="btn btn-sm btn-primary">Edit</button>
            <button onclick="deletePuppy('${puppy.id}', '${escapeHtml(puppy.name || 'this puppy')}')" class="btn btn-sm btn-danger">Delete</button>
        </div>
    `;

    return card;
}

// Open modal
function openModal() {
    currentPuppyId = null;
    document.getElementById('form-title').textContent = 'Add New Puppy';
    document.getElementById('puppy-form').reset();
    document.getElementById('modal').style.display = 'flex';
}

// Close modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    currentPuppyId = null;
}

// Edit puppy
window.editPuppy = async function(id) {
    currentPuppyId = id;
    const puppy = puppiesData.find(p => p.id === id);

    if (!puppy) return;

    document.getElementById('form-title').textContent = 'Edit Puppy';
    document.getElementById('puppy-name').value = puppy.name || '';
    document.getElementById('puppy-gender').value = puppy.gender || 'male';
    document.getElementById('puppy-color').value = puppy.color || '';
    document.getElementById('puppy-dob').value = puppy.dateOfBirth ? formatDateForInput(puppy.dateOfBirth.toDate ? puppy.dateOfBirth.toDate() : new Date(puppy.dateOfBirth)) : '';
    document.getElementById('puppy-weight').value = puppy.weight || '';
    document.getElementById('puppy-microchip').value = puppy.microchip || '';
    document.getElementById('puppy-price').value = puppy.price || '';
    document.getElementById('puppy-status').value = puppy.status || 'available';
    document.getElementById('puppy-litter').value = puppy.litterId || '';
    document.getElementById('puppy-notes').value = puppy.notes || '';

    document.getElementById('modal').style.display = 'flex';
};

// Delete puppy
window.deletePuppy = function(id, name) {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
        firebase.firestore()
            .collection('puppies')
            .doc(id)
            .delete()
            .then(() => {
                showMessage('Puppy deleted successfully!');
                loadPuppies();
            })
            .catch((error) => {
                showMessage('Error deleting puppy: ' + error.message, 'error');
            });
    }
};

// Save puppy
document.getElementById('puppy-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const puppyData = {
        name: document.getElementById('puppy-name').value.trim(),
        gender: document.getElementById('puppy-gender').value,
        color: document.getElementById('puppy-color').value.trim(),
        dateOfBirth: firebase.firestore.Timestamp.fromDate(new Date(document.getElementById('puppy-dob').value)),
        weight: parseFloat(document.getElementById('puppy-weight').value) || null,
        microchip: document.getElementById('puppy-microchip').value.trim(),
        price: parseFloat(document.getElementById('puppy-price').value) || null,
        status: document.getElementById('puppy-status').value,
        litterId: document.getElementById('puppy-litter').value || null,
        notes: document.getElementById('puppy-notes').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (currentPuppyId) {
            await firebase.firestore()
                .collection('puppies')
                .doc(currentPuppyId)
                .update(puppyData);
            showMessage('Puppy updated successfully!');
        } else {
            puppyData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await firebase.firestore()
                .collection('puppies')
                .add(puppyData);
            showMessage('Puppy added successfully!');
        }

        closeModal();
        loadPuppies();
    } catch (error) {
        showMessage('Error saving puppy: ' + error.message, 'error');
    }
});

// Helper functions
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);

    const diffTime = Math.abs(today - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
        return `${diffDays} days`;
    } else if (diffDays < 60) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        return months > 0 ? `${years}y ${months}m` : `${years} year${years !== 1 ? 's' : ''}`;
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function showMessage(text, type = 'success') {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';

    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};
