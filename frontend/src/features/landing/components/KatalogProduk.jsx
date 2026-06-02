import { useState, useEffect } from 'react';
import { Store, Search, Minus, Plus, X, ShoppingCart, Check, LogIn, UserPlus, ShieldAlert, Star, CalendarClock, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '@/services/api';

export default function KatalogProduk({
  filteredBarang,
  kategoriList,
  selectedKategori,
  setSelectedKategori,
  searchTerm,
  setSearchTerm,
  getImageUrl,
  cartItems = [],
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
  isAuthenticated = false,
  recommendedGearIds = new Set(),
  selectedDestinasi = null,
  token = null,
}) {
  const navigate = useNavigate();
  const [addedFeedback, setAddedFeedback] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [bookingData, setBookingData] = useState({}); // { id_barang: { total_booked, sisa_stok, stok_awal, latest_return_date, bookings } }

  // Fetch booking status dari API (PUBLIC — semua user)
  const fetchBookingStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/rental/barang-booking`);
      if (response.data?.status === 'success') {
        setBookingData(response.data.data || {});
      }
    } catch (err) {
      console.error('Gagal fetch booking status:', err);
    }
  };

  useEffect(() => {
    fetchBookingStatus();
    // Refresh setiap 30 detik
    const interval = setInterval(fetchBookingStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check if item is already in cart
  const isInCart = (idBarang) => {
    return cartItems.some(item => item.id_barang === idBarang);
  };

  // Get stock status for badge — menggunakan data booking dari API
  const getStockStatus = (barang) => {
    const booking = bookingData[barang.id_barang];

    if (!booking) {
      // Tidak ada booking aktif
      if (barang.jumlah_stok === 0) {
        return { type: 'out_of_stock', label: 'Stok Habis' };
      }
      return { type: 'available', label: null };
    }

    // Ada booking aktif
    const sisaStok = booking.sisa_stok;
    const stokAwal = booking.stok_awal;
    const latestDate = booking.latest_return_date;

    // Semua stok habis disewa (sisa = 0)
    if (sisaStok <= 0) {
      return { type: 'rented', label: 'Sedang Disewa', latestDate, stokAwal, sisaStok: 0 };
    }

    // Sisa stok tipis (≤ 2) — tampilkan info sewa
    if (sisaStok <= 2) {
      return { type: 'low_stock', label: `Sisa ${sisaStok} unit`, latestDate, stokAwal, sisaStok };
    }

    // Stok masih banyak
    return { type: 'available', label: null, sisaStok, stokAwal };
  };

  // Determine card status
  const getCardStatus = (barang) => {
    const stockStatus = getStockStatus(barang);
    const isDisabled = stockStatus.type === 'rented' || stockStatus.type === 'out_of_stock';
    const isRented = stockStatus.type === 'rented';
    const isStockEmpty = stockStatus.type === 'out_of_stock';
    const isLowStock = stockStatus.type === 'low_stock';
    return { stockStatus, isDisabled, isRented, isStockEmpty, isLowStock };
  };

  // Gate: require auth before action
  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    callback();
  };

  // Format tanggal untuk display
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' });
  };

  // Handle add to cart with visual feedback + stock check
  const handleAddToCart = (barang) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    const { stockStatus } = getCardStatus(barang);
    if (stockStatus.type === 'rented') {
      alert(`Barang "${barang.nama_barang}" sedang disewa semua. Silakan cek kembali nanti.`);
      return;
    }
    if (stockStatus.type === 'out_of_stock') {
      alert(`Barang "${barang.nama_barang}" sedang habis stok. Silakan cek kembali nanti.`);
      return;
    }
    if (onAddToCart) {
      onAddToCart(barang);
      setAddedFeedback(barang.id_barang);
      setTimeout(() => setAddedFeedback(null), 1500);
    }
  };

  return (
    <section className="max-w-[1240px] mx-auto px-6 pt-12 pb-24 font-sans antialiased">
      {/* HEADER UTAMA SEKTOR */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight mb-2">
          Pilihan Terbaik Minggu Ini!
        </h2>
        <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
          Gear Pilihan Pendaki, Siap Temani Petualanganmu. Gear Pilihan Pendaki, Siap Temani Petualanganmu.
        </p>
      </div>

      {/* LAYOUT UTAMA: SIDEBAR (LEFT) + PRODUCT GRID (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="lg:col-span-3 flex flex-col gap-8">

          {/* Box Kategori Menu */}
          <div className="bg-[#F8F9FA]/70 rounded-[20px] p-5 border border-gray-100">
            <h3 className="text-xs font-bold text-[#00A779] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="text-sm">→</span> Kategori
            </h3>
            <div className="flex flex-col text-left">
              <button
                onClick={() => setSelectedKategori('')}
                className={`w-full text-left text-xs py-2.5 px-2 font-bold rounded-lg transition-all ${selectedKategori === '' ? 'text-[#00A779] bg-emerald-50/50' : 'text-gray-700 hover:text-gray-950'
                  }`}
              >
                Semua Alat
              </button>
              {kategoriList.map((kat) => (
                <button
                  key={kat.id_kategori}
                  onClick={() => setSelectedKategori(kat.id_kategori)}
                  className={`w-full text-left text-xs py-2.5 px-2 font-bold border-t border-gray-100/70 transition-all ${selectedKategori === kat.id_kategori ? 'text-[#00A779] bg-emerald-50/50' : 'text-gray-600 hover:text-gray-950'
                    }`}
                >
                  {kat.nama_kategori}
                </button>
              ))}
            </div>
          </div>

          {/* Box Barang Terbaru (Dynamic from DB) */}
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-500 w-fit">
              Barang Terbaru
            </h3>
            <div className="flex flex-col gap-4">
              {[...filteredBarang]
                .sort((a, b) => b.id_barang - a.id_barang)
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.id_barang}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-xl p-1.5 -mx-1.5 transition-colors"
                    onClick={() => requireAuth(() => navigate(`/barang/${item.id_barang}`))}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      <img
                        src={getImageUrl(item)}
                        alt={item.nama_barang}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=No+Img'; }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5 truncate">{item.nama_barang}</h4>
                      <p className="text-[11px] font-semibold text-[#00A779]">
                        Rp {Number(item.harga_sewa).toLocaleString()} <span className="text-gray-400 font-normal">/Hari</span>
                      </p>
                    </div>
                  </div>
                ))}
              {filteredBarang.length === 0 && (
                <p className="text-xs text-gray-400">Belum ada barang.</p>
              )}
            </div>
          </div>

          {/* Box Barang Terlaku (Dynamic from DB) */}
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-amber-500 w-fit flex items-center gap-1.5">
              🔥 Barang Terlaku
            </h3>
            <div className="flex flex-col gap-4">
              {[...filteredBarang]
                .sort((a, b) => (b.total_disewa || 0) - (a.total_disewa || 0))
                .slice(0, 5)
                .map((item, idx) => (
                  <div
                    key={item.id_barang}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-xl p-1.5 -mx-1.5 transition-colors"
                    onClick={() => requireAuth(() => navigate(`/barang/${item.id_barang}`))}
                  >
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden">
                        <img
                          src={getImageUrl(item)}
                          alt={item.nama_barang}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=No+Img'; }}
                        />
                      </div>
                      {idx < 3 && (
                        <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center text-white shadow ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-700'
                          }`}>
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5 truncate">{item.nama_barang}</h4>
                      <p className="text-[11px] font-semibold text-[#00A779]">
                        Rp {Number(item.harga_sewa).toLocaleString()} <span className="text-gray-400 font-normal">/Hari</span>
                      </p>
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                        {item.total_disewa || 0}x disewa
                      </span>
                    </div>
                  </div>
                ))}
              {filteredBarang.length === 0 && (
                <p className="text-xs text-gray-400">Belum ada data.</p>
              )}
            </div>
          </div>

          {/* Box Tags Cloud */}
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-500 w-fit">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['Hiking', 'Camping', 'Tenda', 'Carrier', 'Sleeping Bag', 'Kompor', 'Paket Hemat', 'Outdoor', 'Sepatu', 'Beginner'].map((tag, idx) => (
                <span key={idx} className="bg-gray-950 text-white text-[10px] font-medium py-1 px-2.5 rounded-full cursor-pointer hover:bg-[#00A779] transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* ================= RIGHT MAIN CATALOG ================= */}
        <main className="lg:col-span-9">

          {/* Top Bar Meta Grid (Jumlah baris & Search Input internal) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <span className="text-[11px] font-semibold text-gray-400 self-start sm:self-auto">
              Showing 1–{filteredBarang.length} of {filteredBarang.length} results
            </span>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-gray-200 rounded-full py-2 pl-4 pr-10 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800 placeholder-gray-400"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Product Grid System */}
          {filteredBarang.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-[24px] border border-dashed border-gray-200">
              <h3 className="text-sm font-bold text-gray-700">Perlengkapan tidak ditemukan</h3>
              <p className="text-xs text-gray-400 mt-1">Coba gunakan filter atau kata kunci destinasi lainnya.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
              {filteredBarang.map((barang) => {
                const { stockStatus, isDisabled, isRented, isStockEmpty, isLowStock } = getCardStatus(barang);

                return (
                  <div
                    key={barang.id_barang}
                    className="flex flex-col text-center relative group cursor-pointer"
                    onClick={() => requireAuth(() => navigate(`/barang/${barang.id_barang}`))}
                  >

                    {/* IMAGE + CART BUTTON WRAPPER */}
                    <div className="relative">
                      {/* CONTAINER GAMBAR */}
                      <div className={`relative aspect-square w-full rounded-[24px] overflow-hidden flex items-center justify-center transition-all duration-300
                        ${isRented ? 'border-4 border-red-400' : isStockEmpty ? 'border-4 border-gray-300' : 'border border-gray-100 bg-[#E9ECEF]/60'}`}
                      >
                        <img
                          src={getImageUrl(barang)}
                          alt={barang.nama_barang}
                          className={`w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500`}
                        />

                        {/* ===== OVERLAY SEDANG DISEWA (stok habis disewa) ===== */}
                        {isRented && (
                          <div className="absolute inset-0 bg-red-500/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-20 gap-2">
                            {/* Icon keranjang */}
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                              <ShoppingCart className="w-7 h-7 text-white drop-shadow-md" />
                            </div>
                            {/* Badge SEDANG DISEWA */}
                            <span className="bg-red-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full tracking-wider shadow-lg uppercase">
                              Sedang Disewa
                            </span>
                            {/* Tanggal pengembalian */}
                            {stockStatus.latestDate && (
                              <span className="text-white text-[10px] font-semibold drop-shadow-md">
                                Hingga {formatDate(stockStatus.latestDate)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* ===== OVERLAY STOK HABIS (tanpa booking) ===== */}
                        {isStockEmpty && (
                          <div className="absolute inset-0 bg-gray-500/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-20 gap-2">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                              <Package className="w-7 h-7 text-white drop-shadow-md" />
                            </div>
                            <span className="bg-gray-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full tracking-wider shadow-lg uppercase">
                              Stok Habis
                            </span>
                          </div>
                        )}

                        {/* ===== OVERLAY SISA STOK SEDIKIT (≤ 2, ada booking) ===== */}
                        {isLowStock && stockStatus.latestDate && (
                          <div className="absolute inset-0 bg-amber-500/25 flex flex-col items-center justify-center z-20 gap-2">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                              <ShoppingCart className="w-7 h-7 text-amber-700 drop-shadow-md" />
                            </div>
                            <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-wider shadow-lg uppercase">
                              Sisa {stockStatus.sisaStok} Unit
                            </span>
                            <span className="text-amber-800 text-[10px] font-semibold bg-white/60 px-2 py-0.5 rounded-full">
                              Disewa hingga {formatDate(stockStatus.latestDate)}
                            </span>
                          </div>
                        )}

                        {/* Badge Rekomendasi - hanya muncul jika destinasi dipilih DAN barang ini essential DAN stok available */}
                        {!isRented && !isStockEmpty && !isLowStock && selectedDestinasi && recommendedGearIds.has(barang.id_barang) && (
                          <span className="absolute top-4 left-4 bg-[#00A779] text-[9px] font-medium text-white px-3 py-1 rounded-full tracking-wide shadow-lg animate-[pulse_2s_infinite] z-10">
                            ⭐ Recommended
                          </span>
                        )}

                        {/* Badge sudah di keranjang — hanya jika stok available */}
                        {!isRented && !isStockEmpty && isInCart(barang.id_barang) && (
                          <span className="absolute top-4 right-4 bg-emerald-500 text-[9px] font-bold text-white px-2 py-1 rounded-full tracking-wide flex items-center gap-1 z-10">
                            <Check className="w-3 h-3" /> Di Keranjang
                          </span>
                        )}
                      </div>

                      {/* TOMBOL KERANJANG — disable jika stok habis/disewa */}
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(barang);
                          }}
                          disabled={isDisabled}
                          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,167,121,0.25)] transition-all active:scale-95 border-[3px] border-white cursor-pointer ${isDisabled
                              ? 'bg-gray-400 cursor-not-allowed opacity-70'
                              : addedFeedback === barang.id_barang
                                ? 'bg-emerald-600 scale-110'
                                : isInCart(barang.id_barang)
                                  ? 'bg-emerald-700 hover:bg-emerald-800'
                                  : 'bg-[#00A779] hover:bg-[#008f68]'
                            }`}
                        >
                          {addedFeedback === barang.id_barang ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <ShoppingCart className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* DETAIL TEKS BAWAH */}
                    <div className="mt-8 flex flex-col items-center gap-1">
                      <h3 className="font-bold text-gray-900 text-sm tracking-tight">
                        {barang.nama_barang}
                      </h3>

                      {/* Star Rating - Dynamic from DB */}
                      {(() => {
                        const rating = barang.avg_rating || 0;
                        const reviewCount = barang.total_ulasan || 0;
                        return (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex items-center gap-px">
                              {[1, 2, 3, 4, 5].map((s) => {
                                const fill = Math.min(1, Math.max(0, rating - (s - 1)));
                                return (
                                  <div key={s} className="relative w-3.5 h-3.5">
                                    <Star className="w-3.5 h-3.5" fill="#e5e7eb" strokeWidth={0} />
                                    <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                                      <Star className="w-3.5 h-3.5" fill="#fbbf24" strokeWidth={0} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <span className="text-[11px] font-bold text-gray-700">{rating > 0 ? (typeof rating === 'number' ? rating.toFixed(1) : rating) : '0.0'}</span>
                            <span className="text-[10px] text-gray-400">({reviewCount})</span>
                          </div>
                        );
                      })()}

                      <p className="text-xs font-semibold text-gray-500/90 mb-0.5">
                        Rp {Number(barang.harga_sewa).toLocaleString()} <span className="font-normal text-gray-400">/ Hari</span>
                      </p>

                      {/* Badge stok tersedia (muncul saat filter tanggal aktif) */}
                      {barang.stok_tersedia !== undefined && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          barang.stok_tersedia <= 2
                            ? 'text-red-700 bg-red-50 border border-red-200'
                            : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        }`}>
                          📦 Stok tersedia: {barang.stok_tersedia} unit
                        </span>
                      )}

                      {/* Badge sedang disewa — dengan tanggal pengembalian */}
                      {isRented && stockStatus.latestDate && (
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          🔥 Disewa hingga {formatDate(stockStatus.latestDate)}
                        </span>
                      )}

                      {/* Badge sisa stok sedikit — dengan tanggal */}
                      {isLowStock && stockStatus.latestDate && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ⚠️ Sisa {stockStatus.sisaStok} unit · Disewa hingga {formatDate(stockStatus.latestDate)}
                        </span>
                      )}

                      {/* Badge minimum durasi sewa */}
                      {(barang.min_durasi_sewa || 1) > 1 && !isRented && !isStockEmpty && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          📅 Min. {barang.min_durasi_sewa} hari
                        </span>
                      )}

                      {/* Badge min tanggal sewa */}
                      {barang.min_tanggal_sewa && new Date(barang.min_tanggal_sewa) > new Date() && (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          🗓️ Tersedia mulai {new Date(barang.min_tanggal_sewa).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      )}

                      {/* NAMA TOKO */}
                      <Link
                        to={`/toko/${barang.id_pemilik}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-gray-400 font-medium flex items-center gap-1 no-underline hover:text-emerald-500 transition-colors"
                      >
                        <Store className="w-2.5 h-2.5" />
                        <span>{barang.pemilik?.nama || 'SiPetualang'}</span>
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* ================= INLINE CART SUMMARY ================= */}
          {cartItems.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00A779] rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Keranjang Saya</h3>
                    <p className="text-xs text-gray-400">{cartItems.length} item ditambahkan</p>
                  </div>
                </div>
                <Link
                  to="/customer/cart"
                  className="text-xs font-bold text-[#00A779] hover:text-emerald-700 no-underline transition-colors"
                >
                  Lihat Keranjang →
                </Link>
              </div>

              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[#F8F9FA] border-b border-gray-100">
                  <div className="col-span-1"></div>
                  <div className="col-span-1"></div>
                  <div className="col-span-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Produk</div>
                  <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Harga</div>
                  <div className="col-span-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Jumlah</div>
                  <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Subtotal</div>
                </div>

                {/* Cart Items */}
                {cartItems.map((item, index) => (
                  <div
                    key={item.id_cart}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-5 transition-colors hover:bg-gray-50/50 ${index < cartItems.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                  >
                    {/* Remove Button */}
                    <div className="md:col-span-1 flex items-center">
                      <button
                        onClick={() => onRemoveFromCart && onRemoveFromCart(item.id_cart)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 flex items-center justify-center transition-colors group/remove border-none cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400 group-hover/remove:text-red-500 transition-colors" />
                      </button>
                    </div>

                    {/* Product Image */}
                    <div className="md:col-span-1">
                      <div className="w-14 h-14 rounded-xl bg-[#F1F3F5] overflow-hidden flex items-center justify-center">
                        <img
                          src={getImageUrl(item)}
                          alt={item.nama_barang}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/60'; }}
                        />
                      </div>
                    </div>

                    {/* Product Name */}
                    <div className="md:col-span-3">
                      <h4 className="text-sm font-bold text-gray-800">{item.nama_barang}</h4>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 text-center">
                      <p className="text-sm font-semibold text-gray-500">
                        Rp {Number(item.harga_sewa).toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="md:col-span-3 flex items-center justify-center">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity && onUpdateQuantity(item.id_cart, item.jumlah - 1)}
                          disabled={item.jumlah <= 1}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 border-none bg-transparent cursor-pointer"
                        >
                          <Minus className="w-3 h-3 text-gray-500" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-800">{item.jumlah}</span>
                        <button
                          onClick={() => onUpdateQuantity && onUpdateQuantity(item.id_cart, item.jumlah + 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="md:col-span-2 text-right">
                      <p className="text-sm font-extrabold text-gray-900">
                        Rp {(Number(item.harga_sewa) * item.jumlah).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Cart Footer - Total */}
                <div className="px-6 py-5 bg-[#F8F9FA] border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{cartItems.length} item</span>
                      <Link
                        to="/customer/cart"
                        className="bg-[#00A779] hover:bg-[#008f68] text-white text-xs font-bold py-2.5 px-5 rounded-full no-underline transition-colors inline-flex items-center gap-2"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Lihat Keranjang
                      </Link>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">Total Sementara</p>
                      <p className="text-xl font-extrabold text-gray-900">
                        Rp {cartItems.reduce((sum, item) => sum + (Number(item.harga_sewa) * item.jumlah), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PAGINATION NAV ================= */}
          <div className="flex items-center justify-center gap-2 mt-16">
            <button className="w-8 h-8 rounded-full bg-[#00A779] text-white text-xs font-bold flex items-center justify-center shadow-sm">1</button>
            <button className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center hover:border-gray-400 transition-colors">2</button>
            <button className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 text-xs flex items-center justify-center hover:border-gray-400 transition-colors">&gt;</button>
          </div>

        </main>
      </div>

      {/* ================= AUTH REQUIRED MODAL ================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
          <div
            className="bg-white rounded-[28px] max-w-md w-full mx-4 overflow-hidden shadow-2xl animate-[fadeInUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />

            <div className="p-8 text-center">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full flex items-center justify-center border-2 border-emerald-100">
                <ShieldAlert className="w-10 h-10 text-emerald-500" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                Akses Terbatas
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto mb-8">
                Untuk menambahkan barang ke keranjang, kamu perlu login atau daftar akun terlebih dahulu.
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    navigate('/login');
                  }}
                  className="w-full bg-[#00A779] hover:bg-[#008f68] text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 cursor-pointer border-none"
                >
                  <LogIn className="w-4.5 h-4.5" />
                  Login Sekarang
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    navigate('/register');
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer border-none"
                >
                  <UserPlus className="w-4.5 h-4.5" />
                  Daftar Akun Baru
                </button>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-4 text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors cursor-pointer bg-transparent border-none"
              >
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}