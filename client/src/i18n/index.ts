import { Translation } from './types';
import { ko } from './locales/ko';
import { en } from './locales/en';
import { vi } from './locales/vi';
import { th } from './locales/th';
import { tl } from './locales/tl';
import { uz } from './locales/uz';
import { ne } from './locales/ne';
import { mn } from './locales/mn';
import { id } from './locales/id';
import { my } from './locales/my';
import { zh } from './locales/zh';
import { ru } from './locales/ru';
import { type LanguageCode } from '@/contexts/LanguageContext';

// 번역 데이터 맵 (12개 언어 완전 지원)
const translations: Record<LanguageCode, Translation> = {
  ko, // 한국어
  en, // 영어
  vi, // 베트남어
  th, // 태국어
  tl, // 타갈로그어
  uz, // 우즈베크어
  ne, // 네팔어
  mn, // 몽골어
  id, // 인도네시아어
  my, // 미얀마어
  zh, // 중국어
  ru, // 러시아어
};

/**
 * 언어 코드에 해당하는 번역 객체 반환
 */
export function getTranslation(languageCode: LanguageCode): Translation {
  return translations[languageCode] || translations.ko;
}

/**
 * 중첩된 객체 경로로 번역 문자열 가져오기
 * 예: get(translations.ko, 'home.hero.title') => 'Korea'
 */
export function get(obj: any, path: string): string {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      console.warn(`Translation key not found: ${path}`);
      return path; // fallback to key itself
    }
  }

  return typeof result === 'string' ? result : path;
}
