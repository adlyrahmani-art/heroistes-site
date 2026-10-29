import { DM_Serif_Display, Gloock, Onest, Space_Mono } from "next/font/google";

const gloock = Gloock({ variable: "--font-gloock", subsets: ["latin"], weight: "400" });
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin"], weight: "400" });
const onest = Onest({ variable: "--font-onest", subsets: ["latin"], weight: ["300", "400", "700", "900"] });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: "400" });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${gloock.variable} ${dmSerif.variable} ${onest.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
