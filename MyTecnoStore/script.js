let cart = JSON.parse(localStorage.getItem('cart')) || [];
const SHIPPING_COST = 99;
const FREE_SHIPPING_THRESHOLD = 500;

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(id, name, price, emoji) {
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      emoji: emoji,
      quantity: 1
    });
  }
  
  updateCartCount();
  saveCart();
  showNotification(`${name} agregado al carrito`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartCount();
  updateCartDisplay();
  saveCart();
}

function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(id);
    } else {
      updateCartCount();
      updateCartDisplay();
      saveCart();
    }
  }
}

function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  } else {
    console.warn('Elemento #cartCount no encontrado');
  }
}

function calculateTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function openCart() {
  const modal = document.getElementById('cartModal');
  if (modal) {
    updateCartDisplay();
    modal.style.display = 'block';
  } else {
    console.warn('Elemento #cartModal no encontrado');
  }
}

function closeCart() {
  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.style.display = 'none';
  } else {
    console.warn('Elemento #cartModal no encontrado');
  }
}

function updateCartDisplay() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartSummaryContainer = document.getElementById('cartSummary');

  if (!cartItemsContainer || !cartSummaryContainer) {
    console.warn('Elementos #cartItems o #cartSummary no encontrados');
    return;
  }

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart"><h3>Tu carrito está vacío</h3><p>¡Agrega algunos productos increíbles!</p></div>';
    cartSummaryContainer.innerHTML = '';
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div style="font-size: 2rem;">${item.emoji}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-price">$${item.price.toLocaleString()} MXN</div>
      </div>
      <div class="quantity-controls">
        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
        <span class="quantity">${item.quantity}</span>
        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">Eliminar</button>
      </div>
    </div>
  `).join('');

  const subtotal = calculateTotal();
  const needsShipping = subtotal < FREE_SHIPPING_THRESHOLD;
  const shipping = needsShipping ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  cartSummaryContainer.innerHTML = `
    <div class="summary-row">
      <span>Subtotal:</span>
      <span>$${subtotal.toLocaleString()} MXN</span>
    </div>
    <div class="summary-row">
      <span>Envío:</span>
      <span>${needsShipping ? `$${shipping} MXN` : 'GRATIS'}</span>
    </div>
    ${!needsShipping ? '<div class="free-shipping">🎉 ¡ENVÍO GRATIS!</div>' : `<div style="color: #0077cc; font-size: 0.9rem; text-align: center; margin: 10px 0;">Compra $${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} MXN más para envío gratis</div>`}
    <div class="summary-row total-row">
      <span>Total:</span>
      <span>$${total.toLocaleString()} MXN</span>
    </div>
    <button class="checkout-btn" onclick="checkout()">Proceder al Pago</button>
  `;
}

function checkout() {
  if (cart.length === 0) return;
  
  const total = calculateTotal();
  const shipping = total < FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
  const finalTotal = total + shipping;
  
  alert(`¡Gracias por tu compra!\n\nTotal: $${finalTotal.toLocaleString()} MXN\n${shipping === 0 ? 'Con envío gratis 🎉' : `Costo de envío: $${shipping} MXN`}\n\nEn un proyecto real, aquí se procesaría el pago.`);
  
  cart = [];
  saveCart();
  updateCartCount();
  closeCart();
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background-color: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 1001;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

window.onclick = function(event) {
  const modal = document.getElementById('cartModal');
  if (event.target === modal) {
    closeCart();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
});