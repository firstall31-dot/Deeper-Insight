import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetSalesReport, useGetProfitReport, useGetInventoryReport } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Package } from 'lucide-react';
import { PageWrapper } from '@/components/ui/page-header';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];

type TabId = 'sales' | 'profit' | 'inventory';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'sales',     label: 'Sales Report',     icon: BarChart3 },
  { id: 'profit',    label: 'Profit Report',     icon: TrendingUp },
  { id: 'inventory', label: 'Inventory Report',  icon: Package },
];

export default function Reports() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('sales');

  const { data: salesReport,     isLoading: salesLoading }     = useGetSalesReport();
  const { data: profitReport,    isLoading: profitLoading }    = useGetProfitReport();
  const { data: inventoryReport, isLoading: inventoryLoading } = useGetInventoryReport();

  return (
    <PageWrapper>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shrink-0">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.reports')}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Sales Report */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Sales',      value: salesReport?.totalSales,    isCount: true },
              { label: 'Total Revenue',    value: salesReport?.totalRevenue,   color: 'text-green-700' },
              { label: 'Total Discounts',  value: salesReport?.totalDiscount,  color: 'text-destructive' },
            ].map(({ label, value, color, isCount }) => (
              <Card key={label}>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">{label}</div>
                  {salesLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                    <div className={`text-2xl font-bold mt-1 ${color ?? ''}`}>
                      {isCount ? (value ?? 0) : `${(value ?? 0).toLocaleString()} EGP`}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Revenue Over Time</CardTitle></CardHeader>
            <CardContent>
              {salesLoading ? <Skeleton className="h-64 w-full" /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={salesReport?.chartData ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} EGP`, 'Revenue']} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profit Report */}
      {activeTab === 'profit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: profitReport?.totalRevenue, color: 'text-green-700' },
              { label: 'Total Cost',    value: profitReport?.totalCost,    color: 'text-orange-700' },
              { label: 'Expenses',      value: profitReport?.totalExpenses, color: 'text-destructive' },
              { label: 'Net Profit',    value: profitReport?.netProfit,    color: (profitReport?.netProfit ?? 0) >= 0 ? 'text-green-700' : 'text-destructive' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">{label}</div>
                  {profitLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                    <div className={`text-2xl font-bold mt-1 ${color}`}>{(value ?? 0).toLocaleString()} EGP</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Profit Trend</CardTitle></CardHeader>
            <CardContent>
              {profitLoading ? <Skeleton className="h-64 w-full" /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={profitReport?.chartData ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} EGP`]} contentStyle={{ borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue"  stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="profit"   stroke="#22c55e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Report */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Products',    value: inventoryReport?.totalProducts,  isCount: true },
              { label: 'Inventory Value',   value: inventoryReport?.totalValue,     color: 'text-green-700' },
              { label: 'Low Stock Items',   value: inventoryReport?.lowStockItems,  color: (inventoryReport?.lowStockItems ?? 0) > 0 ? 'text-destructive' : '', isCount: true },
            ].map(({ label, value, color, isCount }) => (
              <Card key={label}>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">{label}</div>
                  {inventoryLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                    <div className={`text-2xl font-bold mt-1 ${color ?? ''}`}>
                      {isCount ? (value ?? 0) : `${(value ?? 0).toLocaleString()} EGP`}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Inventory by Category</CardTitle></CardHeader>
            <CardContent>
              {inventoryLoading ? <Skeleton className="h-64 w-full" /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={inventoryReport?.categories ?? []}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {(inventoryReport?.categories ?? []).map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} EGP`, 'Value']} contentStyle={{ borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
