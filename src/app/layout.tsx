import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import SessionManager from "@/components/SessionManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "Coindexy - Professional Crypto Trading Platform";
const siteDescription =
  "Trade cryptocurrencies with confidence on Coindexy. Professional trading tools, secure wallet management, and real-time market data.";

export const metadata: Metadata = {
  metadataBase: new URL("https://coindexy.com"),
  title: siteTitle,
  description: siteDescription,
  applicationName: "Coindexy",
  openGraph: {
    type: "website",
    url: "https://coindexy.com",
    siteName: "Coindexy",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SessionManager />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
