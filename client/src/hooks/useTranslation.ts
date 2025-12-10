import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation, get } from '@/i18n';
import { Translation } from '@/i18n/types';

/**
 * 번역 훅
 *
 * 사용 예:
 * const { t, translations } = useTranslation();
 *
 * // 중첩 경로로 접근
 * t('home.hero.title') => 'Korea'
 *
 * // 직접 객체 접근
 * translations.home.hero.title => 'Korea'
 */
export function useTranslation() {
  const { currentLanguage } = useLanguage();
  const translations: Translation = getTranslation(currentLanguage);

  /**
   * 번역 문자열 가져오기
   * @param key - 중첩 경로 (예: 'home.hero.title')
   */
  const t = (key: string): string => {
    return get(translations, key);
  };

  return {
    t,
    translations,
    currentLanguage,
  };
}
