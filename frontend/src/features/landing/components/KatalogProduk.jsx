import { Store, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function KatalogProduk({
  filteredBarang,
  kategoriList,
  selectedKategori,
  setSelectedKategori,
  searchTerm,
  setSearchTerm,
  getImageUrl
}) {
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
                className={`w-full text-left text-xs py-2.5 px-2 font-bold rounded-lg transition-all ${
                  selectedKategori === '' ? 'text-[#00A779] bg-emerald-50/50' : 'text-gray-700 hover:text-gray-950'
                }`}
              >
                Semua Alat
              </button>
              {kategoriList.map((kat) => (
                <button
                  key={kat.id_kategori}
                  onClick={() => setSelectedKategori(kat.id_kategori)}
                  className={`w-full text-left text-xs py-2.5 px-2 font-bold border-t border-gray-100/70 transition-all ${
                    selectedKategori === kat.id_kategori ? 'text-[#00A779] bg-emerald-50/50' : 'text-gray-600 hover:text-gray-950'
                  }`}
                >
                  {kat.nama_kategori}
                </button>
              ))}
            </div>
          </div>

          {/* Box Barang Terbaru (Dummy data statis sesuai visual template) */}
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-500 w-fit">
              Barang Terbaru
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { name: 'Matras Alumunium', price: '35.000', img: 'https://via.placeholder.com/60' },
                { name: 'Lampu LED (kepala)', price: '10.000', img: 'https://via.placeholder.com/60' },
                { name: 'Jaket Puff', price: '75.000', img: 'https://via.placeholder.com/60' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img src={item.img} alt={item.name} className="w-12 h-12 object-cover rounded-xl bg-gray-100" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-0.5">{item.name}</h4>
                    <p className="text-[11px] font-semibold text-[#00A779]">Rp {item.price} <span className="text-gray-400 font-normal">/Hari</span></p>
                  </div>
                </div>
              ))}
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
             {filteredBarang.map((barang) => (
  <div key={barang.id_barang} className="flex flex-col text-center relative group">
    
    {/* CONTAINER GAMBAR DENGAN CEKUNGAN PUTIH (Persis image_ea65c9.jpg) */}
    <div className="relative aspect-[10/11] w-full rounded-[24px] bg-[#E9ECEF]/60 overflow-hidden flex items-center justify-center p-6 pb-8">
      <img
        src={getImageUrl(barang)}
        alt={barang.nama_barang}
        className="max-h-[80%] max-w-[85%] object-contain object-center transform group-hover:scale-105 transition-transform duration-500"
      />

      {/* Badge Rekomendasi */}
      <span className="absolute top-4 left-4 bg-[#00A779] text-[9px] font-medium text-white px-3 py-1 rounded-full tracking-wide">
        Recomended
      </span>

      {/* CEKUNGAN PUTIH + TOMBOL KERANJANG DI TENGAH (Sudah rapi, tidak bocor keluar) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white w-16 h-8 rounded-t-[20px] flex items-center justify-center">
        <Link 
          to={`/barang/${barang.id_barang}`}
          className="absolute -top-3 w-10 h-10 bg-[#00A779] hover:bg-[#008f68] text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,167,121,0.2)] transition-transform active:scale-95 no-underline"
        >
          <span className="text-sm">🛒</span>
        </Link>
      </div>
    </div>

    {/* DETAIL TEKS BAWAH (Harga & Nama Toko Tetap Ada!) */}
    <div className="mt-4 flex flex-col items-center gap-1">
      <h3 className="font-bold text-gray-900 text-sm tracking-tight">
        {barang.nama_barang}
      </h3>
      <p className="text-xs font-semibold text-gray-500/90 mb-0.5">
        Rp {Number(barang.harga_sewa).toLocaleString()} <span className="font-normal text-gray-400">/ Hari</span>
      </p>
      
      {/* NAMA TOKO AMAN & TETAP DITAMPILKAN */}
      <Link 
        to={`/toko/${barang.id_pemilik}`} 
        className="text-[10px] text-gray-400 font-medium flex items-center gap-1 no-underline hover:text-emerald-500 transition-colors"
      >
        <Store className="w-2.5 h-2.5" />
        <span>{barang.pemilik?.nama || 'SiPetualang'}</span>
      </Link>
    </div>

  </div>
))} 
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
    </section>
  );
}