"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

type Region = {
    id: string;
    lang: string;
    name: string;
    group: string;
    flag: string;
    code: string;
};

type Translations = {
    title: string;
    subtitle: string;
    choose: string;
    searchPlaceholder: string;
    noResults: string;
    noResultsDetail: string;
    clearSearch: string;
};

export default function CountryClient({
    regions,
    t,
    currentLanguage,
}: {
    regions: Region[];
    t: Translations;
    currentLanguage: string;
}) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredRegions = useMemo(() => {
        if (!searchQuery.trim()) return regions;
        const query = searchQuery.toLowerCase();
        return regions.filter(
            (r) =>
                r.name.toLowerCase().includes(query) ||
                r.group.toLowerCase().includes(query) ||
                r.code.toLowerCase().includes(query) ||
                (r.id && r.id.toLowerCase().includes(query))
        );
    }, [searchQuery, regions]);

    return (
        <div className="w-full">
            {/* 搜索栏 */}
            <div className="max-w-lg mx-auto mb-8">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 h-12 text-lg bg-background/70 backdrop-blur-sm border-border/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/20 rounded-2xl shadow-lg outline-none transition-all duration-300 placeholder:text-muted-foreground text-foreground hover:shadow-xl"
                    />
                </div>
            </div>

            {/* 核心功能区：网格渲染地区卡片列表 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
                {filteredRegions.map((country) => (
                    <Link
                        key={`${country.id}-${country.lang}`}
                        href={`/${country.id}/${currentLanguage}`}
                        className="group block h-full bg-background/70 backdrop-blur-sm border border-border/60 rounded-2xl shadow-lg hover:shadow-2xl hover:border-primary/50 hover:bg-background/90 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.05]"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4 h-14">
                                    <div className="text-3xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                                        {country.flag}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                            {country.name}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="transform group-hover:translate-x-1 transition-transform duration-300">
                                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs px-3 py-1 rounded-full font-medium border border-border bg-background text-foreground">
                                        {country.code}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 空状态 */}
            {filteredRegions.length === 0 && (
                <div className="text-center py-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/30 mb-4 transition-transform duration-1000 animate-pulse">
                        <Search className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-foreground">
                            {t.noResults}
                        </h3>
                        <p className="text-muted-foreground">
                            {t.noResultsDetail}
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-6 px-8 py-3 bg-background border border-border rounded-full text-foreground hover:border-primary hover:text-primary transition-all font-medium shadow-sm active:scale-95"
                        >
                            {t.clearSearch}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
