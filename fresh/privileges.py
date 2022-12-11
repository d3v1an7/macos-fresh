import functools
import shlex
import subprocess
import typing


class PrivilegeError(Exception):
    def __init__(self, message: str):
        self.message = message


class Privileged:
    count = 0

    @staticmethod
    def action(self):
        @functools.wraps(self)
        def _wrapped(*args, **kwargs):
            exec(self, *args, **kwargs)

        return _wrapped


def exec(f, *args: tuple, **kwargs: dict[str, typing.Any]):
    if Privileged.count == 0:
        if _privileged():
            return f(*args, **kwargs)
        _privilege_grant()
    Privileged.count = Privileged.count + 1
    try:
        return f(*args, **kwargs)
    finally:
        Privileged.count = Privileged.count - 1
        if Privileged.count < 1:
            _privilege_revoke()


def _privilege_grant() -> None:
    cmd = shlex.split("sudo -c")
    try:
        subprocess.run(cmd, capture_output=True, check=True, text=True)
    except (subprocess.CalledProcessError, OSError) as exception:
        raise PrivilegeError(
            f"Failed to grant admin privileges: {exception}"
        ) from exception


def _privilege_revoke() -> None:
    cmd = shlex.split("sudo -k")
    try:
        subprocess.run(cmd, capture_output=True, check=True, text=True)
    except (subprocess.CalledProcessError, OSError) as exception:
        raise PrivilegeError(
            f"Failed to grant revoke privileges: {exception}"
        ) from exception


def _privileged() -> bool:
    cmd = shlex.split("sudo --validate")
    try:
        process = subprocess.run(cmd, capture_output=True, text=True)
    except (subprocess.CalledProcessError, OSError) as exception:
        raise PrivilegeError(
            f"Failed to determine status of admin privileges: {exception}"
        ) from exception
    else:
        return process.returncode == 0
