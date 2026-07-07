(function () {
    const tabButtons = document.querySelectorAll('[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    const hamburger = document.getElementById('hamburger-button');
    const sideNav = document.getElementById('side-nav');
    const sideOverlay = document.getElementById('side-nav-overlay');
    const closeSide = document.getElementById('close-side');
    const cartToggle = document.getElementById('cart-toggle');
    const cartPanel = document.getElementById('cart-panel');
    const closeCart = document.getElementById('close-cart');
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartMessage = document.getElementById('cart-message');

    if (!tabButtons.length || !tabContents.length || !cartItems || !cartTotal || !cartCount) {
        return;
    }

    let cart = [];
    const STORAGE_KEY = 'colorau_cart_v1';

    function loadCart() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) cart = JSON.parse(raw);
        } catch (e) {
            cart = [];
        }
    }

    function saveCart() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {
            // ignoring quota errors
        }
    }

    // carrega cart do localStorage ao iniciar
    loadCart();
    const productsGrid = document.getElementById('products-grid');

    // produtos editáveis (valores em centavos)
    const products = [
        { id: 1, name: 'Produto 1', price: 1000, desc: 'Descrição 1' },
        { id: 2, name: 'Produto 2', price: 1500, desc: 'Descrição 2' },
        { id: 3, name: 'Produto 3', price: 2000, desc: 'Descrição 3' },
        { id: 4, name: 'Produto 4', price: 2500, desc: 'Descrição 4' },
        { id: 5, name: 'Produto 5', price: 3000, desc: 'Descrição 5' },
        { id: 6, name: 'Produto 6', price: 3500, desc: 'Descrição 6' },
        { id: 7, name: 'Produto 7', price: 4000, desc: 'Descrição 7' },
        { id: 8, name: 'Produto 8', price: 4500, desc: 'Descrição 8' },
        { id: 9, name: 'Produto 9', price: 5000, desc: 'Descrição 9' },
        { id: 10, name: 'Produto 10', price: 5500, desc: 'Descrição 10' }
    ];

    function renderProducts() {
        if (!productsGrid) return;
        productsGrid.innerHTML = products.map(p => `
            <div class="product-card">
                <div class="product-badge">&nbsp;</div>
                <div class="product-image">Foto</div>
                <h3>${p.name}</h3>
                <p class="product-description">${p.desc}</p>
                <div class="product-price">${formatCurrency(p.price)}</div>
                <button class="buy-button" type="button" data-name="${p.name}" data-price="${p.price}">Adicionar ao carrinho</button>
            </div>
        `).join('');
    }

    // renderiza produtos inicialmente
    renderProducts();

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value / 100);
    }

    function renderCart() {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio.</p>';
            cartCount.textContent = '0';
            cartTotal.textContent = formatCurrency(0);
            return;
        }

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        cartCount.textContent = totalItems;
        cartTotal.textContent = formatCurrency(totalValue);
        cartItems.innerHTML = cart.map((item) => `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong>
                    <p>${formatCurrency(item.price)} cada</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" type="button" data-name="${item.name}" data-action="decrease">−</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" type="button" data-action="increase" data-name="${item.name}">+</button>
                    <button class="remove-btn" type="button" data-name="${item.name}">Remover</button>
                </div>
            </div>
        `).join('');
    }

    function addToCart(name, price) {
        const existingItem = cart.find((item) => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        if (cartMessage) {
            cartMessage.textContent = `${name} adicionado ao carrinho.`;
        }

        renderCart();
        saveCart();
    }

    function updateQuantity(name, action) {
        const item = cart.find((cartItem) => cartItem.name === name);

        if (!item) return;

        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity -= 1;
        }

        if (item.quantity <= 0) {
            cart = cart.filter((cartItem) => cartItem.name !== name);
        }

        renderCart();
        saveCart();
    }

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');

            // remove active from all tab triggers (top nav + side nav)
            tabButtons.forEach((btn) => btn.classList.remove('active'));
            tabContents.forEach((content) => content.classList.remove('active'));

            button.classList.add('active');
            const target = document.getElementById(tab);
            if (target) {
                target.classList.add('active');
            }
        });
    });

    // Side-nav open/close handlers
    function openSideNav(){
        try {
            if (sideNav) { sideNav.setAttribute('aria-hidden','false'); sideNav.hidden = false; }
            if (sideOverlay) sideOverlay.hidden = false;
            if (hamburger) hamburger.setAttribute('aria-expanded','true');
        } catch (err) {
            // fail safely
        }
    }

    function closeSideNav(){
        try {
            if (sideNav) { sideNav.setAttribute('aria-hidden','true'); sideNav.hidden = true; }
            if (sideOverlay) sideOverlay.hidden = true;
            if (hamburger) hamburger.setAttribute('aria-expanded','false');
        } catch (err) {
            // fail safely
        }
    }

    if (hamburger){
        hamburger.addEventListener('click', ()=>{
            const isOpen = sideNav && sideNav.getAttribute('aria-hidden') === 'false';
            if (isOpen) closeSideNav(); else openSideNav();
        });
    }

    if (closeSide){
        closeSide.addEventListener('click', closeSideNav);
    }

    if (sideOverlay){
        sideOverlay.addEventListener('click', closeSideNav);
    }

    // Close side-nav with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSideNav();
    });

    // Delegação de eventos para botões de compra (funciona mesmo com render dinâmico)
    if (productsGrid) {
        productsGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.buy-button');
            if (!btn) return;
            addToCart(btn.dataset.name, Number(btn.dataset.price));
        });
    }

    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            if (cartPanel) {
                cartPanel.hidden = !cartPanel.hidden;
            }
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            if (cartPanel) {
                cartPanel.hidden = true;
            }
        });
    }

    if (cartItems) {
        cartItems.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const name = button.dataset.name;
            const action = button.dataset.action;

            if (action === 'increase' || action === 'decrease') {
                updateQuantity(name, action);
            } else {
                cart = cart.filter((item) => item.name !== name);
                renderCart();
                saveCart();
            }
        });
    }

    renderCart();
})();
