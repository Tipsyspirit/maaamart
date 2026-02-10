// ============================================
// GLOBAL STATE & DATA
// ============================================

const users = {
    customer: { username: 'customer', password: 'customer123', role: 'customer' },
    staff: { username: 'staff', password: 'staff123', role: 'staff' },
    manager: { username: 'manager', password: 'manager123', role: 'manager' }
};

let currentUser = null;
let cart = [];

const products = [
    { id: 1, name: 'Amul Gold Milk', category: 'dairy', desc: '1L Full Cream Milk Pouch', price: 55, stock: 145, minLevel: 50, supplier: 'Amul Dairy', emoji: '🥛', status: 'in-stock' },
    { id: 2, name: 'Fresh Tomatoes', category: 'produce', desc: 'Premium grade, per kg', price: 40, stock: 89, minLevel: 30, supplier: 'Local Farms Co.', emoji: '🍅', status: 'in-stock' },
    { id: 3, name: 'White Bread Loaf', category: 'bakery', desc: 'Britannia - 400g pack', price: 40, stock: 22, minLevel: 40, supplier: 'Britannia Foods', emoji: '🍞', status: 'low-stock' },
    { id: 4, name: 'Coca-Cola', category: 'beverages', desc: '2L PET Bottle', price: 90, stock: 67, minLevel: 25, supplier: 'Coca-Cola India', emoji: '🥤', status: 'in-stock' },
    { id: 5, name: 'Mother Dairy Curd', category: 'dairy', desc: '400g Cup', price: 35, stock: 18, minLevel: 35, supplier: 'Mother Dairy', emoji: '🥛', status: 'low-stock' },
    { id: 6, name: 'Lays Classic Chips', category: 'snacks', desc: '52g Family Pack', price: 20, stock: 0, minLevel: 60, supplier: 'PepsiCo India', emoji: '🍪', status: 'out-of-stock' },
    { id: 7, name: 'Fresh Onions', category: 'produce', desc: 'Premium quality, per kg', price: 30, stock: 112, minLevel: 40, supplier: 'Local Farms Co.', emoji: '🧅', status: 'in-stock' },
    { id: 8, name: 'Real Mango Juice', category: 'beverages', desc: '1L Tetra Pack', price: 125, stock: 15, minLevel: 30, supplier: 'Dabur India', emoji: '🧃', status: 'low-stock' }
];

// ============================================
// LOGIN FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userType = document.getElementById('userType').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (users[userType] && users[userType].username === username && users[userType].password === password) {
                currentUser = users[userType];
                showPage(userType + 'Page');
                
                // Initialize the appropriate interface
                if (userType === 'customer') {
                    initCustomerInterface();
                } else if (userType === 'staff') {
                    initStaffInterface();
                } else if (userType === 'manager') {
                    initManagerInterface();
                }
            } else {
                alert('Invalid credentials! Please check username and password.');
            }
        });
    }
});

function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function logout() {
    currentUser = null;
    cart = [];
    showPage('loginPage');
    
    // Reset login form
    document.getElementById('loginForm').reset();
}

// ============================================
// CUSTOMER INTERFACE FUNCTIONS
// ============================================

function initCustomerInterface() {
    renderProducts();
    setupCategoryFilters();
    setupCustomerSearch();
}

function renderProducts(filter = 'all') {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    
    const filteredProducts = filter === 'all' 
        ? products 
        : products.filter(p => p.category === filter);
    
    filteredProducts.forEach((product, index) => {
        const isOutOfStock = product.stock === 0;
        const stockClass = product.stock === 0 ? 'out-of-stock' : (product.stock < product.minLevel ? 'low-stock' : 'in-stock');
        const stockText = product.stock === 0 ? 'Out of Stock' : (product.stock < product.minLevel ? 'Low Stock' : 'In Stock');
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-desc">${product.desc}</div>
                <span class="stock-badge ${stockClass}">${stockText}</span>
                <div class="product-footer">
                    <div class="product-price">₹${product.price}</div>
                    <button class="add-to-cart-btn" ${isOutOfStock ? 'disabled' : ''} onclick="addToCart(${product.id})">
                        ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

function getCategoryName(category) {
    const names = {
        dairy: 'Dairy & Eggs',
        produce: 'Fresh Produce',
        bakery: 'Bakery',
        beverages: 'Beverages',
        snacks: 'Snacks'
    };
    return names[category] || category;
}

function setupCategoryFilters() {
    const categoryChips = document.querySelectorAll('#customerPage .category-chip');
    categoryChips.forEach(chip => {
        chip.addEventListener('click', function() {
            categoryChips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            renderProducts(category);
        });
    });
}

function setupCustomerSearch() {
    const searchInput = document.getElementById('customerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const productCards = document.querySelectorAll('#customerPage .product-card');
            
            productCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Your cart is empty</p>';
        if (cartSubtotal) cartSubtotal.textContent = '₹0';
        if (cartTotal) cartTotal.textContent = '₹0';
        return;
    }
    
    cartItems.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">${item.emoji}</div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    if (cartSubtotal) cartSubtotal.textContent = `₹${subtotal}`;
    if (cartTotal) cartTotal.textContent = `₹${subtotal}`;
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    
    updateCartDisplay();
    updateCartCount();
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// ============================================
// STAFF INTERFACE FUNCTIONS
// ============================================

function initStaffInterface() {
    renderInventoryTable();
    setupStaffFilters();
}

function renderInventoryTable(searchTerm = '', categoryFilter = '', statusFilter = '') {
    const inventoryTable = document.getElementById('inventoryTable');
    if (!inventoryTable) return;
    
    inventoryTable.innerHTML = '';
    
    let filteredProducts = products;
    
    // Apply search filter
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getCategoryName(p.category).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // Apply category filter
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
        filteredProducts = filteredProducts.filter(p => p.status === statusFilter);
    }
    
    filteredProducts.forEach(product => {
        const statusClass = product.stock === 0 ? 'status-out-of-stock' : 
                           (product.stock < product.minLevel ? 'status-low-stock' : 'status-in-stock');
        const statusText = product.stock === 0 ? 'Out of Stock' : 
                          (product.stock < product.minLevel ? 'Low Stock' : 'In Stock');
        
        const row = document.createElement('tr');
        row.setAttribute('data-category', product.category);
        row.setAttribute('data-status', product.status);
        row.innerHTML = `
            <td>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-desc">${product.desc}</div>
                </div>
            </td>
            <td><span class="category-tag">${getCategoryName(product.category)}</span></td>
            <td>${product.supplier}</td>
            <td><span class="stock-level">${product.stock}</span></td>
            <td>${product.minLevel}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td><button class="action-btn" onclick="openRestockModal('${product.name}', ${product.id})">Restock</button></td>
        `;
        inventoryTable.appendChild(row);
    });
}

function setupStaffFilters() {
    const searchInput = document.getElementById('staffSearchInput');
    const categoryFilter = document.getElementById('staffCategoryFilter');
    const statusFilter = document.getElementById('staffStatusFilter');
    
    function applyFilters() {
        const search = searchInput ? searchInput.value : '';
        const category = categoryFilter ? categoryFilter.value : '';
        const status = statusFilter ? statusFilter.value : '';
        renderInventoryTable(search, category, status);
    }
    
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
}

function openRestockModal(productName, productId) {
    const modal = document.getElementById('restockModal');
    const productNameInput = document.getElementById('restockProductName');
    
    if (modal && productNameInput) {
        productNameInput.value = productName;
        productNameInput.setAttribute('data-product-id', productId);
        modal.classList.add('active');
    }
}

function closeRestockModal() {
    const modal = document.getElementById('restockModal');
    const form = document.getElementById('restockForm');
    
    if (modal) modal.classList.remove('active');
    if (form) form.reset();
}

// Setup restock form submission
document.addEventListener('DOMContentLoaded', function() {
    const restockForm = document.getElementById('restockForm');
    
    if (restockForm) {
        restockForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const quantity = document.getElementById('restockQuantity').value;
            const productNameInput = document.getElementById('restockProductName');
            const productId = parseInt(productNameInput.getAttribute('data-product-id'));
            
            // Update product stock
            const product = products.find(p => p.id === productId);
            if (product) {
                product.stock += parseInt(quantity);
                
                // Update status
                if (product.stock === 0) {
                    product.status = 'out-of-stock';
                } else if (product.stock < product.minLevel) {
                    product.status = 'low-stock';
                } else {
                    product.status = 'in-stock';
                }
                
                // Refresh inventory table
                renderInventoryTable();
            }
            
            alert(`Restock order placed for ${quantity} units. Stock updated successfully!`);
            closeRestockModal();
        });
    }
});

// Close modal on background click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('restockModal');
    if (e.target === modal) {
        closeRestockModal();
    }
});

// ============================================
// MANAGER INTERFACE FUNCTIONS
// ============================================

function initManagerInterface() {
    // Manager interface is mostly static, but we can add dynamic features here if needed
    console.log('Manager interface initialized');
}

function switchManagerTab(tabName) {
    // Hide all tab contents
    const contents = document.querySelectorAll('#managerPage .tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('#managerPage .tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    const targetContent = document.getElementById(`manager-${tabName}`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Make functions globally available
window.logout = logout;
window.addToCart = addToCart;
window.toggleCart = toggleCart;
window.updateQuantity = updateQuantity;
window.openRestockModal = openRestockModal;
window.closeRestockModal = closeRestockModal;
window.switchManagerTab = switchManagerTab;