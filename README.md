# Clipboard List

A lightweight VS Code extension that maintains a history of the **last 10 copied items** and lets you quickly paste any item using commands or key numbers.

## Features

- **Automatic Clipboard Tracking**: Monitors copied text inside VS Code and from other applications as soon as VS Code gains focus.
- **Last 10 Items**: Keeps the most recent 10 items in a Most Recently Used (MRU) list without clutter or duplicate entries.
- **Paste by Key Number**: Instant paste shortcuts using chords: `Ctrl+Alt+V 1` through `Ctrl+Alt+V 0` (`0` is item 10).
- **Interactive QuickPick**: Press `Win+Alt+V` (`Cmd+Alt+V` on macOS) to view formatted snippets, line counts, and character lengths of all 10 items.
- **Status Bar Integration**: Visual counter in the status bar (`$(clippy) Clipboard (3/10)`) with one-click access to the clipboard list.
- **Persistent Across Sessions**: Stored in VS Code global state, keeping your clipboard items available even after restarting the editor.
- **Editor & Fallback**: Directly inserts text into active editor selections/cursors; if no editor is open, copies the selected item to your system clipboard with a notification.

---

## Keyboard Shortcuts

| Shortcut (Windows/Linux) | Shortcut (macOS) | Action |
| --- | --- | --- |
| `Win+Alt+V` | `Cmd+Alt+V` | Open clipboard history QuickPick |
| `Ctrl+Alt+V 1` | `Cmd+Alt+V 1` | Paste item #1 (most recently copied) |
| `Ctrl+Alt+V 2` | `Cmd+Alt+V 2` | Paste item #2 |
| `Ctrl+Alt+V 3` | `Cmd+Alt+V 3` | Paste item #3 |
| `Ctrl+Alt+V 4` | `Cmd+Alt+V 4` | Paste item #4 |
| `Ctrl+Alt+V 5` | `Cmd+Alt+V 5` | Paste item #5 |
| `Ctrl+Alt+V 6` | `Cmd+Alt+V 6` | Paste item #6 |
| `Ctrl+Alt+V 7` | `Cmd+Alt+V 7` | Paste item #7 |
| `Ctrl+Alt+V 8` | `Cmd+Alt+V 8` | Paste item #8 |
| `Ctrl+Alt+V 9` | `Cmd+Alt+V 9` | Paste item #9 |
| `Ctrl+Alt+V 0` | `Cmd+Alt+V 0` | Paste item #10 |

> **Note**: You can customize these keybindings at any time in VS Code via **Preferences: Open Keyboard Shortcuts (JSON)**.

---

## Commands

All commands can be executed via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **`Clipboard: Show History & Paste`**: Opens the searchable history list.
- **`Clipboard: Paste by Number...`**: Prompts you to enter an item number (1-10) to paste.
- **`Clipboard: Paste Item 1`** through **`Clipboard: Paste Item 10`**: Directly pastes item 1–10.
- **`Clipboard: Clear History`**: Empties the saved clipboard list.

---

## Extension Settings

You can customize the extension via VS Code Settings (`Ctrl+,`):

* `clipboardList.maxItems`: Maximum number of clipboard history items to keep (default: `10`, range: `1`–`50`).
* `clipboardList.pollIntervalMs`: Interval in milliseconds for polling the clipboard (default: `800` ms).
