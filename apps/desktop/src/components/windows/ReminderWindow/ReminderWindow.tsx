import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
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

  // Resize window to fit content after render
  useEffect(() => {
    if (!name && !message) return;
    const timer = setTimeout(() => {
      // Measure the inner content element, not the window body
      const el = document.getElementById("reminder-content");
      if (!el) return;
      const h = el.scrollHeight;
      // Short text fills the window (136), long text grows
      const height = Math.max(h, 136);
      invoke("resize_reminder_window", { height }).catch(() => {});
    }, 50);
    return () => clearTimeout(timer);
  }, [name, message]);

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
