import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { VisitsPanel } from "@/components/admin/visits-panel";

export const metadata: Metadata = {
  title: "Visitas",
};

export const dynamic = "force-dynamic";

export default function VisitsPage() {
  return (
    <div>
      <PageHeader
        title="Visitas"
        description="Monitoramento de acesso às páginas públicas: visitas, origem e tempo de permanência."
      />
      <VisitsPanel />
    </div>
  );
}
