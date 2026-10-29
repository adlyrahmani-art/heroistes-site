import type { Metadata, Viewport } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import "../globals.css";

export const metadata: Metadata = {
  title: "Agence marketing B2B orientée résultats | Héroïstes",
  description:
    "Agence marketing B2B à 360 degrés, Héroïstes réunit conseil, ventes, marque et acquisition, et suit chaque action jusqu’au lead.",
};

export const viewport: Viewport = {
  themeColor: "#0E0E0E",
  viewportFit: "cover",
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SmoothScroll>{children}</SmoothScroll>
      <Cursor />
    </>
  );
}
