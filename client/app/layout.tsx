import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Multi Player tic-tac-toe",
  description: "Play Tic-Tac-Toe with your friends",
  openGraph: {
    url: "https://tic-tac-toe-mu-blue.vercel.app/",
    title: "Multi Player tic-tac-toe",
    description: "Play Tic-Tac-Toe with your friends",
    type: "website",
    siteName: "Multi Player tic-tac-toe",
  },
  keywords: "tic-tac-toe,tic, tac, toe, multiplayer, multiplayer",
  other: {
    "dscvr:canvas:version": "vNext",
  },
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
