#!/bin/bash

set -e

dir="${HOME}/.fresh"

heading() {
  # Credit: http://wiki.bash-hackers.org/snipplets/print_horizontal_line
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
}

sudo_keep_alive() {
  # Credit: https://github.com/mathiasbynens/dotfiles/blob/master/.macos
  sudo -v
  while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &
}

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
