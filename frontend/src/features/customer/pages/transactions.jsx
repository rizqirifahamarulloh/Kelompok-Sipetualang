import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { transactionService } from '../services/transactionService';
import Navbar from "@/features/customer/components/Navbar";
import Sidebar from "@/features/customer/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Calendar,
  MapPin,
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Store,
  X,
  Loader2,
  RotateCcw,
  ArrowDown,
  ArrowUp,
  ShoppingBag,
  AlertCircle,
  MessageSquare,
  Star,
  Camera,
  Edit,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '@/services/api';
import { getStorageUrl } from '@/utils/storageUrl';
import { toast } from 'sonner';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

const formatDateTime = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

// ── Status configs ──
const STATUS_CONFIG = {
  dibayar: { label: 'Dibayar', icon: CreditCard, cls: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  sedang_disewa: { label: 'Sedang Disewa', icon: Package, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  selesai: { label: 'Selesai', icon: CheckCircle, cls: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rentalFilter, setRentalFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  // Return modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnTrx, setSelectedReturnTrx] = useState(null);
  const [returnForm, setReturnForm] = useState({ metode_kembali: 'pickup', no_resi_kembali: '' });
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedItems, setReviewedItems] = useState({});
  const reviewPhoto = usePhotoUpload(5);

  // Edit Ulasan state
  const [editModal, setEditModal] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const editPhoto = usePhotoUpload(5);

  const token = localStorage.getItem('token');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getTransaksiSebagaiPenyewa();
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  // Cek ulasan per barang
  useEffect(() => {
    const checkReviews = async () => {
      const selesai = transactions.filter(t => t.status_sewa === 'selesai');
      if (selesai.length === 0) return;

      const reviewedMap = {};

      for (const t of selesai) {
        try {
          const res = await axios.get(`${API_URL}/customer/ulasan/check/${t.id_transaksi}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data?.data || [];
          data.forEach(item => {
            reviewedMap[`${t.id_transaksi}_${item.id_barang}`] = {
              has_reviewed: item.has_reviewed,
              ulasan: item.ulasan,
              edited_count: item.edited_count || 0,
              sisa_edit: item.sisa_edit || 0,
            };
          });
        } catch (err) {
          console.error('Error checking reviews:', err);
        }
      }
      setReviewedItems(reviewedMap);
    };

    if (transactions.length > 0) {
      checkReviews();
    }
  }, [transactions, token]);

  // ── Filtered & sorted
  const filteredData = useMemo(() => {
    let list = transactions.filter(t => ['sedang_disewa', 'selesai', 'dibayar'].includes(t.status_sewa));
    if (rentalFilter === 'aktif') list = list.filter(t => t.status_sewa === 'sedang_disewa' || t.status_sewa === 'dibayar');
    else if (rentalFilter === 'selesai') list = list.filter(t => t.status_sewa === 'selesai');
    list.sort((a, b) => {
      const dA = new Date(a.created_at).getTime();
      const dB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dB - dA : dA - dB;
    });
    return list;
  }, [transactions, rentalFilter, sortOrder]);

  const stats = useMemo(() => ({
    total: transactions.filter(t => ['sedang_disewa', 'selesai', 'dibayar'].includes(t.status_sewa)).length,
    aktif: transactions.filter(t => t.status_sewa === 'sedang_disewa' || t.status_sewa === 'dibayar').length,
    selesai: transactions.filter(t => t.status_sewa === 'selesai').length,
  }), [transactions]);

  // ── Handlers
  const openReturnModal = (trx) => {
    setSelectedReturnTrx(trx);
    setReturnForm({ metode_kembali: 'pickup', no_resi_kembali: '' });
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReturn(true);
    try {
      await transactionService.kembalikanBarang(selectedReturnTrx.id_transaksi, returnForm);
      toast.success('Pengajuan pengembalian berhasil!');
      setIsReturnModalOpen(false);
      setSelectedReturnTrx(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal mengajukan pengembalian');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getPhotoUrl = () => getStorageUrl(user?.profile_photo);
  const getInitials = () => user?.nama?.charAt(0).toUpperCase() || 'U';

  // ── Review handlers
  const openReviewModal = (trans, id_barang, nama_barang) => {
    setReviewModal({
      ...trans,
      id_barang: id_barang,
      nama_barang: nama_barang
    });
    setReviewRating(0);
    setReviewComment('');
    reviewPhoto.reset();
  };

  const submitReview = async () => {
    if (reviewRating === 0) { toast.error('Pilih rating terlebih dahulu'); return; }
    setSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append('id_transaksi', reviewModal.id_transaksi);
      formData.append('id_barang', reviewModal.id_barang);
      formData.append('rating', reviewRating);
      formData.append('komentar', reviewComment);
      reviewPhoto.photos.forEach((file) => formData.append('foto_ulasan[]', file));
      await axios.post(`${API_URL}/customer/ulasan`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Ulasan untuk "${reviewModal.nama_barang}" berhasil dikirim!`);
      // Refresh reviewed items
      const res = await axios.get(`${API_URL}/customer/ulasan/check/${reviewModal.id_transaksi}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || [];
      const updatedMap = { ...reviewedItems };
      data.forEach(item => {
        updatedMap[`${reviewModal.id_transaksi}_${item.id_barang}`] = {
          has_reviewed: item.has_reviewed,
          ulasan: item.ulasan,
          edited_count: item.edited_count || 0,
          sisa_edit: item.sisa_edit || 0,
        };
      });
      setReviewedItems(updatedMap);
      setReviewModal(null);
      fetchTransactions();
    } catch (err) {
      const data = err.response?.data;
      toast.error(data?.errors ? Object.values(data.errors).flat()[0] : data?.message || 'Gagal mengirim ulasan');
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Edit Review handlers
  const openEditModal = (ulasanData, trans, detailItem) => {
    setEditModal({
      id_ulasan: ulasanData.id_ulasan,
      id_transaksi: trans.id_transaksi,
      id_barang: detailItem.id_barang,
      nama_barang: detailItem.nama_barang || detailItem.barang?.nama_barang,
      rating: ulasanData.rating,
      komentar: ulasanData.komentar || '',
      foto_ulasan: ulasanData.foto_ulasan || [],
      edited_count: ulasanData.edited_count || 0,
      sisa_edit: Math.max(0, 2 - (ulasanData.edited_count || 0))
    });
    setEditRating(ulasanData.rating);
    setEditComment(ulasanData.komentar || '');
    editPhoto.reset(ulasanData.foto_ulasan?.map(f => getStorageUrl(f)) || []);
  };

  const submitEditReview = async () => {
    if (editRating === 0) { toast.error('Pilih rating terlebih dahulu'); return; }
    setSubmittingEdit(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('rating', editRating);
      if (editComment.trim()) formData.append('komentar', editComment);
      editPhoto.photos.forEach((file) => formData.append('foto_ulasan[]', file));
      await axios.post(`${API_URL}/customer/ulasan/${editModal.id_ulasan}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Ulasan berhasil diperbarui!');
      // Refresh
      const res = await axios.get(`${API_URL}/customer/ulasan/check/${editModal.id_transaksi}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || [];
      const updatedMap = { ...reviewedItems };
      data.forEach(item => {
        updatedMap[`${editModal.id_transaksi}_${item.id_barang}`] = {
          has_reviewed: item.has_reviewed,
          ulasan: item.ulasan,
          edited_count: item.edited_count || 0,
          sisa_edit: item.sisa_edit || 0,
        };
      });
      setReviewedItems(updatedMap);
      setEditModal(null);
    } catch (err) {
      const data = err.response?.data;
      toast.error(data?.errors ? Object.values(data.errors).flat()[0] : data?.message || 'Gagal memperbarui ulasan');
    } finally {
      setSubmittingEdit(false);
    }
  };

  if (!user) return null;

  // ── Render single card
  const renderCard = (trans) => {
    const cfg = STATUS_CONFIG[trans.status_sewa] || STATUS_CONFIG.selesai;
    const Icon = cfg.icon;
    const sisaDeposit = Math.max(0, Number(trans.nominal_deposit || 0) - Number(trans.pengembalian?.denda_kerusakan || 0) - Number(trans.pengembalian?.total_denda || 0));

    return (
      <div key={trans.id_transaksi} className="border rounded-2xl bg-card overflow-hidden hover:shadow-md transition-shadow">
        {/* ─ Card Header ─ */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate">{trans.nama_barang}</h3>
              <p className="text-[11px] text-muted-foreground">
                #{trans.midtrans_order_id || trans.id_transaksi}
                <span className="mx-1">·</span>
                {formatDate(trans.created_at)}
              </p>
            </div>
          </div>
          <Badge className={`text-[9px] font-bold border shrink-0 ${cfg.cls}`}>
            <Icon className="w-2.5 h-2.5 mr-0.5" />{cfg.label}
          </Badge>
        </div>

        {/* ─ Card Body ─ */}
        <div className="p-5 space-y-4">

          {/* Daftar Barang */}
          {trans.detail_transaksi?.length > 0 && (
            <div className="bg-muted/40 rounded-xl p-3 space-y-1.5 border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Daftar Barang ({trans.detail_transaksi.length} item)
              </p>
              {trans.detail_transaksi.map((d, idx) => {
                const reviewKey = `${trans.id_transaksi}_${d.id_barang}`;
                const reviewInfo = reviewedItems[reviewKey];
                return (
                  <div key={d.id_detail || idx} className="bg-card rounded-lg p-2 border space-y-1.5">
                    <div className="flex items-center gap-3">
                      {d.barang?.foto_barang ? (
                        <img src={getStorageUrl(d.barang.foto_barang)} alt="" className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{d.nama_barang || d.barang?.nama_barang}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.jumlah_pinjam} unit × {formatRupiah(d.harga_per_hari || d.barang?.harga_sewa)}/hari
                        </p>
                      </div>
                      <p className="text-xs font-bold shrink-0">{formatRupiah(d.subtotal)}</p>
                    </div>
                    {/* Review buttons per item (hanya transaksi selesai) */}
                    {trans.status_sewa === 'selesai' && (
                      <div className="flex items-center gap-2 pl-[52px]">
                        {reviewInfo?.has_reviewed ? (
                          <>
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {reviewInfo.ulasan?.rating}/5 — Sudah diulas
                            </span>
                            {reviewInfo.sisa_edit > 0 && (
                              <button
                                onClick={() => openEditModal(reviewInfo.ulasan, trans, d)}
                                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 transition"
                              >
                                <Edit className="w-3 h-3" /> Edit ({reviewInfo.sisa_edit}x)
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => openReviewModal(trans, d.id_barang, d.nama_barang || d.barang?.nama_barang)}
                            className="text-[10px] text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1 transition"
                          >
                            <Star className="w-3 h-3" /> Beri Ulasan
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Ringkasan Penyewaan ── */}
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Periode Sewa" value={`${trans.tanggal_mulai} — ${trans.tanggal_selesai} (${trans.total_hari} hari)`} />
            <InfoRow icon={<Store className="w-3.5 h-3.5" />} label="Pemilik" value={trans.pemilik?.nama || '-'} />
            <InfoRow icon={trans.metode_pengiriman === 'pickup' ? <Store className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />} label="Metode" value={trans.metode_pengiriman === 'pickup' ? 'Ambil di Tempat' : 'Delivery'} />
            <InfoRow icon={<DollarSign className="w-3.5 h-3.5" />} label="Total Biaya" value={formatRupiah(trans.total_biaya)} highlight />
            {trans.metode_pengiriman === 'delivery' && Number(trans.biaya_pengiriman) > 0 && (
              <InfoRow icon={<Truck className="w-3.5 h-3.5" />} label="Ongkir" value={formatRupiah(trans.biaya_pengiriman)} />
            )}
            {trans.alamat_pengiriman && (
              <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Alamat" value={trans.alamat_pengiriman} colSpan />
            )}
          </div>

          {/* ── Deposit Info ── */}
          {Number(trans.nominal_deposit) > 0 && (
            <div className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/10 dark:to-emerald-900/5 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Informasi Deposit
                </h5>
                {/* Status badge */}
                {trans.deposit_status === 'refunded' || trans.deposit_status === 'partial_refund' ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">✅ Sudah Direfund</span>
                ) : trans.deposit_status === 'pending' ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200">⏳ Menunggu Refund</span>
                ) : trans.deposit_status === 'forfeited' ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700 border border-red-200">❌ Hangus</span>
                ) : null}
              </div>

              {/* Deposit grid */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <MiniCard label="Deposit Awal" value={formatRupiah(trans.nominal_deposit)} />
                <MiniCard label="Denda Terlambat" value={formatRupiah(trans.pengembalian?.total_denda || 0)} negative={Number(trans.pengembalian?.total_denda || 0) > 0} />
                <MiniCard label="Denda Kerusakan" value={formatRupiah(trans.pengembalian?.denda_kerusakan || 0)} negative={Number(trans.pengembalian?.denda_kerusakan || 0) > 0} />
              </div>

              {/* Refund Status Detail */}
              {(trans.deposit_status === 'refunded' || trans.deposit_status === 'partial_refund') ? (
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Deposit Dikembalikan
                    </span>
                    <span className="text-base font-black text-emerald-600">{formatRupiah(trans.deposit_refund_amount)}</span>
                  </div>
                  <div className="text-[11px] space-y-0.5 text-emerald-700 dark:text-emerald-500 ml-5">
                    <p className="flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Metode: <strong>{trans.deposit_refund_method}</strong></p>
                    {trans.deposit_refunded_at && <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {formatDateTime(trans.deposit_refunded_at)}</p>}
                    {trans.deposit_refund_note && <p className="flex items-start gap-1.5"><MessageSquare className="w-3 h-3 mt-0.5" /> Catatan: "{trans.deposit_refund_note}"</p>}
                  </div>
                  {trans.deposit_refund_proof && (
                    <div className="ml-5">
                      <a href={getStorageUrl(trans.deposit_refund_proof)} target="_blank" rel="noopener noreferrer" className="inline-block group relative overflow-hidden rounded-lg border border-emerald-200 hover:border-emerald-400 transition">
                        <img src={getStorageUrl(trans.deposit_refund_proof)} alt="Bukti Transfer" className="w-28 h-20 object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-[9px] font-semibold">Lihat Bukti</span>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              ) : trans.deposit_status === 'forfeited' ? (
                <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex justify-between items-center">
                  <div className="text-xs">
                    <span className="font-bold text-red-700 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Deposit Hangus</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Seluruh deposit digunakan untuk membayar denda</span>
                  </div>
                  <span className="text-base font-black text-red-600">Rp 0</span>
                </div>
              ) : trans.deposit_status === 'pending' ? (
                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 flex justify-between items-center">
                  <div className="text-xs">
                    <span className="font-bold text-amber-800 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Menunggu Refund</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Admin akan segera memproses pengembalian deposit</span>
                  </div>
                  <span className="text-base font-black text-amber-600">{formatRupiah(sisaDeposit)}</span>
                </div>
              ) : (
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                  <div className="text-xs">
                    <span className="font-bold text-emerald-800 block">Sisa Deposit</span>
                    <span className="text-[10px] text-muted-foreground">Dikembalikan setelah pengembalian barang</span>
                  </div>
                  <span className="text-base font-black text-emerald-600">{formatRupiah(sisaDeposit)}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Completed: Return Info ── */}
          {trans.status_sewa === 'selesai' && trans.pengembalian && (
            <div className="bg-muted/40 rounded-xl p-4 border space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Informasi Pengembalian
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <MiniCard label="Tanggal Kembali" value={trans.tanggal_kembali_real || trans.pengembalian?.tanggal_kembali || '-'} />
                <MiniCard label="Jumlah Kembali" value={`${trans.pengembalian.jumlah_kembali || trans.jumlah} unit`} />
                <MiniCard label="Kondisi" value={trans.pengembalian.kondisi_barang || 'Baik'} />
                <div className="bg-card p-2.5 rounded-lg border">
                  <p className="text-muted-foreground font-semibold mb-0.5 text-[10px]">Status</p>
                  {trans.pengembalian.status_pengembalian === 'terlambat' ? (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Terlambat</span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Tepat Waktu</span>
                  )}
                </div>
              </div>
              {trans.pengembalian.catatan && (
                <p className="text-[11px] italic text-muted-foreground bg-card px-3 py-2 rounded-lg border">
                  <MessageSquare className="w-3 h-3 inline mr-1 text-amber-500" />
                  "{trans.pengembalian.catatan}"
                </p>
              )}
            </div>
          )}

          {/* ── Actions ── */}
          {trans.status_sewa === 'sedang_disewa' && trans.status_kembali === 'belum' && (
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1.5 h-10 rounded-xl" onClick={() => openReturnModal(trans)}>
              <RotateCcw className="w-4 h-4" /> Kembalikan Barang
            </Button>
          )}

          {trans.status_sewa === 'sedang_disewa' && trans.status_kembali === 'proses' && (
            <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 space-y-1">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin" /> Barang Sedang Dikembalikan
              </p>
              <p className="text-[11px] text-muted-foreground">
                Metode: <strong>{trans.metode_kembali === 'delivery' ? 'Kirim via Kurir' : 'Datang Langsung'}</strong>
                {trans.no_resi_kembali && <> · Resi: <strong className="font-mono">{trans.no_resi_kembali}</strong></>}
              </p>
              <p className="text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Menunggu verifikasi Admin
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Sidebar user={user} getPhotoUrl={getPhotoUrl} getInitials={getInitials} />

          <div className="lg:col-span-3 space-y-5">
            <Card className="border shadow-sm bg-card rounded-2xl overflow-hidden">
              <CardHeader className="border-b bg-muted/30 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Penyewaan Saya</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">Riwayat barang yang Anda sewa — aktif maupun selesai</p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex gap-1.5">
                    {[
                      { key: 'all', label: 'Semua', count: stats.total },
                      { key: 'aktif', label: 'Aktif', count: stats.aktif },
                      { key: 'selesai', label: 'Selesai', count: stats.selesai },
                    ].map((tab) => (
                      <button key={tab.key} onClick={() => setRentalFilter(tab.key)}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all border flex items-center gap-1 ${rentalFilter === tab.key ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-background text-muted-foreground hover:bg-muted border-border'
                          }`}>
                        {tab.label}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${rentalFilter === tab.key ? 'bg-white/20' : 'bg-muted'}`}>{tab.count}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-full border bg-background text-muted-foreground hover:bg-muted transition-all">
                    {sortOrder === 'newest' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                    {sortOrder === 'newest' ? 'Terbaru' : 'Terlama'}
                  </button>
                </div>

                {/* Content */}
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500 mr-2" />
                    <span className="text-sm text-muted-foreground">Memuat penyewaan...</span>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold">Belum ada penyewaan{rentalFilter !== 'all' ? ` yang ${rentalFilter}` : ''}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Barang yang Anda sewa akan tampil di sini</p>
                    <Link to="/sewa-alat">
                      <Button className="mt-4 bg-amber-600 hover:bg-amber-700 text-white" size="sm">Mulai Rental</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredData.map(renderCard)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {isReturnModalOpen && selectedReturnTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <RotateCcw className="size-5 text-amber-600" /> Kembalikan Barang
              </h2>
              <button onClick={() => { setIsReturnModalOpen(false); setSelectedReturnTrx(null); }} className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl text-xs space-y-1 text-amber-800 dark:text-amber-400">
                <p><strong>Peralatan:</strong> {selectedReturnTrx.nama_barang} ({selectedReturnTrx.jumlah} unit)</p>
                <p><strong>Batas Waktu:</strong> {selectedReturnTrx.tanggal_selesai}</p>
                <p className="text-[10px] mt-1 italic">* Keterlambatan pengembalian dikenakan denda Rp 20.000 per hari.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Metode Pengembalian</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setReturnForm(prev => ({ ...prev, metode_kembali: "pickup" }))}
                    className={`py-3 rounded-xl border text-sm font-semibold transition flex flex-col items-center gap-1.5 ${returnForm.metode_kembali === "pickup" ? "border-amber-500 bg-amber-50/50 text-amber-700 font-bold" : "border-border text-muted-foreground hover:bg-muted/50"}`}>
                    <Store className="size-4" /> Datang Langsung
                  </button>
                  <button type="button" onClick={() => setReturnForm(prev => ({ ...prev, metode_kembali: "delivery" }))}
                    className={`py-3 rounded-xl border text-sm font-semibold transition flex flex-col items-center gap-1.5 ${returnForm.metode_kembali === "delivery" ? "border-amber-500 bg-amber-50/50 text-amber-700 font-bold" : "border-border text-muted-foreground hover:bg-muted/50"}`}>
                    <Truck className="size-4" /> Kirim Delivery
                  </button>
                </div>
              </div>
              {returnForm.metode_kembali === "delivery" && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Nomor Resi / Kurir</label>
                  <input type="text" placeholder="Masukkan nama kurir & nomor resi" value={returnForm.no_resi_kembali}
                    onChange={(e) => setReturnForm(prev => ({ ...prev, no_resi_kembali: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-card" required />
                </div>
              )}
              {returnForm.metode_kembali === "pickup" && (
                <div className="bg-muted/50 p-3 rounded-xl text-[11px] text-muted-foreground border border-dashed">
                  Silakan kembalikan barang ke petugas loket Gudang Utama SiPetualang sebelum batas waktu.
                </div>
              )}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setIsReturnModalOpen(false); setSelectedReturnTrx(null); }} className="rounded-xl">Batal</Button>
                <Button type="submit" disabled={submittingReturn} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
                  {submittingReturn ? "Mengirim..." : "Konfirmasi Pengembalian"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setReviewModal(null)}>
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> Beri Ulasan</h2>
              <button onClick={() => setReviewModal(null)} className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted transition"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-muted/50 p-4 rounded-xl text-xs space-y-1 border">
                <p><strong>Barang:</strong> {reviewModal.nama_barang}</p>
                <p><strong>Periode:</strong> {reviewModal.tanggal_mulai} — {reviewModal.tanggal_selesai}</p>
              </div>
              {/* Rating */}
              <div className="text-center space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Berikan Rating</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)} className="transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              {/* Comment */}
              <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Tulis ulasan Anda..." rows="3"
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-amber-500 bg-card resize-none" />
              {/* Photos */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Foto ({reviewPhoto.photos.length}/5)</p>
                <div className="flex flex-wrap gap-2">
                  {reviewPhoto.previews.map((src, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => reviewPhoto.remove(idx)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {reviewPhoto.photos.length < 5 && (
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <input type="file" accept="image/*" multiple onChange={reviewPhoto.handleChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              <Button onClick={submitReview} disabled={submittingReview || reviewRating === 0} className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-2">
                {submittingReview ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</> : <><Star className="w-4 h-4" /> Kirim Ulasan</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditModal(null)}>
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-500" /> Edit Ulasan
                <Badge className="text-[9px] bg-blue-100 text-blue-700">
                  Sisa edit: {editModal.sisa_edit}
                </Badge>
              </h2>
              <button onClick={() => setEditModal(null)} className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-muted/50 p-4 rounded-xl text-xs space-y-1 border">
                <p><strong>Barang:</strong> {editModal.nama_barang}</p>
              </div>

              {/* Rating */}
              <div className="text-center space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Berikan Rating</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setEditRating(s)} className="transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 ${s <= editRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)}
                placeholder="Edit ulasan Anda..." rows="3"
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-card resize-none" />

              {/* Photos */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Foto ({editPhoto.previews.length}/5)</p>
                <div className="flex flex-wrap gap-2">
                  {editPhoto.previews.map((src, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => editPhoto.remove(idx)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {editPhoto.photos.length < 5 && (
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <input type="file" accept="image/*" multiple onChange={editPhoto.handleChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <Button onClick={submitEditReview} disabled={submittingEdit || editRating === 0}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl gap-2">
                {submittingEdit ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Edit className="w-4 h-4" /> Simpan Perubahan</>}
              </Button>

              {editModal.sisa_edit === 0 && (
                <p className="text-center text-xs text-red-500">⚠️ Anda sudah mencapai batas maksimal edit (2x)</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable sub-components ──
function InfoRow({ icon, label, value, highlight, colSpan }) {
  return (
    <div className={`flex items-start gap-2 text-xs ${colSpan ? 'col-span-2' : ''}`}>
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground font-semibold">{label}</p>
        <p className={`font-semibold truncate ${highlight ? 'text-emerald-600' : 'text-foreground'}`}>{value}</p>
      </div>
    </div>
  );
}

function MiniCard({ label, value, negative }) {
  return (
    <div className="bg-card p-2.5 rounded-lg border">
      <p className="text-muted-foreground font-semibold mb-0.5 text-[10px]">{label}</p>
      <p className={`font-bold text-xs ${negative ? 'text-red-600' : ''}`}>{value}</p>
    </div>
  );
}