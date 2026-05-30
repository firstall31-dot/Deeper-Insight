export const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      inventory: "Inventory",
      devices: "Devices",
      sales: "Sales",
      customers: "Customers",
      suppliers: "Suppliers",
      maintenance: "Maintenance",
      software: "Software",
      installments: "Installments",
      expenses: "Expenses",
      employees: "Employees",
      wallets: "Wallets",
      banks: "Banks",
      fawry: "Fawry",
      reports: "Reports",
      treasury: "Treasury",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add New",
      search: "Search...",
      loading: "Loading...",
      actions: "Actions",
      status: "Status",
    },
    dashboard: {
      dailySales: "Daily Sales",
      monthlySales: "Monthly Sales",
      totalProfit: "Total Profit",
      totalExpenses: "Total Expenses",
      alerts: "Alerts",
      recentSales: "Recent Sales",
    },
  },
  ar: {
    nav: {
      dashboard: "لوحة القيادة",
      inventory: "المخزون",
      devices: "الأجهزة",
      sales: "المبيعات",
      customers: "العملاء",
      suppliers: "الموردين",
      maintenance: "الصيانة",
      software: "السوفت وير",
      installments: "التقسيط",
      expenses: "المصروفات",
      employees: "الموظفين",
      wallets: "المحافظ",
      banks: "البنوك",
      fawry: "فوري",
      reports: "التقارير",
      treasury: "الخزينة",
    },
    common: {
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      add: "إضافة جديد",
      search: "بحث...",
      loading: "جاري التحميل...",
      actions: "إجراءات",
      status: "الحالة",
    },
    dashboard: {
      dailySales: "مبيعات اليوم",
      monthlySales: "مبيعات الشهر",
      totalProfit: "إجمالي الربح",
      totalExpenses: "إجمالي المصروفات",
      alerts: "تنبيهات",
      recentSales: "أحدث المبيعات",
    },
  },
};

export type Language = "en" | "ar";
export type TranslationKey = string;

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split(".");
  let current: Record<string, unknown> = translations[lang];
  for (const k of keys) {
    if (current[k] === undefined) {
      let fallback: Record<string, unknown> = translations["en"];
      for (const fk of keys) {
        if (fallback[fk] === undefined) return key;
        fallback = fallback[fk] as Record<string, unknown>;
      }
      return fallback as unknown as string;
    }
    current = current[k] as Record<string, unknown>;
  }
  return current as unknown as string;
}
