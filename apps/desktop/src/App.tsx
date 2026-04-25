import { NotificationWindow, BreakWindow, MainApp, ReminderWindow } from "@/components/windows";

function App() {
  const params = new URLSearchParams(window.location.search);
  const windowType = params.get("window") || "settings";

  switch (windowType) {
    case "notification":
      return <NotificationWindow />;
    case "break":
      return <BreakWindow />;
    case "reminder":
      return <ReminderWindow />;
    case "settings":
    case "onboarding":
    default:
      return <MainApp />;
  }
}

export default App;
