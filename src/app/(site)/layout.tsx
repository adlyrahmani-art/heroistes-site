import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";
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

// draftMode() est dynamique : isolé dans Suspense pour garder la coquille statique.
async function DraftTools() {
  return (await draftMode()).isEnabled ? <VisualEditing /> : null;
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SmoothScroll>{children}</SmoothScroll>
      <Cursor />
      <SanityLive />
      <Suspense>
        <DraftTools />
      </Suspense>
    </>
  );
}
