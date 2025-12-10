import { useState, useEffect } from 'react';
import { getOptimizedImageUrl, generateSrcSet } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  fallbackSrc?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string; // 반응형 이미지를 위한 sizes 속성
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  fallbackSrc,
  className,
  loading = 'lazy',
  fetchPriority = 'auto',
  sizes,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(() => {
    if (!src) return fallbackSrc || getOptimizedImageUrl(null);
    return getOptimizedImageUrl(src, width, height, quality);
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageSrc(fallbackSrc || getOptimizedImageUrl(null));
      return;
    }
    setImageSrc(getOptimizedImageUrl(src, width, height, quality));
    setHasError(false);
  }, [src, width, height, quality, fallbackSrc]);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setImageSrc(getOptimizedImageUrl(fallbackSrc, width, height, quality));
      setHasError(true);
    } else if (!hasError && src !== getOptimizedImageUrl(null)) {
      // 최종 폴백 이미지로 전환
      setImageSrc(getOptimizedImageUrl(null));
      setHasError(true);
    } else {
      // 모든 이미지 로드 실패 시 플레이스홀더 표시
      setImageSrc('');
    }
  };

  // 이미지가 없으면 플레이스홀더 표시
  if (!imageSrc) {
    return (
      <div
        className={cn(
          'bg-secondary/50 flex items-center justify-center',
          className
        )}
        style={{ 
          width: width || '100%', 
          height: height || 'auto', 
          aspectRatio: width && height ? `${width}/${height}` : undefined 
        }}
        aria-label={alt}
      >
        <span className="text-muted-foreground text-sm">이미지 없음</span>
      </div>
    );
  }

  // 반응형 이미지를 위한 srcset 생성
  const srcSet = width && height 
    ? generateSrcSet(src || '', [Math.floor(width * 0.5), width, Math.floor(width * 1.5)])
    : undefined;

  return (
    <img
      src={imageSrc}
      srcSet={srcSet}
      sizes={sizes || (width ? `${width}px` : '100vw')}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
      onError={handleError}
      style={{
        // CLS 방지: 이미지 로드 전 공간 확보
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
        // 레이아웃 시프트 방지
        objectFit: 'cover',
        ...props.style,
      }}
      {...props}
    />
  );
}

