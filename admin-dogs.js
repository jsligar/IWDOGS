// Dogs Management JavaScript

let currentDogId = null;
let dogsData = [];

// Check authentication
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'admin.html';
        return;
    }
    loadDogs();
});

// Load all dogs
async function loadDogs() {
    const loading = document.getElementById('loading');
    const dogsContainer = document.getElementById('dogs-container');
    const emptyState = document.getElementById('empty-state');
    const dogsGrid = document.getElementById('dogs-grid');

    try {
        const snapshot = await firebase.firestore()
            .collection('dogs')
            .orderBy('createdAt', 'desc')
            .get();

        loading.style.display = 'none';

        if (snapshot.empty) {
            emptyState.style.display = 'block';
            dogsContainer.style.display = 'none';
            return;
        }

        dogsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        emptyState.style.display = 'none';
        dogsContainer.style.display = 'block';

        renderDogs();
    } catch (error) {
        console.error('Error loading dogs:', error);
        loading.style.display = 'none';
        showMessage('Error loading dogs: ' + error.message, 'error');
    }
}

// Render dogs grid
function renderDogs() {
    const dogsGrid = document.getElementById('dogs-grid');
    dogsGrid.innerHTML = '';

    dogsData.forEach(dog => {
        const card = createDogCard(dog);
        dogsGrid.appendChild(card);
    });
}

// Create dog card element
function createDogCard(dog) {
    const card = document.createElement('div');
    card.className = 'dog-card';

    // Calculate age
    let ageText = '';
    if (dog.dateOfBirth) {
        const birthDate = dog.dateOfBirth.toDate ? dog.dateOfBirth.toDate() : new Date(dog.dateOfBirth);
        const age = calculateAge(birthDate);
        ageText = age;
    }

    // Get health tests
    const healthBadges = [];
    if (dog.healthTests?.ofa?.hips?.result) {
        healthBadges.push(`Hips: ${dog.healthTests.ofa.hips.result}`);
    }
    if (dog.healthTests?.ofa?.elbows?.result) {
        healthBadges.push(`Elbows: ${dog.healthTests.ofa.elbows.result}`);
    }
    if (dog.healthTests?.ofa?.heart?.result) {
        healthBadges.push(`Heart: ${dog.healthTests.ofa.heart.result}`);
    }

    // Get titles
    const titles = dog.titles ? (Array.isArray(dog.titles) ? dog.titles.join(', ') : dog.titles) : '';

    card.innerHTML = `
        <div class="dog-card-header">
            <div>
                <h3>${dog.name || 'Unnamed Dog'}</h3>
                ${dog.callName ? `<div class="call-name">"${dog.callName}"</div>` : ''}
            </div>
            <span class="dog-role-badge ${dog.role || 'dam'}">${dog.role || 'dam'}</span>
        </div>

        <div class="dog-info">
            <p><strong>Sex:</strong> ${dog.sex || 'Unknown'}</p>
            ${ageText ? `<p><strong>Age:</strong> ${ageText}</p>` : ''}
            ${dog.color ? `<p><strong>Color:</strong> ${dog.color}</p>` : ''}
            ${titles ? `<p><strong>Titles:</strong> ${titles}</p>` : ''}
            ${dog.registryIds?.akc ? `<p><strong>AKC:</strong> ${dog.registryIds.akc}</p>` : ''}
            <p><strong>Status:</strong> ${dog.status || 'active'}</p>
        </div>

        ${healthBadges.length > 0 ? `
            <div class="health-tests">
                <h4>Health Tests</h4>
                ${healthBadges.map(badge => `<span class="health-badge">${badge}</span>`).join('')}
            </div>
        ` : ''}

        <div class="dog-actions">
            <button class="btn btn-secondary" onclick="editDog('${dog.id}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteDog('${dog.id}', '${dog.name}')">Delete</button>
        </div>
    `;

    return card;
}

// Calculate age from birthdate
function calculateAge(birthDate) {
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();

    if (years === 0) {
        return `${months} months`;
    } else if (months < 0) {
        return `${years - 1} years, ${12 + months} months`;
    } else {
        return `${years} years, ${months} months`;
    }
}

// Show add dog modal
function showAddDogModal() {
    currentDogId = null;
    document.getElementById('modal-title').textContent = 'Add Dog';
    document.getElementById('dog-form').reset();
    document.getElementById('dog-id').value = '';
    document.getElementById('dog-status').value = 'active';
    document.getElementById('dog-modal').classList.add('active');
}

// Edit dog
async function editDog(dogId) {
    const dog = dogsData.find(d => d.id === dogId);
    if (!dog) return;

    currentDogId = dogId;
    document.getElementById('modal-title').textContent = 'Edit Dog';
    document.getElementById('dog-id').value = dogId;

    // Basic info
    document.getElementById('dog-name').value = dog.name || '';
    document.getElementById('dog-call-name').value = dog.callName || '';
    document.getElementById('dog-role').value = dog.role || '';
    document.getElementById('dog-sex').value = dog.sex || '';
    document.getElementById('dog-color').value = dog.color || '';

    // Date of birth
    if (dog.dateOfBirth) {
        const date = dog.dateOfBirth.toDate ? dog.dateOfBirth.toDate() : new Date(dog.dateOfBirth);
        document.getElementById('dog-dob').value = date.toISOString().split('T')[0];
    }

    // Registry
    document.getElementById('dog-akc').value = dog.registryIds?.akc || '';
    document.getElementById('dog-ukc').value = dog.registryIds?.ukc || '';
    document.getElementById('dog-iwca').value = dog.registryIds?.iwca || '';

    // Health tests
    document.getElementById('ofa-hips-result').value = dog.healthTests?.ofa?.hips?.result || '';
    document.getElementById('ofa-hips-cert').value = dog.healthTests?.ofa?.hips?.certNumber || '';
    document.getElementById('ofa-elbows-result').value = dog.healthTests?.ofa?.elbows?.result || '';
    document.getElementById('ofa-elbows-cert').value = dog.healthTests?.ofa?.elbows?.certNumber || '';
    document.getElementById('ofa-heart-result').value = dog.healthTests?.ofa?.heart?.result || '';
    document.getElementById('ofa-heart-cert').value = dog.healthTests?.ofa?.heart?.certNumber || '';

    // Titles
    const titles = dog.titles ? (Array.isArray(dog.titles) ? dog.titles.join(', ') : dog.titles) : '';
    document.getElementById('dog-titles').value = titles;

    // Status
    document.getElementById('dog-status').value = dog.status || 'active';
    document.getElementById('dog-is-public').checked = dog.isPublic || false;

    document.getElementById('dog-modal').classList.add('active');
}

// Delete dog
async function deleteDog(dogId, dogName) {
    if (!confirm(`Are you sure you want to delete ${dogName}? This action cannot be undone.`)) {
        return;
    }

    try {
        await firebase.firestore().collection('dogs').doc(dogId).delete();
        showMessage(`${dogName} has been deleted`, 'success');
        loadDogs();
    } catch (error) {
        console.error('Error deleting dog:', error);
        showMessage('Error deleting dog: ' + error.message, 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('dog-modal').classList.remove('active');
    currentDogId = null;
}

// Handle form submission
document.getElementById('dog-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dogData = {
        name: document.getElementById('dog-name').value.trim(),
        callName: document.getElementById('dog-call-name').value.trim(),
        role: document.getElementById('dog-role').value,
        sex: document.getElementById('dog-sex').value,
        color: document.getElementById('dog-color').value.trim() || null,
        status: document.getElementById('dog-status').value,
        isPublic: document.getElementById('dog-is-public').checked,

        registryIds: {
            akc: document.getElementById('dog-akc').value.trim() || null,
            ukc: document.getElementById('dog-ukc').value.trim() || null,
            iwca: document.getElementById('dog-iwca').value.trim() || null
        },

        healthTests: {
            ofa: {
                hips: {
                    result: document.getElementById('ofa-hips-result').value || null,
                    certNumber: document.getElementById('ofa-hips-cert').value.trim() || null
                },
                elbows: {
                    result: document.getElementById('ofa-elbows-result').value || null,
                    certNumber: document.getElementById('ofa-elbows-cert').value.trim() || null
                },
                heart: {
                    result: document.getElementById('ofa-heart-result').value || null,
                    certNumber: document.getElementById('ofa-heart-cert').value.trim() || null
                }
            }
        },

        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Date of birth
    const dobValue = document.getElementById('dog-dob').value;
    if (dobValue) {
        dogData.dateOfBirth = firebase.firestore.Timestamp.fromDate(new Date(dobValue));
    }

    // Titles
    const titlesValue = document.getElementById('dog-titles').value.trim();
    if (titlesValue) {
        dogData.titles = titlesValue.split(',').map(t => t.trim()).filter(t => t);
    }

    try {
        if (currentDogId) {
            // Update existing dog
            await firebase.firestore()
                .collection('dogs')
                .doc(currentDogId)
                .update(dogData);
            showMessage('Dog updated successfully', 'success');
        } else {
            // Create new dog
            dogData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            dogData.createdBy = firebase.auth().currentUser.uid;

            await firebase.firestore()
                .collection('dogs')
                .add(dogData);
            showMessage('Dog added successfully', 'success');
        }

        closeModal();
        loadDogs();
    } catch (error) {
        console.error('Error saving dog:', error);
        showMessage('Error saving dog: ' + error.message, 'error');
    }
});

// Show message
function showMessage(message, type) {
    const container = document.getElementById('message-container');
    const div = document.createElement('div');
    div.className = type === 'error' ? 'error-message' : 'success-message';
    div.textContent = message;
    container.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 5000);
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Close modal on background click
document.getElementById('dog-modal').addEventListener('click', (e) => {
    if (e.target.id === 'dog-modal') {
        closeModal();
    }
});
