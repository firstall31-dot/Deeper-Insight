import { useLanguage } from '@/contexts/LanguageContext';
import { useGetDashboardSummary, useGetDashboardAlerts } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Banknote, DollarSign, TrendingDown, LayoutDashboard } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import { PageWrapper } from '@/components/ui/page-header';

export default function Dashboard() {
  const { t } = useLanguage();
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: alerts, isLoading: isLoadingAlerts } = useGetDashboardAlerts();

  const statCards = [
    { title: t('dashboard.dailySales'),    value: summary?.dailySales,    icon: Banknote,     color: 'text-green-600',     bg: 'bg-green-50 dark:bg-green-950/30' },
    { title: t('dashboard.monthlySales'),  value: summary?.monthlySales,  icon: Banknote,     color: 'text-primary',        bg: 'bg-primary/5' },
    { title: t('dashboard.totalProfit'),   value: summary?.totalProfit,   icon: DollarSign,   color: 'text-amber-600',      bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { title: t('dashboard.totalExpenses'), value: summary?.totalExpenses, icon: TrendingDown, color: 'text-destructive',    bg: 'bg-destructive/5' },
  ];

  return (
    <PageWrapper>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shrink-0">
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.dashboard')}</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingSummary ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
                    <Icon className={`h-4.5 w-4.5 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold">{(stat.value ?? 0).toLocaleString()} EGP</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('dashboard.recentSales')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <div className="h-[280px]">
                {summary?.salesByPaymentMethod && summary.salesByPaymentMethod.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.salesByPaymentMethod} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="method" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip
                        formatter={(v) => [`${Number(v).toLocaleString()} EGP`, 'Revenue']}
                        contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                      />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    No sales data available yet
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              {t('dashboard.alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAlerts ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/8 border border-destructive/15 text-sm">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-destructive leading-tight">{alert.type}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No active alerts</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
