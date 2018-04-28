#!/bin/bash

set -e

dir="${HOME}/.fresh"
config="${HOME}/.fresh/config.yaml"
symbol_pass="✓"
symbol_info="*"
symbol_warn="!"
symbol_error="x"
colour_pass=$(tput setaf 2)
colour_info=$(tput setaf 4)
colour_warn=$(tput setaf 3)
colour_error=$(tput setaf 1)
colour_reset=$(tput sgr0)

utils_print_heading() {
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

utils_print_status() {
  symbol="symbol_${1}"
  colour="colour_${1}"
  message="${2}"
  echo -e "${!colour}${!symbol}${colour_reset} ${message}"
}

utils_sudo_keep_alive() {
  utils_print_heading "Sudo check"
  # Credit: https://github.com/mathiasbynens/dotfiles/blob/master/.macos
  sudo -v
  while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &
  utils_print_status "pass" "Passed"
}

utils_error_exit() {
  utils_print_heading "${1}"
  echo "${@:2}"
  echo
  exit 1
}

trap "utils_error_exit 'Setup did not complete!' 'Received signal SIGHUP.'" SIGHUP
trap "utils_error_exit 'Setup did not complete!' 'Received signal SIGINT.'" SIGINT
trap "utils_error_exit 'Setup did not complete!' 'Received signal SIGTERM.'" SIGTERM
trap "utils_error_exit 'Setup did not complete!' 'Scroll up for more details about what went wrong.'" ERR
