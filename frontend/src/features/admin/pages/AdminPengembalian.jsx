import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api, { BASE_URL } from "@/services/api";
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Loader2,
  Package,
  User,
  Calendar,
  FileText,
  ImageIcon,
  Banknote,
  Upload
} from "lucide-react";

const STATUS_MAP = {
  pending: { label: "Menunggu Review", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  disetujui: { label: "Disetujui", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
  ditolak: { label: "Ditolak", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
};

const REFUND_STATUS_MAP = {
  belum_refund: { label: "Belum Refund", color: "bg-gray-100 text-gray-600 border-gray-200" },
  proses_refund: { label: "Proses Refund", color: "bg-blue-100 text-blue-700 border-blue-200" },
  sudah_refund: { label: "Sudah Refund", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const METODE_REFUND_LABELS = {
  transfer_bank: "Transfer Bank",
  ewallet: "E-Wallet",
  tunai: "Tunai",
};

export default function AdminPengembalian() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [catatan, setCatatan] = useState("");

  // Refund confirmation state
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [metodeRefund, setMetodeRefund] = useState("");
  const [buktiRefund, setBuktiRefund] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/pengembalian");
      setRequests(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data pengajuan pengembalian");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = filter === "all"
    ? requests
    : requests.filter((r) => r.status === filter);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await api.post(`/admin/pengembalian/${id}/approve`, {
        catatan_admin: catatan || undefined,
      });
      toast.success("Pengajuan pengembalian disetujui");
      setShowDetail(false);
      setCatatan("");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyetujui");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!catatan || catatan.length < 5) {
      toast.error("Catatan wajib diisi minimal 5 karakter untuk penolakan");
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/admin/pengembalian/${id}/reject`, {
        catatan_admin: catatan,
      });
      toast.success("Pengajuan pengembalian ditolak");
      setShowDetail(false);
      setCatatan("");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menolak");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRefund = async (id) => {
    if (!metodeRefund) {
      toast.error("Pilih metode refund");
      return;
    }
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("metode_refund", metodeRefund);
      if (buktiRefund) formData.append("bukti_refund", buktiRefund);

      await api.post(`/admin/pengembalian/${id}/confirm-refund`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Refund berhasil dikonfirmasi!");
      setShowDetail(false);
      setShowRefundForm(false);
      setMetodeRefund("");
      setBuktiRefund(null);
      setBuktiPreview(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengkonfirmasi refund");
    } finally {
      setActionLoading(false);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    disetujui: requests.filter((r) => r.status === "disetujui").length,
    ditolak: requests.filter((r) => r.status === "ditolak").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
          <RotateCcw className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengajuan Pengembalian</h1>
          <p className="text-sm text-muted-foreground">
            Kelola pengajuan pengembalian barang dari customer
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-700", bg: "bg-gray-50" },
          { label: "Menunggu", value: stats.pending, color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: "Disetujui", value: stats.disetujui, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Ditolak", value: stats.ditolak, color: "text-red-700", bg: "bg-red-50" },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-none">
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "Semua" },
          { key: "pending", label: "Menunggu" },
          { key: "disetujui", label: "Disetujui" },
          { key: "ditolak", label: "Ditolak" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all border ${
              filter === tab.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <Card className="shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Tidak ada pengajuan</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredRequests.map((req) => {
                const statusCfg = STATUS_MAP[req.status] || STATUS_MAP.pending;
                const StatusIcon = statusCfg.icon;
                const fotoBukti = Array.isArray(req.foto_bukti) ? req.foto_bukti : [];

                return (
                  <div
                    key={req.id_pengajuan}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedRequest(req);
                      setShowDetail(true);
                      setCatatan("");
                    }}
                  >
                    {/* Photo preview */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden border flex-shrink-0 bg-gray-100 flex items-center justify-center">
                      {fotoBukti.length > 0 ? (
                        <img
                          src={`${BASE_URL}/storage/${fotoBukti[0]}`}
                          alt="Bukti"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm truncate">
                          {req.transaksi?.nama_barang || "Barang"}
                        </h4>
                        <Badge className={`text-[9px] font-bold border ${statusCfg.color} flex-shrink-0`}>
                          <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-medium">{req.customer?.nama}</span> · {new Date(req.created_at).toLocaleDateString("id-ID")}
                      </p>
                      {req.status === 'disetujui' && req.status_refund && (
                        <Badge className={`text-[8px] font-bold border mt-1 ${(REFUND_STATUS_MAP[req.status_refund] || REFUND_STATUS_MAP.belum_refund).color}`}>
                          <Banknote className="w-2.5 h-2.5 mr-0.5" />
                          {(REFUND_STATUS_MAP[req.status_refund] || REFUND_STATUS_MAP.belum_refund).label}
                        </Badge>
                      )}
                    </div>

                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetail && selectedRequest && (() => {
        const req = selectedRequest;
        const statusCfg = STATUS_MAP[req.status] || STATUS_MAP.pending;
        const StatusIcon = statusCfg.icon;
        const fotoBukti = Array.isArray(req.foto_bukti) ? req.foto_bukti : [];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white dark:bg-gray-900 z-10">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold">Detail Pengajuan</h2>
                </div>
                <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <Badge className={`text-xs font-bold border ${statusCfg.color}`}>
                    <StatusIcon className="w-3.5 h-3.5 mr-1" />
                    {statusCfg.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400 font-medium">Customer</span>
                    </div>
                    <p className="font-bold text-sm">{req.customer?.nama || "-"}</p>
                    <p className="text-xs text-muted-foreground">{req.customer?.email || "-"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400 font-medium">Barang</span>
                    </div>
                    <p className="font-bold text-sm">{req.transaksi?.nama_barang || "-"}</p>
                    <p className="text-xs text-muted-foreground">
                      ID Transaksi: #{req.id_transaksi}
                    </p>
                  </div>
                </div>

                {/* Alasan */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold">Alasan Pengembalian</span>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    {req.alasan}
                  </div>
                </div>

                {/* Foto Bukti */}
                {fotoBukti.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold">Foto Bukti ({fotoBukti.length})</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {fotoBukti.map((foto, i) => (
                        <img
                          key={i}
                          src={`${BASE_URL}/storage/${foto}`}
                          alt={`Bukti ${i + 1}`}
                          className="w-full aspect-square rounded-xl object-cover border cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(`${BASE_URL}/storage/${foto}`, '_blank')}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/200"; }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Catatan Admin (existing) */}
                {req.catatan_admin && req.status !== 'pending' && (
                  <div className={`p-4 rounded-xl text-sm ${
                    req.status === 'disetujui' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <strong>Catatan Admin:</strong> {req.catatan_admin}
                  </div>
                )}

                {/* Admin Action */}
                {req.status === "pending" && (
                  <div className="border-t pt-5 space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                        Catatan Admin (wajib untuk penolakan)
                      </label>
                      <textarea
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        rows={3}
                        placeholder="Tulis catatan untuk customer..."
                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleReject(req.id_pengajuan)}
                        disabled={actionLoading}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-2"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Tolak
                      </Button>
                      <Button
                        onClick={() => handleApprove(req.id_pengajuan)}
                        disabled={actionLoading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Setujui + Refund
                      </Button>
                    </div>
                  </div>
                )}

                {/* Refund Info Section */}
                {req.status === 'disetujui' && (
                  <div className="border-t pt-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Banknote className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold">Informasi Refund</span>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Jumlah Refund</p>
                          <p className="font-bold text-emerald-700 text-lg">
                            Rp {Number(req.jumlah_refund || 0).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Status Refund</p>
                          <Badge className={`text-xs font-bold border mt-1 ${(REFUND_STATUS_MAP[req.status_refund] || REFUND_STATUS_MAP.belum_refund).color}`}>
                            {(REFUND_STATUS_MAP[req.status_refund] || REFUND_STATUS_MAP.belum_refund).label}
                          </Badge>
                        </div>
                        {req.metode_refund && (
                          <div>
                            <p className="text-xs text-gray-400">Metode</p>
                            <p className="font-medium">{METODE_REFUND_LABELS[req.metode_refund] || req.metode_refund}</p>
                          </div>
                        )}
                        {req.tanggal_refund && (
                          <div>
                            <p className="text-xs text-gray-400">Tanggal Refund</p>
                            <p className="font-medium">{new Date(req.tanggal_refund).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                        )}
                      </div>

                      {req.bukti_refund && (
                        <div className="mt-3 pt-3 border-t border-emerald-200">
                          <p className="text-xs text-gray-400 mb-2">Bukti Transfer</p>
                          <img
                            src={`${BASE_URL}/storage/${req.bukti_refund}`}
                            alt="Bukti Refund"
                            className="w-32 h-32 rounded-xl object-cover border cursor-pointer hover:opacity-90"
                            onClick={() => window.open(`${BASE_URL}/storage/${req.bukti_refund}`, '_blank')}
                          />
                        </div>
                      )}
                    </div>

                    {/* Confirm Refund Button */}
                    {req.status_refund !== 'sudah_refund' && (
                      <div>
                        {!showRefundForm ? (
                          <Button
                            onClick={() => setShowRefundForm(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                          >
                            <Banknote className="w-4 h-4" />
                            Konfirmasi Refund Sudah Dikirim
                          </Button>
                        ) : (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                            <h4 className="text-sm font-bold text-blue-800">Konfirmasi Pengiriman Refund</h4>
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1 block">Metode Refund *</label>
                              <select
                                value={metodeRefund}
                                onChange={(e) => setMetodeRefund(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">-- Pilih metode --</option>
                                <option value="transfer_bank">Transfer Bank</option>
                                <option value="ewallet">E-Wallet (GoPay, OVO, dll)</option>
                                <option value="tunai">Tunai</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1 block">Bukti Transfer (opsional)</label>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-blue-50 text-sm">
                                  <Upload className="w-4 h-4 text-gray-400" />
                                  {buktiRefund ? buktiRefund.name : 'Upload bukti'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files[0];
                                      if (f) {
                                        setBuktiRefund(f);
                                        setBuktiPreview(URL.createObjectURL(f));
                                      }
                                    }}
                                  />
                                </label>
                                {buktiPreview && (
                                  <img src={buktiPreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover border" />
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setShowRefundForm(false);
                                  setMetodeRefund("");
                                  setBuktiRefund(null);
                                  setBuktiPreview(null);
                                }}
                              >
                                Batal
                              </Button>
                              <Button
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => handleConfirmRefund(req.id_pengajuan)}
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
                              >
                                {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                Konfirmasi
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
