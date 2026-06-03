import { useState, useEffect } from 'react'
import TablePagination, { paginateArray } from '@/components/TablePagination'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  PieChart,
  RotateCcw,
  Wallet,
  ArrowDownToLine,
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
    day: 'numeric'
  })
}

function RevenueStatsCards({ stats, withdrawalStats }) {
  const cards = [
    { 
      title: 'Total Pendapatan', 
      value: formatCurrency(stats?.total_revenue ?? 0), 
      icon: DollarSign, 
      desc: 'Dari semua transaksi',
      color: 'text-green-600'
    },
    { 
      title: 'Fee Admin (20% + Ongkir)', 
      value: formatCurrency(stats?.total_fee_admin ?? 0), 
      icon: TrendingUp, 
      desc: 'Komisi + pengiriman internal',
      color: 'text-blue-600'
    },
    { 
      title: 'Pendapatan Pemilik (80%)', 
      value: formatCurrency(stats?.total_pendapatan_pemilik ?? 0), 
      icon: Users, 
      desc: 'Dibayarkan ke perental',
      color: 'text-purple-600'
    },
    { 
      title: 'Total Transaksi', 
      value: stats?.total_transaksi ?? 0, 
      icon: ShoppingCart, 
      desc: 'Transaksi sukses',
      color: 'text-orange-600'
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`size-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refund & Withdrawal Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats?.total_refund > 0 && (
          <Card className="border-red-200 dark:border-red-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Total Refund</CardTitle>
              <RotateCcw className="size-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">- {formatCurrency(stats?.total_refund ?? 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Dikembalikan ke customer</p>
            </CardContent>
          </Card>
        )}

        {stats?.total_refund > 0 && (
          <Card className="border-emerald-200 dark:border-emerald-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Pendapatan Bersih</CardTitle>
              <TrendingUp className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats?.net_revenue ?? 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Setelah dikurangi refund</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-orange-200 dark:border-orange-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">Dicairkan ke Perental</CardTitle>
            <ArrowDownToLine className="size-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(withdrawalStats?.perental_completed_total ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">{withdrawalStats?.perental_completed_count ?? 0} penarikan selesai</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 dark:border-cyan-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Dicairkan Admin</CardTitle>
            <Wallet className="size-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(withdrawalStats?.admin_completed_total ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">{withdrawalStats?.admin_completed_count ?? 0} penarikan admin</p>
          </CardContent>
        </Card>

        {(withdrawalStats?.perental_pending_count ?? 0) > 0 && (
          <Card className="border-amber-200 dark:border-amber-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Perental</CardTitle>
              <Wallet className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(withdrawalStats?.perental_pending_total ?? 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">{withdrawalStats?.perental_pending_count ?? 0} pengajuan menunggu</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function RevenueChart({ data, withdrawalStats }) {
  const total = data?.total_revenue || 0
  const feeAdmin = data?.total_fee_admin || 0
  const pendapatanPemilik = data?.total_pendapatan_pemilik || 0
  const refund = data?.total_refund || 0
  const perentalWithdrawn = withdrawalStats?.perental_completed_total || 0
  const adminWithdrawn = withdrawalStats?.admin_completed_total || 0
  
  const circumference = 283
  const adminPercent = total > 0 ? (feeAdmin / total * 100).toFixed(1) : 0
  const pemilikPercent = total > 0 ? (pendapatanPemilik / total * 100).toFixed(1) : 0
  const refundPercent = total > 0 ? (refund / total * 100).toFixed(1) : 0

  const adminArc = adminPercent * 2.83
  const pemilikArc = pemilikPercent * 2.83
  const refundArc = refundPercent * 2.83

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="size-5" />
          Pembagian Hasil
        </CardTitle>
        <p className="text-sm text-muted-foreground">Distribusi pendapatan antara Admin, Pemilik & Refund</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" className="dark:stroke-gray-700" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="#3b82f6" strokeWidth="10" 
                  strokeDasharray={`${adminArc} ${circumference - adminArc}`}
                />
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="#8b5cf6" strokeWidth="10"
                  strokeDasharray={`${pemilikArc} ${circumference}`}
                  strokeDashoffset={-adminArc}
                />
                {refund > 0 && (
                  <circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke="#ef4444" strokeWidth="10"
                    strokeDasharray={`${refundArc} ${circumference}`}
                    strokeDashoffset={-(adminArc + pemilikArc)}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-muted-foreground">Bersih</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(total - refund)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs">Admin ({adminPercent}%): {formatCurrency(feeAdmin)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs">Pemilik ({pemilikPercent}%): {formatCurrency(pendapatanPemilik)}</span>
            </div>
            {refund > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Refund ({refundPercent}%): - {formatCurrency(refund)}</span>
              </div>
            )}
          </div>
          
          {/* Separated withdrawal summary below pie chart */}
          {(perentalWithdrawn > 0 || adminWithdrawn > 0) && (
            <div className="mt-4 pt-4 border-t space-y-2">
              {perentalWithdrawn > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine className="size-4 text-orange-500" />
                    <span className="text-muted-foreground">Dicairkan ke Perental</span>
                  </div>
                  <span className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(perentalWithdrawn)}</span>
                </div>
              )}
              {adminWithdrawn > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-cyan-500" />
                    <span className="text-muted-foreground">Dicairkan Admin</span>
                  </div>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(adminWithdrawn)}</span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground ml-6">
                {(withdrawalStats?.perental_completed_count || 0) + (withdrawalStats?.admin_completed_count || 0)} total penarikan selesai
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionList({ transactions }) {
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  if (!transactions?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Transaksi</CardTitle>
        <p className="text-sm text-muted-foreground">Semua transaksi yang telah terjadi</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barang</TableHead>
              <TableHead>Penyewa</TableHead>
              <TableHead>Pemilik</TableHead>
              <TableHead>Ongkir</TableHead>
              <TableHead>Deposit</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Fee Admin (20%)</TableHead>
              <TableHead>Pendapatan Pemilik (80%)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginateArray(transactions, currentPage, PER_PAGE).map((trx) => {
              // Hitung ulang fee admin dan pendapatan pemilik dari total - ongkir - deposit
              const totalSewa = trx.total_biaya - (trx.biaya_pengiriman || 0) - (trx.nominal_deposit || 0);
              const feeAdmin = totalSewa * 0.2;
              const pendapatanPemilik = totalSewa - feeAdmin;
              
              return (
                <TableRow key={trx.id_transaksi}>
                  <TableCell className="font-medium">{trx.nama_barang}</TableCell>
                  <TableCell>{trx.penyewa?.nama || '-'}</TableCell>
                  <TableCell>{trx.pemilik?.nama || '-'}</TableCell>
                  <TableCell className="text-xs">
                    {trx.biaya_pengiriman > 0 ? formatCurrency(trx.biaya_pengiriman) : '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {trx.nominal_deposit > 0 ? formatCurrency(trx.nominal_deposit) : '-'}
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(trx.total_biaya)}</TableCell>
                  <TableCell className="text-blue-600 dark:text-blue-400 font-semibold">{formatCurrency(feeAdmin)}</TableCell>
                  <TableCell className="text-purple-600 dark:text-purple-400 font-semibold">{formatCurrency(pendapatanPemilik)}</TableCell>
                  <TableCell>
                    <Badge className={trx.status_pembayaran === 'sukses' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {trx.status_pembayaran}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{formatDate(trx.created_at)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          currentPage={currentPage}
          totalItems={transactions.length}
          perPage={PER_PAGE}
          onPageChange={setCurrentPage}
          label="transaksi"
        />
      </CardContent>
    </Card>
  )
}

function OwnerEarningsList({ earnings }) {
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  if (!earnings?.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pendapatan per Pemilik</CardTitle>
        <p className="text-sm text-muted-foreground">Total pendapatan yang diterima setiap perental</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pemilik</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total Transaksi</TableHead>
              <TableHead>Total Pendapatan (80%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginateArray(earnings, currentPage, PER_PAGE).map((owner) => (
              <TableRow key={owner.id_pengguna}>
                <TableCell className="font-medium">{owner.nama}</TableCell>
                <TableCell>{owner.email}</TableCell>
                <TableCell>{owner.total_transaksi}</TableCell>
                <TableCell className="text-green-600 dark:text-green-400 font-semibold">
                  {formatCurrency(owner.total_pendapatan)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          currentPage={currentPage}
          totalItems={earnings.length}
          perPage={PER_PAGE}
          onPageChange={setCurrentPage}
          label="pemilik"
        />
      </CardContent>
    </Card>
  )
}

function RevenueSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-48 w-full" /></CardContent>
      </Card>
    </div>
  )
}

export default function AdminRevenue() {
  const [data, setData] = useState(null)
  const [withdrawalStats, setWithdrawalStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, wRes] = await Promise.all([
          adminService.getRevenueStats(),
          adminService.getWithdrawalStats(),
        ])
        setData(res.data)
        setWithdrawalStats(wRes.data || wRes)
      } catch (error) {
        toast.error('Gagal memuat data pendapatan')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) return <RevenueSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pembagian Hasil & Keuangan</h1>
        <p className="text-muted-foreground">Ringkasan pendapatan, pembagian hasil, dan pencairan saldo</p>
      </div>

      <RevenueStatsCards stats={data?.stats} withdrawalStats={withdrawalStats} />
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RevenueChart data={data?.stats} withdrawalStats={withdrawalStats} />
        </div>
        <div className="lg:col-span-2">
          <OwnerEarningsList earnings={data?.owner_earnings} />
        </div>
      </div>
      <TransactionList transactions={data?.transactions} />
    </div>
  )
}