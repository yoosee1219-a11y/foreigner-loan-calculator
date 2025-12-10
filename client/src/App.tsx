import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";

// 대출 계산기 페이지
const LoanCalculator = lazy(() => import("@/pages/loan-calculator"));

// 로딩 컴포넌트
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="h-12 w-12 text-primary" />
    </div>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Suspense fallback={<PageLoader />}>
        <LoanCalculator />
      </Suspense>
    </TooltipProvider>
  );
}

export default App;
