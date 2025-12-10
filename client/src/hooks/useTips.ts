import { useQuery } from "@tanstack/react-query";
import { apiPost } from "../lib/api.js";
import { type LanguageCode } from "@/contexts/LanguageContext";

export interface Tip {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  is_published: boolean;
  view_count: number;
  language: LanguageCode;
  original_tip_id: string | null;
  seo_meta: {
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
  } | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export interface TipFilters {
  category_id?: string;
  page?: number;
  limit?: number;
  is_published?: boolean;
  language?: LanguageCode;
}

export interface TipCategory {
  id: string;
  name: string;
  created_at: string;
}

interface TipsResponse {
  tips: Tip[];
  total: number;
  page: number;
  limit: number;
}

interface TipResponse {
  tip: Tip;
}

interface CategoriesResponse {
  categories: TipCategory[];
}

export function useTips(filters: TipFilters = {}) {
  return useQuery<TipsResponse>({
    queryKey: ["tips", filters],
    queryFn: async () => {
      return await apiPost<TipsResponse>("/tips", filters);
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}

export function useTip(tipId: string) {
  return useQuery<Tip>({
    queryKey: ["tip", tipId],
    queryFn: async () => {
      const data = await apiPost<TipResponse>(`/tips/${tipId}`, {});
      return data.tip;
    },
    enabled: !!tipId,
  });
}

export function useTipBySlug(slug: string, language?: LanguageCode) {
  return useQuery<Tip>({
    queryKey: ["tip-slug", slug, language],
    queryFn: async () => {
      const data = await apiPost<TipResponse>(`/tips/slug/${slug}`, { language });
      return data.tip;
    },
    enabled: !!slug,
  });
}

export function useTipCategories() {
  return useQuery<TipCategory[]>({
    queryKey: ["tip-categories"],
    queryFn: async () => {
      const data = await apiPost<CategoriesResponse>("/tips/categories", {});
      return data.categories;
    },
    staleTime: 1000 * 60 * 60, // 1시간
  });
}

