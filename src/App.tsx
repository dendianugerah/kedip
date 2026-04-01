import { NotificationWindow } from "./components/windows/NotificationWindow";
import { BreakWindow } from "./components/windows/BreakWindow";
import { SettingsWindow } from "./components/windows/SettingsWindow";

function App() {
  // Get window type from URL query params
  const params = new URLSearchParams(window.location.search);
  const windowType = params.get("window") || "settings";

  // Render the appropriate window based on type
  switch (windowType) {
    case "notification":
      return <NotificationWindow />;
    case "break":
      return <BreakWindow />;
    case "settings":
    default:
      return <SettingsWindow />;
  }
}

export default App;
