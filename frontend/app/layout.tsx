import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedFault AI - Medical Device Intelligence",
  description: "Predictive Fault Detection in Medical Devices Using Sensor Data and Deep Learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
