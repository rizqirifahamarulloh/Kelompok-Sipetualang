import { useState, useEffect, useMemo } from 'react'
import TablePagination, { paginateArray } from '@/components/TablePagination'
import { dashboardService } from '@/features/admin/services/dashboardService'
import { useLanguage } from '@/contexts/LanguageContext'
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
import { Users, Package, ShoppingCart, Banknote, AlertTriangle, TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const statusVariants = {
  pending_payment: 'outline',
  paid: 'secondary',
  rented: 'default',
  completed: 'default',
  cancelled: 'destructive',
  overdue: 'destructive',
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatCompact(amount) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}jt`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}rb`
  return amount.toString()
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des']

/* ====== Custom Tooltip ====== */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontSize: '0.8rem',
    }}>
      <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1f2937' }}>{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color, flexShrink: 0 }} />
          <span style={{ color: '#6b7280', flex: 1 }}>{entry.name}:</span>
          <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#111827' }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ====== Monthly Revenue Chart ====== */
function MonthlyRevenueChart({ monthlyData }) {
  const chartData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months.push({
        bulan: key,
        label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        'Total Pendapatan': 0,
        'Fee Admin': 0,
        'Pendapatan Pemilik': 0,
      })
    }

    if (monthlyData?.length) {
      monthlyData.forEach((item) => {
        const found = months.find((m) => m.bulan === item.bulan)
        if (found) {
          found['Total Pendapatan'] = Number(item.total) || 0
          found['Fee Admin'] = Number(item.fee_admin) || 0
          found['Pendapatan Pemilik'] = Number(item.pendapatan_pemilik) || 0
        }
      })
    }

    return months
  }, [monthlyData])

  const totalPeriode = chartData.reduce((sum, m) => sum + m['Total Pendapatan'], 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-emerald-600" />
              Pendapatan Bulanan
            </CardTitle>
            <CardDescription>Grafik pendapatan 12 bulan terakhir</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Periode</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalPeriode)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradPemilik" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickFormatter={formatCompact}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '0.75rem', color: '#6b7280' }}
              />
              <Area
                type="monotone"
                dataKey="Total Pendapatan"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#gradTotal)"
                dot={false}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="Fee Admin"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradAdmin)"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="Pendapatan Pemilik"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#gradPemilik)"
                dot={false}
                activeDot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/* ====== Stats Cards ====== */
function StatsCards({ stats, t }) {
  const cards = [
    { title: t('admin.totalUsers'), value: stats?.total_users ?? 0, icon: Users, desc: t('admin.registeredUsers') },
    { title: t('admin.totalGears'), value: stats?.total_gears ?? 0, icon: Package, desc: t('admin.availableGears') },
    { title: t('admin.totalTransactions'), value: stats?.total_transactions ?? 0, icon: ShoppingCart, desc: t('admin.allTransactions') },
    { title: t('admin.totalRevenue'), value: formatCurrency(stats?.total_revenue ?? 0), icon: Banknote, desc: t('admin.grossRevenue') },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="size-4 text-muted-foreground" />
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

/* ====== Recent Transactions ====== */
function RecentTransactions({ transactions, t }) {
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  if (!transactions?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.recentTransactions')}</CardTitle>
          <CardDescription>{t('admin.noTransactions')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.recentTransactions')}</CardTitle>
        <CardDescription>{t('admin.recentTransactionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.code')}</TableHead>
              <TableHead>{t('admin.customer')}</TableHead>
              <TableHead>{t('admin.destination')}</TableHead>
              <TableHead>{t('admin.total')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginateArray(transactions, currentPage, PER_PAGE).map((trx) => (
              <TableRow key={trx.id}>
                <TableCell className="font-mono text-sm">{trx.transaction_code}</TableCell>
                <TableCell>{trx.customer?.name ?? '-'}</TableCell>
                <TableCell>{trx.destination?.name ?? '-'}</TableCell>
                <TableCell>{formatCurrency(trx.total_cost)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[trx.status] ?? 'outline'}>
                    {t(`status.${trx.status}`, trx.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
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

/* ====== Low Stock Alerts ====== */
function LowStockAlerts({ alerts, t }) {
  if (!alerts?.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-destructive" />
          {t('admin.lowStock')}
        </CardTitle>
        <CardDescription>{t('admin.lowStockDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((gear) => (
            <div key={gear.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium text-sm">{gear.name}</p>
                <p className="text-xs text-muted-foreground">{gear.category?.name}</p>
              </div>
              <Badge variant="destructive">{t('admin.stock')}: {gear.stock}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ====== Skeleton ====== */
function DashboardSkeleton() {
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
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-[320px] w-full" /></CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-48 w-full" /></CardContent>
      </Card>
    </div>
  )
}

/* ====== Main Dashboard ====== */
export default function Dashboard() {
  const { t } = useLanguage()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardService.getStats()
        setData(res.data.data)
      } catch (error) {
        toast.error(t('admin.loadError'))
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [t])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.dashboardTitle')}</h1>
        <p className="text-muted-foreground">{t('admin.dashboardSubtitle')}</p>
      </div>

      <StatsCards stats={data?.stats} t={t} />

      {/* Grafik Pendapatan Bulanan */}
      <MonthlyRevenueChart monthlyData={data?.monthly_revenue} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={data?.recent_transactions} t={t} />
        </div>
        <div>
          <LowStockAlerts alerts={data?.low_stock_alerts} t={t} />
        </div>
      </div>
    </div>
  )
}
