import { execa } from "execa";

export class PrivilegeError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "PrivilegeError";
    this.cause = cause;
  }
}

let depth = 0;

export async function privileged(fn) {
  if (depth === 0 && !(await isPrivileged())) {
    await grant();
  }
  depth++;
  try {
    return await fn();
  } finally {
    depth--;
    if (depth < 1) {
      await revoke();
    }
  }
}

export function _resetDepth() {
  depth = 0;
}

export async function isPrivileged() {
  try {
    const { exitCode } = await execa("sudo", ["--non-interactive", "--validate"], {
      reject: false,
    });
    return exitCode === 0;
  } catch (err) {
    throw new PrivilegeError("Failed to determine sudo status", err);
  }
}

async function grant() {
  // `sudo -v` caches credentials; inherit stdio so TouchID / password prompt reaches the terminal.
  try {
    await execa("sudo", ["-v"], { stdio: "inherit" });
  } catch (err) {
    throw new PrivilegeError("Failed to grant admin privileges", err);
  }
}

async function revoke() {
  try {
    await execa("sudo", ["-k"]);
  } catch (err) {
    throw new PrivilegeError("Failed to revoke admin privileges", err);
  }
}
