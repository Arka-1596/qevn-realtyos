import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "Qevn / RealtyOS",
    template: "%s | Qevn RealtyOS",
  },
  description:
    "An intelligent real estate operating system. Frontend foundation preview for a technical assessment.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-lime focus:px-4 focus:py-3 focus:text-brand-ink"
        >
          Skip to main content
        </a>

        {children}
      </body>
    </html>
  );
}