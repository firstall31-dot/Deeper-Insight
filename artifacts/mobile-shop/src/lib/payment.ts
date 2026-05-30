/**
 * Payment method display helpers — single source of truth.
 * Import from here; never define PAYMENT_LABELS / PAYMENT_COLORS locally.
 */

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash",
  vodafone_cash: "Vodafone Cash",
  etisalat_cash: "Etisalat Cash",
  we_pay: "WE Pay",
  instapay: "InstaPay",
  bank_transfer: "Bank Transfer",
};

export const PAYMENT_COLORS: Record<string, string> = {
  cash: "bg-green-100 text-green-800",
  vodafone_cash: "bg-red-100 text-red-800",
  etisalat_cash: "bg-orange-100 text-orange-800",
  we_pay: "bg-purple-100 text-purple-800",
  instapay: "bg-blue-100 text-blue-800",
  bank_transfer: "bg-gray-100 text-gray-800",
};

/** Returns the display label for a payment method code. */
export function paymentLabel(method: string): string {
  return PAYMENT_LABELS[method] ?? method;
}

/** Returns the Tailwind CSS classes for a payment method badge. */
export function paymentBadgeClass(method: string): string {
  return PAYMENT_COLORS[method] ?? "bg-gray-100 text-gray-800";
}
