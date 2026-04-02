import { motion } from "motion/react"
import {
  Eye,
  ArrowRight,
  Bell,
  Lock,
  Cpu,
  MonitorSmartphone,
  Timer,
} from "lucide-react"

const GITHUB_URL = "https://github.com/dendianugerah/kedip"
const RELEASES_URL = `${GITHUB_URL}/releases`

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: Timer,
    title: "20-20-20 rule",
    desc: "Every 20 minutes, look 20 feet away for 20 seconds. Kedip handles the timing.",
  },
  {
    icon: MonitorSmartphone,
    title: "Fullscreen break",
    desc: "A calm, distraction-free overlay so your eyes actually rest — not just a toast you ignore.",
  },
  {
    icon: Bell,
    title: "Floating pill",
    desc: "Snooze or skip from a small floating notification. Never in your way.",
  },
  {
    icon: Cpu,
    title: "Native & tiny",
    desc: "Built with Tauri + Rust. Under 5 MB. Uses less RAM than a browser tab.",
  },
  {
    icon: Lock,
    title: "Fully offline",
    desc: "No account. No cloud. No telemetry. Everything stays on your machine.",
  },
  {
    icon: Eye,
    title: "Open source",
    desc: "MIT licensed. Read the code, fork it, contribute — no surprises.",
  },
]

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-stone-900 antialiased">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-stone-100 bg-white/90 px-6 backdrop-blur-md md:px-10">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-900">
            <Eye className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Kedip</span>
        </a>

        <div className="flex items-center gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="text-stone-400 transition-colors hover:text-stone-800"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          <a
            href={RELEASES_URL}
            className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-700 active:scale-95"
          >
            Download
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pt-32 pb-24 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-6 text-xs font-medium tracking-widest text-stone-400 uppercase">
              Free · Open source · MIT License
            </p>
            <h1 className="mb-8 max-w-2xl text-5xl leading-[1.05] font-semibold tracking-tighter md:text-7xl">
              Your eyes need
              <span className="text-stone-400"> a break.</span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed font-light text-stone-500">
              Kedip is a menu bar app that reminds you to follow the 20-20-20
              rule. Tiny, fast, private.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={RELEASES_URL}
                className="group inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 active:scale-95"
              >
                Download — v0.1.0
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-6 py-3 text-sm font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900"
              >
                <GithubIcon className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
            <p className="mt-4 text-xs text-stone-400">
              macOS · Windows · Linux
            </p>
          </motion.div>

          {/* Hero screenshot placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-16"
          >
            {/* macOS window chrome */}
            <div className="overflow-hidden rounded-xl border border-stone-200 shadow-2xl shadow-stone-300/30">
              <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-100 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 font-mono text-xs text-stone-400">
                  Kedip
                </span>
              </div>
              {/* ↓ Replace with your actual screenshot ↓ */}
              <div className="flex aspect-video items-center justify-center bg-stone-50">
                <p className="font-mono text-sm text-stone-300">
                  app-screenshot.png
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* The rule — 3 stat cards */}
        <section className="bg-stone-950 px-6 py-20 md:px-10">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5"
            >
              {[
                { n: "20", u: "min", label: "Focus on your work" },
                { n: "20", u: "ft", label: "Look that far away" },
                { n: "20", u: "sec", label: "Rest your eyes" },
              ].map(({ n, u, label }) => (
                <div
                  key={u}
                  className="flex flex-col items-center justify-center bg-stone-900 px-4 py-14"
                >
                  <div className="mb-3 flex items-end gap-1 leading-none">
                    <span className="text-6xl font-extralight tracking-tighter text-white tabular-nums">
                      {n}
                    </span>
                    <span className="pb-1.5 text-xl font-light text-white/30">
                      {u}
                    </span>
                  </div>
                  <p className="text-center text-xs tracking-widest text-stone-500 uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features grid */}
        <section className="px-6 py-24 md:px-10" id="features">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-14"
            >
              <p className="mb-3 text-xs font-medium tracking-widest text-stone-400 uppercase">
                Features
              </p>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Simple by design.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-px bg-stone-100 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex flex-col gap-4 bg-white p-7"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-100 bg-stone-50">
                    <Icon className="h-4 w-4 text-stone-600" />
                  </div>
                  <div>
                    <p className="mb-1.5 text-sm font-semibold text-stone-900">
                      {title}
                    </p>
                    <p className="text-sm leading-relaxed text-stone-500">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Screenshots */}
        <section className="bg-stone-50 px-6 py-24 md:px-10" id="screenshots">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-14"
            >
              <p className="mb-3 text-xs font-medium tracking-widest text-stone-400 uppercase">
                Preview
              </p>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                See every screen.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                "Break overlay",
                "Notification pill",
                "Settings",
                "Menu bar",
              ].map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {/* ↓ Replace with <img src="..." className="w-full rounded-xl" alt={label} /> ↓ */}
                  <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-stone-200 bg-white">
                    <p className="font-mono text-xs text-stone-300">{label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Demo video */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4"
            >
              {/* ↓ Replace with <video autoPlay loop muted playsInline src="demo.mp4" className="w-full rounded-xl" /> ↓ */}
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white">
                <p className="font-mono text-xs text-stone-300">
                  demo.mp4 / demo.gif
                </p>
                <p className="text-xs tracking-widest text-stone-200 uppercase">
                  Full demo
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Download CTA */}
        <section className="bg-stone-950 px-6 py-28 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Eye className="h-6 w-6 text-white/60" />
            </div>
            <div>
              <h2 className="mb-3 text-4xl font-semibold tracking-tight text-white">
                Start today.
              </h2>
              <p className="leading-relaxed text-stone-500">
                Free, open source, under 5 MB. No setup required.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={RELEASES_URL}
                className="group inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-100 active:scale-95"
              >
                Download v0.1.0
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-7 py-3 text-sm font-medium text-stone-400 transition-colors hover:border-white/20 hover:text-white"
              >
                <GithubIcon className="h-4 w-4" />
                Source code
              </a>
            </div>
            <p className="text-xs text-stone-600">
              macOS · Windows · Linux · MIT License
            </p>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-100 px-6 py-6 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-stone-900">
              <Eye className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-semibold">Kedip</span>
            <span className="mx-1 text-stone-300">·</span>
            <span className="text-xs text-stone-400">MIT License</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-stone-400">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-stone-900"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              GitHub
            </a>
            <a
              href={RELEASES_URL}
              className="transition-colors hover:text-stone-900"
            >
              Releases
            </a>
            <a
              href={`${GITHUB_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-stone-900"
            >
              License
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
