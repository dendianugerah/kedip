import { Kbd } from "@/components/ui/kbd";

interface ShortcutRowProps {
  keys: string[];
  description: string;
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/[0.06]">
      <span className="text-[13px] text-white/75">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i} className="flex items-center gap-1">
            <Kbd>{key}</Kbd>
            {i < keys.length - 1 && <span className="text-[10px] text-white/20">then</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

interface ShortcutGroup {
  label: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    label: "Notification",
    shortcuts: [
      { keys: ["Space"], description: "Start break now" },
      { keys: ["S"], description: "Snooze 5 minutes" },
      { keys: ["Esc"], description: "Skip break" },
    ],
  },
  {
    label: "Break screen",
    shortcuts: [{ keys: ["Esc", "Esc"], description: "Skip break early" }],
  },
];

export function ShortcutsPage() {
  return (
    <div className="space-y-6">
      {SHORTCUT_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.22em] mb-3">
            {group.label}
          </p>
          <div className="border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
            {group.shortcuts.map((shortcut) => (
              <ShortcutRow
                key={shortcut.description}
                keys={shortcut.keys}
                description={shortcut.description}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
