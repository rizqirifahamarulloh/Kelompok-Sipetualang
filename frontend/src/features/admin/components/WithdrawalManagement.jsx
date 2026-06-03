import { useState, useEffect } from 'react'
import TablePagination, { paginateArray } from '@/components/TablePagination'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Wallet, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Banknote,
  ArrowUpRight,
  XCircle,
  Upload,
  Eye,
  ImageIcon,
  AlertTriangle,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import { getStorageUrl } from '@/utils/storageUrl'

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
      title: 'Menunggu Approval', 
      value: formatCurrency(stats?.pending_total ?? 0), 
      count: `${stats?.pending_count ?? 0} pengajuan`,
      icon: Clock, 
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
    },
    { 
      title: 'Total Dicairkan', 
      value: formatCurrency(stats?.completed_total ?? 0), 
      count: `${stats?.completed_count ?? 0} penarikan`,
      icon: CheckCircle, 
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/20'
    },
    { 
      title: 'Ditolak', 
      value: formatCurrency(stats?.rejected_total ?? 0), 
      count: `${stats?.rejected_count ?? 0} penarikan`,
      icon: XCircle, 
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-950/20'
    },
    { 
      title: 'Saldo Admin', 
      value: formatCurrency(adminBalance?.balance ?? 0), 
      count: 'Tersedia',
      icon: Wallet, 
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/20'
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className={card.bg}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`size-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.count}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  const config = {
    pending: { label: 'Menunggu', cls: 'bg-amber-500 hover:bg-amber-600' },
    completed: { label: 'Selesai', cls: 'bg-green-500 hover:bg-green-600' },
    rejected: { label: 'Ditolak', cls: 'bg-red-500 hover:bg-red-600' },
  }
  const cfg = config[status] || config.pending
  return <Badge className={cfg.cls}>{cfg.label}</Badge>
}

export default function WithdrawalManagement() {
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [stats, setStats] = useState(null);
  const [adminBalance, setAdminBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Admin self-withdrawal dialog
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  // Approve dialog
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [transferProof, setTransferProof] = useState(null);
  const [transferPreview, setTransferPreview] = useState(null);
  const [approveNote, setApproveNote] = useState('');

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  // View proof dialog
  const [viewProofOpen, setViewProofOpen] = useState(false);
  const [proofImage, setProofImage] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [allRes, statsRes, balanceRes] = await Promise.all([
        adminService.getWithdrawals(),
        adminService.getWithdrawalStats(),
        adminService.getAdminBalance(),
      ]);
      
      setAllWithdrawals(allRes.data || allRes || []);
      setStats(statsRes.data || statsRes);
      setAdminBalance(balanceRes?.data || balanceRes || { balance: 0 });
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

  // Filter withdrawals by status tab
  const filteredWithdrawals = allWithdrawals.filter(w => {
    if (activeTab === 'all') return true;
    return w.status === activeTab;
  });

  // Approve handlers
  const openApproveDialog = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setTransferProof(null);
    setTransferPreview(null);
    setApproveNote('');
    setApproveDialogOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTransferProof(file);
      const reader = new FileReader();
      reader.onloadend = () => setTransferPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleApprove = async () => {
    if (!transferProof) {
      toast.error('Upload bukti transfer terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.approveWithdrawal(selectedWithdrawal.id, {
        transfer_proof: transferProof,
        admin_note: approveNote,
      });
      toast.success('Penarikan berhasil disetujui!');
      setApproveDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal menyetujui penarikan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reject handlers
  const openRejectDialog = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectNote('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      toast.error('Masukkan alasan penolakan');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.rejectWithdrawal(selectedWithdrawal.id, {
        admin_note: rejectNote,
      });
      toast.success('Penarikan ditolak.');
      setRejectDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal menolak penarikan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin self-withdraw
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
        
        {/* Admin self-withdrawal button */}
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

      {/* Tabs for status filter */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="size-3.5" />
            Menunggu
            {(stats?.pending_count ?? 0) > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {stats.pending_count}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CheckCircle className="size-3.5" />
            Selesai
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <XCircle className="size-3.5" />
            Ditolak
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5">
            Semua
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <WithdrawalTable 
            withdrawals={filteredWithdrawals} 
            isLoading={isLoading}
            activeTab={activeTab}
            onApprove={openApproveDialog}
            onReject={openRejectDialog}
            onViewProof={(url) => { setProofImage(url); setViewProofOpen(true); }}
          />
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-green-600" />
              Setujui Penarikan
            </DialogTitle>
            <DialogDescription>
              Upload bukti transfer untuk menyetujui penarikan saldo perental.
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              {/* Info penarikan */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Perental</span>
                  <span className="font-semibold">{selectedWithdrawal.user?.nama || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-semibold">{selectedWithdrawal.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No. Rekening</span>
                  <span className="font-semibold">{selectedWithdrawal.bank_account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atas Nama</span>
                  <span className="font-semibold">{selectedWithdrawal.bank_account_name}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground font-semibold">Nominal</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(selectedWithdrawal.amount)}</span>
                </div>
              </div>

              {/* Upload bukti transfer */}
              <div>
                <Label className="flex items-center gap-1.5 mb-2">
                  <Upload className="size-4" />
                  Bukti Transfer *
                </Label>
                <div className="border-2 border-dashed rounded-xl p-4 text-center hover:border-green-400 transition cursor-pointer"
                  onClick={() => document.getElementById('transfer-proof-input').click()}
                >
                  {transferPreview ? (
                    <div className="space-y-2">
                      <img src={transferPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                      <p className="text-xs text-muted-foreground">Klik untuk ganti foto</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <ImageIcon className="size-10 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">Klik untuk upload foto bukti transfer</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, WebP (max 5MB)</p>
                    </div>
                  )}
                </div>
                <input
                  id="transfer-proof-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Catatan */}
              <div>
                <Label htmlFor="approve-note">Catatan (Opsional)</Label>
                <Textarea
                  id="approve-note"
                  placeholder="Catatan tambahan..."
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setApproveDialogOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleApprove} 
                  disabled={isSubmitting || !transferProof}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Memproses...' : 'Setujui & Cairkan'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-red-600" />
              Tolak Penarikan
            </DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan penarikan saldo ini.
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 space-y-2 text-sm border border-red-200 dark:border-red-800">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Perental</span>
                  <span className="font-semibold">{selectedWithdrawal.user?.nama || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nominal</span>
                  <span className="font-bold text-red-600">{formatCurrency(selectedWithdrawal.amount)}</span>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 flex gap-2 items-start text-xs border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-700 dark:text-amber-400">
                  Saldo perental <strong>tidak akan dikurangi</strong> jika penarikan ditolak.
                </p>
              </div>

              <div>
                <Label htmlFor="reject-note">Alasan Penolakan *</Label>
                <Textarea
                  id="reject-note"
                  placeholder="Contoh: Data rekening tidak valid, mohon cek kembali..."
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRejectDialogOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleReject} 
                  disabled={isSubmitting || !rejectNote.trim()}
                  variant="destructive"
                >
                  {isSubmitting ? 'Memproses...' : 'Tolak Penarikan'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
    </div>
  );
}

function WithdrawalTable({ withdrawals, isLoading, activeTab, onApprove, onReject, onViewProof }) {
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (!withdrawals?.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <Banknote className="size-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Tidak ada data penarikan</p>
          <p className="text-sm mt-1">
            {activeTab === 'pending' ? 'Belum ada pengajuan penarikan yang menunggu.' :
             activeTab === 'completed' ? 'Belum ada penarikan yang selesai.' :
             activeTab === 'rejected' ? 'Belum ada penarikan yang ditolak.' :
             'Belum ada riwayat penarikan.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {activeTab === 'pending' ? 'Pengajuan Menunggu Approval' :
           activeTab === 'completed' ? 'Penarikan Selesai' :
           activeTab === 'rejected' ? 'Penarikan Ditolak' :
           'Semua Penarikan'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {activeTab === 'pending' ? 'Pengajuan penarikan yang perlu diproses oleh admin' :
           'Riwayat penarikan saldo'}
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
              {activeTab !== 'pending' && <TableHead>Catatan</TableHead>}
              {activeTab === 'completed' && <TableHead>Bukti</TableHead>}
              {activeTab === 'pending' && <TableHead className="text-center">Aksi</TableHead>}
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
                <TableCell className="font-mono text-xs">{item.bank_account_number}</TableCell>
                <TableCell>{item.bank_account_name}</TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(item.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                {activeTab !== 'pending' && (
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {item.admin_note || '-'}
                  </TableCell>
                )}
                {activeTab === 'completed' && (
                  <TableCell>
                    {item.transfer_proof ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs gap-1"
                        onClick={() => onViewProof(getStorageUrl(item.transfer_proof))}
                      >
                        <Eye className="size-3" />
                        Lihat
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
                {activeTab === 'pending' && (
                  <TableCell>
                    <div className="flex gap-1.5 justify-center">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-xs gap-1"
                        onClick={() => onApprove(item)}
                      >
                        <CheckCircle className="size-3" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="text-xs gap-1"
                        onClick={() => onReject(item)}
                      >
                        <XCircle className="size-3" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                )}
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