export type PlatformArea = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  recordRole: string;
  details: string[];
};

export const platformAreas: PlatformArea[] = [
  {
    slug: "membership",
    number: "01",
    title: "Membership",
    summary: "Identity, tenure and rights.",
    recordRole: "The foundation of the Member’s continuous record.",
    details: ["Identity", "Tenure", "Rights"],
  },
  {
    slug: "work",
    number: "02",
    title: "Work",
    summary: "Wages, attendance and deductions.",
    recordRole: "What work produced, written clearly to NiaBooks.",
    details: ["Wages", "Attendance", "Deductions"],
  },
  {
    slug: "living",
    number: "03",
    title: "Living",
    summary: "Nest, membership fee and Trip Home.",
    recordRole: "The living context that supports a working life.",
    details: ["Nest", "Membership fee", "Trip Home"],
  },
  {
    slug: "essentials",
    number: "04",
    title: "Essentials",
    summary: "Savings, remittance, insurance and credit.",
    recordRole: "Everyday services connected to what the Member keeps.",
    details: ["Savings", "Remittance", "Insurance", "Credit"],
  },
  {
    slug: "wallet",
    number: "05",
    title: "Wallet",
    summary: "Credit, debit, hold, release and reversal.",
    recordRole: "A clear account of how money moves.",
    details: ["Credit", "Debit", "Hold", "Release", "Reversal"],
  },
  {
    slug: "edge",
    number: "06",
    title: "Edge",
    summary: "Payroll, bank, UPI, SMS and e-KYC.",
    recordRole: "The connections that carry verified activity into NiaBooks.",
    details: ["Payroll", "Bank", "UPI", "SMS", "e-KYC"],
  },
];

export function getPlatformArea(slug: string) {
  return platformAreas.find((area) => area.slug === slug);
}
