import argparse
import requests
import yaml


class Config:
    def __init__(self):
        config_url = self.parse_config_url()
        self.validated_config = self.download_config(config_url)

    def parse_config_url(self):
        parser = argparse.ArgumentParser()
        parser.add_argument(
            "--config-url", required=True, help="The URL of the raw gist config file"
        )
        args = parser.parse_args()
        return args.config_url

    def download_config(self, config_url):
        response = requests.get(config_url)
        response.raise_for_status()
        return yaml.safe_load(response.text)
