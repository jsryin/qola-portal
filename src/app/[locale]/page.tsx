import { use } from "react";
import ClientPortal from "./ClientPortal";


export const runtime = "edge";
export const dynamicParams = false;
export const dynamic = "force-static";

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  // Await the params
  const { locale } = use(params);

  return <ClientPortal locale={locale} />;
}
