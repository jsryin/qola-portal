"use client";

import React, { useState, useMemo } from "react";
import { Globe } from "lucide-react";
import { LANGUAGES, DEFAULT_LANGUAGE } from "@/config/locales";

interface MultiLanguageInputProps {
    value: string | Record<string, string>;
    onChange: (value: any) => void;
    name: string;
    field: any;
}

/**
 * 多语言输入组件
 * 将翻译存储在单个 JSON 对象中，并允许切换当前显示的语言
 * 使用原生 HTML/CSS 避免缺失组件依赖
 */
export const MultiLanguageInput = ({
    value,
    onChange,
    field,
}: MultiLanguageInputProps) => {
    const [currentEditLang, setCurrentEditLang] = useState(DEFAULT_LANGUAGE);
    const [isOpen, setIsOpen] = useState(false);

    // 规范化数据格式
    const normalizedValue = useMemo(() => {
        if (typeof value === "string") {
            return { [DEFAULT_LANGUAGE]: value };
        }
        return (value || {}) as Record<string, string>;
    }, [value]);

    const handleChange = (lang: string, newValue: string) => {
        const updatedValue = {
            ...normalizedValue,
            [lang]: newValue,
        };
        onChange(updatedValue);
    };

    const isTextarea = field.type === "textarea";
    const InputComponent = isTextarea ? "textarea" : "input";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ position: "relative", width: "100%" }}>
                <InputComponent
                    style={{
                        width: "100%",
                        padding: "8px 12px",
                        paddingRight: "36px", // 为地球图标留出空间
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        minHeight: isTextarea ? "80px" : "36px",
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                    value={normalizedValue[currentEditLang] || ""}
                    onChange={(e: any) => handleChange(currentEditLang, e.target.value)}
                    placeholder={`Enter ${LANGUAGES.find(l => l.code === currentEditLang)?.name || 'content'}...`}
                />

                <div style={{
                    position: "absolute",
                    right: "4px",
                    top: isTextarea ? "8px" : "50%",
                    transform: isTextarea ? "none" : "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    zIndex: 10
                }}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        style={{
                            height: "28px",
                            width: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            border: "none",
                            backgroundColor: isOpen ? "#f3f4f6" : "transparent",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            if (!isOpen) e.currentTarget.style.backgroundColor = "#f9fafb";
                        }}
                        onMouseLeave={(e) => {
                            if (!isOpen) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        title="Translations"
                    >
                        <Globe style={{ width: "14px", height: "14px", color: "#9ca3af" }} />
                    </button>

                    {isOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                marginTop: "8px",
                                width: "280px",
                                backgroundColor: "white",
                                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "16px",
                                zIndex: 1000,
                            }}
                        >
                            <div style={{ paddingBottom: "8px", borderBottom: "1px solid #f3f4f6", marginBottom: "12px" }}>
                                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#374151" }}>Translations</h4>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "300px", overflowY: "auto" }}>
                                {LANGUAGES.map((lang) => (
                                    <div key={lang.code} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <label
                                                style={{
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    cursor: "pointer",
                                                    color: currentEditLang === lang.code ? "#2563eb" : "#6b7280",
                                                }}
                                                onClick={() => setCurrentEditLang(lang.code)}
                                            >
                                                {lang.nativeName} ({lang.code.toUpperCase()})
                                                {currentEditLang === lang.code && " (Active)"}
                                            </label>
                                        </div>
                                        <InputComponent
                                            style={{
                                                padding: "6px 10px",
                                                fontSize: "13px",
                                                borderRadius: "4px",
                                                border: "1px solid #e5e7eb",
                                                outline: "none",
                                                minHeight: isTextarea ? "60px" : "32px",
                                            }}
                                            value={normalizedValue[lang.code] || ""}
                                            onChange={(e: any) => handleChange(lang.code, e.target.value)}
                                            placeholder={`Translation for ${lang.name}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
