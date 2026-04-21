import { type ReactNode } from "react"

export function AppWindow({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-100 px-3 py-2.5 shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)]">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
        {label && <span className="ml-2 font-mono text-[10px] text-stone-400">{label}</span>}
      </div>
      {children}
    </div>
  )
}
