import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif" });

export const metadata: Metadata = {
  title: "NiaBooks — The Member's Continuous Record",
  description: "NiaBooks connects membership, work, living, essentials and wallet activity into one continuous record of what a Member earned, kept, saved and sent home.",
};

export const viewport: Viewport = {
  themeColor: "#061725",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
