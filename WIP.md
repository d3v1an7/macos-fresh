# Todo
- [ ] Move app definitions into config, then create Makefile that will build both brewfile AND mackup config file
- [ ] Should detect if running script offline

# Testing
- What happens if mackup backup hasn't been run?
- What happens if dropbox not setup/logged in?




## Known issues
1. **IMPORTANT:** At this time, `undo` will NOT rollback the following settings:  
  - OS X Energy Saver settings
    - Previous settings are saved as raw output in `ansible/vars/system.backup.yml`
  - All application config in `ansible/roles/config`, including Atom, iTerm, Google Chrome, etc...
    - You can avoid this for now by running `install` with `--skip config`
1. Cannot modify dock/menubar using the osx_defaults module: https://github.com/ansible/ansible-modules-extras/issues/2610






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
