// Orders Management JavaScript

let ordersData = [];

firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'admin.html';
        return;
    }
    loadOrders();
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
    firebase.auth().signOut().then(() => window.location.href = 'admin.html');
});

async function loadOrders() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('orders-container');
    const emptyState = document.getElementById('empty-state');

    try {
        const snapshot = await firebase.firestore()
            .collection('orders')
            .orderBy('orderDate', 'desc')
            .get();

        loading.style.display = 'none';

        if (snapshot.empty) {
            emptyState.style.display = 'block';
            container.style.display = 'none';
            return;
        }

        ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        emptyState.style.display = 'none';
        container.style.display = 'block';
        renderOrders();
    } catch (error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        showMessage('Error loading orders: ' + error.message, 'error');
    }
}

function renderOrders() {
    const grid = document.getElementById('orders-grid');
    grid.innerHTML = '';

    ordersData.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        const date = order.orderDate ? new Date(order.orderDate.toDate ? order.orderDate.toDate() : order.orderDate).toLocaleDateString() : 'Unknown';
        const status = order.status || 'pending';

        card.innerHTML = `
            <div class="order-header">
                <h3>Order #${order.id.substring(0, 8).toUpperCase()}</h3>
                <span class="status-badge ${status}">${capitalizeFirst(status)}</span>
            </div>
            <div class="order-info">
                <p><strong>Customer:</strong> ${escapeHtml(order.customerName || 'Unknown')}</p>
                <p><strong>Email:</strong> ${escapeHtml(order.email || 'N/A')}</p>
                <p><strong>Puppy:</strong> ${escapeHtml(order.puppyName || 'Not specified')}</p>
                <p><strong>Amount:</strong> $${order.amount || 0}</p>
                <p><strong>Order Date:</strong> ${date}</p>
                ${order.depositPaid ? '<p class="deposit-badge">✓ Deposit Paid</p>' : ''}
            </div>
            <div class="order-actions">
                <button onclick="updateOrderStatus('${order.id}')" class="btn btn-sm btn-primary">Update Status</button>
                <button onclick="deleteOrder('${order.id}')" class="btn btn-sm btn-danger">Delete</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

window.updateOrderStatus = async function(id) {
    const status = prompt('Enter status (pending/deposit-paid/completed/cancelled):');
    if (!status || !['pending', 'deposit-paid', 'completed', 'cancelled'].includes(status.toLowerCase())) {
        alert('Invalid status');
        return;
    }

    try {
        await firebase.firestore()
            .collection('orders')
            .doc(id)
            .update({ status: status.toLowerCase() });
        showMessage('Status updated!');
        loadOrders();
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
};

window.deleteOrder = function(id) {
    if (confirm('Delete this order?')) {
        firebase.firestore().collection('orders').doc(id).delete()
            .then(() => { showMessage('Order deleted!'); loadOrders(); })
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
