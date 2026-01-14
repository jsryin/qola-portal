import { ReactNode } from 'react';

export function generateStaticParams() {
  return [
    { locale: "en-glo" },
    { locale: "en-my" },
    { locale: "zh-my" },
    { locale: "en-ae" },
  ];
}

export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
