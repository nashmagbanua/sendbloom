import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: "SendBloom — Magpadala ng digital bouquet",
  description:
    "Gumawa ng sarili mong digital bouquet, lagyan ng mensahe, at ipadala sa Messenger. Libreng bulaklak na hindi nalalanta.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon",
  },
  openGraph: {
    title: "SendBloom — Magpadala ng digital bouquet",
    description: "Gumawa ng bouquet, lagyan ng mensahe, at ipadala sa Messenger. Libre!",
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
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
