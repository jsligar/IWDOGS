// Litters Management JavaScript

let currentLitterId = null;
let littersData = [];
let dogsData = [];

// Check authentication
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'admin.html';
        return;
    }
    loadDogs();
    loadLitters();
});

// Load dogs for dropdowns
async function loadDogs() {
    try {
        const snapshot = await firebase.firestore()
            .collection('dogs')
            .orderBy('name')
            .get();

        dogsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        populateDogDropdowns();
    } catch (error) {
        console.error('Error loading dogs:', error);
    }
}

// Populate dog dropdowns
function populateDogDropdowns() {
    const damSelect = document.getElementById('litter-dam');
    const sireSelect = document.getElementById('litter-sire');

    // Clear existing options except first
    damSelect.innerHTML = '<option value="">Select Dam...</option>';
    sireSelect.innerHTML = '<option value="">Select Sire...</option>';

    dogsData.forEach(dog => {
        if (dog.sex === 'female' || dog.role === 'dam') {
            const option = document.createElement('option');
            option.value = dog.id;
            option.textContent = dog.name + (dog.callName ? ` "${dog.callName}"` : '');
            damSelect.appendChild(option);
        }

        if (dog.sex === 'male' || dog.role === 'sire') {
            const option = document.createElement('option');
            option.value = dog.id;
            option.textContent = dog.name + (dog.callName ? ` "${dog.callName}"` : '');
            sireSelect.appendChild(option);
        }
    });
}

// Auto-calculate due date from breed date (63 days)
document.getElementById('litter-breed-date').addEventListener('change', (e) => {
    if (e.target.value) {
        const breedDate = new Date(e.target.value);
        const dueDate = new Date(breedDate);
        dueDate.setDate(dueDate.getDate() + 63);
        document.getElementById('litter-due-date').value = dueDate.toISOString().split('T')[0];
    }
});

// Load all litters
async function loadLitters() {
    const loading = document.getElementById('loading');
    const littersContainer = document.getElementById('litters-container');
    const emptyState = document.getElementById('empty-state');
    const littersList = document.getElementById('litters-list');

    try {
        const snapshot = await firebase.firestore()
            .collection('litters')
            .orderBy('createdAt', 'desc')
            .get();

        loading.style.display = 'none';

        if (snapshot.empty) {
            emptyState.style.display = 'block';
            littersContainer.style.display = 'none';
            return;
        }

        littersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        emptyState.style.display = 'none';
        littersContainer.style.display = 'block';

        renderLitters();
    } catch (error) {
        console.error('Error loading litters:', error);
        loading.style.display = 'none';
        showMessage('Error loading litters: ' + error.message, 'error');
    }
}

// Render litters list
function renderLitters() {
    const littersList = document.getElementById('litters-list');
    littersList.innerHTML = '';

    littersData.forEach(litter => {
        const card = createLitterCard(litter);
        littersList.appendChild(card);
    });
}

// Create litter card element
function createLitterCard(litter) {
    const card = document.createElement('div');
    card.className = 'litter-card';

    // Get parent dogs
    const dam = dogsData.find(d => d.id === litter.damId);
    const sire = dogsData.find(d => d.id === litter.sireId);

    const damName = dam ? dam.callName || dam.name : 'Unknown Dam';
    const sireName = sire ? sire.callName || sire.name : 'Unknown Sire';

    // Calculate expected go-home date (8 weeks from whelp)
    let goHomeDate = '';
    if (litter.whelpDate) {
        const whelp = litter.whelpDate.toDate ? litter.whelpDate.toDate() : new Date(litter.whelpDate);
        const goHome = new Date(whelp);
        goHome.setDate(goHome.getDate() + 56); // 8 weeks
        goHomeDate = formatDate(goHome);
    }

    // Get dates
    const breedDate = litter.breedDate ? formatDate(litter.breedDate.toDate ? litter.breedDate.toDate() : new Date(litter.breedDate)) : 'Not set';
    const dueDate = litter.dueDate ? formatDate(litter.dueDate.toDate ? litter.dueDate.toDate() : new Date(litter.dueDate)) : 'Not set';
    const whelpDate = litter.whelpDate ? formatDate(litter.whelpDate.toDate ? litter.whelpDate.toDate() : new Date(litter.whelpDate)) : 'Not yet';

    const females = litter.litterSize && litter.males ? litter.litterSize - litter.males : 'Unknown';

    card.innerHTML = `
        <div class="litter-card-header">
            <div class="litter-title">
                <h3>${damName} × ${sireName}</h3>
                <div class="litter-subtitle">
                    ${litter.theme ? `${litter.theme} Theme` : ''}
                    ${litter.nameSeries ? ` • ${litter.nameSeries}` : ''}
                </div>
            </div>
            <span class="status-badge ${litter.status || 'planned'}">${formatStatus(litter.status || 'planned')}</span>
        </div>

        <div class="litter-info">
            <div class="info-item">
                <label>Breed Date</label>
                <value>${breedDate}</value>
            </div>
            <div class="info-item">
                <label>Due Date</label>
                <value>${dueDate}</value>
            </div>
            <div class="info-item">
                <label>Whelp Date</label>
                <value>${whelpDate}</value>
            </div>
            <div class="info-item">
                <label>Expected Go-Home</label>
                <value>${goHomeDate || 'TBD'}</value>
            </div>
            ${litter.litterSize ? `
                <div class="info-item">
                    <label>Litter Size</label>
                    <value>${litter.litterSize} puppies (${litter.males || 0}M / ${females}F)</value>
                </div>
            ` : ''}
            ${litter.pricing?.pet ? `
                <div class="info-item">
                    <label>Pet Price</label>
                    <value>$${litter.pricing.pet.toLocaleString()}</value>
                </div>
            ` : ''}
        </div>

        ${litter.tasks && litter.tasks.length > 0 ? `
            <div class="litter-tasks">
                <h4>Tasks & Schedule</h4>
                <div class="task-list">
                    ${litter.tasks.slice(0, 5).map(task => createTaskHTML(task, litter.id)).join('')}
                </div>
                ${litter.tasks.length > 5 ? `<p style="color: var(--wheaten-warm); margin-top: 10px; font-size: 13px;">+ ${litter.tasks.length - 5} more tasks</p>` : ''}
            </div>
        ` : ''}

        <div class="litter-actions">
            <button class="btn btn-secondary btn-sm" onclick="editLitter('${litter.id}')">Edit</button>
            <button class="btn btn-secondary btn-sm" onclick="viewPuppies('${litter.id}')">View Puppies</button>
            ${litter.status === 'whelped' && !litter.tasks?.length ? `
                <button class="btn btn-primary btn-sm" onclick="generateTasks('${litter.id}')">Generate Tasks</button>
            ` : ''}
            <button class="btn btn-danger btn-sm" onclick="deleteLitter('${litter.id}', '${damName} × ${sireName}')">Delete</button>
        </div>
    `;

    return card;
}

// Create task HTML
function createTaskHTML(task, litterId) {
    const dueDate = task.dueDate ? (task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate)) : null;
    const isOverdue = dueDate && new Date() > dueDate && task.status !== 'completed';
    const dueDateText = dueDate ? formatDate(dueDate) : 'No date';

    return `
        <div class="task-item ${task.status === 'completed' ? 'completed' : ''}">
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-date ${isOverdue ? 'overdue' : ''}">
                    ${task.status === 'completed' ? '✓ Completed' : dueDateText}
                    ${isOverdue ? ' (Overdue)' : ''}
                </div>
            </div>
            <input type="checkbox"
                   class="task-check"
                   ${task.status === 'completed' ? 'checked' : ''}
                   onchange="toggleTask('${litterId}', '${task.id}', this.checked)">
        </div>
    `;
}

// Format status for display
function formatStatus(status) {
    const statusMap = {
        'planned': 'Planned',
        'confirmed': 'Confirmed',
        'whelped': 'Whelped',
        'vet_cleared': 'Vet Cleared',
        'ready': 'Ready',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
}

// Format date
function formatDate(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Show add litter modal
function showAddLitterModal() {
    currentLitterId = null;
    document.getElementById('modal-title').textContent = 'Add Litter';
    document.getElementById('litter-form').reset();
    document.getElementById('litter-id').value = '';
    document.getElementById('litter-status').value = 'planned';
    document.getElementById('litter-modal').classList.add('active');
}

// Edit litter
async function editLitter(litterId) {
    const litter = littersData.find(l => l.id === litterId);
    if (!litter) return;

    currentLitterId = litterId;
    document.getElementById('modal-title').textContent = 'Edit Litter';
    document.getElementById('litter-id').value = litterId;

    // Parents
    document.getElementById('litter-dam').value = litter.damId || '';
    document.getElementById('litter-sire').value = litter.sireId || '';

    // Info
    document.getElementById('litter-theme').value = litter.theme || '';
    document.getElementById('litter-series').value = litter.nameSeries || '';
    document.getElementById('litter-status').value = litter.status || 'planned';
    document.getElementById('litter-size').value = litter.litterSize || '';
    document.getElementById('litter-males').value = litter.males || '';

    // Dates
    if (litter.breedDate) {
        const date = litter.breedDate.toDate ? litter.breedDate.toDate() : new Date(litter.breedDate);
        document.getElementById('litter-breed-date').value = date.toISOString().split('T')[0];
    }
    if (litter.dueDate) {
        const date = litter.dueDate.toDate ? litter.dueDate.toDate() : new Date(litter.dueDate);
        document.getElementById('litter-due-date').value = date.toISOString().split('T')[0];
    }
    if (litter.whelpDate) {
        const date = litter.whelpDate.toDate ? litter.whelpDate.toDate() : new Date(litter.whelpDate);
        document.getElementById('litter-whelp-date').value = date.toISOString().split('T')[0];
    }

    // Registry
    document.getElementById('litter-akc').value = litter.registryIds?.akc || '';
    document.getElementById('litter-ukc').value = litter.registryIds?.ukc || '';

    // Pricing
    document.getElementById('price-pet').value = litter.pricing?.pet || '';
    document.getElementById('price-show').value = litter.pricing?.show || '';
    document.getElementById('price-breeding').value = litter.pricing?.breeding || '';
    document.getElementById('price-coown').value = litter.pricing?.coOwn || '';

    document.getElementById('litter-is-public').checked = litter.isPublic || false;

    document.getElementById('litter-modal').classList.add('active');
}

// Delete litter
async function deleteLitter(litterId, litterName) {
    if (!confirm(`Are you sure you want to delete ${litterName}? This will not delete the puppies, but they will be unlinked from this litter.`)) {
        return;
    }

    try {
        await firebase.firestore().collection('litters').doc(litterId).delete();
        showMessage('Litter deleted successfully', 'success');
        loadLitters();
    } catch (error) {
        console.error('Error deleting litter:', error);
        showMessage('Error deleting litter: ' + error.message, 'error');
    }
}

// View puppies for litter
function viewPuppies(litterId) {
    window.location.href = `admin-puppies.html?litter=${litterId}`;
}

// Generate tasks for whelped litter
async function generateTasks(litterId) {
    const litter = littersData.find(l => l.id === litterId);
    if (!litter || !litter.whelpDate) {
        showMessage('Litter must have a whelp date to generate tasks', 'error');
        return;
    }

    const whelpDate = litter.whelpDate.toDate ? litter.whelpDate.toDate() : new Date(litter.whelpDate);

    // Standard puppy care tasks
    const tasks = [
        { weekOffset: 0, days: 2, title: 'First Deworming', type: 'deworming' },
        { weekOffset: 0, days: 14, title: 'Second Deworming', type: 'deworming' },
        { weekOffset: 0, days: 21, title: 'Third Deworming', type: 'deworming' },
        { weekOffset: 0, days: 28, title: 'Fourth Deworming', type: 'deworming' },
        { weekOffset: 0, days: 42, title: 'Fifth Deworming', type: 'deworming' },
        { weekOffset: 0, days: 56, title: 'Sixth Deworming', type: 'deworming' },
        { weekOffset: 0, days: 42, title: 'First Vaccination (6 weeks)', type: 'vaccination' },
        { weekOffset: 0, days: 56, title: 'Second Vaccination (8 weeks)', type: 'vaccination' },
        { weekOffset: 0, days: 49, title: '7-Week Vet Check', type: 'vet_check' },
        { weekOffset: 0, days: 49, title: 'Temperament Testing (Volhard)', type: 'temperament' },
        { weekOffset: 0, days: 56, title: 'Microchip Puppies', type: 'microchip' },
        { weekOffset: 0, days: 49, title: 'BAER Testing (if applicable)', type: 'baer' },
        { weekOffset: 0, days: 56, title: 'Go-Home Prep (8 weeks)', type: 'go_home' }
    ];

    const generatedTasks = tasks.map((task, index) => {
        const dueDate = new Date(whelpDate);
        dueDate.setDate(dueDate.getDate() + task.days);

        return {
            id: `task_${Date.now()}_${index}`,
            title: task.title,
            type: task.type,
            dueDate: firebase.firestore.Timestamp.fromDate(dueDate),
            status: 'pending',
            notes: ''
        };
    });

    try {
        await firebase.firestore()
            .collection('litters')
            .doc(litterId)
            .update({
                tasks: generatedTasks,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        showMessage('Tasks generated successfully', 'success');
        loadLitters();
    } catch (error) {
        console.error('Error generating tasks:', error);
        showMessage('Error generating tasks: ' + error.message, 'error');
    }
}

// Toggle task completion
async function toggleTask(litterId, taskId, isCompleted) {
    const litter = littersData.find(l => l.id === litterId);
    if (!litter) return;

    const updatedTasks = litter.tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                status: isCompleted ? 'completed' : 'pending',
                completedDate: isCompleted ? firebase.firestore.Timestamp.now() : null,
                completedBy: isCompleted ? firebase.auth().currentUser.uid : null
            };
        }
        return task;
    });

    try {
        await firebase.firestore()
            .collection('litters')
            .doc(litterId)
            .update({
                tasks: updatedTasks,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        // Update local data
        const litterIndex = littersData.findIndex(l => l.id === litterId);
        if (litterIndex !== -1) {
            littersData[litterIndex].tasks = updatedTasks;
            renderLitters();
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showMessage('Error updating task: ' + error.message, 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('litter-modal').classList.remove('active');
    currentLitterId = null;
}

// Handle form submission
document.getElementById('litter-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const litterData = {
        damId: document.getElementById('litter-dam').value,
        sireId: document.getElementById('litter-sire').value,
        theme: document.getElementById('litter-theme').value.trim() || null,
        nameSeries: document.getElementById('litter-series').value.trim() || null,
        status: document.getElementById('litter-status').value,
        litterSize: parseInt(document.getElementById('litter-size').value) || null,
        males: parseInt(document.getElementById('litter-males').value) || null,
        isPublic: document.getElementById('litter-is-public').checked,

        registryIds: {
            akc: document.getElementById('litter-akc').value.trim() || null,
            ukc: document.getElementById('litter-ukc').value.trim() || null
        },

        pricing: {
            pet: parseInt(document.getElementById('price-pet').value) || null,
            show: parseInt(document.getElementById('price-show').value) || null,
            breeding: parseInt(document.getElementById('price-breeding').value) || null,
            coOwn: parseInt(document.getElementById('price-coown').value) || null
        },

        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Dates
    const breedDate = document.getElementById('litter-breed-date').value;
    if (breedDate) {
        litterData.breedDate = firebase.firestore.Timestamp.fromDate(new Date(breedDate));
    }

    const dueDate = document.getElementById('litter-due-date').value;
    if (dueDate) {
        litterData.dueDate = firebase.firestore.Timestamp.fromDate(new Date(dueDate));
    }

    const whelpDate = document.getElementById('litter-whelp-date').value;
    if (whelpDate) {
        litterData.whelpDate = firebase.firestore.Timestamp.fromDate(new Date(whelpDate));

        // Auto-calculate go-home date (8 weeks)
        const goHomeDate = new Date(whelpDate);
        goHomeDate.setDate(goHomeDate.getDate() + 56);
        litterData.goHomeDate = firebase.firestore.Timestamp.fromDate(goHomeDate);
    }

    try {
        if (currentLitterId) {
            // Update existing litter
            await firebase.firestore()
                .collection('litters')
                .doc(currentLitterId)
                .update(litterData);
            showMessage('Litter updated successfully', 'success');
        } else {
            // Create new litter
            litterData.createdAt = firebase.firestore.FieldValue.serverTimestamp();

            await firebase.firestore()
                .collection('litters')
                .add(litterData);
            showMessage('Litter added successfully', 'success');
        }

        closeModal();
        loadLitters();
    } catch (error) {
        console.error('Error saving litter:', error);
        showMessage('Error saving litter: ' + error.message, 'error');
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
document.getElementById('litter-modal').addEventListener('click', (e) => {
    if (e.target.id === 'litter-modal') {
        closeModal();
    }
});
