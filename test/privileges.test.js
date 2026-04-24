import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { execaMock } = vi.hoisted(() => ({ execaMock: vi.fn() }));
vi.mock("execa", () => ({ execa: (...args) => execaMock(...args) }));

const { privileged, isPrivileged, _resetDepth } = await import("../src/privileges.js");

function argMatches(call, cmd, args) {
  const [c, a] = call;
  return c === cmd && JSON.stringify(a) === JSON.stringify(args);
}

describe("privileged()", () => {
  beforeEach(() => {
    _resetDepth();
    execaMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips grant when sudo is already validated, then revokes at the end", async () => {
    // isPrivileged -> exit 0; revoke -> ok
    execaMock
      .mockResolvedValueOnce({ exitCode: 0 }) // sudo --validate
      .mockResolvedValueOnce({ exitCode: 0 }); // sudo -k

    const inner = vi.fn();
    await privileged(inner);

    expect(inner).toHaveBeenCalledOnce();
    expect(execaMock.mock.calls.some((c) => argMatches(c, "sudo", ["-v"]))).toBe(false);
    expect(execaMock.mock.calls.some((c) => argMatches(c, "sudo", ["-k"]))).toBe(true);
  });

  it("grants once when sudo is not yet validated", async () => {
    execaMock
      .mockResolvedValueOnce({ exitCode: 1 }) // sudo --validate (non-interactive) -> not valid
      .mockResolvedValueOnce({ exitCode: 0 }) // sudo -v (interactive grant)
      .mockResolvedValueOnce({ exitCode: 0 }); // sudo -k

    await privileged(async () => {});

    expect(execaMock.mock.calls.some((c) => argMatches(c, "sudo", ["-v"]))).toBe(true);
    expect(execaMock.mock.calls.some((c) => argMatches(c, "sudo", ["-k"]))).toBe(true);
  });

  it("nested privileged() calls grant/revoke only around the outermost", async () => {
    // outermost: validate -> 0, then (no grant needed).
    // nested call sees depth > 0 so doesn't validate/grant.
    // Finally: revoke once.
    execaMock
      .mockResolvedValueOnce({ exitCode: 0 }) // sudo --validate (outer)
      .mockResolvedValueOnce({ exitCode: 0 }); // sudo -k (outer finally)

    const inner = vi.fn();
    await privileged(async () => {
      await privileged(inner);
    });

    expect(inner).toHaveBeenCalledOnce();
    const validateCount = execaMock.mock.calls.filter((c) =>
      argMatches(c, "sudo", ["--non-interactive", "--validate"]),
    ).length;
    const revokeCount = execaMock.mock.calls.filter((c) => argMatches(c, "sudo", ["-k"])).length;
    expect(validateCount).toBe(1);
    expect(revokeCount).toBe(1);
  });

  it("revokes even if the inner function throws", async () => {
    execaMock
      .mockResolvedValueOnce({ exitCode: 0 }) // validate
      .mockResolvedValueOnce({ exitCode: 0 }); // revoke

    await expect(
      privileged(async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow(/boom/);

    expect(execaMock.mock.calls.some((c) => argMatches(c, "sudo", ["-k"]))).toBe(true);
  });
});

describe("isPrivileged()", () => {
  beforeEach(() => {
    _resetDepth();
    execaMock.mockReset();
  });

  it("returns true when sudo --validate exits 0", async () => {
    execaMock.mockResolvedValue({ exitCode: 0 });
    expect(await isPrivileged()).toBe(true);
  });

  it("returns false otherwise", async () => {
    execaMock.mockResolvedValue({ exitCode: 1 });
    expect(await isPrivileged()).toBe(false);
  });
});
