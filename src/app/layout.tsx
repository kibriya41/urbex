import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "urbex — discover hidden places",
  description:
    "A crowd-sourced catalog of abandoned buildings, forgotten ruins, rooftop viewpoints, and hidden urban gems. Find, wishlist, and review hidden spots near you.",
  keywords: [
    "urban exploration",
    "abandoned buildings",
    "hidden spots",
    "urbex",
    "ruins",
    "viewpoints",
  ],
  openGraph: {
    title: "urbex — discover hidden places",
    description:
      "A crowd-sourced catalog of abandoned buildings, forgotten ruins, and hidden urban gems.",
    type: "website",
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
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}
