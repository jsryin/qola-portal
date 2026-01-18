import { ReactNode } from 'react';

// 使用 nodejs runtime 以支持数据库连接
export const runtime = 'nodejs';

// 允许所有 language 参数动态处理
export const dynamicParams = true;

export default function LanguageLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
