import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: "SendBloom — Magpadala ng digital bouquet",
  description:
    "Gumawa ng sarili mong digital bouquet, lagyan ng mensahe, at ipadala sa Messenger. Libre at isang tap lang para bumukadkad.",
  openGraph: {
    title: "SendBloom — Magpadala ng digital bouquet",
    description: "Gumawa ng bouquet, lagyan ng mensahe, at ipadala. Libre!",
    siteName: "SendBloom",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff3ee",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tl">
      <body>{children}</body>
    </html>
  );
}
