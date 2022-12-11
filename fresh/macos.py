import os
import re
import plistlib
import subprocess
import shlex
from termcolor import colored
from fresh.privileges import Privileged


class MacOS:
    @classmethod
    def update_plist(cls, config, spinner, setting, hardware_uuid):
        def return_action_and_values(key, old_value, new_value, action):
            old_value_str = str(old_value) if old_value is not None else "None"
            new_value_str = str(new_value)
            return f"{action} value for {key}: {old_value_str} {colored('->', 'grey')} {new_value_str}"

        plist_path = os.path.expanduser(setting["path"])
        plist_path = plist_path.replace("UUID", hardware_uuid)
        values = setting["values"]
        if os.path.exists(plist_path):
            action = f"Updating: {plist_path}"
            with open(plist_path, "rb") as f:
                plist = plistlib.load(f)
        else:
            action = f"Creating: {plist_path}"
            plist = {}
        spinner.start(action)
        results = []
        for key, value in values.items():
            if key in plist:
                if plist[key] != value:
                    plist[key] = value
                    results.append(
                        return_action_and_values(key, plist[key], value, "Changed")
                    )
                else:
                    results.append(
                        return_action_and_values(key, plist[key], value, "Skipped")
                    )
            else:
                plist[key] = value
                results.append(return_action_and_values(key, None, value, "Added"))
        with open(plist_path, "wb") as f:
            plistlib.dump(plist, f)
        spinner.succeed()
        for result in results:
            print(f"  - {result}")

    @classmethod
    def get_hardware_uuid(cls):
        hardware_uuid = subprocess.check_output(
            ["system_profiler", "SPHardwareDataType"]
        )
        lines = hardware_uuid.decode("utf-8").split("\n")
        for line in lines:
            if "Hardware UUID" in line:
                return line.replace("Hardware UUID:", "").strip()

    @classmethod
    @Privileged.action
    def set_system_name(cls, spinner):
        system_name = input("Enter system name: ")
        bonjour_safe_name = re.sub(r"[^a-zA-Z0-9-]", "", system_name)
        if len(bonjour_safe_name) > 63:
            bonjour_safe_name = bonjour_safe_name[:63]
        spinner.start(bonjour_safe_name)
        result = subprocess.run(["scutil", "--set", "ComputerName", bonjour_safe_name])
        if result.returncode == 0:
            spinner.succeed()
        else:
            spinner.fail()
            print(f"Failed to update system name. Return code: {result.returncode}")

    @classmethod
    @Privileged.action
    def adjust_power_settings(cls, config, spinner, setting_name, setting):
        spinner.start(setting_name)
        values = setting["values"]
        flags = {
            "power_settings_all": "-a",
            "power_settings_battery": "-b",
            "power_settings_charger": "-c",
        }
        flag = flags[setting_name]
        results = []
        for key, value in values.items():
            subprocess.run(["sudo", "pmset", flag, key, str(value)])
            results.append(f"{setting_name} value for {key}: {value}")
        spinner.succeed()
        for result in results:
            print(f"  - {result}")

    @classmethod
    def update_system_settings(cls, config, spinner, setting, hardware_uuid):
        cls.update_plist(config, spinner, setting, hardware_uuid)

    @classmethod
    def update_app_settings(
        cls, config, spinner, app_name, app_settings, hardware_uuid
    ):
        print(f"Settings for {app_name}")
        for setting in app_settings["settings"]:
            cls.update_plist(config, spinner, setting, hardware_uuid)
        if app_name == "brave":
            if app_settings["set_as_default"]:
                spinner.start("Setting Brave as the default browser")
                command = "open --new -a 'Brave Browser' --args --make-default-browser"
                subprocess.Popen(shlex.split(command))
                spinner.succeed()
