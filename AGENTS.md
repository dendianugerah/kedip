# Kedip — Agent Guide

## Package Manager

- **Use Bun exclusively** — `bun install`, `bun run`, etc. Not npm/yarn/pnpm.
- Lockfile is `bun.lock` (binary, not human-readable).

## Monorepo Structure

- Workspace root: `package.json` with `"workspaces": ["apps/*"]`
- `apps/desktop/` — Tauri v2 + React 19 desktop app (frontend + `src-tauri/` Rust backend)
- `apps/web/` — Vite + React 19 landing page
- **Root-level `lint` and `format` scripts only target `apps/desktop`** — they do NOT run `apps/web` scripts.

## Developer Commands

### Root shortcuts
```
bun run desktop:dev    # bun run --cwd apps/desktop tauri dev
bun run desktop:build  # bun run --cwd apps/desktop tauri build
bun run web:dev        # bun run --cwd apps/web dev
bun run web:build      # tsc -b && vite build  (tsc first, then vite)
bun run lint           # targets apps/desktop only
bun run format         # targets apps/desktop only
```

### apps/desktop
```
bun run --cwd apps/desktop tauri dev        # Full Tauri dev (frontend + Rust)
bun run --cwd apps/desktop lint:rust       # mkdir -p dist && cd src-tauri && cargo clippy
bun run --cwd apps/desktop lint:ts         # tsc --noEmit
bun run --cwd apps/desktop format:rust     # cargo fmt (in src-tauri/)
bun run --cwd apps/desktop format:ts       # prettier on src/**
bun run --cwd apps/desktop check           # lint && format
```
**Lint order matters**: `lint:rust` creates `dist/` first as a workaround for Cargo build artifact issues.

### apps/web
```
bun run --cwd apps/web build   # tsc -b && vite build
bun run --cwd apps/web lint    # eslint
bun run --cwd apps/web format  # prettier --write
bun run --cwd apps/web typecheck # tsc --noEmit
```

## Rust / Tauri Quirks

- **Lib name is `kedip_lib`**, not `kedip_lib`. The `Cargo.toml` explicitly renames it to avoid a Windows binary conflict (cargo issue #8519). `src-tauri/src/main.rs` calls `kedip_lib::run()`.
- State is synchronous (`std::sync::Mutex`, not async). Timer runs on a std thread at 100ms intervals.
- `tauri-plugin-store` persists settings to `kedip.json`.
- Settings window close is intercepted (`api.prevent_close()` + `window.destroy()`) — closing hides, not exits.
- Break window opens on **all monitors simultaneously**.
- macOS: uses `objc2` for lock-screen behavior and vibrancy. Break windows get `NSApplicationPresentationOptions` for full focus.
- Updater checks GitHub releases on startup (`tauri-plugin-updater`).

## React / Frontend Quirks

- **Tailwind v4** — no `tailwind.config.ts`. All config is CSS-first via `@theme` in `index.css`. Uses `oklch()` colors.
- **shadcn version mismatch between apps**:
  - `apps/desktop` uses `@base-ui/react` (style `"base-luma"`)
  - `apps/web` uses `@radix-ui` (style `"radix-luma"`)
- **React version mismatch**: web uses 19.2.x, desktop uses 19.1.x. Keep versions aligned when adding deps.
- **Desktop TypeScript**: `tsc` (no `-b`). Web uses `tsc -b` with project references.
- Window routing by URL query param: `?window=notification`, `?window=break`, `?window=settings`. All windows share the same bundle.
- `DEMO_COUNTDOWN_MS = 40000` during onboarding (not the user's chosen duration).
- Notification appears at `WARNING_THRESHOLD_MS = 30000` before break ends.
- Double-ESC (within 800ms) to skip break; single ESC resets 3s idle timer.

## CI / Release

- Release builds triggered on version tags (`v*`).
- Matrix: macOS aarch64 + x86_64, Ubuntu 22.04, Windows.
- Linux builds need: `webkit2gtk`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`.
- Windows output: `apps/desktop/src-tauri/target/release/bundle/nsis/*.exe`
- Secrets required: `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`, `GITHUB_TOKEN`.

## Formatting

- Root `.prettierrc` applies to desktop (`singleQuote: false`, `printWidth: 100`).
- `apps/web/.prettierrc` differs (`printWidth: 80`, `prettier-plugin-tailwindcss`).
- `prettier-plugin-tailwindcss` is used in both apps for class sorting.
