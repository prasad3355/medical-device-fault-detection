import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
