# Kedip

> A minimalist eye care reminder that follows the 20-20-20 rule — every 20 minutes, look 20 feet away for 20 seconds.

Built with [Tauri 2](https://tauri.app) + Rust on the backend and React + TypeScript on the frontend. Ships as a tiny native app on macOS, Windows, and Linux.

[![Release](https://img.shields.io/github/v/release/dendianugerah/kedip?style=flat-square)](https://github.com/dendianugerah/kedip/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)

---

## Download

Grab the latest binary from the [**Releases**](https://github.com/dendianugerah/kedip/releases) page.

| Platform | File |
|----------|------|
| macOS (Apple Silicon + Intel) | `.dmg` |
| Windows | `.msi` / `.exe` |
| Linux | `.AppImage` / `.deb` |

> **macOS note:** If you see "damaged and can't be opened", run this in Terminal:
> ```bash
> xattr -cr /Applications/kedip.app
> ```
> This happens because the app is not yet notarized with Apple. It is safe to run.

---

## Features

- Fullscreen break overlay that gently enforces rest
- Floating notification pill with snooze and skip
- Configurable work and break intervals
- Runs quietly in the menu bar — zero interruptions when you're focused
- No account, no cloud, no telemetry

---

## Development

**Prerequisites:** [Rust](https://rustup.rs) · [Bun](https://bun.sh)

```bash
git clone https://github.com/dendianugerah/kedip
cd kedip
bun install

# Run desktop app in dev mode
bun run desktop:dev

# Run landing page
bun run web:dev
```

### Building a release binary

```bash
bun run desktop:build
# Output: apps/desktop/src-tauri/target/release/bundle/
```

---

## Project Structure

```
kedip/
├── apps/
│   ├── desktop/          # Tauri desktop app
│   │   ├── src/          # React frontend (Vite)
│   │   └── src-tauri/    # Rust backend
│   └── web/              # Landing page (React + Vite)
├── package.json          # Bun workspace root
└── LICENSE
```

---

## Contributing

Pull requests are welcome. For large changes, open an issue first to discuss what you'd like to change.

## License

[MIT](./LICENSE)
