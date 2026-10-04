# Full-project lifecycle measurement

Run the existing authenticated task-and-private-attachment example through one fresh provision and six complete process restarts. The command verifies persisted user UUIDs, owned rows, exact private-file bytes, denied unauthorized access, and new owner-scoped writes after every restart. Each serving PID must exit successfully and disappear, and its API listener must close.

## Reproduce

Use Bun 1.4.2, Linux, Git and GNU `du`. From the repository root:

```sh
bun install --frozen-lockfile
bun scripts/measure-project-lifecycle.mjs
```

Results, an isolated fixture project and local diagnostics go beneath `.graduation/lifecycle/run-*/`; repository product/example files are unchanged. Optional positional arguments select an output directory and Bun cache directory. The default cache starts empty on its first run and is reused thereafter; the JSON records the observed state. Installation is timed separately, with a 60-second watchdog; the serving experiment has a 120-second watchdog.

## Recorded run

[Results and individual request timings](lifecycle-bun-1.4.2-linux.json) were collected from public source [10b23d4](https://github.com/jmonster/supalite/commit/10b23d4eefb3a34afe57fc59b2dda8362c3bce8f), tree `911f97aeb52ec5dd6dde63076d0053af58001265`. The JSON also pins the package/example trees, driver hash, Bun binary, CPU, kernel and memory.

The same public source separately passed [the populated graduation run](https://github.com/jmonster/supalite/actions/runs/37235887887). That migration qualification is independent of these local timing and memory observations.

Three fresh processes per policy each make one first function request and ten subsequent requests, after sign-in. All seven process lifetimes exited 0. Initial provision passed 16 checks; each restart passed 13.

| Policy | Readiness | First function | Subsequent median per run |
| --- | ---: | ---: | ---: |
| oneshot | 253–280 ms | 64–68 ms | 51.9 / 46.0 / 47.1 ms |
| per_worker | 251–286 ms | 61–63 ms | 6.87 / 5.95 / 5.13 ms |

Per-worker loaded RSS was 126–133 MiB; observed lifetime high-water marks were 126–134 MiB. Idle SIGTERM-to-exit observations were 8–12 ms. Active-request draining and deadline failures are separately covered by [CLI shutdown tests](../../test/cli-shutdown.test.mjs).

The example SDK install took **6.85 seconds** against a populated cache and still reported a resolved/downloaded item. Repository dependencies and Bun were already installed; their installation time is excluded. OS page cache was not cleared. The machine was shared, with no resource isolation imposed by this command.

## Interpretation

- RSS and `VmHWM` come from the serving PID, including native worker threads and excluding the measurement driver. Unavailable readings are null
- `oneshot` starts a worker per call, so its subsequent calls are not retained-worker warm latency
- Footprints are apparent bytes for explicitly named, overlapping scopes. They are not a sum of incremental disk requirements
- This is a small SQLite/filesystem example on one machine. It establishes observed stop/restart persistence, not crash recovery, a latency/memory bound, wake-on-request hosting, or hosting-cost savings
