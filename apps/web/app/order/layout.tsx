import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nia Essentials — Certified everyday essentials",
  description:
    "Explore Nia-Certified everyday essentials, compare prices with the local market, and continue securely with the mobile number registered in NiaBooks.",
};

export default function OrderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
