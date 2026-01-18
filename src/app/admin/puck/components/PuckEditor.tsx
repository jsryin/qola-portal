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
  DEFAULT_LANGUAGE,
  COUNTRIES,
  // LANGUAGES, // Not strictly needed if we use getSupportedLanguages which returns objects
  getSupportedLanguages
} from "@/config/locales";

interface PuckRootProps {
  title?: string;
  slug?: string;
  country?: string;
  language?: string;
  [key: string]: any;
}

/**
 * Puck 编辑器客户端组件
 */
export default function PuckEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const slug = searchParams.get("slug") || "home"; // 默认编辑 home 页面
  const country = searchParams.get("country") || DEFAULT_COUNTRY;
  const language = searchParams.get("language") || DEFAULT_LANGUAGE;

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
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/cms/load-draft?slug=${slug}&country=${country}&language=${language}`,
          { signal: controller.signal }
        );

        if (response.status === 404) {
          // 如果页面不存在 (404)，说明是新增页面
          setIsLoading(false);
          const newInitialData = JSON.parse(JSON.stringify(initialData));
          newInitialData.root.props.slug = slug;
          newInitialData.root.props.country = country;
          newInitialData.root.props.language = language;
          setData(newInitialData);
          return;
        }

        if (!response.ok) throw new Error(response.statusText);

        const result = await response.json();

        if (result.success && result.content) {
          setData(result.content);
        } else {
          // 如果没有草稿，使用初始数据，并注入当前参数
          const newInitialData = JSON.parse(JSON.stringify(initialData));
          newInitialData.root.props.slug = slug;
          newInitialData.root.props.country = country;
          newInitialData.root.props.language = language;
          setData(newInitialData);
        }
      } catch (error) {
        console.error("加载草稿失败:", error);
        if ((error as Error).name === 'AbortError') {
          showToast("加载超时，已切换到离线模式", "error");
        } else {
          showToast("加载草稿失败，使用初始数据", "error");
        }
        // 出错时也必须设置初始数据
        const newInitialData = JSON.parse(JSON.stringify(initialData));
        newInitialData.root.props.slug = slug;
        newInitialData.root.props.country = country;
        newInitialData.root.props.language = language;
        setData(newInitialData);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [slug, country, language, showToast]);

  // 使用 Ref 存储 data，避免 handleSave 频繁变更导致 overrides 重渲染
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // 数据变更回调
  const handleChange = useCallback((changeData: Data) => {
    setData(changeData);
    dataRef.current = changeData;
  }, []);

  // 保存草稿回调
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
          language: (currentData.root?.props as PuckRootProps)?.language || language,
          content: currentData,
          userId: "admin", // TODO: 从用户会话获取
          // 原始参数，用于查找已有记录
          originalSlug: slug,
          originalCountry: country,
          originalLanguage: language,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("草稿保存成功！", "success");

        // 如果 slug/country/language 发生了变化，更新 URL
        if (
          result.slug !== slug ||
          result.country !== country ||
          result.language !== language
        ) {
          const params = new URLSearchParams(searchParams.toString());
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
  }, [slug, country, language, isSaving, router, pathname, searchParams, showToast]);

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
          country: (publishData.root?.props as PuckRootProps)?.country || country,
          language: (publishData.root?.props as PuckRootProps)?.language || language,
          content: publishData,
          userId: "admin", // TODO: 从用户会话获取
          originalSlug: slug,
          originalCountry: country,
          originalLanguage: language,
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
          country: saveDraftResult.country || country,
          language: saveDraftResult.language || language,
          userId: "admin", // TODO: 从用户会话获取
          remark: `发布于 ${new Date().toLocaleString("zh-CN")}`,
        }),
      });

      const publishResult = await publishResponse.json();

      if (publishResult.success) {
        showToast("页面发布成功！", "success");

        // 如果 slug/country/language 发生了变化，更新 URL
        const currentCountry = saveDraftResult.country || country;
        const currentLanguage = saveDraftResult.language || language;

        if (
          currentSlug !== slug ||
          currentCountry !== country ||
          currentLanguage !== language
        ) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("slug", currentSlug);
          params.set("country", currentCountry);
          params.set("language", currentLanguage);
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
  }, [slug, country, language, isPublishing, router, pathname, searchParams, showToast]);

  // 预览回调
  const handlePreview = useCallback(() => {
    // 将当前数据存储到 sessionStorage
    sessionStorage.setItem("puck-preview-data", JSON.stringify(data));
    // 在新窗口中打开预览页面
    const currentProps = (data.root?.props as PuckRootProps) || {};
    const previewUrl = `/${currentProps.country || country}/${currentProps.language || language}/${currentProps.slug || slug}`;
    window.open(previewUrl, "_blank");
  }, [data]);

  // 获取版本历史
  const fetchVersions = useCallback(async () => {
    try {
      setLoadingVersions(true);
      const res = await fetch(`/api/cms/${slug}/versions`);
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

  // 切换历史面板
  const toggleHistory = useCallback(() => {
    if (!showHistory) {
      fetchVersions();
    }
    setShowHistory((prev) => !prev);
  }, [showHistory, fetchVersions]);

  // 回滚版本
  const handleRestore = async (version: CmsPageVersion) => {
    if (!confirm(`确定要回滚到版本 v${version.version_num} 吗？当前草稿将被覆盖。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cms/${slug}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionNum: version.version_num, userId: "admin" }),
      });
      const result = await res.json();

      if (result.success) {
        showToast("回滚成功，正在刷新...", "success");
        // Reload page to fetch new draft content
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      showToast("回滚失败", "error");
    }
  };

  // 使用 useMemo 优化 overrides，避免不必要的重渲染
  const overrides = useMemo(() => ({
    headerActions: ({ children }: { children: ReactNode }) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "12px", borderRight: "1px solid #e5e7eb", paddingRight: "12px" }}>
          <select
            value={country}
            onChange={(e) => {
              const newCountry = e.target.value;
              const supportedLangs = getSupportedLanguages(newCountry);
              // 如果当前语言在新国家不支持，切换到该国家的第一个支持语言
              const newLang = supportedLangs.some((l) => l.code === language)
                ? language
                : supportedLangs[0].code;

              const params = new URLSearchParams(searchParams.toString());
              params.set("country", newCountry);
              params.set("language", newLang);
              router.push(`${pathname}?${params.toString()}`);
            }}
            style={{
              padding: "6px 8px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              backgroundColor: "white",
              color: "#374151",
              cursor: "pointer",
              height: "36px"
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>

          <select
            value={language}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("language", e.target.value);
              router.push(`${pathname}?${params.toString()}`);
            }}
            style={{
              padding: "6px 8px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              backgroundColor: "white",
              color: "#374151",
              cursor: "pointer",
              height: "36px"
            }}
          >
            {getSupportedLanguages(country).map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName}
              </option>
            ))}
          </select>
        </div>

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
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#4f46e5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#6366f1";
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
      </div>
    ),
  }), [country, language, searchParams, router, pathname, handlePreview, toggleHistory, handleSave, isSaving]);

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
    <div key={`${slug}-${country}-${language}`}>
      <Puck
        config={puckConfig}
        data={data}
        onPublish={handlePublish}
        onChange={handleChange}
        overrides={overrides}
      />

      {/* 历史版本侧边栏 */}
      {showHistory && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "350px",
            backgroundColor: "white",
            boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
            zIndex: 1000,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            transition: "transform 0.3s ease-in-out"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>版本历史</h2>
            <button
              onClick={() => setShowHistory(false)}
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: "20px", color: "#666" }}
            >
              ×
            </button>
          </div>

          {loadingVersions ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>加载中...</div>
          ) : versions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>暂无历史版本</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {versions.map((v) => (
                <div
                  key={v.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: v.is_published ? "#f0fdf4" : "white"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "600", fontSize: "14px" }}>
                      v{v.version_num}
                      {v.is_published ? <span style={{ marginLeft: "6px", backgroundColor: "#16a34a", color: "white", fontSize: "10px", padding: "2px 6px", borderRadius: "10px" }}>Published</span> : null}
                    </span>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      {v.created_time ? new Date(v.created_time).toLocaleString("zh-CN") : ""}
                    </span>
                  </div>
                  {v.remark && (
                    <div style={{ fontSize: "13px", color: "#374151", marginBottom: "10px", fontStyle: "italic" }}>
                      "{v.remark}"
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleRestore(v)}
                      style={{
                        padding: "4px 12px",
                        backgroundColor: "white",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        color: "#374151"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
                    >
                      回滚至此版本
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
