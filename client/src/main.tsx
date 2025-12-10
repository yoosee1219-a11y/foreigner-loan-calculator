import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initWebVitalsOptimization } from "./lib/webVitals";

// Core Web Vitals 최적화 초기화
initWebVitalsOptimization();

createRoot(document.getElementById("root")!).render(<App />);
