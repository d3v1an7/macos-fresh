# WIP
- Update bash commands based on readme
- Add rollback config file
  - Created on first run
  - For defaults, this_thing: did_not_exist
- Ensure Ansible version minimum is met
- Ansible organisation leaves a lot to be desired
  - Variables and tags not consistent
  - No link between applications and their configuration (if you remove iTerm from the homebrew cask array, the playbook will still try to configure it)
- Various race conditions need to be addressed (licence files are not available on first run, etc)
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
