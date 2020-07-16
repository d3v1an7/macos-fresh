# fresh

Super opinionated tools, apps and defaults for macOS.

[![os_version](https://img.shields.io/badge/macOS-10.15-blue.svg?maxAge=2592000)](https://www.apple.com/macos/catalina/)
[![license](https://img.shields.io/badge/license-GLWTPL-green.svg?maxAge=2592000)](LICENSE)

## Overview

This over-engineered macOS bootstrap is intended to be run after a fresh install of macOS, but can be run safely on established machines too.

It's unlikely that the chosen applications and system defaults will suit your purposes exactly, but you should find it easy enough to customise.

[Pull requests](https://help.github.com/articles/creating-a-pull-request/) are very welcome!

## Installing fresh

Open a terminal window and run:
``` sh
bash <(curl -s https://raw.githubusercontent.com/d3v1an7/fresh/master/bin/setup)
```

This will:

- Install the tools required to run the script
- Download this repo to `~/.fresh`.

I _highly_ recommend getting familiar with what's in `~/.fresh/config.yaml` before proceeding further. Feel free to remove chunks you aren't interested in (i.e. `.misc.font`) and update any values that aren't to your liking. You can also just ignore all of this and jump right in! I do my best to track how your system was before the changes so you can manually revert if needed.

## Running fresh

Once you're happy, run:
``` sh
~/.fresh/bin/fresh
```

This will:

- Use [homebrew](https://github.com/Homebrew/brew) to install apps and tools in config (`brew bundle install`).
- Use [mackup](https://github.com/lra/mackup) to restore .dotfiles, app config & licences (`mackup restore`).
- Use [plutil](http://scriptingosx.com/2016/11/editing-property-lists/) to check and update system defaults (`plutil -replace`).
- Use a bunch of bash to configure `misc` settings.

## Optional prerequisites

**Craft your own config**

- Run `brew bundle dump` to create a `Brewfile` in your current directory, which lists your current `brew` tools and apps.
- Run `mackup --dry-run backup` to see which apps are compatible with mackup.
  - If you'd like to backup everything listed, just run the command again without `--dry-run`.
  - If you'd like to only backup selected apps, read more [here](https://github.com/lra/mackup/blob/master/doc/README.md#applications).

## Uninstall

**Revert**

- Remove taps, formulae and casks in the generated `~/.fresh/Brewfile`.
- Check the `~/.fresh/fresh.log` for original system defaults and fix as required.
- Check all `misc_` named functions in `~/.fresh/bin/fresh` and clean up as required.

**Remove**

``` sh
mackup uninstall
rm ~/.mackup.cfg
rm -R ~/.fresh
```

## More info

`~/.fresh/config.yaml`

I like the idea of putting all the tools, apps, and system settings in a single file and format. It requires a bit of faffing about, but I think it's worth it! :sparkles:

 `~/.fresh/fresh.log`

Just executing someone else's giant dotfile config gives me the jibblies. What if something doesn't feel right afterwards? So every change to `defaults` will be appended to `fresh.log`, which gives you the information needed to manually revert changes if you aren't feeling it.

`~/mackup.cfg`

This exists as I only want Mackup to handle the the apps specified in `config.yaml`. I tend to install a bunch of stuff 'for fun' over time, which I don't necessarily want to store config for.

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
