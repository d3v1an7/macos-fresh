# fresh

Super opinionated tools, apps and defaults for macOS.

[![os_version](https://img.shields.io/badge/macOS-10.14_Preview-blue.svg?maxAge=2592000)](https://www.apple.com/macos/mojave-preview/)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](LICENSE.md)
![status](https://img.shields.io/badge/status-not_widely_tested-orange.svg?maxAge=2592000)

## Overview
This over-engineered macOS bootstrap is intended to be run after a fresh install of macOS, but can be run safely on established machines too!

It's unlikely that the chosen applications and system defaults will suit your purposes exactly, but you should find it easy enough to customise.

[Pull requests](https://help.github.com/articles/creating-a-pull-request/) are very welcome!

## Optional prerequisites

**Before formatting your machine**
- Go through Atom packages and themes, and 'star' the ones you want to keep
- Run `brew bundle dump` to create a `Brewfile` based on your current installation
- Run `mackup --dry-run backup` to see which apps are compatible with mackup
  - If you'd like to backup everything listed, just run the command again without `--dry-run`
  - If you'd like to only backup selected apps, read more [here](https://github.com/lra/mackup/blob/master/doc/README.md#applications)

You can use this information to start crafting your own [`config.yaml`](config.yaml)

## Installation

Open a terminal window and run:
``` sh
bash <(curl -s https://raw.githubusercontent.com/d3v1an7/fresh/master/bin/setup)
```

This will install the tools required to run the script, and download this repo to `~/.fresh`.

I _highly_ recommend getting familiar with what's in `~/.fresh/config.yaml` before proceeding further. Feel free to remove chunks you aren't interested in (i.e. `.misc.font`) and update any values that aren't to your liking.

Once you're happy, run:
``` sh
~/.fresh/bin/fresh
```

## What will the script do?

- Use [homebrew](https://github.com/Homebrew/brew) to install everything in [Brewfile](Brewfile) (`brew bundle install`)
- Use [mackup](https://github.com/lra/mackup) to restore .dotfiles, app config & licences (`mackup restore`)
- Use [plutil](http://scriptingosx.com/2016/11/editing-property-lists/) to check and update system defaults (`plutil -replace`)
- Use a bunch of bash to configure `misc` settings

## Uninstall

**Manual steps**
- Remove taps, formulae and casks in the generated `~/.fresh/Brewfile`
- Check the `~/.fresh/fresh.log` for original system defaults and fix as required
- Check all `misc_` named functions in `~/.fresh/bin/fresh` and clean up as required

**Commands**
```
$ mackup uninstall
$ rm ~/.mackup.cfg
$ rm -R ~/.fresh
```

## Problems to solve

`Finder > Preferences > Sidebar`
- Uncheck all, except the following
  - Favorites: iCloud Drive, AirDrop, Desktop, Home
  - Shared: Connected servers
  - Devices: Hard disks, External disks, CDs

`[New Finder window]`
- Add `~/Applications`
- Set order of sidebar
  - Desktop
  - Home
  - ~/Applications
  - AirDrop

## More info

`~/.fresh/config.yaml`

Although it's not as straightforward as just using a shell script, I like the idea of all the tools, apps, and system settings in a single file and format. It requires a bit of love, but I think it's worth it :sparkles:

 `~/.fresh/fresh.log`

Just executing someone else's giant dotfile config gives me the willies. What if something doesn't _feel_ right afterwards? So every change to `defaults` will be appended to `fresh.log`, so you can manually revert changes if you aren't feeling it.

`~/mackup.cfg`

Thi exists as I only want Mackup to handle the the apps in `config.yaml` as I tend to install a bunch of stuff 'for fun' over time, which I don't necessarily want to store config for.

## Contributing

If you have any questions or suggestions, you can:
- Submit a [pull request](https://github.com/d3v1an7/fresh/pull/new/master)
  - Please see style guide [here](https://google.github.io/styleguide/shell.xml)
  - Please lint with ShellCheck before submitting PRs (`make check`)
- Submit an [issue](https://github.com/d3v1an7/fresh/issues/new), or
- Say hello on [Twitter](https://twitter.com/d3v1an7)

## Acknowledgements

Shout out to the many who have tread this ground before:
- boxen/[our-boxen](https://boxen.github.com/)
- mathiasbynens/[dotfiles](https://github.com/mathiasbynens/dotfiles)
- ptb/[osx-setup](https://github.com/ptb/Mac-OS-X-Lion-Setup)
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
