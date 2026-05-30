import { useLanguage } from '@/contexts/LanguageContext';
import { useGetSalesReport, useGetProfitReport, useGetInventoryReport } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Package } from 'lucide-react';
import { useState } from 'react';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];

type TabId = 'sales' | 'profit' | 'inventory';

export default function Reports() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('sales');

  const { data: salesReport, isLoading: salesLoading } = useGetSalesReport();
  const { data: profitReport, isLoading: profitLoading } = useGetProfitReport();
  const { data: inventoryReport, isLoading: inventoryLoading } = useGetInventoryReport();

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'sales', label: 'Sales Report', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'profit', label: 'Profit Report', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'inventory', label: 'Inventory Report', icon: <Package className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">{t('nav.reports')}</h2>
      </div>

      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Sales</div>
                {salesLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                  <div className="text-2xl font-bold">{salesReport?.totalSales ?? 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                {salesLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                  <div className="text-2xl font-bold text-green-700">{(salesReport?.totalRevenue ?? 0).toLocaleString()} EGP</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Discounts</div>
                {salesLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                  <div className="text-2xl font-bold text-destructive">{(salesReport?.totalDiscount ?? 0).toLocaleString()} EGP</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
            <CardContent>
              {salesLoading ? <Skeleton className="h-64 w-full" /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesReport?.chartData ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} EGP`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'profit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: profitReport?.totalRevenue, color: 'text-green-700' },
              { label: 'Total Cost', value: profitReport?.totalCost, color: 'text-orange-700' },
              { label: 'Expenses', value: profitReport?.totalExpenses, color: 'text-destructive' },
              { label: 'Net Profit', value: profitReport?.netProfit, color: (profitReport?.netProfit ?? 0) >= 0 ? 'text-green-700' : 'text-destructive' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">{label}</div>
                  {profitLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                    <div className={`text-2xl font-bold ${color}`}>{(value ?? 0).toLocaleString()} EGP</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle>Profit Trend</CardTitle></CardHeader>
            <CardContent>
              {profitLoading ? <Skeleton className="h-64 w-full" /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={profitReport?.chartData ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} EGP`]} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Products</div>
                {inventoryLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                  <div className="text-2xl font-bold">{inventoryReport?.totalProducts ?? 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Inventory Value</div>
                {inventoryLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                  <div className="text-2xl font-bold text-green-700">{(inventoryReport?.totalValue ?? 0).toLocaleString()} EGP</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Low Stock Items</div>
                {inventoryLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                  <div className={`text-2xl font-bold ${(inventoryReport?.lowStockItems ?? 0) > 0 ? 'text-destructive' : ''}`}>
                    {inventoryReport?.lowStockItems ?? 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Inventory by Category</CardTitle></CardHeader>
            <CardContent>
              {inventoryLoading ? <Skeleton className="h-64 w-full" /> : (
                <ResponsiveContainer width="100%" height={300}>
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
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} EGP`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
