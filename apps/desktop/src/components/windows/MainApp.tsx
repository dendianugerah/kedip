import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { OnboardingWindow } from "./OnboardingWindow";
import { SettingsWindow } from "./SettingsWindow";

export function MainApp() {
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    let active = true;
    void invoke<boolean>("is_onboarding_complete")
      .then((done) => {
        if (active) setOnboardingDone(done);
      })
      .catch(console.error)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;

  return onboardingDone ? (
    <SettingsWindow />
  ) : (
    <OnboardingWindow onComplete={() => setOnboardingDone(true)} />
  );
}
