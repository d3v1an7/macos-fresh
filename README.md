# <img src="https://cdn.rawgit.com/d3v1an7/fresh/master/logo.svg" alt="fresh" width="30%" />

[![os_version](https://img.shields.io/badge/OS%20X-10.11-blue.svg?maxAge=2592000)](https://itunes.apple.com/au/app/os-x-el-capitan/id1018109117)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](LICENSE.md)
[![status](https://img.shields.io/badge/status-WIP-red.svg?maxAge=2592000)](WIP.md)

A super opinionated Ansible playbook (with bash bootstrap) that gets me up and running after a fresh install of OS X.

It's unlikely that the applications and system defaults I've chosen will suit your purposes exactly, but hopefully you'll find it easy enough to follow along and customise on your own fork.

[Pull requests](https://help.github.com/articles/creating-a-pull-request/) are very welcome :ok_hand:

## Installation
Open terminal and run
``` sh
$ curl --progress-bar https://raw.githubusercontent.com/d3v1an7/fresh/master/bin/fresh | bash -s init
```
> Hold on... isn't piping random scripts to shell a [really bad idea](http://www.seancassidy.me/dont-pipe-to-your-shell.html)?

Correct! But it is also pretty convenient, so... :see_no_evil:  
I'd recommend having a general understanding of any script before installing, but I'll leave that up to you!

## Usage
```
$ fresh
usage: fresh [--version] [--help] <command> [<args>]

Available commands are:
    install  Installs applications and makes changes to system defaults
    undo     Restores system to last known state
    init     Ensures system has tools and apps required
```

Arguments for the `install` and `undo` commands are all optional. The available flags are:
```
-apps
-defaults
```

## FAQ
### Why this and not [something else]?
1. Rollbacks. Don't like what happened after `install`? The `undo` command will unset all changes, meaning you can return your system to the state before running, or even back to factory default (when using the example rollback config supplied).
1. Ansible. Ansible has a trivial barrier to entry (in comparison to say, Puppet) and playbooks are cleaner and easier to configure than most bash scripts.

### In summary, what does the install script actually do?
When run with the `init` command, the script will:
1. [`bin/fresh`](bin/fresh)
  - Ensure the following are available on system:
    - [Xcode Command Line Tools](https://developer.apple.com/xcode/downloads/)
    - [Homebrew](http://brew.sh/)
    - [Git](http://git-scm.com/downloads/)
    - [Ansible](http://docs.ansible.com/intro_installation.html)
  - Clone this repo into `~/.fresh/`
  - Run the Ansible playbook below
1. [`ansible/playbook.yml`](ansible/playbook.yml)
  - Symlink `bin/fresh` to `/usr/local/bin/fresh`

## Contributing
If you have any questions or suggestions, you can:
- Submit a [pull request](https://github.com/d3v1an7/fresh/pull/new/master)
- Submit an [issue](https://github.com/d3v1an7/fresh/issues/new), or
- Say hello on [Twitter](https://twitter.com/d3v1an7)

## Acknowledgements
Shout out to the many who have tread this ground before:
- boxen [our-boxen](https://boxen.github.com/)
- ptb [osx-setup](https://github.com/ptb/Mac-OS-X-Lion-Setup)
- mathiasbynens [dotfiles](https://github.com/mathiasbynens/dotfiles)
- necolas [dotfiles](https://github.com/necolas/dotfiles)
- rafeca [dotfiles](https://github.com/rafeca/dotfiles)
- pongstr [dotfiles](https://github.com/pongstr/dotfiles)
- paularmstrong [dotfiles](https://github.com/paularmstrong/dotfiles)

This would not be possible without:
- [homebrew](https://github.com/Homebrew/homebrew)
- [homebrew-cask](https://github.com/caskroom/homebrew-cask)
- [ansible](https://github.com/ansible/ansible)

And much :heart: to:
- [base16](https://github.com/chriskempson/base16)
- [source code pro](https://github.com/adobe-fonts/source-code-pro)
