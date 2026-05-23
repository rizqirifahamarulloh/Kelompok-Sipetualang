import { useState, useRef, useEffect } from "react";
import { 
  Search, Download, Eye, RefreshCw, Plus, 
  MoreHorizontal, CreditCard, DollarSign, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, Calendar, SlidersHorizontal, Image as ImageIcon, X, Printer
} from "lucide-react";

// ─── DATA DUMMY SESUAI DATABASE & TAMPILAN MOCKUP ───────────────────
const DUMMY_PAYMENTS = [
  {
    id_pembayaran: "PAY-2310-001",
    id_transaksi: "TRX-8821A",
    penyewa: "Budi Santoso",
    metode_bayar: "Transfer Bank - BCA",
    jumlah: 450000,
    deposit: 200000,
    status: "Lunas",
    waktu_bayar: "12 Okt 2023, 14:30",
    bukti_bayar: "ada"
  },
  {
    id_pembayaran: "PAY-2310-002",
    id_transaksi: "TRX-8822B",
    penyewa: "Siti Aminah",
    metode_bayar: "E-Wallet - GoPay",
    jumlah: 1200000,
    deposit: 500000,
    status: "Menunggu",
    waktu_bayar: "-",
    bukti_bayar: "ada"
  },
  {
    id_pembayaran: "PAY-2310-003",
    id_transaksi: "TRX-8823C",
    penyewa: "Rudi Hermawan",
    metode_bayar: "Cash",
    jumlah: 850000,
    deposit: 50000,
    status: "Gagal",
    waktu_bayar: "11 Okt 2023, 09:15",
    bukti_bayar: "-"
  },
  {
    id_pembayaran: "PAY-2310-004",
    id_transaksi: "TRX-8824D",
    penyewa: "Andi Wijaya",
    metode_bayar: "Transfer Bank - Mandiri",
    jumlah: 650000,
    deposit: 300000,
    status: "Lunas",
    waktu_bayar: "10 Okt 2023, 16:45",
    bukti_bayar: "ada"
  },
  {
    id_pembayaran: "PAY-2310-005",
    id_transaksi: "TRX-8825E",
    penyewa: "Dewi Lestari",
    metode_bayar: "E-Wallet - OVO",
    jumlah: 320000,
    deposit: 150000,
    status: "Lunas",
    waktu_bayar: "10 Okt 2023, 11:20",
    bukti_bayar: "ada"
  }
];

const formatHarga = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;

// ─── DROPDOWN METODE AKSI (TIGA TITIK) ───────────────────────────
function ActionMenu({ onViewDetail, onConfirmStatus, onPrint }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button onClick={() => setOpen(!open)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[160px] overflow-hidden">
          <button onClick={() => { onViewDetail(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-slate-700 text-left">
            <Eye size={14} className="text-gray-400" /> Detail Pembayaran
          </button>
          <button onClick={() => { onConfirmStatus(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-slate-700 text-left">
            <CheckCircle2 size={14} className="text-emerald-600" /> Konfirmasi Lunas
          </button>
          <button onClick={() => { onPrint(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-slate-700 text-left border-t border-gray-50">
            <Printer size={14} className="text-slate-400" /> Cetak Invoice
          </button>
        </div>
      )}
    </div>
  );
}

// ─── KOMPONEN HALAMAN UTAMA PEMBAYARAN ────────────────────────────
export default function Payment() {
  const [payments] = useState(DUMMY_PAYMENTS);
  
  // State 4 Komponen Filter Sesuai Mockup Desain Anda
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState("2023-10-01"); // Nilai default tanggal awal mockup
  const [metode, setMetode] = useState("Semua Metode");

  const [previewBukti, setPreviewBukti] = useState(false);
  
  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => { 
    setCurrentPage(1); 
  }, [search, metode]);

  // Logika Filter Data
  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.id_pembayaran.toLowerCase().includes(search.toLowerCase()) ||
      p.id_transaksi.toLowerCase().includes(search.toLowerCase()) ||
      p.penyewa.toLowerCase().includes(search.toLowerCase());

    const matchesMetode = 
      metode === "Semua Metode" || 
      p.metode_bayar.toLowerCase().includes(metode.toLowerCase());

    return matchesSearch && matchesMetode;
  });

  // Hitung Data Angka Deret Pagination
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = () => {
    const nums = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        nums.push(i);
      } else if (nums[nums.length - 1] !== "...") {
        nums.push("...");
      }
    }
    return nums;
  };

  const handleResetFilter = () => {
    setSearch("");
    setMetode("Semua Metode");
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Dashboard &gt; Pembayaran</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pembayaran</h1>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-gray-50 transition border-gray-200 shadow-xs">
          <Download size={14} /> Ekspor ke CSV
        </button>
      </div>

      {/* ─── KOMPONEN BARISAN 4 FILTER UTAMA (SESUAI GAMBAR REAL) ─── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* Filter 1: Cari Transaksi */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Cari Transaksi</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-emerald-600 transition"
              placeholder="ID Pembayaran, Transaksi, Nama"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter 2: Periode */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Periode</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none"
              value="01 Okt 2023 - 31 Okt 2023"
              readOnly
            />
          </div>
        </div>

        {/* Filter 3: Metode Pembayaran */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Metode Pembayaran</label>
          <select 
            value={metode} 
            onChange={(e) => setMetode(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600 appearance-none cursor-pointer"
          >
            <option>Semua Metode</option>
            <option>Transfer Bank</option>
            <option>E-Wallet</option>
            <option>Cash</option>
          </select>
        </div>

        {/* Filter 4: Tombol Aksi & Reset */}
        <div className="md:col-span-2 flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2 px-3 bg-white text-xs font-semibold text-slate-700 hover:bg-gray-50 transition shadow-xs">
            <SlidersHorizontal size={14} />
          </button>
          <button 
            onClick={handleResetFilter}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2 px-3 bg-slate-50 hover:bg-gray-100 text-slate-600 transition"
          >
            <RefreshCw size={14} />
          </button>
        </div>

      </div>

      {/* ─── TABEL DATA & INTERACTIVE PAGINATION PANEL ─── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-gray-100 font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">ID Pembayaran</th>
                <th className="px-5 py-4">ID Transaksi</th>
                <th className="px-5 py-4">Penyewa</th>
                <th className="px-5 py-4">Metode Bayar</th>
                <th className="px-5 py-4 text-center">Bukti Bayar</th>
                <th className="px-5 py-4 text-right">Jumlah</th>
                <th className="px-5 py-4 text-right">Deposit</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4">Waktu Bayar</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-slate-700 font-medium">
              {currentItems.map((pmt, index) => (
                <tr key={index} className="hover:bg-slate-50/40 transition">
                  <td className="px-5 py-4 text-slate-900 font-bold">{pmt.id_pembayaran}</td>
                  <td className="px-5 py-4 font-bold text-emerald-700">
                    <span className="hover:underline cursor-pointer">{pmt.id_transaksi}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-900 font-semibold">{pmt.penyewa}</td>
                  <td className="px-5 py-4 text-slate-600 font-normal">{pmt.metode_bayar}</td>
                  
                  {/* Kolom Bukti Bayar */}
                  <td className="px-5 py-4 text-center">
                    {pmt.bukti_bayar === "ada" ? (
                      <button 
                        onClick={() => setPreviewBukti(true)}
                        className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg border border-emerald-200 transition"
                      >
                        <ImageIcon size={12} />
                        Lihat Bukti
                      </button>
                    ) : (
                      <span className="text-gray-400 font-normal">-</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right font-bold text-slate-900">{formatHarga(pmt.jumlah)}</td>
                  <td className="px-5 py-4 text-right font-medium text-slate-500">{formatHarga(pmt.deposit)}</td>
                  
                  {/* Badge Status */}
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      pmt.status === "Lunas" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : pmt.status === "Menunggu"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-rose-50 text-rose-700 border-rose-100"
                    }`}>
                      {pmt.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-400 text-xs font-normal">{pmt.waktu_bayar}</td>
                  <td className="px-5 py-4 text-center">
                    <ActionMenu 
                      onViewDetail={() => alert(`Detail item ${pmt.id_pembayaran}`)}
                      onConfirmStatus={() => alert(`Status ${pmt.id_pembayaran} dikonfirmasi`)}
                      onPrint={() => alert(`Mencetak struk invoice ${pmt.id_transaksi}`)}
                    />
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-10 text-gray-400 font-normal">
                    Tidak ada data pembayaran yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Panel Pagination Angka Interaktif Sesuai Desain Master */}
        <div className="px-5 py-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500 bg-slate-50/30">
          <span>
            Showing <strong className="text-slate-800">{totalItems === 0 ? 0 : indexOfFirstItem + 1}</strong> to{" "}
            <strong className="text-slate-800">{Math.min(indexOfLastItem, totalItems)}</strong> of{" "}
            <strong className="text-slate-800">{totalItems}</strong> results
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition bg-white text-slate-600 flex items-center font-semibold gap-1 px-2.5"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            
            {pageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={i} className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  key={i}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg border transition ${
                    p === currentPage 
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-inner" 
                      : "border-gray-200 bg-white hover:bg-gray-50 text-slate-600"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition bg-white text-slate-600 flex items-center font-semibold gap-1 px-2.5"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>

      </div>

      {/* ─── MODAL PREVIEW BUKTI TRANSFER UNTUK AKURASI UI ─── */}
      {previewBukti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon size={13} className="text-emerald-700" /> Berkas Bukti Transfer
              </span>
              <button onClick={() => setPreviewBukti(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={15} />
              </button>
            </div>
            <div className="p-5 bg-slate-50 flex justify-center items-center">
              <div className="w-48 h-64 bg-white border border-gray-200 rounded-xl shadow-xs p-3 text-[9px] text-slate-600 font-mono flex flex-col justify-between">
                <div className="space-y-1 text-center border-b border-dashed pb-2">
                  <p className="font-bold text-emerald-800 text-xs">M-BANKING SUCCESS</p>
                  <p className="text-gray-400">12-10-2023 14:30</p>
                </div>
                <div className="space-y-1 flex-1 pt-2">
                  <div className="flex justify-between"><span>No Ref:</span><span className="font-bold">982310239</span></div>
                  <div className="flex justify-between"><span>Penyewa:</span><span className="font-bold uppercase">BUDI SANTOSO</span></div>
                  <div className="flex justify-between"><span>Tujuan:</span><span className="font-bold">SIPETUALANG</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span>Jumlah:</span>
                    <span className="font-bold text-slate-900">Rp 450.000</span>
                  </div>
                </div>
                <div className="text-center text-[7px] text-gray-400 tracking-wider uppercase pt-1 border-t border-dashed">
                  Valid Receipt
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}