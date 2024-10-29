import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CRUD TODO",
  description: "Developed by Nadim Chowdhury",
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
        {children}

        <p className="mt-4 mb-8 text-center font-medium">
          Developed by{" "}
          <Link
            href="https://nadim.vercel.app"
            className="text-blue-500 hover:text-blue-700 transition-all duration-300"
          >
            Nadim Chowdhury
          </Link>
        </p>
      </body>
    </html>
  );
}
