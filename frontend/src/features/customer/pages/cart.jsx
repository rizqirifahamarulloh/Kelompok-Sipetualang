import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cartService } from "../services/cartService";
import api from "@/services/api";
import { getStorageUrl } from "@/utils/storageUrl";
import Navbar from "@/features/landing/components/Navbar";
import Footer from "@/features/landing/components/Footer";
import KtpVerificationModal from "@/components/KtpVerificationModal";

import {
  Loader2,
  Trash2,
  ShoppingBag,
  Store,
  ShieldCheck,
  CreditCard,
  Minus,
  Plus,
  ArrowRight,
  Truck,
} from "lucide-react";

const storeLocation = {
  name: "SiPetualang Rental Center",
  address: "Jl. Merdeka No. 123, Jakarta Pusat, 10340",
};

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [processing, setProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isKtpModalOpen, setIsKtpModalOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.alamat || "");

  // Load Midtrans Snap.js
  useEffect(() => {
    if (!window.snap) {
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', 'Mid-client-4bv4cHzWqRv44v7s');
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // LOAD CART
  const loadCart = async () => {
    try {
      setIsLoading(true);

      const response = await cartService.getCart();
      const cartData = response.data || [];

      setCart(cartData);

      const initialSelected = {};

      cartData.forEach((item) => {
        initialSelected[item.id_cart] = true;
      });

      setSelectedItems(initialSelected);
    } catch {
      console.log("Gagal load cart");
    } finally {
      setIsLoading(false);
    }
  };

  // FIX ESLINT MERAH
  useEffect(() => {
    Promise.resolve().then(() => {
      loadCart();
    });
  }, []);

  // REMOVE ITEM
  const handleRemoveItem = async (cartId) => {
    if (!confirm("Hapus item ini?")) return;

    try {
      await cartService.removeFromCart(cartId);

      setCart((prev) =>
        prev.filter((item) => item.id_cart !== cartId)
      );

      setSelectedItems((prev) => {
        const updated = { ...prev };
        delete updated[cartId];
        return updated;
      });
    } catch {
      alert("Gagal menghapus item");
    }
  };

  // UPDATE QUANTITY
  const handleUpdateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await cartService.updateCartItem(cartId, {
        jumlah: newQuantity,
      });

      setCart((prev) =>
        prev.map((item) => {
          if (item.id_cart === cartId) {
            const total =
              Number(item.harga_sewa) * newQuantity;

            return {
              ...item,
              jumlah: newQuantity,
              total_harga: total,
            };
          }

          return item;
        })
      );
    } catch {
      alert("Gagal update jumlah");
    }
  };

  // SELECT ITEM
  const handleToggleSelect = (cartId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [cartId]: !prev[cartId],
    }));
  };

  // SELECT ALL
  const handleSelectAll = () => {
    const allSelected =
      cart.length > 0 &&
      cart.every((item) => selectedItems[item.id_cart]);

    const updated = {};

    cart.forEach((item) => {
      updated[item.id_cart] = !allSelected;
    });

    setSelectedItems(updated);
  };

  const isAllSelected = useMemo(() => {
    return (
      cart.length > 0 &&
      cart.every((item) => selectedItems[item.id_cart])
    );
  }, [cart, selectedItems]);

  const isAnySelected = useMemo(() => {
    return Object.values(selectedItems).some(Boolean);
  }, [selectedItems]);

  const getSelectedTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      if (selectedItems[item.id_cart]) {
        return total + Number(item.total_harga || 0);
      }

      return total;
    }, 0);
  }, [cart, selectedItems]);

  const getSelectedDepositTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      if (selectedItems[item.id_cart]) {
        return total + (Number(item.nominal_deposit || 0) * Number(item.jumlah || 1));
      }
      return total;
    }, 0);
  }, [cart, selectedItems]);

  // CHECKOUT - Proses pembayaran melalui Midtrans
  const handleCheckout = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    const isApproved = user?.is_verified === true || user?.is_verified === 1 || user?.is_verified === 'true' || user?.verification_status === 'disetujui';
    if (!isApproved) {
      setIsKtpModalOpen(true);
      return;
    }

    const selected = cart.filter(
      (item) => selectedItems[item.id_cart]
    );

    if (selected.length === 0) {
      alert("Pilih minimal satu barang!");
      return;
    }

    if (!window.snap) {
      alert("Midtrans belum siap, silakan coba lagi dalam beberapa detik.");
      return;
    }

    setProcessing(true);

    try {
      // Build batch checkout payload — all items in 1 request
      const checkoutData = {
        items: selected.map((item) => ({
          id_barang: item.id_barang,
          jumlah: item.jumlah,
          tanggal_mulai: item.tanggal_mulai,
          tanggal_selesai: item.tanggal_selesai,
        })),
        metode_pengiriman: deliveryMethod,
        alamat_pengiriman: deliveryMethod === "delivery" ? deliveryAddress : null,
        biaya_pengiriman: 0,
      };

      // Single API call for all items → 1 transaksi + 1 snap token
      const response = await api.post('/customer/transaksi/checkout', checkoutData);
      const snapToken = response.data.snap_token;

      if (!snapToken) {
        alert("Gagal mendapatkan token pembayaran");
        setProcessing(false);
        return;
      }

      // Single Midtrans popup for all items
      await new Promise((resolve, reject) => {
        window.snap.pay(snapToken, {
          onSuccess: async () => {
            // Remove all checked-out items from localStorage cart
            for (const item of selected) {
              await cartService.removeFromCart(item.id_cart);
            }
            resolve();
          },
          onPending: async () => {
            // Still remove from cart on pending
            for (const item of selected) {
              await cartService.removeFromCart(item.id_cart);
            }
            resolve();
          },
          onError: (err) => {
            console.error("Pembayaran gagal:", err);
            reject(new Error("Pembayaran gagal"));
          },
          onClose: () => {
            resolve();
          },
        });
      });

      // Reload cart after checkout
      await loadCart();

      // Navigate to transactions page
      navigate("/customer/transactions");

    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        "Gagal checkout: " +
          (error.response?.data?.message || error.response?.data?.error || error.message)
      );
    } finally {
      setProcessing(false);
    }
  };

  // LOADING
  if (isLoading) {
    return (
      <div className="bg-[#f5f7fb] min-h-screen">
        <Navbar />

        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-14 h-14 animate-spin text-emerald-500 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              Memuat keranjang...
            </p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // BELUM LOGIN
  if (!user) {
    return (
      <div className="bg-[#f5f7fb] min-h-screen">
        <Navbar />

        <div className="min-h-screen flex items-center justify-center px-5">
          <div className="bg-white p-10 rounded-[30px] shadow-xl text-center max-w-md w-full">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-5" />

            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Login Dulu
            </h1>

            <p className="text-gray-500 text-sm mb-7">
              Kamu harus login untuk melihat keranjang rental.
            </p>

            <Link
              to="/login"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-7 py-3 rounded-2xl font-semibold inline-flex items-center gap-2 no-underline"
            >
              Login Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // CART KOSONG
  if (cart.length === 0) {
    return (
      <div className="bg-[#f5f7fb] min-h-screen">
        <Navbar />

        <div className="min-h-screen flex items-center justify-center px-5">
          <div className="bg-white p-10 rounded-[30px] shadow-xl text-center max-w-md w-full">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-5" />

            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Keranjang Kosong
            </h1>

            <p className="text-gray-500 text-sm mb-7">
              Yuk cari alat petualangan favoritmu sekarang.
            </p>

            <Link
              to="/sewa-alat"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-7 py-3 rounded-2xl font-semibold inline-flex items-center gap-2 no-underline"
            >
              Mulai Rental
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-20">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Keranjang Rental
          </h1>

          <p className="text-gray-500 text-sm">
            Kelola barang rental sebelum lanjut pembayaran.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="xl:col-span-8">
            {/* SELECT ALL */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-5 h-5 accent-emerald-500"
                />

                <span className="font-semibold text-gray-700">
                  Pilih Semua Barang
                </span>
              </div>

              <span className="text-sm text-gray-400">
                {cart.length} Item
              </span>
            </div>

            {/* CART LIST */}
            <div className="space-y-5">
              {cart.map((item) => (
                <div
                  key={item.id_cart}
                  className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-5 flex flex-col lg:flex-row gap-5">
                    {/* CHECKBOX */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems[item.id_cart] || false
                        }
                        onChange={() =>
                          handleToggleSelect(item.id_cart)
                        }
                        className="w-5 h-5 accent-emerald-500"
                      />
                    </div>

                    {/* IMAGE */}
                    <Link
                      to={`/barang/${item.id_barang}`}
                      className="w-full lg:w-44 h-44 bg-[#f7f7f7] rounded-[28px] overflow-hidden flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={getStorageUrl(
                          item.foto_barang,
                          "https://via.placeholder.com/300"
                        )}
                        alt={item.nama_barang}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* DETAIL */}
                    <div className="flex-1">
                      <div className="flex justify-between gap-4">
                        <div>
                          <Link 
                            to={`/barang/${item.id_barang}`} 
                            className="hover:text-emerald-500 transition-colors no-underline block"
                          >
                            <h2 className="text-2xl font-black text-gray-900 mb-2 hover:text-[#00A779] transition-colors">
                              {item.nama_barang}
                            </h2>
                          </Link>

                          <Link
                            to={`/toko/${item.id_pemilik}`}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-500 no-underline"
                          >
                            <Store className="w-4 h-4" />
                            {item.pemilik?.nama ||
                              "SiPetualang"}
                          </Link>

                          <div className="mt-4 bg-gray-50 rounded-2xl px-4 py-3 inline-block">
                            <p className="text-xs text-gray-400">
                              Tanggal Rental
                            </p>

                            <p className="text-sm font-semibold text-gray-700">
                              {item.tanggal_mulai} —{" "}
                              {item.tanggal_selesai}
                            </p>
                          </div>
                        </div>

                        {/* DELETE */}
                        <button
                          onClick={() =>
                            handleRemoveItem(item.id_cart)
                          }
                          className="w-12 h-12 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* BOTTOM */}
                      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-8">
                        {/* PRICE */}
                        <div>
                          <p className="text-sm text-gray-400 mb-1">
                            Harga Rental
                          </p>

                          <h3 className="text-3xl font-black text-emerald-500">
                            Rp{" "}
                            {Number(
                              item.harga_sewa
                            ).toLocaleString("id-ID")}
                          </h3>

                          <span className="text-sm text-gray-400 block mb-1">
                            /hari
                          </span>

                          {Number(item.nominal_deposit) > 0 && (
                            <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg font-medium inline-block">
                              Deposit: Rp {Number(item.nominal_deposit).toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>

                        {/* QTY */}
                        <div className="flex items-center gap-5">
                          <div className="flex items-center bg-gray-100 rounded-2xl overflow-hidden">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.id_cart,
                                  item.jumlah - 1
                                )
                              }
                              className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 transition"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <div className="w-14 text-center font-bold text-gray-800">
                              {item.jumlah}
                            </div>

                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.id_cart,
                                  item.jumlah + 1
                                )
                              }
                              className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-400">
                              Total
                            </p>

                            <p className="text-2xl font-black text-gray-900">
                              Rp{" "}
                              {Number(
                                item.total_harga
                              ).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="xl:col-span-4">
            <div className="sticky top-32">
              <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6">
                {/* STORE */}
                <div className="bg-[#f8fafc] rounded-3xl p-5 mb-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      <Store className="w-6 h-6 text-emerald-500" />
                    </div>

                    <div>
                      <h3 className="font-black text-gray-900">
                        {storeLocation.name}
                      </h3>

                      <p className="text-xs text-gray-400">
                        Official Store
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed">
                    {storeLocation.address}
                  </p>
                </div>

                {/* PAYMENT */}
                <div className="bg-[#f8fafc] rounded-3xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-emerald-500" />

                    <h3 className="font-bold text-gray-900">
                      Pembayaran
                    </h3>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-emerald-100 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Midtrans Payment
                      </p>

                      <p className="text-xs text-gray-400">
                        QRIS, VA, Transfer, E-Wallet
                      </p>
                    </div>

                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>

                {/* SUMMARY */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Total Barang
                    </span>

                    <span className="font-bold text-gray-900">
                      {cart.length}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Subtotal Sewa
                    </span>

                    <span className="font-bold text-gray-900">
                      Rp{" "}
                      {getSelectedTotal.toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>

                  {getSelectedDepositTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        Total Deposit <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Refundable</span>
                      </span>

                      <span className="font-semibold text-gray-700">
                        Rp{" "}
                        {getSelectedDepositTotal.toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-lg font-black text-gray-900">
                      Total
                    </span>

                    <span className="text-3xl font-black text-emerald-500">
                      Rp{" "}
                      {(getSelectedTotal + getSelectedDepositTotal).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                </div>

                {/* METODE PENGIRIMAN */}
                <div className="mt-6 border-t pt-6">
                  <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Metode Pengiriman
                  </label>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`py-3 rounded-xl border flex items-center justify-center gap-2 font-medium text-sm transition-all ${
                        deliveryMethod === 'pickup'
                          ? 'bg-[#00A779] text-white border-[#00A779] shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      Pickup
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`py-3 rounded-xl border flex items-center justify-center gap-2 font-medium text-sm transition-all ${
                        deliveryMethod === 'delivery'
                          ? 'bg-[#00A779] text-white border-[#00A779] shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      Delivery
                    </button>
                  </div>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                      Alamat Pengiriman
                    </label>
                    <textarea
                      rows="3"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Masukkan alamat pengiriman lengkap..."
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00A779] dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    />
                  </div>
                )}

                {/* BUTTON */}
                <button
                  onClick={handleCheckout}
                  disabled={processing || !isAnySelected}
                  className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Checkout Sekarang
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <KtpVerificationModal 
        isOpen={isKtpModalOpen}
        onClose={() => setIsKtpModalOpen(false)}
        status={user?.verification_status}
      />
    </div>
  );
}