import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif" });

export const metadata: Metadata = {
  title: "Workforce Infrastructure for India's Manufacturing Corridors | Nia",
  description: "Nia helps manufacturers retain migrant workers through managed living, work continuity, and daily essentials across India's industrial corridors.",
};

export const viewport: Viewport = {
  themeColor: "#16130f",
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
