import { useEffect, useRef, useState } from "react";
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
  const [visible, setVisible] = useState(false);
  const mirrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setName(decode(params.get("name") || "Reminder"));
    setMessage(decode(params.get("message") || ""));
  }, []);

  // Measure content height before showing the banner
  useEffect(() => {
    if (!name && !message) return;

    // Give React time to render the mirror element
    requestAnimationFrame(() => {
      if (!mirrorRef.current) return;

      const h = mirrorRef.current.getBoundingClientRect().height;
      const height = Math.max(Math.ceil(h), 136);
      invoke("resize_reminder_window", { height }).catch(() => {});
      setVisible(true);
    });
  }, [name, message]);

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => window.close(), 220);
    }, 3000);
    return () => clearTimeout(timer);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => {
      invoke("close_reminder_window").catch(() => {});
    }, 220);
  };

  return (
    <>
      {/* Hidden mirror to measure natural content height */}
      <div
        ref={mirrorRef}
        className="fixed rounded-2xl bg-neutral-900/95 flex flex-col gap-2.5 px-4 pt-3.5 pb-3.5 font-sans pointer-events-none opacity-0 select-none"
        style={{ width: 320 }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
            {name}
          </span>
        </div>
        <p className="text-[22px] font-bold text-white leading-snug tracking-tight whitespace-normal break-words">
          {message}
        </p>
      </div>

      <ReminderBanner name={name} message={message} visible={visible} onDismiss={dismiss} />
    </>
  );
}
