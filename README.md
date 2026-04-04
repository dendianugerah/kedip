# Kedip

Every 20 minutes, look 20 feet away for 20 seconds. Kedip keeps track so you don't have to.

---

<table>
  <tr>
    <td><img src="apps/web/public/assets/screens/onboarding-1.webp" alt="Onboarding" /></td>
    <td><img src="apps/web/public/assets/screens/notification.webp" alt="Notification" /></td>
  </tr>
  <tr>
    <td><img src="apps/web/public/assets/screens/break.webp" alt="Break screen" /></td>
    <td><img src="apps/web/public/assets/screens/settings.webp" alt="Settings" /></td>
  </tr>
</table>

---

> **Early development notice** — Kedip is actively developed and tested on macOS. Windows and Linux builds are provided but may have rough edges or visual issues. If you run into problems, please [open an issue](https://github.com/dendianugerah/kedip/issues).

---

## Download

Grab the latest binary from the [**Releases**](https://github.com/dendianugerah/kedip/releases) page.

| Platform | File |
|----------|------|
| macOS | `.dmg` |
| Windows | `.msi` / `.exe` |
| Linux | `.AppImage` / `.deb` |

> **macOS:** If you see "damaged and can't be opened", run `xattr -cr /Applications/kedip.app` in Terminal. The app is unsigned but safe.

---

## Features

- Fullscreen break overlay with countdown
- Floating pill notification, snooze, skip, or break now
- Configurable work and break durations
- Runs in the menu bar, out of your way
- No account, no cloud, no telemetry. Fully offline.

---

## Development

**Prerequisites:** [Rust](https://rustup.rs) · [Bun](https://bun.sh)

```bash
git clone https://github.com/dendianugerah/kedip
cd kedip
bun install

bun run desktop:dev   # desktop app
bun run web:dev       # landing page
```

```bash
bun run desktop:build
# → apps/desktop/src-tauri/target/release/bundle/
```

---

## Contributing

PRs are welcome. Open an issue first for large changes.

## License

[MIT](./LICENSE)
