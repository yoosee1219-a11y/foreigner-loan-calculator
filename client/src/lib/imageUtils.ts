/**
 * 이미지 URL을 WebP로 변환하고 CDN을 통해 제공
 * @param imageUrl 원본 이미지 URL
 * @param width 이미지 너비 (선택사항)
 * @param height 이미지 높이 (선택사항)
 * @param quality 이미지 품질 (1-100, 기본값: 80)
 * @returns 최적화된 이미지 URL
 */
export function getOptimizedImageUrl(
  imageUrl: string | null | undefined,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  // 이미지 URL이 없으면 기본 이미지 반환
  if (!imageUrl) {
    return getDefaultImageUrl();
  }

  // 이미 Unsplash CDN을 사용하는 경우
  if (imageUrl.includes('unsplash.com') || imageUrl.includes('images.unsplash.com')) {
    return optimizeUnsplashUrl(imageUrl, width, height, quality);
  }

  // Vercel Image Optimization 사용 (내부 이미지의 경우)
  if (imageUrl.startsWith('/') || imageUrl.includes('koreausimguide.com')) {
    return optimizeVercelImageUrl(imageUrl, width, height, quality);
  }

  // 외부 이미지의 경우 그대로 반환 (또는 다른 CDN 서비스 사용)
  return imageUrl;
}

/**
 * Unsplash 이미지 URL 최적화
 */
function optimizeUnsplashUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  try {
    const urlObj = new URL(url);
    
    // Unsplash URL 형식에 맞게 파라미터 추가
    if (width) urlObj.searchParams.set('w', width.toString());
    if (height) urlObj.searchParams.set('h', height.toString());
    urlObj.searchParams.set('q', quality.toString());
    urlObj.searchParams.set('fm', 'webp'); // WebP 포맷
    urlObj.searchParams.set('auto', 'format'); // 자동 포맷 최적화
    urlObj.searchParams.set('fit', 'crop'); // 크롭 모드
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Vercel Image Optimization 사용 (프로젝트 내 이미지)
 * 참고: Vercel의 Image Optimization은 Next.js와 함께 자동으로 제공되지만,
 * 다른 프레임워크에서는 이미지 최적화 서비스를 직접 구축하거나
 * Cloudinary, Imgix 등의 CDN을 사용해야 합니다.
 * 
 * 현재는 기본 URL 반환 (나중에 Cloudinary/CDN 통합 시 수정)
 */
function optimizeVercelImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  // Cloudinary 환경 변수가 설정되어 있으면 사용
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (cloudName) {
    return optimizeCloudinaryUrl(url, cloudName, width, height, quality);
  }

  // 일단 기본 URL 반환 (나중에 Cloudinary/CDN 통합 시 수정)
  return url;
}

/**
 * Cloudinary 이미지 최적화
 */
function optimizeCloudinaryUrl(
  url: string,
  cloudName: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  try {
    const transformations = [
      `q_${quality}`,
      'f_webp', // WebP 포맷
      width && `w_${width}`,
      height && `h_${height}`,
      'c_limit', // 비율 유지하며 크기 제한
    ].filter(Boolean).join(',');

    const encodedUrl = encodeURIComponent(url.startsWith('http') ? url : `https://koreausimguide.com${url}`);
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${encodedUrl}`;
  } catch {
    return url;
  }
}

/**
 * 기본 이미지 URL 반환
 */
function getDefaultImageUrl(): string {
  return '/diverse_travelers_in_seoul_using_smartphones.png';
}

/**
 * WebP 지원 여부 확인
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * 반응형 이미지 srcset 생성
 * @param baseUrl 기본 이미지 URL
 * @param sizes 크기 배열 (예: [400, 800, 1200])
 * @returns srcset 문자열
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[] = [400, 800, 1200]
): string {
  return sizes
    .map((size) => `${getOptimizedImageUrl(baseUrl, size)} ${size}w`)
    .join(', ');
}

