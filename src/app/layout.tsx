import type { Metadata } from "next";
import { Syne, IBM_Plex_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

// Rockstart 3.0 type system: Syne (display) · IBM Plex Sans (body) · Geist Mono (labels).
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Amplify You · Amsterdam",
    template: "%s · Amplify You",
  },
  description:
    "Amplify You — where investors and founders amplify what's next. A 1.5-day event in Amsterdam opening with Invested Day and continuing with Amplify It tracks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${plexSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
