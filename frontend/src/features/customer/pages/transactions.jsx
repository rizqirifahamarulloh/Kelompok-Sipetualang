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
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL, BASE_URL } from '@/services/api';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem('token');

  // ✅ FETCH TRANSACTIONS - LANGSUNG DI DALAM useEffect
  useEffect(() => {
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

    fetchTransactions();
  }, []);

  // ✅ FUNGSI BAYAR ULANG
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
      
      window.snap.pay(snapToken, {
        onSuccess: () => {
          alert('Pembayaran berhasil!');
          window.location.href = '/customer/transactions';
        },
        onPending: () => {
          alert('Pembayaran pending');
          window.location.href = '/customer/transactions';
        },
        onError: (result) => {
          alert('Pembayaran gagal: ' + (result.status_message || 'Unknown error'));
        }
      });
    } catch (err) {
      console.error(err);
      alert('Gagal memuat pembayaran: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
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
    switch(status) {
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

  const getPhotoUrl = () => {
    if (!user?.profile_photo) return null;
    if (user.profile_photo.startsWith('http')) return user.profile_photo;
    return `${BASE_URL}/storage/${user.profile_photo}`;
  };

  const getInitials = () => user?.nama?.charAt(0).toUpperCase() || 'U';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <Sidebar
            user={user}
            getPhotoUrl={getPhotoUrl}
            getInitials={getInitials}
          />

          <div className="lg:col-span-3 space-y-6">
            <Card className="border shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b bg-white/50 px-8 py-6">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{trans.tanggal_mulai} - {trans.tanggal_selesai}</span>
                              <span className="text-gray-500">({trans.total_hari} hari)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span>{trans.jumlah} x Rp {Number(trans.harga_per_hari).toLocaleString()}/hari</span>
                            </div>
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
                          </div>
                        </div>

                        {/* ✅ DETAIL PENGEMBALIAN & DENDA */}
                        {trans.status_sewa === 'selesai' && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                            {/* Header Bagian Pengembalian */}
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

                            {/* Bagian Informasi Denda */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                              <div className="space-y-1">
                                <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Ketentuan & Denda Keterlambatan</h5>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Setiap keterlambatan pengembalian alat dikenakan denda sebesar <span className="font-bold text-slate-700 dark:text-slate-300">Rp {Number(trans.pengembalian?.denda_per_hari || 20000).toLocaleString()}</span> per hari per unit barang.
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
                          </div>
                        )}

                        {/* ✅ TOMBOL BAYAR */}
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
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}