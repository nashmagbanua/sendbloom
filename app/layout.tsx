import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: "SendBloom — Magpadala ng digital bouquet",
  description:
    "Gumawa ng sarili mong digital bouquet, lagyan ng mensahe, at ipadala sa Messenger. Bulaklak na hindi nalalanta.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "SendBloom — Magpadala ng digital bouquet",
    description: "Gumawa ng bouquet, lagyan ng mensahe, at ipadala sa Messenger.",
    siteName: "SendBloom",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
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
