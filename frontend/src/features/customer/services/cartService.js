// service keranjang pake LOCAL STORAGE (bukan database)

const CART_KEY = 'rental_cart';

// ambil data keranjang dari localStorage
const getCartFromStorage = () => {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

// simpan keranjang ke localStorage + kirim event buat update badge Navbar
const saveCartToStorage = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Dispatch custom event agar Navbar badge langsung update
  window.dispatchEvent(new CustomEvent('cart-updated'));
};

export const cartService = {
  // ambil semua item di keranjang
  async getCart() {
    const cart = getCartFromStorage();
    return { data: cart };
  },

  // tambah item ke keranjang
  async addToCart(item) {
    const cart = getCartFromStorage();
    const existingIndex = cart.findIndex(i => i.id_barang === item.id_barang);
    
    // Jika barang sudah ada di keranjang, jangan tambah lagi (hindari duplikat)
    if (existingIndex !== -1) {
      return { data: cart, alreadyExists: true };
    }
    
    // Pastikan jumlah selalu 1 saat pertama kali ditambahkan
    item.jumlah = 1;
    item.total_harga = Number(item.harga_sewa) * item.jumlah * (item.total_hari || 1);
    cart.push(item);
    
    saveCartToStorage(cart);
    return { data: cart };
  },

  // update jumlah item di keranjang
  async updateCartItem(cartId, data) {
    const cart = getCartFromStorage();
    const index = cart.findIndex(i => i.id_cart === cartId);
    if (index !== -1) {
      cart[index].jumlah = data.jumlah;
      cart[index].total_harga = Number(cart[index].harga_sewa) * cart[index].jumlah * (cart[index].total_hari || 1);
      saveCartToStorage(cart);
    }
    return { data: cart };
  },

  // hapus item dari keranjang
  async removeFromCart(cartId) {
    let cart = getCartFromStorage();
    cart = cart.filter(item => item.id_cart !== cartId);
    saveCartToStorage(cart);
    return { data: cart };
  },

  // kosongkan keranjang
  async clearCart() {
    localStorage.removeItem(CART_KEY);
    return { data: [] };
  },

  // checkout (kosongkan keranjang setelah checkout)
  async checkoutMulti(data) {
    // simulasi proses checkout
    const cart = getCartFromStorage();
    const selectedItems = cart.filter(item => data.cart_ids.includes(item.id_cart));
    
    // hitung total
    const total = selectedItems.reduce((sum, item) => sum + item.total_harga, 0);
    const shipping = data.shipping_cost || 0;
    
    // hapus item yg udah checkout dari keranjang
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