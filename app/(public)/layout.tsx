import { getActiveCategories } from "@/lib/data/public";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { UtmCapture } from "@/components/analytics/utm-capture";
import { VisitTracker } from "@/components/analytics/visit-tracker";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getActiveCategories();

  return (
    <div className="flex min-h-dvh flex-col">
      <UtmCapture />
      <VisitTracker />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </div>
  );
}
