#!/usr/bin/env node
import {
  runUpgradeDryRun,
  writeUpgradeDryRunReport,
} from "./upgrade-dry-run.js";
import as, { statSync, readFileSync } from "node:fs";
import * as Fe from "node:path";
import Fe__default, { join } from "node:path";
import { parse } from "dotenv";
import * as he from "node:fs/promises";
import he__default, { stat as stat$1 } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createConnection } from "@supabase/lite/sqlite";
import { s } from "jsonv-ts";
import vb from "node:os";
import { createClient } from "@supabase/supabase-js";
import oC, { createHash, randomUUID } from "node:crypto";
import {
  DataLossError,
  SqliteConnection,
  splitSqlStatements,
  isEqual,
  ensureVar,
  App,
  cloud,
} from "@supabase/lite";
import { sql } from "kysely";
import { createRequire } from "module";
import {
  resolve,
  posix,
  isAbsolute,
  sep,
  basename,
  dirname,
  normalize,
  relative,
} from "path";
import * as Rw from "fs";
import {
  statSync as statSync$1,
  stat,
  realpathSync,
  realpath,
  readdirSync,
  readdir,
} from "fs";
import { fileURLToPath as fileURLToPath$1 } from "url";
import { Deparser, QuoteUtils } from "pgsql-deparser";
import u_ from "chokidar";
import { styleText } from "node:util";
import Ye, { stdout, stdin } from "node:process";
import * as kt from "node:readline";
import kt__default from "node:readline";
import { ReadStream } from "node:tty";
import { DeparserContext } from "pgsql-deparser/visitors/base.js";
import { SqlFormatter } from "pgsql-deparser/utils/sql-formatter.js";
import { Buffer as Buffer$1 } from "node:buffer";
import WT from "node:net";
import { Command as Command$1 } from "@commander-js/extra-typings";
import { Command } from "commander";
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

var Ug = Object.create;
var go = Object.defineProperty;
var Bg = Object.getOwnPropertyDescriptor;
var qg = Object.getOwnPropertyNames;
var Hg = Object.getPrototypeOf,
  Gg = Object.prototype.hasOwnProperty;
var b = (e, t) => () => (e && (t = e((e = 0))), t);
var Et = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports),
  pe = (e, t) => {
    for (var n in t) go(e, n, { get: t[n], enumerable: true });
  },
  Wg = (e, t, n, r) => {
    if ((t && typeof t == "object") || typeof t == "function")
      for (let s of qg(t))
        !Gg.call(e, s) &&
          s !== n &&
          go(e, s, {
            get: () => t[s],
            enumerable: !(r = Bg(t, s)) || r.enumerable,
          });
    return e;
  };
var z = (e, t, n) => (
  (n = e != null ? Ug(Hg(e)) : {}),
  Wg(go(n, "default", { value: e, enumerable: true }), e)
);
var ns,
  yo = b(() => {
    ns = process.stdin.isTTY
      ? null
      : (async () => {
          let e = [];
          for await (let t of process.stdin) e.push(t);
          return Buffer.concat(e).toString("utf8");
        })();
    ns && process.stdin.unref?.();
  });
var J = Et((IC, bo) => {
  var ss = process || {},
    Hc = ss.argv || [],
    rs = ss.env || {},
    Vg =
      !(rs.NO_COLOR || Hc.includes("--no-color")) &&
      (!!rs.FORCE_COLOR ||
        Hc.includes("--color") ||
        ss.platform === "win32" ||
        ((ss.stdout || {}).isTTY && rs.TERM !== "dumb") ||
        !!rs.CI),
    Kg =
      (e, t, n = e) =>
      (r) => {
        let s = "" + r,
          i = s.indexOf(t, e.length);
        return ~i ? e + zg(s, t, n, i) + t : e + s + t;
      },
    zg = (e, t, n, r) => {
      let s = "",
        i = 0;
      do
        ((s += e.substring(i, r) + n),
          (i = r + t.length),
          (r = e.indexOf(t, i)));
      while (~r);
      return s + e.substring(i);
    },
    Gc = (e = Vg) => {
      let t = e ? Kg : () => String;
      return {
        isColorSupported: e,
        reset: t("\x1B[0m", "\x1B[0m"),
        bold: t("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
        dim: t("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
        italic: t("\x1B[3m", "\x1B[23m"),
        underline: t("\x1B[4m", "\x1B[24m"),
        inverse: t("\x1B[7m", "\x1B[27m"),
        hidden: t("\x1B[8m", "\x1B[28m"),
        strikethrough: t("\x1B[9m", "\x1B[29m"),
        black: t("\x1B[30m", "\x1B[39m"),
        red: t("\x1B[31m", "\x1B[39m"),
        green: t("\x1B[32m", "\x1B[39m"),
        yellow: t("\x1B[33m", "\x1B[39m"),
        blue: t("\x1B[34m", "\x1B[39m"),
        magenta: t("\x1B[35m", "\x1B[39m"),
        cyan: t("\x1B[36m", "\x1B[39m"),
        white: t("\x1B[37m", "\x1B[39m"),
        gray: t("\x1B[90m", "\x1B[39m"),
        bgBlack: t("\x1B[40m", "\x1B[49m"),
        bgRed: t("\x1B[41m", "\x1B[49m"),
        bgGreen: t("\x1B[42m", "\x1B[49m"),
        bgYellow: t("\x1B[43m", "\x1B[49m"),
        bgBlue: t("\x1B[44m", "\x1B[49m"),
        bgMagenta: t("\x1B[45m", "\x1B[49m"),
        bgCyan: t("\x1B[46m", "\x1B[49m"),
        bgWhite: t("\x1B[47m", "\x1B[49m"),
        blackBright: t("\x1B[90m", "\x1B[39m"),
        redBright: t("\x1B[91m", "\x1B[39m"),
        greenBright: t("\x1B[92m", "\x1B[39m"),
        yellowBright: t("\x1B[93m", "\x1B[39m"),
        blueBright: t("\x1B[94m", "\x1B[39m"),
        magentaBright: t("\x1B[95m", "\x1B[39m"),
        cyanBright: t("\x1B[96m", "\x1B[39m"),
        whiteBright: t("\x1B[97m", "\x1B[39m"),
        bgBlackBright: t("\x1B[100m", "\x1B[49m"),
        bgRedBright: t("\x1B[101m", "\x1B[49m"),
        bgGreenBright: t("\x1B[102m", "\x1B[49m"),
        bgYellowBright: t("\x1B[103m", "\x1B[49m"),
        bgBlueBright: t("\x1B[104m", "\x1B[49m"),
        bgMagentaBright: t("\x1B[105m", "\x1B[49m"),
        bgCyanBright: t("\x1B[106m", "\x1B[49m"),
        bgWhiteBright: t("\x1B[107m", "\x1B[49m"),
      };
    };
  bo.exports = Gc();
  bo.exports.createColors = Gc;
});
function Jg(e) {
  let t = (typeof process < "u" && process.env) || void 0;
  return t ? (t.NODE_ENV === "test" ? true : t[Xg[e]] === "1") : false;
}
function is(e) {
  return Vc[e];
}
function wo() {
  return Wc.filter((e) => Vc[e]);
}
function os() {
  let e = wo();
  if (e.length === 0) return null;
  let t = e.includes("storage")
    ? " Cloud sync (lite cloud deploy) is disabled."
    : "";
  return `EXPERIMENTAL FEATURES ENABLED: ${e.join(", ")} - not supported, do not use in production.${t}`;
}
var Xg,
  Wc,
  Vc,
  Nt = b(() => {
    ((Xg = { storage: "EXPERIMENTAL_STORAGE", cloud: "EXPERIMENTAL_CLOUD" }),
      (Wc = ["storage", "cloud"]),
      (Vc = Object.fromEntries(Wc.map((e) => [e, Jg(e)]))));
  });
function ve(e, t) {
  as.existsSync(e) || (as.mkdirSync(e, { recursive: true }), t?.());
}
function Ot(e, t, n) {
  as.existsSync(e) || (as.writeFileSync(e, t), n?.());
}
async function ls() {
  if (!ns)
    throw new Error(
      "No input given \u2014 pass it as an argument or pipe it via stdin.",
    );
  return (process.stdin.ref?.(), ns);
}
var Lt = b(() => {
  yo();
});
function Qg(e, t) {
  let n = e.slice(0, t).split(/\r\n|\n|\r/g);
  return [n.length, n.pop().length + 1];
}
function Zg(e, t, n) {
  let r = e.split(/\r\n|\n|\r/g),
    s = "",
    i = (Math.log10(t + 1) | 0) + 1;
  for (let o = t - 1; o <= t + 1; o++) {
    let a = r[o - 1];
    a &&
      ((s += o.toString().padEnd(i, " ")),
      (s += ":  "),
      (s += a),
      (s += `
`),
      o === t &&
        ((s += " ".repeat(i + n + 2)),
        (s += `^
`)));
  }
  return s;
}
var q,
  It = b(() => {
    q = class extends Error {
      line;
      column;
      codeblock;
      constructor(t, n) {
        let [r, s] = Qg(n.toml, n.ptr),
          i = Zg(n.toml, r, s);
        (super(
          `Invalid TOML document: ${t}

${i}`,
          n,
        ),
          (this.line = r),
          (this.column = s),
          (this.codeblock = i));
      }
    };
  });
function ey(e, t) {
  let n = 0;
  for (; e[t - ++n] === "\\"; );
  return --n && n % 2;
}
function cs(e, t = 0, n = e.length) {
  let r = e.indexOf(
    `
`,
    t,
  );
  return (e[r - 1] === "\r" && r--, r <= n ? r : -1);
}
function en(e, t) {
  for (let n = t; n < e.length; n++) {
    let r = e[n];
    if (
      r ===
      `
`
    )
      return n;
    if (
      r === "\r" &&
      e[n + 1] ===
        `
`
    )
      return n + 1;
    if ((r < " " && r !== "	") || r === "\x7F")
      throw new q("control characters are not allowed in comments", {
        toml: e,
        ptr: t,
      });
  }
  return e.length;
}
function ke(e, t, n, r) {
  let s;
  for (
    ;
    (s = e[t]) === " " ||
    s === "	" ||
    (!n &&
      (s ===
        `
` ||
        (s === "\r" &&
          e[t + 1] ===
            `
`)));

  )
    t++;
  return r || s !== "#" ? t : ke(e, en(e, t), n);
}
function zc(e, t, n, r, s = false) {
  if (!r) return ((t = cs(e, t)), t < 0 ? e.length : t);
  for (let i = t; i < e.length; i++) {
    let o = e[i];
    if (o === "#") i = cs(e, i);
    else {
      if (o === n) return i + 1;
      if (
        o === r ||
        (s &&
          (o ===
            `
` ||
            (o === "\r" &&
              e[i + 1] ===
                `
`)))
      )
        return i;
    }
  }
  throw new q("cannot find end of structure", { toml: e, ptr: t });
}
function us(e, t) {
  let n = e[t],
    r = n === e[t + 1] && e[t + 1] === e[t + 2] ? e.slice(t, t + 3) : n;
  t += r.length - 1;
  do t = e.indexOf(r, ++t);
  while (t > -1 && n !== "'" && ey(e, t));
  return (
    t > -1 &&
      ((t += r.length), r.length > 1 && (e[t] === n && t++, e[t] === n && t++)),
    t
  );
}
var Ln = b(() => {
  It();
});
var ty,
  In,
  So = b(() => {
    ((ty =
      /^(\d{4}-\d{2}-\d{2})?[T ]?(?:(\d{2}):\d{2}(?::\d{2}(?:\.\d+)?)?)?(Z|[-+]\d{2}:\d{2})?$/i),
      (In = class e extends Date {
        #e = false;
        #t = false;
        #n = null;
        constructor(t) {
          let n = true,
            r = true,
            s = "Z";
          if (typeof t == "string") {
            let i = t.match(ty);
            i
              ? (i[1] || ((n = false), (t = `0000-01-01T${t}`)),
                (r = !!i[2]),
                r && t[10] === " " && (t = t.replace(" ", "T")),
                i[2] && +i[2] > 23
                  ? (t = "")
                  : ((s = i[3] || null),
                    (t = t.toUpperCase()),
                    !s && r && (t += "Z")))
              : (t = "");
          }
          (super(t),
            isNaN(this.getTime()) ||
              ((this.#e = n), (this.#t = r), (this.#n = s)));
        }
        isDateTime() {
          return this.#e && this.#t;
        }
        isLocal() {
          return !this.#e || !this.#t || !this.#n;
        }
        isDate() {
          return this.#e && !this.#t;
        }
        isTime() {
          return this.#t && !this.#e;
        }
        isValid() {
          return this.#e || this.#t;
        }
        toISOString() {
          let t = super.toISOString();
          if (this.isDate()) return t.slice(0, 10);
          if (this.isTime()) return t.slice(11, 23);
          if (this.#n === null) return t.slice(0, -1);
          if (this.#n === "Z") return t;
          let n = +this.#n.slice(1, 3) * 60 + +this.#n.slice(4, 6);
          return (
            (n = this.#n[0] === "-" ? n : -n),
            new Date(this.getTime() - n * 6e4).toISOString().slice(0, -1) +
              this.#n
          );
        }
        static wrapAsOffsetDateTime(t, n = "Z") {
          let r = new e(t);
          return ((r.#n = n), r);
        }
        static wrapAsLocalDateTime(t) {
          let n = new e(t);
          return ((n.#n = null), n);
        }
        static wrapAsLocalDate(t) {
          let n = new e(t);
          return ((n.#t = false), (n.#n = null), n);
        }
        static wrapAsLocalTime(t) {
          let n = new e(t);
          return ((n.#e = false), (n.#n = null), n);
        }
      }));
  });
function ps(e, t = 0, n = e.length) {
  let r = e[t] === "'",
    s = e[t++] === e[t] && e[t] === e[t + 1];
  s &&
    ((n -= 2),
    e[(t += 2)] === "\r" && t++,
    e[t] ===
      `
` && t++);
  let i = 0,
    o,
    a = "",
    l = t;
  for (; t < n - 1; ) {
    let c = e[t++];
    if (
      c ===
        `
` ||
      (c === "\r" &&
        e[t] ===
          `
`)
    ) {
      if (!s)
        throw new q("newlines are not allowed in strings", {
          toml: e,
          ptr: t - 1,
        });
    } else if ((c < " " && c !== "	") || c === "\x7F")
      throw new q("control characters are not allowed in strings", {
        toml: e,
        ptr: t - 1,
      });
    if (o) {
      if (((o = false), c === "x" || c === "u" || c === "U")) {
        let p = e.slice(t, (t += c === "x" ? 2 : c === "u" ? 4 : 8));
        if (!iy.test(p))
          throw new q("invalid unicode escape", { toml: e, ptr: i });
        try {
          a += String.fromCodePoint(parseInt(p, 16));
        } catch {
          throw new q("invalid unicode escape", { toml: e, ptr: i });
        }
      } else if (
        s &&
        (c ===
          `
` ||
          c === " " ||
          c === "	" ||
          c === "\r")
      ) {
        if (
          ((t = ke(e, t - 1, true)),
          e[t] !==
            `
` && e[t] !== "\r")
        )
          throw new q(
            "invalid escape: only line-ending whitespace may be escaped",
            { toml: e, ptr: i },
          );
        t = ke(e, t);
      } else if (c in Xc) a += Xc[c];
      else throw new q("unrecognized escape sequence", { toml: e, ptr: i });
      l = t;
    } else !r && c === "\\" && ((i = t - 1), (o = true), (a += e.slice(l, i)));
  }
  return a + e.slice(l, n - 1);
}
function Jc(e, t, n, r) {
  if (e === "true") return true;
  if (e === "false") return false;
  if (e === "-inf") return -1 / 0;
  if (e === "inf" || e === "+inf") return 1 / 0;
  if (e === "nan" || e === "+nan" || e === "-nan") return NaN;
  if (e === "-0") return r ? 0n : 0;
  let s = ny.test(e);
  if (s || ry.test(e)) {
    if (sy.test(e))
      throw new q("leading zeroes are not allowed", { toml: t, ptr: n });
    e = e.replace(/_/g, "");
    let o = +e;
    if (isNaN(o)) throw new q("invalid number", { toml: t, ptr: n });
    if (s) {
      if ((s = !Number.isSafeInteger(o)) && !r)
        throw new q("integer value cannot be represented losslessly", {
          toml: t,
          ptr: n,
        });
      (s || r === true) && (o = BigInt(e));
    }
    return o;
  }
  let i = new In(e);
  if (!i.isValid()) throw new q("invalid value", { toml: t, ptr: n });
  return i;
}
var ny,
  ry,
  sy,
  iy,
  Xc,
  Eo = b(() => {
    Ln();
    So();
    It();
    ((ny = /^((0x[0-9a-fA-F](_?[0-9a-fA-F])*)|(([+-]|0[ob])?\d(_?\d)*))$/),
      (ry = /^[+-]?\d(_?\d)*(\.\d(_?\d)*)?([eE][+-]?\d(_?\d)*)?$/),
      (sy = /^[+-]?0[0-9_]/),
      (iy = /^[0-9a-f]{2,8}$/i),
      (Xc = {
        b: "\b",
        t: "	",
        n: `
`,
        f: "\f",
        r: "\r",
        e: "\x1B",
        '"': '"',
        "\\": "\\",
      }));
  });
function oy(e, t, n) {
  let r = e.slice(t, n),
    s = r.indexOf("#");
  return (s > -1 && (en(e, s), (r = r.slice(0, s))), [r.trimEnd(), s]);
}
function Dn(e, t, n, r, s) {
  if (r === 0)
    throw new q("document contains excessively nested structures. aborting.", {
      toml: e,
      ptr: t,
    });
  let i = e[t];
  if (i === "[" || i === "{") {
    let [l, c] = i === "[" ? Qc(e, t, r, s) : Yc(e, t, r, s);
    if (n) {
      if (((c = ke(e, c)), e[c] === ",")) c++;
      else if (e[c] !== n)
        throw new q("expected comma or end of structure", { toml: e, ptr: c });
    }
    return [l, c];
  }
  let o;
  if (i === '"' || i === "'") {
    o = us(e, t);
    let l = ps(e, t, o);
    if (n) {
      if (
        ((o = ke(e, o)),
        e[o] &&
          e[o] !== "," &&
          e[o] !== n &&
          e[o] !==
            `
` &&
          e[o] !== "\r")
      )
        throw new q("unexpected character encountered", { toml: e, ptr: o });
      o += +(e[o] === ",");
    }
    return [l, o];
  }
  o = zc(e, t, ",", n);
  let a = oy(e, t, o - +(e[o - 1] === ","));
  if (!a[0])
    throw new q("incomplete key-value declaration: no value specified", {
      toml: e,
      ptr: t,
    });
  return (
    n && a[1] > -1 && ((o = ke(e, t + a[1])), (o += +(e[o] === ","))),
    [Jc(a[0], e, t, s), o]
  );
}
var _o = b(() => {
  Eo();
  xo();
  Ln();
  It();
});
function fs(e, t, n = "=") {
  let r = t - 1,
    s = [],
    i = e.indexOf(n, t);
  if (i < 0)
    throw new q("incomplete key-value: cannot find end of key", {
      toml: e,
      ptr: t,
    });
  do {
    let o = e[(t = ++r)];
    if (o !== " " && o !== "	")
      if (o === '"' || o === "'") {
        if (o === e[t + 1] && o === e[t + 2])
          throw new q("multiline strings are not allowed in keys", {
            toml: e,
            ptr: t,
          });
        let a = us(e, t);
        if (a < 0)
          throw new q("unfinished string encountered", { toml: e, ptr: t });
        r = e.indexOf(".", a);
        let l = e.slice(a, r < 0 || r > i ? i : r),
          c = cs(l);
        if (c > -1)
          throw new q("newlines are not allowed in keys", {
            toml: e,
            ptr: t + r + c,
          });
        if (l.trimStart())
          throw new q("found extra tokens after the string part", {
            toml: e,
            ptr: a,
          });
        if (i < a && ((i = e.indexOf(n, a)), i < 0))
          throw new q("incomplete key-value: cannot find end of key", {
            toml: e,
            ptr: t,
          });
        s.push(ps(e, t, a));
      } else {
        r = e.indexOf(".", t);
        let a = e.slice(t, r < 0 || r > i ? i : r);
        if (!ay.test(a))
          throw new q(
            "only letter, numbers, dashes and underscores are allowed in keys",
            { toml: e, ptr: t },
          );
        s.push(a.trimEnd());
      }
  } while (r + 1 && r < i);
  return [s, ke(e, i + 1, true, true)];
}
function Yc(e, t, n, r) {
  let s = {},
    i = new Set(),
    o;
  for (t++; (o = e[t++]) !== "}" && o; ) {
    if (o === ",")
      throw new q("expected value, found comma", { toml: e, ptr: t - 1 });
    if (o === "#") t = en(e, t);
    else if (
      o !== " " &&
      o !== "	" &&
      o !==
        `
` &&
      o !== "\r"
    ) {
      let a,
        l = s,
        c = false,
        [p, u] = fs(e, t - 1);
      for (let m = 0; m < p.length; m++) {
        if (
          (m && (l = c ? l[a] : (l[a] = {})),
          (a = p[m]),
          (c = Object.hasOwn(l, a)) && (typeof l[a] != "object" || i.has(l[a])))
        )
          throw new q("trying to redefine an already defined value", {
            toml: e,
            ptr: t,
          });
        !c &&
          a === "__proto__" &&
          Object.defineProperty(l, a, {
            enumerable: true,
            configurable: true,
            writable: true,
          });
      }
      if (c)
        throw new q("trying to redefine an already defined value", {
          toml: e,
          ptr: t,
        });
      let [f, h] = Dn(e, u, "}", n - 1, r);
      (i.add(f), (l[a] = f), (t = h));
    }
  }
  if (!o) throw new q("unfinished table encountered", { toml: e, ptr: t });
  return [s, t];
}
function Qc(e, t, n, r) {
  let s = [],
    i;
  for (t++; (i = e[t++]) !== "]" && i; ) {
    if (i === ",")
      throw new q("expected value, found comma", { toml: e, ptr: t - 1 });
    if (i === "#") t = en(e, t);
    else if (
      i !== " " &&
      i !== "	" &&
      i !==
        `
` &&
      i !== "\r"
    ) {
      let o = Dn(e, t - 1, "]", n - 1, r);
      (s.push(o[0]), (t = o[1]));
    }
  }
  if (!i) throw new q("unfinished array encountered", { toml: e, ptr: t });
  return [s, t];
}
var ay,
  xo = b(() => {
    Eo();
    _o();
    Ln();
    It();
    ay = /^[a-zA-Z0-9-_]+[ \t]*$/;
  });
function Zc(e, t, n, r) {
  let s = t,
    i = n,
    o,
    a = false,
    l;
  for (let c = 0; c < e.length; c++) {
    if (c) {
      if (
        ((s = a ? s[o] : (s[o] = {})),
        (i = (l = i[o]).c),
        r === 0 && (l.t === 1 || l.t === 2))
      )
        return null;
      if (l.t === 2) {
        let p = s.length - 1;
        ((s = s[p]), (i = i[p].c));
      }
    }
    if (((o = e[c]), (a = Object.hasOwn(s, o)) && i[o]?.t === 0 && i[o]?.d))
      return null;
    a ||
      (o === "__proto__" &&
        (Object.defineProperty(s, o, {
          enumerable: true,
          configurable: true,
          writable: true,
        }),
        Object.defineProperty(i, o, {
          enumerable: true,
          configurable: true,
          writable: true,
        })),
      (i[o] = {
        t: c < e.length - 1 && r === 2 ? 3 : r,
        d: false,
        i: 0,
        c: {},
      }));
  }
  if (
    ((l = i[o]),
    (l.t !== r && !(r === 1 && l.t === 3)) ||
      (r === 2 &&
        (l.d || ((l.d = true), (s[o] = [])),
        s[o].push((s = {})),
        (l.c[l.i++] = l = { t: 1, d: false, i: 0, c: {} })),
      l.d))
  )
    return null;
  if (((l.d = true), r === 1)) s = a ? s[o] : (s[o] = {});
  else if (r === 0 && a) return null;
  return [o, s, l.c];
}
function Dt(e, { maxDepth: t = 1e3, integersAsBigInt: n } = {}) {
  let r = {},
    s = {},
    i = r,
    o = s;
  for (let a = ke(e, 0); a < e.length; ) {
    if (e[a] === "[") {
      let l = e[++a] === "[",
        c = fs(e, (a += +l), "]");
      if (l) {
        if (e[c[1] - 1] !== "]")
          throw new q("expected end of table declaration", {
            toml: e,
            ptr: c[1] - 1,
          });
        c[1]++;
      }
      let p = Zc(c[0], r, s, l ? 2 : 1);
      if (!p)
        throw new q("trying to redefine an already defined table or value", {
          toml: e,
          ptr: a,
        });
      ((o = p[2]), (i = p[1]), (a = c[1]));
    } else {
      let l = fs(e, a),
        c = Zc(l[0], i, o, 0);
      if (!c)
        throw new q("trying to redefine an already defined table or value", {
          toml: e,
          ptr: a,
        });
      let p = Dn(e, l[1], void 0, t, n);
      ((c[1][c[0]] = p[0]), (a = p[1]));
    }
    if (
      ((a = ke(e, a, true)),
      e[a] &&
        e[a] !==
          `
` &&
        e[a] !== "\r")
    )
      throw new q(
        "each key-value declaration must be followed by an end-of-line",
        { toml: e, ptr: a },
      );
    a = ke(e, a);
  }
  return r;
}
var eu = b(() => {
  xo();
  _o();
  Ln();
  It();
});
function jn(e) {
  let t = typeof e;
  if (t === "object") {
    if (Array.isArray(e)) return "array";
    if (e instanceof Date) return "date";
  }
  return t;
}
function ly(e) {
  for (let t = 0; t < e.length; t++) if (jn(e[t]) !== "object") return false;
  return e.length != 0;
}
function To(e) {
  return JSON.stringify(e).replace(/\x7f/g, "\\u007f");
}
function Co(e, t, n, r) {
  if (n === 0)
    throw new Error(
      "Could not stringify the object: maximum object depth exceeded",
    );
  if (t === "number")
    return isNaN(e)
      ? "nan"
      : e === 1 / 0
        ? "inf"
        : e === -1 / 0
          ? "-inf"
          : r && Number.isInteger(e)
            ? e.toFixed(1)
            : e.toString();
  if (t === "bigint" || t === "boolean") return e.toString();
  if (t === "string") return To(e);
  if (t === "date") {
    if (isNaN(e.getTime()))
      throw new TypeError("cannot serialize invalid date");
    return e.toISOString();
  }
  if (t === "object") return cy(e, n, r);
  if (t === "array") return uy(e, n, r);
}
function cy(e, t, n) {
  let r = Object.keys(e);
  if (r.length === 0) return "{}";
  let s = "{ ";
  for (let i = 0; i < r.length; i++) {
    let o = r[i];
    (i && (s += ", "),
      (s += tu.test(o) ? o : To(o)),
      (s += " = "),
      (s += Co(e[o], jn(e[o]), t - 1, n)));
  }
  return s + " }";
}
function uy(e, t, n) {
  if (e.length === 0) return "[]";
  let r = "[ ";
  for (let s = 0; s < e.length; s++) {
    if ((s && (r += ", "), e[s] === null || e[s] === void 0))
      throw new TypeError("arrays cannot contain null or undefined values");
    r += Co(e[s], jn(e[s]), t - 1, n);
  }
  return r + " ]";
}
function py(e, t, n, r) {
  if (n === 0)
    throw new Error(
      "Could not stringify the object: maximum object depth exceeded",
    );
  let s = "";
  for (let i = 0; i < e.length; i++)
    ((s += `${
      s &&
      `
`
    }[[${t}]]
`),
      (s += Ao(0, e[i], t, n, r)));
  return s;
}
function Ao(e, t, n, r, s) {
  if (r === 0)
    throw new Error(
      "Could not stringify the object: maximum object depth exceeded",
    );
  let i = "",
    o = "",
    a = Object.keys(t);
  for (let l = 0; l < a.length; l++) {
    let c = a[l];
    if (t[c] !== null && t[c] !== void 0) {
      let p = jn(t[c]);
      if (p === "symbol" || p === "function")
        throw new TypeError(`cannot serialize values of type '${p}'`);
      let u = tu.test(c) ? c : To(c);
      if (p === "array" && ly(t[c]))
        o +=
          (o &&
            `
`) + py(t[c], n ? `${n}.${u}` : u, r - 1, s);
      else if (p === "object") {
        let f = n ? `${n}.${u}` : u;
        o +=
          (o &&
            `
`) + Ao(f, t[c], f, r - 1, s);
      } else
        ((i += u),
          (i += " = "),
          (i += Co(t[c], p, r, s)),
          (i += `
`));
    }
  }
  return (
    e &&
      (i || !o) &&
      (i = i
        ? `[${e}]
${i}`
        : `[${e}]`),
    i && o
      ? `${i}
${o}`
      : i || o
  );
}
function $o(e, { maxDepth: t = 1e3, numbersAsFloat: n = false } = {}) {
  if (jn(e) !== "object")
    throw new TypeError("stringify can only be called with an object");
  let r = Ao(0, e, "", t, n);
  return r[r.length - 1] !==
    `
`
    ? r +
        `
`
    : r;
}
var tu,
  nu = b(() => {
    tu = /^[a-z0-9-_]+$/i;
  });
var Fn = b(() => {
  eu();
  nu();
  So();
  It();
});
var fe,
  jt = b(() => {
    fe = {
      config_dir: "supabase",
      default_api_port: 54321,
      default_config_format: "toml",
      default_config_path: "config.toml",
      default_db_url: "file:supabase/.temp/data.db",
      default_db_dir: "supabase/.temp/data",
    };
  });
function ms(e, t = {}) {
  let n = Fe__default.resolve(t.cwd ?? process.cwd()),
    r = t.env ?? process.env,
    s = process.env.SUPABASE_ENV || "development",
    i = [
      `.env.${s}.local`,
      s === "test" ? null : ".env.local",
      `.env.${s}`,
      ".env",
    ].filter((a) => a !== null),
    o = dy(Fe__default.resolve(e), n);
  for (let a of o)
    for (let l of i) {
      let c = Fe__default.join(a, l),
        p;
      try {
        p = as.readFileSync(c, "utf-8");
      } catch {
        continue;
      }
      let u;
      try {
        u = parse(p);
      } catch (f) {
        throw new Error(`Failed to parse ${c}: ${f.message}`);
      }
      for (let [f, h] of Object.entries(u)) r[f] === void 0 && (r[f] = h);
    }
}
function dy(e, t) {
  let n = [],
    r = e,
    s = Fe__default.parse(r).root;
  for (; n.push(r), !(r === t || r === s); ) {
    let i = Fe__default.dirname(r);
    if (i === r) break;
    r = i;
  }
  return n;
}
var Ro = b(() => {});
function ds(e, t = process.env) {
  return vo(e, t);
}
function vo(e, t) {
  if (typeof e == "string") {
    let n = e.match(hy);
    return n ? (t[n[1]] ?? "") : e;
  }
  if (Array.isArray(e)) return e.map((n) => vo(n, t));
  if (e && typeof e == "object") {
    let n = Object.getPrototypeOf(e);
    if (n !== Object.prototype && n !== null) return e;
    let r = {};
    for (let [s, i] of Object.entries(e)) r[s] = vo(i, t);
    return r;
  }
  return e;
}
var hy,
  ko = b(() => {
    hy = /^env\((\w+)\)$/;
  });
function su(e) {
  ru = e || process.env.LITE_VERBOSE === "1";
}
function He(...e) {
  ru && console.error(...e);
}
var ru,
  Ft = b(() => {
    ru = process.env.LITE_VERBOSE === "1";
  });
async function yy(e = "") {
  try {
    let t = Fe__default.resolve(gs(), Fe__default.join(e, "package.json")),
      n = await he__default.readFile(t, "utf-8");
    if (n) return JSON.parse(n);
  } catch {}
  return {};
}
async function hs(e = "") {
  let t = await yy(e);
  return t
    ? { name: t.name, version: t.version ?? "unknown" }
    : { name: "unknown", version: "unknown" };
}
function gs() {
  let e = Fe__default.dirname(fileURLToPath(import.meta.url));
  return Fe__default.resolve(e, process.env.LOCAL ? "../../../" : "../../");
}
function Po() {
  return Fe__default.resolve(gs(), "dist");
}
function ys() {
  return Fe__default.relative(process.cwd(), Po());
}
async function qn(e) {
  let t = Fe__default.relative(process.cwd(), fe.config_dir);
  if (!e)
    for (let n of by) {
      let r = Fe__default.join(t, `config.${n}`);
      if (
        await he__default
          .access(r)
          .then(() => true)
          .catch(() => false)
      ) {
        e = r;
        break;
      }
    }
  return e;
}
async function Y(e) {
  if (e) {
    (await he__default
      .access(e)
      .then(() => true)
      .catch(() => false)) ||
      (console.error(Bn.default.red(`Config file not found: ${e}`)),
      process.exit(1));
    return;
  }
  (await qn()) ||
    (console.error(Bn.default.red("No project found. Run `lite init` first.")),
    process.exit(1));
}
async function wy(e) {
  let t = await qn(e);
  if (!t) return {};
  switch (
    (He(Bn.default.dim(`Using config file: ${Bn.default.cyan(`./${t}`)}`)),
    t.split(".").pop())
  ) {
    case "toml":
      return Dt(await he__default.readFile(t, "utf-8"));
    case "json":
      return JSON.parse(await he__default.readFile(t, "utf-8"));
    case "ts":
    case "mts":
    case "js":
    case "mjs":
    case "cjs":
      try {
        return (await import(Fe__default.join(process.cwd(), t))).default;
      } catch (r) {
        throw (console.error("Failed to import config file", r), r);
      }
    default:
      throw new Error(`Unsupported config file type: ${t}`);
  }
}
function Sy(e) {
  if (!e || e === ":memory:") return;
  let t = e;
  if (
    (t.startsWith("file://")
      ? (t = t.slice(7))
      : t.startsWith("file:") && (t = t.slice(5)),
    !(!t || t === ":memory:"))
  )
    return Fe__default.resolve(process.cwd(), t);
}
async function bs(e) {
  let t = await qn(e);
  t && ms(Fe__default.dirname(Fe__default.resolve(t)));
  let n = ds(await wy(e));
  if ("connection" in n) return;
  let r = n?.db?.driver;
  if (r === "postgres") return;
  let s =
    n?.db?.url ?? (r === "pglite" ? fe.default_db_dir : fe.default_db_url);
  return Sy(s);
}
var Bn,
  by,
  Se = b(() => {
    Fn();
    jt();
    Ro();
    ko();
    Bn = z(J());
    Ft();
    by = ["toml", "json", "ts", "mts", "js", "mjs", "cjs"];
  });
function No(e) {
  let t = "";
  for (let n = 0; n < e.length; n++) t += String.fromCharCode(e[n]);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function iu(e) {
  let t = new TextEncoder().encode(e),
    n = await crypto.subtle.digest("SHA-256", t);
  return new Uint8Array(n);
}
async function tn(e, t = Ey, n) {
  let r = crypto.getRandomValues(new Uint8Array(17)),
    s = `sb_${e}_`,
    i = s + No(r).slice(0, 22),
    o = No(await iu(`${t}|${i}`)).slice(0, 8),
    a = `${i}_${o}`,
    l = await _y(a),
    c = a.slice(0, s.length + 5);
  return { key: a, hash: l, prefix: c, type: e };
}
async function _y(e) {
  return No(await iu(e));
}
var Ey,
  Oo = b(() => {
    Ey = "supabase-self-hosted";
  });
function ws(e, t) {
  let n = "";
  try {
    n = as.readFileSync(e, "utf-8");
  } catch {
    n = "";
  }
  let r =
    n.length > 0
      ? n.split(`
`)
      : [];
  r.length > 0 && r[r.length - 1] === "" && r.pop();
  let s = r.filter((i) => {
    let o = i.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    return !(o && o[1] in t);
  });
  for (let [i, o] of Object.entries(t)) s.push(`${i}=${o}`);
  as.writeFileSync(
    e,
    s.join(`
`) +
      `
`,
  );
}
function ou(e, t) {
  let n;
  try {
    n = as.readFileSync(e, "utf-8");
  } catch {
    return [...t];
  }
  return t.filter(
    (r) =>
      !n
        .match(new RegExp(`^${r}=(.+)$`, "m"))?.[1]
        ?.replace(/^"(.*)"$|^'(.*)'$/, (o, a, l) => a ?? l ?? "")
        ?.trim(),
  );
}
var Io = b(() => {});
async function _s(e = {}) {
  let t = process.cwd();
  if (e.recreate) {
    console.log(jo.default.dim("Recreating database..."));
    try {
      let a = await bs();
      a &&
        as.existsSync(a) &&
        (as.rmSync(a, { recursive: !0, force: !0 }),
        console.log(
          jo.default.dim(` \u279C removed ${Fe__default.relative(t, a)}`),
        ));
    } catch {}
    try {
      as.rmSync(Fe__default.join(t, "supabase", ".temp"), {
        recursive: !0,
        force: !0,
      });
    } catch {}
  }
  ve(Fe__default.join(t, "supabase"));
  let n = await qn(),
    r = !n;
  if (!n) {
    let a = {
      api: { port: 54321 },
      db: {
        driver: "sqlite-postgres",
        url: "file:./supabase/.temp/data.db",
        migrations: { schema_paths: ["./schemas/schema.sql"] },
        seed: { sql_paths: ["./seed.sql"] },
      },
      auth: {
        enabled: true,
        jwt_secret: "dev-secret-change-me",
        jwt_expiry: 3600,
        enable_signup: true,
        publishable_key: `env(${Ss})`,
        secret_key: `env(${Es})`,
        email: { enable_confirmations: false },
      },
    };
    e.driver === "pglite" &&
      ((a.db.driver = "pglite"),
      (a.db.url = Fe__default.relative(
        process.cwd(),
        Fe__default.join(t, "supabase", ".temp", "data"),
      )));
    let l = e.configFormat ?? "toml",
      c = Fe__default.join(t, "supabase", `config.${l}`);
    l === "json" ? Ot(c, JSON.stringify(a)) : Ot(c, $o(a));
  }
  (ve(Fe__default.join(t, "supabase", ".temp")),
    ve(Fe__default.join(t, "supabase", "schemas"), () => {
      Ot(
        Fe__default.join(t, "supabase", "schemas", "schema.sql"),
        e.template
          ? xy
          : `-- This is a schema file for the database
`,
      );
    }),
    Ot(
      Fe__default.join(t, "supabase", "seed.sql"),
      e.template
        ? Ty
        : `-- This is a seed file for the database
`,
    ));
  let s = Fe__default.join(t, ".env"),
    i = ou(s, [Ss, Es]),
    o;
  if (i.length > 0) {
    let a = {};
    if (((o = {}), i.includes(Ss))) {
      let l = await tn("publishable");
      ((a[Ss] = l.key), (o.publishable = l.key));
    }
    if (i.includes(Es)) {
      let l = await tn("secret");
      ((a[Es] = l.key), (o.secret = l.key));
    }
    ws(s, a);
  }
  return { generatedKeys: o, created: r };
}
var jo,
  Ss,
  Es,
  xy,
  Ty,
  Fo = b(() => {
    Lt();
    jo = z(J());
    Fn();
    Se();
    Oo();
    Io();
    ((Ss = "SUPABASE_PUBLISHABLE_KEY"), (Es = "SUPABASE_SECRET_KEY"));
    ((xy = `
create table todos (
    id serial primary key,
    title text not null,
    description text,
    completed boolean  default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create table test (
   id serial primary key,
   name text not null
)`),
      (Ty =
        "insert into todos (`id`, `title`, `description`, `completed`) values (1, 'test', 'test', false);\ninsert into todos (`id`, `title`, `description`, `completed`) values (2, 'test2', 'test2', true);\ninsert into test (`id`, `name`) values (1, 'test');\n"));
  });
var lu = {};
pe(lu, { init: () => Cy });
var at,
  Cy,
  cu = b(() => {
    at = z(J());
    Fo();
    Cy = (e) => {
      e.command("init")
        .description("Initialize a new project")
        .helpGroup("Local Development:")
        .option("--pglite", "Use pglite as database", false)
        .option("--recreate", "Recreate everything", false)
        .option("--format", "Format to use", "toml")
        .action(async (t) => {
          let { generatedKeys: n } = await _s({
            configFormat: t.format,
            recreate: t.recreate,
            driver: t.pglite ? "pglite" : void 0,
          });
          (console.log(),
            console.log(
              at.default.green(" \u279C"),
              "Project initialized",
              at.default.cyan(
                "./" +
                  Fe__default.relative(
                    process.cwd(),
                    Fe__default.join(process.cwd(), "supabase"),
                  ),
              ),
            ),
            (n?.publishable || n?.secret) &&
              (console.error(
                at.default.green(" \u279C"),
                "Generated API keys, written to",
                at.default.cyan("./.env"),
              ),
              n.publishable &&
                console.log(
                  at.default.green(" \u279C"),
                  "Publishable key".padEnd(19),
                  at.default.cyan(n.publishable),
                ),
              n.secret &&
                console.log(
                  at.default.green(" \u279C"),
                  "Secret key".padEnd(19),
                  at.default.cyan(n.secret),
                )));
        });
    };
  });
function de(e) {
  return `${Ay} ${e}`;
}
var Ay,
  tt = b(() => {
    Ay = "[lite]";
  });
var uu = {};
pe(uu, { generateKeys: () => ky });
var Mo,
  Ry,
  vy,
  ky,
  pu = b(() => {
    Mo = z(J());
    tt();
    Oo();
    Io();
    ((Ry = "SUPABASE_PUBLISHABLE_KEY"),
      (vy = "SUPABASE_SECRET_KEY"),
      (ky = (e) => {
        e.command("generate-keys")
          .description(de("Generate a new publishable/secret API key pair"))
          .helpGroup("Local Development:")
          .action(async () => {
            let [t, n] = await Promise.all([tn("publishable"), tn("secret")]),
              r = Fe__default.join(process.cwd(), ".env");
            (ws(r, { [Ry]: t.key, [vy]: n.key }),
              console.error(
                Mo.default.green(" \u279C"),
                "Wrote new API keys to",
                Mo.default.cyan("./.env"),
              ),
              console.log(t.key),
              console.log(n.key));
          });
      }));
  });
var fu = b(() => {});
var mu = b(() => {});
function Uo(e, t, n = void 0) {
  let r = typeof t == "string" ? t.split(/[.[\]"]+/).filter((s) => s) : t;
  if (r.length === 0) return e;
  try {
    let [s, ...i] = r;
    return !s || !(s in e) ? n : Uo(e[s], i, n);
  } catch {
    if (typeof n < "u") return n;
    throw new Error(`Invalid path: ${r.join(".")}`);
  }
}
var du = b(() => {});
var hu = b(() => {});
function xs() {
  try {
    return !Hn() && global?.process?.release?.name === "node";
  } catch {
    return false;
  }
}
function Hn() {
  try {
    return typeof Bun < "u";
  } catch {
    return false;
  }
}
async function Ts(e, t) {
  let n = performance.now();
  await e();
  let r = performance.now();
  t(r - n);
}
var gu = b(() => {});
function bu(e, t = {}) {
  return e
    .split(
      `
`,
    )
    .map((n) => n.trim())
    .filter((n) => n.length > 0)
    .filter((n) => !n.startsWith(t.comments ?? "--")).join(`
`);
}
function nt(e) {
  let t = [],
    n = "",
    r = 0,
    s = e.length,
    i = false,
    o = false,
    a = 0,
    l = /^create(\s+or\s+replace)?(\s+temp(orary)?)?$/i,
    c = (u) => {
      yu(u).length > 0 && t.push(u.trim());
    },
    p = () => {
      ((i = false), (o = false), (a = 0));
    };
  for (; r < s; ) {
    let u = e[r],
      f = e[r + 1];
    if (u === "-" && f === "-") {
      for (
        ;
        r < s &&
        e[r] !==
          `
`;

      )
        ((n += e[r]), r++);
      continue;
    }
    if (u === "/" && f === "*") {
      for (n += "/*", r += 2; r < s && !(e[r] === "*" && e[r + 1] === "/"); )
        ((n += e[r]), r++);
      r < s && ((n += "*/"), (r += 2));
      continue;
    }
    if (u === "'") {
      for (n += u, r++; r < s; ) {
        if (e[r] === "'" && e[r + 1] === "'") {
          ((n += "''"), (r += 2));
          continue;
        }
        if (((n += e[r]), e[r] === "'")) {
          r++;
          break;
        }
        r++;
      }
      continue;
    }
    if (u === '"') {
      for (n += u, r++; r < s; ) {
        if (e[r] === '"' && e[r + 1] === '"') {
          ((n += '""'), (r += 2));
          continue;
        }
        if (((n += e[r]), e[r] === '"')) {
          r++;
          break;
        }
        r++;
      }
      continue;
    }
    if (u === "$") {
      let h = e.indexOf("$", r + 1);
      if (h !== -1) {
        let m = e.slice(r, h + 1);
        if (/^\$[A-Za-z_][A-Za-z0-9_]*\$$|^\$\$$/.test(m)) {
          ((n += m), (r = h + 1));
          let g = e.indexOf(m, r);
          g === -1
            ? ((n += e.slice(r)), (r = s))
            : ((n += e.slice(r, g + m.length)), (r = g + m.length));
          continue;
        }
      }
    }
    if (/[A-Za-z_]/.test(u)) {
      let h = r;
      for (; h < s && /[A-Za-z0-9_]/.test(e[h]); ) h++;
      let m = e.slice(r, h),
        d = m.toLowerCase();
      if (
        (d === "trigger" && l.test(yu(n))
          ? (i = true)
          : i && d === "begin"
            ? ((o = true), a++)
            : i && o && d === "case"
              ? a++
              : i && o && d === "end" && a > 0 && a--,
        (n += m),
        (r = h),
        i && o && a === 0)
      ) {
        let g = r;
        for (; g < s && /\s/.test(e[g]); ) g++;
        (e[g] === ";" && (r = g + 1), c(n), (n = ""), p());
      }
      continue;
    }
    if (u === ";") {
      if (i && o && a > 0) {
        ((n += u), r++);
        continue;
      }
      (c(n), (n = ""), p(), r++);
      continue;
    }
    ((n += u), r++);
  }
  return (c(n), t);
}
function yu(e) {
  let t = "",
    n = 0,
    r = e.length;
  for (; n < r; ) {
    let s = e[n],
      i = e[n + 1];
    if (s === "-" && i === "-") {
      for (
        ;
        n < r &&
        e[n] !==
          `
`;

      )
        n++;
      continue;
    }
    if (s === "/" && i === "*") {
      for (n += 2; n < r && !(e[n] === "*" && e[n + 1] === "/"); ) n++;
      n += 2;
      continue;
    }
    ((t += s), n++);
  }
  return t.trim();
}
function qo(e) {
  return (e ?? "").trim().toLowerCase();
}
function wu(e, t) {
  let n = t.toLowerCase();
  return e.startsWith("'")
    ? n.includes("text") || n.includes("char") || n.includes("clob")
    : /^-?\d+$/.test(e)
      ? n.includes("int")
      : n.includes("real") ||
        n.includes("floa") ||
        n.includes("doub") ||
        n.includes("num") ||
        n.includes("dec");
}
function Cs(e) {
  let t = (e ?? "").replace(/\s+/g, " ").replace(/"/g, "").trim().toLowerCase(),
    n;
  do ((n = t), (t = t.replace(Py, (r, s, i) => (wu(s, i) ? s : r))));
  while (t !== n);
  do ((n = t), (t = t.replace(Ny, "$1")));
  while (t !== n);
  return t;
}
function Iy(e, t, n) {
  let r = 0;
  for (let s = t; s < e.length; s++) {
    let i = e[s];
    if (i === "'") {
      for (s++; s < e.length; ) {
        if (e[s] === "'" && e[s + 1] === "'") {
          s += 2;
          continue;
        }
        if (e[s] === "'") break;
        s++;
      }
      continue;
    }
    if ((i === "(" ? r++ : i === ")" && r--, r !== 0)) continue;
    let o = e[s - 1];
    if (!(o && /[a-z0-9_]/.test(o)))
      for (let a of n) {
        if (e.slice(s, s + a.length) !== a) continue;
        let l = e[s + a.length];
        if (!(l && /[a-z0-9_]/.test(l))) return { index: s, kw: a };
      }
  }
  return null;
}
function Dy(e) {
  let t = [],
    n = 0;
  for (;;) {
    let c = Iy(e, n, Ly);
    if (!c) break;
    (t.push(c), (n = c.index + c.kw.length));
  }
  if (t.length === 0) return { head: e, checks: [], uniques: [] };
  let r = e.slice(0, t[0].index).trim(),
    s = r.split(/\s+/)[0] ?? "",
    i = [],
    o = [],
    a = 0;
  for (let c = 0; c < t.length; c++) {
    let p = t[c].index,
      u = c + 1 < t.length ? t[c + 1].index : e.length,
      f = e.slice(p, u).trim();
    t[c].kw === "check"
      ? o.push(f)
      : t[c].kw === "unique" && !f.includes("(")
        ? a++
        : i.push(f);
  }
  i.sort();
  let l = s ? Array(a).fill(`unique (${s})`) : [];
  return { head: [r, ...i].join(" ").trim(), checks: o, uniques: l };
}
function Ho(e) {
  let t = Cs(e),
    n = t.indexOf("(");
  if (n === -1) return null;
  let r = Bo(t, n);
  if (r === -1) return null;
  let s = t.slice(n + 1, r),
    i = t
      .slice(r + 1)
      .replace(/\s+/g, " ")
      .trim(),
    o = [];
  (/\bstrict\b/.test(i) && o.push("strict"),
    /\bwithout\s+rowid\b/.test(i) && o.push("without rowid"));
  let a = [],
    l = 0,
    c = "";
  for (let u = 0; u < s.length; u++) {
    let f = s[u];
    if (f === "'") {
      for (c += f, u++; u < s.length; ) {
        if (s[u] === "'" && s[u + 1] === "'") {
          ((c += "''"), (u += 2));
          continue;
        }
        if (((c += s[u]), s[u] === "'")) break;
        u++;
      }
      continue;
    }
    if ((f === "(" ? l++ : f === ")" && l--, f === "," && l === 0)) {
      (a.push(c.trim()), (c = ""));
      continue;
    }
    c += f;
  }
  c.trim().length > 0 && a.push(c.trim());
  let p = [];
  for (let u of a) {
    let f = u.replace(Oy, "");
    if (/^(primary key|unique|check|foreign key)\b/i.test(f)) {
      p.push(f);
      continue;
    }
    let { head: h, checks: m, uniques: d } = Dy(f);
    p.push(h, ...m, ...d);
  }
  return (o.length > 0 && p.push(`table options: ${o.join(", ")}`), p);
}
function Bo(e, t) {
  let n = 0;
  for (let r = t; r < e.length; r++) {
    let s = e[r];
    if (s === "'") {
      for (r++; r < e.length; ) {
        if (e[r] === "'" && e[r + 1] === "'") {
          r += 2;
          continue;
        }
        if (e[r] === "'") break;
        r++;
      }
      continue;
    }
    if (s === "(") n++;
    else if (s === ")" && (n--, n === 0)) return r;
  }
  return -1;
}
function jy(e) {
  let t = 0,
    n = -1;
  for (let r = 0; r < e.length; r++) {
    let s = e[r];
    if (s === "'") {
      for (r++; r < e.length; ) {
        if (e[r] === "'" && e[r + 1] === "'") {
          r += 2;
          continue;
        }
        if (e[r] === "'") break;
        r++;
      }
      continue;
    }
    s === "("
      ? t++
      : s === ")"
        ? t--
        : t === 0 && /^\s+as\s/i.test(e.slice(r)) && (n = r);
  }
  return n;
}
function Fy(e) {
  return (
    (e.startsWith("'") && e.endsWith("'") && e.length >= 2) ||
    /^-?\d+(\.\d+)?$/.test(e)
  );
}
function Su(e) {
  let t = e.trim();
  for (;;) {
    if (t.startsWith("(") && Bo(t, 0) === t.length - 1) {
      t = t.slice(1, -1).trim();
      continue;
    }
    if (/^cast\s*\(/i.test(t)) {
      let n = t.indexOf("(");
      if (Bo(t, n) === t.length - 1) {
        let r = t.slice(n + 1, -1),
          s = jy(r);
        if (s !== -1) {
          let i = r.slice(0, s).trim(),
            o = r
              .slice(s)
              .replace(/^\s+as\s+/i, "")
              .trim(),
            a = Su(i);
          if (Fy(a) && wu(a, o)) {
            t = a;
            continue;
          }
        }
      }
    }
    break;
  }
  return t;
}
function Go(e) {
  if (e == null) return null;
  let t = Su(e);
  if (t.startsWith("'") && t.endsWith("'") && t.length >= 2) {
    let n = t.slice(1, -1);
    /(?<!')'(?!')/.test(n) || (t = n);
  } else if (t.startsWith('"') && t.endsWith('"') && t.length >= 2) {
    let n = t.slice(1, -1);
    n.includes('"') || (t = n);
  }
  return t;
}
var Py,
  Ny,
  Oy,
  Ly,
  _t = b(() => {
    ((Py =
      /\bcast\s*\(\s*('(?:[^']|'')*'|-?\d+(?:\.\d+)?)\s+as\s+([a-z][a-z0-9 ]*)\)/g),
      (Ny = /\(\s*('(?:[^']|'')*'|-?\d+(?:\.\d+)?)\s*\)/g));
    ((Oy =
      /\bconstraint\s+\S+\s+(?=(primary key|unique|check|foreign key|references)\b)/gi),
      (Ly = [
        "generated always as",
        "not null",
        "primary key",
        "foreign key",
        "references",
        "default",
        "unique",
        "check",
        "collate",
        "null",
      ]));
  });
function Eu(e, t) {
  if (typeof e != "string") {
    throw new Error("Email must be a string");
  }
  if (!s.string({ format: "email" }).validate(e).valid) {
    throw new Error("Invalid email");
  }
  if (t?.domains?.length && !t.domains.includes(e.split("@")[1])) {
    throw new Error("Email domain not allowed");
  }
  return true;
}
function _u(
  e,
  { panic: t = true, length: n = 8, numbers: r = 0, special: s = 0 } = {},
) {
  try {
    if (typeof e != "string") {
      if (t) throw new Error("Password must be a string");
      return !1;
    }
    if (e.length < n) {
      if (t) throw new Error(`Password must be at least ${n} characters long`);
      return !1;
    }
    if ((e.match(/[0-9]/g)?.length ?? 0) < r) {
      if (t) throw new Error(`Password must contain at least ${r} numbers`);
      return !1;
    }
    if ((e.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g)?.length ?? 0) < s) {
      if (t)
        throw new Error(
          `Password must contain at least ${s} special characters`,
        );
      return !1;
    }
    return !0;
  } catch (i) {
    if (t) throw i;
    return false;
  }
}
function B(e, t = '"') {
  return `${t}${e}${t}`;
}
function xu(e, t, n) {
  if (t instanceof RegExp) return t.test(e);
  if (typeof t == "string")
    switch ((!n && t.startsWith("/") && (n = "regex"), n)) {
      case "regex":
        return new RegExp(t).test(e);
      case "sql":
        return new RegExp(t.replace("%", ".*").replace("_", ".")).test(e);
      case "wildcard":
        return new RegExp(t.replace("*", ".*")).test(e);
      default:
        return e.includes(t);
    }
  return false;
}
var Gn = b(() => {});
function Wo(e) {
  return typeof e == "number" ? e : Number.parseInt(String(e), 10);
}
var Tu = b(() => {});
var Cu = b(() => {});
function Uy(e) {
  let t = e.trim().toLowerCase();
  if (
    (t.startsWith("[") && t.endsWith("]") && (t = t.slice(1, -1)),
    (t = t.split("%")[0]),
    t === "::1")
  )
    return true;
  t.startsWith("::ffff:") && (t = t.slice(7));
  let n = t.split(".");
  return (
    n.length === 4 &&
    n.every((r) => /^\d{1,3}$/.test(r) && Number(r) <= 255) &&
    Number(n[0]) === 127
  );
}
function Au(e) {
  let t = e.trim().toLowerCase();
  return t === "localhost" || Uy(t);
}
var Vo = b(() => {});
var lt = b(() => {
  fu();
  mu();
  du();
  hu();
  gu();
  _t();
  Gn();
  Tu();
  Cu();
  Vo();
});
var Ko,
  $u = b(() => {
    Ko = (e, t, n) => (r, s) => {
      let i = -1;
      return o(0);
      async function o(a) {
        if (a <= i) throw new Error("next() called multiple times");
        i = a;
        let l,
          c = false,
          p;
        if (
          (e[a]
            ? ((p = e[a][0][0]), (r.req.routeIndex = a))
            : (p = (a === e.length && s) || void 0),
          p)
        )
          try {
            l = await p(r, () => o(a + 1));
          } catch (u) {
            if (u instanceof Error && t)
              ((r.error = u), (l = await t(u, r)), (c = true));
            else throw u;
          }
        else r.finalized === false && n && (l = await n(r));
        return (l && (r.finalized === false || c) && (r.res = l), r);
      }
    };
  });
var Ru = b(() => {});
var vu,
  ku = b(() => {
    vu = Symbol();
  });
async function By(e, t) {
  let n = await e.formData();
  return n ? qy(n, t) : {};
}
function qy(e, t) {
  let n = Object.create(null);
  return (
    e.forEach((r, s) => {
      t.all || s.endsWith("[]") ? Hy(n, s, r) : (n[s] = r);
    }),
    t.dot &&
      Object.entries(n).forEach(([r, s]) => {
        r.includes(".") && (Gy(n, r, s), delete n[r]);
      }),
    n
  );
}
var Pu,
  Hy,
  Gy,
  Nu = b(() => {
    zo();
    Pu = async (e, t = Object.create(null)) => {
      let { all: n = false, dot: r = false } = t,
        i = (e instanceof As ? e.raw.headers : e.headers).get("Content-Type");
      return i?.startsWith("multipart/form-data") ||
        i?.startsWith("application/x-www-form-urlencoded")
        ? By(e, { all: n, dot: r })
        : {};
    };
    ((Hy = (e, t, n) => {
      e[t] !== void 0
        ? Array.isArray(e[t])
          ? e[t].push(n)
          : (e[t] = [e[t], n])
        : t.endsWith("[]")
          ? (e[t] = [n])
          : (e[t] = n);
    }),
      (Gy = (e, t, n) => {
        let r = e,
          s = t.split(".");
        s.forEach((i, o) => {
          o === s.length - 1
            ? (r[i] = n)
            : ((!r[i] ||
                typeof r[i] != "object" ||
                Array.isArray(r[i]) ||
                r[i] instanceof File) &&
                (r[i] = Object.create(null)),
              (r = r[i]));
        });
      }));
  });
var Jo,
  Ou,
  Wy,
  Vy,
  $s,
  Lu,
  Rs,
  Ky,
  Yo,
  Iu,
  Mt,
  vs,
  Xo,
  Du,
  ju,
  Fu,
  Qo,
  nn = b(() => {
    ((Jo = (e) => {
      let t = e.split("/");
      return (t[0] === "" && t.shift(), t);
    }),
      (Ou = (e) => {
        let { groups: t, path: n } = Wy(e),
          r = Jo(n);
        return Vy(r, t);
      }),
      (Wy = (e) => {
        let t = [];
        return (
          (e = e.replace(/\{[^}]+\}/g, (n, r) => {
            let s = `@${r}`;
            return (t.push([s, n]), s);
          })),
          { groups: t, path: e }
        );
      }),
      (Vy = (e, t) => {
        for (let n = t.length - 1; n >= 0; n--) {
          let [r] = t[n];
          for (let s = e.length - 1; s >= 0; s--)
            if (e[s].includes(r)) {
              e[s] = e[s].replace(r, t[n][1]);
              break;
            }
        }
        return e;
      }),
      ($s = {}),
      (Lu = (e, t) => {
        if (e === "*") return "*";
        let n = e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
        if (n) {
          let r = `${e}#${t}`;
          return (
            $s[r] ||
              (n[2]
                ? ($s[r] =
                    t && t[0] !== ":" && t[0] !== "*"
                      ? [r, n[1], new RegExp(`^${n[2]}(?=/${t})`)]
                      : [e, n[1], new RegExp(`^${n[2]}$`)])
                : ($s[r] = [e, n[1], true])),
            $s[r]
          );
        }
        return null;
      }),
      (Rs = (e, t) => {
        try {
          return t(e);
        } catch {
          return e.replace(/(?:%[0-9A-Fa-f]{2})+/g, (n) => {
            try {
              return t(n);
            } catch {
              return n;
            }
          });
        }
      }),
      (Ky = (e) => Rs(e, decodeURI)),
      (Yo = (e) => {
        let t = e.url,
          n = t.indexOf("/", t.indexOf(":") + 4),
          r = n;
        for (; r < t.length; r++) {
          let s = t.charCodeAt(r);
          if (s === 37) {
            let i = t.indexOf("?", r),
              o = t.indexOf("#", r),
              a =
                i === -1
                  ? o === -1
                    ? void 0
                    : o
                  : o === -1
                    ? i
                    : Math.min(i, o),
              l = t.slice(n, a);
            return Ky(l.includes("%25") ? l.replace(/%25/g, "%2525") : l);
          } else if (s === 63 || s === 35) break;
        }
        return t.slice(n, r);
      }),
      (Iu = (e) => {
        let t = Yo(e);
        return t.length > 1 && t.at(-1) === "/" ? t.slice(0, -1) : t;
      }),
      (Mt = (e, t, ...n) => (
        n.length && (t = Mt(t, ...n)),
        `${e?.[0] === "/" ? "" : "/"}${e}${t === "/" ? "" : `${e?.at(-1) === "/" ? "" : "/"}${t?.[0] === "/" ? t.slice(1) : t}`}`
      )),
      (vs = (e) => {
        if (e.charCodeAt(e.length - 1) !== 63 || !e.includes(":")) return null;
        let t = e.split("/"),
          n = [],
          r = "";
        return (
          t.forEach((s) => {
            if (s !== "" && !/\:/.test(s)) r += "/" + s;
            else if (/\:/.test(s))
              if (/\?/.test(s)) {
                n.length === 0 && r === "" ? n.push("/") : n.push(r);
                let i = s.replace("?", "");
                ((r += "/" + i), n.push(r));
              } else r += "/" + s;
          }),
          n.filter((s, i, o) => o.indexOf(s) === i)
        );
      }),
      (Xo = (e) =>
        /[%+]/.test(e)
          ? (e.indexOf("+") !== -1 && (e = e.replace(/\+/g, " ")),
            e.indexOf("%") !== -1 ? Rs(e, Qo) : e)
          : e),
      (Du = (e, t, n) => {
        let r;
        if (!n && t && !/[%+]/.test(t)) {
          let o = e.indexOf("?", 8);
          if (o === -1) return;
          for (
            e.startsWith(t, o + 1) || (o = e.indexOf(`&${t}`, o + 1));
            o !== -1;

          ) {
            let a = e.charCodeAt(o + t.length + 1);
            if (a === 61) {
              let l = o + t.length + 2,
                c = e.indexOf("&", l);
              return Xo(e.slice(l, c === -1 ? void 0 : c));
            } else if (a == 38 || isNaN(a)) return "";
            o = e.indexOf(`&${t}`, o + 1);
          }
          if (((r = /[%+]/.test(e)), !r)) return;
        }
        let s = {};
        r ??= /[%+]/.test(e);
        let i = e.indexOf("?", 8);
        for (; i !== -1; ) {
          let o = e.indexOf("&", i + 1),
            a = e.indexOf("=", i);
          a > o && o !== -1 && (a = -1);
          let l = e.slice(i + 1, a === -1 ? (o === -1 ? void 0 : o) : a);
          if ((r && (l = Xo(l)), (i = o), l === "")) continue;
          let c;
          (a === -1
            ? (c = "")
            : ((c = e.slice(a + 1, o === -1 ? void 0 : o)), r && (c = Xo(c))),
            n
              ? ((s[l] && Array.isArray(s[l])) || (s[l] = []), s[l].push(c))
              : (s[l] ??= c));
        }
        return t ? s[t] : s;
      }),
      (ju = Du),
      (Fu = (e, t) => Du(e, t, true)),
      (Qo = decodeURIComponent));
  });
var Mu,
  As,
  zo = b(() => {
    Ru();
    ku();
    Nu();
    nn();
    ((Mu = (e) => Rs(e, Qo)),
      (As = class {
        raw;
        #e;
        #t;
        routeIndex = 0;
        path;
        bodyCache = {};
        constructor(e, t = "/", n = [[]]) {
          ((this.raw = e), (this.path = t), (this.#t = n), (this.#e = {}));
        }
        param(e) {
          return e ? this.#n(e) : this.#i();
        }
        #n(e) {
          let t = this.#t[0][this.routeIndex][1][e],
            n = this.#s(t);
          return n && /\%/.test(n) ? Mu(n) : n;
        }
        #i() {
          let e = {},
            t = Object.keys(this.#t[0][this.routeIndex][1]);
          for (let n of t) {
            let r = this.#s(this.#t[0][this.routeIndex][1][n]);
            r !== void 0 && (e[n] = /\%/.test(r) ? Mu(r) : r);
          }
          return e;
        }
        #s(e) {
          return this.#t[1] ? this.#t[1][e] : e;
        }
        query(e) {
          return ju(this.url, e);
        }
        queries(e) {
          return Fu(this.url, e);
        }
        header(e) {
          if (e) return this.raw.headers.get(e) ?? void 0;
          let t = {};
          return (
            this.raw.headers.forEach((n, r) => {
              t[r] = n;
            }),
            t
          );
        }
        async parseBody(e) {
          return (this.bodyCache.parsedBody ??= await Pu(this, e));
        }
        #r = (e) => {
          let { bodyCache: t, raw: n } = this,
            r = t[e];
          if (r) return r;
          let s = Object.keys(t)[0];
          return s
            ? t[s].then(
                (i) => (
                  s === "json" && (i = JSON.stringify(i)),
                  new Response(i)[e]()
                ),
              )
            : (t[e] = n[e]());
        };
        json() {
          return this.#r("text").then((e) => JSON.parse(e));
        }
        text() {
          return this.#r("text");
        }
        arrayBuffer() {
          return this.#r("arrayBuffer");
        }
        blob() {
          return this.#r("blob");
        }
        formData() {
          return this.#r("formData");
        }
        addValidatedData(e, t) {
          this.#e[e] = t;
        }
        valid(e) {
          return this.#e[e];
        }
        get url() {
          return this.raw.url;
        }
        get method() {
          return this.raw.method;
        }
        get [vu]() {
          return this.#t;
        }
        get matchedRoutes() {
          return this.#t[0].map(([[, e]]) => e);
        }
        get routePath() {
          return this.#t[0].map(([[, e]]) => e)[this.routeIndex].path;
        }
      }));
  });
var Uu,
  Bu,
  Zo,
  ea = b(() => {
    ((Uu = { Stringify: 1, BeforeStream: 2, Stream: 3 }),
      (Bu = (e, t) => {
        let n = new String(e);
        return ((n.isEscaped = true), (n.callbacks = t), n);
      }),
      (Zo = async (e, t, n, r, s) => {
        typeof e == "object" &&
          !(e instanceof String) &&
          (e instanceof Promise || (e = e.toString()),
          e instanceof Promise && (e = await e));
        let i = e.callbacks;
        if (!i?.length) return Promise.resolve(e);
        s ? (s[0] += e) : (s = [e]);
        let o = Promise.all(
          i.map((a) => a({ phase: t, buffer: s, context: r })),
        ).then((a) =>
          Promise.all(a.filter(Boolean).map((l) => Zo(l, t, false, r, s))).then(
            () => s[0],
          ),
        );
        return n ? Bu(await o, i) : o;
      }));
  });
var zy,
  ta,
  Wn,
  qu,
  Hu = b(() => {
    zo();
    ea();
    ((zy = "text/plain; charset=UTF-8"),
      (ta = (e, t) => ({ "Content-Type": e, ...t })),
      (Wn = (e, t) => new Response(e, t)),
      (qu = class {
        #e;
        #t;
        env = {};
        #n;
        finalized = false;
        error;
        #i;
        #s;
        #r;
        #u;
        #l;
        #c;
        #a;
        #p;
        #f;
        constructor(e, t) {
          ((this.#e = e),
            t &&
              ((this.#s = t.executionCtx),
              (this.env = t.env),
              (this.#c = t.notFoundHandler),
              (this.#f = t.path),
              (this.#p = t.matchResult)));
        }
        get req() {
          return ((this.#t ??= new As(this.#e, this.#f, this.#p)), this.#t);
        }
        get event() {
          if (this.#s && "respondWith" in this.#s) return this.#s;
          throw Error("This context has no FetchEvent");
        }
        get executionCtx() {
          if (this.#s) return this.#s;
          throw Error("This context has no ExecutionContext");
        }
        get res() {
          return (this.#r ||= Wn(null, {
            headers: (this.#a ??= new Headers()),
          }));
        }
        set res(e) {
          if (this.#r && e) {
            e = Wn(e.body, e);
            for (let [t, n] of this.#r.headers.entries())
              if (t !== "content-type")
                if (t === "set-cookie") {
                  let r = this.#r.headers.getSetCookie();
                  e.headers.delete("set-cookie");
                  for (let s of r) e.headers.append("set-cookie", s);
                } else e.headers.set(t, n);
          }
          ((this.#r = e), (this.finalized = true));
        }
        render = (...e) => ((this.#l ??= (t) => this.html(t)), this.#l(...e));
        setLayout = (e) => (this.#u = e);
        getLayout = () => this.#u;
        setRenderer = (e) => {
          this.#l = e;
        };
        header = (e, t, n) => {
          this.finalized && (this.#r = Wn(this.#r.body, this.#r));
          let r = this.#r ? this.#r.headers : (this.#a ??= new Headers());
          t === void 0 ? r.delete(e) : n?.append ? r.append(e, t) : r.set(e, t);
        };
        status = (e) => {
          this.#i = e;
        };
        set = (e, t) => {
          ((this.#n ??= new Map()), this.#n.set(e, t));
        };
        get = (e) => (this.#n ? this.#n.get(e) : void 0);
        get var() {
          return this.#n ? Object.fromEntries(this.#n) : {};
        }
        #o(e, t, n) {
          let r = this.#r
            ? new Headers(this.#r.headers)
            : (this.#a ?? new Headers());
          if (typeof t == "object" && "headers" in t) {
            let i =
              t.headers instanceof Headers ? t.headers : new Headers(t.headers);
            for (let [o, a] of i)
              o.toLowerCase() === "set-cookie" ? r.append(o, a) : r.set(o, a);
          }
          if (n)
            for (let [i, o] of Object.entries(n))
              if (typeof o == "string") r.set(i, o);
              else {
                r.delete(i);
                for (let a of o) r.append(i, a);
              }
          let s = typeof t == "number" ? t : (t?.status ?? this.#i);
          return Wn(e, { status: s, headers: r });
        }
        newResponse = (...e) => this.#o(...e);
        body = (e, t, n) => this.#o(e, t, n);
        text = (e, t, n) =>
          !this.#a && !this.#i && !t && !n && !this.finalized
            ? new Response(e)
            : this.#o(e, t, ta(zy, n));
        json = (e, t, n) =>
          this.#o(JSON.stringify(e), t, ta("application/json", n));
        html = (e, t, n) => {
          let r = (s) => this.#o(s, t, ta("text/html; charset=UTF-8", n));
          return typeof e == "object"
            ? Zo(e, Uu.Stringify, false, {}).then(r)
            : r(e);
        };
        redirect = (e, t) => {
          let n = String(e);
          return (
            this.header("Location", /[^\x00-\xFF]/.test(n) ? encodeURI(n) : n),
            this.newResponse(null, t ?? 302)
          );
        };
        notFound = () => ((this.#c ??= () => Wn()), this.#c(this));
      }));
  });
var ie,
  Gu,
  Wu,
  ks,
  Ps,
  xt = b(() => {
    ((ie = "ALL"),
      (Gu = "all"),
      (Wu = ["get", "post", "put", "delete", "options", "patch"]),
      (ks = "Can not add a route since the matcher is already built."),
      (Ps = class extends Error {}));
  });
var Vn,
  na = b(() => {
    Vn = "__COMPOSED_HANDLER";
  });
var Xy,
  Vu,
  Ku,
  Xu = b(() => {
    $u();
    Hu();
    xt();
    na();
    nn();
    ((Xy = (e) => e.text("404 Not Found", 404)),
      (Vu = (e, t) => {
        if ("getResponse" in e) {
          let n = e.getResponse();
          return t.newResponse(n.body, n);
        }
        return (console.error(e), t.text("Internal Server Error", 500));
      }),
      (Ku = class zu {
        get;
        post;
        put;
        delete;
        options;
        patch;
        all;
        on;
        use;
        router;
        getPath;
        _basePath = "/";
        #e = "/";
        routes = [];
        constructor(t = {}) {
          ([...Wu, Gu].forEach((i) => {
            this[i] = (o, ...a) => (
              typeof o == "string" ? (this.#e = o) : this.#i(i, this.#e, o),
              a.forEach((l) => {
                this.#i(i, this.#e, l);
              }),
              this
            );
          }),
            (this.on = (i, o, ...a) => {
              for (let l of [o].flat()) {
                this.#e = l;
                for (let c of [i].flat())
                  a.map((p) => {
                    this.#i(c.toUpperCase(), this.#e, p);
                  });
              }
              return this;
            }),
            (this.use = (i, ...o) => (
              typeof i == "string"
                ? (this.#e = i)
                : ((this.#e = "*"), o.unshift(i)),
              o.forEach((a) => {
                this.#i(ie, this.#e, a);
              }),
              this
            )));
          let { strict: r, ...s } = t;
          (Object.assign(this, s),
            (this.getPath = (r ?? true) ? (t.getPath ?? Yo) : Iu));
        }
        #t() {
          let t = new zu({ router: this.router, getPath: this.getPath });
          return (
            (t.errorHandler = this.errorHandler),
            (t.#n = this.#n),
            (t.routes = this.routes),
            t
          );
        }
        #n = Xy;
        errorHandler = Vu;
        route(t, n) {
          let r = this.basePath(t);
          return (
            n.routes.map((s) => {
              let i;
              (n.errorHandler === Vu
                ? (i = s.handler)
                : ((i = async (o, a) =>
                    (await Ko([], n.errorHandler)(o, () => s.handler(o, a)))
                      .res),
                  (i[Vn] = s.handler)),
                r.#i(s.method, s.path, i));
            }),
            this
          );
        }
        basePath(t) {
          let n = this.#t();
          return ((n._basePath = Mt(this._basePath, t)), n);
        }
        onError = (t) => ((this.errorHandler = t), this);
        notFound = (t) => ((this.#n = t), this);
        mount(t, n, r) {
          let s, i;
          r &&
            (typeof r == "function"
              ? (i = r)
              : ((i = r.optionHandler),
                r.replaceRequest === false
                  ? (s = (l) => l)
                  : (s = r.replaceRequest)));
          let o = i
            ? (l) => {
                let c = i(l);
                return Array.isArray(c) ? c : [c];
              }
            : (l) => {
                let c;
                try {
                  c = l.executionCtx;
                } catch {}
                return [l.env, c];
              };
          s ||= (() => {
            let l = Mt(this._basePath, t),
              c = l === "/" ? 0 : l.length;
            return (p) => {
              let u = new URL(p.url);
              return (
                (u.pathname = u.pathname.slice(c) || "/"),
                new Request(u, p)
              );
            };
          })();
          let a = async (l, c) => {
            let p = await n(s(l.req.raw), ...o(l));
            if (p) return p;
            await c();
          };
          return (this.#i(ie, Mt(t, "*"), a), this);
        }
        #i(t, n, r) {
          ((t = t.toUpperCase()), (n = Mt(this._basePath, n)));
          let s = { basePath: this._basePath, path: n, method: t, handler: r };
          (this.router.add(t, n, [r, s]), this.routes.push(s));
        }
        #s(t, n) {
          if (t instanceof Error) return this.errorHandler(t, n);
          throw t;
        }
        #r(t, n, r, s) {
          if (s === "HEAD")
            return (async () =>
              new Response(null, await this.#r(t, n, r, "GET")))();
          let i = this.getPath(t, { env: r }),
            o = this.router.match(s, i),
            a = new qu(t, {
              path: i,
              matchResult: o,
              env: r,
              executionCtx: n,
              notFoundHandler: this.#n,
            });
          if (o[0].length === 1) {
            let c;
            try {
              c = o[0][0][0][0](a, async () => {
                a.res = await this.#n(a);
              });
            } catch (p) {
              return this.#s(p, a);
            }
            return c instanceof Promise
              ? c
                  .then((p) => p || (a.finalized ? a.res : this.#n(a)))
                  .catch((p) => this.#s(p, a))
              : (c ?? this.#n(a));
          }
          let l = Ko(o[0], this.errorHandler, this.#n);
          return (async () => {
            try {
              let c = await l(a);
              if (!c.finalized)
                throw new Error(
                  "Context is not finalized. Did you forget to return a Response object or `await next()`?",
                );
              return c.res;
            } catch (c) {
              return this.#s(c, a);
            }
          })();
        }
        fetch = (t, ...n) => this.#r(t, n[1], n[0], t.method);
        request = (t, n, r, s) =>
          t instanceof Request
            ? this.fetch(n ? new Request(t, n) : t, r, s)
            : ((t = t.toString()),
              this.fetch(
                new Request(
                  /^https?:\/\//.test(t) ? t : `http://localhost${Mt("/", t)}`,
                  n,
                ),
                r,
                s,
              ));
        fire = () => {
          addEventListener("fetch", (t) => {
            t.respondWith(this.#r(t.request, t, void 0, t.request.method));
          });
        };
      }));
  });
function ra(e, t) {
  let n = this.buildAllMatchers(),
    r = (s, i) => {
      let o = n[s] || n[ie],
        a = o[2][i];
      if (a) return a;
      let l = i.match(o[0]);
      if (!l) return [[], Ns];
      let c = l.indexOf("", 1);
      return [o[1][c], l];
    };
  return ((this.match = r), r(e, t));
}
var Ns,
  sa = b(() => {
    xt();
    Ns = [];
  });
function Yy(e, t) {
  return e.length === 1
    ? t.length === 1
      ? e < t
        ? -1
        : 1
      : -1
    : t.length === 1 || e === Kn || e === zn
      ? 1
      : t === Kn || t === zn
        ? -1
        : e === Os
          ? 1
          : t === Os
            ? -1
            : e.length === t.length
              ? e < t
                ? -1
                : 1
              : t.length - e.length;
}
var Os,
  Kn,
  zn,
  Ut,
  Jy,
  Ju,
  oa = b(() => {
    ((Os = "[^/]+"),
      (Kn = ".*"),
      (zn = "(?:|/.*)"),
      (Ut = Symbol()),
      (Jy = new Set(".\\+*[^]$()")));
    Ju = class ia {
      #e;
      #t;
      #n = Object.create(null);
      insert(t, n, r, s, i) {
        if (t.length === 0) {
          if (this.#e !== void 0) throw Ut;
          if (i) return;
          this.#e = n;
          return;
        }
        let [o, ...a] = t,
          l =
            o === "*"
              ? a.length === 0
                ? ["", "", Kn]
                : ["", "", Os]
              : o === "/*"
                ? ["", "", zn]
                : o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/),
          c;
        if (l) {
          let p = l[1],
            u = l[2] || Os;
          if (
            p &&
            l[2] &&
            (u === ".*" ||
              ((u = u.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:")),
              /\((?!\?:)/.test(u)))
          )
            throw Ut;
          if (((c = this.#n[u]), !c)) {
            if (Object.keys(this.#n).some((f) => f !== Kn && f !== zn))
              throw Ut;
            if (i) return;
            ((c = this.#n[u] = new ia()), p !== "" && (c.#t = s.varIndex++));
          }
          !i && p !== "" && r.push([p, c.#t]);
        } else if (((c = this.#n[o]), !c)) {
          if (
            Object.keys(this.#n).some(
              (p) => p.length > 1 && p !== Kn && p !== zn,
            )
          )
            throw Ut;
          if (i) return;
          c = this.#n[o] = new ia();
        }
        c.insert(a, n, r, s, i);
      }
      buildRegExpStr() {
        let n = Object.keys(this.#n)
          .sort(Yy)
          .map((r) => {
            let s = this.#n[r];
            return (
              (typeof s.#t == "number"
                ? `(${r})@${s.#t}`
                : Jy.has(r)
                  ? `\\${r}`
                  : r) + s.buildRegExpStr()
            );
          });
        return (
          typeof this.#e == "number" && n.unshift(`#${this.#e}`),
          n.length === 0
            ? ""
            : n.length === 1
              ? n[0]
              : "(?:" + n.join("|") + ")"
        );
      }
    };
  });
var Yu,
  Qu = b(() => {
    oa();
    Yu = class {
      #e = { varIndex: 0 };
      #t = new Ju();
      insert(e, t, n) {
        let r = [],
          s = [];
        for (let o = 0; ; ) {
          let a = false;
          if (
            ((e = e.replace(/\{[^}]+\}/g, (l) => {
              let c = `@\\${o}`;
              return ((s[o] = [c, l]), o++, (a = true), c);
            })),
            !a)
          )
            break;
        }
        let i = e.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
        for (let o = s.length - 1; o >= 0; o--) {
          let [a] = s[o];
          for (let l = i.length - 1; l >= 0; l--)
            if (i[l].indexOf(a) !== -1) {
              i[l] = i[l].replace(a, s[o][1]);
              break;
            }
        }
        return (this.#t.insert(i, t, r, this.#e, n), r);
      }
      buildRegExp() {
        let e = this.#t.buildRegExpStr();
        if (e === "") return [/^$/, [], []];
        let t = 0,
          n = [],
          r = [];
        return (
          (e = e.replace(/#(\d+)|@(\d+)|\.\*\$/g, (s, i, o) =>
            i !== void 0
              ? ((n[++t] = Number(i)), "$()")
              : (o !== void 0 && (r[Number(o)] = ++t), ""),
          )),
          [new RegExp(`^${e}`), n, r]
        );
      }
    };
  });
function ep(e) {
  return (Zu[e] ??= new RegExp(
    e === "*"
      ? ""
      : `^${e.replace(/\/\*$|([.\\+*[^\]$()])/g, (t, n) => (n ? `\\${n}` : "(?:|/.*)"))}$`,
  ));
}
function Zy() {
  Zu = Object.create(null);
}
function eb(e) {
  let t = new Yu(),
    n = [];
  if (e.length === 0) return Qy;
  let r = e
      .map((c) => [!/\*|\/:/.test(c[0]), ...c])
      .sort(([c, p], [u, f]) => (c ? 1 : u ? -1 : p.length - f.length)),
    s = Object.create(null);
  for (let c = 0, p = -1, u = r.length; c < u; c++) {
    let [f, h, m] = r[c];
    f ? (s[h] = [m.map(([g]) => [g, Object.create(null)]), Ns]) : p++;
    let d;
    try {
      d = t.insert(h, p, f);
    } catch (g) {
      throw g === Ut ? new Ps(h) : g;
    }
    f ||
      (n[p] = m.map(([g, y]) => {
        let _ = Object.create(null);
        for (y -= 1; y >= 0; y--) {
          let [x, $] = d[y];
          _[x] = $;
        }
        return [g, _];
      }));
  }
  let [i, o, a] = t.buildRegExp();
  for (let c = 0, p = n.length; c < p; c++)
    for (let u = 0, f = n[c].length; u < f; u++) {
      let h = n[c][u]?.[1];
      if (!h) continue;
      let m = Object.keys(h);
      for (let d = 0, g = m.length; d < g; d++) h[m[d]] = a[h[m[d]]];
    }
  let l = [];
  for (let c in o) l[c] = n[o[c]];
  return [i, l, s];
}
function rn(e, t) {
  if (e) {
    for (let n of Object.keys(e).sort((r, s) => s.length - r.length))
      if (ep(n).test(t)) return [...e[n]];
  }
}
var Qy,
  Zu,
  Ls,
  aa = b(() => {
    xt();
    nn();
    sa();
    oa();
    Qu();
    ((Qy = [/^$/, [], Object.create(null)]), (Zu = Object.create(null)));
    Ls = class {
      name = "RegExpRouter";
      #e;
      #t;
      constructor() {
        ((this.#e = { [ie]: Object.create(null) }),
          (this.#t = { [ie]: Object.create(null) }));
      }
      add(e, t, n) {
        let r = this.#e,
          s = this.#t;
        if (!r || !s) throw new Error(ks);
        (r[e] ||
          [r, s].forEach((a) => {
            ((a[e] = Object.create(null)),
              Object.keys(a[ie]).forEach((l) => {
                a[e][l] = [...a[ie][l]];
              }));
          }),
          t === "/*" && (t = "*"));
        let i = (t.match(/\/:/g) || []).length;
        if (/\*$/.test(t)) {
          let a = ep(t);
          (e === ie
            ? Object.keys(r).forEach((l) => {
                r[l][t] ||= rn(r[l], t) || rn(r[ie], t) || [];
              })
            : (r[e][t] ||= rn(r[e], t) || rn(r[ie], t) || []),
            Object.keys(r).forEach((l) => {
              (e === ie || e === l) &&
                Object.keys(r[l]).forEach((c) => {
                  a.test(c) && r[l][c].push([n, i]);
                });
            }),
            Object.keys(s).forEach((l) => {
              (e === ie || e === l) &&
                Object.keys(s[l]).forEach(
                  (c) => a.test(c) && s[l][c].push([n, i]),
                );
            }));
          return;
        }
        let o = vs(t) || [t];
        for (let a = 0, l = o.length; a < l; a++) {
          let c = o[a];
          Object.keys(s).forEach((p) => {
            (e === ie || e === p) &&
              ((s[p][c] ||= [...(rn(r[p], c) || rn(r[ie], c) || [])]),
              s[p][c].push([n, i - l + a + 1]));
          });
        }
      }
      match = ra;
      buildAllMatchers() {
        let e = Object.create(null);
        return (
          Object.keys(this.#t)
            .concat(Object.keys(this.#e))
            .forEach((t) => {
              e[t] ||= this.#n(t);
            }),
          (this.#e = this.#t = void 0),
          Zy(),
          e
        );
      }
      #n(e) {
        let t = [],
          n = e === ie;
        return (
          [this.#e, this.#t].forEach((r) => {
            let s = r[e] ? Object.keys(r[e]).map((i) => [i, r[e][i]]) : [];
            s.length !== 0
              ? ((n ||= true), t.push(...s))
              : e !== ie &&
                t.push(...Object.keys(r[ie]).map((i) => [i, r[ie][i]]));
          }),
          n ? eb(t) : null
        );
      }
    };
  });
var tp = b(() => {
  xt();
  sa();
  aa();
});
var np = b(() => {
  aa();
  tp();
});
var la,
  rp = b(() => {
    xt();
    la = class {
      name = "SmartRouter";
      #e = [];
      #t = [];
      constructor(e) {
        this.#e = e.routers;
      }
      add(e, t, n) {
        if (!this.#t) throw new Error(ks);
        this.#t.push([e, t, n]);
      }
      match(e, t) {
        if (!this.#t) throw new Error("Fatal error");
        let n = this.#e,
          r = this.#t,
          s = n.length,
          i = 0,
          o;
        for (; i < s; i++) {
          let a = n[i];
          try {
            for (let l = 0, c = r.length; l < c; l++) a.add(...r[l]);
            o = a.match(e, t);
          } catch (l) {
            if (l instanceof Ps) continue;
            throw l;
          }
          ((this.match = a.match.bind(a)), (this.#e = [a]), (this.#t = void 0));
          break;
        }
        if (i === s) throw new Error("Fatal error");
        return ((this.name = `SmartRouter + ${this.activeRouter.name}`), o);
      }
      get activeRouter() {
        if (this.#t || this.#e.length !== 1)
          throw new Error("No active router has been determined yet.");
        return this.#e[0];
      }
    };
  });
var sp = b(() => {
  rp();
});
var Xn,
  tb,
  ip,
  ap = b(() => {
    xt();
    nn();
    ((Xn = Object.create(null)),
      (tb = (e) => {
        for (let t in e) return true;
        return false;
      }),
      (ip = class op {
        #e;
        #t;
        #n;
        #i = 0;
        #s = Xn;
        constructor(t, n, r) {
          if (((this.#t = r || Object.create(null)), (this.#e = []), t && n)) {
            let s = Object.create(null);
            ((s[t] = { handler: n, possibleKeys: [], score: 0 }),
              (this.#e = [s]));
          }
          this.#n = [];
        }
        insert(t, n, r) {
          this.#i = ++this.#i;
          let s = this,
            i = Ou(n),
            o = [];
          for (let a = 0, l = i.length; a < l; a++) {
            let c = i[a],
              p = i[a + 1],
              u = Lu(c, p),
              f = Array.isArray(u) ? u[0] : c;
            if (f in s.#t) {
              ((s = s.#t[f]), u && o.push(u[1]));
              continue;
            }
            ((s.#t[f] = new op()),
              u && (s.#n.push(u), o.push(u[1])),
              (s = s.#t[f]));
          }
          return (
            s.#e.push({
              [t]: {
                handler: r,
                possibleKeys: o.filter((a, l, c) => c.indexOf(a) === l),
                score: this.#i,
              },
            }),
            s
          );
        }
        #r(t, n, r, s, i) {
          for (let o = 0, a = n.#e.length; o < a; o++) {
            let l = n.#e[o],
              c = l[r] || l[ie],
              p = {};
            if (
              c !== void 0 &&
              ((c.params = Object.create(null)),
              t.push(c),
              s !== Xn || (i && i !== Xn))
            )
              for (let u = 0, f = c.possibleKeys.length; u < f; u++) {
                let h = c.possibleKeys[u],
                  m = p[c.score];
                ((c.params[h] = i?.[h] && !m ? i[h] : (s[h] ?? i?.[h])),
                  (p[c.score] = true));
              }
          }
        }
        search(t, n) {
          let r = [];
          this.#s = Xn;
          let i = [this],
            o = Jo(n),
            a = [],
            l = o.length,
            c = null;
          for (let p = 0; p < l; p++) {
            let u = o[p],
              f = p === l - 1,
              h = [];
            for (let d = 0, g = i.length; d < g; d++) {
              let y = i[d],
                _ = y.#t[u];
              _ &&
                ((_.#s = y.#s),
                f
                  ? (_.#t["*"] && this.#r(r, _.#t["*"], t, y.#s),
                    this.#r(r, _, t, y.#s))
                  : h.push(_));
              for (let x = 0, $ = y.#n.length; x < $; x++) {
                let C = y.#n[x],
                  v = y.#s === Xn ? {} : { ...y.#s };
                if (C === "*") {
                  let R = y.#t["*"];
                  R && (this.#r(r, R, t, y.#s), (R.#s = v), h.push(R));
                  continue;
                }
                let [A, T, L] = C;
                if (!u && !(L instanceof RegExp)) continue;
                let E = y.#t[A];
                if (L instanceof RegExp) {
                  if (c === null) {
                    c = new Array(l);
                    let j = n[0] === "/" ? 1 : 0;
                    for (let w = 0; w < l; w++)
                      ((c[w] = j), (j += o[w].length + 1));
                  }
                  let R = n.substring(c[p]),
                    F = L.exec(R);
                  if (F) {
                    if (((v[T] = F[0]), this.#r(r, E, t, y.#s, v), tb(E.#t))) {
                      E.#s = v;
                      let j = F[0].match(/\//)?.length ?? 0;
                      (a[j] ||= []).push(E);
                    }
                    continue;
                  }
                }
                (L === true || L.test(u)) &&
                  ((v[T] = u),
                  f
                    ? (this.#r(r, E, t, v, y.#s),
                      E.#t["*"] && this.#r(r, E.#t["*"], t, v, y.#s))
                    : ((E.#s = v), h.push(E)));
              }
            }
            let m = a.shift();
            i = m ? h.concat(m) : h;
          }
          return (
            r.length > 1 && r.sort((p, u) => p.score - u.score),
            [r.map(({ handler: p, params: u }) => [p, u])]
          );
        }
      }));
  });
var ca,
  lp = b(() => {
    nn();
    ap();
    ca = class {
      name = "TrieRouter";
      #e;
      constructor() {
        this.#e = new ip();
      }
      add(e, t, n) {
        let r = vs(t);
        if (r) {
          for (let s = 0, i = r.length; s < i; s++) this.#e.insert(e, r[s], n);
          return;
        }
        this.#e.insert(e, t, n);
      }
      match(e, t) {
        return this.#e.search(e, t);
      }
    };
  });
var cp = b(() => {
  lp();
});
var ua,
  up = b(() => {
    Xu();
    np();
    sp();
    cp();
    ua = class extends Ku {
      constructor(e = {}) {
        (super(e),
          (this.router =
            e.router ?? new la({ routers: [new Ls(), new ca()] })));
      }
    };
  });
var pp = b(() => {
  up();
});
function pa(e) {
  return !e || typeof e != "object" ? false : e.code === "EADDRINUSE";
}
function fp(e, t, n) {
  return new Promise((r, s) => {
    let i = (a) => {
        (e.off("listening", o), s(a));
      },
      o = () => {
        (e.off("error", i), r());
      };
    (e.once("error", i), e.once("listening", o), e.listen(t, n));
  });
}
function fa(e) {
  (console.error(),
    console.error(
      Jn.default.red(
        `Cannot start server: Port ${Jn.default.bold(String(e))} is already in use.`,
      ),
    ),
    console.error(
      Jn.default.red(
        `Stop the process using that port, or set a different ${Jn.default.bold("api.port")} in your config.`,
      ),
    ),
    console.error(),
    process.exit(1));
}
var Jn,
  mp = b(() => {
    Jn = z(J());
  });
function Yn(e) {
  let t = [],
    n = e ?? "",
    r = n.toLowerCase(),
    s = new TextEncoder().encode(n).length;
  if (!n)
    return (t.push("auth.jwt_secret is empty"), { strong: false, reasons: t });
  (nb.has(n) && t.push(`matches Supalite development default "${n}"`),
    s < 32 &&
      t.push(`is ${s} bytes; use at least 32 bytes for production secrets`),
    [
      /[a-z]/.test(n),
      /[A-Z]/.test(n),
      /[0-9]/.test(n),
      /[^A-Za-z0-9]/.test(n),
    ].filter(Boolean).length < 3 && t.push("uses too little character variety"),
    /^(.)\1{7,}$/.test(n)
      ? t.push("is one repeated character")
      : sb(n) && t.push("contains an obvious repeated pattern"));
  let o = rb.find((a) => r.includes(a));
  return (
    o && t.push(`contains placeholder term "${o}"`),
    { strong: t.length === 0, reasons: t }
  );
}
function sb(e) {
  if (e.length < 8) return false;
  for (let t = 2; t <= Math.floor(e.length / 2); t++) {
    if (e.length % t !== 0) continue;
    if (e.slice(0, t).repeat(e.length / t) === e) return true;
  }
  return false;
}
var nb,
  rb,
  ma = b(() => {
    ((nb = new Set(["unsafe-secret-change-me", "dev-secret-change-me"])),
      (rb = [
        "change-me",
        "changeme",
        "secret",
        "password",
        "passwd",
        "test",
        "dev",
      ]));
  });
var dp,
  hp = b(() => {
    dp =
      /^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i;
  });
var ha,
  gp,
  ib,
  da,
  ga = b(() => {
    ((ha = (e, t = da) => {
      let n = /\.([a-zA-Z0-9]+?)$/,
        r = e.match(n);
      if (!r) return;
      let s = t[r[1]];
      return (s && s.startsWith("text") && (s += "; charset=utf-8"), s);
    }),
      (gp = (e) => {
        for (let t in da) if (da[t] === e) return t;
      }),
      (ib = {
        aac: "audio/aac",
        avi: "video/x-msvideo",
        avif: "image/avif",
        av1: "video/av1",
        bin: "application/octet-stream",
        bmp: "image/bmp",
        css: "text/css",
        csv: "text/csv",
        eot: "application/vnd.ms-fontobject",
        epub: "application/epub+zip",
        gif: "image/gif",
        gz: "application/gzip",
        htm: "text/html",
        html: "text/html",
        ico: "image/x-icon",
        ics: "text/calendar",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        js: "text/javascript",
        json: "application/json",
        jsonld: "application/ld+json",
        map: "application/json",
        mid: "audio/x-midi",
        midi: "audio/x-midi",
        mjs: "text/javascript",
        mp3: "audio/mpeg",
        mp4: "video/mp4",
        mpeg: "video/mpeg",
        oga: "audio/ogg",
        ogv: "video/ogg",
        ogx: "application/ogg",
        opus: "audio/opus",
        otf: "font/otf",
        pdf: "application/pdf",
        png: "image/png",
        rtf: "application/rtf",
        svg: "image/svg+xml",
        tif: "image/tiff",
        tiff: "image/tiff",
        ts: "video/mp2t",
        ttf: "font/ttf",
        txt: "text/plain",
        wasm: "application/wasm",
        webm: "video/webm",
        weba: "audio/webm",
        webmanifest: "application/manifest+json",
        webp: "image/webp",
        woff: "font/woff",
        woff2: "font/woff2",
        xhtml: "application/xhtml+xml",
        xml: "application/xml",
        zip: "application/zip",
        "3gp": "video/3gpp",
        "3g2": "video/3gpp2",
        gltf: "model/gltf+json",
        glb: "model/gltf-binary",
      }),
      (da = ib));
  });
var yp,
  bp = b(() => {
    yp = (...e) => {
      let t = e.filter((s) => s !== "").join("/");
      t = t.replace(/(?<=\/)\/+/g, "");
      let n = t.split("/"),
        r = [];
      for (let s of n)
        s === ".." && r.length > 0 && r.at(-1) !== ".."
          ? r.pop()
          : s !== "." && r.push(s);
      return r.join("/") || ".";
    };
  });
var wp,
  ob,
  ab,
  Sp,
  Ep = b(() => {
    hp();
    ga();
    bp();
    ((wp = { br: ".br", zstd: ".zst", gzip: ".gz" }),
      (ob = Object.keys(wp)),
      (ab = "index.html"),
      (Sp = (e) => {
        let t = e.root ?? "./",
          n = e.path,
          r = e.join ?? yp;
        return async (s, i) => {
          if (s.finalized) return i();
          let o;
          if (e.path) o = e.path;
          else
            try {
              if (
                ((o = decodeURIComponent(s.req.path)),
                /(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o))
              )
                throw new Error();
            } catch {
              return (await e.onNotFound?.(s.req.path, s), i());
            }
          let a = r(
            t,
            !n && e.rewriteRequestPath ? e.rewriteRequestPath(o) : o,
          );
          e.isDir && (await e.isDir(a)) && (a = r(a, ab));
          let l = e.getContent,
            c = await l(a, s);
          if (c instanceof Response) return s.newResponse(c.body, c);
          if (c) {
            let p = (e.mimes && ha(a, e.mimes)) || ha(a);
            if (
              (s.header("Content-Type", p || "application/octet-stream"),
              e.precompressed && (!p || dp.test(p)))
            ) {
              let u = new Set(
                s.req
                  .header("Accept-Encoding")
                  ?.split(",")
                  .map((f) => f.trim()),
              );
              for (let f of ob) {
                if (!u.has(f)) continue;
                let h = await l(a + wp[f], s);
                if (h) {
                  ((c = h),
                    s.header("Content-Encoding", f),
                    s.header("Vary", "Accept-Encoding", { append: true }));
                  break;
                }
              }
            }
            return (await e.onFound?.(a, s), s.body(c));
          }
          (await e.onNotFound?.(a, s), await i());
        };
      }));
  });
var _p,
  xp = b(() => {
    Ep();
    _p = (e) =>
      async function (n, r) {
        return Sp({
          ...e,
          getContent: async (o) => {
            let a = Bun.file(o);
            return (await a.exists()) ? a : null;
          },
          join: join,
          isDir: async (o) => {
            let a;
            try {
              a = (await stat$1(o)).isDirectory();
            } catch {}
            return a;
          },
        })(n, r);
      };
  });
var Tp = b(() => {});
var Cp,
  Ap = b(() => {
    Tp();
    Cp = (e, t) => {
      for (let [n, r] of Object.entries(t)) {
        let s = new RegExp("/:" + n + "(?:{[^/]+})?\\??");
        e = e.replace(s, r ? `/${r}` : "");
      }
      return e;
    };
  });
var ub,
  $p,
  Rp = b(() => {
    ((ub = 1024),
      ($p = ({ concurrency: e, interval: t } = {}) => {
        if (((e ||= ub), e === 1 / 0)) return { run: async (s) => s() };
        let n = new Set(),
          r = async (s, i, o) => {
            if (n.size >= e)
              return (
                (i ||= new Promise((c) => (o = c))),
                setTimeout(() => r(s, i, o)),
                i
              );
            let a = {};
            n.add(a);
            let l = await s();
            return (
              t ? setTimeout(() => n.delete(a), t) : n.delete(a),
              o ? (o(l), i) : l
            );
          };
        return { run: r };
      }));
  });
var vp,
  ya,
  kp = b(() => {
    na();
    ((vp = (e) => e.length > 1), (ya = (e) => (e[Vn] ? ya(e[Vn]) : e)));
  });
var Pp,
  pb,
  fb,
  mb,
  db,
  Qn,
  Np,
  ba,
  wa = b(() => {
    xt();
    kp();
    ((Pp = (e) =>
      e
        .split(/[\/\\]/)
        .slice(0, -1)
        .join("/")),
      (pb = (e) => e.replace(/(\\)/g, "/").replace(/\/$/g, "")),
      (fb = (e, t) => {
        e.length === 0 || t ? e.push("..") : e.pop();
      }),
      (mb = (e, t) => {
        ((e = e.replace(/^\.(?!.)/, "")), e !== "" && t.push(e));
      }),
      (db = (e, t) => {
        let n = false;
        for (let r of e)
          r === ".." ? (fb(t, n), (n = true)) : (mb(r, t), (n = false));
      }),
      (Qn = (...e) => {
        e = e.map(pb);
        let t = [];
        return (
          db(e.join("/").split("/"), t),
          (e[0][0] === "/" ? "/" : "") + t.join("/")
        );
      }),
      (Np = (e) =>
        e.routes.reduce((t, { method: n, handler: r, path: s }) => {
          let i = ya(r);
          return (["GET", ie].includes(n) && !vp(i) && t.push({ path: s }), t);
        }, [])),
      (ba = (e) =>
        e.split("/").some((t) => t.startsWith(":") || t.includes("*"))));
  });
var Op,
  Is,
  Sa = b(() => {
    wa();
    ((Op = "HONO_SSG_CONTEXT"),
      (Is = "x-hono-disable-ssg"),
      (() => {
        try {
          return new Response("SSG is disabled", {
            status: 404,
            headers: { [Is]: "true" },
          });
        } catch {
          return null;
        }
      })());
  });
var Lp = b(() => {
  ea();
});
var Ea,
  _a = b(() => {
    Lp();
    Ea = () => ({ afterResponseHook: (e) => (e.status !== 200 ? false : e) });
  });
var hb,
  gb,
  yb,
  bb,
  wb,
  Sb,
  Eb,
  _b,
  xb,
  Tb,
  Cb,
  Ip,
  Ab,
  Dp,
  jp = b(() => {
    Ap();
    Rp();
    ga();
    Sa();
    _a();
    wa();
    ((hb = 2),
      (gb = "text/plain"),
      (yb = "./static"),
      (bb = (e, t, n, r) => {
        let s = Eb(n, r);
        return e.endsWith(`.${s}`)
          ? Qn(t, e)
          : e === "/"
            ? Qn(t, `index.${s}`)
            : e.endsWith("/")
              ? Qn(t, e, `index.${s}`)
              : Qn(t, `${e}.${s}`);
      }),
      (wb = async (e) => {
        let t = e.headers.get("Content-Type");
        try {
          return t?.includes("text") || t?.includes("json")
            ? await e.text()
            : await e.arrayBuffer();
        } catch (n) {
          throw new Error(
            `Error processing response: ${n instanceof Error ? n.message : "Unknown error"}`,
          );
        }
      }),
      (Sb = {
        "text/html": "html",
        "text/xml": "xml",
        "application/xml": "xml",
        "application/yaml": "yaml",
      }),
      (Eb = (e, t) => {
        let n = t || Sb;
        return e in n ? n[e] : gp(e) || "html";
      }),
      (_b = (e) =>
        Array.isArray(e)
          ? async (t) => {
              let n = t;
              for (let r of e) {
                let s = await r(n);
                if (s === false) return false;
                s instanceof Request && (n = s);
              }
              return n;
            }
          : e),
      (xb = (e) =>
        Array.isArray(e)
          ? async (t) => {
              let n = t;
              for (let r of e) {
                let s = await r(n);
                if (s === false) return false;
                s instanceof Response && (n = s);
              }
              return n;
            }
          : e),
      (Tb = (e, t, n) =>
        Array.isArray(e)
          ? async (r) => {
              for (let s of e) await s(r, t, n);
            }
          : e),
      (Cb = function* (e, t, n, r) {
        let s = "http://localhost",
          i = $p({ concurrency: r });
        for (let o of Np(e)) {
          let a = new URL(o.path, s).toString(),
            l = new Request(a);
          yield new Promise(async (c, p) => {
            try {
              if (t) {
                let f = await t(l);
                if (!f) {
                  c(void 0);
                  return;
                }
                l = f;
              }
              if ((await i.run(() => e.fetch(l)), !l.ssgParams)) {
                if (ba(o.path)) {
                  c(void 0);
                  return;
                }
                l.ssgParams = [{}];
              }
              let u = { method: l.method, headers: l.headers };
              c(
                (function* () {
                  for (let f of l.ssgParams)
                    yield new Promise(async (h, m) => {
                      try {
                        let d = Cp(o.path, f),
                          g = await i.run(() => e.request(d, u, { [Op]: !0 }));
                        if (g.headers.get(Is)) {
                          h(void 0);
                          return;
                        }
                        if (n) {
                          let x = await n(g);
                          if (!x) {
                            h(void 0);
                            return;
                          }
                          g = x;
                        }
                        let y =
                            g.headers.get("Content-Type")?.split(";")[0] || gb,
                          _ = await wb(g);
                        h({ routePath: d, mimeType: y, content: _ });
                      } catch (d) {
                        m(d);
                      }
                    });
                })(),
              );
            } catch (u) {
              p(u);
            }
          });
        }
      }),
      (Ip = new Set()),
      (Ab = async (e, t, n, r) => {
        let s = await e;
        if (!s) return;
        let { routePath: i, content: o, mimeType: a } = s,
          l = bb(i, n, a, r),
          c = Pp(l);
        return (
          Ip.has(c) || (await t.mkdir(c, { recursive: true }), Ip.add(c)),
          typeof o == "string"
            ? await t.writeFile(l, o)
            : o instanceof ArrayBuffer &&
              (await t.writeFile(l, new Uint8Array(o))),
          l
        );
      }),
      (Dp = async (e, t, n) => {
        let r,
          s = [],
          i = [],
          o = n?.plugins || [Ea()],
          a = [],
          l = [],
          c = [];
        (n?.beforeRequestHook &&
          a.push(
            ...(Array.isArray(n.beforeRequestHook)
              ? n.beforeRequestHook
              : [n.beforeRequestHook]),
          ),
          n?.afterResponseHook &&
            l.push(
              ...(Array.isArray(n.afterResponseHook)
                ? n.afterResponseHook
                : [n.afterResponseHook]),
            ),
          n?.afterGenerateHook &&
            c.push(
              ...(Array.isArray(n.afterGenerateHook)
                ? n.afterGenerateHook
                : [n.afterGenerateHook]),
            ));
        for (let p of o)
          (p.beforeRequestHook &&
            a.push(
              ...(Array.isArray(p.beforeRequestHook)
                ? p.beforeRequestHook
                : [p.beforeRequestHook]),
            ),
            p.afterResponseHook &&
              l.push(
                ...(Array.isArray(p.afterResponseHook)
                  ? p.afterResponseHook
                  : [p.afterResponseHook]),
              ),
            p.afterGenerateHook &&
              c.push(
                ...(Array.isArray(p.afterGenerateHook)
                  ? p.afterGenerateHook
                  : [p.afterGenerateHook]),
              ));
        try {
          let p = n?.dir ?? yb,
            u = n?.concurrency ?? hb,
            f = _b(a.length > 0 ? a : [(g) => g]),
            h = xb(l.length > 0 ? l : [(g) => g]),
            m = Cb(e, f, h, u);
          for (let g of m)
            s.push(
              g.then((y) => {
                if (y)
                  for (let _ of y)
                    i.push(Ab(_, t, p, n?.extensionMap).catch((x) => x));
              }),
            );
          await Promise.all(s);
          let d = [];
          for (let g of i) {
            let y = await g;
            if (typeof y == "string") d.push(y);
            else if (y) throw y;
          }
          r = { success: !0, files: d };
        } catch (p) {
          let u = p instanceof Error ? p : new Error(String(p));
          r = { success: false, files: [], error: u };
        }
        return (c.length > 0 && (await Tb(c, t, n)(r, t, n)), r);
      }));
  });
var Fp = b(() => {
  jp();
  Sa();
  _a();
});
var $b,
  xa,
  Mp,
  Up = b(() => {
    Fp();
    (({ write: $b } = Bun),
      (xa = {
        writeFile: async (e, t) => {
          await $b(e, t);
        },
        mkdir: async () => {},
      }),
      (Mp = async (e, t) => Dp(e, xa, t)));
  });
var Bp,
  qp,
  Hp,
  Gp = b(() => {
    ((Bp = class {
      #e;
      constructor(e) {
        ((this.#e = e),
          (this.raw = e.raw),
          (this.url = e.url ? new URL(e.url) : null),
          (this.protocol = e.protocol ?? null));
      }
      send(e, t) {
        this.#e.send(e, t ?? {});
      }
      raw;
      binaryType = "arraybuffer";
      get readyState() {
        return this.#e.readyState;
      }
      url;
      protocol;
      close(e, t) {
        this.#e.close(e, t);
      }
    }),
      (qp = (e) => new MessageEvent("message", { data: e })),
      (Hp =
        (e) =>
        (...t) => {
          if (typeof t[0] == "function") {
            let [n, r] = t;
            return async function (i, o) {
              let a = await n(i),
                l = await e(i, a, r);
              if (l) return l;
              await o();
            };
          } else {
            let [n, r, s] = t;
            return (async () => {
              let i = await e(n, r, s);
              if (!i) throw new Error("Failed to upgrade WebSocket");
              return i;
            })();
          }
        }));
  });
var sn,
  Ds = b(() => {
    sn = (e) => ("server" in e.env ? e.env.server : e.env);
  });
var Ta,
  Ca,
  Aa,
  Wp,
  Vp = b(() => {
    Gp();
    Ds();
    ((Ta = (e) =>
      new Bp({
        send: (t, n) => {
          e.send(t, n?.compress);
        },
        raw: e,
        readyState: e.readyState,
        url: e.data.url,
        protocol: e.data.protocol,
        close(t, n) {
          e.close(t, n);
        },
      })),
      (Ca = Hp((e, t) => {
        let n = sn(e);
        if (!n)
          throw new TypeError("env has to include the 2nd argument of fetch.");
        if (
          n.upgrade(e.req.raw, {
            data: { events: t, url: new URL(e.req.url), protocol: e.req.url },
          })
        )
          return new Response(null);
      })),
      (Aa = {
        open(e) {
          let t = e.data.events;
          t.onOpen && t.onOpen(new Event("open"), Ta(e));
        },
        close(e, t, n) {
          let r = e.data.events;
          r.onClose &&
            r.onClose(new CloseEvent("close", { code: t, reason: n }), Ta(e));
        },
        message(e, t) {
          let n = e.data.events;
          if (n.onMessage) {
            let r = typeof t == "string" ? t : t.buffer;
            n.onMessage(qp(r), Ta(e));
          }
        },
      }),
      (Wp = () => ({ upgradeWebSocket: Ca, websocket: Aa })));
  });
var Kp,
  zp = b(() => {
    Ds();
    Kp = (e) => {
      let t = sn(e);
      if (!t)
        throw new TypeError("env has to include the 2nd argument of fetch.");
      if (typeof t.requestIP != "function")
        throw new TypeError("server.requestIP is not a function.");
      let n = t.requestIP(e.req.raw);
      return n
        ? {
            remote: {
              address: n.address,
              addressType:
                n.family === "IPv6" || n.family === "IPv4" ? n.family : void 0,
              port: n.port,
            },
          }
        : { remote: {} };
    };
  });
var Xp = {};
pe(Xp, {
  bunFileSystemModule: () => xa,
  createBunWebSocket: () => Wp,
  getBunServer: () => sn,
  getConnInfo: () => Kp,
  serveStatic: () => _p,
  toSSG: () => Mp,
  upgradeWebSocket: () => Ca,
  websocket: () => Aa,
});
var Jp = b(() => {
  xp();
  Up();
  Vp();
  zp();
  Ds();
});
async function js(e, t = {}) {
  if (e.config.auth?.enabled) {
    let i = Yn(e.config.auth.jwt_secret);
    i.strong ||
      console.warn(
        Qp.default.yellow(
          `[auth] auth.jwt_secret is weak \u2014 do not use it in production:
` +
            i.reasons.map((o) => `  - it ${o}`).join(`
`) +
            `
`,
        ),
      );
  }
  let n = ys(),
    r = t.port ?? 3e3,
    s = t.host ?? "127.0.0.1";
  if (Hn()) {
    let i = await Promise.resolve()
        .then(() => (Jp(), Xp))
        .then((a) => a.serveStatic),
      o;
    try {
      let a = Yp(e, n, i);
      o = Bun.serve({
        fetch: (l) =>
          a.fetch(l, { peerAddress: o?.requestIP(l)?.address ?? null }),
        hostname: s,
        port: r,
      });
    } catch (a) {
      throw (pa(a) && fa(r), a);
    }
    return async () => {
      await o.stop();
    };
  } else {
    let { createAdaptorServer: i } = await import("@hono/node-server"),
      o = await import("@hono/node-server/serve-static").then(
        (c) => c.serveStatic,
      ),
      a = Yp(e, n, o),
      l = i({
        fetch: (c, ...p) => {
          let u = p[0]?.incoming;
          return a.fetch(c, { peerAddress: u?.socket?.remoteAddress ?? null });
        },
      });
    try {
      await fp(l, r, s);
    } catch (c) {
      throw (pa(c) && fa(r), c);
    }
    return () =>
      new Promise((c) => {
        l.close(() => {
          c(void 0);
        });
      });
  }
}
function Yp(e, t, n) {
  return new ua()
    .use(
      "/favicon.ico",
      n({ path: Fe__default.join(t, "static", "favicon.ico") }),
    )
    .use(
      "/static/*",
      n({
        root: t,
        onNotFound(r) {
          console.log("not found", r, process.cwd());
        },
      }),
    )
    .all("*", async (r) => e.fetch(r.req.raw, r.env));
}
var Qp,
  $a = b(() => {
    lt();
    pp();
    mp();
    Se();
    ma();
    Qp = z(J());
  });
var ut,
  Ra = b(() => {
    Lt();
    ut = class e {
      root;
      constructor(t, n) {
        let r = n ?? e.projectDir();
        this.root = Fe__default.join(r, t ?? "");
      }
      ensureRoot() {
        ve(this.root);
      }
      static homeDir() {
        return Fe__default.join(vb.homedir(), ".lite");
      }
      static projectDir() {
        return Fe__default.join(process.cwd(), "supabase");
      }
      deleteAll(t = false) {
        try {
          as.rmSync(this.root, { recursive: !0 });
        } catch (n) {
          if (!t) throw n;
        }
        this.ensureRoot();
      }
      delete(t, n = false) {
        try {
          as.unlinkSync(Fe__default.join(this.root, t));
        } catch (r) {
          if (!n) throw r;
        }
      }
      write(t, n, r = false) {
        try {
          (this.ensureRoot(),
            as.writeFileSync(Fe__default.join(this.root, t), n));
        } catch (s) {
          if (!r) throw s;
        }
      }
      read(t, n = false) {
        try {
          return as.readFileSync(Fe__default.join(this.root, t), "utf8");
        } catch (r) {
          if (!n) throw r;
        }
      }
      relativePath(t) {
        return t
          ? Fe__default.relative(process.cwd(), Fe__default.join(this.root, t))
          : this.root;
      }
      path(t) {
        return t ? Fe__default.join(this.root, t) : this.root;
      }
    };
  });
var Zn,
  Ms,
  Us = b(() => {
    ((Zn =
      process.env.LITE_CLOUD_URL ??
      (process.env.LOCAL ? "http://localhost:2001" : "https://api.lite.dev")),
      (Ms =
        process.env.LITE_CLOUD_PROJECTS_URL ??
        (process.env.LOCAL ? "http://supalite.local" : "https://lite.black")));
  });
var qs,
  Zp = b(() => {
    Lt();
    qs = class {
      root;
      constructor(t) {
        ((this.root = t ?? Fe__default.join(vb.homedir(), ".lite", "auth")),
          ve(this.root));
      }
      async getItem(t) {
        try {
          return as.readFileSync(
            Fe__default.join(this.root, t + ".json"),
            "utf8",
          );
        } catch {
          return null;
        }
      }
      async setItem(t, n) {
        as.writeFileSync(Fe__default.join(this.root, t + ".json"), n);
      }
      async removeItem(t) {
        try {
          as.unlinkSync(Fe__default.join(this.root, t + ".json"));
        } catch {
          return;
        }
      }
    };
  });
var on,
  ka = b(() => {
    Us();
    Ra();
    Zp();
    on = class {
      constructor(t) {
        this.config = t;
        ((this.tempFs = new ut(".temp", this.config.root)),
          (this.projectFs = new ut("supabase", this.config.root)),
          (this.schemaFs = new ut("schemas", this.config.root)),
          (this.authStorage =
            this.config.authStorage ??
            new qs(Fe__default.join(ut.homeDir(), "auth"))),
          (this._client =
            this.config.withSupabaseClient !== false
              ? (this.config.client ??
                createClient(
                  this.config.host ?? Zn,
                  process.env.LITE_CLOUD_ANON_KEY ?? "...",
                  { auth: { storage: this.authStorage } },
                ))
              : void 0));
      }
      tempFs;
      projectFs;
      schemaFs;
      _client;
      authStorage;
      async fetch(t, n) {
        if (!this.config.token)
          throw new Error("Not authenticated, sign in first.");
        let r = t instanceof URL ? t : new URL(t, this.config.host ?? Zn);
        return await fetch(r, {
          ...n,
          headers: {
            ...n?.headers,
            Authorization: `Bearer ${this.config.token}`,
          },
        });
      }
    };
  });
var an,
  Pa = b(() => {
    ka();
    Us();
    an = class extends on {
      constructor(n) {
        super(n);
        this.config = n;
      }
      get client() {
        if (!this._client) throw new Error("Supabase client not initialized");
        return this._client;
      }
      projectRef() {
        return this.tempFs.read("project-ref", true);
      }
      projectUrl(n) {
        let r = new URL(this.config.projectsHost ?? Ms),
          s = r.hostname.replace(/^www\./, "");
        return `${r.protocol}//${n}.${s}${r.port ? `:${r.port}` : ""}`;
      }
    };
  });
function Ob(e) {
  let t = Fe.extname(e).toLowerCase();
  return (
    {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".xml": "application/xml",
      ".zip": "application/zip",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
    }[t] ?? "application/octet-stream"
  );
}
var Gs,
  ef = b(() => {
    lt();
    Gs = class {
      driver = he;
      basePath;
      constructor(t) {
        this.basePath = Fe.resolve(t.basePath);
      }
      filePath(t, n) {
        return Fe.join(this.basePath, t, n);
      }
      async ensureDir(t) {
        await he.mkdir(Fe.dirname(t), { recursive: true });
      }
      async getObject(t, n, r, s) {
        let i = this.filePath(t, n),
          o = await he.stat(i),
          a = `"${createHash("md5").update(`${i}:${o.mtimeMs}`).digest("hex")}"`;
        if (s?.ifNoneMatch === a)
          return { httpStatusCode: 304, metadata: this.buildMetadata(o, a, n) };
        if (s?.ifModifiedSince) {
          let f = new Date(s.ifModifiedSince);
          if (o.mtime <= f)
            return {
              httpStatusCode: 304,
              metadata: this.buildMetadata(o, a, n),
            };
        }
        let l,
          c,
          p = o.size,
          u = 200;
        if (s?.range) {
          let f = s.range.match(/^bytes=(\d+)-(\d*)$/);
          if (f) {
            let h = Number.parseInt(f[1], 10),
              m = f[2] ? Number.parseInt(f[2], 10) : o.size - 1;
            ((p = m - h + 1),
              (c = `bytes ${h}-${m}/${o.size}`),
              (u = 206),
              (l = (await he.open(i, "r")).readableWebStream()));
          } else l = (await he.open(i, "r")).readableWebStream();
        } else l = (await he.open(i, "r")).readableWebStream();
        return {
          httpStatusCode: u,
          metadata: {
            ...this.buildMetadata(o, a, n),
            contentLength: p,
            contentRange: c,
          },
          body: l,
        };
      }
      async uploadObject(t, n, r, s, i, o) {
        let a = this.filePath(t, n);
        await this.ensureDir(a);
        let l;
        if (s instanceof Uint8Array || Buffer.isBuffer(s)) l = s;
        else {
          let u = [],
            f = s.getReader();
          for (;;) {
            let { done: h, value: m } = await f.read();
            if (h) break;
            u.push(m);
          }
          l = Buffer.concat(u);
        }
        await he.writeFile(a, l);
        let c = await he.stat(a),
          p = `"${createHash("md5").update(l).digest("hex")}"`;
        return {
          cacheControl: o,
          contentLength: c.size,
          size: c.size,
          mimetype: i,
          lastModified: c.mtime,
          eTag: p,
        };
      }
      async deleteObject(t, n, r) {
        let s = this.filePath(t, n);
        await he.unlink(s).catch((i) => {
          if (i.code !== "ENOENT") throw i;
        });
      }
      async deleteObjects(t, n) {
        for (let r of n) await this.deleteObject(t, r, void 0);
      }
      async copyObject(t, n, r, s, i, o) {
        let a = this.filePath(t, n),
          l = this.filePath(s, i);
        (await this.ensureDir(l), await he.copyFile(a, l));
        let c = await he.stat(l),
          p = await he.readFile(l);
        return {
          httpStatusCode: 200,
          eTag: `"${createHash("md5").update(p).digest("hex")}"`,
          lastModified: c.mtime,
        };
      }
      async headObject(t, n, r) {
        let s = this.filePath(t, n),
          i = await he.stat(s),
          o = `"${createHash("md5").update(`${s}:${i.mtimeMs}`).digest("hex")}"`;
        return this.buildMetadata(i, o, n);
      }
      async privateAssetUrl(t, n, r) {
        return `file://${this.filePath(t, n)}`;
      }
      buildMetadata(t, n, r) {
        return {
          cacheControl: "no-cache",
          contentLength: Wo(t.size),
          size: Wo(t.size),
          mimetype: Ob(r),
          lastModified: t.mtime,
          eTag: n,
        };
      }
    };
  });
async function We(e, t, n) {
  try {
    return await Lb(e);
  } catch (r) {
    throw r?.code === "ERR_MODULE_NOT_FOUND" ||
      /Cannot find package/.test(String(r?.message))
      ? new Error(
          `Driver '${t}' selected but '${n}' is not installed. Run: bun add ${n}`,
        )
      : r;
  }
}
var Lb,
  ln = b(() => {
    Lb = new Function("spec", "return import(spec)");
  });
var er,
  Db,
  Ws,
  nf = b(() => {
    Pa();
    jt();
    er = z(J());
    Fn();
    Nt();
    ef();
    ln();
    Ro();
    ko();
    Ft();
    ((Db = ["toml", "json", "ts", "mts", "js", "mjs", "cjs"]),
      (Ws = class extends an {
        ref() {
          return this.projectRef();
        }
        setRef(t) {
          return (this.tempFs.write("project-ref", t), this);
        }
        link(t) {
          return (this.setRef(t.id), t);
        }
        unlink() {
          return (this.tempFs.delete("project-ref"), this);
        }
        url() {
          let t = this.ref();
          if (!t) throw new Error("No project linked");
          return this.projectUrl(t);
        }
        async getConfigPath(t) {
          let n = Fe__default.relative(process.cwd(), fe.config_dir);
          if (!t)
            for (let r of Db) {
              let s = Fe__default.join(n, `config.${r}`);
              if (
                await he__default
                  .access(s)
                  .then(() => true)
                  .catch(() => false)
              ) {
                t = s;
                break;
              }
            }
          return t;
        }
        async readConfig(t) {
          let n = await this.getConfigPath(t);
          if (!n) return {};
          He(er.default.dim(`Using config file: ${er.default.cyan(`./${n}`)}`));
          let r = Fe__default.dirname(Fe__default.resolve(n));
          ms(r);
          let s = n.split(".").pop(),
            i;
          switch (s) {
            case "toml":
              i = Dt(await he__default.readFile(n, "utf-8"));
              break;
            case "json":
              i = JSON.parse(await he__default.readFile(n, "utf-8"));
              break;
            case "ts":
            case "mts":
            case "js":
            case "mjs":
            case "cjs":
              try {
                i = (await import(Fe__default.join(process.cwd(), n))).default;
                break;
              } catch (o) {
                throw (console.error("Failed to import config file", o), o);
              }
            default:
              throw new Error(`Unsupported config file type: ${n}`);
          }
          return ds(i);
        }
        async createConnection() {
          throw new Error("Not implemented");
        }
        async getConfig(t) {
          let n = await this.readConfig(t);
          if ("connection" in n)
            return { ...n, connection: await n.connection };
          let r, s;
          switch (n.db?.driver) {
            case "sqlite":
              ((s = n.db?.url ?? fe.default_db_url),
                (r = await createConnection({ url: s, ddlDialect: "sqlite" })));
              break;
            case "pglite": {
              s =
                n.db?.url ?? Fe__default.join(process.cwd(), fe.default_db_dir);
              let { createPgliteConnection: i } = await We(
                "@supabase/lite/pglite",
                "pglite",
                "@electric-sql/pglite",
              );
              r = await i({ url: s });
              break;
            }
            case "postgres": {
              s = n.db?.url ?? "";
              let { createPostgresConnection: i } = await We(
                "@supabase/lite/postgres",
                "postgres",
                "postgres",
              );
              r = await i({ url: s });
              break;
            }
            default:
              ((s = n.db?.url ?? fe.default_db_url),
                (r = await createConnection({
                  url: s,
                  ddlDialect: "postgres",
                })));
              break;
          }
          if (!r) throw new Error("Failed to create connection");
          return (
            He(
              er.default.green(" \u279C"),
              "Database located at",
              er.default.cyan(s ?? "in-memory"),
            ),
            { ...n, connection: r }
          );
        }
        async createApp(t, n) {
          let r = await this.getConfig(t),
            s = new App({
              ...r,
              options: {
                ...r.options,
                server: {
                  ...r.options?.server,
                  admin:
                    n?.admin ?? r.options?.server?.admin ?? n?.adminDefault,
                },
              },
            });
          return (
            s.config.storage?.enabled &&
              process.env.EXPERIMENTAL_STORAGE === "1" &&
              !s._storageAdapter &&
              (s._storageAdapter = new Gs({
                basePath: Fe__default.join(
                  process.cwd(),
                  fe.config_dir,
                  ".temp/storage",
                ),
              })),
            await s.init()
          );
        }
      }));
  });
var Vs,
  rf = b(() => {
    Pa();
    Vs = class extends an {
      url(t) {
        return this.projectUrl(t);
      }
      async ping() {
        return (await this.fetch("/v1/system/ping")).ok;
      }
      async list() {
        let t = await this.fetch("/v1/projects");
        if (!t.ok) throw new Error("Failed to list projects");
        let n = await t.json();
        if (!Array.isArray(n)) throw new Error("Failed to list projects");
        return n;
      }
      async get(t) {
        if (((t = t ?? this.projectRef()), !t))
          throw new Error("No project ref found");
        let n = await this.fetch(`/v1/projects/${t}`);
        if (!n.ok)
          throw new Error(`Failed to get project: ${n.status} ${n.statusText}`);
        let r = await n.json();
        if (!r || !r.id) throw new Error("Failed to get project");
        return r;
      }
      async create(t) {
        if (!t.name) throw new Error("Project name is required");
        let n = await this.fetch("/v1/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(t),
        });
        if (!n.ok) {
          let s = await n.text().catch(() => "");
          throw new Error(
            `Failed to create project: ${n.status} ${n.statusText}${s ? ` \u2014 ${s}` : ""}`,
          );
        }
        let r = await n.json();
        if (!r || !r.id) throw new Error("Failed to create project");
        return r;
      }
      async getConfig(t) {
        let n = await this.fetch(`/v1/projects/${t}/config`);
        if (!n.ok)
          throw new Error(
            `Failed to get project config: ${n.status} ${n.statusText}`,
          );
        let r = await n.json();
        if (!r) throw new Error("Failed to get project config");
        return r;
      }
      async setConfig(t, n) {
        let r = await this.fetch(`/v1/projects/${t}/config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(n),
        });
        if (!r.ok)
          throw new Error(
            `Failed to set project config: ${r.status} ${r.statusText}`,
          );
      }
      async listMigrations(t) {
        let n = await this.fetch(`/v1/projects/${t}/database/migrations`);
        if (!n.ok)
          throw new Error(
            `Failed to list database migrations: ${n.status} ${n.statusText}`,
          );
        let r = await n.json();
        if (!Array.isArray(r))
          throw new Error("Failed to list database migrations");
        return r;
      }
      async applyMigration(t, n) {
        let r = await this.fetch(`/v1/projects/${t}/database/migrations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": n.version,
          },
          body: JSON.stringify({
            query: n.query,
            ...(n.name === null ? {} : { name: n.name }),
          }),
        });
        if (!r.ok) {
          let s = await r.text().catch(() => "");
          throw new Error(
            `Failed to apply database migration ${n.version}: ${r.status} ${r.statusText}${s ? `: ${s}` : ""}`,
          );
        }
      }
      async createApp(t) {
        if (!this.config.host) throw new Error("No host specified");
        let { data: n, error: r } = await this.client.auth.getSession();
        if (r) throw r;
        if (!n?.session?.access_token)
          throw new Error("Not authenticated, sign in first.");
        let s = await this.getConfig(t);
        return await new App({
          ...s.config,
          connection: cloud({
            ...(s.connection ?? {}),
            projectRef: t,
            token: n.session.access_token,
            host: this.config.host,
          }),
        }).init();
      }
    };
  });
var Ks,
  sf = b(() => {
    ka();
    nf();
    rf();
    Ks = class extends on {
      project;
      get client() {
        if (!this._client) throw new Error("Supabase client not initialized");
        return this._client;
      }
      async getSession() {
        return await this.client.auth.getSession();
      }
      async getAccessToken() {
        let { data: t, error: n } = await this.getSession();
        if (n) throw n;
        return t?.session?.access_token;
      }
      async requireSession() {
        let t = await this.getAccessToken();
        if (!t) throw new Error("Not authenticated, sign in first.");
        return t;
      }
      async init() {
        let t = { ...this.config };
        return (
          this.config.withSupabaseClient !== false &&
            ((t.client = this.client), (t.token = await this.getAccessToken())),
          (this.project = { local: new Ws(t), remote: new Vs(t) }),
          this
        );
      }
    };
  });
async function V(e = {}) {
  return await new Ks({
    host: Zn,
    projectsHost: Ms,
    root: ut.projectDir(),
    ...e,
  }).init();
}
var Ee = b(() => {
  Ra();
  Us();
  sf();
});
function zs(e) {
  let t = false,
    n = async () => {
      if (!t) {
        t = true;
        try {
          await e();
        } catch (r) {
          He(r);
        }
        process.exit(0);
      }
    };
  (process.on("SIGINT", n), process.on("SIGTERM", n));
}
var Oa = b(() => {
  Ft();
});
function Xs(e) {
  let t = e.auth?.publishable_key,
    n = e.auth?.secret_key;
  if (!t && !n) {
    console.log(
      be.default.dim(
        be.default.yellow(
          " \u26A0\uFE0E no API keys configured \u2014 run `lite generate-keys` (any apikey accepted)",
        ),
      ),
    );
    return;
  }
  (console.log(
    be.default.green(" \u279C"),
    "Publishable key".padEnd(19),
    be.default.cyan(t ?? "(not set)"),
  ),
    console.log(
      be.default.green(" \u279C"),
      "Secret key".padEnd(19),
      be.default.cyan(n ?? "(not set)"),
    ));
}
function Js(e) {
  if (!e) {
    console.log(
      be.default.dim(
        " \u279C  admin mode off \u2014 keyless requests are not elevated; normal auth rules apply",
      ),
    );
    return;
  }
  console.log(
    be.default.green(" \u279C"),
    "Studio admin mode".padEnd(19),
    be.default.cyan("on"),
    be.default.dim("(keyless same-origin localhost as service_role)"),
  );
}
function Ys(e, t) {
  let n = e.includes(":") && !e.startsWith("[") ? `[${e}]` : e;
  if (e === "0.0.0.0" || e === "::" || e === "[::]") {
    (console.log(
      be.default.green(" \u279C"),
      "Server listening on ",
      be.default.cyan(`${n}:${t} (all interfaces)`),
    ),
      console.log(
        be.default.green(" \u279C"),
        "Local URL".padEnd(19),
        be.default.cyan(`http://127.0.0.1:${t}`),
      ));
    return;
  }
  console.log(
    be.default.green(" \u279C"),
    "Server running on  ",
    be.default.cyan(`http://${n}:${t}`),
  );
}
function Qs() {
  console.log(
    be.default.yellow(
      " \u26A0 Admin mode is disabled because the server is exposed.",
    ),
    be.default.dim(
      "Pass --admin to enable peer-scoped local admin access, or --no-admin to keep it explicitly disabled.",
    ),
  );
}
var be,
  La = b(() => {
    be = z(J());
  });
function Zs(e, t) {
  let n = e.host === true ? Ub : e.host || Mb,
    r = !Au(n),
    s = t.getOptionValueSource?.("admin") === "cli";
  return {
    host: n,
    exposed: r,
    admin: s ? e.admin : r ? false : void 0,
    adminDefault: !r,
    warnAdminDisabled: r && t.getOptionValueSource?.("host") === "cli" && !s,
  };
}
var Mb,
  Ub,
  Ia = b(() => {
    Vo();
    ((Mb = "127.0.0.1"), (Ub = "0.0.0.0"));
  });
var ei = b(() => {});
function Bb(e, t) {
  if (e.includes(of) || t.includes(of)) return true;
  let n = Ho(e),
    r = Ho(t);
  return !n || !r
    ? Cs(e) !== Cs(t)
    : [...n].sort().join("\0") !== [...r].sort().join("\0");
}
var of,
  tr,
  Da = b(() => {
    _t();
    of = "/* modified */";
    tr = class {
      makeIndexKey(t) {
        return `${t.table}:${t.name}:${t.unique}:${t.columns.join(",")}`;
      }
      makeForeignKeyKey(t) {
        let n = (t.on_update ?? "NO ACTION").toUpperCase(),
          r = (t.on_delete ?? "NO ACTION").toUpperCase();
        return `${t.table}:${t.column}:${t.ref_table}:${t.ref_column}:${n}:${r}`;
      }
      diff(t, n) {
        let r = [],
          s = [],
          i = [],
          o = [],
          a = new Set(t.tables.map((d) => d.name)),
          l = new Set(n.tables.map((d) => d.name));
        for (let d of n.tables)
          a.has(d.name) || r.push({ type: "added", name: d.name, sql: d.sql });
        for (let d of t.tables)
          l.has(d.name) || r.push({ type: "removed", name: d.name });
        for (let d of t.tables) {
          let g = n.tables.find((y) => y.name === d.name);
          g &&
            Bb(d.sql, g.sql) &&
            r.push({ type: "modified", name: d.name, sql: g.sql });
        }
        let c = t.tables.filter((d) => l.has(d.name));
        for (let d of c) {
          let g = t.columns.filter(($) => $.table === d.name),
            y = n.columns.filter(($) => $.table === d.name),
            _ = new Map(g.map(($) => [$.name, $])),
            x = new Map(y.map(($) => [$.name, $]));
          for (let [$, C] of x)
            _.has($) ||
              s.push({ type: "added", table: d.name, name: $, column: C });
          for (let [$] of _)
            x.has($) || s.push({ type: "removed", table: d.name, name: $ });
          for (let [$, C] of _) {
            let v = x.get($);
            if (!v) continue;
            let A = {};
            (qo(C.type) !== qo(v.type) &&
              (A.type = { from: C.type, to: v.type }),
              !(C.is_primary_key && v.is_primary_key) &&
                C.nullable !== v.nullable &&
                (A.nullable = { from: C.nullable, to: v.nullable }),
              Go(C.default_value) !== Go(v.default_value) &&
                (A.default_value = {
                  from: C.default_value,
                  to: v.default_value,
                }),
              Object.keys(A).length > 0 &&
                s.push({
                  type: "modified",
                  table: d.name,
                  name: $,
                  changes: A,
                }));
          }
        }
        let p = new Map(t.indexes.map((d) => [this.makeIndexKey(d), d])),
          u = new Map(n.indexes.map((d) => [this.makeIndexKey(d), d]));
        for (let [d, g] of u) p.has(d) || i.push({ type: "added", ...g });
        for (let [d, g] of p) u.has(d) || i.push({ type: "removed", ...g });
        let f = new Map(
            t.foreign_keys.map((d) => [this.makeForeignKeyKey(d), d]),
          ),
          h = new Map(
            n.foreign_keys.map((d) => [this.makeForeignKeyKey(d), d]),
          );
        for (let [d, g] of h) f.has(d) || o.push({ type: "added", ...g });
        for (let [d, g] of f) h.has(d) || o.push({ type: "removed", ...g });
        let m = r.length > 0 || s.length > 0 || i.length > 0 || o.length > 0;
        return {
          tables: r,
          columns: s,
          indexes: i,
          foreign_keys: o,
          has_changes: m,
        };
      }
    };
  });
var qb,
  nr,
  ja = b(() => {
    ei();
    Gn();
    ((qb = ["CURRENT_TIMESTAMP", "CURRENT_TIME", "CURRENT_DATE"]),
      (nr = class {
        plan(t, n, r, s) {
          if (!t.has_changes) return { steps: [], warnings: [], unsafe: false };
          let i = [],
            o = [];
          (i.push({
            sql: "PRAGMA foreign_keys=OFF;",
            description: "Disable foreign key checks",
            type: "disable_foreign_keys",
          }),
            i.push({
              sql: "BEGIN;",
              description: "Begin transaction",
              type: "begin_transaction",
            }));
          for (let u of t.tables.filter((f) => f.type === "added")) {
            i.push({
              sql: `${u.sql};`,
              description: `CREATE TABLE ${B(u.name)}`,
              type: "create_table",
            });
            let f = r.indexes.filter((h) => h.table === u.name);
            for (let h of f) {
              let m = h.unique ? "UNIQUE " : "",
                d = h.columns.map((g) => B(g)).join(", ");
              i.push({
                sql: `CREATE ${m}INDEX ${B(h.name)} ON ${B(u.name)} (${d});`,
                description: `Create index ${B(h.name)} on ${B(u.name)}`,
                type: "add_index",
              });
            }
          }
          let a = new Set(n.tables.map((u) => u.name)),
            l = new Set(r.tables.map((u) => u.name)),
            c = new Set(
              t.tables.filter((u) => u.type === "modified").map((u) => u.name),
            ),
            p = [...a].filter((u) => l.has(u));
          for (let u of p) {
            if (
              !(
                c.has(u) ||
                t.columns.some((d) => d.table === u) ||
                t.indexes.some((d) => d.table === u) ||
                t.foreign_keys.some((d) => d.table === u)
              )
            )
              continue;
            let { canAlter: h, addedCols: m } = this.canSimpleAlter(u, t, r);
            if (h) {
              for (let y of m)
                i.push({
                  sql: `ALTER TABLE ${B(u)} ADD COLUMN ${this.columnDef(y)};`,
                  description: `Add column ${B(y.name)} to ${B(u)}`,
                  type: "add_column",
                });
              let d = t.indexes.filter(
                  (y) => y.table === u && y.type === "added",
                ),
                g = t.indexes.filter(
                  (y) => y.table === u && y.type === "removed",
                );
              for (let y of g)
                i.push({
                  sql: `DROP INDEX IF EXISTS ${B(y.name)};`,
                  description: `Drop index ${B(y.name)}`,
                  type: "drop_index",
                });
              for (let y of d) {
                let _ = y.unique ? "UNIQUE " : "",
                  x = y.columns.map(($) => B($)).join(", ");
                i.push({
                  sql: `CREATE ${_}INDEX ${B(y.name)} ON ${B(u)} (${x});`,
                  description: `Create index ${B(y.name)} on ${B(u)}`,
                  type: "add_index",
                });
              }
            } else {
              let d = this.rebuildTable(u, n, r, t);
              (i.push(...d.steps), o.push(...d.warnings));
            }
          }
          for (let u of t.tables.filter((f) => f.type === "removed"))
            (i.push({
              sql: `DROP TABLE ${B(u.name)};`,
              description: `Drop table ${B(u.name)}`,
              type: "drop_table",
            }),
              o.push({ table: u.name, reason: "table will be dropped" }));
          return (
            i.push({
              sql: "COMMIT;",
              description: "Commit transaction",
              type: "commit_transaction",
            }),
            i.push({
              sql: "PRAGMA foreign_keys=ON;",
              description: "Re-enable foreign key checks",
              type: "enable_foreign_keys",
            }),
            { steps: i, warnings: o, unsafe: o.length > 0 }
          );
        }
        rebuildTable(t, n, r, s) {
          let i = [],
            o = [],
            a = r.tables.find((y) => y.name === t);
          if (!a) return { steps: i, warnings: o };
          let l = `_${t}_migrate_new`,
            c = a.sql.replace(
              new RegExp(`(CREATE\\s+TABLE\\s+)(?:"${t}"|${t})`, "i"),
              `$1${B(l)}`,
            );
          i.push({
            sql: `${c};`,
            description: `Create temporary table ${B(l)}`,
            type: "create_table",
          });
          let p = n.columns.filter((y) => y.table === t).map((y) => y.name),
            u = r.columns.filter((y) => y.table === t).map((y) => y.name),
            f = p.filter((y) => u.includes(y));
          if (f.length > 0) {
            let y = f.map((_) => B(_)).join(", ");
            i.push({
              sql: `INSERT INTO ${B(l)} (${y})
                  SELECT ${y}
                  FROM ${B(t)};`,
              description: `Copy data from ${B(t)} to ${B(l)}`,
              type: "copy_data",
            });
          }
          (i.push({
            sql: `DROP TABLE ${B(t)};`,
            description: `Drop old table ${B(t)}`,
            type: "drop_table",
          }),
            i.push({
              sql: `ALTER TABLE ${B(l)} RENAME TO ${B(t)};`,
              description: `Rename ${B(l)} to ${B(t)}`,
              type: "rename_table",
            }));
          let h = r.indexes.filter((y) => y.table === t);
          for (let y of h) {
            let _ = y.unique ? "UNIQUE " : "",
              x = y.columns.map(($) => B($)).join(", ");
            i.push({
              sql: `CREATE ${_}INDEX ${B(y.name)} ON ${B(t)} (${x});`,
              description: `Recreate index ${B(y.name)} on ${B(t)}`,
              type: "add_index",
            });
          }
          let m = r.triggers?.filter((y) => y.table === t) ?? [];
          for (let y of m)
            i.push({
              sql: `${y.sql};`,
              description: `Recreate trigger ${B(y.name)} on ${B(t)}`,
              type: "create_trigger",
            });
          let d = s.columns.filter(
            (y) => y.table === t && y.type === "removed",
          );
          for (let y of d)
            o.push({ table: t, reason: `column "${y.name}" will be dropped` });
          let g = s.columns.filter(
            (y) => y.table === t && y.type === "modified",
          );
          for (let y of g)
            (y.changes?.type &&
              o.push({
                table: t,
                reason: `column "${y.name}" type changes from ${y.changes.type.from} to ${y.changes.type.to}`,
              }),
              y.changes?.nullable &&
                !y.changes.nullable.to &&
                o.push({
                  table: t,
                  reason: `column "${y.name}" becomes NOT NULL`,
                }));
          return { steps: i, warnings: o };
        }
        canSimpleAlter(t, n, r) {
          let s = n.columns.filter((u) => u.table === t),
            i = s.filter((u) => u.type === "added"),
            o = s.filter((u) => u.type === "removed"),
            a = s.filter((u) => u.type === "modified"),
            l = n.foreign_keys.some((u) => u.table === t);
          if (o.length > 0 || a.length > 0 || l)
            return { canAlter: false, addedCols: i };
          let c = r.tables.find((u) => u.name === t);
          return c && /\bCHECK\s*\(/i.test(c.sql)
            ? { canAlter: false, addedCols: i }
            : {
                canAlter:
                  i.every((u) => {
                    let f = u.column;
                    return this.hasNonConstantDefault(f.default_value)
                      ? false
                      : f.nullable || f.default_value != null;
                  }) && i.length > 0,
                addedCols: i,
              };
        }
        hasNonConstantDefault(t) {
          if (t == null) return false;
          let n = t.trim().toUpperCase();
          return qb.includes(n);
        }
        columnDef(t) {
          let n = t.column,
            r = `${B(n.name)} ${n.type || "TEXT"}`;
          return (
            n.nullable || (r += " NOT NULL"),
            n.default_value != null && (r += ` DEFAULT ${n.default_value}`),
            r
          );
        }
      }));
  });
var Ve,
  rr = b(() => {
    Ve = "public";
  });
function Ke(e, t) {
  return !e || e === Ve ? t : `${e}.${t}`;
}
var sr = b(() => {
  rr();
  rr();
});
function Hb(e, t) {
  return (
    e === "migrations" ||
    e === "supabase_migrations.schema_migrations" ||
    e === "supabase_migrations.seed_files" ||
    (t === "sqlite" && e === "seed_files")
  );
}
function ti(e, t) {
  let n = (r) => Hb(r, t);
  return {
    ...e,
    tables: e.tables.filter((r) => !n(r.name)),
    columns: e.columns.filter((r) => !n(r.table)),
    indexes: e.indexes.filter((r) => !n(r.table)),
    foreign_keys: e.foreign_keys.filter((r) => !n(r.table)),
    primary_keys: e.primary_keys.filter((r) => !n(r.table)),
  };
}
var Fa = b(() => {
  ei();
  lt();
  Da();
  ja();
  sr();
});
async function lf(e, t, n) {
  await e.runInTransaction(async (r) => {
    await sql`SET LOCAL client_min_messages TO warning`.execute(r);
    for (let s of t) {
      {
        await sql.raw(s).execute(r);
        continue;
      }
    }
  });
}
var cf = b(() => {});
function ge(e) {
  return e.dialect === "postgres"
    ? "pg"
    : e.config?.ddlDialect === "sqlite"
      ? "sqlite"
      : "pg-flat";
}
function Ct(e) {
  return e === "sqlite"
    ? { schema_migrations: "migrations", seed_files: "seed_files" }
    : e === "pg-flat"
      ? {
          schema_migrations: '"supabase_migrations.schema_migrations"',
          seed_files: '"supabase_migrations.seed_files"',
        }
      : {
          schema_migrations: "supabase_migrations.schema_migrations",
          seed_files: "supabase_migrations.seed_files",
        };
}
function ir(e) {
  return `'${e.replace(/'/g, "''")}'`;
}
function Gb(e) {
  return `'${`{${e.map((r) => `"${r.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(",")}}`.replace(/'/g, "''")}'`;
}
function uf(e, t) {
  return t == null ? "NULL" : e === "pg" ? Gb(t) : ir(JSON.stringify(t));
}
function Ma(e) {
  return e == null ? "NULL" : ir(e);
}
function pf(e) {
  if (e == null) return [];
  if (Array.isArray(e)) return e;
  if (typeof e == "string") {
    let t = e.trim();
    if (t === "") return [];
    try {
      let n = JSON.parse(t);
      return Array.isArray(n) ? n : [];
    } catch {
      return [];
    }
  }
  return [];
}
function Wb(e, t) {
  let n = () => {
    throw new Error(`Migration history ${String(t)} has invalid statements`);
  };
  if (e == null) return n();
  let r = e;
  if (typeof e == "string")
    try {
      r = JSON.parse(e);
    } catch {
      return n();
    }
  return !Array.isArray(r) || !r.every((s) => typeof s == "string") ? n() : r;
}
function Vb(e) {
  return {
    version: String(e.version),
    name: e.name ?? null,
    statements: pf(e.statements),
    rollback: pf(e.rollback),
    created_by: e.created_by ?? null,
    idempotency_key: e.idempotency_key ?? null,
  };
}
function Kb(e) {
  return { ...Vb(e), statements: Wb(e.statements, e.version) };
}
function ff(e) {
  let { schema_migrations: t, seed_files: n } = Ct(e);
  return e === "pg"
    ? [
        "CREATE SCHEMA IF NOT EXISTS supabase_migrations",
        `CREATE TABLE IF NOT EXISTS ${t} (
            version text NOT NULL PRIMARY KEY,
            statements text[],
            name text,
            created_by text,
            idempotency_key text,
            rollback text[]
         )`,
        `CREATE TABLE IF NOT EXISTS ${n} (
            path text NOT NULL PRIMARY KEY,
            hash text NOT NULL
         )`,
      ]
    : [
        `CREATE TABLE IF NOT EXISTS ${t} (
         version TEXT NOT NULL PRIMARY KEY,
         statements TEXT,
         name TEXT,
         created_by TEXT,
         idempotency_key TEXT,
         rollback TEXT
      )`,
        `CREATE TABLE IF NOT EXISTS ${n} (
         path TEXT NOT NULL PRIMARY KEY,
         hash TEXT NOT NULL
      )`,
      ];
}
function mf(e) {
  let { schema_migrations: t } = Ct(e);
  return [
    `CREATE UNIQUE INDEX IF NOT EXISTS ${e === "sqlite" ? "migrations_idempotency_key_idx" : "schema_migrations_idempotency_key_idx"} ON ${t} (idempotency_key)`,
  ];
}
function df(e, t) {
  let { schema_migrations: n } = Ct(e);
  return `INSERT INTO ${n} (version, name, statements, rollback, created_by, idempotency_key) VALUES (${ir(t.version)}, ${Ma(t.name)}, ${uf(e, t.statements)}, ${uf(e, t.rollback ?? null)}, ${Ma(t.created_by ?? null)}, ${Ma(t.idempotency_key ?? null)}) ON CONFLICT (idempotency_key) DO UPDATE SET version = EXCLUDED.version, name = EXCLUDED.name, statements = EXCLUDED.statements, rollback = EXCLUDED.rollback, created_by = EXCLUDED.created_by`;
}
function Xb(e) {
  let { schema_migrations: t } = Ct(e);
  return `SELECT version FROM ${t} ORDER BY version ASC`;
}
function Yb(e) {
  let { schema_migrations: t } = Ct(e);
  return `SELECT ${Jb} FROM ${t} ORDER BY version ASC`;
}
function Qb(e) {
  let { seed_files: t } = Ct(e);
  return t ? `SELECT path, hash FROM ${t}` : null;
}
function hf(e, t) {
  let { seed_files: n } = Ct(e);
  return n
    ? `INSERT INTO ${n} (path, hash) VALUES (${ir(t.path)}, ${ir(t.hash)}) ON CONFLICT (path) DO UPDATE SET hash = EXCLUDED.hash`
    : null;
}
async function Zb(e, t) {
  for (let n of gf(t))
    try {
      await e.exec(n);
    } catch {}
}
function gf(e) {
  let { schema_migrations: t } = Ct(e);
  return zb.map((n) => {
    let r = e === "pg" ? n.pgType : n.sqliteType;
    return `ALTER TABLE ${t} ADD COLUMN${e === "pg" ? " IF NOT EXISTS" : ""} ${n.name} ${r}`;
  });
}
async function un(e) {
  let t = ge(e);
  if (t === "pg") {
    await lf(e, [...ff(t), ...gf(t), ...mf(t)]);
    return;
  }
  for (let n of ff(t)) await e.exec(n);
  await Zb(e, t);
  for (let n of mf(t)) await e.exec(n);
}
async function or(e) {
  let t = ge(e);
  return ((await e.exec(Xb(t)))?.rows ?? []).map((r) => r.version);
}
async function ni(e) {
  let t = ge(e);
  return ((await e.exec(Yb(t)))?.rows ?? []).map(Kb);
}
async function yf(e) {
  let t = ge(e),
    n = Qb(t);
  return n
    ? ((await e.exec(n))?.rows ?? []).map((s) => ({
        path: s.path,
        hash: s.hash,
      }))
    : [];
}
var zb,
  Jb,
  rt = b(() => {
    cf();
    zb = [
      { name: "created_by", pgType: "text", sqliteType: "TEXT" },
      { name: "idempotency_key", pgType: "text", sqliteType: "TEXT" },
      { name: "rollback", pgType: "text[]", sqliteType: "TEXT" },
    ];
    Jb = "version, name, statements, rollback, created_by, idempotency_key";
  });
function pt(e) {
  let t = (r, s) => [...r].sort((i, o) => s(i).localeCompare(s(o))),
    n = {
      tables: t(e.tables ?? [], (r) => `${r.schema ?? ""}.${r.name}`).map(
        (r) => ({ schema: r.schema, name: r.name, type: r.type, sql: r.sql }),
      ),
      columns: t(
        e.columns ?? [],
        (r) => `${r.schema ?? ""}.${r.table}.${r.name}`,
      ).map((r) => ({
        schema: r.schema,
        table: r.table,
        name: r.name,
        type: r.type,
        nullable: r.nullable,
        default_value: r.default_value,
        is_primary_key: r.is_primary_key,
      })),
      indexes: t(
        e.indexes ?? [],
        (r) => `${r.schema ?? ""}.${r.table}.${r.name}`,
      ).map((r) => ({
        schema: r.schema,
        table: r.table,
        name: r.name,
        unique: r.unique,
        columns: r.columns,
        sql: r.sql,
      })),
      foreign_keys: t(
        e.foreign_keys ?? [],
        (r) =>
          `${r.schema ?? ""}.${r.table}.${r.column}->${r.ref_table}.${r.ref_column}`,
      ).map((r) => ({
        schema: r.schema,
        table: r.table,
        column: r.column,
        ref_schema: r.ref_schema,
        ref_table: r.ref_table,
        ref_column: r.ref_column,
      })),
      primary_keys: t(
        e.primary_keys ?? [],
        (r) => `${r.schema ?? ""}.${r.table}`,
      ).map((r) => ({ schema: r.schema, table: r.table, columns: r.columns })),
      check_constraints: t(
        e.check_constraints ?? [],
        (r) => `${r.schema ?? ""}.${r.table}.${r.name ?? ""}.${r.column ?? ""}`,
      ).map((r) => ({
        schema: r.schema,
        table: r.table,
        name: r.name,
        column: r.column,
        expression: r.expression,
      })),
      unique_constraints: t(
        e.unique_constraints ?? [],
        (r) => `${r.schema ?? ""}.${r.table}.${r.name}`,
      ).map((r) => ({
        schema: r.schema,
        table: r.table,
        name: r.name,
        columns: r.columns,
      })),
      views: t(e.views ?? [], (r) => `${r.schema ?? ""}.${r.name}`).map(
        (r) => ({ schema: r.schema, name: r.name, sql: r.sql }),
      ),
      triggers: t(
        e.triggers ?? [],
        (r) => `${r.schema ?? ""}.${r.table}.${r.name}`,
      ).map((r) => ({
        schema: r.schema,
        table: r.table,
        name: r.name,
        sql: r.sql,
      })),
      custom_types: t(
        e.custom_types ?? [],
        (r) => `${r.schema ?? ""}.${r.type}`,
      ).map((r) => ({
        schema: r.schema,
        type: r.type,
        kind: r.kind,
        values: r.values,
        fields: r.fields,
      })),
    };
  return createHash("sha256").update(JSON.stringify(n)).digest("hex");
}
var ar = b(() => {});
function lr(e) {
  return e.filter((t) => tw.test(t));
}
function ri(e, t) {
  return t.length === 0
    ? e
    : `${t.join(`;
`)};
${e}`;
}
var tw,
  Ua = b(() => {
    tw =
      /^(?:(?:\s+)|(?:--[^\n]*(?:\n|$))|(?:\/\*[\s\S]*?\*\/))*create\s+(?:or\s+replace\s+)?function\b/i;
  });
function wf(e) {
  return createHash("sha256").update(JSON.stringify(e)).digest("hex");
}
function Ba(e) {
  return e.connection.config.baseSchema ?? "";
}
function rw(e) {
  return wf(
    e.map(({ version: t, statements: n }) => ({ version: t, statements: n })),
  );
}
function qa(e) {
  return wf({ baseSchema: Ba(e) });
}
function sw(e) {
  let t = String(e).toLowerCase();
  return (
    t.includes("schema_migrations") &&
    (t.includes("no such table") || t.includes("does not exist"))
  );
}
async function Ha(e) {
  try {
    return await ni(e.connection);
  } catch (t) {
    if (sw(t)) return [];
    throw new Me(
      "invalid-history",
      `Applied migration history is invalid: ${String(t)}`,
      { cause: t },
    );
  }
}
async function Sf(e) {
  let t = await e.introspect({ postprocess: false }),
    n = e.config.ddlDialect;
  return pt(ti(t, n));
}
async function cr(e) {
  let t = await Ha(e);
  return {
    rows: t,
    sourceHash: rw(t),
    runtimeHash: qa(e),
    dbFingerprint: await Sf(e.connection),
  };
}
function iw(e) {
  return e
    .map((t) =>
      t.statements.join(`;
`),
    )
    .filter((t) => t.trim().length > 0).join(`;

`);
}
async function Ef() {
  let { createConnection: e } = await import("@supabase/lite/sqlite");
  return await e({ url: ":memory:", ddlDialect: "postgres" });
}
async function ow(e, t) {
  if (!t.trim()) return;
  let n = await e.translateDdl(t, { strict: true }),
    r = typeof n == "string" ? n : (n.ddl ?? "");
  for (let s of nt(r))
    try {
      await e.exec(s);
    } catch {}
}
async function aw(e, t) {
  let n = await Ef(),
    r = [];
  try {
    await ow(n, Ba(e));
    for (let s of t) {
      let i = s.statements.join(`;
`);
      if (!i.trim()) continue;
      let o = await n.translateDdl(ri(i, r)),
        a = typeof o == "string" ? o : (o.ddl ?? "");
      (await n.transaction(nt(a), { intent: "migration" }),
        r.push(...lr(s.statements)));
    }
    return await Sf(n);
  } finally {
    await n.close();
  }
}
async function lw(e, t) {
  let n = await Ef();
  try {
    let r = [Ba(e), iw(t)].filter((i) => i.trim()).join(`

`),
      s = await n.translateDdl(r, { strict: !0 });
    return SqliteConnection.serializeDeparseInfo(
      typeof s == "string" ? void 0 : s,
    );
  } finally {
    await n.close();
  }
}
async function _f(e, t) {
  let n = t ?? (await cr(e));
  try {
    let [r, s] = await Promise.all([lw(e, n.rows), aw(e, n.rows)]);
    if (s !== n.dbFingerprint)
      throw new Me(
        "drift",
        "The live database structure differs from the applied migration history.",
      );
    return { ...n, deparse: r };
  } catch (r) {
    throw r instanceof Me
      ? r
      : new Me(
          "translation",
          `Applied migration history could not be replayed: ${String(r)}`,
          { cause: r },
        );
  }
}
function Ga(e, t) {
  let n = e.connection;
  typeof n.updateDeparseInfo == "function" &&
    n.updateDeparseInfo(SqliteConnection.parseDeparseInfo(t, { strict: true }));
}
function si(e) {
  return ge(e.connection) === "pg-flat";
}
var Me,
  Wa = b(() => {
    _t();
    Fa();
    rt();
    ar();
    Ua();
    Me = class extends Error {
      constructor(n, r, s) {
        super(r, s);
        this.failure = n;
        this.name = "AppliedMetadataError";
      }
    };
  });
function za() {
  return Fe__default.join(process.cwd(), xf);
}
function Cf(e) {
  return createHash("sha256").update(JSON.stringify(e)).digest("hex");
}
async function fw(e) {
  let t = e.connection,
    n = await t.introspect({ postprocess: false });
  return pt(ti(n, t.config.ddlDialect));
}
async function mw(e, t, n = he__default) {
  let r = Fe__default.join(
    Fe__default.dirname(e),
    `.${Fe__default.basename(e)}.${process.pid}.${randomUUID()}.tmp`,
  );
  await n.mkdir(Fe__default.dirname(e), { recursive: true });
  try {
    (await n.writeFile(r, t, "utf-8"), await n.rename(r, e));
  } catch (s) {
    throw (await n.unlink(r).catch(() => {}), s);
  }
}
async function pr(e, t) {
  if (!si(e)) return false;
  try {
    let n = e.connection,
      r =
        t.metadata ??
        SqliteConnection.serializeDeparseInfo(n.config?.translation?.deparse),
      s = {
        v: Tf,
        workflow: t.workflow,
        sourceHash: t.sourceHash,
        runtimeHash: t.runtimeHash ?? qa(e),
        dbFingerprint: t.dbFingerprint ?? (await fw(e)),
        payloadChecksum: Cf(r),
        metadata: r,
      };
    return (await mw(za(), JSON.stringify(s)), !0);
  } catch (n) {
    return (
      console.warn(oi.default.yellow(`Could not write ${xf}: ${String(n)}`)),
      false
    );
  }
}
function dw(e) {
  return !ze(e) ||
    e.v !== Tf ||
    (e.workflow !== "migrations" && e.workflow !== "declarative") ||
    !ii(e.sourceHash) ||
    !ii(e.runtimeHash) ||
    !ii(e.dbFingerprint) ||
    !ii(e.payloadChecksum) ||
    !Af(e.metadata)
    ? false
    : Cf(e.metadata) === e.payloadChecksum;
}
async function hw(e, t) {
  if (typeof e.connection.updateDeparseInfo != "function") return false;
  let r;
  try {
    r = JSON.parse(await he__default.readFile(za(), "utf-8"));
  } catch {
    return false;
  }
  if (!dw(r) || r.workflow !== "migrations") return false;
  let s = t ?? (await cr(e));
  if (
    r.sourceHash !== s.sourceHash ||
    r.runtimeHash !== s.runtimeHash ||
    r.dbFingerprint !== s.dbFingerprint
  )
    return false;
  try {
    return (Ga(e, r.metadata), !0);
  } catch {
    return false;
  }
}
function bw(e) {
  return !ze(e) ||
    !Pe(e.name) ||
    !qt(e.table) ||
    !ft(e.schema, Pe) ||
    !Pe(e.command) ||
    !gw.has(e.command) ||
    typeof e.permissive != "boolean" ||
    !ai(e.roles) ||
    !ft(e.using, (t) => typeof t == "object")
    ? false
    : ft(e.withCheck, (t) => typeof t == "object");
}
function ww(e) {
  if (!ze(e) || !ze(e.context)) return false;
  let t = e.context;
  return !Pe(t.schema) ||
    !qt(t.table) ||
    !qt(t.column) ||
    !qt(t.pgTypeName) ||
    typeof t.nullable != "boolean" ||
    typeof t.isPrimaryKey != "boolean" ||
    typeof t.isUnique != "boolean" ||
    typeof t.isSerial != "boolean" ||
    !(t.defaultValue === null || Pe(t.defaultValue))
    ? false
    : ft(e.extra, ze);
}
function Sw(e) {
  return !ze(e) ||
    !Pe(e.schema) ||
    !qt(e.table) ||
    !Pe(e.kind) ||
    !yw.has(e.kind) ||
    !ai(e.columns) ||
    !ft(e.name, Pe) ||
    !ft(e.refSchema, Pe) ||
    !ft(e.refTable, Pe)
    ? false
    : ft(e.refColumns, ai);
}
function Ew(e) {
  return !ze(e) || !Pe(e.schema) || !qt(e.table) || !Pe(e.text)
    ? false
    : ft(e.column, Pe);
}
function Af(e) {
  return !(
    !ze(e) ||
    !ze(e.rls) ||
    !Array.isArray(e.rls.tables) ||
    !e.rls.tables.every(qt) ||
    !Array.isArray(e.rls.policies) ||
    !e.rls.policies.every(bw) ||
    !Va(e.vars, ze) ||
    !Va(e.enums, ai) ||
    !Va(e.schema, (t) => Array.isArray(t) && t.every(ww)) ||
    !Array.isArray(e.tableConstraints) ||
    !e.tableConstraints.every(Sw) ||
    !Array.isArray(e.comments) ||
    !e.comments.every(Ew)
  );
}
async function $f(e, t) {
  let n = await _f(e, t);
  if (!Af(n.deparse))
    throw new Me("translation", "Rebuilt runtime metadata is incomplete.");
  return (
    Ga(e, n.deparse),
    await pr(e, {
      workflow: "migrations",
      sourceHash: n.sourceHash,
      runtimeHash: n.runtimeHash,
      dbFingerprint: n.dbFingerprint,
      metadata: n.deparse,
    }),
    n
  );
}
async function fn(e) {
  if (!si(e)) return true;
  try {
    let t = await cr(e);
    return (await $f(e, t), pn.delete(e), !0);
  } catch (t) {
    let n =
      t instanceof Me ? t : new Me("translation", String(t), { cause: t });
    return (pn.set(e, n), false);
  }
}
async function Rf(e) {
  if (!si(e)) return "skipped";
  try {
    let t = await cr(e);
    return (await hw(e, t))
      ? (pn.delete(e),
        console.log(
          oi.default.dim(
            "Runtime metadata restored from supabase/.temp/.runtime-metadata-cache.json",
          ),
        ),
        "restored")
      : (await $f(e, t),
        pn.delete(e),
        console.log(
          oi.default.dim("Runtime metadata rebuilt from applied migrations."),
        ),
        "recalculated");
  } catch (t) {
    let n =
      t instanceof Me ? t : new Me("translation", String(t), { cause: t });
    return (pn.set(e, n), "failed");
  }
}
async function vf(e) {
  let t = pn.get(e);
  return t?.failure === "invalid-history"
    ? [
        t.message,
        "Run `lite db reset` to recreate the database from valid migration files.",
      ]
    : t?.failure === "drift"
      ? [
          t.message,
          "Run `lite db reset` to replay the applied migrations onto a fresh database.",
        ]
      : [
          t?.message ??
            "Applied migration metadata could not be reconstructed.",
          "Run `lite db reset` to rebuild the database and runtime metadata.",
        ];
}
async function kf() {
  try {
    await he__default.unlink(za());
  } catch {}
}
var oi,
  xf,
  Tf,
  pn,
  gw,
  yw,
  ze,
  Pe,
  qt,
  ai,
  ft,
  Va,
  ii,
  fr = b(() => {
    oi = z(J());
    Wa();
    ar();
    Fa();
    ((xf = "supabase/.temp/.runtime-metadata-cache.json"),
      (Tf = 4),
      (pn = new WeakMap()));
    ((gw = new Set(["SELECT", "INSERT", "UPDATE", "DELETE", "ALL"])),
      (yw = new Set(["unique", "check", "foreign_key"])),
      (ze = (e) => typeof e == "object" && e !== null && !Array.isArray(e)),
      (Pe = (e) => typeof e == "string"),
      (qt = (e) => typeof e == "string" && e.length > 0),
      (ai = (e) => Array.isArray(e) && e.every(Pe)),
      (ft = (e, t) => e == null || t(e)),
      (Va = (e, t) => ze(e) && Object.values(e).every(t)),
      (ii = (e) => typeof e == "string" && /^[a-f0-9]{64}$/.test(e)));
  });
var Pf = {};
pe(Pf, { start: () => _w });
var mr,
  _w,
  Nf = b(() => {
    $a();
    lt();
    mr = z(J());
    jt();
    Ee();
    Se();
    Nt();
    Oa();
    La();
    Ia();
    fr();
    _w = (e) => {
      e.command("start")
        .option("--config <config>", "Path to the config file")
        .option(
          "--host [host]",
          "Specify hostname (use without a value to expose all interfaces)",
        )
        .option("--admin", "Enable local admin mode explicitly")
        .option(
          "--no-admin",
          "Disable local admin mode (keyless requests are no longer elevated; normal authentication rules apply)",
        )
        .description("Start the development server")
        .helpGroup("Local Development:")
        .action(async (t, n) => {
          (await Y(t.config),
            await Ts(
              async () => {
                let r = Zs(t, n),
                  i = await (
                    await V({ withSupabaseClient: false })
                  ).project.local.createApp(t.config, {
                    admin: r.admin,
                    adminDefault: r.adminDefault,
                  });
                if (
                  (i.hasEnabledSystemBaseSchema() &&
                    (await i.ensureSystemSchema()),
                  (await Rf(i)) === "failed")
                ) {
                  console.error(
                    mr.default.red(
                      "Runtime metadata could not be loaded or rebuilt for this project.",
                    ),
                  );
                  for (let p of await vf(i)) console.error(mr.default.dim(p));
                  process.exit(1);
                }
                let a = i.config.api?.port ?? fe.default_api_port,
                  l = await js(i, { port: a, host: r.host });
                (Ys(r.host, a),
                  Xs(i.config),
                  Js(i.adminMode),
                  r.warnAdminDisabled && Qs());
                let c = os();
                (c && console.log(mr.default.yellow(` \u26A0 ${c}`)),
                  await i.connection.ping(),
                  zs(async () => {
                    (await l(), await i.connection.close());
                  }));
              },
              (r) => {
                (console.log(),
                  console.log(mr.default.green(`Ready in ${r.toFixed(2)}ms`)));
              },
            ));
        });
    };
  });
function vw(e) {
  let t = normalize(e);
  return (
    t.length > 1 &&
      t[t.length - 1] === sep &&
      (t = t.substring(0, t.length - 1)),
    t
  );
}
function Df(e, t) {
  return e.replace(kw, t);
}
function Nw(e) {
  return e === "/" || Pw.test(e);
}
function Xa(e, t) {
  let { resolvePaths: n, normalizePath: r, pathSeparator: s } = t,
    i = (process.platform === "win32" && e.includes("/")) || e.startsWith(".");
  if ((n && (e = resolve(e)), (r || i) && (e = vw(e)), e === ".")) return "";
  let o = e[e.length - 1] !== s;
  return Df(o ? e + s : e, s);
}
function jf(e, t) {
  return t + e;
}
function Ow(e, t) {
  return function (n, r) {
    return r.startsWith(e)
      ? r.slice(e.length) + n
      : Df(relative(e, r), t.pathSeparator) + t.pathSeparator + n;
  };
}
function Lw(e) {
  return e;
}
function Iw(e, t, n) {
  return t + e + n;
}
function Dw(e, t) {
  let { relativePaths: n, includeBasePath: r } = t;
  return n && e ? Ow(e, t) : r ? jf : Lw;
}
function jw(e) {
  return function (t, n) {
    n.push(t.substring(e.length) || ".");
  };
}
function Fw(e) {
  return function (t, n, r) {
    let s = t.substring(e.length) || ".";
    r.every((i) => i(s, true)) && n.push(s);
  };
}
function qw(e, t) {
  let { includeDirs: n, filters: r, relativePaths: s } = t;
  return n
    ? s
      ? r && r.length
        ? Fw(e)
        : jw(e)
      : r && r.length
        ? Uw
        : Mw
    : Bw;
}
function zw(e) {
  let { excludeFiles: t, filters: n, onlyCounts: r } = e;
  return t ? Kw : n && n.length ? (r ? Hw : Gw) : r ? Ww : Vw;
}
function Yw(e) {
  return e.group ? Jw : Xw;
}
function eS(e) {
  return e.group ? Qw : Zw;
}
function rS(e, t) {
  return !e.resolveSymlinks || e.excludeSymlinks ? null : t ? nS : tS;
}
function Ff(e, t, n) {
  if (n.options.useRealPaths) return sS(t, n);
  let r = dirname(e),
    s = 1;
  for (; r !== n.root && s < 2; ) {
    let i = n.symlinks.get(r);
    !!i && (i === t || i.startsWith(t) || t.startsWith(i))
      ? s++
      : (r = dirname(r));
  }
  return (n.symlinks.set(e, t), s > 1);
}
function sS(e, t) {
  return t.visited.includes(e + t.options.pathSeparator);
}
function li(e, t, n, r) {
  t(e && !r ? e : null, n);
}
function mS(e, t) {
  let { onlyCounts: n, group: r, maxFiles: s } = e;
  return n
    ? t
      ? iS
      : cS
    : r
      ? t
        ? oS
        : fS
      : s
        ? t
          ? lS
          : pS
        : t
          ? aS
          : uS;
}
function gS(e) {
  return e ? hS : dS;
}
function SS(e, t) {
  return new Promise((n, r) => {
    Bf(e, t, (s, i) => {
      if (s) return r(s);
      n(i);
    });
  });
}
function Bf(e, t, n) {
  new Uf(e, t, n).start();
}
function ES(e, t) {
  return new Uf(e, t).start();
}
var Of,
  kw,
  Pw,
  Mw,
  Uw,
  Bw,
  Hw,
  Gw,
  Ww,
  Vw,
  Kw,
  Xw,
  Jw,
  Qw,
  Zw,
  tS,
  nS,
  iS,
  oS,
  aS,
  lS,
  cS,
  uS,
  pS,
  fS,
  Mf,
  dS,
  hS,
  yS,
  bS,
  wS,
  Uf,
  Lf,
  qf,
  Hf,
  Gf = b(() => {
    Of = createRequire(import.meta.url);
    kw = /[\\/]/g;
    Pw = /^[a-z]:[\\/]$/i;
    ((Mw = (e, t) => {
      t.push(e || ".");
    }),
      (Uw = (e, t, n) => {
        let r = e || ".";
        n.every((s) => s(r, true)) && t.push(r);
      }),
      (Bw = () => {}));
    ((Hw = (e, t, n, r) => {
      r.every((s) => s(e, false)) && n.files++;
    }),
      (Gw = (e, t, n, r) => {
        r.every((s) => s(e, false)) && t.push(e);
      }),
      (Ww = (e, t, n, r) => {
        n.files++;
      }),
      (Vw = (e, t) => {
        t.push(e);
      }),
      (Kw = () => {}));
    ((Xw = (e) => e), (Jw = () => [""].slice(0, 0)));
    ((Qw = (e, t, n) => {
      e.push({ directory: t, files: n, dir: t });
    }),
      (Zw = () => {}));
    ((tS = function (e, t, n) {
      let {
        queue: r,
        fs: s,
        options: { suppressErrors: i },
      } = t;
      (r.enqueue(),
        s.realpath(e, (o, a) => {
          if (o) return r.dequeue(i ? null : o, t);
          s.stat(a, (l, c) => {
            if (l) return r.dequeue(i ? null : l, t);
            if (c.isDirectory() && Ff(e, a, t)) return r.dequeue(null, t);
            (n(c, a), r.dequeue(null, t));
          });
        }));
    }),
      (nS = function (e, t, n) {
        let {
          queue: r,
          fs: s,
          options: { suppressErrors: i },
        } = t;
        r.enqueue();
        try {
          let o = s.realpathSync(e),
            a = s.statSync(o);
          if (a.isDirectory() && Ff(e, o, t)) return;
          n(a, o);
        } catch (o) {
          if (!i) throw o;
        }
      }));
    ((iS = (e) => e.counts),
      (oS = (e) => e.groups),
      (aS = (e) => e.paths),
      (lS = (e) => e.paths.slice(0, e.options.maxFiles)),
      (cS = (e, t, n) => (li(t, n, e.counts, e.options.suppressErrors), null)),
      (uS = (e, t, n) => (li(t, n, e.paths, e.options.suppressErrors), null)),
      (pS = (e, t, n) => (
        li(
          t,
          n,
          e.paths.slice(0, e.options.maxFiles),
          e.options.suppressErrors,
        ),
        null
      )),
      (fS = (e, t, n) => (li(t, n, e.groups, e.options.suppressErrors), null)));
    ((Mf = { withFileTypes: true }),
      (dS = (e, t, n, r, s) => {
        if ((e.queue.enqueue(), r < 0)) return e.queue.dequeue(null, e);
        let { fs: i } = e;
        (e.visited.push(t),
          e.counts.directories++,
          i.readdir(t || ".", Mf, (o, a = []) => {
            (s(a, n, r),
              e.queue.dequeue(e.options.suppressErrors ? null : o, e));
          }));
      }),
      (hS = (e, t, n, r, s) => {
        let { fs: i } = e;
        if (r < 0) return;
        (e.visited.push(t), e.counts.directories++);
        let o = [];
        try {
          o = i.readdirSync(t || ".", Mf);
        } catch (a) {
          if (!e.options.suppressErrors) throw a;
        }
        s(o, n, r);
      }));
    ((yS = class {
      count = 0;
      constructor(e) {
        this.onQueueEmpty = e;
      }
      enqueue() {
        return (this.count++, this.count);
      }
      dequeue(e, t) {
        this.onQueueEmpty &&
          (--this.count <= 0 || e) &&
          (this.onQueueEmpty(e, t),
          e && (t.controller.abort(), (this.onQueueEmpty = void 0)));
      }
    }),
      (bS = class {
        _files = 0;
        _directories = 0;
        set files(e) {
          this._files = e;
        }
        get files() {
          return this._files;
        }
        set directories(e) {
          this._directories = e;
        }
        get directories() {
          return this._directories;
        }
        get dirs() {
          return this._directories;
        }
      }),
      (wS = class {
        aborted = false;
        abort() {
          this.aborted = true;
        }
      }),
      (Uf = class {
        root;
        isSynchronous;
        state;
        joinPath;
        pushDirectory;
        pushFile;
        getArray;
        groupFiles;
        resolveSymlink;
        walkDirectory;
        callbackInvoker;
        constructor(e, t, n) {
          ((this.isSynchronous = !n),
            (this.callbackInvoker = mS(t, this.isSynchronous)),
            (this.root = Xa(e, t)),
            (this.state = {
              root: Nw(this.root) ? this.root : this.root.slice(0, -1),
              paths: [""].slice(0, 0),
              groups: [],
              counts: new bS(),
              options: t,
              queue: new yS((r, s) => this.callbackInvoker(s, r, n)),
              symlinks: new Map(),
              visited: [""].slice(0, 0),
              controller: new wS(),
              fs: t.fs || Rw,
            }),
            (this.joinPath = Dw(this.root, t)),
            (this.pushDirectory = qw(this.root, t)),
            (this.pushFile = zw(t)),
            (this.getArray = Yw(t)),
            (this.groupFiles = eS(t)),
            (this.resolveSymlink = rS(t, this.isSynchronous)),
            (this.walkDirectory = gS(this.isSynchronous)));
        }
        start() {
          return (
            this.pushDirectory(
              this.root,
              this.state.paths,
              this.state.options.filters,
            ),
            this.walkDirectory(
              this.state,
              this.root,
              this.root,
              this.state.options.maxDepth,
              this.walk,
            ),
            this.isSynchronous ? this.callbackInvoker(this.state, null) : null
          );
        }
        walk = (e, t, n) => {
          let {
            paths: r,
            options: {
              filters: s,
              resolveSymlinks: i,
              excludeSymlinks: o,
              exclude: a,
              maxFiles: l,
              signal: c,
              useRealPaths: p,
              pathSeparator: u,
            },
            controller: f,
          } = this.state;
          if (f.aborted || (c && c.aborted) || (l && r.length > l)) return;
          let h = this.getArray(this.state.paths);
          for (let m = 0; m < e.length; ++m) {
            let d = e[m];
            if (d.isFile() || (d.isSymbolicLink() && !i && !o)) {
              let g = this.joinPath(d.name, t);
              this.pushFile(g, h, this.state.counts, s);
            } else if (d.isDirectory()) {
              let g = Iw(d.name, t, this.state.options.pathSeparator);
              if (a && a(d.name, g)) continue;
              (this.pushDirectory(g, r, s),
                this.walkDirectory(this.state, g, g, n - 1, this.walk));
            } else if (this.resolveSymlink && d.isSymbolicLink()) {
              let g = jf(d.name, t);
              this.resolveSymlink(g, this.state, (y, _) => {
                if (y.isDirectory()) {
                  if (
                    ((_ = Xa(_, this.state.options)),
                    a && a(d.name, p ? _ : g + u))
                  )
                    return;
                  this.walkDirectory(
                    this.state,
                    _,
                    p ? _ : g + u,
                    n - 1,
                    this.walk,
                  );
                } else {
                  _ = p ? _ : g;
                  let x = basename(_),
                    $ = Xa(dirname(_), this.state.options);
                  ((_ = this.joinPath(x, $)),
                    this.pushFile(_, h, this.state.counts, s));
                }
              });
            }
          }
          this.groupFiles(this.state.groups, t, h);
        };
      }));
    ((Lf = class {
      constructor(e, t) {
        ((this.root = e), (this.options = t));
      }
      withPromise() {
        return SS(this.root, this.options);
      }
      withCallback(e) {
        Bf(this.root, this.options, e);
      }
      sync() {
        return ES(this.root, this.options);
      }
    }),
      (qf = null));
    try {
      (Of.resolve("picomatch"), (qf = Of("picomatch")));
    } catch {}
    Hf = class {
      globCache = {};
      options = {
        maxDepth: 1 / 0,
        suppressErrors: true,
        pathSeparator: sep,
        filters: [],
      };
      globFunction;
      constructor(e) {
        ((this.options = { ...this.options, ...e }),
          (this.globFunction = this.options.globFunction));
      }
      group() {
        return ((this.options.group = true), this);
      }
      withPathSeparator(e) {
        return ((this.options.pathSeparator = e), this);
      }
      withBasePath() {
        return ((this.options.includeBasePath = true), this);
      }
      withRelativePaths() {
        return ((this.options.relativePaths = true), this);
      }
      withDirs() {
        return ((this.options.includeDirs = true), this);
      }
      withMaxDepth(e) {
        return ((this.options.maxDepth = e), this);
      }
      withMaxFiles(e) {
        return ((this.options.maxFiles = e), this);
      }
      withFullPaths() {
        return (
          (this.options.resolvePaths = true),
          (this.options.includeBasePath = true),
          this
        );
      }
      withErrors() {
        return ((this.options.suppressErrors = false), this);
      }
      withSymlinks({ resolvePaths: e = true } = {}) {
        return (
          (this.options.resolveSymlinks = true),
          (this.options.useRealPaths = e),
          this.withFullPaths()
        );
      }
      withAbortSignal(e) {
        return ((this.options.signal = e), this);
      }
      normalize() {
        return ((this.options.normalizePath = true), this);
      }
      filter(e) {
        return (this.options.filters.push(e), this);
      }
      onlyDirs() {
        return (
          (this.options.excludeFiles = true),
          (this.options.includeDirs = true),
          this
        );
      }
      exclude(e) {
        return ((this.options.exclude = e), this);
      }
      onlyCounts() {
        return ((this.options.onlyCounts = true), this);
      }
      crawl(e) {
        return new Lf(e || ".", this.options);
      }
      withGlobFunction(e) {
        return ((this.globFunction = e), this);
      }
      crawlWithOptions(e, t) {
        return (
          (this.options = { ...this.options, ...t }),
          new Lf(e || ".", this.options)
        );
      }
      glob(...e) {
        return this.globFunction
          ? this.globWithOptions(e)
          : this.globWithOptions(e, { dot: true });
      }
      globWithOptions(e, ...t) {
        let n = this.globFunction || qf;
        if (!n)
          throw new Error(
            "Please specify a glob function to use glob matching.",
          );
        var r = this.globCache[e.join("\0")];
        return (
          r || ((r = n(e, ...t)), (this.globCache[e.join("\0")] = r)),
          this.options.filters.push((s) => r(s)),
          this
        );
      }
    };
  });
var dr = Et((ck, Xf) => {
  var Wf = "[^\\\\/]",
    _S = "(?=.)",
    Vf = "[^/]",
    Ya = "(?:\\/|$)",
    Kf = "(?:^|\\/)",
    Qa = `\\.{1,2}${Ya}`,
    xS = "(?!\\.)",
    TS = `(?!${Kf}${Qa})`,
    CS = `(?!\\.{0,1}${Ya})`,
    AS = `(?!${Qa})`,
    $S = "[^.\\/]",
    RS = `${Vf}*?`,
    vS = "/",
    zf = {
      DOT_LITERAL: "\\.",
      PLUS_LITERAL: "\\+",
      QMARK_LITERAL: "\\?",
      SLASH_LITERAL: "\\/",
      ONE_CHAR: _S,
      QMARK: Vf,
      END_ANCHOR: Ya,
      DOTS_SLASH: Qa,
      NO_DOT: xS,
      NO_DOTS: TS,
      NO_DOT_SLASH: CS,
      NO_DOTS_SLASH: AS,
      QMARK_NO_DOT: $S,
      STAR: RS,
      START_ANCHOR: Kf,
      SEP: vS,
    },
    kS = {
      ...zf,
      SLASH_LITERAL: "[\\\\/]",
      QMARK: Wf,
      STAR: `${Wf}*?`,
      DOTS_SLASH: "\\.{1,2}(?:[\\\\/]|$)",
      NO_DOT: "(?!\\.)",
      NO_DOTS: "(?!(?:^|[\\\\/])\\.{1,2}(?:[\\\\/]|$))",
      NO_DOT_SLASH: "(?!\\.{0,1}(?:[\\\\/]|$))",
      NO_DOTS_SLASH: "(?!\\.{1,2}(?:[\\\\/]|$))",
      QMARK_NO_DOT: "[^.\\\\/]",
      START_ANCHOR: "(?:^|[\\\\/])",
      END_ANCHOR: "(?:[\\\\/]|$)",
      SEP: "\\",
    },
    PS = {
      __proto__: null,
      alnum: "a-zA-Z0-9",
      alpha: "a-zA-Z",
      ascii: "\\x00-\\x7F",
      blank: " \\t",
      cntrl: "\\x00-\\x1F\\x7F",
      digit: "0-9",
      graph: "\\x21-\\x7E",
      lower: "a-z",
      print: "\\x20-\\x7E ",
      punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
      space: " \\t\\r\\n\\v\\f",
      upper: "A-Z",
      word: "A-Za-z0-9_",
      xdigit: "A-Fa-f0-9",
    };
  Xf.exports = {
    DEFAULT_MAX_EXTGLOB_RECURSION: 0,
    MAX_LENGTH: 1024 * 64,
    POSIX_REGEX_SOURCE: PS,
    REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
    REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
    REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
    REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
    REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
    REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
    REPLACEMENTS: {
      __proto__: null,
      "***": "*",
      "**/**": "**",
      "**/**/**": "**",
    },
    CHAR_0: 48,
    CHAR_9: 57,
    CHAR_UPPERCASE_A: 65,
    CHAR_LOWERCASE_A: 97,
    CHAR_UPPERCASE_Z: 90,
    CHAR_LOWERCASE_Z: 122,
    CHAR_LEFT_PARENTHESES: 40,
    CHAR_RIGHT_PARENTHESES: 41,
    CHAR_ASTERISK: 42,
    CHAR_AMPERSAND: 38,
    CHAR_AT: 64,
    CHAR_BACKWARD_SLASH: 92,
    CHAR_CARRIAGE_RETURN: 13,
    CHAR_CIRCUMFLEX_ACCENT: 94,
    CHAR_COLON: 58,
    CHAR_COMMA: 44,
    CHAR_DOT: 46,
    CHAR_DOUBLE_QUOTE: 34,
    CHAR_EQUAL: 61,
    CHAR_EXCLAMATION_MARK: 33,
    CHAR_FORM_FEED: 12,
    CHAR_FORWARD_SLASH: 47,
    CHAR_GRAVE_ACCENT: 96,
    CHAR_HASH: 35,
    CHAR_HYPHEN_MINUS: 45,
    CHAR_LEFT_ANGLE_BRACKET: 60,
    CHAR_LEFT_CURLY_BRACE: 123,
    CHAR_LEFT_SQUARE_BRACKET: 91,
    CHAR_LINE_FEED: 10,
    CHAR_NO_BREAK_SPACE: 160,
    CHAR_PERCENT: 37,
    CHAR_PLUS: 43,
    CHAR_QUESTION_MARK: 63,
    CHAR_RIGHT_ANGLE_BRACKET: 62,
    CHAR_RIGHT_CURLY_BRACE: 125,
    CHAR_RIGHT_SQUARE_BRACKET: 93,
    CHAR_SEMICOLON: 59,
    CHAR_SINGLE_QUOTE: 39,
    CHAR_SPACE: 32,
    CHAR_TAB: 9,
    CHAR_UNDERSCORE: 95,
    CHAR_VERTICAL_LINE: 124,
    CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
    extglobChars(e) {
      return {
        "!": { type: "negate", open: "(?:(?!(?:", close: `))${e.STAR})` },
        "?": { type: "qmark", open: "(?:", close: ")?" },
        "+": { type: "plus", open: "(?:", close: ")+" },
        "*": { type: "star", open: "(?:", close: ")*" },
        "@": { type: "at", open: "(?:", close: ")" },
      };
    },
    globChars(e) {
      return e === true ? kS : zf;
    },
  };
});
var hr = Et((Ne) => {
  var {
    REGEX_BACKSLASH: NS,
    REGEX_REMOVE_BACKSLASH: OS,
    REGEX_SPECIAL_CHARS: LS,
    REGEX_SPECIAL_CHARS_GLOBAL: IS,
  } = dr();
  Ne.isObject = (e) => e !== null && typeof e == "object" && !Array.isArray(e);
  Ne.hasRegexChars = (e) => LS.test(e);
  Ne.isRegexChar = (e) => e.length === 1 && Ne.hasRegexChars(e);
  Ne.escapeRegex = (e) => e.replace(IS, "\\$1");
  Ne.toPosixSlashes = (e) => e.replace(NS, "/");
  Ne.isWindows = () => {
    if (typeof navigator < "u" && navigator.platform) {
      let e = navigator.platform.toLowerCase();
      return e === "win32" || e === "windows";
    }
    return typeof process < "u" && process.platform
      ? process.platform === "win32"
      : false;
  };
  Ne.removeBackslashes = (e) => e.replace(OS, (t) => (t === "\\" ? "" : t));
  Ne.escapeLast = (e, t, n) => {
    let r = e.lastIndexOf(t, n);
    return r === -1
      ? e
      : e[r - 1] === "\\"
        ? Ne.escapeLast(e, t, r - 1)
        : `${e.slice(0, r)}\\${e.slice(r)}`;
  };
  Ne.removePrefix = (e, t = {}) => {
    let n = e;
    return (n.startsWith("./") && ((n = n.slice(2)), (t.prefix = "./")), n);
  };
  Ne.wrapOutput = (e, t = {}, n = {}) => {
    let r = n.contains ? "" : "^",
      s = n.contains ? "" : "$",
      i = `${r}(?:${e})${s}`;
    return (t.negated === true && (i = `(?:^(?!${i}).*$)`), i);
  };
  Ne.basename = (e, { windows: t } = {}) => {
    let n = e.split(t ? /[\\/]/ : "/"),
      r = n[n.length - 1];
    return r === "" ? n[n.length - 2] : r;
  };
});
var rm = Et((pk, nm) => {
  var Jf = hr(),
    {
      CHAR_ASTERISK: Za,
      CHAR_AT: DS,
      CHAR_BACKWARD_SLASH: gr,
      CHAR_COMMA: jS,
      CHAR_DOT: el,
      CHAR_EXCLAMATION_MARK: tl,
      CHAR_FORWARD_SLASH: tm,
      CHAR_LEFT_CURLY_BRACE: nl,
      CHAR_LEFT_PARENTHESES: rl,
      CHAR_LEFT_SQUARE_BRACKET: FS,
      CHAR_PLUS: MS,
      CHAR_QUESTION_MARK: Yf,
      CHAR_RIGHT_CURLY_BRACE: US,
      CHAR_RIGHT_PARENTHESES: Qf,
      CHAR_RIGHT_SQUARE_BRACKET: BS,
    } = dr(),
    Zf = (e) => e === tm || e === gr,
    em = (e) => {
      e.isPrefix !== true && (e.depth = e.isGlobstar ? 1 / 0 : 1);
    },
    qS = (e, t) => {
      let n = t || {},
        r = e.length - 1,
        s = n.parts === true || n.scanToEnd === true,
        i = [],
        o = [],
        a = [],
        l = e,
        c = -1,
        p = 0,
        u = 0,
        f = false,
        h = false,
        m = false,
        d = false,
        g = false,
        y = false,
        _ = false,
        x = false,
        $ = false,
        C = false,
        v = 0,
        A,
        T,
        L = { value: "", depth: 0, isGlob: false },
        E = () => c >= r,
        R = () => l.charCodeAt(c + 1),
        F = () => ((A = T), l.charCodeAt(++c));
      for (; c < r; ) {
        T = F();
        let D;
        if (T === gr) {
          ((_ = L.backslashes = true), (T = F()), T === nl && (y = true));
          continue;
        }
        if (y === true || T === nl) {
          for (v++; E() !== true && (T = F()); ) {
            if (T === gr) {
              ((_ = L.backslashes = true), F());
              continue;
            }
            if (T === nl) {
              v++;
              continue;
            }
            if (y !== true && T === el && (T = F()) === el) {
              if (
                ((f = L.isBrace = true),
                (m = L.isGlob = true),
                (C = true),
                s === true)
              )
                continue;
              break;
            }
            if (y !== true && T === jS) {
              if (
                ((f = L.isBrace = true),
                (m = L.isGlob = true),
                (C = true),
                s === true)
              )
                continue;
              break;
            }
            if (T === US && (v--, v === 0)) {
              ((y = false), (f = L.isBrace = true), (C = true));
              break;
            }
          }
          if (s === true) continue;
          break;
        }
        if (T === tm) {
          if (
            (i.push(c),
            o.push(L),
            (L = { value: "", depth: 0, isGlob: false }),
            C === true)
          )
            continue;
          if (A === el && c === p + 1) {
            p += 2;
            continue;
          }
          u = c + 1;
          continue;
        }
        if (
          n.noext !== true &&
          (T === MS || T === DS || T === Za || T === Yf || T === tl) === true &&
          R() === rl
        ) {
          if (
            ((m = L.isGlob = true),
            (d = L.isExtglob = true),
            (C = true),
            T === tl && c === p && ($ = true),
            s === true)
          ) {
            for (; E() !== true && (T = F()); ) {
              if (T === gr) {
                ((_ = L.backslashes = true), (T = F()));
                continue;
              }
              if (T === Qf) {
                ((m = L.isGlob = true), (C = true));
                break;
              }
            }
            continue;
          }
          break;
        }
        if (T === Za) {
          if (
            (A === Za && (g = L.isGlobstar = true),
            (m = L.isGlob = true),
            (C = true),
            s === true)
          )
            continue;
          break;
        }
        if (T === Yf) {
          if (((m = L.isGlob = true), (C = true), s === true)) continue;
          break;
        }
        if (T === FS) {
          for (; E() !== true && (D = F()); ) {
            if (D === gr) {
              ((_ = L.backslashes = true), F());
              continue;
            }
            if (D === BS) {
              ((h = L.isBracket = true), (m = L.isGlob = true), (C = true));
              break;
            }
          }
          if (s === true) continue;
          break;
        }
        if (n.nonegate !== true && T === tl && c === p) {
          ((x = L.negated = true), p++);
          continue;
        }
        if (n.noparen !== true && T === rl) {
          if (((m = L.isGlob = true), s === true)) {
            for (; E() !== true && (T = F()); ) {
              if (T === rl) {
                ((_ = L.backslashes = true), (T = F()));
                continue;
              }
              if (T === Qf) {
                C = true;
                break;
              }
            }
            continue;
          }
          break;
        }
        if (m === true) {
          if (((C = true), s === true)) continue;
          break;
        }
      }
      n.noext === true && ((d = false), (m = false));
      let j = l,
        w = "",
        S = "";
      (p > 0 && ((w = l.slice(0, p)), (l = l.slice(p)), (u -= p)),
        j && m === true && u > 0
          ? ((j = l.slice(0, u)), (S = l.slice(u)))
          : m === true
            ? ((j = ""), (S = l))
            : (j = l),
        j &&
          j !== "" &&
          j !== "/" &&
          j !== l &&
          Zf(j.charCodeAt(j.length - 1)) &&
          (j = j.slice(0, -1)),
        n.unescape === true &&
          (S && (S = Jf.removeBackslashes(S)),
          j && _ === true && (j = Jf.removeBackslashes(j))));
      let I = {
        prefix: w,
        input: e,
        start: p,
        base: j,
        glob: S,
        isBrace: f,
        isBracket: h,
        isGlob: m,
        isExtglob: d,
        isGlobstar: g,
        negated: x,
        negatedExtglob: $,
      };
      if (
        (n.tokens === true &&
          ((I.maxDepth = 0), Zf(T) || o.push(L), (I.tokens = o)),
        n.parts === true || n.tokens === true)
      ) {
        let D;
        for (let K = 0; K < i.length; K++) {
          let H = D ? D + 1 : p,
            ne = i[K],
            Re = e.slice(H, ne);
          (n.tokens &&
            (K === 0 && p !== 0
              ? ((o[K].isPrefix = true), (o[K].value = w))
              : (o[K].value = Re),
            em(o[K]),
            (I.maxDepth += o[K].depth)),
            (K !== 0 || Re !== "") && a.push(Re),
            (D = ne));
        }
        if (D && D + 1 < e.length) {
          let K = e.slice(D + 1);
          (a.push(K),
            n.tokens &&
              ((o[o.length - 1].value = K),
              em(o[o.length - 1]),
              (I.maxDepth += o[o.length - 1].depth)));
        }
        ((I.slashes = i), (I.parts = a));
      }
      return I;
    };
  nm.exports = qS;
});
var lm = Et((fk, am) => {
  var yr = dr(),
    De = hr(),
    {
      MAX_LENGTH: ci,
      POSIX_REGEX_SOURCE: HS,
      REGEX_NON_SPECIAL_CHARS: GS,
      REGEX_SPECIAL_CHARS_BACKREF: WS,
      REPLACEMENTS: sm,
    } = yr,
    VS = (e, t) => {
      if (typeof t.expandRange == "function") return t.expandRange(...e, t);
      e.sort();
      let n = `[${e.join("-")}]`;
      try {
        new RegExp(n);
      } catch {
        return e.map((s) => De.escapeRegex(s)).join("..");
      }
      return n;
    },
    mn = (e, t) =>
      `Missing ${e}: "${t}" - use "\\\\${t}" to match literal characters`,
    im = (e) => {
      let t = [],
        n = 0,
        r = 0,
        s = 0,
        i = "",
        o = false;
      for (let a of e) {
        if (o === true) {
          ((i += a), (o = false));
          continue;
        }
        if (a === "\\") {
          ((i += a), (o = true));
          continue;
        }
        if (a === '"') {
          ((s = s === 1 ? 0 : 1), (i += a));
          continue;
        }
        if (s === 0) {
          if (a === "[") n++;
          else if (a === "]" && n > 0) n--;
          else if (n === 0) {
            if (a === "(") r++;
            else if (a === ")" && r > 0) r--;
            else if (a === "|" && r === 0) {
              (t.push(i), (i = ""));
              continue;
            }
          }
        }
        i += a;
      }
      return (t.push(i), t);
    },
    KS = (e) => {
      let t = false;
      for (let n of e) {
        if (t === true) {
          t = false;
          continue;
        }
        if (n === "\\") {
          t = true;
          continue;
        }
        if (/[?*+@!()[\]{}]/.test(n)) return false;
      }
      return true;
    },
    om = (e) => {
      let t = e.trim(),
        n = true;
      for (; n === true; )
        ((n = false),
          /^@\([^\\()[\]{}|]+\)$/.test(t) &&
            ((t = t.slice(2, -1)), (n = true)));
      if (KS(t)) return t.replace(/\\(.)/g, "$1");
    },
    zS = (e) => {
      let t = e.map(om).filter(Boolean);
      for (let n = 0; n < t.length; n++)
        for (let r = n + 1; r < t.length; r++) {
          let s = t[n],
            i = t[r],
            o = s[0];
          if (
            !(!o || s !== o.repeat(s.length) || i !== o.repeat(i.length)) &&
            (s === i || s.startsWith(i) || i.startsWith(s))
          )
            return true;
        }
      return false;
    },
    sl = (e, t = true) => {
      if ((e[0] !== "+" && e[0] !== "*") || e[1] !== "(") return;
      let n = 0,
        r = 0,
        s = 0,
        i = false;
      for (let o = 1; o < e.length; o++) {
        let a = e[o];
        if (i === true) {
          i = false;
          continue;
        }
        if (a === "\\") {
          i = true;
          continue;
        }
        if (a === '"') {
          s = s === 1 ? 0 : 1;
          continue;
        }
        if (s !== 1) {
          if (a === "[") {
            n++;
            continue;
          }
          if (a === "]" && n > 0) {
            n--;
            continue;
          }
          if (!(n > 0)) {
            if (a === "(") {
              r++;
              continue;
            }
            if (a === ")" && (r--, r === 0))
              return t === true && o !== e.length - 1
                ? void 0
                : { type: e[0], body: e.slice(2, o), end: o };
          }
        }
      }
    },
    XS = (e) => {
      let t = 0,
        n = [];
      for (; t < e.length; ) {
        let s = sl(e.slice(t), false);
        if (!s || s.type !== "*") return;
        let i = im(s.body).map((a) => a.trim());
        if (i.length !== 1) return;
        let o = om(i[0]);
        if (!o || o.length !== 1) return;
        (n.push(o), (t += s.end + 1));
      }
      return n.length < 1
        ? void 0
        : `${n.length === 1 ? De.escapeRegex(n[0]) : `[${n.map((s) => De.escapeRegex(s)).join("")}]`}*`;
    },
    JS = (e) => {
      let t = 0,
        n = e.trim(),
        r = sl(n);
      for (; r; ) (t++, (n = r.body.trim()), (r = sl(n)));
      return t;
    },
    YS = (e, t) => {
      if (t.maxExtglobRecursion === false) return { risky: false };
      let n =
          typeof t.maxExtglobRecursion == "number"
            ? t.maxExtglobRecursion
            : yr.DEFAULT_MAX_EXTGLOB_RECURSION,
        r = im(e).map((s) => s.trim());
      if (
        r.length > 1 &&
        (r.some((s) => s === "") || r.some((s) => /^[*?]+$/.test(s)) || zS(r))
      )
        return { risky: true };
      for (let s of r) {
        let i = XS(s);
        if (i) return { risky: true, safeOutput: i };
        if (JS(s) > n) return { risky: true };
      }
      return { risky: false };
    },
    il = (e, t) => {
      if (typeof e != "string") throw new TypeError("Expected a string");
      e = sm[e] || e;
      let n = { ...t },
        r = typeof n.maxLength == "number" ? Math.min(ci, n.maxLength) : ci,
        s = e.length;
      if (s > r)
        throw new SyntaxError(
          `Input length: ${s}, exceeds maximum allowed length: ${r}`,
        );
      let i = { type: "bos", value: "", output: n.prepend || "" },
        o = [i],
        a = n.capture ? "" : "?:",
        l = yr.globChars(n.windows),
        c = yr.extglobChars(l),
        {
          DOT_LITERAL: p,
          PLUS_LITERAL: u,
          SLASH_LITERAL: f,
          ONE_CHAR: h,
          DOTS_SLASH: m,
          NO_DOT: d,
          NO_DOT_SLASH: g,
          NO_DOTS_SLASH: y,
          QMARK: _,
          QMARK_NO_DOT: x,
          STAR: $,
          START_ANCHOR: C,
        } = l,
        v = (N) => `(${a}(?:(?!${C}${N.dot ? m : p}).)*?)`,
        A = n.dot ? "" : d,
        T = n.dot ? _ : x,
        L = n.bash === true ? v(n) : $;
      (n.capture && (L = `(${L})`),
        typeof n.noext == "boolean" && (n.noextglob = n.noext));
      let E = {
        input: e,
        index: -1,
        start: 0,
        dot: n.dot === true,
        consumed: "",
        output: "",
        prefix: "",
        backtrack: false,
        negated: false,
        brackets: 0,
        braces: 0,
        parens: 0,
        quotes: 0,
        globstar: false,
        tokens: o,
      };
      ((e = De.removePrefix(e, E)), (s = e.length));
      let R = [],
        F = [],
        j = [],
        w = i,
        S,
        I = () => E.index === s - 1,
        D = (E.peek = (N = 1) => e[E.index + N]),
        K = (E.advance = () => e[++E.index] || ""),
        H = () => e.slice(E.index + 1),
        ne = (N = "", ce = 0) => {
          ((E.consumed += N), (E.index += ce));
        },
        Re = (N) => {
          ((E.output += N.output != null ? N.output : N.value), ne(N.value));
        },
        Fg = () => {
          let N = 1;
          for (; D() === "!" && (D(2) !== "(" || D(3) === "?"); )
            (K(), E.start++, N++);
          return N % 2 === 0 ? false : ((E.negated = true), E.start++, true);
        },
        es = (N) => {
          (E[N]++, j.push(N));
        },
        St = (N) => {
          (E[N]--, j.pop());
        },
        G = (N) => {
          if (w.type === "globstar") {
            let ce = E.braces > 0 && (N.type === "comma" || N.type === "brace"),
              k =
                N.extglob === true ||
                (R.length && (N.type === "pipe" || N.type === "paren"));
            N.type !== "slash" &&
              N.type !== "paren" &&
              !ce &&
              !k &&
              ((E.output = E.output.slice(0, -w.output.length)),
              (w.type = "star"),
              (w.value = "*"),
              (w.output = L),
              (E.output += w.output));
          }
          if (
            (R.length &&
              N.type !== "paren" &&
              (R[R.length - 1].inner += N.value),
            (N.value || N.output) && Re(N),
            w && w.type === "text" && N.type === "text")
          ) {
            ((w.output = (w.output || w.value) + N.value),
              (w.value += N.value));
            return;
          }
          ((N.prev = w), o.push(N), (w = N));
        },
        ts = (N, ce) => {
          let k = { ...c[ce], conditions: 1, inner: "" };
          ((k.prev = w),
            (k.parens = E.parens),
            (k.output = E.output),
            (k.startIndex = E.index),
            (k.tokensIndex = o.length));
          let W = (n.capture ? "(" : "") + k.open;
          (es("parens"),
            G({ type: N, value: ce, output: E.output ? "" : h }),
            G({ type: "paren", extglob: true, value: K(), output: W }),
            R.push(k));
        },
        Mg = (N) => {
          let ce = e.slice(N.startIndex, E.index + 1),
            k = e.slice(N.startIndex + 2, E.index),
            W = YS(k, n);
          if ((N.type === "plus" || N.type === "star") && W.risky) {
            let se = W.safeOutput
                ? (N.output ? "" : h) +
                  (n.capture ? `(${W.safeOutput})` : W.safeOutput)
                : void 0,
              Ze = o[N.tokensIndex];
            ((Ze.type = "text"),
              (Ze.value = ce),
              (Ze.output = se || De.escapeRegex(ce)));
            for (let et = N.tokensIndex + 1; et < o.length; et++)
              ((o[et].value = ""), (o[et].output = ""), delete o[et].suffix);
            ((E.output = N.output + Ze.output),
              (E.backtrack = true),
              G({ type: "paren", extglob: true, value: S, output: "" }),
              St("parens"));
            return;
          }
          let ae = N.close + (n.capture ? ")" : ""),
            ye;
          if (N.type === "negate") {
            let se = L;
            if (
              (N.inner &&
                N.inner.length > 1 &&
                N.inner.includes("/") &&
                (se = v(n)),
              (se !== L || I() || /^\)+$/.test(H())) &&
                (ae = N.close = `)$))${se}`),
              N.inner.includes("*") && (ye = H()) && /^\.[^\\/.]+$/.test(ye))
            ) {
              let Ze = il(ye, { ...t, fastpaths: false }).output;
              ae = N.close = `)${Ze})${se})`;
            }
            N.prev.type === "bos" && (E.negatedExtglob = true);
          }
          (G({ type: "paren", extglob: true, value: S, output: ae }),
            St("parens"));
        };
      if (n.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(e)) {
        let N = false,
          ce = e.replace(WS, (k, W, ae, ye, se, Ze) =>
            ye === "\\"
              ? ((N = true), k)
              : ye === "?"
                ? W
                  ? W + ye + (se ? _.repeat(se.length) : "")
                  : Ze === 0
                    ? T + (se ? _.repeat(se.length) : "")
                    : _.repeat(ae.length)
                : ye === "."
                  ? p.repeat(ae.length)
                  : ye === "*"
                    ? W
                      ? W + ye + (se ? L : "")
                      : L
                    : W
                      ? k
                      : `\\${k}`,
          );
        return (
          N === true &&
            (n.unescape === true
              ? (ce = ce.replace(/\\/g, ""))
              : (ce = ce.replace(/\\+/g, (k) =>
                  k.length % 2 === 0 ? "\\\\" : k ? "\\" : "",
                ))),
          ce === e && n.contains === true
            ? ((E.output = e), E)
            : ((E.output = De.wrapOutput(ce, E, t)), E)
        );
      }
      for (; !I(); ) {
        if (((S = K()), S === "\0")) continue;
        if (S === "\\") {
          let k = D();
          if ((k === "/" && n.bash !== true) || k === "." || k === ";")
            continue;
          if (!k) {
            ((S += "\\"), G({ type: "text", value: S }));
            continue;
          }
          let W = /^\\+/.exec(H()),
            ae = 0;
          if (
            (W &&
              W[0].length > 2 &&
              ((ae = W[0].length),
              (E.index += ae),
              ae % 2 !== 0 && (S += "\\")),
            n.unescape === true ? (S = K()) : (S += K()),
            E.brackets === 0)
          ) {
            G({ type: "text", value: S });
            continue;
          }
        }
        if (
          E.brackets > 0 &&
          (S !== "]" || w.value === "[" || w.value === "[^")
        ) {
          if (n.posix !== false && S === ":") {
            let k = w.value.slice(1);
            if (k.includes("[") && ((w.posix = true), k.includes(":"))) {
              let W = w.value.lastIndexOf("["),
                ae = w.value.slice(0, W),
                ye = w.value.slice(W + 2),
                se = HS[ye];
              if (se) {
                ((w.value = ae + se),
                  (E.backtrack = true),
                  K(),
                  !i.output && o.indexOf(w) === 1 && (i.output = h));
                continue;
              }
            }
          }
          (((S === "[" && D() !== ":") || (S === "-" && D() === "]")) &&
            (S = `\\${S}`),
            S === "]" &&
              (w.value === "[" || w.value === "[^") &&
              (S = `\\${S}`),
            n.posix === true && S === "!" && w.value === "[" && (S = "^"),
            (w.value += S),
            Re({ value: S }));
          continue;
        }
        if (E.quotes === 1 && S !== '"') {
          ((S = De.escapeRegex(S)), (w.value += S), Re({ value: S }));
          continue;
        }
        if (S === '"') {
          ((E.quotes = E.quotes === 1 ? 0 : 1),
            n.keepQuotes === true && G({ type: "text", value: S }));
          continue;
        }
        if (S === "(") {
          (es("parens"), G({ type: "paren", value: S }));
          continue;
        }
        if (S === ")") {
          if (E.parens === 0 && n.strictBrackets === true)
            throw new SyntaxError(mn("opening", "("));
          let k = R[R.length - 1];
          if (k && E.parens === k.parens + 1) {
            Mg(R.pop());
            continue;
          }
          (G({ type: "paren", value: S, output: E.parens ? ")" : "\\)" }),
            St("parens"));
          continue;
        }
        if (S === "[") {
          if (n.nobracket === true || !H().includes("]")) {
            if (n.nobracket !== true && n.strictBrackets === true)
              throw new SyntaxError(mn("closing", "]"));
            S = `\\${S}`;
          } else es("brackets");
          G({ type: "bracket", value: S });
          continue;
        }
        if (S === "]") {
          if (
            n.nobracket === true ||
            (w && w.type === "bracket" && w.value.length === 1)
          ) {
            G({ type: "text", value: S, output: `\\${S}` });
            continue;
          }
          if (E.brackets === 0) {
            if (n.strictBrackets === true)
              throw new SyntaxError(mn("opening", "["));
            G({ type: "text", value: S, output: `\\${S}` });
            continue;
          }
          St("brackets");
          let k = w.value.slice(1);
          if (
            (w.posix !== true &&
              k[0] === "^" &&
              !k.includes("/") &&
              (S = `/${S}`),
            (w.value += S),
            Re({ value: S }),
            n.literalBrackets === false || De.hasRegexChars(k))
          )
            continue;
          let W = De.escapeRegex(w.value);
          if (
            ((E.output = E.output.slice(0, -w.value.length)),
            n.literalBrackets === true)
          ) {
            ((E.output += W), (w.value = W));
            continue;
          }
          ((w.value = `(${a}${W}|${w.value})`), (E.output += w.value));
          continue;
        }
        if (S === "{" && n.nobrace !== true) {
          es("braces");
          let k = {
            type: "brace",
            value: S,
            output: "(",
            outputIndex: E.output.length,
            tokensIndex: E.tokens.length,
          };
          (F.push(k), G(k));
          continue;
        }
        if (S === "}") {
          let k = F[F.length - 1];
          if (n.nobrace === true || !k) {
            G({ type: "text", value: S, output: S });
            continue;
          }
          let W = ")";
          if (k.dots === true) {
            let ae = o.slice(),
              ye = [];
            for (
              let se = ae.length - 1;
              se >= 0 && (o.pop(), ae[se].type !== "brace");
              se--
            )
              ae[se].type !== "dots" && ye.unshift(ae[se].value);
            ((W = VS(ye, n)), (E.backtrack = true));
          }
          if (k.comma !== true && k.dots !== true) {
            let ae = E.output.slice(0, k.outputIndex),
              ye = E.tokens.slice(k.tokensIndex);
            ((k.value = k.output = "\\{"), (S = W = "\\}"), (E.output = ae));
            for (let se of ye) E.output += se.output || se.value;
          }
          (G({ type: "brace", value: S, output: W }), St("braces"), F.pop());
          continue;
        }
        if (S === "|") {
          (R.length > 0 && R[R.length - 1].conditions++,
            G({ type: "text", value: S }));
          continue;
        }
        if (S === ",") {
          let k = S,
            W = F[F.length - 1];
          (W && j[j.length - 1] === "braces" && ((W.comma = true), (k = "|")),
            G({ type: "comma", value: S, output: k }));
          continue;
        }
        if (S === "/") {
          if (w.type === "dot" && E.index === E.start + 1) {
            ((E.start = E.index + 1),
              (E.consumed = ""),
              (E.output = ""),
              o.pop(),
              (w = i));
            continue;
          }
          G({ type: "slash", value: S, output: f });
          continue;
        }
        if (S === ".") {
          if (E.braces > 0 && w.type === "dot") {
            w.value === "." && (w.output = p);
            let k = F[F.length - 1];
            ((w.type = "dots"),
              (w.output += S),
              (w.value += S),
              (k.dots = true));
            continue;
          }
          if (
            E.braces + E.parens === 0 &&
            w.type !== "bos" &&
            w.type !== "slash"
          ) {
            G({ type: "text", value: S, output: p });
            continue;
          }
          G({ type: "dot", value: S, output: p });
          continue;
        }
        if (S === "?") {
          if (
            !(w && w.value === "(") &&
            n.noextglob !== true &&
            D() === "(" &&
            D(2) !== "?"
          ) {
            ts("qmark", S);
            continue;
          }
          if (w && w.type === "paren") {
            let W = D(),
              ae = S;
            (((w.value === "(" && !/[!=<:]/.test(W)) ||
              (W === "<" && !/<([!=]|\w+>)/.test(H()))) &&
              (ae = `\\${S}`),
              G({ type: "text", value: S, output: ae }));
            continue;
          }
          if (n.dot !== true && (w.type === "slash" || w.type === "bos")) {
            G({ type: "qmark", value: S, output: x });
            continue;
          }
          G({ type: "qmark", value: S, output: _ });
          continue;
        }
        if (S === "!") {
          if (
            n.noextglob !== true &&
            D() === "(" &&
            (D(2) !== "?" || !/[!=<:]/.test(D(3)))
          ) {
            ts("negate", S);
            continue;
          }
          if (n.nonegate !== true && E.index === 0) {
            Fg();
            continue;
          }
        }
        if (S === "+") {
          if (n.noextglob !== true && D() === "(" && D(2) !== "?") {
            ts("plus", S);
            continue;
          }
          if ((w && w.value === "(") || n.regex === false) {
            G({ type: "plus", value: S, output: u });
            continue;
          }
          if (
            (w &&
              (w.type === "bracket" ||
                w.type === "paren" ||
                w.type === "brace")) ||
            E.parens > 0
          ) {
            G({ type: "plus", value: S });
            continue;
          }
          G({ type: "plus", value: u });
          continue;
        }
        if (S === "@") {
          if (n.noextglob !== true && D() === "(" && D(2) !== "?") {
            G({ type: "at", extglob: true, value: S, output: "" });
            continue;
          }
          G({ type: "text", value: S });
          continue;
        }
        if (S !== "*") {
          (S === "$" || S === "^") && (S = `\\${S}`);
          let k = GS.exec(H());
          (k && ((S += k[0]), (E.index += k[0].length)),
            G({ type: "text", value: S }));
          continue;
        }
        if (w && (w.type === "globstar" || w.star === true)) {
          ((w.type = "star"),
            (w.star = true),
            (w.value += S),
            (w.output = L),
            (E.backtrack = true),
            (E.globstar = true),
            ne(S));
          continue;
        }
        let N = H();
        if (n.noextglob !== true && /^\([^?]/.test(N)) {
          ts("star", S);
          continue;
        }
        if (w.type === "star") {
          if (n.noglobstar === true) {
            ne(S);
            continue;
          }
          let k = w.prev,
            W = k.prev,
            ae = k.type === "slash" || k.type === "bos",
            ye = W && (W.type === "star" || W.type === "globstar");
          if (n.bash === true && (!ae || (N[0] && N[0] !== "/"))) {
            G({ type: "star", value: S, output: "" });
            continue;
          }
          let se = E.braces > 0 && (k.type === "comma" || k.type === "brace"),
            Ze = R.length && (k.type === "pipe" || k.type === "paren");
          if (!ae && k.type !== "paren" && !se && !Ze) {
            G({ type: "star", value: S, output: "" });
            continue;
          }
          for (; N.slice(0, 3) === "/**"; ) {
            let et = e[E.index + 4];
            if (et && et !== "/") break;
            ((N = N.slice(3)), ne("/**", 3));
          }
          if (k.type === "bos" && I()) {
            ((w.type = "globstar"),
              (w.value += S),
              (w.output = v(n)),
              (E.output = w.output),
              (E.globstar = true),
              ne(S));
            continue;
          }
          if (k.type === "slash" && k.prev.type !== "bos" && !ye && I()) {
            ((E.output = E.output.slice(0, -(k.output + w.output).length)),
              (k.output = `(?:${k.output}`),
              (w.type = "globstar"),
              (w.output = v(n) + (n.strictSlashes ? ")" : "|$)")),
              (w.value += S),
              (E.globstar = true),
              (E.output += k.output + w.output),
              ne(S));
            continue;
          }
          if (k.type === "slash" && k.prev.type !== "bos" && N[0] === "/") {
            let et = N[1] !== void 0 ? "|$" : "";
            ((E.output = E.output.slice(0, -(k.output + w.output).length)),
              (k.output = `(?:${k.output}`),
              (w.type = "globstar"),
              (w.output = `${v(n)}${f}|${f}${et})`),
              (w.value += S),
              (E.output += k.output + w.output),
              (E.globstar = true),
              ne(S + K()),
              G({ type: "slash", value: "/", output: "" }));
            continue;
          }
          if (k.type === "bos" && N[0] === "/") {
            ((w.type = "globstar"),
              (w.value += S),
              (w.output = `(?:^|${f}|${v(n)}${f})`),
              (E.output = w.output),
              (E.globstar = true),
              ne(S + K()),
              G({ type: "slash", value: "/", output: "" }));
            continue;
          }
          ((E.output = E.output.slice(0, -w.output.length)),
            (w.type = "globstar"),
            (w.output = v(n)),
            (w.value += S),
            (E.output += w.output),
            (E.globstar = true),
            ne(S));
          continue;
        }
        let ce = { type: "star", value: S, output: L };
        if (n.bash === true) {
          ((ce.output = ".*?"),
            (w.type === "bos" || w.type === "slash") &&
              (ce.output = A + ce.output),
            G(ce));
          continue;
        }
        if (
          w &&
          (w.type === "bracket" || w.type === "paren") &&
          n.regex === true
        ) {
          ((ce.output = S), G(ce));
          continue;
        }
        ((E.index === E.start || w.type === "slash" || w.type === "dot") &&
          (w.type === "dot"
            ? ((E.output += g), (w.output += g))
            : n.dot === true
              ? ((E.output += y), (w.output += y))
              : ((E.output += A), (w.output += A)),
          D() !== "*" && ((E.output += h), (w.output += h))),
          G(ce));
      }
      for (; E.brackets > 0; ) {
        if (n.strictBrackets === true)
          throw new SyntaxError(mn("closing", "]"));
        ((E.output = De.escapeLast(E.output, "[")), St("brackets"));
      }
      for (; E.parens > 0; ) {
        if (n.strictBrackets === true)
          throw new SyntaxError(mn("closing", ")"));
        ((E.output = De.escapeLast(E.output, "(")), St("parens"));
      }
      for (; E.braces > 0; ) {
        if (n.strictBrackets === true)
          throw new SyntaxError(mn("closing", "}"));
        ((E.output = De.escapeLast(E.output, "{")), St("braces"));
      }
      if (
        (n.strictSlashes !== true &&
          (w.type === "star" || w.type === "bracket") &&
          G({ type: "maybe_slash", value: "", output: `${f}?` }),
        E.backtrack === true)
      ) {
        E.output = "";
        for (let N of E.tokens)
          ((E.output += N.output != null ? N.output : N.value),
            N.suffix && (E.output += N.suffix));
      }
      return E;
    };
  il.fastpaths = (e, t) => {
    let n = { ...t },
      r = typeof n.maxLength == "number" ? Math.min(ci, n.maxLength) : ci,
      s = e.length;
    if (s > r)
      throw new SyntaxError(
        `Input length: ${s}, exceeds maximum allowed length: ${r}`,
      );
    e = sm[e] || e;
    let {
        DOT_LITERAL: i,
        SLASH_LITERAL: o,
        ONE_CHAR: a,
        DOTS_SLASH: l,
        NO_DOT: c,
        NO_DOTS: p,
        NO_DOTS_SLASH: u,
        STAR: f,
        START_ANCHOR: h,
      } = yr.globChars(n.windows),
      m = n.dot ? p : c,
      d = n.dot ? u : c,
      g = n.capture ? "" : "?:",
      y = { negated: false, prefix: "" },
      _ = n.bash === true ? ".*?" : f;
    n.capture && (_ = `(${_})`);
    let x = (A) =>
        A.noglobstar === true ? _ : `(${g}(?:(?!${h}${A.dot ? l : i}).)*?)`,
      $ = (A) => {
        switch (A) {
          case "*":
            return `${m}${a}${_}`;
          case ".*":
            return `${i}${a}${_}`;
          case "*.*":
            return `${m}${_}${i}${a}${_}`;
          case "*/*":
            return `${m}${_}${o}${a}${d}${_}`;
          case "**":
            return m + x(n);
          case "**/*":
            return `(?:${m}${x(n)}${o})?${d}${a}${_}`;
          case "**/*.*":
            return `(?:${m}${x(n)}${o})?${d}${_}${i}${a}${_}`;
          case "**/.*":
            return `(?:${m}${x(n)}${o})?${i}${a}${_}`;
          default: {
            let T = /^(.*?)\.(\w+)$/.exec(A);
            if (!T) return;
            let L = $(T[1]);
            return L ? L + i + T[2] : void 0;
          }
        }
      },
      C = De.removePrefix(e, y),
      v = $(C);
    return (v && n.strictSlashes !== true && (v += `${o}?`), v);
  };
  am.exports = il;
});
var pm = Et((mk, um) => {
  var QS = rm(),
    ol = lm(),
    cm = hr(),
    ZS = dr(),
    eE = (e) => e && typeof e == "object" && !Array.isArray(e),
    me = (e, t, n = false) => {
      if (Array.isArray(e)) {
        let p = e.map((f) => me(f, t, n));
        return (f) => {
          for (let h of p) {
            let m = h(f);
            if (m) return m;
          }
          return false;
        };
      }
      let r = eE(e) && e.tokens && e.input;
      if (e === "" || (typeof e != "string" && !r))
        throw new TypeError("Expected pattern to be a non-empty string");
      let s = t || {},
        i = s.windows,
        o = r ? me.compileRe(e, t) : me.makeRe(e, t, false, true),
        a = o.state;
      delete o.state;
      let l = () => false;
      if (s.ignore) {
        let p = { ...t, ignore: null, onMatch: null, onResult: null };
        l = me(s.ignore, p, n);
      }
      let c = (p, u = false) => {
        let {
            isMatch: f,
            match: h,
            output: m,
          } = me.test(p, o, t, { glob: e, posix: i }),
          d = {
            glob: e,
            state: a,
            regex: o,
            posix: i,
            input: p,
            output: m,
            match: h,
            isMatch: f,
          };
        return (
          typeof s.onResult == "function" && s.onResult(d),
          f === false
            ? ((d.isMatch = false), u ? d : false)
            : l(p)
              ? (typeof s.onIgnore == "function" && s.onIgnore(d),
                (d.isMatch = false),
                u ? d : false)
              : (typeof s.onMatch == "function" && s.onMatch(d), u ? d : true)
        );
      };
      return (n && (c.state = a), c);
    };
  me.test = (e, t, n, { glob: r, posix: s } = {}) => {
    if (typeof e != "string")
      throw new TypeError("Expected input to be a string");
    if (e === "") return { isMatch: false, output: "" };
    let i = n || {},
      o = i.format || (s ? cm.toPosixSlashes : null),
      a = e === r,
      l = a && o ? o(e) : e;
    return (
      a === false && ((l = o ? o(e) : e), (a = l === r)),
      (a === false || i.capture === true) &&
        (i.matchBase === true || i.basename === true
          ? (a = me.matchBase(e, t, n, s))
          : (a = t.exec(l))),
      { isMatch: !!a, match: a, output: l }
    );
  };
  me.matchBase = (e, t, n) =>
    (t instanceof RegExp ? t : me.makeRe(t, n)).test(cm.basename(e));
  me.isMatch = (e, t, n) => me(t, n)(e);
  me.parse = (e, t) =>
    Array.isArray(e)
      ? e.map((n) => me.parse(n, t))
      : ol(e, { ...t, fastpaths: false });
  me.scan = (e, t) => QS(e, t);
  me.compileRe = (e, t, n = false, r = false) => {
    if (n === true) return e.output;
    let s = t || {},
      i = s.contains ? "" : "^",
      o = s.contains ? "" : "$",
      a = `${i}(?:${e.output})${o}`;
    e && e.negated === true && (a = `^(?!${a}).*$`);
    let l = me.toRegex(a, t);
    return (r === true && (l.state = e), l);
  };
  me.makeRe = (e, t = {}, n = false, r = false) => {
    if (!e || typeof e != "string")
      throw new TypeError("Expected a non-empty string");
    let s = { negated: false, fastpaths: true };
    return (
      t.fastpaths !== false &&
        (e[0] === "." || e[0] === "*") &&
        (s.output = ol.fastpaths(e, t)),
      s.output || (s = ol(e, t)),
      me.compileRe(s, t, n, r)
    );
  };
  me.toRegex = (e, t) => {
    try {
      let n = t || {};
      return new RegExp(e, n.flags || (n.nocase ? "i" : ""));
    } catch (n) {
      if (t && t.debug === true) throw n;
      return /$^/;
    }
  };
  me.constants = ZS;
  um.exports = me;
});
var hm = Et((dk, dm) => {
  var fm = pm(),
    tE = hr();
  function mm(e, t, n = false) {
    return (
      t &&
        (t.windows === null || t.windows === void 0) &&
        (t = { ...t, windows: tE.isWindows() }),
      fm(e, t, n)
    );
  }
  Object.assign(mm, fm);
  dm.exports = mm;
});
function dE(e, t = {}) {
  let n = e.length,
    r = Array(n),
    s = Array(n),
    i,
    o;
  for (i = 0; i < n; i++) {
    let a = Em(e[i]);
    r[i] = a;
    let l = a.length,
      c = Array(l);
    for (o = 0; o < l; o++) c[o] = (0, dn.default)(a[o], t);
    s[i] = c;
  }
  return (a) => {
    let l = a.split("/");
    if (l[0] === ".." && mE.test(a)) return true;
    for (i = 0; i < n; i++) {
      let c = r[i],
        p = s[i],
        u = l.length,
        f = Math.min(u, c.length);
      for (o = 0; o < f; ) {
        let h = c[o];
        if (h.includes("/")) return true;
        if (!p[o](l[o])) break;
        if (!t.noglobstar && h === "**") return true;
        o++;
      }
      if (o === u) return true;
    }
    return false;
  };
}
function gm(e, t, n) {
  if (e === t || t.startsWith(`${e}/`)) {
    if (n) {
      let s = e.length + +!gE(e);
      return (i, o) => i.slice(s, o ? -1 : void 0) || ".";
    }
    let r = t.slice(e.length + 1);
    return r
      ? (s, i) => {
          if (s === ".") return r;
          let o = `${r}/${s}`;
          return i ? o.slice(0, -1) : o;
        }
      : (s, i) => (i && s !== "." ? s.slice(0, -1) : s);
  }
  return n
    ? (r) => posix.relative(e, r) || "."
    : (r) => posix.relative(e, `${t}/${r}`) || ".";
}
function yE(e, t) {
  if (t.startsWith(`${e}/`)) {
    let n = t.slice(e.length + 1);
    return (r) => `${n}/${r}`;
  }
  return (n) => {
    let r = posix.relative(e, `${t}/${n}`);
    return n[n.length - 1] === "/" && r !== "" ? `${r}/` : r || ".";
  };
}
function ym(e) {
  return e.replace(fE, (t) => `${t}/`);
}
function Em(e) {
  var t;
  let n = dn.default.scan(e, bE);
  return !((t = n.parts) === null || t === void 0) && t.length ? n.parts : [e];
}
function TE(e, t) {
  let n = dn.default.scan(e);
  return n.isGlob || n.negated;
}
function br(...e) {
  console.log(`[tinyglobby ${new Date().toLocaleTimeString("es")}]`, ...e);
}
function _m(e) {
  return typeof e == "string" ? [e] : (e ?? []);
}
function al(e, t, n, r) {
  var s;
  let i = t.cwd,
    o = e;
  (e[e.length - 1] === "/" && (o = e.slice(0, -1)),
    o[o.length - 1] !== "*" && t.expandDirectories && (o += "/**"));
  let a = xE(i);
  o = isAbsolute(o.replace(AE, "")) ? posix.relative(a, o) : posix.normalize(o);
  let l = (s = CE.exec(o)) === null || s === void 0 ? void 0 : s[0],
    c = Em(o);
  if (l) {
    let u = (l.length + 1) / 3,
      f = 0,
      h = a.split("/");
    for (; f < u && c[f + u] === h[h.length + f - u]; )
      ((o =
        o.slice(0, (u - f - 1) * 3) +
          o.slice((u - f) * 3 + c[f + u].length + 1) || "."),
        f++);
    let m = posix.join(i, l.slice(f * 3));
    m[0] !== "." &&
      n.root.length > m.length &&
      ((n.root = ym(m)), (n.depthOffset = -u + f));
  }
  if (!r && n.depthOffset >= 0) {
    var p;
    ((p = n.commonPath) !== null && p !== void 0) || (n.commonPath = c);
    let u = [],
      f = Math.min(n.commonPath.length, c.length);
    for (let h = 0; h < f; h++) {
      let m = c[h];
      if (m === "**" && !c[h + 1]) {
        u.pop();
        break;
      }
      if (h === c.length - 1 || m !== n.commonPath[h] || TE(m)) break;
      u.push(m);
    }
    ((n.depthOffset = u.length),
      (n.commonPath = u),
      (n.root = ym(u.length > 0 ? posix.join(i, ...u) : i)));
  }
  return o;
}
function $E(e, t, n) {
  let r = [],
    s = [];
  for (let i of e.ignore)
    i && (i[0] !== "!" || i[1] === "(") && s.push(al(i, e, n, true));
  for (let i of t)
    i &&
      (i[0] !== "!" || i[1] === "("
        ? r.push(al(i, e, n, false))
        : (i[1] !== "!" || i[2] === "(") && s.push(al(i.slice(1), e, n, true)));
  return { match: r, ignore: s };
}
function RE(e, t) {
  let n = e.cwd,
    r = { root: n, depthOffset: 0 },
    s = $E(e, t, r);
  e.debug && br("internal processing patterns:", s);
  let {
      absolute: i,
      caseSensitiveMatch: o,
      debug: a,
      dot: l,
      followSymbolicLinks: c,
      onlyDirectories: p,
    } = e,
    u = r.root.replace(wm, ""),
    f = {
      dot: l,
      nobrace: e.braceExpansion === false,
      nocase: !o,
      noextglob: e.extglob === false,
      noglobstar: e.globstar === false,
      posix: true,
    },
    h = (0, dn.default)(s.match, f),
    m = (0, dn.default)(s.ignore, f),
    d = dE(s.match, f),
    g = gm(n, u, i),
    y = i ? g : gm(n, u, true),
    _ = (C, v) => {
      let A = y(v, true);
      return (A !== "." && !d(A)) || m(A);
    },
    x;
  e.deep !== void 0 && (x = Math.round(e.deep - r.depthOffset));
  let $ = new Hf({
    filters: [
      a
        ? (C, v) => {
            let A = g(C, v),
              T = h(A) && !m(A);
            return (T && br(`matched ${A}`), T);
          }
        : (C, v) => {
            let A = g(C, v);
            return h(A) && !m(A);
          },
    ],
    exclude: a
      ? (C, v) => {
          let A = _(C, v);
          return (br(`${A ? "skipped" : "crawling"} ${v}`), A);
        }
      : _,
    fs: e.fs,
    pathSeparator: "/",
    relativePaths: !i,
    resolvePaths: i,
    includeBasePath: i,
    resolveSymlinks: c,
    excludeSymlinks: !c,
    excludeFiles: p,
    includeDirs: p || !e.onlyFiles,
    maxDepth: x,
    signal: e.signal,
  }).crawl(u);
  return (
    e.debug && br("internal properties:", { ...r, root: u }),
    [$, n !== u && !i && yE(n, u)]
  );
}
function vE(e, t) {
  if (t) for (let n = e.length - 1; n >= 0; n--) e[n] = t(e[n]);
  return e;
}
function kE(e) {
  let t = Object.assign({}, e);
  for (let n in bm) t[n] === void 0 && Object.assign(t, { [n]: bm[n] });
  return (
    (t.cwd = (
      t.cwd instanceof URL
        ? fileURLToPath$1(t.cwd)
        : resolve(t.cwd || process.cwd())
    ).replace(wm, "/")),
    (t.ignore = _m(t.ignore)),
    t.fs &&
      (t.fs = {
        readdir: t.fs.readdir || readdir,
        readdirSync: t.fs.readdirSync || readdirSync,
        realpath: t.fs.realpath || realpath,
        realpathSync: t.fs.realpathSync || realpathSync,
        stat: t.fs.stat || stat,
        statSync: t.fs.statSync || statSync$1,
      }),
    t.debug && br("globbing with options:", t),
    t
  );
}
function PE(e, t = {}) {
  var n;
  if (e && t?.patterns)
    throw new Error("Cannot pass patterns as both an argument and an option");
  let r = pE(e) || typeof e == "string",
    s = _m((n = r ? e : e.patterns) !== null && n !== void 0 ? n : "**/*"),
    i = kE(r ? t : e);
  return s.length > 0 ? RE(i, s) : [];
}
async function wr(e, t) {
  let [n, r] = PE(e, t);
  return n ? vE(await n.withPromise(), r) : [];
}
var dn,
  pE,
  wm,
  fE,
  Sm,
  mE,
  hE,
  gE,
  bE,
  wE,
  SE,
  EE,
  _E,
  xE,
  CE,
  AE,
  bm,
  ll = b(() => {
    Gf();
    ((dn = z(hm())),
      (pE = Array.isArray),
      (wm = /\\/g),
      (fE = /^[A-Za-z]:$/),
      (Sm = process.platform === "win32"),
      (mE = /^(\/?\.\.)+$/));
    ((hE = /^[A-Z]:\/$/i), (gE = Sm ? (e) => hE.test(e) : (e) => e === "/"));
    bE = { parts: true };
    ((wE = /(?<!\\)([()[\]{}*?|]|^!|[!+@](?=\()|\\(?![()[\]{}!*+?@|]))/g),
      (SE = /(?<!\\)([()[\]{}]|^!|[!+@](?=\())/g),
      (EE = (e) => e.replace(wE, "\\$&")),
      (_E = (e) => e.replace(SE, "\\$&")),
      (xE = Sm ? _E : EE));
    ((CE = /^(\/?\.\.)+/), (AE = /\\(?=[()[\]{}!*+?@|])/g));
    bm = {
      caseSensitiveMatch: true,
      debug: !!process.env.TINYGLOBBY_DEBUG,
      expandDirectories: true,
      followSymbolicLinks: true,
      onlyFiles: true,
    };
  });
function hn(e) {
  if ("String" in e) return e.String.sval;
}
function Q(e) {
  return e.map(hn).filter((t) => t != null);
}
function mt(e) {
  return e == null
    ? []
    : e.List !== void 0
      ? e.List.items || []
      : Array.isArray(e)
        ? e
        : [e];
}
function ui(e) {
  return QuoteUtils.quoteIdentifier(e);
}
function gn(e) {
  return Object.keys(e)[0];
}
function xm(e) {
  if ("A_Const" in e) {
    if (e.A_Const.ival) return e.A_Const.ival.ival;
    if (e.A_Const.fval) return e.A_Const.fval.fval;
    if (e.A_Const.sval) return e.A_Const.sval.sval;
    if (e.A_Const.boolval) return e.A_Const.boolval.boolval;
    if (e.A_Const.isnull) return null;
  }
}
var Gt = b(() => {});
function Cm(e) {
  let t = e.toLowerCase().trim();
  if (t.startsWith("_") || t.endsWith("[]")) return "TEXT";
  let n = LE[t];
  if (!n) throw new Wt(`Unsupported PostgreSQL type: "${e}"`);
  return n;
}
function pi(e) {
  let t = e.toLowerCase();
  return [
    "serial",
    "serial4",
    "bigserial",
    "serial8",
    "smallserial",
    "serial2",
  ].includes(t);
}
function fi(e) {
  let t = e.toLowerCase();
  return [
    "varchar",
    "character varying",
    "char",
    "character",
    "bpchar",
  ].includes(t);
}
function mi(e) {
  let t = e.toLowerCase();
  return ["numeric", "decimal"].includes(t);
}
var Wt,
  M,
  LE,
  Tm,
  IE,
  di,
  yn = b(() => {
    Gt();
    ((Wt = class extends Error {}),
      (M = class extends Wt {
        constructor(n, r) {
          super(r ?? `Unsupported node type: ${gn(n)}`);
          this.node = n;
        }
      }),
      (LE = {
        int2: "INTEGER",
        smallint: "INTEGER",
        int4: "INTEGER",
        integer: "INTEGER",
        int: "INTEGER",
        int8: "INTEGER",
        bigint: "INTEGER",
        serial: "INTEGER",
        serial4: "INTEGER",
        bigserial: "INTEGER",
        serial8: "INTEGER",
        smallserial: "INTEGER",
        serial2: "INTEGER",
        float4: "REAL",
        real: "REAL",
        float8: "REAL",
        "double precision": "REAL",
        numeric: "REAL",
        decimal: "REAL",
        text: "TEXT",
        varchar: "TEXT",
        "character varying": "TEXT",
        char: "TEXT",
        character: "TEXT",
        bpchar: "TEXT",
        name: "TEXT",
        bytea: "BLOB",
        bool: "INTEGER",
        boolean: "INTEGER",
        date: "TEXT",
        time: "TEXT",
        "time without time zone": "TEXT",
        timetz: "TEXT",
        "time with time zone": "TEXT",
        timestamp: "TEXT",
        "timestamp without time zone": "TEXT",
        timestamptz: "TEXT",
        "timestamp with time zone": "TEXT",
        interval: "TEXT",
        json: "TEXT",
        jsonb: "TEXT",
        uuid: "TEXT",
        inet: "TEXT",
      }),
      (Tm = [
        "<",
        ">",
        "<=",
        ">=",
        "=",
        "<>",
        "!=",
        "+",
        "-",
        "*",
        "/",
        "%",
        "&",
        "|",
        "<<",
        ">>",
        "||",
        "BETWEEN",
        "NOT BETWEEN",
        "IN",
        "NOT IN",
        "LIKE",
        "NOT LIKE",
        "IS NULL",
        "IS NOT NULL",
        "IS TRUE",
        "IS NOT TRUE",
        "IS FALSE",
        "IS NOT FALSE",
        "IS UNKNOWN",
        "IS NOT UNKNOWN",
        "AND",
        "OR",
        "NOT",
        "->>",
      ]));
    ((IE = {
      CreateEnumStmt: { react: "ignore" },
      CreateDomainStmt: { react: "warn" },
      CreateSeqStmt: { react: "ignore" },
      AlterSeqStmt: { react: "ignore" },
      CreateSchemaStmt: { react: "warn" },
      CreatePolicyStmt: { react: "ignore" },
      AlterPolicyStmt: { react: "ignore" },
      PartitionElem: { react: "error" },
      PartitionCmd: { react: "error" },
      VariableSetStmt: { react: "ignore" },
      CompositeTypeStmt: { react: "error" },
      AlterEnumStmt: { react: "error" },
      AlterObjectSchemaStmt: { react: "error" },
      AlterOwnerStmt: { react: "error" },
      AlterTypeStmt: { react: "error" },
      AlterFunctionStmt: { react: "error" },
      AlterDefaultPrivilegesStmt: { react: "error" },
      GrantStmt: { react: "error" },
      GrantRoleStmt: { react: "error" },
      CopyStmt: { react: "error" },
      CreateCastStmt: { react: "error" },
      AlterOpFamilyStmt: { react: "error" },
      AlterOperatorStmt: { react: "error" },
      TruncateStmt: { react: "error" },
      A_Indirection: { react: "error" },
      XmlExpr: { react: "error" },
      XmlSerialize: { react: "error" },
      RangeTableSample: { react: "error" },
      GroupingSet: { react: "error" },
    }),
      (di = new Map(Object.entries(IE))));
  });
function dt(e) {
  return e != null && typeof e == "object" && e.kind === "storage.foldername";
}
function ht(e) {
  if (e == null || typeof e != "object") return false;
  let t = e.kind;
  return t === "storage.filename" || t === "storage.extension";
}
function bn(e, t, n) {
  return {
    $storageObject: {
      function: e.kind.slice(8),
      column: e.column,
      ops: { [t]: n },
    },
  };
}
function DE(e) {
  return e.startsWith("storage.") ? e.slice(8) : e;
}
function jE(e) {
  return e === "{{storage.operation}}";
}
function FE(e) {
  switch (e) {
    case "~~":
      return "$like";
    case "!~~":
      return "$notLike";
    case "~~*":
      return "$ilike";
    case "!~~*":
      return "$notIlike";
    default:
      return;
  }
}
function cl(e) {
  switch (e) {
    case "$gt":
      return "$lt";
    case "$gte":
      return "$lte";
    case "$lt":
      return "$gt";
    case "$lte":
      return "$gte";
    default:
      return e;
  }
}
function gi(e, t) {
  return e
    ? "TypeCast" in e && e.TypeCast.arg
      ? gi(e.TypeCast.arg, t)
      : "A_Const" in e
        ? true
        : typeof t == "string" && t.startsWith("{{") && t.endsWith("}}")
    : false;
}
function yi(e) {
  return e && "TypeCast" in e && e.TypeCast.arg
    ? yi(e.TypeCast.arg)
    : e != null && "ColumnRef" in e;
}
function hi(e, t) {
  return yi(e) && typeof t == "string" ? { $ref: t } : t;
}
var oe,
  Sr,
  ul = b(() => {
    Gt();
    yn();
    rr();
    ((oe = class extends M {
      constructor(t, n) {
        super(t, `Unsupported expression: ${n}`);
      }
    }),
      (Sr = class {
        deparse(t) {
          if ("A_Const" in t) {
            let s = t.A_Const;
            if (s.boolval !== void 0)
              return s.boolval.boolval ? {} : { $always: false };
          }
          if ("FuncCall" in t) {
            let s = this.storageOperationPredicate(t.FuncCall);
            if (s) return s;
          }
          let n = Object.keys(t)[0],
            r = this[n];
          if (!r) throw new oe({ [n]: t }, `Unsupported expression: ${n}`);
          return r.call(this, t[n]);
        }
        deparseValue(t) {
          if ("A_Const" in t) return this.A_Const(t.A_Const);
          if ("ColumnRef" in t) return this.ColumnRef(t.ColumnRef);
          if ("FuncCall" in t) return this.FuncCall(t.FuncCall);
          if ("SubLink" in t) return this.SubLink(t.SubLink);
          if ("TypeCast" in t) return this.TypeCast(t.TypeCast);
          if ("A_Indirection" in t) return this.A_Indirection(t.A_Indirection);
          if ("A_Expr" in t) {
            let r = this.isJwtAccessor(t.A_Expr);
            return r || this.A_Expr(t.A_Expr);
          }
          if ("BoolExpr" in t) return this.BoolExpr(t.BoolExpr);
          let n = Object.keys(t)[0];
          throw new oe({ [n]: t }, `deparseValue: ${n}`);
        }
        A_Expr(t) {
          if (t.kind === "AEXPR_OP") {
            let n = t.name?.[0],
              r = n ? hn(n) : void 0;
            if (!r) throw new oe({ A_Expr: t }, "A_Expr missing operator");
            let s = this.isJwtAccessor(t);
            if (s) return { [s]: {} };
            let i = t.lexpr ? this.deparseValue(t.lexpr) : void 0,
              o = t.rexpr ? this.deparseValue(t.rexpr) : void 0,
              a = this.mapOperator(r);
            if (!a) throw new oe({ A_Expr: t }, `Unsupported operator: ${r}`);
            if ((dt(i) || ht(i)) && (dt(o) || ht(o)))
              throw new oe(
                { A_Expr: t },
                "comparisons between Storage helper expressions are unsupported",
              );
            if (dt(i))
              return {
                $storageFolder: {
                  column: i.column,
                  index: i.index,
                  ops: { [a]: hi(t.rexpr, o) },
                },
              };
            if (dt(o)) {
              if (!gi(t.lexpr, i) && !yi(t.lexpr))
                throw new oe(
                  { A_Expr: t },
                  "storage.foldername RHS comparisons require a literal, auth placeholder, or column reference",
                );
              return {
                $storageFolder: {
                  column: o.column,
                  index: o.index,
                  ops: { [cl(a)]: hi(t.lexpr, i) },
                },
              };
            }
            if (ht(i)) return bn(i, a, hi(t.rexpr, o));
            if (ht(o)) {
              if (!gi(t.lexpr, i) && !yi(t.lexpr))
                throw new oe(
                  { A_Expr: t },
                  "Storage object helper RHS comparisons require a literal, auth placeholder, or column reference",
                );
              return bn(o, cl(a), hi(t.lexpr, i));
            }
            if (jE(o)) {
              if (!gi(t.lexpr, i))
                throw new oe(
                  { A_Expr: t },
                  "storage.operation RHS comparisons require a literal or auth placeholder",
                );
              return { [o]: { [cl(a)]: i } };
            }
            let l = t.rexpr != null && "ColumnRef" in t.rexpr;
            if (typeof i == "string" && i.startsWith("{{") && l)
              return { [o]: { [a]: i } };
            let c = l && typeof o == "string" ? { $ref: o } : o;
            return { [i]: { [a]: c } };
          }
          if (t.kind === "AEXPR_LIKE" || t.kind === "AEXPR_ILIKE") {
            let n = t.lexpr ? this.deparseValue(t.lexpr) : void 0,
              r = t.rexpr ? this.deparseValue(t.rexpr) : void 0,
              s = t.kind === "AEXPR_ILIKE" ? "~~*" : "~~",
              i = t.name?.[0] ? (hn(t.name[0]) ?? s) : s,
              o = FE(i);
            if (!o)
              throw new oe({ A_Expr: t }, `Unsupported pattern operator: ${i}`);
            if (dt(r))
              throw new oe(
                { A_Expr: t },
                "storage.foldername on the right of a pattern predicate is unsupported",
              );
            if (dt(n))
              return {
                $storageFolder: {
                  column: n.column,
                  index: n.index,
                  ops: { [o]: r },
                },
              };
            if (ht(r))
              throw new oe(
                { A_Expr: t },
                "Storage object helpers on the right of a pattern predicate are unsupported",
              );
            return ht(n) ? bn(n, o, r) : { [n]: { [o]: r } };
          }
          if (t.kind === "AEXPR_IN") {
            let n = t.lexpr ? this.deparseValue(t.lexpr) : void 0,
              s =
                (t.name?.[0] ? hn(t.name[0]) : "=") === "<>" ? "$notIn" : "$in",
              i =
                t.rexpr && "List" in t.rexpr && t.rexpr.List.items
                  ? t.rexpr.List.items.map((o) => this.deparseValue(o))
                  : [];
            return dt(n)
              ? {
                  $storageFolder: {
                    column: n.column,
                    index: n.index,
                    ops: { [s]: i },
                  },
                }
              : ht(n)
                ? bn(n, s, i)
                : { [n]: { [s]: i } };
          }
          throw new oe({ A_Expr: t }, `A_Expr kind: ${t.kind}`);
        }
        BoolExpr(t) {
          let n = t.args ?? [];
          switch (t.boolop) {
            case "AND_EXPR":
              return { $and: n.map((r) => this.deparse(r)) };
            case "OR_EXPR":
              return { $or: n.map((r) => this.deparse(r)) };
            case "NOT_EXPR":
              return { $not: this.deparse(n[0]) };
            default:
              throw new oe({ BoolExpr: t }, `BoolExpr op: ${t.boolop}`);
          }
        }
        NullTest(t) {
          let n = t.arg ? this.deparseValue(t.arg) : void 0,
            r = t.nulltesttype === "IS_NULL" ? "$is" : "$isNot";
          return dt(n)
            ? {
                $storageFolder: {
                  column: n.column,
                  index: n.index,
                  ops: { [r]: null },
                },
              }
            : ht(n)
              ? bn(n, r, null)
              : { [n]: { [r]: null } };
        }
        SubLink(t) {
          if (t.subLinkType === "ANY_SUBLINK") {
            let n = t.testexpr ? this.deparseValue(t.testexpr) : void 0,
              r = t.subselect
                ? this.SelectStmt(t.subselect.SelectStmt)
                : void 0;
            return dt(n)
              ? {
                  $storageFolder: {
                    column: n.column,
                    index: n.index,
                    ops: { $in: r },
                  },
                }
              : ht(n)
                ? bn(n, "$in", r)
                : { [n]: { $in: r } };
          }
          if (t.subLinkType === "EXISTS_SUBLINK")
            return {
              $exists: t.subselect
                ? this.SelectStmt(t.subselect.SelectStmt)
                : void 0,
            };
          if (t.subLinkType === "EXPR_SUBLINK") {
            let n = t.subselect ? t.subselect.SelectStmt : void 0;
            if (n?.fromClause?.length) return this.SelectStmt(n);
            if (n?.targetList?.[0]) {
              let r = n.targetList[0],
                s = "ResTarget" in r ? r.ResTarget : void 0;
              if (s?.val) {
                let i = this.deparseValue(s.val);
                return i;
              }
            }
          }
          throw new oe({ SubLink: t }, `SubLink type: ${t.subLinkType}`);
        }
        SelectStmt(t) {
          let {
              from: n,
              alias: r,
              schema: s,
              join: i,
            } = this.deparseFromClause(t.fromClause ?? []),
            o = [];
          for (let h of t.targetList ?? []) {
            let m = "ResTarget" in h ? h.ResTarget : void 0;
            if (m?.val) {
              let d = this.deparseValue(m.val);
              Array.isArray(d)
                ? o.push(...d.map(String))
                : d != null && d !== "" && o.push(String(d));
            }
          }
          let a = t.whereClause ? this.deparse(t.whereClause) : void 0,
            l = this.deparseSortClause(t.sortClause),
            c = this.deparseLimit(t.limitCount),
            p = this.deparseLimit(t.limitOffset),
            u = this.deparseGroupClause(t.groupClause),
            f = { type: "query", from: n, select: o };
          return (
            r && (f.alias = r),
            s && (f.schema = s),
            Object.keys(i).length > 0 && (f.join = i),
            a && (f.where = a),
            l.length > 0 && (f.order = l),
            c !== void 0 && (f.limit = c),
            p !== void 0 && (f.offset = p),
            u.length > 0 && (f.group = u),
            f
          );
        }
        FuncCall(t) {
          let n = this.isAuthFunc(t.funcname ?? []);
          if (n) return n;
          let r = Q(t.funcname ?? []);
          if (
            r.length === 2 &&
            r[0] === "storage" &&
            r[1] === "operation" &&
            (t.args?.length ?? 0) === 0
          )
            return "{{storage.operation}}";
          if (
            r.length === 2 &&
            r[0] === "storage" &&
            (r[1] === "filename" || r[1] === "extension")
          ) {
            let s = t.args?.[0];
            if (t.args?.length !== 1 || !s || !("ColumnRef" in s))
              throw new oe(
                { FuncCall: t },
                `storage.${r[1]} requires one column argument`,
              );
            let i = this.ColumnRef(s.ColumnRef);
            if (i !== "name")
              throw new oe(
                { FuncCall: t },
                `only storage.${r[1]}(name) is supported`,
              );
            return { kind: `storage.${r[1]}`, column: i };
          }
          throw new oe(
            { FuncCall: t },
            `FuncCall: ${Q(t.funcname ?? []).join(".")}`,
          );
        }
        storageOperationPredicate(t) {
          let n = Q(t.funcname ?? []);
          if (
            n.length !== 2 ||
            n[0] !== "storage" ||
            (n[1] !== "allow_only_operation" && n[1] !== "allow_any_operation")
          )
            return null;
          let r = t.args?.[0],
            s;
          if (n[1] === "allow_only_operation" && t.args?.length === 1 && r)
            s = [this.deparseValue(r)];
          else if (n[1] === "allow_any_operation" && t.args?.length === 1 && r)
            if ("A_ArrayExpr" in r)
              s = (r.A_ArrayExpr.elements ?? []).map((o) =>
                this.deparseValue(o),
              );
            else if (this.deparseValue(r) === null) s = [];
            else
              throw new oe(
                { FuncCall: t },
                `storage.${n[1]} requires its canonical operation argument`,
              );
          else
            throw new oe(
              { FuncCall: t },
              `storage.${n[1]} requires its canonical operation argument`,
            );
          if (!s.every((o) => o === null || typeof o == "string"))
            throw new oe(
              { FuncCall: t },
              `storage.${n[1]} requires text operation names`,
            );
          let i = s.filter((o) => typeof o == "string" && o !== "").map(DE);
          return n[1] === "allow_only_operation" && i.length === 0
            ? { $always: false }
            : {
                "{{storage.normalizedOperation}}":
                  n[1] === "allow_only_operation"
                    ? { $eq: i[0] }
                    : { $in: i.filter(Boolean) },
              };
        }
        ColumnRef(t) {
          let n = Q(t.fields ?? []);
          return n.length === 1 ? n[0] : n.join(".");
        }
        A_Const(t) {
          if (t.boolval !== void 0) return t.boolval.boolval;
          if (t.ival !== void 0) return t.ival.ival ?? 0;
          if (t.fval !== void 0) return parseFloat(t.fval.fval ?? "0");
          if (t.sval !== void 0) return t.sval.sval ?? "";
          if (t.isnull) return null;
          throw new oe({ A_Const: t }, "A_Const: unknown variant");
        }
        TypeCast(t) {
          if (!t.arg) throw new oe({ TypeCast: t }, "TypeCast: missing arg");
          return this.deparseValue(t.arg);
        }
        A_Indirection(t) {
          let n = t.arg?.FuncCall,
            r = n ? Q(n.funcname ?? []) : [],
            s = t.indirection ?? [],
            i = s[0]?.A_Indices,
            o = i?.uidx?.A_Const,
            a = o ? this.A_Const(o) : void 0,
            l = n?.args?.[0];
          if (
            r.length !== 2 ||
            r[0] !== "storage" ||
            r[1] !== "foldername" ||
            !l ||
            !("ColumnRef" in l) ||
            s.length !== 1 ||
            i?.is_slice === true ||
            i?.lidx != null ||
            typeof a != "number" ||
            !Number.isInteger(a) ||
            a < 1
          )
            throw new oe(
              { A_Indirection: t },
              "only indexed storage.foldername(column) expressions are supported",
            );
          let c = this.ColumnRef(l.ColumnRef);
          if (c !== "name")
            throw new oe(
              { A_Indirection: t },
              "only indexed storage.foldername(name) expressions are supported",
            );
          return { kind: "storage.foldername", column: c, index: a };
        }
        BooleanTest(t) {
          let n = t.arg ? this.deparseValue(t.arg) : void 0;
          return t.booltesttype === "IS_TRUE"
            ? { [n]: { $eq: true } }
            : { [n]: { $eq: false } };
        }
        deparseFromClause(t) {
          let n = {};
          if (t.length === 0) return { from: "", join: n };
          let r = t[0];
          if ("RangeVar" in r) {
            let s = r.RangeVar;
            return {
              from: s.relname ?? "",
              alias: s.alias?.aliasname,
              schema: s.schemaname ?? Ve,
              join: n,
            };
          }
          if ("JoinExpr" in r) {
            let {
              from: s,
              alias: i,
              schema: o,
            } = this.walkJoinExpr(r.JoinExpr, n);
            return { from: s, alias: i, schema: o, join: n };
          }
          return { from: "", join: n };
        }
        walkJoinExpr(t, n) {
          let r = { from: "" };
          if (t.larg)
            if ("RangeVar" in t.larg) {
              let s = t.larg.RangeVar;
              r = {
                from: s.relname ?? "",
                alias: s.alias?.aliasname,
                schema: s.schemaname ?? Ve,
              };
            } else
              "JoinExpr" in t.larg &&
                (r = this.walkJoinExpr(t.larg.JoinExpr, n));
          if (t.rarg && "RangeVar" in t.rarg) {
            let s = t.rarg.RangeVar,
              i = s.relname ?? "",
              o = s.alias?.aliasname ?? i,
              a = t.jointype === "JOIN_LEFT" ? "left" : "inner",
              l = s.schemaname ?? Ve,
              c = { from: l ? `${l}.${i}` : i, type: a };
            t.quals && (c.on = this.deparse(t.quals));
            let p = o;
            if (p in n) {
              let u = 2;
              for (; `${p}_${u}` in n; ) u++;
              p = `${p}_${u}`;
            }
            n[p] = c;
          }
          return r;
        }
        deparseSortClause(t) {
          if (!t) return [];
          let n = [];
          for (let r of t) {
            if (!("SortBy" in r)) continue;
            let s = r.SortBy;
            if (!s.node) continue;
            let i = String(this.deparseValue(s.node)),
              o = s.sortby_dir === "SORTBY_DESC" ? "desc" : "asc",
              a = { column: i, direction: o };
            (s.sortby_nulls === "SORTBY_NULLS_FIRST"
              ? (a.nullsFirst = true)
              : s.sortby_nulls === "SORTBY_NULLS_LAST" &&
                (a.nullsFirst = false),
              n.push(a));
          }
          return n;
        }
        deparseLimit(t) {
          if (!t) return;
          let n = this.deparseValue(t);
          return typeof n == "number" ? n : Number(n);
        }
        deparseGroupClause(t) {
          return t ? t.map((n) => String(this.deparseValue(n))) : [];
        }
        isAuthFunc(t) {
          let n = Q(t);
          if (n.length === 2 && n[0] === "auth") {
            if (n[1] === "uid") return "{{auth.uid}}";
            if (n[1] === "jwt") return "{{auth.jwt}}";
            if (n[1] === "role") return "{{auth.role}}";
            throw new Error(
              `Unsupported auth function: "${n.slice(1).join(".")}"`,
            );
          }
          return null;
        }
        isJwtAccessor(t) {
          if (t.kind !== "AEXPR_OP") return null;
          let n = t.name?.[0] ? hn(t.name[0]) : void 0;
          if (n !== "->" && n !== "->>") return null;
          let r =
            t.rexpr && "A_Const" in t.rexpr
              ? t.rexpr.A_Const.sval?.sval
              : void 0;
          if (r === void 0) return null;
          if (t.lexpr && "FuncCall" in t.lexpr)
            return this.isAuthFunc(t.lexpr.FuncCall.funcname ?? []) ===
              "{{auth.jwt}}"
              ? `{{auth.jwt.${r}}}`
              : null;
          if (t.lexpr && "A_Expr" in t.lexpr) {
            let s = this.isJwtAccessor(t.lexpr.A_Expr);
            if (s) return `${s.slice(0, -2)}.${r}}}`;
          }
          return null;
        }
        mapOperator(t) {
          switch (t) {
            case "=":
              return "$eq";
            case "<>":
            case "!=":
              return "$neq";
            case ">":
              return "$gt";
            case ">=":
              return "$gte";
            case "<":
              return "$lt";
            case "<=":
              return "$lte";
            case "~~":
              return "$like";
            case "!~~":
              return "$notLike";
            default:
              return;
          }
        }
      }));
  });
var At,
  pl = b(() => {
    At = class e {
      constructor(t) {
        this.data = t;
      }
      appliesTo(t) {
        return this.data.command === "ALL" || this.data.command === t;
      }
      appliesToRole(t) {
        return this.data.roles.length === 0 || this.data.roles.includes(t);
      }
      toJSON() {
        return this.data;
      }
      static fromJSON(t) {
        return new e(t);
      }
    };
  });
var Er,
  fl = b(() => {
    Er = class extends Error {
      constructor(n, r, s, i) {
        super(`check constraint "${s}" violated for ${n}.${r}`);
        this.table = n;
        this.column = r;
        this.constraint = s;
        this.value = i;
        this.name = "CheckConstraintError";
      }
    };
  });
var _e,
  gt = b(() => {
    fl();
    _e = class {
      context;
      factoryExtra;
      constructor(t) {
        this.context = t;
      }
      get isShimBacked() {
        return false;
      }
      checkConstraint() {
        return null;
      }
      serialize(t) {
        return t;
      }
      deserialize(t) {
        return t;
      }
      validateStorage(t) {
        return { status: "pass", message: null };
      }
      validationFail(t, n) {
        return { status: "fail", message: t, action: n };
      }
      validationPass() {
        return { status: "pass", message: null };
      }
      isNullish(t) {
        return t == null;
      }
      toColumnDDL(t) {
        let { includeNullable: n = true } = t ?? {},
          r = [],
          s = this.context.column;
        (r.push(this.quoteIfNeeded(s)),
          r.push(this.sqliteType),
          this.context.isPrimaryKey && r.push("PRIMARY KEY"),
          this.context.isSerial &&
            this.context.isPrimaryKey &&
            r.push("AUTOINCREMENT"),
          n &&
            !this.context.nullable &&
            !this.context.isPrimaryKey &&
            r.push("NOT NULL"),
          this.context.isUnique &&
            !this.context.isPrimaryKey &&
            r.push("UNIQUE"),
          this.context.defaultValue !== null &&
            r.push(`DEFAULT ${this.context.defaultValue}`));
        let i = this.checkConstraint();
        return (i && r.push(`CHECK (${i})`), r.join(" "));
      }
      checkError(t, n) {
        return new Er(this.context.table, this.context.column, t, n);
      }
      quoteIfNeeded(t) {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(t) ? t : `"${t}"`;
      }
    };
  });
var Vt,
  bi = b(() => {
    gt();
    Vt = class extends _e {
      get sqliteType() {
        return "INTEGER";
      }
    };
  });
var _r,
  ml = b(() => {
    bi();
    _r = class extends Vt {
      constructor(t) {
        super({ ...t, isSerial: true });
      }
    };
  });
function ME(e, t) {
  let { precision: n, scale: r } = t,
    s = 10 ** r,
    i = 10 ** (n - r);
  return Math.abs(Math.round(e * s) - e * s) < 1e-4 && Math.abs(e) < i;
}
var Kt,
  wi = b(() => {
    gt();
    Kt = class extends _e {
      numericPrecision;
      constructor(t, n) {
        (super(t), (this.numericPrecision = n));
      }
      get isShimBacked() {
        return this.numericPrecision !== void 0;
      }
      get sqliteType() {
        return "REAL";
      }
      checkConstraint() {
        if (this.numericPrecision) {
          let { precision: t, scale: n } = this.numericPrecision,
            r = this.context.column,
            s = 10 ** n,
            i = 10 ** (t - n);
          return `ABS(ROUND(${r} * ${s}) - ${r} * ${s}) < 0.0001 AND ABS(${r}) < ${i}`;
        }
        return null;
      }
      validateStorage(t) {
        if (this.isNullish(t)) return this.validationPass();
        if (typeof t != "number" || !Number.isFinite(t))
          return this.validationFail(
            "Expected finite number.",
            "Patch rows with finite numbers.",
          );
        if (this.numericPrecision) {
          let { precision: n, scale: r } = this.numericPrecision;
          if (!ME(t, this.numericPrecision))
            return this.validationFail(
              `Does not fit numeric(${n}, ${r}).`,
              "Patch rows within numeric precision.",
            );
        }
        return this.validationPass();
      }
    };
  });
var ue,
  Ue = b(() => {
    gt();
    ue = class extends _e {
      lengthConstraint;
      constructor(t, n) {
        (super(t), (this.lengthConstraint = n));
      }
      get isShimBacked() {
        return this.lengthConstraint !== void 0;
      }
      get sqliteType() {
        return "TEXT";
      }
      checkConstraint() {
        return this.lengthConstraint !== void 0
          ? `length(${this.context.column}) <= ${this.lengthConstraint}`
          : null;
      }
      validateStorage(t) {
        return this.isNullish(t)
          ? this.validationPass()
          : typeof t != "string"
            ? this.validationFail(
                "Expected text.",
                "Patch rows with text values.",
              )
            : this.lengthConstraint !== void 0 &&
                Array.from(t).length > this.lengthConstraint
              ? this.validationFail(
                  `Exceeds length ${this.lengthConstraint}.`,
                  "Patch rows with shorter text.",
                )
              : this.validationPass();
      }
    };
  });
var xr,
  dl = b(() => {
    gt();
    xr = class extends _e {
      get sqliteType() {
        return "BLOB";
      }
    };
  });
var Tr,
  hl = b(() => {
    gt();
    Tr = class extends _e {
      get isShimBacked() {
        return true;
      }
      get sqliteType() {
        return "INTEGER";
      }
      checkConstraint() {
        return `${this.context.column} IN (0, 1)`;
      }
      serialize(t) {
        if (this.isNullish(t)) return t;
        if (t === true || t === 1) return 1;
        if (t === false || t === 0) return 0;
        throw this.checkError("boolean_range", t);
      }
      deserialize(t) {
        if (this.isNullish(t) || t === true || t === false) return t;
        if (typeof t == "number" && Number.isFinite(t)) {
          if (t === 1) return true;
          if (t === 0) return false;
        }
        return t === 1n
          ? true
          : t === 0n
            ? false
            : t === "1" || t === "true"
              ? true
              : t === "0" || t === "false"
                ? false
                : t;
      }
      validateStorage(t) {
        return this.isNullish(t)
          ? this.validationPass()
          : t === 1 || t === 0
            ? this.validationPass()
            : this.validationFail(
                "Expected 0 or 1.",
                "Patch rows with boolean values.",
              );
      }
    };
  });
function Am(e) {
  try {
    return { ok: !0, value: JSON.parse(e) };
  } catch {
    return { ok: false };
  }
}
var Cr,
  gl = b(() => {
    gt();
    Cr = class extends _e {
      get isShimBacked() {
        return true;
      }
      get sqliteType() {
        return "TEXT";
      }
      checkConstraint() {
        let t = this.context.column;
        return `${t} IS NULL OR json_valid(${t})`;
      }
      serialize(t) {
        if (this.isNullish(t)) return t;
        try {
          return JSON.stringify(t);
        } catch {
          throw this.checkError("json_valid", t);
        }
      }
      deserialize(t) {
        if (this.isNullish(t)) return t;
        if (typeof t == "string") {
          let n = Am(t);
          return n.ok ? n.value : t;
        }
        return t;
      }
      validateStorage(t) {
        return this.isNullish(t)
          ? this.validationPass()
          : typeof t != "string"
            ? this.validationFail(
                "Expected JSON text.",
                "Patch rows with JSON values.",
              )
            : Am(t).ok
              ? this.validationPass()
              : this.validationFail(
                  "Invalid JSON text.",
                  "Patch rows with valid JSON.",
                );
      }
    };
  });
function UE(e) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) return false;
  let t = new Date(`${e}T00:00:00.000Z`);
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === e;
}
var Ar,
  yl = b(() => {
    Ue();
    Ar = class extends ue {
      get isShimBacked() {
        return true;
      }
      checkConstraint() {
        let t = this.context.column;
        return `${t} IS NULL OR date(${t}) IS NOT NULL`;
      }
      validateStorage(t) {
        return this.isNullish(t)
          ? this.validationPass()
          : typeof t != "string" || !UE(t)
            ? this.validationFail(
                "Invalid date.",
                "Patch rows with YYYY-MM-DD dates.",
              )
            : this.validationPass();
      }
    };
  });
function BE(e) {
  let t = e.match(
    /^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,6})?)?([+-](\d{2}):?(\d{2}))?$/,
  );
  if (!t) return false;
  let n = Number(t[1]),
    r = Number(t[2]),
    s = t[3] === void 0 ? 0 : Number(t[3]),
    i = t[5] === void 0 ? null : Number(t[5]),
    o = t[6] === void 0 ? null : Number(t[6]),
    a = i === null || (o !== null && i <= 15 && o <= 59);
  return (
    n <= 24 && r <= 59 && s <= 59 && (n !== 24 || (r === 0 && s === 0)) && a
  );
}
var $r,
  bl = b(() => {
    Ue();
    $r = class extends ue {
      get isShimBacked() {
        return true;
      }
      checkConstraint() {
        let t = this.context.column;
        return `${t} IS NULL OR time(${t}) IS NOT NULL`;
      }
      validateStorage(t) {
        return this.isNullish(t)
          ? this.validationPass()
          : typeof t != "string" || !BE(t)
            ? this.validationFail(
                "Invalid time.",
                "Patch rows with HH:MM[:SS] times.",
              )
            : this.validationPass();
      }
    };
  });
function qE(e) {
  let t = e.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,6})?)?(?:Z|([+-](\d{2}):?(\d{2})))?$/,
  );
  if (!t) return false;
  let n = Number(t[1]),
    r = Number(t[2]),
    s = Number(t[3]),
    i = Number(t[4]),
    o = Number(t[5]),
    a = t[6] === void 0 ? 0 : Number(t[6]),
    l = t[8] === void 0 ? null : Number(t[8]),
    c = t[9] === void 0 ? null : Number(t[9]),
    p = new Date(Date.UTC(n, r - 1, s)),
    u =
      p.getUTCFullYear() === n &&
      p.getUTCMonth() === r - 1 &&
      p.getUTCDate() === s,
    f = i <= 24 && o <= 59 && a <= 59 && (i !== 24 || (o === 0 && a === 0)),
    h = l === null || (c !== null && l <= 15 && c <= 59);
  return u && f && h;
}
var Rr,
  wl = b(() => {
    Ue();
    Rr = class extends ue {
      get isShimBacked() {
        return true;
      }
      checkConstraint() {
        let t = this.context.column;
        return `${t} IS NULL OR datetime(${t}) IS NOT NULL`;
      }
      validateStorage(t) {
        return this.isNullish(t)
          ? this.validationPass()
          : typeof t != "string" || !qE(t)
            ? this.validationFail(
                "Invalid timestamp.",
                "Patch rows with ISO timestamps.",
              )
            : this.validationPass();
      }
    };
  });
var vr,
  Sl = b(() => {
    Ue();
    vr = class extends ue {
      get isShimBacked() {
        return true;
      }
      validateStorage(t) {
        return this.isNullish(t)
          ? this.validationPass()
          : typeof t != "string" || t.trim().length === 0
            ? this.validationFail(
                "Expected interval text.",
                "Patch rows with interval strings.",
              )
            : /^-?\d+(?:\.\d+)?$/.test(t.trim())
              ? this.validationFail(
                  "Ambiguous numeric interval.",
                  "Patch rows with explicit interval strings.",
                )
              : this.validationPass();
      }
    };
  });
var kr,
  El = b(() => {
    Ue();
    kr = class extends ue {
      enumValues;
      constructor(t, n) {
        (super(t), (this.enumValues = n));
      }
      get isShimBacked() {
        return true;
      }
      checkConstraint() {
        let t = this.context.column,
          n = this.enumValues
            .map((r) => `'${r.replace(/'/g, "''")}'`)
            .join(", ");
        return `${t} IN (${n})`;
      }
      serialize(t) {
        if (this.isNullish(t)) return t;
        if (typeof t != "string" || !this.enumValues.includes(t))
          throw this.checkError("enum_membership", t);
        return t;
      }
      validateStorage(t) {
        return this.isNullish(t)
          ? this.validationPass()
          : typeof t != "string" || !this.enumValues.includes(t)
            ? this.validationFail(
                "Invalid enum value.",
                "Patch rows with declared enum values.",
              )
            : this.validationPass();
      }
    };
  });
function $m(e) {
  try {
    return { ok: !0, value: JSON.parse(e) };
  } catch {
    return { ok: false };
  }
}
var st,
  Pr = b(() => {
    gt();
    st = class extends _e {
      elementField;
      constructor(t, n) {
        (super(t), (this.elementField = n));
      }
      get sqliteType() {
        return "TEXT";
      }
      get isShimBacked() {
        return true;
      }
      checkConstraint() {
        let t = this.context.column;
        return `${t} IS NULL OR (json_valid(${t}) AND json_type(${t}) = 'array')`;
      }
      serialize(t) {
        if (this.isNullish(t)) return t;
        if (!Array.isArray(t)) throw this.checkError("array_type", t);
        return this.elementField
          ? JSON.stringify(t.map((n) => this.elementField.serialize(n)))
          : JSON.stringify(t);
      }
      deserialize(t) {
        if (this.isNullish(t)) return t;
        if (typeof t == "string") {
          let n = $m(t);
          if (n.ok && Array.isArray(n.value))
            return this.elementField
              ? n.value.map((r) => this.elementField.deserialize(r))
              : n.value;
        }
        return t;
      }
      validateStorage(t) {
        if (this.isNullish(t)) return this.validationPass();
        if (typeof t != "string")
          return this.validationFail(
            "Expected JSON array text.",
            "Patch rows with array values.",
          );
        let n = $m(t);
        if (!n.ok)
          return this.validationFail(
            "Invalid JSON array text.",
            "Patch rows with array values.",
          );
        if (!Array.isArray(n.value))
          return this.validationFail(
            "Expected JSON array.",
            "Patch rows with array values.",
          );
        if (this.elementField)
          for (let r of n.value) {
            let s = this.elementField.validateStorage(r);
            if (s.status === "fail")
              return this.validationFail(
                `Invalid ${this.elementField.context.pgTypeName} array element.`,
                s.action ?? "Patch rows with valid array elements.",
              );
          }
        return this.validationPass();
      }
    };
  });
function Rm(e) {
  return GE.test(e.toLowerCase());
}
var HE,
  GE,
  Nr,
  _l = b(() => {
    Ue();
    ((HE = "????????-????-????-????-????????????"),
      (GE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/));
    Nr = class extends ue {
      get isShimBacked() {
        return true;
      }
      checkConstraint() {
        let t = this.quoteIfNeeded(this.context.column);
        return `${t} IS NULL OR ${t} GLOB '${HE}'`;
      }
      serialize(t) {
        if (this.isNullish(t)) return t;
        if (typeof t != "string") throw this.checkError("uuid_format", t);
        let n = t.toLowerCase();
        if (!Rm(n)) throw this.checkError("uuid_format", t);
        return n;
      }
      validateStorage(t) {
        return this.isNullish(t)
          ? this.validationPass()
          : typeof t != "string" || !Rm(t)
            ? this.validationFail(
                "Invalid UUID.",
                "Patch rows with valid UUIDs.",
              )
            : this.validationPass();
      }
    };
  });
function WE(e) {
  let t = e.split("/");
  if (t.length > 2) return null;
  let n = t[0];
  if (!n) return null;
  if (t.length === 1) return { address: n, prefix: null };
  let r = t[1];
  return !r || !/^\d+$/.test(r) ? null : { address: n, prefix: Number(r) };
}
function VE(e) {
  let t = e.split(".");
  return t.length !== 4
    ? false
    : t.every((n) => {
        if (!/^\d+$/.test(n)) return false;
        let r = Number(n);
        return r >= 0 && r <= 255;
      });
}
function KE(e) {
  if (!e.includes(":")) return false;
  try {
    return (new URL(`http://[${e}]/`), !0);
  } catch {
    return false;
  }
}
function vm(e) {
  let t = WE(e);
  return t
    ? VE(t.address)
      ? t.prefix === null || (t.prefix >= 0 && t.prefix <= 32)
      : KE(t.address)
        ? t.prefix === null || (t.prefix >= 0 && t.prefix <= 128)
        : false
    : false;
}
var Or,
  xl = b(() => {
    Ue();
    Or = class extends ue {
      get isShimBacked() {
        return true;
      }
      checkConstraint() {
        let t = this.quoteIfNeeded(this.context.column);
        return `${t} IS NULL OR (length(${t}) BETWEEN 3 AND 49 AND (instr(${t}, '.') > 0 OR instr(${t}, ':') > 0))`;
      }
      serialize(t) {
        if (this.isNullish(t)) return t;
        if (typeof t != "string") throw this.checkError("inet_format", t);
        let n = t.trim();
        if (!vm(n)) throw this.checkError("inet_format", t);
        return n;
      }
      validateStorage(t) {
        return this.isNullish(t)
          ? this.validationPass()
          : typeof t != "string" || !vm(t.trim())
            ? this.validationFail(
                "Invalid inet address.",
                "Patch rows with valid inet strings.",
              )
            : this.validationPass();
      }
    };
  });
var Lr,
  Tl = b(() => {
    Ue();
    Lr = class extends ue {
      serialize(t) {
        throw new Error(
          `Unsupported type "${this.context.pgTypeName}" for ${this.context.table}.${this.context.column}`,
        );
      }
      deserialize(t) {
        throw new Error(
          `Unsupported type "${this.context.pgTypeName}" for ${this.context.table}.${this.context.column}`,
        );
      }
      toColumnDDL() {
        throw new Error(
          `Unsupported type "${this.context.pgTypeName}" for ${this.context.table}.${this.context.column}`,
        );
      }
    };
  });
function je(e, t) {
  let n = l_(e, t);
  if (t) {
    let { enumValues: r, ...s } = t;
    n.factoryExtra = s;
  }
  return n;
}
function l_(e, t) {
  if (t?.isArray) {
    let r = je(e, { ...t, isArray: false });
    return new st(e, r);
  }
  if (t?.enumValues) return new kr(e, t.enumValues);
  let n = e.pgTypeName.toLowerCase().trim();
  if (n.startsWith("_") || n.endsWith("[]")) {
    let r = n.startsWith("_") ? n.slice(1) : n.slice(0, -2),
      s = { ...e, pgTypeName: r },
      i = je(s);
    return new st(e, i);
  }
  return XE.has(n)
    ? new _r(e)
    : zE.has(n)
      ? new Vt(e)
      : ZE.has(n)
        ? new Tr(e)
        : e_.has(n)
          ? new Cr(e)
          : s_.has(n)
            ? new Ar(e)
            : i_.has(n)
              ? new $r(e)
              : o_.has(n)
                ? new Rr(e)
                : a_.has(n)
                  ? new vr(e)
                  : QE.has(n)
                    ? new xr(e)
                    : JE.has(n)
                      ? new Kt(e, t?.numericPrecision)
                      : t_.has(n)
                        ? new Nr(e)
                        : n_.has(n)
                          ? new ue(e, 63)
                          : r_.has(n)
                            ? new Or(e)
                            : YE.has(n)
                              ? new ue(e, t?.lengthConstraint)
                              : new Lr(e);
}
var zE,
  XE,
  JE,
  YE,
  QE,
  ZE,
  e_,
  t_,
  n_,
  r_,
  s_,
  i_,
  o_,
  a_,
  Cl = b(() => {
    bi();
    ml();
    wi();
    Ue();
    dl();
    hl();
    gl();
    yl();
    bl();
    wl();
    Sl();
    El();
    Pr();
    _l();
    xl();
    Tl();
    ((zE = new Set([
      "int2",
      "smallint",
      "int4",
      "integer",
      "int",
      "int8",
      "bigint",
    ])),
      (XE = new Set([
        "serial",
        "serial4",
        "bigserial",
        "serial8",
        "smallserial",
        "serial2",
      ])),
      (JE = new Set([
        "float4",
        "real",
        "float8",
        "double precision",
        "numeric",
        "decimal",
      ])),
      (YE = new Set([
        "text",
        "varchar",
        "character varying",
        "char",
        "character",
        "bpchar",
      ])),
      (QE = new Set(["bytea"])),
      (ZE = new Set(["bool", "boolean"])),
      (e_ = new Set(["json", "jsonb"])),
      (t_ = new Set(["uuid"])),
      (n_ = new Set(["name"])),
      (r_ = new Set(["inet"])),
      (s_ = new Set(["date"])),
      (i_ = new Set([
        "time",
        "timetz",
        "time without time zone",
        "time with time zone",
      ])),
      (o_ = new Set([
        "timestamp",
        "timestamptz",
        "timestamp without time zone",
        "timestamp with time zone",
      ])),
      (a_ = new Set(["interval"])));
  });
function Al(e, t = "auto") {
  let n = e.toLowerCase(),
    r = Si[n];
  if (!r) return null;
  switch (t) {
    case "translate": {
      if (!r.sqlite)
        throw new Error(`No SQLite translation for function "${e}"`);
      return { sqliteExpr: r.sqlite(), jsFn: null };
    }
    case "synthetic": {
      if (!r.js) throw new Error(`No JS implementation for function "${e}"`);
      return { sqliteExpr: null, jsFn: r.js };
    }
    case "auto":
      return r.js
        ? { sqliteExpr: null, jsFn: r.js }
        : r.sqlite
          ? { sqliteExpr: r.sqlite(), jsFn: null }
          : null;
  }
}
var km,
  Si,
  $l = b(() => {
    ((km =
      "lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))"),
      (Si = {
        gen_random_uuid: { sqlite: () => km, js: () => crypto.randomUUID() },
        uuid_generate_v4: { sqlite: () => km, js: () => crypto.randomUUID() },
        now: {
          sqlite: () => "datetime('now')",
          js: () => new Date().toISOString(),
        },
        current_timestamp: {
          sqlite: () => "datetime('now')",
          js: () => new Date().toISOString(),
        },
        current_date: {
          sqlite: () => "date('now')",
          js: () => new Date().toISOString().split("T")[0],
        },
        current_time: {
          sqlite: () => "time('now')",
          js: () => new Date().toISOString().split("T")[1].replace("Z", ""),
        },
        random: { sqlite: () => "random()", js: () => Math.random() },
        length: { sqlite: () => "length", js: null },
        lower: { sqlite: () => "lower", js: null },
        upper: { sqlite: () => "upper", js: null },
        substr: { sqlite: () => "substr", js: null },
        substring: { sqlite: () => "substr", js: null },
        trim: { sqlite: () => "trim", js: null },
        ltrim: { sqlite: () => "ltrim", js: null },
        rtrim: { sqlite: () => "rtrim", js: null },
        replace: { sqlite: () => "replace", js: null },
        coalesce: { sqlite: () => "coalesce", js: null },
        nullif: { sqlite: () => "nullif", js: null },
        count: { sqlite: () => "count", js: null },
        sum: { sqlite: () => "sum", js: null },
        avg: { sqlite: () => "avg", js: null },
        min: { sqlite: () => "min", js: null },
        max: { sqlite: () => "max", js: null },
        localtime: { sqlite: () => "time('now', 'localtime')", js: null },
        localtimestamp: {
          sqlite: () => "datetime('now', 'localtime')",
          js: null,
        },
      }));
  });
var zt,
  Pm = b(() => {
    zt = class {
      table;
      schema;
      fields;
      constructor(t, n = "public", r = new Map()) {
        ((this.table = t), (this.schema = n), (this.fields = r));
      }
      get(t) {
        return this.fields.get(t);
      }
      has(t) {
        return this.fields.has(t);
      }
      set(t, n) {
        this.fields.set(t, n);
      }
      columns() {
        return Array.from(this.fields.keys());
      }
      all() {
        return Array.from(this.fields.values());
      }
      serializeRow(t) {
        let n = {};
        for (let [r, s] of Object.entries(t)) {
          let i = this.fields.get(r);
          n[r] = i ? i.serialize(s) : s;
        }
        return n;
      }
      deserializeRow(t) {
        let n = {};
        for (let [r, s] of Object.entries(t)) {
          let i = this.fields.get(r);
          n[r] = i ? i.deserialize(s) : s;
        }
        return n;
      }
      applyDefaults(t) {
        let n = { ...t };
        for (let [r, s] of this.fields)
          !(r in n) && s.context.defaultFn && (n[r] = s.context.defaultFn());
        return n;
      }
    };
  });
var Nm = b(() => {
  gt();
  fl();
  bi();
  ml();
  wi();
  Ue();
  dl();
  hl();
  gl();
  yl();
  bl();
  wl();
  Sl();
  El();
  Pr();
  _l();
  xl();
  Tl();
  Cl();
  $l();
  Pm();
});
var Dl = {};
pe(Dl, {
  _resetWarnedMissingToClauseForTests: () => c_,
  collectComments: () => Il,
  collectEnums: () => Pl,
  collectPolicies: () => Ol,
  collectSchema: () => Ir,
  collectTableConstraints: () => Ll,
  collectVariables: () => Nl,
  lookupEnumValue: () => Be,
});
function c_() {
  kl.clear();
}
function Pl(e) {
  let t = new Map(),
    n = (i) => {
      let o = i.toLowerCase();
      return o.startsWith("public.")
        ? [o, o.slice(7)]
        : o.includes(".")
          ? [o]
          : [o, `public.${o}`];
    },
    r = (i, o) => {
      for (let a of n(i)) t.set(a, o);
    },
    s = (i) => {
      for (let o of n(i)) t.delete(o);
    };
  for (let i of e.stmts ?? [])
    if (i.stmt) {
      if ("CreateEnumStmt" in i.stmt) {
        let o = i.stmt.CreateEnumStmt,
          a = Q(o.typeName ?? []).join(".");
        a && o.vals && r(a, Q(o.vals));
        continue;
      }
      if ("AlterEnumStmt" in i.stmt) {
        let o = i.stmt.AlterEnumStmt,
          a = Q(o.typeName ?? []).join("."),
          l = Be(t, a);
        if (!a || !l || !o.newVal) continue;
        let c = [...l];
        if (o.oldVal) {
          let f = c.indexOf(o.oldVal);
          (f !== -1 && (c[f] = o.newVal), r(a, c));
          continue;
        }
        if (l.includes(o.newVal)) continue;
        let p = o.newValNeighbor ? c.indexOf(o.newValNeighbor) : -1,
          u = p === -1 ? c.length : p + (o.newValIsAfter === true ? 1 : 0);
        (c.splice(u, 0, o.newVal), r(a, c));
        continue;
      }
      if (
        "RenameStmt" in i.stmt &&
        i.stmt.RenameStmt.renameType === "OBJECT_TYPE"
      ) {
        let o = i.stmt.RenameStmt,
          a =
            o.object && "List" in o.object ? Q(o.object.List.items ?? []) : [],
          l = a.join("."),
          c = Be(t, l);
        if (!l || !o.newname || !c) continue;
        (s(l), r([...a.slice(0, -1), o.newname].join("."), c));
        continue;
      }
      if ("DropStmt" in i.stmt && i.stmt.DropStmt.removeType === "OBJECT_TYPE")
        for (let o of i.stmt.DropStmt.objects ?? [])
          "TypeName" in o && s(Q(o.TypeName.names ?? []).join("."));
    }
  return t;
}
function Be(e, t) {
  let n = t.toLowerCase(),
    r = e.get(n);
  return (
    r || (n.startsWith("public.") ? e.get(n.slice(7)) : e.get(`public.${n}`))
  );
}
function Nl(e) {
  let t = new Map();
  for (let n of e.stmts ?? []) {
    if (!n.stmt || !("VariableSetStmt" in n.stmt)) continue;
    let r = n.stmt.VariableSetStmt,
      s = r.name,
      i = xm(r.args?.[0] ?? {});
    t.set(s, { value: i, local: r.is_local });
  }
  return t;
}
function Om(e) {
  let t = [],
    n = false;
  for (let r of e ?? [])
    if ("RoleSpec" in r) {
      let s = r.RoleSpec;
      s.roletype === "ROLESPEC_PUBLIC"
        ? s.location === -1 && (n = true)
        : s.roletype === "ROLESPEC_CSTRING" && s.rolename && t.push(s.rolename);
    }
  return { roles: t, implicitPublic: n };
}
function Ei(e) {
  return e && e.length > 0 ? e : Ve;
}
function Rl(e, t) {
  return e.findIndex(
    (n) =>
      n.data.name === t.name &&
      n.data.table === t.table &&
      Ei(n.data.schema) === Ei(t.schema),
  );
}
function vl(e, t) {
  return new Error(`policy "${e}" for table "${t}" does not exist`);
}
function Lm(e, t, n) {
  return e.data.table === t && Ei(e.data.schema) === Ei(n);
}
function Ol(e, t = {}) {
  let n = t.validateMutations === true,
    r = new Sr(),
    s = new Set(),
    i = [];
  for (let o of e.stmts ?? [])
    if (o.stmt) {
      if ("CreatePolicyStmt" in o.stmt) {
        let a = o.stmt.CreatePolicyStmt,
          l = a.table?.relname ?? "",
          c = a.table?.schemaname,
          p = {
            select: "SELECT",
            insert: "INSERT",
            update: "UPDATE",
            delete: "DELETE",
          },
          u = a.cmd_name ? (p[a.cmd_name] ?? "ALL") : "ALL",
          f = a.permissive === true,
          { roles: h, implicitPublic: m } = Om(a.roles),
          d = a.qual ? r.deparse(a.qual) : void 0,
          g = a.with_check ? r.deparse(a.with_check) : void 0;
        if (m) {
          let _ = c ? `${c}.${l}` : l,
            x = a.policy_name ?? "",
            $ = `${_}::${x}`;
          if (!kl.has($)) {
            kl.add($);
            let C = JSON.stringify(d) + JSON.stringify(g);
            /\{\{auth\.(uid|jwt|role)/i.test(C) ||
              console.warn(
                `[supalite] policy "${x}" on "${_}" has no TO clause \u2014 applies to all roles (PUBLIC). For clarity, prefer an explicit \`TO <role>\` clause (e.g. \`TO authenticated\`).`,
              );
          }
        }
        let y = new At({
          name: a.policy_name ?? "",
          table: l,
          schema: c,
          command: u,
          permissive: f,
          roles: h,
          using: d,
          withCheck: g,
        });
        i.push(y);
      }
      if (
        "DropStmt" in o.stmt &&
        o.stmt.DropStmt.removeType === "OBJECT_POLICY"
      ) {
        let a = o.stmt.DropStmt,
          l = a.objects?.[0];
        if (l && "List" in l) {
          let c = Q(l.List.items ?? []),
            p = c[c.length - 1],
            u = c[c.length - 2],
            f = c.length >= 3 ? c[c.length - 3] : void 0;
          if (p && u) {
            let h = Rl(i, { name: p, table: u, schema: f });
            if (h !== -1) i.splice(h, 1);
            else if (n && !a.missing_ok) throw vl(p, u);
          }
        }
      }
      if ("AlterPolicyStmt" in o.stmt) {
        let a = o.stmt.AlterPolicyStmt,
          l = a.policy_name ?? "",
          c = a.table?.relname ?? "",
          p = a.table?.schemaname,
          u = Rl(i, { name: l, table: c, schema: p });
        if (u === -1) {
          if (n) throw vl(l, c);
          continue;
        }
        let f = i[u].data,
          h = a.roles ? Om(a.roles).roles : f.roles,
          m = a.qual ? r.deparse(a.qual) : f.using,
          d = a.with_check ? r.deparse(a.with_check) : f.withCheck;
        i[u] = new At({ ...f, roles: h, using: m, withCheck: d });
      }
      if (
        "RenameStmt" in o.stmt &&
        o.stmt.RenameStmt.renameType === "OBJECT_POLICY"
      ) {
        let a = o.stmt.RenameStmt,
          l = a.subname ?? "",
          c = a.relation?.relname ?? "",
          p = a.relation?.schemaname,
          u = Rl(i, { name: l, table: c, schema: p });
        if (u === -1) {
          if (n) throw vl(l, c);
          continue;
        }
        a.newname && (i[u] = new At({ ...i[u].data, name: a.newname }));
      }
      if (
        "RenameStmt" in o.stmt &&
        o.stmt.RenameStmt.renameType === "OBJECT_TABLE"
      ) {
        let a = o.stmt.RenameStmt,
          l = a.relation?.relname ?? "",
          c = a.newname ?? "",
          p = a.relation?.schemaname;
        if (l && c && l !== c) {
          s.delete(l) && s.add(c);
          for (let u = 0; u < i.length; u++)
            Lm(i[u], l, p) && (i[u] = new At({ ...i[u].data, table: c }));
        }
      }
      if ("DropStmt" in o.stmt && o.stmt.DropStmt.removeType === "OBJECT_TABLE")
        for (let a of o.stmt.DropStmt.objects ?? []) {
          if (!("List" in a)) continue;
          let l = Q(a.List.items ?? []),
            c = l[l.length - 1],
            p = l.length >= 2 ? l[l.length - 2] : void 0;
          if (c) {
            s.delete(c);
            for (let u = i.length - 1; u >= 0; u--)
              Lm(i[u], c, p) && i.splice(u, 1);
          }
        }
      if ("AlterTableStmt" in o.stmt) {
        let a = o.stmt.AlterTableStmt,
          l = a.relation?.relname ?? "";
        for (let c of a.cmds ?? []) {
          if (!("AlterTableCmd" in c)) continue;
          let p = c.AlterTableCmd.subtype;
          p === "AT_EnableRowSecurity"
            ? s.add(l)
            : p === "AT_DisableRowSecurity" && s.delete(l);
        }
      }
    }
  return { policies: i, tables: s };
}
function wn(e, t = new Set()) {
  if (Array.isArray(e)) {
    for (let s of e) wn(s, t);
    return t;
  }
  if (!e || typeof e != "object") return t;
  let n = e,
    r = n.ColumnRef;
  if (r?.fields) {
    let s = Q(r.fields),
      i = s[s.length - 1];
    i && i !== "*" && t.add(i);
  }
  for (let s of Object.values(n)) wn(s, t);
  return t;
}
function Ae(e, t, n) {
  if (n.length === 0) return;
  let r = t === "unique" ? "key" : t === "foreign_key" ? "fkey" : "check";
  return `${e}_${n.join("_")}_${r}`;
}
function Ir(e, t, n) {
  let r = new Map();
  for (let s of e.stmts ?? [])
    if (s.stmt) {
      if ("CreateStmt" in s.stmt) {
        let i = s.stmt.CreateStmt,
          o = i.relation?.relname ?? "",
          a = i.relation?.schemaname ?? "public";
        if (!o) continue;
        let l = `${a}.${o}`;
        if (i.if_not_exists && r.has(l)) continue;
        let c = new zt(o, a);
        for (let u of i.tableElts ?? []) {
          if (!("ColumnDef" in u)) continue;
          let f = u.ColumnDef,
            h = f.colname;
          if (!h) continue;
          let m = f.typeName?.names
              ?.map((I) => I.String?.sval || I.String?.str)
              .filter(Boolean),
            d =
              m && m.length > 0
                ? m.length === 2 && m[0] === "pg_catalog"
                  ? m[1]
                  : m.join(".")
                : void 0;
          if (!d) continue;
          let g = !!f.typeName?.arrayBounds?.length,
            y = Array.isArray(f.typeName?.typmods) ? f.typeName.typmods : [],
            _ = (I) =>
              y[I]?.A_Const?.ival?.ival ?? y[I]?.A_Const?.val?.ival?.ival,
            x = { isArray: g };
          if (fi(d) && y.length > 0) {
            let I = _(0);
            typeof I == "number" && I > 0 && (x.lengthConstraint = I);
          }
          if (mi(d) && y.length >= 2) {
            let I = _(0),
              D = _(1);
            typeof I == "number" &&
              typeof D == "number" &&
              I > 0 &&
              D >= 0 &&
              (x.numericPrecision = { precision: I, scale: D });
          }
          let $ = Be(t, d);
          $ && (x.enumValues = $);
          let C = Array.isArray(f.constraints) ? f.constraints : [],
            v = C.some((I) => I.Constraint?.contype === "CONSTR_PRIMARY"),
            A = C.find((I) => I.Constraint?.contype === "CONSTR_DEFAULT"),
            T =
              pi(d) ||
              n?.has(f) === true ||
              C.some((I) => I.Constraint?.contype === "CONSTR_IDENTITY") ||
              Q(A?.Constraint?.raw_expr?.FuncCall?.funcname ?? []).join(".") ===
                "nextval",
            L = C.some((I) => I.Constraint?.contype === "CONSTR_NOTNULL"),
            E = C.find((I) => I.Constraint?.contype === "CONSTR_UNIQUE"),
            R = C.find((I) => I.Constraint?.contype === "CONSTR_GENERATED"),
            F = C.find((I) => I.Constraint?.contype === "CONSTR_FOREIGN"),
            j = C.find((I) => I.Constraint?.contype === "CONSTR_CHECK"),
            w;
          if (F) {
            let I = F.Constraint,
              D = I.pktable?.relname,
              K = I.pktable?.schemaname,
              H = I.pk_attrs?.[0]?.String?.sval;
            D &&
              H &&
              (w = {
                refSchema: K,
                refTable: D,
                refColumn: H,
                constraintName: I.conname || Ae(o, "foreign_key", [h]),
              });
          }
          let S = {
            schema: a,
            table: o,
            column: h,
            pgTypeName: d,
            nullable: !L && !v,
            defaultValue: null,
            defaultFn: null,
            isPrimaryKey: v,
            isUnique: !!E,
            isSerial: T,
            isGenerated: !!R,
            fkRef: w,
            hasCheck: !!j,
            checkConstraintName: j
              ? j.Constraint?.conname || Ae(o, "check", [h])
              : void 0,
            uniqueConstraintName: E
              ? E.Constraint?.conname || Ae(o, "unique", [h])
              : void 0,
          };
          c.set(h, je(S, x));
        }
        let p = (u, f) => {
          let h = c.get(u);
          if (!h) return;
          let m = { ...h.context, ...f },
            d = Be(t, m.pgTypeName);
          c.set(
            u,
            je(m, { ...h.factoryExtra, ...(d ? { enumValues: d } : {}) }),
          );
        };
        for (let u of i.tableElts ?? []) {
          if (!("Constraint" in u)) continue;
          let f = u.Constraint,
            h = Q(f.keys ?? []);
          if (f.contype === "CONSTR_PRIMARY")
            for (let m of h) p(m, { isPrimaryKey: true, nullable: false });
          else if (f.contype === "CONSTR_UNIQUE" && h.length === 1)
            p(h[0], {
              isUnique: true,
              uniqueConstraintName: f.conname || Ae(o, "unique", h),
            });
          else if (f.contype === "CONSTR_FOREIGN" && h.length === 1) {
            let m = f.pktable?.relname,
              d = Q(f.pk_attrs ?? [])[0];
            m &&
              d &&
              p(h[0], {
                fkRef: {
                  refSchema: f.pktable?.schemaname,
                  refTable: m,
                  refColumn: d,
                  constraintName: f.conname || Ae(o, "foreign_key", h),
                },
              });
          } else if (f.contype === "CONSTR_CHECK") {
            let m = [...wn(f.raw_expr)];
            m.length === 1 &&
              p(m[0], {
                hasCheck: true,
                checkConstraintName: f.conname || Ae(o, "check", m),
              });
          }
        }
        r.set(l, c);
        continue;
      }
      if ("RenameStmt" in s.stmt) {
        let i = s.stmt.RenameStmt,
          o = i.relation?.schemaname ?? "public",
          a = i.relation?.relname ?? "",
          l = r.get(`${o}.${a}`);
        if (!l) continue;
        let c = i.renameType === "OBJECT_TABLE" ? i.newname : void 0,
          p = i.renameType === "OBJECT_COLUMN" ? i.newname : void 0,
          u = i.renameType === "OBJECT_COLUMN" ? i.subname : void 0;
        if (!c && !(p && u)) continue;
        let f = c ?? a,
          h = new zt(f, o);
        for (let m of l.all()) {
          let d = m.context.column === u ? p : m.context.column,
            g = { ...m.context, table: f, column: d },
            y = Be(t, g.pgTypeName);
          h.set(
            d,
            je(g, { ...m.factoryExtra, ...(y ? { enumValues: y } : {}) }),
          );
        }
        (r.delete(`${o}.${a}`), r.set(`${o}.${f}`, h));
        for (let m of r.values())
          for (let d of m.all()) {
            let g = d.context.fkRef;
            if (!g || (g.refSchema ?? "public") !== o || g.refTable !== a)
              continue;
            let y = u && g.refColumn === u ? p : g.refColumn,
              _ = { ...d.context, fkRef: { ...g, refTable: f, refColumn: y } },
              x = Be(t, _.pgTypeName);
            m.set(
              _.column,
              je(_, { ...d.factoryExtra, ...(x ? { enumValues: x } : {}) }),
            );
          }
        continue;
      }
      if ("AlterTableStmt" in s.stmt) {
        let i = s.stmt.AlterTableStmt,
          o = i.relation?.relname ?? "",
          a = i.relation?.schemaname ?? "public",
          l = `${a}.${o}`,
          c = r.get(l);
        if (!c) continue;
        let p = (u, f, h) => {
          let m = c.get(u);
          if (!m) return;
          let d = { ...m.context, ...f },
            g = Be(t, d.pgTypeName);
          c.set(
            u,
            je(d, {
              ...(h ?? m.factoryExtra),
              ...(g ? { enumValues: g } : {}),
            }),
          );
        };
        for (let u of i.cmds ?? []) {
          if (!("AlterTableCmd" in u)) continue;
          let f = u.AlterTableCmd;
          if (f.subtype === "AT_AddColumn" && f.def && "ColumnDef" in f.def) {
            let h = Ir(
              {
                stmts: [
                  {
                    stmt: {
                      CreateStmt: { relation: i.relation, tableElts: [f.def] },
                    },
                  },
                ],
              },
              t,
              n,
            )
              .get(l)
              ?.all()[0];
            h && c.set(h.context.column, h);
            continue;
          }
          if (
            f.subtype === "AT_AlterColumnType" &&
            f.name &&
            f.def &&
            "ColumnDef" in f.def
          ) {
            let h = Ir(
              {
                stmts: [
                  {
                    stmt: {
                      CreateStmt: {
                        relation: i.relation,
                        tableElts: [
                          {
                            ColumnDef: { ...f.def.ColumnDef, colname: f.name },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
              t,
              n,
            )
              .get(l)
              ?.get(f.name);
            h &&
              p(
                f.name,
                {
                  pgTypeName: h.context.pgTypeName,
                  isSerial: h.context.isSerial,
                },
                h.factoryExtra,
              );
            continue;
          }
          if (f.subtype === "AT_SetNotNull" && f.name) {
            p(f.name, { nullable: false });
            continue;
          }
          if (f.subtype === "AT_DropNotNull" && f.name) {
            let h = c.get(f.name);
            p(f.name, { nullable: !h?.context.isPrimaryKey });
            continue;
          }
          if (
            f.subtype === "AT_AddConstraint" &&
            f.def &&
            "Constraint" in f.def
          ) {
            let h = f.def.Constraint,
              m = Q(h.keys ?? h.fk_attrs ?? []);
            if (h.contype === "CONSTR_PRIMARY")
              for (let d of m) p(d, { isPrimaryKey: true, nullable: false });
            else if (h.contype === "CONSTR_UNIQUE" && m.length === 1)
              p(m[0], {
                isUnique: true,
                uniqueConstraintName: h.conname || Ae(o, "unique", m),
              });
            else if (h.contype === "CONSTR_FOREIGN" && m.length === 1) {
              let d = h.pktable?.relname,
                g = Q(h.pk_attrs ?? [])[0];
              d &&
                g &&
                p(m[0], {
                  fkRef: {
                    refSchema: h.pktable?.schemaname,
                    refTable: d,
                    refColumn: g,
                    constraintName: h.conname || Ae(o, "foreign_key", m),
                  },
                });
            } else if (h.contype === "CONSTR_CHECK") {
              let d = [...wn(h.raw_expr)];
              d.length === 1 &&
                p(d[0], {
                  hasCheck: true,
                  checkConstraintName: h.conname || Ae(o, "check", d),
                });
            }
            continue;
          }
          if (f.subtype === "AT_DropConstraint" && f.name) {
            for (let h of c.all()) {
              let m = h.context;
              (m.uniqueConstraintName === f.name &&
                p(m.column, { isUnique: false, uniqueConstraintName: void 0 }),
                m.checkConstraintName === f.name &&
                  p(m.column, { hasCheck: false, checkConstraintName: void 0 }),
                m.fkRef?.constraintName === f.name &&
                  p(m.column, { fkRef: void 0 }));
            }
            continue;
          }
          if (f.subtype === "AT_DropColumn" && f.name) {
            let h = new zt(o, a);
            for (let m of c.all())
              m.context.column !== f.name && h.set(m.context.column, m);
            ((c = h), r.set(l, h));
            for (let m of r.values())
              for (let d of m.all()) {
                let g = d.context.fkRef;
                if (
                  (g?.refSchema ?? "public") === a &&
                  g?.refTable === o &&
                  g.refColumn === f.name
                ) {
                  let y = { ...d.context, fkRef: void 0 };
                  m.set(y.column, je(y, d.factoryExtra));
                }
              }
          }
        }
        continue;
      }
      if ("DropStmt" in s.stmt && s.stmt.DropStmt.removeType === "OBJECT_TABLE")
        for (let i of s.stmt.DropStmt.objects ?? []) {
          if (!("List" in i)) continue;
          let o = Q(i.List.items ?? []),
            a = o[o.length - 1],
            l = o.length >= 2 ? o[o.length - 2] : "public";
          if (a) {
            r.delete(`${l}.${a}`);
            for (let c of r.values())
              for (let p of c.all()) {
                let u = p.context.fkRef;
                if ((u?.refSchema ?? "public") === l && u?.refTable === a) {
                  let f = { ...p.context, fkRef: void 0 };
                  c.set(f.column, je(f, p.factoryExtra));
                }
              }
          }
        }
    }
  return r;
}
function Ll(e) {
  let t = [],
    n = new Set(),
    r = (s, i, o) => {
      let a = s.contype,
        l = Q(s.keys ?? s.fk_attrs ?? []);
      if (a === "CONSTR_UNIQUE" && l.length > 0)
        t.push({
          schema: i,
          table: o,
          kind: "unique",
          name: s.conname || Ae(o, "unique", l),
          columns: l,
        });
      else if (a === "CONSTR_CHECK") {
        let c = [...wn(s.raw_expr)];
        t.push({
          schema: i,
          table: o,
          kind: "check",
          name: s.conname || Ae(o, "check", c),
          columns: c,
        });
      } else if (a === "CONSTR_FOREIGN") {
        let c = s.pktable?.relname;
        if (!c) return;
        t.push({
          schema: i,
          table: o,
          kind: "foreign_key",
          name: s.conname || Ae(o, "foreign_key", l),
          columns: l,
          refSchema: s.pktable?.schemaname,
          refTable: c,
          refColumns: Q(s.pk_attrs ?? []),
        });
      }
    };
  for (let s of e.stmts ?? []) {
    if (!s.stmt) continue;
    if ("RenameStmt" in s.stmt) {
      let c = s.stmt.RenameStmt,
        p = c.relation?.schemaname ?? "public",
        u = c.relation?.relname;
      if (!u || !c.newname) continue;
      if (c.renameType === "OBJECT_TABLE") {
        (n.delete(`${p}.${u}`), n.add(`${p}.${c.newname}`));
        for (let f of t)
          (f.schema === p && f.table === u && (f.table = c.newname),
            (f.refSchema ?? "public") === p &&
              f.refTable === u &&
              (f.refTable = c.newname));
      } else if (c.renameType === "OBJECT_COLUMN" && c.subname)
        for (let f of t)
          (f.schema === p &&
            f.table === u &&
            (f.columns = f.columns.map((h) =>
              h === c.subname ? c.newname : h,
            )),
            (f.refSchema ?? "public") === p &&
              f.refTable === u &&
              (f.refColumns = f.refColumns?.map((h) =>
                h === c.subname ? c.newname : h,
              )));
      continue;
    }
    if ("AlterTableStmt" in s.stmt) {
      let c = s.stmt.AlterTableStmt,
        p = c.relation?.schemaname ?? "public",
        u = c.relation?.relname ?? "";
      for (let f of c.cmds ?? []) {
        if (!("AlterTableCmd" in f)) continue;
        let h = f.AlterTableCmd;
        if (h.subtype === "AT_AddConstraint" && h.def && "Constraint" in h.def)
          r(h.def.Constraint, p, u);
        else if (h.subtype === "AT_DropConstraint" && h.name)
          for (let m = t.length - 1; m >= 0; m--) {
            let d = t[m];
            d.schema === p &&
              d.table === u &&
              d.name === h.name &&
              t.splice(m, 1);
          }
        else if (h.subtype === "AT_DropColumn" && h.name)
          for (let m = t.length - 1; m >= 0; m--) {
            let d = t[m];
            ((d.schema === p && d.table === u && d.columns.includes(h.name)) ||
              ((d.refSchema ?? "public") === p &&
                d.refTable === u &&
                d.refColumns?.includes(h.name))) &&
              t.splice(m, 1);
          }
      }
      continue;
    }
    if ("DropStmt" in s.stmt && s.stmt.DropStmt.removeType === "OBJECT_TABLE") {
      for (let c of s.stmt.DropStmt.objects ?? []) {
        if (!("List" in c)) continue;
        let p = Q(c.List.items ?? []),
          u = p[p.length - 1],
          f = p.length >= 2 ? p[p.length - 2] : "public";
        u && n.delete(`${f}.${u}`);
        for (let h = t.length - 1; h >= 0; h--) {
          let m = t[h];
          ((m.schema === f && m.table === u) ||
            ((m.refSchema ?? "public") === f && m.refTable === u)) &&
            t.splice(h, 1);
        }
      }
      continue;
    }
    if (!("CreateStmt" in s.stmt)) continue;
    let i = s.stmt.CreateStmt,
      o = i.relation?.relname ?? "",
      a = i.relation?.schemaname ?? "public";
    if (!o) continue;
    let l = `${a}.${o}`;
    if (!(i.if_not_exists && n.has(l))) {
      n.add(l);
      for (let c of i.tableElts ?? []) {
        if ("ColumnDef" in c) {
          let h = c.ColumnDef,
            m = h?.colname;
          if (!m) continue;
          for (let d of h.constraints ?? []) {
            let g = d?.Constraint;
            if (!g || g.contype !== "CONSTR_FOREIGN") continue;
            let y = g.pktable?.relname;
            if (!y) continue;
            let _ = (g.pk_attrs ?? [])
              .map((x) => x.String?.sval ?? x.String?.str)
              .filter(Boolean);
            t.push({
              schema: a,
              table: o,
              kind: "foreign_key",
              name: g.conname || Ae(o, "foreign_key", [m]),
              columns: [m],
              refSchema: g.pktable?.schemaname,
              refTable: y,
              refColumns: _,
            });
          }
          continue;
        }
        let p = c;
        if (!p.Constraint) continue;
        let u = p.Constraint,
          f = u.contype;
        if (f === "CONSTR_UNIQUE") {
          let h = (u.keys ?? [])
            .map((m) => m.String?.sval ?? m.String?.str)
            .filter(Boolean);
          if (h.length === 0) continue;
          t.push({
            schema: a,
            table: o,
            kind: "unique",
            name: u.conname || Ae(o, "unique", h),
            columns: h,
          });
        } else if (f === "CONSTR_CHECK") {
          let h = [...wn(u.raw_expr)];
          t.push({
            schema: a,
            table: o,
            kind: "check",
            name: u.conname || Ae(o, "check", h),
            columns: h,
          });
        } else if (f === "CONSTR_FOREIGN") {
          let h = (u.fk_attrs ?? [])
              .map((g) => g.String?.sval ?? g.String?.str)
              .filter(Boolean),
            m = (u.pk_attrs ?? [])
              .map((g) => g.String?.sval ?? g.String?.str)
              .filter(Boolean),
            d = u.pktable?.relname;
          if (!d) continue;
          t.push({
            schema: a,
            table: o,
            kind: "foreign_key",
            name: u.conname || Ae(o, "foreign_key", h),
            columns: h,
            refSchema: u.pktable?.schemaname,
            refTable: d,
            refColumns: m,
          });
        }
      }
    }
  }
  return t;
}
function Il(e) {
  let t = new Map(),
    n = (r) => `${r.schema}.${r.table}.${r.column ?? ""}`;
  for (let r of e.stmts ?? []) {
    if (!r.stmt) continue;
    if ("RenameStmt" in r.stmt) {
      let c = r.stmt.RenameStmt,
        p = c.relation?.schemaname ?? "public",
        u = c.relation?.relname;
      if (!u || !c.newname) continue;
      let f = new Map();
      for (let h of t.values()) {
        if (h.schema !== p || h.table !== u) {
          f.set(n(h), h);
          continue;
        }
        let m = {
          ...h,
          table: c.renameType === "OBJECT_TABLE" ? c.newname : h.table,
          column:
            c.renameType === "OBJECT_COLUMN" && h.column === c.subname
              ? c.newname
              : h.column,
        };
        f.set(n(m), m);
      }
      t.clear();
      for (let [h, m] of f) t.set(h, m);
      continue;
    }
    if ("AlterTableStmt" in r.stmt) {
      let c = r.stmt.AlterTableStmt,
        p = c.relation?.schemaname ?? "public",
        u = c.relation?.relname ?? "";
      for (let f of c.cmds ?? [])
        "AlterTableCmd" in f &&
          f.AlterTableCmd.subtype === "AT_DropColumn" &&
          f.AlterTableCmd.name &&
          t.delete(n({ schema: p, table: u, column: f.AlterTableCmd.name }));
      continue;
    }
    if (
      "DropStmt" in r.stmt &&
      (r.stmt.DropStmt.removeType === "OBJECT_TABLE" ||
        r.stmt.DropStmt.removeType === "OBJECT_VIEW")
    ) {
      for (let c of r.stmt.DropStmt.objects ?? []) {
        if (!("List" in c)) continue;
        let p = Q(c.List.items ?? []),
          u = p[p.length - 1],
          f = p.length >= 2 ? p[p.length - 2] : "public";
        for (let [h, m] of t) m.schema === f && m.table === u && t.delete(h);
      }
      continue;
    }
    if (!("CommentStmt" in r.stmt)) continue;
    let s = r.stmt.CommentStmt,
      i = s.objtype,
      o = (s.object?.List?.items ?? s.object?.items ?? [])
        .map((c) => c.String?.sval ?? c.String?.str)
        .filter(Boolean);
    if (o.length === 0) continue;
    let a;
    if (i === "OBJECT_TABLE" || i === "OBJECT_VIEW") {
      let [c, p] = o.length >= 2 ? o : ["public", o[0]];
      a = { schema: c, table: p };
    } else if (i === "OBJECT_COLUMN") {
      let c = "public",
        p,
        u;
      (o.length >= 3 ? ([c, p, u] = o) : ([p, u] = o),
        (a = { schema: c, table: p, column: u }));
    }
    if (!a) continue;
    let l = n(a);
    s.comment === null || s.comment === void 0
      ? t.delete(l)
      : t.set(l, { ...a, text: String(s.comment) });
  }
  return [...t.values()];
}
var kl,
  _i = b(() => {
    ul();
    rr();
    Gt();
    pl();
    Nm();
    yn();
    kl = new Set();
  });
async function Fl(e, t) {
  let n = await e.connection.introspect(),
    r = pt(n);
  (await Bm(e, { ...t, dbHasTables: n.tables.length > 0, dbFingerprint: r }),
    await m_(e));
  let s = await e.connection.introspect();
  Hm(s, e);
}
async function p_(e) {
  return wr(e.config.db?.seed?.sql_paths ?? ["./seed.sql"], {
    cwd: Fe__default.join(process.cwd(), "supabase"),
    absolute: true,
  });
}
async function f_(e) {
  let t = await p_(e);
  return Promise.all(
    t.map(async (n) => {
      let r = await he__default.readFile(n, "utf-8"),
        s = createHash("sha256").update(r).digest("hex");
      return {
        path: Fe__default.relative(process.cwd(), n),
        hash: s,
        sql: r,
        statements: splitSqlStatements(r),
      };
    }),
  );
}
async function Ml(e, t) {
  if (e.config.db?.seed?.enabled === false) return 0;
  let r = (await f_(e)).filter((l) => l.statements.length > 0);
  if (r.length === 0) return 0;
  await un(e.connection);
  let s = ge(e.connection),
    i = new Map((await yf(e.connection)).map((l) => [l.path, l.hash])),
    o = r.filter((l) => i.get(l.path) !== l.hash);
  if (o.length === 0) return 0;
  console.log(U.default.dim("Seeding database..."));
  let a = 0;
  try {
    let l = [];
    for (let c of o) {
      let p = c.statements;
      if (s === "pg-flat") {
        let f = await e.connection.translateDdl(c.sql),
          h = typeof f == "string" ? f : (f.ddl ?? "");
        p = splitSqlStatements(h);
      }
      ((a += p.length), l.push(...p));
      let u = hf(s, { path: c.path, hash: c.hash });
      u && l.push(u);
    }
    await e.connection.transaction(l);
  } catch (l) {
    let c =
      "Fix `supabase/seed.sql`, then re-run `lite dev` to reapply the schema and reseed.";
    throw new Error(`Seed failed and was rolled back: ${String(l.message ?? l)}
${c}`);
  }
  return a;
}
async function m_(e) {
  await Ml(e);
}
async function En(e) {
  let t = await wr(e.config?.db?.migrations?.schema_paths ?? Mm, {
      cwd: Fe__default.join(process.cwd(), fe.config_dir),
      absolute: true,
    }),
    n = await Promise.all(
      t.map(async (r) => await he__default.readFile(r, "utf-8")),
    ).then((r) =>
      r.map((s) =>
        s
          .split(
            `
`,
          )
          .filter((i) => i.trim().length > 0 && !i.trim().startsWith("--"))
          .join(`
`),
      ).join(`
`),
    );
  return n || "";
}
async function Bm(e, t) {
  let n = await En(e);
  if (!n) {
    if (!(await fn(e)))
      throw new Error(
        "Applied migration metadata could not be rebuilt. Run `lite db reset`.",
      );
    return;
  }
  if (t?.dbHasTables && (await h_(e, n, t.dbFingerprint))) {
    (console.log(
      U.default.dim("Schema unchanged \u2014 skipping translation."),
    ),
      await pr(e, { workflow: "declarative", sourceHash: Dr(e, n) }));
    return;
  }
  try {
    let r = e.connection.createMigrator(n),
      s = await r.diff(),
      i = r.translationResult?.ast,
      o = await e.connection.introspect(),
      a = pt(o);
    if (s.plan.steps.length === 0) {
      (await Dm(e, n, i, a),
        await pr(e, { workflow: "declarative", sourceHash: Dr(e, n) }));
      return;
    }
    (await r.migratePlan(s.plan, { force: t?.force ?? !1 }), w_(s));
    let l = await e.connection.introspect();
    return (
      await Dm(e, n, i, pt(l)),
      await pr(e, { workflow: "declarative", sourceHash: Dr(e, n) }),
      console.log(""),
      Ul(s),
      s
    );
  } catch (r) {
    if (String(r).includes("likely empty"))
      console.log(U.default.dim("Nothing to migrate."));
    else {
      console.error("Migration error: " + String(r));
      try {
        await e.connection.exec("rollback");
      } catch {}
    }
  }
}
function d_(e) {
  return e.connection.config?.baseSchema ?? "";
}
function Dr(e, t) {
  let n = createHash("sha256");
  return (n.update(JSON.stringify([d_(e), t ?? ""])), n.digest("hex"));
}
async function h_(e, t, n) {
  let r = e.connection;
  if (typeof r.updateDeparseInfo != "function") return false;
  let s = Fe__default.join(process.cwd(), jl),
    i;
  try {
    i = await he__default.readFile(s, "utf-8");
  } catch {
    return false;
  }
  let o;
  try {
    o = JSON.parse(i);
  } catch {
    return false;
  }
  if (
    o.v !== Um ||
    o.hash !== Dr(e, t) ||
    !n ||
    o.dbFingerprint !== n ||
    !o.ast ||
    typeof o.ast != "object"
  )
    return false;
  try {
    let a = await Promise.resolve().then(() => (_i(), Dl)),
      l = o.ast,
      c = a.collectEnums(l),
      p = a.collectSchema(l, c),
      u = a.collectVariables(l),
      f = a.collectTableConstraints(l),
      h = a.collectComments(l),
      { policies: m, tables: d } = a.collectPolicies(l);
    return (
      r.updateDeparseInfo({
        enums: c,
        rls: { tables: d, policies: m },
        schema: p,
        vars: u,
        tableConstraints: f,
        comments: h,
      }),
      !0
    );
  } catch {
    return false;
  }
}
async function Dm(e, t, n, r) {
  if (!n || typeof n != "object") return;
  let s = { v: Um, hash: Dr(e, t), dbFingerprint: r, ast: n },
    i = Fe__default.join(process.cwd(), jl);
  try {
    (await he__default.mkdir(Fe__default.dirname(i), { recursive: !0 }),
      await he__default.writeFile(i, JSON.stringify(s), "utf-8"));
  } catch {}
}
async function qm() {
  let e = Fe__default.join(process.cwd(), jl);
  try {
    await he__default.unlink(e);
  } catch {}
}
function Hm(e, t) {
  console.log();
  let n = (s, i) => {
    let o = (l) => {
        let c = U.default.dim;
        return (
          typeof l == "number" &&
            (l >= 0 && (c = l > 0 ? U.default.green : U.default.dim),
            l < 0 && (c = U.default.red)),
          typeof l == "boolean"
            ? l
              ? U.default.green("\u2713")
              : U.default.red("\u2717")
            : c(String(l))
        );
      },
      a = Object.entries(i)
        .map(([l, c]) => `${l}: ${o(c)}`)
        .join(U.default.dim(" / "));
    console.log(`${U.default.dim("[")} ${s} ${U.default.dim("]")} ${a}`);
  };
  n(U.default.green("DATA"), {
    tables: e.tables.length,
    columns: e.columns.length,
    indexes: e.indexes.length,
  });
  let r = t.config.rls ??
    t.connection.config.translation?.deparse?.rls ?? {
      tables: new Set([]),
      policies: [],
    };
  n(U.default.green("AUTH"), {
    enabled: !!t.config.auth?.enabled,
    tables: ensureVar.Set(r.tables).size,
    policies: ensureVar.Array(r.policies).length,
  });
}
function g_(e) {
  let t = Fe__default.join(process.cwd(), fe.config_dir),
    r = (e.config?.db?.migrations?.schema_paths ?? Mm).map((s) => {
      let i = s.split("/"),
        o = i.findIndex((l) => /[*?[{]/.test(l)),
        a = (o === -1 ? i.slice(0, -1) : i.slice(0, o)).join("/");
      return Fe__default.resolve(t, a || ".");
    });
  return [...new Set(r)];
}
function Gm(e, t) {
  let n,
    r = setTimeout(() => {
      (console.log(U.default.dim("Watching for changes...")),
        (n = u_.watch(g_(e), { ignoreInitial: true })));
      let s = async (i) => {
        if (!i.endsWith(".sql")) return;
        (console.log(),
          console.log(U.default.dim(`Schema changed: ${i}`)),
          await Bm(e, t));
        let o = await e.connection.introspect();
        Hm(o, e);
      };
      (n.on("change", s), n.on("add", s));
    }, 200);
  return async () => {
    (clearTimeout(r), await n?.close());
  };
}
function y_(e, t) {
  let n = (r) => r;
  return e.plan.steps
    .flatMap((r) => [
      r.description ? n(`-- ${r.description}`) : "",
      r.sql +
        `
`,
    ])
    .filter((r) => r.trim().length > 0).join(`
`);
}
function b_(e) {
  let t = new Date();
  return `${t.getFullYear().toString() + (t.getMonth() + 1).toString().padStart(2, "0") + t.getDate().toString().padStart(2, "0") + t.getHours().toString().padStart(2, "0") + t.getMinutes().toString().padStart(2, "0") + t.getSeconds().toString().padStart(2, "0")}.sql`;
}
function w_(e, t) {
  let n = "./supabase/.temp/migrations";
  ve(n);
  let r = b_(),
    s = y_(e);
  (Ot(Fe__default.join(n, r), s),
    console.log(
      U.default.dim(
        `Migration written to ${U.default.cyan(Fe__default.join(n, r))}`,
      ),
    ));
}
function Wm(e) {
  let t = e.ddl_dialect === "postgres",
    n = (o, a) => (t ? Ke(o, a) : a);
  (console.log(U.default.bgWhite(U.default.black(" Schema "))), console.log());
  let r = e.tables.filter((o) => o.type === "table"),
    s = t ? "sqlite-postgres" : "sqlite";
  if (
    (console.log(
      U.default.dim(
        `${s}${e.version ? ` (sqlite ${e.version})` : ""} \xB7 ${e.database_name}`,
      ),
    ),
    console.log(),
    r.length === 0)
  ) {
    console.log(U.default.dim("No tables."));
    return;
  }
  console.log(U.default.dim("Tables:"));
  for (let o of r) {
    let a = n(o.schema, o.name),
      l = e.columns
        .filter((p) => p.table === o.name && (!t || p.schema === o.schema))
        .sort((p, u) => p.ordinal_position - u.ordinal_position),
      c = o.rows >= 0 ? ` ${U.default.dim(`(${o.rows} rows)`)}` : "";
    console.log(`${U.default.bold(a)}${c}`);
    for (let p of l) {
      let u = [];
      (p.is_primary_key && u.push(U.default.green("PK")),
        p.nullable || u.push(U.default.dim("NOT NULL")),
        p.default_value !== null &&
          u.push(U.default.dim(`DEFAULT ${p.default_value}`)));
      let f = u.length ? "  " + u.join(" ") : "";
      console.log(`  ${p.name}  ${U.default.cyan(p.type)}${f}`);
    }
    console.log();
  }
  let i = e.indexes.filter((o) => !o.name.startsWith("sqlite_autoindex_"));
  if (i.length > 0) {
    console.log(U.default.dim("Indexes:"));
    for (let o of i) {
      let a = o.unique ? U.default.yellow("UNIQUE ") : "";
      console.log(
        `  ${o.name} on ${n(o.schema, o.table)} ${a}(${o.columns.join(", ")})`,
      );
    }
    console.log();
  }
  if (e.foreign_keys.length > 0) {
    console.log(U.default.dim("Foreign Keys:"));
    for (let o of e.foreign_keys) {
      let a = `${n(o.schema, o.table)}.${o.column}`,
        l = `${n(o.ref_schema, o.ref_table)}.${o.ref_column}`;
      console.log(
        `  ${a} \u2192 ${l}  ${U.default.dim(`ON DELETE ${o.on_delete} ON UPDATE ${o.on_update}`)}`,
      );
    }
    console.log();
  }
  if (e.views.length > 0) {
    console.log(U.default.dim("Views:"));
    for (let o of e.views) console.log(`  ${n(o.schema, o.name)}`);
    console.log();
  }
  if (e.triggers.length > 0) {
    console.log(U.default.dim("Triggers:"));
    for (let o of e.triggers)
      console.log(`  ${o.name} on ${n(o.schema, o.table)}`);
    console.log();
  }
}
function Ul({ diff: e }) {
  if (typeof e == "string") {
    console.log(U.default.cyan(e));
    return;
  }
  if (!e.has_changes) return;
  (console.log(U.default.bgWhite(U.default.black(" Schema Diff "))),
    console.log());
  let t = {
    added: { color: U.default.green, symbol: "+" },
    removed: { color: U.default.red, symbol: "-" },
    modified: { color: U.default.yellow, symbol: "~" },
  };
  if (e.tables.length > 0) {
    console.log(U.default.dim("Tables:"));
    for (let n of e.tables) {
      let { color: r, symbol: s } = t[n.type];
      console.log(r(`${s} ${n.name}`));
    }
    console.log();
  }
  if (e.columns.length > 0) {
    console.log(U.default.dim("Columns:"));
    for (let n of e.columns) {
      let { color: r, symbol: s } = t[n.type],
        i = "";
      (n.changes &&
        (i = Object.entries(n.changes)
          .map(([o, a]) => `${o}: ${a.from} \u2192 ${a.to}`)
          .join(", ")),
        console.log(r(`${s} ${n.table}.${n.name}${i ? ` (${i})` : ""}`)));
    }
    console.log();
  }
  if (e.indexes.length > 0) {
    console.log(U.default.dim("Indexes:"));
    for (let n of e.indexes) {
      let { color: r, symbol: s } = t[n.type];
      console.log(r(`${s} ${n.name} on ${n.table}`));
    }
    console.log();
  }
  if (e.foreign_keys.length > 0) {
    console.log(U.default.dim("Foreign Keys:"));
    for (let n of e.foreign_keys) {
      let { color: r, symbol: s } = t[n.type];
      console.log(
        r(`${s} ${n.table}.${n.column} \u2192 ${n.ref_table}.${n.ref_column}`),
      );
    }
    console.log();
  }
}
var U,
  Mm,
  jl,
  Um,
  xi = b(() => {
    ll();
    U = z(J());
    Lt();
    fr();
    rt();
    jt();
    ar();
    sr();
    ar();
    ((Mm = ["./schemas/*.sql"]),
      (jl = "supabase/.temp/.translation-cache.json"),
      (Um = 3));
  });
function Km(e) {
  return ge(e.connection) === "sqlite"
    ? "./sqlite-migrations/*.sql"
    : "./migrations/*.sql";
}
function Xt(e) {
  return Fe__default.posix.dirname(Km(e));
}
async function Oe(e) {
  let t = Fe__default.join(process.cwd(), "supabase"),
    n = await wr([Km(e)], { cwd: t, absolute: true }),
    r = [];
  for (let s of n) {
    let i = Fe__default.basename(s),
      o = S_.exec(i);
    if (!o) continue;
    let a = await he__default.readFile(s, "utf-8");
    r.push({ version: o[1], name: o[2] ?? null, filename: i, path: s, sql: a });
  }
  return r.sort((s, i) => s.version.localeCompare(i.version));
}
async function Bl(e) {
  return (await Oe(e)).map((n) => n.sql).join(`
`);
}
function ql(e = new Date()) {
  return (
    e.getUTCFullYear().toString().padStart(4, "0") +
    (e.getUTCMonth() + 1).toString().padStart(2, "0") +
    e.getUTCDate().toString().padStart(2, "0") +
    e.getUTCHours().toString().padStart(2, "0") +
    e.getUTCMinutes().toString().padStart(2, "0") +
    e.getUTCSeconds().toString().padStart(2, "0")
  );
}
function Hl(e, t = ql()) {
  let n = e
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return n.length > 0 ? `${t}_${n}.sql` : `${t}.sql`;
}
async function zm(e, t, n) {
  let r = Fe__default.join(process.cwd(), "supabase", Xt(e));
  ve(r);
  let s = Hl(t, n?.ts),
    i = Fe__default.join(r, s);
  return (await he__default.writeFile(i, "", { flag: "wx" }), i);
}
var S_,
  $t = b(() => {
    ll();
    rt();
    Lt();
    S_ = /^(\d{14})(?:_([^.]+))?\.sql$/;
  });
function E_(e) {
  return e === "service_role" ? "NOLOGIN BYPASSRLS" : "NOLOGIN";
}
function Rt(e) {
  return e.size === 0
    ? ""
    : `DO $$ BEGIN${[...e]
        .map(
          (n) => `
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${n}') THEN
      CREATE ROLE ${n} ${E_(n)};
   END IF;`,
        )
        .join("")}
END $$;
`;
}
function Jm(e, t) {
  return e ? (e.quoted ? e.value === t : e.value.toLowerCase() === t) : false;
}
function Je(e) {
  return e?.quoted ? e.value : e?.value.toLowerCase();
}
function __(e, t) {
  let n = "",
    r = t + 1;
  for (; r < e.length; ) {
    if (e[r] === '"' && e[r + 1] === '"') {
      ((n += '"'), (r += 2));
      continue;
    }
    if (e[r] === '"') return { token: { value: n, quoted: true }, end: r + 1 };
    ((n += e[r]), r++);
  }
  return { token: { value: n, quoted: true }, end: r };
}
function x_(e, t) {
  let n = t + 1;
  for (; n < e.length; ) {
    if (e[n] === "'" && e[n + 1] === "'") {
      n += 2;
      continue;
    }
    if (e[n] === "'") return n + 1;
    n++;
  }
  return n;
}
function T_(e, t) {
  let n = /^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/.exec(e.slice(t))?.[0];
  if (!n) return;
  let r = t + n.length,
    s = e.indexOf(n, r);
  return s === -1 ? e.length : s + n.length;
}
function Ym(e) {
  let t = [],
    n = 0;
  for (; n < e.length; ) {
    let r = e[n],
      s = e[n + 1];
    if (/\s/.test(r)) {
      n++;
      continue;
    }
    if (r === "-" && s === "-") {
      for (
        n += 2;
        n < e.length &&
        e[n] !==
          `
`;

      )
        n++;
      continue;
    }
    if (r === "/" && s === "*") {
      for (n += 2; n < e.length && !(e[n] === "*" && e[n + 1] === "/"); ) n++;
      n = n < e.length ? n + 2 : n;
      continue;
    }
    if (r === "'") {
      n = x_(e, n);
      continue;
    }
    if (r === "$") {
      let i = T_(e, n);
      if (i !== void 0) {
        n = i;
        continue;
      }
    }
    if (r === '"') {
      let { token: i, end: o } = __(e, n);
      (t.push(i), (n = o));
      continue;
    }
    if (r === "," || r === ";") {
      (t.push({ value: r, quoted: false }), n++);
      continue;
    }
    if (/[A-Za-z_]/.test(r)) {
      let i = n;
      for (n++; n < e.length && /[A-Za-z0-9_$]/.test(e[n]); ) n++;
      t.push({ value: e.slice(i, n).toLowerCase(), quoted: false });
      continue;
    }
    n++;
  }
  return t;
}
function C_(e, t) {
  let n = Je(e[t]),
    r = Je(e[t + 1]);
  if (
    (n === "create" || n === "alter") &&
    (r === "role" || r === "user" || r === "group")
  )
    return e[t + 2];
}
function Ci(e) {
  let t = new Set(),
    n = Ym(e);
  for (let r = 0; r < n.length; r++) {
    if (Je(n[r]) !== "create") continue;
    let s = C_(n, r);
    for (let i of _n) Jm(s, i) && t.add(i);
  }
  return t;
}
function Gl(e, t, n) {
  let r = new Set([
    ";",
    "as",
    "by",
    "check",
    "for",
    "granted",
    "in",
    "on",
    "option",
    "using",
    "where",
    "with",
  ]);
  for (let s = t; s < e.length; s++) {
    let i = Je(e[s]);
    if (!i || r.has(i)) return;
    for (let o of _n) Jm(e[s], o) && n.add(o);
  }
}
function A_(e) {
  let t = [],
    n = [];
  for (let r of e) {
    if (Je(r) === ";") {
      (n.length > 0 && t.push(n), (n = []));
      continue;
    }
    n.push(r);
  }
  return (n.length > 0 && t.push(n), t);
}
function Xm(e, t) {
  return e.some((n) => Je(n) === t);
}
function $_(e) {
  let t = new Set(),
    n = A_(Ym(e));
  for (let r of n) {
    let s = Je(r[0]);
    for (let a = 0; a < r.length; a++) {
      let l = Je(r[a]);
      (l === "to" &&
        (Xm(r, "grant") || Xm(r, "policy") || Je(r[a - 1]) === "owner") &&
        Gl(r, a + 1, t),
        l === "from" && s === "revoke" && Gl(r, a + 1, t));
    }
    let i = r.findIndex((a) => Je(a) === "to"),
      o = r.findIndex((a) => Je(a) === "on");
    s === "grant" && i > 1 && (o === -1 || i < o) && Gl(r, 1, t);
  }
  return t;
}
function vt(e) {
  let t = Ci(e);
  return new Set([...$_(e)].filter((n) => !t.has(n)));
}
function Qm(e) {
  let t = Ci(e);
  return new Set(_n.filter((n) => !t.has(n)));
}
var _n,
  Ti,
  Fr = b(() => {
    _n = ["anon", "authenticated", "service_role"];
    (Rt(new Set(_n)),
      (Ti = `
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.role', true), '');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.email() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.email', true), '');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS JSONB AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true), ''),
    '{}'
  )::jsonb;
$$ LANGUAGE SQL STABLE;
`));
  });
async function Jt(e) {
  await e.ensureSystemSchema();
  let t = ge(e.connection),
    n = t === "pg-flat" ? await ni(e.connection) : [],
    r = new Set(
      t === "pg-flat" ? n.map((l) => l.version) : await or(e.connection),
    ),
    s = await Oe(e),
    i = lr(n.flatMap((l) => l.statements)),
    o = [],
    a = [];
  for (let l of s) {
    if (r.has(l.version)) {
      a.push(l);
      continue;
    }
    let c = nt(l.sql),
      p;
    if (t === "pg-flat") {
      let f = await e.connection.translateDdl(ri(l.sql, i)),
        h = typeof f == "string" ? f : (f.ddl ?? "");
      p = nt(h);
    } else p = c;
    let u = df(t, { version: l.version, name: l.name, statements: c });
    if (t === "pg") {
      let f = Rt(vt(l.sql));
      f && (await e.connection.exec(f));
    }
    (await e.connection.transaction([...p, u], { intent: "migration" }),
      i.push(...lr(c)),
      o.push(l));
  }
  return { applied: o, skipped: a };
}
var Ai = b(() => {
  _t();
  rt();
  $t();
  Fr();
  Ua();
});
var Zm = {};
pe(Zm, { dev: () => k_ });
var qe,
  k_,
  ed = b(() => {
    Fo();
    $a();
    lt();
    qe = z(J());
    jt();
    xi();
    Ai();
    $t();
    Ee();
    Se();
    Nt();
    tt();
    Oa();
    La();
    Ia();
    k_ = (e) => {
      e.command("dev")
        .option("--template", "Create a template for the database", false)
        .option("--config <config>", "Path to the config file")
        .option(
          "--host [host]",
          "Specify hostname (use without a value to expose all interfaces)",
        )
        .option("--admin", "Enable local admin mode explicitly")
        .option(
          "--no-admin",
          "Disable local admin mode (keyless requests are no longer elevated; normal authentication rules apply)",
        )
        .description(de("Start the development server with schema watching"))
        .helpGroup("Local Development:")
        .action(async (t, n) => {
          (t.config && (await Y(t.config)),
            console.log(
              qe.default.yellow(
                " \u26A0 [lite] dev is experimental and works with declarative schema only.",
              ),
            ),
            await Ts(
              async () => {
                let r = Zs(t, n),
                  { created: s } = await _s({ template: t.template });
                (s &&
                  console.log(
                    qe.default.green(" \u279C"),
                    "Initialized project",
                    qe.default.cyan(`./${fe.config_dir}`),
                  ),
                  console.log());
                let o = await (
                    await V({ withSupabaseClient: false })
                  ).project.local.createApp(t.config, {
                    admin: r.admin,
                    adminDefault: r.adminDefault,
                  }),
                  a = o.config.api?.port ?? fe.default_api_port;
                if ((await Oe(o)).length > 0) {
                  let d = await Jt(o);
                  for (let g of d.applied)
                    console.log(
                      qe.default.green(" \u2713"),
                      "Applied migration",
                      qe.default.cyan(g.filename),
                    );
                } else
                  o.hasEnabledSystemBaseSchema() &&
                    (await o.ensureSystemSchema());
                (await Fl(o, { force: true }), console.log());
                let c = await js(o, { port: a, host: r.host });
                (Ys(r.host, a),
                  Xs(o.config),
                  Js(o.adminMode),
                  r.warnAdminDisabled && Qs());
                let p = os();
                (p && console.log(qe.default.yellow(` \u26A0 ${p}`)),
                  await o.connection.ping());
                let u = Gm(o, { translate: true, force: true }),
                  f = Fe__default.join(process.cwd(), "supabase", Xt(o)),
                  h,
                  m = setTimeout(() => {
                    ((h = u_.watch(f, { ignoreInitial: true })),
                      h.on("add", async (d) => {
                        (console.log(),
                          console.log(qe.default.dim(`Migration added: ${d}`)));
                        try {
                          let g = await Jt(o);
                          for (let y of g.applied)
                            console.log(
                              qe.default.green(" \u2713"),
                              "Applied",
                              qe.default.cyan(y.filename),
                            );
                          await Fl(o, { force: !0 });
                        } catch (g) {
                          console.error(
                            qe.default.red(
                              "Migration failed: " + String(g.message ?? g),
                            ),
                          );
                        }
                      }));
                  }, 200);
                zs(async () => {
                  (clearTimeout(m),
                    await Promise.all([u(), h?.close()]),
                    await c(),
                    await o.connection.close());
                });
              },
              (r) => {
                (console.log(),
                  console.log(qe.default.green(`Ready in ${r.toFixed(2)}ms`)));
              },
            ));
        });
    };
  });
async function yt(e) {
  let t = e === true,
    n = await V({ withSupabaseClient: t }),
    r = n.project.local.ref();
  if (t) {
    if (!r) throw new Error("No project linked");
    if (!(await n.project.remote.ping()))
      throw new Error("Remote project is not reachable");
    return (
      He("creating app for remote project", r),
      n.project.remote.createApp(r)
    );
  }
  return n.project.local.createApp(e);
}
var Wl = b(() => {
  Ee();
  Ft();
});
var td = {};
pe(td, { repl: () => P_ });
var xe,
  P_,
  nd = b(() => {
    lt();
    xe = z(J());
    Wl();
    Se();
    tt();
    P_ = (e) => {
      e.command("repl")
        .option("--config <config>", "Path to the config file")
        .option("--remote", "Connect REPL to a remote project")
        .description(de("Start a REPL session"))
        .helpGroup("Local Development:")
        .action(async (t) => {
          t.remote || (await Y(t.config));
          let n = await yt(t.remote ? true : t.config);
          xs() ||
            (console.error(xe.default.red("REPL is only supported on Node.js")),
            process.exit(1));
          let r = {
            app: n,
            client: n.getClient(),
            conn: n.connection,
            db: n.connection.driver,
          };
          (console.log(xe.default.green("Starting a REPL session")),
            console.log(
              xe.default.bold("Available variables:"),
              Object.keys(r)
                .map((o) => xe.default.cyan(o))
                .join(", "),
            ));
          let i = (await import("node:repl")).start("> ");
          i.on("exit", async () => {
            (await n.connection.close(), process.exit());
          });
          for (let o of Object.keys(r))
            Object.defineProperty(i.context, o, {
              configurable: false,
              enumerable: true,
              value: r[o],
            });
          (i.defineCommand("tables", {
            help: "List all tables",
            action: async function () {
              let a = await n.connection.introspect(),
                l = (c) => a.columns.filter((p) => p.table === c);
              (console.log(
                a.tables.map(
                  (c) =>
                    `${xe.default.cyan(c.name)} (${l(c.name).length} columns)`,
                ).join(`
`),
              ),
                this.displayPrompt());
            },
          }),
            i.defineCommand("table", {
              help: "Show a table",
              action: async function (a) {
                let l = await n.connection.introspect(),
                  c = (u) => l.columns.filter((f) => f.table === u),
                  p = l.tables.find((u) => u.name === a);
                (p
                  ? (console.log(
                      `${xe.default.cyan(p?.name)} (${c(a).length} columns)`,
                    ),
                    console.log(
                      c(a).map(
                        (u) =>
                          ` - ${xe.default.cyan(u.name)} ${xe.default.yellow(u.type)}`,
                      ).join(`
`),
                    ),
                    console.log(),
                    console.log(xe.default.dim(p.sql)))
                  : (console.log(xe.default.red(`Table ${a} not found`)),
                    console.log(
                      `Available tables:
` +
                        l.tables.map((u) => `- ${xe.default.cyan(u.name)}`)
                          .join(`
`),
                    )),
                  this.displayPrompt());
              },
            }),
            i.defineCommand("indexes", {
              help: "List all indexes",
              action: async function () {
                let a = await n.connection.introspect().then((l) => l.indexes);
                (console.log(
                  a.map(
                    (l) =>
                      `${xe.default.bold(xe.default.cyan(l.name))} ${l.unique ? xe.default.yellow("unique ") : ""}on ${xe.default.blue(l.table)}(${l.columns.map((c) => xe.default.magenta(c)).join(", ")})`,
                  ).join(`
`),
                ),
                  this.displayPrompt());
              },
            }),
            i.defineCommand("config", {
              help: "Show the current config",
              action: async function (a) {
                (console.log(a ? Uo(n.config, a) : n.config),
                  this.displayPrompt());
              },
            }));
        });
    };
  });
var rd = {};
pe(rd, { debug: () => N_ });
var N_,
  sd = b(() => {
    lt();
    Se();
    tt();
    N_ = (e) => {
      e.command("debug")
        .description(de("Print runtime info (bun/node detection, paths)"))
        .helpGroup("Local Development:")
        .action(async () => {
          (console.log("Debugging the application"),
            console.log({
              bun: Hn(),
              node: xs(),
              cwd: process.cwd(),
              paths: { root: gs(), dist: Po(), relativeDist: ys() },
            }));
        });
    };
  });
var Kl = Et((nO, id) => {
  var Vl = {
      to(e, t) {
        return t ? `\x1B[${t + 1};${e + 1}H` : `\x1B[${e + 1}G`;
      },
      move(e, t) {
        let n = "";
        return (
          e < 0 ? (n += `\x1B[${-e}D`) : e > 0 && (n += `\x1B[${e}C`),
          t < 0 ? (n += `\x1B[${-t}A`) : t > 0 && (n += `\x1B[${t}B`),
          n
        );
      },
      up: (e = 1) => `\x1B[${e}A`,
      down: (e = 1) => `\x1B[${e}B`,
      forward: (e = 1) => `\x1B[${e}C`,
      backward: (e = 1) => `\x1B[${e}D`,
      nextLine: (e = 1) => "\x1B[E".repeat(e),
      prevLine: (e = 1) => "\x1B[F".repeat(e),
      left: "\x1B[G",
      hide: "\x1B[?25l",
      show: "\x1B[?25h",
      save: "\x1B7",
      restore: "\x1B8",
    },
    O_ = {
      up: (e = 1) => "\x1B[S".repeat(e),
      down: (e = 1) => "\x1B[T".repeat(e),
    },
    L_ = {
      screen: "\x1B[2J",
      up: (e = 1) => "\x1B[1J".repeat(e),
      down: (e = 1) => "\x1B[J".repeat(e),
      line: "\x1B[2K",
      lineEnd: "\x1B[K",
      lineStart: "\x1B[1K",
      lines(e) {
        let t = "";
        for (let n = 0; n < e; n++) t += this.line + (n < e - 1 ? Vl.up() : "");
        return (e && (t += Vl.left), t);
      },
    };
  id.exports = { cursor: Vl, scroll: O_, erase: L_, beep: "\x07" };
});
function Pi(e, t, n) {
  if (!n.some((o) => !o.disabled)) return e;
  let r = e + t,
    s = Math.max(n.length - 1, 0),
    i = r < 0 ? s : r > s ? 0 : r;
  return n[i].disabled ? Pi(i, t < 0 ? -1 : 1, n) : i;
}
function Ql(e, t, n) {
  return String(e)
    .normalize()
    .replaceAll(
      `\r
`,
      `
`,
    )
    .split(
      `
`,
    )
    .map((r) => K_(r, t, n)).join(`
`);
}
function rc(e, t) {
  if (typeof e == "string") return Le.aliases.get(e) === t;
  for (let n of e) if (n !== void 0 && rc(n, t)) return true;
  return false;
}
function X_(e, t) {
  if (e === t) return;
  let n = e.split(`
`),
    r = t.split(`
`),
    s = Math.max(n.length, r.length),
    i = [];
  for (let o = 0; o < s; o++) n[o] !== r[o] && i.push(o);
  return {
    lines: i,
    numLinesBefore: n.length,
    numLinesAfter: r.length,
    numLines: s,
  };
}
function we(e) {
  return e === Zl;
}
function ki(e, t) {
  let n = e;
  n.isTTY && n.setRawMode(t);
}
function hd({
  input: e = stdin,
  output: t = stdout,
  overwrite: n = true,
  hideCursor: r = true,
} = {}) {
  let s = kt.createInterface({ input: e, output: t, prompt: "", tabSize: 1 });
  (kt.emitKeypressEvents(e, s),
    e instanceof ReadStream && e.isTTY && e.setRawMode(true));
  let i = (o, { name: a, sequence: l }) => {
    let c = String(o);
    if (rc([c, a, l], "cancel")) {
      (r && t.write($e.cursor.show), process.exit(0));
      return;
    }
    if (!n) return;
    kt.moveCursor(t, a === "return" ? 0 : -1, a === "return" ? -1 : 0, () => {
      kt.clearLine(t, 1, () => {
        e.once("keypress", i);
      });
    });
  };
  return (
    r && t.write($e.cursor.hide),
    e.once("keypress", i),
    () => {
      (e.off("keypress", i),
        r && t.write($e.cursor.show),
        e instanceof ReadStream && e.isTTY && !J_ && e.setRawMode(false),
        (s.terminal = false),
        s.close());
    }
  );
}
function Fi(e, t, n, r = n) {
  let s = ji(e ?? stdout);
  return Ql(t, s - n.length, { hard: true, trim: false })
    .split(
      `
`,
    )
    .map((i, o) => `${o === 0 ? r : n}${i}`).join(`
`);
}
var $e,
  D_,
  j_,
  F_,
  zl,
  $i,
  Ri,
  Xl,
  vi,
  M_,
  U_,
  pd,
  B_,
  Mr,
  Di,
  fd,
  q_,
  tc,
  md,
  H_,
  dd,
  nc,
  ad,
  G_,
  ld,
  cd,
  W_,
  Jl,
  V_,
  K_,
  z_,
  Le,
  J_,
  Zl,
  ji,
  sc,
  xn,
  Ni,
  Oi,
  Li,
  Ii,
  ic = b(() => {
    $e = z(Kl());
    ((D_ = (e) =>
      e === 161 ||
      e === 164 ||
      e === 167 ||
      e === 168 ||
      e === 170 ||
      e === 173 ||
      e === 174 ||
      (e >= 176 && e <= 180) ||
      (e >= 182 && e <= 186) ||
      (e >= 188 && e <= 191) ||
      e === 198 ||
      e === 208 ||
      e === 215 ||
      e === 216 ||
      (e >= 222 && e <= 225) ||
      e === 230 ||
      (e >= 232 && e <= 234) ||
      e === 236 ||
      e === 237 ||
      e === 240 ||
      e === 242 ||
      e === 243 ||
      (e >= 247 && e <= 250) ||
      e === 252 ||
      e === 254 ||
      e === 257 ||
      e === 273 ||
      e === 275 ||
      e === 283 ||
      e === 294 ||
      e === 295 ||
      e === 299 ||
      (e >= 305 && e <= 307) ||
      e === 312 ||
      (e >= 319 && e <= 322) ||
      e === 324 ||
      (e >= 328 && e <= 331) ||
      e === 333 ||
      e === 338 ||
      e === 339 ||
      e === 358 ||
      e === 359 ||
      e === 363 ||
      e === 462 ||
      e === 464 ||
      e === 466 ||
      e === 468 ||
      e === 470 ||
      e === 472 ||
      e === 474 ||
      e === 476 ||
      e === 593 ||
      e === 609 ||
      e === 708 ||
      e === 711 ||
      (e >= 713 && e <= 715) ||
      e === 717 ||
      e === 720 ||
      (e >= 728 && e <= 731) ||
      e === 733 ||
      e === 735 ||
      (e >= 768 && e <= 879) ||
      (e >= 913 && e <= 929) ||
      (e >= 931 && e <= 937) ||
      (e >= 945 && e <= 961) ||
      (e >= 963 && e <= 969) ||
      e === 1025 ||
      (e >= 1040 && e <= 1103) ||
      e === 1105 ||
      e === 8208 ||
      (e >= 8211 && e <= 8214) ||
      e === 8216 ||
      e === 8217 ||
      e === 8220 ||
      e === 8221 ||
      (e >= 8224 && e <= 8226) ||
      (e >= 8228 && e <= 8231) ||
      e === 8240 ||
      e === 8242 ||
      e === 8243 ||
      e === 8245 ||
      e === 8251 ||
      e === 8254 ||
      e === 8308 ||
      e === 8319 ||
      (e >= 8321 && e <= 8324) ||
      e === 8364 ||
      e === 8451 ||
      e === 8453 ||
      e === 8457 ||
      e === 8467 ||
      e === 8470 ||
      e === 8481 ||
      e === 8482 ||
      e === 8486 ||
      e === 8491 ||
      e === 8531 ||
      e === 8532 ||
      (e >= 8539 && e <= 8542) ||
      (e >= 8544 && e <= 8555) ||
      (e >= 8560 && e <= 8569) ||
      e === 8585 ||
      (e >= 8592 && e <= 8601) ||
      e === 8632 ||
      e === 8633 ||
      e === 8658 ||
      e === 8660 ||
      e === 8679 ||
      e === 8704 ||
      e === 8706 ||
      e === 8707 ||
      e === 8711 ||
      e === 8712 ||
      e === 8715 ||
      e === 8719 ||
      e === 8721 ||
      e === 8725 ||
      e === 8730 ||
      (e >= 8733 && e <= 8736) ||
      e === 8739 ||
      e === 8741 ||
      (e >= 8743 && e <= 8748) ||
      e === 8750 ||
      (e >= 8756 && e <= 8759) ||
      e === 8764 ||
      e === 8765 ||
      e === 8776 ||
      e === 8780 ||
      e === 8786 ||
      e === 8800 ||
      e === 8801 ||
      (e >= 8804 && e <= 8807) ||
      e === 8810 ||
      e === 8811 ||
      e === 8814 ||
      e === 8815 ||
      e === 8834 ||
      e === 8835 ||
      e === 8838 ||
      e === 8839 ||
      e === 8853 ||
      e === 8857 ||
      e === 8869 ||
      e === 8895 ||
      e === 8978 ||
      (e >= 9312 && e <= 9449) ||
      (e >= 9451 && e <= 9547) ||
      (e >= 9552 && e <= 9587) ||
      (e >= 9600 && e <= 9615) ||
      (e >= 9618 && e <= 9621) ||
      e === 9632 ||
      e === 9633 ||
      (e >= 9635 && e <= 9641) ||
      e === 9650 ||
      e === 9651 ||
      e === 9654 ||
      e === 9655 ||
      e === 9660 ||
      e === 9661 ||
      e === 9664 ||
      e === 9665 ||
      (e >= 9670 && e <= 9672) ||
      e === 9675 ||
      (e >= 9678 && e <= 9681) ||
      (e >= 9698 && e <= 9701) ||
      e === 9711 ||
      e === 9733 ||
      e === 9734 ||
      e === 9737 ||
      e === 9742 ||
      e === 9743 ||
      e === 9756 ||
      e === 9758 ||
      e === 9792 ||
      e === 9794 ||
      e === 9824 ||
      e === 9825 ||
      (e >= 9827 && e <= 9829) ||
      (e >= 9831 && e <= 9834) ||
      e === 9836 ||
      e === 9837 ||
      e === 9839 ||
      e === 9886 ||
      e === 9887 ||
      e === 9919 ||
      (e >= 9926 && e <= 9933) ||
      (e >= 9935 && e <= 9939) ||
      (e >= 9941 && e <= 9953) ||
      e === 9955 ||
      e === 9960 ||
      e === 9961 ||
      (e >= 9963 && e <= 9969) ||
      e === 9972 ||
      (e >= 9974 && e <= 9977) ||
      e === 9979 ||
      e === 9980 ||
      e === 9982 ||
      e === 9983 ||
      e === 10045 ||
      (e >= 10102 && e <= 10111) ||
      (e >= 11094 && e <= 11097) ||
      (e >= 12872 && e <= 12879) ||
      (e >= 57344 && e <= 63743) ||
      (e >= 65024 && e <= 65039) ||
      e === 65533 ||
      (e >= 127232 && e <= 127242) ||
      (e >= 127248 && e <= 127277) ||
      (e >= 127280 && e <= 127337) ||
      (e >= 127344 && e <= 127373) ||
      e === 127375 ||
      e === 127376 ||
      (e >= 127387 && e <= 127404) ||
      (e >= 917760 && e <= 917999) ||
      (e >= 983040 && e <= 1048573) ||
      (e >= 1048576 && e <= 1114109)),
      (j_ = (e) =>
        e === 12288 ||
        (e >= 65281 && e <= 65376) ||
        (e >= 65504 && e <= 65510)),
      (F_ = (e) =>
        (e >= 4352 && e <= 4447) ||
        e === 8986 ||
        e === 8987 ||
        e === 9001 ||
        e === 9002 ||
        (e >= 9193 && e <= 9196) ||
        e === 9200 ||
        e === 9203 ||
        e === 9725 ||
        e === 9726 ||
        e === 9748 ||
        e === 9749 ||
        (e >= 9800 && e <= 9811) ||
        e === 9855 ||
        e === 9875 ||
        e === 9889 ||
        e === 9898 ||
        e === 9899 ||
        e === 9917 ||
        e === 9918 ||
        e === 9924 ||
        e === 9925 ||
        e === 9934 ||
        e === 9940 ||
        e === 9962 ||
        e === 9970 ||
        e === 9971 ||
        e === 9973 ||
        e === 9978 ||
        e === 9981 ||
        e === 9989 ||
        e === 9994 ||
        e === 9995 ||
        e === 10024 ||
        e === 10060 ||
        e === 10062 ||
        (e >= 10067 && e <= 10069) ||
        e === 10071 ||
        (e >= 10133 && e <= 10135) ||
        e === 10160 ||
        e === 10175 ||
        e === 11035 ||
        e === 11036 ||
        e === 11088 ||
        e === 11093 ||
        (e >= 11904 && e <= 11929) ||
        (e >= 11931 && e <= 12019) ||
        (e >= 12032 && e <= 12245) ||
        (e >= 12272 && e <= 12287) ||
        (e >= 12289 && e <= 12350) ||
        (e >= 12353 && e <= 12438) ||
        (e >= 12441 && e <= 12543) ||
        (e >= 12549 && e <= 12591) ||
        (e >= 12593 && e <= 12686) ||
        (e >= 12688 && e <= 12771) ||
        (e >= 12783 && e <= 12830) ||
        (e >= 12832 && e <= 12871) ||
        (e >= 12880 && e <= 19903) ||
        (e >= 19968 && e <= 42124) ||
        (e >= 42128 && e <= 42182) ||
        (e >= 43360 && e <= 43388) ||
        (e >= 44032 && e <= 55203) ||
        (e >= 63744 && e <= 64255) ||
        (e >= 65040 && e <= 65049) ||
        (e >= 65072 && e <= 65106) ||
        (e >= 65108 && e <= 65126) ||
        (e >= 65128 && e <= 65131) ||
        (e >= 94176 && e <= 94180) ||
        e === 94192 ||
        e === 94193 ||
        (e >= 94208 && e <= 100343) ||
        (e >= 100352 && e <= 101589) ||
        (e >= 101632 && e <= 101640) ||
        (e >= 110576 && e <= 110579) ||
        (e >= 110581 && e <= 110587) ||
        e === 110589 ||
        e === 110590 ||
        (e >= 110592 && e <= 110882) ||
        e === 110898 ||
        (e >= 110928 && e <= 110930) ||
        e === 110933 ||
        (e >= 110948 && e <= 110951) ||
        (e >= 110960 && e <= 111355) ||
        e === 126980 ||
        e === 127183 ||
        e === 127374 ||
        (e >= 127377 && e <= 127386) ||
        (e >= 127488 && e <= 127490) ||
        (e >= 127504 && e <= 127547) ||
        (e >= 127552 && e <= 127560) ||
        e === 127568 ||
        e === 127569 ||
        (e >= 127584 && e <= 127589) ||
        (e >= 127744 && e <= 127776) ||
        (e >= 127789 && e <= 127797) ||
        (e >= 127799 && e <= 127868) ||
        (e >= 127870 && e <= 127891) ||
        (e >= 127904 && e <= 127946) ||
        (e >= 127951 && e <= 127955) ||
        (e >= 127968 && e <= 127984) ||
        e === 127988 ||
        (e >= 127992 && e <= 128062) ||
        e === 128064 ||
        (e >= 128066 && e <= 128252) ||
        (e >= 128255 && e <= 128317) ||
        (e >= 128331 && e <= 128334) ||
        (e >= 128336 && e <= 128359) ||
        e === 128378 ||
        e === 128405 ||
        e === 128406 ||
        e === 128420 ||
        (e >= 128507 && e <= 128591) ||
        (e >= 128640 && e <= 128709) ||
        e === 128716 ||
        (e >= 128720 && e <= 128722) ||
        (e >= 128725 && e <= 128727) ||
        (e >= 128732 && e <= 128735) ||
        e === 128747 ||
        e === 128748 ||
        (e >= 128756 && e <= 128764) ||
        (e >= 128992 && e <= 129003) ||
        e === 129008 ||
        (e >= 129292 && e <= 129338) ||
        (e >= 129340 && e <= 129349) ||
        (e >= 129351 && e <= 129535) ||
        (e >= 129648 && e <= 129660) ||
        (e >= 129664 && e <= 129672) ||
        (e >= 129680 && e <= 129725) ||
        (e >= 129727 && e <= 129733) ||
        (e >= 129742 && e <= 129755) ||
        (e >= 129760 && e <= 129768) ||
        (e >= 129776 && e <= 129784) ||
        (e >= 131072 && e <= 196605) ||
        (e >= 196608 && e <= 262141)),
      (zl =
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/y),
      ($i = /[\x00-\x08\x0A-\x1F\x7F-\x9F]{1,1000}/y),
      (Ri = /\t{1,1000}/y),
      (Xl =
        /[\u{1F1E6}-\u{1F1FF}]{2}|\u{1F3F4}[\u{E0061}-\u{E007A}]{2}[\u{E0030}-\u{E0039}\u{E0061}-\u{E007A}]{1,3}\u{E007F}|(?:\p{Emoji}\uFE0F\u20E3?|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation})(?:\u200D(?:\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F\u20E3?))*/uy),
      (vi = /(?:[\x20-\x7E\xA0-\xFF](?!\uFE0F)){1,1000}/y),
      (M_ = /\p{M}+/gu),
      (U_ = { limit: 1 / 0, ellipsis: "" }),
      (pd = (e, t = {}, n = {}) => {
        let r = t.limit ?? 1 / 0,
          s = t.ellipsis ?? "",
          i = t?.ellipsisWidth ?? (s ? pd(s, U_, n).width : 0),
          o = n.ansiWidth ?? 0,
          a = n.controlWidth ?? 0,
          l = n.tabWidth ?? 8,
          c = n.ambiguousWidth ?? 1,
          p = n.emojiWidth ?? 2,
          u = n.fullWidthWidth ?? 2,
          f = n.regularWidth ?? 1,
          h = n.wideWidth ?? 2,
          m = 0,
          d = 0,
          g = e.length,
          y = 0,
          _ = false,
          x = g,
          $ = Math.max(0, r - i),
          C = 0,
          v = 0,
          A = 0,
          T = 0;
        e: for (;;) {
          if (v > C || (d >= g && d > m)) {
            let L = e.slice(C, v) || e.slice(m, d);
            y = 0;
            for (let E of L.replaceAll(M_, "")) {
              let R = E.codePointAt(0) || 0;
              if (
                (j_(R)
                  ? (T = u)
                  : F_(R)
                    ? (T = h)
                    : c !== f && D_(R)
                      ? (T = c)
                      : (T = f),
                A + T > $ && (x = Math.min(x, Math.max(C, m) + y)),
                A + T > r)
              ) {
                _ = true;
                break e;
              }
              ((y += E.length), (A += T));
            }
            C = v = 0;
          }
          if (d >= g) break;
          if (((vi.lastIndex = d), vi.test(e))) {
            if (
              ((y = vi.lastIndex - d),
              (T = y * f),
              A + T > $ && (x = Math.min(x, d + Math.floor(($ - A) / f))),
              A + T > r)
            ) {
              _ = true;
              break;
            }
            ((A += T), (C = m), (v = d), (d = m = vi.lastIndex));
            continue;
          }
          if (((zl.lastIndex = d), zl.test(e))) {
            if ((A + o > $ && (x = Math.min(x, d)), A + o > r)) {
              _ = true;
              break;
            }
            ((A += o), (C = m), (v = d), (d = m = zl.lastIndex));
            continue;
          }
          if ((($i.lastIndex = d), $i.test(e))) {
            if (
              ((y = $i.lastIndex - d),
              (T = y * a),
              A + T > $ && (x = Math.min(x, d + Math.floor(($ - A) / a))),
              A + T > r)
            ) {
              _ = true;
              break;
            }
            ((A += T), (C = m), (v = d), (d = m = $i.lastIndex));
            continue;
          }
          if (((Ri.lastIndex = d), Ri.test(e))) {
            if (
              ((y = Ri.lastIndex - d),
              (T = y * l),
              A + T > $ && (x = Math.min(x, d + Math.floor(($ - A) / l))),
              A + T > r)
            ) {
              _ = true;
              break;
            }
            ((A += T), (C = m), (v = d), (d = m = Ri.lastIndex));
            continue;
          }
          if (((Xl.lastIndex = d), Xl.test(e))) {
            if ((A + p > $ && (x = Math.min(x, d)), A + p > r)) {
              _ = true;
              break;
            }
            ((A += p), (C = m), (v = d), (d = m = Xl.lastIndex));
            continue;
          }
          d += 1;
        }
        return {
          width: _ ? $ : A,
          index: _ ? x : g,
          truncated: _,
          ellipsed: _ && r >= i,
        };
      }),
      (B_ = { limit: 1 / 0, ellipsis: "", ellipsisWidth: 0 }),
      (Mr = (e, t = {}) => pd(e, B_, t).width),
      (Di = "\x1B"),
      (fd = "\x9B"),
      (q_ = 39),
      (tc = "\x07"),
      (md = "["),
      (H_ = "]"),
      (dd = "m"),
      (nc = `${H_}8;;`),
      (ad = new RegExp(
        `(?:\\${md}(?<code>\\d+)m|\\${nc}(?<uri>.*)${tc})`,
        "y",
      )),
      (G_ = (e) => {
        if ((e >= 30 && e <= 37) || (e >= 90 && e <= 97)) return 39;
        if ((e >= 40 && e <= 47) || (e >= 100 && e <= 107)) return 49;
        if (e === 1 || e === 2) return 22;
        if (e === 3) return 23;
        if (e === 4) return 24;
        if (e === 7) return 27;
        if (e === 8) return 28;
        if (e === 9) return 29;
        if (e === 0) return 0;
      }),
      (ld = (e) => `${Di}${md}${e}${dd}`),
      (cd = (e) => `${Di}${nc}${e}${tc}`),
      (W_ = (e) => e.map((t) => Mr(t))),
      (Jl = (e, t, n) => {
        let r = t[Symbol.iterator](),
          s = false,
          i = false,
          o = e.at(-1),
          a = o === void 0 ? 0 : Mr(o),
          l = r.next(),
          c = r.next(),
          p = 0;
        for (; !l.done; ) {
          let u = l.value,
            f = Mr(u);
          (a + f <= n ? (e[e.length - 1] += u) : (e.push(u), (a = 0)),
            (u === Di || u === fd) &&
              ((s = true), (i = t.startsWith(nc, p + 1))),
            s
              ? i
                ? u === tc && ((s = false), (i = false))
                : u === dd && (s = false)
              : ((a += f), a === n && !c.done && (e.push(""), (a = 0))),
            (l = c),
            (c = r.next()),
            (p += u.length));
        }
        ((o = e.at(-1)),
          !a &&
            o !== void 0 &&
            o.length > 0 &&
            e.length > 1 &&
            (e[e.length - 2] += e.pop()));
      }),
      (V_ = (e) => {
        let t = e.split(" "),
          n = t.length;
        for (; n > 0 && !(Mr(t[n - 1]) > 0); ) n--;
        return n === t.length
          ? e
          : t.slice(0, n).join(" ") + t.slice(n).join("");
      }),
      (K_ = (e, t, n = {}) => {
        if (n.trim !== false && e.trim() === "") return "";
        let r = "",
          s,
          i,
          o = e.split(" "),
          a = W_(o),
          l = [""];
        for (let [m, d] of o.entries()) {
          n.trim !== false && (l[l.length - 1] = (l.at(-1) ?? "").trimStart());
          let g = Mr(l.at(-1) ?? "");
          if (
            (m !== 0 &&
              (g >= t &&
                (n.wordWrap === false || n.trim === false) &&
                (l.push(""), (g = 0)),
              (g > 0 || n.trim === false) && ((l[l.length - 1] += " "), g++)),
            n.hard && a[m] > t)
          ) {
            let y = t - g,
              _ = 1 + Math.floor((a[m] - y - 1) / t);
            (Math.floor((a[m] - 1) / t) < _ && l.push(""), Jl(l, d, t));
            continue;
          }
          if (g + a[m] > t && g > 0 && a[m] > 0) {
            if (n.wordWrap === false && g < t) {
              Jl(l, d, t);
              continue;
            }
            l.push("");
          }
          if (g + a[m] > t && n.wordWrap === false) {
            Jl(l, d, t);
            continue;
          }
          l[l.length - 1] += d;
        }
        n.trim !== false && (l = l.map((m) => V_(m)));
        let c = l.join(`
`),
          p = c[Symbol.iterator](),
          u = p.next(),
          f = p.next(),
          h = 0;
        for (; !u.done; ) {
          let m = u.value,
            d = f.value;
          if (((r += m), m === Di || m === fd)) {
            ad.lastIndex = h + 1;
            let y = ad.exec(c)?.groups;
            if (y?.code !== void 0) {
              let _ = Number.parseFloat(y.code);
              s = _ === q_ ? void 0 : _;
            } else
              y?.uri !== void 0 && (i = y.uri.length === 0 ? void 0 : y.uri);
          }
          let g = s ? G_(s) : void 0;
          (d ===
          `
`
            ? (i && (r += cd("")), s && g && (r += ld(g)))
            : m ===
                `
` && (s && g && (r += ld(s)), i && (r += cd(i))),
            (h += m.length),
            (u = f),
            (f = p.next()));
        }
        return r;
      }));
    ((z_ = ["up", "down", "left", "right", "space", "enter", "cancel"]),
      (Le = {
        actions: new Set(z_),
        aliases: new Map([
          ["k", "up"],
          ["j", "down"],
          ["h", "left"],
          ["l", "right"],
          ["", "cancel"],
          ["escape", "cancel"],
        ]),
        messages: { cancel: "Canceled", error: "Something went wrong" },
        withGuide: true,
      }));
    ((J_ = globalThis.process.platform.startsWith("win")),
      (Zl = Symbol("clack:cancel")));
    ((ji = (e) =>
      "columns" in e && typeof e.columns == "number" ? e.columns : 80),
      (sc = (e) => ("rows" in e && typeof e.rows == "number" ? e.rows : 20)));
    ((xn = class {
      input;
      output;
      _abortSignal;
      rl;
      opts;
      _render;
      _track = false;
      _prevFrame = "";
      _subscribers = new Map();
      _cursor = 0;
      state = "initial";
      error = "";
      value;
      userInput = "";
      constructor(t, n = true) {
        let {
          input: r = stdin,
          output: s = stdout,
          render: i,
          signal: o,
          ...a
        } = t;
        ((this.opts = a),
          (this.onKeypress = this.onKeypress.bind(this)),
          (this.close = this.close.bind(this)),
          (this.render = this.render.bind(this)),
          (this._render = i.bind(this)),
          (this._track = n),
          (this._abortSignal = o),
          (this.input = r),
          (this.output = s));
      }
      unsubscribe() {
        this._subscribers.clear();
      }
      setSubscriber(t, n) {
        let r = this._subscribers.get(t) ?? [];
        (r.push(n), this._subscribers.set(t, r));
      }
      on(t, n) {
        this.setSubscriber(t, { cb: n });
      }
      once(t, n) {
        this.setSubscriber(t, { cb: n, once: true });
      }
      emit(t, ...n) {
        let r = this._subscribers.get(t) ?? [],
          s = [];
        for (let i of r)
          (i.cb(...n), i.once && s.push(() => r.splice(r.indexOf(i), 1)));
        for (let i of s) i();
      }
      prompt() {
        return new Promise((t) => {
          if (this._abortSignal) {
            if (this._abortSignal.aborted)
              return ((this.state = "cancel"), this.close(), t(Zl));
            this._abortSignal.addEventListener(
              "abort",
              () => {
                ((this.state = "cancel"), this.close());
              },
              { once: true },
            );
          }
          ((this.rl = kt__default.createInterface({
            input: this.input,
            tabSize: 2,
            prompt: "",
            escapeCodeTimeout: 50,
            terminal: true,
          })),
            this.rl.prompt(),
            this.opts.initialUserInput !== void 0 &&
              this._setUserInput(this.opts.initialUserInput, true),
            this.input.on("keypress", this.onKeypress),
            ki(this.input, true),
            this.output.on("resize", this.render),
            this.render(),
            this.once("submit", () => {
              (this.output.write($e.cursor.show),
                this.output.off("resize", this.render),
                ki(this.input, false),
                t(this.value));
            }),
            this.once("cancel", () => {
              (this.output.write($e.cursor.show),
                this.output.off("resize", this.render),
                ki(this.input, false),
                t(Zl));
            }));
        });
      }
      _isActionKey(t, n) {
        return t === "	";
      }
      _setValue(t) {
        ((this.value = t), this.emit("value", this.value));
      }
      _setUserInput(t, n) {
        ((this.userInput = t ?? ""),
          this.emit("userInput", this.userInput),
          n &&
            this._track &&
            this.rl &&
            (this.rl.write(this.userInput), (this._cursor = this.rl.cursor)));
      }
      _clearUserInput() {
        (this.rl?.write(null, { ctrl: true, name: "u" }),
          this._setUserInput(""));
      }
      onKeypress(t, n) {
        if (
          (this._track &&
            n.name !== "return" &&
            (n.name &&
              this._isActionKey(t, n) &&
              this.rl?.write(null, { ctrl: true, name: "h" }),
            (this._cursor = this.rl?.cursor ?? 0),
            this._setUserInput(this.rl?.line)),
          this.state === "error" && (this.state = "active"),
          n?.name &&
            (!this._track &&
              Le.aliases.has(n.name) &&
              this.emit("cursor", Le.aliases.get(n.name)),
            Le.actions.has(n.name) && this.emit("cursor", n.name)),
          t &&
            (t.toLowerCase() === "y" || t.toLowerCase() === "n") &&
            this.emit("confirm", t.toLowerCase() === "y"),
          this.emit("key", t?.toLowerCase(), n),
          n?.name === "return")
        ) {
          if (this.opts.validate) {
            let r = this.opts.validate(this.value);
            r &&
              ((this.error = r instanceof Error ? r.message : r),
              (this.state = "error"),
              this.rl?.write(this.userInput));
          }
          this.state !== "error" && (this.state = "submit");
        }
        (rc([t, n?.name, n?.sequence], "cancel") && (this.state = "cancel"),
          (this.state === "submit" || this.state === "cancel") &&
            this.emit("finalize"),
          this.render(),
          (this.state === "submit" || this.state === "cancel") && this.close());
      }
      close() {
        (this.input.unpipe(),
          this.input.removeListener("keypress", this.onKeypress),
          this.output.write(`
`),
          ki(this.input, false),
          this.rl?.close(),
          (this.rl = void 0),
          this.emit(`${this.state}`, this.value),
          this.unsubscribe());
      }
      restoreCursor() {
        let t =
          Ql(this._prevFrame, process.stdout.columns, {
            hard: true,
            trim: false,
          }).split(`
`).length - 1;
        this.output.write($e.cursor.move(-999, t * -1));
      }
      render() {
        let t = Ql(this._render(this) ?? "", process.stdout.columns, {
          hard: true,
          trim: false,
        });
        if (t !== this._prevFrame) {
          if (this.state === "initial") this.output.write($e.cursor.hide);
          else {
            let n = X_(this._prevFrame, t),
              r = sc(this.output);
            if ((this.restoreCursor(), n)) {
              let s = Math.max(0, n.numLinesAfter - r),
                i = Math.max(0, n.numLinesBefore - r),
                o = n.lines.find((a) => a >= s);
              if (o === void 0) {
                this._prevFrame = t;
                return;
              }
              if (n.lines.length === 1) {
                (this.output.write($e.cursor.move(0, o - i)),
                  this.output.write($e.erase.lines(1)));
                let a = t.split(`
`);
                (this.output.write(a[o]),
                  (this._prevFrame = t),
                  this.output.write($e.cursor.move(0, a.length - o - 1)));
                return;
              } else if (n.lines.length > 1) {
                if (s < i) o = s;
                else {
                  let l = o - i;
                  l > 0 && this.output.write($e.cursor.move(0, l));
                }
                this.output.write($e.erase.down());
                let a = t
                  .split(
                    `
`,
                  )
                  .slice(o);
                (this.output.write(
                  a.join(`
`),
                ),
                  (this._prevFrame = t));
                return;
              }
            }
            this.output.write($e.erase.down());
          }
          (this.output.write(t),
            this.state === "initial" && (this.state = "active"),
            (this._prevFrame = t));
        }
      }
    }),
      (Ni = class extends xn {
        get cursor() {
          return this.value ? 0 : 1;
        }
        get _value() {
          return this.cursor === 0;
        }
        constructor(t) {
          (super(t, false),
            (this.value = !!t.initialValue),
            this.on("userInput", () => {
              this.value = this._value;
            }),
            this.on("confirm", (n) => {
              (this.output.write($e.cursor.move(0, -1)),
                (this.value = n),
                (this.state = "submit"),
                this.close());
            }),
            this.on("cursor", () => {
              this.value = !this.value;
            }));
        }
      }),
      (Oi = class extends xn {
        _mask = "\u2022";
        get cursor() {
          return this._cursor;
        }
        get masked() {
          return this.userInput.replaceAll(/./g, this._mask);
        }
        get userInputWithCursor() {
          if (this.state === "submit" || this.state === "cancel")
            return this.masked;
          let t = this.userInput;
          if (this.cursor >= t.length)
            return `${this.masked}${styleText(["inverse", "hidden"], "_")}`;
          let n = this.masked,
            r = n.slice(0, this.cursor),
            s = n.slice(this.cursor);
          return `${r}${styleText("inverse", s[0])}${s.slice(1)}`;
        }
        clear() {
          this._clearUserInput();
        }
        constructor({ mask: t, ...n }) {
          (super(n),
            (this._mask = t ?? "\u2022"),
            this.on("userInput", (r) => {
              this._setValue(r);
            }));
        }
      }),
      (Li = class extends xn {
        options;
        cursor = 0;
        get _selectedValue() {
          return this.options[this.cursor];
        }
        changeValue() {
          this.value = this._selectedValue.value;
        }
        constructor(t) {
          (super(t, false), (this.options = t.options));
          let n = this.options.findIndex(
              ({ value: s }) => s === t.initialValue,
            ),
            r = n === -1 ? 0 : n;
          ((this.cursor = this.options[r].disabled
            ? Pi(r, 1, this.options)
            : r),
            this.changeValue(),
            this.on("cursor", (s) => {
              switch (s) {
                case "left":
                case "up":
                  this.cursor = Pi(this.cursor, -1, this.options);
                  break;
                case "down":
                case "right":
                  this.cursor = Pi(this.cursor, 1, this.options);
                  break;
              }
              this.changeValue();
            }));
        }
      }),
      (Ii = class extends xn {
        get userInputWithCursor() {
          if (this.state === "submit") return this.userInput;
          let t = this.userInput;
          if (this.cursor >= t.length) return `${this.userInput}\u2588`;
          let n = t.slice(0, this.cursor),
            [r, ...s] = t.slice(this.cursor);
          return `${n}${styleText("inverse", r)}${s.join("")}`;
        }
        get cursor() {
          return this._cursor;
        }
        constructor(t) {
          (super({
            ...t,
            initialUserInput: t.initialUserInput ?? t.initialValue,
          }),
            this.on("userInput", (n) => {
              this._setValue(n);
            }),
            this.on("finalize", () => {
              (this.value || (this.value = t.defaultValue),
                this.value === void 0 && (this.value = ""));
            }));
        }
      }));
  });
function Y_() {
  return Ye.platform !== "win32"
    ? Ye.env.TERM !== "linux"
    : !!Ye.env.CI ||
        !!Ye.env.WT_SESSION ||
        !!Ye.env.TERMINUS_SUBLIME ||
        Ye.env.ConEmuTask === "{cmd::Cmder}" ||
        Ye.env.TERM_PROGRAM === "Terminus-Sublime" ||
        Ye.env.TERM_PROGRAM === "vscode" ||
        Ye.env.TERM === "xterm-256color" ||
        Ye.env.TERM === "alacritty" ||
        Ye.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
function pc(e, t, n) {
  return String(e)
    .normalize()
    .replaceAll(
      `\r
`,
      `
`,
    )
    .split(
      `
`,
    )
    .map((r) => yx(r, t, n)).join(`
`);
}
var Ur,
  cc,
  Q_,
  ee,
  Z_,
  wd,
  Sd,
  fc,
  Z,
  Tn,
  uc,
  Hi,
  ex,
  tx,
  nx,
  rx,
  sx,
  Gi,
  ix,
  ox,
  ax,
  lx,
  oc,
  Mi,
  Ui,
  ac,
  Bi,
  cx,
  ux,
  Ed,
  px,
  Br,
  Wi,
  _d,
  fx,
  mc,
  xd,
  mx,
  Td,
  dc,
  gd,
  dx,
  yd,
  bd,
  hx,
  lc,
  gx,
  yx,
  bx,
  wx,
  qr,
  re,
  Hr,
  Sx,
  hc,
  qi,
  Gr,
  Cn,
  it = b(() => {
    ic();
    ic();
    Ur = z(Kl());
    ((cc = Y_()),
      (Q_ = () => process.env.CI === "true"),
      (ee = (e, t) => (cc ? e : t)),
      (Z_ = ee("\u25C6", "*")),
      (wd = ee("\u25A0", "x")),
      (Sd = ee("\u25B2", "x")),
      (fc = ee("\u25C7", "o")),
      ee("\u250C", "T"),
      (Z = ee("\u2502", "|")),
      (Tn = ee("\u2514", "\u2014")),
      ee("\u2510", "T"),
      ee("\u2518", "\u2014"),
      (uc = ee("\u25CF", ">")),
      (Hi = ee("\u25CB", " ")),
      ee("\u25FB", "[\u2022]"),
      ee("\u25FC", "[+]"),
      ee("\u25FB", "[ ]"),
      (ex = ee("\u25AA", "\u2022")),
      ee("\u2500", "-"),
      ee("\u256E", "+"),
      ee("\u251C", "+"),
      ee("\u256F", "+"),
      ee("\u2570", "+"),
      ee("\u256D", "+"),
      (tx = ee("\u25CF", "\u2022")),
      (nx = ee("\u25C6", "*")),
      (rx = ee("\u25B2", "!")),
      (sx = ee("\u25A0", "x")),
      (Gi = (e) => {
        switch (e) {
          case "initial":
          case "active":
            return styleText("cyan", Z_);
          case "cancel":
            return styleText("red", wd);
          case "error":
            return styleText("yellow", Sd);
          case "submit":
            return styleText("green", fc);
        }
      }),
      (ix = (e) => {
        switch (e) {
          case "initial":
          case "active":
            return styleText("cyan", Z);
          case "cancel":
            return styleText("red", Z);
          case "error":
            return styleText("yellow", Z);
          case "submit":
            return styleText("green", Z);
        }
      }),
      (ox = (e) =>
        e === 161 ||
        e === 164 ||
        e === 167 ||
        e === 168 ||
        e === 170 ||
        e === 173 ||
        e === 174 ||
        (e >= 176 && e <= 180) ||
        (e >= 182 && e <= 186) ||
        (e >= 188 && e <= 191) ||
        e === 198 ||
        e === 208 ||
        e === 215 ||
        e === 216 ||
        (e >= 222 && e <= 225) ||
        e === 230 ||
        (e >= 232 && e <= 234) ||
        e === 236 ||
        e === 237 ||
        e === 240 ||
        e === 242 ||
        e === 243 ||
        (e >= 247 && e <= 250) ||
        e === 252 ||
        e === 254 ||
        e === 257 ||
        e === 273 ||
        e === 275 ||
        e === 283 ||
        e === 294 ||
        e === 295 ||
        e === 299 ||
        (e >= 305 && e <= 307) ||
        e === 312 ||
        (e >= 319 && e <= 322) ||
        e === 324 ||
        (e >= 328 && e <= 331) ||
        e === 333 ||
        e === 338 ||
        e === 339 ||
        e === 358 ||
        e === 359 ||
        e === 363 ||
        e === 462 ||
        e === 464 ||
        e === 466 ||
        e === 468 ||
        e === 470 ||
        e === 472 ||
        e === 474 ||
        e === 476 ||
        e === 593 ||
        e === 609 ||
        e === 708 ||
        e === 711 ||
        (e >= 713 && e <= 715) ||
        e === 717 ||
        e === 720 ||
        (e >= 728 && e <= 731) ||
        e === 733 ||
        e === 735 ||
        (e >= 768 && e <= 879) ||
        (e >= 913 && e <= 929) ||
        (e >= 931 && e <= 937) ||
        (e >= 945 && e <= 961) ||
        (e >= 963 && e <= 969) ||
        e === 1025 ||
        (e >= 1040 && e <= 1103) ||
        e === 1105 ||
        e === 8208 ||
        (e >= 8211 && e <= 8214) ||
        e === 8216 ||
        e === 8217 ||
        e === 8220 ||
        e === 8221 ||
        (e >= 8224 && e <= 8226) ||
        (e >= 8228 && e <= 8231) ||
        e === 8240 ||
        e === 8242 ||
        e === 8243 ||
        e === 8245 ||
        e === 8251 ||
        e === 8254 ||
        e === 8308 ||
        e === 8319 ||
        (e >= 8321 && e <= 8324) ||
        e === 8364 ||
        e === 8451 ||
        e === 8453 ||
        e === 8457 ||
        e === 8467 ||
        e === 8470 ||
        e === 8481 ||
        e === 8482 ||
        e === 8486 ||
        e === 8491 ||
        e === 8531 ||
        e === 8532 ||
        (e >= 8539 && e <= 8542) ||
        (e >= 8544 && e <= 8555) ||
        (e >= 8560 && e <= 8569) ||
        e === 8585 ||
        (e >= 8592 && e <= 8601) ||
        e === 8632 ||
        e === 8633 ||
        e === 8658 ||
        e === 8660 ||
        e === 8679 ||
        e === 8704 ||
        e === 8706 ||
        e === 8707 ||
        e === 8711 ||
        e === 8712 ||
        e === 8715 ||
        e === 8719 ||
        e === 8721 ||
        e === 8725 ||
        e === 8730 ||
        (e >= 8733 && e <= 8736) ||
        e === 8739 ||
        e === 8741 ||
        (e >= 8743 && e <= 8748) ||
        e === 8750 ||
        (e >= 8756 && e <= 8759) ||
        e === 8764 ||
        e === 8765 ||
        e === 8776 ||
        e === 8780 ||
        e === 8786 ||
        e === 8800 ||
        e === 8801 ||
        (e >= 8804 && e <= 8807) ||
        e === 8810 ||
        e === 8811 ||
        e === 8814 ||
        e === 8815 ||
        e === 8834 ||
        e === 8835 ||
        e === 8838 ||
        e === 8839 ||
        e === 8853 ||
        e === 8857 ||
        e === 8869 ||
        e === 8895 ||
        e === 8978 ||
        (e >= 9312 && e <= 9449) ||
        (e >= 9451 && e <= 9547) ||
        (e >= 9552 && e <= 9587) ||
        (e >= 9600 && e <= 9615) ||
        (e >= 9618 && e <= 9621) ||
        e === 9632 ||
        e === 9633 ||
        (e >= 9635 && e <= 9641) ||
        e === 9650 ||
        e === 9651 ||
        e === 9654 ||
        e === 9655 ||
        e === 9660 ||
        e === 9661 ||
        e === 9664 ||
        e === 9665 ||
        (e >= 9670 && e <= 9672) ||
        e === 9675 ||
        (e >= 9678 && e <= 9681) ||
        (e >= 9698 && e <= 9701) ||
        e === 9711 ||
        e === 9733 ||
        e === 9734 ||
        e === 9737 ||
        e === 9742 ||
        e === 9743 ||
        e === 9756 ||
        e === 9758 ||
        e === 9792 ||
        e === 9794 ||
        e === 9824 ||
        e === 9825 ||
        (e >= 9827 && e <= 9829) ||
        (e >= 9831 && e <= 9834) ||
        e === 9836 ||
        e === 9837 ||
        e === 9839 ||
        e === 9886 ||
        e === 9887 ||
        e === 9919 ||
        (e >= 9926 && e <= 9933) ||
        (e >= 9935 && e <= 9939) ||
        (e >= 9941 && e <= 9953) ||
        e === 9955 ||
        e === 9960 ||
        e === 9961 ||
        (e >= 9963 && e <= 9969) ||
        e === 9972 ||
        (e >= 9974 && e <= 9977) ||
        e === 9979 ||
        e === 9980 ||
        e === 9982 ||
        e === 9983 ||
        e === 10045 ||
        (e >= 10102 && e <= 10111) ||
        (e >= 11094 && e <= 11097) ||
        (e >= 12872 && e <= 12879) ||
        (e >= 57344 && e <= 63743) ||
        (e >= 65024 && e <= 65039) ||
        e === 65533 ||
        (e >= 127232 && e <= 127242) ||
        (e >= 127248 && e <= 127277) ||
        (e >= 127280 && e <= 127337) ||
        (e >= 127344 && e <= 127373) ||
        e === 127375 ||
        e === 127376 ||
        (e >= 127387 && e <= 127404) ||
        (e >= 917760 && e <= 917999) ||
        (e >= 983040 && e <= 1048573) ||
        (e >= 1048576 && e <= 1114109)),
      (ax = (e) =>
        e === 12288 ||
        (e >= 65281 && e <= 65376) ||
        (e >= 65504 && e <= 65510)),
      (lx = (e) =>
        (e >= 4352 && e <= 4447) ||
        e === 8986 ||
        e === 8987 ||
        e === 9001 ||
        e === 9002 ||
        (e >= 9193 && e <= 9196) ||
        e === 9200 ||
        e === 9203 ||
        e === 9725 ||
        e === 9726 ||
        e === 9748 ||
        e === 9749 ||
        (e >= 9800 && e <= 9811) ||
        e === 9855 ||
        e === 9875 ||
        e === 9889 ||
        e === 9898 ||
        e === 9899 ||
        e === 9917 ||
        e === 9918 ||
        e === 9924 ||
        e === 9925 ||
        e === 9934 ||
        e === 9940 ||
        e === 9962 ||
        e === 9970 ||
        e === 9971 ||
        e === 9973 ||
        e === 9978 ||
        e === 9981 ||
        e === 9989 ||
        e === 9994 ||
        e === 9995 ||
        e === 10024 ||
        e === 10060 ||
        e === 10062 ||
        (e >= 10067 && e <= 10069) ||
        e === 10071 ||
        (e >= 10133 && e <= 10135) ||
        e === 10160 ||
        e === 10175 ||
        e === 11035 ||
        e === 11036 ||
        e === 11088 ||
        e === 11093 ||
        (e >= 11904 && e <= 11929) ||
        (e >= 11931 && e <= 12019) ||
        (e >= 12032 && e <= 12245) ||
        (e >= 12272 && e <= 12287) ||
        (e >= 12289 && e <= 12350) ||
        (e >= 12353 && e <= 12438) ||
        (e >= 12441 && e <= 12543) ||
        (e >= 12549 && e <= 12591) ||
        (e >= 12593 && e <= 12686) ||
        (e >= 12688 && e <= 12771) ||
        (e >= 12783 && e <= 12830) ||
        (e >= 12832 && e <= 12871) ||
        (e >= 12880 && e <= 19903) ||
        (e >= 19968 && e <= 42124) ||
        (e >= 42128 && e <= 42182) ||
        (e >= 43360 && e <= 43388) ||
        (e >= 44032 && e <= 55203) ||
        (e >= 63744 && e <= 64255) ||
        (e >= 65040 && e <= 65049) ||
        (e >= 65072 && e <= 65106) ||
        (e >= 65108 && e <= 65126) ||
        (e >= 65128 && e <= 65131) ||
        (e >= 94176 && e <= 94180) ||
        e === 94192 ||
        e === 94193 ||
        (e >= 94208 && e <= 100343) ||
        (e >= 100352 && e <= 101589) ||
        (e >= 101632 && e <= 101640) ||
        (e >= 110576 && e <= 110579) ||
        (e >= 110581 && e <= 110587) ||
        e === 110589 ||
        e === 110590 ||
        (e >= 110592 && e <= 110882) ||
        e === 110898 ||
        (e >= 110928 && e <= 110930) ||
        e === 110933 ||
        (e >= 110948 && e <= 110951) ||
        (e >= 110960 && e <= 111355) ||
        e === 126980 ||
        e === 127183 ||
        e === 127374 ||
        (e >= 127377 && e <= 127386) ||
        (e >= 127488 && e <= 127490) ||
        (e >= 127504 && e <= 127547) ||
        (e >= 127552 && e <= 127560) ||
        e === 127568 ||
        e === 127569 ||
        (e >= 127584 && e <= 127589) ||
        (e >= 127744 && e <= 127776) ||
        (e >= 127789 && e <= 127797) ||
        (e >= 127799 && e <= 127868) ||
        (e >= 127870 && e <= 127891) ||
        (e >= 127904 && e <= 127946) ||
        (e >= 127951 && e <= 127955) ||
        (e >= 127968 && e <= 127984) ||
        e === 127988 ||
        (e >= 127992 && e <= 128062) ||
        e === 128064 ||
        (e >= 128066 && e <= 128252) ||
        (e >= 128255 && e <= 128317) ||
        (e >= 128331 && e <= 128334) ||
        (e >= 128336 && e <= 128359) ||
        e === 128378 ||
        e === 128405 ||
        e === 128406 ||
        e === 128420 ||
        (e >= 128507 && e <= 128591) ||
        (e >= 128640 && e <= 128709) ||
        e === 128716 ||
        (e >= 128720 && e <= 128722) ||
        (e >= 128725 && e <= 128727) ||
        (e >= 128732 && e <= 128735) ||
        e === 128747 ||
        e === 128748 ||
        (e >= 128756 && e <= 128764) ||
        (e >= 128992 && e <= 129003) ||
        e === 129008 ||
        (e >= 129292 && e <= 129338) ||
        (e >= 129340 && e <= 129349) ||
        (e >= 129351 && e <= 129535) ||
        (e >= 129648 && e <= 129660) ||
        (e >= 129664 && e <= 129672) ||
        (e >= 129680 && e <= 129725) ||
        (e >= 129727 && e <= 129733) ||
        (e >= 129742 && e <= 129755) ||
        (e >= 129760 && e <= 129768) ||
        (e >= 129776 && e <= 129784) ||
        (e >= 131072 && e <= 196605) ||
        (e >= 196608 && e <= 262141)),
      (oc =
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/y),
      (Mi = /[\x00-\x08\x0A-\x1F\x7F-\x9F]{1,1000}/y),
      (Ui = /\t{1,1000}/y),
      (ac =
        /[\u{1F1E6}-\u{1F1FF}]{2}|\u{1F3F4}[\u{E0061}-\u{E007A}]{2}[\u{E0030}-\u{E0039}\u{E0061}-\u{E007A}]{1,3}\u{E007F}|(?:\p{Emoji}\uFE0F\u20E3?|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation})(?:\u200D(?:\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F\u20E3?))*/uy),
      (Bi = /(?:[\x20-\x7E\xA0-\xFF](?!\uFE0F)){1,1000}/y),
      (cx = /\p{M}+/gu),
      (ux = { limit: 1 / 0, ellipsis: "" }),
      (Ed = (e, t = {}, n = {}) => {
        let r = t.limit ?? 1 / 0,
          s = t.ellipsis ?? "",
          i = t?.ellipsisWidth ?? (s ? Ed(s, ux, n).width : 0),
          o = n.ansiWidth ?? 0,
          a = n.controlWidth ?? 0,
          l = n.tabWidth ?? 8,
          c = n.ambiguousWidth ?? 1,
          p = n.emojiWidth ?? 2,
          u = n.fullWidthWidth ?? 2,
          f = n.regularWidth ?? 1,
          h = n.wideWidth ?? 2,
          m = 0,
          d = 0,
          g = e.length,
          y = 0,
          _ = false,
          x = g,
          $ = Math.max(0, r - i),
          C = 0,
          v = 0,
          A = 0,
          T = 0;
        e: for (;;) {
          if (v > C || (d >= g && d > m)) {
            let L = e.slice(C, v) || e.slice(m, d);
            y = 0;
            for (let E of L.replaceAll(cx, "")) {
              let R = E.codePointAt(0) || 0;
              if (
                (ax(R)
                  ? (T = u)
                  : lx(R)
                    ? (T = h)
                    : c !== f && ox(R)
                      ? (T = c)
                      : (T = f),
                A + T > $ && (x = Math.min(x, Math.max(C, m) + y)),
                A + T > r)
              ) {
                _ = true;
                break e;
              }
              ((y += E.length), (A += T));
            }
            C = v = 0;
          }
          if (d >= g) break;
          if (((Bi.lastIndex = d), Bi.test(e))) {
            if (
              ((y = Bi.lastIndex - d),
              (T = y * f),
              A + T > $ && (x = Math.min(x, d + Math.floor(($ - A) / f))),
              A + T > r)
            ) {
              _ = true;
              break;
            }
            ((A += T), (C = m), (v = d), (d = m = Bi.lastIndex));
            continue;
          }
          if (((oc.lastIndex = d), oc.test(e))) {
            if ((A + o > $ && (x = Math.min(x, d)), A + o > r)) {
              _ = true;
              break;
            }
            ((A += o), (C = m), (v = d), (d = m = oc.lastIndex));
            continue;
          }
          if (((Mi.lastIndex = d), Mi.test(e))) {
            if (
              ((y = Mi.lastIndex - d),
              (T = y * a),
              A + T > $ && (x = Math.min(x, d + Math.floor(($ - A) / a))),
              A + T > r)
            ) {
              _ = true;
              break;
            }
            ((A += T), (C = m), (v = d), (d = m = Mi.lastIndex));
            continue;
          }
          if (((Ui.lastIndex = d), Ui.test(e))) {
            if (
              ((y = Ui.lastIndex - d),
              (T = y * l),
              A + T > $ && (x = Math.min(x, d + Math.floor(($ - A) / l))),
              A + T > r)
            ) {
              _ = true;
              break;
            }
            ((A += T), (C = m), (v = d), (d = m = Ui.lastIndex));
            continue;
          }
          if (((ac.lastIndex = d), ac.test(e))) {
            if ((A + p > $ && (x = Math.min(x, d)), A + p > r)) {
              _ = true;
              break;
            }
            ((A += p), (C = m), (v = d), (d = m = ac.lastIndex));
            continue;
          }
          d += 1;
        }
        return {
          width: _ ? $ : A,
          index: _ ? x : g,
          truncated: _,
          ellipsed: _ && r >= i,
        };
      }),
      (px = { limit: 1 / 0, ellipsis: "", ellipsisWidth: 0 }),
      (Br = (e, t = {}) => Ed(e, px, t).width),
      (Wi = "\x1B"),
      (_d = "\x9B"),
      (fx = 39),
      (mc = "\x07"),
      (xd = "["),
      (mx = "]"),
      (Td = "m"),
      (dc = `${mx}8;;`),
      (gd = new RegExp(
        `(?:\\${xd}(?<code>\\d+)m|\\${dc}(?<uri>.*)${mc})`,
        "y",
      )),
      (dx = (e) => {
        if ((e >= 30 && e <= 37) || (e >= 90 && e <= 97)) return 39;
        if ((e >= 40 && e <= 47) || (e >= 100 && e <= 107)) return 49;
        if (e === 1 || e === 2) return 22;
        if (e === 3) return 23;
        if (e === 4) return 24;
        if (e === 7) return 27;
        if (e === 8) return 28;
        if (e === 9) return 29;
        if (e === 0) return 0;
      }),
      (yd = (e) => `${Wi}${xd}${e}${Td}`),
      (bd = (e) => `${Wi}${dc}${e}${mc}`),
      (hx = (e) => e.map((t) => Br(t))),
      (lc = (e, t, n) => {
        let r = t[Symbol.iterator](),
          s = false,
          i = false,
          o = e.at(-1),
          a = o === void 0 ? 0 : Br(o),
          l = r.next(),
          c = r.next(),
          p = 0;
        for (; !l.done; ) {
          let u = l.value,
            f = Br(u);
          (a + f <= n ? (e[e.length - 1] += u) : (e.push(u), (a = 0)),
            (u === Wi || u === _d) &&
              ((s = true), (i = t.startsWith(dc, p + 1))),
            s
              ? i
                ? u === mc && ((s = false), (i = false))
                : u === Td && (s = false)
              : ((a += f), a === n && !c.done && (e.push(""), (a = 0))),
            (l = c),
            (c = r.next()),
            (p += u.length));
        }
        ((o = e.at(-1)),
          !a &&
            o !== void 0 &&
            o.length > 0 &&
            e.length > 1 &&
            (e[e.length - 2] += e.pop()));
      }),
      (gx = (e) => {
        let t = e.split(" "),
          n = t.length;
        for (; n > 0 && !(Br(t[n - 1]) > 0); ) n--;
        return n === t.length
          ? e
          : t.slice(0, n).join(" ") + t.slice(n).join("");
      }),
      (yx = (e, t, n = {}) => {
        if (n.trim !== false && e.trim() === "") return "";
        let r = "",
          s,
          i,
          o = e.split(" "),
          a = hx(o),
          l = [""];
        for (let [m, d] of o.entries()) {
          n.trim !== false && (l[l.length - 1] = (l.at(-1) ?? "").trimStart());
          let g = Br(l.at(-1) ?? "");
          if (
            (m !== 0 &&
              (g >= t &&
                (n.wordWrap === false || n.trim === false) &&
                (l.push(""), (g = 0)),
              (g > 0 || n.trim === false) && ((l[l.length - 1] += " "), g++)),
            n.hard && a[m] > t)
          ) {
            let y = t - g,
              _ = 1 + Math.floor((a[m] - y - 1) / t);
            (Math.floor((a[m] - 1) / t) < _ && l.push(""), lc(l, d, t));
            continue;
          }
          if (g + a[m] > t && g > 0 && a[m] > 0) {
            if (n.wordWrap === false && g < t) {
              lc(l, d, t);
              continue;
            }
            l.push("");
          }
          if (g + a[m] > t && n.wordWrap === false) {
            lc(l, d, t);
            continue;
          }
          l[l.length - 1] += d;
        }
        n.trim !== false && (l = l.map((m) => gx(m)));
        let c = l.join(`
`),
          p = c[Symbol.iterator](),
          u = p.next(),
          f = p.next(),
          h = 0;
        for (; !u.done; ) {
          let m = u.value,
            d = f.value;
          if (((r += m), m === Wi || m === _d)) {
            gd.lastIndex = h + 1;
            let y = gd.exec(c)?.groups;
            if (y?.code !== void 0) {
              let _ = Number.parseFloat(y.code);
              s = _ === fx ? void 0 : _;
            } else
              y?.uri !== void 0 && (i = y.uri.length === 0 ? void 0 : y.uri);
          }
          let g = s ? dx(s) : void 0;
          (d ===
          `
`
            ? (i && (r += bd("")), s && g && (r += yd(g)))
            : m ===
                `
` && (s && g && (r += yd(s)), i && (r += bd(i))),
            (h += m.length),
            (u = f),
            (f = p.next()));
        }
        return r;
      }));
    ((bx = (e, t, n, r, s) => {
      let i = t,
        o = 0;
      for (let a = n; a < r; a++) {
        let l = e[a];
        if (((i = i - l.length), o++, i <= s)) break;
      }
      return { lineCount: i, removals: o };
    }),
      (wx = ({
        cursor: e,
        options: t,
        style: n,
        output: r = process.stdout,
        maxItems: s = Number.POSITIVE_INFINITY,
        columnPadding: i = 0,
        rowPadding: o = 4,
      }) => {
        let a = ji(r) - i,
          l = sc(r),
          c = styleText("dim", "..."),
          p = Math.max(l - o, 0),
          u = Math.max(Math.min(s, p), 5),
          f = 0;
        e >= u - 3 && (f = Math.max(Math.min(e - u + 3, t.length - u), 0));
        let h = u < t.length && f > 0,
          m = u < t.length && f + u < t.length,
          d = Math.min(f + u, t.length),
          g = [],
          y = 0;
        (h && y++, m && y++);
        let _ = f + (h ? 1 : 0),
          x = d - (m ? 1 : 0);
        for (let C = _; C < x; C++) {
          let v = pc(n(t[C], C === e), a, { hard: true, trim: false }).split(`
`);
          (g.push(v), (y += v.length));
        }
        if (y > p) {
          let C = 0,
            v = 0,
            A = y,
            T = e - _,
            L = (E, R) => bx(g, A, E, R, p);
          (h
            ? (({ lineCount: A, removals: C } = L(0, T)),
              A > p && ({ lineCount: A, removals: v } = L(T + 1, g.length)))
            : (({ lineCount: A, removals: v } = L(T + 1, g.length)),
              A > p && ({ lineCount: A, removals: C } = L(0, T))),
            C > 0 && ((h = true), g.splice(0, C)),
            v > 0 && ((m = true), g.splice(g.length - v, v)));
        }
        let $ = [];
        h && $.push(c);
        for (let C of g) for (let v of C) $.push(v);
        return (m && $.push(c), $);
      }),
      (qr = (e) => {
        let t = e.active ?? "Yes",
          n = e.inactive ?? "No";
        return new Ni({
          active: t,
          inactive: n,
          signal: e.signal,
          input: e.input,
          output: e.output,
          initialValue: e.initialValue ?? true,
          render() {
            let r = e.withGuide ?? Le.withGuide,
              s = `${
                r
                  ? `${styleText("gray", Z)}
`
                  : ""
              }${Gi(this.state)}  ${e.message}
`,
              i = this.value ? t : n;
            switch (this.state) {
              case "submit": {
                let o = r ? `${styleText("gray", Z)}  ` : "";
                return `${s}${o}${styleText("dim", i)}`;
              }
              case "cancel": {
                let o = r ? `${styleText("gray", Z)}  ` : "";
                return `${s}${o}${styleText(["strikethrough", "dim"], i)}${
                  r
                    ? `
${styleText("gray", Z)}`
                    : ""
                }`;
              }
              default: {
                let o = r ? `${styleText("cyan", Z)}  ` : "",
                  a = r ? styleText("cyan", Tn) : "";
                return `${s}${o}${this.value ? `${styleText("green", uc)} ${t}` : `${styleText("dim", Hi)} ${styleText("dim", t)}`}${
                  e.vertical
                    ? r
                      ? `
${styleText("cyan", Z)}  `
                      : `
`
                    : ` ${styleText("dim", "/")} `
                }${this.value ? `${styleText("dim", Hi)} ${styleText("dim", n)}` : `${styleText("green", uc)} ${n}`}
${a}
`;
              }
            }
          },
        }).prompt();
      }),
      (re = {
        message: (
          e = [],
          {
            symbol: t = styleText("gray", Z),
            secondarySymbol: n = styleText("gray", Z),
            output: r = process.stdout,
            spacing: s = 1,
            withGuide: i,
          } = {},
        ) => {
          let o = [],
            a = i ?? Le.withGuide,
            l = a ? n : "",
            c = a ? `${t}  ` : "",
            p = a ? `${n}  ` : "";
          for (let f = 0; f < s; f++) o.push(l);
          let u = Array.isArray(e)
            ? e
            : e.split(`
`);
          if (u.length > 0) {
            let [f, ...h] = u;
            f.length > 0 ? o.push(`${c}${f}`) : o.push(a ? t : "");
            for (let m of h)
              m.length > 0 ? o.push(`${p}${m}`) : o.push(a ? n : "");
          }
          r.write(`${o.join(`
`)}
`);
        },
        info: (e, t) => {
          re.message(e, { ...t, symbol: styleText("blue", tx) });
        },
        success: (e, t) => {
          re.message(e, { ...t, symbol: styleText("green", nx) });
        },
        step: (e, t) => {
          re.message(e, { ...t, symbol: styleText("green", fc) });
        },
        warn: (e, t) => {
          re.message(e, { ...t, symbol: styleText("yellow", rx) });
        },
        warning: (e, t) => {
          re.warn(e, t);
        },
        error: (e, t) => {
          re.message(e, { ...t, symbol: styleText("red", sx) });
        },
      }),
      (Hr = (e) =>
        new Oi({
          validate: e.validate,
          mask: e.mask ?? ex,
          signal: e.signal,
          input: e.input,
          output: e.output,
          render() {
            let t = e.withGuide ?? Le.withGuide,
              n = `${
                t
                  ? `${styleText("gray", Z)}
`
                  : ""
              }${Gi(this.state)}  ${e.message}
`,
              r = this.userInputWithCursor,
              s = this.masked;
            switch (this.state) {
              case "error": {
                let i = t ? `${styleText("yellow", Z)}  ` : "",
                  o = t ? `${styleText("yellow", Tn)}  ` : "",
                  a = s ?? "";
                return (
                  e.clearOnError && this.clear(),
                  `${n.trim()}
${i}${a}
${o}${styleText("yellow", this.error)}
`
                );
              }
              case "submit": {
                let i = t ? `${styleText("gray", Z)}  ` : "",
                  o = s ? styleText("dim", s) : "";
                return `${n}${i}${o}`;
              }
              case "cancel": {
                let i = t ? `${styleText("gray", Z)}  ` : "",
                  o = s ? styleText(["strikethrough", "dim"], s) : "";
                return `${n}${i}${o}${
                  s && t
                    ? `
${styleText("gray", Z)}`
                    : ""
                }`;
              }
              default: {
                let i = t ? `${styleText("cyan", Z)}  ` : "",
                  o = t ? styleText("cyan", Tn) : "";
                return `${n}${i}${r}
${o}
`;
              }
            }
          },
        }).prompt()),
      (Sx = (e) => styleText("magenta", e)),
      (hc = ({
        indicator: e = "dots",
        onCancel: t,
        output: n = process.stdout,
        cancelMessage: r,
        errorMessage: s,
        frames: i = cc
          ? ["\u25D2", "\u25D0", "\u25D3", "\u25D1"]
          : ["\u2022", "o", "O", "0"],
        delay: o = cc ? 80 : 120,
        signal: a,
        ...l
      } = {}) => {
        let c = Q_(),
          p,
          u,
          f = false,
          h = false,
          m = "",
          d,
          g = performance.now(),
          y = ji(n),
          _ = l?.styleFrame ?? Sx,
          x = (w) => {
            let S =
              w > 1 ? (s ?? Le.messages.error) : (r ?? Le.messages.cancel);
            ((h = w === 1), f && (j(S, w), h && typeof t == "function" && t()));
          },
          $ = () => x(2),
          C = () => x(1),
          v = () => {
            (process.on("uncaughtExceptionMonitor", $),
              process.on("unhandledRejection", $),
              process.on("SIGINT", C),
              process.on("SIGTERM", C),
              process.on("exit", x),
              a && a.addEventListener("abort", C));
          },
          A = () => {
            (process.removeListener("uncaughtExceptionMonitor", $),
              process.removeListener("unhandledRejection", $),
              process.removeListener("SIGINT", C),
              process.removeListener("SIGTERM", C),
              process.removeListener("exit", x),
              a && a.removeEventListener("abort", C));
          },
          T = () => {
            if (d === void 0) return;
            c &&
              n.write(`
`);
            let w = pc(d, y, { hard: true, trim: false }).split(`
`);
            (w.length > 1 && n.write(Ur.cursor.up(w.length - 1)),
              n.write(Ur.cursor.to(0)),
              n.write(Ur.erase.down()));
          },
          L = (w) => w.replace(/\.+$/, ""),
          E = (w) => {
            let S = (performance.now() - w) / 1e3,
              I = Math.floor(S / 60),
              D = Math.floor(S % 60);
            return I > 0 ? `[${I}m ${D}s]` : `[${D}s]`;
          },
          R = l.withGuide ?? Le.withGuide,
          F = (w = "") => {
            ((f = true),
              (p = hd({ output: n })),
              (m = L(w)),
              (g = performance.now()),
              R &&
                n.write(`${styleText("gray", Z)}
`));
            let S = 0,
              I = 0;
            (v(),
              (u = setInterval(() => {
                if (c && m === d) return;
                (T(), (d = m));
                let D = _(i[S]),
                  K;
                if (c) K = `${D}  ${m}...`;
                else if (e === "timer") K = `${D}  ${m} ${E(g)}`;
                else {
                  let ne = ".".repeat(Math.floor(I)).slice(0, 3);
                  K = `${D}  ${m}${ne}`;
                }
                let H = pc(K, y, { hard: true, trim: false });
                (n.write(H),
                  (S = S + 1 < i.length ? S + 1 : 0),
                  (I = I < 4 ? I + 0.125 : 0));
              }, o)));
          },
          j = (w = "", S = 0, I = false) => {
            if (!f) return;
            ((f = false), clearInterval(u), T());
            let D =
              S === 0
                ? styleText("green", fc)
                : S === 1
                  ? styleText("red", wd)
                  : styleText("red", Sd);
            ((m = w ?? m),
              I ||
                (e === "timer"
                  ? n.write(`${D}  ${m} ${E(g)}
`)
                  : n.write(`${D}  ${m}
`)),
              A(),
              p());
          };
        return {
          start: F,
          stop: (w = "") => j(w, 0),
          message: (w = "") => {
            m = L(w ?? m);
          },
          cancel: (w = "") => j(w, 1),
          error: (w = "") => j(w, 2),
          clear: () => j("", 0, true),
          get isCancelled() {
            return h;
          },
        };
      }),
      {
        light: ee("\u2500", "-"),
        heavy: ee("\u2501", "="),
        block: ee("\u2588", "#"),
      },
      (qi = (e, t) =>
        e.includes(`
`)
          ? e
              .split(
                `
`,
              )
              .map((n) => t(n)).join(`
`)
          : t(e)),
      (Gr = (e) => {
        let t = (n, r) => {
          let s = n.label ?? String(n.value);
          switch (r) {
            case "disabled":
              return `${styleText("gray", Hi)} ${qi(s, (i) => styleText("gray", i))}${n.hint ? ` ${styleText("dim", `(${n.hint ?? "disabled"})`)}` : ""}`;
            case "selected":
              return `${qi(s, (i) => styleText("dim", i))}`;
            case "active":
              return `${styleText("green", uc)} ${s}${n.hint ? ` ${styleText("dim", `(${n.hint})`)}` : ""}`;
            case "cancelled":
              return `${qi(s, (i) => styleText(["strikethrough", "dim"], i))}`;
            default:
              return `${styleText("dim", Hi)} ${qi(s, (i) => styleText("dim", i))}`;
          }
        };
        return new Li({
          options: e.options,
          signal: e.signal,
          input: e.input,
          output: e.output,
          initialValue: e.initialValue,
          render() {
            let n = e.withGuide ?? Le.withGuide,
              r = `${Gi(this.state)}  `,
              s = `${ix(this.state)}  `,
              i = Fi(e.output, e.message, s, r),
              o = `${
                n
                  ? `${styleText("gray", Z)}
`
                  : ""
              }${i}
`;
            switch (this.state) {
              case "submit": {
                let a = n ? `${styleText("gray", Z)}  ` : "",
                  l = Fi(e.output, t(this.options[this.cursor], "selected"), a);
                return `${o}${l}`;
              }
              case "cancel": {
                let a = n ? `${styleText("gray", Z)}  ` : "",
                  l = Fi(
                    e.output,
                    t(this.options[this.cursor], "cancelled"),
                    a,
                  );
                return `${o}${l}${
                  n
                    ? `
${styleText("gray", Z)}`
                    : ""
                }`;
              }
              default: {
                let a = n ? `${styleText("cyan", Z)}  ` : "",
                  l = n ? styleText("cyan", Tn) : "",
                  c = o.split(`
`).length,
                  p = n ? 2 : 1;
                return `${o}${a}${wx({
                  output: e.output,
                  cursor: this.cursor,
                  options: this.options,
                  maxItems: e.maxItems,
                  columnPadding: a.length,
                  rowPadding: c + p,
                  style: (u, f) =>
                    t(u, u.disabled ? "disabled" : f ? "active" : "inactive"),
                }).join(`
${a}`)}
${l}
`;
              }
            }
          },
        }).prompt();
      }),
      `${styleText("gray", Z)}  `,
      (Cn = (e) =>
        new Ii({
          validate: e.validate,
          placeholder: e.placeholder,
          defaultValue: e.defaultValue,
          initialValue: e.initialValue,
          output: e.output,
          signal: e.signal,
          input: e.input,
          render() {
            let t = e?.withGuide ?? Le.withGuide,
              n = `${`${
                t
                  ? `${styleText("gray", Z)}
`
                  : ""
              }${Gi(this.state)}  `}${e.message}
`,
              r = e.placeholder
                ? styleText("inverse", e.placeholder[0]) +
                  styleText("dim", e.placeholder.slice(1))
                : styleText(["inverse", "hidden"], "_"),
              s = this.userInput ? this.userInputWithCursor : r,
              i = this.value ?? "";
            switch (this.state) {
              case "error": {
                let o = this.error
                    ? `  ${styleText("yellow", this.error)}`
                    : "",
                  a = t ? `${styleText("yellow", Z)}  ` : "",
                  l = t ? styleText("yellow", Tn) : "";
                return `${n.trim()}
${a}${s}
${l}${o}
`;
              }
              case "submit": {
                let o = i ? `  ${styleText("dim", i)}` : "",
                  a = t ? styleText("gray", Z) : "";
                return `${n}${a}${o}`;
              }
              case "cancel": {
                let o = i ? `  ${styleText(["strikethrough", "dim"], i)}` : "",
                  a = t ? styleText("gray", Z) : "";
                return `${n}${a}${o}${
                  i.trim()
                    ? `
${a}`
                    : ""
                }`;
              }
              default: {
                let o = t ? `${styleText("cyan", Z)}  ` : "",
                  a = t ? styleText("cyan", Tn) : "";
                return `${n}${o}${s}
${a}
`;
              }
            }
          },
        }).prompt()));
  });
async function xx() {
  return (Qt || (Qt = await import("@sentry/node")), Qt);
}
function Rd(e) {
  if (e) return false;
  let t = process.env.LITE_TELEMETRY;
  if (t === "0" || t === "false") return false;
  let n = process.env.DO_NOT_TRACK;
  return !(n === "1" || n === "true" || process.env.CI || process.env.LOCAL);
}
function Tx() {
  let e = process.versions;
  return e.bun ? "bun" : e.deno ? "deno" : "node";
}
function Cx() {
  if (process.env.CODESPACES) return "codespaces";
  if (process.env.REMOTE_CONTAINERS) return "devcontainer";
  try {
    return (statSync("/.dockerenv"), "docker");
  } catch {
    return;
  }
}
function Ax(e) {
  let t = e / 1e6;
  return t < 1
    ? "<1MB"
    : t < 10
      ? "1-10MB"
      : t < 100
        ? "10-100MB"
        : t < 1e3
          ? "100MB-1GB"
          : ">1GB";
}
function $x(e, t) {
  if (e === "sqlite" || e === "sqlite-postgres" || e === "pglite")
    return !t || t === ":memory:" || t.startsWith("file::memory:")
      ? e === "pglite" && !t
        ? void 0
        : "memory"
      : t.startsWith("file:")
        ? "file"
        : void 0;
  if (e === "postgres") {
    if (!t) return;
    try {
      let n = new URL(t).hostname;
      return n === "localhost" || n === "127.0.0.1" || n === "::1"
        ? "local"
        : "remote";
    } catch {
      return "remote";
    }
  }
}
function Rx() {
  try {
    let e = Fe__default.resolve(process.cwd(), fe.config_dir, "config.toml"),
      t;
    try {
      t = readFileSync(e, "utf-8");
    } catch {
      return {};
    }
    let n;
    try {
      n = Dt(t);
    } catch {
      return {};
    }
    let r = n.db?.driver,
      s =
        r === "sqlite" ||
        r === "sqlite-postgres" ||
        r === "pglite" ||
        r === "postgres"
          ? r
          : "sqlite-postgres",
      i = n.db?.url ?? fe.default_db_url,
      o = $x(s, i),
      a;
    if (o === "file" && i.startsWith("file:"))
      try {
        let l = i.startsWith("file://") ? i.slice(7) : i.slice(5),
          c = Fe__default.resolve(process.cwd(), l);
        a = statSync(c).size;
      } catch {}
    return { driver: s, location: o, sizeBytes: a };
  } catch {
    return {};
  }
}
async function vd(e) {
  if (An) return;
  An = true;
  let t = await xx(),
    { version: n } = await hs();
  (t.init({
    dsn: _x,
    release: `@supabase/lite@${n}`,
    sendDefaultPii: false,
    defaultIntegrations: false,
    integrations: [t.httpIntegration()],
    registerEsmLoaderHooks: false,
    tracesSampleRate: 1,
    tracePropagationTargets: ["sentry.io"],
    beforeSend(i) {
      return (delete i.server_name, i.user && delete i.user.ip_address, i);
    },
    beforeSendTransaction(i) {
      return (delete i.server_name, i.user && delete i.user.ip_address, i);
    },
  }),
    t.setTag("command", e.command),
    t.setTag("runtime", Tx()),
    t.setTag("node", process.version),
    t.setTag("platform", process.platform),
    t.setTag("arch", process.arch),
    t.setTag("ci", !!process.env.CI));
  let r = Cx();
  r && t.setTag("container", r);
  try {
    let { determineAgent: i } = await import("@vercel/detect-agent"),
      o = await i();
    o.isAgent && t.setTag("agent", o.agent.name);
  } catch {}
  let s = Rx();
  (s.driver && t.setTag("db.driver", s.driver),
    s.location && t.setTag("db.location", s.location),
    typeof s.sizeBytes == "number" && t.setTag("db.size", Ax(s.sizeBytes)));
  for (let [i, o] of Object.entries(e.args)) t.setTag(`arg.${i}`, !!o);
  (t.startSession(),
    ($d = true),
    (Yt = t.startInactiveSpan({
      name: `cli:${e.command}`,
      op: "cli.command",
      forceTransaction: true,
    })));
}
async function $n(e, t) {
  if (!An) return;
  let n = Qt;
  try {
    if (
      (e &&
        (n.setTag("status", "failed"),
        t instanceof Error && n.setTag("error_class", t.constructor.name)),
      Yt &&
        (Yt.setStatus({
          code: e ? 2 : 1,
          message: e ? "internal_error" : "ok",
        }),
        Yt.end(),
        (Yt = void 0)),
      $d)
    ) {
      let r = n.getCurrentScope().getSession();
      (r && e && (r.status = "crashed"), n.endSession());
    }
  } finally {
    await n.flush(2e3).catch(() => {});
  }
}
function Wr(e, t) {
  if (!An) return Promise.resolve(t());
  let n = Qt,
    r = () => n.startSpan({ name: e, op: "cli.step" }, t);
  return Yt ? n.withActiveSpan(Yt, r) : r();
}
function gc(e, t) {
  An && Qt.setTag(e, t);
}
function kd(e, t) {
  if (!An) return;
  let n = Qt;
  try {
    n.captureException(e, {
      tags: {
        translation_gap: !0,
        "db.variant": t.variant,
        error_class: e instanceof Error ? e.constructor.name : "unknown",
      },
      contexts: {
        translation_gap: {
          variant: t.variant,
          failing_sql: t.failingSql ? t.failingSql.slice(0, 4e3) : void 0,
        },
      },
    });
  } catch {}
}
var _x,
  Qt,
  An,
  $d,
  Yt,
  Vr = b(() => {
    Fn();
    jt();
    Se();
    _x =
      "https://9562525a4ea320539ea7e94859533a17@o398706.ingest.us.sentry.io/4511381939290112";
    ((An = false), ($d = false));
  });
function Rn(e) {
  return e instanceof Vi;
}
function Nd() {
  if (Pd) return;
  Pd = true;
  let e = process.exit.bind(process),
    t = false;
  process.exit = (n) => {
    let r = typeof n == "number" ? n : Number(process.exitCode ?? 0);
    throw (t || ((t = true), $n(r !== 0).finally(() => e(r))), new Vi(r));
  };
}
var Vi,
  Pd,
  yc = b(() => {
    Vr();
    Vi = class extends Error {
      code;
      constructor(t) {
        (super(`process.exit(${t})`),
          (this.name = "ProcessExit"),
          (this.code = t));
      }
    };
    Pd = false;
  });
function Ld(e, t) {
  let n = t?.renderHeader ?? ((a) => String(a)),
    r = Object.keys(e[0])
      .filter((a) => !t?.omitKeys?.includes(a))
      .map((a) => {
        let l = n(a),
          c = Math.max(l.length, ...e.map((p) => String(p[a]).length));
        return { key: a, header: l, length: c };
      }),
    s = " ".repeat(t?.paddingHorizontal ?? 1),
    i = `
`.repeat(t?.paddingVertical ?? 1),
    o =
      t?.renderCell ??
      ((a, l) => (l === null ? Od.default.dim("null") : String(l)));
  return `${i}${s}| ${r.map((a) => a.header.padEnd(a.length)).join(" | ")} |
${s}| ${r.map((a) => "\u2500".repeat(a.length)).join(" | ")} |
${e.map(
  (a) =>
    `${s}| ${Object.entries(a)
      .filter(([l]) => !t?.omitKeys?.includes(l))
      .map(([l, c]) => o(l, c).padEnd(r.find((p) => p.key === l)?.length ?? 0))
      .join(" | ")} |`,
).join(`
`)}${i}`;
}
async function X(e) {
  try {
    await e();
  } catch (t) {
    if (Rn(t)) throw t;
    ((process.env.LOCAL || process.env.DEBUG) && console.error(t),
      re.error(String(t)),
      process.exit(1));
  }
  process.exit(0);
}
var Od,
  Ie = b(() => {
    Od = z(J());
    it();
    yc();
  });
function Px(e, t) {
  if (e == null) return e;
  switch (t) {
    case 20:
      return typeof e == "bigint" ? e : BigInt(e);
    case 22:
      return Array.isArray(e)
        ? e
        : typeof e == "string"
          ? e
              .split(" ")
              .map(Number)
              .filter((n) => !Number.isNaN(n))
          : e;
    case 1002:
    case 1009:
    case 1015:
      return typeof e == "string" ? Id(e, vx) : e;
    case 1005:
    case 1007:
    case 1016:
      return typeof e == "string" ? Id(e, kx) : e;
    default:
      return e;
  }
}
function bc(e) {
  let t = async (n, r) => {
    let s = await e.driver.query(n, r ? [...r] : []);
    return {
      rows: s.rows.map((o) =>
        Object.fromEntries(
          s.fields.map((a) => [a.name, Px(o[a.name], a.dataTypeID)]),
        ),
      ),
    };
  };
  return {
    query: t,
    connect: async () => ({ query: t, release: () => {} }),
    end: async () => {},
  };
}
var Id,
  vx,
  kx,
  Dd = b(() => {
    ((Id = (e, t = (n) => n) => {
      if (!e || e === "{}") return [];
      let n = e.slice(1, -1);
      if (n === "") return [];
      let r = [],
        s = "",
        i = false,
        o = 0;
      for (let a = 0; a < n.length; a++) {
        let l = n[a];
        l === '"' && n[a - 1] !== "\\"
          ? ((i = !i), (s += l))
          : l === "{" && !i
            ? (o++, (s += l))
            : l === "}" && !i
              ? (o--, (s += l))
              : l === "," && !i && o === 0
                ? (r.push(t(s)), (s = ""))
                : (s += l);
      }
      return (s !== "" && r.push(t(s)), r);
    }),
      (vx = (e) =>
        e === "NULL"
          ? null
          : e.startsWith('"') && e.endsWith('"')
            ? e.slice(1, -1).replace(/\\(.)/g, "$1")
            : e),
      (kx = (e) => (e === "NULL" ? null : Number.parseInt(e, 10))));
  });
async function Fd() {
  try {
    let [{ extract: e }, { plan: t }, { segmentActions: n }] =
      await Promise.all([
        import("@supabase/pg-delta/extract"),
        import("@supabase/pg-delta/plan"),
        import("@supabase/pg-delta/apply"),
      ]);
    return { extract: e, plan: t, segmentActions: n };
  } catch (e) {
    throw new Error(
      "Postgres schema diffing requires pg-delta to be available.",
      { cause: e },
    );
  }
}
function Md(e) {
  let t = [...(e.assumedRoles ?? [])],
    n = [
      {
        match: {
          all: [
            { kind: "acl" },
            { idField: { field: "grantee", glob: "postgres" } },
          ],
        },
        action: "exclude",
      },
      {
        match: {
          all: [
            { verb: ["link", "unlink"] },
            { edgeTo: { edgeKind: "owner" } },
          ],
        },
        action: "exclude",
      },
    ];
  return (
    t.length > 0 &&
      n.push({
        match: { all: [{ kind: "role" }, { name: t }] },
        action: "exclude",
      }),
    e.only
      ? n.push({ match: { not: { any: jd(e.only) } }, action: "exclude" })
      : e.exclude?.length &&
        n.push({ match: { any: jd(e.exclude) }, action: "exclude" }),
    { id: "supabase-lite", filter: n, assumedRoles: ["postgres", ...t] }
  );
}
function jd(e) {
  let t = [...e];
  return [
    { all: [{ kind: "schema" }, { name: t }] },
    { schema: t },
    { target: { schema: t } },
  ];
}
function Ud(e, t) {
  return e.segmentActions(t.actions).map((n) => ({
    transactional: n.transactional,
    statements: t.actions.slice(n.start, n.end).map((r) => r.sql),
  }));
}
function Bd(e) {
  return e.preamble
    .filter((t) => t.name !== "search_path")
    .map((t) => `SET LOCAL ${t.name} = ${Nx(t.value)}`);
}
function Nx(e) {
  return `'${e.replace(/'/g, "''")}'`;
}
function qd(e) {
  let t = [];
  for (let n of e.actions) n.dataLoss === "destructive" && t.push(Ox(n));
  return t;
}
function Ox(e) {
  for (let t of e.destroys)
    if (t.kind === "table")
      return { table: wc(t.schema, t.name), reason: "drop table" };
  for (let t of e.destroys)
    if (t.kind === "column")
      return { table: wc(t.schema, t.table), reason: `drop column ${t.name}` };
  for (let t of e.destroys)
    if (t.kind === "sequence")
      return { table: wc(t.schema, t.name), reason: "drop sequence" };
  return { table: "unknown", reason: e.sql };
}
function wc(e, t) {
  return e === "public" ? t : `${e}.${t}`;
}
var Hd = b(() => {});
function Dx(e, t) {
  let n = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    r = new RegExp(`(?<![\\w$])"?${n}"?\\.`);
  return e.some((s) => r.test(s));
}
function Gd(e, t) {
  let n = new Set();
  for (let r of t) for (let s of r.matchAll(Ix)) n.add(s[1]);
  return e
    .facts()
    .filter((r) => r.id.kind === "schema")
    .map((r) => r.id.name)
    .filter((r) => !Lx.has(r) && !n.has(r) && Dx(t, r))
    .map((r) => `CREATE SCHEMA IF NOT EXISTS "${r}";`);
}
var Lx,
  Ix,
  Wd = b(() => {
    ((Lx = new Set(["public", "supabase_migrations"])),
      (Ix = /\bCREATE\s+SCHEMA\b(?:\s+IF\s+NOT\s+EXISTS)?\s+"?([\w$]+)"?/gi));
  });
function Fx(e, t) {
  let n = Ci(e),
    r = new Set([...vt(e), ...vt(t)]);
  return new Set(_n.filter((s) => r.has(s) && !n.has(s)));
}
function Vd(e) {
  let t = e.trimEnd();
  return t.endsWith(";") ? t : `${t};`;
}
async function Kd(e, t, n = "") {
  let r = await Fd(),
    { PgliteConnection: s } = await We(
      "@supabase/lite/pglite",
      "pglite",
      "@electric-sql/pglite",
    ),
    i = new s(),
    o = new s();
  try {
    let a = Fx(e, t),
      l = vt(t);
    (await i.exec(Rt(a)),
      await o.exec(Rt(l)),
      i.config.baseSchema && (await i.exec(i.config.baseSchema)),
      o.config.baseSchema && (await o.exec(o.config.baseSchema)),
      n.trim() && (await i.exec(n), await o.exec(n)),
      e.trim() && (await i.exec(e)),
      t.trim() && (await o.exec(t)));
    let { factBase: c } = await r.extract(bc(i)),
      { factBase: p } = await r.extract(bc(o)),
      u = r.plan(c, p, { policy: Md({ assumedRoles: Qm(t) }) });
    if (u.actions.length === 0) return [];
    if (u.safetyReport.destructiveActions > 0) throw new DataLossError(qd(u));
    let f = Ud(r, u),
      h = Gd(
        p,
        f.flatMap((d) => d.statements),
      ),
      m = Bd(u).map(Vd);
    return f.map((d, g) =>
      [...m, ...(g === 0 ? h : []), ...d.statements.map(Vd)].join(`

`),
    );
  } finally {
    (await i.close().catch(() => {}), await o.close().catch(() => {}));
  }
}
var zd = b(() => {
  ln();
  Dd();
  Hd();
  Wd();
  Fr();
});
async function Ki(e) {
  let { parse: t } = await import("pgsql-parser");
  return t(e);
}
var Xd = b(() => {});
var zi,
  Jd = b(() => {
    yn();
    Gt();
    zi = class {
      constructor(t) {
        this.ast = t;
        this.result = [
          ...this.walk(this.ast, [], { trackPaths: ["returningList"] }),
        ];
      }
      result = [];
      *walk(t = this.ast, n = [], r = {}) {
        if (!t || typeof t != "object") return;
        let { trackPaths: s = [] } = r;
        if (Array.isArray(t)) {
          for (let o = 0; o < t.length; o++) yield* this.walk(t[o], n, r);
          return;
        }
        let i = Object.keys(t);
        if (i.length === 1 && i[0][0] >= "A" && i[0][0] <= "Z") {
          let o = i[0];
          (yield { node: t, path: n }, yield* this.walk(t[o], [...n, o], r));
        } else
          for (let [o, a] of Object.entries(t))
            if (a && typeof a == "object") {
              let l = s.includes(o) ? [...n, o] : n;
              yield* this.walk(a, l, r);
            }
      }
      containsUnsupportedNode() {
        for (let { node: t } of this.result) {
          let n = gn(t),
            r = di.get(n);
          if (r && r.react === "error") return true;
        }
      }
      hasFuncCall() {
        for (let { node: t } of this.result) if ("FuncCall" in t) return true;
        return false;
      }
      getFuncCalls() {
        return Array.from(this.result)
          .map(({ node: t }) => t)
          .filter((t) => "FuncCall" in t)
          .map((t) => t.FuncCall);
      }
      getFuncCallNames() {
        return this.getFuncCalls().flatMap((t) =>
          t.funcname?.map((n) => n.String?.sval || n.String?.str),
        );
      }
      hasSqlValueFunction() {
        for (let { node: t } of this.result)
          if ("SQLValueFunction" in t) return true;
        return false;
      }
      getSqlValueFunctions() {
        return Array.from(this.result)
          .map(({ node: t }) => t)
          .filter((t) => "SQLValueFunction" in t)
          .map((t) => t.SQLValueFunction);
      }
      getSqlValueFunctionNames() {
        return this.getSqlValueFunctions().map((t) => t.op);
      }
      hasUnsafeStar() {
        let t = this.result.filter(({ node: n }) => "A_Star" in n);
        if (t.length === 0) return false;
        for (let { path: n } of t)
          if (!n.includes("SelectStmt") && !n.includes("returningList"))
            return true;
        return false;
      }
      getRelationDefinitions() {
        return this.result
          .filter(({ node: n }) => "CreateStmt" in n)
          .map(({ node: n }) => n.CreateStmt)
          .map((n) => ({
            relation: {
              relname: n.relation?.relname ?? "",
              inh: n.relation?.inh,
              relpersistence: n.relation?.relpersistence,
            },
            columns: n.tableElts?.map((r) => {
              let s = r.ColumnDef?.typeName?.names?.map((o) =>
                  "String" in o ? o.String.sval : "",
                ),
                i = s?.some((o) => o.toLowerCase().includes("pg_catalog"));
              return {
                name: r.ColumnDef?.colname ?? "",
                is_local: r.ColumnDef?.is_local,
                pg_catalog: i,
                type:
                  s?.filter(
                    (o) => !o.toLowerCase().includes("pg_catalog"),
                  )[0] ?? "",
                types: s,
                constraints: r.ColumnDef?.constraints,
              };
            }),
          }));
      }
      getRelationColumnTypes() {
        return {
          has_non_pg_catalog_types: this.getRelationDefinitions().some((t) =>
            t.columns?.some((n) => !n.pg_catalog),
          ),
          types: Array.from(
            new Set(
              this.getRelationDefinitions().flatMap((t) =>
                t.columns?.map((n) => n.type),
              ),
            ),
          ),
        };
      }
    };
  });
var Mx,
  Ux,
  Bx,
  qx,
  vn,
  Xi,
  Yd = b(() => {
    yn();
    ((Mx = [
      "DECLARE",
      "IF",
      "ELSIF",
      "ELSE",
      "LOOP",
      "WHILE",
      "FOR",
      "FOREACH",
      "EXCEPTION",
      "RAISE",
      "PERFORM",
      "EXECUTE",
      "SELECT",
    ]),
      (Ux = /^NEW\.(\w+)\s*(?::=|=)\s*(.+)$/is),
      (Bx = /^RETURN\s+(NEW|OLD)$/i),
      (qx = /^(INSERT|UPDATE|DELETE)\b/i),
      (vn = class extends Wt {
        constructor(n, r, s) {
          super(s ?? `Unsupported PL/pgSQL: ${n}`);
          this.hint = n;
          this.body = r;
        }
      }),
      (Xi = class {
        parse(t) {
          let n = this.extractBlock(t),
            r = this.splitStatements(n),
            s = [],
            i = null;
          for (let o of r) {
            let a = o.trim();
            if (!a) continue;
            this.rejectUnsupported(a);
            let l = a.match(Bx);
            if (l) {
              ((i = l[1].toUpperCase()), s.push({ type: "return", value: i }));
              continue;
            }
            let c = a.match(Ux);
            if (c) {
              s.push({
                type: "assignment",
                column: c[1],
                expression: c[2].trim(),
              });
              continue;
            }
            if (qx.test(a)) {
              s.push({ type: "dml", sql: a });
              continue;
            }
            throw new vn(
              `"${a.substring(0, 80)}" is not translatable to SQLite`,
              n,
            );
          }
          if (!i)
            throw new Wt(
              "Trigger function body must end with RETURN NEW or RETURN OLD",
            );
          return { statements: s, returnValue: i };
        }
        extractBlock(t) {
          let n = t.trim(),
            r = n.toUpperCase();
          if (/^\s*DECLARE\b/i.test(n))
            throw new vn('"DECLARE" is not translatable to SQLite', t);
          let s = r.indexOf("BEGIN"),
            i = r.lastIndexOf("END");
          if (s === -1 || i === -1 || i <= s)
            throw new vn(
              "Expected BEGIN ... END block in trigger function body",
              t,
            );
          return n.slice(s + 5, i).trim();
        }
        splitStatements(t) {
          let n = [],
            r = "",
            s = 0,
            i = false,
            o = "";
          for (let l = 0; l < t.length; l++) {
            let c = t[l];
            if (i) {
              ((r += c),
                c === o &&
                  (l + 1 < t.length && t[l + 1] === o
                    ? (r += t[++l])
                    : (i = false)));
              continue;
            }
            if (c === "'" || c === '"') {
              ((i = true), (o = c), (r += c));
              continue;
            }
            if (c === "(") {
              (s++, (r += c));
              continue;
            }
            if (c === ")") {
              (s--, (r += c));
              continue;
            }
            if (c === ";" && s === 0) {
              (n.push(r.trim()), (r = ""));
              continue;
            }
            r += c;
          }
          let a = r.trim();
          return (a && n.push(a), n);
        }
        rejectUnsupported(t) {
          let n = t.match(/^(\w+)/)?.[1]?.toUpperCase();
          if (n && Mx.includes(n))
            throw new vn(`"${n}" is not translatable to SQLite`, t);
        }
      }));
  });
function Kx(e) {
  let t = e?.GrantStmt ?? e;
  return t?.is_grant !== true
    ? false
    : t.targtype === "ACL_TARGET_ALL_IN_SCHEMA"
      ? t.objtype === "OBJECT_TABLE" || t.objtype === "OBJECT_SEQUENCE"
      : t.targtype === "ACL_TARGET_OBJECT" && Vx.has(t.objtype);
}
function Qd(e) {
  return e?.String?.sval;
}
function Zd(e) {
  return e?.FuncCall?.funcname
    ?.map((t) => t.String?.sval ?? t.String?.str)
    .filter(Boolean)
    .at(-1)
    ?.toLowerCase();
}
var Vx,
  Sc,
  Ji,
  eh = b(() => {
    yn();
    _i();
    Gt();
    Gt();
    Jd();
    lt();
    Yd();
    sr();
    ei();
    Da();
    ja();
    Gn();
    Cl();
    $l();
    Vx = new Set([
      "OBJECT_TABLE",
      "OBJECT_VIEW",
      "OBJECT_SEQUENCE",
      "OBJECT_SCHEMA",
    ]);
    Sc = new Set(["plpgsql", "pgcrypto", "uuid-ossp"]);
    Ji = class extends Deparser {
      enums;
      warnings = [];
      helper;
      config;
      triggerFunctions = new Map();
      plpgsqlParser = new Xi();
      introspection;
      functionResolution;
      serialColumns;
      storagePathTokensConstraints = new WeakSet();
      relationNames = new Set();
      constructor(
        t,
        { enums: n, introspection: r, serialColumns: s, ...i } = {},
      ) {
        (super(t, i),
          (this.enums = n ?? new Map()),
          (this.helper = new zi(t)),
          (this.config = i),
          (this.introspection = r),
          (this.functionResolution = i?.functionResolution ?? "translate"),
          (this.serialColumns = s ?? new WeakSet()));
        for (let o of [
          ...(r?.tables ?? []),
          ...(r?.views ?? []),
          ...(r?.indexes ?? []),
        ])
          this.relationNames.add(Ke(o.schema, o.name));
      }
      visit(t, n) {
        let r = gn(t);
        if (r === "GrantStmt" && Kx(t)) return "";
        let s = t.AlterObjectSchemaStmt;
        if (
          r === "AlterObjectSchemaStmt" &&
          s?.objectType === "OBJECT_EXTENSION"
        ) {
          let o = Qd(s.object);
          if (o && Sc.has(o)) return "";
          throw new M({ [r]: t }, "ALTER EXTENSION is not supported in SQLite");
        }
        if (r === "AlterExtensionStmt" || r === "AlterExtensionContentsStmt")
          throw new M({ [r]: t }, "ALTER EXTENSION is not supported in SQLite");
        if (r === "AlterEnumStmt") {
          let o = t.AlterEnumStmt ?? t,
            a = Q(o.typeName ?? []),
            l = a.length ? `${a.map((p) => ui(p)).join(".")} ` : "",
            c = o.oldVal !== void 0 ? "RENAME VALUE" : "ADD VALUE";
          throw new M(
            { [r]: t },
            `ALTER TYPE ${l}${c} is not supported on sqlite-postgres yet. Recreate the type with all values, or track this change in a manual migration.`,
          );
        }
        let i = di.get(r);
        if (i) {
          if (i.react === "error")
            throw new M({ [r]: t }, `Unsupported node type: ${r}`);
          return (
            i.react === "warn" && this.warnings.push({ type: r, node: t }),
            ""
          );
        }
        return super.visit(t, n);
      }
      CreateExtensionStmt(t, n) {
        let r = t.extname ?? "";
        if (Sc.has(r)) return "";
        throw new M(
          { CreateExtensionStmt: t },
          `CREATE EXTENSION ${JSON.stringify(r)} is not supported in SQLite`,
        );
      }
      deparse(t, n) {
        if (t == null) return null;
        if (!n) {
          let r = new SqlFormatter();
          n = new DeparserContext({ formatter: r });
        }
        return typeof t == "number" || t instanceof Number
          ? t.toString()
          : this.visit(t, n);
      }
      RawStmt(t, n) {
        if (!t.stmt || t.stmt.CommentStmt) return "";
        let r = this.deparse(t.stmt, n);
        return !r || r.length === 0 ? "" : t.stmt_len ? r + ";" : r;
      }
      RangeVar(t, n) {
        let r = t.relname,
          s = this.quoteBareIfNeeded(Ke(t.schemaname, r)),
          i = t.alias ? " " + this.Alias(t.alias, n) : "";
        return s + i;
      }
      getRelationName(t) {
        return Ke(t.schemaname, t.relname);
      }
      sqliteTriggerName(t, n) {
        return this.quoteIfNeeded(`${t}_${n}`);
      }
      sqliteIndexName(t, n) {
        return Ke(t.schemaname, n);
      }
      quoteBareIfNeeded(t) {
        return /^[A-Za-z_][A-Za-z0-9_]*$/.test(t)
          ? t
          : `"${t.replace(/"/g, '""')}"`;
      }
      triggerFunctionKey(t) {
        let n = Q(t ?? []);
        if (n.length !== 0)
          return n.length === 1 ? `${Ve}.${n[0]}` : n.join(".");
      }
      CreateStmt(t, n) {
        if (t.inhRelations && t.inhRelations.length > 0)
          throw new M(
            { CreateStmt: t },
            "Inheritance is not supported in SQLite",
          );
        if (t.ofTypename !== void 0)
          throw new M(
            { CreateStmt: t },
            "Typed tables (CREATE TABLE ... OF type_name) are not supported. Define columns directly in the CREATE TABLE statement instead.",
          );
        if (
          (t.options && t.options.length > 0 && (t.options = void 0),
          !t.tableElts || t.tableElts.length === 0)
        )
          throw new M(
            { CreateStmt: t },
            "Empty tables are not supported in SQLite. Define at least one column.",
          );
        if (
          (t.accessMethod && (t.accessMethod = void 0),
          t.relation?.schemaname === "storage" &&
            t.relation.relname === "objects")
        )
          for (let s of t.tableElts ?? []) {
            let i = s.ColumnDef;
            if (i?.colname === "path_tokens")
              for (let o of i.constraints ?? []) {
                let a = o.Constraint;
                a?.contype === "CONSTR_GENERATED" &&
                  Zd(a.raw_expr) === "string_to_array" &&
                  this.storagePathTokensConstraints.add(a);
              }
          }
        return (
          t.relation &&
            this.relationNames.add(this.getRelationName(t.relation)),
          super.CreateStmt(t, n) + " STRICT"
        );
      }
      ViewStmt(t, n) {
        return (
          t.view && this.relationNames.add(this.getRelationName(t.view)),
          super.ViewStmt(t, n)
        );
      }
      TableLikeClause(t, n) {
        throw new M(
          { TableLikeClause: t },
          "CREATE TABLE ... (LIKE ...) is not supported in SQLite. Define the table columns explicitly instead.",
        );
      }
      DefElem(t, n) {
        if (
          [
            "oids",
            "fillfactor",
            /^autovacuum_/i,
            "toast_tuple_target",
            "parallel_workers",
            "user_catalog_table",
          ].some((i) => xu(t.defname ?? "", i))
        )
          return "";
        let s = super.DefElem(t, n);
        throw new M(
          { DefElem: t },
          `DefElem "${t.defname}" (${s}) not supported`,
        );
      }
      TypeName(t, n) {
        if (!t.names) return "";
        let r = t.names
          .map((i) => (i.String ? i.String.sval || i.String.str : ""))
          .filter(Boolean);
        if (r.length === 0) return "";
        let s = r.length === 2 && r[0] === "pg_catalog" ? r[1] : r.join(".");
        return (t.arrayBounds && t.arrayBounds.length > 0) || Be(this.enums, s)
          ? "TEXT"
          : Cm(s);
      }
      ColumnDef(t, n) {
        let r = [],
          s = t.colname;
        s && r.push(this.quoteIfNeeded(s));
        let i = false,
          o = false,
          a = null,
          l = null,
          c = null,
          p = false;
        if (t.typeName) {
          let u = t.typeName.names
            ?.map((m) => m.String?.sval || m.String?.str)
            .filter(Boolean);
          ((c =
            u && u.length > 0
              ? u.length === 2 && u[0] === "pg_catalog"
                ? u[1]
                : u.join(".")
              : null),
            (i = !!(c && pi(c)) || this.serialColumns.has(t)),
            (p = !!(
              t.typeName.arrayBounds && t.typeName.arrayBounds.length > 0
            )));
          let f = Array.isArray(t.typeName.typmods) ? t.typeName.typmods : [],
            h = (m) =>
              f[m]?.A_Const?.ival?.ival ?? f[m]?.A_Const?.val?.ival?.ival;
          if (c && fi(c) && f.length > 0) {
            let m = h(0);
            typeof m == "number" && m > 0 && (a = { maxLen: m });
          }
          if (c && mi(c) && f.length >= 2) {
            let m = h(0),
              d = h(1);
            typeof m == "number" &&
              typeof d == "number" &&
              m > 0 &&
              d >= 0 &&
              (l = { precision: m, scale: d });
          }
          if (t.constraints) {
            let m = Array.isArray(t.constraints) ? t.constraints : [];
            ((o = m.some((d) => d.Constraint?.contype === "CONSTR_PRIMARY")),
              m.some((d) => d.Constraint?.contype === "CONSTR_IDENTITY") &&
                (i = true));
          }
          r.push(this.TypeName(t.typeName, n));
        }
        if (t.constraints) {
          let u = Array.isArray(t.constraints) ? t.constraints : [],
            f = n.spawn("ColumnDef", { isColumnConstraint: true }),
            h = u.map((d) => this.visit(d, f));
          r.push(...h.filter(Boolean));
          let m = u.some((d) => d.Constraint?.contype === "CONSTR_CHECK");
          i && o && !m
            ? r.push("AUTOINCREMENT")
            : i &&
              !o &&
              this.warnings.push({
                type: "ColumnDef",
                node: { ColumnDef: t },
                message: `Column "${s}" is serial/auto-increment but not the primary key; SQLite can't auto-increment a non-primary-key column, so it becomes a plain INTEGER (no auto-increment).`,
              });
        }
        if (s && c) {
          let u = { isArray: p };
          (a && (u.lengthConstraint = a.maxLen), l && (u.numericPrecision = l));
          let f = Be(this.enums, c);
          f && (u.enumValues = f);
          let d = je(
            {
              schema: "public",
              table: "",
              column: s,
              pgTypeName: c,
              nullable: true,
              defaultValue: null,
              defaultFn: null,
              isPrimaryKey: o,
              isUnique: false,
              isSerial: i,
            },
            u,
          ).checkConstraint();
          d && r.push(`CHECK (${d})`);
        }
        return r.join(" ");
      }
      Constraint(t, n) {
        let r = t.contype;
        if (
          r === "CONSTR_IDENTITY" ||
          r === "CONSTR_ATTR_DEFERRABLE" ||
          r === "CONSTR_ATTR_NOT_DEFERRABLE" ||
          r === "CONSTR_ATTR_DEFERRED" ||
          r === "CONSTR_ATTR_IMMEDIATE"
        )
          return "";
        if (r === "CONSTR_NULL") return "NULL";
        if (r === "CONSTR_NOTNULL") return "NOT NULL";
        if (r === "CONSTR_DEFAULT" && t.raw_expr) {
          let s = this.unwrapConstCast(t.raw_expr),
            i = this.visit(s, n);
          return i.includes("(") && !i.startsWith("(")
            ? `DEFAULT (${i})`
            : `DEFAULT ${i}`;
        }
        if (r === "CONSTR_CHECK" && t.raw_expr) {
          let s = [];
          (t.conname && s.push("CONSTRAINT", ui(t.conname)), s.push("CHECK"));
          let i = this.visit(t.raw_expr, n);
          return (s.push(`(${i})`), s.join(" "));
        }
        if (r === "CONSTR_PRIMARY")
          return t.keys && t.keys.length > 0
            ? `PRIMARY KEY (${mt(t.keys)
                .map((i) => this.visit(i, n))
                .join(", ")})`
            : "PRIMARY KEY";
        if (r === "CONSTR_UNIQUE")
          return t.keys && t.keys.length > 0
            ? `UNIQUE (${mt(t.keys)
                .map((i) => this.visit(i, n))
                .join(", ")})`
            : "UNIQUE";
        if (r === "CONSTR_FOREIGN")
          return super
            .Constraint(t, n)
            .replace(/FOREIGN\s+KEY\s+REFERENCES/gi, "REFERENCES");
        if (r === "CONSTR_GENERATED" && t.raw_expr)
          return this.storagePathTokensConstraints.has(t)
            ? ""
            : `GENERATED ALWAYS AS (${this.visit(t.raw_expr, n)}) STORED`;
        if (r === "CONSTR_EXCLUSION")
          throw new M(
            { Constraint: t },
            "EXCLUSION constraints are not supported in SQLite",
          );
        return "";
      }
      FuncCall(t, n) {
        let s = (t.funcname || [])
          .map((c) => c.String?.sval || c.String?.str)
          .filter(Boolean);
        if (s.length === 0) throw new Error("Function call has no name");
        let i = s[s.length - 1].toLowerCase();
        if (i === "extract" && t.args && t.args.length >= 2) {
          let c = t.args[0];
          if ((c?.A_Const?.sval?.sval || c?.String?.sval) === "epoch")
            return `strftime('%s', ${this.visit(t.args[1], n)})`;
        }
        let a = (t.args ?? []).map((c) => this.visit(c, n));
        if (t.agg_star) return `${i}(*)`;
        if (t.agg_distinct) return `${i}(DISTINCT ${a.join(", ")})`;
        let l = Al(i, this.functionResolution);
        if (l) {
          if (l.sqliteExpr !== null) {
            let c = l.sqliteExpr;
            return c.includes("(") ? c : `${c}(${a.join(", ")})`;
          }
          if (l.jsFn !== null) {
            let c = Si[i];
            if (c?.sqlite) {
              let p = c.sqlite();
              return p.includes("(") ? p : `${p}(${a.join(", ")})`;
            }
          }
        }
        throw new M({ FuncCall: t }, `Function call "${i}" not supported`);
      }
      SQLValueFunction(t, n) {
        switch (t.op) {
          case "SVFOP_CURRENT_TIMESTAMP":
            return "datetime('now')";
          case "SVFOP_CURRENT_DATE":
            return "date('now')";
          case "SVFOP_CURRENT_TIME":
            return "time('now')";
          default:
            throw new M(
              { SQLValueFunction: t },
              `SQLValueFunction "${t.op}" not supported`,
            );
        }
      }
      ResTarget(t, n) {
        if (t.indirection && t.indirection.length > 0)
          throw new M(
            { ResTarget: t },
            "Indirections are not supported in SQLite",
          );
        let r = [];
        return (
          n.update && t.name
            ? (r.push(this.quoteIfNeeded(t.name)),
              r.push("="),
              t.val && r.push(this.deparse(t.val, n)))
            : n.insertColumns && t.name
              ? r.push(this.quoteIfNeeded(t.name))
              : (t.val && r.push(this.deparse(t.val, n)),
                t.name && r.push(this.Alias({ aliasname: t.name }, n))),
          r.join(" ")
        );
      }
      A_Expr(t, n) {
        if (
          t.kind === "AEXPR_OP_ANY" &&
          (t.name?.[0]?.String?.sval || t.name?.[0]?.String?.str) === "=" &&
          t.lexpr &&
          t.rexpr &&
          "A_ArrayExpr" in t.rexpr
        ) {
          let s = mt(t.rexpr.A_ArrayExpr.elements),
            i = this.tryFoldConstArrayElements(s, n);
          if (i !== void 0)
            return `${this.visit(t.lexpr, n)} IN (${i.join(", ")})`;
        }
        if (["AEXPR_OP_ALL", "AEXPR_OP_ANY"].includes(t.kind))
          throw new M(
            { A_Expr: t },
            "ALL/ANY/SOME comparison operators are not supported. Use NOT EXISTS or IN instead",
          );
        if (t.name && t.name.length > 0) {
          if (t.name.length > 1)
            throw new M(
              { A_Expr: t },
              "Schema-qualified OPERATOR() syntax is not supported in SQLite",
            );
          let r = t.name[0]?.String?.sval || t.name[0]?.String?.str;
          if (r) {
            if (!t.lexpr || !t.rexpr)
              throw new M(
                { A_Expr: t },
                "A_Expr missing left or right expression",
              );
            if (!Tm.includes(r.toUpperCase()))
              throw new M(
                { A_Expr: t },
                `Operator "${r}" is not supported in SQLite`,
              );
            if (r === "~~" || r === "~~*") {
              let s = this.visit(t.lexpr, n),
                i = this.visit(t.rexpr, n);
              return `${s} LIKE ${i}`;
            }
            if (r === "!~~" || r === "!~~*") {
              let s = this.visit(t.lexpr, n),
                i = this.visit(t.rexpr, n);
              return `${s} NOT LIKE ${i}`;
            }
            if (r === "~" || r === "~*") {
              let s = this.visit(t.lexpr, n),
                i = this.visit(t.rexpr, n);
              return `${s} GLOB ${i}`;
            }
          }
        }
        return super.A_Expr(t, n);
      }
      IndexStmt(t, n) {
        let r = ["CREATE"];
        if (
          (t.unique && r.push("UNIQUE"),
          r.push("INDEX"),
          t.if_not_exists && r.push("IF NOT EXISTS"),
          !t.relation)
        )
          throw new Error("CREATE INDEX has no relation");
        let s = t.idxname;
        if (!s) {
          let a = (t.indexParams ?? []).map((p) =>
              "IndexElem" in p
                ? p.IndexElem.name
                  ? p.IndexElem.name
                  : (Zd(p.IndexElem.expr) ?? "expr")
                : "expr",
            ),
            l = `${t.relation.relname}_${a.join("_")}_idx`;
          s = l;
          let c = 0;
          for (; this.relationNames.has(this.sqliteIndexName(t.relation, s)); )
            s = `${l}${++c}`;
        }
        let i = this.sqliteIndexName(t.relation, s);
        (this.relationNames.add(i),
          r.push(this.quoteIfNeeded(i)),
          r.push("ON"),
          r.push(this.RangeVar(t.relation, n)));
        let o = (t.indexParams ?? [])
          .map((a) =>
            "IndexElem" in a
              ? this.IndexElem(a.IndexElem, n)
              : this.visit(a, n),
          )
          .filter(Boolean);
        return (r.push(`(${o.join(", ")})`), r.join(" "));
      }
      IndexElem(t, n) {
        let r = [];
        return (
          t.name
            ? r.push(ui(t.name))
            : t.expr && r.push(`(${this.visit(t.expr, n)})`),
          t.ordering === "SORTBY_ASC" && r.push("ASC"),
          t.ordering === "SORTBY_DESC" && r.push("DESC"),
          t.nulls_ordering === "SORTBY_NULLS_FIRST" && r.push("NULLS FIRST"),
          t.nulls_ordering === "SORTBY_NULLS_LAST" && r.push("NULLS LAST"),
          r.join(" ")
        );
      }
      constFoldCategory(t) {
        if (!t?.names || (t.arrayBounds && t.arrayBounds.length > 0))
          return null;
        let n = t.names
          .map((c) => c.String?.sval || c.String?.str)
          .filter(Boolean);
        if (n.length === 0) return null;
        let r = n.length === 2 && n[0] === "pg_catalog" ? n[1] : n.join("."),
          s = r.toLowerCase().trim();
        return Be(this.enums, r)
          ? "text"
          : new Set(["bool", "boolean"]).has(s)
            ? "boolean"
            : new Set([
                  "int2",
                  "smallint",
                  "int4",
                  "integer",
                  "int",
                  "int8",
                  "bigint",
                  "serial",
                  "serial4",
                  "bigserial",
                  "serial8",
                  "smallserial",
                  "serial2",
                ]).has(s)
              ? "integer"
              : new Set([
                    "float4",
                    "real",
                    "float8",
                    "double precision",
                    "numeric",
                    "decimal",
                  ]).has(s)
                ? "real"
                : new Set([
                      "text",
                      "varchar",
                      "character varying",
                      "char",
                      "character",
                      "bpchar",
                      "name",
                      "uuid",
                    ]).has(s)
                  ? "text"
                  : null;
      }
      isFoldableCast(t, n) {
        if (t.isnull) return true;
        let r = this.constFoldCategory(n);
        return r
          ? "sval" in t
            ? r === "text"
            : "ival" in t
              ? r === "integer"
              : "fval" in t
                ? r === "real"
                : "boolval" in t
                  ? r === "boolean"
                  : false
          : false;
      }
      findUnderlyingConst(t) {
        let n = t;
        for (; "TypeCast" in n; ) {
          let r = n.TypeCast;
          if (!r.arg) return null;
          n = r.arg;
        }
        return "A_Const" in n ? n.A_Const : null;
      }
      unwrapConstCast(t) {
        let n = t;
        for (; "TypeCast" in n; ) {
          let r = n.TypeCast;
          if (
            (r.typeName?.arrayBounds && r.typeName.arrayBounds.length > 0) ||
            !r.arg
          )
            break;
          if ("A_Const" in r.arg) {
            if (!this.isFoldableCast(r.arg.A_Const, r.typeName)) break;
            n = r.arg;
            continue;
          }
          if ("TypeCast" in r.arg) {
            let s = this.findUnderlyingConst(r.arg);
            if (!s || !this.isFoldableCast(s, r.typeName)) break;
            n = r.arg;
            continue;
          }
          break;
        }
        return n;
      }
      tryFoldConstArrayElements(t, n) {
        let r = [];
        for (let s of t) {
          let i = this.unwrapConstCast(s);
          if ("A_Const" in i) {
            r.push(this.visit(i, n));
            continue;
          }
          if (this.findUnderlyingConst(s) === null) return;
          r.push(this.visit(i, n));
        }
        return r;
      }
      TypeCast(t, n) {
        if (!t.arg || !t.typeName) return super.TypeCast(t, n);
        if (
          [...this.helper.walk(t)].filter(({ node: o }) => "A_Star" in o)
            .length > 0
        )
          throw new M(
            { TypeCast: t },
            "A.* in type casts are not supported in SQLite",
          );
        if (t.typeName.arrayBounds && t.typeName.arrayBounds.length > 0) {
          if ("A_Const" in t.arg && t.arg.A_Const.sval) {
            let o = t.arg.A_Const.sval.sval;
            if (o.startsWith("{") && o.endsWith("}")) {
              let a =
                  t.typeName.names
                    ?.map((u) => u.String?.sval)
                    .filter(Boolean) ?? [],
                l = a.length === 2 && a[0] === "pg_catalog" ? a[1] : a[0],
                p = [
                  "text",
                  "varchar",
                  "character varying",
                  "char",
                  "bpchar",
                  "name",
                  "uuid",
                ].includes(l?.toLowerCase());
              try {
                let u = this.parsePgArrayLiteral(o, p);
                return `'${JSON.stringify(u).replace(/'/g, "''")}'`;
              } catch {}
            }
          }
          return this.visit(t.arg, n);
        }
        let s = this.visit(t.arg, n),
          i = this.TypeName(t.typeName, n);
        return `CAST(${s} AS ${i})`;
      }
      A_ArrayExpr(t, n) {
        let r = mt(t.elements),
          s = this.tryExtractStaticArray(r);
        return s !== void 0
          ? `'${JSON.stringify(s).replace(/'/g, "''")}'`
          : `json_array(${r.map((o) => this.visit(o, n)).join(", ")})`;
      }
      tryExtractStaticArray(t) {
        let n = [];
        for (let r of t)
          if ("A_ArrayExpr" in r) {
            let s = mt(r.A_ArrayExpr.elements),
              i = this.tryExtractStaticArray(s);
            if (i === void 0) return;
            n.push(i);
          } else if ("A_Const" in r) {
            let s = r.A_Const;
            if (s.isnull) n.push(null);
            else if (s.ival) n.push(s.ival.ival);
            else if (s.fval) n.push(parseFloat(s.fval.fval));
            else if (s.sval) n.push(s.sval.sval);
            else if ("boolval" in s) n.push(s.boolval.boolval === true);
            else return;
          } else return;
        return n;
      }
      parsePgArrayLiteral(t, n) {
        if (!t.startsWith("{") || !t.endsWith("}"))
          throw new Error("Not a PG array literal");
        let r = t.slice(1, -1);
        if (r.length === 0) return [];
        let s = [],
          i = 0;
        for (; i < r.length; )
          if (r[i] === "{") {
            let o = 0,
              a = i;
            for (; a < r.length; ) {
              if (r[a] === "{") o++;
              else if (r[a] === "}" && (o--, o === 0)) break;
              a++;
            }
            (s.push(this.parsePgArrayLiteral(r.slice(i, a + 1), n)),
              (i = a + 1),
              r[i] === "," && i++);
          } else if (r[i] === '"') {
            let o = i + 1,
              a = "";
            for (; o < r.length && r[o] !== '"'; )
              (r[o] === "\\" && o++, (a += r[o]), o++);
            (s.push(a), (i = o + 1), r[i] === "," && i++);
          } else {
            let o = i;
            for (; o < r.length && r[o] !== "," && r[o] !== "}"; ) o++;
            if (o === i) throw new Error("Malformed PG array literal");
            let a = r.slice(i, o);
            if (a === "NULL") s.push(null);
            else if (n) s.push(a);
            else {
              let l = Number(a);
              s.push(isNaN(l) ? a : l);
            }
            ((i = o), r[i] === "," && i++);
          }
        return s;
      }
      BetweenExpr(t, n) {
        return super.A_Expr(t, n);
      }
      AlterTableStmt(t, n) {
        let r = t.cmds ?? [],
          s = [
            "AT_EnableRowSecurity",
            "AT_DisableRowSecurity",
            "AT_ForceRowSecurity",
            "AT_NoForceRowSecurity",
            "AT_ChangeOwner",
          ],
          i = r.filter(
            (p) => "AlterTableCmd" in p && !s.includes(p.AlterTableCmd.subtype),
          );
        if (i.length === 0) return "";
        if (
          !["OBJECT_TABLE", "OBJECT_INDEX", "OBJECT_VIEW"].includes(t.objtype)
        )
          throw new M(
            { AlterTableStmt: t },
            `AlterTableStmt with objtype ${t.objtype} is not supported`,
          );
        let o = ["AT_AddColumn", "AT_DropColumn"],
          a = [
            "AT_AlterColumnType",
            "AT_SetNotNull",
            "AT_DropNotNull",
            "AT_ColumnDefault",
            "AT_AddConstraint",
            "AT_DropConstraint",
          ],
          l = [],
          c = [];
        for (let p of i) {
          let u = p.AlterTableCmd.subtype;
          if (o.includes(u)) {
            let f = { ...t, cmds: [p] };
            l.push(super.AlterTableStmt(f, n));
          } else if (a.includes(u)) c.push(p.AlterTableCmd);
          else
            throw new M(
              { AlterTableStmt: t },
              `AlterTableCmd with subtype ${u} is not supported in SQLite`,
            );
        }
        if (c.length > 0) {
          let p = this.getRelationName(t.relation);
          l.push(this.generateRebuildSql(p, c));
        }
        return l.join(`;
`);
      }
      AlterTableCmd(t, n) {
        if (!["AT_AddColumn", "AT_DropColumn"].includes(t.subtype))
          throw new M(
            { AlterTableCmd: t },
            `AlterTableCmd with subtype ${t.subtype} is not supported`,
          );
        if (t.subtype === "AT_AddColumn" && t.def && "ColumnDef" in t.def) {
          let s = this.ColumnDef(t.def.ColumnDef, n),
            i = n.objtype === "OBJECT_TYPE" ? "ADD ATTRIBUTE" : "ADD COLUMN",
            o = t.missing_ok ? " IF NOT EXISTS" : "";
          return `${i}${o} ${s}`;
        }
        return t.subtype === "AT_DropColumn" && t.behavior
          ? super.AlterTableCmd({ ...t, behavior: void 0 }, n)
          : super.AlterTableCmd(t, n);
      }
      DefineStmt(t, n) {
        if (t.kind === "OBJECT_AGGREGATE")
          throw new Error("AGGREGATE definitions are not supported in SQLite");
        return super.DefineStmt(t, n);
      }
      InsertStmt(t, n) {
        if ("selectStmt" in t) {
          let s = (t.selectStmt?.SelectStmt?.valuesLists ?? []).map((i) =>
            i.List?.items?.map((o) => "SetToDefault" in o),
          );
          if (s.length === 1 && s[0]?.every((i) => i === true))
            return super.InsertStmt(
              { ...t, selectStmt: void 0, cols: void 0 },
              n,
            );
          if (s.some((i) => i.some((o) => o === true)))
            throw new M(
              { InsertStmt: t },
              "Insert with partial DEFAULT values is not supported",
            );
        }
        return super.InsertStmt(t, n);
      }
      SelectStmt(t, n) {
        if (this.helper.hasUnsafeStar())
          throw new M(
            { SelectStmt: t },
            "Row-wise comparison using .* is not supported in SQLite. Expand to explicit per-column comparisons instead.",
          );
        if (t.intoClause)
          throw new M(
            { SelectStmt: t },
            "SELECT ... INTO clause is not supported in SQLite",
          );
        if (t.distinctClause) {
          let s = mt(t.distinctClause);
          if (s.length > 0 && Object.keys(s[0]).length > 0)
            throw new M(
              { SelectStmt: t },
              "DISTINCT ON clause is not supported in SQLite. Use window functions instead.",
            );
        }
        if (t.limitOffset && !t.limitCount)
          throw new M(
            { SelectStmt: t },
            "OFFSET without LIMIT is not supported in SQLite",
          );
        let r = super.SelectStmt(t, n);
        if (/^SELECT\s+FROM/.test(r))
          throw new M(
            { SelectStmt: t },
            "SELECT without a target list is not supported in SQLite",
          );
        return r;
      }
      JoinExpr(t, n) {
        return (t.alias && this.Alias(t.alias, n), super.JoinExpr(t, n));
      }
      A_Const(t, n) {
        if (t.bsval !== void 0)
          throw new M(
            { A_Const: t },
            "Bit string literals are not supported in SQLite",
          );
        let r = super.A_Const(t, n);
        return typeof r == "string" && r.startsWith("E'")
          ? r.substring(2, r.length - 1)
          : r;
      }
      SortBy(t, n) {
        if (t.sortby_dir === "SORTBY_USING") {
          let r = mt(t.useOp),
            s = r[0]?.String?.sval;
          if (r.length > 1 || !["<", ">"].includes(s ?? ""))
            throw new M(
              { SortBy: t },
              "Only `USING <` or `USING >` are supported.",
            );
          ((t.sortby_dir = s === "<" ? "SORTBY_DESC" : "SORTBY_ASC"),
            (t.useOp = void 0));
        }
        return super.SortBy(t, n);
      }
      RangeSubselect(t, n) {
        if (t.lateral)
          throw new M(
            { RangeSubselect: t },
            "LATERAL subqueries are not supported in SQLite",
          );
        return super.RangeSubselect(t, n);
      }
      SubLink(t, n) {
        if (["ANY_SUBLINK", "ALL_SUBLINK"].includes(t.subLinkType))
          throw new M(
            { SubLink: t },
            "ANY/ALL/SOME subqueries are not supported. Use NOT EXISTS or IN instead",
          );
        if (t.subLinkType === "ARRAY_SUBLINK")
          throw new M(
            { SubLink: t },
            "ARRAY subqueries are not supported in SQLite",
          );
        return super.SubLink(t, n);
      }
      LockingClause(t, n) {
        return "";
      }
      UpdateStmt(t, n) {
        if (n.parentNodeTypes.includes("SelectStmt"))
          throw new M(
            { UpdateStmt: t },
            "UPDATE ... FROM (SELECT ...) is not supported in SQLite",
          );
        return super.UpdateStmt(t, n);
      }
      Alias(t, n) {
        if (t.colnames && t.colnames.length > 0)
          throw new M(
            { Alias: t },
            "Aliasing with column names is not supported in SQLite",
          );
        return `AS "${t.aliasname}"`;
      }
      CreateFunctionStmt(t, n) {
        let r = t.options ?? [],
          s = t.funcname
            ?.map((p) => p.String?.sval)
            .filter(Boolean)
            .join(".");
        if (
          s &&
          new Set([
            "storage.foldername",
            "storage.filename",
            "storage.extension",
            "storage.operation",
            "storage.allow_only_operation",
            "storage.allow_any_operation",
          ]).has(s)
        )
          return "";
        let i = t.returnType?.names
            ?.map((p) => p.String?.sval)
            .filter(Boolean)
            .join("."),
          o = r.find((p) => p.DefElem?.defname === "language")?.DefElem?.arg
            ?.String?.sval;
        if (i !== "trigger" || o !== "plpgsql")
          throw new M(
            { CreateFunctionStmt: t },
            "Only trigger functions with LANGUAGE plpgsql are supported",
          );
        let a = this.triggerFunctionKey(t.funcname);
        if (!a) throw new Error("Function has no name");
        let l = r.find((p) => p.DefElem?.defname === "as")?.DefElem?.arg?.List
          ?.items?.[0]?.String?.sval;
        if (!l) throw new Error("Function has no body");
        let c = this.plpgsqlParser.parse(l);
        return (this.triggerFunctions.set(a, c), "");
      }
      CreateTrigStmt(t, n) {
        let r = t.trigname,
          s = this.sqliteTriggerName(this.getRelationName(t.relation), r),
          i = this.RangeVar(t.relation, n),
          o = this.triggerFunctionKey(t.funcname);
        if (!o) throw new Error(`Trigger "${r}" has no function reference`);
        let a = this.triggerFunctions.get(o);
        if (!a)
          throw new M(
            { CreateTrigStmt: t },
            `Trigger "${r}" references unknown function "${o}"`,
          );
        let l =
            t.timing === 2
              ? "BEFORE"
              : t.timing === 64
                ? "INSTEAD OF"
                : "AFTER",
          c = [];
        if (
          (t.events & 4 && c.push("INSERT"),
          t.events & 8 && c.push("DELETE"),
          t.events & 16)
        )
          if (t.columns?.length) {
            let f = t.columns.map((h) => h.String?.sval).filter(Boolean);
            c.push(`UPDATE OF ${f.join(", ")}`);
          } else c.push("UPDATE");
        let p = c.join(" OR "),
          u = this.buildTriggerBody(a, i, n);
        return [
          `CREATE TRIGGER ${s}`,
          `${l} ${p} ON ${i}`,
          "FOR EACH ROW",
          "BEGIN",
          ...u.map((f) => `  ${f};`),
          "END",
        ].join(`
`);
      }
      buildTriggerBody(t, n, r) {
        let s = [],
          i = [];
        for (let o of t.statements)
          if (o.type !== "return") {
            if (o.type === "assignment") {
              i.push(o);
              continue;
            }
            (i.length > 0 &&
              (s.push(this.buildAssignmentUpdate(i, n, r)), (i.length = 0)),
              o.type === "dml" && s.push(this.translateDml(o.sql, r)));
          }
        return (i.length > 0 && s.push(this.buildAssignmentUpdate(i, n, r)), s);
      }
      buildAssignmentUpdate(t, n, r) {
        let s = t.map((i) => {
          let o = this.translateExpression(i.expression, r);
          return `${i.column} = ${o}`;
        });
        return `UPDATE ${n} SET ${s.join(", ")} WHERE rowid = NEW.rowid`;
      }
      translateExpression(t, n) {
        try {
          let r = `SELECT ${t}`,
            s = t.trim().toLowerCase();
          return s === "now()" || s === "current_timestamp"
            ? "datetime('now')"
            : t;
        } catch {
          return t;
        }
      }
      flattenTriggerTableRef(t, n) {
        return this.quoteBareIfNeeded(Ke(t, n));
      }
      translateDml(t, n) {
        let r =
          /^(\s*)(insert\s+into|update|delete\s+from)\s+(?:"([^"]+)"|(\w+))\s*\.\s*(?:"([^"]+)"|(\w+))/i;
        return (
          (t = t.replace(
            r,
            (s, i, o, a, l, c, p) =>
              `${i}${o} ${this.flattenTriggerTableRef(a ?? l, c ?? p)}`,
          )),
          t
            .replace(/\bnow\(\)/gi, "datetime('now')")
            .replace(/\bcurrent_timestamp\b/gi, "datetime('now')")
            .replace(/\bgen_random_uuid\(\)/gi, this.uuidExpression())
            .replace(/\buuid_generate_v4\(\)/gi, this.uuidExpression())
        );
      }
      uuidExpression() {
        return "lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))";
      }
      NullTest(t, n) {
        if (t.arg?.ColumnRef?.fields?.length > 1)
          throw new M(
            { NullTest: t },
            "row-level NULL tests are not supported in SQLite",
          );
        return super.NullTest(t, n);
      }
      RenameStmt(t, n) {
        if (!t.renameType) throw new Error("RenameStmt requires renameType");
        if (t.renameType === "OBJECT_POLICY") return "";
        let r = ["OBJECT_TABLE", "OBJECT_VIEW", "OBJECT_COLUMN"];
        if (
          t.renameType === "OBJECT_COLUMN" &&
          (t.relationType === "OBJECT_FOREIGN_TABLE" ||
            t.relationType === "OBJECT_VIEW")
        )
          throw new M(
            { RenameStmt: t },
            `RenameStmt with relationType ${t.relationType} is not supported`,
          );
        if (!r.includes(t.renameType))
          throw new M(
            { RenameStmt: t },
            `RenameStmt with renameType ${t.renameType} is not supported in SQLite`,
          );
        return super.RenameStmt(t, n);
      }
      DropStmt(t, n) {
        let r = t.removeType;
        if (r === "OBJECT_EXTENSION") {
          let o = t.objects?.map(Qd) ?? [];
          if (o.length > 0 && o.every((a) => a && Sc.has(a))) return "";
          throw new M(
            { DropStmt: t },
            "DROP EXTENSION is not supported in SQLite",
          );
        }
        if (r === "OBJECT_TRIGGER") {
          this.foldDropObjectSchemas(t);
          let [o, a] = Q(mt(t.objects?.[0]));
          if (!o || !a) throw new Error("DROP TRIGGER has no trigger target");
          return `DROP TRIGGER${t.missing_ok ? " IF EXISTS" : ""} ${this.sqliteTriggerName(o, a)}`;
        }
        if (["OBJECT_TABLE", "OBJECT_VIEW", "OBJECT_INDEX"].includes(r))
          return (this.foldDropObjectSchemas(t), super.DropStmt(t, n));
        if (["OBJECT_POLICY"].includes(r)) return "";
        throw new M(
          { DropStmt: t },
          `DROP with removeType ${r} is not supported in SQLite`,
        );
      }
      foldDropObjectSchemas(t) {
        let n = t.removeType === "OBJECT_TRIGGER" ? 3 : 2;
        for (let r of t.objects ?? []) {
          let s = r?.List?.items;
          if (!Array.isArray(s) || s.length !== n) continue;
          let i = s[0]?.String?.sval,
            o = s[1]?.String?.sval;
          if (typeof i != "string" || typeof o != "string") continue;
          let a = Ke(i, o);
          s.splice(0, 2, { String: { sval: a } });
        }
      }
      generateRebuildSql(t, n) {
        if (!this.introspection)
          throw new Error(
            `ALTER TABLE on "${t}" requires 12-step rebuild but no introspection was provided. Pass introspection in DeparseOptions to enable column type changes, NOT NULL, defaults, and constraint modifications.`,
          );
        let r = this.buildDesiredSchema(this.introspection, t, n),
          s = new tr(),
          i = new nr(),
          o = s.diff(this.introspection, r);
        return o.has_changes
          ? i
              .plan(o, this.introspection, r)
              .steps.filter(
                (l) =>
                  ![
                    "disable_foreign_keys",
                    "begin_transaction",
                    "commit_transaction",
                    "enable_foreign_keys",
                  ].includes(l.type),
              )
              .map((l) => l.sql).join(`
`)
          : "";
      }
      buildDesiredSchema(t, n, r) {
        let s = {
          ...t,
          tables: t.tables.map((i) => ({ ...i })),
          columns: t.columns.map((i) => ({ ...i })),
          indexes: t.indexes.map((i) => ({ ...i })),
          foreign_keys: t.foreign_keys.map((i) => ({ ...i })),
          primary_keys: t.primary_keys.map((i) => ({ ...i })),
          views: t.views.map((i) => ({ ...i })),
          triggers: (t.triggers ?? []).map((i) => ({ ...i })),
          check_constraints: t.check_constraints.map((i) => ({ ...i })),
          unique_constraints: (t.unique_constraints ?? []).map((i) => ({
            ...i,
          })),
          comments: (t.comments ?? []).map((i) => ({ ...i })),
          custom_types: t.custom_types.map((i) => ({ ...i })),
        };
        for (let i of r) {
          let o = s.columns.findIndex(
            (a) => a.table === n && a.name === i.name,
          );
          switch (i.subtype) {
            case "AT_AlterColumnType": {
              if (o === -1) break;
              let a = this.extractTypeName(i);
              a && (s.columns[o] = { ...s.columns[o], type: a.toLowerCase() });
              break;
            }
            case "AT_SetNotNull": {
              if (o === -1) break;
              s.columns[o] = { ...s.columns[o], nullable: false };
              break;
            }
            case "AT_DropNotNull": {
              if (o === -1) break;
              s.columns[o] = { ...s.columns[o], nullable: true };
              break;
            }
            case "AT_ColumnDefault": {
              if (o === -1) break;
              if (i.def) {
                let a = this.extractDefaultValue(i);
                s.columns[o] = { ...s.columns[o], default_value: a };
              } else s.columns[o] = { ...s.columns[o], default_value: null };
              break;
            }
            case "AT_AddConstraint":
            case "AT_DropConstraint": {
              let a = s.tables.findIndex((l) => l.name === n);
              a !== -1 &&
                (s.tables[a] = {
                  ...s.tables[a],
                  sql: s.tables[a].sql + " /* modified */",
                });
              break;
            }
          }
        }
        return (this.rebuildTableSql(s, n), s);
      }
      rebuildTableSql(t, n) {
        let r = t.tables.findIndex((u) => u.name === n);
        if (r === -1) return;
        let s = t.columns.filter((u) => u.table === n),
          i = t.foreign_keys.filter((u) => u.table === n),
          o = t.check_constraints.filter((u) => u.table === n),
          a = s.map((u) => {
            let f = `${B(u.name)} ${u.type || "TEXT"}`;
            return (
              u.is_primary_key && (f += " PRIMARY KEY"),
              u.nullable || (f += " NOT NULL"),
              u.default_value != null && (f += ` DEFAULT ${u.default_value}`),
              f
            );
          }),
          l = i.map(
            (u) =>
              `FOREIGN KEY (${B(u.column)}) REFERENCES ${B(u.ref_table)}(${B(u.ref_column)}) ON UPDATE ${u.on_update} ON DELETE ${u.on_delete}`,
          ),
          c = o.map((u) => `CHECK (${u.expression})`),
          p = [...a, ...l, ...c];
        t.tables[r] = {
          ...t.tables[r],
          sql: `CREATE TABLE ${B(n)} (${p.join(", ")}) STRICT`,
        };
      }
      extractTypeName(t) {
        let n = t.def?.ColumnDef,
          r = n?.typeName?.TypeName ?? n?.typeName;
        return r
          ? ((r.names ?? [])
              .map((i) => i.String?.sval)
              .filter(Boolean)
              .pop() ?? null)
          : null;
      }
      extractDefaultValue(t) {
        if (!t.def) return null;
        let n = this.unwrapConstCast(t.def);
        if ("A_Const" in n) {
          let r = n.A_Const;
          return r.isnull
            ? null
            : r.ival
              ? String(r.ival.ival ?? 0)
              : r.fval
                ? r.fval.fval
                : r.sval
                  ? `'${String(r.sval.sval).replace(/'/g, "''")}'`
                  : "boolval" in r
                    ? r.boolval.boolval
                      ? "1"
                      : "0"
                    : null;
        }
        return "Integer" in n
          ? String(n.Integer.ival)
          : "Float" in n
            ? n.Float.fval
            : "String" in n
              ? `'${n.String.sval}'`
              : null;
      }
    };
  });
function th(e) {
  return `${e?.schemaname ?? "public"}.${e?.relname ?? ""}`;
}
function zx(e) {
  let t = e?.Constraint;
  if (!t || t.contype !== "CONSTR_DEFAULT") return false;
  let n = t.raw_expr?.FuncCall?.funcname;
  if (!Array.isArray(n)) return false;
  let r = n.map((s) => s.String?.sval ?? s.String?.str).filter(Boolean);
  return r[r.length - 1]?.toLowerCase() === "nextval";
}
function Xx(e) {
  return (Array.isArray(e.constraints) ? e.constraints : []).some(
    (n) => n.Constraint?.contype === "CONSTR_IDENTITY",
  );
}
function nh(e, t) {
  let n = Array.isArray(e.constraints) ? e.constraints : [],
    r = n.filter((s) => !zx(s));
  r.length !== n.length ? ((e.constraints = r), t.add(e)) : Xx(e) && t.add(e);
}
function Jx(e, t) {
  let n = t?.Constraint;
  if (!n) return false;
  let r = n.contype;
  if (r !== "CONSTR_PRIMARY" && r !== "CONSTR_UNIQUE" && r !== "CONSTR_FOREIGN")
    return false;
  let s = e.tableElts ?? [];
  return (
    (r === "CONSTR_PRIMARY" && rh(e, n)) ||
      (r === "CONSTR_FOREIGN" && sh(e, n)) ||
      (s.push(t), (e.tableElts = s)),
    true
  );
}
function rh(e, t) {
  let n = (t.keys ?? [])
    .map((i) => i.String?.sval ?? i.String?.str)
    .filter(Boolean);
  if (n.length !== 1) return false;
  let r = (e.tableElts ?? []).find(
    (i) => "ColumnDef" in i && i.ColumnDef.colname === n[0],
  );
  if (!r) return false;
  let s = Array.isArray(r.ColumnDef.constraints) ? r.ColumnDef.constraints : [];
  return (
    (r.ColumnDef.constraints = [
      ...s.filter((i) => i.Constraint?.contype !== "CONSTR_NOTNULL"),
      { Constraint: { contype: "CONSTR_PRIMARY" } },
    ]),
    true
  );
}
function sh(e, t) {
  let n = (t.fk_attrs ?? [])
    .map((i) => i.String?.sval ?? i.String?.str)
    .filter(Boolean);
  if (n.length !== 1) return false;
  let r = (e.tableElts ?? []).find(
    (i) => "ColumnDef" in i && i.ColumnDef.colname === n[0],
  );
  if (!r) return false;
  let s = Array.isArray(r.ColumnDef.constraints) ? r.ColumnDef.constraints : [];
  return ((r.ColumnDef.constraints = [...s, { Constraint: t }]), true);
}
function Yx(e) {
  let t = e.tableElts ?? [],
    n = t.filter((r) => {
      let s = r?.Constraint;
      return !s || s.contype !== "CONSTR_PRIMARY" ? true : !rh(e, s);
    });
  n.length !== t.length && (e.tableElts = n);
}
function Qx(e) {
  let t = e.tableElts ?? [],
    n = t.filter((r) => {
      let s = r?.Constraint;
      return !s || s.contype !== "CONSTR_FOREIGN" ? true : !sh(e, s);
    });
  n.length !== t.length && (e.tableElts = n);
}
function ih(e) {
  let t = new WeakSet(),
    n = new Map();
  for (let r of e.stmts ?? []) {
    let s = r.stmt;
    if (!s || !("CreateStmt" in s)) continue;
    let i = s.CreateStmt;
    n.set(th(i.relation), i);
    for (let o of i.tableElts ?? []) "ColumnDef" in o && nh(o.ColumnDef, t);
    (Yx(i), Qx(i));
  }
  for (let r of e.stmts ?? []) {
    let s = r.stmt;
    if (!s || !("AlterTableStmt" in s)) continue;
    let i = s.AlterTableStmt,
      o = n.get(th(i.relation)),
      a = i.cmds ?? [],
      l = [];
    for (let c of a) {
      let p = c.AlterTableCmd;
      (p?.subtype === "AT_AddColumn" &&
        p.def &&
        "ColumnDef" in p.def &&
        nh(p.def.ColumnDef, t),
        !(o && p?.subtype === "AT_AddConstraint" && p.def && Jx(o, p.def)) &&
          l.push(c));
    }
    i.cmds = l;
  }
  return t;
}
var oh = b(() => {});
async function ah(e, t = {}) {
  let n = await Ki(e);
  return { ast: n, ...Zx(n, t) };
}
function Zx(e, t = {}) {
  let n = ih(e),
    r = Pl(e),
    s = Ir(e, r, n),
    i = Nl(e),
    o = Ll(e),
    a = Il(e),
    l = new Ji(e, { ...t, enums: r, serialColumns: n }),
    { policies: c, tables: p } = Ol(e, { validateMutations: t.strict });
  if (t.strict) {
    for (let u of c)
      if (!s.get(`${u.data.schema ?? "public"}.${u.data.table}`))
        throw new Error(
          `Policy "${u.data.name}" references unknown table "${u.data.table}"`,
        );
  }
  return {
    ddl: l.deparseQuery(),
    enums: r,
    rls: { tables: p, policies: c },
    schema: s,
    vars: i,
    tableConstraints: o,
    comments: a,
  };
}
var Ec = b(() => {
  Xd();
  eh();
  oh();
  ul();
  _i();
  pl();
});
async function lh(e) {
  if (e.trim())
    try {
      await Ki(e);
    } catch (t) {
      let n = t instanceof Error ? t.message : String(t);
      throw new xc(
        `Declarative schema (schemas/*.sql) is not valid SQL: ${n}`,
        { cause: t },
      );
    }
}
async function _c(e, t, n, r) {
  if (t.trim())
    try {
      let s = t;
      if (n === "postgres") {
        let i = await e.translateDdl(t);
        s = typeof i == "string" ? i : (i.ddl ?? "");
      }
      for (let i of nt(s))
        if (i.trim())
          try {
            await e.exec(i);
          } catch (o) {
            if (!r) throw o;
          }
    } catch (s) {
      if (!r) throw s;
    }
}
async function ch(e, t) {
  if (!t.trim()) return;
  let n = ge(e.connection);
  if (n === "pg") return;
  let r = n === "sqlite" ? "sqlite" : "postgres",
    s = await createConnection({
      url: ":memory:",
      ddlDialect: r,
      translation: e.connection.config.translation,
    });
  try {
    let i = e.connection.config.baseSchema;
    i && (await _c(s, i, r, !0));
    for (let o of await Oe(e)) await _c(s, o.sql, r, !0);
    await _c(s, t, r, !1);
  } finally {
    await s.close().catch(() => {});
  }
}
var xc,
  uh = b(() => {
    Ec();
    _t();
    $t();
    rt();
    xc = class extends Error {
      constructor(t, n) {
        (super(t, n), (this.name = "SchemaParseError"));
      }
    };
  });
function Yi(e) {
  if (e.disabled) {
    console.log(
      Kr.default.dim(
        "Skipping migrations because they are disabled in config.",
      ),
    );
    return;
  }
  if (e.applied.length === 0) {
    console.log(Kr.default.green("Remote database is up to date."));
    return;
  }
  for (let t of e.applied)
    console.log(Kr.default.green(`Applied migration ${t.filename}.`));
}
var Kr,
  wt,
  Qi = b(() => {
    Kr = z(J());
    $t();
    rt();
    wt = class {
      constructor(t, n) {
        this.api = t;
        this.configPath = n;
      }
      async requireLinkedProjectRef() {
        await this.api.requireSession();
        let t = this.api.project.local.ref();
        if (!t) throw new Error("No project linked. Run `lite link` first.");
        return t;
      }
      async planDatabasePush(t) {
        let n = await this.api.project.local.createApp(this.configPath);
        try {
          if (n.config.db?.migrations?.enabled === !1)
            return { disabled: !0, pending: [] };
          if (ge(n.connection) === "sqlite")
            throw new Error(
              '`lite db push` requires Postgres-format migrations in supabase/migrations; the bare "sqlite" driver is not portable to Supalite cloud.',
            );
          let r = await Oe(n);
          for (let i = 1; i < r.length; i++) {
            if (r[i].version !== r[i - 1].version) continue;
            let o = r[i].version,
              a = r
                .filter((l) => l.version === o)
                .map((l) => l.filename)
                .sort();
            throw new Error(
              `Duplicate local migration version ${o}: ${a.join(", ")}`,
            );
          }
          let s = await this.api.project.remote.listMigrations(t);
          return { disabled: !1, pending: this.findPendingMigrations(r, s) };
        } finally {
          await n.connection.close();
        }
      }
      async pushDatabase(t) {
        let n = await this.planDatabasePush(t),
          r = [];
        for (let s of n.pending)
          (console.log(Kr.default.dim(`Applying migration ${s.filename}...`)),
            await this.api.project.remote.applyMigration(t, {
              version: s.version,
              name: s.name,
              query: s.sql,
            }),
            r.push(s));
        return { ...n, applied: r };
      }
      async pushConfig(t) {
        let n = await this.api.project.local.createApp(this.configPath),
          r;
        try {
          r = n.getInfoJson();
        } finally {
          await n.connection.close();
        }
        let s = await this.api.project.remote.getConfig(t);
        return isEqual(this.comparableConfig(s), this.comparableConfig(r))
          ? { updated: false }
          : (await this.api.project.remote.setConfig(t, r), { updated: true });
      }
      async deploy(t) {
        let n = await this.pushDatabase(t),
          r = await this.pushConfig(t);
        return { database: n, config: r };
      }
      findPendingMigrations(t, n) {
        let r = [...t].sort((c, p) => c.version.localeCompare(p.version)),
          s = [...n].sort((c, p) => c.version.localeCompare(p.version)),
          i = [],
          o = [],
          a = 0,
          l = 0;
        for (; l < s.length && a < r.length; ) {
          let c = s[l].version,
            p = r[a];
          c === p.version
            ? (l++, a++)
            : c < p.version
              ? (i.push(c), l++)
              : (o.push(p), a++);
        }
        if (
          (a === r.length && i.push(...s.slice(l).map((c) => c.version)),
          i.length > 0)
        )
          throw new Error(
            `Remote migration versions not found in local migrations directory: ${i.join(", ")}`,
          );
        if (o.length > 0)
          throw new Error(
            `Found local migration files to be inserted before the last migration on remote database: ${o.map((c) => c.filename).join(", ")}`,
          );
        return r.slice(s.length);
      }
      comparableConfig(t) {
        let n = structuredClone(t),
          r = this.asRecord(n),
          s = this.asRecord(r?.connection);
        (delete s?.projectRef, delete s?.token, delete s?.host);
        let i = this.asRecord(r?.config),
          o = this.asRecord(i?.auth);
        o &&
          (delete o.publishable_key, delete o.secret_key, delete o.jwt_secret);
        let a = this.asRecord(i?.options),
          l = this.asRecord(a?.server);
        return (delete l?.admin, n);
      }
      asRecord(t) {
        if (!(!t || typeof t != "object" || Array.isArray(t))) return t;
      }
    };
  });
var mh = {};
pe(mh, { checkPendingDeclarativeSchema: () => fh, db: () => aT });
function iT() {
  (console.log(
    te.default.yellow(
      "Declarative diff includes potentially destructive changes.",
    ),
  ),
    console.log(
      te.default.dim(
        "Review the schema manually and author an explicit migration for drops or other data-loss changes.",
      ),
    ));
}
async function fh(e, t) {
  let n = await En(e);
  if (!n) return { hint: false, reason: "no-schemas" };
  try {
    let s = await e.connection.createMigrator(n).diff();
    return (
      typeof s.diff == "string" ? s.diff.trim().length > 0 : s.diff.has_changes
    )
      ? { hint: !0, reason: "pending" }
      : { hint: !1, reason: "in-sync" };
  } catch (r) {
    return {
      hint: false,
      reason: "diff-failed",
      error: r instanceof Error ? r.message : String(r),
    };
  }
}
async function ph(e) {
  let t = await yt(e),
    n = await En(t);
  if (!n && !t.connection.config.baseSchema) {
    console.log(te.default.dim("No schema files found."));
    return;
  }
  let s = await t.connection.createMigrator(n).diff();
  if (typeof s.diff != "string" && !s.diff.has_changes) {
    console.log(te.default.dim("Schema in sync."));
    return;
  }
  Ul(s);
}
async function oT(e, t) {
  if (t?.trim()) return t;
  if (!process.stdin.isTTY) {
    let s = await ls();
    if (s.trim()) return s;
  }
  let n = await En(e);
  if (n?.trim()) return n;
  let r = await Bl(e);
  if (r?.trim()) return r;
  throw new Error(
    "No SQL provided and no declarative schemas or migrations found to deparse.",
  );
}
var te,
  sT,
  aT,
  dh = b(() => {
    te = z(J());
    Ie();
    Wl();
    xi();
    fr();
    $t();
    zd();
    Se();
    tt();
    Lt();
    Ft();
    _t();
    Ai();
    xi();
    rt();
    uh();
    Vr();
    Nt();
    Ee();
    sr();
    Qi();
    sT = "Local Development:";
    aT = (e) => {
      let t = e.command("db").description("Database operations").helpGroup(sT);
      (is("cloud") &&
        t
          .command("push")
          .description(
            "Push pending migrations to the linked Supalite cloud project",
          )
          .option("--config <config>", "Path to the config file")
          .action(async (n) => {
            (console.log(),
              await X(async () => {
                await Y(n.config);
                let r = await V(),
                  s = new wt(r, n.config),
                  i = await s.requireLinkedProjectRef(),
                  o = await s.pushDatabase(i);
                Yi(o);
              }));
          }),
        t
          .command("diff")
          .description(
            "Diff current DB against schemas/*.sql; with -f, emit a pg migration file",
          )
          .option("--config <config>", "Path to the config file")
          .option(
            "-f, --file <name>",
            "Write the diff as a new migration file with this name",
          )
          .action(async (n) => {
            (console.log(),
              await X(async () => {
                if ((await Y(n.config), !n.file)) {
                  await ph(n.config);
                  return;
                }
                let r = await yt(n.config),
                  s = await En(r);
                if (!s.trim()) {
                  console.log(
                    te.default.dim(
                      "No declarative schemas found \u2014 nothing to diff.",
                    ),
                  );
                  return;
                }
                await lh(s);
                let i = ge(r.connection);
                if (i === "sqlite") {
                  (console.log(
                    te.default.yellow(
                      '`lite db diff -f` is not supported on the bare "sqlite" driver yet.',
                    ),
                  ),
                    console.log(
                      te.default.dim(
                        'Declarative schema diffs require the "sqlite-postgres" driver. Set db.driver = "sqlite-postgres" in supabase/config.toml.',
                      ),
                    ));
                  return;
                }
                let o;
                {
                  let u = await Bl(r);
                  try {
                    o = await Kd(u, s, r.connection.config.baseSchema ?? "");
                  } catch (f) {
                    throw f instanceof DataLossError
                      ? (iT(),
                        new Error(
                          "Declarative diff includes potentially destructive changes.",
                        ))
                      : f;
                  }
                  if (((o = o.filter((f) => f.trim())), o.length === 0)) {
                    console.log(
                      te.default.green(
                        "Schema in sync \u2014 no migration written.",
                      ),
                    );
                    return;
                  }
                }
                let a = o.join(`

`);
                try {
                  await ch(r, a);
                } catch (u) {
                  kd(u, { variant: i, failingSql: a });
                  let f = u instanceof Error ? u.message : String(u);
                  throw new Error(
                    `Generated migration does not run on the "${i}" backend and was not written: ${f}. This likely indicates a gap in supalite's Postgres\u2192SQLite translation; it has been reported.`,
                  );
                }
                let l = Fe__default.join(process.cwd(), "supabase", Xt(r));
                ve(l);
                let c = new Date(),
                  p = o.length > 1;
                for (let [u, f] of o.entries()) {
                  let h = ql(new Date(c.getTime() + u * 1e3)),
                    m = p ? `${n.file}_${u + 1}` : n.file,
                    d = Fe__default.join(l, Hl(m, h));
                  (await he__default.writeFile(
                    d,
                    f +
                      `
`,
                    { flag: "wx" },
                  ),
                    console.log(
                      te.default.green(" \u279C"),
                      "Wrote migration",
                      te.default.cyan(Fe__default.relative(process.cwd(), d)),
                    ));
                }
                o.length > 1 &&
                  console.log(
                    te.default.dim(
                      `Split into ${o.length} files: pg-delta requires a COMMIT between them.`,
                    ),
                  );
              }));
          }),
        t
          .command("reset")
          .description(
            de("Drop user objects, clear history, replay migrations + seed"),
          )
          .option("--config <config>", "Path to the config file")
          .option("--no-seed", "Skip running seed.sql after replay")
          .option(
            "--hard",
            "Delete and recreate the local DB file/dir instead of dropping objects via SQL",
            false,
          )
          .action(async (n) => {
            (console.log(),
              await X(async () => {
                if ((await Y(n.config), n.hard)) {
                  let l = await bs(n.config);
                  if (l) {
                    await he__default.rm(l, { recursive: !0, force: !0 });
                    for (let c of ["-wal", "-shm", "-journal"])
                      await he__default.rm(`${l}${c}`, { force: !0 });
                    console.log(
                      te.default.dim(
                        ` \u279C removed ${Fe__default.relative(process.cwd(), l)}`,
                      ),
                    );
                  } else
                    console.log(
                      te.default.dim(
                        "--hard: no local database file to delete; resetting via SQL.",
                      ),
                    );
                }
                let r = await yt(n.config),
                  s = r.connection.dialect === "postgres",
                  i = [];
                if (s) {
                  let { rows: l } = await r.connection
                    .exec(`SELECT nspname AS name FROM pg_namespace
                   WHERE nspname NOT LIKE 'pg\\_%' AND nspname <> 'information_schema'`);
                  for (let c of l)
                    i.push(
                      `DROP SCHEMA IF EXISTS "${c.name.replace(/"/g, '""')}" CASCADE`,
                    );
                  (i.push(
                    "CREATE SCHEMA IF NOT EXISTS public AUTHORIZATION pg_database_owner",
                  ),
                    i.push(
                      `COMMENT ON SCHEMA "public" IS 'standard public schema'`,
                    ),
                    i.push('GRANT USAGE ON SCHEMA "public" TO PUBLIC'));
                } else {
                  let c = (await r.connection.introspect()).tables.filter(
                      (u) => u.type === "table",
                    ),
                    p = (u, f) => `"${Ke(u, f).replace(/"/g, '""')}"`;
                  for (let u of c)
                    i.push(`DROP TABLE IF EXISTS ${p(u.schema, u.name)}`);
                  (i.push("DROP TABLE IF EXISTS migrations"),
                    i.push("DROP TABLE IF EXISTS seed_files"),
                    i.push(
                      'DROP TABLE IF EXISTS "supabase_migrations.schema_migrations"',
                    ),
                    i.push(
                      'DROP TABLE IF EXISTS "supabase_migrations.seed_files"',
                    ));
                }
                for (let l of i)
                  try {
                    await r.connection.exec(l);
                  } catch {}
                (await r.connection.clearSchemaCache(), await qm(), await kf());
                let o = await Jt(r);
                if (!(await fn(r)))
                  throw new Error(
                    "Applied migration metadata could not be rebuilt after reset.",
                  );
                for (let l of o.applied)
                  console.log(
                    te.default.green(" \u2713"),
                    "Applied",
                    te.default.cyan(l.filename),
                  );
                let a = await fh(r, o.applied.length);
                (a.hint
                  ? (console.log(),
                    console.log(
                      te.default.yellow(
                        "Declarative schemas detected with pending changes.",
                      ),
                    ),
                    console.log(
                      te.default.dim(
                        "The reset database reflects the migrations only \u2014 schema changes that were never diffed, including RLS policies, are gone.",
                      ),
                    ),
                    console.log(
                      te.default.dim(
                        "Run `lite db diff -f <name>` to capture them as a migration, then re-run `lite db reset`.",
                      ),
                    ))
                  : a.reason === "diff-failed" &&
                    (console.error(),
                    console.error(
                      te.default.yellow(
                        "Declarative schemas detected but could not be checked.",
                      ),
                    ),
                    a.error && console.error(te.default.dim(a.error)),
                    console.error(
                      te.default.dim(
                        "The reset database and its RLS metadata reflect the migrations only \u2014 anything `supabase/schemas/*.sql` declares, policies included, may be missing.",
                      ),
                    ),
                    console.error(
                      te.default.dim(
                        "Fix the schema files, then `lite db diff -f <name>` and re-run `lite db reset`.",
                      ),
                    )),
                  n.seed !== !1 &&
                    (await Ml(r).catch((l) =>
                      console.error(
                        te.default.yellow("Seed warning: " + String(l)),
                      ),
                    )),
                  console.log(te.default.green("Database reset.")));
              }));
          }),
        t
          .command("translate")
          .description(
            "Translate Postgres SQL to this project's backend dialect",
          )
          .argument("[sql]", "SQL to translate; reads stdin if omitted")
          .option("--config <config>", "Path to the config file")
          .option(
            "--deparse",
            de(
              "Emit the JSON deparse payload (RLS policies + session vars) instead of DDL, for edge/serverless runtimes",
            ),
          )
          .option(
            "-o, --out <file>",
            "Write output to a file instead of stdout",
          )
          .action(async (n, r) => {
            await X(async () => {
              await Y(r.config);
              let s = await yt(r.config);
              try {
                if (r.deparse) {
                  let l = await oT(s, n),
                    p = [s.connection.config.baseSchema ?? "", l].filter((m) =>
                      m.trim(),
                    ).join(`

`),
                    u = await s.connection.translateDdl(p),
                    f = SqliteConnection.serializeDeparseInfo(u),
                    h = JSON.stringify(f, null, 2);
                  r.out
                    ? (await he__default.writeFile(
                        r.out,
                        h +
                          `
`,
                        "utf8",
                      ),
                      console.error(
                        te.default.green(" \u279C"),
                        `Wrote ${f.rls.policies.length} policies to`,
                        te.default.cyan(
                          Fe__default.relative(
                            process.cwd(),
                            Fe__default.resolve(r.out),
                          ),
                        ),
                      ))
                    : console.log(h);
                  return;
                }
                let i = n ?? (await ls()),
                  o = await s.connection.translateDdl(i),
                  a = typeof o == "string" ? o : (o.ddl ?? "");
                console.log(a);
              } finally {
                await s.connection.close();
              }
            });
          }),
        t
          .command("query")
          .description(
            "Execute a SQL statement against the local or remote project",
          )
          .argument(
            "[statement]",
            "The statement to execute; reads stdin if omitted",
          )
          .option(
            "--remote",
            "Execute the statement on the remote project",
            false,
          )
          .option("--config <config>", "Path to the config file")
          .action(async (n, r) => {
            await X(async () => {
              r.remote || (await Y(r.config));
              let s = await yt(r.remote ? !0 : r.config);
              try {
                if (n) {
                  He(`Executing: ${te.default.cyan(n)}`);
                  let o = await s.connection.exec(n);
                  console.log(o);
                  return;
                }
                let i = await ls();
                for (let o of nt(i)) {
                  if (!o.trim()) continue;
                  let a = await s.connection.exec(o);
                  console.log(a);
                }
              } finally {
                await s.connection.close();
              }
            });
          }),
        t
          .command("schema")
          .description(de("Print the current database schema"))
          .option("--diff", "Diff current DB against schemas/*.sql", false)
          .option(
            "--sql",
            "Print raw CREATE statements from sqlite_master",
            false,
          )
          .option("--config <config>", "Path to the config file")
          .action(async (n) => {
            (console.log(),
              await X(async () => {
                if ((await Y(n.config), n.diff)) {
                  await ph(n.config);
                  return;
                }
                let s = await (await yt(n.config)).connection.introspect();
                if (n.sql) {
                  let i = [
                    ...s.tables.map((o) => o.sql),
                    ...s.views.map((o) => o.sql),
                    ...s.triggers.map((o) => o.sql),
                  ].filter((o) => o && o.trim().length > 0);
                  console.log(
                    i.join(`;

`) + (i.length ? ";" : ""),
                  );
                  return;
                }
                Wm(s);
              }));
          }));
    };
  });
var hh = {};
pe(hh, { migration: () => uT });
var Te,
  cT,
  uT,
  gh = b(() => {
    Te = z(J());
    $t();
    Ai();
    rt();
    Ee();
    Se();
    fr();
    ((cT = "Local Development:"),
      (uT = (e) => {
        let t = e
          .command("migration")
          .description("Manage database migrations")
          .helpGroup(cT);
        (t
          .command("new")
          .description("Create a new empty migration file")
          .argument("<name>", "The migration name")
          .option("--config <config>", "Path to the config file")
          .action(async (n, r) => {
            await Y(r.config);
            let i = await (
                await V({ withSupabaseClient: false })
              ).project.local.createApp(r.config),
              o = await zm(i, n);
            (console.log(
              Te.default.green(" \u279C"),
              "Created",
              Te.default.cyan(Fe__default.relative(process.cwd(), o)),
            ),
              process.exit(0));
          }),
          t
            .command("up")
            .description(
              "Apply pending migrations from the migrations directory",
            )
            .option("--config <config>", "Path to the config file")
            .option(
              "--dry-run",
              "Print pending migrations without applying",
              false,
            )
            .action(async (n) => {
              await Y(n.config);
              let s = await (
                await V({ withSupabaseClient: false })
              ).project.local.createApp(n.config);
              if (n.dryRun) {
                await un(s.connection);
                let i = new Set(await or(s.connection)),
                  a = (await Oe(s)).filter((l) => !i.has(l.version));
                (a.length === 0 &&
                  (console.log(Te.default.green("No pending migrations.")),
                  process.exit(0)),
                  console.log(Te.default.dim("Pending:")));
                for (let l of a)
                  console.log("  " + Te.default.cyan(l.filename));
                process.exit(0);
              }
              try {
                let i = await Jt(s);
                if (!(await fn(s)))
                  throw new Error(
                    "Applied migration metadata could not be rebuilt. Run `lite db reset`.",
                  );
                if (i.applied.length === 0)
                  console.log(
                    Te.default.green("Local database is up to date."),
                  );
                else
                  for (let o of i.applied)
                    console.log(
                      Te.default.green(" \u2713"),
                      "Applied",
                      Te.default.cyan(o.filename),
                    );
              } catch (i) {
                (console.error(
                  Te.default.red("Migration failed: " + String(i.message ?? i)),
                ),
                  process.exit(1));
              }
              process.exit(0);
            }),
          t
            .command("list")
            .description("List applied and pending migrations")
            .option("--config <config>", "Path to the config file")
            .action(async (n) => {
              await Y(n.config);
              let s = await (
                await V({ withSupabaseClient: false })
              ).project.local.createApp(n.config);
              await un(s.connection);
              let i = new Set(await or(s.connection)),
                o = await Oe(s);
              (console.log(Te.default.dim(`Migrations in ${Xt(s)}:`)),
                o.length === 0 && console.log(Te.default.dim("  (none)")));
              for (let c of o) {
                let p = i.has(c.version)
                  ? Te.default.green("[applied]")
                  : Te.default.yellow("[pending]");
                console.log(`  ${p} ${Te.default.cyan(c.filename)}`);
              }
              let a = new Set(o.map((c) => c.version)),
                l = [...i].filter((c) => !a.has(c));
              if (l.length > 0) {
                (console.log(),
                  console.log(
                    Te.default.dim("Recorded versions without matching file:"),
                  ));
                for (let c of l)
                  console.log(`  ${Te.default.red("[orphan]")} ${c}`);
              }
              process.exit(0);
            }));
      }));
  });
function fT(e, t) {
  let n = (e ?? process.env.SUPABASE_ENDPOINT ?? pT).replace(/\/+$/, ""),
    r = new URL(n),
    s = r.host;
  return {
    apiUrl:
      (t ?? process.env.SUPABASE_MANAGEMENT_API_URL)?.replace(/\/+$/, "") ??
      `${r.protocol}//${s.startsWith("api.") ? s : `api.${s}`}`,
    projectDomain: s === "supabase.com" ? "supabase.co" : s,
  };
}
function yh(e) {
  if (Array.isArray(e)) {
    let t = e.find((r) => r.name === "anon")?.api_key ?? "",
      n = e.find((r) => r.name === "service_role")?.api_key ?? "";
    return { anon: t, service_role: n };
  }
  return e;
}
var pT,
  eo,
  bh = b(() => {
    pT = "https://supabase.com";
    eo = class {
      constructor(t, n) {
        this.token = t;
        if (!t) throw new Error("Supabase access token required");
        let r = fT(n?.endpoint, n?.managementApiUrl);
        ((this.apiUrl = r.apiUrl), (this.projectDomain = r.projectDomain));
      }
      apiUrl;
      projectDomain;
      async request(t, n, r) {
        let s = await fetch(`${this.apiUrl}${n}`, {
          method: t,
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: r === void 0 ? void 0 : JSON.stringify(r),
        });
        if (!s.ok) {
          let o = await s.text().catch(() => "");
          throw new Error(
            `Supabase API ${t} ${n} failed: ${s.status} ${s.statusText}${o ? ` \u2014 ${o}` : ""}`,
          );
        }
        return (s.headers.get("content-type") ?? "").includes(
          "application/json",
        )
          ? await s.json()
          : await s.text();
      }
      listOrganizations() {
        return this.request("GET", "/v1/organizations");
      }
      async validateToken() {
        try {
          return (await this.listOrganizations(), !0);
        } catch {
          return false;
        }
      }
      listRegions(t) {
        return this.request(
          "GET",
          `/v1/projects/available-regions?organization_slug=${encodeURIComponent(t)}`,
        );
      }
      createProject(t) {
        return this.request("POST", "/v1/projects", t);
      }
      getProject(t) {
        return this.request("GET", `/v1/projects/${t}`);
      }
      getApiKeys(t) {
        return this.request("GET", `/v1/projects/${t}/api-keys`);
      }
      updateAuthConfig(t, n) {
        return this.request("PATCH", `/v1/projects/${t}/config/auth`, n);
      }
      createSigningKey(t, n) {
        return this.request(
          "POST",
          `/v1/projects/${t}/config/auth/signing-keys`,
          n,
        );
      }
      runSql(t, n) {
        return this.request("POST", `/v1/projects/${t}/database/query`, {
          query: n,
        });
      }
      async waitForActive(t, n = {}) {
        let r = n.timeoutMs ?? 6e5,
          s = n.intervalMs ?? 5e3,
          i = Date.now();
        for (;;) {
          let o = await this.getProject(t);
          if ((n.onTick?.(o.status), o.status === "ACTIVE_HEALTHY")) return o;
          if (Date.now() - i > r)
            throw new Error(
              `Timed out waiting for project ${t} to become ACTIVE_HEALTHY (last status: ${o.status})`,
            );
          await new Promise((a) => setTimeout(a, s));
        }
      }
    };
  });
function dT(e) {
  if (e == null || typeof e != "string") return true;
  try {
    return (JSON.parse(e), !0);
  } catch {
    return false;
  }
}
function hT(e) {
  return e == null ? true : typeof e != "string" ? false : mT.test(e);
}
function gT(e) {
  if (e == null) return true;
  if (typeof e == "number") return Number.isFinite(e);
  if (typeof e != "string") return false;
  let t = Date.parse(e);
  return !Number.isNaN(t);
}
function wh(e) {
  if (!e) return;
  let t = e.match(/varchar\s*\(\s*(\d+)\s*\)/i);
  return t ? Number(t[1]) : void 0;
}
function Sh(e) {
  return e ? /jsonb?/i.test(e) : false;
}
function Eh(e) {
  return e ? /\buuid\b/i.test(e) : false;
}
function _h(e) {
  return e ? /timestamp(tz)?|timestamp with|timestamp without/i.test(e) : false;
}
async function xh(e) {
  let t = await e.connection.introspect(),
    n = [],
    r = e.connection.dialect;
  for (let s of t.tables) {
    let i = s.name,
      o = s.schema,
      a =
        r === "sqlite" && o && o !== "main"
          ? `"${o}.${i}"`
          : o
            ? `"${o}"."${i}"`
            : `"${i}"`,
      l = t.columns.filter((h) => h.table === i && (h.schema ?? o) === o),
      c = 0,
      p = [];
    try {
      let h = await e.connection.exec(`SELECT COUNT(*) as c FROM ${a}`);
      c = Number(h?.rows?.[0]?.c ?? 0);
    } catch {
      n.push({ table: i, schema: o, rowCount: 0, issues: p });
      continue;
    }
    if (c === 0) {
      n.push({ table: i, schema: o, rowCount: c, issues: p });
      continue;
    }
    let u = l.filter(
      (h) => Sh(h.type) || Eh(h.type) || _h(h.type) || wh(h.type) !== void 0,
    );
    if (u.length === 0) {
      n.push({ table: i, schema: o, rowCount: c, issues: p });
      continue;
    }
    let f = u.map((h) => `"${h.name}"`).join(", ");
    try {
      let m = (await e.connection.exec(`SELECT ${f} FROM ${a}`))?.rows ?? [];
      for (let d of m)
        for (let g of u) {
          let y = d[g.name];
          if (Sh(g.type) && !dT(y)) {
            p.push({
              table: i,
              column: g.name,
              kind: "invalid_json",
              message: `row contains non-parseable JSON in ${i}.${g.name}`,
            });
            continue;
          }
          if (Eh(g.type) && y != null && !hT(y)) {
            p.push({
              table: i,
              column: g.name,
              kind: "invalid_uuid",
              message: `row contains invalid UUID in ${i}.${g.name}`,
            });
            continue;
          }
          if (_h(g.type) && !gT(y)) {
            p.push({
              table: i,
              column: g.name,
              kind: "invalid_timestamp",
              message: `row contains unparseable timestamp in ${i}.${g.name}`,
            });
            continue;
          }
          let _ = wh(g.type);
          _ !== void 0 &&
            typeof y == "string" &&
            y.length > _ &&
            p.push({
              table: i,
              column: g.name,
              kind: "varchar_overflow",
              message: `value exceeds varchar(${_}) in ${i}.${g.name}`,
            });
        }
    } catch {}
    n.push({ table: i, schema: o, rowCount: c, issues: p });
  }
  return n;
}
var mT,
  Th = b(() => {
    mT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  });
async function to(e, t) {
  let r = e.connection.dialect === "sqlite" ? `"auth.${t}"` : `auth."${t}"`;
  try {
    let s = await e.connection.exec(`SELECT COUNT(*) as c FROM ${r}`);
    return Number(s?.rows?.[0]?.c ?? 0);
  } catch {
    return 0;
  }
}
async function Ch(e, t) {
  let n = [],
    r = [],
    s = false;
  try {
    (await e.connection.exec("SELECT 1"), (s = !0));
  } catch (a) {
    n.push(`Database not reachable: ${String(a)}`);
  }
  let i = [];
  if (s)
    try {
      i = await xh(e);
    } catch (a) {
      r.push(`Data validation skipped: ${String(a)}`);
    }
  for (let a of i) for (let l of a.issues) r.push(`${l.kind}: ${l.message}`);
  let o = {
    users: 0,
    sessions: 0,
    refresh_tokens: 0,
    identities: 0,
    jwt_secret_set: !!e.config.auth?.jwt_secret,
  };
  return (
    s &&
      ((o.users = await to(e, "users")),
      (o.sessions = await to(e, "sessions")),
      (o.refresh_tokens = await to(e, "refresh_tokens")),
      (o.identities = await to(e, "identities"))),
    o.jwt_secret_set ||
      r.push(
        "auth.jwt_secret is not configured \u2014 tokens will not survive upgrade",
      ),
    e.config.storage?.enabled &&
      r.push("Storage is enabled but migration is not yet supported"),
    e.config.realtime?.enabled &&
      r.push("Realtime config migration is not yet supported"),
    {
      ok: n.length === 0,
      errors: n,
      warnings: r,
      dbReachable: s,
      schemaStatementCount: t.statements.length,
      schemaBytes: t.sql.length,
      tables: i,
      auth: o,
    }
  );
}
var Ah = b(() => {
  Th();
});
var Tc,
  $h = b(() => {
    Tc = `-- supabase/auth core schema (Postgres)
-- Scope: Core Authentication + User Management
-- Source: GoTrue migrations + runtime analysis

CREATE SCHEMA IF NOT EXISTS auth;

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS auth.users (
  id              uuid PRIMARY KEY,  -- app-generated UUID
  aud             varchar(255) DEFAULT 'authenticated',
  role            varchar(255) DEFAULT 'authenticated',

  -- Credentials
  email               varchar(255),
  encrypted_password  varchar(255),
  phone               text UNIQUE,

  -- Confirmation state
  email_confirmed_at      timestamptz,
  confirmed_at            timestamptz GENERATED ALWAYS AS (
    CASE
      WHEN email_confirmed_at IS NULL THEN phone_confirmed_at
      WHEN phone_confirmed_at IS NULL THEN email_confirmed_at
      WHEN email_confirmed_at < phone_confirmed_at THEN email_confirmed_at
      ELSE phone_confirmed_at
    END
  ) STORED,
  invited_at              timestamptz,
  confirmation_token      varchar(255),
  confirmation_sent_at    timestamptz,

  -- Recovery state
  recovery_token          varchar(255),
  recovery_sent_at        timestamptz,

  -- Email change state
  email_change                varchar(255),
  email_change_token_new      varchar(255),
  email_change_token_current  varchar(255),
  email_change_sent_at        timestamptz,
  email_change_confirm_status smallint DEFAULT 0
    CHECK (email_change_confirm_status BETWEEN 0 AND 2),

  -- Phone change state
  phone_confirmed_at      timestamptz,
  phone_change            text,
  phone_change_token      varchar(255),
  phone_change_sent_at    timestamptz,

  -- Reauthentication state
  reauthentication_token      varchar(255),
  reauthentication_sent_at    timestamptz,

  -- Metadata
  raw_app_meta_data       jsonb DEFAULT '{}'::jsonb,
  raw_user_meta_data      jsonb DEFAULT '{}'::jsonb,

  -- Status
  banned_until            timestamptz,
  deleted_at              timestamptz,
  is_sso_user             boolean NOT NULL DEFAULT false,
  is_anonymous            boolean NOT NULL DEFAULT false,

  -- Activity
  last_sign_in_at         timestamptz,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_partial_key
  ON auth.users (email)
  WHERE is_sso_user = false;

CREATE INDEX IF NOT EXISTS users_is_anonymous_idx
  ON auth.users (is_anonymous);

-- Partial unique indexes on token columns.
-- Columns store the OTP hash (hex SHA-256 of email+otp, len > 6), not the raw
-- 6-digit code, so the length guard always includes real tokens while staying
-- portable across Postgres and SQLite (vs GoTrue's Postgres-only regex).
CREATE UNIQUE INDEX IF NOT EXISTS users_confirmation_token_idx
  ON auth.users (confirmation_token)
  WHERE length(confirmation_token) > 6;

CREATE UNIQUE INDEX IF NOT EXISTS users_recovery_token_idx
  ON auth.users (recovery_token)
  WHERE length(recovery_token) > 6;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_change_token_current_idx
  ON auth.users (email_change_token_current)
  WHERE length(email_change_token_current) > 6;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_change_token_new_idx
  ON auth.users (email_change_token_new)
  WHERE length(email_change_token_new) > 6;

CREATE UNIQUE INDEX IF NOT EXISTS users_reauthentication_token_idx
  ON auth.users (reauthentication_token)
  WHERE length(reauthentication_token) > 6;

-- ============================================================
-- SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS auth.sessions (
  id          uuid PRIMARY KEY,  -- app-generated UUID
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  not_after   timestamptz,
  refreshed_at timestamp without time zone,
  user_agent  text,
  ip          inet,
  tag         text,
  refresh_token_hmac_key text,
  refresh_token_counter  bigint,
  scopes      text CHECK (scopes IS NULL OR length(scopes) <= 4096),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),

  -- AAL fields (used with MFA, included for forward-compat)
  aal         text CHECK (aal IN ('aal1', 'aal2', 'aal3')),
  factor_id   uuid
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON auth.sessions (user_id);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  id          text PRIMARY KEY,  -- app-generated UUID
  token       varchar(255) NOT NULL,
  user_id     uuid NOT NULL,
  session_id  uuid REFERENCES auth.sessions(id) ON DELETE CASCADE,
  revoked     boolean DEFAULT false,
  parent      varchar(255),  -- previous token value, for rotation family tracking
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx ON auth.refresh_tokens (token);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON auth.refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens (session_id, revoked);

-- ============================================================
-- IDENTITIES
-- ============================================================

CREATE TABLE IF NOT EXISTS auth.identities (
  id              uuid PRIMARY KEY,  -- app-generated UUID
  provider        text NOT NULL,
  provider_id     text NOT NULL,     -- external provider's user ID (e.g. Google sub claim)
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_data   jsonb NOT NULL DEFAULT '{}'::jsonb,
  email           varchar(255) GENERATED ALWAYS AS (lower(identity_data->>'email')) STORED,
  last_sign_in_at timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),

  UNIQUE (provider, provider_id)
);

CREATE INDEX IF NOT EXISTS identities_user_id_idx ON auth.identities (user_id);
CREATE INDEX IF NOT EXISTS identities_email_idx ON auth.identities (email);

-- ============================================================
-- FLOW STATE (OAuth / PKCE)
-- ============================================================

CREATE TABLE IF NOT EXISTS auth.flow_state (
  id                     uuid PRIMARY KEY,  -- app-generated UUID
  user_id                uuid,
  auth_code              text,
  authentication_method  text NOT NULL,
  code_challenge_method  text CHECK (code_challenge_method IN ('s256', 'plain')),
  code_challenge         text,
  provider_type          text NOT NULL,
  provider_access_token  text,
  provider_refresh_token text,
  auth_code_issued_at    timestamptz,
  invite_token           text,
  referrer               text,
  oauth_client_state_id  uuid,
  linking_target_id      uuid,
  email_optional         boolean NOT NULL DEFAULT false,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_code ON auth.flow_state (auth_code);
CREATE INDEX IF NOT EXISTS idx_user_id_auth_method ON auth.flow_state (user_id, authentication_method);
-- Supports the opportunistic cleanup of abandoned flows on /authorize
-- (GoTrue prunes flow_state by created_at in internal/models/cleanup.go).
CREATE INDEX IF NOT EXISTS flow_state_created_at_idx ON auth.flow_state (created_at);

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
  id          uuid PRIMARY KEY,  -- app-generated UUID
  payload     json,
  created_at  timestamptz DEFAULT now(),
  ip_address  varchar(64) DEFAULT ''
);
`;
  });
function no(e = true) {
  return e ? bu(Tc) : Tc;
}
var Cc = b(() => {
  _t();
  $h();
});
function zr(e) {
  let t = [],
    n = "",
    r = 0,
    s = false,
    i = false,
    o = false,
    a = false,
    l = false,
    c = null;
  for (; r < e.length; ) {
    let u = e[r],
      f = e[r + 1];
    if (a) {
      ((n += u),
        u ===
          `
` && (a = false),
        r++);
      continue;
    }
    if (l) {
      if (((n += u), u === "*" && f === "/")) {
        ((n += f), (r += 2), (l = false));
        continue;
      }
      r++;
      continue;
    }
    if (c) {
      if (((n += u), u === "$" && e.startsWith(c, r))) {
        ((n += e.slice(r + 1, r + c.length)), (r += c.length), (c = null));
        continue;
      }
      r++;
      continue;
    }
    if (s) {
      if (((n += u), i && u === "\\" && f !== void 0)) {
        ((n += f), (r += 2));
        continue;
      }
      if (u === "'" && f === "'") {
        ((n += f), (r += 2));
        continue;
      }
      (u === "'" && ((s = false), (i = false)), r++);
      continue;
    }
    if (o) {
      if (((n += u), u === '"' && f === '"')) {
        ((n += f), (r += 2));
        continue;
      }
      (u === '"' && (o = false), r++);
      continue;
    }
    if (u === "-" && f === "-") {
      ((a = true), (n += u), r++);
      continue;
    }
    if (u === "/" && f === "*") {
      ((l = true), (n += u), r++);
      continue;
    }
    if (u === "'") {
      ((s = true),
        (i =
          (e[r - 1] === "E" || e[r - 1] === "e") &&
          (r < 2 || !/[A-Za-z0-9_$]/.test(e[r - 2]))),
        (n += u),
        r++);
      continue;
    }
    if (u === '"') {
      ((o = true), (n += u), r++);
      continue;
    }
    if (u === "$") {
      let h = e.slice(r).match(/^\$[A-Za-z0-9_]*\$/);
      if (h) {
        ((c = h[0]), (n += h[0]), (r += h[0].length));
        continue;
      }
    }
    if (u === ";") {
      let h = n.trim();
      (h && t.push(h), (n = ""), r++);
      continue;
    }
    ((n += u), r++);
  }
  let p = n.trim();
  return (p && t.push(p), t);
}
var Ac = b(() => {});
function xT(e, t, n, r) {
  if (e == null) return "NULL";
  if (r.includes(t))
    return e === true || e === 1 || e === "1" || e === "true"
      ? "true"
      : "false";
  if (n.includes(t)) {
    let s = typeof e == "string" ? e : JSON.stringify(e);
    return `${Rh(s)}::jsonb`;
  }
  return typeof e == "number"
    ? Number.isFinite(e)
      ? String(e)
      : "NULL"
    : typeof e == "boolean"
      ? e
        ? "true"
        : "false"
      : Rh(String(e));
}
function Rh(e) {
  return `'${e.replace(/'/g, "''")}'`;
}
async function ro(e, t = {}) {
  let n = t.target ?? "supabase",
    r = { users: [], sessions: [], identities: [], refresh_tokens: [] },
    s = e.connection.dialect,
    i = _T[n];
  for (let o of wT) {
    let a = s === "sqlite" ? `"auth.${o}"` : `auth."${o}"`,
      l = [];
    try {
      l = (await e.connection.exec(`SELECT * FROM ${a}`))?.rows ?? [];
    } catch {
      continue;
    }
    if (l.length === 0) continue;
    let c = new Set(i[o]),
      p = ST[o],
      u = ET[o];
    for (let f of l) {
      let h = { ...f };
      if (n === "supabase" && o === "users") {
        let y = h.confirmed_at;
        y != null && h.email_confirmed_at == null && (h.email_confirmed_at = y);
      }
      let m = Object.keys(h).filter((y) => !c.has(y)),
        d = m.map((y) => xT(h[y], y, p, u)),
        g = `INSERT INTO auth.${o} (${m.map((y) => `"${y}"`).join(", ")}) VALUES (${d.join(", ")}) ON CONFLICT DO NOTHING`;
      r[o].push(g);
    }
  }
  return r;
}
var bT,
  wT,
  ST,
  ET,
  _T,
  $c = b(() => {
    ((bT = ["users", "sessions", "identities", "refresh_tokens"]),
      (wT = bT),
      (ST = {
        users: ["raw_app_meta_data", "raw_user_meta_data"],
        sessions: [],
        identities: ["identity_data"],
        refresh_tokens: [],
      }),
      (ET = {
        users: ["is_sso_user", "is_anonymous"],
        sessions: [],
        identities: [],
        refresh_tokens: ["revoked"],
      }),
      (_T = {
        supabase: {
          users: ["confirmed_at"],
          sessions: [],
          identities: ["email"],
          refresh_tokens: ["id"],
        },
        local: {
          users: ["confirmed_at"],
          sessions: [],
          identities: ["email"],
          refresh_tokens: [],
        },
      }));
  });
async function vh(e, t = "") {
  let n = e.trim();
  if (!n) return "";
  let { PGlite: r } = await We(
      "@supabase/lite/pglite",
      "pglite",
      "@electric-sql/pglite",
    ),
    s = new r();
  try {
    let i = vt(n);
    return (
      i.add("supabase_auth_admin"),
      await s.exec(Rt(i)),
      await s.exec(Ti),
      t.trim() && (await s.exec(t)),
      await TT(s, n)
    );
  } finally {
    await s.close().catch(() => {});
  }
}
async function TT(e, t) {
  return t ? (await e.exec(t), await CT(e)) : "";
}
async function CT(e) {
  let t = await e.query(`
      SELECT n.nspname AS enum_schema, t.typname AS enum_name, e.enumlabel AS enum_label
      FROM pg_type t
      JOIN pg_enum e ON e.enumtypid = t.oid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY n.nspname, t.typname, e.enumsortorder
   `),
    n = await e.query(`
      SELECT table_schema, table_name, column_name, is_nullable, data_type,
             udt_name, udt_schema, character_maximum_length,
             numeric_precision, numeric_scale, column_default,
             is_generated, generation_expression, ordinal_position
      FROM information_schema.columns
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY table_schema, table_name, ordinal_position
   `),
    r = await e.query(`
      SELECT kcu.table_schema, kcu.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
       AND tc.table_name = kcu.table_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY kcu.ordinal_position
   `),
    s = new Map();
  for (let l of r.rows) {
    let c = `${l.table_schema}.${l.table_name}`,
      p = s.get(c) ?? [];
    (p.push(l.column_name), s.set(c, p));
  }
  let i = new Map();
  for (let l of n.rows) {
    let c = `${l.table_schema}.${l.table_name}`,
      p = i.get(c) ?? [];
    (p.push(l), i.set(c, p));
  }
  let o = new Map();
  for (let l of t.rows) {
    let c = `${l.enum_schema}.${l.enum_name}`,
      p = o.get(c) ?? [];
    (p.push(l), o.set(c, p));
  }
  let a = [...o.values()].map((l) => {
    let c = l[0],
      p = l.map((u) => AT(u.enum_label)).join(", ");
    return `CREATE TYPE ${ot(c.enum_schema)}.${ot(c.enum_name)} AS ENUM (${p});`;
  });
  for (let [l, c] of i) {
    let p = c[0].table_schema,
      u = c[0].table_name,
      f = s.get(l) ?? [],
      h = c.map((m) => $T(m, f));
    a.push(`CREATE TABLE ${ot(p)}.${ot(u)} (
   ${h.join(`,
   `)}
);`);
  }
  return a.join(`

`);
}
function AT(e) {
  return `'${e.replace(/'/g, "''")}'`;
}
function ot(e) {
  return /^[a-z_][a-z0-9_]*$/.test(e) ? e : `"${e.replace(/"/g, '""')}"`;
}
function $T(e, t) {
  let n = [ot(e.column_name)];
  return (
    n.push(RT(e)),
    e.is_nullable === "NO" && !t.includes(e.column_name) && n.push("NOT NULL"),
    e.is_generated === "ALWAYS" && e.generation_expression
      ? n.push(`GENERATED ALWAYS AS (${e.generation_expression}) STORED`)
      : e.column_default !== null && n.push(`DEFAULT ${e.column_default}`),
    t.length === 1 && t[0] === e.column_name && n.push("PRIMARY KEY"),
    n.join(" ")
  );
}
function RT(e) {
  if (e.data_type === "ARRAY") {
    let t = e.udt_name.startsWith("_") ? e.udt_name.slice(1) : e.udt_name;
    return `${e.udt_schema === "pg_catalog" ? ot(t) : `${ot(e.udt_schema)}.${ot(t)}`}[]`;
  }
  return e.data_type === "USER-DEFINED"
    ? `${ot(e.udt_schema)}.${ot(e.udt_name)}`
    : e.data_type === "character varying" && e.character_maximum_length
      ? `varchar(${e.character_maximum_length})`
      : e.data_type === "numeric" &&
          e.numeric_precision &&
          e.numeric_scale !== null
        ? `numeric(${e.numeric_precision},${e.numeric_scale})`
        : e.data_type;
}
var kh = b(() => {
  ln();
  Fr();
});
function io(e) {
  let t = so.get(e);
  if (t) return t;
  let n = vh(e.sql, no()).then(async (r) => (await ah(r)).schema);
  return (
    so.set(e, n),
    n.catch(() => {
      so.get(e) === n && so.delete(e);
    }),
    n
  );
}
function vT(e) {
  return (
    e
      .replace(/--[^\n]*(?:\n|$)/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .trim().length > 0
  );
}
function kT(e) {
  let t = `${e.version}${e.name ? `_${e.name}` : ""}.sql`;
  return {
    version: e.version,
    name: e.name,
    filename: t,
    path: t,
    sql: `${e.statements.join(`
;
`)}
;`,
  };
}
async function Ph(e) {
  if (ge(e.connection) === "sqlite")
    throw new Error(
      "`lite upgrade` requires PostgreSQL migration history or files in supabase/migrations. The bare `sqlite` driver's native supabase/sqlite-migrations cannot be replayed on Supabase. Switch to a Postgres-compatible driver and create reviewed Postgres migrations before retrying.",
    );
  let t = await Ha(e),
    n = new Set(t.map((o) => o.version)),
    r = (await Oe(e)).filter((o) => !n.has(o.version)),
    s = [...t.map(kT), ...r];
  if (s.length === 0)
    throw new Error(
      "`lite upgrade` requires recorded PostgreSQL migration history or pending migration files. Run `lite db diff -f prepare_upgrade`, review the migration, then retry.",
    );
  let i = s.flatMap((o) => {
    let a = zr(o.sql).filter(vT);
    return a.map((l, c) => ({
      file: o.filename,
      index: c + 1,
      total: a.length,
      sql: l,
    }));
  });
  if (i.length === 0)
    throw new Error(
      "`lite upgrade` requires SQL in recorded migration history or pending migration files. Run `lite db diff -f prepare_upgrade`, review the migration, then retry.",
    );
  return {
    files: s,
    sql: `${i.map((o) => o.sql).join(`
;
`)}
;`,
    statements: i,
  };
}
var so,
  oo = b(() => {
    Cc();
    $t();
    rt();
    kh();
    Wa();
    Ec();
    Ac();
    so = new WeakMap();
  });
function ao(e) {
  return !e || e === "main" || e === "public" ? "public" : e;
}
function Xr(e, t) {
  return `${ao(e)}.${t}`;
}
function NT(e, t) {
  let n = new Map(e.map((a) => [Xr(a.schema, a.name), a])),
    r = new Map(),
    s = new Map();
  for (let a of n.keys()) (r.set(a, new Set()), s.set(a, new Set()));
  for (let a of t) {
    let l = Xr(a.schema, a.table),
      c = Xr(a.ref_schema ?? a.schema, a.ref_table);
    !r.has(l) || !r.has(c) || (r.get(l).add(c), s.get(c).add(l));
  }
  let i = [...r.entries()].filter(([, a]) => a.size === 0).map(([a]) => a),
    o = [];
  for (let a = 0; a < i.length; a++) {
    let l = i[a];
    o.push(l);
    for (let c of s.get(l) ?? []) {
      let p = r.get(c);
      p && (p.delete(l), p.size === 0 && i.push(c));
    }
  }
  if (o.length < e.length) {
    console.warn(
      "Warning: cycle detected in user table foreign keys; using best-effort data export order.",
    );
    let a = new Set(o);
    for (let l of e) {
      let c = Xr(l.schema, l.name);
      a.has(c) || o.push(c);
    }
  }
  return o.map((a) => n.get(a)).filter(Boolean);
}
function Oh(e, t) {
  if (e == null) return "NULL";
  let n = (t ?? "").toLowerCase();
  if (Array.isArray(e) && n.endsWith("[]")) {
    let r = t?.slice(0, -2);
    return `ARRAY[${e.map((s) => Oh(s, r)).join(", ")}]::${t}`;
  }
  if (typeof e == "boolean") return e ? "true" : "false";
  if (typeof e == "number") return Number.isFinite(e) ? String(e) : "NULL";
  if (n.includes("bool") && (e === 0 || e === 1 || e === "0" || e === "1"))
    return e === 1 || e === "1" ? "true" : "false";
  if (n.includes("json")) {
    let r = typeof e == "string" ? e : JSON.stringify(e),
      s = n.includes("jsonb") ? "::jsonb" : "::json";
    return `${Pn(r)}${s}`;
  }
  return e instanceof Date
    ? Pn(e.toISOString())
    : typeof e == "object"
      ? `${Pn(JSON.stringify(e))}::jsonb`
      : Pn(String(e));
}
function Lh(e) {
  return e instanceof st
    ? `${e.elementField ? Lh(e.elementField) : e.context.pgTypeName}[]`
    : e.context.pgTypeName
        .split(".")
        .map((t) => (/^[a-z_][a-z0-9_]*$/.test(t) ? t : lo(t)))
        .join(".");
}
function Pn(e) {
  return `'${e.replace(/'/g, "''")}'`;
}
function lo(e) {
  return `"${e.replace(/"/g, '""')}"`;
}
function OT(e) {
  let t = e.default_value ?? e.default;
  if (typeof t == "string" && t.trim().toLowerCase().startsWith("nextval("))
    return true;
  let n = typeof e.type == "string" ? e.type.toLowerCase() : "",
    r = typeof e.pg_type == "string" ? e.pg_type.toLowerCase() : "";
  return Nh.has(n) || Nh.has(r);
}
function LT(e, t, n) {
  let r = `${lo(e)}.${lo(t)}`;
  return `SELECT setval(pg_get_serial_sequence(${Pn(r)}, ${Pn(n)}), COALESCE((SELECT MAX(${lo(n)}) FROM ${r}), 1));`;
}
async function co(e, t) {
  let n = await e.connection.introspect(),
    r = e.connection.dialect,
    s = await io(t),
    i = NT(
      n.tables.filter((a) => !PT.has(ao(a.schema))),
      n.foreign_keys,
    ),
    o = [];
  for (let a of i) {
    let l = ao(a.schema),
      c =
        r === "sqlite"
          ? l === "public"
            ? `"${a.name}"`
            : `"${l}.${a.name}"`
          : `"${l}"."${a.name}"`,
      p = n.columns.filter((x) => x.table === a.name && ao(x.schema) === l),
      u = s.get(Xr(l, a.name)),
      f = p.filter((x) => {
        let $ = u?.get(x.name);
        return $ ? !$.context.isGenerated : !x.generated && !x.is_generated;
      }),
      h = [];
    try {
      h = (await e.connection.exec(`SELECT * FROM ${c}`))?.rows ?? [];
    } catch {
      continue;
    }
    if (h.length === 0) continue;
    let m =
      typeof e.connection.deserializeRow == "function"
        ? e.connection.deserializeRow.bind(e.connection)
        : (x) => x;
    h = h.map((x) => {
      let $ = u ? u.deserializeRow(x) : x;
      return m($);
    });
    let d = f.map((x) => x.name),
      g = new Map(
        f.map((x) => {
          let $ = u?.get(x.name);
          return [x.name, $ ? Lh($) : (x.pg_type ?? x.type)];
        }),
      ),
      y = [];
    for (let x of h) {
      let $ = d.map((C) => Oh(x[C], g.get(C)));
      y.push(
        `INSERT INTO "${l}"."${a.name}" (${d.map((C) => `"${C}"`).join(", ")}) VALUES (${$.join(", ")}) ON CONFLICT DO NOTHING`,
      );
    }
    let _ = f
      .filter((x) => {
        let $ = u?.get(x.name);
        return $ ? $.context.isSerial : OT(x);
      })
      .map((x) => LT(l, a.name, x.name));
    o.push({ schema: l, table: a.name, inserts: y, sequenceResets: _ });
  }
  return o;
}
var PT,
  Nh,
  Rc = b(() => {
    Pr();
    oo();
    ((PT = new Set([
      "auth",
      "storage",
      "realtime",
      "supabase_functions",
      "graphql",
      "graphql_public",
      "extensions",
      "pgsodium",
      "pgsodium_masks",
      "vault",
      "information_schema",
      "pg_catalog",
      "pg_toast",
    ])),
      (Nh = new Set([
        "serial",
        "serial4",
        "bigserial",
        "serial8",
        "smallserial",
        "serial2",
      ])));
  });
async function Ih(e, t) {
  let { PGlite: n } = await We(
      "@supabase/lite/pglite",
      "pglite",
      "@electric-sql/pglite",
    ),
    r = new n(),
    s = [],
    i = 0,
    o = 0,
    a = 0,
    l = 0;
  try {
    for (let m of [
      "anon",
      "authenticated",
      "service_role",
      "supabase_auth_admin",
    ])
      await r.exec(`CREATE ROLE ${m}`);
    let c = zr(Ti);
    for (let m = 0; m < c.length; m++)
      try {
        await r.exec(c[m]);
      } catch (d) {
        return (
          s.push({
            phase: "schema",
            label: `auth helpers ${m + 1}/${c.length}`,
            statement: c[m],
            error: String(d),
          }),
          {
            ok: !1,
            baseSchemaStatements: i,
            schemaStatements: o,
            authInserts: a,
            dataInserts: l,
            failures: s,
          }
        );
      }
    let p = zr(no());
    i = p.length;
    for (let m = 0; m < p.length; m++)
      try {
        await r.exec(p[m]);
      } catch (d) {
        return (
          s.push({
            phase: "schema",
            label: `auth base schema ${m + 1}/${p.length}`,
            statement: p[m],
            error: String(d),
          }),
          {
            ok: !1,
            baseSchemaStatements: i,
            schemaStatements: o,
            authInserts: a,
            dataInserts: l,
            failures: s,
          }
        );
      }
    o = t.statements.length;
    for (let m of t.statements)
      try {
        await r.exec(m.sql);
      } catch (d) {
        return (
          s.push({
            phase: "schema",
            label: `${m.file} statement ${m.index}/${m.total}`,
            statement: m.sql,
            error: String(d),
          }),
          {
            ok: !1,
            baseSchemaStatements: i,
            schemaStatements: o,
            authInserts: a,
            dataInserts: l,
            failures: s,
          }
        );
      }
    let u = await ro(e, { target: "local" }),
      f = ["users", "sessions", "identities", "refresh_tokens"];
    for (let m of f) {
      let d = u[m];
      for (let g = 0; g < d.length; g++) {
        a++;
        try {
          await r.exec(d[g]);
        } catch (y) {
          s.push({
            phase: "auth",
            label: `auth.${m} row ${g + 1}/${d.length}`,
            statement: d[g],
            error: String(y),
          });
        }
      }
    }
    let h = await co(e, t);
    for (let m of h) {
      for (let d = 0; d < m.inserts.length; d++) {
        l++;
        try {
          await r.exec(m.inserts[d]);
        } catch (g) {
          s.push({
            phase: "data",
            label: `${m.schema}.${m.table} row ${d + 1}/${m.inserts.length}`,
            statement: m.inserts[d],
            error: String(g),
          });
        }
      }
      for (let d = 0; d < m.sequenceResets.length; d++)
        try {
          await r.exec(m.sequenceResets[d]);
        } catch (g) {
          s.push({
            phase: "data",
            label: `${m.schema}.${m.table} sequence reset ${d + 1}/${m.sequenceResets.length}`,
            statement: m.sequenceResets[d],
            error: String(g),
          });
        }
    }
  } finally {
    await r.close().catch(() => {});
  }
  return {
    ok: s.length === 0,
    baseSchemaStatements: i,
    schemaStatements: o,
    authInserts: a,
    dataInserts: l,
    failures: s,
  };
}
var Dh = b(() => {
  ln();
  Cc();
  Fr();
  Ac();
  $c();
  Rc();
});
function jh(e) {
  if (
    (console.log(O.default.bold("Readiness Report")),
    console.log(
      `  db reachable: ${e.dbReachable ? O.default.green("yes") : O.default.red("no")}  migration statements: ${O.default.cyan(e.schemaStatementCount)}  migration bytes: ${O.default.cyan(e.schemaBytes)}`,
    ),
    console.log(
      `  auth \u2014 users: ${O.default.cyan(e.auth.users)}  sessions: ${O.default.cyan(e.auth.sessions)}  identities: ${O.default.cyan(e.auth.identities)}  refresh_tokens: ${O.default.cyan(e.auth.refresh_tokens)}  jwt_secret: ${e.auth.jwt_secret_set ? O.default.green("set") : O.default.yellow("unset")}`,
    ),
    e.tables.length > 0)
  ) {
    console.log(O.default.dim("  tables:"));
    for (let t of e.tables) {
      let n =
          t.issues.length > 0
            ? O.default.yellow(` (${t.issues.length} issues)`)
            : "",
        r = t.schema ? `${t.schema}.` : "";
      console.log(`    ${r}${t.table}: ${O.default.cyan(t.rowCount)} rows${n}`);
    }
  }
  if (e.errors.length > 0) {
    console.log(O.default.red("Errors:"));
    for (let t of e.errors) console.log(`  ${O.default.red("\u2717")} ${t}`);
  }
  if (e.warnings.length > 0) {
    console.log(O.default.yellow("Warnings:"));
    for (let t of e.warnings) console.log(`  ${O.default.yellow("!")} ${t}`);
  }
  (console.log(),
    console.log(
      e.ok ? O.default.green("Ready to upgrade.") : O.default.red("Not ready."),
    ));
}
function Fh(e) {
  if (
    (console.log(),
    console.log(O.default.bold("Rehearsal (in-memory pglite)")),
    console.log(
      `  auth schema: ${O.default.cyan(e.baseSchemaStatements)} stmts  user migrations: ${O.default.cyan(e.schemaStatements)} stmts  auth: ${O.default.cyan(e.authInserts)} inserts  data: ${O.default.cyan(e.dataInserts)} inserts`,
    ),
    e.failures.length > 0)
  ) {
    console.log(O.default.red(`  ${e.failures.length} failure(s):`));
    for (let t of e.failures)
      (console.log(O.default.red(`    \u2717 [${t.phase}] ${t.label}`)),
        console.log(O.default.dim(`      ${t.statement}`)),
        console.log(O.default.dim(`      ${t.error}`)));
  }
  console.log(
    e.ok
      ? O.default.green("  rehearsal passed")
      : O.default.red("  rehearsal failed"),
  );
}
function Mh(e) {
  (console.log(),
    console.log(O.default.bold("SQLite Shim Audit")),
    console.log(
      `  fields: ${O.default.cyan(e.summary.total)}  passed: ${O.default.green(String(e.summary.passed))}  warned: ${O.default.yellow(String(e.summary.warned))}  failed: ${O.default.red(String(e.summary.failed))}`,
    ),
    e.results.length === 0 &&
      console.log(O.default.dim("  no shim-backed fields found")));
  for (let t of e.results.filter((n) => n.status !== "pass")) {
    let n = t.status === "fail" ? O.default.red : O.default.yellow;
    if (
      (console.log(
        `  ${n(t.status)} ${t.field} (${t.pg_type}) rows: ${O.default.cyan(t.rows_checked)} affected: ${O.default.cyan(t.affected_rows ?? 0)}`,
      ),
      t.message && console.log(`    ${t.message}`),
      t.samples?.length)
    )
      for (let r of t.samples)
        console.log(
          O.default.dim(
            `    sample ${JSON.stringify(r.id)} raw=${JSON.stringify(r.raw_value)}`,
          ),
        );
    t.action && console.log(O.default.dim(`    action: ${t.action}`));
  }
  console.log(
    e.summary.upgrade_safe
      ? O.default.green("  shim audit passed")
      : O.default.red("  shim audit failed"),
  );
}
function vc(e) {
  if (
    (console.log(),
    console.log(O.default.bold(O.default.green("Upgrade complete."))),
    console.log(),
    console.log(
      `  ${O.default.bold("Project URL:")} ${O.default.cyan(e.projectUrl)}`,
    ),
    console.log(
      `  ${O.default.bold("API URL:")}     ${O.default.cyan(e.apiUrl)}`,
    ),
    e.studioUrl &&
      console.log(
        `  ${O.default.bold("Studio URL:")} ${O.default.cyan(e.studioUrl)}`,
      ),
    console.log(
      `  ${O.default.bold("Ref:")}         ${O.default.cyan(e.projectRef)}`,
    ),
    console.log(),
    console.log(`  ${O.default.bold("anon key:")}         ${e.anonKey}`),
    console.log(`  ${O.default.bold("service_role key:")} ${e.serviceRoleKey}`),
    console.log(`  ${O.default.bold("db password:")}      ${e.dbPassword}`),
    console.log(),
    console.log(
      `  migrated auth \u2014 users: ${O.default.cyan(e.auth.users)}  sessions: ${O.default.cyan(e.auth.sessions)}  identities: ${O.default.cyan(e.auth.identities)}  refresh_tokens: ${O.default.cyan(e.auth.refresh_tokens)}`,
    ),
    console.log(
      `  jwt secret: ${e.jwtMigrated ? O.default.green("migrated") : O.default.yellow("not migrated \u2014 users must re-authenticate")}`,
    ),
    e.warnings.length > 0)
  ) {
    (console.log(), console.log(O.default.yellow("Warnings:")));
    for (let t of e.warnings) console.log(`  ${O.default.yellow("!")} ${t}`);
  }
  (console.log(),
    console.log(O.default.bold("Update your supabase-js client:")),
    console.log(`  url:     ${O.default.cyan(e.apiUrl)}`),
    console.log(`  anonKey: ${O.default.cyan(e.anonKey)}`),
    console.log());
}
var O,
  Uh = b(() => {
    O = z(J());
  });
function Bh(e) {
  return {
    kty: "oct",
    alg: "HS256",
    k: Buffer$1.from(e, "utf8").toString("base64url"),
  };
}
var qh = b(() => {
  ma();
});
function Pc(e) {
  return !e || e === "main" ? "public" : e;
}
function Zt(e) {
  return `"${e.replace(/"/g, '""')}"`;
}
function jT(e, t) {
  return Zt(e === "public" ? t : `${e}.${t}`);
}
function kc(e) {
  return `${e.schema}.${e.table}.${e.column}`;
}
function FT(e) {
  let t = e.filter((s) => s.status === "pass").length,
    n = e.filter((s) => s.status === "warn").length,
    r = e.filter((s) => s.status === "fail").length;
  return {
    total: e.length,
    passed: t,
    warned: n,
    failed: r,
    upgrade_safe: r === 0,
  };
}
async function MT(e) {
  let t = await io(e),
    n = [];
  for (let r of t.values())
    for (let s of r.all())
      s.isShimBacked &&
        Pc(s.context.schema) !== "auth" &&
        n.push({
          schema: Pc(s.context.schema),
          table: s.context.table,
          column: s.context.column,
          field: s,
        });
  return n;
}
function UT(e, t) {
  return e === "fail" || t === "fail"
    ? "fail"
    : e === "warn" || t === "warn"
      ? "warn"
      : "pass";
}
async function BT(e, t, n) {
  return (
    (await e.connection.introspect()).primary_keys.find(
      (i) => Pc(i.schema) === t && i.table === n,
    )?.columns ?? []
  );
}
async function qT(e, t) {
  if (e.connection.dialect !== "sqlite")
    return {
      field: kc(t),
      pg_type: t.field.context.pgTypeName,
      status: "warn",
      rows_checked: 0,
      affected_rows: 0,
      message: "Shim at-rest scan only applies to SQLite-backed projects.",
      action:
        "Run this audit against the SQLite Supalite project before upgrading.",
    };
  let r = jT(t.schema, t.table),
    s = await BT(e, t.schema, t.table),
    i = s.length > 0 ? s : ["rowid"],
    a = [
      ...(s.length > 0
        ? s.map((d) => `${Zt(d)} AS ${Zt(`id_${d}`)}`)
        : [`rowid AS ${Zt("id_rowid")}`]),
      `${Zt(t.column)} AS ${Zt("__lite_value")}`,
    ].join(", "),
    l;
  try {
    l = await e.connection.exec(`SELECT ${a} FROM ${r}`);
  } catch (d) {
    return {
      field: kc(t),
      pg_type: Nc(t.field),
      status: "fail",
      rows_checked: 0,
      affected_rows: 0,
      message: `Declared shim field could not be scanned in SQLite: ${String(d)}`,
      action:
        "Apply the declared schema to the local Supalite database, then rerun the dry-run audit before upgrading.",
    };
  }
  let c = l?.rows ?? [],
    p = "pass",
    u = 0,
    f = null,
    h,
    m = [];
  for (let d of c) {
    let g = t.field.validateStorage(d.__lite_value);
    if (
      ((p = UT(p, g.status)),
      g.status !== "pass" &&
        (u++, (f ??= g.message), (h ??= g.action), m.length < DT))
    ) {
      let y = {};
      for (let _ of i) y[_] = d[`id_${_}`];
      m.push({ id: y, raw_value: d.__lite_value });
    }
  }
  return {
    field: kc(t),
    pg_type: Nc(t.field),
    status: p,
    rows_checked: c.length,
    ...(u > 0 ? { affected_rows: u } : {}),
    message: f,
    ...(m.length > 0 ? { samples: m } : {}),
    ...(h ? { action: h } : {}),
  };
}
function Nc(e) {
  if (e instanceof st)
    return `${e.elementField ? Nc(e.elementField) : e.context.pgTypeName}[]`;
  if (e instanceof Kt && e.numericPrecision) {
    let { precision: t, scale: n } = e.numericPrecision;
    return `${e.context.pgTypeName}(${t},${n})`;
  }
  return e instanceof ue && e.lengthConstraint !== void 0
    ? `${e.context.pgTypeName}(${e.lengthConstraint})`
    : e.context.pgTypeName;
}
async function Oc(e, t) {
  let n = await MT(t),
    r = [];
  for (let s of n) r.push(await qT(e, s));
  return { summary: FT(r), results: r };
}
var DT,
  Hh = b(() => {
    Pr();
    wi();
    Ue();
    oo();
    DT = 3;
  });
function Gh(e) {
  let t = e.auth ?? {},
    n = {};
  return (
    typeof t.site_url == "string" && (n.site_url = t.site_url),
    Array.isArray(t.additional_redirect_urls) &&
      (n.uri_allow_list = t.additional_redirect_urls.join(",")),
    typeof t.jwt_expiry == "number" && (n.jwt_exp = t.jwt_expiry),
    typeof t.enable_signup == "boolean" &&
      (n.disable_signup = !t.enable_signup),
    typeof t.enable_anonymous_sign_ins == "boolean" &&
      (n.external_anonymous_users_enabled = t.enable_anonymous_sign_ins),
    typeof t.minimum_password_length == "number" &&
      (n.password_min_length = t.minimum_password_length),
    typeof t.email?.enable_confirmations == "boolean" &&
      (n.mailer_autoconfirm = !t.email.enable_confirmations),
    n
  );
}
var Wh = b(() => {});
function HT(e) {
  if (e.length === 0) return "";
  if (e.length === 1) return e[0];
  let t = e[0].match(Vh);
  if (!t) return e.map((i) => (i.trim().endsWith(";") ? i : `${i};`)).join(" ");
  let n = t[1],
    r = t[3] ?? "",
    s = [t[2]];
  for (let i = 1; i < e.length; i++) {
    let o = e[i].match(Vh);
    if (!o || o[1] !== n || (o[3] ?? "") !== r)
      return e.map((a) => (a.trim().endsWith(";") ? a : `${a};`)).join(" ");
    s.push(o[2]);
  }
  return `${n}${s.join(", ")}${r}`;
}
async function Kh(e, t, n = {}) {
  let r = n.sizes ?? [50, 10, 1],
    s = [],
    i = 0,
    o = t.length,
    a = async (l, c) => {
      if (l.length === 0) return;
      let p = r[c] ?? 1;
      if (l.length === 1 || p === 1) {
        for (let u of l) {
          try {
            await e.runSql(u);
          } catch (f) {
            s.push({ statement: u, error: String(f) });
          }
          (i++, n.onProgress?.(i, o));
        }
        return;
      }
      for (let u = 0; u < l.length; u += p) {
        let f = l.slice(u, u + p),
          h = HT(f);
        try {
          (await e.runSql(h), (i += f.length), n.onProgress?.(i, o));
        } catch {
          await a(f, c + 1);
        }
      }
    };
  return (await a(t, 0), s);
}
var Vh,
  zh = b(() => {
    Vh =
      /^(INSERT INTO [^(]+\([^)]+\)\s*VALUES\s*)(\(.*\))(\s*ON CONFLICT[\s\S]*)?$/i;
  });
async function GT(e, t, n, r) {
  r.onSql?.(t, n);
  try {
    await e.runSql(t);
  } catch (s) {
    throw new Error(
      `Failed SQL (${n}): ${String(s)}
${t}`,
      { cause: s },
    );
  }
}
async function Nn(e, t, n, r, s = {}) {
  if (n.length === 0) return;
  r.onBatchStart?.(t, n.length);
  let i = await Kh(e, n, {
    sizes: s.sizes ?? r.batchSizes,
    onProgress: (o, a) => r.onBatchProgress?.(t, o, a),
  });
  if (i.length > 0)
    throw (
      r.onBatchFailure?.(t, i),
      new Error(`${t} had ${i.length} failures`)
    );
  r.onBatchEnd?.(t, n.length, s.unit ?? "rows");
}
async function Lc(e, t, n, r) {
  r.onSchemaStart?.(n.statements.length);
  let s = 0;
  for (let c of n.files) {
    let p = n.statements.filter((u) => u.file === c.filename).length;
    p !== 0 &&
      (await GT(
        t,
        c.sql,
        `${c.filename} (${p} statement${p === 1 ? "" : "s"})`,
        r,
      ),
      (s += p),
      r.onSchemaProgress?.(s, n.statements.length));
  }
  r.onSchemaEnd?.(n.statements.length);
  let i = await ro(e, { target: r.authTarget ?? "supabase" }),
    o = {
      users: i.users.length,
      sessions: r.migrateSessions ? i.sessions.length : 0,
      identities: i.identities.length,
      refresh_tokens: r.migrateSessions ? i.refresh_tokens.length : 0,
    };
  (await Nn(t, "Migrating auth.users", i.users, r),
    await Nn(t, "Migrating auth.identities", i.identities, r),
    r.migrateSessions
      ? (await Nn(t, "Migrating auth.sessions", i.sessions, r),
        await Nn(t, "Migrating auth.refresh_tokens", i.refresh_tokens, r))
      : (i.sessions.length > 0 || i.refresh_tokens.length > 0) &&
        r.onSkip?.(
          `Skipped ${i.sessions.length} sessions and ${i.refresh_tokens.length} refresh tokens (existing tokens will be invalidated).`,
        ));
  let a = await co(e, n),
    l = a.filter((c) => c.inserts.length > 0);
  l.length === 0 && r.onSkip?.("No user data rows to migrate.");
  for (let c of l)
    await Nn(t, `Migrating ${c.schema}.${c.table}`, c.inserts, r);
  for (let c of l)
    await Nn(
      t,
      `Resetting ${c.schema}.${c.table} sequences`,
      c.sequenceResets,
      r,
      { sizes: [1], unit: "statements" },
    );
  if (r.syncAuthConfig !== false && t.updateAuthConfig) {
    let c = Gh(e.config);
    Object.keys(c).length > 0 &&
      (r.onAuthConfigStart?.(),
      await t.updateAuthConfig(c),
      r.onAuthConfigEnd?.());
  }
  return { schemaStatements: n.statements.length, auth: o, dataTables: a };
}
var Xh = b(() => {
  Wh();
  $c();
  Rc();
  zh();
});
function Qr(e) {
  return e.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function Jh(e, t = new Map()) {
  if (!e || typeof e != "object") return t;
  for (let [n, r] of Object.entries(e))
    typeof r == "string"
      ? t.set(Qr(n), r)
      : r && typeof r == "object" && Jh(r, t);
  return t;
}
function Jr(e, t, n) {
  for (let r of t) {
    let s = e.get(Qr(r));
    if (s) return s;
  }
  throw new Error(`Supabase status JSON is missing ${n}`);
}
function XT(e) {
  let t = JSON.parse(e),
    n = Jh(t);
  return {
    apiUrl: Jr(n, ["API_URL", "api_url", "API URL", "Project URL"], "API URL"),
    studioUrl:
      n.get(Qr("Studio URL")) ??
      n.get(Qr("STUDIO_URL")) ??
      n.get(Qr("studio_url")),
    dbUrl: Jr(n, ["DB_URL", "db_url", "DB URL"], "DB URL"),
    anonKey: Jr(
      n,
      ["ANON_KEY", "anon_key", "anon key", "Publishable"],
      "anon key",
    ),
    serviceRoleKey: Jr(
      n,
      ["SERVICE_ROLE_KEY", "service_role_key", "service role key", "Secret"],
      "service role key",
    ),
    jwtSecret: Jr(n, ["JWT_SECRET", "jwt_secret", "JWT secret"], "JWT secret"),
  };
}
function Yh(e) {
  try {
    return decodeURIComponent(new URL(e).password);
  } catch {
    return "";
  }
}
function Qh(e = process.cwd()) {
  return e;
}
async function JT() {
  return await new Promise((e, t) => {
    let n = WT.createServer();
    (n.once("error", t),
      n.listen(0, "127.0.0.1", () => {
        let r = n.address();
        n.close(() => {
          typeof r == "object" && r
            ? e(r.port)
            : t(new Error("Could not allocate a free local port"));
        });
      }));
  });
}
async function YT() {
  let e = new Set(),
    t = async () => {
      for (;;) {
        let n = await JT();
        if (!e.has(n)) return (e.add(n), n);
      }
    };
  return {
    api: await t(),
    db: await t(),
    shadow: await t(),
    studio: await t(),
    inbucket: await t(),
    analytics: await t(),
    pooler: await t(),
    edgeInspector: await t(),
  };
}
async function Yr(e, t = {}) {
  let n = process.env.LITE_SUPABASE_CLI?.split(/\s+/).filter(Boolean) ?? KT,
    { spawn: r } = await import("node:child_process").catch(() => {
      throw new Error(
        "Local Supabase upgrade requires a Node-compatible runtime",
      );
    }),
    [s, ...i] = n;
  return await new Promise((o, a) => {
    let l = r(s, [...i, ...e], {
        cwd: t.cwd,
        env: {
          ...process.env,
          SUPABASE_TELEMETRY_DISABLED: "1",
          DO_NOT_TRACK: "1",
        },
      }),
      c = [],
      p = [],
      u = setTimeout(() => l.kill(), t.timeoutMs ?? 12e4);
    (l.stdout?.on("data", (f) => c.push(Buffer.from(f))),
      l.stderr?.on("data", (f) => p.push(Buffer.from(f))),
      l.on("error", (f) => {
        (clearTimeout(u), a(f));
      }),
      l.on("close", (f) => {
        clearTimeout(u);
        let h = Buffer.concat(c).toString("utf8"),
          m = Buffer.concat(p).toString("utf8");
        if (f !== 0) {
          a(
            new Error(
              [
                `supabase ${e.join(" ")} failed with exit code ${f}`,
                h,
                m,
              ].filter(Boolean).join(`
`),
            ),
          );
          return;
        }
        o({ stdout: h, stderr: m });
      }));
  });
}
function le(e, t, n, r) {
  let s = new RegExp(`(\\[${t.replace(".", "\\.")}\\][\\s\\S]*?)(?=\\n\\[|$)`),
    i = e.match(s);
  if (!i)
    return `${e.trimEnd()}

[${t}]
${n} = ${r}
`;
  let o = i[1],
    a = new RegExp(`(^${n}\\s*=\\s*).*$`, "m"),
    l = a.test(o)
      ? o.replace(a, `$1${r}`)
      : `${o.trimEnd()}
${n} = ${r}
`;
  return e.replace(o, l);
}
function QT(e, t, n) {
  let r = new RegExp(`(\\[${t.replace(".", "\\.")}\\][\\s\\S]*?)(?=\\n\\[|$)`),
    s = e.match(r);
  if (!s) return e;
  let i = s[1],
    o = n.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
    a = new RegExp(`^\\s*(${o})\\s*=.*(?:\\n|$)`, "gm");
  return e.replace(i, i.replace(a, ""));
}
function ZT(e) {
  return QT(e, "db", ["driver", "url"]);
}
function eC(e) {
  let t = e.match(/(\[db\][\s\S]*?)(?=\n\[|$)/)?.[1];
  return t
    ? /^\s*driver\s*=\s*["'](sqlite|sqlite-postgres|pglite|postgres)["']/m.test(
        t,
      )
      ? true
      : /^\s*url\s*=/m.test(t)
    : false;
}
async function Ic(e) {
  return await he__default
    .access(e)
    .then(() => true)
    .catch(() => false);
}
async function Zh(e) {
  let t = Fe__default.join(e, "supabase", "config.toml");
  if (!(await Ic(t))) return null;
  let n = await he__default.readFile(t, "utf-8");
  if (!eC(n)) return null;
  let r = `${t}.bak`;
  return ((await Ic(r)) || (await he__default.writeFile(r, n, "utf-8")), r);
}
async function tC(e) {
  let t = Fe__default.join(e, "supabase", "config.toml");
  (await Ic(t)) ||
    (await he__default.mkdir(e, { recursive: true }),
    await Yr(["init", "--workdir", e, "--yes"], { timeoutMs: 6e4 }));
}
async function nC(e, t, n) {
  let r = Fe__default.join(e, "supabase", "config.toml"),
    s = ZT(await he__default.readFile(r, "utf-8"));
  ((s = s.replace(/^project_id\s*=.*$/m, `project_id = "${t}"`)),
    (s = le(s, "api", "port", String(n.api))),
    (s = le(s, "db", "port", String(n.db))),
    (s = le(s, "db", "shadow_port", String(n.shadow))),
    (s = le(s, "db", "major_version", "15")),
    (s = le(s, "db.seed", "enabled", "false")),
    (s = le(s, "studio", "enabled", "true")),
    (s = le(s, "studio", "port", String(n.studio))),
    (s = le(s, "inbucket", "enabled", "false")),
    (s = le(s, "inbucket", "port", String(n.inbucket))),
    (s = le(s, "realtime", "enabled", "false")),
    (s = le(s, "storage", "enabled", "false")),
    (s = le(s, "edge_runtime", "enabled", "false")),
    (s = le(s, "edge_runtime", "inspector_port", String(n.edgeInspector))),
    (s = le(s, "analytics", "enabled", "false")),
    (s = le(s, "analytics", "port", String(n.analytics))),
    (s = le(s, "db.pooler", "enabled", "false")),
    (s = le(s, "db.pooler", "port", String(n.pooler))),
    await he__default.writeFile(r, s, "utf-8"));
}
function eg(e) {
  return JSON.stringify(e);
}
function rC(e) {
  return `[${e.map(eg).join(", ")}]`;
}
async function sC(e, t) {
  if (!t) return;
  let n = Fe__default.join(e, "supabase", "config.toml"),
    r = await he__default.readFile(n, "utf-8"),
    s = t.auth ?? {},
    i = s.email ?? {},
    o = t.api ?? {};
  (typeof o.max_rows == "number" &&
    (r = le(r, "api", "max_rows", String(o.max_rows))),
    typeof s.site_url == "string" &&
      (r = le(r, "auth", "site_url", eg(s.site_url))),
    Array.isArray(s.additional_redirect_urls) &&
      (r = le(
        r,
        "auth",
        "additional_redirect_urls",
        rC(s.additional_redirect_urls),
      )),
    typeof s.jwt_expiry == "number" &&
      (r = le(r, "auth", "jwt_expiry", String(s.jwt_expiry))),
    typeof s.enable_signup == "boolean" &&
      (r = le(r, "auth", "enable_signup", String(s.enable_signup))),
    typeof s.enable_anonymous_sign_ins == "boolean" &&
      (r = le(
        r,
        "auth",
        "enable_anonymous_sign_ins",
        String(s.enable_anonymous_sign_ins),
      )),
    typeof s.minimum_password_length == "number" &&
      (r = le(
        r,
        "auth",
        "minimum_password_length",
        String(s.minimum_password_length),
      )),
    typeof i.enable_confirmations == "boolean" &&
      (r = le(
        r,
        "auth.email",
        "enable_confirmations",
        String(i.enable_confirmations),
      )),
    await he__default.writeFile(n, r, "utf-8"));
}
var KT,
  zT,
  uo,
  tg = b(() => {
    ln();
    ((KT = ["bunx", "supabase@2.98.1"]),
      (zT = [
        "mailpit",
        "realtime",
        "storage-api",
        "imgproxy",
        "edge-runtime",
        "logflare",
        "vector",
        "supavisor",
      ]));
    uo = class e {
      constructor(t, n, r, s) {
        this.workdir = t;
        this.projectId = n;
        this.status = r;
        this.cleanupOnStop = s;
      }
      stopped = false;
      static async start(t = {}) {
        let n =
            t.workdir ??
            (await he__default.mkdtemp(
              Fe__default.join(vb.tmpdir(), "lite-local-supa-"),
            )),
          r = t.projectId ?? `lite-local-${Date.now().toString(36)}`,
          s = t.cleanupOnStop ?? !t.workdir,
          i = await YT();
        try {
          (await tC(n),
            await nC(n, r, i),
            await sC(n, t.sourceConfig),
            await Yr(
              ["start", "--workdir", n, "--yes", "--exclude", zT.join(",")],
              { timeoutMs: 5 * 6e4 },
            ));
          let { stdout: o } = await Yr(
            ["status", "--workdir", n, "-o", "json"],
            { timeoutMs: 6e4 },
          );
          return new e(n, r, XT(o), s);
        } catch (o) {
          throw (
            await Yr(["stop", "--workdir", n, "--no-backup"], {
              timeoutMs: 12e4,
            }).catch(() => {}),
            s &&
              (await he__default
                .rm(n, { recursive: true, force: true })
                .catch(() => {})),
            o
          );
        }
      }
      async runSql(t) {
        let { createPostgresConnection: n } = await We(
            "@supabase/lite/postgres",
            "postgres",
            "postgres",
          ),
          r = n({ url: this.status.dbUrl });
        try {
          await r.exec(t);
        } finally {
          await r.close();
        }
      }
      async stop() {
        this.stopped ||
          ((this.stopped = true),
          await Yr(["stop", "--workdir", this.workdir, "--no-backup"], {
            timeoutMs: 12e4,
          }).catch(() => {}),
          this.cleanupOnStop &&
            (await he__default.rm(this.workdir, {
              recursive: true,
              force: true,
            })));
      }
    };
  });
function iC(e) {
  try {
    Eu(e ?? "", { panic: !0 });
    return;
  } catch (t) {
    return t;
  }
}
async function po() {
  let e = await Cn({
    message: "Email",
    placeholder: "Enter your email",
    validate: iC,
  });
  return (we(e) && process.exit(1), e);
}
async function ng() {
  let e = await Cn({
    message: "Confirmation code",
    placeholder: "Enter the 6-digit code from your email",
    validate: (t) =>
      /^\d{6}$/.test(t ?? "") ? void 0 : "Enter a 6-digit code",
  });
  return (we(e) && process.exit(1), e);
}
async function fo(e = false) {
  let t = await Hr({
    message: "Password",
    validate: (n) => {
      try {
        _u(n, { panic: !0 });
        return;
      } catch (r) {
        return r;
      }
    },
  });
  if ((we(t) && process.exit(1), e)) {
    let n = await Hr({
      message: "Confirm Password",
      validate: (r) => {
        try {
          if (r !== t) throw new Error("Passwords do not match");
          return;
        } catch (s) {
          return s;
        }
      },
    });
    we(n) && process.exit(1);
  }
  return t;
}
async function mo() {
  let e = await Cn({
    message: "Project Name",
    placeholder: "Enter your project name",
    validate: (t) => (t?.trim() ? void 0 : "Project name is required"),
  });
  return (we(e) && process.exit(1), e.trim());
}
async function ho(e) {
  let t = await qr({ message: e, initialValue: true });
  return (we(t) && process.exit(1), t);
}
var On = b(() => {
  it();
  Gn();
});
var ag = {};
pe(ag, {
  isNonInteractive: () => Dc,
  resolveSessionMigration: () => og,
  resolveTarget: () => ig,
  upgrade: () => dC,
});
async function aC(e, t) {
  let n = await e.listOrganizations();
  if (n.length === 0)
    throw new Error("No Supabase organizations found for this token");
  if (t) {
    let s = n.find((i) => i.id === t || i.slug === t);
    if (!s) throw new Error(`Organization not found: ${t}`);
    return s;
  }
  if (n.length === 1) return n[0];
  let r = await Gr({
    message: "Select organization",
    options: n.map((s) => ({ value: s.id, label: `${s.name} (${s.slug})` })),
  });
  return (we(r) && process.exit(1), n.find((s) => s.id === r));
}
async function cC(e, t, n) {
  if (n) return n;
  let r = lC;
  try {
    let o = (await e.listRegions(t)).regions ?? [];
    o.length > 0 &&
      (r = o.map((a) => ({
        key: a.key,
        label: a.display_name ?? a.name ?? a.key,
      })));
  } catch {}
  let s = await Gr({
    message: "Select region",
    options: r.map((i) => ({ value: i.key, label: i.label })),
  });
  return (we(s) && process.exit(1), s);
}
async function uC(e) {
  if (e) return e;
  let t = await Cn({
    message: "Project name",
    placeholder: "my-project",
    validate: (n) => (n && n.trim().length > 0 ? void 0 : "Name is required"),
  });
  return (we(t) && process.exit(1), t);
}
function pC() {
  return oC.randomBytes(24).toString("base64url");
}
function ig(e) {
  let t = e ?? "hosted";
  if (t === "hosted" || t === "local") return t;
  throw new Error(`Unknown upgrade target '${t}'. Use 'hosted' or 'local'.`);
}
function Dc() {
  return (
    process.env.CI === "true" ||
    process.env.LITE_NON_INTERACTIVE === "1" ||
    !process.stdin.isTTY
  );
}
async function fC(e) {
  if (typeof e == "boolean") return e;
  if (Dc()) return false;
  let t = await qr({
    message:
      "Migrate existing sessions (transfers JWT secret, sessions, refresh tokens)?",
    initialValue: false,
  });
  return (we(t) && process.exit(1), t);
}
async function mC(e) {
  if (e) return e;
  let t = process.env.SUPABASE_ACCESS_TOKEN;
  if (t) return t;
  re.info(
    "Create a personal access token at https://supabase.com/dashboard/account/tokens",
  );
  let n = await Hr({
    message: "Supabase access token",
    validate: (r) => (r && r.trim().length > 0 ? void 0 : "Token is required"),
  });
  return (we(n) && process.exit(1), n);
}
async function og(e) {
  if (!e.requested) return { migrateSessions: false, weakReasons: [] };
  if (!e.jwtSecret)
    throw new Error(
      "Cannot migrate sessions because auth.jwt_secret is not configured. Re-run with --no-migrate-sessions to skip session migration.",
    );
  let t = Yn(e.jwtSecret);
  if (t.strong || e.allowWeakJwtSecret)
    return {
      migrateSessions: true,
      jwtSecret: e.jwtSecret,
      weakReasons: t.reasons,
    };
  if (Dc())
    throw new Error(
      [
        "Cannot migrate sessions because auth.jwt_secret looks weak:",
        ...t.reasons.map((r) => `- ${r}`),
        "Use --allow-weak-jwt-secret to preserve existing sessions anyway, or --no-migrate-sessions to require users to sign in again.",
      ].join(`
`),
    );
  re.warning(
    [
      "auth.jwt_secret looks weak and will become a trusted Supabase signing key:",
      ...t.reasons.map((r) => `- ${r}`),
    ].join(`
`),
  );
  let n = await qr({
    message: "Preserve existing sessions anyway by importing this JWT secret?",
    initialValue: false,
  });
  return (
    we(n) && process.exit(1),
    n
      ? {
          migrateSessions: true,
          jwtSecret: e.jwtSecret,
          weakReasons: t.reasons,
        }
      : { migrateSessions: false, weakReasons: t.reasons }
  );
}
var Ce,
  lC,
  dC,
  lg = b(() => {
    Ce = z(J());
    it();
    Ie();
    Ee();
    bh();
    Ah();
    Dh();
    Uh();
    qh();
    Hh();
    oo();
    Xh();
    tg();
    On();
    Vr();
    Se();
    lC = [
      { key: "us-east-1", label: "East US (N. Virginia)" },
      { key: "us-east-2", label: "East US (Ohio)" },
      { key: "us-west-1", label: "West US (N. California)" },
      { key: "us-west-2", label: "West US (Oregon)" },
      { key: "ca-central-1", label: "Canada (Central)" },
      { key: "sa-east-1", label: "South America (S\xE3o Paulo)" },
      { key: "eu-west-1", label: "West EU (Ireland)" },
      { key: "eu-west-2", label: "West Europe (London)" },
      { key: "eu-west-3", label: "West EU (Paris)" },
      { key: "eu-central-1", label: "Central EU (Frankfurt)" },
      { key: "eu-central-2", label: "Central Europe (Zurich)" },
      { key: "eu-north-1", label: "North EU (Stockholm)" },
      { key: "ap-south-1", label: "South Asia (Mumbai)" },
      { key: "ap-southeast-1", label: "Southeast Asia (Singapore)" },
      { key: "ap-southeast-2", label: "Oceania (Sydney)" },
      { key: "ap-northeast-1", label: "Northeast Asia (Tokyo)" },
      { key: "ap-northeast-2", label: "Northeast Asia (Seoul)" },
    ];
    dC = (e) =>
      e
        .command("upgrade")
        .description("[lite] Upgrade this Supalite project to full Supabase")
        .option("--dry-run", "Check readiness without making changes", false)
        .option("--force", "Perform the upgrade", false)
        .option(
          "--target <target>",
          "'hosted' or 'local' Supabase target",
          "hosted",
        )
        .option(
          "--mode <mode>",
          "'user' or 'platform' (only 'user' is supported)",
          "user",
        )
        .option("--org-id <id>", "Supabase organization ID or slug")
        .option("--region <region>", "Project region key")
        .option("--project-name <name>", "Name for the new Supabase project")
        .option("--supabase-token <token>", "Supabase personal access token")
        .option("--local-dir <path>", "Supabase CLI workdir for --target local")
        .option(
          "--migrate-sessions",
          "Transfer existing sessions, refresh tokens, and JWT secret so current tokens keep working",
        )
        .option(
          "--no-migrate-sessions",
          "Skip sessions, refresh tokens, and JWT secret",
        )
        .option(
          "--allow-weak-jwt-secret",
          "Allow --migrate-sessions to import a weak JWT secret non-interactively",
          false,
        )
        .option("--dump-credentials <path>", "Write credentials to a file")
        .option("--config <config>", "Path to the local config file")
        .option("--verbose", "Echo each SQL statement sent to Supabase", false)
        .option("--json", "Emit machine-readable JSON for --dry-run", false)
        .helpGroup("Management APIs:")
        .action(async (t) => {
          let n = t.dryRun && t.json,
            r = console.log;
          (n || console.log(),
            await X(async () => {
              await Y(t.config);
              let s = ig(t.target);
              if (
                (gc("upgrade.target", s),
                gc("upgrade.dry_run", !!t.dryRun),
                s === "hosted" && t.localDir)
              )
                throw new Error(
                  "--local-dir can only be used with --target local.",
                );
              if (s === "hosted" && t.mode && t.mode !== "user")
                throw new Error(
                  `Mode '${t.mode}' is not yet supported. Only 'user' mode is available.`,
                );
              if (s === "local" && t.mode && t.mode !== "user")
                throw new Error("--mode only applies to hosted upgrades.");
              n && (console.log = () => {});
              let i;
              try {
                i = await (
                  await V({ withSupabaseClient: !1 })
                ).project.local.createApp(t.config);
              } finally {
                n && (console.log = r);
              }
              let o = await Ph(i);
              if (n) {
                let R = await runUpgradeDryRun({
                  readiness: () => Ch(i, o),
                  audit: () => Oc(i, o),
                  rehearsal: () => Ih(i, o),
                });
                await writeUpgradeDryRunReport(R, process.stdout);
                R.summary.upgrade_safe || process.exit(1);
                return;
              }
              console.log(Ce.default.dim("Running readiness checks..."));
              let a = await Wr("readiness", () => Ch(i, o));
              if ((jh(a), !a.ok))
                throw new Error("Readiness checks failed. See errors above.");
              let l = async () => {
                console.log(
                  Ce.default.dim(`
Rehearsing upgrade against in-memory pglite...`),
                );
                let R = await Wr("rehearsal", () => Ih(i, o));
                return (Fh(R), R.ok);
              };
              if (t.dryRun) {
                let R = await Oc(i, o);
                (Mh(R),
                  R.summary.upgrade_safe || process.exit(1),
                  (await l()) || process.exit(1));
                return;
              }
              if (!t.force && !(await ho("Proceed with upgrade?"))) return;
              if (!(await l()))
                throw new Error("Rehearsal failed. Upgrade aborted.");
              if (s === "local") {
                if (t.migrateSessions === !0)
                  throw new Error(
                    "--target local does not support preserving existing sessions yet. Re-run with --no-migrate-sessions.",
                  );
                let R = Fe__default.resolve(t.localDir ?? Qh()),
                  F = await Zh(R),
                  j = null;
                if (F) {
                  let H = Fe__default.relative(process.cwd(), F) || F;
                  j = `Your project's supabase/config.toml was rewritten in place for the local Supabase CLI. The original was backed up to ${H}. To resume supalite dev (bun run dev), restore it: cp ${H} supabase/config.toml (or git checkout supabase/config.toml). Pass --local-dir <separate-dir> next time to keep the local stack isolated.`;
                }
                let w = hc(),
                  S,
                  I;
                try {
                  (w.start(`Starting local Supabase in ${R}`),
                    (S = await uo.start({
                      workdir: R,
                      cleanupOnStop: !1,
                      sourceConfig: i.config,
                    })),
                    w.stop(`Local Supabase is running at ${S.status.apiUrl}`),
                    (I = await Wr("apply", () =>
                      Lc(i, S, o, {
                        migrateSessions: !1,
                        authTarget: "supabase",
                        syncAuthConfig: !1,
                        onSql: (H, ne) => {
                          t.verbose &&
                            console.log(
                              Ce.default.dim(`-- ${ne}
${H}`),
                            );
                        },
                        onSchemaStart: (H) =>
                          w.start(`Applying schema (0/${H})`),
                        onSchemaProgress: (H, ne) =>
                          w.message(`Applying schema (${H}/${ne})`),
                        onSchemaEnd: (H) =>
                          w.stop(`Schema applied (${H} statements)`),
                        onBatchStart: (H, ne) => w.start(`${H} (0/${ne})`),
                        onBatchProgress: (H, ne, Re) =>
                          w.message(`${H} (${ne}/${Re})`),
                        onBatchEnd: (H, ne, Re) => w.stop(`${H} (${ne} ${Re})`),
                        onBatchFailure: (H, ne) => {
                          w.stop(Ce.default.red(`${H}: ${ne.length} failed`));
                          for (let Re of ne)
                            (console.log(
                              Ce.default.red(`  \u2717 ${Re.error}`),
                            ),
                              t.verbose &&
                                console.log(
                                  Ce.default.dim(`    ${Re.statement}`),
                                ));
                        },
                        onSkip: (H) => console.log(Ce.default.dim(H)),
                      }),
                    )));
                } catch (H) {
                  throw (
                    j &&
                      console.log(
                        Ce.default.yellow(`
${j}`),
                      ),
                    H
                  );
                }
                let D = [
                  "Sessions and JWT secret not migrated. Existing tokens are invalid \u2014 users must re-authenticate.",
                  "Management API auth config sync is skipped for --target local; supported local auth settings are written before Supabase starts.",
                ];
                (j && D.unshift(j),
                  i.config.storage?.enabled &&
                    D.push("Storage migration is not yet supported."),
                  i.config.realtime?.enabled &&
                    D.push("Realtime config migration is not yet supported."));
                let K = Yh(S.status.dbUrl);
                if (t.dumpCredentials) {
                  let H = JSON.stringify(
                    {
                      target: "local",
                      workdir: S.workdir,
                      projectUrl: S.status.apiUrl,
                      apiUrl: S.status.apiUrl,
                      studioUrl: S.status.studioUrl,
                      dbUrl: S.status.dbUrl,
                      anonKey: S.status.anonKey,
                      serviceRoleKey: S.status.serviceRoleKey,
                      dbPassword: K,
                    },
                    null,
                    2,
                  );
                  (await he__default.writeFile(t.dumpCredentials, H, "utf-8"),
                    console.log(
                      Ce.default.dim(
                        `Credentials written to ${t.dumpCredentials}`,
                      ),
                    ));
                }
                vc({
                  projectRef: S.projectId,
                  projectUrl: S.status.apiUrl,
                  apiUrl: S.status.apiUrl,
                  studioUrl: S.status.studioUrl,
                  anonKey: S.status.anonKey,
                  serviceRoleKey: S.status.serviceRoleKey,
                  dbPassword: K,
                  auth: I.auth,
                  jwtMigrated: !1,
                  warnings: [`Local Supabase workdir: ${S.workdir}`, ...D],
                });
                return;
              }
              let p = await mC(t.supabaseToken),
                u = new eo(p);
              try {
                await u.listOrganizations();
              } catch (R) {
                throw new Error(`Supabase access token rejected: ${String(R)}`);
              }
              let f = await aC(u, t.orgId),
                h = await cC(u, f.slug, t.region),
                m = await uC(t.projectName),
                d = await fC(t.migrateSessions),
                g = await og({
                  requested: d,
                  jwtSecret: i.config.auth?.jwt_secret,
                  allowWeakJwtSecret: t.allowWeakJwtSecret,
                }),
                y = g.migrateSessions,
                _ = pC(),
                x = hc();
              x.start("Creating Supabase project");
              let $ = await u.createProject({
                  organization_id: f.id,
                  name: m,
                  db_pass: _,
                  region: h,
                }),
                C = $.ref ?? $.id;
              if (
                (x.stop(`Project created: ${C}`),
                x.start("Waiting for project to become active"),
                await u.waitForActive(C, {
                  onTick: (R) => x.message(`Project status: ${R}`),
                }),
                x.stop("Project is active"),
                y)
              ) {
                x.start("Importing JWT signing key");
                try {
                  await u.createSigningKey(C, {
                    algorithm: "HS256",
                    status: "in_use",
                    private_jwk: Bh(g.jwtSecret),
                  });
                } catch (R) {
                  throw (
                    x.stop(Ce.default.red("JWT signing key import failed")),
                    new Error(
                      [
                        "Session migration is not available for this Supabase project, token, or plan.",
                        "The upgrade cannot preserve existing Supalite sessions without importing auth.jwt_secret as a signing key.",
                        "Re-run with --no-migrate-sessions if requiring users to sign in again is acceptable.",
                        `Supabase response: ${String(R)}`,
                      ].join(" "),
                    )
                  );
                }
                x.stop("JWT signing key imported");
              }
              let A = (
                  await Wr("apply", () =>
                    Lc(
                      i,
                      {
                        runSql: (R) => u.runSql(C, R),
                        updateAuthConfig: (R) => u.updateAuthConfig(C, R),
                      },
                      o,
                      {
                        migrateSessions: y,
                        authTarget: "supabase",
                        onSql: (R, F) => {
                          t.verbose &&
                            console.log(
                              Ce.default.dim(`-- ${F}
${R}`),
                            );
                        },
                        onSchemaStart: (R) =>
                          x.start(`Applying schema (0/${R})`),
                        onSchemaProgress: (R, F) =>
                          x.message(`Applying schema (${R}/${F})`),
                        onSchemaEnd: (R) =>
                          x.stop(`Schema applied (${R} statements)`),
                        onBatchStart: (R, F) => {
                          x.start(`${R} (0/${F})`);
                        },
                        onBatchProgress: (R, F, j) =>
                          x.message(`${R} (${F}/${j})`),
                        onBatchEnd: (R, F, j) => x.stop(`${R} (${F} ${j})`),
                        onBatchFailure: (R, F) => {
                          x.stop(Ce.default.red(`${R}: ${F.length} failed`));
                          for (let j of F)
                            (console.log(Ce.default.red(`  \u2717 ${j.error}`)),
                              t.verbose &&
                                console.log(
                                  Ce.default.dim(`    ${j.statement}`),
                                ));
                        },
                        onAuthConfigStart: () => x.start("Syncing auth config"),
                        onAuthConfigEnd: () => x.stop("Auth config synced"),
                        onSkip: (R) => console.log(Ce.default.dim(R)),
                      },
                    ),
                  )
                ).auth,
                T = yh(await u.getApiKeys(C)),
                L = `https://${C}.${u.projectDomain}`,
                E = [];
              if (
                (y
                  ? g.weakReasons.length > 0
                    ? E.push(
                        `A weak JWT secret was imported to preserve sessions: ${g.weakReasons.join("; ")}.`,
                      )
                    : E.push(
                        "Sessions preserved by importing auth.jwt_secret as a Supabase signing key.",
                      )
                  : E.push(
                      "Sessions and JWT secret not migrated. Existing tokens are invalid \u2014 users must re-authenticate.",
                    ),
                i.config.storage?.enabled &&
                  E.push("Storage migration is not yet supported."),
                i.config.realtime?.enabled &&
                  E.push("Realtime config migration is not yet supported."),
                t.dumpCredentials)
              ) {
                let R = JSON.stringify(
                  {
                    ref: C,
                    projectUrl: L,
                    anonKey: T.anon,
                    serviceRoleKey: T.service_role,
                    dbPassword: _,
                  },
                  null,
                  2,
                );
                (await he__default.writeFile(t.dumpCredentials, R, "utf-8"),
                  console.log(
                    Ce.default.dim(
                      `Credentials written to ${t.dumpCredentials}`,
                    ),
                  ));
              }
              vc({
                projectRef: C,
                projectUrl: L,
                apiUrl: L,
                anonKey: T.anon,
                serviceRoleKey: T.service_role,
                dbPassword: _,
                auth: A,
                jwtMigrated: !!(y && g.jwtSecret),
                warnings: E,
              });
            }));
        });
  });
var ug = {};
pe(ug, { login: () => hC, signInWithPassword: () => cg });
async function cg(e, t, n) {
  return e.signInWithPassword({ email: t, password: n });
}
var jc,
  hC,
  pg = b(() => {
    jc = z(J());
    it();
    On();
    Ie();
    Ee();
    hC = (e) => {
      e.command("login")
        .description("Login")
        .option("--json", "Output in JSON format")
        .helpGroup("Local Development:")
        .action(async (t) => {
          await X(async () => {
            let n = await V();
            re.message(
              jc.default.dim("Enter your credentials to login to the cloud"),
            );
            let r = await po(),
              s = await fo(),
              { data: i, error: o } = await cg(n.client.auth, r, s);
            (o && (re.error(o.message), process.exit(1)),
              t.json
                ? console.log(JSON.stringify(i, null, 2))
                : re.success(
                    `Authenticated as: ${jc.default.cyan(i.user.email)}`,
                  ));
          });
        });
    };
  });
var mg = {};
pe(mg, { logout: () => gC });
var fg,
  gC,
  dg = b(() => {
    fg = z(J());
    Ee();
    it();
    Ie();
    gC = (e) => {
      e.command("logout")
        .description("Logout")
        .helpGroup("Local Development:")
        .action(async () => {
          (console.log(),
            await X(async () => {
              let t = await V(),
                { error: n } = await t.client.auth.signOut();
              (n && (re.error(n.message), process.exit(1)),
                console.log(fg.default.green("Logged out successfully")));
            }));
        });
    };
  });
var gg = {};
pe(gg, { signUpWithVerification: () => hg, signup: () => yC });
async function hg(e, t, n, r = ng) {
  let s = await e.signUp({ email: t, password: n });
  if (s.error) throw s.error;
  if (s.data.session) return s.data;
  let i = await r(),
    o = await e.verifyOtp({ email: t, token: i, type: "signup" });
  if (o.error) throw o.error;
  if (!o.data.session)
    throw new Error("Email verification did not return a session");
  return o.data;
}
var Fc,
  yC,
  yg = b(() => {
    Fc = z(J());
    it();
    On();
    Ie();
    Ee();
    tt();
    yC = (e) => {
      e.command("signup")
        .description(de("Register a supalite cloud account"))
        .option("--json", "Output in JSON format")
        .helpGroup("Local Development:")
        .action(async (t) => {
          (re.message(
            Fc.default.dim("Enter your credentials to sign up to the cloud"),
          ),
            await X(async () => {
              let n = await V(),
                r = await po(),
                s = await fo(!0),
                i = await hg(n.client.auth, r, s);
              t.json
                ? console.log(JSON.stringify(i, null, 2))
                : re.success(
                    `Signed up as: ${Fc.default.cyan(i.user?.email ?? r)}`,
                  );
            }));
        });
    };
  });
var bg = {};
pe(bg, { whoami: () => bC });
var Mc,
  bC,
  wg = b(() => {
    Mc = z(J());
    Ee();
    it();
    Ie();
    tt();
    bC = (e) => {
      e.command("whoami")
        .description(de("Show the current authenticated user"))
        .option("--json", "Output in JSON format")
        .helpGroup("Local Development:")
        .action(async (t) => {
          (console.log(),
            await X(async () => {
              let n = await V(),
                { data: r, error: s } = await n.client.auth.getUser();
              (t.json
                ? console.log(JSON.stringify(r, null, 2))
                : r && "user" in r && r.user && "email" in r.user
                  ? (console.log(
                      `Authenticated as: ${Mc.default.cyan(r.user.email)}`,
                    ),
                    process.exit(0))
                  : (console.log(Mc.default.yellow("Not authenticated")),
                    process.exit(1)),
                s && (re.error(s.message), process.exit(1)));
            }));
        });
    };
  });
var Eg = {};
pe(Eg, { link: () => wC });
var Sg,
  wC,
  _g = b(() => {
    Ie();
    Ee();
    Se();
    it();
    ((Sg = z(J())),
      (wC = (e) =>
        e
          .command("link")
          .description("Link to a Supalite project")
          .option(
            "--project-ref <project-ref>",
            "The reference of the project to link to",
          )
          .option("--json", "Output in JSON format")
          .helpGroup("Local Development:")
          .action(async (t) => {
            (console.log(),
              await X(async () => {
                await Y();
                let n = await V();
                n.project.local.ref() &&
                  re.warning("Project is already linked.");
                let r = t.projectRef;
                if (!r) {
                  let i = await n.project.remote.list();
                  ((r = await Gr({
                    message: "Select a project:",
                    options: i.map((o) => ({
                      value: o.id,
                      hint: `name: ${o.name}, created: ${o.created_at}`,
                    })),
                  })),
                    we(r) && process.exit(1));
                }
                if (!r) throw new Error("No project ref found");
                console.log("Linking project", r);
                let s = await n.project.remote.get(r);
                (n.project.local.setRef(s.id),
                  console.log(
                    `Finished linking project ${Sg.default.cyan(s.id)}.`,
                  ));
              }));
          })));
  });
var xg = {};
pe(xg, { unlink: () => SC });
var SC,
  Tg = b(() => {
    Ie();
    Ee();
    Se();
    SC = (e) =>
      e
        .command("unlink")
        .description("Unlink from a Supalite project")
        .option("--json", "Output in JSON format")
        .helpGroup("Local Development:")
        .action(async () => {
          (console.log(),
            await X(async () => {
              (await Y(),
                (await V()).project.local.unlink(),
                console.log("Finished unlinking project."));
            }));
        });
  });
var Ag = {};
pe(Ag, { status: () => EC });
var Cg,
  EC,
  $g = b(() => {
    Ee();
    Ie();
    Se();
    Cg = z(J());
    tt();
    EC = (e) =>
      e
        .command("status")
        .description(de("Show information about the linked project"))
        .helpGroup("Local Development:")
        .action(async () => {
          (console.log(),
            await X(async () => {
              await Y();
              let t = await V(),
                n = await t.project.remote.get();
              (console.log(n),
                console.log(
                  `Project URL: ${Cg.default.cyan(t.project.remote.url(n.id))}`,
                ));
            }));
        });
  });
var vg = {};
pe(vg, { projects: () => _C });
var Uc,
  _C,
  xC,
  TC,
  kg = b(() => {
    On();
    it();
    Uc = z(J());
    Ie();
    Ee();
    Ie();
    ((_C = (e) => {
      e.command("projects")
        .description("Manage Supalite cloud projects")
        .helpGroup("Management APIs:")
        .addCommand(TC)
        .addCommand(xC);
    }),
      (xC = new Command$1()
        .name("list")
        .description("List projects")
        .helpGroup("Projects:")
        .action(async () => {
          await X(async () => {
            let t = await (await V()).project.remote.list();
            ((!Array.isArray(t) || t.length === 0) &&
              (re.info("No projects found"), process.exit(0)),
              console.log(
                Ld(t, {
                  omitKeys: ["config", "user_id"],
                  renderHeader: (n) =>
                    String(n)
                      .split("_")
                      .map((r) => r.toUpperCase())
                      .join(" "),
                }),
              ));
          });
        })),
      (TC = new Command$1()
        .name("create")
        .description("Create a project")
        .option("--name <name>", "The name of the project")
        .helpGroup("Projects:")
        .action(async (e) => {
          await X(async () => {
            let t = await V(),
              n = e.name ?? (await mo()),
              r = await t.project.remote.create({ name: n });
            re.success(
              `Project ${Uc.default.cyan(r.name)} created: ${Uc.default.cyan(r.id)}`,
            );
          });
        })));
  });
var Pg = {};
pe(Pg, { config: () => CC });
var Bc,
  CC,
  Ng = b(() => {
    Bc = z(J());
    Ee();
    Qi();
    Ie();
    Se();
    CC = (e) => {
      e.command("config")
        .description("Manage Supalite project configuration")
        .helpGroup("Management APIs:")
        .command("push")
        .description("Push config to the linked Supalite cloud project")
        .option("--config <config>", "Path to the config file")
        .action(async (t) => {
          (console.log(),
            await X(async () => {
              await Y(t.config);
              let n = await V(),
                r = new wt(n, t.config),
                s = await r.requireLinkedProjectRef(),
                i = await r.pushConfig(s);
              console.log(
                i.updated
                  ? Bc.default.green("Project config updated.")
                  : Bc.default.dim("Project config is up to date."),
              );
            }));
        });
    };
  });
var Og = {};
pe(Og, { cloud: () => $C });
var Pt,
  AC,
  $C,
  Lg = b(() => {
    Pt = z(J());
    Ie();
    Ee();
    On();
    Nt();
    Se();
    tt();
    Qi();
    ((AC = "Management APIs:"),
      ($C = (e) => {
        let t = e
          .command("cloud")
          .description(de("Supalite cloud operations"))
          .helpGroup(AC);
        (t
          .command("deploy")
          .description("Push migrations and config to a Supalite cloud project")
          .option("--config <config>", "Path to the config file")
          .option("--create", "Create a new project if none present", false)
          .option("--name <name>", "Name of the project (paired with --create)")
          .action(async (n) => {
            let r = wo().filter((s) => s !== "cloud");
            (r.length > 0 &&
              (console.error(
                Pt.default.red(
                  `Cannot deploy: experimental features enabled (${r.join(", ")}). Cloud does not support them yet.`,
                ),
              ),
              process.exit(1)),
              await X(async () => {
                await Y(n.config);
                let s = await V();
                await s.requireSession();
                let i,
                  o = s.project.local.ref();
                if (o) i = await s.project.remote.get(o);
                else if (
                  n.create ||
                  (await ho("No project linked. Create one?"))
                ) {
                  let c = n.name || (await mo());
                  i = await s.project.remote
                    .create({ name: c })
                    .then((p) => s.project.local.link(p));
                } else throw new Error("No project linked");
                let l = await new wt(s, n.config).deploy(i.id);
                (Yi(l.database),
                  console.log(
                    l.config.updated
                      ? Pt.default.green("Project config updated.")
                      : Pt.default.dim("Project config is up to date."),
                  ),
                  console.log(
                    `Project URL: ${Pt.default.cyan(s.project.remote.url(i.id))}`,
                  ));
              }));
          }),
          t
            .command("diff")
            .description(
              "Show migrations pending on the linked Supalite cloud project",
            )
            .option("--config <config>", "Path to the config file")
            .option("--sql", "Show the SQL for pending migrations", false)
            .action(async (n) => {
              (console.log(),
                await X(async () => {
                  await Y(n.config);
                  let r = await V(),
                    s = new wt(r, n.config),
                    i = await s.requireLinkedProjectRef(),
                    o = await s.planDatabasePush(i);
                  if (o.disabled)
                    console.log(
                      Pt.default.dim(
                        "Skipping migrations because they are disabled in config.",
                      ),
                    );
                  else if (o.pending.length === 0)
                    console.log(Pt.default.green("No pending migrations."));
                  else if (n.sql)
                    console.log(
                      o.pending.map(
                        (a) => `-- ${a.filename}
${a.sql}`,
                      ).join(`

`),
                    );
                  else {
                    console.log("Pending migrations:");
                    for (let a of o.pending)
                      console.log(` \u2022 ${Pt.default.cyan(a.filename)}`);
                  }
                }));
            }));
      }));
  });
yo();
var jg = z(J());
Nt();
var Ig = {
    init: () =>
      Promise.resolve()
        .then(() => (cu(), lu))
        .then((e) => e.init),
    "generate-keys": () =>
      Promise.resolve()
        .then(() => (pu(), uu))
        .then((e) => e.generateKeys),
    start: () =>
      Promise.resolve()
        .then(() => (Nf(), Pf))
        .then((e) => e.start),
    dev: () =>
      Promise.resolve()
        .then(() => (ed(), Zm))
        .then((e) => e.dev),
    repl: () =>
      Promise.resolve()
        .then(() => (nd(), td))
        .then((e) => e.repl),
    debug: () =>
      Promise.resolve()
        .then(() => (sd(), rd))
        .then((e) => e.debug),
    db: () =>
      Promise.resolve()
        .then(() => (dh(), mh))
        .then((e) => e.db),
    migration: () =>
      Promise.resolve()
        .then(() => (gh(), hh))
        .then((e) => e.migration),
    upgrade: () =>
      Promise.resolve()
        .then(() => (lg(), ag))
        .then((e) => e.upgrade),
  },
  RC = {
    login: () =>
      Promise.resolve()
        .then(() => (pg(), ug))
        .then((e) => e.login),
    logout: () =>
      Promise.resolve()
        .then(() => (dg(), mg))
        .then((e) => e.logout),
    signup: () =>
      Promise.resolve()
        .then(() => (yg(), gg))
        .then((e) => e.signup),
    whoami: () =>
      Promise.resolve()
        .then(() => (wg(), bg))
        .then((e) => e.whoami),
    link: () =>
      Promise.resolve()
        .then(() => (_g(), Eg))
        .then((e) => e.link),
    unlink: () =>
      Promise.resolve()
        .then(() => (Tg(), xg))
        .then((e) => e.unlink),
    status: () =>
      Promise.resolve()
        .then(() => ($g(), Ag))
        .then((e) => e.status),
    projects: () =>
      Promise.resolve()
        .then(() => (kg(), vg))
        .then((e) => e.projects),
    config: () =>
      Promise.resolve()
        .then(() => (Ng(), Pg))
        .then((e) => e.config),
    cloud: () =>
      Promise.resolve()
        .then(() => (Lg(), Og))
        .then((e) => e.cloud),
  };
function vC() {
  return is("cloud") ? { ...Ig, ...RC } : Ig;
}
async function Dg() {
  let e = vC(),
    t = process.argv[2];
  return t && Object.hasOwn(e, t)
    ? [await e[t]()]
    : Promise.all(Object.values(e).map((n) => n()));
}
Se();
Vr();
Ft();
yc();
var qc = new Command();
function PC(e) {
  let t = [],
    n = e;
  for (; n && n.name && n.name() && n.parent; )
    (t.unshift(n.name()), (n = n.parent));
  return t.join(" ");
}
async function NC() {
  Nd();
  let { version: e, name: t } = await hs();
  qc.name("lite")
    .description(`${jg.default.yellowBright("\u26A1")} ${t} v${e}`)
    .version(e)
    .option("--no-telemetry", "disable anonymous usage telemetry")
    .option("--verbose", "show diagnostic output")
    .hook("preAction", async (n, r) => {
      let s = n.opts?.() ?? {},
        i = typeof r.opts == "function" ? r.opts() : {};
      (su(s.verbose === true),
        Rd(s.telemetry === false) && (await vd({ command: PC(r), args: i })));
    });
  for (let n of await Dg()) n(qc);
  (await qc.parseAsync(), await $n(false));
}
// Upgrade operations can also be used without dispatching a CLI command.
// These initializers only establish the existing module-local definitions.
oo();
Rc();
Dh();
Xh();
Ah();
Hh();
export {
  Ph as collectUpgradeSource,
  co as exportUserData,
  ro as exportAuth,
  Oh as formatSqlValue,
  vh as reconstructSchema,
  io as upgradeSchema,
  Ch as readiness,
  Oc as audit,
  Ih as rehearseUpgrade,
  Lc as runUpgrade,
  xh as validateRows,
};
export function authSetupSql() {
  return [Ti, no()];
}

// Resolve the executable path so a normal npm bin symlink still invokes the CLI.
function isCliEntry() {
  if (!process.argv[1]) return false;
  try {
    return as.realpathSync(process.argv[1]) === as.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}
if (isCliEntry()) {
  process.on("unhandledRejection", (e) => {
    if (!Rn(e)) throw e;
  });
  process.on("uncaughtException", (e) => {
    Rn(e) || (console.error(e), $n(true, e).finally(() => process.exit(1)));
  });
  NC()
    .then(null)
    .catch(async (e) => {
      Rn(e) || (console.error(e), await $n(true, e), (process.exitCode = 1));
    });
}
/*! Bundled license information:

smol-toml/dist/error.js:
smol-toml/dist/util.js:
smol-toml/dist/date.js:
smol-toml/dist/primitive.js:
smol-toml/dist/extract.js:
smol-toml/dist/struct.js:
smol-toml/dist/parse.js:
smol-toml/dist/stringify.js:
smol-toml/dist/index.js:
  (*!
   * Copyright (c) Squirrel Chat et al., All rights reserved.
   * SPDX-License-Identifier: BSD-3-Clause
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice, this
   *    list of conditions and the following disclaimer.
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   *    this list of conditions and the following disclaimer in the
   *    documentation and/or other materials provided with the distribution.
   * 3. Neither the name of the copyright holder nor the names of its contributors
   *    may be used to endorse or promote products derived from this software without
   *    specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
   * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
   * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
   * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
   * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
   * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
   * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
   * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   *)
*/
