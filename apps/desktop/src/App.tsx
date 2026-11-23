import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";

export function mountApp(root: HTMLElement, windowType: string | null) {
  const Window =
    windowType === "notification"
      ? lazy(() => import("./components/windows/NotificationWindow").then((m) => ({ default: m.NotificationWindow })))
      : windowType === "break"
        ? lazy(() => import("./components/windows/BreakWindow").then((m) => ({ default: m.BreakWindow })))
        : lazy(() => import("./components/windows/MainApp").then((m) => ({ default: m.MainApp })));
  createRoot(root).render(
    <StrictMode>
      <MotionConfig reducedMotion="user">
        <Suspense fallback={null}>
          <Window />
        </Suspense>
      </MotionConfig>
    </StrictMode>,
  );
}
