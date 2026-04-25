import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export interface Reminder {
  id: number;
  name: string;
  message: string;
  interval_min: number;
  enabled: boolean;
}

const INTERVAL_OPTIONS = [1, 2, 5, 10, 15, 20, 30, 45, 60];

function formatInterval(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${m}m`;
}

interface EditModalProps {
  initial?: Reminder;
  onSave: (r: Omit<Reminder, "id">) => void;
  onClose: () => void;
}

function EditModal({ initial, onSave, onClose }: EditModalProps) {
  const [name, setName] = useState(initial?.name || "");
  const [message, setMessage] = useState(initial?.message || "");
  const [interval, setInterval] = useState(initial?.interval_min || 5);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      message: message.trim(),
      interval_min: interval,
      enabled: initial?.enabled ?? true,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "oklch(16% 0 0)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <p className="text-[13px] font-semibold text-white">
            {initial ? "Edit reminder" : "New reminder"}
          </p>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <div>
            <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest block mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Blink eyes"
              autoFocus
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/15 focus:bg-white/[0.08] transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest block mb-1.5">
              Message
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Look away for a moment"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/15 focus:bg-white/[0.08] transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest block mb-1.5">
              Interval
            </label>
            <div className="flex gap-2">
              {INTERVAL_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setInterval(opt)}
                  className={`flex-1 py-1.5 rounded-[9px] text-[11px] font-medium transition-colors cursor-pointer scale-press ${
                    interval === opt
                      ? "bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                      : "bg-white/[0.06] text-white/45 hover:bg-white/[0.10] hover:text-white/70"
                  }`}
                >
                  {formatInterval(opt)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="white"
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 py-2 text-[12px] font-semibold h-auto rounded-xl scale-press"
            >
              {initial ? "Save" : "Add"}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-medium h-auto rounded-xl text-white/30 hover:text-white/60 hover:bg-transparent scale-press"
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = () => {
    invoke<Reminder[]>("get_reminders").then(setReminders);
  };

  const handleAdd = async (data: Omit<Reminder, "id">) => {
    const reminder = await invoke<Reminder>("add_reminder", {
      name: data.name,
      message: data.message,
      intervalMin: data.interval_min,
    });
    setReminders((prev) => [...prev, reminder]);
    setShowAdd(false);
  };

  const handleSave = (updated: Reminder) => {
    invoke("update_reminder", {
      id: updated.id,
      name: updated.name,
      message: updated.message,
      intervalMin: updated.interval_min,
      enabled: updated.enabled,
    });
    setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditId(null);
  };

  const handleDelete = (id: number) => {
    invoke("delete_reminder", { id });
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggle = (id: number) => {
    invoke<boolean>("toggle_reminder", { id }).then((enabled) => {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
            Reminders
          </p>
          <p className="text-[13px] text-white/45 mt-0.5">Fires during work sessions</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdd(true)}
          className="gap-1.5 text-[12px] font-medium h-7 px-3 text-white/45 hover:text-white/80 hover:bg-white/[0.06]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      {reminders.length === 0 && !showAdd ? (
        <div className="text-center py-10">
          <p className="text-[13px] text-white/25">No reminders yet</p>
        </div>
      ) : (
        <div className="border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
          {reminders.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.06] transition-colors"
            >
              <Switch
                checked={r.enabled}
                size="sm"
                onCheckedChange={() => handleToggle(r.id)}
                className="data-unchecked:bg-zinc-600 data-checked:bg-blue-500 data-checked:border-blue-500 cursor-pointer shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] font-medium truncate ${r.enabled ? "text-white" : "text-white/35"}`}
                >
                  {r.name || "Untitled"}
                </p>
                <p
                  className={`text-[11px] mt-0.5 truncate ${r.enabled ? "text-white/35" : "text-white/20"}`}
                >
                  {r.message || "No message"}
                </p>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 tabular-nums ${
                  r.enabled ? "bg-white/[0.10] text-white/50" : "bg-white/[0.05] text-white/25"
                }`}
              >
                {formatInterval(r.interval_min)}
              </span>
              <button
                onClick={() => setEditId(r.id)}
                className="text-[11px] text-white/25 hover:text-white/50 px-1.5 py-1 rounded-md hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-red-400/70 hover:bg-red-400/10 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {reminders.length > 0 && (
        <p className="text-[11px] text-white/20 leading-relaxed">
          Resets when a break ends or is skipped.
        </p>
      )}

      <AnimatePresence>
        {editId !== null && (
          <EditModal
            initial={reminders.find((r) => r.id === editId)}
            onSave={(data) => handleSave({ id: editId, ...data, message: data.message })}
            onClose={() => setEditId(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && <EditModal onSave={handleAdd} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
}
