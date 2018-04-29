# Todo
- [ ] create `fresh.log`
- [ ] work out whats not working in high sierra and fix
- [ ] manage atom packages with star method mike mentioned
  base16-eighties-one-dark
- Install https://github.com/siong1987/shortcuts

# Testing
- What happens if mackup backup hasn't been run?

## Known issues
1. **IMPORTANT:** At this time, `undo` will NOT rollback the following settings:  
  - OS X Energy Saver settings
    - Previous settings are saved as raw output in `ansible/vars/system.backup.yml`
  - All application config in `ansible/roles/config`, including Atom, iTerm, Google Chrome, etc...
    - You can avoid this for now by running `install` with `--skip config`
1. Cannot modify dock/menubar using the osx_defaults module: https://github.com/ansible/ansible-modules-extras/issues/2610



        #
        # - name: check spctl status
        #   shell: "spctl --status"
        #   register: last_osx_spctl_status
        #   failed_when: false
        #   changed_when: false
        # - name: set OS X Gatekeeper
        #   become: yes
        #   shell: "spctl --master-{{ spctl_status }}"

        #
        # - name: check computer name
        #   shell: "scutil --get {{ item.name }}"
        #   with_items: "{{ computer_names }}"
        #   register: last_osx_computer_names
        #   failed_when: false
        #   changed_when: false
        # - name: set computer name
        #   shell: "sudo scutil --set {{ item.name }} '{{ item.value }}'"
        #   with_items: "{{ computer_names }}"

        # - name: check power settings
        #   shell: "pmset -g custom"
        #   register: last_osx_power_settings
        #   failed_when: false
        #   changed_when: false
        # - name: power settings (all)
        #   shell: "sudo pmset -a {{ item.name }} {{ item.value }}"
        #   with_items: "{{ power_settings_all }}"
        #
        # - name: power settings (battery)
        #   shell: "sudo pmset -b {{ item.name }} {{ item.value }}"
        #   with_items: "{{ power_settings_battery }}"
        #
        # - name: power settings (charger)
        #   shell: "sudo pmset -c {{ item.name }} {{ item.value }}"
        #   with_items: "{{ power_settings_charger }}"





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
