import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink, Signal, Filter, X, GitCompare as CompareIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { usePlans, useComparePlans, type Plan, type PlanFilters } from "@/hooks/usePlans";
import { Spinner } from "@/components/ui/spinner";
import { SEOHead } from "@/components/seo/SEOHead";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { CustomCheckbox } from "@/components/ui/CustomCheckbox";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

// 통신사 데이터 (API에서 가져올 수도 있지만 일단 하드코딩)
const carriers = [
  { id: "sk", name: "SK텔레콤" },
  { id: "kt", name: "KT" },
  { id: "lg", name: "LG유플러스" },
  { id: "altelecom", name: "알뜰폰" },
];

export default function Compare() {
  const { translations } = useTranslation();
  const [filters, setFilters] = useState<PlanFilters>({});
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const { data: plans, isLoading, error } = usePlans(filters);
  const { data: comparePlans } = useComparePlans(selectedPlans);

  // 필터 초기화
  const resetFilters = () => {
    setFilters({});
  };

  // 요금제 선택/해제
  const togglePlanSelection = (planId: string) => {
    setSelectedPlans((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
  };

  // 비교 모달 닫기
  const closeComparison = () => {
    setShowComparison(false);
    setSelectedPlans([]);
  };

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  // 데이터량 포맷팅 (개선: features에서 소진 후 속도 정보 추출)
  const formatData = (plan: Plan) => {
    const gb = plan.data_amount_gb;
    const baseText = gb === null ? translations.compare.plan.unlimited : `${gb}GB`;

    // features에서 "데이터 소진 시" 또는 "소진시" 정보 찾기
    if (plan.features && Array.isArray(plan.features)) {
      const overageFeature = plan.features.find(
        (f: string) =>
          f.includes("소진") ||
          f.includes("소진시") ||
          f.includes("데이터 소진") ||
          (f.includes("Mbps") && (f.includes("무제한") || f.includes("제한")))
      );

      if (overageFeature) {
        // "데이터 소진 시 3Mbps 무제한" 같은 텍스트 추출
        let overageText = overageFeature
          .replace(/데이터\s*소진\s*시?/i, "")
          .replace(/소진\s*시?/i, "")
          .replace(/.*?(\d+\s*Mbps.*?)/i, "$1")
          .trim();

        // "3Mbps 무제한" 형식으로 정리
        if (overageText && !overageText.includes("소진")) {
          return `${baseText} + ${translations.compare.plan.afterDepletion} ${overageText}`;
        }
      }
    }

    return baseText;
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "홈",
        "item": {
          "@id": "https://koreausimguide.com"
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "요금제 비교",
        "item": {
          "@id": "https://koreausimguide.com/compare"
        }
      }
    ]
  };

  const webPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "한국 유심/eSIM 요금제 비교",
    "description": "SK, KT, LG 등 한국 통신사 요금제를 비교하고 최적의 유심/eSIM을 찾아보세요.",
    "url": "https://koreausimguide.com/compare"
  };

  const structuredData = [breadcrumbStructuredData, webPageStructuredData];

  return (
    <Layout>
      <SEOHead
        title="한국 유심/eSIM 요금제 비교 | KOREAUSIMGUIDE"
        description="SK, KT, LG 등 한국 통신사 요금제를 비교하고 최적의 유심/eSIM을 찾아보세요. 데이터, 가격, 유효기간을 한눈에 비교할 수 있습니다."
        canonical="https://koreausimguide.com/compare"
        structuredData={structuredData}
      />
      <div className="bg-gradient-to-br from-primary/5 via-background to-primary/5 py-16 border-b">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: translations.compare.title }]} />
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {translations.compare.title}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {translations.compare.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="sr-only">필터 및 검색</h2>
        {/* 필터 UI */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? translations.compare.filters.hide : translations.compare.filters.show}
            </Button>
          </div>

          {/* 비교하기 버튼 - 스크롤 따라오는 fixed 버튼 */}
          {selectedPlans.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-center gap-3 bg-background/95 backdrop-blur-md border-2 border-primary/30 rounded-xl p-4 shadow-2xl max-w-fit">
                <span className="text-sm font-semibold text-foreground bg-primary/10 px-4 py-2 rounded-full border border-primary/30">
                  {selectedPlans.length}{translations.compare.selection.selected}
                </span>
                <Button
                  variant="default"
                  onClick={() => setShowComparison(true)}
                  className="gap-2 shadow-lg hover:shadow-xl transition-all text-base font-semibold px-6 py-2 h-auto"
                  size="lg"
                >
                  <CompareIcon className="h-5 w-5" />
                  {translations.compare.selection.compareButton}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPlans([])}
                  className="hover:bg-destructive/10 hover:text-destructive rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {showFilters && (
            <Card className="p-6 mb-4 shadow-lg border-2 bg-gradient-to-br from-background to-secondary/20">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 통신사 필터 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{translations.compare.filters.carrier}</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.carrier_id || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        carrier_id: e.target.value || undefined,
                      })
                    }
                  >
                    <option value="">{translations.common.all}</option>
                    {carriers.map((carrier) => (
                      <option key={carrier.id} value={carrier.id}>
                        {carrier.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 데이터량 최소 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{translations.compare.filters.minData}</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.dataMin || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        dataMin: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="예: 10"
                  />
                </div>

                {/* 데이터량 최대 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{translations.compare.filters.maxData}</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.dataMax || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        dataMax: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="예: 50"
                  />
                </div>

                {/* 가격 범위 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{translations.compare.filters.maxPrice}</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.priceMax || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceMax: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="예: 100000"
                  />
                </div>

                {/* 공항 수령 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{translations.compare.filters.airportPickup}</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.airport_pickup === undefined ? "" : filters.airport_pickup ? "true" : "false"}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        airport_pickup: e.target.value === "" ? undefined : e.target.value === "true",
                      })
                    }
                  >
                    <option value="">{translations.common.all}</option>
                    <option value="true">{translations.compare.filters.available}</option>
                    <option value="false">{translations.compare.filters.unavailable}</option>
                  </select>
                </div>

                {/* eSIM 지원 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{translations.compare.filters.esimSupport}</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.esim_support === undefined ? "" : filters.esim_support ? "true" : "false"}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        esim_support: e.target.value === "" ? undefined : e.target.value === "true",
                      })
                    }
                  >
                    <option value="">{translations.common.all}</option>
                    <option value="true">{translations.compare.filters.supported}</option>
                    <option value="false">{translations.compare.filters.unsupported}</option>
                  </select>
                </div>

                {/* 결제 방식 (선불/후불) */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{translations.compare.filters.paymentType}</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.payment_type || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        payment_type: e.target.value || undefined,
                      })
                    }
                  >
                    <option value="">{translations.common.all}</option>
                    <option value="prepaid">{translations.compare.filters.prepaid}</option>
                    <option value="postpaid">{translations.compare.filters.postpaid}</option>
                  </select>
                </div>

                {/* 인기 요금제 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{translations.compare.filters.popular}</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.is_popular === undefined ? "" : filters.is_popular ? "true" : "false"}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        is_popular: e.target.value === "" ? undefined : e.target.value === "true",
                      })
                    }
                  >
                    <option value="">{translations.common.all}</option>
                    <option value="true">{translations.compare.filters.popularOnly}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={resetFilters} variant="outline" size="sm">
                  {translations.compare.filters.reset}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Spinner />
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-12 text-red-500">
            {translations.compare.error}
          </div>
        )}

        {/* 요금제 목록 */}
        {!isLoading && !error && plans && plans.length > 0 && (
          <>
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8 text-center md:text-left">
              {translations.compare.recommended}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "flex flex-col relative overflow-hidden border-2 transition-all duration-300 group",
                  "bg-gradient-to-br from-background via-background to-secondary/10",
                  "hover:shadow-xl hover:-translate-y-1",
                  selectedPlans.includes(plan.id)
                    ? "border-primary ring-4 ring-primary/30 shadow-2xl shadow-primary/20 scale-[1.02] bg-gradient-to-br from-primary/5 via-background to-primary/5"
                    : "border-border/50 hover:border-primary/60 hover:shadow-lg"
                )}
              >
                {plan.is_popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10 shadow-lg">
                    {translations.compare.plan.popular}
                  </div>
                )}

                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* 선택 체크박스 - 배지들과 나란히 배치 */}
                      <CustomCheckbox
                        checked={selectedPlans.includes(plan.id)}
                        onChange={() => togglePlanSelection(plan.id)}
                        className="backdrop-blur-sm shrink-0"
                      />
                      
                      {/* 결제 방식 배지 - 지원하는 것만 표시 */}
                      {plan.payment_type === "prepaid" && (
                        <Badge variant="outline" className="font-medium text-xs px-2.5 py-0.5 border-primary/30 bg-primary/5 text-primary">
                          {translations.compare.filters.prepaid}
                        </Badge>
                      )}
                      {plan.payment_type === "postpaid" && (
                        <Badge variant="outline" className="font-medium text-xs px-2.5 py-0.5 border-primary/30 bg-primary/5 text-primary">
                          {translations.compare.filters.postpaid}
                        </Badge>
                      )}
                      
                      {/* SIM 타입 배지 - 지원하는 것만 표시 */}
                      {plan.physical_sim && (
                        <Badge variant="outline" className="font-medium text-xs px-2.5 py-0.5 border-blue-300 bg-blue-50 text-blue-700">
                          USIM
                        </Badge>
                      )}
                      {plan.esim_support && (
                        <Badge variant="outline" className="font-medium text-xs px-2.5 py-0.5 border-purple-300 bg-purple-50 text-purple-700">
                          eSIM
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-muted-foreground text-xs font-medium">
                      <Signal className="h-3.5 w-3.5 mr-1.5 text-primary" /> {plan.carrier_name_ko}
                    </div>
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-bold mb-2 leading-tight">{plan.name}</CardTitle>
                  <CardDescription className="font-bold text-foreground mt-2 text-2xl text-primary">
                    {formatPrice(plan.price_krw)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-sm">
                      <div className="text-xs text-muted-foreground mb-1.5 font-medium">{translations.compare.plan.data}</div>
                      <div className="font-bold text-lg text-foreground">{formatData(plan)}</div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-secondary/60 to-secondary/30 rounded-xl border border-border/50 shadow-sm">
                      <div className="text-xs text-muted-foreground mb-1.5 font-medium">{translations.compare.plan.validity}</div>
                      <div className="font-bold text-lg text-foreground">{plan.validity_days}{translations.compare.plan.days}</div>
                    </div>

                    {plan.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {plan.description}
                      </p>
                    )}

                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-2.5 mt-4">
                        {plan.features.slice(0, 3).map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm text-foreground/80"
                          >
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0 stroke-[3]" />
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* 기타 배지 (공항 수령만) */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {plan.airport_pickup && (
                        <Badge variant="secondary" className="text-xs px-3 py-1 bg-green-50 text-green-700 border-green-200">
                          ✈️ {translations.compare.filters.airportPickup}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-6 flex gap-3">
                  <Link href={`/plans/${plan.id}`} className="flex-1">
                    <Button variant="outline" className="w-full shadow-sm hover:shadow-md transition-all hover:bg-secondary">
                      {translations.compare.plan.details}
                    </Button>
                  </Link>
                  <Button
                    className={cn(
                      "flex-1 text-base font-semibold transition-all shadow-md hover:shadow-lg",
                      selectedPlans.includes(plan.id)
                        ? "bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90"
                        : "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    )}
                    onClick={() => togglePlanSelection(plan.id)}
                  >
                    {selectedPlans.includes(plan.id) ? translations.compare.selection.inComparison : translations.compare.selection.addToCompare}
                  </Button>
                </CardFooter>
              </Card>
            ))}
            </div>
          </>
        )}

        {/* 요금제 없음 */}
        {!isLoading && !error && plans && plans.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {translations.compare.noResults}
          </div>
        )}
      </div>

      {/* 비교 모달 */}
      {showComparison && comparePlans && comparePlans.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={closeComparison}>
          <Card 
            className="w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-primary/30 bg-background animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/10 border-b-2 border-primary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
                  {translations.compare.modal.title}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={closeComparison} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-background">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-primary/40 bg-gradient-to-r from-primary/15 to-primary/5">
                      <th className="text-left p-4 font-bold text-foreground text-base">{translations.compare.modal.item}</th>
                      {comparePlans.map((plan) => (
                        <th key={plan.id} className="text-left p-4 font-bold border-l border-border/50">
                          <div className="text-base md:text-lg font-bold text-foreground">{plan.name}</div>
                          <div className="text-sm font-medium text-muted-foreground mt-1">
                            {plan.carrier_name_ko}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50 hover:bg-secondary/50 transition-colors bg-background">
                      <td className="p-4 font-bold text-foreground bg-secondary/30">{translations.compare.modal.price}</td>
                      {comparePlans.map((plan) => (
                        <td key={plan.id} className="p-4 text-primary font-bold text-lg border-l border-border/50">
                          {formatPrice(plan.price_krw)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-secondary/50 transition-colors bg-background">
                      <td className="p-4 font-bold text-foreground bg-secondary/30">{translations.compare.modal.data}</td>
                      {comparePlans.map((plan) => (
                        <td key={plan.id} className="p-4 font-semibold text-foreground border-l border-border/50">
                          {formatData(plan)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-secondary/50 transition-colors bg-background">
                      <td className="p-4 font-bold text-foreground bg-secondary/30">{translations.compare.modal.validity}</td>
                      {comparePlans.map((plan) => (
                        <td key={plan.id} className="p-4 font-semibold text-foreground border-l border-border/50">
                          {plan.validity_days}{translations.compare.plan.days}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-secondary/50 transition-colors bg-background">
                      <td className="p-4 font-bold text-foreground bg-secondary/30">{translations.compare.modal.paymentType}</td>
                      {comparePlans.map((plan) => (
                        <td key={plan.id} className="p-4 border-l border-border/50">
                          <Badge variant="outline" className="text-xs px-3 py-1 border-primary/50 bg-primary/10 text-primary font-semibold">
                            {plan.payment_type === "prepaid" ? translations.compare.filters.prepaid : translations.compare.filters.postpaid}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-secondary/50 transition-colors bg-background">
                      <td className="p-4 font-bold text-foreground bg-secondary/30">{translations.compare.modal.airportPickup}</td>
                      {comparePlans.map((plan) => (
                        <td key={plan.id} className="p-4 border-l border-border/50">
                          {plan.airport_pickup ? (
                            <span className="text-green-700 font-bold text-base">✓ {translations.compare.filters.available}</span>
                          ) : (
                            <span className="text-muted-foreground font-medium">✗ {translations.compare.filters.unavailable}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-secondary/50 transition-colors bg-background">
                      <td className="p-4 font-bold text-foreground bg-secondary/30">{translations.compare.modal.simType}</td>
                      {comparePlans.map((plan) => (
                        <td key={plan.id} className="p-4 border-l border-border/50">
                          <div className="flex flex-wrap gap-2">
                            {plan.physical_sim && (
                              <Badge variant="secondary" className="text-xs px-3 py-1 bg-blue-100 text-blue-800 border-blue-300 font-semibold">USIM</Badge>
                            )}
                            {plan.esim_support && (
                              <Badge variant="secondary" className="text-xs px-3 py-1 bg-purple-100 text-purple-800 border-purple-300 font-semibold">eSIM</Badge>
                            )}
                            {!plan.physical_sim && !plan.esim_support && (
                              <span className="text-muted-foreground text-sm font-medium">-</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    {comparePlans.some((p) => p.features && p.features.length > 0) && (
                      <tr className="border-b border-border/50 bg-background">
                        <td className="p-4 font-bold text-foreground bg-secondary/30">{translations.compare.modal.features}</td>
                        {comparePlans.map((plan) => (
                          <td key={plan.id} className="p-4 border-l border-border/50">
                            {plan.features && plan.features.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1.5">
                                {plan.features.map((feature, i) => (
                                  <li key={i} className="text-sm text-foreground font-medium leading-relaxed">
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground font-medium">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}
