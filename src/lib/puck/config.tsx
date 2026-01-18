import type { Config, Data } from "@puckeditor/core";
import type { ReactNode } from "react";
import { COUNTRIES, LANGUAGES, DEFAULT_LANGUAGE } from "@/config/locales";
import { MultiLanguageInput } from "@/app/admin/puck/components/fields/MultiLanguageInput";

/**
 * 获取多语言文本的辅助函数
 */
const getI18nValue = (value: any, language?: string) => {
  if (!value) return "";

  let currentLanguage = language;

  // 如果没有显式指定语言，尝试从各种环境获取
  if (!currentLanguage) {
    if (typeof window !== "undefined") {
      // 1. 优先尝试从路径获取 (格式: /[country]/[language]/)
      const pathParts = window.location.pathname.split('/');
      // 注意：pathParts[0] 是空字符串
      if (pathParts.length >= 3 && LANGUAGES.some(l => l.code === pathParts[2])) {
        currentLanguage = pathParts[2];
      } else {
        // 2. 尝试从查询参数获取
        const params = new URLSearchParams(window.location.search);
        currentLanguage = params.get("language") || undefined;
      }
    }
  }

  const lang = currentLanguage || DEFAULT_LANGUAGE;

  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    // 确保我们不返回整个对象
    const localized = value[lang] || value[DEFAULT_LANGUAGE] || "";
    if (typeof localized === "object") {
      // 这里的极端情况：如果 localized 还是个对象，返回第一个键的值或空
      const keys = Object.keys(localized);
      return keys.length > 0 ? String(localized[keys[0]]) : "";
    }
    return String(localized);
  }

  return String(value);
};

/**
 * Puck 组件配置
 * 在这里定义可用的编辑器组件
 */
export const puckConfig: Config = {
  // Root 字段配置（右侧边栏的 Page 区域）
  root: {
    fields: {
      pageTitle: {
        label: "Title",
        type: "custom",
        render: MultiLanguageInput as any,
      },
      slug: {
        type: "text",
        label: "Slug *",
      },
      // 新增：国家选择器
      country: {
        type: "select",
        label: "Country *",
        options: COUNTRIES.map((c) => ({
          label: `${c.flag} ${c.name} (${c.code})`,
          value: c.code,
        })),
      },
      // 新增：SEO 描述（可选）
      description: {
        label: "SEO Description",
        type: "custom",
        render: (props) => <MultiLanguageInput {...props} field={{ ...props.field, type: "textarea" }} />,
      },
    },
    defaultProps: {
      pageTitle: "",
      title: "", // 保留一个 string 类型的 title 供 Puck 系统内部使用
      slug: "",
      country: "glo",
      description: "",
    },
    render: (props: any) => {
      return <>{props.children}</>;
    },
  },
  components: {
    // 标题组件
    Heading: {
      fields: {
        text: {
          label: "标题文本",
          type: "custom",
          render: (props: any) => (
            <MultiLanguageInput {...props} field={{ ...props.field, type: "text" }} />
          ),
        },
        level: {
          type: "select",
          label: "标题级别",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
          ],
        },
      },
      defaultProps: {
        text: "标题文本",
        level: "h1",
      },
      render: ({ text, level, puck }: any) => {
        const language = (puck.root?.props?.language || puck.data?.root?.props?.language) as string;
        const localizedText = getI18nValue(text, language);
        const className = "puck-heading";
        if (level === "h1") return <h1 className={className}>{localizedText}</h1>;
        if (level === "h2") return <h2 className={className}>{localizedText}</h2>;
        return <h3 className={className}>{localizedText}</h3>;
      },
    },
    // 段落组件
    Paragraph: {
      fields: {
        content: {
          label: "段落内容",
          type: "custom",
          render: (props: any) => (
            <MultiLanguageInput
              {...props}
              field={{ ...props.field, type: "textarea" }}
            />
          ),
        },
      },
      defaultProps: {
        content: "在这里输入段落内容...",
      },
      render: ({ content, puck }: any) => {
        const language = (puck.root?.props?.language || puck.data?.root?.props?.language) as string;
        const localizedContent = getI18nValue(content, language);
        return <p className="puck-paragraph">{localizedContent}</p>;
      },
    },
    // 图片组件
    Image: {
      fields: {
        src: { type: "text", label: "图片地址" },
        alt: { type: "text", label: "替代文本" },
      },
      defaultProps: {
        src: "",
        alt: "图片描述",
      },
      render: ({ src, alt }) => {
        if (!src) {
          return (
            <div className="puck-image-placeholder">请输入图片地址</div>
          );
        }
        return <img src={src} alt={alt} className="puck-image" />;
      },
    },
    // 按钮组件
    Button: {
      fields: {
        text: {
          label: "按钮文本",
          type: "custom",
          render: (props: any) => (
            <MultiLanguageInput {...props} field={{ ...props.field, type: "text" }} />
          ),
        },
        href: { type: "text", label: "链接地址" },
        variant: {
          type: "select",
          label: "样式",
          options: [
            { label: "主要", value: "primary" },
            { label: "次要", value: "secondary" },
            { label: "轮廓", value: "outline" },
          ],
        },
      },
      defaultProps: {
        text: "点击按钮",
        href: "#",
        variant: "primary",
      },
      render: ({ text, href, variant, puck }: any) => {
        const language = (puck.root?.props?.language || puck.data?.root?.props?.language) as string;
        const localizedText = getI18nValue(text, language);
        return (
          <a href={href} className={`puck-button puck-button--${variant}`}>
            {localizedText}
          </a>
        );
      },
    },
    // 容器组件
    Container: {
      fields: {
        padding: {
          type: "select",
          label: "内边距",
          options: [
            { label: "无", value: "none" },
            { label: "小", value: "small" },
            { label: "中", value: "medium" },
            { label: "大", value: "large" },
          ],
        },
        maxWidth: {
          type: "select",
          label: "最大宽度",
          options: [
            { label: "全宽", value: "full" },
            { label: "大", value: "lg" },
            { label: "中", value: "md" },
            { label: "小", value: "sm" },
          ],
        },
      },
      defaultProps: {
        padding: "medium",
        maxWidth: "lg",
      },
      render: ({ padding, maxWidth, puck }) => {
        return (
          <div
            className={`puck-container puck-container--padding-${padding} puck-container--width-${maxWidth}`}
          >
            {puck.renderDropZone({ zone: "content" })}
          </div>
        );
      },
    },
  },
};

/**
 * 初始数据
 */
export const initialData = {
  root: {
    props: {
      pageTitle: "",
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
