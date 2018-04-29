# fresh

Super opinionated defaults for macOS.

[![os_version](https://img.shields.io/badge/macOS-10.13-blue.svg?maxAge=2592000)](https://www.apple.com/macos/high-sierra/)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](LICENSE.md)
![status](https://img.shields.io/badge/status-not_widely_tested-orange.svg?maxAge=2592000)

Over-engineered macOS bootstrap. Intended to be run after a fresh install of macOS, but can be run safely on established machines too!

It's unlikely that the chosen applications and system defaults will suit your purposes exactly, but you should find it easy enough to customise.

[Pull requests](https://help.github.com/articles/creating-a-pull-request/) are very welcome!

## Optional prerequisites

**Before formatting your machine**
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
- Use [bork](https://github.com/mattly/bork) to assert changes to system defaults (`bork do ok defaults`)
- Use a bunch of bash to configure `misc` settings

## Uninstall

**Manual steps**
- Manually remove taps, formulae and casks in the generated `~/.fresh/Brewfile`
- Check the `fresh.log` for original system defaults, and either fix manually or update values in `~/.fresh/config.yaml`
- Manually check all `misc_` named functions in `~/.fresh/bin/fresh` and clean up as required

**Commands**
```
$ mackup uninstall
$ rm ~/.mackup.cfg
$ rm -R ~/.fresh
```

## Problems to solve

`System Preferences > Displays > Display`
- Resolution
  - Select `Scaled`
  - Change scale to `More Space`
    - Have tried `brew/screenresolution` and `brew/cask/cscreen`.
    - Both seem to change the resolution for the current session only, and do not scale the screen properly (text and edges are blurry)

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

Just executing someone else's giant dotfile config gives me the willies. What if something doesn't _feel_ right afterwards? I don't want you to feel that same anxiety, so I've tried to make the bash output verbose enough to keep a log. Each run of `bin/fresh.sh` will append to `fresh.log`, so you can revert changes if they don't feel right.

`~/mackup.cfg`

I only want Mackup to handle the the apps in `config.yaml` as I tend to install a bunch of stuff 'for fun' over time, which I don't necessarily want to store config for.

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
- [bork](https://github.com/mattly/bork)

And much :heart: to:
- [base16](https://github.com/chriskempson/base16)
- [source code pro](https://github.com/adobe-fonts/source-code-pro)
