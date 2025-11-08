// Dashboard JavaScript - Manage Contact Form Submissions

let currentUser = null;
let submissions = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            console.log('User logged in:', user.email);
            loadSubmissions();
        } else {
            // Not logged in, redirect to login page
            window.location.href = 'admin.html';
        }
    });

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            firebase.auth().signOut().then(() => {
                window.location.href = 'admin.html';
            }).catch((error) => {
                console.error('Logout error:', error);
                alert('Error logging out. Please try again.');
            });
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadSubmissions);
    }

    // Export to Excel button
    const exportBtn = document.getElementById('export-excel');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToExcel);
    }
});

// Load submissions from Firestore
function loadSubmissions() {
    showLoading();

    firebase.firestore().collection('contact-submissions')
        .orderBy('timestamp', 'desc')
        .get()
        .then((querySnapshot) => {
            submissions = [];

            querySnapshot.forEach((doc) => {
                submissions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            displaySubmissions();
            updateStats();
            hideLoading();
        })
        .catch((error) => {
            console.error('Error loading submissions:', error);
            hideLoading();
            alert('Error loading submissions. Please refresh the page.');
        });
}

// Display submissions in table
function displaySubmissions() {
    const tbody = document.getElementById('submissions-body');
    const table = document.getElementById('submissions-table');
    const noSubmissions = document.getElementById('no-submissions');

    if (submissions.length === 0) {
        table.style.display = 'none';
        noSubmissions.style.display = 'block';
        return;
    }

    table.style.display = 'block';
    noSubmissions.style.display = 'none';

    tbody.innerHTML = '';

    submissions.forEach((submission, index) => {
        const row = document.createElement('tr');

        const timestamp = submission.timestamp ?
            new Date(submission.timestamp).toLocaleString() :
            'N/A';

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${timestamp}</td>
            <td>${escapeHtml(submission.name || 'N/A')}</td>
            <td><a href="mailto:${submission.email}">${escapeHtml(submission.email || 'N/A')}</a></td>
            <td>${escapeHtml(submission.phone || 'N/A')}</td>
            <td class="submission-message" title="${escapeHtml(submission.message || '')}">${escapeHtml(submission.message || 'N/A')}</td>
            <td>
                <button class="delete-btn" onclick="deleteSubmission('${submission.id}')">Delete</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// Update statistics
function updateStats() {
    const totalEl = document.getElementById('total-submissions');
    const weekEl = document.getElementById('week-submissions');
    const todayEl = document.getElementById('today-submissions');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let todayCount = 0;
    let weekCount = 0;

    submissions.forEach(submission => {
        if (submission.timestamp) {
            const subDate = new Date(submission.timestamp);
            if (subDate >= todayStart) {
                todayCount++;
            }
            if (subDate >= weekStart) {
                weekCount++;
            }
        }
    });

    totalEl.textContent = submissions.length;
    weekEl.textContent = weekCount;
    todayEl.textContent = todayCount;
}

// Delete submission
function deleteSubmission(id) {
    if (!confirm('Are you sure you want to delete this submission? This cannot be undone.')) {
        return;
    }

    firebase.firestore().collection('contact-submissions').doc(id).delete()
        .then(() => {
            console.log('Submission deleted:', id);
            loadSubmissions(); // Reload the list
        })
        .catch((error) => {
            console.error('Error deleting submission:', error);
            alert('Error deleting submission. Please try again.');
        });
}

// Export to Excel
function exportToExcel() {
    if (submissions.length === 0) {
        alert('No submissions to export.');
        return;
    }

    // Prepare data for Excel
    const excelData = submissions.map((sub, index) => ({
        'Submission #': index + 1,
        'Date & Time': sub.timestamp ? new Date(sub.timestamp).toLocaleString() : 'N/A',
        'Name': sub.name || 'N/A',
        'Email': sub.email || 'N/A',
        'Phone': sub.phone || 'N/A',
        'Message': sub.message || 'N/A'
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

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show/hide loading
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('submissions-table').style.display = 'none';
    document.getElementById('no-submissions').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Make deleteSubmission available globally
window.deleteSubmission = deleteSubmission;
