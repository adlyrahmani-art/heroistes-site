import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Gloock, Onest, Space_Mono } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import "./globals.css";

const gloock = Gloock({ variable: "--font-gloock", subsets: ["latin"], weight: "400" });
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin"], weight: "400" });
const onest = Onest({ variable: "--font-onest", subsets: ["latin"], weight: ["300", "400", "700", "900"] });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Agence marketing B2B orientée résultats | Héroïstes",
  description:
    "Agence marketing B2B à 360 degrés, Héroïstes réunit conseil, ventes, marque et acquisition, et suit chaque action jusqu’au lead.",
};

export const viewport: Viewport = {
  themeColor: "#0E0E0E",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${gloock.variable} ${dmSerif.variable} ${onest.variable} ${spaceMono.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}
