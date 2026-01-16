"use client";

import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "../puck.css";
import { puckConfig, initialData } from "@/lib/puck";
import { useCallback, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

/**
 * Puck 编辑器客户端组件
 */
export default function PuckEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const slug = searchParams.get("slug") || "home"; // 默认编辑 home 页面
  
  const [data, setData] = useState<Data>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { showToast } = useToast();

  // 加载草稿内容
  useEffect(() => {
    const loadDraft = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/cms/load-draft?slug=${slug}`);
        const result = await response.json();

        if (result.success && result.content) {
          setData(result.content);
        } else {
          // 如果没有草稿，使用初始数据
          console.log("未找到草稿，使用初始数据");
        }
      } catch (error) {
        console.error("加载草稿失败:", error);
        showToast("加载草稿失败，使用初始数据", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [slug, showToast]);

  // 数据变更回调
  const handleChange = useCallback((changeData: Data) => {
    setData(changeData);
  }, []);

  // 保存草稿回调
  const handleSave = useCallback(async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const response = await fetch("/api/cms/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          content: data,
          userId: "admin", // TODO: 从用户会话获取
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("草稿保存成功！", "success");
        
        // 如果 slug 发生了变化（Slug 被修改），更新 URL
        if (result.slug && result.slug !== slug) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("slug", result.slug);
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
  }, [data, slug, isSaving, router, pathname, searchParams, showToast]);

  // 发布回调
  const handlePublish = useCallback(async (publishData: Data) => {
    if (isPublishing) return;

    try {
      setIsPublishing(true);

      // 1. 先保存草稿
      const saveDraftResponse = await fetch("/api/cms/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          content: publishData,
          userId: "admin", // TODO: 从用户会话获取
        }),
      });

      const saveDraftResult = await saveDraftResponse.json();
      if (!saveDraftResult.success) {
        throw new Error(saveDraftResult.error || "保存草稿失败");
      }

      // 获取最新的 slug (如果 Slug 被修改了)
      const currentSlug = saveDraftResult.slug || slug;

      // 2. 发布页面
      const publishResponse = await fetch("/api/cms/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: currentSlug,
          userId: "admin", // TODO: 从用户会话获取
          remark: `发布于 ${new Date().toLocaleString("zh-CN")}`,
        }),
      });

      const publishResult = await publishResponse.json();

      if (publishResult.success) {
        showToast("页面发布成功！", "success");
        
        // 如果 slug 发生了变化，更新 URL
        if (currentSlug !== slug) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("slug", currentSlug);
          router.push(`${pathname}?${params.toString()}`);
        }
      } else {
        throw new Error(publishResult.error || "发布失败");
      }
    } catch (error) {
      console.error("发布页面失败:", error);
      showToast(`发布失败: ${error instanceof Error ? error.message : "未知错误"}`, "error");
    } finally {
      setIsPublishing(false);
    }
  }, [slug, isPublishing, router, pathname, searchParams, showToast]);

  // 预览回调
  const handlePreview = useCallback(() => {
    // 将当前数据存储到 sessionStorage
    sessionStorage.setItem("puck-preview-data", JSON.stringify(data));
    // 在新窗口中打开预览页面
    window.open("/admin/puck/preview", "_blank");
  }, [data]);

  // 加载中状态
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e5e7eb",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div style={{ fontSize: "16px", color: "#6b7280" }}>
          加载编辑器中...
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <Puck
        config={puckConfig}
        data={data}
        onPublish={handlePublish}
        onChange={handleChange}
        overrides={{
          headerActions: ({ children }) => (
            <>
              <button
                onClick={handlePreview}
                style={{
                  marginRight: "8px",
                  padding: "8px 16px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#4b5563";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#6b7280";
                }}
              >
                View Page
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  marginRight: "8px",
                  padding: "8px 16px",
                  backgroundColor: isSaving ? "#9ca3af" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  opacity: isSaving ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = "#059669";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = "#10b981";
                  }
                }}
              >
                {isSaving ? "保存中..." : "Save"}
              </button>
              {children}
            </>
          ),
        }}
      />
    </div>
  );
}
