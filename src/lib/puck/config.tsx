import type { Config, Data } from "@puckeditor/core";
import type { ReactNode } from "react";

/**
 * Puck 组件配置
 * 在这里定义可用的编辑器组件
 */
export const puckConfig: Config = {
  // Root 字段配置（右侧边栏的 Page 区域）
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
    },
    defaultProps: {
      title: "",
      slug: "",
    },
    render: ({ children }: { children: ReactNode }) => {
      return <>{children}</>;
    },
  },
  components: {
    // 标题组件
    Heading: {
      fields: {
        text: { type: "text", label: "标题文本" },
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
      render: ({ text, level }) => {
        const className = "puck-heading";
        if (level === "h1") return <h1 className={className}>{text}</h1>;
        if (level === "h2") return <h2 className={className}>{text}</h2>;
        return <h3 className={className}>{text}</h3>;
      },
    },
    // 段落组件
    Paragraph: {
      fields: {
        content: { type: "textarea", label: "段落内容" },
      },
      defaultProps: {
        content: "在这里输入段落内容...",
      },
      render: ({ content }) => {
        return <p className="puck-paragraph">{content}</p>;
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
        text: { type: "text", label: "按钮文本" },
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
      render: ({ text, href, variant }) => {
        return (
          <a href={href} className={`puck-button puck-button--${variant}`}>
            {text}
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
      title: "",
      slug: "",
    },
  },
  content: [],
  zones: {},
} as Data;
