/**
 * Core Web Vitals 최적화 유틸리티
 */

/**
 * 이미지가 로드될 때까지 플레이스홀더 표시 (CLS 방지)
 */
export function preventImageLayoutShift(img: HTMLImageElement) {
  if (!img.width || !img.height) {
    // 이미지 크기가 지정되지 않은 경우 aspect-ratio 설정
    img.style.aspectRatio = '16 / 9'; // 기본 비율
  }
}

/**
 * 폰트 로딩 상태 확인 (FID 최적화)
 */
export function optimizeFontLoading() {
  if ('fonts' in document) {
    // 폰트가 로드되면 body에 클래스 추가
    Promise.all([
      (document as any).fonts.load('400 1em Outfit'),
      (document as any).fonts.load('400 1em Inter'),
      (document as any).fonts.load('400 1em Noto Sans KR'),
    ]).then(() => {
      document.documentElement.classList.add('fonts-loaded');
    }).catch(() => {
      // 폰트 로드 실패 시에도 진행
      document.documentElement.classList.add('fonts-loaded');
    });
  }
}

/**
 * 레이아웃 시프트 방지를 위한 스켈레톤 UI 생성
 */
export function createSkeletonElement(
  width?: string,
  height?: string,
  className?: string
): HTMLDivElement {
  const skeleton = document.createElement('div');
  skeleton.className = `animate-pulse bg-secondary/50 ${className || ''}`;
  if (width) skeleton.style.width = width;
  if (height) skeleton.style.height = height;
  return skeleton;
}

/**
 * 이미지 lazy loading 최적화 (LCP 개선)
 */
export function optimizeImageLoading() {
  if ('loading' in HTMLImageElement.prototype) {
    // 네이티브 lazy loading 지원
    const images = document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]');
    images.forEach(img => {
      // 이미지가 viewport 근처에 있으면 preload
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              // 이미지가 가까이 오면 srcset 업데이트
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
              }
              observer.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px' // 50px 전에 미리 로드
        });
        observer.observe(img);
      }
    });
  }
}

/**
 * JavaScript 실행 최적화 (FID 개선)
 * 이벤트 핸들러를 최적화하여 첫 입력 지연 감소
 */
export function optimizeEventHandlers() {
  // 패시브 이벤트 리스너 사용 (스크롤 성능 개선)
  const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
  
  passiveEvents.forEach(eventType => {
    document.addEventListener(eventType, () => {}, { passive: true });
  });
}

/**
 * Core Web Vitals 초기화
 */
export function initWebVitalsOptimization() {
  // 폰트 로딩 최적화
  optimizeFontLoading();
  
  // 이미지 로딩 최적화
  if (typeof window !== 'undefined') {
    optimizeImageLoading();
    optimizeEventHandlers();
  }
}

