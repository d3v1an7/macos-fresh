#!/bin/bash

source_utils() {
  util_source="${HOME}/.fresh/bin/utils"
  if [ ! -f "${util_source}" ]; then
    source /dev/stdin <<< "$(curl --insecure --location --silent https://github.com/d3v1an7/macos-fresh/raw/master/bin/utils)"
  else
    source "${util_source}"
  fi
}

install_cli_tools() {
  thing="CLI tools for macOS"
  if ! type_exists "gcc"; then
    # Credit: https://github.com/boxen/boxen-web/blob/master/app/views/splash/script.sh.erb#L42-L63
    utils_print_heading "Installing ${thing}"
    placeholder="/tmp/.com.apple.dt.CommandLineTools.installondemand.in-progress"
    touch "${placeholder}"
    prod=$(softwareupdate -l | \
      grep -B 1 "Command Line Tools" | \
      awk -F"*" '/^ +\*/ {print $2}' | \
      sed 's/^ *//' | \
      head -n 1)
    softwareupdate -i "${prod}"
    [[ -f "${placeholder}" ]] && rm "${placeholder}"
    echo
    utils_print_status "pass" "${thing} installed"
  else
    utils_print_status "pass" "${thing} already installed"
  fi
}

install_homebrew() {
  thing="Homebrew"
  if ! type_exists "brew"; then
    utils_print_heading "Installing ${thing}"
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    echo 'export PATH="/usr/local/sbin:$PATH"' >> "${HOME}/.bash_profile"
    source "${HOME}/.bash_profile"
    echo
    utils_print_status "pass" "${thing} installed"
  else
    utils_print_status "pass" "${thing} already installed"
  fi
}

install_git() {
  thing="git"
  if ! type_exists "git"; then
    utils_print_heading "Installing ${thing}"
    brew install git
    echo
    utils_print_status "pass" "${thing} installed"
  else
    utils_print_status "pass" "${thing} already installed"
  fi
}

install_pip() {
  thing="pip"
  if ! type_exists "pip"; then
    utils_print_heading "Installing ${thing}"
    # Pip comes with Homebrew Python
    brew install python@2
    # Find and add pybin to PATH
    pip install pybin
    pybin put
    source "${HOME}/.bash_profile"
    echo
    utils_print_status "pass" "${thing} installed"
  else
    utils_print_status "pass" "${thing} already installed"
  fi
}

install_yq() {
  thing="yq"
  if ! type_exists "yq"; then
    utils_print_heading "Installing ${thing}"
    pip install yq
    echo
    utils_print_status "pass" "${thing} installed"
  else
    utils_print_status "pass" "${thing} already installed"
  fi
}

install_fresh() {
  thing="macos-fresh"
  if [ ! -d "${dir}/.git" ]; then
    utils_print_heading "Installing ${thing}"
    git clone --quiet https://github.com/d3v1an7/fresh.git "${dir}"
    echo
    utils_print_status "pass" "${thing} installed"
  else
    utils_print_status "pass" "${thing} already installed"
  fi
}

type_exists() {
  if [ "$(type -P $1)" ]; then
    return 0
  fi
  return 1
}

source_utils
utils_sudo_keep_alive
install_cli_tools
install_homebrew
install_git
install_pip
install_yq
install_fresh
utils_print_heading "Setup complete!"
