import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import { OnboardingWindow } from "./OnboardingWindow";
import { SettingsWindow } from "./SettingsWindow";

export function MainApp() {
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    invoke<boolean>("is_onboarding_complete").then((done) => {
      setOnboardingDone(done);
      setReady(true);
    });

    const unlisten = listen("onboarding-complete", () => {
      setOnboardingDone(true);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  if (!ready) return null;

  return onboardingDone ? <SettingsWindow /> : <OnboardingWindow />;
}
