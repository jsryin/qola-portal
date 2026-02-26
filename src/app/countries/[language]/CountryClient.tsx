"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Search, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Region = {
    id: string;
    name: string;
    flag: string;
    codes: string[];
};

export default function CountryClient({
    regions,
    currentLanguage,
}: {
    regions: Region[];
    currentLanguage: string;
}) {
    const t = useTranslations('Countries');
    const [searchQuery, setSearchQuery] = useState("");

    const filteredRegions = useMemo(() => {
        if (!searchQuery.trim()) return regions;
        const query = searchQuery.toLowerCase();
        return regions.filter(
            (r) =>
                r.name.toLowerCase().includes(query) ||
                r.codes.some(c => c.toLowerCase().includes(query)) ||
                (r.id && r.id.toLowerCase().includes(query))
        );
    }, [searchQuery, regions]);

    return (
        <div className="w-full relative">
            {/* 搜索栏 */}
            <div className="max-w-lg mx-auto mb-12">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 h-14 text-base bg-background/70 backdrop-blur-md border border-border/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl shadow-lg outline-none transition-all duration-300 placeholder:text-muted-foreground text-foreground hover:shadow-xl hover:border-border/80"
                    />
                </div>
            </div>

            {/* 核心功能区：网格渲染地区卡片列表 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto px-1">
                {filteredRegions.map((country, index) => (
                    <div
                        key={country.id}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className={cn(
                            "group relative overflow-hidden h-full",
                            "bg-background/70 backdrop-blur-md border border-border/60 rounded-2xl",
                            "shadow-lg hover:shadow-2xl transition-all duration-500",
                            "hover:border-primary/40 hover:-translate-y-2",
                            "animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards"
                        )}
                    >
                        {/* 顶部的渐变装饰条 */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="p-6 flex flex-col h-full z-10 relative">
                            {/* 卡片头部：旗帜 + 国家名称 + 装饰箭头 */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-4 min-w-0">
                                    <div className="text-4xl flex-shrink-0 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        {country.flag}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-medium text-lg text-foreground group-hover:text-primary transition-colors duration-300 leading-tight break-words">
                                            {country.name}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                    <ArrowRight className="h-5 w-5 text-primary" />
                                </div>
                            </div>

                            {/* 卡片页脚：语言代码选择按钮列表 */}
                            <div className="mt-auto">
                                <div className="flex flex-wrap gap-2.5">
                                    {country.codes.map((code) => (
                                        <span
                                            key={code}
                                            className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px]",
                                                "border border-border/80 bg-background/50 text-foreground/80"
                                            )}
                                        >
                                            {code.toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 背景微装饰 */}
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
                    </div>
                ))}
            </div>

            {/* 空状态 */}
            {filteredRegions.length === 0 && (
                <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-muted/40">
                            <Search className="h-10 w-10 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-4 max-w-sm mx-auto">
                        <h3 className="text-2xl font-bold text-foreground">
                            {t('noResults')}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed px-4">
                            {t('noResultsDetail')}
                        </p>
                        <div className="pt-4">
                            <button
                                onClick={() => setSearchQuery("")}
                                className="px-10 py-3.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-bold active:scale-95"
                            >
                                {t('clearSearch')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
