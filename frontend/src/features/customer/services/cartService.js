// Cart service menggunakan LOCAL STORAGE (bukan database)

const CART_KEY = 'rental_cart';

// Get cart from localStorage
const getCartFromStorage = () => {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

// Save cart to localStorage + dispatch event untuk update Navbar badge
const saveCartToStorage = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Dispatch custom event agar Navbar badge langsung update
  window.dispatchEvent(new CustomEvent('cart-updated'));
};

export const cartService = {
  // Get all cart items
  async getCart() {
    const cart = getCartFromStorage();
    return { data: cart };
  },

  // Add item to cart
  async addToCart(item) {
    const cart = getCartFromStorage();
    const existingIndex = cart.findIndex(i => i.id_barang === item.id_barang);
    
    if (existingIndex !== -1) {
      cart[existingIndex].jumlah += item.jumlah;
      cart[existingIndex].total_harga = cart[existingIndex].harga_sewa * cart[existingIndex].jumlah * cart[existingIndex].total_hari;
    } else {
      cart.push(item);
    }
    
    saveCartToStorage(cart);
    return { data: cart };
  },

  // Update cart item quantity
  async updateCartItem(cartId, data) {
    const cart = getCartFromStorage();
    const index = cart.findIndex(i => i.id_cart === cartId);
    if (index !== -1) {
      cart[index].jumlah = data.jumlah;
      cart[index].total_harga = cart[index].harga_sewa * cart[index].jumlah * cart[index].total_hari;
      saveCartToStorage(cart);
    }
    return { data: cart };
  },

  // Remove item from cart
  async removeFromCart(cartId) {
    let cart = getCartFromStorage();
    cart = cart.filter(item => item.id_cart !== cartId);
    saveCartToStorage(cart);
    return { data: cart };
  },

  // Clear cart
  async clearCart() {
    localStorage.removeItem(CART_KEY);
    return { data: [] };
  },

  // Checkout (clear cart after checkout)
  async checkoutMulti(data) {
    // Simulate checkout process
    const cart = getCartFromStorage();
    const selectedItems = cart.filter(item => data.cart_ids.includes(item.id_cart));
    
    // Calculate total
    const total = selectedItems.reduce((sum, item) => sum + item.total_harga, 0);
    const shipping = data.shipping_cost || 0;
    
    // Clear checked out items from cart
    const remainingCart = cart.filter(item => !data.cart_ids.includes(item.id_cart));
    saveCartToStorage(remainingCart);
    
    return {
      data: {
        transaction_id: Date.now(),
        total: total + shipping,
        items: selectedItems
      }
    };
  }
};