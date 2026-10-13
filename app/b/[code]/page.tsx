import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { decodeBouquet } from "@/lib/codec";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const data = decodeBouquet(code);
  if (!data) return { title: "SendBloom" };

  const title = data.to ? `May padala para kay ${data.to} 💐` : "May padala para sa iyo 💐";
  const description = data.from
    ? `Mula kay ${data.from}. Buksan para bumukadkad ang bulaklak!`
    : "Buksan para bumukadkad ang bulaklak!";

  return {
    title,
    description,
    openGraph: { title, description, siteName: "SendBloom", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export default async function BouquetPage({ params, searchParams }: Props) {
  const { code } = await params;
  const { preview } = await searchParams;
  const data = decodeBouquet(code);
  if (!data) notFound();
  return <Reveal data={data} preview={preview === "1"} />;
}
