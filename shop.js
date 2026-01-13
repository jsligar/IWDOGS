// Shop functionality for Mount Olympus Irish Wolfhounds

document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.getElementById('products-container');
    const loadingMessage = document.getElementById('loading');
    const noProductsMessage = document.getElementById('no-products');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');
    const cartButton = document.getElementById('cart-button');
    const cartBadge = document.getElementById('cart-badge');

    let allProducts = [];
    let cart = JSON.parse(localStorage.getItem('iwdogs-cart') || '[]');

    // Update cart display
    updateCartBadge();

    // Load products from Firebase
    loadProducts();

    // Filter and sort listeners
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAndDisplayProducts);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', filterAndDisplayProducts);
    }

    // Cart button
    if (cartButton) {
        cartButton.addEventListener('click', viewCart);
    }

    // Update copyright year
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    function loadProducts() {
        if (typeof firebase === 'undefined' || !db) {
            console.error('Firebase not initialized');
            showError('Unable to load products. Please refresh the page.');
            return;
        }

        db.collection('products')
            .where('active', '==', true)
            .get()
            .then((snapshot) => {
                allProducts = [];

                snapshot.forEach((doc) => {
                    allProducts.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                if (allProducts.length === 0) {
                    showNoProducts();
                } else {
                    filterAndDisplayProducts();
                }

                loadingMessage.style.display = 'none';
            })
            .catch((error) => {
                console.error('Error loading products:', error);
                showError('Error loading products. Please try again later.');
                loadingMessage.style.display = 'none';
            });
    }

    function filterAndDisplayProducts() {
        const category = categoryFilter ? categoryFilter.value : 'all';
        const sortBy = sortSelect ? sortSelect.value : 'name';

        // Filter products
        let filtered = category === 'all'
            ? [...allProducts]
            : allProducts.filter(p => p.category === category);

        // Sort products
        filtered.sort((a, b) => {
            switch(sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'newest':
                    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        displayProducts(filtered);
    }

    function displayProducts(products) {
        if (products.length === 0) {
            showNoProducts();
            return;
        }

        productsContainer.innerHTML = '';
        productsContainer.style.display = 'grid';
        noProductsMessage.style.display = 'none';

        products.forEach(product => {
            const card = createProductCard(product);
            productsContainer.appendChild(card);
        });

        // Track page view
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_item_list', {
                'items': products.map(p => ({
                    'id': p.id,
                    'name': p.name,
                    'category': p.category,
                    'price': p.price
                }))
            });
        }
    }

    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        const stock = product.stock || 0;
        const stockClass = stock === 0 ? 'out-of-stock' : (stock < 5 ? 'low-stock' : 'in-stock');
        const stockText = stock === 0 ? 'Out of Stock' : (stock < 5 ? `Only ${stock} left!` : 'In Stock');

        card.innerHTML = `
            <img src="${product.image || 'images/winged-wolfhound-standing.png'}"
                 alt="${product.name}"
                 class="product-image"
                 loading="lazy">
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <p class="product-description">${escapeHtml(product.description || '')}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-stock ${stockClass}">${stockText}</div>
                ${stock > 0 ? `
                    <button class="btn btn-primary" onclick="addToCart('${product.id}', '${escapeHtml(product.name)}', ${product.price})">
                        Add to Cart
                    </button>
                ` : `
                    <button class="btn btn-secondary" disabled>
                        Out of Stock
                    </button>
                `}
            </div>
        `;

        return card;
    }

    function showNoProducts() {
        productsContainer.style.display = 'none';
        noProductsMessage.style.display = 'block';
    }

    function showError(message) {
        productsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-xl); background: #f8d7da; border-radius: 8px; color: #721c24;">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
        productsContainer.style.display = 'grid';
    }

    // Cart functions (global scope for onclick handlers)
    window.addToCart = function(productId, productName, price) {
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: price,
                quantity: 1
            });
        }

        localStorage.setItem('iwdogs-cart', JSON.stringify(cart));
        updateCartBadge();

        // Show feedback
        showNotification(`Added ${productName} to cart!`);

        // Track add to cart event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'add_to_cart', {
                'items': [{
                    'id': productId,
                    'name': productName,
                    'price': price,
                    'quantity': 1
                }]
            });
        }
    };

    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (totalItems > 0) {
            cartButton.style.display = 'flex';
            cartBadge.style.display = 'flex';
            cartBadge.textContent = totalItems;
        } else {
            cartButton.style.display = 'none';
        }
    }

    function viewCart() {
        // For now, show an alert - can be upgraded to a modal or separate page
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemsList = cart.map(item =>
            `${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');

        const message = `Shopping Cart:\n\n${itemsList}\n\nTotal: $${total.toFixed(2)}\n\nTo complete your order, please contact us:\nEmail: iwdogs@yahoo.com\nPhone: (775) 240-1276`;

        alert(message);

        // Track view cart event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_cart', {
                'items': cart.map(item => ({
                    'id': item.id,
                    'name': item.name,
                    'price': item.price,
                    'quantity': item.quantity
                }))
            });
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--wheaten-warm);
            color: var(--slate-darkest);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px var(--shadow-warm);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            font-weight: 600;
        `;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        @keyframes slideIn, @keyframes slideOut {
            from, to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    }
`;
document.head.appendChild(style);
