import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/features/customer/services/chatService';

import Navbar from '@/features/landing/components/Navbar';
import Footer from '@/features/landing/components/Footer';

import {
  Loader2,
  MapPin,
  CreditCard,
  Truck,
  Store,
  MessageCircle,
  ShoppingCart,
  Zap,
  Calendar,
  Info,
} from 'lucide-react';

import '@/features/landing/landing.css';

const CART_KEY = 'rental_cart';

const getCartFromStorage = () => {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

const saveCartToStorage = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const MIDTRANS_CLIENT_KEY = 'SB-Mid-client-xxxxx';

export default function BarangShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const API_URL = 'http://127.0.0.1:8000/api';
  const token = localStorage.getItem('token');

  const today = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const defaultEndDate = useMemo(() => {
    const next = new Date();
    next.setDate(next.getDate() + 3);
    return next.toISOString().split('T')[0];
  }, []);

  const [barang, setBarang] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);

  const [selectedJumlah, setSelectedJumlah] = useState(1);

  const [tanggalMulai, setTanggalMulai] = useState(today);

  const [tanggalSelesai, setTanggalSelesai] =
    useState(defaultEndDate);

  const [deliveryMethod, setDeliveryMethod] =
    useState('pickup');

  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.alamat || ''
  );

  const [showMap, setShowMap] = useState(false);

  const totalHari = useMemo(() => {
    if (!tanggalMulai || !tanggalSelesai) return 0;

    const start = new Date(tanggalMulai);
    const end = new Date(tanggalSelesai);

    return (
      Math.ceil(
        (end - start) / (1000 * 60 * 60 * 24)
      ) + 1
    );
  }, [tanggalMulai, tanggalSelesai]);

  const totalHarga = useMemo(() => {
    if (!barang) return 0;

    return (
      barang.harga_sewa *
      totalHari *
      selectedJumlah
    );
  }, [barang, totalHari, selectedJumlah]);

  useEffect(() => {
    if (!window.snap) {
      const script = document.createElement('script');

      script.src =
        'https://app.sandbox.midtrans.com/snap/snap.js';

      script.setAttribute(
        'data-client-key',
        MIDTRANS_CLIENT_KEY
      );

      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const fetchBarang = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_URL}/rental/barang/${id}`
        );

        setBarang(response.data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat detail barang');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBarang();
    }
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }

    if (!barang) return;

    if (selectedJumlah > barang.jumlah_stok) {
      alert(
        `Stok tidak mencukupi. Sisa ${barang.jumlah_stok}`
      );
      return;
    }

    try {
      setLoadingAction(true);

      const itemTotalHarga =
        barang.harga_sewa *
        totalHari *
        selectedJumlah;

      const cartItem = {
        id_cart: Date.now(),
        id_barang: barang.id_barang,
        nama_barang: barang.nama_barang,
        harga_sewa: barang.harga_sewa,
        jumlah: selectedJumlah,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        total_hari: totalHari,
        total_harga: itemTotalHarga,
        foto_barang: barang.foto_barang,
        pemilik: barang.pemilik,
      };

      const existingCart = getCartFromStorage();

      existingCart.push(cartItem);

      saveCartToStorage(existingCart);

      alert('Berhasil ditambahkan ke keranjang');

      navigate('/customer/cart');
    } catch (err) {
      console.error(err);
      alert('Gagal tambah keranjang');
    } finally {
      setLoadingAction(false);
    }
  };

  const buyNow = async () => {
    if (!user) {
      alert('Silakan login');
      navigate('/login');
      return;
    }

    if (!barang) return;

    try {
      setLoadingAction(true);

      const checkoutData = {
        id_barang: barang.id_barang,
        jumlah: selectedJumlah,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        metode_pengiriman: deliveryMethod,
        alamat_pengiriman: deliveryAddress,
        biaya_pengiriman: 0,
      };

      const response = await axios.post(
        `${API_URL}/customer/transaksi/checkout`,
        checkoutData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.snap.pay(response.data.snap_token, {
        onSuccess: () => {
          alert('Pembayaran berhasil');
          navigate('/customer/transactions');
        },

        onPending: () => {
          alert('Pembayaran pending');
          navigate('/customer/transactions');
        },

        onError: (err) => {
          console.error(err);
          alert('Pembayaran gagal');
        },
      });
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          'Checkout gagal'
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const startChatWithOwner = async () => {
    if (!user) {
      alert('Login terlebih dahulu');
      navigate('/login');
      return;
    }

    try {
      const response =
        await chatService.getOrCreateConversation(
          barang.pemilik.id_pengguna
        );

      const conversationId =
        response.data.id_conversation;

      await chatService.sendMessage(
        conversationId,
        `Halo saya tertarik dengan ${barang.nama_barang}`
      );

      navigate('/customer/chat');
    } catch (err) {
      console.error(err);
      alert('Gagal memulai chat');
    }
  };

  const loadGoogleMaps = useCallback(() => {
    setShowMap(true);

    if (window.google) return;

    const script = document.createElement('script');

    script.src =
      'https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY';

    script.async = true;

    document.head.appendChild(script);
  }, []);

  const getImageUrl = useCallback(() => {
    if (!barang) {
      return 'https://via.placeholder.com/600x400';
    }

    if (barang.foto_barang) {
      if (barang.foto_barang.startsWith('http')) {
        return barang.foto_barang;
      }

      return `${API_URL}/storage/${barang.foto_barang}`;
    }

    return 'https://via.placeholder.com/600x400';
  }, [barang]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#00A779]" />
      </div>
    );
  }

  if (error || !barang) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{error || 'Barang tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="landing-scrollbar bg-[#F8F9FA]">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20 max-w-7xl">
        <Link
          to="/sewa-alat"
          className="text-sm text-gray-500 hover:text-[#00A779] no-underline"
        >
          ← Kembali
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border">
              <img
                src={getImageUrl()}
                alt={barang.nama_barang}
                className="w-full h-[500px] object-cover"
                onError={(e) => {
                  e.target.src =
                    'https://via.placeholder.com/600x400';
                }}
              />
            </div>

            <div className="bg-white mt-4 rounded-3xl p-5 border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F1F3F5] flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>

                  <div>
                    <Link
                      to={`/toko/${barang.id_pemilik}`}
                      className="font-bold text-black no-underline"
                    >
                      {barang.pemilik?.nama ||
                        'Vendor'}
                    </Link>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      {barang.pemilik?.kota ||
                        'Indonesia'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={startChatWithOwner}
                  className="bg-black text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-8 border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                  READY
                </span>

                <span className="text-xs text-gray-500">
                  {barang.jumlah_stok} stok tersedia
                </span>
              </div>

              <h1 className="text-3xl font-black text-gray-900">
                {barang.nama_barang}
              </h1>

              <div className="mt-5">
                <span className="text-3xl font-black text-[#00A779]">
                  Rp{' '}
                  {Number(
                    barang.harga_sewa
                  ).toLocaleString()}
                </span>

                <span className="text-sm text-gray-400">
                  {' '}
                  / hari
                </span>
              </div>

              <div className="mt-8 border-t pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-[#00A779]" />

                  <h2 className="font-bold">
                    Deskripsi
                  </h2>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {barang.deskripsi}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-[#00A779]" />

                <h2 className="font-bold text-lg">
                  Konfigurasi Rental
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold">
                    Jumlah
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={barang.jumlah_stok}
                    value={selectedJumlah}
                    onChange={(e) =>
                      setSelectedJumlah(
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-full mt-2 px-4 py-3 rounded-xl border"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Mulai
                  </label>

                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) =>
                      setTanggalMulai(e.target.value)
                    }
                    className="w-full mt-2 px-4 py-3 rounded-xl border"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Selesai
                  </label>

                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) =>
                      setTanggalSelesai(
                        e.target.value
                      )
                    }
                    className="w-full mt-2 px-4 py-3 rounded-xl border"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm font-semibold">
                  Metode Pengiriman
                </label>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    onClick={() =>
                      setDeliveryMethod('pickup')
                    }
                    className={`py-3 rounded-xl border flex items-center justify-center gap-2 ${
                      deliveryMethod === 'pickup'
                        ? 'bg-[#00A779] text-white'
                        : 'bg-white'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    Pickup
                  </button>

                  <button
                    onClick={() =>
                      setDeliveryMethod(
                        'delivery'
                      )
                    }
                    className={`py-3 rounded-xl border flex items-center justify-center gap-2 ${
                      deliveryMethod ===
                      'delivery'
                        ? 'bg-[#00A779] text-white'
                        : 'bg-white'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Delivery
                  </button>
                </div>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="mt-5">
                  <textarea
                    rows="4"
                    value={deliveryAddress}
                    onChange={(e) =>
                      setDeliveryAddress(
                        e.target.value
                      )
                    }
                    placeholder="Alamat lengkap..."
                    className="w-full border rounded-2xl p-4"
                  />

                  <button
                    onClick={loadGoogleMaps}
                    className="mt-3 text-[#00A779] text-sm flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Buka Google Maps
                  </button>

                  {showMap && (
                    <div
                      id="map"
                      className="w-full h-64 rounded-2xl mt-4 border"
                    />
                  )}
                </div>
              )}

              <div className="bg-[#F8F9FA] rounded-2xl p-5 mt-6">
                <div className="flex justify-between text-sm">
                  <span>Durasi</span>
                  <span>{totalHari} hari</span>
                </div>

                <div className="flex justify-between text-sm mt-2">
                  <span>Jumlah</span>
                  <span>{selectedJumlah}</span>
                </div>

                <div className="flex justify-between text-lg font-black mt-4 border-t pt-4">
                  <span>Total</span>

                  <span className="text-[#00A779]">
                    Rp{' '}
                    {totalHarga.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-[#F8F9FA] border rounded-2xl p-4 mt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#00A779]" />

                  <div>
                    <p className="font-bold text-sm">
                      Pembayaran Midtrans
                    </p>

                    <p className="text-xs text-gray-500">
                      Transfer / QRIS / E-Wallet
                    </p>
                  </div>
                </div>

                <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">
                  AKTIF
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={addToCart}
                  disabled={loadingAction}
                  className="bg-gray-100 hover:bg-gray-200 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />

                  {loadingAction
                    ? 'Loading...'
                    : 'Keranjang'}
                </button>

                <button
                  onClick={buyNow}
                  disabled={loadingAction}
                  className="bg-[#00A779] hover:bg-[#008f68] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />

                  {loadingAction
                    ? 'Processing...'
                    : 'Sewa Sekarang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}