import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Baloo_2, Monoton, Abril_Fatface } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "./components/Sidebar";

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const baloo2 = Baloo_2({
  subsets: ['latin'],
  variable: '--font-heading',
});

const abrilFatface = Abril_Fatface({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-tagline',
});

const monoton = Monoton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-brand',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Medisync",
  description: "Your medical vault",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "dark",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        jetbrainsMono.variable,
        baloo2.variable,
        abrilFatface.variable,
        monoton.variable,
        "font-mono"
      )}
    >
      <body className="min-h-full flex bg-background">
        <Sidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </body>
    </html>
  );
}