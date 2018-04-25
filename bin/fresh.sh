#!/bin/bash

download() {
  echo "steal from existing"
}

sys_check(){
  echo "steal from existing"
}

create_brewfile() {
  jq -r \
    '.brew | to_entries[] |
    if .key == "mas" then
      (.value[]) as $item | "\(.key) \"\($item.name)\", id: \($item.id)"
    else
      "\(.key) \"\(.value[])\""
    end' ~/.fresh/config.json \
  > ~/.fresh/Brewfile
}

create_mackupcfg() {
  echo "mackup config"
}

create_sysbackup() {
  echo "make backup of system config"
}



brew_bundle_install() {
  brew bundle install --file=~/.fresh/Brewfile
}


#    ... wait until dropbox configured

mackup_restore() {
  mackup restore
}

run_sysconfig() {
  echo "make changes to system config"
}


create_brewfile
create_mackupcfg
create_sysbackup
brew_bundle_install







# ## Credit: http://www.commandlinefu.com/commands/view/13592/get-hardware-uuid-in-mac-os-x
# # need it for screensaver
# UUID="$(system_profiler SPHardwareDataType | awk '/UUID/ { print $3; }')"
#
# if [ -z "${UUID}" ]; then
#   echo -e "{\"failed\": true, \"msg\": \"Could not detect the hardware UUID!\"}"
#   exit 0
# fi
#
# USER_NAME="${USER}"
#
# ## Credit: http://stackoverflow.com/a/11704652
# USER_NAME_FULL=$(osascript -e "long user name of (system info)")
#
# ## Credit: http://stackoverflow.com/a/19878198
# USER_EMAIL=$(dscl . -read /Users/$(whoami) | grep '<string>.*@' | sed -e 's/<[^>]*>//g' | xargs)
#
# if [ -z "${USER_NAME}" ]; then
#   USER_NAME="null"
# fi
#
# if [ -z "${USER_NAME_FULL}" ]; then
#   USER_NAME_FULL="null"
# fi
#
# if [ -z "${USER_EMAIL}" ]; then
#   USER_EMAIL="null"
# fi
#
# ## Ansible doesn't like new lines in the json, so make sure to strip those out with tr
# cat | tr '\n' ' ' << EOF
# {
#   "changed": "true",
#   "ansible_facts": {
#     "user_name": "${USER_NAME}",
#     "user_name_full": "${USER_NAME_FULL}",
#     "user_email": "${USER_EMAIL}"
#   }
# }
# EOF
#
#
#
#
# # say done
# - name: see you space cowboy
#   osx_say:
#     msg: "See you, Space Cowboy"
#     voice: "Fred"
#
#
#
#
# # restart services
# - name: restart services
#   command: "killall {{ item }}"
#   with_items:
#     - Finder
#     - Dock
#     - SystemUIServer
#     - cfprefsd
