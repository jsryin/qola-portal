import ClientPortal from "./[country]/[language]/ClientPortal";

export const runtime = 'edge';

export default function Home() {
  // 首页默认使用 gb（英国）和 en（英语）
  return <ClientPortal country="glo" language="en" />;
}
