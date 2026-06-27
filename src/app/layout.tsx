import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import PwaClientWrapper from "@/components/PwaClientWrapper";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mizan — Personal Islamic Wealth Companion",
  description: "A personal financial companion designed around balance, accountability, and gratitude. Wealth is an Amanah (Trust).",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mizan",
  },
};

export const viewport: Viewport = {
  themeColor: "#8FAF9B",
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
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <head>
        {/* Dynamic Island Safe Area */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F7F9F7] font-sans selection:bg-[#8FAF9B]/20 selection:text-[#607567]">
        <PwaClientWrapper>
          {children}
        </PwaClientWrapper>
      </body>
    </html>
  );
}
