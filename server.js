const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory storage (replace with a database in a real application)
let products = [
  { id: 1, name: 'Producto 1', price: 19.99, description: 'Descripción del producto 1' },
  { id: 2, name: 'Producto 2', price: 29.99, description: 'Descripción del producto 2' },
  { id: 3, name: 'Producto 3', price: 39.99, description: 'Descripción del producto 3' },
];

let cart = [];

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Add item to cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === parseInt(productId));
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: quantity || 1
  };

  cart.push(cartItem);
  res.status(201).json(cartItem);
});

// Remove item from cart
app.delete('/api/cart/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = cart.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  cart.splice(index, 1);
  res.status(204).send();
});

// Get cart contents
app.get('/api/cart', (req, res) => {
  res.json(cart);
});

// Process order and generate WhatsApp message
app.post('/api/order', (req, res) => {
  const { name, lastName, cedula, address } = req.body;

  if (!name || !lastName || !cedula || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const order = {
    id: Date.now(),
    customer: { name, lastName, cedula, address },
    items: [...cart],
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  };

  // Generate WhatsApp message
  let message = `Nuevo pedido:\n\n`;
  message += `Nombre: ${name} ${lastName}\n`;
  message += `Cédula: ${cedula}\n`;
  message += `Dirección: ${address}\n\n`;
  message += `Productos:\n`;
  order.items.forEach(item => {
    message += `- ${item.name}: $${item.price.toFixed(2)} x ${item.quantity}\n`;
  });
  message += `\nTotal: $${order.total.toFixed(2)}`;

  // Encode the message for WhatsApp URL
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/+59898964333?text=${encodedMessage}`;

  // Clear the cart after order is processed
  cart = [];

  res.status(201).json({ order, whatsappUrl });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// For demonstration purposes, log the server state
setInterval(() => {
  console.log('Current products:', products);
  console.log('Current cart:', cart);
}, 5000);