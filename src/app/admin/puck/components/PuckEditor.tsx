"use client";

import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "../puck.css";
import { puckConfig, initialData } from "@/lib/puck";
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

import { CmsPageVersion } from "@/models";
import {
  DEFAULT_COUNTRY,
  COUNTRIES,
} from "@/config/locales";

interface PuckRootProps {
  title?: string;
  pageTitle?: string | Record<string, string>;
  slug?: string;
  country?: string;
  [key: string]: any;
}

/**
 * Puck 编辑器客户端组件
 */
export default function PuckEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const slug = searchParams.get("slug") || "home";
  const country = searchParams.get("country") || DEFAULT_COUNTRY;

  const [data, setData] = useState<Data>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<CmsPageVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const { showToast } = useToast();

  // 加载草稿内容
  useEffect(() => {
    const loadDraft = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/cms/load-draft?slug=${slug}&country=${country}`,
          { signal: controller.signal }
        );

        if (response.status === 404) {
          setIsLoading(false);
          const newInitialData = JSON.parse(JSON.stringify(initialData));
          newInitialData.root.props.slug = slug;
          newInitialData.root.props.country = country;
          setData(newInitialData);
          return;
        }

        if (!response.ok) throw new Error(response.statusText);

        const result = await response.json();

        if (result.success && result.content) {
          setData(result.content);
        } else {
          const newInitialData = JSON.parse(JSON.stringify(initialData));
          newInitialData.root.props.slug = slug;
          newInitialData.root.props.country = country;
          setData(newInitialData);
        }
      } catch (error) {
        console.error("加载草稿失败:", error);
        showToast("加载草稿失败，使用初始数据", "error");
        const newInitialData = JSON.parse(JSON.stringify(initialData));
        newInitialData.root.props.slug = slug;
        newInitialData.root.props.country = country;
        setData(newInitialData);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [slug, country, showToast]);

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const handleChange = useCallback((changeData: Data) => {
    setData(changeData);
    dataRef.current = changeData;
  }, []);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const currentData = dataRef.current;
      const response = await fetch("/api/cms/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          country: (currentData.root?.props as PuckRootProps)?.country || country,
          content: currentData,
          userId: "admin",
          originalSlug: slug,
          originalCountry: country,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("草稿保存成功！", "success");
        if (result.slug !== slug || result.country !== country) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("slug", result.slug);
          params.set("country", result.country);
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
  }, [slug, country, isSaving, router, pathname, searchParams, showToast]);

  const handlePublish = useCallback(async (publishData: Data) => {
    if (isPublishing) return;

    try {
      setIsPublishing(true);
      const saveDraftResponse = await fetch("/api/cms/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          country: (publishData.root?.props as PuckRootProps)?.country || country,
          content: publishData,
          userId: "admin",
          originalSlug: slug,
          originalCountry: country,
        }),
      });

      const saveDraftResult = await saveDraftResponse.json();
      if (!saveDraftResult.success) {
        throw new Error(saveDraftResult.error || "保存草稿失败");
      }

      const currentSlug = saveDraftResult.slug || slug;
      const currentCountry = saveDraftResult.country || country;

      const publishResponse = await fetch("/api/cms/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: currentSlug,
          country: currentCountry,
          userId: "admin",
          remark: `发布于 ${new Date().toLocaleString("zh-CN")}`,
        }),
      });

      const publishResult = await publishResponse.json();

      if (publishResult.success) {
        showToast("页面发布成功！", "success");

        if (currentSlug !== slug || currentCountry !== country) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("slug", currentSlug);
          params.set("country", currentCountry);
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
  }, [slug, country, isPublishing, router, pathname, searchParams, showToast]);

  const handlePreview = useCallback(() => {
    sessionStorage.setItem("puck-preview-data", JSON.stringify(data));
    const currentProps = (data.root?.props as PuckRootProps) || {};
    const pCountry = currentProps.country || country;
    const pSlug = currentProps.slug || slug;

    // 构建预览 URL，包含语言段和 preview=true 参数
    // 这里默认使用 'en'，PuckRenderer 会根据实际需要处理多语言
    const previewUrl = `/${pCountry}/en/${pSlug === "home" ? "" : pSlug}?preview=true`;
    window.open(previewUrl, "_blank");
  }, [data, country, slug]);

  const fetchVersions = useCallback(async () => {
    try {
      setLoadingVersions(true);
      const res = await fetch(`/api/cms/${slug}/versions?country=${country}`);
      const result = await res.json();
      if (result.success) {
        setVersions(result.data);
      } else {
        showToast("获取版本历史失败", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("获取版本历史失败", "error");
    } finally {
      setLoadingVersions(false);
    }
  }, [slug, showToast]);

  const toggleHistory = useCallback(() => {
    if (!showHistory) {
      fetchVersions();
    }
    setShowHistory((prev) => !prev);
  }, [showHistory, fetchVersions]);

  const handleRestore = async (version: CmsPageVersion) => {
    if (!confirm(`确定要回滚到版本 v${version.version_num} 吗？当前草稿将被覆盖。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cms/${slug}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionNum: version.version_num, country, userId: "admin" }),
      });
      const result = await res.json();

      if (result.success) {
        showToast("回滚成功，正在刷新...", "success");
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      showToast("回滚失败", "error");
    }
  };

  const overrides = useMemo(() => ({
    headerActions: ({ children }: { children: ReactNode }) => (
      <div style={{ display: "flex", alignItems: "center" }}>
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
            height: "36px"
          }}
        >
          View Page
        </button>
        <button
          onClick={toggleHistory}
          style={{
            marginRight: "8px",
            padding: "8px 16px",
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            height: "36px"
          }}
        >
          History
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
            height: "36px"
          }}
        >
          {isSaving ? "保存中..." : "Save"}
        </button>
        {children}
      </div>
    ),
  }), [handlePreview, toggleHistory, handleSave, isSaving]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ fontSize: "16px", color: "#6b7280" }}>加载编辑器中...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div key={`${slug}-${country}`}>
      <Puck config={puckConfig} data={data} onPublish={handlePublish} onChange={handleChange} overrides={overrides} />
      {showHistory && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "350px", backgroundColor: "white", boxShadow: "-4px 0 15px rgba(0,0,0,0.1)", zIndex: 1000, padding: "20px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>版本历史</h2>
            <button onClick={() => setShowHistory(false)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "20px", color: "#666" }}>×</button>
          </div>
          {loadingVersions ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>加载中...</div>
          ) : versions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>暂无历史版本</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {versions.map((v) => (
                <div key={v.id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px", backgroundColor: v.is_published ? "#f0fdf4" : "white" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "600", fontSize: "14px" }}>v{v.version_num}{v.is_published && <span style={{ marginLeft: "6px", backgroundColor: "#16a34a", color: "white", fontSize: "10px", padding: "2px 6px", borderRadius: "10px" }}>Published</span>}</span>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>{v.created_time ? new Date(v.created_time).toLocaleString("zh-CN") : ""}</span>
                  </div>
                  {v.remark && <div style={{ fontSize: "13px", color: "#374151", marginBottom: "10px", fontStyle: "italic" }}>"{v.remark}"</div>}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}><button onClick={() => handleRestore(v)} style={{ padding: "4px 12px", backgroundColor: "white", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", cursor: "pointer", color: "#374151" }}>回滚至此版本</button></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
