#!/bin/bash

source_utils() {
  util_source="${HOME}/.fresh/bin/utils.sh"
  if [ ! -f "${util_source}" ]; then
    source /dev/stdin <<< "$(curl --insecure --location --silent https://github.com/d3v1an7/macos-fresh/raw/pivot/bin/utils.sh)"
  else
    source "${util_source}"
  fi
}

create_brewfile() {
  ~/Library/Python/2.7/bin/yq -r \
    '.brew | to_entries[] |
    if .key == "mas" then
      (.value[]) as $item | "\(.key) \"\($item.name)\", id: \($item.id)"
    else
      "\(.key) \"\(.value[])\""
    end' ~/.fresh/config.yaml \
  > ~/.fresh/Brewfile
}

create_mackupcfg() {
  ~/Library/Python/2.7/bin/yq -r \
    '.mackup | to_entries[] |
    if .key == "storage" then
      (.value | to_entries[]) as $item | "[\(.key)]","\($item.key)=\($item.value)"
    else
      "[\(.key)]","\(.value[])"
    end' ~/.fresh/config.yaml \
  > ~/.mackup.cfg
}

run_brew_bundle_install() {
  brew bundle install --file=~/.fresh/Brewfile
}

run_mackup_restore() {
  #    ... wait until dropbox configured?
  mackup restore
}

update_defaults() {
  defaults=$(~/Library/Python/2.7/bin/yq -r '.system.defaults | to_entries[]' ~/.fresh/config.yaml)
  echo $defaults | jq -r '(.value[]) as $item | "\(.key) \"\($item.key)\" \($item.type) \($item.value)"' | while read item; do
    bork do ok defaults "${item}"
    echo
  done
}

# update_defaults_global() {
#   defaults=$(yq -r '.system.defaults_global | to_entries[]' ~/.fresh/config.yaml)
#   echo $defaults | jq -r '(.value[]) as $item | "\(.key) \"\($item.key)\" \($item.type) \($item.value)"' | while read item; do
#     # sudo???
#     bork do ok defaults "${item}"
#     echo
#   done
# }

update_defaults_plistbuddy() {
  # Check
  defaults=$(yq -r '.system.defaults_plistbuddy | to_entries[]' ~/.fresh/config.yaml)
  echo $defaults | jq -r '(.value[]) as $item | "\"Print :\($item.key)\" \(.key)"' | while read item; do
    echo "${item}"
    echo "/usr/libexec/PlistBuddy -c ${item}" | sh
    echo
  done

  # Delete
  defaults=$(yq -r '.system.defaults_plistbuddy | to_entries[]' ~/.fresh/config.yaml)
  echo $defaults | jq -r '(.value[]) as $item | "\"Delete :\($item.key)\" \(.key)"' | while read item; do
    echo "${item}"
    echo "/usr/libexec/PlistBuddy -c ${item}" | sh
    echo
  done

  # Add
  defaults=$(yq -r '.system.defaults_plistbuddy | to_entries[]' ~/.fresh/config.yaml)
  echo $defaults | jq -r '(.value[]) as $item | "\"Add :\($item.key) \($item.type) \($item.value)\" \(.key)"' | while read item; do
    echo "${item}"
    echo "/usr/libexec/PlistBuddy -c ${item}" | sh
    echo
  done
}

source_utils
# utils_sudo_keep_alive
# create_brewfile
# create_mackupcfg
# run_brew_bundle_install
# run_mackup_restore
# update_defaults
# update_defaults_global
# update_defaults_plistbuddy
