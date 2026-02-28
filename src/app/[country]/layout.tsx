import { ReactNode } from 'react';
import { COUNTRY_LANGUAGES, DEFAULT_COUNTRY } from '@/config/locales';

export const dynamicParams = false;

export function generateStaticParams() {
  const countries = new Set<string>(Object.keys(COUNTRY_LANGUAGES));
  countries.add(DEFAULT_COUNTRY);

  return Array.from(countries).map((country) => ({ country }));
}

export default function CountryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
