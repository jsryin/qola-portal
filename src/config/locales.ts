/**
 * 国家配置
 */
export const COUNTRIES = [
    { code: 'us', name: 'United States', flag: '🇺🇸' },
    { code: 'ae', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'iq', name: 'Iraq', flag: '🇮🇶' },
    { code: 'it', name: 'Italy', flag: '🇮🇹' },
    { code: 'th', name: 'Thailand', flag: '🇹🇭' },
    { code: 'za', name: 'South Africa', flag: '🇿🇦' },
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'mo', name: 'Macau', flag: '🇲🇴' },
    { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
] as const;

/**
 * 语言配置
 */
export const LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
] as const;

/**
 * 国家与支持语言的映射关系
 */
export const COUNTRY_LANGUAGES: Record<string, string[]> = {
    us: ['en'],                     // 美国：仅英语
    ae: ['en', 'ar'],               // 阿联酋：英语优先，支持阿拉伯语
    my: ['en'],                     // 马来西亚：仅英语
    iq: ['en', 'ar'],               // 伊拉克：英语优先，支持阿拉伯语
    it: ['en'],                     // 意大利：仅英语
    th: ['en'],                     // 泰国：仅英语
    za: ['en'],                     // 南非：仅英语
    id: ['en'],                     // 印尼：仅英语
    mo: ['en'],                     // 澳门：仅英语
    mx: ['en'],                     // 墨西哥：仅英语
};

/**
 * 默认国家和语言
 */
export const DEFAULT_COUNTRY = 'glo';
export const DEFAULT_LANGUAGE = 'en';

/**
 * 获取国家支持的语言列表
 */
export function getSupportedLanguages(countryCode: string) {
    const supportedCodes = COUNTRY_LANGUAGES[countryCode] || ['en'];
    return LANGUAGES.filter(lang => supportedCodes.includes(lang.code));
}