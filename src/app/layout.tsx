import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import NavigationFavicon from "./components/NavigationFavicon";
import Providers from "./components/Providers";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Partyz",
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
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className={`${inter.className} button`}>
        <Providers>
          <NextTopLoader />
          <NavigationFavicon />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
