# fresh

Super opinionated defaults for macOS.

[![os_version](https://img.shields.io/badge/macOS-10.13-blue.svg?maxAge=2592000)](https://www.apple.com/macos/high-sierra/)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](LICENSE.md)
[![status](https://img.shields.io/badge/status-WIP-red.svg?maxAge=2592000)](WIP.md)

Over-engineered macOS bootstrap. Intended to be run after a fresh install of macOS, but can be run safely on established machines too!

It's unlikely that the chosen applications and system defaults will suit your purposes exactly, but you should find it easy enough to customise.

[Pull requests](https://help.github.com/articles/creating-a-pull-request/) are very welcome!

## Installation

Open a terminal window and run
``` sh
[script here]
```

If you want to re-run this script for whatever reason, you should be able to run locally with
```
$ ~/.fresh/make
```

## What will the script do?

- Ensure the following are available on system:
  - [Xcode Command Line Tools](https://developer.apple.com/xcode/downloads/)
  - [Homebrew](https://github.com/Homebrew/brew)
  - [Git](http://git-scm.com/downloads/)
- Clone this repo into `~/.fresh/`
- Use [Homebrew](https://github.com/Homebrew/brew) to install everything in [Brewfile](Brewfile) (`brew bundle install`)
- Use [Mackup](https://github.com/lra/mackup) to restores .dotfiles, app config & licences (`mackup restore`)
- Wild json config shit

## Uninstall

- Manually remove stuff in [Brewfile](Brewfile)
- Run `mackup uninstall`
- Manually update the [JSON FILE] with original values, which was stored [HERE]
- Run `rm ~/.fresh`

## Q&A

### Why the config.json?

Just executing someone else's dotfile config gives me the willies. What if something doesn't _feel_ right afterwards? I don't want _you_ to feel that anxiety, so I wanted to provide a easy way to:
1. Read and understand the changes
2. Use a standard format to backup existing settings

### Why the mackup.cfg

I'm using Homebrew to install all my tools and apps, and the excellent Mackup to handle my .dotfiles, app config and licences. I only want Mackup to handle the stuff defined in the Brewfile as I tend to install a bunch of stuff 'for fun', which I don't necessarly want to store config for. Both the Brewfile and the Mackup config are kept in sync via Makefile and config.json

## Contributing

If you have any questions or suggestions, you can:
- Submit a [pull request](https://github.com/d3v1an7/fresh/pull/new/master)
- Submit an [issue](https://github.com/d3v1an7/fresh/issues/new), or
- Say hello on [Twitter](https://twitter.com/d3v1an7)

## Acknowledgements

Shout out to the many who have tread this ground before:
- boxen/[our-boxen](https://boxen.github.com/)
- ptb/[osx-setup](https://github.com/ptb/Mac-OS-X-Lion-Setup)
- mathiasbynens/[dotfiles](https://github.com/mathiasbynens/dotfiles)
- necolas/[dotfiles](https://github.com/necolas/dotfiles)
- rafeca/[dotfiles](https://github.com/rafeca/dotfiles)
- pongstr/[dotfiles](https://github.com/pongstr/dotfiles)
- paularmstrong/[dotfiles](https://github.com/paularmstrong/dotfiles)

This would not be possible without:
- [homebrew](https://github.com/Homebrew/brew)
- [homebrew-cask](https://github.com/caskroom/homebrew-cask)
- [mackup](https://github.com/lra/mackup)

And much :heart: to:
- [base16](https://github.com/chriskempson/base16)
- [source code pro](https://github.com/adobe-fonts/source-code-pro)
