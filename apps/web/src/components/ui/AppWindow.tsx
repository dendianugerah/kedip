import { type ReactNode } from "react"

export function AppWindow({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 shadow-xl shadow-stone-200/40">
      <div className="flex items-center gap-1.5 border-b border-stone-200 bg-stone-100 px-3 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
        {label && <span className="ml-2 font-mono text-[10px] text-stone-400">{label}</span>}
      </div>
      {children}
    </div>
  )
}
