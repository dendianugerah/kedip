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
