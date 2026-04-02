import {
  NotificationWindow,
  BreakWindow,
  OnboardingWindow,
  SettingsWindow,
} from "@/components/windows";

function App() {
  const params = new URLSearchParams(window.location.search);
  const windowType = params.get("window") || "settings";

  switch (windowType) {
    case "notification":
      return <NotificationWindow />;
    case "break":
      return <BreakWindow />;
    case "onboarding":
      return <OnboardingWindow />;
    case "settings":
    default:
      return <SettingsWindow />;
  }
}

export default App;
