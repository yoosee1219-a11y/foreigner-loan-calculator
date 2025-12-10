import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronRight, Filter } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useTips, useTipCategories, type Tip, type TipFilters } from "@/hooks/useTips";
import { Spinner } from "@/components/ui/spinner";
import { SEOHead } from "@/components/seo/SEOHead";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from "date-fns";

export default function Tips() {
  const { currentLanguage } = useLanguage();
  const { translations } = useTranslation();
  const [filters, setFilters] = useState<TipFilters>({ page: 1, limit: 10 });
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: tipsData, isLoading } = useTips({
    ...filters,
    category_id: selectedCategory,
    language: currentLanguage,
  });

  const { data: categories } = useTipCategories();

  const tips = tipsData?.tips || [];
  const total = tipsData?.total || 0;
  const currentPage = tipsData?.page || 1;
  const limit = tipsData?.limit || 10;
  const totalPages = Math.ceil(total / limit);

  // 카테고리 필터 변경
  const handleCategoryChange = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId);
    setFilters({ ...filters, page: 1 }); // 카테고리 변경 시 첫 페이지로
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "yyyy.MM.dd");
    } catch {
      return dateString;
    }
  };

  // 최신 꿀팁 (첫 번째, featured처럼 표시)
  const featuredTip = tips.length > 0 ? tips[0] : null;
  const otherTips = tips.slice(1);

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
        "name": "한국 통신 꿀팁",
        "item": {
          "@id": "https://koreausimguide.com/tips"
        }
      }
    ]
  };

  const collectionPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "한국 통신 꿀팁",
    "description": "한국 여행과 생활에 도움이 되는 유용한 통신 정보를 확인하세요.",
    "url": "https://koreausimguide.com/tips"
  };

  const structuredData = [breadcrumbStructuredData, collectionPageStructuredData];

  return (
    <Layout>
      <SEOHead
        title="한국 통신 꿀팁 | KOREAUSIMGUIDE"
        description="한국 여행과 생활에 도움이 되는 유용한 통신 정보를 확인하세요. 공항 수령, eSIM 활성화, 문제 해결 등 다양한 꿀팁을 제공합니다."
        canonical="https://koreausimguide.com/tips"
        structuredData={structuredData}
      />
      <div className="bg-secondary/30 py-16 border-b">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: translations.tips.title }]} />
          <h1 className="text-4xl font-heading font-bold mb-4">{translations.tips.title}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {translations.tips.description}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* 카테고리 필터 */}
        {categories && categories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{translations.tips.category}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(undefined)}
              >
                {translations.common.all}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Spinner />
          </div>
        )}

        {/* Featured Tip (최신) */}
        {!isLoading && featuredTip && (
          <>
            <h2 className="text-2xl font-heading font-bold mb-6">{translations.tips.featured}</h2>
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Link href={`/tips/${featuredTip.slug}`}>
              <div className="group relative rounded-2xl overflow-hidden aspect-video lg:aspect-[2/1] border cursor-pointer">
                <OptimizedImage
                  src={featuredTip.thumbnail_url}
                  alt={`${featuredTip.title} - 한국 통신 꿀팁 대표 이미지`}
                  width={800}
                  height={400}
                  loading="eager"
                  fetchPriority="high"
                  quality={85}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 800px"
                  fallbackSrc="https://koreausimguide.com/diverse_travelers_in_seoul_using_smartphones.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 flex flex-col justify-end text-white">
                  {featuredTip.category_name && (
                    <Badge className="w-fit mb-3 bg-primary hover:bg-primary/90 border-none text-primary-foreground">
                      {featuredTip.category_name}
                    </Badge>
                  )}
                  <h2 className="text-2xl font-bold mb-2 group-hover:text-primary-foreground transition-colors">
                    {featuredTip.title}
                  </h2>
                  {featuredTip.excerpt && (
                    <p className="text-gray-300 line-clamp-2 mb-4">{featuredTip.excerpt}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-400 gap-4">
                    {featuredTip.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(featuredTip.published_at)}
                      </span>
                    )}
                    <span>{translations.common.viewCount}: {featuredTip.view_count}</span>
                  </div>
                </div>
              </div>
            </Link>
            </div>
          </>
        )}

        {/* 다른 꿀팁 목록 */}
        {!isLoading && otherTips.length > 0 && (
          <>
            <h2 className="text-2xl font-heading font-bold mb-6">{translations.tips.allTips}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {otherTips.map((tip) => (
              <Link key={tip.id} href={`/tips/${tip.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1">
                  <div className="aspect-video relative overflow-hidden rounded-t-xl bg-secondary/50">
                    <OptimizedImage
                      src={tip.thumbnail_url}
                      alt={`${tip.title} - 한국 통신 꿀팁 이미지`}
                      width={400}
                      height={225}
                      loading="lazy"
                      quality={80}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                      fallbackSrc="https://koreausimguide.com/diverse_travelers_in_seoul_using_smartphones.png"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {tip.category_name && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          {tip.category_name}
                        </Badge>
                      )}
                      {tip.published_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(tip.published_at)}
                        </span>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                      {tip.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tip.excerpt && (
                      <CardDescription className="line-clamp-3">{tip.excerpt}</CardDescription>
                    )}
                    <div className="mt-4 text-xs text-muted-foreground">
                      {translations.common.viewCount}: {tip.view_count}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-muted-foreground group-hover:text-primary"
                    >
                      {translations.common.readMore} <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
              ))}
            </div>
          </>
        )}

        {/* 꿀팁 없음 */}
        {!isLoading && tips.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {translations.tips.noTips}
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {translations.common.previous}
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {translations.common.next}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
