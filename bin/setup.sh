#!/bin/bash

set -e

error_exit() {
  heading "${1}"
  echo "${@:2}"
  echo
  exit 1
}

trap "error_exit 'Setup did not complete!' 'Received signal SIGHUP.'" SIGHUP
trap "error_exit 'Setup did not complete!' 'Received signal SIGINT.'" SIGINT
trap "error_exit 'Setup did not complete!' 'Received signal SIGTERM.'" SIGTERM
trap "error_exit 'Setup did not complete!' 'Scroll up for more details about what went wrong.'" ERR

dir="${HOME}/.fresh"

heading() {
  # credit: http://wiki.bash-hackers.org/snipplets/print_horizontal_line
  local start=$'\e(0' end=$'\e(B' line='qqqqqqqqqqqqqqqq'
  local cols="${COLUMNS:-$(tput cols)}"
  while (("${#line}" < cols)); do line+="${line}"; done
  echo
  printf '%s%s%s\n' "${start}" "${line:0:cols}" "${end}"
  echo "  ${1}"
  printf '%s%s%s\n' "${start}" "${line:0:cols}" "${end}"
  echo
}

finish() {
  echo
  echo "Done!"
  echo
  sleep 1
}

install_cli_tools() {
  if ! type_exists "gcc"; then
    ## Credit: https://github.com/boxen/boxen-web/blob/master/app/views/splash/script.sh.erb#L42-L63
    heading "Installing CLI tools for macOS"
    placeholder="/tmp/.com.apple.dt.CommandLineTools.installondemand.in-progress"
    touch "${placeholder}"
    prod=$(softwareupdate -l | \
      grep -B 1 "Command Line Tools" | \
      awk -F"*" '/^ +\*/ {print $2}' | \
      sed 's/^ *//' | \
      head -n 1)
    softwareupdate -i "${prod}"
    [[ -f "${placeholder}" ]] && rm "${placeholder}"
  fi
}

install_homebrew() {
  if ! type_exists "brew"; then
    heading "Installing homebrew"
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  fi
}

install_git() {
  if ! type_exists "git"; then
    heading "Installing git"
    brew install git
  fi
}

install_yq() {
  if ! type_exists "yq"; then
    heading "Installing yq"
    pip install yq
  fi
}

install_fresh() {
  if [ ! -d "${dir}/.git" ]; then
    heading "Cloning fresh"
    git clone --quiet https://github.com/d3v1an7/fresh.git "${dir}"
  fi
}

type_exists() {
  if [ "$(type -P $1)" ]; then
    return 0
  fi
  return 1
}

install_cli_tools
install_homebrew
install_git
install_yq
install_fresh

heading "Setup complete!"
echo
echo
