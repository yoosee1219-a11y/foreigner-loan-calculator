import { useQuery } from "@tanstack/react-query";
import { apiPost } from "../lib/api.js";
import { useLanguage } from "@/contexts/LanguageContext";

export interface Plan {
  id: string;
  carrier_id: string;
  plan_type: string;
  payment_type: string; // 'prepaid' (선불) or 'postpaid' (후불)
  name: string;
  description: string | null;
  data_amount_gb: number | null;
  validity_days: number;
  voice_minutes: number | null;
  sms_count: number | null;
  price_krw: number;
  features: string[] | null;
  airport_pickup: boolean;
  esim_support: boolean;
  physical_sim: boolean;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  carrier_name_ko?: string;
  carrier_name_en?: string;
}

export interface PlanFilters {
  carrier_id?: string;
  dataMin?: number;
  dataMax?: number;
  priceMin?: number;
  priceMax?: number;
  plan_type?: string;
  payment_type?: string; // 'prepaid' (선불) or 'postpaid' (후불)
  airport_pickup?: boolean;
  esim_support?: boolean;
  is_popular?: boolean;
  lang?: string; // Language code
}

interface PlansResponse {
  plans: Plan[];
}

interface PlanResponse {
  plan: Plan;
}

interface ComparePlansResponse {
  plans: Plan[];
}

export function usePlans(filters: PlanFilters = {}) {
  const { currentLanguage } = useLanguage();

  // Include current language in filters
  const filtersWithLang = {
    ...filters,
    lang: currentLanguage,
  };

  return useQuery<Plan[]>({
    queryKey: ["plans", filtersWithLang],
    queryFn: async () => {
      const data = await apiPost<PlansResponse>("/plans", filtersWithLang);
      return data.plans;
    },
    staleTime: 1000 * 60 * 10, // 10분 (5분 → 10분으로 증가)
    gcTime: 1000 * 60 * 30, // 30분 (이전 cacheTime, 가비지 컬렉션 시간)
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 재요청 비활성화
    refetchOnMount: false, // 마운트 시 재요청 비활성화 (캐시 사용)
  });
}

export function usePlan(planId: string) {
  const { currentLanguage } = useLanguage();

  return useQuery<Plan>({
    queryKey: ["plan", planId, currentLanguage],
    queryFn: async () => {
      const data = await apiPost<PlanResponse>(`/plans/${planId}`, { lang: currentLanguage });
      return data.plan;
    },
    enabled: !!planId,
    staleTime: 1000 * 60 * 10, // 10분
    gcTime: 1000 * 60 * 30, // 30분
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useComparePlans(planIds: string[]) {
  const { currentLanguage } = useLanguage();

  return useQuery<Plan[]>({
    queryKey: ["compare-plans", planIds.join(","), currentLanguage],
    queryFn: async () => {
      const data = await apiPost<ComparePlansResponse>("/plans/compare", {
        plan_ids: planIds,
        lang: currentLanguage,
      });
      return data.plans;
    },
    enabled: planIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5분 (비교는 자주 변경될 수 있음)
    gcTime: 1000 * 60 * 15, // 15분
    refetchOnWindowFocus: false,
  });
}

