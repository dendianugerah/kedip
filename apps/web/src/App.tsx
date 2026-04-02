import { motion } from "motion/react";
import {
  Eye,
  MonitorSmartphone,
  ArrowRight,
  Command,
  Cpu,
  Coffee,
  Sparkles,
  Timer,
  Bell,
  Lock,
} from "lucide-react";

const GITHUB_URL = "https://github.com/dendianugerah/kedip";

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
  );
}

const ease = [0.23, 1, 0.32, 1] as const;

const features = [
  {
    icon: Timer,
    title: "Configurable intervals",
    description: "Set custom work and break durations to match your rhythm.",
  },
  {
    icon: MonitorSmartphone,
    title: "Fullscreen break screen",
    description: "Gently locks focus during breaks so you actually rest.",
  },
  {
    icon: Bell,
    title: "Floating notifications",
    description: "Soft pill with snooze or skip — never intrusive.",
  },
  {
    icon: Cpu,
    title: "Lightweight by design",
    description: "Built with Tauri + Rust. Under 15 MB RAM. No Electron.",
  },
  {
    icon: Lock,
    title: "No account required",
    description: "Everything stays local. No cloud, no tracking.",
  },
  {
    icon: Eye,
    title: "Open source",
    description: "MIT licensed. Inspect, fork, and contribute freely.",
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900 font-sans overflow-x-hidden selection:bg-teal-100">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-[#FAFAFA]/80 backdrop-blur-xl border-b border-stone-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-stone-900 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-sm">Kedip</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-stone-500 tracking-wide">
          <a href="#features" className="hover:text-stone-900 transition-colors">Features</a>
          <a href="#open-source" className="hover:text-stone-900 transition-colors">Open Source</a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="text-stone-400 hover:text-stone-900 transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
          <a
            href={GITHUB_URL + "/releases"}
            className="bg-stone-900 text-white px-3.5 py-1.5 rounded-md text-xs font-medium hover:bg-stone-800 active:scale-[0.97] transition-all flex items-center gap-1.5"
          >
            Download
          </a>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative pt-36 pb-20 px-6 lg:px-12 max-w-[1280px] mx-auto min-h-[90vh] flex flex-col justify-center">
          <div className="relative z-10 grid lg:grid-cols-12 gap-12 items-center">
            {/* Left copy */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-stone-200/80 shadow-sm text-xs font-medium text-stone-600 mb-8"
              >
                <Sparkles className="w-3 h-3 text-teal-600" />
                Kedip is now open source
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease }}
                className="text-[3.5rem] leading-[1.05] md:text-[5rem] lg:text-[6rem] font-semibold tracking-tighter text-stone-900 mb-6"
              >
                Focus deeply.
                <br />
                <span className="text-stone-400">Rest gently.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease }}
                className="text-lg text-stone-500 max-w-xl mb-10 leading-relaxed font-light"
              >
                A minimalist eye care reminder that protects your eyes without
                breaking your flow. Follows the 20-20-20 rule. Works on macOS,
                Windows, and Linux.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease }}
                className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
              >
                <a
                  href={GITHUB_URL + "/releases"}
                  className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-stone-800 active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(28,25,23,0.18)]"
                >
                  Download free
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-stone-600 px-6 py-3 rounded-lg text-sm font-medium border border-stone-200/80 hover:bg-stone-50 hover:text-stone-900 active:scale-[0.98] transition-all shadow-sm"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  View on GitHub
                </a>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-4 text-xs text-stone-400"
              >
                Free · MIT License · macOS · Windows · Linux
              </motion.p>
            </div>

            {/* Right — app preview placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease }}
              className="lg:col-span-5 relative mt-12 lg:mt-0"
            >
              <div className="absolute -inset-24 bg-teal-50/60 rounded-full blur-3xl pointer-events-none" />
              {/* ↓ Replace this div with your app screenshot / GIF / video ↓ */}
              <div className="relative bg-white border border-stone-200/80 rounded-xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.08)] overflow-hidden aspect-[4/3] flex items-center justify-center rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex flex-col items-center gap-3 text-stone-300">
                  <div className="w-10 h-10 rounded-lg border-2 border-dashed border-stone-200 flex items-center justify-center">
                    <Command className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-mono">app-screenshot.png</p>
                </div>
              </div>
              {/* ↑ Replace end ↑ */}
            </motion.div>
          </div>
        </section>

        {/* ── Demo video placeholder ── */}
        <section className="py-20 px-6 border-t border-stone-200/80 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 mb-10">
              See it in action
            </p>
            {/* ↓ Replace with your demo GIF or <video> tag ↓ */}
            <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-3 text-stone-300">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-stone-200 flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <p className="text-sm font-mono">demo.mp4 / demo.gif</p>
            </div>
            {/* ↑ Replace end ↑ */}
          </div>
        </section>

        {/* ── 20-20-20 rule ── */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 mb-12">
              The 20-20-20 rule
            </p>
            <div className="grid grid-cols-3 divide-x divide-stone-200 overflow-hidden rounded-2xl border border-stone-200">
              {[
                { n: "20", u: "min", label: "Focus on your work" },
                { n: "20", u: "ft", label: "Look 20 feet away" },
                { n: "20", u: "sec", label: "Rest your eyes" },
              ].map(({ n, u, label }) => (
                <motion.div
                  key={u}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, ease }}
                  className="flex flex-col items-center justify-center gap-2 px-6 py-12 bg-white"
                >
                  <div className="flex items-end gap-1">
                    <span className="text-6xl font-extralight tabular-nums leading-none text-stone-900">
                      {n}
                    </span>
                    <span className="pb-1 text-xl text-stone-400">{u}</span>
                  </div>
                  <p className="text-sm text-center text-stone-500">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features bento ── */}
        <section id="features" className="py-24 px-6 border-t border-stone-200/80 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 mb-12">
              Features
            </p>
            <div className="grid grid-cols-1 gap-px bg-stone-200 overflow-hidden rounded-2xl border border-stone-200 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease }}
                  className="flex flex-col gap-3 bg-white p-6"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-stone-50">
                    <Icon className="h-4 w-4 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-500">
                      {description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Screenshots / more media placeholder ── */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 mb-12">
              Screenshots
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["Break screen", "Notification pill", "Settings", "Menu bar"].map((label) => (
                /* ↓ Replace each div with <img src="..." /> ↓ */
                <div
                  key={label}
                  className="aspect-video rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-2 text-stone-300"
                >
                  <p className="text-xs font-mono">{label}</p>
                </div>
                /* ↑ Replace end ↑ */
              ))}
            </div>
          </div>
        </section>

        {/* ── Open Source CTA ── */}
        <section id="open-source" className="py-24 px-6 border-t border-stone-200/80 bg-white">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-stone-900 mb-4">
                Built in the open.
                <br />
                Free forever.
              </h2>
              <p className="text-stone-500 leading-relaxed mb-8 font-light">
                Kedip is MIT licensed and community-driven. Inspect the code,
                build plugins, or contribute fixes — everything is on GitHub.
              </p>
              <div className="flex flex-col gap-0 divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden">
                {[
                  { label: "License", value: "MIT" },
                  { label: "Stack", value: "Rust / TypeScript" },
                  { label: "Platforms", value: "macOS · Windows · Linux" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 bg-white">
                    <span className="text-sm font-medium text-stone-900">{label}</span>
                    <span className="text-sm text-stone-500 font-mono">{value}</span>
                  </div>
                ))}
              </div>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 active:scale-[0.98] transition-all shadow-sm"
              >
                <GithubIcon className="w-4 h-4" />
                Star on GitHub
              </a>
            </div>

            {/* Code snippet */}
            <div className="bg-[#FAFAFA] border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-200 bg-white">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <span className="ml-4 text-[10px] font-mono text-stone-400">src-tauri/src/timer.rs</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-stone-600 whitespace-pre">
{`pub fn start_break_cycle() {
  let interval = Duration::from_mins(20);
  let mut timer = Timer::new(interval);

  loop {
    timer.wait().await;
    ui::show_overlay(
      "Time to blink"
    );
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-stone-900 flex items-center justify-center">
              <Eye className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-stone-900">Kedip</span>
            <span className="text-stone-300 mx-2">·</span>
            <span className="text-xs text-stone-400 font-mono">MIT License</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1.5"
            >
              <GithubIcon className="w-4 h-4" />
              <span className="text-xs font-medium">GitHub</span>
            </a>
            <a
              href={GITHUB_URL + "/blob/main/LICENSE"}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-stone-400 hover:text-stone-900 transition-colors"
            >
              License
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
