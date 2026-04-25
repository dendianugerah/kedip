import { useEffect, useState } from "react";
import { ReminderBanner } from "./ReminderBanner";

function decode(str: string) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export function ReminderWindow() {
  const [name, setName] = useState("Reminder");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setName(decode(params.get("name") || "Reminder"));
    setMessage(decode(params.get("message") || ""));
  }, []);

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => window.close(), 220);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => window.close(), 220);
  };

  return <ReminderBanner name={name} message={message} visible={visible} onDismiss={dismiss} />;
}
