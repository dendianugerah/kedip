import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  command: string;
  className?: string;
}

export function CopyCommand({ command, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${className}`}
    >
      <span className="flex-1 font-mono text-sm text-stone-600 select-all">{command}</span>
      <button
        onClick={copy}
        className="flex-shrink-0 text-stone-400 transition-colors hover:text-stone-700 cursor-pointer scale-press rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/30"
        aria-label="Copy command"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className="flex items-center justify-center"
            >
              <Check className="h-4 w-4 text-emerald-500" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className="flex items-center justify-center"
            >
              <Copy className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
