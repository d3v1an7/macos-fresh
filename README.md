# fresh

Super opinionated tools, apps and defaults for macOS.

[![os_version](https://img.shields.io/badge/macOS-13.x-blue.svg?maxAge=2592000)](https://www.apple.com/macos/ventura/)
[![license](https://img.shields.io/badge/license-GLWTPL-green.svg?maxAge=2592000)](LICENSE)

## Overview

This over-engineered macOS bootstrap is intended to be run after a fresh install of macOS, but can be run safely on established machines too.

It's unlikely that the [chosen applications and system defaults](https://gist.github.com/d3v1an7/ba0e1a530bfe27121de534c9d6a51213) will suit your purposes exactly, but go ahead and hit fork on [the config](https://gist.github.com/d3v1an7/ba0e1a530bfe27121de534c9d6a51213) and do your own thing!.

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

```sh
fresh --config=[url of your config file]

# For example:
fresh --config-url https://gist.githubusercontent.com/d3v1an7/ba0e1a530bfe27121de534c9d6a51213/raw
```

---

## Contributing

Install the following tools, remembering to also follow any post install instructions:

```sh
brew install pyenv
brew install pyenv-virtualenv
brew install --cask visual-studio-code
```

Clone the project, and create a new virtualenv for it to run in:

```sh
git clone https://github.com/d3v1an7/macos-fresh.git ~/workspace/macos-fresh
cd ~/workspace/macos-fresh
pyenv install
pyenv virtualenv fresh
```

Install poetry
```sh
brew install pipx
pipx ensurepath
pipx install poetry
```

Open up Visual Studio Code, and the IDE terminal should start in the fresh virtual environment.
Or, use whatever terminal you want, and just activate the virtual env from there:

```sh
code ~/workspace/macos-fresh
# OR
pyenv activate fresh
```

Once you're in the correct virtual environment, go ahead and install the dependencies!

```sh
poetry install
poetry run fresh --config=[url of your config file]
```

If you'd like to test the GitHub Actions locally, you'll need:

```sh
brew install act
brew install --cask docker
```
