import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

function decode(str: string) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function parseAccent(str: string): string {
  const hash = [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hues = [210, 280, 160, 30];
  return `oklch(65% 0.14 ${hues[hash % hues.length]})`;
}

export function ReminderWindow() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawName = decode(params.get("name") || "");
    const rawMessage = decode(params.get("message") || "");
    setName(rawName);
    setMessage(rawMessage);
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

  const accent = parseAccent(name + message);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center select-none font-sans cursor-pointer"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          onClick={dismiss}
        >
          {/* Subtle ambient ring */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${accent}18 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.03, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Card */}
          <div
            className="relative flex flex-col items-center gap-1 px-10 py-7 rounded-2xl"
            style={{
              background: "oklch(13% 0 0 / 0.85)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              boxShadow: `0 0 0 1px ${accent}30, 0 24px 64px rgba(0,0,0,0.7)`,
            }}
          >
            {/* Name label */}
            {name && (
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-1"
                style={{ color: accent }}
              >
                {name}
              </p>
            )}

            {/* Message */}
            <p
              className="text-[22px] font-bold text-white leading-tight tracking-tight text-center max-w-[320px]"
              style={{ textShadow: `0 0 40px ${accent}40` }}
            >
              {message}
            </p>

            {/* Pulse dot */}
            <motion.div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
              style={{ background: accent }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
