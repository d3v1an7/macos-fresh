# WIP
- Update everything in /config
- Ensure Ansible version minimum is met
- Various race conditions need to be addressed (license files are not available on first run, etc)
- Should detect if running script offline
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
