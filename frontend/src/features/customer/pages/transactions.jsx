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

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('penyewa');
  const [processingId, setProcessingId] = useState(null);

  const API_URL = 'http://127.0.0.1:8000/api';
  const token = localStorage.getItem('token');

  // ✅ FETCH TRANSACTIONS - LANGSUNG DI DALAM useEffect
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        let response;
        if (activeTab === 'penyewa') {
          response = await transactionService.getTransaksiSebagaiPenyewa();
        } else {
          response = await transactionService.getTransaksiSebagaiPemilik();
        }
        setTransactions(response.data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [activeTab]);

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
    return `http://localhost:8000/storage/${user.profile_photo}`;
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-5 text-emerald-600" />
                    <CardTitle className="text-xl font-bold">Riwayat Transaksi</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={activeTab === 'penyewa' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('penyewa')}
                      className={activeTab === 'penyewa' ? 'bg-emerald-600' : ''}
                    >
                      Sebagai Penyewa
                    </Button>
                    <Button 
                      variant={activeTab === 'pemilik' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('pemilik')}
                      className={activeTab === 'pemilik' ? 'bg-emerald-600' : ''}
                    >
                      Sebagai Pemilik
                    </Button>
                  </div>
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
                            {activeTab === 'penyewa' ? (
                              <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-gray-400" />
                                <span>Pemilik: {trans.pemilik?.nama || 'Tidak diketahui'}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>Penyewa: {trans.penyewa?.nama || 'Tidak diketahui'}</span>
                              </div>
                            )}
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

                        {activeTab === 'pemilik' && trans.status_pembayaran === 'sukses' && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Pendapatan Anda (80%):</span>
                              <span className="font-semibold text-green-600">
                                Rp {Number(trans.pendapatan_pemilik).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Fee Admin (20%):</span>
                              <span>Rp {Number(trans.fee_admin).toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        {/* ✅ TOMBOL BAYAR - SUDAH DIPERBAIKI */}
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