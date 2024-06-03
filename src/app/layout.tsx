import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Herd Mentality",
  description: `
Discover the fun and engaging online board game, Herd Mentality!
Perfect for family game nights or virtual gatherings with friends, Herd Mentality challenges players with a series of randomly generated questions.
The goal? Think like the majority! Players must guess what the majority will answer to score points.
Simple, interactive, and endlessly entertaining, Herd Mentality is the ideal game for those who love to strategize and connect with others.
Dive into the excitement and see if you can match your answers with the herd. Join the fun and test your herd mentality today!
`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
