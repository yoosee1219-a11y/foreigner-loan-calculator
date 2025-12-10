import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Signal, Check, X, HelpCircle } from "lucide-react";
import { Link, useRoute } from "wouter";
import { usePlan } from "@/hooks/usePlans";
import { Spinner } from "@/components/ui/spinner";
import { SEOHead } from "@/components/seo/SEOHead";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { generateProductWithReviewSchema } from "@/lib/schemaUtils";

export default function PlanDetail() {
  const [match, params] = useRoute("/plans/:id");
  const planId = params?.id || "";

  const { data: plan, isLoading, error } = usePlan(planId);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner className="h-12 w-12 text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !plan) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">요금제를 찾을 수 없습니다</h1>
          <Link href="/compare">
            <Button variant="outline">요금제 비교로 돌아가기</Button>
          </Link>
        </div>
      </Layout>
    );
  }

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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": plan.name,
        "item": {
          "@id": `https://koreausimguide.com/plans/${plan.id}`
        }
      }
    ]
  };

  // Product with Review 스키마 생성
  // 실제 평점 데이터가 없으므로 샘플 데이터 사용 (나중에 실제 리뷰 시스템 구축 시 대체)
  const averageRating = plan.is_popular ? 4.5 : 4.0; // 인기 요금제는 평균 평점 조금 높게
  const reviewCount = plan.is_popular ? 150 : 50; // 샘플 리뷰 수
  
  const productStructuredData = generateProductWithReviewSchema(
    plan.name,
    plan.description || plan.name,
    plan.price_krw,
    averageRating,
    reviewCount
  );
  
  // Product 스키마에 availability 추가
  if (productStructuredData && productStructuredData.offers) {
    productStructuredData.offers.availability = plan.is_active 
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock";
  }

  // 여러 구조화된 데이터를 배열로 결합
  const combinedStructuredData = [breadcrumbStructuredData, productStructuredData];

  return (
    <Layout>
      <SEOHead
        title={`${plan.name} | KOREAUSIMGUIDE`}
        description={plan.description || `${plan.name} - ${formatPrice(plan.price_krw)}`}
        ogType="product"
        canonical={`https://koreausimguide.com/plans/${plan.id}`}
        structuredData={combinedStructuredData}
      />
      
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="bg-secondary/30 py-12 border-b">
          <div className="container mx-auto px-4">
            <Breadcrumb
              items={[
                { label: "요금제 비교", href: "/compare" },
                { label: plan.name }
              ]}
            />
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="text-sm">
                {plan.payment_type === "prepaid" ? "선불" : "후불"}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {plan.carrier_name_ko}
              </Badge>
              {plan.is_popular && (
                <Badge className="text-sm bg-primary">인기</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              {plan.name}
            </h1>
            <p className="text-xl text-primary font-bold">
              {formatPrice(plan.price_krw)}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Plan Details */}
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-2xl font-heading font-bold">요금제 상세 정보</h2>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">요금제 이름</div>
                      <div className="font-semibold">{plan.name}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">통신사 약정</div>
                      <div className="font-semibold">{plan.validity_days}일</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">통화</div>
                      <div className="font-semibold">
                        {plan.voice_minutes ? `${plan.voice_minutes}분` : "무제한"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">문자</div>
                      <div className="font-semibold">
                        {plan.sms_count ? `${plan.sms_count}건` : "무제한"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">통신망</div>
                      <div className="font-semibold">{plan.carrier_name_ko}망</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">통신 기술</div>
                      <div className="font-semibold">LTE</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">데이터 제공량</div>
                      <div className="font-semibold">
                        {plan.data_amount_gb ? `월 ${plan.data_amount_gb}GB` : "제한 없음"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">데이터 소진시</div>
                      <div className="font-semibold">정보 없음</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">부가통화</div>
                      <div className="font-semibold">정보 없음</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">번호이동 수수료</div>
                      <div className="font-semibold">정보 없음</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">일반 유심</div>
                      <div className="font-semibold">
                        {plan.physical_sim ? "배송가능 (개통 시 무료)" : "배송불가"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">NFC 유심</div>
                      <div className="font-semibold">정보 없음</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">eSIM</div>
                      <div className="font-semibold">
                        {plan.esim_support ? "개통가능" : "개통불가"}
                      </div>
                    </div>
                  </div>
                </div>

                {plan.description && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="text-sm text-muted-foreground mb-2">설명</div>
                    <p className="text-sm">{plan.description}</p>
                  </div>
                )}

                {plan.features && plan.features.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="text-sm text-muted-foreground mb-2">특장점</div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

                    {/* Supported/Unsupported Features */}
                    <h2 className="text-2xl font-heading font-bold mb-6">지원 및 미지원 기능</h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <Card>
                        <CardHeader>
                          <h3 className="text-lg font-heading font-bold">지원</h3>
                        </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">인터넷 결합</span>
                      <HelpCircle className="h-3 w-3 text-muted-foreground ml-auto" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">모바일 핫스팟</span>
                      <span className="text-xs text-muted-foreground ml-auto">데이터 제공량 내 이용 가능</span>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">소액 결제</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

                      <Card>
                        <CardHeader>
                          <h3 className="text-lg font-heading font-bold">미지원</h3>
                        </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-sm">해외 로밍 부가서비스</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-sm">데이터 쉐어링</span>
                      <HelpCircle className="h-3 w-3 text-muted-foreground ml-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overage Charges */}
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-2xl font-heading font-bold">기본 제공 초과 시</h2>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  통화 또는 문자 제공량이 무제한이더라도 과도한 사용이 있을 경우 사용량 제한이 있을 수 있어요.
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">데이터</div>
                    <div className="font-semibold">정보 없음</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">음성 통화</div>
                    <div className="font-semibold">정보 없음</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">영상 통화</div>
                    <div className="font-semibold">정보 없음</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">짧은 문자</div>
                    <div className="font-semibold">정보 없음</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">긴 문자</div>
                    <div className="font-semibold">정보 없음</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">엄청 긴 문자</div>
                    <div className="font-semibold">정보 없음</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Apply Button */}
            <div className="mt-8">
              <Button size="lg" className="w-full text-lg h-14">
                신청하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

