import type { Metadata } from "next";
import { Inter, Host_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
  weight: ["300", "500"],
});

const nerfos = localFont({
  src: "../public/fonts/Nerfos.otf",
  variable: "--font-nerfos",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loop.Talk — Conversas 1:1 com especialistas",
  description: "Monetize seu acesso. Transforme seguidores em clientes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${hostGrotesk.variable} ${nerfos.variable}`}>
        {children}
      </body>
    </html>
  );
}
