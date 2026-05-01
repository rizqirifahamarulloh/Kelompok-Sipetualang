import { useState, useEffect } from 'react'
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
import { Users, Package, ShoppingCart, Banknote, AlertTriangle } from 'lucide-react'

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

function RecentTransactions({ transactions, t }) {
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
            {transactions.map((trx) => (
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
      </CardContent>
    </Card>
  )
}

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
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-48 w-full" /></CardContent>
      </Card>
    </div>
  )
}

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
  }, [])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.dashboardTitle')}</h1>
        <p className="text-muted-foreground">{t('admin.dashboardSubtitle')}</p>
      </div>

      <StatsCards stats={data?.stats} t={t} />

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
