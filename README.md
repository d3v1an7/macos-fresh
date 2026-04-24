# fresh

Super opinionated tools, apps and defaults for macOS.

[![os_version](https://img.shields.io/badge/macOS-26.x-blue.svg?maxAge=2592000)](https://www.apple.com/macos/)
[![license](https://img.shields.io/badge/license-GLWTPL-green.svg?maxAge=2592000)](LICENSE)

## Overview

This over-engineered macOS bootstrap is intended to be run after a fresh install of macOS, but can be run safely on established machines too.

It's unlikely that the [chosen applications and system defaults](https://gist.github.com/d3v1an7/ba0e1a530bfe27121de534c9d6a51213) will suit your purposes exactly, but go ahead and hit fork on [the config](https://gist.github.com/d3v1an7/ba0e1a530bfe27121de534c9d6a51213) and do your own thing!

[Pull requests](https://help.github.com/articles/creating-a-pull-request/) are very welcome!

---

## Installing fresh

First, install `homebrew` by opening a terminal window and running:

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install `fresh`:

```sh
brew install d3v1an7/taps/macos-fresh
```

## Running fresh

Fetch a remote config (typically a raw GitHub Gist):

```sh
fresh --config-url https://gist.githubusercontent.com/d3v1an7/ba0e1a530bfe27121de534c9d6a51213/raw
```

Or point at a local YAML file:

```sh
fresh --config ./my-config.yaml
```

Preview every action without executing any mutating command:

```sh
fresh --config ./my-config.yaml --dry-run
```

---

## Config

All top-level sections are optional.

```yaml
brew:
  brew:     [git, node, ...]              # brew install <name>
  cask:     [visual-studio-code, ...]     # brew install --cask <name>

mas:
  - { id: 1333542190, name: "1Password 7 - Password Manager" }

system_name_update: true                  # prompts for name, runs sudo scutil --set ComputerName

power:
  power_settings_all:     { values: { displaysleep: 10, sleep: 30 } }
  power_settings_battery: { values: { displaysleep: 5 } }
  power_settings_charger: { values: { displaysleep: 15 } }

settings:
  - path: "~/Library/Preferences/com.apple.finder.plist"
    values: { AppleShowAllFiles: true, FXDefaultSearchScope: "SCcf", ShowPathbar: true, ShowStatusBar: true, _FXSortFoldersFirst: true }
  - path: "~/Library/Preferences/com.apple.screencapture.plist"
    values: { location: "~/Desktop", type: "png", disable-shadow: true }
  - path: "~/Library/Preferences/com.apple.universalaccess.plist"
    values: { reduceTransparency: true }       # tones down Tahoe's Liquid Glass

apps:
  brave:
    settings:
      - path: "~/Library/Application Support/BraveSoftware/Brave-Browser/Default/Preferences"
        values: { homepage: "https://example.com" }
    set_as_default: true

fonts:
  - { "JetBrains Mono": https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/JetBrainsMono.zip }
```

Plist `path` values support `~` home expansion and a literal `UUID` token that is replaced with the machine's Hardware UUID at runtime.

---

## Contributing

Prerequisites: Node 22 (matches `.node-version`) and `npm`.

```sh
git clone https://github.com/d3v1an7/macos-fresh.git ~/workspace/macos-fresh
cd ~/workspace/macos-fresh
fnm use            # or: asdf install — anything that respects .node-version
npm install
```

Useful scripts:

```sh
npm test               # run Vitest once
npm run test:watch     # watch mode
npm run lint           # biome check
npm run format         # biome format --write
npm run build          # esbuild bundle to dist/fresh.mjs
npm start -- --config ./my-config.yaml --dry-run
```

---

## Release

CD runs on merges to `main`. Include `major`, `minor`, or `patch` in the merge commit message to bump the version; `skip` to skip. The workflow builds `dist/fresh.mjs`, tars up `dist/ + package.json + README.md + LICENSE`, creates a GitHub release, and bumps the formula in the [`d3v1an7/homebrew-taps`](https://github.com/d3v1an7/homebrew-taps) tap.

The Homebrew formula looks roughly like:

```ruby
class MacosFresh < Formula
  desc "Super opinionated tools, apps and defaults for macOS"
  homepage "https://github.com/d3v1an7/macos-fresh"
  url "https://github.com/d3v1an7/macos-fresh/releases/download/X.Y.Z/macos-fresh-X.Y.Z.tar.gz"
  sha256 "…"
  license "GLWTPL"
  depends_on "node"

  def install
    libexec.install Dir["macos-fresh-*/dist/fresh.mjs"]
    (bin/"fresh").write <<~EOS
      #!/bin/sh
      exec "#{Formula["node"].opt_bin}/node" "#{libexec}/fresh.mjs" "$@"
    EOS
    chmod 0755, bin/"fresh"
  end

  test do
    assert_match "Usage:", shell_output("#{bin}/fresh --help")
  end
end
```
