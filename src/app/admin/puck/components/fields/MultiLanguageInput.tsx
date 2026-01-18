import React, { useState, useEffect, useRef } from "react";
import { Globe } from "lucide-react";
import { LANGUAGES, DEFAULT_LANGUAGE } from "@/config/locales";
import { useSearchParams } from "next/navigation";

interface MultiLanguageInputProps {
    value: string | Record<string, string>;
    name: string;
    onChange: (value: any) => void;
    label?: string;
    field: {
        type: "text" | "textarea" | string;
        label?: string;
    };
}

export const MultiLanguageInput: React.FC<MultiLanguageInputProps> = ({
    value,
    name,
    onChange,
    field,
}) => {
    const searchParams = useSearchParams();
    // 获取当前正在编辑的语言环境
    const currentEditLanguage = searchParams.get("language") || DEFAULT_LANGUAGE;

    // Normalize value to an object
    const normalizedValue = React.useMemo(() => {
        if (typeof value === "string") {
            return { [DEFAULT_LANGUAGE]: value };
        }
        return value || { [DEFAULT_LANGUAGE]: "" };
    }, [value]);

    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close popover when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleChange = (langCode: string, newValue: string) => {
        const updatedValue = {
            ...normalizedValue,
            [langCode]: newValue,
        };
        onChange(updatedValue);
    };

    const isTextarea = field.type === "textarea";
    const InputComponent = isTextarea ? "textarea" : "input";

    return (
        <div className="relative flex items-center gap-2 w-full">
            <div className="flex-1 relative">
                <InputComponent
                    className={`w-full p-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isTextarea ? "min-h-[100px]" : "h-10"
                        } text-sm`}
                    value={normalizedValue[currentEditLanguage] || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        handleChange(currentEditLanguage, e.target.value)
                    }
                    placeholder={`Enter ${field.label || ""} (${currentEditLanguage.toUpperCase()})`}
                />

                {/* Globe Icon Trigger */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`absolute right-2 top-2 p-1 transition-colors ${isOpen ? "text-blue-600" : "text-gray-400 hover:text-blue-500"
                        }`}
                    title="Manage translations"
                >
                    <Globe size={16} />
                </button>

                {/* Popover */}
                {isOpen && (
                    <div
                        ref={popoverRef}
                        className="absolute right-0 top-full mt-2 w-72 bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 rounded-xl p-4 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                Translations
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                                {LANGUAGES.length} Languages
                            </span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                            {/* 显示除了当前主语言以外的其他语言 */}
                            {LANGUAGES.filter((l) => l.code !== currentEditLanguage).map((lang) => (
                                <div key={lang.code} className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <label className="text-[11px] font-semibold text-gray-500">
                                            {lang.nativeName} ({lang.code.toUpperCase()})
                                        </label>
                                    </div>
                                    <InputComponent
                                        className={`w-full p-2 text-sm bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${isTextarea ? "min-h-[70px]" : "h-9"
                                            }`}
                                        value={normalizedValue[lang.code] || ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                                            handleChange(lang.code, e.target.value)
                                        }
                                        placeholder={`Translation for ${lang.name}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

