import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Donate | St. Michael's Community Church",
  description: "Support our church community and outreach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
