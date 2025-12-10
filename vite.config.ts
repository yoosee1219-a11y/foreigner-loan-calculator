import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(async () => {
  // 기본 플러그인 배열
  const plugins: any[] = [react(), tailwindcss()];

  // Replit 환경에서만 runtimeErrorOverlay 플러그인 추가
  // 프로덕션 빌드나 Vercel 환경에서는 제외
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
    try {
      const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal");
      plugins.splice(1, 0, runtimeErrorOverlay.default());
    } catch (error) {
      // 패키지가 없거나 로드 실패 시 무시 (Vercel 빌드 환경 등)
      // 에러를 출력하지 않음 (정상적인 상황)
    }
  }

  return {
    plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
      minify: 'esbuild', // esbuild 사용 (terser보다 빠르고 기본 포함)
      rollupOptions: {
        output: {
          manualChunks: {
            // React와 React DOM을 별도 청크로 분리
            'react-vendor': ['react', 'react-dom'],
            // React Query를 별도 청크로 분리
            'react-query': ['@tanstack/react-query'],
            // Radix UI 컴포넌트들을 별도 청크로 분리
            'radix-ui': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-aspect-ratio',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-collapsible',
              '@radix-ui/react-context-menu',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-hover-card',
              '@radix-ui/react-label',
              '@radix-ui/react-menubar',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slider',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-toggle',
              '@radix-ui/react-toggle-group',
              '@radix-ui/react-tooltip',
            ],
            // Lucide 아이콘을 별도 청크로 분리
            'lucide-icons': ['lucide-react'],
            // Wouter 라우터를 별도 청크로 분리
            'router': ['wouter'],
          },
        },
      },
      // 청크 크기 경고 임계값을 600KB로 상향 조정 (코드 스플리팅 후 개선 예상)
      chunkSizeWarningLimit: 600,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  };
});
