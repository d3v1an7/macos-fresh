import shlex
import subprocess


class Installer:
    @classmethod
    def install_app(cls, spinner, app, installer):
        app_name = app
        if installer == "brew":
            install_command = f"brew install {app}"
        elif installer == "cask":
            install_command = f"brew install --cask {app}"
        elif installer == "mas":
            install_command = f"mas install {app['id']}"
            app_name = app["name"]
        else:
            raise ValueError("Invalid installer")
        spinner.start(app_name)
        args = shlex.split(install_command)
        try:
            proc = subprocess.Popen(
                args, stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )
        except OSError as e:
            spinner.fail()
            print(f"Error running command: {install_command}")
            print(e)
        _, stderr = proc.communicate()
        if proc.returncode == 0:
            spinner.succeed()
        else:
            spinner.fail()
            print(stderr.decode())
