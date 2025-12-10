import { Switch, Route } from "wouter";
import { useEffect, Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAuthToken } from "./lib/api.js";
import { Spinner } from "@/components/ui/spinner";
import { LanguageProvider } from "@/contexts/LanguageContext";

// 페이지 컴포넌트를 동적으로 로드 (코드 스플리팅)
const Home = lazy(() => import("@/pages/home"));
const Compare = lazy(() => import("@/pages/compare"));
const PlanDetail = lazy(() => import("@/pages/plan-detail"));
const Tips = lazy(() => import("@/pages/tips"));
const TipDetail = lazy(() => import("@/pages/tip-detail"));
const NotFound = lazy(() => import("@/pages/not-found"));

// 로딩 컴포넌트
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="h-12 w-12 text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/compare" component={Compare} />
        <Route path="/plans/:id" component={PlanDetail} />
        <Route path="/tips" component={Tips} />
        <Route path="/tips/:id" component={TipDetail} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // 앱 초기화 시 토큰 발급
  useEffect(() => {
    getAuthToken().catch((error) => {
      console.error("Failed to initialize auth token:", error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
