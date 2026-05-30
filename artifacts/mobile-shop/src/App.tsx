import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Devices from "@/pages/devices";
import Sales from "@/pages/sales";
import Customers from "@/pages/customers";
import Suppliers from "@/pages/suppliers";
import Maintenance from "@/pages/maintenance";
import Software from "@/pages/software";
import Installments from "@/pages/installments";
import Expenses from "@/pages/expenses";
import Employees from "@/pages/employees";
import Wallets from "@/pages/wallets";
import Banks from "@/pages/banks";
import Fawry from "@/pages/fawry";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/devices" component={Devices} />
        <Route path="/sales" component={Sales} />
        <Route path="/customers" component={Customers} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/maintenance" component={Maintenance} />
        <Route path="/software" component={Software} />
        <Route path="/installments" component={Installments} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/employees" component={Employees} />
        <Route path="/wallets" component={Wallets} />
        <Route path="/banks" component={Banks} />
        <Route path="/fawry" component={Fawry} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
