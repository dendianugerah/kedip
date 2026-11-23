import {
  ArrowDown,
  ArrowUpRight,
  Bell,
  Laptop,
  Monitor,
  Terminal,
} from "lucide-react"
import { Button } from "./components/ui/button"
import { GithubIcon } from "./components/ui/GithubIcon"

const GITHUB_URL = "https://github.com/dendianugerah/kedip"
const RELEASES_URL = `${GITHUB_URL}/releases/latest`
const INSTALL_URL = `${GITHUB_URL}#install`

const steps = [
  {
    title: "Work as usual",
    description: "Kedip runs in your menu bar or system tray and keeps time.",
  },
  {
    title: "Get a heads-up",
    description: "Every 20 minutes, Kedip reminds you to take a short break.",
  },
  {
    title: "Look into the distance",
    description: "Focus on something 20 feet (6 meters) away for 20 seconds.",
  },
]

const platforms = [
  { icon: Laptop, name: "macOS", files: ".dmg" },
  { icon: Monitor, name: "Windows", files: ".msi or .exe" },
  { icon: Terminal, name: "Linux", files: ".AppImage or .deb" },
]

const frame = "mx-auto max-w-5xl border-x px-5 sm:px-10 lg:px-14"
const meta = "font-mono text-xs tracking-[0.15em] uppercase text-ink-muted"
const sectionTitle = "text-4xl font-semibold tracking-[-0.055em] sm:text-5xl"

function ReminderPreview() {
  return (
    <figure className="min-w-0">
      <div className="overflow-hidden rounded-xl border bg-paper shadow-[0_12px_28px_-20px_#3c3a32]">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
          <span className="flex items-center gap-2 text-xs font-medium">
            <img src="/logo.svg" alt="" width="16" height="16" />
            Kedip
          </span>
          <span className={meta}>Reminder</span>
        </div>
        <div className="grid place-items-center bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-[size:12px_12px] px-3 py-4 sm:px-6 sm:py-6">
          <div className="w-full max-w-72 rounded-lg border bg-surface p-4 shadow-sm sm:p-5">
            <Bell className="mb-2 size-4 text-ink-muted" aria-hidden="true" />
            <p className="text-xl font-semibold tracking-tight">
              Your break starts soon
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Starting in 30 seconds
            </p>
            <div
              className="mt-3 h-1 overflow-hidden rounded-full bg-border"
              aria-hidden="true"
            >
              <div className="h-full w-2/3 rounded-full bg-signal" />
            </div>
            <div
              className="mt-3 flex flex-wrap gap-2 text-xs font-medium"
              aria-hidden="true"
            >
              <span className="rounded-md bg-foreground px-2.5 py-1.5 text-paper">
                Break now
              </span>
              <span className="rounded-md border px-2.5 py-1.5">
                Snooze 5 min
              </span>
            </div>
          </div>
        </div>
      </div>
      <figcaption className={`${meta} mt-2 text-right`}>
        Reminder preview
      </figcaption>
    </figure>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-paper text-foreground">
      <header className="border-b">
        <div
          className={`${frame} flex min-h-14 items-center justify-between gap-3`}
        >
          <a href="/" className="flex items-center gap-2 font-semibold">
            <img src="/logo.svg" alt="" width="26" height="26" />
            Kedip
          </a>
          <nav
            aria-label="Main"
            className="flex items-center gap-4 text-sm sm:gap-6"
          >
            <a
              href={GITHUB_URL}
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <GithubIcon className="size-4" /> GitHub
            </a>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-md bg-surface"
            >
              <a href="#download">Download</a>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section aria-labelledby="hero-title" className="border-b">
          <div className={`${frame} pt-9 pb-4 text-center sm:pt-12`}>
            <p className={`${meta} flex items-center justify-center gap-2`}>
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-signal"
              />
              The 20-20-20 rule
            </p>
            <h1
              id="hero-title"
              className="mx-auto mt-3 max-w-3xl text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.075em] text-balance"
            >
              A little break for your eyes.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-pretty text-ink-muted sm:text-lg">
              Kedip is a free, open-source desktop app that reminds you to look
              away from your screen.
            </p>
            <Button asChild size="lg" className="mt-5 rounded-md">
              <a href="#download">
                Download Kedip <ArrowDown aria-hidden="true" />
              </a>
            </Button>
            <img
              src="/kedip-eye-stack.svg"
              alt=""
              width="560"
              height="360"
              className="mx-auto mt-3 h-auto w-full max-w-60 sm:max-w-xs"
            />
          </div>
        </section>

        <section
          id="how-it-works"
          aria-labelledby="how-title"
          className="border-b"
        >
          <div
            className={`${frame} grid items-center gap-5 py-8 sm:py-10 md:grid-cols-2 md:gap-12`}
          >
            <div>
              <p className={meta}>How it works</p>
              <h2 id="how-title" className={`${sectionTitle} mt-2`}>
                Look up. Look away.
              </h2>
              <ol className="mt-4 border-t">
                {steps.map(({ title, description }, index) => (
                  <li
                    key={title}
                    className="grid grid-cols-[2.25rem_1fr] border-b py-2.5"
                  >
                    <span aria-hidden="true" className={`${meta} pt-1`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <ReminderPreview />
          </div>
        </section>

        <section
          id="download"
          aria-labelledby="download-title"
          className="border-b"
        >
          <div className={`${frame} py-8 sm:py-10`}>
            <h2 id="download-title" className={sectionTitle}>
              Download Kedip
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Find your installer under Assets on GitHub.{" "}
              <a
                href={INSTALL_URL}
                className="underline underline-offset-4 hover:text-foreground"
              >
                Install guide
              </a>
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {platforms.map(({ icon: Icon, name, files }) => (
                <li key={name}>
                  <a
                    href={RELEASES_URL}
                    className="flex h-full items-center gap-3 rounded-md border bg-surface p-3 hover:border-ink-muted sm:p-4"
                  >
                    <Icon className="size-5 shrink-0" aria-hidden="true" />
                    <span className="flex flex-1 flex-col gap-1">
                      <span className="text-sm font-semibold">{name}</span>
                      <span className="font-mono text-xs text-ink-muted">
                        {files}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer>
        <div
          className={`${frame} flex items-center gap-3 py-3 text-sm text-ink-muted`}
        >
          <p className="font-semibold text-foreground">Kedip</p>
          <a
            href={`${GITHUB_URL}/blob/main/LICENSE`}
            className="hover:underline"
          >
            MIT License
          </a>
          <a href={`${GITHUB_URL}/issues`} className="hover:underline">
            Report an issue
          </a>
        </div>
      </footer>
    </div>
  )
}
