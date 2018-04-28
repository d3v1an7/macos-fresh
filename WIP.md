# Todo
- [ ] create `fresh.log`
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











fresh
remote shell script will
  DOWNLOAD files to .fresh
  run brew bundle
    ... wait until dropbox configured
  Mackup
  make backup of system config (json)
  make changes to system config (json)
    -- need to find/write app that will read from json

If you want to re-run this script for whatever reason, you should be able to run locally via ``~/.fresh/bin/fresh`

Use existing stuff that works (brewfiles, mackup) and then work around my own personal anxieties around system level changes.
See this repo, JUST RUN THIS MASSIVE FILE.
What if it's bad. What if I don't like what happens? What if I just want to go back?
You could dig in

fresh

We'll use the excellent Mackup to handle my .dotfiles, app config & licences, but only backup apps defined here.
I tend to install a bunch of stuff 'for fun', which I don't necessarly want to store config for, so it's good to be specific



vi ~/.mackup.cfg

[configuration_files]
# anything extra here (fresh itself???)

[storage]
engine = dropbox

[applications_to_sync]
ssh
adium


Want to create your own Brewfile? Run `brew bundle dump`


1. homebrew: Apps (brewfile)
brew bundle install

2. mackup: Settings, licences ()
mackup restore

3. Ansible madness (install random stuff, computer settings)

https://github.com/siong1987/shortcuts










- Update ~/.gitconfig
- Move following manual steps to print at end of playbook

`System Preferences > Displays > Display`
- Resolution
  - Select `Scaled`
  - Change scale to `More Space`
    - Have tried `brew/screenresolution` and `brew/cask/cscreen`.
    - Both seem to change the resolution for the current session only, and do not scale the screen properly (text and edges are blurry)

`Finder > Preferences > Sidebar`
- Uncheck all, except the following
  - Favorites: iCloud Drive, AirDrop, Desktop, Home
  - Shared: Connected servers
  - Devices: Hard disks, External disks, CDs

`[New Finder window]`
- Add `~/Applications`
- Set order of sidebar
  - Desktop
  - Home
  - ~/Applications
  - AirDrop

- Create example backup files from clean run on 10.11
- Write configs for
  - PIA
  - awscli
  - keybase
  - git
  - adobe-creative-cloud
  - alfred
  - beamer
  - cloud
  - dropbox
  - sketch
  - slack





  ---
  - name: check if iterm settings exists
    stat:
      path: "{{ home }}/Library/Preferences/com.googlecode.iTerm2.plist"
    register: iterm_settings

  - name: check if style.json exists
    stat:
      path: "{{ home }}/Library/Application Support/iTerm2/DynamicProfiles/style.json"
    register: iterm_style

  - name: open iterm to init preference files
    shell: open -a iTerm && sleep 2 && killall iTerm2
    when: iterm_settings.stat.exists == false

  - name: copy style.json to dynamic profile folder
    copy:
      src: style.json
      dest: "{{ home }}/Library/Application Support/iTerm2/DynamicProfiles/style.json"
    when: iterm_style.stat.exists == false

  - name: write iterm defaults
    osx_defaults:
      domain: com.googlecode.iterm2
      key: "{{ item.key }}"
      type: "{{ item.type }}"
      value: "{{ item.value }}"
    with_items:
      # Don’t display the annoying prompt when quitting iTerm
      - { key: "PromptOnQuit", type: "bool", value: "false" }
      # Don’t display the annoying update prompt
      - { key: "SUEnableAutomaticChecks", type: "bool", value: "false" }
      # Set default profile (GUID found in iterm/files/style.json)
      - { key: "Default Bookmark Guid", type: "string", value: "ba19744f-6af3-434d-aaa6-0a48e0969958" }

  # - name: install shell integration
  #   shell: curl -L https://iterm2.com/misc/install_shell_integration.sh | bash





  ---
  - name: check if font exists
    stat:
      path: "{{ home }}/Library/Fonts/SourceCodePro-Regular.otf"
    register: font

  # Using `get_url` and `shell` unzip for now, as there seems to be issues with `unarchive` on 2.1.1.0
  # "Unexpected error when accessing exploded file: [Errno 2] No such file or directory: '/tmp/source-code-pro-release/'"
  - name: download font
    get_url:
      url: https://github.com/adobe-fonts/source-code-pro/archive/release.zip
      dest: /tmp/source-code-pro-release.zip
    when: font.stat.exists == false

  - name: unzip font
    shell: unzip -o /tmp/source-code-pro-release.zip -d /tmp
    args:
      creates: /tmp/source-code-pro-release
    when: font.stat.exists == false

  - name: copy fonts to library
    synchronize:
      src: /tmp/source-code-pro-release/OTF/
      dest: "{{ home }}/Library/Fonts"
    when: font.stat.exists == false




  ---
  - name: set google chrome as default browser
    shell: "open --new -a 'Google Chrome' --args --make-default-browser"

  - name: write google chrome defaults
    osx_defaults:
      domain: com.google.Chrome
      key: "{{ item.key }}"
      type: "{{ item.type }}"
      value: "{{ item.value }}"
    with_items:
      # Disable the all too sensitive backswipe on trackpads and Magic Mouse
      - { key: "AppleEnableSwipeNavigateWithScrolls", type: "bool", value: "false" } # Default: key absent
      - { key: "AppleEnableMouseSwipeNavigateWithScrolls", type: "bool", value: "false" } # Default: key absent




  ---
  - name: check if atom theme exists
    stat:
      path: "{{ home }}/.atom/packages/base16-eighties-one-dark"
    register: atom_theme

  # Using `get_url` and `shell` unzip for now, as there seems to be issues with `unarchive` on 2.1.1.0
  - name: download atom theme
    get_url:
      url: https://github.com/robneu/base16-eighties-one-dark/archive/master.zip
      dest: /tmp/base16-eighties-one-dark-master.zip
    when: atom_theme.stat.exists == false

  - name: unzip atom theme
    shell: unzip -o /tmp/base16-eighties-one-dark-master.zip -d /tmp
    args:
      creates: /tmp/base16-eighties-one-dark-master
    when: atom_theme.stat.exists == false

  - name: ensure atom preference dir exists
    file:
      path: "{{ home }}/.atom/packages/"
      recurse: yes
      state: directory

  - name: copy theme to atom
    become: yes
    synchronize:
      src: /tmp/base16-eighties-one-dark-master/
      dest: "{{ home }}/.atom/packages/base16-eighties-one-dark/"
    when: atom_theme.stat.exists == false

  - name: overwite atom config
    copy:
      content: |
        "*":
          welcome:
            showOnStartup: false
          editor:
            invisibles: {}
            fontFamily: "Source Code Pro"
            fontSize: 13
            showInvisibles: true
            showIndentGuide: true
            tabType: "soft"
          core:
            themes: [
              "one-dark-ui"
              "base16-eighties-one-dark"
            ]
      dest: "~/.atom/config.cson"



      ---
      - name: include licence
        include_vars: "{{ playbook_dir }}/roles/config/install/tasks/istatmenus/vars/licence.yml"
        when: vault_pass.stat.exists

      - name: write istat licence
        osx_defaults:
          domain: com.bjango.istatmenus
          key: "{{ item.key }}"
          type: "{{ item.type }}"
          value: "{{ item.value }}"
        with_items:
          - { key: "license5", type: "string", value: "{{ licence_istat | default }}" }
        when: vault_pass.stat.exists

      - name: write istat defaults
        osx_defaults:
          domain: com.bjango.istatmenus5.extras
          key: "{{ item.key }}"
          type: "{{ item.type }}"
          value: "{{ item.value }}"
        with_items:
          # Disable diagnostics
          - { key: "Diagnostics_Enabled", type: "int", value: "0" } # Default: key absent
          # CPU bar graph
          - { key: "CPU_MenubarMode", type: "string", value: "1" } # Default: key absent
          # Memory pie graph
          - { key: "Memory_MenubarMode", type: "string", value: "6" } # Default: key absent
          # Network no decimals
          - { key: "Network_DecimalLevel", type: "int", value: "0" } # Default: key absent
          # Sensors display
          - { key: "Sensors_MenubarMode", type: "string", value: "0" } # Default: key absent
          # Array interaction is currently broken :(
          # See: https://github.com/ansible/ansible-modules-extras/issues/2610
          # Time / Date format
          - { key: "Time_MenubarFormat", type: "array", value: "[ 'EE', '\" \"', 'hh', '\":\"', 'mm', '\" \"', 'a' ]" } # Default: key absent
          # Time / Date hide moon
          - { key: "Time_DropdownShowMoon", type: "int", value: "0" } # Default: key absent
          # Array interaction is currently broken :(
          # See: https://github.com/ansible/ansible-modules-extras/issues/2610
          # Time / Date cities
          - { key: "Time_Cities", type: "array", value: "[ '5128581.0000000000000000', '1566083.0000000000000000' ]" } # Default: key absent
          # Opacity
          - { key: "MenubarGraphOpacity-DarkMode", type: "float", value: "0.4418902099132540" } # Default: key absent
          # Skin colour white
          - { key: "MenubarSkinColor", type: "int", value: "8" } # Default: key absent
          # Set order
          - { key: "StatusItems-Order", type: "array", value: "[ '4', '2', '1', '5', '-1', '7' ]" } # Default: key absent [ '1', '2', '3', '4', '5', '6' ]

      # Can't do this on fresh installs, StatusItems-Order doesn't exist yet. #!# fix later
      # - name: write istat defaults (plistbuddy)
      #   shell: /usr/libexec/PlistBuddy -c "{{ item }}" "{{ home }}/Library/Preferences/com.bjango.istatmenus5.extras.plist"
      #   with_items:
      #     # Set order
      #     # Can't do this with osx_defaults module above, as the array is populated with strings, not integers, which crashes istat -- badly
      #     - "Delete StatusItems-Order"
      #     - "Add StatusItems-Order array"
      #     - "Add StatusItems-Order:0 integer 4"
      #     - "Add StatusItems-Order:1 integer 2"
      #     - "Add StatusItems-Order:2 integer 1"
      #     - "Add StatusItems-Order:3 integer -1"
      #     - "Add StatusItems-Order:4 integer 5"
      #     - "Add StatusItems-Order:5 integer 7"


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








style.json
{
  "Profiles": [
    {
      "Name" : "Base 16 Eighties Dark",
      "Guid" : "ba19744f-6af3-434d-aaa6-0a48e0969958",
      "Normal Font" : "SourceCodePro-Regular 13",
      "Unlimited Scrollback" : true,
      "Ansi 0 Color" : {
        "Red Component" : 0.1764705882352941,
        "Color Space" : "sRGB",
        "Blue Component" : 0.1764705882352941,
        "Green Component" : 0.1764705882352941
      },
      "Ansi 1 Color" : {
        "Red Component" : 0.9490196078431372,
        "Color Space" : "sRGB",
        "Blue Component" : 0.4784313725490196,
        "Green Component" : 0.4666666666666667
      },
      "Ansi 2 Color" : {
        "Red Component" : 0.6,
        "Color Space" : "sRGB",
        "Blue Component" : 0.6,
        "Green Component" : 0.8
      },
      "Ansi 3 Color" : {
        "Red Component" : 1,
        "Color Space" : "sRGB",
        "Blue Component" : 0.4,
        "Green Component" : 0.8
      },
      "Ansi 4 Color" : {
        "Red Component" : 0.4,
        "Color Space" : "sRGB",
        "Blue Component" : 0.8,
        "Green Component" : 0.6
      },
      "Ansi 5 Color" : {
        "Red Component" : 0.8,
        "Color Space" : "sRGB",
        "Blue Component" : 0.8,
        "Green Component" : 0.6
      },
      "Ansi 6 Color" : {
        "Red Component" : 0.4,
        "Color Space" : "sRGB",
        "Blue Component" : 0.8,
        "Green Component" : 0.8
      },
      "Ansi 7 Color" : {
        "Red Component" : 0.8274509803921568,
        "Color Space" : "sRGB",
        "Blue Component" : 0.7843137254901961,
        "Green Component" : 0.8156862745098039
      },
      "Ansi 8 Color" : {
        "Red Component" : 0.4549019607843137,
        "Color Space" : "sRGB",
        "Blue Component" : 0.4117647058823529,
        "Green Component" : 0.4509803921568628
      },
      "Ansi 9 Color" : {
        "Red Component" : 0.9490196078431372,
        "Color Space" : "sRGB",
        "Blue Component" : 0.4784313725490196,
        "Green Component" : 0.4666666666666667
      },
      "Ansi 10 Color" : {
        "Red Component" : 0.6,
        "Color Space" : "sRGB",
        "Blue Component" : 0.6,
        "Green Component" : 0.8
      },
      "Ansi 11 Color" : {
        "Red Component" : 1,
        "Color Space" : "sRGB",
        "Blue Component" : 0.4,
        "Green Component" : 0.8
      },
      "Ansi 12 Color" : {
        "Red Component" : 0.4,
        "Color Space" : "sRGB",
        "Blue Component" : 0.8,
        "Green Component" : 0.6
      },
      "Ansi 13 Color" : {
        "Red Component" : 0.8,
        "Color Space" : "sRGB",
        "Blue Component" : 0.8,
        "Green Component" : 0.6
      },
      "Ansi 14 Color" : {
        "Red Component" : 0.4,
        "Color Space" : "sRGB",
        "Blue Component" : 0.8,
        "Green Component" : 0.8
      },
      "Ansi 15 Color" : {
        "Red Component" : 0.9490196078431372,
        "Color Space" : "sRGB",
        "Blue Component" : 0.9254901960784314,
        "Green Component" : 0.9411764705882353
      },
      "Foreground Color" : {
        "Red Component" : 0.8274509803921568,
        "Color Space" : "sRGB",
        "Blue Component" : 0.7843137254901961,
        "Green Component" : 0.8156862745098039
      },
      "Background Color" : {
        "Red Component" : 0.1764705882352941,
        "Color Space" : "sRGB",
        "Blue Component" : 0.1764705882352941,
        "Green Component" : 0.1764705882352941
      },
      "Bold Color" : {
        "Red Component" : 0.8274509803921568,
        "Color Space" : "sRGB",
        "Blue Component" : 0.7843137254901961,
        "Green Component" : 0.8156862745098039
      },
      "Selection Color" : {
        "Red Component" : 0.3176470588235294,
        "Color Space" : "sRGB",
        "Blue Component" : 0.3176470588235294,
        "Green Component" : 0.3176470588235294
      },
      "Selected Text Color" : {
        "Red Component" : 0.8274509803921568,
        "Color Space" : "sRGB",
        "Blue Component" : 0.7843137254901961,
        "Green Component" : 0.8156862745098039
      },
      "Cursor Color" : {
        "Red Component" : 0.8274509803921568,
        "Color Space" : "sRGB",
        "Blue Component" : 0.7843137254901961,
        "Green Component" : 0.8156862745098039
      },
      "Cursor Text Color" : {
        "Red Component" : 0.1764705882352941,
        "Color Space" : "sRGB",
        "Blue Component" : 0.1764705882352941,
        "Green Component" : 0.1764705882352941
      }
    }
  ]
}
