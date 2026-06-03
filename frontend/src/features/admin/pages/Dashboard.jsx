import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Link } from 'react-router-dom'
import TablePagination, { paginateArray } from '@/components/TablePagination'
import { dashboardService } from '@/features/admin/services/dashboardService'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Users, Package, ShoppingCart, Banknote, AlertTriangle, TrendingUp, RotateCcw, TrendingDown,
  Wallet, Clock, ArrowRight, ArrowDownToLine,
} from 'lucide-react'
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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des']

/* ====== Custom Tooltip ====== */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500 dark:text-gray-400 flex-1">{entry.name}:</span>
          <span className={`font-semibold font-mono ${entry.name === 'Refund' ? 'text-red-500' : entry.name === 'Pencairan Perental' ? 'text-orange-500' : entry.name === 'Pencairan Admin' ? 'text-cyan-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {entry.name === 'Refund' ? `- ${formatCurrency(entry.value)}` : formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ====== Monthly Revenue Chart (with Refund) ====== */
function MonthlyRevenueChart({ monthlyData }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
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
        'Refund': 0,
        'Pencairan Perental': 0,
        'Pencairan Admin': 0,
      })
    }

    if (monthlyData?.length) {
      monthlyData.forEach((item) => {
        const found = months.find((m) => m.bulan === item.bulan)
        if (found) {
          found['Total Pendapatan'] = Number(item.total) || 0
          found['Fee Admin'] = Number(item.fee_admin) || 0
          found['Pendapatan Pemilik'] = Number(item.pendapatan_pemilik) || 0
          found['Refund'] = Number(item.refund) || 0
          found['Pencairan Perental'] = Number(item.perental_withdrawn) || 0
          found['Pencairan Admin'] = Number(item.admin_withdrawn) || 0
        }
      })
    }

    return months
  }, [monthlyData])

  const totalPeriode = chartData.reduce((sum, m) => sum + m['Total Pendapatan'], 0)
  const totalRefund = chartData.reduce((sum, m) => sum + m['Refund'], 0)
  const totalPerentalWd = chartData.reduce((sum, m) => sum + m['Pencairan Perental'], 0)
  const totalAdminWd = chartData.reduce((sum, m) => sum + m['Pencairan Admin'], 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-emerald-600" />
              Pendapatan Bulanan
            </CardTitle>
            <CardDescription>Grafik pendapatan & refund 12 bulan terakhir</CardDescription>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Periode</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPeriode)}</p>
            </div>
            {totalRefund > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Refund</p>
                <p className="text-lg font-bold text-red-500">- {formatCurrency(totalRefund)}</p>
              </div>
            )}
            {totalPerentalWd > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Cair Perental</p>
                <p className="text-lg font-bold text-orange-500">{formatCurrency(totalPerentalWd)}</p>
              </div>
            )}
            {totalAdminWd > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Cair Admin</p>
                <p className="text-lg font-bold text-cyan-500">{formatCurrency(totalAdminWd)}</p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 350 }}>
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
                <linearGradient id="gradRefund" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradWithdrawn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradAdminWd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f0f0f0'} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                tickFormatter={formatCompact}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#6b7280' }}
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
              <Area
                type="monotone"
                dataKey="Refund"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 3"
                fill="url(#gradRefund)"
                dot={(props) => {
                  const { cx, cy, payload } = props
                  if (payload['Refund'] > 0) {
                    return (
                      <circle
                        key={`refund-dot-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#ef4444"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )
                  }
                  return null
                }}
                activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="Pencairan Perental"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#gradWithdrawn)"
                dot={(props) => {
                  const { cx, cy, payload } = props
                  if (payload['Pencairan Perental'] > 0) {
                    return (
                      <circle
                        key={`pw-dot-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#f97316"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )
                  }
                  return null
                }}
                activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="Pencairan Admin"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#gradAdminWd)"
                dot={(props) => {
                  const { cx, cy, payload } = props
                  if (payload['Pencairan Admin'] > 0) {
                    return (
                      <circle
                        key={`aw-dot-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#06b6d4"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )
                  }
                  return null
                }}
                activeDot={{ r: 5, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/* ====== Stats Cards (with Withdrawal + Ongkir + Escrow) ====== */
function StatsCards({ stats, t }) {
  const cards = [
    { title: t('admin.totalUsers'), value: stats?.total_users ?? 0, icon: Users, desc: t('admin.registeredUsers') },
    { title: t('admin.totalGears'), value: stats?.total_gears ?? 0, icon: Package, desc: t('admin.availableGears') },
    { title: t('admin.totalTransactions'), value: stats?.total_transactions ?? 0, icon: ShoppingCart, desc: t('admin.allTransactions') },
    { title: t('admin.totalRevenue'), value: formatCurrency(stats?.total_revenue ?? 0), icon: Banknote, desc: t('admin.grossRevenue'), highlight: 'emerald' },
  ]

  return (
    <div className="space-y-4">
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

      {/* Financial Details Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(stats?.total_refund > 0 || stats?.total_refund_count > 0) && (
          <Card className="border-red-200 dark:border-red-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Total Refund</CardTitle>
              <RotateCcw className="size-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                - {formatCurrency(stats?.total_refund ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.total_refund_count ?? 0} pengajuan refund
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border-blue-200 dark:border-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Saldo Fee Admin (20% + Ongkir)</CardTitle>
            <Banknote className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(stats?.admin_fee_balance ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fee: {formatCurrency(stats?.total_fee_admin ?? 0)} - Dicairkan: {formatCurrency(stats?.admin_withdrawn ?? 0)}
            </p>
          </CardContent>
        </Card>

        {(stats?.total_ongkir > 0) && (
          <Card className="border-teal-200 dark:border-teal-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-teal-600 dark:text-teal-400">Total Ongkir</CardTitle>
              <TrendingUp className="size-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {formatCurrency(stats?.total_ongkir ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pengiriman internal SiPetualang</p>
            </CardContent>
          </Card>
        )}

        {(stats?.total_escrow_held > 0) && (
          <Card className="border-amber-200 dark:border-amber-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Escrow Ditahan</CardTitle>
              <Clock className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(stats?.total_escrow_held ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pendapatan perental yang belum di-release</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Withdrawal Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-orange-200 dark:border-orange-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">Dicairkan ke Perental</CardTitle>
            <ArrowDownToLine className="size-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(stats?.perental_withdrawn ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dari saldo pendapatan pemilik (80%)</p>
          </CardContent>
        </Card>

        {(stats?.total_released > 0) && (
          <Card className="border-emerald-200 dark:border-emerald-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Sudah Di-release</CardTitle>
              <TrendingUp className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(stats?.total_released ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pendapatan perental yang sudah dicairkan dari escrow</p>
            </CardContent>
          </Card>
        )}

        {(stats?.perental_pending_count > 0) && (
          <Card className="border-amber-200 dark:border-amber-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Perental</CardTitle>
              <Clock className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(stats?.perental_pending_amount ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats?.perental_pending_count} pengajuan menunggu</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

/* ====== Recent Pending Withdrawals ====== */
function RecentWithdrawals({ withdrawals }) {
  if (!withdrawals?.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-5 text-amber-500" />
          Penarikan Menunggu Approval
        </CardTitle>
        <CardDescription>Pengajuan penarikan saldo dari perental yang perlu diproses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {withdrawals.map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{w.user}</p>
                <p className="text-xs text-muted-foreground">{w.bank_name} • {formatDate(w.created_at)}</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{formatCurrency(w.amount)}</span>
                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                  Pending
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <Link to="/admin/withdrawals">
          <Button variant="outline" className="w-full mt-4 text-sm gap-2">
            Lihat Semua Penarikan
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

/* ====== Recent Refunds ====== */
function RecentRefunds({ refunds }) {
  if (!refunds?.length) return null

  const statusColors = {
    pending: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    disetujui: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    ditolak: 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="size-5 text-red-500" />
          Pengajuan Refund Terbaru
        </CardTitle>
        <CardDescription>Daftar pengajuan pengembalian barang terbaru</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {refunds.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{r.barang}</p>
                <p className="text-xs text-muted-foreground">{r.customer}</p>
              </div>
              <div className="text-right flex items-center gap-3">
                {r.jumlah_refund > 0 && (
                  <span className="text-sm font-bold text-red-500">- {formatCurrency(r.jumlah_refund)}</span>
                )}
                <Badge
                  variant="outline"
                  className={statusColors[r.status] || 'bg-muted text-muted-foreground'}
                >
                  {r.status === 'disetujui' ? 'Disetujui' : r.status === 'ditolak' ? 'Ditolak' : 'Pending'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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

      {/* Grafik Pendapatan Bulanan + Refund */}
      <MonthlyRevenueChart monthlyData={data?.monthly_revenue} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={data?.recent_transactions} t={t} />
        </div>
        <div className="space-y-6">
          <RecentWithdrawals withdrawals={data?.recent_withdrawals} />
          <RecentRefunds refunds={data?.recent_refunds} />
          <LowStockAlerts alerts={data?.low_stock_alerts} t={t} />
        </div>
      </div>
    </div>
  )
}
