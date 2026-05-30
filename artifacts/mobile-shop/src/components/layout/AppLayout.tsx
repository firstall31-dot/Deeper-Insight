import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Package,
  Smartphone,
  ShoppingCart,
  Users,
  Truck,
  Wrench,
  DownloadCloud,
  CreditCard,
  Receipt,
  UserCircle,
  Wallet,
  Building2,
  Phone,
  BarChart3,
  Globe,
  Landmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, language, setLanguage } = useLanguage();
  const [location] = useLocation();

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'nav.dashboard' },
    { href: '/inventory', icon: Package, label: 'nav.inventory' },
    { href: '/devices', icon: Smartphone, label: 'nav.devices' },
    { href: '/sales', icon: ShoppingCart, label: 'nav.sales' },
    { href: '/customers', icon: Users, label: 'nav.customers' },
    { href: '/suppliers', icon: Truck, label: 'nav.suppliers' },
    { href: '/maintenance', icon: Wrench, label: 'nav.maintenance' },
    { href: '/software', icon: DownloadCloud, label: 'nav.software' },
    { href: '/installments', icon: CreditCard, label: 'nav.installments' },
    { href: '/expenses', icon: Receipt, label: 'nav.expenses' },
    { href: '/employees', icon: UserCircle, label: 'nav.employees' },
    { href: '/treasury', icon: Landmark, label: 'nav.treasury' },
    { href: '/wallets', icon: Wallet, label: 'nav.wallets' },
    { href: '/banks', icon: Building2, label: 'nav.banks' },
    { href: '/fawry', icon: Phone, label: 'nav.fawry' },
    { href: '/reports', icon: BarChart3, label: 'nav.reports' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold font-sans">MobileShop Pro</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <li key={item.href}>
                  <Link href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-primary-foreground/10 text-accent' : 'hover:bg-primary-foreground/5'}`}>
                    <Icon className="h-5 w-5" />
                    <span>{t(item.label)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-end px-6 shrink-0 shadow-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
