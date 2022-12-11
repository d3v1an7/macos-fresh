#!/usr/bin/env python3
import os
from termcolor import colored
from fresh.spinner import Spinner
from fresh.config import Config
from fresh.installer import Installer
from fresh.macos import MacOS
from fresh.font import Font


class Fresh:
    def __init__(self):
        self._config = Config().validated_config
        self._spinner = Spinner()

    def main_install_brew(self):
        config = self._config
        spinner = self._spinner
        brew = config.get("brew")
        if brew:
            brew_formulae = brew.get("brew")
            if brew_formulae:
                print(return_border("Installing via brew"))
                for app in brew_formulae:
                    Installer.install_app(spinner, app, installer="brew")
            brew_casks = brew.get("cask")
            if brew_casks:
                print(return_border("Installing via brew cask"))
                for app in brew_casks:
                    Installer.install_app(spinner, app, installer="cask")

    def main_install_mas(self):
        config = self._config
        spinner = self._spinner
        mas = config.get("mas")
        if mas:
            print(return_border("Installing via mas"))
            for app in mas:
                Installer.install_app(spinner, app, installer="mas")

    def main_set_system_name(self):
        spinner = self._spinner
        print(return_border("Setting system name"))
        print(
            "Your sudo password/fingerprint will be required to adjust the system name."
        )
        MacOS.set_system_name(spinner)

    def main_adjust_power_settings(self):
        config = self._config
        spinner = self._spinner
        power = config.get("power")
        if power:
            print(return_border("Adjusting power settings"))
            print(
                "Your sudo password/fingerprint will be required to adjust the power settings."
            )
            for setting_name, setting in power.items():
                MacOS.adjust_power_settings(config, spinner, setting_name, setting)

    def main_update_system_settings(self):
        config = self._config
        spinner = self._spinner
        hardware_uuid = MacOS.get_hardware_uuid()
        settings = config.get("settings")
        if settings:
            print(return_border("Updating system defaults"))
            for setting in settings:
                MacOS.update_system_settings(config, spinner, setting, hardware_uuid)

    def main_update_app_settings(self):
        config = self._config
        spinner = self._spinner
        hardware_uuid = MacOS.get_hardware_uuid()
        apps = config["apps"]
        if apps:
            print(return_border("Updating app settings"))
            for app_name, app_settings in apps.items():
                MacOS.update_app_settings(
                    config, spinner, app_name, app_settings, hardware_uuid
                )

    def main_install_fonts(self):
        config = self._config
        spinner = self._spinner
        fonts = config["fonts"]
        if fonts:
            print(return_border("Installing fonts"))
            for font in fonts:
                Font.install_font(spinner, font)

    def main_clear_preference_cache(self):
        spinner = self._spinner
        print(return_border("Clearing preference cache"))
        process_array = ["Finder", "Dock", "SystemUIServer", "cfprefsd"]
        for process in process_array:
            spinner.start(process)
            os.system(f"killall {process}")
            spinner.succeed()


def return_border(title):
    terminal_width = os.get_terminal_size().columns
    border = "=" * terminal_width
    return f"\n{colored(border, 'grey')}\n{title}\n{colored(border, 'grey')}"


def init():
    fresh = Fresh()
    fresh.main_install_brew()
    fresh.main_install_mas()
    fresh.main_set_system_name()
    fresh.main_adjust_power_settings()
    fresh.main_update_system_settings()
    fresh.main_update_app_settings()
    fresh.main_install_fonts()
    fresh.main_clear_preference_cache()
    print(return_border("All done!"))
    print("Note that some of these changes require a restart to take effect.\n\n")


if __name__ == "__main__":
    init()
