import halo


class Spinner:
    def __init__(self):
        self.spinner = halo.Halo(spinner="dots")

    def start(self, text):
        self.spinner.start(text)

    def info(self, text):
        self.spinner.info(text)

    def stop(self):
        self.spinner.stop()

    def succeed(self):
        self.spinner.succeed()

    def fail(self):
        self.spinner.fail()
