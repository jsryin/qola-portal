import { CmsHelper } from "@/lib/cms-helper";
import ClientPortal from "@/app/[country]/[language]/ClientPortal";
import PuckRenderer from "@/app/[country]/[language]/components/PuckRenderer";
import { notFound } from "next/navigation";

interface PageParams {
    country: string;
    language: string;
    puckPath?: string[];
}

/**
 * 通用页面渲染逻辑
 * 处理 /[country]/[language]/[...puckPath]
 */
export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<PageParams>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { country, language, puckPath } = await params;
    const { preview } = await searchParams;
    const isPreview = preview === "true";

    // 构建 slug。如果 puckPath 为空（虽然在 [...puckPath] 目录下不太可能，除非是 optional catch-all），则为 home
    const slug = puckPath && puckPath.length > 0 ? puckPath.join("/") : "home";

    // 1. 优先尝试加载 Puck 生成的内容 (已发布版本)
    try {
        const publishedContent = await CmsHelper.getPublishedContent(slug, country);
        if (publishedContent) {
            return <PuckRenderer data={publishedContent} />;
        }

        // 2. 如果是预览模式，且没有发布内容，尝试加载草稿内容
        if (isPreview) {
            const draftContent = await CmsHelper.getDraftContent(slug, country);
            if (draftContent) {
                return <PuckRenderer data={draftContent} />;
            }
        }
    } catch (error) {
        console.error(`加载 Puck 页面预览失败: ${slug} (${country})`, error);
    }

    // 3. 如果没有 Puck 内容，且是 home 路径，渲染原有的 ClientPortal
    if (slug === "home") {
        return <ClientPortal country={country} language={language} />;
    }

    // 4. 否则返回 404
    notFound();
}
