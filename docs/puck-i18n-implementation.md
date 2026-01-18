# Puck 多语言 CMS 页面实现方案

> 版本: 1.0  
> 创建时间: 2026-01-18  
> 状态: 待实现

## 目录

1. [概述](#概述)
2. [数据库设计](#数据库设计)
3. [Puck 编辑器改造](#puck-编辑器改造)
4. [API 改造](#api-改造)
5. [前端动态路由](#前端动态路由)
6. [语言切换器](#语言切换器)
7. [实现步骤](#实现步骤)

---

## 概述

### 目标

实现一个基于 Puck 可视化编辑器的多语言 CMS 系统，支持：

- ✅ 在 Puck 编辑器中为页面设置**国家代码**和**语言代码**
- ✅ 通过 `/{country}/{language}/{slug}` 路径访问发布的 CMS 页面
- ✅ 同一个 slug 可以有多个语言版本（如 `en/about`、`zh/about`）
- ✅ 前端用户可通过语言切换器在不同语言版本间切换

### 路由示例

```
编辑路径（后台）:
/admin/puck?slug=about&country=us&language=en

访问路径（前台）:
/us/en/about    → 美国英语版 About 页面
/cn/zh/about    → 中国中文版 About 页面
/jp/ja/about    → 日本日语版 About 页面
```

---

## 数据库设计

### 2.1 修改 `cms_page` 表

在现有表结构中添加 `country` 和 `language` 字段：

```sql
-- 文件: db/migrations/003_add_country_language_to_cms_page.sql

-- 添加国家代码字段
ALTER TABLE `cms_page` 
ADD COLUMN `country` VARCHAR(10) NOT NULL DEFAULT 'glo' COMMENT '国家代码(如: us, cn, jp, glo=global)' AFTER `slug`;

-- 添加语言代码字段
ALTER TABLE `cms_page` 
ADD COLUMN `language` VARCHAR(10) NOT NULL DEFAULT 'en' COMMENT '语言代码(如: en, zh, ja)' AFTER `country`;

-- 删除原有的唯一索引
ALTER TABLE `cms_page` DROP INDEX `uk_slug`;

-- 创建新的联合唯一索引（同一国家+语言下 slug 唯一）
ALTER TABLE `cms_page` 
ADD UNIQUE KEY `uk_country_language_slug` (`country`, `language`, `slug`);

-- 添加国家和语言的普通索引，便于筛选查询
ALTER TABLE `cms_page` 
ADD INDEX `idx_country` (`country`),
ADD INDEX `idx_language` (`language`);
```

### 2.2 更新后的表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| slug | VARCHAR(64) | 页面标识（如 `home`, `about`） |
| **country** | VARCHAR(10) | 国家代码（如 `us`, `cn`, `glo`） |
| **language** | VARCHAR(10) | 语言代码（如 `en`, `zh`） |
| title | VARCHAR(100) | 页面标题 |
| draft_content | JSON | 草稿 JSON 数据 |
| published_version_id | BIGINT | 发布版本 ID |
| ... | ... | 其他字段保持不变 |

### 2.3 国家和语言配置

创建配置文件 `src/config/locales.ts`：

```typescript
/**
 * 国家配置
 */
export const COUNTRIES = [
  { code: 'glo', name: 'Global', flag: '🌍' },
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'kr', name: 'Korea', flag: '🇰🇷' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
] as const;

/**
 * 语言配置
 */
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
] as const;

/**
 * 国家与支持语言的映射关系
 */
export const COUNTRY_LANGUAGES: Record<string, string[]> = {
  glo: ['en'],                    // Global 默认英语
  us: ['en'],                     // 美国
  cn: ['zh', 'en'],               // 中国：中文优先，支持英语
  jp: ['ja', 'en'],               // 日本
  kr: ['ko', 'en'],               // 韩国
  de: ['de', 'en'],               // 德国
  fr: ['fr', 'en'],               // 法国
  uk: ['en'],                     // 英国
};

/**
 * 默认国家和语言
 */
export const DEFAULT_COUNTRY = 'glo';
export const DEFAULT_LANGUAGE = 'en';

/**
 * 获取国家支持的语言列表
 */
export function getSupportedLanguages(countryCode: string) {
  const supportedCodes = COUNTRY_LANGUAGES[countryCode] || ['en'];
  return LANGUAGES.filter(lang => supportedCodes.includes(lang.code));
}
```

---

## Puck 编辑器改造

### 3.1 修改 Puck Config

文件: `src/lib/puck/config.tsx`

```tsx
import type { Config, Data } from "@puckeditor/core";
import type { ReactNode } from "react";
import { COUNTRIES, LANGUAGES } from "@/config/locales";

export const puckConfig: Config = {
  // Root 字段配置（页面元数据）
  root: {
    fields: {
      title: { 
        type: "text", 
        label: "Title",
      },
      slug: { 
        type: "text", 
        label: "Slug *",
      },
      // 新增：国家选择器
      country: {
        type: "select",
        label: "Country *",
        options: COUNTRIES.map(c => ({
          label: `${c.flag} ${c.name} (${c.code})`,
          value: c.code,
        })),
      },
      // 新增：语言选择器
      language: {
        type: "select",
        label: "Language *",
        options: LANGUAGES.map(l => ({
          label: `${l.nativeName} (${l.code})`,
          value: l.code,
        })),
      },
      // 新增：SEO 描述（可选）
      description: {
        type: "textarea",
        label: "SEO Description",
      },
    },
    defaultProps: {
      title: "",
      slug: "",
      country: "glo",
      language: "en",
      description: "",
    },
    render: ({ children }: { children: ReactNode }) => {
      return <>{children}</>;
    },
  },
  
  components: {
    // ... 现有组件保持不变
  },
};

/**
 * 初始数据
 */
export const initialData = {
  root: {
    props: {
      title: "",
      slug: "",
      country: "glo",
      language: "en",
      description: "",
    },
  },
  content: [],
  zones: {},
} as Data;
```

### 3.2 修改 PuckEditor 组件

文件: `src/app/admin/puck/components/PuckEditor.tsx`

**主要改动：**

1. URL 参数增加 `country` 和 `language`
2. 加载草稿时传递三个参数
3. 保存/发布时提交国家和语言

```tsx
"use client";

import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "../puck.css";
import { puckConfig, initialData } from "@/lib/puck";
import { useCallback, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { CmsPageVersion } from "@/models";
import { DEFAULT_COUNTRY, DEFAULT_LANGUAGE } from "@/config/locales";

export default function PuckEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // 从 URL 获取参数
  const slug = searchParams.get("slug") || "home";
  const country = searchParams.get("country") || DEFAULT_COUNTRY;
  const language = searchParams.get("language") || DEFAULT_LANGUAGE;
  
  const [data, setData] = useState<Data>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  // ... 其他状态

  const { showToast } = useToast();

  // 加载草稿内容
  useEffect(() => {
    const loadDraft = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/cms/load-draft?slug=${slug}&country=${country}&language=${language}`
        );
        const result = await response.json();

        if (result.success && result.content) {
          setData(result.content);
        } else {
          // 如果没有草稿，使用初始数据，并注入当前参数
          const newInitialData = {
            ...initialData,
            root: {
              ...initialData.root,
              props: {
                ...initialData.root.props,
                slug,
                country,
                language,
              },
            },
          };
          setData(newInitialData);
        }
      } catch (error) {
        console.error("加载草稿失败:", error);
        showToast("加载草稿失败，使用初始数据", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [slug, country, language, showToast]);

  // 保存草稿回调
  const handleSave = useCallback(async () => {
    if (isSaving) return;

    // 从 data 中获取最新的 country/language/slug
    const currentProps = data.root?.props || {};
    const currentCountry = currentProps.country || country;
    const currentLanguage = currentProps.language || language;
    const currentSlug = currentProps.slug || slug;

    try {
      setIsSaving(true);
      const response = await fetch("/api/cms/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: currentSlug,
          country: currentCountry,
          language: currentLanguage,
          content: data,
          userId: "admin",
          // 原始参数，用于查找已有记录
          originalSlug: slug,
          originalCountry: country,
          originalLanguage: language,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("草稿保存成功！", "success");
        
        // 如果参数发生了变化，更新 URL
        if (
          result.slug !== slug ||
          result.country !== country ||
          result.language !== language
        ) {
          const params = new URLSearchParams();
          params.set("slug", result.slug);
          params.set("country", result.country);
          params.set("language", result.language);
          router.push(`${pathname}?${params.toString()}`);
        }
      } else {
        throw new Error(result.error || "保存失败");
      }
    } catch (error) {
      console.error("保存草稿失败:", error);
      showToast(`保存失败: ${error instanceof Error ? error.message : "未知错误"}`, "error");
    } finally {
      setIsSaving(false);
    }
  }, [data, slug, country, language, isSaving, router, pathname, showToast]);

  // 发布回调 - 类似改造
  const handlePublish = useCallback(async (publishData: Data) => {
    // ... 类似 handleSave 的改造
  }, [slug, country, language, isPublishing, router, pathname, searchParams, showToast]);

  // 预览回调
  const handlePreview = useCallback(() => {
    const currentProps = data.root?.props || {};
    const previewUrl = `/${currentProps.country || country}/${currentProps.language || language}/${currentProps.slug || slug}`;
    window.open(previewUrl, "_blank");
  }, [data, country, language, slug]);

  // ... 其余代码保持不变
}
```

---

## API 改造

### 4.1 更新 CmsPage 模型

文件: `src/models/cms-page.ts`

```typescript
export interface CmsPage {
  id?: number;
  slug: string;
  country: string;      // 新增
  language: string;     // 新增
  title: string;
  draft_content?: Record<string, unknown> | string | null;
  published_version_id?: number | null;
  published_time?: Date | null;
  version_counter?: number;
  is_deleted?: number;
  created_by?: string | null;
  updated_by?: string | null;
  created_time?: Date;
  updated_time?: Date;
}
```

### 4.2 修改 load-draft API

文件: `src/app/api/cms/load-draft/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CmsHelper } from '@/lib/cms-helper';
import { cmsPageRepository } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const country = searchParams.get('country') || 'glo';
    const language = searchParams.get('language') || 'en';

    if (!slug) {
      return NextResponse.json(
        { error: '页面标识不能为空' },
        { status: 400 }
      );
    }

    // 按 country + language + slug 联合查询
    const page = await cmsPageRepository.findOne({ 
      slug,
      country,
      language,
      is_deleted: 0,
    });

    if (!page) {
      // 页面不存在，返回空内容（编辑器使用初始数据）
      return NextResponse.json({
        success: true,
        content: null,
        pageInfo: null,
        isNew: true,
      });
    }

    // 加载草稿内容
    const content = await CmsHelper.getDraftContent(slug, country, language);

    // 注入页面元数据
    if (content) {
      if (!content.root) content.root = { props: {} };
      if (!content.root.props) content.root.props = {};
      content.root.props.title = page.title || '';
      content.root.props.slug = page.slug || '';
      content.root.props.country = page.country || 'glo';
      content.root.props.language = page.language || 'en';
    }

    return NextResponse.json({
      success: true,
      content,
      pageInfo: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        country: page.country,
        language: page.language,
      },
    });
  } catch (error) {
    console.error('加载草稿失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '加载草稿失败', success: false },
      { status: 500 }
    );
  }
}
```

### 4.3 修改 save-draft API

文件: `src/app/api/cms/save-draft/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CmsHelper } from '@/lib/cms-helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      slug, 
      country = 'glo', 
      language = 'en', 
      content, 
      userId,
      // 原始参数（用于查找现有记录进行更新）
      originalSlug,
      originalCountry,
      originalLanguage,
    } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: '页面标识不能为空' }, { status: 400 });
    }

    // Slug 格式验证
    const slugRegex = /^[a-z][a-z0-9-]*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug 格式错误：只能以小写字母开头，包含小写字母、数字和横杠' },
        { status: 400 }
      );
    }

    // 从 content 中提取 title
    const title = content?.root?.props?.title || slug;

    // 保存草稿
    await CmsHelper.saveDraft({
      slug,
      country,
      language,
      content,
      userId,
      title,
      // 用于更新场景
      originalSlug: originalSlug || slug,
      originalCountry: originalCountry || country,
      originalLanguage: originalLanguage || language,
    });

    return NextResponse.json({
      success: true,
      message: '草稿保存成功',
      slug,
      country,
      language,
    });
  } catch (error) {
    console.error('保存草稿失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '保存草稿失败', success: false },
      { status: 500 }
    );
  }
}
```

### 4.4 修改 CmsHelper

文件: `src/lib/cms-helper.ts`（部分方法）

```typescript
/**
 * 保存草稿（支持多语言）
 */
static async saveDraft(params: {
  slug: string;
  country: string;
  language: string;
  content: PuckData;
  userId?: string;
  title?: string;
  originalSlug?: string;
  originalCountry?: string;
  originalLanguage?: string;
}): Promise<void> {
  const { 
    slug, country, language, content, userId, title,
    originalSlug, originalCountry, originalLanguage 
  } = params;

  // 查找原有页面
  const page = await cmsPageRepository.findOne({ 
    slug: originalSlug || slug,
    country: originalCountry || country,
    language: originalLanguage || language,
    is_deleted: 0,
  });
  
  if (!page) {
    // 检查目标 slug+country+language 是否已存在
    const existingPage = await cmsPageRepository.findOne({ slug, country, language, is_deleted: 0 });
    if (existingPage) {
      throw new Error(`该国家/语言下已存在相同的 Slug: ${country}/${language}/${slug}`);
    }

    // 创建新页面
    await cmsPageRepository.create({
      slug,
      country,
      language,
      title: title || slug,
      draft_content: JSON.stringify(content),
      created_by: userId,
      updated_by: userId,
      version_counter: 1,
      is_deleted: 0,
    });
    return;
  }

  // 更新现有页面
  const updateData: Partial<CmsPage> = {
    draft_content: JSON.stringify(content),
    updated_by: userId,
    updated_time: new Date(),
  };

  if (title !== undefined) updateData.title = title;

  // 检查是否需要更新 slug/country/language
  if (slug !== originalSlug || country !== originalCountry || language !== originalLanguage) {
    const existingPage = await cmsPageRepository.findOne({ slug, country, language, is_deleted: 0 });
    if (existingPage && existingPage.id !== page.id) {
      throw new Error(`该国家/语言下已存在相同的 Slug: ${country}/${language}/${slug}`);
    }
    updateData.slug = slug;
    updateData.country = country;
    updateData.language = language;
  }

  await cmsPageRepository.update({ id: page.id }, updateData);
}

/**
 * 获取草稿内容（支持多语言）
 */
static async getDraftContent(
  slug: string,
  country: string = 'glo',
  language: string = 'en'
): Promise<PuckData | null> {
  const page = await cmsPageRepository.findOne({ 
    slug,
    country,
    language,
    is_deleted: 0,
  });
  
  if (!page || !page.draft_content) {
    return null;
  }

  if (typeof page.draft_content === 'string') {
    try {
      return JSON.parse(page.draft_content) as PuckData;
    } catch (e) {
      console.error('Failed to parse draft content:', e);
      return null;
    }
  }

  return page.draft_content as PuckData;
}

/**
 * 获取已发布内容（支持多语言）
 */
static async getPublishedContent(
  slug: string,
  country: string = 'glo',
  language: string = 'en'
): Promise<PuckData | null> {
  const page = await cmsPageRepository.findOne({ 
    slug,
    country,
    language,
    is_deleted: 0,
  });
  
  if (!page || !page.published_version_id) {
    return null;
  }

  const version = await cmsPageVersionRepository.findOne({
    id: page.published_version_id,
    is_deleted: 0,
  });

  if (!version || !version.content) {
    return null;
  }

  if (typeof version.content === 'string') {
    try {
      return JSON.parse(version.content) as PuckData;
    } catch (e) {
      console.error('Failed to parse published content:', e);
      return null;
    }
  }

  return version.content as PuckData;
}
```

---

## 前端动态路由

### 5.1 创建动态页面

文件: `src/app/[country]/[language]/[slug]/page.tsx`

```tsx
import { use } from "react";
import { notFound } from "next/navigation";
import { Render } from "@puckeditor/core";
import { puckConfig } from "@/lib/puck";
import { CmsHelper } from "@/lib/cms-helper";

// Edge Runtime 兼容 Cloudflare
export const runtime = 'edge';
export const dynamicParams = true;

interface PageParams {
  country: string;
  language: string;
  slug: string;
}

export default function CmsPage({ params }: { params: Promise<PageParams> }) {
  const { country, language, slug } = use(params);
  
  // 获取发布的页面内容
  const content = use(fetchContent(country, language, slug));
  
  if (!content) {
    notFound();
  }

  return (
    <div className="cms-page">
      <Render config={puckConfig} data={content} />
    </div>
  );
}

async function fetchContent(country: string, language: string, slug: string) {
  try {
    return await CmsHelper.getPublishedContent(slug, country, language);
  } catch (error) {
    console.error('Failed to fetch CMS content:', error);
    return null;
  }
}

/**
 * 生成页面元数据（SEO）
 */
export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
  const { country, language, slug } = await params;
  const content = await CmsHelper.getPublishedContent(slug, country, language);
  
  if (!content) {
    return { title: 'Page Not Found' };
  }

  const props = content.root?.props || {};
  
  return {
    title: props.title || slug,
    description: props.description || '',
  };
}
```

### 5.2 创建 404 页面

文件: `src/app/[country]/[language]/[slug]/not-found.tsx`

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Page not found</p>
        <Link 
          href="/"
          className="px-6 py-3 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
```

---

## 语言切换器

### 6.1 创建语言切换组件

文件: `src/components/LanguageSwitcher.tsx`

```tsx
"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { LANGUAGES, getSupportedLanguages } from "@/config/locales";

export default function LanguageSwitcher() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentCountry = (params.country as string) || 'glo';
  const currentLanguage = (params.language as string) || 'en';
  
  // 获取当前国家支持的语言
  const supportedLanguages = getSupportedLanguages(currentCountry);
  
  const handleLanguageChange = (newLanguage: string) => {
    // 替换路径中的语言部分
    const pathParts = pathname.split('/');
    // 假设路径格式为 /country/language/...
    if (pathParts.length >= 3) {
      pathParts[2] = newLanguage;
      router.push(pathParts.join('/'));
    }
  };

  return (
    <div className="language-switcher flex gap-2">
      {supportedLanguages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`
            px-3 py-1 rounded text-sm transition
            ${currentLanguage === lang.code
              ? 'bg-amber-500 text-black font-bold'
              : 'bg-stone-700 text-white hover:bg-stone-600'
            }
          `}
        >
          {lang.nativeName}
        </button>
      ))}
    </div>
  );
}
```

### 6.2 在 Header 中使用

```tsx
// src/app/[country]/[language]/components/PortalHeader.tsx

import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function PortalHeader() {
  return (
    <header className="...">
      {/* 其他内容 */}
      
      <div className="header-actions">
        <LanguageSwitcher />
      </div>
    </header>
  );
}
```

---

## 实现步骤

### Phase 1: 数据库准备 ⏱️ 0.5 天

- [ ] 创建迁移文件 `003_add_country_language_to_cms_page.sql`
- [ ] 执行数据库迁移
- [ ] 更新 `CmsPage` 接口定义

### Phase 2: 配置文件 ⏱️ 0.5 天

- [ ] 创建 `src/config/locales.ts` 国家/语言配置

### Phase 3: Puck 编辑器改造 ⏱️ 1 天

- [ ] 修改 `puckConfig` 添加 country/language 字段
- [ ] 修改 `PuckEditor.tsx` 处理新参数
- [ ] 修改 URL 参数传递逻辑

### Phase 4: API 改造 ⏱️ 1 天

- [ ] 修改 `/api/cms/load-draft` API
- [ ] 修改 `/api/cms/save-draft` API
- [ ] 修改 `/api/cms/publish` API
- [ ] 修改 `CmsHelper` 类的相关方法

### Phase 5: 前端路由 ⏱️ 0.5 天

- [ ] 创建 `[slug]/page.tsx` 动态路由
- [ ] 创建 `not-found.tsx` 404 页面
- [ ] 测试不同路径的页面渲染

### Phase 6: 语言切换器 ⏱️ 0.5 天

- [ ] 创建 `LanguageSwitcher` 组件
- [ ] 集成到 `PortalHeader`
- [ ] 测试语言切换功能

### Phase 7: 测试与优化 ⏱️ 1 天

- [ ] 端到端测试
- [ ] 边界情况处理
- [ ] 性能优化

---

## 附录

### A. 页面管理后台（可选扩展）

后续可以创建一个页面管理列表 `/admin/pages`，展示所有 CMS 页面：

- 按国家/语言筛选
- 显示发布状态
- 快捷操作（编辑、发布、删除）

### B. 内容复制功能（可选扩展）

支持将一个语言版本的页面内容复制到另一个语言：

```typescript
async function copyPageToLanguage(
  fromCountry: string,
  fromLanguage: string, 
  slug: string,
  toCountry: string,
  toLanguage: string
) {
  // 实现内容复制逻辑
}
```

### C. 预览增强

支持在编辑器中直接预览不同语言版本的效果。

---

## 变更日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0 | 2026-01-18 | 初始方案文档 |
