import { loadEnv } from "vite";
import B from "node:path";
import G from "chokidar";
import {
  watchSchema,
  migrationsDir,
  applyPendingMigrations,
  ensureSchema,
  ensureInitialStructure,
  resolveConfiguredPublishableKey,
  createApi,
  listMigrationFiles,
} from "@supabase/lite/cli";
import { getRequestListener } from "@hono/node-server";
try {
  /**
   * Adding this to avoid warnings from node:sqlite being experimental
   */
  const { emitWarning } = process;
  process.emitWarning = (warning, ...args) => {
    if (warning.includes("SQLite is an experimental feature")) return;
    return emitWarning(warning, ...args);
  };
} catch {}

var k = Object.create;
var _ = Object.defineProperty;
var I = Object.getOwnPropertyDescriptor;
var T = Object.getOwnPropertyNames;
var C = Object.getPrototypeOf,
  N = Object.prototype.hasOwnProperty;
var M = (t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports);
var W = (t, e, o, i) => {
  if ((e && typeof e == "object") || typeof e == "function")
    for (let r of T(e))
      !N.call(t, r) &&
        r !== o &&
        _(t, r, {
          get: () => e[r],
          enumerable: !(i = I(e, r)) || i.enumerable,
        });
  return t;
};
var V = (t, e, o) => (
  (o = t != null ? k(C(t)) : {}),
  W(_(o, "default", { value: t, enumerable: true }), t)
);
var U = M((oe, A) => {
  var h = process || {},
    O = h.argv || [],
    u = h.env || {},
    Y =
      !(u.NO_COLOR || O.includes("--no-color")) &&
      (!!u.FORCE_COLOR ||
        O.includes("--color") ||
        h.platform === "win32" ||
        ((h.stdout || {}).isTTY && u.TERM !== "dumb") ||
        !!u.CI),
    K =
      (t, e, o = t) =>
      (i) => {
        let r = "" + i,
          n = r.indexOf(e, t.length);
        return ~n ? t + H(r, e, o, n) + e : t + r + e;
      },
    H = (t, e, o, i) => {
      let r = "",
        n = 0;
      do
        ((r += t.substring(n, i) + o),
          (n = i + e.length),
          (i = t.indexOf(e, n)));
      while (~i);
      return r + t.substring(n);
    },
    P = (t = Y) => {
      let e = t ? K : () => String;
      return {
        isColorSupported: t,
        reset: e("\x1B[0m", "\x1B[0m"),
        bold: e("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
        dim: e("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
        italic: e("\x1B[3m", "\x1B[23m"),
        underline: e("\x1B[4m", "\x1B[24m"),
        inverse: e("\x1B[7m", "\x1B[27m"),
        hidden: e("\x1B[8m", "\x1B[28m"),
        strikethrough: e("\x1B[9m", "\x1B[29m"),
        black: e("\x1B[30m", "\x1B[39m"),
        red: e("\x1B[31m", "\x1B[39m"),
        green: e("\x1B[32m", "\x1B[39m"),
        yellow: e("\x1B[33m", "\x1B[39m"),
        blue: e("\x1B[34m", "\x1B[39m"),
        magenta: e("\x1B[35m", "\x1B[39m"),
        cyan: e("\x1B[36m", "\x1B[39m"),
        white: e("\x1B[37m", "\x1B[39m"),
        gray: e("\x1B[90m", "\x1B[39m"),
        bgBlack: e("\x1B[40m", "\x1B[49m"),
        bgRed: e("\x1B[41m", "\x1B[49m"),
        bgGreen: e("\x1B[42m", "\x1B[49m"),
        bgYellow: e("\x1B[43m", "\x1B[49m"),
        bgBlue: e("\x1B[44m", "\x1B[49m"),
        bgMagenta: e("\x1B[45m", "\x1B[49m"),
        bgCyan: e("\x1B[46m", "\x1B[49m"),
        bgWhite: e("\x1B[47m", "\x1B[49m"),
        blackBright: e("\x1B[90m", "\x1B[39m"),
        redBright: e("\x1B[91m", "\x1B[39m"),
        greenBright: e("\x1B[92m", "\x1B[39m"),
        yellowBright: e("\x1B[93m", "\x1B[39m"),
        blueBright: e("\x1B[94m", "\x1B[39m"),
        magentaBright: e("\x1B[95m", "\x1B[39m"),
        cyanBright: e("\x1B[96m", "\x1B[39m"),
        whiteBright: e("\x1B[97m", "\x1B[39m"),
        bgBlackBright: e("\x1B[100m", "\x1B[49m"),
        bgRedBright: e("\x1B[101m", "\x1B[49m"),
        bgGreenBright: e("\x1B[102m", "\x1B[49m"),
        bgYellowBright: e("\x1B[103m", "\x1B[49m"),
        bgBlueBright: e("\x1B[104m", "\x1B[49m"),
        bgMagentaBright: e("\x1B[105m", "\x1B[49m"),
        bgCyanBright: e("\x1B[106m", "\x1B[49m"),
        bgWhiteBright: e("\x1B[107m", "\x1B[49m"),
      };
    };
  A.exports = P();
  A.exports.createColors = P;
});
var x = V(U());
var w = ["/auth/v1", "/rest/v1", "/_system"];
function S(t, e = w) {
  let o = getRequestListener(async (i, ...r) => {
    let n = r[0]?.incoming;
    return t.fetch(i, { peerAddress: n?.socket?.remoteAddress ?? null });
  });
  return (i, r, n) => {
    let p = i.url ?? "";
    if (
      !e.some((g) => p === g || p.startsWith(`${g}/`) || p.startsWith(`${g}?`))
    )
      return n();
    o(i, r).catch(n);
  };
}
function $(t) {
  let e = t.trim().toLowerCase();
  if (
    (e.startsWith("[") && e.endsWith("]") && (e = e.slice(1, -1)),
    (e = e.split("%")[0]),
    e === "::1")
  )
    return true;
  e.startsWith("::ffff:") && (e = e.slice(7));
  let o = e.split(".");
  return (
    o.length === 4 &&
    o.every((i) => /^\d{1,3}$/.test(i) && Number(i) <= 255) &&
    Number(o[0]) === 127
  );
}
function D(t) {
  let e = t.trim().toLowerCase();
  return e === "localhost" || $(e);
}
function ee(t, e) {
  let o = t.root ? B.resolve(t.root) : process.cwd(),
    r =
      t.envFile === false || t.envDir === false
        ? false
        : t.envDir
          ? B.resolve(o, t.envDir)
          : o,
    n = t.envPrefix ?? "VITE_";
  return loadEnv(e, r, n);
}
function te(t = {}) {
  let {
      config: e,
      migrateOnBoot: o = true,
      watchSchema: i = true,
      forceSchema: r = false,
      initOnBoot: n = true,
      prefixes: p = w,
      admin: g,
    } = t,
    m;
  async function E(a) {
    n && (await ensureInitialStructure({ recreate: false, template: false }));
    let s = await (
      await createApi({ withSupabaseClient: false })
    ).project.local.createApp(e, a);
    if (
      (r &&
        console.log(
          x.default.yellow(
            "\u26A0  supalite: forceSchema=true \u2014 data-loss migrations allowed",
          ),
        ),
      o)
    ) {
      if ((await listMigrationFiles(s)).length > 0) {
        let c = await applyPendingMigrations(s);
        for (let b of c.applied)
          console.log(
            x.default.green(" \u2713"),
            "Applied migration",
            x.default.cyan(b.filename),
          );
      } else s.hasEnabledSystemBaseSchema() && (await s.ensureSystemSchema());
      await ensureSchema(s, { force: r });
    }
    return s;
  }
  async function y() {
    try {
      await m?.connection.close();
    } catch {}
  }
  return {
    name: "@supabase/lite",
    async config(a, { mode: f }) {
      let s = ee(a, f),
        d = a.define ?? {},
        c = {},
        b = (l, v) => l in s || v in d;
      if (
        (b("VITE_SUPABASE_URL", "import.meta.env.VITE_SUPABASE_URL") ||
          (c["import.meta.env.VITE_SUPABASE_URL"] = "window.location.origin"),
        !b("VITE_SUPABASE_ANON_KEY", "import.meta.env.VITE_SUPABASE_ANON_KEY"))
      ) {
        n &&
          (await ensureInitialStructure({ recreate: false, template: false }));
        let l = await resolveConfiguredPublishableKey(e);
        c["import.meta.env.VITE_SUPABASE_ANON_KEY"] = JSON.stringify(
          l ?? "sb-lite-anon-key",
        );
      }
      return { define: c };
    },
    async configureServer(a) {
      let f = a.config.server.host,
        s = f === true || (typeof f == "string" && !D(f));
      if (
        ((m = await E({
          admin: s && g === void 0 ? false : g,
          adminDefault: !s,
        })),
        a.middlewares.use(S(m, p)),
        i)
      ) {
        let d = watchSchema(m, { translate: true, force: r }),
          c = B.join(process.cwd(), "supabase", migrationsDir(m)),
          b = G.watch(c, { ignoreInitial: true });
        (b.on("add", async () => {
          try {
            let l = await applyPendingMigrations(m);
            for (let v of l.applied)
              console.log(
                x.default.green(" \u2713"),
                "Applied",
                x.default.cyan(v.filename),
              );
            await ensureSchema(m, { force: r });
          } catch (l) {
            console.error(
              x.default.red("Migration failed: " + String(l.message ?? l)),
            );
          }
        }),
          a.httpServer?.once("close", () => {
            (b.close(), d());
          }));
      }
      a.httpServer?.once("close", y);
    },
    async configurePreviewServer(a) {
      ((m = await E({ admin: false, adminDefault: false })),
        a.middlewares.use(S(m, p)),
        a.httpServer?.once("close", y));
    },
    async closeBundle() {
      await y();
    },
  };
}
var pe = te;
export {
  w as DEFAULT_PREFIXES,
  pe as default,
  S as honoMiddleware,
  te as supalite,
};
