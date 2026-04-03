import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { GithubIcon } from "./components/ui/GithubIcon"
import { AppWindow } from "./components/ui/AppWindow"
import { ScreenAsset } from "./components/ui/ScreenAsset"

const GITHUB_URL = "https://github.com/dendianugerah/kedip"
const RELEASES_URL = `${GITHUB_URL}/releases`

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-stone-900 antialiased">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-100 bg-white/90 px-6 backdrop-blur-md md:px-10">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between">
          <a href="/" className="flex items-center gap-2">
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
        </div>
      </header>

      <main>
        <section className="px-6 pt-32 pb-20 md:px-10">
          <div className="mx-auto max-w-5xl">
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
              Kedip is a menu bar app that reminds you to follow the 20-20-20 rule. Tiny, fast,
              private.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={RELEASES_URL}
                className="group inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 active:scale-95"
              >
                Download v0.1.0
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
            <p className="mt-4 text-xs text-stone-400">macOS · Windows · Linux</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16"
          >
            <div className="overflow-hidden rounded-xl border border-stone-200 shadow-2xl shadow-stone-300/30">
              <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-100 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 font-mono text-xs text-stone-400">Kedip</span>
              </div>
              <video
                src="/assets/demo.webm"
                autoPlay
                loop
                muted
                playsInline
                className="w-full"
              />
            </div>
            <p className="mt-3 text-center text-xs text-stone-300">
              Notification → break overlay → back to work
            </p>
          </motion.div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-10" id="screens">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-20"
            >
              <p className="mb-3 text-xs font-medium tracking-widest text-stone-400 uppercase">
                In action
              </p>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Every screen, no surprises.
              </h2>
            </motion.div>

            <div className="flex flex-col gap-28">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-10">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-xs text-stone-300">01</span>
                    <span className="rounded-full border border-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-500">
                      Onboarding
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                    Up and running in seconds.
                  </h3>
                  <p className="max-w-lg text-base leading-relaxed text-stone-500">
                    Three steps. Pick how long you want to work, pick your break length, then sit
                    through a quick demo so the first real notification isn't a surprise.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { src: "/assets/screens/onboarding-1.webp", alt: "Step 1: intro", label: "Welcome" },
                    { src: "/assets/screens/onboarding-2.webp", alt: "Step 2: set rhythm", label: "Set your rhythm" },
                    { src: "/assets/screens/onboarding-3.webp", alt: "Step 3: demo", label: "Quick demo" },
                  ].map(({ src, alt, label }, i) => (
                    <motion.div
                      key={src}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <AppWindow label={label}>
                        <ScreenAsset src={src} alt={alt} aspectClass="aspect-[4/3]" />
                      </AppWindow>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
              >
                <div className="order-2 overflow-hidden rounded-xl border border-stone-200 shadow-xl shadow-stone-200/40 lg:order-1">
                  <ScreenAsset
                    src="/assets/screens/notification.webp"
                    alt="Notification pill: break now, snooze, or skip"
                  />
                </div>

                <div className="order-1 lg:order-2">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-xs text-stone-300">02</span>
                    <span className="rounded-full border border-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-500">
                      Notification
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                    A nudge, not a popup.
                  </h3>
                  <p className="text-base leading-relaxed text-stone-500">
                    When time's up, a small pill drops down. Hit Space to start your break, S
                    to snooze 5 minutes, or Esc to skip. No mouse needed.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
              >
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-xs text-stone-300">03</span>
                    <span className="rounded-full border border-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-500">
                      Break screen
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                    20 seconds. Look away.
                  </h3>
                  <p className="text-base leading-relaxed text-stone-500">
                    The screen goes dark with a countdown. No noise. Just a
                    reminder to actually look somewhere else. Press Esc twice to bail early.
                  </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-stone-200 shadow-xl shadow-stone-200/40">
                  <ScreenAsset
                    src="/assets/screens/break.webp"
                    alt="Break screen countdown overlay"
                    aspectClass="aspect-video"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
              >
                <div className="order-2 lg:order-1">
                  <AppWindow label="Settings">
                    <ScreenAsset
                      src="/assets/screens/settings.webp"
                      alt="Settings window"
                      aspectClass="aspect-full"
                    />
                  </AppWindow>
                </div>

                <div className="order-1 lg:order-2">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-xs text-stone-300">04</span>
                    <span className="rounded-full border border-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-500">
                      Settings
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                    Change it whenever.
                  </h3>
                  <p className="text-base leading-relaxed text-stone-500">
                    Work interval too short? Break too long? Fix it in settings. You can also
                    see the live countdown and browse keyboard shortcuts from here.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="bg-stone-950 px-6 py-28 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center"
          >
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
            <p className="text-xs text-stone-600">macOS · Windows · Linux · MIT License</p>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-stone-100 px-6 py-6 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
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
            <a href={RELEASES_URL} className="transition-colors hover:text-stone-900">
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

