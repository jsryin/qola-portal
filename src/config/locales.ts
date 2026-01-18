/**
 * 国家配置
 */
export const COUNTRIES = [
    { code: 'glo', name: 'Global', flag: '🌍' },
    { code: 'ae', name: 'United Arab Emirates', flag: '��' },
    { code: 'iq', name: 'Iraq', flag: '🇮🇶' },
    { code: 'us', name: 'United States', flag: '��' },
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
    glo: ['en', 'ar'],        // Global 支持所有
    ae: ['en', 'ar'],               // 阿联酋：英语优先，支持阿拉伯语
    iq: ['en', 'ar'],               // 伊拉克：英语优先，支持阿拉伯语
    us: ['en'],                     // 美国：仅英语
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
