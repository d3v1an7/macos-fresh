# <img src="https://cdn.rawgit.com/d3v1an7/fresh/1285b4998e99232cfe70b8a11c3782f4943dcd91/logo.svg" alt="fresh" width="30%" />

[![os_version](https://img.shields.io/badge/macOS-10.13-blue.svg?maxAge=2592000)](https://www.apple.com/macos/high-sierra/)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](LICENSE.md)
[![status](https://img.shields.io/badge/status-WIP-red.svg?maxAge=2592000)](WIP.md)

Super opinionated and wildly over-engineered macOS bootstrap. Intended to be run after a fresh install of macOS, but can be run safely on established machines too!

The `fresh` Node CLI tool (and subsequent Ansible playbook) are run from a Docker container on demand to minimise local dependencies and keep your filesystem nice and tidy :ok_hand:

It's unlikely that the chosen applications and system defaults will suit your purposes exactly, but you should find it easy enough to customise on your own fork.

[Pull requests](https://help.github.com/articles/creating-a-pull-request/) are welcome!

> Wait. So a homebrew app starts a docker container which starts a node app which starts an Ansible playbook to just change a few settings?

Yes.

> That is insanely over-engineered.

Yes.

> Why?

It's experiments like this that help me learn things! Also, using just Homebrew and Docker as a general rule keeps things pretty tidy on the host machine.

## Pre-installation checklist

- [ ] You have [Homebrew](https://brew.sh/) installed
- [ ] Your `$SHELL` is either `bash` or `zsh`

## Installation

### Setup

```sh
bash <(curl -s https://raw.githubusercontent.com/d3v1an7/fresh/master/bin/setup.sh)

# This script will do the following:
# - Install Docker for Mac, along with other tools required for setup
# - Create a SSH key for this project (for Ansible)
# - Enable remote login (for Ansible)
```

### Install

```sh
brew tap d3v1an7/tap
brew install macos-fresh --verbose

# This will add our custom homebrew tap and install `macos-fresh`
# The install may take some time on first run!
```

### Setup env vars

```sh
bs provision

# This will add `~/.bluestrap` and make sure that file is sourced by your $SHELL
# This is what sets up `goenv`, `nodenv`, our npm token and `BitBar`
# You should only need to do this once
```

### Ensure env vars are available

```sh
echo $GOPATH

# If nothing is returned, open a new terminal window or tab and try again
# If $GOPATH is still empty, try `bs provision -vvv` and troubleshoot errors
```

### Init

```sh
bs init

# This will run the following for for all your selected group in
# `cli-bluestrap/groups.yml`:
# - `git clone`
# - `docker-compose pull`
# - `goenv install` (as required)
```

### Start

```sh
bs start

# `bs start` will run `docker-compose up` for all your selected group in
# `cli-bluestrap/groups.yml`
```

### Hosts

```sh
bs hosts

# `bs hosts` will check which containers have a host set and will add them
# to your /etc/hosts file
```

## Updating

```sh
brew upgrade cli-bluestrap --verbose
bs update
```



## General usage

### Available commands and arguments

```console
usage: bs [--version] [--help] <command> [args]

Available commands:
    init           Initialise local development environment
    update         Alias for init
    start          Start local development environment
    stop           Stop local development environment
    restart        Restart local development environment
    down           Destroy local development environment
    pull-git       Run git pull for all repos
    pull-docker    Run docker pull for all repos
    provision      Setup dotfiles and bitbar
    hosts          Update hosts file

Available arguments:
    shared
    audience
    audience-lite
    cms
    cms-lite
    editorial

Additional Ansible arguments:
    --verbose      Enable verbose mode
```

## Links

- [Troubleshooting](https://bitbucket.org/ffxblue/cli-bluestrap/wiki/Troubleshooting)
- [Contributing](https://bitbucket.org/ffxblue/cli-bluestrap/wiki/Contributing)
- [Reporting issues](https://bitbucket.org/ffxblue/cli-bluestrap/issues/new)

## Acknowledgements

[Code Climate CLI](https://github.com/codeclimate/codeclimate) was a huge inspiration for containerisation effort
















## Installation
Open terminal and run
``` sh
$ curl --progress-bar https://raw.githubusercontent.com/d3v1an7/fresh/master/bin/fresh | bash -s init
```
> Hold on... isn't piping random scripts to shell a [really bad idea](http://www.seancassidy.me/dont-pipe-to-your-shell.html)?

Yep! But it is also pretty convenient, so... :see_no_evil:  
I'd recommend having a general understanding of any script before installing, but I'll leave that up to you!

## Usage
```
$ fresh
usage: fresh [--version] [--help] <command> [<args>]

Available commands are:
    install  Installs applications and makes changes to system defaults
    undo     Restores system to last known state
    init     Ensures system has tools and apps required

Optional flags for the INSTALL and UNDO commands:
    --skip   Skips specified role [apps|system|config]
```

## Known issues
1. **IMPORTANT:** At this time, `undo` will NOT rollback the following settings:  
  - OS X Energy Saver settings
    - Previous settings are saved as raw output in `ansible/vars/system.backup.yml`
  - All application config in `ansible/roles/config`, including Atom, iTerm, Google Chrome, etc...
    - You can avoid this for now by running `install` with `--skip config`
1. Cannot modify dock/menubar using the osx_defaults module: https://github.com/ansible/ansible-modules-extras/issues/2610

## FAQ
### Why this and not [something else]?
1. Rollbacks. A backup variable file is created on each run of `install`. The `undo` command will unset _most_ changes (see known issues above), meaning you can return your system very closely to the state before running.
<!-- drop this line back in when the example files have been made: or even back to factory default (when using the example rollback config supplied).  -->
1. Ansible. Ansible has a trivial learning curve (in comparison to say, Puppet) and Ansible Playbooks are cleaner and easier to configure than most bash scripts.

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





![cli-bluestrap-logo](https://static.ffx.io/images/w_120,h_137,c_fill,fl_apng/l_logo-cli-bluestrap,fl_cutter,w_120/mindblown)
# cli-bluestrap

## Overview

`cli-bluestrap` exists to assist in standardising our local development environment and process. The `bs` cli tool (and subsequent Ansible playbook) are run from a Docker container on demand to minimise local dependencies and keep your filesystem nice and tidy :ok_hand:

## Pre-installation checklist

- You have [Homebrew](https://brew.sh/) installed
- You have generated a [personal access key/secret](https://ffxblue.atlassian.net/wiki/display/TECH/AWS+Credentials) for the Product and Tech AWS account
- You have added an SSH key to your [Bitbucket account](https://bitbucket.org/account/ssh-keys/)
- Your `$SHELL` is either `bash` or `zsh`

## Installation

### Setup

```sh
bash <(curl -s https://s3-ap-southeast-2.amazonaws.com/cli-bluestrap.ffxblue.com.au/setup)

# This script will do the following:
# - Install Docker for Mac, along with other tools required for setup
# - Update Docker settings
# - Configure AWS credentials
# - Create a SSH key for this project (for Ansible)
# - Enable remote login (for Ansible)
```

### Install

```sh
brew tap ffxblue/custom
brew install cli-bluestrap --verbose

# This will add our custom homebrew tap and install `cli-bluestrap`
# The install may take some time on first run!
```

### Setup env vars

```sh
bs provision

# This will add `~/.bluestrap` and make sure that file is sourced by your $SHELL
# This is what sets up `goenv`, `nodenv`, our npm token and `BitBar`
# You should only need to do this once
```

### Ensure env vars are available

```sh
echo $GOPATH

# If nothing is returned, open a new terminal window or tab and try again
# If $GOPATH is still empty, try `bs provision -vvv` and troubleshoot errors
```

### Init

```sh
bs init

# This will run the following for for all your selected group in
# `cli-bluestrap/groups.yml`:
# - `git clone`
# - `docker-compose pull`
# - `goenv install` (as required)
```

### Start

```sh
bs start

# `bs start` will run `docker-compose up` for all your selected group in
# `cli-bluestrap/groups.yml`
```

### Hosts

```sh
bs hosts

# `bs hosts` will check which containers have a host set and will add them
# to your /etc/hosts file
```

## Updating

```sh
brew upgrade cli-bluestrap --verbose
bs update
```

## General usage

### Available commands and arguments

```console
usage: bs [--version] [--help] <command> [args]

Available commands:
    init           Initialise local development environment
    update         Alias for init
    start          Start local development environment
    stop           Stop local development environment
    restart        Restart local development environment
    down           Destroy local development environment
    pull-git       Run git pull for all repos
    pull-docker    Run docker pull for all repos
    provision      Setup dotfiles and bitbar
    hosts          Update hosts file

Available arguments:
    shared
    audience
    audience-lite
    cms
    cms-lite
    editorial

Additional Ansible arguments:
    --verbose      Enable verbose mode
```

## Links

- [Troubleshooting](https://bitbucket.org/ffxblue/cli-bluestrap/wiki/Troubleshooting)
- [Contributing](https://bitbucket.org/ffxblue/cli-bluestrap/wiki/Contributing)
- [Reporting issues](https://bitbucket.org/ffxblue/cli-bluestrap/issues/new)

## Acknowledgements

[Code Climate CLI](https://github.com/codeclimate/codeclimate) was a huge inspiration for containerisation effort
