import { AnimatePresence, motion } from "motion/react";
import { Bell } from "lucide-react";

interface Props {
  name: string;
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export function ReminderBanner({ name, message, visible, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 rounded-2xl bg-neutral-900/95 backdrop-blur-xl flex flex-col select-none font-sans overflow-hidden cursor-pointer"
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: -8,
            scale: 0.98,
            transition: { duration: 0.16, ease: [0.2, 0, 0, 1] },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          style={{
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
          onClick={onDismiss}
        >
          <div className="flex items-center gap-1.5 px-4 pt-3.5">
            <Bell className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              {name}
            </span>
          </div>

          <div className="flex-1 flex items-center px-4 pb-3.5">
            <p
              className="text-[22px] font-bold text-white leading-snug tracking-tight whitespace-normal break-words line-clamp-3"
              style={{ textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}
            >
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
