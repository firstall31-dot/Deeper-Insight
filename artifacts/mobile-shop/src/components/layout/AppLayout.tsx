import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  LayoutDashboard, Package, Smartphone, ShoppingCart, Users, Truck,
  Wrench, DownloadCloud, CreditCard, Receipt, UserCircle, Wallet,
  Building2, Phone, BarChart3, Globe, Landmark, Menu, LogIn,
} from 'lucide-react';

const navItems = [
  { href: '/',             icon: LayoutDashboard, label: 'nav.dashboard' },
  { href: '/inventory',    icon: Package,         label: 'nav.inventory' },
  { href: '/devices',      icon: Smartphone,      label: 'nav.devices' },
  { href: '/sales',        icon: ShoppingCart,    label: 'nav.sales' },
  { href: '/customers',    icon: Users,           label: 'nav.customers' },
  { href: '/suppliers',    icon: Truck,           label: 'nav.suppliers' },
  { href: '/maintenance',  icon: Wrench,          label: 'nav.maintenance' },
  { href: '/software',     icon: DownloadCloud,   label: 'nav.software' },
  { href: '/installments', icon: CreditCard,      label: 'nav.installments' },
  { href: '/expenses',     icon: Receipt,         label: 'nav.expenses' },
  { href: '/employees',    icon: UserCircle,      label: 'nav.employees' },
  { href: '/treasury',     icon: Landmark,        label: 'nav.treasury' },
  { href: '/wallets',      icon: Wallet,          label: 'nav.wallets' },
  { href: '/banks',        icon: Building2,       label: 'nav.banks' },
  { href: '/fawry',        icon: Phone,           label: 'nav.fawry' },
  { href: '/reports',      icon: BarChart3,       label: 'nav.reports' },
];

function NavContent({ location, onClose, t }: {
  location: string;
  onClose?: () => void;
  t: (key: string) => string;
}) {
  return (
    <>
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 shadow-inner">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold leading-tight truncate">MobilShop Pro</h1>
            <p className="text-[11px] text-white/55 truncate">POS & Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-white/65 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`} />
                  <span className="truncate">{t(item.label)}</span>
                  {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, language, setLanguage } = useLanguage();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-sidebar text-sidebar-foreground flex-col shrink-0 border-r border-sidebar-border">
        <NavContent location={location} t={t} />
      </aside>

      {/* Mobile sidebar via Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side={language === 'ar' ? 'right' : 'left'}
          className="w-60 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border [&>button]:hidden"
        >
          <NavContent location={location} t={t} onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 border-b bg-card flex items-center gap-2 px-4 shrink-0 shadow-sm z-10">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 shrink-0"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0" />

          <div className="flex items-center gap-0.5">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="gap-1.5 h-9 px-2.5 text-sm"
            >
              <Globe className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{language === 'en' ? 'عربية' : 'English'}</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ms-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold tracking-wider">
                      MS
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold">Admin</p>
                    <p className="text-xs text-muted-foreground">MobilShop Pro</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <LogIn className="h-4 w-4" />
                  Sign in / Register
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content with page-transition animation */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="p-4 md:p-6 min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
