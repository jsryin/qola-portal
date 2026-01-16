import { use } from "react";
import ClientPortal from "./ClientPortal";

interface PageParams {
  country: string;
  language: string;
}

export default function Page({ params }: { params: Promise<PageParams> }) {
  // Await the params
  const { country, language } = use(params);

  return <ClientPortal country={country} language={language} />;
}
