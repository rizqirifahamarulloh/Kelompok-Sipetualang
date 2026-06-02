import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Search, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL, BASE_URL } from '@/services/api';
import { cartService } from '@/features/customer/services/cartService';
import { useAuth } from '@/contexts/AuthContext';

import Navbar from '@/features/landing/components/Navbar';
import Footer from '@/features/landing/components/Footer';
import KatalogProduk from '@/features/landing/components/KatalogProduk';

import '@/features/landing/landing.css';
import bannerBg from '@/assets/sewaalat/banner BG.png';

// Daftar Destinasi diambil dari API secara dinamis
export default function SewaAlat() {
  const { isAuthenticated } = useAuth();
  const [barangList, setBarangList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // FILTER STATES
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');

  // DESTINASI STATES (BARU)
  const [destinasiList, setDestinasiList] = useState([]);
  const [destinasiSearch, setDestinasiSearch] = useState('');
  const [showDestinasiDropdown, setShowDestinasiDropdown] = useState(false);
  const [selectedDestinasi, setSelectedDestinasi] = useState(null);
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [recommendedGears, setRecommendedGears] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  // CART STATE
  const [cartItems, setCartItems] = useState([]);



  // Filter destinasi berdasarkan pencarian (dinamis dari database)
  const filteredDestinations = useMemo(() => {
    if (!destinasiSearch) return [];
    return destinasiList.filter(dest => {
      const name = (dest.nama_destinasi || '').toLowerCase();
      const location = (dest.lokasi || '').toLowerCase();
      return name.includes(destinasiSearch.toLowerCase()) || 
             location.includes(destinasiSearch.toLowerCase());
    });
  }, [destinasiSearch, destinasiList]);

  // Hitung durasi dari tanggal
  const durasi = useMemo(() => {
    if (!tanggalMulai || !tanggalSelesai) return 0;
    const start = new Date(tanggalMulai + 'T00:00:00');
    const end = new Date(tanggalSelesai + 'T00:00:00');
    const diff = Math.ceil((end - start) / 86400000);
    return diff > 0 ? diff : 0;
  }, [tanggalMulai, tanggalSelesai]);

  // FETCH BARANG (with optional date-based and destination-based availability filter)
  const fetchBarang = async (startDate = null, endDate = null, destinasiId = null, isInitial = false) => {
    // Only show full-page spinner on initial load
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    try {
      let url = `${API_URL}/rental/barang`;
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append('tanggal_mulai', startDate);
        params.append('tanggal_selesai', endDate);
      }
      if (destinasiId) {
        params.append('id_destinasi', destinasiId);
      }
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      const response = await axios.get(url);
      if (response.data && Array.isArray(response.data)) {
        setBarangList(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  // FETCH KATEGORI
  const fetchKategori = async () => {
    try {
      const response = await axios.get(`${API_URL}/kategori`);
      if (response.data && Array.isArray(response.data)) {
        setKategoriList(response.data);
      }
    } catch (err) {
      console.error(err);
      setKategoriList([
        { id_kategori: 1, nama_kategori: 'Alat Camping' },
        { id_kategori: 2, nama_kategori: 'Perlengkapan Outdoor' },
        { id_kategori: 3, nama_kategori: 'Elektronik' },
      ]);
    }
  };

  // FETCH DESTINASI (dinamis dari database)
  const fetchDestinasi = async () => {
    try {
      const response = await axios.get(`${API_URL}/rental/destinasi`);
      if (response.data && response.data.status === 'success') {
        setDestinasiList(response.data.data || []);
      }
    } catch (err) {
      console.error('Gagal fetch destinasi:', err);
    }
  };

  // LOAD CART dari localStorage
  const loadCart = useCallback(async () => {
    try {
      const response = await cartService.getCart();
      setCartItems(response.data || []);
    } catch (err) {
      console.error('Gagal load cart:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LOAD DATA (initial)
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchBarang(null, null, null, true), fetchKategori(), fetchDestinasi()]);
      loadCart();
    };
    loadData();
  }, [loadCart]);

  // AUTO-FETCH when tanggalMulai or tanggalSelesai or selectedDestinasi changes (reactive filtering)
  useEffect(() => {
    const destinasiId = selectedDestinasi?.id_destinasi || null;
    if (tanggalMulai && tanggalSelesai) {
      fetchBarang(tanggalMulai, tanggalSelesai, destinasiId);
      setIsDateFiltered(true);
    } else if (tanggalMulai && !tanggalSelesai) {
      fetchBarang(tanggalMulai, tanggalMulai, destinasiId);
      setIsDateFiltered(true);
    } else if (!tanggalMulai && (isDateFiltered || destinasiId)) {
      fetchBarang(null, null, destinasiId);
      setIsDateFiltered(!!tanggalMulai);
    } else if (destinasiId) {
      fetchBarang(null, null, destinasiId);
    } else {
      fetchBarang();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanggalMulai, tanggalSelesai, selectedDestinasi]);




  const getDestinationType = (destinasi) => {
    const name = (destinasi.nama_destinasi || destinasi.name || '').toLowerCase();
    const keywords = (destinasi.keywords || []).map(k => k.toLowerCase());
    const all = [name, ...keywords].join(' ');

    if (all.includes('gunung') || all.includes('summit') || all.includes('puncak') ||
        all.includes('merapi') || all.includes('merbabu') || all.includes('semeru') ||
        all.includes('rinjani') || all.includes('kerinci') || all.includes('lawu') ||
        all.includes('slamet') || all.includes('sindoro') || all.includes('sumbing') ||
        all.includes('prau') || all.includes('andong') || all.includes('arjuno') ||
        all.includes('welirang') || all.includes('bromo') || all.includes('ijen') ||
        all.includes('agung') || all.includes('batur') || all.includes('tambora') ||
        all.includes('gede') || all.includes('pangrango') || all.includes('ciremai') ||
        all.includes('papandayan') || all.includes('kelimutu') || all.includes('sibayak') ||
        all.includes('sinabung') || all.includes('halimun') || all.includes('puntang') ||
        all.includes('penanggungan') || all.includes('ungaran') || all.includes('telomoyo')) {
      return 'gunung';
    }
    if (all.includes('ranu') || all.includes('kumbolo') || all.includes('danau') ||
        all.includes('toba') || all.includes('maninjau') || all.includes('singkarak') ||
        all.includes('telaga') || all.includes('situ') || all.includes('samosir')) {
      return 'danau_camp';
    }
    if (all.includes('pantai') || all.includes('beach') || all.includes('pulau') ||
        all.includes('kepulauan') || all.includes('nusa') || all.includes('komodo') ||
        all.includes('padar') || all.includes('genteng')) {
      return 'pantai';
    }
    if (all.includes('curug') || all.includes('air terjun') || all.includes('tumpak') ||
        all.includes('madakaripura') || all.includes('green canyon') || all.includes('ngarai')) {
      return 'air_terjun';
    }
    if (all.includes('kawah') || all.includes('dieng') || all.includes('plateau') ||
        all.includes('sikidang')) {
      return 'kawah';
    }
    if (all.includes('ranca upas') || all.includes('orchid') || all.includes('cikole') ||
        all.includes('dusun bambu') || all.includes('puncak') || all.includes('safari') ||
        all.includes('kebun raya') || all.includes('taman bunga') || all.includes('floating')) {
      return 'wisata_alam';
    }
    if (all.includes('candi') || all.includes('borobudur') || all.includes('prambanan')) {
      return 'wisata_budaya';
    }
    return 'outdoor';
  };



  const recommendedGearIds = useMemo(() => {
    if (!selectedDestinasi || barangList.length === 0) return new Set();

    const destId = selectedDestinasi.id_destinasi;
    const ids = new Set();
    barangList.forEach(barang => {
      const hasDestinasi = barang.destinasi?.some(d => d.id_destinasi === destId) ||
                           barang.destinasi_ids?.includes(destId);
      if (hasDestinasi) {
        ids.add(barang.id_barang);
      }
    });

    return ids;
  }, [selectedDestinasi, barangList]);

  // Pilih destinasi
  const handleSelectDestinasi = (destinasi) => {
    setSelectedDestinasi(destinasi);
    setDestinasiSearch(destinasi.nama_destinasi);
    setShowDestinasiDropdown(false);
  };

  // Sinkronisasi recommendedGears dinamis dari database untuk info banner
  useEffect(() => {
    if (selectedDestinasi && barangList.length > 0) {
      const destId = selectedDestinasi.id_destinasi;
      const filtered = barangList.filter(barang => {
        return barang.destinasi?.some(d => d.id_destinasi === destId) ||
               barang.destinasi_ids?.includes(destId);
      });
      setRecommendedGears(filtered);
    } else {
      setRecommendedGears([]);
    }
  }, [selectedDestinasi, barangList]);

  // Filter barang (dari search + kategori + tanggal) — semua barang ditampilkan, recommended di-sort ke atas
  const filteredBarang = useMemo(() => {
    let filtered = [...barangList];

    // Filter by min_tanggal_sewa (if customer selected a pickup date)
    // Using string comparison on YYYY-MM-DD format to avoid timezone issues
    if (tanggalMulai) {
      const selectedDate = tanggalMulai; // Already in YYYY-MM-DD format
      filtered = filtered.filter((barang) => {
        if (!barang.min_tanggal_sewa) return true; // no restriction, always show
        // Normalize: extract YYYY-MM-DD from possible ISO timestamp
        const minDate = (barang.min_tanggal_sewa || '').split('T')[0];
        if (!minDate) return true;
        // Show item only if selected pickup date >= item's minimum date
        return selectedDate >= minDate;
      });
    }

    // Filter by max_tanggal_pengembalian (if customer selected a return date)
    if (tanggalSelesai) {
      const selectedReturnDate = tanggalSelesai;
      filtered = filtered.filter((barang) => {
        if (!barang.max_tanggal_pengembalian) return true; // no restriction, always show
        const maxDate = (barang.max_tanggal_pengembalian || '').split('T')[0];
        if (!maxDate) return true;
        // Show item only if selected return date <= item's maximum return date
        return selectedReturnDate <= maxDate;
      });
    } else if (tanggalMulai) {
      // If only pickup date is selected, treat it as a single-day rent and check it doesn't exceed maximum return date
      const selectedReturnDate = tanggalMulai;
      filtered = filtered.filter((barang) => {
        if (!barang.max_tanggal_pengembalian) return true;
        const maxDate = (barang.max_tanggal_pengembalian || '').split('T')[0];
        if (!maxDate) return true;
        return selectedReturnDate <= maxDate;
      });
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((barang) =>
        barang.nama_barang.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by kategori
    if (selectedKategori !== '') {
      filtered = filtered.filter(
        (barang) => barang.id_kategori === parseInt(selectedKategori)
      );
    }

    // Filter by destinasi (exclusive filter)
    if (selectedDestinasi) {
      const destId = selectedDestinasi.id_destinasi;
      filtered = filtered.filter((barang) => {
        return barang.destinasi?.some(d => d.id_destinasi === destId) ||
               barang.destinasi_ids?.includes(destId);
      });
    }

    // Sort: recommended items first (if destination selected)
    if (selectedDestinasi && recommendedGearIds.size > 0) {
      filtered.sort((a, b) => {
        const aRec = recommendedGearIds.has(a.id_barang) ? 1 : 0;
        const bRec = recommendedGearIds.has(b.id_barang) ? 1 : 0;
        return bRec - aRec; // recommended first
      });
    }

    return filtered;
  }, [barangList, searchTerm, selectedKategori, selectedDestinasi, recommendedGearIds, tanggalMulai]);

  // Cari rekomendasi alat berdasarkan destinasi + filter by date availability
  const handleSearchDestinasi = async () => {
    if (!tanggalMulai) {
      alert('Pilih tanggal ambil terlebih dahulu');
      return;
    }

    setIsSearching(true);
    try {
      // Data already fetched by auto-fetch useEffect, just scroll to katalog
      // Scroll ke katalog
      setTimeout(() => {
        document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const getImageUrl = (barang) => {
    if (barang.foto_barang) {
      if (barang.foto_barang.startsWith('http')) return barang.foto_barang;
      return `${BASE_URL}/storage/${barang.foto_barang}`;
    }
    return 'https://via.placeholder.com/400x300';
  };

  // CART HANDLERS
  const handleAddToCart = async (barang) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      const tomorrow = nextDay.toISOString().split('T')[0];

      const startDate = tanggalMulai || today;
      const endDate = tanggalMulai 
        ? (new Date(new Date(tanggalMulai).getTime() + durasi * 86400000)).toISOString().split('T')[0] 
        : tomorrow;

      // Hitung total hari dari selisih tanggal (inklusif)
      const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

      const cartItem = {
        id_cart: Date.now(),
        id_barang: barang.id_barang,
        nama_barang: barang.nama_barang,
        harga_sewa: barang.harga_sewa,
        nominal_deposit: barang.nominal_deposit || 0,
        jumlah: 1,
        tanggal_mulai: startDate,
        tanggal_selesai: endDate,
        total_hari: daysDiff,
        total_harga: Number(barang.harga_sewa) * 1 * daysDiff,
        foto_barang: barang.foto_barang,
        pemilik: barang.pemilik,
        id_pemilik: barang.id_pemilik,
      };

      const result = await cartService.addToCart(cartItem);

      if (result.alreadyExists) {
        // Barang sudah ada di keranjang, tidak ditambahkan lagi
        return;
      }

      await loadCart();
    } catch (err) {
      console.error('Gagal menambahkan ke keranjang:', err);
    }
  };

  const handleRemoveFromCart = async (cartId) => {
    try {
      await cartService.removeFromCart(cartId);
      await loadCart();
    } catch (err) {
      console.error('Gagal menghapus dari keranjang:', err);
    }
  };

  const handleUpdateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartService.updateCartItem(cartId, { jumlah: newQuantity });
      await loadCart();
    } catch (err) {
      console.error('Gagal update jumlah:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="landing-scrollbar bg-white min-h-screen font-sans antialiased">
      <Navbar />

      {/* HERO SECTION */}
      <section
        id="hero-sewa"
        className="relative w-full bg-white"
        style={{ padding: '16px 16px 0 16px' }}
      >
        <div className="relative w-full">
          {/* Image container */}
          <div className="relative w-full h-[300px] md:h-[600px] rounded-[16px] md:rounded-[24px] overflow-hidden">
            <img
              src={bannerBg}
              alt="Shop Banner Background"
              className="w-full h-full object-cover object-center block"
            />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            <div className="absolute inset-0 z-[1] flex items-center justify-center">
              <h1 className="text-[40px] md:text-[60px] font-extrabold text-white leading-none tracking-tight select-none text-center" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                Our Shop
              </h1>
            </div>
          </div>
          {/* Breadcrumb — outside overflow-hidden so curves aren't clipped */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex items-end">
            {/* Left inverted curve */}
            <div className="w-[20px] h-[20px] bg-transparent" style={{ boxShadow: '8px 8px 0 8px white', borderRadius: '0 0 16px 0' }} />
            <div className="bg-white px-12 py-3 rounded-t-[18px]">
              <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400 whitespace-nowrap">
                <Link to="/" className="hover:text-emerald-500 transition-colors no-underline text-gray-400">
                  Home
                </Link>
                <span className="text-gray-300 font-light">&gt;</span>
                <span className="text-gray-700 font-semibold">Sewa Alat</span>
              </div>
            </div>
            {/* Right inverted curve */}
            <div className="w-[20px] h-[20px] bg-transparent" style={{ boxShadow: '-8px 8px 0 8px white', borderRadius: '0 0 0 16px' }} />
          </div>
        </div>
      </section>

      {/* FILTER PANEL - DENGAN DESTINASI REAL-TIME */}
      <section className="w-full max-w-[1200px] mx-auto px-6 mt-8 relative z-20">
        <div className="bg-white rounded-[24px] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="border border-gray-200/80 rounded-[20px] p-5 md:py-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

              {/* DESTINASI - DROPDOWN SEARCH */}
              <div className="md:col-span-3 flex flex-col gap-1.5 border-r border-gray-200 pr-4 relative">
                <label className="text-[11px] font-bold text-gray-500 tracking-wide">
                  Destinasi
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari destinasi ...."
                    value={destinasiSearch}
                    onChange={(e) => {
                      setDestinasiSearch(e.target.value);
                      setShowDestinasiDropdown(true);
                      setSelectedDestinasi(null);
                      setRecommendedGears([]);
                    }}
                    onFocus={() => setShowDestinasiDropdown(true)}
                    className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 placeholder-gray-400 focus:ring-0 focus:outline-none"
                  />
                  {showDestinasiDropdown && destinasiSearch && filteredDestinations.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-60 overflow-y-auto">
                      {filteredDestinations.map(dest => (
                        <div
                          key={dest.id_destinasi || dest.id}
                          onClick={() => handleSelectDestinasi(dest)}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 border-b last:border-0"
                        >
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <div>
                            <p className="font-semibold text-sm">{dest.nama_destinasi || dest.name}</p>
                            <p className="text-xs text-gray-500">{dest.lokasi || dest.location || 'Indonesia'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedDestinasi && (
                  <p className="text-[10px] text-emerald-600 mt-1">
                    ✓ {selectedDestinasi.nama_destinasi || selectedDestinasi.name}
                  </p>
                )}
              </div>

              {/* TGL AMBIL */}
              <div className="md:col-span-3 flex flex-col gap-1.5 border-r border-gray-200 px-4">
                <label className="text-[11px] font-bold text-gray-500 tracking-wide">
                  Tgl Ambil
                </label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => {
                    setTanggalMulai(e.target.value);
                    // Auto-clear tanggalSelesai if it's before the new start date
                    if (tanggalSelesai && e.target.value && tanggalSelesai <= e.target.value) {
                      setTanggalSelesai('');
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-xs font-bold text-gray-800 border-0 p-0 focus:ring-0"
                />
              </div>

              {/* TGL PENGEMBALIAN (manual) */}
              <div className="md:col-span-3 flex flex-col gap-1.5 border-r border-gray-200 px-4">
                <label className="text-[11px] font-bold text-gray-500 tracking-wide">
                  Tgl Pengembalian
                </label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  min={tanggalMulai ? (() => {
                    const d = new Date(tanggalMulai + 'T00:00:00');
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().split('T')[0];
                  })() : new Date().toISOString().split('T')[0]}
                  disabled={!tanggalMulai}
                  className={`text-xs font-bold border-0 p-0 focus:ring-0 ${!tanggalMulai ? 'text-gray-300 cursor-not-allowed' : 'text-gray-800'}`}
                />
                {!tanggalMulai && (
                  <p className="text-[9px] text-gray-400 mt-0.5">Pilih tgl ambil dulu</p>
                )}
              </div>

              {/* DURASI (auto-calculated) */}
              <div className="md:col-span-1 flex flex-col gap-1.5 px-4">
                <label className="text-[11px] font-bold text-gray-500 tracking-wide">
                  Durasi
                </label>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className={durasi > 0 ? 'text-emerald-600' : 'text-gray-400'}>
                    {durasi > 0 ? `${durasi} hari` : '-'}
                  </span>
                </div>
              </div>

              {/* BUTTON CARI */}
              <div className="md:col-span-2 flex justify-end pl-2">
                <button
                  onClick={handleSearchDestinasi}
                  disabled={isSearching}
                  className="w-full bg-[#00A779] hover:bg-[#008f68] text-white font-bold text-xs py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97] shadow-sm disabled:opacity-60"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mencari...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Cari Alat</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* DATE FILTER ACTIVE BANNER */}
      {isDateFiltered && tanggalMulai && (
        <div className="max-w-[1200px] mx-auto px-6 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                📅 Menampilkan barang tersedia: {new Date(tanggalMulai + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}{tanggalSelesai && ` — ${new Date(tanggalSelesai + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}{durasi > 0 && ` (${durasi} hari)`}
              </p>
              <p className="text-xs text-blue-500 mt-0.5">
                Hanya barang yang tersedia pada tanggal tersebut yang ditampilkan ({filteredBarang.length} item)
              </p>
            </div>
            <button
              onClick={() => { 
                setTanggalMulai(''); 
                setTanggalSelesai('');
                setIsDateFiltered(false); 
                setSelectedDestinasi(null);
                setDestinasiSearch('');
                setRecommendedGears([]);
              }}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              ✕ Reset Filter
            </button>
          </div>
        </div>
      )}

      {/* REKOMENDASI DESTINASI (jika ada) */}
      {selectedDestinasi && recommendedGears.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-6 mt-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
            <p className="text-sm font-semibold text-emerald-700">
              {(() => {
                const type = getDestinationType(selectedDestinasi);
                const emojiMap = {
                  gunung: '🏔️', danau_camp: '🏕️', pantai: '🏖️',
                  air_terjun: '🌊', kawah: '🌋', wisata_alam: '🌿',
                  wisata_budaya: '🏛️', outdoor: '⛺',
                };
                return `${emojiMap[type] || '⛺'} Rekomendasi untuk ${selectedDestinasi.nama_destinasi || selectedDestinasi.name}:`;
              })()}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {(() => {
                const type = getDestinationType(selectedDestinasi);
                const descMap = {
                  gunung: 'Pendakian gunung membutuhkan perlengkapan lengkap untuk keamanan dan kenyamanan.',
                  danau_camp: 'Camping di tepi danau memerlukan perlengkapan camp dan alat masak outdoor.',
                  pantai: 'Aktivitas pantai membutuhkan perlengkapan tahan air dan camping ringan.',
                  air_terjun: 'Trekking ke air terjun butuh perlengkapan waterproof dan trekking.',
                  kawah: 'Kawah dan dataran tinggi memerlukan perlengkapan tahan dingin dan masker.',
                  wisata_alam: 'Wisata alam ringan dengan perlengkapan camping santai.',
                  wisata_budaya: 'Wisata budaya memerlukan perlengkapan ringan dan praktis.',
                  outdoor: 'Aktivitas outdoor membutuhkan perlengkapan camping standar.',
                };
                return `${descMap[type] || descMap.outdoor} Kami merekomendasikan ${recommendedGears.length} perlengkapan esensial — ditandai dengan badge ⭐ Recommended.`;
              })()}
            </p>
          </div>
        </div>
      )}

      {/* KATALOG PRODUK */}
      <div id="katalog-section" className="relative">
        {isRefetching && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/30 z-20 flex items-start justify-center pt-20 rounded-xl backdrop-blur-[1px]">
            <div className="flex items-center gap-2 bg-white shadow-lg rounded-full px-4 py-2 border">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-gray-600">Memperbarui katalog...</span>
            </div>
          </div>
        )}
        <KatalogProduk
          filteredBarang={filteredBarang}
          kategoriList={kategoriList}
          selectedKategori={selectedKategori}
          setSelectedKategori={setSelectedKategori}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          getImageUrl={getImageUrl}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          isAuthenticated={isAuthenticated}
          recommendedGearIds={recommendedGearIds}
          selectedDestinasi={selectedDestinasi}
        />
      </div>

      <Footer />
    </div>
  );
}