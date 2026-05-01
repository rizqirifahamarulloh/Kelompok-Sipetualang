import { useState, useEffect } from 'react'
import { dashboardService } from '@/features/admin/services/dashboardService'
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
  Users,
  Package,
  ShoppingCart,
  Banknote,
  AlertTriangle,
} from 'lucide-react'

const statusVariants = {
  pending_payment: { label: 'Menunggu Bayar', variant: 'outline' },
  paid: { label: 'Dibayar', variant: 'secondary' },
  rented: { label: 'Disewa', variant: 'default' },
  completed: { label: 'Selesai', variant: 'default' },
  cancelled: { label: 'Dibatalkan', variant: 'destructive' },
  overdue: { label: 'Terlambat', variant: 'destructive' },
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Pengguna',
      value: stats?.total_users ?? 0,
      icon: Users,
      description: 'Pengguna terdaftar',
    },
    {
      title: 'Total Alat',
      value: stats?.total_gears ?? 0,
      icon: Package,
      description: 'Alat outdoor tersedia',
    },
    {
      title: 'Total Transaksi',
      value: stats?.total_transactions ?? 0,
      icon: ShoppingCart,
      description: 'Transaksi keseluruhan',
    },
    {
      title: 'Total Pendapatan',
      value: formatCurrency(stats?.total_revenue ?? 0),
      icon: Banknote,
      description: 'Pendapatan kotor',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RecentTransactions({ transactions }) {
  if (!transactions?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>Belum ada transaksi</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terbaru</CardTitle>
        <CardDescription>5 transaksi terakhir di platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Destinasi</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((trx) => {
              const status = statusVariants[trx.status] ?? {
                label: trx.status,
                variant: 'outline',
              }
              return (
                <TableRow key={trx.id}>
                  <TableCell className="font-mono text-sm">
                    {trx.transaction_code}
                  </TableCell>
                  <TableCell>{trx.customer?.name ?? '-'}</TableCell>
                  <TableCell>{trx.destination?.name ?? '-'}</TableCell>
                  <TableCell>{formatCurrency(trx.total_cost)}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function LowStockAlerts({ alerts }) {
  if (!alerts?.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-destructive" />
          Stok Rendah
        </CardTitle>
        <CardDescription>
          Alat dengan stok di bawah 5 unit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((gear) => (
            <div
              key={gear.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium text-sm">{gear.name}</p>
                <p className="text-xs text-muted-foreground">
                  {gear.category?.name}
                </p>
              </div>
              <Badge variant="destructive">
                Stok: {gear.stock}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardService.getStats()
        setData(res.data.data)
      } catch (error) {
        toast.error('Gagal memuat data dashboard')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan data dan aktivitas platform SiPetualang
        </p>
      </div>

      <StatsCards stats={data?.stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={data?.recent_transactions} />
        </div>
        <div>
          <LowStockAlerts alerts={data?.low_stock_alerts} />
        </div>
      </div>
    </div>
  )
}
