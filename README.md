# Fresh
Just a few super opinionated shell scripts that get me up and running after a fresh install of OS X. Projects like [Boxen](https://boxen.github.com/) are amazing, but a bit too heavy for what I'm trying to do.  

Be aware this will overwrite existing dotfiles (.bashrc, .bash_profile, etc), and also make loads of changes to the system with asking for your permission. It has been designed to be run right after a fresh install of OS X &mdash; milage may vary on established machines.

It's really unlikely this will suit your purposes exactly, but you should hopefully find it super easy to follow along and customise to fit your needs. Fork/clone away!

## Dependencies
Homebrew requires Xcode, or at very least the Xcode Command Lines Tools. Thankfully, this is not such a pain in OS X 10.9 &mdash; you'll receive a prompt as part of the install process below.

## Installation
Open 'terminal' and run `bash -c "$(curl -fsSL raw.github.com/d3v1an7/fresh/master/bin/fresh)"`

You'll be prompted for a few details before everything kicks off.  
If the script ends early, you can safely start over with `bash ~/.fresh/bin/fresh`

Optional:
- Update the default variables and packages in `~/.fresh/conf/variables`
- Run `cp ~/.fresh/conf/secret.example ~/.fresh/conf/secret` and populate with your licences

## Manual steps (for now)
- Finder > Preferences > Sidebar > Favourites
  - Uncheck: All My Files, Documents, Downloads, Movies, Music, Pictures
  - Order: Desktop, User home, Applications, AirDrop
- iTerm > Preferences > Profiles > Color
  - Load presets: base16-ocean.dark.256
- Install apps listed as 'Manual Install' in `conf/variables`
- Install Microsoft Office
- Install apps I stupidly bought from the App Store

## Contributing
If you have any questions or suggestions, please either submit a pull request, create an issue ticket, or catch me on [Twitter](https://twitter.com/d3v1an7).

## Acknowledgements
Hat tip to the many who have tread this ground before:
- ptb [osx-setup](https://github.com/ptb/Mac-OS-X-Lion-Setup)
- mathiasbynens [dotfiles](https://github.com/mathiasbynens/dotfiles)
- necolas [dotfiles](https://github.com/necolas/dotfiles)
- rafeca [dotfiles](https://github.com/rafeca/dotfiles)
- pongstr [dotfiles](https://github.com/pongstr/dotfiles)
- paularmstrong [dotfiles](https://github.com/paularmstrong/dotfiles)

And these are the bees knees:
- [homebrew](https://github.com/Homebrew/homebrew)
- [homebrew-cask](https://github.com/caskroom/homebrew-cask)
- [spacegray](https://github.com/kkga/spacegray)
- [base16](https://github.com/chriskempson/base16)
