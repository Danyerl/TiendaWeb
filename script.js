const API_URL = 'http://192.168.1.29:3000/api';

let cart = [];
const productList = document.getElementById('product-list');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout');
const checkoutForm = document.getElementById('checkout-form');
const purchaseForm = document.getElementById('purchase-form');

// Fetch products from the server
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Display products on the page
function displayProducts(products) {
    productList.innerHTML = '';
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 'fade-in');
        productElement.innerHTML = `
            <img src="/placeholder.svg?height=200&width=300" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
                <p class="text-gray-600 mb-4">${product.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold text-indigo-600">$${product.price.toFixed(2)}</span>
                    <button class="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition duration-300 add-to-cart" data-id="${product.id}">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `;
        productList.appendChild(productElement);
    });
}

// Update cart display
function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('flex', 'justify-between', 'items-center', 'mb-2', 'pb-2', 'border-b', 'border-gray-200');
        itemElement.innerHTML = `
            <span>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</span>
            <button class="text-red-500 hover:text-red-700 remove-from-cart" data-id="${item.id}">
                Eliminar
            </button>
        `;
        cartItems.appendChild(itemElement);
        total += item.price * item.quantity;
    });
    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Add item to cart
async function addToCart(productId) {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, quantity: 1 }),
        });
        const addedItem = await response.json();
        const existingItem = cart.find(item => item.id === addedItem.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(addedItem);
        }
        updateCart();
        showNotification(`${addedItem.name} agregado al car rito`);
    } catch (error) {
        console.error('Error adding item to cart:', error);
    }
}

// Remove item from cart
async function removeFromCart(productId) {
    try {
        await fetch(`${API_URL}/cart/${productId}`, {
            method: 'DELETE',
        });
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    } catch (error) {
        console.error('Error removing item from cart:', error);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('fixed', 'bottom-4', 'right-4', 'bg-green-500', 'text-white', 'px-4', 'py-2', 'rounded-full', 'shadow-lg', 'fade-in');
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event listeners
document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('add-to-cart')) {
        const productId = e.target.getAttribute('data-id');
        await addToCart(productId);
    }
    if (e.target.classList.contains('remove-from-cart')) {
        const productId = e.target.getAttribute('data-id');
        await removeFromCart(productId);
    }
});

checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
    } else {
        checkoutForm.classList.remove('hidden');
        checkoutForm.scrollIntoView({ behavior: 'smooth' });
    }
});

purchaseForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(purchaseForm);
    const orderData = {
        name: formData.get('nombre'),
        lastName: formData.get('apellidos'),
        cedula: formData.get('cedula'),
        address: formData.get('direccion'),
    };

    try {
        const response = await fetch(`${API_URL}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        const result = await response.json();
        
        // Clear the cart and hide the form
        cart = [];
        updateCart();
        checkoutForm.classList.add('hidden');

        // Show confirmation message
        showNotification('¡Gracias por tu compra! Se ha procesado tu pedido.');

        // Open WhatsApp with the order details
        window.open(result.whatsappUrl, '_blank');
    } catch (error) {
        console.error('Error processing order:', error);
        alert('Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.');
    }
});

// Initialize the page
fetchProducts();