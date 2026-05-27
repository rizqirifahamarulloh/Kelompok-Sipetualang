import { useState, useEffect } from 'react'
// import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  PieChart
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

function RevenueStatsCards({ stats }) {
  const cards = [
    { 
      title: 'Total Pendapatan', 
      value: formatCurrency(stats?.total_revenue ?? 0), 
      icon: DollarSign, 
      desc: 'Dari semua transaksi',
      color: 'text-green-600'
    },
    { 
      title: 'Fee Admin (20%)', 
      value: formatCurrency(stats?.total_fee_admin ?? 0), 
      icon: TrendingUp, 
      desc: 'Pendapatan SiPetualang',
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
  )
}

function RevenueChart({ data }) {
  // Simple chart representation (bisa diganti dengan library chart seperti recharts)
  const total = data?.total_revenue || 0
  const feeAdmin = data?.total_fee_admin || 0
  const pendapatanPemilik = data?.total_pendapatan_pemilik || 0
  
  const adminPercent = total > 0 ? (feeAdmin / total * 100).toFixed(1) : 0
  const pemilikPercent = total > 0 ? (pendapatanPemilik / total * 100).toFixed(1) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="size-5" />
          Pembagian Hasil
        </CardTitle>
        <CardDescription>Distribusi pendapatan antara Admin dan Pemilik Barang</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background circle (total) */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                {/* Admin fee (20%) */}
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="#3b82f6" strokeWidth="10" 
                  strokeDasharray={`${adminPercent * 2.83} ${283 - (adminPercent * 2.83)}`}
                />
                {/* Pemilik (80%) */}
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="#8b5cf6" strokeWidth="10"
                  strokeDasharray={`${pemilikPercent * 2.83} 283`}
                  strokeDashoffset={-(adminPercent * 2.83)}
                />
              </svg>
            </div>
          </div>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Admin Fee (20%): {formatCurrency(feeAdmin)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Pemilik (80%): {formatCurrency(pendapatanPemilik)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionList({ transactions }) {
  if (!transactions?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>Belum ada transaksi</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Transaksi</CardTitle>
        <CardDescription>Semua transaksi yang telah terjadi</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead>Penyewa</TableHead>
              <TableHead>Pemilik</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Fee Admin (20%)</TableHead>
              <TableHead>Pendapatan Pemilik (80%)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((trx) => (
              <TableRow key={trx.id_transaksi}>
                <TableCell className="font-mono text-xs">{trx.id_transaksi}</TableCell>
                <TableCell className="font-medium">{trx.nama_barang}</TableCell>
                <TableCell>{trx.penyewa?.nama || '-'}</TableCell>
                <TableCell>{trx.pemilik?.nama || '-'}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(trx.total_biaya)}</TableCell>
                <TableCell className="text-blue-600">{formatCurrency(trx.fee_admin)}</TableCell>
                <TableCell className="text-purple-600">{formatCurrency(trx.pendapatan_pemilik)}</TableCell>
                <TableCell>
                  <Badge className={trx.status_pembayaran === 'sukses' ? 'bg-green-500' : 'bg-yellow-500'}>
                    {trx.status_pembayaran}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{formatDate(trx.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function OwnerEarningsList({ earnings }) {
  if (!earnings?.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pendapatan per Pemilik</CardTitle>
        <CardDescription>Total pendapatan yang diterima setiap perental</CardDescription>
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
            {earnings.map((owner) => (
              <TableRow key={owner.id_pengguna}>
                <TableCell className="font-medium">{owner.nama}</TableCell>
                <TableCell>{owner.email}</TableCell>
                <TableCell>{owner.total_transaksi}</TableCell>
                <TableCell className="text-green-600 font-semibold">
                  {formatCurrency(owner.total_pendapatan)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminService.getRevenueStats()
        setData(res.data)
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
        <h1 className="text-2xl font-bold tracking-tight">Pembagian Hasil</h1>
        <p className="text-muted-foreground">Manajemen pendapatan dari transaksi rental</p>
      </div>

      <RevenueStatsCards stats={data?.stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RevenueChart data={data?.stats} />
        </div>
        <div className="lg:col-span-2">
          <OwnerEarningsList earnings={data?.owner_earnings} />
        </div>
      </div>

      <TransactionList transactions={data?.transactions} />
    </div>
  )
}