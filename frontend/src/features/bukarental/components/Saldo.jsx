import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { 
  Wallet, 
  TrendingUp, 
  Banknote,
  ArrowUpRight,
  Package,
  ShoppingBag,
  RotateCcw,
  Home,
  Clock,
  Eye,
  ImageIcon,
} from 'lucide-react'
import api from '@/services/api'
import { getStorageUrl } from '@/utils/storageUrl'
import Navbar from '@/features/landing/components/Navbar'

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function Saldo() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [balance, setBalance] = useState(null)
  const [withdrawals, setWithdrawals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')

  // View proof dialog
  const [viewProofOpen, setViewProofOpen] = useState(false)
  const [proofImage, setProofImage] = useState('')

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [balanceRes, historyRes] = await Promise.all([
        api.get('/customer/withdrawal/balance'),
        api.get('/customer/withdrawal/history')
      ])
      setBalance(balanceRes.data.data)
      setWithdrawals(historyRes.data.data || [])
    } catch (error) {
      console.error(error)
      toast.error('Gagal memuat data saldo')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleWithdraw = async (e) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) < 50000) {
      toast.error('Minimal penarikan Rp 50.000')
      return
    }
    
    if (!bankName || !bankAccountNumber || !bankAccountName) {
      toast.error('Lengkapi data rekening')
      return
    }

    // Hitung saldo tersedia (saldo - pending)
    const availableBalance = (balance?.balance || 0) - (balance?.pending_withdrawal || 0)
    if (parseFloat(amount) > availableBalance) {
      toast.error('Saldo tidak mencukupi')
      return
    }
    
    setIsSubmitting(true)
    try {
      await api.post('/customer/withdrawal/request', {
        amount: parseFloat(amount),
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
      })
      
      toast.success('Pengajuan penarikan berhasil! Menunggu persetujuan admin.')
      setDialogOpen(false)
      setAmount('')
      setBankName('')
      setBankAccountNumber('')
      setBankAccountName('')
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Gagal mengajukan penarikan')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  if (isLoading) {
    return (
      <>
        <Navbar forceScrolled={true} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/20 pt-20">
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <Skeleton className="h-[400px] w-full rounded-2xl" />
              </div>
              <div className="lg:col-span-3">
                <Skeleton className="h-32 w-full mb-6" />
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const availableBalance = (balance?.balance || 0) - (balance?.pending_withdrawal || 0)

  return (
    <>
      <Navbar forceScrolled={true} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/20 pt-20">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* SIDEBAR */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border bg-card dark:bg-slate-900 rounded-2xl overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
                  <Avatar className="size-20 mx-auto ring-4 ring-white/20 mb-3">
                    <AvatarImage src={getStorageUrl(user?.profile_photo)} />
                    <AvatarFallback className="text-2xl bg-white/10 text-white">
                      {user?.nama?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg leading-tight truncate">{user?.nama}</h3>
                  <p className="text-xs text-emerald-100 mt-1 truncate">{user?.email}</p>
                </div>
                
                <CardContent className="p-4 space-y-1">
                  <Button 
                    onClick={() => navigate('/rental-dashboard')}
                    variant="ghost" 
                    className="w-full justify-start rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <TrendingUp className="size-4 mr-3" />
                    Ringkasan Performa
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/rental-dashboard')}
                    variant="ghost" 
                    className="w-full justify-start rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Package className="size-4 mr-3" />
                    Kelola Barang
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/rental-dashboard')}
                    variant="ghost" 
                    className="w-full justify-start rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <ShoppingBag className="size-4 mr-3" />
                    Penyewaan Masuk
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/rental-dashboard')}
                    variant="ghost" 
                    className="w-full justify-start rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <RotateCcw className="size-4 mr-3" />
                    Refund Barang
                  </Button>
                  
                  {/* Menu aktif Saldo */}
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start rounded-xl font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                  >
                    <Wallet className="size-4 mr-3" />
                    Saldo & Penarikan
                  </Button>
                  
                  <div className="border-t my-4" />
                  
                  <Button 
                    onClick={() => navigate('/')} 
                    variant="ghost" 
                    className="w-full justify-start rounded-xl text-gray-500 hover:text-gray-900 hover:bg-slate-100"
                  >
                    <Home className="size-4 mr-3" />
                    Kembali ke Beranda
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* MAIN CONTENT - SALDO */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Wallet className="size-6" />
                  Saldo Saya
                </h1>
                <p className="text-muted-foreground">
                  Kelola saldo dan penarikan dana dari hasil penyewaan barang Anda
                </p>
              </div>

              {/* Card Saldo */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CardHeader>
                    <CardTitle className="text-white/80 text-sm">Total Saldo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(balance?.balance || 0)}</div>
                    <p className="text-green-100 text-sm mt-2">Saldo keseluruhan</p>
                  </CardContent>
                </Card>

                {(balance?.pending_withdrawal || 0) > 0 && (
                  <Card className="col-span-1 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Dalam Proses</CardTitle>
                      <Clock className="size-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{formatCurrency(balance?.pending_withdrawal || 0)}</div>
                      <p className="text-xs text-amber-600/70 dark:text-amber-500/70">Menunggu approval admin</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                    <TrendingUp className="size-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(balance?.total_earned || 0)}</div>
                    <p className="text-xs text-muted-foreground">Pendapatan sepanjang masa (80% dari sewa)</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Ditarik</CardTitle>
                    <ArrowUpRight className="size-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(balance?.total_withdrawn || 0)}</div>
                    <p className="text-xs text-muted-foreground">Sudah dicairkan ke rekening Anda</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tombol Tarik Saldo */}
              <div className="flex justify-end">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <Button onClick={() => setDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Banknote className="size-4 mr-2" />
                    Tarik Saldo
                  </Button>
                  
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Tarik Saldo</DialogTitle>
                      <DialogDescription>
                        Masukkan jumlah yang ingin ditarik. Minimal Rp 50.000.
                        Dana akan ditransfer ke rekening Anda setelah diproses admin.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleWithdraw} className="space-y-4">
                      <div>
                        <Label>Saldo Tersedia</Label>
                        <div className="text-2xl font-bold text-green-600 mt-1">
                          {formatCurrency(availableBalance)}
                        </div>
                        {(balance?.pending_withdrawal || 0) > 0 && (
                          <p className="text-xs text-amber-600 mt-1">
                            {formatCurrency(balance.pending_withdrawal)} sedang dalam proses penarikan
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="amount">Jumlah Penarikan *</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Minimal Rp 50.000"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="50000"
                          max={availableBalance}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="bankName">Nama Bank *</Label>
                        <Input
                          id="bankName"
                          placeholder="Contoh: BCA, Mandiri, BRI"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="bankAccountNumber">Nomor Rekening *</Label>
                        <Input
                          id="bankAccountNumber"
                          placeholder="Masukkan nomor rekening"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="bankAccountName">Nama Pemilik Rekening *</Label>
                        <Input
                          id="bankAccountName"
                          placeholder="Nama sesuai rekening"
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          required
                        />
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Memproses...' : 'Ajukan Penarikan'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Riwayat Penarikan */}
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Penarikan</CardTitle>
                  <p className="text-sm text-muted-foreground">Semua riwayat penarikan yang telah Anda ajukan</p>
                </CardHeader>
                <CardContent>
                  {withdrawals.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      <Banknote className="size-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-semibold">Belum ada riwayat penarikan</p>
                      <p className="text-sm mt-1">Ajukan penarikan saldo Anda di atas</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Bank</TableHead>
                          <TableHead>No. Rekening</TableHead>
                          <TableHead>Nama Rekening</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Bukti / Catatan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawals.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs">{formatDate(item.created_at)}</TableCell>
                            <TableCell>{item.bank_name}</TableCell>
                            <TableCell className="font-mono text-xs">{item.bank_account_number}</TableCell>
                            <TableCell>{item.bank_account_name}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(item.amount)}</TableCell>
                            <TableCell>
                              <Badge className={
                                item.status === 'completed' 
                                  ? 'bg-green-500 hover:bg-green-600' 
                                  : item.status === 'pending' 
                                    ? 'bg-amber-500 hover:bg-amber-600' 
                                    : 'bg-red-500 hover:bg-red-600'
                              }>
                                {item.status === 'completed' ? 'Selesai' : item.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.status === 'completed' && item.transfer_proof ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-xs gap-1 h-7"
                                  onClick={() => { setProofImage(getStorageUrl(item.transfer_proof)); setViewProofOpen(true); }}
                                >
                                  <Eye className="size-3" />
                                  Bukti
                                </Button>
                              ) : item.status === 'rejected' && item.admin_note ? (
                                <span className="text-xs text-red-600 dark:text-red-400" title={item.admin_note}>
                                  {item.admin_note.length > 30 ? item.admin_note.substring(0, 30) + '...' : item.admin_note}
                                </span>
                              ) : item.status === 'pending' ? (
                                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  <Clock className="size-3" />
                                  Menunggu admin
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* View Proof Dialog */}
      <Dialog open={viewProofOpen} onOpenChange={setViewProofOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="size-5" />
              Bukti Transfer
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={proofImage} 
              alt="Bukti Transfer" 
              className="max-h-[500px] rounded-lg object-contain border" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}