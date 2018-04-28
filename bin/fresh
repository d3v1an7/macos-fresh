#!/bin/bash

source_utils() {
  util_source="${HOME}/.fresh/bin/utils"
  if [ ! -f "${util_source}" ]; then
    source /dev/stdin <<< "$(curl --insecure --location --silent https://github.com/d3v1an7/macos-fresh/raw/master/bin/utils)"
  else
    source "${util_source}"
  fi
}

create_brewfile() {
  thing="${HOME}/.fresh/Brewfile"
  yq -r \
    '.brew | to_entries[] |
    if .key == "mas" then
      (.value[]) as $item | "\(.key) \"\($item.name)\", id: \($item.id)"
    else
      "\(.key) \"\(.value[])\""
    end' "${config}" \
  > "${thing}"
  utils_print_status "pass" "${thing}"
}

create_mackupcfg() {
  thing="${HOME}/.mackup.cfg"
  yq -r \
    '.mackup | to_entries[] |
    if .key == "storage" then
      (.value | to_entries[]) as $item | "[\(.key)]","\($item.key)=\($item.value)"
    else
      "[\(.key)]","\(.value[])"
    end' "${config}" \
  > "${thing}"
  utils_print_status "pass" "${thing}"
}

run_brew_bundle_install() {
  thing="brew bundle install"
  utils_print_heading "Run ${thing}"
  brew bundle install --file=~/.fresh/Brewfile
  echo
  utils_print_status "pass" "${thing}"
}

open_dropbox() {
  thing="Dropbox setup"
  utils_print_heading "Run ${thing}"
  open -a "Dropbox"
  echo "Dropbox will open shortly, please complete the setup and first sync before proceeding."
  echo
  read -n 1 -s -p "When Dropbox has finished sync, press any key to continue..."
  echo
  utils_print_status "pass" "${thing}"
}

run_mackup_restore() {
  thing="brew mackup restore"
  utils_print_heading "Run ${thing}"
  mackup restore
  echo
  utils_print_status "pass" "${thing}"
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

misc_install_font() {
  thing="System font"
  utils_print_heading "Install ${thing}"
  font=$(yq -r '.misc.font' ~/.fresh/config.yaml)
  font_name=$(echo $font | jq -r '.name')
  font_download=$(echo $font | jq -r '.download')
  font_path=$(echo $font | jq -r '.path')
  if [ ! -f "${HOME}/Library/Fonts/${font_name}" ]; then
    curl -o /tmp/font.zip ${font_download}
    unzip -o /tmp/font.zip -d /tmp
    # cp ${font_path} ${ HOME }/Library/Fonts
  fi
  utils_print_status "pass" "${thing} installed"
  #     src: /tmp/source-code-pro-release/OTF/
  #     dest: "{{ home }}/Library/Fonts"
  #   when: font.stat.exists == false

}

source_utils
# utils_sudo_keep_alive
# utils_print_heading "Creating config files"
# create_brewfile
# create_mackupcfg
# run_brew_bundle_install
# open_dropbox
# run_mackup_restore
# update_defaults
# update_defaults_global
# update_defaults_plistbuddy
misc_install_font
utils_print_heading "Fresh complete!"
