import { useLanguage } from '@/contexts/LanguageContext';
import { useGetDashboardSummary, useGetDashboardAlerts } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Banknote, DollarSign, TrendingDown, Wrench } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { t } = useLanguage();
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: alerts, isLoading: isLoadingAlerts } = useGetDashboardAlerts();

  if (isLoadingSummary || isLoadingAlerts) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const statCards = [
    { title: t('dashboard.dailySales'), value: summary?.dailySales, icon: Banknote, color: "text-green-600" },
    { title: t('dashboard.monthlySales'), value: summary?.monthlySales, icon: Banknote, color: "text-primary" },
    { title: t('dashboard.totalProfit'), value: summary?.totalProfit, icon: DollarSign, color: "text-accent" },
    { title: t('dashboard.totalExpenses'), value: summary?.totalExpenses, icon: TrendingDown, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t('nav.dashboard')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value?.toLocaleString() || 0} EGP</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.recentSales')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
               {summary?.salesByPaymentMethod && summary.salesByPaymentMethod.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={summary.salesByPaymentMethod}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="method" />
                     <YAxis />
                     <RechartsTooltip />
                     <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="flex h-full items-center justify-center text-muted-foreground">
                   No data available
                 </div>
               )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t('dashboard.alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts && alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-destructive">{alert.type}</p>
                      <p className="text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}