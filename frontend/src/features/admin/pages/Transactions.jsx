import { useState, useRef, useEffect } from "react";
import { 
  Search, Download, Eye, CheckCircle2, 
  RefreshCw, Plus, MoreHorizontal
} from "lucide-react";
import TransactionDetail from "./TransactionDetail";
import TransactionModal from "../components/Transactions/TransactionModal"; // Import modal UI murni

const DUMMY_TRANSACTIONS = [
  {
    id_transaksi: "TRX-0841",
    penyewa: { nama: "Siti Rahma", telepon: "+62 878-1122-3344" },
    tanggal_mulai: "2023-10-08",
    tanggal_selesai: "2023-10-10",
    total_biaya: 325000,
    status_sewa: "terlambat",
    status_pembayaran: "Belum Selesai"
  },
  {
    id_transaksi: "TRX-0842",
    penyewa: { nama: "Budi Santoso", telepon: "+62 812-3456-7890" },
    tanggal_mulai: "2023-10-12",
    tanggal_selesai: "2023-10-15",
    total_biaya: 450000,
    status_sewa: "aktif",
    status_pembayaran: "Lunas"
  }
];

const formatHarga = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;
const formatTanggalSederhana = (val) =>
  val ? new Date(val).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

function ActionMenu({ onView, onComplete }) {
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
        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] overflow-hidden">
          <button onClick={() => { onView(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-slate-700 text-left">
            <Eye size={14} className="text-gray-400" /> Lihat Detail
          </button>
          <button onClick={() => { onComplete(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-slate-700 text-left">
            <CheckCircle2 size={14} className="text-gray-400" /> Selesaikan
          </button>
        </div>
      )}
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState(DUMMY_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  // Kunci Utama: State untuk mengontrol buka/tutup Modal Baru
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (selectedTransactionId !== null) {
    return <TransactionDetail activeId={selectedTransactionId} setActiveId={setSelectedTransactionId} />;
  }

  const handleCompleteTransaction = (id) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id_transaksi === id ? { ...t, status_sewa: "selesai" } : t))
    );
  };

  const filteredData = transactions.filter((t) => {
    const matchesSearch = 
      t.id_transaksi.toLowerCase().includes(search.toLowerCase()) ||
      t.penyewa.nama.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "Semua Status" || t.status_sewa === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Dashboard &gt; Transaksi Penyewaan</p>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaksi Penyewaan</h1>
            <p className="text-xs text-gray-500 mt-0.5">Kelola dan pantau semua data transaksi penyewaan alat outdoor.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium bg-white text-slate-700 hover:bg-gray-50 transition">
              <Download size={15} /> Export Data
            </button>
            
            {/* TRIGGER UTAMA: Tombol untuk membuka modal */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 text-white rounded-xl text-sm font-medium hover:bg-emerald-900 transition shadow-sm"
            >
              <Plus size={15} /> Transaksi Baru
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-emerald-500 transition"
            placeholder="Cari ID, nama pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-xs font-medium">Status Sewa:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-2.5 py-1.5 bg-gray-50 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option>Semua Status</option>
              <option>Aktif</option>
              <option>Terlambat</option>
              <option>Selesai</option>
            </select>
          </div>

          <button className="p-2 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500" onClick={() => { setSearch(""); setStatusFilter("Semua Status"); }}><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Tabel Utama */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50/70 border-b border-gray-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4">ID Transaksi</th>
                <th className="px-4 py-4">Nama Pelanggan</th>
                <th className="px-4 py-4">No Telepon</th>
                <th className="px-4 py-4">Tanggal Sewa</th>
                <th className="px-4 py-4">Batas Kembali</th>
                <th className="px-4 py-4 text-right">Total Harga</th>
                <th className="px-4 py-4 text-center">Status Sewa</th>
                <th className="px-4 py-4 text-center">Status Bayar</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-slate-700 font-medium">
              {filteredData.map((trx) => (
                <tr key={trx.id_transaksi} className="hover:bg-slate-50/40 transition">
                  <td className="px-4 py-5 font-bold text-emerald-700">
                    <button onClick={() => setSelectedTransactionId(trx.id_transaksi)} className="hover:underline focus:outline-none">
                      {trx.id_transaksi}
                    </button>
                  </td>
                  <td className="px-4 py-5 text-slate-900 font-semibold">{trx.penyewa.nama}</td>
                  <td className="px-4 py-5 text-slate-500 font-normal">{trx.penyewa.telepon}</td>
                  <td className="px-4 py-5 text-slate-600 text-xs">{formatTanggalSederhana(trx.tanggal_mulai)}</td>
                  <td className="px-4 py-5 text-slate-600 text-xs">{formatTanggalSederhana(trx.tanggal_selesai)}</td>
                  <td className="px-4 py-5 text-right font-bold text-slate-900">{formatHarga(trx.total_biaya)}</td>
                  <td className="px-4 py-5 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${
                      trx.status_sewa === "aktif" ? "bg-orange-50 text-orange-700 border-orange-100" :
                      trx.status_sewa === "terlambat" ? "bg-red-50 text-red-700 border-red-100" :
                      "bg-emerald-50 text-emerald-700 border-emerald-100"
                    }`}>
                      {trx.status_sewa}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                      trx.status_pembayaran === "Lunas" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {trx.status_pembayaran}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-center">
                    <ActionMenu 
                      onView={() => setSelectedTransactionId(trx.id_transaksi)} 
                      onComplete={() => handleCompleteTransaction(trx.id_transaksi)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CALL: Dipanggil murni UI & Statis */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}