import { useEffect, useState } from "react";
import TablePagination, { paginateArray } from "@/components/TablePagination";
import { adminService } from "../services/adminService";
import { 
  Truck, 
  MapPin, 
  User, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  X, 
  ChevronRight,
  Package,
  Navigation,
  ArrowRight,
  Eye,
  HandMetal
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BASE_URL } from "@/services/api";

export default function ShippingStatus() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  // State Modals
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Form States
  const [shipForm, setShipForm] = useState({
    kurir: "SiPetualang Delivery",
    no_resi: "",
    lokasi_terakhir: "Gudang Utama SiPetualang"
  });

  const [updateForm, setUpdateForm] = useState({
    lokasi_terakhir: "",
    status_pengiriman: "dikirim"
  });

  const [returnForm, setReturnForm] = useState({
    kondisi_barang: "baik",
    catatan: "",
    denda_kerusakan: 0
  });

  const getData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getPengiriman();
      const items = response?.data ?? response ?? [];
      setData(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Fetch pengiriman error:", err);
      setError(err?.response?.data?.message || err?.message || "Gagal memuat data pengiriman");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleShipSubmit = async (e) => {
    e.preventDefault();
    if (!shipForm.kurir || !shipForm.no_resi || !shipForm.lokasi_terakhir) {
      toast.error("Semua field pengiriman wajib diisi!");
      return;
    }

    try {
      await adminService.kirimBarang(selectedTrx.id_transaksi, shipForm);
      toast.success("Barang berhasil ditandai sebagai dikirim & resi tercatat!");
      setIsShipModalOpen(false);
      setSelectedTrx(null);
      // Reset form
      setShipForm({
        kurir: "SiPetualang Delivery",
        no_resi: "",
        lokasi_terakhir: "Gudang Utama SiPetualang"
      });
      getData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal mengirim barang");
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateForm.lokasi_terakhir) {
      toast.error("Nama lokasi saat ini wajib diisi!");
      return;
    }

    try {
      const idPengiriman = selectedTrx.pengiriman.id_pengiriman;
      await adminService.updateLokasi(idPengiriman, updateForm);
      toast.success("Detail lokasi & status pengiriman berhasil diperbarui!");
      setIsUpdateModalOpen(false);
      setSelectedTrx(null);
      getData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal memperbarui lokasi");
    }
  };

  // Handle pickup: Barang sudah diambil
  const handlePickupDiambil = async (trx) => {
    if (!confirm(`Konfirmasi bahwa customer "${trx.penyewa?.nama}" telah mengambil barang "${trx.nama_barang}"?`)) return;
    
    try {
      await adminService.pickupBarangDiambil(trx.id_transaksi);
      toast.success("Barang berhasil ditandai sebagai diambil! Status sewa aktif.");
      getData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal memperbarui status pengambilan");
    }
  };

  // Handle return confirmation (for both pickup and delivery)
  const openReturnModal = (trx) => {
    setSelectedTrx(trx);
    setReturnForm({
      kondisi_barang: "baik",
      catatan: "",
      denda_kerusakan: 0
    });
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnForm.kondisi_barang) {
      toast.error("Kondisi barang wajib diisi!");
      return;
    }

    try {
      await adminService.konfirmasiKembali(selectedTrx.id_transaksi, returnForm);
      toast.success("Pengembalian barang berhasil dikonfirmasi & transaksi selesai!");
      setIsReturnModalOpen(false);
      setSelectedTrx(null);
      getData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal mengonfirmasi pengembalian");
    }
  };

  const openShipModal = (trx) => {
    setSelectedTrx(trx);
    setIsShipModalOpen(true);
  };

  const openUpdateModal = (trx) => {
    setSelectedTrx(trx);
    setUpdateForm({
      lokasi_terakhir: trx.pengiriman?.lokasi_terakhir || "",
      status_pengiriman: trx.pengiriman?.status_pengiriman || "dikirim"
    });
    setIsUpdateModalOpen(true);
  };

  // Filter & Search Logic
  const filteredData = data.filter((item) => {
    // Search filter
    const matchesSearch = 
      item.nama_barang?.toLowerCase().includes(search.toLowerCase()) ||
      (item.detail_transaksi || []).some(d => (d.nama_barang || d.barang?.nama_barang || '').toLowerCase().includes(search.toLowerCase())) ||
      item.id_transaksi.toString().includes(search) ||
      (item.penyewa?.nama || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === "semua") return true;
    if (activeTab === "pickup") return item.metode_pengiriman === "pickup";
    if (activeTab === "delivery") return item.metode_pengiriman === "delivery";
    
    // Status delivery filters
    if (activeTab === "perlu_dikirim") {
      return item.metode_pengiriman === "delivery" && (!item.pengiriman || item.pengiriman.status_pengiriman === "pending");
    }
    if (activeTab === "dikirim") {
      return item.metode_pengiriman === "delivery" && item.pengiriman?.status_pengiriman === "dikirim";
    }
    if (activeTab === "sampai") {
      return item.metode_pengiriman === "delivery" && item.pengiriman?.status_pengiriman === "sampai";
    }
    if (activeTab === "diterima") {
      return (item.metode_pengiriman === "delivery" && item.pengiriman?.status_pengiriman === "diterima") ||
             (item.metode_pengiriman === "pickup" && item.status_sewa === "sedang_disewa");
    }

    // Pickup specific filters
    if (activeTab === "pickup_menunggu") {
      return item.metode_pengiriman === "pickup" && item.status_sewa === "dibayar";
    }
    if (activeTab === "pickup_disewa") {
      return item.metode_pengiriman === "pickup" && item.status_sewa === "sedang_disewa" && item.status_kembali === "belum";
    }
    if (activeTab === "pickup_kembali") {
      return item.metode_pengiriman === "pickup" && item.status_kembali === "proses";
    }

    // General return filter
    if (activeTab === "proses_kembali") {
      return item.status_kembali === "proses";
    }

    return true;
  });

  const getStatusBadge = (trx) => {
    if (trx.metode_pengiriman === "pickup") {
      // Dynamic pickup badges
      if (trx.status_sewa === "dibayar") {
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1.5 w-fit">
            <Package className="size-3.5" /> Menunggu Diambil
          </span>
        );
      }
      if (trx.status_sewa === "sedang_disewa" && trx.status_kembali === "proses") {
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 flex items-center gap-1.5 w-fit animate-pulse">
            <Package className="size-3.5" /> Proses Pengembalian
          </span>
        );
      }
      if (trx.status_sewa === "sedang_disewa") {
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="size-3.5" /> Sedang Disewa
          </span>
        );
      }
      if (trx.status_sewa === "selesai") {
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="size-3.5" /> Selesai
          </span>
        );
      }
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1.5 w-fit">
          <Package className="size-3.5" /> Pick Up
        </span>
      );
    }

    const status = trx.pengiriman?.status_pengiriman || "pending";
    switch (status) {
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1.5 w-fit">
            <AlertCircle className="size-3.5" /> Siap Dikirim
          </span>
        );
      case "dikirim":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1.5 w-fit animate-pulse">
            <Truck className="size-3.5" /> Sedang Dikirim
          </span>
        );
      case "sampai":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center gap-1.5 w-fit">
            <MapPin className="size-3.5" /> Tiba di Tujuan
          </span>
        );
      case "diterima":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="size-3.5" /> Diterima Customer
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Truck className="size-6 text-emerald-600" />
            Status Pengiriman Barang
          </h1>
          <p className="text-sm text-slate-500">
            Kelola pengiriman barang sewaan dengan kurir pengantar, lokasi pos, dan pelacakan customer.
          </p>
        </div>
      </div>

      {/* Stats Card Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl dark:bg-amber-900/20">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Perlu Dikirim</p>
              <h3 className="text-xl font-bold text-slate-800">
                {data.filter(t => t.metode_pengiriman === 'delivery' && (!t.pengiriman || t.pengiriman.status_pengiriman === 'pending')).length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl dark:bg-blue-900/20">
              <Truck className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Dalam Perjalanan</p>
              <h3 className="text-xl font-bold text-slate-800">
                {data.filter(t => t.metode_pengiriman === 'delivery' && t.pengiriman?.status_pengiriman === 'dikirim').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl dark:bg-purple-900/20">
              <HandMetal className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pickup Menunggu</p>
              <h3 className="text-xl font-bold text-slate-800">
                {data.filter(t => t.metode_pengiriman === 'pickup' && t.status_sewa === 'dibayar').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-orange-100 text-orange-700 rounded-2xl dark:bg-orange-900/20">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Proses Kembali</p>
              <h3 className="text-xl font-bold text-slate-800">
                {data.filter(t => t.status_kembali === 'proses').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-green-100 text-green-700 rounded-2xl dark:bg-green-900/20">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Selesai/Diterima</p>
              <h3 className="text-xl font-bold text-slate-800">
                {data.filter(t => 
                  (t.metode_pengiriman === 'delivery' && t.pengiriman?.status_pengiriman === 'diterima') ||
                  (t.metode_pengiriman === 'pickup' && t.status_sewa === 'sedang_disewa')
                ).length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi, customer, barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-sm border rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50/50 dark:bg-slate-800 dark:border-slate-700"
          />
        </div>

        {/* Tabs Scrollable */}
        <div className="flex flex-wrap gap-1 w-full md:w-auto">
          {[
            { id: "semua", label: "Semua" },
            { id: "pickup", label: "Pick Up" },
            { id: "pickup_menunggu", label: "Pickup Menunggu" },
            { id: "delivery", label: "Delivery" },
            { id: "perlu_dikirim", label: "Perlu Dikirim" },
            { id: "dikirim", label: "Dalam Perjalanan" },
            { id: "proses_kembali", label: "Proses Kembali" },
            { id: "diterima", label: "Diterima" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / List Card */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border rounded-2xl p-12 text-center text-slate-500">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            <p className="text-sm font-medium">Memuat data pengiriman sewaan...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900 rounded-2xl p-8 text-center text-sm font-medium flex flex-col items-center justify-center gap-2">
          <AlertCircle className="size-8" />
          {error}
          <Button variant="outline" size="sm" onClick={getData} className="mt-2">Coba Lagi</Button>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Truck className="size-12 text-slate-300" />
          <p className="text-sm font-medium">Tidak ada data transaksi pengiriman yang sesuai filter.</p>
        </div>
      ) : (
        <>
        <div className="grid gap-4">
          {paginateArray(filteredData, currentPage, PER_PAGE).map((item) => (
            <Card key={item.id_transaksi} className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white dark:bg-slate-900">
              <div className="border-b bg-slate-50/50 dark:bg-slate-800/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <Package className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                      ID Transaksi: #{item.id_transaksi}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="size-3" />
                      Mulai: {new Date(item.tanggal_mulai).toLocaleDateString("id-ID")} - Selesai: {new Date(item.tanggal_selesai).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(item)}
                </div>
              </div>

              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Kolom 1: Informasi Barang & Customer */}
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Peralatan Alat</p>
                    {item.detail_transaksi && item.detail_transaksi.length > 0 ? (
                      <div className="space-y-1">
                        {item.detail_transaksi.map((detail, idx) => (
                          <div key={detail.id_detail || idx} className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                              {detail.nama_barang || detail.barang?.nama_barang}
                              <span className="text-xs text-slate-500 font-normal ml-1">({detail.jumlah_pinjam} unit)</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                          {item.nama_barang}
                        </p>
                        <p className="text-xs text-slate-500">Jumlah: {item.jumlah} unit</p>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 border-t pt-2">
                    <User className="size-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {item.penyewa?.nama || "Penyewa"}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.penyewa?.no_telp || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Kolom 2: Informasi Pengiriman & Resi */}
                <div className="space-y-2 border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Informasi Lokasi & Alamat</p>
                  
                  {item.metode_pengiriman === "delivery" ? (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-600 dark:text-slate-400">
                        <strong className="text-slate-700">Tujuan:</strong> {item.alamat_pengiriman || "Alamat tidak diinput"}
                      </p>
                      {item.pengiriman ? (
                        <>
                          <p className="text-slate-600 dark:text-slate-400">
                            <strong className="text-slate-700">Kurir:</strong> {item.pengiriman.kurir} ({item.pengiriman.no_resi})
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 flex items-start gap-1">
                            <Navigation className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-slate-700">Posisi Terakhir:</strong> {item.pengiriman.lokasi_terakhir}
                            </span>
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-500 italic">Belum dikirim. Silakan klik tombol "Kirim Barang" di samping.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-600 dark:text-slate-400">
                        Customer memilih metode <strong>Ambil di Tempat (Pick Up)</strong>.
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Status Sewa: <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{item.status_sewa?.replace('_', ' ')}</span>
                      </p>
                      {item.status_kembali && item.status_kembali !== 'belum' && (
                        <p className="text-slate-600 dark:text-slate-400">
                          Status Pengembalian: <span className={`font-semibold capitalize ${item.status_kembali === 'proses' ? 'text-orange-600' : item.status_kembali === 'diterima' ? 'text-green-600' : 'text-slate-700'}`}>
                            {item.status_kembali}
                          </span>
                        </p>
                      )}
                      {item.metode_kembali && (
                        <p className="text-slate-600 dark:text-slate-400">
                          Metode Kembali: <span className="font-medium">{item.metode_kembali === 'delivery' ? 'Kirim via Kurir' : 'Datang Langsung'}</span>
                        </p>
                      )}
                      {item.no_resi_kembali && (
                        <p className="text-slate-600 dark:text-slate-400 font-mono">
                          <span className="font-medium font-sans">No. Resi Kembali:</span> {item.no_resi_kembali}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Kolom 3: Aksi Dinamis */}
                <div className="flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                  {item.metode_pengiriman === "delivery" ? (
                    <>
                      {/* Kasus 1: Belum dikirim sama sekali */}
                      {(!item.pengiriman || item.pengiriman.status_pengiriman === "pending") && (
                        <Button 
                          className="bg-emerald-700 hover:bg-emerald-800 text-white w-full gap-2 py-5 text-sm"
                          onClick={() => openShipModal(item)}
                        >
                          <Truck className="size-4" />
                          Kirim Barang
                        </Button>
                      )}

                      {/* Kasus 2: Sedang dikirim */}
                      {item.pengiriman?.status_pengiriman === "dikirim" && (
                        <Button 
                          variant="outline"
                          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 w-full gap-2 py-5 text-sm"
                          onClick={() => openUpdateModal(item)}
                        >
                          <Navigation className="size-4" />
                          Update Lokasi
                        </Button>
                      )}

                      {/* Kasus 3: Tiba di tujuan tapi belum dikonfirmasi */}
                      {item.pengiriman?.status_pengiriman === "sampai" && (
                        <div className="text-center p-3 rounded-lg bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/10 dark:border-indigo-900/30">
                          <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold flex items-center justify-center gap-1.5">
                            <MapPin className="size-3.5" /> Sudah Tiba di Lokasi
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Menunggu konfirmasi penerimaan oleh customer.
                          </p>
                        </div>
                      )}

                      {/* Kasus 4: Sudah diterima customer — check return status */}
                      {item.pengiriman?.status_pengiriman === "diterima" && (
                        <>
                          {item.status_kembali === "proses" ? (
                            <Button 
                              className="bg-orange-600 hover:bg-orange-700 text-white w-full gap-2 py-5 text-sm"
                              onClick={() => openReturnModal(item)}
                            >
                              <CheckCircle2 className="size-4" />
                              Konfirmasi Barang Diterima
                            </Button>
                          ) : item.status_sewa === "selesai" ? (
                            <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100 dark:bg-green-950/10 dark:border-green-900/30">
                              <p className="text-xs text-green-700 dark:text-green-400 font-semibold flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="size-3.5" /> Transaksi Selesai
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                Barang sudah dikembalikan & diverifikasi.
                              </p>
                            </div>
                          ) : (
                            <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100 dark:bg-green-950/10 dark:border-green-900/30">
                              <p className="text-xs text-green-700 dark:text-green-400 font-semibold flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="size-3.5" /> Selesai Diterima
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                Barang sudah seutuhnya di tangan customer.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    /* ===== PICKUP SECTION — Dynamic Action Buttons ===== */
                    <>
                      {/* Kasus 1: Dibayar, menunggu customer ambil */}
                      {item.status_sewa === "dibayar" && (
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700 text-white w-full gap-2 py-5 text-sm"
                          onClick={() => handlePickupDiambil(item)}
                        >
                          <HandMetal className="size-4" />
                          Barang Sudah Diambil
                        </Button>
                      )}

                      {/* Kasus 2: Sedang disewa, belum dikembalikan */}
                      {item.status_sewa === "sedang_disewa" && item.status_kembali === "belum" && (
                        <div className="text-center p-4 rounded-xl border bg-blue-50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30">
                          <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="size-3.5" /> Sedang Disewa
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Menunggu customer mengembalikan barang.
                          </p>
                        </div>
                      )}

                      {/* Kasus 3: Customer sudah ajukan pengembalian */}
                      {item.status_sewa === "sedang_disewa" && item.status_kembali === "proses" && (
                        <Button 
                          className="bg-orange-600 hover:bg-orange-700 text-white w-full gap-2 py-5 text-sm"
                          onClick={() => openReturnModal(item)}
                        >
                          <CheckCircle2 className="size-4" />
                          Konfirmasi Barang Diterima
                        </Button>
                      )}

                      {/* Kasus 4: Selesai */}
                      {item.status_sewa === "selesai" && (
                        <div className="text-center p-4 rounded-xl border bg-green-50 dark:bg-green-950/10 border-green-100 dark:border-green-900/30">
                          <p className="text-xs text-green-700 dark:text-green-400 font-semibold flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="size-3.5" /> Transaksi Selesai
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Barang sudah dikembalikan & diverifikasi.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          perPage={PER_PAGE}
          onPageChange={setCurrentPage}
          label="transaksi"
        />
        </>
      )}

      {/* Modal 1: Kirim Barang */}
      {isShipModalOpen && selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Truck className="size-5 text-emerald-600" />
                Proses Kirim Barang
              </h2>
              <button 
                onClick={() => { setIsShipModalOpen(false); setSelectedTrx(null); }} 
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleShipSubmit} className="p-6 space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl text-xs space-y-1.5 text-emerald-800 dark:text-emerald-400">
                <p><strong>Alat Sewaan:</strong> {selectedTrx.nama_barang} ({selectedTrx.jumlah} unit)</p>
                <p><strong>Penyewa:</strong> {selectedTrx.penyewa?.nama}</p>
                <p><strong>Alamat Kirim:</strong> {selectedTrx.alamat_pengiriman}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nama Kurir / Pengantar</label>
                <select
                  value={shipForm.kurir}
                  onChange={(e) => setShipForm(prev => ({ ...prev, kurir: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="SiPetualang Delivery">SiPetualang Delivery (Internal)</option>
                  <option value="JNE Express">JNE Express</option>
                  <option value="J&T Express">J&T Express</option>
                  <option value="SiCepat Express">SiCepat Express</option>
                  <option value="GoSend / GrabExpress">GoSend / GrabExpress</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nomor Resi Pengiriman</label>
                <input
                  type="text"
                  placeholder="Contoh: SP-0812384218 atau resi kurir"
                  value={shipForm.no_resi}
                  onChange={(e) => setShipForm(prev => ({ ...prev, no_resi: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Lokasi Awal Keberangkatan</label>
                <input
                  type="text"
                  value={shipForm.lokasi_terakhir}
                  onChange={(e) => setShipForm(prev => ({ ...prev, lokasi_terakhir: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsShipModalOpen(false); setSelectedTrx(null); }}
                  className="rounded-xl border-slate-200"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl"
                >
                  Mulai Pengiriman
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Update Lokasi */}
      {isUpdateModalOpen && selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Navigation className="size-5 text-emerald-600" />
                Perbarui Lokasi & Status
              </h2>
              <button 
                onClick={() => { setIsUpdateModalOpen(false); setSelectedTrx(null); }} 
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <p><strong>Kurir:</strong> {selectedTrx.pengiriman?.kurir}</p>
                <p><strong>Nomor Resi:</strong> {selectedTrx.pengiriman?.no_resi}</p>
                <p><strong>Lokasi Terakhir:</strong> {selectedTrx.pengiriman?.lokasi_terakhir}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Lokasi Pos Terkini</label>
                <input
                  type="text"
                  placeholder="Contoh: Hub Sleman, atau Sedang dikirim kurir"
                  value={updateForm.lokasi_terakhir}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, lokasi_terakhir: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Status Pengiriman</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUpdateForm(prev => ({ ...prev, status_pengiriman: "dikirim" }))}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      updateForm.status_pengiriman === "dikirim"
                        ? "border-blue-500 bg-blue-50/50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Truck className="size-4" /> Dalam Perjalanan
                  </button>

                  <button
                    type="button"
                    onClick={() => setUpdateForm(prev => ({ ...prev, status_pengiriman: "sampai" }))}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      updateForm.status_pengiriman === "sampai"
                        ? "border-indigo-500 bg-indigo-50/50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <MapPin className="size-4" /> Sudah Sampai
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsUpdateModalOpen(false); setSelectedTrx(null); }}
                  className="rounded-xl border-slate-200"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl"
                >
                  Perbarui Posisi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Konfirmasi Pengembalian Barang (Admin terima kembali) */}
      {isReturnModalOpen && selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-orange-600" />
                Konfirmasi Pengembalian Barang
              </h2>
              <button 
                onClick={() => { setIsReturnModalOpen(false); setSelectedTrx(null); }} 
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
              <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl text-xs space-y-1.5 text-orange-800 dark:text-orange-400">
                <p><strong>Alat Sewaan:</strong> {selectedTrx.nama_barang} ({selectedTrx.jumlah} unit)</p>
                <p><strong>Penyewa:</strong> {selectedTrx.penyewa?.nama}</p>
                <p><strong>Metode Pengiriman:</strong> {selectedTrx.metode_pengiriman === 'pickup' ? 'Ambil di Tempat' : 'Delivery'}</p>
                {selectedTrx.metode_kembali && (
                  <p><strong>Metode Kembali:</strong> {selectedTrx.metode_kembali === 'delivery' ? 'Kirim via Kurir' : 'Datang Langsung'}</p>
                )}
                {selectedTrx.no_resi_kembali && (
                  <p><strong>No. Resi Kembali:</strong> {selectedTrx.no_resi_kembali}</p>
                )}
                <p><strong>Batas Waktu Sewa:</strong> {new Date(selectedTrx.tanggal_selesai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Kondisi Barang Saat Diterima</label>
                <select
                  value={returnForm.kondisi_barang}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, kondisi_barang: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="baik">Baik (Tidak Ada Kerusakan)</option>
                  <option value="rusak_ringan">Rusak Ringan</option>
                  <option value="rusak_berat">Rusak Berat</option>
                  <option value="hilang_komponen">Hilang Komponen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Denda Kerusakan (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={returnForm.denda_kerusakan}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, denda_kerusakan: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white dark:bg-slate-800 dark:border-slate-700"
                  placeholder="0"
                />
                <p className="text-[10px] text-slate-400 mt-1">Isi 0 jika tidak ada kerusakan. Denda otomatis dipotong dari deposit.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Catatan Admin (Opsional)</label>
                <textarea
                  value={returnForm.catatan}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, catatan: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white dark:bg-slate-800 dark:border-slate-700 resize-none"
                  rows={3}
                  placeholder="Catatan tentang kondisi barang, kerusakan, dll..."
                />
              </div>

              {/* Deposit Info */}
              {Number(selectedTrx.nominal_deposit) > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                  <p className="font-bold text-emerald-800 dark:text-emerald-400">Informasi Deposit:</p>
                  <p className="text-emerald-700">Deposit Awal: <strong>Rp {Number(selectedTrx.nominal_deposit).toLocaleString()}</strong></p>
                  <p className="text-emerald-700">Denda Kerusakan: <strong>Rp {Number(returnForm.denda_kerusakan).toLocaleString()}</strong></p>
                  <p className="text-[10px] text-emerald-600 italic">* Denda keterlambatan dihitung otomatis oleh sistem berdasarkan tanggal pengembalian.</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsReturnModalOpen(false); setSelectedTrx(null); }}
                  className="rounded-xl border-slate-200"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                >
                  Konfirmasi & Selesaikan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
