import { useState, useEffect } from 'react';
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
  User,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '@/services/api';
import { getStorageUrl } from '@/utils/storageUrl';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem('token');

  // Return Gear States
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnTrx, setSelectedReturnTrx] = useState(null);
  const [returnForm, setReturnForm] = useState({
    metode_kembali: 'pickup',
    no_resi_kembali: ''
  });
  const [submittingReturn, setSubmittingReturn] = useState(false);

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

  // FETCH TRANSACTIONS
  useEffect(() => {
    fetchTransactions();
  }, []);

  const openReturnModal = (trx) => {
    setSelectedReturnTrx(trx);
    setReturnForm({
      metode_kembali: 'pickup',
      no_resi_kembali: ''
    });
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReturn(true);
    try {
      await transactionService.kembalikanBarang(selectedReturnTrx.id_transaksi, returnForm);
      toast.success('Pengajuan pengembalian berhasil diajukan ke Admin!');
      setIsReturnModalOpen(false);
      setSelectedReturnTrx(null);
      fetchTransactions();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message || 'Gagal mengajukan pengembalian');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // FUNGSI BAYAR ULANG
  const handlePayment = async (trans) => {
    setProcessingId(trans.id_transaksi);

    try {
      let snapToken = trans.snap_token;

      // Jika snap_token tidak ada, request baru ke backend
      if (!snapToken) {
        const response = await axios.post(
          `${API_URL}/customer/transaksi/${trans.id_transaksi}/refresh-payment`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        snapToken = response.data.snap_token;
      }

      // PASTIKAN window.snap SUDAH ADA
      if (!window.snap) {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', 'SB-Mid-client-xxxxx');
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
          setTimeout(resolve, 2000);
        });
      }

      if (!window.snap || typeof window.snap.pay !== 'function') {
        throw new Error('Midtrans Snap tidak tersedia. Silakan refresh halaman.');
      }

      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          console.log('Payment success:', result);
          alert('Pembayaran berhasil!');
          window.location.href = '/customer/transactions';
        },
        onPending: (result) => {
          console.log('Payment pending:', result);
          alert('Pembayaran pending');
          window.location.href = '/customer/transactions';
        },
        onError: (result) => {
          console.error('Payment error:', result);
          alert('Pembayaran gagal: ' + (result.status_message || 'Unknown error'));
          setProcessingId(null);
        },
        onClose: () => {
          console.log('Payment popup closed');
          setProcessingId(null);
        }
      });
    } catch (err) {
      console.error('Payment error:', err);
      alert('Gagal memuat pembayaran: ' + (err.response?.data?.message || err.message));
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'menunggu_pembayaran':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" /> Menunggu Pembayaran</Badge>;
      case 'dibayar':
        return <Badge className="bg-blue-500"><CreditCard className="w-3 h-3 mr-1" /> Dibayar</Badge>;
      case 'sedang_disewa':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Sedang Disewa</Badge>;
      case 'selesai':
        return <Badge className="bg-gray-500"><CheckCircle className="w-3 h-3 mr-1" /> Selesai</Badge>;
      case 'dibatalkan':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" /> Dibatalkan</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'sukses':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Sukses</Badge>;
      case 'gagal':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" /> Gagal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPhotoUrl = () => getStorageUrl(user?.profile_photo);
  const getInitials = () => user?.nama?.charAt(0).toUpperCase() || 'U';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Sidebar
            user={user}
            getPhotoUrl={getPhotoUrl}
            getInitials={getInitials}
          />

          <div className="lg:col-span-3 space-y-6">
            <Card className="border shadow-sm bg-card rounded-2xl overflow-hidden">
              <CardHeader className="border-b bg-muted/30 px-8 py-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-5 text-emerald-600" />
                  <CardTitle className="text-xl font-bold">Riwayat Transaksi</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                {loading ? (
                  <div className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500">Memuat transaksi...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Belum ada transaksi</p>
                    <Link to="/sewa-alat">
                      <Button className="mt-4 bg-emerald-600">Mulai Rental</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((trans) => (
                      <div key={trans.id_transaksi} className="border rounded-lg p-5 hover:shadow-md transition">
                        <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{trans.nama_barang}</h3>
                            <p className="text-sm text-gray-500">
                              ID Transaksi: {trans.midtrans_order_id || trans.id_transaksi}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="mb-1">{getStatusBadge(trans.status_sewa)}</div>
                            <div>{getPaymentStatusBadge(trans.status_pembayaran)}</div>
                          </div>
                        </div>

                        {/* Multi-item details */}
                        {trans.detail_transaksi && trans.detail_transaksi.length > 0 && (
                          <div className="mb-4 bg-muted/50 rounded-xl p-3 space-y-2 border border-border">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Daftar Barang ({trans.detail_transaksi.length} item)</p>
                            {trans.detail_transaksi.map((detail, idx) => (
                              <div key={detail.id_detail || idx} className="flex items-center gap-3 bg-card rounded-lg p-2 border border-border">
                                {detail.barang?.foto_barang ? (
                                  <img
                                    src={getStorageUrl(detail.barang.foto_barang)}
                                    alt={detail.nama_barang || detail.barang?.nama_barang}
                                    className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {detail.nama_barang || detail.barang?.nama_barang}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {detail.jumlah_pinjam} unit × Rp {Number(detail.harga_per_hari || detail.barang?.harga_sewa || 0).toLocaleString()}/hari
                                    {detail.barang?.pemilik && (
                                      <span className="text-muted-foreground"> — {detail.barang.pemilik.nama}</span>
                                    )}
                                  </p>
                                </div>
                                <p className="text-xs font-bold text-foreground shrink-0">
                                  Rp {Number(detail.subtotal).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{trans.tanggal_mulai} - {trans.tanggal_selesai}</span>
                              <span className="text-gray-500">({trans.total_hari} hari)</span>
                            </div>
                            {(!trans.detail_transaksi || trans.detail_transaksi.length === 0) && (
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span>{trans.jumlah} x Rp {Number(trans.harga_per_hari).toLocaleString()}/hari</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Store className="w-4 h-4 text-gray-400" />
                              <span>Pemilik: {trans.pemilik?.nama || 'Tidak diketahui'}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {trans.metode_pengiriman === 'pickup' ? (
                                <Store className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Truck className="w-4 h-4 text-gray-400" />
                              )}
                              <span>
                                {trans.metode_pengiriman === 'pickup' ? 'Ambil di Tempat' : 'Kirim ke Alamat'}
                              </span>
                            </div>

                              {/* ✅ TAMBAHKAN DETAIL ONGKIR */}
                            {trans.metode_pengiriman === 'delivery' && trans.biaya_pengiriman > 0 && (
                                <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-xs">
                                    Ongkir: <span className="font-semibold text-emerald-600">Rp {Number(trans.biaya_pengiriman).toLocaleString("id-ID")}</span>
                                </span>
                                </div>
                            )}
                            {trans.alamat_pengiriman && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-xs truncate">{trans.alamat_pengiriman}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span>
                                Total: <span className="font-semibold text-emerald-600">Rp {Number(trans.total_biaya).toLocaleString()}</span>
                              </span>
                            </div>
                            {Number(trans.nominal_deposit) > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-emerald-100 text-emerald-800 text-[9px] flex items-center justify-center rounded font-bold">D</span>
                                <span className="text-xs text-muted-foreground">
                                  Deposit Keamanan: <span className="font-semibold text-foreground">Rp {Number(trans.nominal_deposit).toLocaleString()}</span> <span className="text-[10px] text-muted-foreground font-normal">(Refundable)</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* DETAIL PENGEMBALIAN & DENDA */}
                        {trans.status_sewa === 'selesai' && (
                          <div className="mt-4 pt-4 border-t border-border space-y-4">
                            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl p-4 border border-emerald-500/10">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                                <CheckCircle className="size-3.5" /> Informasi Pengembalian Barang
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div>
                                  <p className="text-gray-400 font-semibold mb-0.5">Nama Barang</p>
                                  <p className="font-bold text-gray-800 dark:text-gray-200">{trans.nama_barang}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 font-semibold mb-0.5">Total Barang</p>
                                  <p className="font-bold text-gray-800 dark:text-gray-200">{trans.jumlah} Unit</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 font-semibold mb-0.5">Hari Pengembalian</p>
                                  <p className="font-bold text-gray-800 dark:text-gray-200">
                                    {trans.tanggal_kembali_real || trans.pengembalian?.tanggal_kembali || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 font-semibold mb-0.5">Status Pengembalian</p>
                                  {trans.pengembalian?.status_pengembalian === 'terlambat' ? (
                                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 animate-pulse">
                                      Terlambat
                                    </span>
                                  ) : (
                                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                                      Tepat Waktu
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="bg-muted/50 rounded-2xl p-4 border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                              <div className="space-y-1">
                                <h5 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Ketentuan & Denda Keterlambatan</h5>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Setiap keterlambatan pengembalian alat dikenakan denda sebesar <span className="font-bold text-foreground">Rp {Number(trans.pengembalian?.denda_per_hari || 20000).toLocaleString()}</span> per hari per unit barang.
                                </p>
                                {trans.pengembalian?.catatan && (
                                  <p className="text-[11px] italic text-amber-600 dark:text-amber-400 font-semibold mt-1">
                                    Catatan: "{trans.pengembalian.catatan}"
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Denda</p>
                                {Number(trans.pengembalian?.total_denda || 0) > 0 ? (
                                  <p className="text-lg font-black text-red-600 dark:text-red-400">
                                    Rp {Number(trans.pengembalian.total_denda).toLocaleString()}
                                  </p>
                                ) : (
                                  <p className="text-sm font-bold text-emerald-600">
                                    Rp 0 (Bebas Denda)
                                  </p>
                                )}
                              </div>
                            </div>

                            {Number(trans.nominal_deposit) > 0 && (
                              <div className="bg-emerald-50/30 dark:bg-emerald-950/5 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/20 space-y-3">
                                <h5 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Rincian Deposit & Denda Kerusakan</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                  <div className="bg-card/80 p-3 rounded-xl border border-border">
                                    <p className="text-gray-400 font-semibold mb-0.5">Deposit Awal</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-200">Rp {Number(trans.nominal_deposit).toLocaleString()}</p>
                                  </div>
                                  <div className="bg-card/80 p-3 rounded-xl border border-border">
                                    <p className="text-gray-400 font-semibold mb-0.5">Denda Kerusakan</p>
                                    <p className={`font-bold ${Number(trans.pengembalian?.denda_kerusakan || 0) > 0 ? 'text-red-600' : 'text-gray-800 dark:text-gray-200'}`}>
                                      Rp {Number(trans.pengembalian?.denda_kerusakan || 0).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-card/80 p-3 rounded-xl border border-border">
                                    <p className="text-gray-400 font-semibold mb-0.5">Denda Terlambat</p>
                                    <p className={`font-bold ${Number(trans.pengembalian?.total_denda || 0) > 0 ? 'text-red-600' : 'text-gray-800 dark:text-gray-200'}`}>
                                      Rp {Number(trans.pengembalian?.total_denda || 0).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                  <div className="text-xs">
                                    <span className="font-bold text-emerald-800 dark:text-emerald-400 block">Sisa Uang Deposit Pengembalian</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      * Dikembalikan ke Penyewa (Awal - Denda Kerusakan - Denda Terlambat)
                                    </span>
                                  </div>
                                  <span className="text-lg font-black text-emerald-600 shrink-0">
                                    Rp {Math.max(0, Number(trans.nominal_deposit) - Number(trans.pengembalian?.denda_kerusakan || 0) - Number(trans.pengembalian?.total_denda || 0)).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* TOMBOL BAYAR */}
                        {trans.status_sewa === 'menunggu_pembayaran' && (
                          <div className="mt-4">
                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => handlePayment(trans)}
                              disabled={processingId === trans.id_transaksi}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              {processingId === trans.id_transaksi ? 'Memproses...' : 'Bayar Sekarang'}
                            </Button>
                          </div>
                        )}

                        {/* TOMBOL KEMBALIKAN BARANG */}
                        {trans.status_sewa === 'sedang_disewa' && trans.status_kembali === 'belum' && (
                          <div className="mt-4">
                            <Button
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center justify-center gap-1.5 h-10 rounded-xl"
                              onClick={() => openReturnModal(trans)}
                            >
                              <Package className="w-4 h-4" />
                              Kembalikan Barang
                            </Button>
                          </div>
                        )}

                        {/* BANNER SEDANG DIKEMBALIKAN */}
                        {trans.status_sewa === 'sedang_disewa' && trans.status_kembali === 'proses' && (
                          <div className="mt-4 bg-amber-50/50 border border-amber-200/50 rounded-xl p-3.5 flex items-start gap-2.5">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-xs space-y-1">
                              <p className="font-bold text-amber-800">Barang Sedang Dikembalikan</p>
                              <p className="text-muted-foreground">
                                <span className="font-medium text-muted-foreground">Metode Pengembalian:</span> {trans.metode_kembali === 'delivery' ? 'Kirim via Kurir (Delivery)' : 'Datang Langsung ke Gudang SiPetualang'}
                              </p>
                              {trans.no_resi_kembali && (
                                <p className="text-muted-foreground font-mono">
                                  <span className="font-medium text-muted-foreground font-sans">No. Resi Pengembalian:</span> {trans.no_resi_kembali}
                                </p>
                              )}
                              <p className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded w-fit mt-1.5 flex items-center gap-1">
                                <Clock className="w-3 h-3 animate-spin" /> Menunggu Verifikasi Admin
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Pengembalian Barang */}
      {isReturnModalOpen && selectedReturnTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Package className="size-5 text-amber-600" />
                Kembalikan Barang Sewaan
              </h2>
              <button
                onClick={() => { setIsReturnModalOpen(false); setSelectedReturnTrx(null); }}
                className="text-muted-foreground hover:text-muted-foreground rounded-lg p-1 hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl text-xs space-y-1 text-amber-800 dark:text-amber-400">
                <p><strong>Peralatan:</strong> {selectedReturnTrx.nama_barang} ({selectedReturnTrx.jumlah} unit)</p>
                <p><strong>Batas Waktu:</strong> {selectedReturnTrx.tanggal_selesai}</p>
                <p className="text-[10px] mt-1 text-amber-700 italic">
                  * Keterlambatan pengembalian dikenakan denda Rp 20.000 per hari.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Metode Pengembalian</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReturnForm(prev => ({ ...prev, metode_kembali: "pickup" }))}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-colors flex flex-col items-center justify-center gap-1.5 ${returnForm.metode_kembali === "pickup"
                      ? "border-amber-500 bg-amber-50/50 text-amber-700 font-bold"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Store className="size-4" /> Datang Langsung
                  </button>

                  <button
                    type="button"
                    onClick={() => setReturnForm(prev => ({ ...prev, metode_kembali: "delivery" }))}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-colors flex flex-col items-center justify-center gap-1.5 ${returnForm.metode_kembali === "delivery"
                      ? "border-amber-500 bg-amber-50/50 text-amber-700 font-bold"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Truck className="size-4" /> Kirim Delivery (Kurir)
                  </button>
                </div>
              </div>

              {returnForm.metode_kembali === "delivery" && (
                <div className="animate-slide-down">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Nomor Resi / Kurir Pengembalian</label>
                  <input
                    type="text"
                    placeholder="Masukkan nama kurir & nomor resi pengiriman"
                    value={returnForm.no_resi_kembali}
                    onChange={(e) => setReturnForm(prev => ({ ...prev, no_resi_kembali: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-card"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Kirimkan barang Anda ke alamat Gudang SiPetualang (Jl. Petualang No. 100, Bandung).
                  </p>
                </div>
              )}

              {returnForm.metode_kembali === "pickup" && (
                <div className="bg-muted/50 p-3 rounded-xl text-[11px] text-muted-foreground leading-normal border border-dashed">
                  Silakan kembalikan barang sewaan Anda secara langsung ke petugas loket di **Gudang Utama SiPetualang** sebelum batas akhir waktu penyewaan berakhir.
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsReturnModalOpen(false); setSelectedReturnTrx(null); }}
                  className="rounded-xl border-border"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReturn}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                >
                  {submittingReturn ? "Mengirim..." : "Konfirmasi Pengembalian"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}