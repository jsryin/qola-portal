"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { LANGUAGES } from "@/config/locales";

export default function LanguageSwitcher({ currentLang, label }: { currentLang: string; label: string }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguageName = LANGUAGES.find(l => l.code === currentLang)?.nativeName || currentLang.toUpperCase();

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (code: string) => {
        setIsOpen(false);
        router.push(`/countries/${code}`);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2.5 px-5 h-[40px] bg-background/50 backdrop-blur-md border border-border/50 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:bg-background/80 hover:border-primary/40 focus:outline-none group ${isOpen ? 'bg-background/80 border-primary/40 shadow-md' : ''
                    }`}
            >
                <Globe className={`w-4 h-4 transition-colors duration-300 ${isOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    }`} />
                <span className={`text-sm tracking-wide font-medium transition-colors duration-300 ${isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
                    }`}>
                    {currentLanguageName}
                </span>
                <ChevronDown className={`w-4 h-4 transition-all duration-300 ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground group-hover:text-primary"
                    }`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-48 py-2 bg-background border border-border/60 rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-3 mb-1 border-b border-border/30 flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-primary opacity-90" />
                        <span className="text-xs font-semibold text-foreground uppercase tracking-widest opacity-90">
                            {label}
                        </span>
                    </div>
                    <div className="px-2 space-y-1">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full text-left px-3 py-2.5 text-sm transition-all duration-200 rounded-xl flex items-center justify-between group ${currentLang === lang.code
                                    ? "bg-primary/10 text-primary font-medium shadow-sm"
                                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                                    }`}
                            >
                                <span className="tracking-wide">{lang.nativeName}</span>
                                {currentLang === lang.code && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
