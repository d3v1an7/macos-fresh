import os
import subprocess
import requests
import zipfile


class Font:
    @classmethod
    def install_font(cls, spinner, font):
        font_dir = "/Library/Fonts"
        for font_name, font_url in font.items():
            font_file = os.path.basename(font_url)
            spinner.start(font_name)
            command = "system_profiler SPFontsDataType | grep 'Full Name: ' | awk -F': ' '{print $2}'"
            output = subprocess.run(command, shell=True, stdout=subprocess.PIPE)
            if font_name in output.stdout.decode():
                spinner.succeed()
            else:
                response = requests.get(font_url)
                with open(font_file, "wb") as f:
                    f.write(response.content)
                with zipfile.ZipFile(font_file, "r") as zip_ref:
                    zip_ref.extractall(font_dir)
                os.remove(font_file)
                spinner.succeed()
