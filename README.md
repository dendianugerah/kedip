# Kedip

A minimalist eye care reminder for macOS. Reminds you to follow the **20-20-20 rule** — every 20 minutes, look at something 20 feet away for 20 seconds.

Built with [Tauri](https://tauri.app), React, and TypeScript.

## Features

- Configurable work and break intervals
- Fullscreen break screen that gently locks focus
- Floating notification pill with snooze and skip
- Runs quietly in the menu bar
- No account, no cloud, no tracking

## Getting Started

**Prerequisites:** [Rust](https://rustup.rs), [Bun](https://bun.sh)

```bash
git clone https://github.com/dendianugerah/kedip
cd kedip
bun install
bun run tauri dev
```

## Project Structure

```
apps/
  desktop/        # Tauri + React app
    src/          # React frontend
    src-tauri/    # Rust backend
```

## Contributing

Pull requests are welcome. For major changes, open an issue first.

## License

[MIT](./LICENSE)
