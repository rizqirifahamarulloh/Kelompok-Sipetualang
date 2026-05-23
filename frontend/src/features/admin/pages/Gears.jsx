import React, { useState, useRef, useEffect } from "react";
import {
  Search, Package, PackageCheck, PackageX, AlertTriangle,
  MoreHorizontal, Eye, Edit, Trash2, ChevronLeft, ChevronRight,
  Filter, Download
} from "lucide-react";
import GearDetail from "./GearDetail";
import EditGearModal from "../components/Gears/EditGearModal";
import DeleteGearModal from "../components/Gears/DeleteGearModal";

// ─── DATA DUMMY ────────────────────────────────────────────────
const DUMMY_CATEGORIES = [
  { id_kategori: 1, nama_kategori: "Tenda" },
  { id_kategori: 2, nama_kategori: "Perlengkapan Masak" },
  { id_kategori: 3, nama_kategori: "Navigasi" },
  { id_kategori: 4, nama_kategori: "Pakaian" },
  { id_kategori: 5, nama_kategori: "Sepatu" },
];

const DUMMY_DESTINATIONS = [
  { id_destinasi: 1, nama_destinasi: "Gunung Rinjani" },
  { id_destinasi: 2, nama_destinasi: "Gunung Semeru" },
  { id_destinasi: 3, nama_destinasi: "Gunung Bromo" },
  { id_destinasi: 4, nama_destinasi: "Gunung Papandayan" },
];

const DUMMY_GEARS = [
  {
    id_barang: 1,
    nama_barang: "Tenda Dome 4 Orang",
    deskripsi: "Tenda dome kapasitas 4 orang, tahan angin dan hujan, cocok untuk segala medan.",
    id_kategori: 1,
    kategori: { nama_kategori: "Tenda" },
    harga_sewa: 150000,
    jumlah_stok: 8,
    status_barang: "tersedia",
    status_approval: "disetujui",
    pemilik: { nama: "SiPetualang HQ" },
    foto_barang: null,
    rating: 4.8,
    jumlah_ulasan: 24,
    total_disewa: 47,
    stok_tersedia: 6,
    kondisi: "Baik",
    destinasi: [{ id_destinasi: 1, nama_destinasi: "Gunung Rinjani" }, { id_destinasi: 2, nama_destinasi: "Gunung Semeru" }],
    destinasi_ids: [1, 2],
    detail_transaksi: [
      { id_transaksi: 101, penyewa: { nama: "Budi Santoso" }, tanggal_mulai: "2025-04-10", tanggal_selesai: "2025-04-13", status_sewa: "dikembalikan", total_biaya: 450000 },
      { id_transaksi: 102, penyewa: { nama: "Siti Rahayu" }, tanggal_mulai: "2025-05-01", tanggal_selesai: "2025-05-05", status_sewa: "aktif", total_biaya: 600000 },
    ],
  },
  {
    id_barang: 2,
    nama_barang: "Kompor Portable Gas",
    deskripsi: "Kompor portable ringan dengan bahan bakar gas, ideal untuk memasak di alam bebas.",
    id_kategori: 2,
    kategori: { nama_kategori: "Perlengkapan Masak" },
    harga_sewa: 35000,
    jumlah_stok: 1,
    status_barang: "tersedia",
    status_approval: "disetujui",
    pemilik: { nama: "SiPetualang HQ" },
    foto_barang: null,
    rating: 4.5,
    jumlah_ulasan: 12,
    total_disewa: 30,
    stok_tersedia: 1,
    kondisi: "Cukup",
    destinasi: [{ id_destinasi: 3, nama_destinasi: "Gunung Bromo" }],
    destinasi_ids: [3],
    detail_transaksi: [
      { id_transaksi: 103, penyewa: { nama: "Andi Wijaya" }, tanggal_mulai: "2025-03-15", tanggal_selesai: "2025-03-18", status_sewa: "dikembalikan", total_biaya: 105000 },
    ],
  },
  {
    id_barang: 3,
    nama_barang: "GPS Garmin inReach Mini",
    deskripsi: "GPS satelit dua arah dengan fitur SOS, cocok untuk pendakian ekstrem.",
    id_kategori: 3,
    kategori: { nama_kategori: "Navigasi" },
    harga_sewa: 200000,
    jumlah_stok: 3,
    status_barang: "tersedia",
    status_approval: "disetujui",
    pemilik: { nama: "Rudi Hartono" },
    foto_barang: null,
    rating: 5.0,
    jumlah_ulasan: 8,
    total_disewa: 15,
    stok_tersedia: 2,
    kondisi: "Baik",
    destinasi: [{ id_destinasi: 1, nama_destinasi: "Gunung Rinjani" }, { id_destinasi: 4, nama_destinasi: "Gunung Papandayan" }],
    destinasi_ids: [1, 4],
    detail_transaksi: [],
  },
  {
    id_barang: 4,
    nama_barang: "Jaket Windbreaker",
    deskripsi: "Jaket anti angin dan tahan air ringan, cocok untuk pendakian di ketinggian.",
    id_kategori: 4,
    kategori: { nama_kategori: "Pakaian" },
    harga_sewa: 75000,
    jumlah_stok: 0,
    status_barang: "habis",
    status_approval: "disetujui",
    pemilik: { nama: "Dewi Anggraini" },
    foto_barang: null,
    rating: 4.2,
    jumlah_ulasan: 19,
    total_disewa: 55,
    stok_tersedia: 0,
    kondisi: "Cukup",
    destinasi: [{ id_destinasi: 2, nama_destinasi: "Gunung Semeru" }],
    destinasi_ids: [2],
    detail_transaksi: [
      { id_transaksi: 104, penyewa: { nama: "Fahmi Nugroho" }, tanggal_mulai: "2025-05-10", tanggal_selesai: "2025-05-14", status_sewa: "terlambat", total_biaya: 300000 },
    ],
  },
  {
    id_barang: 5,
    nama_barang: "Sepatu Gunung Salomon",
    deskripsi: "Sepatu hiking waterproof dengan sol Contagrip untuk traksi optimal di berbagai permukaan.",
    id_kategori: 5,
    kategori: { nama_kategori: "Sepatu" },
    harga_sewa: 100000,
    jumlah_stok: 5,
    status_barang: "tersedia",
    status_approval: "pending",
    pemilik: { nama: "SiPetualang HQ" },
    foto_barang: null,
    rating: null,
    jumlah_ulasan: 0,
    total_disewa: 3,
    stok_tersedia: 5,
    kondisi: "Baru",
    destinasi: [],
    destinasi_ids: [],
    detail_transaksi: [],
  },
  {
    id_barang: 6,
    nama_barang: "Sleeping Bag -10°C",
    deskripsi: "Sleeping bag ekstrem dingin cocok untuk puncak gunung di musim hujan.",
    id_kategori: 1,
    kategori: { nama_kategori: "Tenda" },
    harga_sewa: 80000,
    jumlah_stok: 1,
    status_barang: "tersedia",
    status_approval: "disetujui",
    pemilik: { nama: "SiPetualang HQ" },
    foto_barang: null,
    rating: 4.9,
    jumlah_ulasan: 31,
    total_disewa: 62,
    stok_tersedia: 1,
    kondisi: "Baik",
    destinasi: [{ id_destinasi: 1, nama_destinasi: "Gunung Rinjani" }, { id_destinasi: 2, nama_destinasi: "Gunung Semeru" }, { id_destinasi: 3, nama_destinasi: "Gunung Bromo" }],
    destinasi_ids: [1, 2, 3],
    detail_transaksi: [],
  },
];

const STATUS_CONFIG = {
  tersedia: { label: "Tersedia", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  habis:    { label: "Habis",    dot: "bg-red-500",     badge: "bg-red-50 text-red-700 border border-red-200" },
};

const formatHarga = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;

const getStokColor = (stok) => {
  if (stok <= 0) return "bg-red-100 text-red-700 font-bold";
  if (stok <= 1) return "bg-red-100 text-red-700 font-bold";
  if (stok <= 5) return "bg-orange-100 text-orange-700 font-semibold";
  return "bg-emerald-100 text-emerald-700 font-semibold";
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, dot: "bg-gray-400", badge: "bg-gray-50 text-gray-700 border border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dot}`}></span>
      {cfg.label}
    </span>
  );
}

function ActionMenu({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
          <button onClick={() => { onView(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left">
            <Eye size={14} /> Lihat Detail
          </button>
          <button onClick={() => { onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left">
            <Edit size={14} /> Edit Data
          </button>
          <button onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 text-left">
            <Trash2 size={14} /> Hapus Alat
          </button>
        </div>
      )}
    </div>
  );
}

export default function Gears() {
  const [gears, setGears] = useState(DUMMY_GEARS);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showKategoriMenu, setShowKategoriMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingGear, setEditingGear] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [gearToDelete, setGearToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [detailGearId, setDetailGearId] = useState(null);

  const PER_PAGE = 5;
  const categories = DUMMY_CATEGORIES;
  const destinations = DUMMY_DESTINATIONS;

  const filtered = gears.filter((g) => {
    const matchSearch = g.nama_barang.toLowerCase().includes(search.toLowerCase());
    const matchKat = filterKategori ? String(g.id_kategori) === filterKategori : true;
    const matchStatus = filterStatus ? g.status_barang === filterStatus : true;
    return matchSearch && matchKat && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const stats = {
    total_alat: gears.length,
    tersedia: gears.filter((g) => g.status_barang === "tersedia").length,
    habis: gears.filter((g) => g.status_barang === "habis").length,
    stok_kritis: gears.filter((g) => g.jumlah_stok <= 1).length,
  };
  const kritisItems = gears.filter((g) => g.jumlah_stok <= 1);

  const handleDelete = (id) => {
    setGears((prev) => prev.filter((g) => g.id_barang !== id));
    setIsDeleteModalOpen(false);
    setGearToDelete(null);
  };

  const handleGearUpdate = (updatedGear) => {
    setGears((prev) => prev.map((g) => g.id_barang === updatedGear.id_barang ? updatedGear : g));
  };

  const handleSaveEdit = (formData) => {
    if (!editingGear) return;
    const updatedGear = {
      ...editingGear,
      ...formData,
      id_kategori: Number(formData.id_kategori),
      harga_sewa: Number(formData.harga_sewa),
      jumlah_stok: Number(formData.jumlah_stok),
      kategori: { nama_kategori: categories.find((c) => c.id_kategori === Number(formData.id_kategori))?.nama_kategori },
      destinasi: destinations.filter((d) => formData.destinasi_ids.includes(d.id_destinasi)),
    };
    handleGearUpdate(updatedGear);
  };

  const pageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (detailGearId !== null) {
    return (
      <GearDetail
        gearId={detailGearId}
        onBack={() => setDetailGearId(null)}
        onGearUpdate={handleGearUpdate}
        onGearDelete={handleDelete}
        categories={categories}
        destinations={destinations}
        gearsData={gears}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-400 mb-1">
          Dashboard &gt; <span className="text-gray-600 font-medium">Manajemen Alat</span>
        </p>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl font-bold">Manajemen Alat</h1>
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <Download size={15} /> Ekspor CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Alat", value: stats.total_alat, icon: <Package size={18} />, color: "bg-blue-50 text-blue-600" },
          { label: "Alat Tersedia", value: stats.tersedia, icon: <PackageCheck size={18} />, color: "bg-emerald-50 text-emerald-600" },
          { label: "Stok Habis", value: stats.habis, icon: <PackageX size={18} />, color: "bg-red-50 text-red-600" },
          { label: "Stok Kritis", value: stats.stok_kritis, icon: <AlertTriangle size={18} />, color: "bg-orange-50 text-orange-600",
            extra: stats.stok_kritis > 0 ? <span className="text-sm text-red-500 ml-2 font-medium">item kritis</span> : null },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-gray-400">{card.label}</p>
              <div className={`p-2 rounded-lg ${card.color}`}>{card.icon}</div>
            </div>
            <div className="flex items-end">
              <h2 className="text-3xl font-bold">{card.value.toLocaleString()}</h2>
              {card.extra}
            </div>
          </div>
        ))}
      </div>

      {/* Peringatan Stok Kritis */}
      {kritisItems.length > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-3">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">Peringatan Stok Kritis (≤ 1)</p>
              <p className="text-xs text-red-500 mt-0.5">{kritisItems.map((i) => i.nama_barang).join(", ")}</p>
            </div>
          </div>
          <button className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
            Update Stok
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-emerald-400"
              placeholder="Cari nama alat..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Filter Kategori */}
            <div className="relative">
              <button onClick={() => { setShowKategoriMenu(!showKategoriMenu); setShowStatusMenu(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Filter size={15} />
                {filterKategori ? (categories.find((c) => String(c.id_kategori) === filterKategori)?.nama_kategori || "Kategori") : "Semua Kategori"}
              </button>
              {showKategoriMenu && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                  <button onClick={() => { setFilterKategori(""); setShowKategoriMenu(false); setCurrentPage(1); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Semua Kategori</button>
                  {categories.map((cat) => (
                    <button key={cat.id_kategori} onClick={() => { setFilterKategori(String(cat.id_kategori)); setShowKategoriMenu(false); setCurrentPage(1); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">{cat.nama_kategori}</button>
                  ))}
                </div>
              )}
            </div>
            {/* Filter Status */}
            <div className="relative">
              <button onClick={() => { setShowStatusMenu(!showStatusMenu); setShowKategoriMenu(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Filter size={15} />
                {filterStatus ? STATUS_CONFIG[filterStatus]?.label : "Semua Status"}
              </button>
              {showStatusMenu && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
                  <button onClick={() => { setFilterStatus(""); setShowStatusMenu(false); setCurrentPage(1); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Semua Status</button>
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <button key={key} onClick={() => { setFilterStatus(key); setShowStatusMenu(false); setCurrentPage(1); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">{val.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["No", "Nama Alat", "Kategori", "Pemilik", "Stok", "Harga/Hari", "Status", "Aksi"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-400 ${i === 0 || i === 4 || i === 7 ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Tidak ada alat ditemukan.</td></tr>
              ) : paginated.map((gear, index) => (
                <tr key={gear.id_barang} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 text-center text-gray-400">{(currentPage - 1) * PER_PAGE + index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-gray-100 shrink-0">
                        <Package size={16} className="text-emerald-600" />
                      </div>
                      <span className="font-medium">{gear.nama_barang}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                      {gear.kategori?.nama_kategori || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{gear.pemilik?.nama || "SiPetualang HQ"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs ${getStokColor(gear.jumlah_stok)}`}>{gear.jumlah_stok}</span>
                  </td>
                  <td className="px-4 py-3">{formatHarga(gear.harga_sewa)}</td>
                  <td className="px-4 py-3"><StatusBadge status={gear.status_barang} /></td>
                  <td className="px-4 py-3 text-center">
                    <div className="relative inline-block">
                      <ActionMenu
                        onView={() => setDetailGearId(gear.id_barang)}
                        onEdit={() => { setEditingGear(gear); setIsEditModalOpen(true); }}
                        onDelete={() => { setGearToDelete(gear); setIsDeleteModalOpen(true); }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t flex items-center justify-between text-sm text-gray-400">
          <div>
            Showing {paginated.length > 0 ? (currentPage - 1) * PER_PAGE + 1 : 0}–{(currentPage - 1) * PER_PAGE + paginated.length} of {filtered.length} alat
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
              <ChevronLeft size={14} />
            </button>
            {pageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={i} className="px-2">...</span>
              ) : (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 text-xs rounded-lg border transition ${p === currentPage ? "bg-emerald-700 text-white border-emerald-700" : "border-gray-200 hover:bg-gray-50"}`}>
                  {p}
                </button>
              )
            )}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditGearModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
        gear={editingGear} categories={categories} destinations={destinations} onSave={handleSaveEdit} />

      {/* Delete Modal */}
      <DeleteGearModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setGearToDelete(null); }}
        onConfirm={() => gearToDelete && handleDelete(gearToDelete.id_barang)}
        itemName={gearToDelete?.nama_barang || "Alat ini"} />
    </div>
  );
}