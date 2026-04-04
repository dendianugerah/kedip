import { useState } from "react";
import { Copy, Check } from "lucide-react";

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
      className={`flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 ${className}`}
    >
      <span className="flex-1 font-mono text-sm text-stone-600 select-all">{command}</span>
      <button
        onClick={copy}
        className="flex-shrink-0 text-stone-400 transition-colors hover:text-stone-700 cursor-pointer"
        aria-label="Copy command"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
