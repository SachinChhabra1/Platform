import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif" });

export const metadata: Metadata = {
  title: "Nia — Intelligence for Better Working Lives",
  description: "Nia is the invisible AI layer coordinating living, essentials, and work so people can save more, earn more, and belong more.",
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
