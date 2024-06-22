import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react"
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Party Paper Pen",
  description: `
Discover the ultimate collection of party games that transform any gathering into a memorable event filled with fun, laughter, and engaging conversations.
Our easy-to-play games require only paper and pen, making them perfect for spontaneous entertainment.
Whether you're breaking the ice or seeking to deepen connections, our party games are designed to create unforgettable moments.
Explore our one-stop shop for party games and elevate your next celebration with endless joy and excitement!
`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
