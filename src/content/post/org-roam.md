---
title: "Setting Up Org-Roam on macOS"
description: ""
publishDate: 2026-05-26
draft: true
---

## 1. Install Homebrew

Homebrew is the missing package manager for macOS. Paste this into a terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen prompts. Once complete, verify:

```bash
brew --version
```

The installer will also prompt you to add Homebrew to your PATH. On Apple Silicon Macs this is typically:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

## 2. Install Emacs

Doom requires Emacs 27.1+ with native compilation for best performance. We'll use emacs-mac, the most preferred option according to Doom's official docs. It has the best macOS integration (native emojis, better childframe support), but does not include native compilation — the warning from `doom doctor` is expected and safe to ignore.

Install it:

```bash
brew tap railwaycat/emacsmacport
brew install emacs-mac --with-modules
```

For either, symlink the `.app` so macOS can find it:

```bash
# Apple Silicon Macs (M1/M2/M3/M4/M5) — Homebrew prefix is /opt/homebrew
ln -s "$(brew --prefix)/opt/emacs-mac/Emacs.app" /Applications/Emacs.app
```

**Avoid these** — they have known compatibility issues with Doom:
- `brew install --cask emacs` (emacsformacosx.com)
- `brew install emacs` (no Emacs.app, terminal only)
- AquaMacs, XEmacs

Running `emacs` from the terminal opens its own graphical window (it defaults to the GUI, not terminal-only). Use `emacs -nw` for terminal-only mode.

Verify the install:

```bash
emacs --version
```

## 3. Install Doom Emacs

Install Doom's dependencies:

```bash
brew install git ripgrep coreutils fd fontconfig shellcheck
xcode-select --install
```

| Package | Purpose |
|---|---|
| `git` | Source control |
| `ripgrep` | Fast file searching (required) |
| `coreutils` | GNU ls, etc. for `dired` |
| `fd` | Fast file finding |
| `xcode-select` | Installs clang |

Clone Doom Emacs and run the installer:

```bash
git clone https://github.com/doomemacs/doomemacs ~/.emacs.d
~/.emacs.d/bin/doom install
```

This will generate a default config, install packages, and compile bytecode. When it finishes, you can launch Doom by running `emacs`.

Add `doom` to your PATH for convenience:

```bash
echo 'export PATH="$HOME/.emacs.d/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Finally, generate the envvar file (required for GUI Emacs on macOS) and run the doctor:

```bash
doom env
doom doctor
```

Address any warnings from `doom doctor` before continuing.

## 4. Enable Org Mode and Org-Roam

Open your Doom config in an editor:

```bash
$EDITOR ~/.config/doom/init.el
```

**If `~/.config/doom` doesn't exist, use `~/.doom.d` instead** (Doom recognizes either). In your `init.el`, find the `:lang` section in the `doom!` block and add the `+roam2` flag to the `org` module:

```elisp
:lang
(org +roam2)       ; organize your plain life in plain text
```

When enabling a second module under `:lang`, make sure `org` stays on the same line with its flag — don't repeat it:

```elisp
:lang
emacs-lisp        ; drown in parentheses
markdown          ; writing docs for people to ignore
(org +roam2)      ; organize your plain life in plain text
sh                ; she sells {ba,z,fi}sh shells on the C xor
```

The `+roam2` flag enables Org-Roam v2 support in Doom's built-in org module. No need to manually declare the package.

Then sync Doom:

```bash
doom sync
```

Restart Emacs. Org and Org-Roam are now active. Confirm with `M-x org-roam-db-sync`.

## 5. Configure Org-Roam

Set the directory where your notes live by adding this to `~/.config/doom/config.el` (or `~/.doom.d/config.el`):

```elisp
(setq org-roam-directory (file-truename "~/Documents/org-roam"))
(org-roam-db-autosync-mode)
```

Sync once more:

```bash
doom sync
```

## 6. Install Org-Roam-UI

Org-Roam-UI provides a browser-based graph view of your notes. It requires Node.js.

```bash
brew install node
```

Add the package to your `packages.el`:

```elisp
;; ~/.config/doom/packages.el (or ~/.doom.d/packages.el)
(package! org-roam-ui)
```

Then configure it in your `config.el`:

```elisp
(use-package! org-roam-ui
  :after org-roam
  :config
  (setq org-roam-ui-sync-theme t
        org-roam-ui-follow t
        org-roam-ui-update-on-save t
        org-roam-ui-open-on-start t))
```

Sync Doom:

```bash
doom sync
```

Restart Emacs and launch org-roam-ui with `M-x org-roam-ui-open`. This opens a local web view at `http://127.0.0.1:35901` showing the graph visualization of your notes.

## Usage Quickstart

| Command | Keybinding | Description |
|---|---|---|
| `org-roam-node-find` | `SPC n r f` | Find or create a note |
| `org-roam-node-insert` | `SPC n r i` | Insert a backlink |
| `org-roam-db-sync` | — | Sync the roam database |
| `org-roam-ui-open` | — | Open the graph UI |

Create your first note: press `SPC n r f`, type a title, and start writing. Links to other notes are created with `SPC n r i` while editing.
