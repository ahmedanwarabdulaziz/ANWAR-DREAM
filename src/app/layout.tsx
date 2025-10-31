import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rewards App",
  description: "Unlock rewards. Redeem in seconds.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rewards App",
  },
  icons: {
    apple: "/icons/icon.svg",
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Rewards App",
    description: "Unlock rewards. Redeem in seconds.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Rewards App",
    description: "Unlock rewards. Redeem in seconds.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rewards App" />
        <link rel="icon" href="/icons/icon.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <MotionProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </MotionProvider>
      </body>
    </html>
  );
}
