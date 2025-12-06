import { Toaster } from "@/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "R2 Bucket Manager",
  description: "Manage objects from your R2 buckets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
