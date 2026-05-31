import { useState, useEffect } from 'react'
import TablePagination, { paginateArray } from '@/components/TablePagination'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Wallet, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Banknote,
  ArrowUpRight,
} from 'lucide-react'
import { adminService } from '../services/adminService'

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

function WithdrawalStatsCards({ stats, adminBalance }) {
  const cards = [
    { 
      title: 'Total Penarikan', 
      value: formatCurrency(stats?.completed_total ?? 0), 
      count: stats?.completed_count ?? 0,
      icon: CheckCircle, 
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      title: 'Penarikan Bulan Ini', 
      value: formatCurrency(stats?.this_month_total ?? 0), 
      count: stats?.this_month_count ?? 0,
      icon: TrendingUp, 
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      title: 'Saldo Admin', 
      value: formatCurrency(adminBalance?.balance ?? 0), 
      icon: Wallet, 
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className={card.bg}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`size-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.count} penarikan
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function WithdrawalHistoryTable({ withdrawals, isLoading }) {
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (!withdrawals?.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Belum ada riwayat penarikan
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Penarikan</CardTitle>
        <p className="text-sm text-muted-foreground">
          Semua penarikan yang telah dilakukan oleh perental dan admin
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>No. Rekening</TableHead>
              <TableHead>Nama Rekening</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginateArray(withdrawals, currentPage, PER_PAGE).map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-xs">{formatDate(item.created_at)}</TableCell>
                <TableCell className="font-medium">{item.user?.nama || '-'}</TableCell>
                <TableCell>
                  <Badge className={item.user?.peran_pengguna === 'admin' ? 'bg-purple-500' : 'bg-green-500'}>
                    {item.user?.peran_pengguna === 'admin' ? 'Admin' : 'Perental'}
                  </Badge>
                </TableCell>
                <TableCell>{item.bank_name}</TableCell>
                <TableCell>{item.bank_account_number}</TableCell>
                <TableCell>{item.bank_account_name}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(item.amount)}
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Completed</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          currentPage={currentPage}
          totalItems={withdrawals.length}
          perPage={PER_PAGE}
          onPageChange={setCurrentPage}
          label="penarikan"
        />
      </CardContent>
    </Card>
  )
}

export default function WithdrawalManagement() {
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [stats, setStats] = useState(null);
  const [adminBalance, setAdminBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form admin withdrawal
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

const fetchData = async () => {
  try {
    setIsLoading(true);
    const [allRes, statsRes, balanceRes] = await Promise.all([
      adminService.getWithdrawals(),
      adminService.getWithdrawalStats(),
      adminService.getAdminBalance(),
    ]);
    
    // 🔥 TAMBAHKAN INI 🔥
    console.log('balanceRes FULL:', balanceRes);
    console.log('balanceRes.data:', balanceRes?.data);
    
    setAllWithdrawals(allRes.data?.data || []);
    setStats(statsRes.data);
    setAdminBalance(balanceRes?.data || { balance: 0 });  // ← GANTI JADI INI
  } catch (err) {
    console.error(err);
    toast.error('Gagal memuat data penarikan');
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdminWithdraw = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < 50000) {
      toast.error('Minimal penarikan Rp 50.000');
      return;
    }
    
    if (!bankName || !bankAccountNumber || !bankAccountName) {
      toast.error('Lengkapi data rekening');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await adminService.adminWithdrawal({
        amount: parseFloat(amount),
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
      });
      
      toast.success('Penarikan berhasil!');
      setWithdrawDialogOpen(false);
      setAmount('');
      setBankName('');
      setBankAccountNumber('');
      setBankAccountName('');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal melakukan penarikan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="size-6" />
            Manajemen Penarikan Saldo
          </h1>
          <p className="text-muted-foreground">
            Kelola penarikan saldo perental dan admin
          </p>
        </div>
        
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <Button 
            onClick={() => setWithdrawDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Banknote className="size-4 mr-2" />
            Tarik Saldo Admin
          </Button>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tarik Saldo Admin</DialogTitle>
              <DialogDescription>
                Masukkan jumlah yang ingin ditarik dari saldo admin. Minimal Rp 50.000.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAdminWithdraw} className="space-y-4">
              <div>
                <Label>Saldo Admin Tersedia</Label>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(adminBalance?.balance || 0)}
                </div>
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
                  max={adminBalance?.balance || 0}
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
                <Button type="button" variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Memproses...' : 'Tarik Saldo'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <WithdrawalStatsCards stats={stats} adminBalance={adminBalance} />

      <WithdrawalHistoryTable withdrawals={allWithdrawals} isLoading={isLoading} />
    </div>
  );
}