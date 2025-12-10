import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Share2, Eye } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useTipBySlug, useTips } from "@/hooks/useTips";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo/SEOHead";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import {
  generateHowToSchema,
  extractFAQsFromContent,
  generateFAQSchema,
  generateTOC
} from "@/lib/schemaUtils";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { TableOfContents } from "@/components/content/TableOfContents";
import { format } from "date-fns";

export default function TipDetail() {
  const { currentLanguage } = useLanguage();
  const { translations } = useTranslation();
  const [match, params] = useRoute("/tips/:id");
  const tipIdOrSlug = params?.id || "";

  // 슬러그 또는 ID로 꿀팁 조회 (현재 선택된 언어)
  const { data: tip, isLoading, error } = useTipBySlug(tipIdOrSlug, currentLanguage);

  // 관련 꿀팁 (같은 카테고리, 최신 3개, 현재 선택된 언어)
  const { data: relatedTipsData } = useTips({
    category_id: tip?.category_id,
    limit: 3,
    page: 1,
    language: currentLanguage,
  });
  const relatedTips = relatedTipsData?.tips?.filter((t) => t.id !== tip?.id).slice(0, 3) || [];

  // 날짜 포맷팅
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "yyyy년 MM월 dd일");
    } catch {
      return dateString;
    }
  };

  // 읽기 시간 계산 (대략적으로)
  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${translations.tipDetail.readTime} ${minutes}분`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner />
        </div>
      </Layout>
    );
  }

  if (error || !tip) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">{translations.tipDetail.notFound.title}</h1>
          <p className="text-muted-foreground mb-8">{translations.tipDetail.notFound.description}</p>
          <Link href="/tips">
            <Button>{translations.tipDetail.notFound.button}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Breadcrumb Structured Data
  const breadcrumbStructuredData = tip ? {
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tip.title,
        "item": {
          "@id": `https://koreausimguide.com/tips/${tip.slug || tip.id}`
        }
      }
    ]
  } : null;

  // Structured Data for Article
  const articleStructuredData = tip ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": tip.title,
    "description": tip.excerpt || tip.title,
    "image": tip.thumbnail_url || "https://koreausimguide.com/diverse_travelers_in_seoul_using_smartphones.png",
    "datePublished": tip.published_at || tip.created_at,
    "dateModified": tip.updated_at,
    "author": {
      "@type": "Organization",
      "name": "KOREAUSIMGUIDE"
    },
    "publisher": {
      "@type": "Organization",
      "name": "KOREAUSIMGUIDE",
      "logo": {
        "@type": "ImageObject",
        "url": "https://koreausimguide.com/favicon.png"
      }
    }
  } : null;

  // HowTo 스키마 생성 (마크다운 콘텐츠에서 단계 추출)
  const howToSchema = tip ? generateHowToSchema(tip.content, tip.title, tip.excerpt || undefined) : null;

  // FAQ 자동 추출 및 스키마 생성
  const faqs = tip ? extractFAQsFromContent(tip.content) : [];
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;

  // 목차(TOC) 생성
  const toc = tip ? generateTOC(tip.content) : [];

  // 여러 구조화된 데이터를 배열로 결합
  const structuredDataArray = [];
  if (tip && breadcrumbStructuredData) structuredDataArray.push(breadcrumbStructuredData);
  if (articleStructuredData) structuredDataArray.push(articleStructuredData);
  if (howToSchema) structuredDataArray.push(howToSchema);
  if (faqSchema) structuredDataArray.push(faqSchema);
  
  const combinedStructuredData = structuredDataArray.length > 0 ? structuredDataArray : null;

  return (
    <Layout>
      {tip && (
        <SEOHead
          title={`${tip.title} | KOREAUSIMGUIDE`}
          description={tip.excerpt || tip.title}
          keywords={tip.seo_meta?.keywords?.join(", ") || "한국 유심, 한국 eSIM, 한국 통신"}
          ogType="article"
          ogImage={tip.thumbnail_url || "https://koreausimguide.com/diverse_travelers_in_seoul_using_smartphones.png"}
          canonical={`https://koreausimguide.com/tips/${tip.slug || tip.id}`}
          structuredData={combinedStructuredData}
        />
      )}
      <article className="min-h-screen pb-20">
        {/* Hero Image */}
        <div className="w-full h-[40vh] md:h-[50vh] relative bg-secondary/50">
          <OptimizedImage
            src={tip.thumbnail_url}
            alt={`${tip.title} - 한국 통신 꿀팁 대표 이미지`}
            width={1200}
            height={630}
            loading="eager"
            fetchPriority="high"
            quality={85}
            className="w-full h-full object-cover"
            sizes="100vw"
            fallbackSrc="https://koreausimguide.com/diverse_travelers_in_seoul_using_smartphones.png"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>

          <div className="absolute top-6 left-4 md:left-8">
            <Link href="/tips">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 shadow-lg backdrop-blur-md bg-background/50 hover:bg-background/80"
              >
                <ArrowLeft className="h-4 w-4" /> {translations.common.backToList}
              </Button>
            </Link>
          </div>
        </div>

        <div className={`container mx-auto px-4 ${tip.thumbnail_url ? "-mt-20" : "pt-12"} relative z-10`}>
          <div className="max-w-3xl mx-auto bg-background rounded-3xl shadow-xl border p-6 md:p-12">
            {!tip.thumbnail_url && (
              <Breadcrumb
                items={[
                  { label: "한국 통신 꿀팁", href: "/tips" },
                  { label: tip.title }
                ]}
              />
            )}
            {/* 카테고리 및 메타 정보 */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              {tip.category_name && (
                <Badge className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium">
                  {tip.category_name}
                </Badge>
              )}
              <div className="flex items-center gap-4 text-muted-foreground text-sm flex-wrap">
                {tip.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {formatDate(tip.published_at)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" /> {translations.common.viewCount} {tip.view_count}
                </span>
                <span className="flex items-center gap-1">
                  {estimateReadTime(tip.content)}
                </span>
              </div>
            </div>

            {/* 제목 */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-8 leading-tight">
              {tip.title}
            </h1>

            {/* 요약 */}
            {tip.excerpt && (
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed border-l-4 border-primary pl-4">
                {tip.excerpt}
              </p>
            )}

            {/* 목차 (TOC) */}
            {toc.length > 0 && <TableOfContents items={toc} />}

            {/* 본문 (마크다운 렌더링) */}
            <div className="mb-12">
              <MarkdownRenderer content={tip.content} />
            </div>

            {/* 공유 및 하단 */}
            <div className="mt-12 pt-8 border-t flex justify-between items-center flex-wrap gap-4">
              <div className="text-muted-foreground text-sm">
                {translations.tipDetail.helpful}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: tip.title,
                      text: tip.excerpt || "",
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert(translations.tipDetail.linkCopied);
                  }
                }}
              >
                <Share2 className="h-4 w-4" /> {translations.common.share}
              </Button>
            </div>
          </div>

          {/* 관련 꿀팁 */}
          {relatedTips.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8">{translations.tipDetail.relatedTips}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedTips.map((relatedTip) => (
                  <Link key={relatedTip.id} href={`/tips/${relatedTip.slug}`}>
                    <div className="group cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className="aspect-video relative overflow-hidden bg-secondary/50">
                        <OptimizedImage
                          src={relatedTip.thumbnail_url}
                          alt={`${relatedTip.title} - 관련 한국 통신 꿀팁 이미지`}
                          width={400}
                          height={225}
                          loading="lazy"
                          quality={80}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                          fallbackSrc="https://koreausimguide.com/diverse_travelers_in_seoul_using_smartphones.png"
                        />
                      </div>
                      <div className="p-4">
                        {relatedTip.category_name && (
                          <Badge variant="secondary" className="text-xs mb-2">
                            {relatedTip.category_name}
                          </Badge>
                        )}
                        <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedTip.title}
                        </h3>
                        {relatedTip.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relatedTip.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </Layout>
  );
}
