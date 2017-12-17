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

heading() {
  # credit: http://wiki.bash-hackers.org/snipplets/print_horizontal_line
  local start=$'\e(0' end=$'\e(B' line='qqqqqqqqqqqqqqqq'
  local cols="${COLUMNS:-$(tput cols)}"
  while (("${#line}" < cols)); do line+="${line}"; done
  clear
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



// this sucks a bit. should find a 'at least this version' option instead


heading "Step 1 of 7: Install local dependencies"
# Version and Cask URL from: https://github.com/caskroom/homebrew-cask/blob/master/Casks/docker.rb
docker_version="17.09.0-ce"
docker_cask="https://raw.githubusercontent.com/caskroom/homebrew-cask/3e090d13c2a40dd4aa887fe7f095a9c6addda1cc/Casks/docker.rb"
docker_installed=$(docker version 2>/dev/null) || true
docker_installed_via_cask=$(brew cask list | grep -e "^docker$") || true
docker_correct_version=$(docker version --format '{{.Server.Version}}' 2>/dev/null | grep "${docker_version}") || true
if [[ "${docker_installed}" ]]; then
  if [[ "${docker_installed_via_cask}" ]]; then
    if [[ "${docker_correct_version}" ]]; then
      echo "Supported version of Docker for Mac installed."
    else
      echo "Note: Docker for Mac version will be changed to ${docker_version}."
      echo
      read -n 1 -s -p "Press any key to continue..."
      echo
      brew cask reinstall "${docker_cask}"
      # Quit Docker so it opens as the new version for the next step
      osascript -e 'quit app "Docker"'
    fi
  else
    if [[ "${docker_correct_version}" ]]; then
      echo "Supported version of Docker for Mac installed, but it was not installed via Homebrew."
    else
      error_exit 'Setup did not complete!' 'Docker for Mac was not installed via Homebrew. Please manually uninstall Docker for Mac and try again.'
    fi
  fi
else
  brew cask install "${docker_cask}"
fi
# Other tools required for setup
brew install awscli jq || true
# Apps that can't be installed with homebrew
brew cask install bitbar kitematic || true
finish

heading "Step 2 of 7: Check Docker"
if docker version | grep -q "Server version\|Server:" > /dev/null; then
  echo "Docker ready."
else
  open -a Docker
  echo
  echo "Docker must be fully installed and in a ready state."
  echo
  echo "Open Docker (if it isn't already) and wait until the Docker menubar"
  echo "icon (whale with containers) is no longer animating."
  echo
  read -n 1 -s -p "When Docker is in a ready state, press any key to continue..."
  echo
fi
finish

heading "Step 6 of 7: Set up SSH key"
echo "This allows Ansible to run playbook from container on host without asking for permission."
PUBLIC_KEY="${HOME}/.ssh/macos_fresh.pub"
AUTHORIZED_KEYS="${HOME}/.ssh/authorized_keys"
if [ ! -f "${PUBLIC_KEY}" ]; then
  # Credit: https://gist.github.com/hongkongkiwi/fff178c3243ae5aaff8e
  ssh-keygen -t rsa -C "$(hostname)" -f "${HOME}/.ssh/macos_fresh" -P ""
fi
# Only add key to authorized_keys if it's not there already
grep -q -F "$(cat ${PUBLIC_KEY})" "${AUTHORIZED_KEYS}" || cat "${PUBLIC_KEY}" >> "${AUTHORIZED_KEYS}"
finish

heading "Step 7 of 7: Enable remote login"
echo "WARNING: Requires sudo."
echo
sudo systemsetup -setremotelogin on
finish

heading "Setup complete!"
echo
echo
