import { CmsHelper } from "@/lib/cms-helper";
import ClientPortal from "./ClientPortal";
import PuckRenderer from "./components/PuckRenderer";
import { notFound } from "next/navigation";

interface PageParams {
  country: string;
  language: string;
}

/**
 * 处理根路径 /[country]/[language]
 * 默认为首页 (slug: home)
 */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { country, language } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";
  const slug = "home";

  // 1. 尝试加载 Puck 内容
  try {
    // 如果是预览模式，优先尝试加载草稿
    if (isPreview) {
      const draftContent = await CmsHelper.getDraftContent(slug, country);
      if (draftContent) {
        return <PuckRenderer data={draftContent} language={language} />;
      }
    }

    // 尝试加载已发布内容
    const publishedContent = await CmsHelper.getPublishedContent(slug, country);
    if (publishedContent) {
      return <PuckRenderer data={publishedContent} language={language} />;
    }
  } catch (error) {
    console.error(`加载 Puck 页面失败: ${slug} (${country})`, error);
  }

  // 3. 如果没有任何 Puck 内容（或者不是预览模式且未发布），渲染原有的静态 ClientPortal (首页)
  return <ClientPortal country={country} language={language} />;
}
