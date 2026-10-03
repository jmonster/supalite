import { jsx as f, Fragment as Fn, jsxs as V } from "react/jsx-runtime";
import * as C from "react";
import de, { createContext as Fr, useContext as Nr, forwardRef as yt, createElement as lr, useState as Ze, useLayoutEffect as co, isValidElement as ga, cloneElement as ju, useRef as Ht, Fragment as zb, useCallback as Tu, useMemo as Pt, useImperativeHandle as Bb, memo as ho, useEffectEvent as Vb, useReducer as Ub, useEffect as Wt } from "react";
import * as sh from "react-dom";
import lh, { flushSync as li } from "react-dom";
const ch = Fr({}), qu = () => Nr(ch), Gb = "data:image/svg+xml,%3csvg%20width='109'%20height='113'%20viewBox='0%200%20109%20113'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M63.7076%20110.284C60.8481%20113.885%2055.0502%20111.912%2054.9813%20107.314L53.9738%2040.0625L99.1935%2040.0625C107.384%2040.0625%20111.952%2049.5226%20106.859%2055.9372L63.7076%20110.284Z'%20fill='url(%23paint0_linear)'/%3e%3cpath%20d='M63.7076%20110.284C60.8481%20113.885%2055.0502%20111.912%2054.9813%20107.314L53.9738%2040.0625L99.1935%2040.0625C107.384%2040.0625%20111.952%2049.5226%20106.859%2055.9372L63.7076%20110.284Z'%20fill='url(%23paint1_linear)'%20fill-opacity='0.2'/%3e%3cpath%20d='M45.317%202.07103C48.1765%20-1.53037%2053.9745%200.442937%2054.0434%205.041L54.4849%2072.2922H9.83113C1.64038%2072.2922%20-2.92775%2062.8321%202.1655%2056.4175L45.317%202.07103Z'%20fill='%233ECF8E'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear'%20x1='53.9738'%20y1='54.9738'%20x2='94.1635'%20y2='71.8293'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23249361'/%3e%3cstop%20offset='1'%20stop-color='%233ECF8E'/%3e%3c/linearGradient%3e%3clinearGradient%20id='paint1_linear'%20x1='36.1558'%20y1='30.5779'%20x2='54.4844'%20y2='65.0804'%20gradientUnits='userSpaceOnUse'%3e%3cstop/%3e%3cstop%20offset='1'%20stop-opacity='0'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e";
function uh(e) {
  var n, r, a = "";
  if (typeof e == "string" || typeof e == "number") a += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var s = e.length;
    for (n = 0; n < s; n++) e[n] && (r = uh(e[n])) && (a && (a += " "), a += r);
  } else for (r in e) e[r] && (a && (a += " "), a += r);
  return a;
}
function dh() {
  for (var e, n, r = 0, a = "", s = arguments.length; r < s; r++) (e = arguments[r]) && (n = uh(e)) && (a && (a += " "), a += n);
  return a;
}
const Kb = (e, n) => {
  const r = new Array(e.length + n.length);
  for (let a = 0; a < e.length; a++)
    r[a] = e[a];
  for (let a = 0; a < n.length; a++)
    r[e.length + a] = n[a];
  return r;
}, Zb = (e, n) => ({
  classGroupId: e,
  validator: n
}), fh = (e = /* @__PURE__ */ new Map(), n = null, r) => ({
  nextPart: e,
  validators: n,
  classGroupId: r
}), Xs = "-", $1 = [], jb = "arbitrary..", qb = (e) => {
  const n = Xb(e), {
    conflictingClassGroups: r,
    conflictingClassGroupModifiers: a
  } = e;
  return {
    getClassGroupId: (c) => {
      if (c.startsWith("[") && c.endsWith("]"))
        return Yb(c);
      const d = c.split(Xs), h = d[0] === "" && d.length > 1 ? 1 : 0;
      return hh(d, h, n);
    },
    getConflictingClassGroupIds: (c, d) => {
      if (d) {
        const h = a[c], p = r[c];
        return h ? p ? Kb(p, h) : h : p || $1;
      }
      return r[c] || $1;
    }
  };
}, hh = (e, n, r) => {
  if (e.length - n === 0)
    return r.classGroupId;
  const s = e[n], l = r.nextPart.get(s);
  if (l) {
    const p = hh(e, n + 1, l);
    if (p) return p;
  }
  const c = r.validators;
  if (c === null)
    return;
  const d = n === 0 ? e.join(Xs) : e.slice(n).join(Xs), h = c.length;
  for (let p = 0; p < h; p++) {
    const m = c[p];
    if (m.validator(d))
      return m.classGroupId;
  }
}, Yb = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const n = e.slice(1, -1), r = n.indexOf(":"), a = n.slice(0, r);
  return a ? jb + a : void 0;
})(), Xb = (e) => {
  const {
    theme: n,
    classGroups: r
  } = e;
  return Jb(r, n);
}, Jb = (e, n) => {
  const r = fh();
  for (const a in e) {
    const s = e[a];
    Yu(s, r, a, n);
  }
  return r;
}, Yu = (e, n, r, a) => {
  const s = e.length;
  for (let l = 0; l < s; l++) {
    const c = e[l];
    Qb(c, n, r, a);
  }
}, Qb = (e, n, r, a) => {
  if (typeof e == "string") {
    e9(e, n, r);
    return;
  }
  if (typeof e == "function") {
    t9(e, n, r, a);
    return;
  }
  n9(e, n, r, a);
}, e9 = (e, n, r) => {
  const a = e === "" ? n : ph(n, e);
  a.classGroupId = r;
}, t9 = (e, n, r, a) => {
  if (r9(e)) {
    Yu(e(a), n, r, a);
    return;
  }
  n.validators === null && (n.validators = []), n.validators.push(Zb(r, e));
}, n9 = (e, n, r, a) => {
  const s = Object.entries(e), l = s.length;
  for (let c = 0; c < l; c++) {
    const [d, h] = s[c];
    Yu(h, ph(n, d), r, a);
  }
}, ph = (e, n) => {
  let r = e;
  const a = n.split(Xs), s = a.length;
  for (let l = 0; l < s; l++) {
    const c = a[l];
    let d = r.nextPart.get(c);
    d || (d = fh(), r.nextPart.set(c, d)), r = d;
  }
  return r;
}, r9 = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, o9 = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let n = 0, r = /* @__PURE__ */ Object.create(null), a = /* @__PURE__ */ Object.create(null);
  const s = (l, c) => {
    r[l] = c, n++, n > e && (n = 0, a = r, r = /* @__PURE__ */ Object.create(null));
  };
  return {
    get(l) {
      let c = r[l];
      if (c !== void 0)
        return c;
      if ((c = a[l]) !== void 0)
        return s(l, c), c;
    },
    set(l, c) {
      l in r ? r[l] = c : s(l, c);
    }
  };
}, Au = "!", z1 = ":", a9 = [], B1 = (e, n, r, a, s) => ({
  modifiers: e,
  hasImportantModifier: n,
  baseClassName: r,
  maybePostfixModifierPosition: a,
  isExternal: s
}), i9 = (e) => {
  const {
    prefix: n,
    experimentalParseClassName: r
  } = e;
  let a = (s) => {
    const l = [];
    let c = 0, d = 0, h = 0, p;
    const m = s.length;
    for (let y = 0; y < m; y++) {
      const E = s[y];
      if (c === 0 && d === 0) {
        if (E === z1) {
          l.push(s.slice(h, y)), h = y + 1;
          continue;
        }
        if (E === "/") {
          p = y;
          continue;
        }
      }
      E === "[" ? c++ : E === "]" ? c-- : E === "(" ? d++ : E === ")" && d--;
    }
    const b = l.length === 0 ? s : s.slice(h);
    let w = b, g = !1;
    b.endsWith(Au) ? (w = b.slice(0, -1), g = !0) : (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      b.startsWith(Au) && (w = b.slice(1), g = !0)
    );
    const x = p && p > h ? p - h : void 0;
    return B1(l, g, w, x);
  };
  if (n) {
    const s = n + z1, l = a;
    a = (c) => c.startsWith(s) ? l(c.slice(s.length)) : B1(a9, !1, c, void 0, !0);
  }
  if (r) {
    const s = a;
    a = (l) => r({
      className: l,
      parseClassName: s
    });
  }
  return a;
}, s9 = (e) => {
  const n = /* @__PURE__ */ new Map();
  return e.orderSensitiveModifiers.forEach((r, a) => {
    n.set(r, 1e6 + a);
  }), (r) => {
    const a = [];
    let s = [];
    for (let l = 0; l < r.length; l++) {
      const c = r[l], d = c[0] === "[", h = n.has(c);
      d || h ? (s.length > 0 && (s.sort(), a.push(...s), s = []), a.push(c)) : s.push(c);
    }
    return s.length > 0 && (s.sort(), a.push(...s)), a;
  };
}, l9 = (e) => ({
  cache: o9(e.cacheSize),
  parseClassName: i9(e),
  sortModifiers: s9(e),
  ...qb(e)
}), c9 = /\s+/, u9 = (e, n) => {
  const {
    parseClassName: r,
    getClassGroupId: a,
    getConflictingClassGroupIds: s,
    sortModifiers: l
  } = n, c = [], d = e.trim().split(c9);
  let h = "";
  for (let p = d.length - 1; p >= 0; p -= 1) {
    const m = d[p], {
      isExternal: b,
      modifiers: w,
      hasImportantModifier: g,
      baseClassName: x,
      maybePostfixModifierPosition: y
    } = r(m);
    if (b) {
      h = m + (h.length > 0 ? " " + h : h);
      continue;
    }
    let E = !!y, R = a(E ? x.substring(0, y) : x);
    if (!R) {
      if (!E) {
        h = m + (h.length > 0 ? " " + h : h);
        continue;
      }
      if (R = a(x), !R) {
        h = m + (h.length > 0 ? " " + h : h);
        continue;
      }
      E = !1;
    }
    const N = w.length === 0 ? "" : w.length === 1 ? w[0] : l(w).join(":"), L = g ? N + Au : N, M = L + R;
    if (c.indexOf(M) > -1)
      continue;
    c.push(M);
    const I = s(R, E);
    for (let O = 0; O < I.length; ++O) {
      const D = I[O];
      c.push(L + D);
    }
    h = m + (h.length > 0 ? " " + h : h);
  }
  return h;
}, d9 = (...e) => {
  let n = 0, r, a, s = "";
  for (; n < e.length; )
    (r = e[n++]) && (a = gh(r)) && (s && (s += " "), s += a);
  return s;
}, gh = (e) => {
  if (typeof e == "string")
    return e;
  let n, r = "";
  for (let a = 0; a < e.length; a++)
    e[a] && (n = gh(e[a])) && (r && (r += " "), r += n);
  return r;
}, V1 = (e, ...n) => {
  let r, a, s, l;
  const c = (h) => {
    const p = n.reduce((m, b) => b(m), e());
    return r = l9(p), a = r.cache.get, s = r.cache.set, l = d, d(h);
  }, d = (h) => {
    const p = a(h);
    if (p)
      return p;
    const m = u9(h, r);
    return s(h, m), m;
  };
  return l = c, (...h) => l(d9(...h));
}, f9 = [], Ot = (e) => {
  const n = (r) => r[e] || f9;
  return n.isThemeGetter = !0, n;
}, mh = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, vh = /^\((?:(\w[\w-]*):)?(.+)\)$/i, h9 = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, p9 = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, g9 = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, m9 = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, v9 = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, b9 = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, no = (e) => h9.test(e), $e = (e) => !!e && !Number.isNaN(Number(e)), ro = (e) => !!e && Number.isInteger(Number(e)), au = (e) => e.endsWith("%") && $e(e.slice(0, -1)), Ir = (e) => p9.test(e), bh = () => !0, y9 = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  g9.test(e) && !m9.test(e)
), Xu = () => !1, w9 = (e) => v9.test(e), x9 = (e) => b9.test(e), C9 = (e) => !Ce(e) && !_e(e), S9 = (e) => po(e, xh, Xu), Ce = (e) => mh.test(e), No = (e) => po(e, Ch, y9), U1 = (e) => po(e, N9, $e), _9 = (e) => po(e, _h, bh), E9 = (e) => po(e, Sh, Xu), G1 = (e) => po(e, yh, Xu), R9 = (e) => po(e, wh, x9), ks = (e) => po(e, Eh, w9), _e = (e) => vh.test(e), ti = (e) => Fo(e, Ch), I9 = (e) => Fo(e, Sh), K1 = (e) => Fo(e, yh), k9 = (e) => Fo(e, xh), M9 = (e) => Fo(e, wh), Ms = (e) => Fo(e, Eh, !0), L9 = (e) => Fo(e, _h, !0), po = (e, n, r) => {
  const a = mh.exec(e);
  return a ? a[1] ? n(a[1]) : r(a[2]) : !1;
}, Fo = (e, n, r = !1) => {
  const a = vh.exec(e);
  return a ? a[1] ? n(a[1]) : r : !1;
}, yh = (e) => e === "position" || e === "percentage", wh = (e) => e === "image" || e === "url", xh = (e) => e === "length" || e === "size" || e === "bg-size", Ch = (e) => e === "length", N9 = (e) => e === "number", Sh = (e) => e === "family-name", _h = (e) => e === "number" || e === "weight", Eh = (e) => e === "shadow", Z1 = () => {
  const e = Ot("color"), n = Ot("font"), r = Ot("text"), a = Ot("font-weight"), s = Ot("tracking"), l = Ot("leading"), c = Ot("breakpoint"), d = Ot("container"), h = Ot("spacing"), p = Ot("radius"), m = Ot("shadow"), b = Ot("inset-shadow"), w = Ot("text-shadow"), g = Ot("drop-shadow"), x = Ot("blur"), y = Ot("perspective"), E = Ot("aspect"), R = Ot("ease"), N = Ot("animate"), L = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], M = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ], I = () => [...M(), _e, Ce], O = () => ["auto", "hidden", "clip", "visible", "scroll"], D = () => ["auto", "contain", "none"], A = () => [_e, Ce, h], z = () => [no, "full", "auto", ...A()], se = () => [ro, "none", "subgrid", _e, Ce], ue = () => ["auto", {
    span: ["full", ro, _e, Ce]
  }, ro, _e, Ce], ce = () => [ro, "auto", _e, Ce], ne = () => ["auto", "min", "max", "fr", _e, Ce], Z = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], le = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], X = () => ["auto", ...A()], ge = () => [no, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...A()], pe = () => [no, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...A()], H = () => [no, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...A()], P = () => [e, _e, Ce], ae = () => [...M(), K1, G1, {
    position: [_e, Ce]
  }], U = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], B = () => ["auto", "cover", "contain", k9, S9, {
    size: [_e, Ce]
  }], G = () => [au, ti, No], J = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    p,
    _e,
    Ce
  ], Q = () => ["", $e, ti, No], j = () => ["solid", "dashed", "dotted", "double"], ve = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], he = () => [$e, au, K1, G1], re = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    x,
    _e,
    Ce
  ], me = () => ["none", $e, _e, Ce], ee = () => ["none", $e, _e, Ce], Le = () => [$e, _e, Ce], qe = () => [no, "full", ...A()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [Ir],
      breakpoint: [Ir],
      color: [bh],
      container: [Ir],
      "drop-shadow": [Ir],
      ease: ["in", "out", "in-out"],
      font: [C9],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [Ir],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [Ir],
      shadow: [Ir],
      spacing: ["px", $e],
      text: [Ir],
      "text-shadow": [Ir],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", no, Ce, _e, E]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [$e, Ce, _e, d]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": L()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": L()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: I()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: O()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": O()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": O()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: D()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": D()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": D()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: z()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": z()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": z()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": z(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: z()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": z(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: z()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": z()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": z()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: z()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: z()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: z()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: z()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [ro, "auto", _e, Ce]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [no, "full", "auto", d, ...A()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [$e, no, "auto", "initial", "none", Ce]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", $e, _e, Ce]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", $e, _e, Ce]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [ro, "first", "last", "none", _e, Ce]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": se()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ue()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": ce()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": ce()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": se()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ue()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": ce()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": ce()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": ne()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ne()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: A()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": A()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": A()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...Z(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...le(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...le()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...Z()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...le(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...le(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": Z()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...le(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...le()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: A()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: A()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: A()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: A()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: A()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: A()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: A()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: A()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: A()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: A()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: A()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: X()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: X()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: X()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: X()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: X()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: X()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: X()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: X()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: X()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: X()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: X()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": A()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": A()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: ge()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...pe()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...pe()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...pe()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...H()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...H()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...H()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [d, "screen", ...ge()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          d,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...ge()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          d,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [c]
          },
          ...ge()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...ge()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...ge()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...ge()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", r, ti, No]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [a, L9, _9]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", au, Ce]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [I9, E9, n]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [Ce]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [s, _e, Ce]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [$e, "none", _e, U1]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          l,
          ...A()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", _e, Ce]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", _e, Ce]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: P()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: P()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...j(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [$e, "from-font", "auto", _e, No]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: P()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [$e, "auto", _e, Ce]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: A()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", _e, Ce]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", _e, Ce]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: ae()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: U()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: B()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, ro, _e, Ce],
          radial: ["", _e, Ce],
          conic: [ro, _e, Ce]
        }, M9, R9]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: P()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: G()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: G()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: G()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: P()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: P()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: P()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: J()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": J()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": J()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": J()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": J()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": J()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": J()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": J()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": J()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": J()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": J()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": J()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": J()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": J()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": J()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: Q()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": Q()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": Q()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": Q()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": Q()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": Q()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": Q()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": Q()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": Q()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": Q()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": Q()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": Q()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": Q()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...j(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...j(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: P()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": P()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": P()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": P()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": P()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": P()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": P()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": P()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": P()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": P()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": P()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: P()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...j(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [$e, _e, Ce]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", $e, ti, No]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: P()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          m,
          Ms,
          ks
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: P()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", b, Ms, ks]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": P()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: Q()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: P()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [$e, No]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": P()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": Q()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": P()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", w, Ms, ks]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": P()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [$e, _e, Ce]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...ve(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": ve()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [$e]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": he()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": he()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": P()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": P()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": he()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": he()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": P()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": P()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": he()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": he()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": P()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": P()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": he()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": he()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": P()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": P()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": he()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": he()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": P()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": P()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": he()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": he()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": P()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": P()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": he()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": he()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": P()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": P()
      }],
      "mask-image-radial": [{
        "mask-radial": [_e, Ce]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": he()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": he()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": P()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": P()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": M()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [$e]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": he()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": he()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": P()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": P()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: ae()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: U()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: B()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", _e, Ce]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          _e,
          Ce
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: re()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [$e, _e, Ce]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [$e, _e, Ce]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          g,
          Ms,
          ks
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": P()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", $e, _e, Ce]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [$e, _e, Ce]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", $e, _e, Ce]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [$e, _e, Ce]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", $e, _e, Ce]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          _e,
          Ce
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": re()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [$e, _e, Ce]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [$e, _e, Ce]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", $e, _e, Ce]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [$e, _e, Ce]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", $e, _e, Ce]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [$e, _e, Ce]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [$e, _e, Ce]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", $e, _e, Ce]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": A()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": A()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": A()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", _e, Ce]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [$e, "initial", _e, Ce]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", R, _e, Ce]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [$e, _e, Ce]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", N, _e, Ce]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [y, _e, Ce]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": I()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: me()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": me()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": me()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": me()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: ee()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": ee()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": ee()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": ee()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: Le()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": Le()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": Le()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [_e, Ce, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: I()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: qe()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": qe()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": qe()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": qe()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: P()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: P()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", _e, Ce]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": A()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": A()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": A()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": A()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": A()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": A()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": A()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": A()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": A()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": A()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": A()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": A()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": A()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": A()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": A()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": A()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": A()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": A()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": A()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": A()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": A()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": A()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", _e, Ce]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...P()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [$e, ti, No, U1]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...P()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
}, T9 = (e, {
  cacheSize: n,
  prefix: r,
  experimentalParseClassName: a,
  extend: s = {},
  override: l = {}
}) => (ni(e, "cacheSize", n), ni(e, "prefix", r), ni(e, "experimentalParseClassName", a), Ls(e.theme, l.theme), Ls(e.classGroups, l.classGroups), Ls(e.conflictingClassGroups, l.conflictingClassGroups), Ls(e.conflictingClassGroupModifiers, l.conflictingClassGroupModifiers), ni(e, "orderSensitiveModifiers", l.orderSensitiveModifiers), Ns(e.theme, s.theme), Ns(e.classGroups, s.classGroups), Ns(e.conflictingClassGroups, s.conflictingClassGroups), Ns(e.conflictingClassGroupModifiers, s.conflictingClassGroupModifiers), Rh(e, s, "orderSensitiveModifiers"), e), ni = (e, n, r) => {
  r !== void 0 && (e[n] = r);
}, Ls = (e, n) => {
  if (n)
    for (const r in n)
      ni(e, r, n[r]);
}, Ns = (e, n) => {
  if (n)
    for (const r in n)
      Rh(e, n, r);
}, Rh = (e, n, r) => {
  const a = n[r];
  a !== void 0 && (e[r] = e[r] ? e[r].concat(a) : a);
}, A9 = (e, ...n) => typeof e == "function" ? V1(Z1, e, ...n) : V1(() => T9(Z1(), e), ...n), O9 = A9({
  extend: {
    theme: {
      spacing: ["card", "content"]
    }
  }
});
function fe(...e) {
  return O9(dh(e));
}
const P9 = ({ className: e, ...n }) => /* @__PURE__ */ f("img", { alt: "Supalite", className: fe("w-auto h-4.5", e), ...n, src: Gb }), iu = ({ className: e, ...n }) => /* @__PURE__ */ f("span", { className: fe("text-border-stronger", e), ...n, children: /* @__PURE__ */ f(
  "svg",
  {
    "aria-hidden": "true",
    focusable: "false",
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    stroke: "currentColor",
    strokeWidth: "1",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none",
    shapeRendering: "geometricPrecision",
    children: /* @__PURE__ */ f("path", { d: "M16 3.549L7.12 20.600" })
  }
) }), j1 = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, q1 = dh, fr = (e, n) => (r) => {
  var a;
  if (n?.variants == null) return q1(e, r?.class, r?.className);
  const { variants: s, defaultVariants: l } = n, c = Object.keys(s).map((p) => {
    const m = r?.[p], b = l?.[p];
    if (m === null) return null;
    const w = j1(m) || j1(b);
    return s[p][w];
  }), d = r && Object.entries(r).reduce((p, m) => {
    let [b, w] = m;
    return w === void 0 || (p[b] = w), p;
  }, {}), h = n == null || (a = n.compoundVariants) === null || a === void 0 ? void 0 : a.reduce((p, m) => {
    let { class: b, className: w, ...g } = m;
    return Object.entries(g).every((x) => {
      let [y, E] = x;
      return Array.isArray(E) ? E.includes({
        ...l,
        ...d
      }[y]) : {
        ...l,
        ...d
      }[y] === E;
    }) ? [
      ...p,
      b,
      w
    ] : p;
  }, []);
  return q1(e, c, h, r?.class, r?.className);
};
const D9 = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Ih = (...e) => e.filter((n, r, a) => !!n && a.indexOf(n) === r).join(" ");
var F9 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const W9 = yt(
  ({
    color: e = "currentColor",
    size: n = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: a,
    className: s = "",
    children: l,
    iconNode: c,
    ...d
  }, h) => lr(
    "svg",
    {
      ref: h,
      ...F9,
      width: n,
      height: n,
      stroke: e,
      strokeWidth: a ? Number(r) * 24 / Number(n) : r,
      className: Ih("lucide", s),
      ...d
    },
    [
      ...c.map(([p, m]) => lr(p, m)),
      ...Array.isArray(l) ? l : [l]
    ]
  )
);
const Ke = (e, n) => {
  const r = yt(
    ({ className: a, ...s }, l) => lr(W9, {
      ref: l,
      iconNode: n,
      className: Ih(`lucide-${D9(e)}`, a),
      ...s
    })
  );
  return r.displayName = `${e}`, r;
};
const H9 = Ke("ArrowDownWideNarrow", [
  ["path", { d: "m3 16 4 4 4-4", key: "1co6wj" }],
  ["path", { d: "M7 20V4", key: "1yoxec" }],
  ["path", { d: "M11 4h10", key: "1w87gc" }],
  ["path", { d: "M11 8h7", key: "djye34" }],
  ["path", { d: "M11 12h4", key: "q8tih4" }]
]);
const $9 = Ke("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
const z9 = Ke("ArrowUpWideNarrow", [
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }],
  ["path", { d: "M11 12h10", key: "1438ji" }],
  ["path", { d: "M11 16h7", key: "uosisv" }],
  ["path", { d: "M11 20h4", key: "1krc32" }]
]);
const B9 = Ke("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
const V9 = Ke("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
const ci = Ke("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
const U9 = Ke("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
const fl = Ke("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
const G9 = Ke("ChevronsDown", [
  ["path", { d: "m7 6 5 5 5-5", key: "1lc07p" }],
  ["path", { d: "m7 13 5 5 5-5", key: "1d48rs" }]
]);
const K9 = Ke("ChevronsUpDown", [
  ["path", { d: "m7 15 5 5 5-5", key: "1hf1tw" }],
  ["path", { d: "m7 9 5-5 5 5", key: "sgt6xg" }]
]);
const Z9 = Ke("CircleHelp", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);
const j9 = Ke("Circle", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
]);
const q9 = Ke("Command", [
  [
    "path",
    { d: "M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3", key: "11bfej" }
  ]
]);
const Y9 = Ke("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
const X9 = Ke("EllipsisVertical", [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }],
  ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }]
]);
const J9 = Ke("Eye", [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
]);
const Q9 = Ke("FileText", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
]);
const Ju = Ke("Filter", [
  ["polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3", key: "1yg77f" }]
]);
const e7 = Ke("FolderClosed", [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ],
  ["path", { d: "M2 10h20", key: "1ir3d8" }]
]);
const t7 = Ke("FolderOpen", [
  [
    "path",
    {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      key: "usdka0"
    }
  ]
]);
const n7 = Ke("GitBranch", [
  ["line", { x1: "6", x2: "6", y1: "3", y2: "15", key: "17qcm7" }],
  ["circle", { cx: "18", cy: "6", r: "3", key: "1h7g24" }],
  ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }],
  ["path", { d: "M18 9a9 9 0 0 1-9 9", key: "n2h4wq" }]
]);
const r7 = Ke("House", [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "1d0kgt"
    }
  ]
]);
const o7 = Ke("Key", [
  ["path", { d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4", key: "g0fldk" }],
  ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }],
  ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }]
]);
const a7 = Ke("Lightbulb", [
  [
    "path",
    {
      d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      key: "1gvzjb"
    }
  ],
  ["path", { d: "M9 18h6", key: "x1upvd" }],
  ["path", { d: "M10 22h4", key: "ceow96" }]
]);
const i7 = Ke("List", [
  ["line", { x1: "8", x2: "21", y1: "6", y2: "6", key: "7ey8pc" }],
  ["line", { x1: "8", x2: "21", y1: "12", y2: "12", key: "rjfblc" }],
  ["line", { x1: "8", x2: "21", y1: "18", y2: "18", key: "c3b1m8" }],
  ["line", { x1: "3", x2: "3.01", y1: "6", y2: "6", key: "1g7gq3" }],
  ["line", { x1: "3", x2: "3.01", y1: "12", y2: "12", key: "1pjlvk" }],
  ["line", { x1: "3", x2: "3.01", y1: "18", y2: "18", key: "28t2mc" }]
]);
const Js = Ke("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
const s7 = Ke("PanelLeft", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M9 3v18", key: "fh3hqa" }]
]);
const l7 = Ke("Plug", [
  ["path", { d: "M12 22v-5", key: "1ega77" }],
  ["path", { d: "M9 8V2", key: "14iosj" }],
  ["path", { d: "M15 8V2", key: "18g5xt" }],
  ["path", { d: "M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z", key: "osxo6l" }]
]);
const c7 = Ke("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
const u7 = Ke("ScrollText", [
  ["path", { d: "M15 12h-5", key: "r7krc0" }],
  ["path", { d: "M15 8h-5", key: "1khuty" }],
  ["path", { d: "M19 17V5a2 2 0 0 0-2-2H4", key: "zz82l3" }],
  [
    "path",
    {
      d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",
      key: "1ph1d7"
    }
  ]
]);
const kh = Ke("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
const d7 = Ke("Settings", [
  [
    "path",
    {
      d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      key: "1qme2f"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
]);
const f7 = Ke("Table2", [
  [
    "path",
    {
      d: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
      key: "gugj83"
    }
  ]
]);
const h7 = Ke("Trash", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }]
]);
const Mh = Ke("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function Y1(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function hl(...e) {
  return (n) => {
    let r = !1;
    const a = e.map((s) => {
      const l = Y1(s, n);
      return !r && typeof l == "function" && (r = !0), l;
    });
    if (r)
      return () => {
        for (let s = 0; s < a.length; s++) {
          const l = a[s];
          typeof l == "function" ? l() : Y1(e[s], null);
        }
      };
  };
}
function Lt(...e) {
  return C.useCallback(hl(...e), e);
}
// @__NO_SIDE_EFFECTS__
function ba(e) {
  const n = /* @__PURE__ */ p7(e), r = C.forwardRef((a, s) => {
    const { children: l, ...c } = a, d = C.Children.toArray(l), h = d.find(m7);
    if (h) {
      const p = h.props.children, m = d.map((b) => b === h ? C.Children.count(p) > 1 ? C.Children.only(null) : C.isValidElement(p) ? p.props.children : null : b);
      return /* @__PURE__ */ f(n, { ...c, ref: s, children: C.isValidElement(p) ? C.cloneElement(p, void 0, m) : null });
    }
    return /* @__PURE__ */ f(n, { ...c, ref: s, children: l });
  });
  return r.displayName = `${e}.Slot`, r;
}
var Wo = /* @__PURE__ */ ba("Slot");
// @__NO_SIDE_EFFECTS__
function p7(e) {
  const n = C.forwardRef((r, a) => {
    const { children: s, ...l } = r;
    if (C.isValidElement(s)) {
      const c = b7(s), d = v7(l, s.props);
      return s.type !== C.Fragment && (d.ref = a ? hl(a, c) : c), C.cloneElement(s, d);
    }
    return C.Children.count(s) > 1 ? C.Children.only(null) : null;
  });
  return n.displayName = `${e}.SlotClone`, n;
}
var Lh = /* @__PURE__ */ Symbol("radix.slottable");
// @__NO_SIDE_EFFECTS__
function g7(e) {
  const n = ({ children: r }) => /* @__PURE__ */ f(Fn, { children: r });
  return n.displayName = `${e}.Slottable`, n.__radixId = Lh, n;
}
function m7(e) {
  return C.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Lh;
}
function v7(e, n) {
  const r = { ...n };
  for (const a in n) {
    const s = e[a], l = n[a];
    /^on[A-Z]/.test(a) ? s && l ? r[a] = (...d) => {
      const h = l(...d);
      return s(...d), h;
    } : s && (r[a] = s) : a === "style" ? r[a] = { ...s, ...l } : a === "className" && (r[a] = [s, l].filter(Boolean).join(" "));
  }
  return { ...e, ...r };
}
function b7(e) {
  let n = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, r = n && "isReactWarning" in n && n.isReactWarning;
  return r ? e.ref : (n = Object.getOwnPropertyDescriptor(e, "ref")?.get, r = n && "isReactWarning" in n && n.isReactWarning, r ? e.props.ref : e.props.ref || e.ref);
}
var y7 = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
], mt = y7.reduce((e, n) => {
  const r = /* @__PURE__ */ ba(`Primitive.${n}`), a = C.forwardRef((s, l) => {
    const { asChild: c, ...d } = s, h = c ? r : n;
    return typeof window < "u" && (window[/* @__PURE__ */ Symbol.for("radix-ui")] = !0), /* @__PURE__ */ f(h, { ...d, ref: l });
  });
  return a.displayName = `Primitive.${n}`, { ...e, [n]: a };
}, {});
function Nh(e, n) {
  e && sh.flushSync(() => e.dispatchEvent(n));
}
var w7 = Object.freeze({
  // See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  wordWrap: "normal"
}), x7 = "VisuallyHidden", Th = C.forwardRef(
  (e, n) => /* @__PURE__ */ f(
    mt.span,
    {
      ...e,
      ref: n,
      style: { ...w7, ...e.style }
    }
  )
);
Th.displayName = x7;
var C7 = Th;
function S7(e, n) {
  const r = C.createContext(n), a = (l) => {
    const { children: c, ...d } = l, h = C.useMemo(() => d, Object.values(d));
    return /* @__PURE__ */ f(r.Provider, { value: h, children: c });
  };
  a.displayName = e + "Provider";
  function s(l) {
    const c = C.useContext(r);
    if (c) return c;
    if (n !== void 0) return n;
    throw new Error(`\`${l}\` must be used within \`${e}\``);
  }
  return [a, s];
}
function go(e, n = []) {
  let r = [];
  function a(l, c) {
    const d = C.createContext(c), h = r.length;
    r = [...r, c];
    const p = (b) => {
      const { scope: w, children: g, ...x } = b, y = w?.[e]?.[h] || d, E = C.useMemo(() => x, Object.values(x));
      return /* @__PURE__ */ f(y.Provider, { value: E, children: g });
    };
    p.displayName = l + "Provider";
    function m(b, w) {
      const g = w?.[e]?.[h] || d, x = C.useContext(g);
      if (x) return x;
      if (c !== void 0) return c;
      throw new Error(`\`${b}\` must be used within \`${l}\``);
    }
    return [p, m];
  }
  const s = () => {
    const l = r.map((c) => C.createContext(c));
    return function(d) {
      const h = d?.[e] || l;
      return C.useMemo(
        () => ({ [`__scope${e}`]: { ...d, [e]: h } }),
        [d, h]
      );
    };
  };
  return s.scopeName = e, [a, _7(s, ...n)];
}
function _7(...e) {
  const n = e[0];
  if (e.length === 1) return n;
  const r = () => {
    const a = e.map((s) => ({
      useScope: s(),
      scopeName: s.scopeName
    }));
    return function(l) {
      const c = a.reduce((d, { useScope: h, scopeName: p }) => {
        const b = h(l)[`__scope${p}`];
        return { ...d, ...b };
      }, {});
      return C.useMemo(() => ({ [`__scope${n.scopeName}`]: c }), [c]);
    };
  };
  return r.scopeName = n.scopeName, r;
}
function Ah(e) {
  const n = e + "CollectionProvider", [r, a] = go(n), [s, l] = r(
    n,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), c = (y) => {
    const { scope: E, children: R } = y, N = de.useRef(null), L = de.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ f(s, { scope: E, itemMap: L, collectionRef: N, children: R });
  };
  c.displayName = n;
  const d = e + "CollectionSlot", h = /* @__PURE__ */ ba(d), p = de.forwardRef(
    (y, E) => {
      const { scope: R, children: N } = y, L = l(d, R), M = Lt(E, L.collectionRef);
      return /* @__PURE__ */ f(h, { ref: M, children: N });
    }
  );
  p.displayName = d;
  const m = e + "CollectionItemSlot", b = "data-radix-collection-item", w = /* @__PURE__ */ ba(m), g = de.forwardRef(
    (y, E) => {
      const { scope: R, children: N, ...L } = y, M = de.useRef(null), I = Lt(E, M), O = l(m, R);
      return de.useEffect(() => (O.itemMap.set(M, { ref: M, ...L }), () => {
        O.itemMap.delete(M);
      })), /* @__PURE__ */ f(w, { [b]: "", ref: I, children: N });
    }
  );
  g.displayName = m;
  function x(y) {
    const E = l(e + "CollectionConsumer", y);
    return de.useCallback(() => {
      const N = E.collectionRef.current;
      if (!N) return [];
      const L = Array.from(N.querySelectorAll(`[${b}]`));
      return Array.from(E.itemMap.values()).sort(
        (O, D) => L.indexOf(O.ref.current) - L.indexOf(D.ref.current)
      );
    }, [E.collectionRef, E.itemMap]);
  }
  return [
    { Provider: c, Slot: p, ItemSlot: g },
    x,
    a
  ];
}
function Te(e, n, { checkForDefaultPrevented: r = !0 } = {}) {
  return function(s) {
    if (e?.(s), r === !1 || !s.defaultPrevented)
      return n?.(s);
  };
}
var Tr = globalThis?.document ? C.useLayoutEffect : () => {
}, E7 = C[" useInsertionEffect ".trim().toString()] || Tr;
function vi({
  prop: e,
  defaultProp: n,
  onChange: r = () => {
  },
  caller: a
}) {
  const [s, l, c] = R7({
    defaultProp: n,
    onChange: r
  }), d = e !== void 0, h = d ? e : s;
  {
    const m = C.useRef(e !== void 0);
    C.useEffect(() => {
      const b = m.current;
      b !== d && console.warn(
        `${a} is changing from ${b ? "controlled" : "uncontrolled"} to ${d ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), m.current = d;
    }, [d, a]);
  }
  const p = C.useCallback(
    (m) => {
      if (d) {
        const b = I7(m) ? m(e) : m;
        b !== e && c.current?.(b);
      } else
        l(m);
    },
    [d, e, l, c]
  );
  return [h, p];
}
function R7({
  defaultProp: e,
  onChange: n
}) {
  const [r, a] = C.useState(e), s = C.useRef(r), l = C.useRef(n);
  return E7(() => {
    l.current = n;
  }, [n]), C.useEffect(() => {
    s.current !== r && (l.current?.(r), s.current = r);
  }, [r, s]), [r, a, l];
}
function I7(e) {
  return typeof e == "function";
}
function k7(e, n) {
  return C.useReducer((r, a) => n[r][a] ?? r, e);
}
var Xn = (e) => {
  const { present: n, children: r } = e, a = M7(n), s = typeof r == "function" ? r({ present: a.isPresent }) : C.Children.only(r), l = Lt(a.ref, L7(s));
  return typeof r == "function" || a.isPresent ? C.cloneElement(s, { ref: l }) : null;
};
Xn.displayName = "Presence";
function M7(e) {
  const [n, r] = C.useState(), a = C.useRef(null), s = C.useRef(e), l = C.useRef("none"), c = e ? "mounted" : "unmounted", [d, h] = k7(c, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  return C.useEffect(() => {
    const p = Ts(a.current);
    l.current = d === "mounted" ? p : "none";
  }, [d]), Tr(() => {
    const p = a.current, m = s.current;
    if (m !== e) {
      const w = l.current, g = Ts(p);
      e ? h("MOUNT") : g === "none" || p?.display === "none" ? h("UNMOUNT") : h(m && w !== g ? "ANIMATION_OUT" : "UNMOUNT"), s.current = e;
    }
  }, [e, h]), Tr(() => {
    if (n) {
      let p;
      const m = n.ownerDocument.defaultView ?? window, b = (g) => {
        const y = Ts(a.current).includes(CSS.escape(g.animationName));
        if (g.target === n && y && (h("ANIMATION_END"), !s.current)) {
          const E = n.style.animationFillMode;
          n.style.animationFillMode = "forwards", p = m.setTimeout(() => {
            n.style.animationFillMode === "forwards" && (n.style.animationFillMode = E);
          });
        }
      }, w = (g) => {
        g.target === n && (l.current = Ts(a.current));
      };
      return n.addEventListener("animationstart", w), n.addEventListener("animationcancel", b), n.addEventListener("animationend", b), () => {
        m.clearTimeout(p), n.removeEventListener("animationstart", w), n.removeEventListener("animationcancel", b), n.removeEventListener("animationend", b);
      };
    } else
      h("ANIMATION_END");
  }, [n, h]), {
    isPresent: ["mounted", "unmountSuspended"].includes(d),
    ref: C.useCallback((p) => {
      a.current = p ? getComputedStyle(p) : null, r(p);
    }, [])
  };
}
function Ts(e) {
  return e?.animationName || "none";
}
function L7(e) {
  let n = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, r = n && "isReactWarning" in n && n.isReactWarning;
  return r ? e.ref : (n = Object.getOwnPropertyDescriptor(e, "ref")?.get, r = n && "isReactWarning" in n && n.isReactWarning, r ? e.props.ref : e.props.ref || e.ref);
}
var N7 = C[" useId ".trim().toString()] || (() => {
}), T7 = 0;
function so(e) {
  const [n, r] = C.useState(N7());
  return Tr(() => {
    r((a) => a ?? String(T7++));
  }, [e]), e || (n ? `radix-${n}` : "");
}
var pl = "Collapsible", [A7] = go(pl), [O7, Qu] = A7(pl), Oh = C.forwardRef(
  (e, n) => {
    const {
      __scopeCollapsible: r,
      open: a,
      defaultOpen: s,
      disabled: l,
      onOpenChange: c,
      ...d
    } = e, [h, p] = vi({
      prop: a,
      defaultProp: s ?? !1,
      onChange: c,
      caller: pl
    });
    return /* @__PURE__ */ f(
      O7,
      {
        scope: r,
        disabled: l,
        contentId: so(),
        open: h,
        onOpenToggle: C.useCallback(() => p((m) => !m), [p]),
        children: /* @__PURE__ */ f(
          mt.div,
          {
            "data-state": nd(h),
            "data-disabled": l ? "" : void 0,
            ...d,
            ref: n
          }
        )
      }
    );
  }
);
Oh.displayName = pl;
var Ph = "CollapsibleTrigger", ed = C.forwardRef(
  (e, n) => {
    const { __scopeCollapsible: r, ...a } = e, s = Qu(Ph, r);
    return /* @__PURE__ */ f(
      mt.button,
      {
        type: "button",
        "aria-controls": s.contentId,
        "aria-expanded": s.open || !1,
        "data-state": nd(s.open),
        "data-disabled": s.disabled ? "" : void 0,
        disabled: s.disabled,
        ...a,
        ref: n,
        onClick: Te(e.onClick, s.onOpenToggle)
      }
    );
  }
);
ed.displayName = Ph;
var td = "CollapsibleContent", Dh = C.forwardRef(
  (e, n) => {
    const { forceMount: r, ...a } = e, s = Qu(td, e.__scopeCollapsible);
    return /* @__PURE__ */ f(Xn, { present: r || s.open, children: ({ present: l }) => /* @__PURE__ */ f(P7, { ...a, ref: n, present: l }) });
  }
);
Dh.displayName = td;
var P7 = C.forwardRef((e, n) => {
  const { __scopeCollapsible: r, present: a, children: s, ...l } = e, c = Qu(td, r), [d, h] = C.useState(a), p = C.useRef(null), m = Lt(n, p), b = C.useRef(0), w = b.current, g = C.useRef(0), x = g.current, y = c.open || d, E = C.useRef(y), R = C.useRef(void 0);
  return C.useEffect(() => {
    const N = requestAnimationFrame(() => E.current = !1);
    return () => cancelAnimationFrame(N);
  }, []), Tr(() => {
    const N = p.current;
    if (N) {
      R.current = R.current || {
        transitionDuration: N.style.transitionDuration,
        animationName: N.style.animationName
      }, N.style.transitionDuration = "0s", N.style.animationName = "none";
      const L = N.getBoundingClientRect();
      b.current = L.height, g.current = L.width, E.current || (N.style.transitionDuration = R.current.transitionDuration, N.style.animationName = R.current.animationName), h(a);
    }
  }, [c.open, a]), /* @__PURE__ */ f(
    mt.div,
    {
      "data-state": nd(c.open),
      "data-disabled": c.disabled ? "" : void 0,
      id: c.contentId,
      hidden: !y,
      ...l,
      ref: m,
      style: {
        "--radix-collapsible-content-height": w ? `${w}px` : void 0,
        "--radix-collapsible-content-width": x ? `${x}px` : void 0,
        ...e.style
      },
      children: y && s
    }
  );
});
function nd(e) {
  return e ? "open" : "closed";
}
var D7 = Oh, F7 = C.createContext(void 0);
function Fh(e) {
  const n = C.useContext(F7);
  return e || n || "ltr";
}
function Ar(e) {
  const n = C.useRef(e);
  return C.useEffect(() => {
    n.current = e;
  }), C.useMemo(() => (...r) => n.current?.(...r), []);
}
function W7(e, n = globalThis?.document) {
  const r = Ar(e);
  C.useEffect(() => {
    const a = (s) => {
      s.key === "Escape" && r(s);
    };
    return n.addEventListener("keydown", a, { capture: !0 }), () => n.removeEventListener("keydown", a, { capture: !0 });
  }, [r, n]);
}
var H7 = "DismissableLayer", Ou = "dismissableLayer.update", $7 = "dismissableLayer.pointerDownOutside", z7 = "dismissableLayer.focusOutside", X1, Wh = C.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
}), gl = C.forwardRef(
  (e, n) => {
    const {
      disableOutsidePointerEvents: r = !1,
      onEscapeKeyDown: a,
      onPointerDownOutside: s,
      onFocusOutside: l,
      onInteractOutside: c,
      onDismiss: d,
      ...h
    } = e, p = C.useContext(Wh), [m, b] = C.useState(null), w = m?.ownerDocument ?? globalThis?.document, [, g] = C.useState({}), x = Lt(n, (D) => b(D)), y = Array.from(p.layers), [E] = [...p.layersWithOutsidePointerEventsDisabled].slice(-1), R = y.indexOf(E), N = m ? y.indexOf(m) : -1, L = p.layersWithOutsidePointerEventsDisabled.size > 0, M = N >= R, I = U7((D) => {
      const A = D.target, z = [...p.branches].some((se) => se.contains(A));
      !M || z || (s?.(D), c?.(D), D.defaultPrevented || d?.());
    }, w), O = G7((D) => {
      const A = D.target;
      [...p.branches].some((se) => se.contains(A)) || (l?.(D), c?.(D), D.defaultPrevented || d?.());
    }, w);
    return W7((D) => {
      N === p.layers.size - 1 && (a?.(D), !D.defaultPrevented && d && (D.preventDefault(), d()));
    }, w), C.useEffect(() => {
      if (m)
        return r && (p.layersWithOutsidePointerEventsDisabled.size === 0 && (X1 = w.body.style.pointerEvents, w.body.style.pointerEvents = "none"), p.layersWithOutsidePointerEventsDisabled.add(m)), p.layers.add(m), J1(), () => {
          r && p.layersWithOutsidePointerEventsDisabled.size === 1 && (w.body.style.pointerEvents = X1);
        };
    }, [m, w, r, p]), C.useEffect(() => () => {
      m && (p.layers.delete(m), p.layersWithOutsidePointerEventsDisabled.delete(m), J1());
    }, [m, p]), C.useEffect(() => {
      const D = () => g({});
      return document.addEventListener(Ou, D), () => document.removeEventListener(Ou, D);
    }, []), /* @__PURE__ */ f(
      mt.div,
      {
        ...h,
        ref: x,
        style: {
          pointerEvents: L ? M ? "auto" : "none" : void 0,
          ...e.style
        },
        onFocusCapture: Te(e.onFocusCapture, O.onFocusCapture),
        onBlurCapture: Te(e.onBlurCapture, O.onBlurCapture),
        onPointerDownCapture: Te(
          e.onPointerDownCapture,
          I.onPointerDownCapture
        )
      }
    );
  }
);
gl.displayName = H7;
var B7 = "DismissableLayerBranch", V7 = C.forwardRef((e, n) => {
  const r = C.useContext(Wh), a = C.useRef(null), s = Lt(n, a);
  return C.useEffect(() => {
    const l = a.current;
    if (l)
      return r.branches.add(l), () => {
        r.branches.delete(l);
      };
  }, [r.branches]), /* @__PURE__ */ f(mt.div, { ...e, ref: s });
});
V7.displayName = B7;
function U7(e, n = globalThis?.document) {
  const r = Ar(e), a = C.useRef(!1), s = C.useRef(() => {
  });
  return C.useEffect(() => {
    const l = (d) => {
      if (d.target && !a.current) {
        let h = function() {
          Hh(
            $7,
            r,
            p,
            { discrete: !0 }
          );
        };
        const p = { originalEvent: d };
        d.pointerType === "touch" ? (n.removeEventListener("click", s.current), s.current = h, n.addEventListener("click", s.current, { once: !0 })) : h();
      } else
        n.removeEventListener("click", s.current);
      a.current = !1;
    }, c = window.setTimeout(() => {
      n.addEventListener("pointerdown", l);
    }, 0);
    return () => {
      window.clearTimeout(c), n.removeEventListener("pointerdown", l), n.removeEventListener("click", s.current);
    };
  }, [n, r]), {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => a.current = !0
  };
}
function G7(e, n = globalThis?.document) {
  const r = Ar(e), a = C.useRef(!1);
  return C.useEffect(() => {
    const s = (l) => {
      l.target && !a.current && Hh(z7, r, { originalEvent: l }, {
        discrete: !1
      });
    };
    return n.addEventListener("focusin", s), () => n.removeEventListener("focusin", s);
  }, [n, r]), {
    onFocusCapture: () => a.current = !0,
    onBlurCapture: () => a.current = !1
  };
}
function J1() {
  const e = new CustomEvent(Ou);
  document.dispatchEvent(e);
}
function Hh(e, n, r, { discrete: a }) {
  const s = r.originalEvent.target, l = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: r });
  n && s.addEventListener(e, n, { once: !0 }), a ? Nh(s, l) : s.dispatchEvent(l);
}
var su = "focusScope.autoFocusOnMount", lu = "focusScope.autoFocusOnUnmount", Q1 = { bubbles: !1, cancelable: !0 }, K7 = "FocusScope", rd = C.forwardRef((e, n) => {
  const {
    loop: r = !1,
    trapped: a = !1,
    onMountAutoFocus: s,
    onUnmountAutoFocus: l,
    ...c
  } = e, [d, h] = C.useState(null), p = Ar(s), m = Ar(l), b = C.useRef(null), w = Lt(n, (y) => h(y)), g = C.useRef({
    paused: !1,
    pause() {
      this.paused = !0;
    },
    resume() {
      this.paused = !1;
    }
  }).current;
  C.useEffect(() => {
    if (a) {
      let y = function(L) {
        if (g.paused || !d) return;
        const M = L.target;
        d.contains(M) ? b.current = M : oo(b.current, { select: !0 });
      }, E = function(L) {
        if (g.paused || !d) return;
        const M = L.relatedTarget;
        M !== null && (d.contains(M) || oo(b.current, { select: !0 }));
      }, R = function(L) {
        if (document.activeElement === document.body)
          for (const I of L)
            I.removedNodes.length > 0 && oo(d);
      };
      document.addEventListener("focusin", y), document.addEventListener("focusout", E);
      const N = new MutationObserver(R);
      return d && N.observe(d, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", y), document.removeEventListener("focusout", E), N.disconnect();
      };
    }
  }, [a, d, g.paused]), C.useEffect(() => {
    if (d) {
      t0.add(g);
      const y = document.activeElement;
      if (!d.contains(y)) {
        const R = new CustomEvent(su, Q1);
        d.addEventListener(su, p), d.dispatchEvent(R), R.defaultPrevented || (Z7(J7($h(d)), { select: !0 }), document.activeElement === y && oo(d));
      }
      return () => {
        d.removeEventListener(su, p), setTimeout(() => {
          const R = new CustomEvent(lu, Q1);
          d.addEventListener(lu, m), d.dispatchEvent(R), R.defaultPrevented || oo(y ?? document.body, { select: !0 }), d.removeEventListener(lu, m), t0.remove(g);
        }, 0);
      };
    }
  }, [d, p, m, g]);
  const x = C.useCallback(
    (y) => {
      if (!r && !a || g.paused) return;
      const E = y.key === "Tab" && !y.altKey && !y.ctrlKey && !y.metaKey, R = document.activeElement;
      if (E && R) {
        const N = y.currentTarget, [L, M] = j7(N);
        L && M ? !y.shiftKey && R === M ? (y.preventDefault(), r && oo(L, { select: !0 })) : y.shiftKey && R === L && (y.preventDefault(), r && oo(M, { select: !0 })) : R === N && y.preventDefault();
      }
    },
    [r, a, g.paused]
  );
  return /* @__PURE__ */ f(mt.div, { tabIndex: -1, ...c, ref: w, onKeyDown: x });
});
rd.displayName = K7;
function Z7(e, { select: n = !1 } = {}) {
  const r = document.activeElement;
  for (const a of e)
    if (oo(a, { select: n }), document.activeElement !== r) return;
}
function j7(e) {
  const n = $h(e), r = e0(n, e), a = e0(n.reverse(), e);
  return [r, a];
}
function $h(e) {
  const n = [], r = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (a) => {
      const s = a.tagName === "INPUT" && a.type === "hidden";
      return a.disabled || a.hidden || s ? NodeFilter.FILTER_SKIP : a.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; r.nextNode(); ) n.push(r.currentNode);
  return n;
}
function e0(e, n) {
  for (const r of e)
    if (!q7(r, { upTo: n })) return r;
}
function q7(e, { upTo: n }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (n !== void 0 && e === n) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function Y7(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function oo(e, { select: n = !1 } = {}) {
  if (e && e.focus) {
    const r = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== r && Y7(e) && n && e.select();
  }
}
var t0 = X7();
function X7() {
  let e = [];
  return {
    add(n) {
      const r = e[0];
      n !== r && r?.pause(), e = n0(e, n), e.unshift(n);
    },
    remove(n) {
      e = n0(e, n), e[0]?.resume();
    }
  };
}
function n0(e, n) {
  const r = [...e], a = r.indexOf(n);
  return a !== -1 && r.splice(a, 1), r;
}
function J7(e) {
  return e.filter((n) => n.tagName !== "A");
}
var Q7 = "Portal", ml = C.forwardRef((e, n) => {
  const { container: r, ...a } = e, [s, l] = C.useState(!1);
  Tr(() => l(!0), []);
  const c = r || s && globalThis?.document?.body;
  return c ? lh.createPortal(/* @__PURE__ */ f(mt.div, { ...a, ref: n }), c) : null;
});
ml.displayName = Q7;
var cu = 0;
function zh() {
  C.useEffect(() => {
    const e = document.querySelectorAll("[data-radix-focus-guard]");
    return document.body.insertAdjacentElement("afterbegin", e[0] ?? r0()), document.body.insertAdjacentElement("beforeend", e[1] ?? r0()), cu++, () => {
      cu === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((n) => n.remove()), cu--;
    };
  }, []);
}
function r0() {
  const e = document.createElement("span");
  return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
var or = function() {
  return or = Object.assign || function(n) {
    for (var r, a = 1, s = arguments.length; a < s; a++) {
      r = arguments[a];
      for (var l in r) Object.prototype.hasOwnProperty.call(r, l) && (n[l] = r[l]);
    }
    return n;
  }, or.apply(this, arguments);
};
function Bh(e, n) {
  var r = {};
  for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && n.indexOf(a) < 0 && (r[a] = e[a]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, a = Object.getOwnPropertySymbols(e); s < a.length; s++)
      n.indexOf(a[s]) < 0 && Object.prototype.propertyIsEnumerable.call(e, a[s]) && (r[a[s]] = e[a[s]]);
  return r;
}
function e8(e, n, r) {
  if (r || arguments.length === 2) for (var a = 0, s = n.length, l; a < s; a++)
    (l || !(a in n)) && (l || (l = Array.prototype.slice.call(n, 0, a)), l[a] = n[a]);
  return e.concat(l || Array.prototype.slice.call(n));
}
var Ks = "right-scroll-bar-position", Zs = "width-before-scroll-bar", t8 = "with-scroll-bars-hidden", n8 = "--removed-body-scroll-bar-size";
function uu(e, n) {
  return typeof e == "function" ? e(n) : e && (e.current = n), e;
}
function r8(e, n) {
  var r = Ze(function() {
    return {
      // value
      value: e,
      // last callback
      callback: n,
      // "memoized" public interface
      facade: {
        get current() {
          return r.value;
        },
        set current(a) {
          var s = r.value;
          s !== a && (r.value = a, r.callback(a, s));
        }
      }
    };
  })[0];
  return r.callback = n, r.facade;
}
var o8 = typeof window < "u" ? C.useLayoutEffect : C.useEffect, o0 = /* @__PURE__ */ new WeakMap();
function a8(e, n) {
  var r = r8(null, function(a) {
    return e.forEach(function(s) {
      return uu(s, a);
    });
  });
  return o8(function() {
    var a = o0.get(r);
    if (a) {
      var s = new Set(a), l = new Set(e), c = r.current;
      s.forEach(function(d) {
        l.has(d) || uu(d, null);
      }), l.forEach(function(d) {
        s.has(d) || uu(d, c);
      });
    }
    o0.set(r, e);
  }, [e]), r;
}
function i8(e) {
  return e;
}
function s8(e, n) {
  n === void 0 && (n = i8);
  var r = [], a = !1, s = {
    read: function() {
      if (a)
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      return r.length ? r[r.length - 1] : e;
    },
    useMedium: function(l) {
      var c = n(l, a);
      return r.push(c), function() {
        r = r.filter(function(d) {
          return d !== c;
        });
      };
    },
    assignSyncMedium: function(l) {
      for (a = !0; r.length; ) {
        var c = r;
        r = [], c.forEach(l);
      }
      r = {
        push: function(d) {
          return l(d);
        },
        filter: function() {
          return r;
        }
      };
    },
    assignMedium: function(l) {
      a = !0;
      var c = [];
      if (r.length) {
        var d = r;
        r = [], d.forEach(l), c = r;
      }
      var h = function() {
        var m = c;
        c = [], m.forEach(l);
      }, p = function() {
        return Promise.resolve().then(h);
      };
      p(), r = {
        push: function(m) {
          c.push(m), p();
        },
        filter: function(m) {
          return c = c.filter(m), r;
        }
      };
    }
  };
  return s;
}
function l8(e) {
  e === void 0 && (e = {});
  var n = s8(null);
  return n.options = or({ async: !0, ssr: !1 }, e), n;
}
var Vh = function(e) {
  var n = e.sideCar, r = Bh(e, ["sideCar"]);
  if (!n)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var a = n.read();
  if (!a)
    throw new Error("Sidecar medium not found");
  return C.createElement(a, or({}, r));
};
Vh.isSideCarExport = !0;
function c8(e, n) {
  return e.useMedium(n), Vh;
}
var Uh = l8(), du = function() {
}, vl = C.forwardRef(function(e, n) {
  var r = C.useRef(null), a = C.useState({
    onScrollCapture: du,
    onWheelCapture: du,
    onTouchMoveCapture: du
  }), s = a[0], l = a[1], c = e.forwardProps, d = e.children, h = e.className, p = e.removeScrollBar, m = e.enabled, b = e.shards, w = e.sideCar, g = e.noRelative, x = e.noIsolation, y = e.inert, E = e.allowPinchZoom, R = e.as, N = R === void 0 ? "div" : R, L = e.gapMode, M = Bh(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), I = w, O = a8([r, n]), D = or(or({}, M), s);
  return C.createElement(
    C.Fragment,
    null,
    m && C.createElement(I, { sideCar: Uh, removeScrollBar: p, shards: b, noRelative: g, noIsolation: x, inert: y, setCallbacks: l, allowPinchZoom: !!E, lockRef: r, gapMode: L }),
    c ? C.cloneElement(C.Children.only(d), or(or({}, D), { ref: O })) : C.createElement(N, or({}, D, { className: h, ref: O }), d)
  );
});
vl.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
vl.classNames = {
  fullWidth: Zs,
  zeroRight: Ks
};
var u8 = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function d8() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var n = u8();
  return n && e.setAttribute("nonce", n), e;
}
function f8(e, n) {
  e.styleSheet ? e.styleSheet.cssText = n : e.appendChild(document.createTextNode(n));
}
function h8(e) {
  var n = document.head || document.getElementsByTagName("head")[0];
  n.appendChild(e);
}
var p8 = function() {
  var e = 0, n = null;
  return {
    add: function(r) {
      e == 0 && (n = d8()) && (f8(n, r), h8(n)), e++;
    },
    remove: function() {
      e--, !e && n && (n.parentNode && n.parentNode.removeChild(n), n = null);
    }
  };
}, g8 = function() {
  var e = p8();
  return function(n, r) {
    C.useEffect(function() {
      return e.add(n), function() {
        e.remove();
      };
    }, [n && r]);
  };
}, Gh = function() {
  var e = g8(), n = function(r) {
    var a = r.styles, s = r.dynamic;
    return e(a, s), null;
  };
  return n;
}, m8 = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, fu = function(e) {
  return parseInt(e || "", 10) || 0;
}, v8 = function(e) {
  var n = window.getComputedStyle(document.body), r = n[e === "padding" ? "paddingLeft" : "marginLeft"], a = n[e === "padding" ? "paddingTop" : "marginTop"], s = n[e === "padding" ? "paddingRight" : "marginRight"];
  return [fu(r), fu(a), fu(s)];
}, b8 = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return m8;
  var n = v8(e), r = document.documentElement.clientWidth, a = window.innerWidth;
  return {
    left: n[0],
    top: n[1],
    right: n[2],
    gap: Math.max(0, a - r + n[2] - n[0])
  };
}, y8 = Gh(), ma = "data-scroll-locked", w8 = function(e, n, r, a) {
  var s = e.left, l = e.top, c = e.right, d = e.gap;
  return r === void 0 && (r = "margin"), `
  .`.concat(t8, ` {
   overflow: hidden `).concat(a, `;
   padding-right: `).concat(d, "px ").concat(a, `;
  }
  body[`).concat(ma, `] {
    overflow: hidden `).concat(a, `;
    overscroll-behavior: contain;
    `).concat([
    n && "position: relative ".concat(a, ";"),
    r === "margin" && `
    padding-left: `.concat(s, `px;
    padding-top: `).concat(l, `px;
    padding-right: `).concat(c, `px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(d, "px ").concat(a, `;
    `),
    r === "padding" && "padding-right: ".concat(d, "px ").concat(a, ";")
  ].filter(Boolean).join(""), `
  }
  
  .`).concat(Ks, ` {
    right: `).concat(d, "px ").concat(a, `;
  }
  
  .`).concat(Zs, ` {
    margin-right: `).concat(d, "px ").concat(a, `;
  }
  
  .`).concat(Ks, " .").concat(Ks, ` {
    right: 0 `).concat(a, `;
  }
  
  .`).concat(Zs, " .").concat(Zs, ` {
    margin-right: 0 `).concat(a, `;
  }
  
  body[`).concat(ma, `] {
    `).concat(n8, ": ").concat(d, `px;
  }
`);
}, a0 = function() {
  var e = parseInt(document.body.getAttribute(ma) || "0", 10);
  return isFinite(e) ? e : 0;
}, x8 = function() {
  C.useEffect(function() {
    return document.body.setAttribute(ma, (a0() + 1).toString()), function() {
      var e = a0() - 1;
      e <= 0 ? document.body.removeAttribute(ma) : document.body.setAttribute(ma, e.toString());
    };
  }, []);
}, C8 = function(e) {
  var n = e.noRelative, r = e.noImportant, a = e.gapMode, s = a === void 0 ? "margin" : a;
  x8();
  var l = C.useMemo(function() {
    return b8(s);
  }, [s]);
  return C.createElement(y8, { styles: w8(l, !n, s, r ? "" : "!important") });
}, Pu = !1;
if (typeof window < "u")
  try {
    var As = Object.defineProperty({}, "passive", {
      get: function() {
        return Pu = !0, !0;
      }
    });
    window.addEventListener("test", As, As), window.removeEventListener("test", As, As);
  } catch {
    Pu = !1;
  }
var fa = Pu ? { passive: !1 } : !1, S8 = function(e) {
  return e.tagName === "TEXTAREA";
}, Kh = function(e, n) {
  if (!(e instanceof Element))
    return !1;
  var r = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    r[n] !== "hidden" && // contains scroll inside self
    !(r.overflowY === r.overflowX && !S8(e) && r[n] === "visible")
  );
}, _8 = function(e) {
  return Kh(e, "overflowY");
}, E8 = function(e) {
  return Kh(e, "overflowX");
}, i0 = function(e, n) {
  var r = n.ownerDocument, a = n;
  do {
    typeof ShadowRoot < "u" && a instanceof ShadowRoot && (a = a.host);
    var s = Zh(e, a);
    if (s) {
      var l = jh(e, a), c = l[1], d = l[2];
      if (c > d)
        return !0;
    }
    a = a.parentNode;
  } while (a && a !== r.body);
  return !1;
}, R8 = function(e) {
  var n = e.scrollTop, r = e.scrollHeight, a = e.clientHeight;
  return [
    n,
    r,
    a
  ];
}, I8 = function(e) {
  var n = e.scrollLeft, r = e.scrollWidth, a = e.clientWidth;
  return [
    n,
    r,
    a
  ];
}, Zh = function(e, n) {
  return e === "v" ? _8(n) : E8(n);
}, jh = function(e, n) {
  return e === "v" ? R8(n) : I8(n);
}, k8 = function(e, n) {
  return e === "h" && n === "rtl" ? -1 : 1;
}, M8 = function(e, n, r, a, s) {
  var l = k8(e, window.getComputedStyle(n).direction), c = l * a, d = r.target, h = n.contains(d), p = !1, m = c > 0, b = 0, w = 0;
  do {
    if (!d)
      break;
    var g = jh(e, d), x = g[0], y = g[1], E = g[2], R = y - E - l * x;
    (x || R) && Zh(e, d) && (b += R, w += x);
    var N = d.parentNode;
    d = N && N.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? N.host : N;
  } while (
    // portaled content
    !h && d !== document.body || // self content
    h && (n.contains(d) || n === d)
  );
  return (m && Math.abs(b) < 1 || !m && Math.abs(w) < 1) && (p = !0), p;
}, Os = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, s0 = function(e) {
  return [e.deltaX, e.deltaY];
}, l0 = function(e) {
  return e && "current" in e ? e.current : e;
}, L8 = function(e, n) {
  return e[0] === n[0] && e[1] === n[1];
}, N8 = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, T8 = 0, ha = [];
function A8(e) {
  var n = C.useRef([]), r = C.useRef([0, 0]), a = C.useRef(), s = C.useState(T8++)[0], l = C.useState(Gh)[0], c = C.useRef(e);
  C.useEffect(function() {
    c.current = e;
  }, [e]), C.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(s));
      var y = e8([e.lockRef.current], (e.shards || []).map(l0), !0).filter(Boolean);
      return y.forEach(function(E) {
        return E.classList.add("allow-interactivity-".concat(s));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(s)), y.forEach(function(E) {
          return E.classList.remove("allow-interactivity-".concat(s));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var d = C.useCallback(function(y, E) {
    if ("touches" in y && y.touches.length === 2 || y.type === "wheel" && y.ctrlKey)
      return !c.current.allowPinchZoom;
    var R = Os(y), N = r.current, L = "deltaX" in y ? y.deltaX : N[0] - R[0], M = "deltaY" in y ? y.deltaY : N[1] - R[1], I, O = y.target, D = Math.abs(L) > Math.abs(M) ? "h" : "v";
    if ("touches" in y && D === "h" && O.type === "range")
      return !1;
    var A = window.getSelection(), z = A && A.anchorNode, se = z ? z === O || z.contains(O) : !1;
    if (se)
      return !1;
    var ue = i0(D, O);
    if (!ue)
      return !0;
    if (ue ? I = D : (I = D === "v" ? "h" : "v", ue = i0(D, O)), !ue)
      return !1;
    if (!a.current && "changedTouches" in y && (L || M) && (a.current = I), !I)
      return !0;
    var ce = a.current || I;
    return M8(ce, E, y, ce === "h" ? L : M);
  }, []), h = C.useCallback(function(y) {
    var E = y;
    if (!(!ha.length || ha[ha.length - 1] !== l)) {
      var R = "deltaY" in E ? s0(E) : Os(E), N = n.current.filter(function(I) {
        return I.name === E.type && (I.target === E.target || E.target === I.shadowParent) && L8(I.delta, R);
      })[0];
      if (N && N.should) {
        E.cancelable && E.preventDefault();
        return;
      }
      if (!N) {
        var L = (c.current.shards || []).map(l0).filter(Boolean).filter(function(I) {
          return I.contains(E.target);
        }), M = L.length > 0 ? d(E, L[0]) : !c.current.noIsolation;
        M && E.cancelable && E.preventDefault();
      }
    }
  }, []), p = C.useCallback(function(y, E, R, N) {
    var L = { name: y, delta: E, target: R, should: N, shadowParent: O8(R) };
    n.current.push(L), setTimeout(function() {
      n.current = n.current.filter(function(M) {
        return M !== L;
      });
    }, 1);
  }, []), m = C.useCallback(function(y) {
    r.current = Os(y), a.current = void 0;
  }, []), b = C.useCallback(function(y) {
    p(y.type, s0(y), y.target, d(y, e.lockRef.current));
  }, []), w = C.useCallback(function(y) {
    p(y.type, Os(y), y.target, d(y, e.lockRef.current));
  }, []);
  C.useEffect(function() {
    return ha.push(l), e.setCallbacks({
      onScrollCapture: b,
      onWheelCapture: b,
      onTouchMoveCapture: w
    }), document.addEventListener("wheel", h, fa), document.addEventListener("touchmove", h, fa), document.addEventListener("touchstart", m, fa), function() {
      ha = ha.filter(function(y) {
        return y !== l;
      }), document.removeEventListener("wheel", h, fa), document.removeEventListener("touchmove", h, fa), document.removeEventListener("touchstart", m, fa);
    };
  }, []);
  var g = e.removeScrollBar, x = e.inert;
  return C.createElement(
    C.Fragment,
    null,
    x ? C.createElement(l, { styles: N8(s) }) : null,
    g ? C.createElement(C8, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function O8(e) {
  for (var n = null; e !== null; )
    e instanceof ShadowRoot && (n = e.host, e = e.host), e = e.parentNode;
  return n;
}
const P8 = c8(Uh, A8);
var od = C.forwardRef(function(e, n) {
  return C.createElement(vl, or({}, e, { ref: n, sideCar: P8 }));
});
od.classNames = vl.classNames;
var D8 = function(e) {
  if (typeof document > "u")
    return null;
  var n = Array.isArray(e) ? e[0] : e;
  return n.ownerDocument.body;
}, pa = /* @__PURE__ */ new WeakMap(), Ps = /* @__PURE__ */ new WeakMap(), Ds = {}, hu = 0, qh = function(e) {
  return e && (e.host || qh(e.parentNode));
}, F8 = function(e, n) {
  return n.map(function(r) {
    if (e.contains(r))
      return r;
    var a = qh(r);
    return a && e.contains(a) ? a : (console.error("aria-hidden", r, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(r) {
    return !!r;
  });
}, W8 = function(e, n, r, a) {
  var s = F8(n, Array.isArray(e) ? e : [e]);
  Ds[r] || (Ds[r] = /* @__PURE__ */ new WeakMap());
  var l = Ds[r], c = [], d = /* @__PURE__ */ new Set(), h = new Set(s), p = function(b) {
    !b || d.has(b) || (d.add(b), p(b.parentNode));
  };
  s.forEach(p);
  var m = function(b) {
    !b || h.has(b) || Array.prototype.forEach.call(b.children, function(w) {
      if (d.has(w))
        m(w);
      else
        try {
          var g = w.getAttribute(a), x = g !== null && g !== "false", y = (pa.get(w) || 0) + 1, E = (l.get(w) || 0) + 1;
          pa.set(w, y), l.set(w, E), c.push(w), y === 1 && x && Ps.set(w, !0), E === 1 && w.setAttribute(r, "true"), x || w.setAttribute(a, "true");
        } catch (R) {
          console.error("aria-hidden: cannot operate on ", w, R);
        }
    });
  };
  return m(n), d.clear(), hu++, function() {
    c.forEach(function(b) {
      var w = pa.get(b) - 1, g = l.get(b) - 1;
      pa.set(b, w), l.set(b, g), w || (Ps.has(b) || b.removeAttribute(a), Ps.delete(b)), g || b.removeAttribute(r);
    }), hu--, hu || (pa = /* @__PURE__ */ new WeakMap(), pa = /* @__PURE__ */ new WeakMap(), Ps = /* @__PURE__ */ new WeakMap(), Ds = {});
  };
}, Yh = function(e, n, r) {
  r === void 0 && (r = "data-aria-hidden");
  var a = Array.from(Array.isArray(e) ? e : [e]), s = D8(e);
  return s ? (a.push.apply(a, Array.from(s.querySelectorAll("[aria-live], script"))), W8(a, s, r, "aria-hidden")) : function() {
    return null;
  };
}, bl = "Dialog", [Xh] = go(bl), [H8, Jn] = Xh(bl), Jh = (e) => {
  const {
    __scopeDialog: n,
    children: r,
    open: a,
    defaultOpen: s,
    onOpenChange: l,
    modal: c = !0
  } = e, d = C.useRef(null), h = C.useRef(null), [p, m] = vi({
    prop: a,
    defaultProp: s ?? !1,
    onChange: l,
    caller: bl
  });
  return /* @__PURE__ */ f(
    H8,
    {
      scope: n,
      triggerRef: d,
      contentRef: h,
      contentId: so(),
      titleId: so(),
      descriptionId: so(),
      open: p,
      onOpenChange: m,
      onOpenToggle: C.useCallback(() => m((b) => !b), [m]),
      modal: c,
      children: r
    }
  );
};
Jh.displayName = bl;
var Qh = "DialogTrigger", ep = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: r, ...a } = e, s = Jn(Qh, r), l = Lt(n, s.triggerRef);
    return /* @__PURE__ */ f(
      mt.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": s.open,
        "aria-controls": s.contentId,
        "data-state": sd(s.open),
        ...a,
        ref: l,
        onClick: Te(e.onClick, s.onOpenToggle)
      }
    );
  }
);
ep.displayName = Qh;
var ad = "DialogPortal", [$8, tp] = Xh(ad, {
  forceMount: void 0
}), np = (e) => {
  const { __scopeDialog: n, forceMount: r, children: a, container: s } = e, l = Jn(ad, n);
  return /* @__PURE__ */ f($8, { scope: n, forceMount: r, children: C.Children.map(a, (c) => /* @__PURE__ */ f(Xn, { present: r || l.open, children: /* @__PURE__ */ f(ml, { asChild: !0, container: s, children: c }) })) });
};
np.displayName = ad;
var Qs = "DialogOverlay", rp = C.forwardRef(
  (e, n) => {
    const r = tp(Qs, e.__scopeDialog), { forceMount: a = r.forceMount, ...s } = e, l = Jn(Qs, e.__scopeDialog);
    return l.modal ? /* @__PURE__ */ f(Xn, { present: a || l.open, children: /* @__PURE__ */ f(B8, { ...s, ref: n }) }) : null;
  }
);
rp.displayName = Qs;
var z8 = /* @__PURE__ */ ba("DialogOverlay.RemoveScroll"), B8 = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: r, ...a } = e, s = Jn(Qs, r);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ f(od, { as: z8, allowPinchZoom: !0, shards: [s.contentRef], children: /* @__PURE__ */ f(
        mt.div,
        {
          "data-state": sd(s.open),
          ...a,
          ref: n,
          style: { pointerEvents: "auto", ...a.style }
        }
      ) })
    );
  }
), Po = "DialogContent", op = C.forwardRef(
  (e, n) => {
    const r = tp(Po, e.__scopeDialog), { forceMount: a = r.forceMount, ...s } = e, l = Jn(Po, e.__scopeDialog);
    return /* @__PURE__ */ f(Xn, { present: a || l.open, children: l.modal ? /* @__PURE__ */ f(V8, { ...s, ref: n }) : /* @__PURE__ */ f(U8, { ...s, ref: n }) });
  }
);
op.displayName = Po;
var V8 = C.forwardRef(
  (e, n) => {
    const r = Jn(Po, e.__scopeDialog), a = C.useRef(null), s = Lt(n, r.contentRef, a);
    return C.useEffect(() => {
      const l = a.current;
      if (l) return Yh(l);
    }, []), /* @__PURE__ */ f(
      ap,
      {
        ...e,
        ref: s,
        trapFocus: r.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: Te(e.onCloseAutoFocus, (l) => {
          l.preventDefault(), r.triggerRef.current?.focus();
        }),
        onPointerDownOutside: Te(e.onPointerDownOutside, (l) => {
          const c = l.detail.originalEvent, d = c.button === 0 && c.ctrlKey === !0;
          (c.button === 2 || d) && l.preventDefault();
        }),
        onFocusOutside: Te(
          e.onFocusOutside,
          (l) => l.preventDefault()
        )
      }
    );
  }
), U8 = C.forwardRef(
  (e, n) => {
    const r = Jn(Po, e.__scopeDialog), a = C.useRef(!1), s = C.useRef(!1);
    return /* @__PURE__ */ f(
      ap,
      {
        ...e,
        ref: n,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (l) => {
          e.onCloseAutoFocus?.(l), l.defaultPrevented || (a.current || r.triggerRef.current?.focus(), l.preventDefault()), a.current = !1, s.current = !1;
        },
        onInteractOutside: (l) => {
          e.onInteractOutside?.(l), l.defaultPrevented || (a.current = !0, l.detail.originalEvent.type === "pointerdown" && (s.current = !0));
          const c = l.target;
          r.triggerRef.current?.contains(c) && l.preventDefault(), l.detail.originalEvent.type === "focusin" && s.current && l.preventDefault();
        }
      }
    );
  }
), ap = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: r, trapFocus: a, onOpenAutoFocus: s, onCloseAutoFocus: l, ...c } = e, d = Jn(Po, r), h = C.useRef(null), p = Lt(n, h);
    return zh(), /* @__PURE__ */ V(Fn, { children: [
      /* @__PURE__ */ f(
        rd,
        {
          asChild: !0,
          loop: !0,
          trapped: a,
          onMountAutoFocus: s,
          onUnmountAutoFocus: l,
          children: /* @__PURE__ */ f(
            gl,
            {
              role: "dialog",
              id: d.contentId,
              "aria-describedby": d.descriptionId,
              "aria-labelledby": d.titleId,
              "data-state": sd(d.open),
              ...c,
              ref: p,
              onDismiss: () => d.onOpenChange(!1)
            }
          )
        }
      ),
      /* @__PURE__ */ V(Fn, { children: [
        /* @__PURE__ */ f(G8, { titleId: d.titleId }),
        /* @__PURE__ */ f(Z8, { contentRef: h, descriptionId: d.descriptionId })
      ] })
    ] });
  }
), id = "DialogTitle", ip = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: r, ...a } = e, s = Jn(id, r);
    return /* @__PURE__ */ f(mt.h2, { id: s.titleId, ...a, ref: n });
  }
);
ip.displayName = id;
var sp = "DialogDescription", lp = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: r, ...a } = e, s = Jn(sp, r);
    return /* @__PURE__ */ f(mt.p, { id: s.descriptionId, ...a, ref: n });
  }
);
lp.displayName = sp;
var cp = "DialogClose", up = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: r, ...a } = e, s = Jn(cp, r);
    return /* @__PURE__ */ f(
      mt.button,
      {
        type: "button",
        ...a,
        ref: n,
        onClick: Te(e.onClick, () => s.onOpenChange(!1))
      }
    );
  }
);
up.displayName = cp;
function sd(e) {
  return e ? "open" : "closed";
}
var dp = "DialogTitleWarning", [rI, fp] = S7(dp, {
  contentName: Po,
  titleName: id,
  docsSlug: "dialog"
}), G8 = ({ titleId: e }) => {
  const n = fp(dp), r = `\`${n.contentName}\` requires a \`${n.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${n.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${n.docsSlug}`;
  return C.useEffect(() => {
    e && (document.getElementById(e) || console.error(r));
  }, [r, e]), null;
}, K8 = "DialogDescriptionWarning", Z8 = ({ contentRef: e, descriptionId: n }) => {
  const a = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${fp(K8).contentName}}.`;
  return C.useEffect(() => {
    const s = e.current?.getAttribute("aria-describedby");
    n && s && (document.getElementById(n) || console.warn(a));
  }, [a, e, n]), null;
}, j8 = Jh, hp = ep, pp = np, gp = rp, mp = op, vp = ip, bp = lp, q8 = up, Fs = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function yp(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ws = { exports: {} }, pu = {};
var c0;
function Y8() {
  if (c0) return pu;
  c0 = 1;
  var e = de;
  function n(b, w) {
    return b === w && (b !== 0 || 1 / b === 1 / w) || b !== b && w !== w;
  }
  var r = typeof Object.is == "function" ? Object.is : n, a = e.useState, s = e.useEffect, l = e.useLayoutEffect, c = e.useDebugValue;
  function d(b, w) {
    var g = w(), x = a({ inst: { value: g, getSnapshot: w } }), y = x[0].inst, E = x[1];
    return l(
      function() {
        y.value = g, y.getSnapshot = w, h(y) && E({ inst: y });
      },
      [b, g, w]
    ), s(
      function() {
        return h(y) && E({ inst: y }), b(function() {
          h(y) && E({ inst: y });
        });
      },
      [b]
    ), c(g), g;
  }
  function h(b) {
    var w = b.getSnapshot;
    b = b.value;
    try {
      var g = w();
      return !r(b, g);
    } catch {
      return !0;
    }
  }
  function p(b, w) {
    return w();
  }
  var m = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? p : d;
  return pu.useSyncExternalStore = e.useSyncExternalStore !== void 0 ? e.useSyncExternalStore : m, pu;
}
var gu = {};
var u0;
function X8() {
  return u0 || (u0 = 1, process.env.NODE_ENV !== "production" && (function() {
    function e(g, x) {
      return g === x && (g !== 0 || 1 / g === 1 / x) || g !== g && x !== x;
    }
    function n(g, x) {
      m || s.startTransition === void 0 || (m = !0, console.error(
        "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
      ));
      var y = x();
      if (!b) {
        var E = x();
        l(y, E) || (console.error(
          "The result of getSnapshot should be cached to avoid an infinite loop"
        ), b = !0);
      }
      E = c({
        inst: { value: y, getSnapshot: x }
      });
      var R = E[0].inst, N = E[1];
      return h(
        function() {
          R.value = y, R.getSnapshot = x, r(R) && N({ inst: R });
        },
        [g, y, x]
      ), d(
        function() {
          return r(R) && N({ inst: R }), g(function() {
            r(R) && N({ inst: R });
          });
        },
        [g]
      ), p(y), y;
    }
    function r(g) {
      var x = g.getSnapshot;
      g = g.value;
      try {
        var y = x();
        return !l(g, y);
      } catch {
        return !0;
      }
    }
    function a(g, x) {
      return x();
    }
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var s = de, l = typeof Object.is == "function" ? Object.is : e, c = s.useState, d = s.useEffect, h = s.useLayoutEffect, p = s.useDebugValue, m = !1, b = !1, w = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? a : n;
    gu.useSyncExternalStore = s.useSyncExternalStore !== void 0 ? s.useSyncExternalStore : w, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })()), gu;
}
var d0;
function J8() {
  return d0 || (d0 = 1, process.env.NODE_ENV === "production" ? Ws.exports = Y8() : Ws.exports = X8()), Ws.exports;
}
var Q8 = J8();
function ey(e) {
  const [n, r] = C.useState(void 0);
  return Tr(() => {
    if (e) {
      r({ width: e.offsetWidth, height: e.offsetHeight });
      const a = new ResizeObserver((s) => {
        if (!Array.isArray(s) || !s.length)
          return;
        const l = s[0];
        let c, d;
        if ("borderBoxSize" in l) {
          const h = l.borderBoxSize, p = Array.isArray(h) ? h[0] : h;
          c = p.inlineSize, d = p.blockSize;
        } else
          c = e.offsetWidth, d = e.offsetHeight;
        r({ width: c, height: d });
      });
      return a.observe(e, { box: "border-box" }), () => a.unobserve(e);
    } else
      r(void 0);
  }, [e]), n;
}
const ty = ["top", "right", "bottom", "left"], uo = Math.min, Cn = Math.max, el = Math.round, Hs = Math.floor, sr = (e) => ({
  x: e,
  y: e
}), ny = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}, ry = {
  start: "end",
  end: "start"
};
function Du(e, n, r) {
  return Cn(e, uo(n, r));
}
function Or(e, n) {
  return typeof e == "function" ? e(n) : e;
}
function Pr(e) {
  return e.split("-")[0];
}
function Ca(e) {
  return e.split("-")[1];
}
function ld(e) {
  return e === "x" ? "y" : "x";
}
function cd(e) {
  return e === "y" ? "height" : "width";
}
const oy = /* @__PURE__ */ new Set(["top", "bottom"]);
function ir(e) {
  return oy.has(Pr(e)) ? "y" : "x";
}
function ud(e) {
  return ld(ir(e));
}
function ay(e, n, r) {
  r === void 0 && (r = !1);
  const a = Ca(e), s = ud(e), l = cd(s);
  let c = s === "x" ? a === (r ? "end" : "start") ? "right" : "left" : a === "start" ? "bottom" : "top";
  return n.reference[l] > n.floating[l] && (c = tl(c)), [c, tl(c)];
}
function iy(e) {
  const n = tl(e);
  return [Fu(e), n, Fu(n)];
}
function Fu(e) {
  return e.replace(/start|end/g, (n) => ry[n]);
}
const f0 = ["left", "right"], h0 = ["right", "left"], sy = ["top", "bottom"], ly = ["bottom", "top"];
function cy(e, n, r) {
  switch (e) {
    case "top":
    case "bottom":
      return r ? n ? h0 : f0 : n ? f0 : h0;
    case "left":
    case "right":
      return n ? sy : ly;
    default:
      return [];
  }
}
function uy(e, n, r, a) {
  const s = Ca(e);
  let l = cy(Pr(e), r === "start", a);
  return s && (l = l.map((c) => c + "-" + s), n && (l = l.concat(l.map(Fu)))), l;
}
function tl(e) {
  return e.replace(/left|right|bottom|top/g, (n) => ny[n]);
}
function dy(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function wp(e) {
  return typeof e != "number" ? dy(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function nl(e) {
  const {
    x: n,
    y: r,
    width: a,
    height: s
  } = e;
  return {
    width: a,
    height: s,
    top: r,
    left: n,
    right: n + a,
    bottom: r + s,
    x: n,
    y: r
  };
}
function p0(e, n, r) {
  let {
    reference: a,
    floating: s
  } = e;
  const l = ir(n), c = ud(n), d = cd(c), h = Pr(n), p = l === "y", m = a.x + a.width / 2 - s.width / 2, b = a.y + a.height / 2 - s.height / 2, w = a[d] / 2 - s[d] / 2;
  let g;
  switch (h) {
    case "top":
      g = {
        x: m,
        y: a.y - s.height
      };
      break;
    case "bottom":
      g = {
        x: m,
        y: a.y + a.height
      };
      break;
    case "right":
      g = {
        x: a.x + a.width,
        y: b
      };
      break;
    case "left":
      g = {
        x: a.x - s.width,
        y: b
      };
      break;
    default:
      g = {
        x: a.x,
        y: a.y
      };
  }
  switch (Ca(n)) {
    case "start":
      g[c] -= w * (r && p ? -1 : 1);
      break;
    case "end":
      g[c] += w * (r && p ? -1 : 1);
      break;
  }
  return g;
}
async function fy(e, n) {
  var r;
  n === void 0 && (n = {});
  const {
    x: a,
    y: s,
    platform: l,
    rects: c,
    elements: d,
    strategy: h
  } = e, {
    boundary: p = "clippingAncestors",
    rootBoundary: m = "viewport",
    elementContext: b = "floating",
    altBoundary: w = !1,
    padding: g = 0
  } = Or(n, e), x = wp(g), E = d[w ? b === "floating" ? "reference" : "floating" : b], R = nl(await l.getClippingRect({
    element: (r = await (l.isElement == null ? void 0 : l.isElement(E))) == null || r ? E : E.contextElement || await (l.getDocumentElement == null ? void 0 : l.getDocumentElement(d.floating)),
    boundary: p,
    rootBoundary: m,
    strategy: h
  })), N = b === "floating" ? {
    x: a,
    y: s,
    width: c.floating.width,
    height: c.floating.height
  } : c.reference, L = await (l.getOffsetParent == null ? void 0 : l.getOffsetParent(d.floating)), M = await (l.isElement == null ? void 0 : l.isElement(L)) ? await (l.getScale == null ? void 0 : l.getScale(L)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, I = nl(l.convertOffsetParentRelativeRectToViewportRelativeRect ? await l.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: d,
    rect: N,
    offsetParent: L,
    strategy: h
  }) : N);
  return {
    top: (R.top - I.top + x.top) / M.y,
    bottom: (I.bottom - R.bottom + x.bottom) / M.y,
    left: (R.left - I.left + x.left) / M.x,
    right: (I.right - R.right + x.right) / M.x
  };
}
const hy = async (e, n, r) => {
  const {
    placement: a = "bottom",
    strategy: s = "absolute",
    middleware: l = [],
    platform: c
  } = r, d = l.filter(Boolean), h = await (c.isRTL == null ? void 0 : c.isRTL(n));
  let p = await c.getElementRects({
    reference: e,
    floating: n,
    strategy: s
  }), {
    x: m,
    y: b
  } = p0(p, a, h), w = a, g = {}, x = 0;
  for (let E = 0; E < d.length; E++) {
    var y;
    const {
      name: R,
      fn: N
    } = d[E], {
      x: L,
      y: M,
      data: I,
      reset: O
    } = await N({
      x: m,
      y: b,
      initialPlacement: a,
      placement: w,
      strategy: s,
      middlewareData: g,
      rects: p,
      platform: {
        ...c,
        detectOverflow: (y = c.detectOverflow) != null ? y : fy
      },
      elements: {
        reference: e,
        floating: n
      }
    });
    m = L ?? m, b = M ?? b, g = {
      ...g,
      [R]: {
        ...g[R],
        ...I
      }
    }, O && x <= 50 && (x++, typeof O == "object" && (O.placement && (w = O.placement), O.rects && (p = O.rects === !0 ? await c.getElementRects({
      reference: e,
      floating: n,
      strategy: s
    }) : O.rects), {
      x: m,
      y: b
    } = p0(p, w, h)), E = -1);
  }
  return {
    x: m,
    y: b,
    placement: w,
    strategy: s,
    middlewareData: g
  };
}, py = (e) => ({
  name: "arrow",
  options: e,
  async fn(n) {
    const {
      x: r,
      y: a,
      placement: s,
      rects: l,
      platform: c,
      elements: d,
      middlewareData: h
    } = n, {
      element: p,
      padding: m = 0
    } = Or(e, n) || {};
    if (p == null)
      return {};
    const b = wp(m), w = {
      x: r,
      y: a
    }, g = ud(s), x = cd(g), y = await c.getDimensions(p), E = g === "y", R = E ? "top" : "left", N = E ? "bottom" : "right", L = E ? "clientHeight" : "clientWidth", M = l.reference[x] + l.reference[g] - w[g] - l.floating[x], I = w[g] - l.reference[g], O = await (c.getOffsetParent == null ? void 0 : c.getOffsetParent(p));
    let D = O ? O[L] : 0;
    (!D || !await (c.isElement == null ? void 0 : c.isElement(O))) && (D = d.floating[L] || l.floating[x]);
    const A = M / 2 - I / 2, z = D / 2 - y[x] / 2 - 1, se = uo(b[R], z), ue = uo(b[N], z), ce = se, ne = D - y[x] - ue, Z = D / 2 - y[x] / 2 + A, le = Du(ce, Z, ne), X = !h.arrow && Ca(s) != null && Z !== le && l.reference[x] / 2 - (Z < ce ? se : ue) - y[x] / 2 < 0, ge = X ? Z < ce ? Z - ce : Z - ne : 0;
    return {
      [g]: w[g] + ge,
      data: {
        [g]: le,
        centerOffset: Z - le - ge,
        ...X && {
          alignmentOffset: ge
        }
      },
      reset: X
    };
  }
}), gy = function(e) {
  return e === void 0 && (e = {}), {
    name: "flip",
    options: e,
    async fn(n) {
      var r, a;
      const {
        placement: s,
        middlewareData: l,
        rects: c,
        initialPlacement: d,
        platform: h,
        elements: p
      } = n, {
        mainAxis: m = !0,
        crossAxis: b = !0,
        fallbackPlacements: w,
        fallbackStrategy: g = "bestFit",
        fallbackAxisSideDirection: x = "none",
        flipAlignment: y = !0,
        ...E
      } = Or(e, n);
      if ((r = l.arrow) != null && r.alignmentOffset)
        return {};
      const R = Pr(s), N = ir(d), L = Pr(d) === d, M = await (h.isRTL == null ? void 0 : h.isRTL(p.floating)), I = w || (L || !y ? [tl(d)] : iy(d)), O = x !== "none";
      !w && O && I.push(...uy(d, y, x, M));
      const D = [d, ...I], A = await h.detectOverflow(n, E), z = [];
      let se = ((a = l.flip) == null ? void 0 : a.overflows) || [];
      if (m && z.push(A[R]), b) {
        const Z = ay(s, c, M);
        z.push(A[Z[0]], A[Z[1]]);
      }
      if (se = [...se, {
        placement: s,
        overflows: z
      }], !z.every((Z) => Z <= 0)) {
        var ue, ce;
        const Z = (((ue = l.flip) == null ? void 0 : ue.index) || 0) + 1, le = D[Z];
        if (le && (!(b === "alignment" ? N !== ir(le) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        se.every((pe) => ir(pe.placement) === N ? pe.overflows[0] > 0 : !0)))
          return {
            data: {
              index: Z,
              overflows: se
            },
            reset: {
              placement: le
            }
          };
        let X = (ce = se.filter((ge) => ge.overflows[0] <= 0).sort((ge, pe) => ge.overflows[1] - pe.overflows[1])[0]) == null ? void 0 : ce.placement;
        if (!X)
          switch (g) {
            case "bestFit": {
              var ne;
              const ge = (ne = se.filter((pe) => {
                if (O) {
                  const H = ir(pe.placement);
                  return H === N || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  H === "y";
                }
                return !0;
              }).map((pe) => [pe.placement, pe.overflows.filter((H) => H > 0).reduce((H, P) => H + P, 0)]).sort((pe, H) => pe[1] - H[1])[0]) == null ? void 0 : ne[0];
              ge && (X = ge);
              break;
            }
            case "initialPlacement":
              X = d;
              break;
          }
        if (s !== X)
          return {
            reset: {
              placement: X
            }
          };
      }
      return {};
    }
  };
};
function g0(e, n) {
  return {
    top: e.top - n.height,
    right: e.right - n.width,
    bottom: e.bottom - n.height,
    left: e.left - n.width
  };
}
function m0(e) {
  return ty.some((n) => e[n] >= 0);
}
const my = function(e) {
  return e === void 0 && (e = {}), {
    name: "hide",
    options: e,
    async fn(n) {
      const {
        rects: r,
        platform: a
      } = n, {
        strategy: s = "referenceHidden",
        ...l
      } = Or(e, n);
      switch (s) {
        case "referenceHidden": {
          const c = await a.detectOverflow(n, {
            ...l,
            elementContext: "reference"
          }), d = g0(c, r.reference);
          return {
            data: {
              referenceHiddenOffsets: d,
              referenceHidden: m0(d)
            }
          };
        }
        case "escaped": {
          const c = await a.detectOverflow(n, {
            ...l,
            altBoundary: !0
          }), d = g0(c, r.floating);
          return {
            data: {
              escapedOffsets: d,
              escaped: m0(d)
            }
          };
        }
        default:
          return {};
      }
    }
  };
}, xp = /* @__PURE__ */ new Set(["left", "top"]);
async function vy(e, n) {
  const {
    placement: r,
    platform: a,
    elements: s
  } = e, l = await (a.isRTL == null ? void 0 : a.isRTL(s.floating)), c = Pr(r), d = Ca(r), h = ir(r) === "y", p = xp.has(c) ? -1 : 1, m = l && h ? -1 : 1, b = Or(n, e);
  let {
    mainAxis: w,
    crossAxis: g,
    alignmentAxis: x
  } = typeof b == "number" ? {
    mainAxis: b,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: b.mainAxis || 0,
    crossAxis: b.crossAxis || 0,
    alignmentAxis: b.alignmentAxis
  };
  return d && typeof x == "number" && (g = d === "end" ? x * -1 : x), h ? {
    x: g * m,
    y: w * p
  } : {
    x: w * p,
    y: g * m
  };
}
const by = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(n) {
      var r, a;
      const {
        x: s,
        y: l,
        placement: c,
        middlewareData: d
      } = n, h = await vy(n, e);
      return c === ((r = d.offset) == null ? void 0 : r.placement) && (a = d.arrow) != null && a.alignmentOffset ? {} : {
        x: s + h.x,
        y: l + h.y,
        data: {
          ...h,
          placement: c
        }
      };
    }
  };
}, yy = function(e) {
  return e === void 0 && (e = {}), {
    name: "shift",
    options: e,
    async fn(n) {
      const {
        x: r,
        y: a,
        placement: s,
        platform: l
      } = n, {
        mainAxis: c = !0,
        crossAxis: d = !1,
        limiter: h = {
          fn: (R) => {
            let {
              x: N,
              y: L
            } = R;
            return {
              x: N,
              y: L
            };
          }
        },
        ...p
      } = Or(e, n), m = {
        x: r,
        y: a
      }, b = await l.detectOverflow(n, p), w = ir(Pr(s)), g = ld(w);
      let x = m[g], y = m[w];
      if (c) {
        const R = g === "y" ? "top" : "left", N = g === "y" ? "bottom" : "right", L = x + b[R], M = x - b[N];
        x = Du(L, x, M);
      }
      if (d) {
        const R = w === "y" ? "top" : "left", N = w === "y" ? "bottom" : "right", L = y + b[R], M = y - b[N];
        y = Du(L, y, M);
      }
      const E = h.fn({
        ...n,
        [g]: x,
        [w]: y
      });
      return {
        ...E,
        data: {
          x: E.x - r,
          y: E.y - a,
          enabled: {
            [g]: c,
            [w]: d
          }
        }
      };
    }
  };
}, wy = function(e) {
  return e === void 0 && (e = {}), {
    options: e,
    fn(n) {
      const {
        x: r,
        y: a,
        placement: s,
        rects: l,
        middlewareData: c
      } = n, {
        offset: d = 0,
        mainAxis: h = !0,
        crossAxis: p = !0
      } = Or(e, n), m = {
        x: r,
        y: a
      }, b = ir(s), w = ld(b);
      let g = m[w], x = m[b];
      const y = Or(d, n), E = typeof y == "number" ? {
        mainAxis: y,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...y
      };
      if (h) {
        const L = w === "y" ? "height" : "width", M = l.reference[w] - l.floating[L] + E.mainAxis, I = l.reference[w] + l.reference[L] - E.mainAxis;
        g < M ? g = M : g > I && (g = I);
      }
      if (p) {
        var R, N;
        const L = w === "y" ? "width" : "height", M = xp.has(Pr(s)), I = l.reference[b] - l.floating[L] + (M && ((R = c.offset) == null ? void 0 : R[b]) || 0) + (M ? 0 : E.crossAxis), O = l.reference[b] + l.reference[L] + (M ? 0 : ((N = c.offset) == null ? void 0 : N[b]) || 0) - (M ? E.crossAxis : 0);
        x < I ? x = I : x > O && (x = O);
      }
      return {
        [w]: g,
        [b]: x
      };
    }
  };
}, xy = function(e) {
  return e === void 0 && (e = {}), {
    name: "size",
    options: e,
    async fn(n) {
      var r, a;
      const {
        placement: s,
        rects: l,
        platform: c,
        elements: d
      } = n, {
        apply: h = () => {
        },
        ...p
      } = Or(e, n), m = await c.detectOverflow(n, p), b = Pr(s), w = Ca(s), g = ir(s) === "y", {
        width: x,
        height: y
      } = l.floating;
      let E, R;
      b === "top" || b === "bottom" ? (E = b, R = w === (await (c.isRTL == null ? void 0 : c.isRTL(d.floating)) ? "start" : "end") ? "left" : "right") : (R = b, E = w === "end" ? "top" : "bottom");
      const N = y - m.top - m.bottom, L = x - m.left - m.right, M = uo(y - m[E], N), I = uo(x - m[R], L), O = !n.middlewareData.shift;
      let D = M, A = I;
      if ((r = n.middlewareData.shift) != null && r.enabled.x && (A = L), (a = n.middlewareData.shift) != null && a.enabled.y && (D = N), O && !w) {
        const se = Cn(m.left, 0), ue = Cn(m.right, 0), ce = Cn(m.top, 0), ne = Cn(m.bottom, 0);
        g ? A = x - 2 * (se !== 0 || ue !== 0 ? se + ue : Cn(m.left, m.right)) : D = y - 2 * (ce !== 0 || ne !== 0 ? ce + ne : Cn(m.top, m.bottom));
      }
      await h({
        ...n,
        availableWidth: A,
        availableHeight: D
      });
      const z = await c.getDimensions(d.floating);
      return x !== z.width || y !== z.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function yl() {
  return typeof window < "u";
}
function Sa(e) {
  return Cp(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function _n(e) {
  var n;
  return (e == null || (n = e.ownerDocument) == null ? void 0 : n.defaultView) || window;
}
function hr(e) {
  var n;
  return (n = (Cp(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : n.documentElement;
}
function Cp(e) {
  return yl() ? e instanceof Node || e instanceof _n(e).Node : !1;
}
function qn(e) {
  return yl() ? e instanceof Element || e instanceof _n(e).Element : !1;
}
function cr(e) {
  return yl() ? e instanceof HTMLElement || e instanceof _n(e).HTMLElement : !1;
}
function v0(e) {
  return !yl() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof _n(e).ShadowRoot;
}
const Cy = /* @__PURE__ */ new Set(["inline", "contents"]);
function bi(e) {
  const {
    overflow: n,
    overflowX: r,
    overflowY: a,
    display: s
  } = Yn(e);
  return /auto|scroll|overlay|hidden|clip/.test(n + a + r) && !Cy.has(s);
}
const Sy = /* @__PURE__ */ new Set(["table", "td", "th"]);
function _y(e) {
  return Sy.has(Sa(e));
}
const Ey = [":popover-open", ":modal"];
function wl(e) {
  return Ey.some((n) => {
    try {
      return e.matches(n);
    } catch {
      return !1;
    }
  });
}
const Ry = ["transform", "translate", "scale", "rotate", "perspective"], Iy = ["transform", "translate", "scale", "rotate", "perspective", "filter"], ky = ["paint", "layout", "strict", "content"];
function dd(e) {
  const n = fd(), r = qn(e) ? Yn(e) : e;
  return Ry.some((a) => r[a] ? r[a] !== "none" : !1) || (r.containerType ? r.containerType !== "normal" : !1) || !n && (r.backdropFilter ? r.backdropFilter !== "none" : !1) || !n && (r.filter ? r.filter !== "none" : !1) || Iy.some((a) => (r.willChange || "").includes(a)) || ky.some((a) => (r.contain || "").includes(a));
}
function My(e) {
  let n = fo(e);
  for (; cr(n) && !ya(n); ) {
    if (dd(n))
      return n;
    if (wl(n))
      return null;
    n = fo(n);
  }
  return null;
}
function fd() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
const Ly = /* @__PURE__ */ new Set(["html", "body", "#document"]);
function ya(e) {
  return Ly.has(Sa(e));
}
function Yn(e) {
  return _n(e).getComputedStyle(e);
}
function xl(e) {
  return qn(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function fo(e) {
  if (Sa(e) === "html")
    return e;
  const n = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    v0(e) && e.host || // Fallback.
    hr(e)
  );
  return v0(n) ? n.host : n;
}
function Sp(e) {
  const n = fo(e);
  return ya(n) ? e.ownerDocument ? e.ownerDocument.body : e.body : cr(n) && bi(n) ? n : Sp(n);
}
function ui(e, n, r) {
  var a;
  n === void 0 && (n = []), r === void 0 && (r = !0);
  const s = Sp(e), l = s === ((a = e.ownerDocument) == null ? void 0 : a.body), c = _n(s);
  if (l) {
    const d = Wu(c);
    return n.concat(c, c.visualViewport || [], bi(s) ? s : [], d && r ? ui(d) : []);
  }
  return n.concat(s, ui(s, [], r));
}
function Wu(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function _p(e) {
  const n = Yn(e);
  let r = parseFloat(n.width) || 0, a = parseFloat(n.height) || 0;
  const s = cr(e), l = s ? e.offsetWidth : r, c = s ? e.offsetHeight : a, d = el(r) !== l || el(a) !== c;
  return d && (r = l, a = c), {
    width: r,
    height: a,
    $: d
  };
}
function hd(e) {
  return qn(e) ? e : e.contextElement;
}
function va(e) {
  const n = hd(e);
  if (!cr(n))
    return sr(1);
  const r = n.getBoundingClientRect(), {
    width: a,
    height: s,
    $: l
  } = _p(n);
  let c = (l ? el(r.width) : r.width) / a, d = (l ? el(r.height) : r.height) / s;
  return (!c || !Number.isFinite(c)) && (c = 1), (!d || !Number.isFinite(d)) && (d = 1), {
    x: c,
    y: d
  };
}
const Ny = /* @__PURE__ */ sr(0);
function Ep(e) {
  const n = _n(e);
  return !fd() || !n.visualViewport ? Ny : {
    x: n.visualViewport.offsetLeft,
    y: n.visualViewport.offsetTop
  };
}
function Ty(e, n, r) {
  return n === void 0 && (n = !1), !r || n && r !== _n(e) ? !1 : n;
}
function Do(e, n, r, a) {
  n === void 0 && (n = !1), r === void 0 && (r = !1);
  const s = e.getBoundingClientRect(), l = hd(e);
  let c = sr(1);
  n && (a ? qn(a) && (c = va(a)) : c = va(e));
  const d = Ty(l, r, a) ? Ep(l) : sr(0);
  let h = (s.left + d.x) / c.x, p = (s.top + d.y) / c.y, m = s.width / c.x, b = s.height / c.y;
  if (l) {
    const w = _n(l), g = a && qn(a) ? _n(a) : a;
    let x = w, y = Wu(x);
    for (; y && a && g !== x; ) {
      const E = va(y), R = y.getBoundingClientRect(), N = Yn(y), L = R.left + (y.clientLeft + parseFloat(N.paddingLeft)) * E.x, M = R.top + (y.clientTop + parseFloat(N.paddingTop)) * E.y;
      h *= E.x, p *= E.y, m *= E.x, b *= E.y, h += L, p += M, x = _n(y), y = Wu(x);
    }
  }
  return nl({
    width: m,
    height: b,
    x: h,
    y: p
  });
}
function Cl(e, n) {
  const r = xl(e).scrollLeft;
  return n ? n.left + r : Do(hr(e)).left + r;
}
function Rp(e, n) {
  const r = e.getBoundingClientRect(), a = r.left + n.scrollLeft - Cl(e, r), s = r.top + n.scrollTop;
  return {
    x: a,
    y: s
  };
}
function Ay(e) {
  let {
    elements: n,
    rect: r,
    offsetParent: a,
    strategy: s
  } = e;
  const l = s === "fixed", c = hr(a), d = n ? wl(n.floating) : !1;
  if (a === c || d && l)
    return r;
  let h = {
    scrollLeft: 0,
    scrollTop: 0
  }, p = sr(1);
  const m = sr(0), b = cr(a);
  if ((b || !b && !l) && ((Sa(a) !== "body" || bi(c)) && (h = xl(a)), cr(a))) {
    const g = Do(a);
    p = va(a), m.x = g.x + a.clientLeft, m.y = g.y + a.clientTop;
  }
  const w = c && !b && !l ? Rp(c, h) : sr(0);
  return {
    width: r.width * p.x,
    height: r.height * p.y,
    x: r.x * p.x - h.scrollLeft * p.x + m.x + w.x,
    y: r.y * p.y - h.scrollTop * p.y + m.y + w.y
  };
}
function Oy(e) {
  return Array.from(e.getClientRects());
}
function Py(e) {
  const n = hr(e), r = xl(e), a = e.ownerDocument.body, s = Cn(n.scrollWidth, n.clientWidth, a.scrollWidth, a.clientWidth), l = Cn(n.scrollHeight, n.clientHeight, a.scrollHeight, a.clientHeight);
  let c = -r.scrollLeft + Cl(e);
  const d = -r.scrollTop;
  return Yn(a).direction === "rtl" && (c += Cn(n.clientWidth, a.clientWidth) - s), {
    width: s,
    height: l,
    x: c,
    y: d
  };
}
const b0 = 25;
function Dy(e, n) {
  const r = _n(e), a = hr(e), s = r.visualViewport;
  let l = a.clientWidth, c = a.clientHeight, d = 0, h = 0;
  if (s) {
    l = s.width, c = s.height;
    const m = fd();
    (!m || m && n === "fixed") && (d = s.offsetLeft, h = s.offsetTop);
  }
  const p = Cl(a);
  if (p <= 0) {
    const m = a.ownerDocument, b = m.body, w = getComputedStyle(b), g = m.compatMode === "CSS1Compat" && parseFloat(w.marginLeft) + parseFloat(w.marginRight) || 0, x = Math.abs(a.clientWidth - b.clientWidth - g);
    x <= b0 && (l -= x);
  } else p <= b0 && (l += p);
  return {
    width: l,
    height: c,
    x: d,
    y: h
  };
}
const Fy = /* @__PURE__ */ new Set(["absolute", "fixed"]);
function Wy(e, n) {
  const r = Do(e, !0, n === "fixed"), a = r.top + e.clientTop, s = r.left + e.clientLeft, l = cr(e) ? va(e) : sr(1), c = e.clientWidth * l.x, d = e.clientHeight * l.y, h = s * l.x, p = a * l.y;
  return {
    width: c,
    height: d,
    x: h,
    y: p
  };
}
function y0(e, n, r) {
  let a;
  if (n === "viewport")
    a = Dy(e, r);
  else if (n === "document")
    a = Py(hr(e));
  else if (qn(n))
    a = Wy(n, r);
  else {
    const s = Ep(e);
    a = {
      x: n.x - s.x,
      y: n.y - s.y,
      width: n.width,
      height: n.height
    };
  }
  return nl(a);
}
function Ip(e, n) {
  const r = fo(e);
  return r === n || !qn(r) || ya(r) ? !1 : Yn(r).position === "fixed" || Ip(r, n);
}
function Hy(e, n) {
  const r = n.get(e);
  if (r)
    return r;
  let a = ui(e, [], !1).filter((d) => qn(d) && Sa(d) !== "body"), s = null;
  const l = Yn(e).position === "fixed";
  let c = l ? fo(e) : e;
  for (; qn(c) && !ya(c); ) {
    const d = Yn(c), h = dd(c);
    !h && d.position === "fixed" && (s = null), (l ? !h && !s : !h && d.position === "static" && !!s && Fy.has(s.position) || bi(c) && !h && Ip(e, c)) ? a = a.filter((m) => m !== c) : s = d, c = fo(c);
  }
  return n.set(e, a), a;
}
function $y(e) {
  let {
    element: n,
    boundary: r,
    rootBoundary: a,
    strategy: s
  } = e;
  const c = [...r === "clippingAncestors" ? wl(n) ? [] : Hy(n, this._c) : [].concat(r), a], d = c[0], h = c.reduce((p, m) => {
    const b = y0(n, m, s);
    return p.top = Cn(b.top, p.top), p.right = uo(b.right, p.right), p.bottom = uo(b.bottom, p.bottom), p.left = Cn(b.left, p.left), p;
  }, y0(n, d, s));
  return {
    width: h.right - h.left,
    height: h.bottom - h.top,
    x: h.left,
    y: h.top
  };
}
function zy(e) {
  const {
    width: n,
    height: r
  } = _p(e);
  return {
    width: n,
    height: r
  };
}
function By(e, n, r) {
  const a = cr(n), s = hr(n), l = r === "fixed", c = Do(e, !0, l, n);
  let d = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const h = sr(0);
  function p() {
    h.x = Cl(s);
  }
  if (a || !a && !l)
    if ((Sa(n) !== "body" || bi(s)) && (d = xl(n)), a) {
      const g = Do(n, !0, l, n);
      h.x = g.x + n.clientLeft, h.y = g.y + n.clientTop;
    } else s && p();
  l && !a && s && p();
  const m = s && !a && !l ? Rp(s, d) : sr(0), b = c.left + d.scrollLeft - h.x - m.x, w = c.top + d.scrollTop - h.y - m.y;
  return {
    x: b,
    y: w,
    width: c.width,
    height: c.height
  };
}
function mu(e) {
  return Yn(e).position === "static";
}
function w0(e, n) {
  if (!cr(e) || Yn(e).position === "fixed")
    return null;
  if (n)
    return n(e);
  let r = e.offsetParent;
  return hr(e) === r && (r = r.ownerDocument.body), r;
}
function kp(e, n) {
  const r = _n(e);
  if (wl(e))
    return r;
  if (!cr(e)) {
    let s = fo(e);
    for (; s && !ya(s); ) {
      if (qn(s) && !mu(s))
        return s;
      s = fo(s);
    }
    return r;
  }
  let a = w0(e, n);
  for (; a && _y(a) && mu(a); )
    a = w0(a, n);
  return a && ya(a) && mu(a) && !dd(a) ? r : a || My(e) || r;
}
const Vy = async function(e) {
  const n = this.getOffsetParent || kp, r = this.getDimensions, a = await r(e.floating);
  return {
    reference: By(e.reference, await n(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: a.width,
      height: a.height
    }
  };
};
function Uy(e) {
  return Yn(e).direction === "rtl";
}
const Gy = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Ay,
  getDocumentElement: hr,
  getClippingRect: $y,
  getOffsetParent: kp,
  getElementRects: Vy,
  getClientRects: Oy,
  getDimensions: zy,
  getScale: va,
  isElement: qn,
  isRTL: Uy
};
function Mp(e, n) {
  return e.x === n.x && e.y === n.y && e.width === n.width && e.height === n.height;
}
function Ky(e, n) {
  let r = null, a;
  const s = hr(e);
  function l() {
    var d;
    clearTimeout(a), (d = r) == null || d.disconnect(), r = null;
  }
  function c(d, h) {
    d === void 0 && (d = !1), h === void 0 && (h = 1), l();
    const p = e.getBoundingClientRect(), {
      left: m,
      top: b,
      width: w,
      height: g
    } = p;
    if (d || n(), !w || !g)
      return;
    const x = Hs(b), y = Hs(s.clientWidth - (m + w)), E = Hs(s.clientHeight - (b + g)), R = Hs(m), L = {
      rootMargin: -x + "px " + -y + "px " + -E + "px " + -R + "px",
      threshold: Cn(0, uo(1, h)) || 1
    };
    let M = !0;
    function I(O) {
      const D = O[0].intersectionRatio;
      if (D !== h) {
        if (!M)
          return c();
        D ? c(!1, D) : a = setTimeout(() => {
          c(!1, 1e-7);
        }, 1e3);
      }
      D === 1 && !Mp(p, e.getBoundingClientRect()) && c(), M = !1;
    }
    try {
      r = new IntersectionObserver(I, {
        ...L,
        // Handle <iframe>s
        root: s.ownerDocument
      });
    } catch {
      r = new IntersectionObserver(I, L);
    }
    r.observe(e);
  }
  return c(!0), l;
}
function Zy(e, n, r, a) {
  a === void 0 && (a = {});
  const {
    ancestorScroll: s = !0,
    ancestorResize: l = !0,
    elementResize: c = typeof ResizeObserver == "function",
    layoutShift: d = typeof IntersectionObserver == "function",
    animationFrame: h = !1
  } = a, p = hd(e), m = s || l ? [...p ? ui(p) : [], ...ui(n)] : [];
  m.forEach((R) => {
    s && R.addEventListener("scroll", r, {
      passive: !0
    }), l && R.addEventListener("resize", r);
  });
  const b = p && d ? Ky(p, r) : null;
  let w = -1, g = null;
  c && (g = new ResizeObserver((R) => {
    let [N] = R;
    N && N.target === p && g && (g.unobserve(n), cancelAnimationFrame(w), w = requestAnimationFrame(() => {
      var L;
      (L = g) == null || L.observe(n);
    })), r();
  }), p && !h && g.observe(p), g.observe(n));
  let x, y = h ? Do(e) : null;
  h && E();
  function E() {
    const R = Do(e);
    y && !Mp(y, R) && r(), y = R, x = requestAnimationFrame(E);
  }
  return r(), () => {
    var R;
    m.forEach((N) => {
      s && N.removeEventListener("scroll", r), l && N.removeEventListener("resize", r);
    }), b?.(), (R = g) == null || R.disconnect(), g = null, h && cancelAnimationFrame(x);
  };
}
const jy = by, qy = yy, Yy = gy, Xy = xy, Jy = my, x0 = py, Qy = wy, ew = (e, n, r) => {
  const a = /* @__PURE__ */ new Map(), s = {
    platform: Gy,
    ...r
  }, l = {
    ...s.platform,
    _c: a
  };
  return hy(e, n, {
    ...s,
    platform: l
  });
};
var tw = typeof document < "u", nw = function() {
}, js = tw ? co : nw;
function rl(e, n) {
  if (e === n)
    return !0;
  if (typeof e != typeof n)
    return !1;
  if (typeof e == "function" && e.toString() === n.toString())
    return !0;
  let r, a, s;
  if (e && n && typeof e == "object") {
    if (Array.isArray(e)) {
      if (r = e.length, r !== n.length) return !1;
      for (a = r; a-- !== 0; )
        if (!rl(e[a], n[a]))
          return !1;
      return !0;
    }
    if (s = Object.keys(e), r = s.length, r !== Object.keys(n).length)
      return !1;
    for (a = r; a-- !== 0; )
      if (!{}.hasOwnProperty.call(n, s[a]))
        return !1;
    for (a = r; a-- !== 0; ) {
      const l = s[a];
      if (!(l === "_owner" && e.$$typeof) && !rl(e[l], n[l]))
        return !1;
    }
    return !0;
  }
  return e !== e && n !== n;
}
function Lp(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function C0(e, n) {
  const r = Lp(e);
  return Math.round(n * r) / r;
}
function vu(e) {
  const n = C.useRef(e);
  return js(() => {
    n.current = e;
  }), n;
}
function rw(e) {
  e === void 0 && (e = {});
  const {
    placement: n = "bottom",
    strategy: r = "absolute",
    middleware: a = [],
    platform: s,
    elements: {
      reference: l,
      floating: c
    } = {},
    transform: d = !0,
    whileElementsMounted: h,
    open: p
  } = e, [m, b] = C.useState({
    x: 0,
    y: 0,
    strategy: r,
    placement: n,
    middlewareData: {},
    isPositioned: !1
  }), [w, g] = C.useState(a);
  rl(w, a) || g(a);
  const [x, y] = C.useState(null), [E, R] = C.useState(null), N = C.useCallback((pe) => {
    pe !== O.current && (O.current = pe, y(pe));
  }, []), L = C.useCallback((pe) => {
    pe !== D.current && (D.current = pe, R(pe));
  }, []), M = l || x, I = c || E, O = C.useRef(null), D = C.useRef(null), A = C.useRef(m), z = h != null, se = vu(h), ue = vu(s), ce = vu(p), ne = C.useCallback(() => {
    if (!O.current || !D.current)
      return;
    const pe = {
      placement: n,
      strategy: r,
      middleware: w
    };
    ue.current && (pe.platform = ue.current), ew(O.current, D.current, pe).then((H) => {
      const P = {
        ...H,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: ce.current !== !1
      };
      Z.current && !rl(A.current, P) && (A.current = P, sh.flushSync(() => {
        b(P);
      }));
    });
  }, [w, n, r, ue, ce]);
  js(() => {
    p === !1 && A.current.isPositioned && (A.current.isPositioned = !1, b((pe) => ({
      ...pe,
      isPositioned: !1
    })));
  }, [p]);
  const Z = C.useRef(!1);
  js(() => (Z.current = !0, () => {
    Z.current = !1;
  }), []), js(() => {
    if (M && (O.current = M), I && (D.current = I), M && I) {
      if (se.current)
        return se.current(M, I, ne);
      ne();
    }
  }, [M, I, ne, se, z]);
  const le = C.useMemo(() => ({
    reference: O,
    floating: D,
    setReference: N,
    setFloating: L
  }), [N, L]), X = C.useMemo(() => ({
    reference: M,
    floating: I
  }), [M, I]), ge = C.useMemo(() => {
    const pe = {
      position: r,
      left: 0,
      top: 0
    };
    if (!X.floating)
      return pe;
    const H = C0(X.floating, m.x), P = C0(X.floating, m.y);
    return d ? {
      ...pe,
      transform: "translate(" + H + "px, " + P + "px)",
      ...Lp(X.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: r,
      left: H,
      top: P
    };
  }, [r, d, X.floating, m.x, m.y]);
  return C.useMemo(() => ({
    ...m,
    update: ne,
    refs: le,
    elements: X,
    floatingStyles: ge
  }), [m, ne, le, X, ge]);
}
const ow = (e) => {
  function n(r) {
    return {}.hasOwnProperty.call(r, "current");
  }
  return {
    name: "arrow",
    options: e,
    fn(r) {
      const {
        element: a,
        padding: s
      } = typeof e == "function" ? e(r) : e;
      return a && n(a) ? a.current != null ? x0({
        element: a.current,
        padding: s
      }).fn(r) : {} : a ? x0({
        element: a,
        padding: s
      }).fn(r) : {};
    }
  };
}, aw = (e, n) => ({
  ...jy(e),
  options: [e, n]
}), iw = (e, n) => ({
  ...qy(e),
  options: [e, n]
}), sw = (e, n) => ({
  ...Qy(e),
  options: [e, n]
}), lw = (e, n) => ({
  ...Yy(e),
  options: [e, n]
}), cw = (e, n) => ({
  ...Xy(e),
  options: [e, n]
}), uw = (e, n) => ({
  ...Jy(e),
  options: [e, n]
}), dw = (e, n) => ({
  ...ow(e),
  options: [e, n]
});
var fw = "Arrow", Np = C.forwardRef((e, n) => {
  const { children: r, width: a = 10, height: s = 5, ...l } = e;
  return /* @__PURE__ */ f(
    mt.svg,
    {
      ...l,
      ref: n,
      width: a,
      height: s,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: e.asChild ? r : /* @__PURE__ */ f("polygon", { points: "0,0 30,0 15,10" })
    }
  );
});
Np.displayName = fw;
var hw = Np, pd = "Popper", [Tp, Sl] = go(pd), [pw, Ap] = Tp(pd), Op = (e) => {
  const { __scopePopper: n, children: r } = e, [a, s] = C.useState(null);
  return /* @__PURE__ */ f(pw, { scope: n, anchor: a, onAnchorChange: s, children: r });
};
Op.displayName = pd;
var Pp = "PopperAnchor", Dp = C.forwardRef(
  (e, n) => {
    const { __scopePopper: r, virtualRef: a, ...s } = e, l = Ap(Pp, r), c = C.useRef(null), d = Lt(n, c), h = C.useRef(null);
    return C.useEffect(() => {
      const p = h.current;
      h.current = a?.current || c.current, p !== h.current && l.onAnchorChange(h.current);
    }), a ? null : /* @__PURE__ */ f(mt.div, { ...s, ref: d });
  }
);
Dp.displayName = Pp;
var gd = "PopperContent", [gw, mw] = Tp(gd), Fp = C.forwardRef(
  (e, n) => {
    const {
      __scopePopper: r,
      side: a = "bottom",
      sideOffset: s = 0,
      align: l = "center",
      alignOffset: c = 0,
      arrowPadding: d = 0,
      avoidCollisions: h = !0,
      collisionBoundary: p = [],
      collisionPadding: m = 0,
      sticky: b = "partial",
      hideWhenDetached: w = !1,
      updatePositionStrategy: g = "optimized",
      onPlaced: x,
      ...y
    } = e, E = Ap(gd, r), [R, N] = C.useState(null), L = Lt(n, (j) => N(j)), [M, I] = C.useState(null), O = ey(M), D = O?.width ?? 0, A = O?.height ?? 0, z = a + (l !== "center" ? "-" + l : ""), se = typeof m == "number" ? m : { top: 0, right: 0, bottom: 0, left: 0, ...m }, ue = Array.isArray(p) ? p : [p], ce = ue.length > 0, ne = {
      padding: se,
      boundary: ue.filter(bw),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: ce
    }, { refs: Z, floatingStyles: le, placement: X, isPositioned: ge, middlewareData: pe } = rw({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: z,
      whileElementsMounted: (...j) => Zy(...j, {
        animationFrame: g === "always"
      }),
      elements: {
        reference: E.anchor
      },
      middleware: [
        aw({ mainAxis: s + A, alignmentAxis: c }),
        h && iw({
          mainAxis: !0,
          crossAxis: !1,
          limiter: b === "partial" ? sw() : void 0,
          ...ne
        }),
        h && lw({ ...ne }),
        cw({
          ...ne,
          apply: ({ elements: j, rects: ve, availableWidth: he, availableHeight: re }) => {
            const { width: me, height: ee } = ve.reference, Le = j.floating.style;
            Le.setProperty("--radix-popper-available-width", `${he}px`), Le.setProperty("--radix-popper-available-height", `${re}px`), Le.setProperty("--radix-popper-anchor-width", `${me}px`), Le.setProperty("--radix-popper-anchor-height", `${ee}px`);
          }
        }),
        M && dw({ element: M, padding: d }),
        yw({ arrowWidth: D, arrowHeight: A }),
        w && uw({ strategy: "referenceHidden", ...ne })
      ]
    }), [H, P] = $p(X), ae = Ar(x);
    Tr(() => {
      ge && ae?.();
    }, [ge, ae]);
    const U = pe.arrow?.x, B = pe.arrow?.y, G = pe.arrow?.centerOffset !== 0, [J, Q] = C.useState();
    return Tr(() => {
      R && Q(window.getComputedStyle(R).zIndex);
    }, [R]), /* @__PURE__ */ f(
      "div",
      {
        ref: Z.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...le,
          transform: ge ? le.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: J,
          "--radix-popper-transform-origin": [
            pe.transformOrigin?.x,
            pe.transformOrigin?.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...pe.hide?.referenceHidden && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: e.dir,
        children: /* @__PURE__ */ f(
          gw,
          {
            scope: r,
            placedSide: H,
            onArrowChange: I,
            arrowX: U,
            arrowY: B,
            shouldHideArrow: G,
            children: /* @__PURE__ */ f(
              mt.div,
              {
                "data-side": H,
                "data-align": P,
                ...y,
                ref: L,
                style: {
                  ...y.style,
                  // if the PopperContent hasn't been placed yet (not all measurements done)
                  // we prevent animations so that users's animation don't kick in too early referring wrong sides
                  animation: ge ? void 0 : "none"
                }
              }
            )
          }
        )
      }
    );
  }
);
Fp.displayName = gd;
var Wp = "PopperArrow", vw = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
}, Hp = C.forwardRef(function(n, r) {
  const { __scopePopper: a, ...s } = n, l = mw(Wp, a), c = vw[l.placedSide];
  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    /* @__PURE__ */ f(
      "span",
      {
        ref: l.onArrowChange,
        style: {
          position: "absolute",
          left: l.arrowX,
          top: l.arrowY,
          [c]: 0,
          transformOrigin: {
            top: "",
            right: "0 0",
            bottom: "center 0",
            left: "100% 0"
          }[l.placedSide],
          transform: {
            top: "translateY(100%)",
            right: "translateY(50%) rotate(90deg) translateX(-50%)",
            bottom: "rotate(180deg)",
            left: "translateY(50%) rotate(-90deg) translateX(50%)"
          }[l.placedSide],
          visibility: l.shouldHideArrow ? "hidden" : void 0
        },
        children: /* @__PURE__ */ f(
          hw,
          {
            ...s,
            ref: r,
            style: {
              ...s.style,
              // ensures the element can be measured correctly (mostly for if SVG)
              display: "block"
            }
          }
        )
      }
    )
  );
});
Hp.displayName = Wp;
function bw(e) {
  return e !== null;
}
var yw = (e) => ({
  name: "transformOrigin",
  options: e,
  fn(n) {
    const { placement: r, rects: a, middlewareData: s } = n, c = s.arrow?.centerOffset !== 0, d = c ? 0 : e.arrowWidth, h = c ? 0 : e.arrowHeight, [p, m] = $p(r), b = { start: "0%", center: "50%", end: "100%" }[m], w = (s.arrow?.x ?? 0) + d / 2, g = (s.arrow?.y ?? 0) + h / 2;
    let x = "", y = "";
    return p === "bottom" ? (x = c ? b : `${w}px`, y = `${-h}px`) : p === "top" ? (x = c ? b : `${w}px`, y = `${a.floating.height + h}px`) : p === "right" ? (x = `${-h}px`, y = c ? b : `${g}px`) : p === "left" && (x = `${a.floating.width + h}px`, y = c ? b : `${g}px`), { data: { x, y } };
  }
});
function $p(e) {
  const [n, r = "center"] = e.split("-");
  return [n, r];
}
var zp = Op, Bp = Dp, Vp = Fp, Up = Hp, bu = "rovingFocusGroup.onEntryFocus", ww = { bubbles: !1, cancelable: !0 }, yi = "RovingFocusGroup", [Hu, Gp, xw] = Ah(yi), [Cw, Kp] = go(
  yi,
  [xw]
), [Sw, _w] = Cw(yi), Zp = C.forwardRef(
  (e, n) => /* @__PURE__ */ f(Hu.Provider, { scope: e.__scopeRovingFocusGroup, children: /* @__PURE__ */ f(Hu.Slot, { scope: e.__scopeRovingFocusGroup, children: /* @__PURE__ */ f(Ew, { ...e, ref: n }) }) })
);
Zp.displayName = yi;
var Ew = C.forwardRef((e, n) => {
  const {
    __scopeRovingFocusGroup: r,
    orientation: a,
    loop: s = !1,
    dir: l,
    currentTabStopId: c,
    defaultCurrentTabStopId: d,
    onCurrentTabStopIdChange: h,
    onEntryFocus: p,
    preventScrollOnEntryFocus: m = !1,
    ...b
  } = e, w = C.useRef(null), g = Lt(n, w), x = Fh(l), [y, E] = vi({
    prop: c,
    defaultProp: d ?? null,
    onChange: h,
    caller: yi
  }), [R, N] = C.useState(!1), L = Ar(p), M = Gp(r), I = C.useRef(!1), [O, D] = C.useState(0);
  return C.useEffect(() => {
    const A = w.current;
    if (A)
      return A.addEventListener(bu, L), () => A.removeEventListener(bu, L);
  }, [L]), /* @__PURE__ */ f(
    Sw,
    {
      scope: r,
      orientation: a,
      dir: x,
      loop: s,
      currentTabStopId: y,
      onItemFocus: C.useCallback(
        (A) => E(A),
        [E]
      ),
      onItemShiftTab: C.useCallback(() => N(!0), []),
      onFocusableItemAdd: C.useCallback(
        () => D((A) => A + 1),
        []
      ),
      onFocusableItemRemove: C.useCallback(
        () => D((A) => A - 1),
        []
      ),
      children: /* @__PURE__ */ f(
        mt.div,
        {
          tabIndex: R || O === 0 ? -1 : 0,
          "data-orientation": a,
          ...b,
          ref: g,
          style: { outline: "none", ...e.style },
          onMouseDown: Te(e.onMouseDown, () => {
            I.current = !0;
          }),
          onFocus: Te(e.onFocus, (A) => {
            const z = !I.current;
            if (A.target === A.currentTarget && z && !R) {
              const se = new CustomEvent(bu, ww);
              if (A.currentTarget.dispatchEvent(se), !se.defaultPrevented) {
                const ue = M().filter((X) => X.focusable), ce = ue.find((X) => X.active), ne = ue.find((X) => X.id === y), le = [ce, ne, ...ue].filter(
                  Boolean
                ).map((X) => X.ref.current);
                Yp(le, m);
              }
            }
            I.current = !1;
          }),
          onBlur: Te(e.onBlur, () => N(!1))
        }
      )
    }
  );
}), jp = "RovingFocusGroupItem", qp = C.forwardRef(
  (e, n) => {
    const {
      __scopeRovingFocusGroup: r,
      focusable: a = !0,
      active: s = !1,
      tabStopId: l,
      children: c,
      ...d
    } = e, h = so(), p = l || h, m = _w(jp, r), b = m.currentTabStopId === p, w = Gp(r), { onFocusableItemAdd: g, onFocusableItemRemove: x, currentTabStopId: y } = m;
    return C.useEffect(() => {
      if (a)
        return g(), () => x();
    }, [a, g, x]), /* @__PURE__ */ f(
      Hu.ItemSlot,
      {
        scope: r,
        id: p,
        focusable: a,
        active: s,
        children: /* @__PURE__ */ f(
          mt.span,
          {
            tabIndex: b ? 0 : -1,
            "data-orientation": m.orientation,
            ...d,
            ref: n,
            onMouseDown: Te(e.onMouseDown, (E) => {
              a ? m.onItemFocus(p) : E.preventDefault();
            }),
            onFocus: Te(e.onFocus, () => m.onItemFocus(p)),
            onKeyDown: Te(e.onKeyDown, (E) => {
              if (E.key === "Tab" && E.shiftKey) {
                m.onItemShiftTab();
                return;
              }
              if (E.target !== E.currentTarget) return;
              const R = kw(E, m.orientation, m.dir);
              if (R !== void 0) {
                if (E.metaKey || E.ctrlKey || E.altKey || E.shiftKey) return;
                E.preventDefault();
                let L = w().filter((M) => M.focusable).map((M) => M.ref.current);
                if (R === "last") L.reverse();
                else if (R === "prev" || R === "next") {
                  R === "prev" && L.reverse();
                  const M = L.indexOf(E.currentTarget);
                  L = m.loop ? Mw(L, M + 1) : L.slice(M + 1);
                }
                setTimeout(() => Yp(L));
              }
            }),
            children: typeof c == "function" ? c({ isCurrentTabStop: b, hasTabStop: y != null }) : c
          }
        )
      }
    );
  }
);
qp.displayName = jp;
var Rw = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function Iw(e, n) {
  return n !== "rtl" ? e : e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e;
}
function kw(e, n, r) {
  const a = Iw(e.key, r);
  if (!(n === "vertical" && ["ArrowLeft", "ArrowRight"].includes(a)) && !(n === "horizontal" && ["ArrowUp", "ArrowDown"].includes(a)))
    return Rw[a];
}
function Yp(e, n = !1) {
  const r = document.activeElement;
  for (const a of e)
    if (a === r || (a.focus({ preventScroll: n }), document.activeElement !== r)) return;
}
function Mw(e, n) {
  return e.map((r, a) => e[(n + a) % e.length]);
}
var Lw = Zp, Nw = qp, $u = ["Enter", " "], Tw = ["ArrowDown", "PageUp", "Home"], Xp = ["ArrowUp", "PageDown", "End"], Aw = [...Tw, ...Xp], Ow = {
  ltr: [...$u, "ArrowRight"],
  rtl: [...$u, "ArrowLeft"]
}, Pw = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"]
}, wi = "Menu", [di, Dw, Fw] = Ah(wi), [Ho, Jp] = go(wi, [
  Fw,
  Sl,
  Kp
]), _l = Sl(), Qp = Kp(), [Ww, $o] = Ho(wi), [Hw, xi] = Ho(wi), e2 = (e) => {
  const { __scopeMenu: n, open: r = !1, children: a, dir: s, onOpenChange: l, modal: c = !0 } = e, d = _l(n), [h, p] = C.useState(null), m = C.useRef(!1), b = Ar(l), w = Fh(s);
  return C.useEffect(() => {
    const g = () => {
      m.current = !0, document.addEventListener("pointerdown", x, { capture: !0, once: !0 }), document.addEventListener("pointermove", x, { capture: !0, once: !0 });
    }, x = () => m.current = !1;
    return document.addEventListener("keydown", g, { capture: !0 }), () => {
      document.removeEventListener("keydown", g, { capture: !0 }), document.removeEventListener("pointerdown", x, { capture: !0 }), document.removeEventListener("pointermove", x, { capture: !0 });
    };
  }, []), /* @__PURE__ */ f(zp, { ...d, children: /* @__PURE__ */ f(
    Ww,
    {
      scope: n,
      open: r,
      onOpenChange: b,
      content: h,
      onContentChange: p,
      children: /* @__PURE__ */ f(
        Hw,
        {
          scope: n,
          onClose: C.useCallback(() => b(!1), [b]),
          isUsingKeyboardRef: m,
          dir: w,
          modal: c,
          children: a
        }
      )
    }
  ) });
};
e2.displayName = wi;
var $w = "MenuAnchor", md = C.forwardRef(
  (e, n) => {
    const { __scopeMenu: r, ...a } = e, s = _l(r);
    return /* @__PURE__ */ f(Bp, { ...s, ...a, ref: n });
  }
);
md.displayName = $w;
var vd = "MenuPortal", [zw, t2] = Ho(vd, {
  forceMount: void 0
}), n2 = (e) => {
  const { __scopeMenu: n, forceMount: r, children: a, container: s } = e, l = $o(vd, n);
  return /* @__PURE__ */ f(zw, { scope: n, forceMount: r, children: /* @__PURE__ */ f(Xn, { present: r || l.open, children: /* @__PURE__ */ f(ml, { asChild: !0, container: s, children: a }) }) });
};
n2.displayName = vd;
var Pn = "MenuContent", [Bw, bd] = Ho(Pn), r2 = C.forwardRef(
  (e, n) => {
    const r = t2(Pn, e.__scopeMenu), { forceMount: a = r.forceMount, ...s } = e, l = $o(Pn, e.__scopeMenu), c = xi(Pn, e.__scopeMenu);
    return /* @__PURE__ */ f(di.Provider, { scope: e.__scopeMenu, children: /* @__PURE__ */ f(Xn, { present: a || l.open, children: /* @__PURE__ */ f(di.Slot, { scope: e.__scopeMenu, children: c.modal ? /* @__PURE__ */ f(Vw, { ...s, ref: n }) : /* @__PURE__ */ f(Uw, { ...s, ref: n }) }) }) });
  }
), Vw = C.forwardRef(
  (e, n) => {
    const r = $o(Pn, e.__scopeMenu), a = C.useRef(null), s = Lt(n, a);
    return C.useEffect(() => {
      const l = a.current;
      if (l) return Yh(l);
    }, []), /* @__PURE__ */ f(
      yd,
      {
        ...e,
        ref: s,
        trapFocus: r.open,
        disableOutsidePointerEvents: r.open,
        disableOutsideScroll: !0,
        onFocusOutside: Te(
          e.onFocusOutside,
          (l) => l.preventDefault(),
          { checkForDefaultPrevented: !1 }
        ),
        onDismiss: () => r.onOpenChange(!1)
      }
    );
  }
), Uw = C.forwardRef((e, n) => {
  const r = $o(Pn, e.__scopeMenu);
  return /* @__PURE__ */ f(
    yd,
    {
      ...e,
      ref: n,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      disableOutsideScroll: !1,
      onDismiss: () => r.onOpenChange(!1)
    }
  );
}), Gw = /* @__PURE__ */ ba("MenuContent.ScrollLock"), yd = C.forwardRef(
  (e, n) => {
    const {
      __scopeMenu: r,
      loop: a = !1,
      trapFocus: s,
      onOpenAutoFocus: l,
      onCloseAutoFocus: c,
      disableOutsidePointerEvents: d,
      onEntryFocus: h,
      onEscapeKeyDown: p,
      onPointerDownOutside: m,
      onFocusOutside: b,
      onInteractOutside: w,
      onDismiss: g,
      disableOutsideScroll: x,
      ...y
    } = e, E = $o(Pn, r), R = xi(Pn, r), N = _l(r), L = Qp(r), M = Dw(r), [I, O] = C.useState(null), D = C.useRef(null), A = Lt(n, D, E.onContentChange), z = C.useRef(0), se = C.useRef(""), ue = C.useRef(0), ce = C.useRef(null), ne = C.useRef("right"), Z = C.useRef(0), le = x ? od : C.Fragment, X = x ? { as: Gw, allowPinchZoom: !0 } : void 0, ge = (H) => {
      const P = se.current + H, ae = M().filter((j) => !j.disabled), U = document.activeElement, B = ae.find((j) => j.ref.current === U)?.textValue, G = ae.map((j) => j.textValue), J = rx(G, P, B), Q = ae.find((j) => j.textValue === J)?.ref.current;
      (function j(ve) {
        se.current = ve, window.clearTimeout(z.current), ve !== "" && (z.current = window.setTimeout(() => j(""), 1e3));
      })(P), Q && setTimeout(() => Q.focus());
    };
    C.useEffect(() => () => window.clearTimeout(z.current), []), zh();
    const pe = C.useCallback((H) => ne.current === ce.current?.side && ax(H, ce.current?.area), []);
    return /* @__PURE__ */ f(
      Bw,
      {
        scope: r,
        searchRef: se,
        onItemEnter: C.useCallback(
          (H) => {
            pe(H) && H.preventDefault();
          },
          [pe]
        ),
        onItemLeave: C.useCallback(
          (H) => {
            pe(H) || (D.current?.focus(), O(null));
          },
          [pe]
        ),
        onTriggerLeave: C.useCallback(
          (H) => {
            pe(H) && H.preventDefault();
          },
          [pe]
        ),
        pointerGraceTimerRef: ue,
        onPointerGraceIntentChange: C.useCallback((H) => {
          ce.current = H;
        }, []),
        children: /* @__PURE__ */ f(le, { ...X, children: /* @__PURE__ */ f(
          rd,
          {
            asChild: !0,
            trapped: s,
            onMountAutoFocus: Te(l, (H) => {
              H.preventDefault(), D.current?.focus({ preventScroll: !0 });
            }),
            onUnmountAutoFocus: c,
            children: /* @__PURE__ */ f(
              gl,
              {
                asChild: !0,
                disableOutsidePointerEvents: d,
                onEscapeKeyDown: p,
                onPointerDownOutside: m,
                onFocusOutside: b,
                onInteractOutside: w,
                onDismiss: g,
                children: /* @__PURE__ */ f(
                  Lw,
                  {
                    asChild: !0,
                    ...L,
                    dir: R.dir,
                    orientation: "vertical",
                    loop: a,
                    currentTabStopId: I,
                    onCurrentTabStopIdChange: O,
                    onEntryFocus: Te(h, (H) => {
                      R.isUsingKeyboardRef.current || H.preventDefault();
                    }),
                    preventScrollOnEntryFocus: !0,
                    children: /* @__PURE__ */ f(
                      Vp,
                      {
                        role: "menu",
                        "aria-orientation": "vertical",
                        "data-state": y2(E.open),
                        "data-radix-menu-content": "",
                        dir: R.dir,
                        ...N,
                        ...y,
                        ref: A,
                        style: { outline: "none", ...y.style },
                        onKeyDown: Te(y.onKeyDown, (H) => {
                          const ae = H.target.closest("[data-radix-menu-content]") === H.currentTarget, U = H.ctrlKey || H.altKey || H.metaKey, B = H.key.length === 1;
                          ae && (H.key === "Tab" && H.preventDefault(), !U && B && ge(H.key));
                          const G = D.current;
                          if (H.target !== G || !Aw.includes(H.key)) return;
                          H.preventDefault();
                          const Q = M().filter((j) => !j.disabled).map((j) => j.ref.current);
                          Xp.includes(H.key) && Q.reverse(), tx(Q);
                        }),
                        onBlur: Te(e.onBlur, (H) => {
                          H.currentTarget.contains(H.target) || (window.clearTimeout(z.current), se.current = "");
                        }),
                        onPointerMove: Te(
                          e.onPointerMove,
                          fi((H) => {
                            const P = H.target, ae = Z.current !== H.clientX;
                            if (H.currentTarget.contains(P) && ae) {
                              const U = H.clientX > Z.current ? "right" : "left";
                              ne.current = U, Z.current = H.clientX;
                            }
                          })
                        )
                      }
                    )
                  }
                )
              }
            )
          }
        ) })
      }
    );
  }
);
r2.displayName = Pn;
var Kw = "MenuGroup", wd = C.forwardRef(
  (e, n) => {
    const { __scopeMenu: r, ...a } = e;
    return /* @__PURE__ */ f(mt.div, { role: "group", ...a, ref: n });
  }
);
wd.displayName = Kw;
var Zw = "MenuLabel", o2 = C.forwardRef(
  (e, n) => {
    const { __scopeMenu: r, ...a } = e;
    return /* @__PURE__ */ f(mt.div, { ...a, ref: n });
  }
);
o2.displayName = Zw;
var ol = "MenuItem", S0 = "menu.itemSelect", El = C.forwardRef(
  (e, n) => {
    const { disabled: r = !1, onSelect: a, ...s } = e, l = C.useRef(null), c = xi(ol, e.__scopeMenu), d = bd(ol, e.__scopeMenu), h = Lt(n, l), p = C.useRef(!1), m = () => {
      const b = l.current;
      if (!r && b) {
        const w = new CustomEvent(S0, { bubbles: !0, cancelable: !0 });
        b.addEventListener(S0, (g) => a?.(g), { once: !0 }), Nh(b, w), w.defaultPrevented ? p.current = !1 : c.onClose();
      }
    };
    return /* @__PURE__ */ f(
      a2,
      {
        ...s,
        ref: h,
        disabled: r,
        onClick: Te(e.onClick, m),
        onPointerDown: (b) => {
          e.onPointerDown?.(b), p.current = !0;
        },
        onPointerUp: Te(e.onPointerUp, (b) => {
          p.current || b.currentTarget?.click();
        }),
        onKeyDown: Te(e.onKeyDown, (b) => {
          const w = d.searchRef.current !== "";
          r || w && b.key === " " || $u.includes(b.key) && (b.currentTarget.click(), b.preventDefault());
        })
      }
    );
  }
);
El.displayName = ol;
var a2 = C.forwardRef(
  (e, n) => {
    const { __scopeMenu: r, disabled: a = !1, textValue: s, ...l } = e, c = bd(ol, r), d = Qp(r), h = C.useRef(null), p = Lt(n, h), [m, b] = C.useState(!1), [w, g] = C.useState("");
    return C.useEffect(() => {
      const x = h.current;
      x && g((x.textContent ?? "").trim());
    }, [l.children]), /* @__PURE__ */ f(
      di.ItemSlot,
      {
        scope: r,
        disabled: a,
        textValue: s ?? w,
        children: /* @__PURE__ */ f(Nw, { asChild: !0, ...d, focusable: !a, children: /* @__PURE__ */ f(
          mt.div,
          {
            role: "menuitem",
            "data-highlighted": m ? "" : void 0,
            "aria-disabled": a || void 0,
            "data-disabled": a ? "" : void 0,
            ...l,
            ref: p,
            onPointerMove: Te(
              e.onPointerMove,
              fi((x) => {
                a ? c.onItemLeave(x) : (c.onItemEnter(x), x.defaultPrevented || x.currentTarget.focus({ preventScroll: !0 }));
              })
            ),
            onPointerLeave: Te(
              e.onPointerLeave,
              fi((x) => c.onItemLeave(x))
            ),
            onFocus: Te(e.onFocus, () => b(!0)),
            onBlur: Te(e.onBlur, () => b(!1))
          }
        ) })
      }
    );
  }
), jw = "MenuCheckboxItem", i2 = C.forwardRef(
  (e, n) => {
    const { checked: r = !1, onCheckedChange: a, ...s } = e;
    return /* @__PURE__ */ f(d2, { scope: e.__scopeMenu, checked: r, children: /* @__PURE__ */ f(
      El,
      {
        role: "menuitemcheckbox",
        "aria-checked": al(r) ? "mixed" : r,
        ...s,
        ref: n,
        "data-state": Cd(r),
        onSelect: Te(
          s.onSelect,
          () => a?.(al(r) ? !0 : !r),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
);
i2.displayName = jw;
var s2 = "MenuRadioGroup", [qw, Yw] = Ho(
  s2,
  { value: void 0, onValueChange: () => {
  } }
), l2 = C.forwardRef(
  (e, n) => {
    const { value: r, onValueChange: a, ...s } = e, l = Ar(a);
    return /* @__PURE__ */ f(qw, { scope: e.__scopeMenu, value: r, onValueChange: l, children: /* @__PURE__ */ f(wd, { ...s, ref: n }) });
  }
);
l2.displayName = s2;
var c2 = "MenuRadioItem", u2 = C.forwardRef(
  (e, n) => {
    const { value: r, ...a } = e, s = Yw(c2, e.__scopeMenu), l = r === s.value;
    return /* @__PURE__ */ f(d2, { scope: e.__scopeMenu, checked: l, children: /* @__PURE__ */ f(
      El,
      {
        role: "menuitemradio",
        "aria-checked": l,
        ...a,
        ref: n,
        "data-state": Cd(l),
        onSelect: Te(
          a.onSelect,
          () => s.onValueChange?.(r),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
);
u2.displayName = c2;
var xd = "MenuItemIndicator", [d2, Xw] = Ho(
  xd,
  { checked: !1 }
), f2 = C.forwardRef(
  (e, n) => {
    const { __scopeMenu: r, forceMount: a, ...s } = e, l = Xw(xd, r);
    return /* @__PURE__ */ f(
      Xn,
      {
        present: a || al(l.checked) || l.checked === !0,
        children: /* @__PURE__ */ f(
          mt.span,
          {
            ...s,
            ref: n,
            "data-state": Cd(l.checked)
          }
        )
      }
    );
  }
);
f2.displayName = xd;
var Jw = "MenuSeparator", h2 = C.forwardRef(
  (e, n) => {
    const { __scopeMenu: r, ...a } = e;
    return /* @__PURE__ */ f(
      mt.div,
      {
        role: "separator",
        "aria-orientation": "horizontal",
        ...a,
        ref: n
      }
    );
  }
);
h2.displayName = Jw;
var Qw = "MenuArrow", p2 = C.forwardRef(
  (e, n) => {
    const { __scopeMenu: r, ...a } = e, s = _l(r);
    return /* @__PURE__ */ f(Up, { ...s, ...a, ref: n });
  }
);
p2.displayName = Qw;
var ex = "MenuSub", [oI, g2] = Ho(ex), ri = "MenuSubTrigger", m2 = C.forwardRef(
  (e, n) => {
    const r = $o(ri, e.__scopeMenu), a = xi(ri, e.__scopeMenu), s = g2(ri, e.__scopeMenu), l = bd(ri, e.__scopeMenu), c = C.useRef(null), { pointerGraceTimerRef: d, onPointerGraceIntentChange: h } = l, p = { __scopeMenu: e.__scopeMenu }, m = C.useCallback(() => {
      c.current && window.clearTimeout(c.current), c.current = null;
    }, []);
    return C.useEffect(() => m, [m]), C.useEffect(() => {
      const b = d.current;
      return () => {
        window.clearTimeout(b), h(null);
      };
    }, [d, h]), /* @__PURE__ */ f(md, { asChild: !0, ...p, children: /* @__PURE__ */ f(
      a2,
      {
        id: s.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": r.open,
        "aria-controls": s.contentId,
        "data-state": y2(r.open),
        ...e,
        ref: hl(n, s.onTriggerChange),
        onClick: (b) => {
          e.onClick?.(b), !(e.disabled || b.defaultPrevented) && (b.currentTarget.focus(), r.open || r.onOpenChange(!0));
        },
        onPointerMove: Te(
          e.onPointerMove,
          fi((b) => {
            l.onItemEnter(b), !b.defaultPrevented && !e.disabled && !r.open && !c.current && (l.onPointerGraceIntentChange(null), c.current = window.setTimeout(() => {
              r.onOpenChange(!0), m();
            }, 100));
          })
        ),
        onPointerLeave: Te(
          e.onPointerLeave,
          fi((b) => {
            m();
            const w = r.content?.getBoundingClientRect();
            if (w) {
              const g = r.content?.dataset.side, x = g === "right", y = x ? -5 : 5, E = w[x ? "left" : "right"], R = w[x ? "right" : "left"];
              l.onPointerGraceIntentChange({
                area: [
                  // Apply a bleed on clientX to ensure that our exit point is
                  // consistently within polygon bounds
                  { x: b.clientX + y, y: b.clientY },
                  { x: E, y: w.top },
                  { x: R, y: w.top },
                  { x: R, y: w.bottom },
                  { x: E, y: w.bottom }
                ],
                side: g
              }), window.clearTimeout(d.current), d.current = window.setTimeout(
                () => l.onPointerGraceIntentChange(null),
                300
              );
            } else {
              if (l.onTriggerLeave(b), b.defaultPrevented) return;
              l.onPointerGraceIntentChange(null);
            }
          })
        ),
        onKeyDown: Te(e.onKeyDown, (b) => {
          const w = l.searchRef.current !== "";
          e.disabled || w && b.key === " " || Ow[a.dir].includes(b.key) && (r.onOpenChange(!0), r.content?.focus(), b.preventDefault());
        })
      }
    ) });
  }
);
m2.displayName = ri;
var v2 = "MenuSubContent", b2 = C.forwardRef(
  (e, n) => {
    const r = t2(Pn, e.__scopeMenu), { forceMount: a = r.forceMount, ...s } = e, l = $o(Pn, e.__scopeMenu), c = xi(Pn, e.__scopeMenu), d = g2(v2, e.__scopeMenu), h = C.useRef(null), p = Lt(n, h);
    return /* @__PURE__ */ f(di.Provider, { scope: e.__scopeMenu, children: /* @__PURE__ */ f(Xn, { present: a || l.open, children: /* @__PURE__ */ f(di.Slot, { scope: e.__scopeMenu, children: /* @__PURE__ */ f(
      yd,
      {
        id: d.contentId,
        "aria-labelledby": d.triggerId,
        ...s,
        ref: p,
        align: "start",
        side: c.dir === "rtl" ? "left" : "right",
        disableOutsidePointerEvents: !1,
        disableOutsideScroll: !1,
        trapFocus: !1,
        onOpenAutoFocus: (m) => {
          c.isUsingKeyboardRef.current && h.current?.focus(), m.preventDefault();
        },
        onCloseAutoFocus: (m) => m.preventDefault(),
        onFocusOutside: Te(e.onFocusOutside, (m) => {
          m.target !== d.trigger && l.onOpenChange(!1);
        }),
        onEscapeKeyDown: Te(e.onEscapeKeyDown, (m) => {
          c.onClose(), m.preventDefault();
        }),
        onKeyDown: Te(e.onKeyDown, (m) => {
          const b = m.currentTarget.contains(m.target), w = Pw[c.dir].includes(m.key);
          b && w && (l.onOpenChange(!1), d.trigger?.focus(), m.preventDefault());
        })
      }
    ) }) }) });
  }
);
b2.displayName = v2;
function y2(e) {
  return e ? "open" : "closed";
}
function al(e) {
  return e === "indeterminate";
}
function Cd(e) {
  return al(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
function tx(e) {
  const n = document.activeElement;
  for (const r of e)
    if (r === n || (r.focus(), document.activeElement !== n)) return;
}
function nx(e, n) {
  return e.map((r, a) => e[(n + a) % e.length]);
}
function rx(e, n, r) {
  const s = n.length > 1 && Array.from(n).every((p) => p === n[0]) ? n[0] : n, l = r ? e.indexOf(r) : -1;
  let c = nx(e, Math.max(l, 0));
  s.length === 1 && (c = c.filter((p) => p !== r));
  const h = c.find(
    (p) => p.toLowerCase().startsWith(s.toLowerCase())
  );
  return h !== r ? h : void 0;
}
function ox(e, n) {
  const { x: r, y: a } = e;
  let s = !1;
  for (let l = 0, c = n.length - 1; l < n.length; c = l++) {
    const d = n[l], h = n[c], p = d.x, m = d.y, b = h.x, w = h.y;
    m > a != w > a && r < (b - p) * (a - m) / (w - m) + p && (s = !s);
  }
  return s;
}
function ax(e, n) {
  if (!n) return !1;
  const r = { x: e.clientX, y: e.clientY };
  return ox(r, n);
}
function fi(e) {
  return (n) => n.pointerType === "mouse" ? e(n) : void 0;
}
var ix = e2, sx = md, lx = n2, cx = r2, ux = wd, dx = o2, fx = El, hx = i2, px = l2, gx = u2, mx = f2, vx = h2, bx = p2, yx = m2, wx = b2, Rl = "DropdownMenu", [xx] = go(
  Rl,
  [Jp]
), rn = Jp(), [Cx, w2] = xx(Rl), x2 = (e) => {
  const {
    __scopeDropdownMenu: n,
    children: r,
    dir: a,
    open: s,
    defaultOpen: l,
    onOpenChange: c,
    modal: d = !0
  } = e, h = rn(n), p = C.useRef(null), [m, b] = vi({
    prop: s,
    defaultProp: l ?? !1,
    onChange: c,
    caller: Rl
  });
  return /* @__PURE__ */ f(
    Cx,
    {
      scope: n,
      triggerId: so(),
      triggerRef: p,
      contentId: so(),
      open: m,
      onOpenChange: b,
      onOpenToggle: C.useCallback(() => b((w) => !w), [b]),
      modal: d,
      children: /* @__PURE__ */ f(ix, { ...h, open: m, onOpenChange: b, dir: a, modal: d, children: r })
    }
  );
};
x2.displayName = Rl;
var C2 = "DropdownMenuTrigger", S2 = C.forwardRef(
  (e, n) => {
    const { __scopeDropdownMenu: r, disabled: a = !1, ...s } = e, l = w2(C2, r), c = rn(r);
    return /* @__PURE__ */ f(sx, { asChild: !0, ...c, children: /* @__PURE__ */ f(
      mt.button,
      {
        type: "button",
        id: l.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": l.open,
        "aria-controls": l.open ? l.contentId : void 0,
        "data-state": l.open ? "open" : "closed",
        "data-disabled": a ? "" : void 0,
        disabled: a,
        ...s,
        ref: hl(n, l.triggerRef),
        onPointerDown: Te(e.onPointerDown, (d) => {
          !a && d.button === 0 && d.ctrlKey === !1 && (l.onOpenToggle(), l.open || d.preventDefault());
        }),
        onKeyDown: Te(e.onKeyDown, (d) => {
          a || (["Enter", " "].includes(d.key) && l.onOpenToggle(), d.key === "ArrowDown" && l.onOpenChange(!0), ["Enter", " ", "ArrowDown"].includes(d.key) && d.preventDefault());
        })
      }
    ) });
  }
);
S2.displayName = C2;
var Sx = "DropdownMenuPortal", _2 = (e) => {
  const { __scopeDropdownMenu: n, ...r } = e, a = rn(n);
  return /* @__PURE__ */ f(lx, { ...a, ...r });
};
_2.displayName = Sx;
var E2 = "DropdownMenuContent", R2 = C.forwardRef(
  (e, n) => {
    const { __scopeDropdownMenu: r, ...a } = e, s = w2(E2, r), l = rn(r), c = C.useRef(!1);
    return /* @__PURE__ */ f(
      cx,
      {
        id: s.contentId,
        "aria-labelledby": s.triggerId,
        ...l,
        ...a,
        ref: n,
        onCloseAutoFocus: Te(e.onCloseAutoFocus, (d) => {
          c.current || s.triggerRef.current?.focus(), c.current = !1, d.preventDefault();
        }),
        onInteractOutside: Te(e.onInteractOutside, (d) => {
          const h = d.detail.originalEvent, p = h.button === 0 && h.ctrlKey === !0, m = h.button === 2 || p;
          (!s.modal || m) && (c.current = !0);
        }),
        style: {
          ...e.style,
          "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
          "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
          "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
        }
      }
    );
  }
);
R2.displayName = E2;
var _x = "DropdownMenuGroup", Ex = C.forwardRef(
  (e, n) => {
    const { __scopeDropdownMenu: r, ...a } = e, s = rn(r);
    return /* @__PURE__ */ f(ux, { ...s, ...a, ref: n });
  }
);
Ex.displayName = _x;
var Rx = "DropdownMenuLabel", I2 = C.forwardRef(
  (e, n) => {
    const { __scopeDropdownMenu: r, ...a } = e, s = rn(r);
    return /* @__PURE__ */ f(dx, { ...s, ...a, ref: n });
  }
);
I2.displayName = Rx;
var Ix = "DropdownMenuItem", k2 = C.forwardRef(
  (e, n) => {
    const { __scopeDropdownMenu: r, ...a } = e, s = rn(r);
    return /* @__PURE__ */ f(fx, { ...s, ...a, ref: n });
  }
);
k2.displayName = Ix;
var kx = "DropdownMenuCheckboxItem", M2 = C.forwardRef((e, n) => {
  const { __scopeDropdownMenu: r, ...a } = e, s = rn(r);
  return /* @__PURE__ */ f(hx, { ...s, ...a, ref: n });
});
M2.displayName = kx;
var Mx = "DropdownMenuRadioGroup", L2 = C.forwardRef((e, n) => {
  const { __scopeDropdownMenu: r, ...a } = e, s = rn(r);
  return /* @__PURE__ */ f(px, { ...s, ...a, ref: n });
});
L2.displayName = Mx;
var Lx = "DropdownMenuRadioItem", N2 = C.forwardRef((e, n) => {
  const { __scopeDropdownMenu: r, ...a } = e, s = rn(r);
  return /* @__PURE__ */ f(gx, { ...s, ...a, ref: n });
});
N2.displayName = Lx;
var Nx = "DropdownMenuItemIndicator", T2 = C.forwardRef((e, n) => {
  const { __scopeDropdownMenu: r, ...a } = e, s = rn(r);
  return /* @__PURE__ */ f(mx, { ...s, ...a, ref: n });
});
T2.displayName = Nx;
var Tx = "DropdownMenuSeparator", A2 = C.forwardRef((e, n) => {
  const { __scopeDropdownMenu: r, ...a } = e, s = rn(r);
  return /* @__PURE__ */ f(vx, { ...s, ...a, ref: n });
});
A2.displayName = Tx;
var Ax = "DropdownMenuArrow", Ox = C.forwardRef(
  (e, n) => {
    const { __scopeDropdownMenu: r, ...a } = e, s = rn(r);
    return /* @__PURE__ */ f(bx, { ...s, ...a, ref: n });
  }
);
Ox.displayName = Ax;
var Px = "DropdownMenuSubTrigger", O2 = C.forwardRef((e, n) => {
  const { __scopeDropdownMenu: r, ...a } = e, s = rn(r);
  return /* @__PURE__ */ f(yx, { ...s, ...a, ref: n });
});
O2.displayName = Px;
var Dx = "DropdownMenuSubContent", P2 = C.forwardRef((e, n) => {
  const { __scopeDropdownMenu: r, ...a } = e, s = rn(r);
  return /* @__PURE__ */ f(
    wx,
    {
      ...s,
      ...a,
      ref: n,
      style: {
        ...e.style,
        "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
        "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
        "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
      }
    }
  );
});
P2.displayName = Dx;
var Fx = x2, D2 = S2, Wx = _2, F2 = R2, W2 = I2, H2 = k2, $2 = M2, Hx = L2, z2 = N2, B2 = T2, V2 = A2, U2 = O2, G2 = P2, $x = "Separator", _0 = "horizontal", zx = ["horizontal", "vertical"], K2 = C.forwardRef((e, n) => {
  const { decorative: r, orientation: a = _0, ...s } = e, l = Bx(a) ? a : _0, d = r ? { role: "none" } : { "aria-orientation": l === "vertical" ? l : void 0, role: "separator" };
  return /* @__PURE__ */ f(
    mt.div,
    {
      "data-orientation": l,
      ...d,
      ...s,
      ref: n
    }
  );
});
K2.displayName = $x;
function Bx(e) {
  return zx.includes(e);
}
var Z2 = K2, [Il] = go("Tooltip", [
  Sl
]), kl = Sl(), j2 = "TooltipProvider", Vx = 700, zu = "tooltip.open", [Ux, Sd] = Il(j2), q2 = (e) => {
  const {
    __scopeTooltip: n,
    delayDuration: r = Vx,
    skipDelayDuration: a = 300,
    disableHoverableContent: s = !1,
    children: l
  } = e, c = C.useRef(!0), d = C.useRef(!1), h = C.useRef(0);
  return C.useEffect(() => {
    const p = h.current;
    return () => window.clearTimeout(p);
  }, []), /* @__PURE__ */ f(
    Ux,
    {
      scope: n,
      isOpenDelayedRef: c,
      delayDuration: r,
      onOpen: C.useCallback(() => {
        window.clearTimeout(h.current), c.current = !1;
      }, []),
      onClose: C.useCallback(() => {
        window.clearTimeout(h.current), h.current = window.setTimeout(
          () => c.current = !0,
          a
        );
      }, [a]),
      isPointerInTransitRef: d,
      onPointerInTransitChange: C.useCallback((p) => {
        d.current = p;
      }, []),
      disableHoverableContent: s,
      children: l
    }
  );
};
q2.displayName = j2;
var hi = "Tooltip", [Gx, Ci] = Il(hi), Y2 = (e) => {
  const {
    __scopeTooltip: n,
    children: r,
    open: a,
    defaultOpen: s,
    onOpenChange: l,
    disableHoverableContent: c,
    delayDuration: d
  } = e, h = Sd(hi, e.__scopeTooltip), p = kl(n), [m, b] = C.useState(null), w = so(), g = C.useRef(0), x = c ?? h.disableHoverableContent, y = d ?? h.delayDuration, E = C.useRef(!1), [R, N] = vi({
    prop: a,
    defaultProp: s ?? !1,
    onChange: (D) => {
      D ? (h.onOpen(), document.dispatchEvent(new CustomEvent(zu))) : h.onClose(), l?.(D);
    },
    caller: hi
  }), L = C.useMemo(() => R ? E.current ? "delayed-open" : "instant-open" : "closed", [R]), M = C.useCallback(() => {
    window.clearTimeout(g.current), g.current = 0, E.current = !1, N(!0);
  }, [N]), I = C.useCallback(() => {
    window.clearTimeout(g.current), g.current = 0, N(!1);
  }, [N]), O = C.useCallback(() => {
    window.clearTimeout(g.current), g.current = window.setTimeout(() => {
      E.current = !0, N(!0), g.current = 0;
    }, y);
  }, [y, N]);
  return C.useEffect(() => () => {
    g.current && (window.clearTimeout(g.current), g.current = 0);
  }, []), /* @__PURE__ */ f(zp, { ...p, children: /* @__PURE__ */ f(
    Gx,
    {
      scope: n,
      contentId: w,
      open: R,
      stateAttribute: L,
      trigger: m,
      onTriggerChange: b,
      onTriggerEnter: C.useCallback(() => {
        h.isOpenDelayedRef.current ? O() : M();
      }, [h.isOpenDelayedRef, O, M]),
      onTriggerLeave: C.useCallback(() => {
        x ? I() : (window.clearTimeout(g.current), g.current = 0);
      }, [I, x]),
      onOpen: M,
      onClose: I,
      disableHoverableContent: x,
      children: r
    }
  ) });
};
Y2.displayName = hi;
var Bu = "TooltipTrigger", X2 = C.forwardRef(
  (e, n) => {
    const { __scopeTooltip: r, ...a } = e, s = Ci(Bu, r), l = Sd(Bu, r), c = kl(r), d = C.useRef(null), h = Lt(n, d, s.onTriggerChange), p = C.useRef(!1), m = C.useRef(!1), b = C.useCallback(() => p.current = !1, []);
    return C.useEffect(() => () => document.removeEventListener("pointerup", b), [b]), /* @__PURE__ */ f(Bp, { asChild: !0, ...c, children: /* @__PURE__ */ f(
      mt.button,
      {
        "aria-describedby": s.open ? s.contentId : void 0,
        "data-state": s.stateAttribute,
        ...a,
        ref: h,
        onPointerMove: Te(e.onPointerMove, (w) => {
          w.pointerType !== "touch" && !m.current && !l.isPointerInTransitRef.current && (s.onTriggerEnter(), m.current = !0);
        }),
        onPointerLeave: Te(e.onPointerLeave, () => {
          s.onTriggerLeave(), m.current = !1;
        }),
        onPointerDown: Te(e.onPointerDown, () => {
          s.open && s.onClose(), p.current = !0, document.addEventListener("pointerup", b, { once: !0 });
        }),
        onFocus: Te(e.onFocus, () => {
          p.current || s.onOpen();
        }),
        onBlur: Te(e.onBlur, s.onClose),
        onClick: Te(e.onClick, s.onClose)
      }
    ) });
  }
);
X2.displayName = Bu;
var _d = "TooltipPortal", [Kx, Zx] = Il(_d, {
  forceMount: void 0
}), J2 = (e) => {
  const { __scopeTooltip: n, forceMount: r, children: a, container: s } = e, l = Ci(_d, n);
  return /* @__PURE__ */ f(Kx, { scope: n, forceMount: r, children: /* @__PURE__ */ f(Xn, { present: r || l.open, children: /* @__PURE__ */ f(ml, { asChild: !0, container: s, children: a }) }) });
};
J2.displayName = _d;
var wa = "TooltipContent", Q2 = C.forwardRef(
  (e, n) => {
    const r = Zx(wa, e.__scopeTooltip), { forceMount: a = r.forceMount, side: s = "top", ...l } = e, c = Ci(wa, e.__scopeTooltip);
    return /* @__PURE__ */ f(Xn, { present: a || c.open, children: c.disableHoverableContent ? /* @__PURE__ */ f(eg, { side: s, ...l, ref: n }) : /* @__PURE__ */ f(jx, { side: s, ...l, ref: n }) });
  }
), jx = C.forwardRef((e, n) => {
  const r = Ci(wa, e.__scopeTooltip), a = Sd(wa, e.__scopeTooltip), s = C.useRef(null), l = Lt(n, s), [c, d] = C.useState(null), { trigger: h, onClose: p } = r, m = s.current, { onPointerInTransitChange: b } = a, w = C.useCallback(() => {
    d(null), b(!1);
  }, [b]), g = C.useCallback(
    (x, y) => {
      const E = x.currentTarget, R = { x: x.clientX, y: x.clientY }, N = Qx(R, E.getBoundingClientRect()), L = eC(R, N), M = tC(y.getBoundingClientRect()), I = rC([...L, ...M]);
      d(I), b(!0);
    },
    [b]
  );
  return C.useEffect(() => () => w(), [w]), C.useEffect(() => {
    if (h && m) {
      const x = (E) => g(E, m), y = (E) => g(E, h);
      return h.addEventListener("pointerleave", x), m.addEventListener("pointerleave", y), () => {
        h.removeEventListener("pointerleave", x), m.removeEventListener("pointerleave", y);
      };
    }
  }, [h, m, g, w]), C.useEffect(() => {
    if (c) {
      const x = (y) => {
        const E = y.target, R = { x: y.clientX, y: y.clientY }, N = h?.contains(E) || m?.contains(E), L = !nC(R, c);
        N ? w() : L && (w(), p());
      };
      return document.addEventListener("pointermove", x), () => document.removeEventListener("pointermove", x);
    }
  }, [h, m, c, p, w]), /* @__PURE__ */ f(eg, { ...e, ref: l });
}), [qx, Yx] = Il(hi, { isInside: !1 }), Xx = /* @__PURE__ */ g7("TooltipContent"), eg = C.forwardRef(
  (e, n) => {
    const {
      __scopeTooltip: r,
      children: a,
      "aria-label": s,
      onEscapeKeyDown: l,
      onPointerDownOutside: c,
      ...d
    } = e, h = Ci(wa, r), p = kl(r), { onClose: m } = h;
    return C.useEffect(() => (document.addEventListener(zu, m), () => document.removeEventListener(zu, m)), [m]), C.useEffect(() => {
      if (h.trigger) {
        const b = (w) => {
          w.target?.contains(h.trigger) && m();
        };
        return window.addEventListener("scroll", b, { capture: !0 }), () => window.removeEventListener("scroll", b, { capture: !0 });
      }
    }, [h.trigger, m]), /* @__PURE__ */ f(
      gl,
      {
        asChild: !0,
        disableOutsidePointerEvents: !1,
        onEscapeKeyDown: l,
        onPointerDownOutside: c,
        onFocusOutside: (b) => b.preventDefault(),
        onDismiss: m,
        children: /* @__PURE__ */ V(
          Vp,
          {
            "data-state": h.stateAttribute,
            ...p,
            ...d,
            ref: n,
            style: {
              ...d.style,
              "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
              "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
              "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
              "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)"
            },
            children: [
              /* @__PURE__ */ f(Xx, { children: a }),
              /* @__PURE__ */ f(qx, { scope: r, isInside: !0, children: /* @__PURE__ */ f(C7, { id: h.contentId, role: "tooltip", children: s || a }) })
            ]
          }
        )
      }
    );
  }
);
Q2.displayName = wa;
var tg = "TooltipArrow", Jx = C.forwardRef(
  (e, n) => {
    const { __scopeTooltip: r, ...a } = e, s = kl(r);
    return Yx(
      tg,
      r
    ).isInside ? null : /* @__PURE__ */ f(Up, { ...s, ...a, ref: n });
  }
);
Jx.displayName = tg;
function Qx(e, n) {
  const r = Math.abs(n.top - e.y), a = Math.abs(n.bottom - e.y), s = Math.abs(n.right - e.x), l = Math.abs(n.left - e.x);
  switch (Math.min(r, a, s, l)) {
    case l:
      return "left";
    case s:
      return "right";
    case r:
      return "top";
    case a:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function eC(e, n, r = 5) {
  const a = [];
  switch (n) {
    case "top":
      a.push(
        { x: e.x - r, y: e.y + r },
        { x: e.x + r, y: e.y + r }
      );
      break;
    case "bottom":
      a.push(
        { x: e.x - r, y: e.y - r },
        { x: e.x + r, y: e.y - r }
      );
      break;
    case "left":
      a.push(
        { x: e.x + r, y: e.y - r },
        { x: e.x + r, y: e.y + r }
      );
      break;
    case "right":
      a.push(
        { x: e.x - r, y: e.y - r },
        { x: e.x - r, y: e.y + r }
      );
      break;
  }
  return a;
}
function tC(e) {
  const { top: n, right: r, bottom: a, left: s } = e;
  return [
    { x: s, y: n },
    { x: r, y: n },
    { x: r, y: a },
    { x: s, y: a }
  ];
}
function nC(e, n) {
  const { x: r, y: a } = e;
  let s = !1;
  for (let l = 0, c = n.length - 1; l < n.length; c = l++) {
    const d = n[l], h = n[c], p = d.x, m = d.y, b = h.x, w = h.y;
    m > a != w > a && r < (b - p) * (a - m) / (w - m) + p && (s = !s);
  }
  return s;
}
function rC(e) {
  const n = e.slice();
  return n.sort((r, a) => r.x < a.x ? -1 : r.x > a.x ? 1 : r.y < a.y ? -1 : r.y > a.y ? 1 : 0), oC(n);
}
function oC(e) {
  if (e.length <= 1) return e.slice();
  const n = [];
  for (let a = 0; a < e.length; a++) {
    const s = e[a];
    for (; n.length >= 2; ) {
      const l = n[n.length - 1], c = n[n.length - 2];
      if ((l.x - c.x) * (s.y - c.y) >= (l.y - c.y) * (s.x - c.x)) n.pop();
      else break;
    }
    n.push(s);
  }
  n.pop();
  const r = [];
  for (let a = e.length - 1; a >= 0; a--) {
    const s = e[a];
    for (; r.length >= 2; ) {
      const l = r[r.length - 1], c = r[r.length - 2];
      if ((l.x - c.x) * (s.y - c.y) >= (l.y - c.y) * (s.x - c.x)) r.pop();
      else break;
    }
    r.push(s);
  }
  return r.pop(), n.length === 1 && r.length === 1 && n[0].x === r[0].x && n[0].y === r[0].y ? n : n.concat(r);
}
var aC = q2, iC = Y2, sC = J2, ng = Q2;
const tn = {
  text: {
    tiny: "text-xs",
    small: "text-base md:text-sm leading-4",
    medium: "text-base md:text-sm",
    large: "text-base",
    xlarge: "text-base"
  },
  padding: {
    tiny: "px-2.5 py-1",
    small: "px-3 py-2",
    medium: "px-4 py-2",
    large: "px-4 py-2",
    xlarge: "px-6 py-3"
  },
  height: {
    tiny: "h-[26px]",
    small: "h-[34px]",
    medium: "h-[38px]",
    large: "h-[42px]",
    xlarge: "h-[50px]"
  }
}, rg = {
  tiny: `${tn.text.tiny} ${tn.padding.tiny} ${tn.height.tiny}`,
  small: `${tn.text.small} ${tn.padding.small} ${tn.height.small}`,
  medium: `${tn.text.medium} ${tn.padding.medium} ${tn.height.medium}`,
  large: `${tn.text.large} ${tn.padding.large} ${tn.height.large}`,
  xlarge: `${tn.text.xlarge} ${tn.padding.xlarge} ${tn.height.xlarge}`
}, og = "small";
function mo(e, n) {
  return e !== void 0 ? e : n ? -1 : 0;
}
const lC = fr(
  `relative
  inline-flex items-center justify-center
  cursor-pointer
  space-x-2
  text-center
  font-regular
  ease-out
  duration-200
  rounded-md
  transition-colors
  focus-ring
  border
  `,
  {
    variants: {
      variant: {
        primary: `
          bg-brand-400 dark:bg-brand-500
          hover:bg-brand/80 dark:hover:bg-brand/50
          text-foreground
          border-brand-500/75 dark:border-brand/30
          hover:border-brand-600 dark:hover:border-brand
          data-[state=open]:bg-brand-400/80 dark:data-[state=open]:bg-brand-500/80
          `,
        default: `
          text-foreground
          bg-alternative dark:bg-muted  hover:bg-selection
          border-strong hover:border-stronger
          data-[state=open]:bg-selection
          data-[state=open]:border-button-hover
          `,
        secondary: `
          bg-foreground
          text-background hover:text-background/80
          border-foreground-light hover:border-foreground-lighter
          data-[state=open]:border-foreground-lighter
        `,
        outline: `
          text-foreground
          bg-transparent
          border-strong hover:border-foreground-muted
          data-[state=open]:border-stronger
        `,
        dashed: `
          text-foreground
          border
          border-dashed
          border-strong hover:border-stronger
          bg-transparent
          data-[state=open]:border-stronger
        `,
        link: `
          text-brand-600
          border
          border-transparent/0
          hover:bg-brand-400
          shadow-none
          data-[state=open]:bg-brand-400
        `,
        text: `
          text-foreground
          hover:bg-accent
          shadow-none
          data-[state=open]:bg-accent
          border-transparent
        `,
        danger: `
          text-foreground
          bg-destructive-300 dark:bg-destructive-400 hover:bg-destructive-400 dark:hover:bg-destructive/50
          border-border-destructive hover:border-destructive
          hover:text-hi-contrast
          data-[state=open]:border-destructive
          data-[state=open]:bg-destructive-400 dark:data-[state=open]:bg-destructive/50
        `,
        warning: `
          text-foreground
          bg-warning-300 dark:bg-warning-400 hover:bg-warning-400 dark:hover:bg-warning/50
          border-border-warning hover:border-warning
          hover:text-hi-contrast
          data-[state=open]:border-warning
          data-[state=open]:bg-warning-400 dark:data-[state=open]:bg-warning/50
        `
      },
      block: {
        true: "w-full flex items-center justify-center"
      },
      size: {
        ...rg
      },
      overlay: {
        base: "absolute inset-0 bg-background opacity-50",
        container: "fixed inset-0 transition-opacity"
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed pointer-events-none"
      },
      rounded: {
        true: "rounded-full"
      },
      defaultVariants: {
        //   variant: 'default',
        //   size: 'default',
        size: {
          SIZE_VARIANTS_DEFAULT: og
        }
      }
    }
  }
), cC = fr("inline-flex items-center justify-center shrink-0", {
  variants: {
    size: {
      tiny: "[&_svg]:h-[14px] [&_svg]:w-[14px]",
      small: "[&_svg]:h-[18px] [&_svg]:w-[18px]",
      medium: "[&_svg]:h-[20px] [&_svg]:w-[20px]",
      large: "[&_svg]:h-[20px] [&_svg]:w-[20px]",
      xlarge: "[&_svg]:h-[24px] [&_svg]:w-[24px]",
      xxlarge: "[&_svg]:h-[30px] [&_svg]:w-[30px]",
      xxxlarge: "[&_svg]:h-[42px] [&_svg]:w-[42px]"
    },
    variant: {
      primary: "text-brand-600",
      default: "text-foreground-lighter",
      secondary: "text-background",
      alternative: "text-foreground-lighter",
      outline: "text-foreground-lighter",
      dashed: "text-foreground-lighter",
      link: "text-brand-600",
      text: "text-foreground-lighter",
      danger: "text-destructive",
      warning: "text-warning"
    }
  }
}), E0 = fr("", {
  variants: {
    variant: {
      primary: "text-brand-600",
      default: "text-foreground-lighter",
      secondary: "text-background",
      alternative: "text-foreground-lighter",
      outline: "text-foreground-lighter",
      dashed: "text-foreground-lighter",
      link: "text-brand-600",
      text: "text-foreground-muted",
      danger: "text-destructive",
      warning: "text-warning"
    },
    loading: {
      default: "",
      true: "animate-spin"
    }
  }
}), Rt = yt(
  ({
    asChild: e = !1,
    size: n = "tiny",
    variant: r = "primary",
    children: a,
    loading: s,
    block: l,
    icon: c,
    iconRight: d,
    iconLeft: h,
    type: p = "button",
    rounded: m,
    ...b
  }, w) => {
    const g = e ? Wo : "button", { className: x, tabIndex: y } = b, E = s || c, R = c ?? h, N = s === !0 || b.disabled, L = mo(y, N), M = (I) => /* @__PURE__ */ f("div", { "aria-hidden": !0, className: fe(cC({ size: n, variant: r })), children: I });
    return /* @__PURE__ */ f(
      g,
      {
        ref: w,
        "data-size": n,
        type: p,
        ...b,
        disabled: N,
        tabIndex: L,
        className: fe(lC({ variant: r, size: n, disabled: N, block: l, rounded: m }), x),
        onClick: (I) => {
          if (N) return I.preventDefault();
          b?.onClick?.(I);
        },
        children: e ? ga(a) ? ju(
          a,
          void 0,
          E && (s ? M(
            /* @__PURE__ */ f(Js, { className: fe(E0({ loading: s, variant: r })) })
          ) : R ? M(R) : null),
          a.props.children && /* @__PURE__ */ f("span", { className: "truncate", children: a.props.children }),
          d && !s && M(d)
        ) : null : /* @__PURE__ */ V(Fn, { children: [
          E && (s ? M(
            /* @__PURE__ */ f(Js, { className: fe(E0({ loading: s, variant: r })) })
          ) : R ? M(R) : null),
          " ",
          a && /* @__PURE__ */ f("span", { className: "truncate", children: a }),
          " ",
          d && !s && M(d)
        ] })
      }
    );
  }
);
Rt.displayName = "Button";
const uC = fr(
  "inline-flex items-center gap-1 justify-center rounded-full font-normal whitespace-nowrap tracking-[0.07em] uppercase font-medium text-[9px] leading-none px-[5.5px] py-[3px]",
  {
    variants: {
      variant: {
        default: "bg-surface-75 text-foreground-light border border-strong",
        warning: "bg-warning/10 text-warning-600 border border-warning-500",
        success: "bg-brand/10 text-brand-600 border border-brand-500",
        destructive: "bg-destructive/10 text-destructive border border-border-destructive",
        // Secondary is invisible
        secondary: "bg-secondary/50 hover:bg-secondary/80 border-transparent text-secondary-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
), Ml = C.forwardRef(
  ({ className: e, variant: n = "default", children: r, ...a }, s) => /* @__PURE__ */ f("div", { ref: s, className: fe(uC({ variant: n }), e), ...a, children: r })
);
Ml.displayName = "Badge";
function dC({
  className: e,
  placeholder: n = "Search...",
  showShortcut: r = !0
}) {
  return /* @__PURE__ */ V(
    "button",
    {
      type: "button",
      className: fe(
        "group",
        "flex-grow md:min-w-44 xl:min-w-56 h-[30px] rounded-md",
        "pl-1.5 md:pl-2 pr-1",
        "flex items-center justify-between",
        "bg-surface-100/75 text-foreground-lighter border",
        //"hover:bg-opacity-100 hover:border-stronger",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-border-strong focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "transition",
        e
      ),
      disabled: !0,
      children: [
        /* @__PURE__ */ V("div", { className: "flex items-center space-x-1.5 text-foreground-lighter", children: [
          /* @__PURE__ */ f(
            kh,
            {
              size: 16,
              strokeWidth: 1.5,
              className: "group-hover:text-foreground-light transition-colors"
            }
          ),
          /* @__PURE__ */ f("p", { className: "flex text-xs pr-2 text-foreground-muted", children: n })
        ] }),
        r && /* @__PURE__ */ f("div", { className: "command-shortcut hidden md:flex items-center space-x-1", children: /* @__PURE__ */ V(
          "div",
          {
            "aria-hidden": "true",
            className: "md:flex items-center justify-center h-full px-1 border rounded bg-surface-300 gap-0.5",
            children: [
              /* @__PURE__ */ f(q9, { size: 12, strokeWidth: 1.5 }),
              /* @__PURE__ */ f("span", { className: "text-[12px]", children: "K" })
            ]
          }
        ) })
      ]
    }
  );
}
var oi = { exports: {} };
var fC = oi.exports, R0;
function hC() {
  return R0 || (R0 = 1, (function(e, n) {
    (function() {
      var r, a = "4.18.1", s = 200, l = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", c = "Expected a function", d = "Invalid `variable` option passed into `_.template`", h = "Invalid `imports` option passed into `_.template`", p = "__lodash_hash_undefined__", m = 500, b = "__lodash_placeholder__", w = 1, g = 2, x = 4, y = 1, E = 2, R = 1, N = 2, L = 4, M = 8, I = 16, O = 32, D = 64, A = 128, z = 256, se = 512, ue = 30, ce = "...", ne = 800, Z = 16, le = 1, X = 2, ge = 3, pe = 1 / 0, H = 9007199254740991, P = 17976931348623157e292, ae = NaN, U = 4294967295, B = U - 1, G = U >>> 1, J = [
        ["ary", A],
        ["bind", R],
        ["bindKey", N],
        ["curry", M],
        ["curryRight", I],
        ["flip", se],
        ["partial", O],
        ["partialRight", D],
        ["rearg", z]
      ], Q = "[object Arguments]", j = "[object Array]", ve = "[object AsyncFunction]", he = "[object Boolean]", re = "[object Date]", me = "[object DOMException]", ee = "[object Error]", Le = "[object Function]", qe = "[object GeneratorFunction]", vt = "[object Map]", $t = "[object Number]", Re = "[object Null]", Ue = "[object Object]", zt = "[object Promise]", St = "[object Proxy]", rt = "[object RegExp]", ut = "[object Set]", st = "[object String]", pt = "[object Symbol]", Qn = "[object Undefined]", bt = "[object WeakMap]", _t = "[object WeakSet]", on = "[object ArrayBuffer]", an = "[object DataView]", ot = "[object Float32Array]", Wr = "[object Float64Array]", qt = "[object Int8Array]", Wn = "[object Int16Array]", Yt = "[object Int32Array]", pr = "[object Uint8Array]", gn = "[object Uint8ClampedArray]", gr = "[object Uint16Array]", Hn = "[object Uint32Array]", Bo = /\b__p \+= '';/g, Hr = /\b(__p \+=) '' \+/g, $r = /(__e\(.*?\)|\b__t\)) \+\n'';/g, zr = /&(?:amp|lt|gt|quot|#39);/g, sn = /[&<>"']/g, En = RegExp(zr.source), Ne = RegExp(sn.source), je = /<%-([\s\S]+?)%>/g, lt = /<%([\s\S]+?)%>/g, Ye = /<%=([\s\S]+?)%>/g, Kt = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, xt = /^\w*$/, Bt = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Vt = /[\\^$.*+?()[\]{}|]/g, mn = RegExp(Vt.source), Ra = /^\s+/, Hl = /\s/, $l = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, Br = /\{\n\/\* \[wrapped with (.+)\] \*/, Vr = /,? & /, Ei = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, er = /[()=,{}\[\]\/\s]/, Ia = /\\(\\)?/g, Xt = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, vo = /\w*$/, mr = /^[-+]0x[0-9a-f]+$/i, Se = /^0b[01]+$/i, Ur = /^\[object .+?Constructor\]$/, bo = /^0o[0-7]+$/i, ka = /^(?:0|[1-9]\d*)$/, Vo = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, yo = /($^)/, Uo = /['\n\r\u2028\u2029\\]/g, Gr = "\\ud800-\\udfff", zl = "\\u0300-\\u036f", Ri = "\\ufe20-\\ufe2f", Ii = "\\u20d0-\\u20ff", ki = zl + Ri + Ii, Mi = "\\u2700-\\u27bf", Kr = "a-z\\xdf-\\xf6\\xf8-\\xff", wo = "\\xac\\xb1\\xd7\\xf7", Ma = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", Bl = "\\u2000-\\u206f", Li = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", Ni = "A-Z\\xc0-\\xd6\\xd8-\\xde", Go = "\\ufe0e\\ufe0f", $n = wo + Ma + Bl + Li, La = "['’]", Vl = "[" + Gr + "]", Ti = "[" + $n + "]", zn = "[" + ki + "]", Na = "\\d+", Ko = "[" + Mi + "]", Ai = "[" + Kr + "]", Oi = "[^" + Gr + $n + Na + Mi + Kr + Ni + "]", Ta = "\\ud83c[\\udffb-\\udfff]", Ul = "(?:" + zn + "|" + Ta + ")", Pi = "[^" + Gr + "]", Aa = "(?:\\ud83c[\\udde6-\\uddff]){2}", Oa = "[\\ud800-\\udbff][\\udc00-\\udfff]", Zr = "[" + Ni + "]", Di = "\\u200d", Fi = "(?:" + Ai + "|" + Oi + ")", Gl = "(?:" + Zr + "|" + Oi + ")", Wi = "(?:" + La + "(?:d|ll|m|re|s|t|ve))?", Zo = "(?:" + La + "(?:D|LL|M|RE|S|T|VE))?", Pa = Ul + "?", jo = "[" + Go + "]?", Kl = "(?:" + Di + "(?:" + [Pi, Aa, Oa].join("|") + ")" + jo + Pa + ")*", Hi = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", Zl = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", $i = jo + Pa + Kl, qo = "(?:" + [Ko, Aa, Oa].join("|") + ")" + $i, zi = "(?:" + [Pi + zn + "?", zn, Aa, Oa, Vl].join("|") + ")", jl = RegExp(La, "g"), ql = RegExp(zn, "g"), Da = RegExp(Ta + "(?=" + Ta + ")|" + zi + $i, "g"), Yl = RegExp([
        Zr + "?" + Ai + "+" + Wi + "(?=" + [Ti, Zr, "$"].join("|") + ")",
        Gl + "+" + Zo + "(?=" + [Ti, Zr + Fi, "$"].join("|") + ")",
        Zr + "?" + Fi + "+" + Wi,
        Zr + "+" + Zo,
        Zl,
        Hi,
        Na,
        qo
      ].join("|"), "g"), Xl = RegExp("[" + Di + Gr + ki + Go + "]"), Jl = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Ql = [
        "Array",
        "Buffer",
        "DataView",
        "Date",
        "Error",
        "Float32Array",
        "Float64Array",
        "Function",
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "Map",
        "Math",
        "Object",
        "Promise",
        "RegExp",
        "Set",
        "String",
        "Symbol",
        "TypeError",
        "Uint8Array",
        "Uint8ClampedArray",
        "Uint16Array",
        "Uint32Array",
        "WeakMap",
        "_",
        "clearTimeout",
        "isFinite",
        "parseInt",
        "setTimeout"
      ], ec = -1, dt = {};
      dt[ot] = dt[Wr] = dt[qt] = dt[Wn] = dt[Yt] = dt[pr] = dt[gn] = dt[gr] = dt[Hn] = !0, dt[Q] = dt[j] = dt[on] = dt[he] = dt[an] = dt[re] = dt[ee] = dt[Le] = dt[vt] = dt[$t] = dt[Ue] = dt[rt] = dt[ut] = dt[st] = dt[bt] = !1;
      var at = {};
      at[Q] = at[j] = at[on] = at[an] = at[he] = at[re] = at[ot] = at[Wr] = at[qt] = at[Wn] = at[Yt] = at[vt] = at[$t] = at[Ue] = at[rt] = at[ut] = at[st] = at[pt] = at[pr] = at[gn] = at[gr] = at[Hn] = !0, at[ee] = at[Le] = at[bt] = !1;
      var Bi = {
        // Latin-1 Supplement block.
        À: "A",
        Á: "A",
        Â: "A",
        Ã: "A",
        Ä: "A",
        Å: "A",
        à: "a",
        á: "a",
        â: "a",
        ã: "a",
        ä: "a",
        å: "a",
        Ç: "C",
        ç: "c",
        Ð: "D",
        ð: "d",
        È: "E",
        É: "E",
        Ê: "E",
        Ë: "E",
        è: "e",
        é: "e",
        ê: "e",
        ë: "e",
        Ì: "I",
        Í: "I",
        Î: "I",
        Ï: "I",
        ì: "i",
        í: "i",
        î: "i",
        ï: "i",
        Ñ: "N",
        ñ: "n",
        Ò: "O",
        Ó: "O",
        Ô: "O",
        Õ: "O",
        Ö: "O",
        Ø: "O",
        ò: "o",
        ó: "o",
        ô: "o",
        õ: "o",
        ö: "o",
        ø: "o",
        Ù: "U",
        Ú: "U",
        Û: "U",
        Ü: "U",
        ù: "u",
        ú: "u",
        û: "u",
        ü: "u",
        Ý: "Y",
        ý: "y",
        ÿ: "y",
        Æ: "Ae",
        æ: "ae",
        Þ: "Th",
        þ: "th",
        ß: "ss",
        // Latin Extended-A block.
        Ā: "A",
        Ă: "A",
        Ą: "A",
        ā: "a",
        ă: "a",
        ą: "a",
        Ć: "C",
        Ĉ: "C",
        Ċ: "C",
        Č: "C",
        ć: "c",
        ĉ: "c",
        ċ: "c",
        č: "c",
        Ď: "D",
        Đ: "D",
        ď: "d",
        đ: "d",
        Ē: "E",
        Ĕ: "E",
        Ė: "E",
        Ę: "E",
        Ě: "E",
        ē: "e",
        ĕ: "e",
        ė: "e",
        ę: "e",
        ě: "e",
        Ĝ: "G",
        Ğ: "G",
        Ġ: "G",
        Ģ: "G",
        ĝ: "g",
        ğ: "g",
        ġ: "g",
        ģ: "g",
        Ĥ: "H",
        Ħ: "H",
        ĥ: "h",
        ħ: "h",
        Ĩ: "I",
        Ī: "I",
        Ĭ: "I",
        Į: "I",
        İ: "I",
        ĩ: "i",
        ī: "i",
        ĭ: "i",
        į: "i",
        ı: "i",
        Ĵ: "J",
        ĵ: "j",
        Ķ: "K",
        ķ: "k",
        ĸ: "k",
        Ĺ: "L",
        Ļ: "L",
        Ľ: "L",
        Ŀ: "L",
        Ł: "L",
        ĺ: "l",
        ļ: "l",
        ľ: "l",
        ŀ: "l",
        ł: "l",
        Ń: "N",
        Ņ: "N",
        Ň: "N",
        Ŋ: "N",
        ń: "n",
        ņ: "n",
        ň: "n",
        ŋ: "n",
        Ō: "O",
        Ŏ: "O",
        Ő: "O",
        ō: "o",
        ŏ: "o",
        ő: "o",
        Ŕ: "R",
        Ŗ: "R",
        Ř: "R",
        ŕ: "r",
        ŗ: "r",
        ř: "r",
        Ś: "S",
        Ŝ: "S",
        Ş: "S",
        Š: "S",
        ś: "s",
        ŝ: "s",
        ş: "s",
        š: "s",
        Ţ: "T",
        Ť: "T",
        Ŧ: "T",
        ţ: "t",
        ť: "t",
        ŧ: "t",
        Ũ: "U",
        Ū: "U",
        Ŭ: "U",
        Ů: "U",
        Ű: "U",
        Ų: "U",
        ũ: "u",
        ū: "u",
        ŭ: "u",
        ů: "u",
        ű: "u",
        ų: "u",
        Ŵ: "W",
        ŵ: "w",
        Ŷ: "Y",
        ŷ: "y",
        Ÿ: "Y",
        Ź: "Z",
        Ż: "Z",
        Ž: "Z",
        ź: "z",
        ż: "z",
        ž: "z",
        Ĳ: "IJ",
        ĳ: "ij",
        Œ: "Oe",
        œ: "oe",
        ŉ: "'n",
        ſ: "s"
      }, vr = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, Fa = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, tc = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, Wa = parseFloat, Yo = parseInt, jr = typeof Fs == "object" && Fs && Fs.Object === Object && Fs, nc = typeof self == "object" && self && self.Object === Object && self, Nt = jr || nc || Function("return this")(), Xo = n && !n.nodeType && n, br = Xo && !0 && e && !e.nodeType && e, Vi = br && br.exports === Xo, Ha = Vi && jr.process, Dt = (function() {
        try {
          var F = br && br.require && br.require("util").types;
          return F || Ha && Ha.binding && Ha.binding("util");
        } catch {
        }
      })(), Ui = Dt && Dt.isArrayBuffer, xo = Dt && Dt.isDate, Jo = Dt && Dt.isMap, q = Dt && Dt.isRegExp, oe = Dt && Dt.isSet, xe = Dt && Dt.isTypedArray;
      function ye(F, K, $) {
        switch ($.length) {
          case 0:
            return F.call(K);
          case 1:
            return F.call(K, $[0]);
          case 2:
            return F.call(K, $[0], $[1]);
          case 3:
            return F.call(K, $[0], $[1], $[2]);
        }
        return F.apply(K, $);
      }
      function Fe(F, K, $, we) {
        for (var Ae = -1, Je = F == null ? 0 : F.length; ++Ae < Je; ) {
          var Tt = F[Ae];
          K(we, Tt, $(Tt), F);
        }
        return we;
      }
      function Pe(F, K) {
        for (var $ = -1, we = F == null ? 0 : F.length; ++$ < we && K(F[$], $, F) !== !1; )
          ;
        return F;
      }
      function it(F, K) {
        for (var $ = F == null ? 0 : F.length; $-- && K(F[$], $, F) !== !1; )
          ;
        return F;
      }
      function gt(F, K) {
        for (var $ = -1, we = F == null ? 0 : F.length; ++$ < we; )
          if (!K(F[$], $, F))
            return !1;
        return !0;
      }
      function Xe(F, K) {
        for (var $ = -1, we = F == null ? 0 : F.length, Ae = 0, Je = []; ++$ < we; ) {
          var Tt = F[$];
          K(Tt, $, F) && (Je[Ae++] = Tt);
        }
        return Je;
      }
      function Mt(F, K) {
        var $ = F == null ? 0 : F.length;
        return !!$ && Qo(F, K, 0) > -1;
      }
      function Bn(F, K, $) {
        for (var we = -1, Ae = F == null ? 0 : F.length; ++we < Ae; )
          if ($(K, F[we]))
            return !0;
        return !1;
      }
      function ct(F, K) {
        for (var $ = -1, we = F == null ? 0 : F.length, Ae = Array(we); ++$ < we; )
          Ae[$] = K(F[$], $, F);
        return Ae;
      }
      function Rn(F, K) {
        for (var $ = -1, we = K.length, Ae = F.length; ++$ < we; )
          F[Ae + $] = K[$];
        return F;
      }
      function Co(F, K, $, we) {
        var Ae = -1, Je = F == null ? 0 : F.length;
        for (we && Je && ($ = F[++Ae]); ++Ae < Je; )
          $ = K($, F[Ae], Ae, F);
        return $;
      }
      function hm(F, K, $, we) {
        var Ae = F == null ? 0 : F.length;
        for (we && Ae && ($ = F[--Ae]); Ae--; )
          $ = K($, F[Ae], Ae, F);
        return $;
      }
      function rc(F, K) {
        for (var $ = -1, we = F == null ? 0 : F.length; ++$ < we; )
          if (K(F[$], $, F))
            return !0;
        return !1;
      }
      var pm = oc("length");
      function gm(F) {
        return F.split("");
      }
      function mm(F) {
        return F.match(Ei) || [];
      }
      function $d(F, K, $) {
        var we;
        return $(F, function(Ae, Je, Tt) {
          if (K(Ae, Je, Tt))
            return we = Je, !1;
        }), we;
      }
      function Gi(F, K, $, we) {
        for (var Ae = F.length, Je = $ + (we ? 1 : -1); we ? Je-- : ++Je < Ae; )
          if (K(F[Je], Je, F))
            return Je;
        return -1;
      }
      function Qo(F, K, $) {
        return K === K ? km(F, K, $) : Gi(F, zd, $);
      }
      function vm(F, K, $, we) {
        for (var Ae = $ - 1, Je = F.length; ++Ae < Je; )
          if (we(F[Ae], K))
            return Ae;
        return -1;
      }
      function zd(F) {
        return F !== F;
      }
      function Bd(F, K) {
        var $ = F == null ? 0 : F.length;
        return $ ? ic(F, K) / $ : ae;
      }
      function oc(F) {
        return function(K) {
          return K == null ? r : K[F];
        };
      }
      function ac(F) {
        return function(K) {
          return F == null ? r : F[K];
        };
      }
      function Vd(F, K, $, we, Ae) {
        return Ae(F, function(Je, Tt, ft) {
          $ = we ? (we = !1, Je) : K($, Je, Tt, ft);
        }), $;
      }
      function bm(F, K) {
        var $ = F.length;
        for (F.sort(K); $--; )
          F[$] = F[$].value;
        return F;
      }
      function ic(F, K) {
        for (var $, we = -1, Ae = F.length; ++we < Ae; ) {
          var Je = K(F[we]);
          Je !== r && ($ = $ === r ? Je : $ + Je);
        }
        return $;
      }
      function sc(F, K) {
        for (var $ = -1, we = Array(F); ++$ < F; )
          we[$] = K($);
        return we;
      }
      function ym(F, K) {
        return ct(K, function($) {
          return [$, F[$]];
        });
      }
      function Ud(F) {
        return F && F.slice(0, jd(F) + 1).replace(Ra, "");
      }
      function vn(F) {
        return function(K) {
          return F(K);
        };
      }
      function lc(F, K) {
        return ct(K, function($) {
          return F[$];
        });
      }
      function $a(F, K) {
        return F.has(K);
      }
      function Gd(F, K) {
        for (var $ = -1, we = F.length; ++$ < we && Qo(K, F[$], 0) > -1; )
          ;
        return $;
      }
      function Kd(F, K) {
        for (var $ = F.length; $-- && Qo(K, F[$], 0) > -1; )
          ;
        return $;
      }
      function wm(F, K) {
        for (var $ = F.length, we = 0; $--; )
          F[$] === K && ++we;
        return we;
      }
      var xm = ac(Bi), Cm = ac(vr);
      function Sm(F) {
        return "\\" + tc[F];
      }
      function _m(F, K) {
        return F == null ? r : F[K];
      }
      function ea(F) {
        return Xl.test(F);
      }
      function Em(F) {
        return Jl.test(F);
      }
      function Rm(F) {
        for (var K, $ = []; !(K = F.next()).done; )
          $.push(K.value);
        return $;
      }
      function cc(F) {
        var K = -1, $ = Array(F.size);
        return F.forEach(function(we, Ae) {
          $[++K] = [Ae, we];
        }), $;
      }
      function Zd(F, K) {
        return function($) {
          return F(K($));
        };
      }
      function qr(F, K) {
        for (var $ = -1, we = F.length, Ae = 0, Je = []; ++$ < we; ) {
          var Tt = F[$];
          (Tt === K || Tt === b) && (F[$] = b, Je[Ae++] = $);
        }
        return Je;
      }
      function Ki(F) {
        var K = -1, $ = Array(F.size);
        return F.forEach(function(we) {
          $[++K] = we;
        }), $;
      }
      function Im(F) {
        var K = -1, $ = Array(F.size);
        return F.forEach(function(we) {
          $[++K] = [we, we];
        }), $;
      }
      function km(F, K, $) {
        for (var we = $ - 1, Ae = F.length; ++we < Ae; )
          if (F[we] === K)
            return we;
        return -1;
      }
      function Mm(F, K, $) {
        for (var we = $ + 1; we--; )
          if (F[we] === K)
            return we;
        return we;
      }
      function ta(F) {
        return ea(F) ? Nm(F) : pm(F);
      }
      function Vn(F) {
        return ea(F) ? Tm(F) : gm(F);
      }
      function jd(F) {
        for (var K = F.length; K-- && Hl.test(F.charAt(K)); )
          ;
        return K;
      }
      var Lm = ac(Fa);
      function Nm(F) {
        for (var K = Da.lastIndex = 0; Da.test(F); )
          ++K;
        return K;
      }
      function Tm(F) {
        return F.match(Da) || [];
      }
      function Am(F) {
        return F.match(Yl) || [];
      }
      var Om = (function F(K) {
        K = K == null ? Nt : na.defaults(Nt.Object(), K, na.pick(Nt, Ql));
        var $ = K.Array, we = K.Date, Ae = K.Error, Je = K.Function, Tt = K.Math, ft = K.Object, uc = K.RegExp, Pm = K.String, In = K.TypeError, Zi = $.prototype, Dm = Je.prototype, ra = ft.prototype, ji = K["__core-js_shared__"], qi = Dm.toString, Qe = ra.hasOwnProperty, Fm = 0, qd = (function() {
          var t = /[^.]+$/.exec(ji && ji.keys && ji.keys.IE_PROTO || "");
          return t ? "Symbol(src)_1." + t : "";
        })(), Yi = ra.toString, Wm = qi.call(ft), Hm = Nt._, $m = uc(
          "^" + qi.call(Qe).replace(Vt, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), Xi = Vi ? K.Buffer : r, Yr = K.Symbol, Ji = K.Uint8Array, Yd = Xi ? Xi.allocUnsafe : r, Qi = Zd(ft.getPrototypeOf, ft), Xd = ft.create, Jd = ra.propertyIsEnumerable, es = Zi.splice, Qd = Yr ? Yr.isConcatSpreadable : r, za = Yr ? Yr.iterator : r, So = Yr ? Yr.toStringTag : r, ts = (function() {
          try {
            var t = ko(ft, "defineProperty");
            return t({}, "", {}), t;
          } catch {
          }
        })(), zm = K.clearTimeout !== Nt.clearTimeout && K.clearTimeout, Bm = we && we.now !== Nt.Date.now && we.now, Vm = K.setTimeout !== Nt.setTimeout && K.setTimeout, ns = Tt.ceil, rs = Tt.floor, dc = ft.getOwnPropertySymbols, Um = Xi ? Xi.isBuffer : r, ef = K.isFinite, Gm = Zi.join, Km = Zd(ft.keys, ft), At = Tt.max, Zt = Tt.min, Zm = we.now, jm = K.parseInt, tf = Tt.random, qm = Zi.reverse, fc = ko(K, "DataView"), Ba = ko(K, "Map"), hc = ko(K, "Promise"), oa = ko(K, "Set"), Va = ko(K, "WeakMap"), Ua = ko(ft, "create"), os = Va && new Va(), aa = {}, Ym = Mo(fc), Xm = Mo(Ba), Jm = Mo(hc), Qm = Mo(oa), e5 = Mo(Va), as = Yr ? Yr.prototype : r, Ga = as ? as.valueOf : r, nf = as ? as.toString : r;
        function S(t) {
          if (Et(t) && !Oe(t) && !(t instanceof Be)) {
            if (t instanceof kn)
              return t;
            if (Qe.call(t, "__wrapped__"))
              return o1(t);
          }
          return new kn(t);
        }
        var ia = /* @__PURE__ */ (function() {
          function t() {
          }
          return function(o) {
            if (!Ct(o))
              return {};
            if (Xd)
              return Xd(o);
            t.prototype = o;
            var i = new t();
            return t.prototype = r, i;
          };
        })();
        function is() {
        }
        function kn(t, o) {
          this.__wrapped__ = t, this.__actions__ = [], this.__chain__ = !!o, this.__index__ = 0, this.__values__ = r;
        }
        S.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          escape: je,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: lt,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          interpolate: Ye,
          /**
           * Used to reference the data object in the template text.
           *
           * @memberOf _.templateSettings
           * @type {string}
           */
          variable: "",
          /**
           * Used to import variables into the compiled template.
           *
           * @memberOf _.templateSettings
           * @type {Object}
           */
          imports: {
            /**
             * A reference to the `lodash` function.
             *
             * @memberOf _.templateSettings.imports
             * @type {Function}
             */
            _: S
          }
        }, S.prototype = is.prototype, S.prototype.constructor = S, kn.prototype = ia(is.prototype), kn.prototype.constructor = kn;
        function Be(t) {
          this.__wrapped__ = t, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = U, this.__views__ = [];
        }
        function t5() {
          var t = new Be(this.__wrapped__);
          return t.__actions__ = ln(this.__actions__), t.__dir__ = this.__dir__, t.__filtered__ = this.__filtered__, t.__iteratees__ = ln(this.__iteratees__), t.__takeCount__ = this.__takeCount__, t.__views__ = ln(this.__views__), t;
        }
        function n5() {
          if (this.__filtered__) {
            var t = new Be(this);
            t.__dir__ = -1, t.__filtered__ = !0;
          } else
            t = this.clone(), t.__dir__ *= -1;
          return t;
        }
        function r5() {
          var t = this.__wrapped__.value(), o = this.__dir__, i = Oe(t), u = o < 0, v = i ? t.length : 0, _ = gv(0, v, this.__views__), k = _.start, T = _.end, W = T - k, Y = u ? T : k - 1, te = this.__iteratees__, ie = te.length, be = 0, Ee = Zt(W, this.__takeCount__);
          if (!i || !u && v == W && Ee == W)
            return If(t, this.__actions__);
          var Me = [];
          e:
            for (; W-- && be < Ee; ) {
              Y += o;
              for (var We = -1, Ie = t[Y]; ++We < ie; ) {
                var ze = te[We], Ge = ze.iteratee, wn = ze.type, en = Ge(Ie);
                if (wn == X)
                  Ie = en;
                else if (!en) {
                  if (wn == le)
                    continue e;
                  break e;
                }
              }
              Me[be++] = Ie;
            }
          return Me;
        }
        Be.prototype = ia(is.prototype), Be.prototype.constructor = Be;
        function _o(t) {
          var o = -1, i = t == null ? 0 : t.length;
          for (this.clear(); ++o < i; ) {
            var u = t[o];
            this.set(u[0], u[1]);
          }
        }
        function o5() {
          this.__data__ = Ua ? Ua(null) : {}, this.size = 0;
        }
        function a5(t) {
          var o = this.has(t) && delete this.__data__[t];
          return this.size -= o ? 1 : 0, o;
        }
        function i5(t) {
          var o = this.__data__;
          if (Ua) {
            var i = o[t];
            return i === p ? r : i;
          }
          return Qe.call(o, t) ? o[t] : r;
        }
        function s5(t) {
          var o = this.__data__;
          return Ua ? o[t] !== r : Qe.call(o, t);
        }
        function l5(t, o) {
          var i = this.__data__;
          return this.size += this.has(t) ? 0 : 1, i[t] = Ua && o === r ? p : o, this;
        }
        _o.prototype.clear = o5, _o.prototype.delete = a5, _o.prototype.get = i5, _o.prototype.has = s5, _o.prototype.set = l5;
        function yr(t) {
          var o = -1, i = t == null ? 0 : t.length;
          for (this.clear(); ++o < i; ) {
            var u = t[o];
            this.set(u[0], u[1]);
          }
        }
        function c5() {
          this.__data__ = [], this.size = 0;
        }
        function u5(t) {
          var o = this.__data__, i = ss(o, t);
          if (i < 0)
            return !1;
          var u = o.length - 1;
          return i == u ? o.pop() : es.call(o, i, 1), --this.size, !0;
        }
        function d5(t) {
          var o = this.__data__, i = ss(o, t);
          return i < 0 ? r : o[i][1];
        }
        function f5(t) {
          return ss(this.__data__, t) > -1;
        }
        function h5(t, o) {
          var i = this.__data__, u = ss(i, t);
          return u < 0 ? (++this.size, i.push([t, o])) : i[u][1] = o, this;
        }
        yr.prototype.clear = c5, yr.prototype.delete = u5, yr.prototype.get = d5, yr.prototype.has = f5, yr.prototype.set = h5;
        function wr(t) {
          var o = -1, i = t == null ? 0 : t.length;
          for (this.clear(); ++o < i; ) {
            var u = t[o];
            this.set(u[0], u[1]);
          }
        }
        function p5() {
          this.size = 0, this.__data__ = {
            hash: new _o(),
            map: new (Ba || yr)(),
            string: new _o()
          };
        }
        function g5(t) {
          var o = ys(this, t).delete(t);
          return this.size -= o ? 1 : 0, o;
        }
        function m5(t) {
          return ys(this, t).get(t);
        }
        function v5(t) {
          return ys(this, t).has(t);
        }
        function b5(t, o) {
          var i = ys(this, t), u = i.size;
          return i.set(t, o), this.size += i.size == u ? 0 : 1, this;
        }
        wr.prototype.clear = p5, wr.prototype.delete = g5, wr.prototype.get = m5, wr.prototype.has = v5, wr.prototype.set = b5;
        function Eo(t) {
          var o = -1, i = t == null ? 0 : t.length;
          for (this.__data__ = new wr(); ++o < i; )
            this.add(t[o]);
        }
        function y5(t) {
          return this.__data__.set(t, p), this;
        }
        function w5(t) {
          return this.__data__.has(t);
        }
        Eo.prototype.add = Eo.prototype.push = y5, Eo.prototype.has = w5;
        function Un(t) {
          var o = this.__data__ = new yr(t);
          this.size = o.size;
        }
        function x5() {
          this.__data__ = new yr(), this.size = 0;
        }
        function C5(t) {
          var o = this.__data__, i = o.delete(t);
          return this.size = o.size, i;
        }
        function S5(t) {
          return this.__data__.get(t);
        }
        function _5(t) {
          return this.__data__.has(t);
        }
        function E5(t, o) {
          var i = this.__data__;
          if (i instanceof yr) {
            var u = i.__data__;
            if (!Ba || u.length < s - 1)
              return u.push([t, o]), this.size = ++i.size, this;
            i = this.__data__ = new wr(u);
          }
          return i.set(t, o), this.size = i.size, this;
        }
        Un.prototype.clear = x5, Un.prototype.delete = C5, Un.prototype.get = S5, Un.prototype.has = _5, Un.prototype.set = E5;
        function rf(t, o) {
          var i = Oe(t), u = !i && Lo(t), v = !i && !u && to(t), _ = !i && !u && !v && ua(t), k = i || u || v || _, T = k ? sc(t.length, Pm) : [], W = T.length;
          for (var Y in t)
            (o || Qe.call(t, Y)) && !(k && // Safari 9 has enumerable `arguments.length` in strict mode.
            (Y == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            v && (Y == "offset" || Y == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            _ && (Y == "buffer" || Y == "byteLength" || Y == "byteOffset") || // Skip index properties.
            Sr(Y, W))) && T.push(Y);
          return T;
        }
        function of(t) {
          var o = t.length;
          return o ? t[_c(0, o - 1)] : r;
        }
        function R5(t, o) {
          return ws(ln(t), Ro(o, 0, t.length));
        }
        function I5(t) {
          return ws(ln(t));
        }
        function pc(t, o, i) {
          (i !== r && !Kn(t[o], i) || i === r && !(o in t)) && tr(t, o, i);
        }
        function Ka(t, o, i) {
          var u = t[o];
          (!(Qe.call(t, o) && Kn(u, i)) || i === r && !(o in t)) && tr(t, o, i);
        }
        function ss(t, o) {
          for (var i = t.length; i--; )
            if (Kn(t[i][0], o))
              return i;
          return -1;
        }
        function k5(t, o, i, u) {
          return Xr(t, function(v, _, k) {
            o(u, v, i(v), k);
          }), u;
        }
        function af(t, o) {
          return t && rr(o, Ft(o), t);
        }
        function M5(t, o) {
          return t && rr(o, un(o), t);
        }
        function tr(t, o, i) {
          o == "__proto__" && ts ? ts(t, o, {
            configurable: !0,
            enumerable: !0,
            value: i,
            writable: !0
          }) : t[o] = i;
        }
        function gc(t, o) {
          for (var i = -1, u = o.length, v = $(u), _ = t == null; ++i < u; )
            v[i] = _ ? r : Yc(t, o[i]);
          return v;
        }
        function Ro(t, o, i) {
          return t === t && (i !== r && (t = t <= i ? t : i), o !== r && (t = t >= o ? t : o)), t;
        }
        function Mn(t, o, i, u, v, _) {
          var k, T = o & w, W = o & g, Y = o & x;
          if (i && (k = v ? i(t, u, v, _) : i(t)), k !== r)
            return k;
          if (!Ct(t))
            return t;
          var te = Oe(t);
          if (te) {
            if (k = vv(t), !T)
              return ln(t, k);
          } else {
            var ie = jt(t), be = ie == Le || ie == qe;
            if (to(t))
              return Lf(t, T);
            if (ie == Ue || ie == Q || be && !v) {
              if (k = W || be ? {} : qf(t), !T)
                return W ? iv(t, M5(k, t)) : av(t, af(k, t));
            } else {
              if (!at[ie])
                return v ? t : {};
              k = bv(t, ie, T);
            }
          }
          _ || (_ = new Un());
          var Ee = _.get(t);
          if (Ee)
            return Ee;
          _.set(t, k), _1(t) ? t.forEach(function(Ie) {
            k.add(Mn(Ie, o, i, Ie, t, _));
          }) : C1(t) && t.forEach(function(Ie, ze) {
            k.set(ze, Mn(Ie, o, i, ze, t, _));
          });
          var Me = Y ? W ? Pc : Oc : W ? un : Ft, We = te ? r : Me(t);
          return Pe(We || t, function(Ie, ze) {
            We && (ze = Ie, Ie = t[ze]), Ka(k, ze, Mn(Ie, o, i, ze, t, _));
          }), k;
        }
        function L5(t) {
          var o = Ft(t);
          return function(i) {
            return sf(i, t, o);
          };
        }
        function sf(t, o, i) {
          var u = i.length;
          if (t == null)
            return !u;
          for (t = ft(t); u--; ) {
            var v = i[u], _ = o[v], k = t[v];
            if (k === r && !(v in t) || !_(k))
              return !1;
          }
          return !0;
        }
        function lf(t, o, i) {
          if (typeof t != "function")
            throw new In(c);
          return Qa(function() {
            t.apply(r, i);
          }, o);
        }
        function Za(t, o, i, u) {
          var v = -1, _ = Mt, k = !0, T = t.length, W = [], Y = o.length;
          if (!T)
            return W;
          i && (o = ct(o, vn(i))), u ? (_ = Bn, k = !1) : o.length >= s && (_ = $a, k = !1, o = new Eo(o));
          e:
            for (; ++v < T; ) {
              var te = t[v], ie = i == null ? te : i(te);
              if (te = u || te !== 0 ? te : 0, k && ie === ie) {
                for (var be = Y; be--; )
                  if (o[be] === ie)
                    continue e;
                W.push(te);
              } else _(o, ie, u) || W.push(te);
            }
          return W;
        }
        var Xr = Pf(nr), cf = Pf(vc, !0);
        function N5(t, o) {
          var i = !0;
          return Xr(t, function(u, v, _) {
            return i = !!o(u, v, _), i;
          }), i;
        }
        function ls(t, o, i) {
          for (var u = -1, v = t.length; ++u < v; ) {
            var _ = t[u], k = o(_);
            if (k != null && (T === r ? k === k && !yn(k) : i(k, T)))
              var T = k, W = _;
          }
          return W;
        }
        function T5(t, o, i, u) {
          var v = t.length;
          for (i = De(i), i < 0 && (i = -i > v ? 0 : v + i), u = u === r || u > v ? v : De(u), u < 0 && (u += v), u = i > u ? 0 : R1(u); i < u; )
            t[i++] = o;
          return t;
        }
        function uf(t, o) {
          var i = [];
          return Xr(t, function(u, v, _) {
            o(u, v, _) && i.push(u);
          }), i;
        }
        function Ut(t, o, i, u, v) {
          var _ = -1, k = t.length;
          for (i || (i = wv), v || (v = []); ++_ < k; ) {
            var T = t[_];
            o > 0 && i(T) ? o > 1 ? Ut(T, o - 1, i, u, v) : Rn(v, T) : u || (v[v.length] = T);
          }
          return v;
        }
        var mc = Df(), df = Df(!0);
        function nr(t, o) {
          return t && mc(t, o, Ft);
        }
        function vc(t, o) {
          return t && df(t, o, Ft);
        }
        function cs(t, o) {
          return Xe(o, function(i) {
            return _r(t[i]);
          });
        }
        function Io(t, o) {
          o = Qr(o, t);
          for (var i = 0, u = o.length; t != null && i < u; )
            t = t[Gn(o[i++])];
          return i && i == u ? t : r;
        }
        function ff(t, o, i) {
          var u = o(t);
          return Oe(t) ? u : Rn(u, i(t));
        }
        function Jt(t) {
          return t == null ? t === r ? Qn : Re : So && So in ft(t) ? pv(t) : Iv(t);
        }
        function bc(t, o) {
          return t > o;
        }
        function A5(t, o) {
          return t != null && Qe.call(t, o);
        }
        function O5(t, o) {
          return t != null && o in ft(t);
        }
        function P5(t, o, i) {
          return t >= Zt(o, i) && t < At(o, i);
        }
        function yc(t, o, i) {
          for (var u = i ? Bn : Mt, v = t[0].length, _ = t.length, k = _, T = $(_), W = 1 / 0, Y = []; k--; ) {
            var te = t[k];
            k && o && (te = ct(te, vn(o))), W = Zt(te.length, W), T[k] = !i && (o || v >= 120 && te.length >= 120) ? new Eo(k && te) : r;
          }
          te = t[0];
          var ie = -1, be = T[0];
          e:
            for (; ++ie < v && Y.length < W; ) {
              var Ee = te[ie], Me = o ? o(Ee) : Ee;
              if (Ee = i || Ee !== 0 ? Ee : 0, !(be ? $a(be, Me) : u(Y, Me, i))) {
                for (k = _; --k; ) {
                  var We = T[k];
                  if (!(We ? $a(We, Me) : u(t[k], Me, i)))
                    continue e;
                }
                be && be.push(Me), Y.push(Ee);
              }
            }
          return Y;
        }
        function D5(t, o, i, u) {
          return nr(t, function(v, _, k) {
            o(u, i(v), _, k);
          }), u;
        }
        function ja(t, o, i) {
          o = Qr(o, t), t = Qf(t, o);
          var u = t == null ? t : t[Gn(Nn(o))];
          return u == null ? r : ye(u, t, i);
        }
        function hf(t) {
          return Et(t) && Jt(t) == Q;
        }
        function F5(t) {
          return Et(t) && Jt(t) == on;
        }
        function W5(t) {
          return Et(t) && Jt(t) == re;
        }
        function qa(t, o, i, u, v) {
          return t === o ? !0 : t == null || o == null || !Et(t) && !Et(o) ? t !== t && o !== o : H5(t, o, i, u, qa, v);
        }
        function H5(t, o, i, u, v, _) {
          var k = Oe(t), T = Oe(o), W = k ? j : jt(t), Y = T ? j : jt(o);
          W = W == Q ? Ue : W, Y = Y == Q ? Ue : Y;
          var te = W == Ue, ie = Y == Ue, be = W == Y;
          if (be && to(t)) {
            if (!to(o))
              return !1;
            k = !0, te = !1;
          }
          if (be && !te)
            return _ || (_ = new Un()), k || ua(t) ? Kf(t, o, i, u, v, _) : fv(t, o, W, i, u, v, _);
          if (!(i & y)) {
            var Ee = te && Qe.call(t, "__wrapped__"), Me = ie && Qe.call(o, "__wrapped__");
            if (Ee || Me) {
              var We = Ee ? t.value() : t, Ie = Me ? o.value() : o;
              return _ || (_ = new Un()), v(We, Ie, i, u, _);
            }
          }
          return be ? (_ || (_ = new Un()), hv(t, o, i, u, v, _)) : !1;
        }
        function $5(t) {
          return Et(t) && jt(t) == vt;
        }
        function wc(t, o, i, u) {
          var v = i.length, _ = v, k = !u;
          if (t == null)
            return !_;
          for (t = ft(t); v--; ) {
            var T = i[v];
            if (k && T[2] ? T[1] !== t[T[0]] : !(T[0] in t))
              return !1;
          }
          for (; ++v < _; ) {
            T = i[v];
            var W = T[0], Y = t[W], te = T[1];
            if (k && T[2]) {
              if (Y === r && !(W in t))
                return !1;
            } else {
              var ie = new Un();
              if (u)
                var be = u(Y, te, W, t, o, ie);
              if (!(be === r ? qa(te, Y, y | E, u, ie) : be))
                return !1;
            }
          }
          return !0;
        }
        function pf(t) {
          if (!Ct(t) || Cv(t))
            return !1;
          var o = _r(t) ? $m : Ur;
          return o.test(Mo(t));
        }
        function z5(t) {
          return Et(t) && Jt(t) == rt;
        }
        function B5(t) {
          return Et(t) && jt(t) == ut;
        }
        function V5(t) {
          return Et(t) && Rs(t.length) && !!dt[Jt(t)];
        }
        function gf(t) {
          return typeof t == "function" ? t : t == null ? dn : typeof t == "object" ? Oe(t) ? bf(t[0], t[1]) : vf(t) : W1(t);
        }
        function xc(t) {
          if (!Ja(t))
            return Km(t);
          var o = [];
          for (var i in ft(t))
            Qe.call(t, i) && i != "constructor" && o.push(i);
          return o;
        }
        function U5(t) {
          if (!Ct(t))
            return Rv(t);
          var o = Ja(t), i = [];
          for (var u in t)
            u == "constructor" && (o || !Qe.call(t, u)) || i.push(u);
          return i;
        }
        function Cc(t, o) {
          return t < o;
        }
        function mf(t, o) {
          var i = -1, u = cn(t) ? $(t.length) : [];
          return Xr(t, function(v, _, k) {
            u[++i] = o(v, _, k);
          }), u;
        }
        function vf(t) {
          var o = Fc(t);
          return o.length == 1 && o[0][2] ? Xf(o[0][0], o[0][1]) : function(i) {
            return i === t || wc(i, t, o);
          };
        }
        function bf(t, o) {
          return Hc(t) && Yf(o) ? Xf(Gn(t), o) : function(i) {
            var u = Yc(i, t);
            return u === r && u === o ? Xc(i, t) : qa(o, u, y | E);
          };
        }
        function us(t, o, i, u, v) {
          t !== o && mc(o, function(_, k) {
            if (v || (v = new Un()), Ct(_))
              G5(t, o, k, i, us, u, v);
            else {
              var T = u ? u(zc(t, k), _, k + "", t, o, v) : r;
              T === r && (T = _), pc(t, k, T);
            }
          }, un);
        }
        function G5(t, o, i, u, v, _, k) {
          var T = zc(t, i), W = zc(o, i), Y = k.get(W);
          if (Y) {
            pc(t, i, Y);
            return;
          }
          var te = _ ? _(T, W, i + "", t, o, k) : r, ie = te === r;
          if (ie) {
            var be = Oe(W), Ee = !be && to(W), Me = !be && !Ee && ua(W);
            te = W, be || Ee || Me ? Oe(T) ? te = T : It(T) ? te = ln(T) : Ee ? (ie = !1, te = Lf(W, !0)) : Me ? (ie = !1, te = Nf(W, !0)) : te = [] : ei(W) || Lo(W) ? (te = T, Lo(T) ? te = I1(T) : (!Ct(T) || _r(T)) && (te = qf(W))) : ie = !1;
          }
          ie && (k.set(W, te), v(te, W, u, _, k), k.delete(W)), pc(t, i, te);
        }
        function yf(t, o) {
          var i = t.length;
          if (i)
            return o += o < 0 ? i : 0, Sr(o, i) ? t[o] : r;
        }
        function wf(t, o, i) {
          o.length ? o = ct(o, function(_) {
            return Oe(_) ? function(k) {
              return Io(k, _.length === 1 ? _[0] : _);
            } : _;
          }) : o = [dn];
          var u = -1;
          o = ct(o, vn(ke()));
          var v = mf(t, function(_, k, T) {
            var W = ct(o, function(Y) {
              return Y(_);
            });
            return { criteria: W, index: ++u, value: _ };
          });
          return bm(v, function(_, k) {
            return ov(_, k, i);
          });
        }
        function K5(t, o) {
          return xf(t, o, function(i, u) {
            return Xc(t, u);
          });
        }
        function xf(t, o, i) {
          for (var u = -1, v = o.length, _ = {}; ++u < v; ) {
            var k = o[u], T = Io(t, k);
            i(T, k) && Ya(_, Qr(k, t), T);
          }
          return _;
        }
        function Z5(t) {
          return function(o) {
            return Io(o, t);
          };
        }
        function Sc(t, o, i, u) {
          var v = u ? vm : Qo, _ = -1, k = o.length, T = t;
          for (t === o && (o = ln(o)), i && (T = ct(t, vn(i))); ++_ < k; )
            for (var W = 0, Y = o[_], te = i ? i(Y) : Y; (W = v(T, te, W, u)) > -1; )
              T !== t && es.call(T, W, 1), es.call(t, W, 1);
          return t;
        }
        function Cf(t, o) {
          for (var i = t ? o.length : 0, u = i - 1; i--; ) {
            var v = o[i];
            if (i == u || v !== _) {
              var _ = v;
              Sr(v) ? es.call(t, v, 1) : Ic(t, v);
            }
          }
          return t;
        }
        function _c(t, o) {
          return t + rs(tf() * (o - t + 1));
        }
        function j5(t, o, i, u) {
          for (var v = -1, _ = At(ns((o - t) / (i || 1)), 0), k = $(_); _--; )
            k[u ? _ : ++v] = t, t += i;
          return k;
        }
        function Ec(t, o) {
          var i = "";
          if (!t || o < 1 || o > H)
            return i;
          do
            o % 2 && (i += t), o = rs(o / 2), o && (t += t);
          while (o);
          return i;
        }
        function He(t, o) {
          return Bc(Jf(t, o, dn), t + "");
        }
        function q5(t) {
          return of(da(t));
        }
        function Y5(t, o) {
          var i = da(t);
          return ws(i, Ro(o, 0, i.length));
        }
        function Ya(t, o, i, u) {
          if (!Ct(t))
            return t;
          o = Qr(o, t);
          for (var v = -1, _ = o.length, k = _ - 1, T = t; T != null && ++v < _; ) {
            var W = Gn(o[v]), Y = i;
            if (W === "__proto__" || W === "constructor" || W === "prototype")
              return t;
            if (v != k) {
              var te = T[W];
              Y = u ? u(te, W, T) : r, Y === r && (Y = Ct(te) ? te : Sr(o[v + 1]) ? [] : {});
            }
            Ka(T, W, Y), T = T[W];
          }
          return t;
        }
        var Sf = os ? function(t, o) {
          return os.set(t, o), t;
        } : dn, X5 = ts ? function(t, o) {
          return ts(t, "toString", {
            configurable: !0,
            enumerable: !1,
            value: Qc(o),
            writable: !0
          });
        } : dn;
        function J5(t) {
          return ws(da(t));
        }
        function Ln(t, o, i) {
          var u = -1, v = t.length;
          o < 0 && (o = -o > v ? 0 : v + o), i = i > v ? v : i, i < 0 && (i += v), v = o > i ? 0 : i - o >>> 0, o >>>= 0;
          for (var _ = $(v); ++u < v; )
            _[u] = t[u + o];
          return _;
        }
        function Q5(t, o) {
          var i;
          return Xr(t, function(u, v, _) {
            return i = o(u, v, _), !i;
          }), !!i;
        }
        function ds(t, o, i) {
          var u = 0, v = t == null ? u : t.length;
          if (typeof o == "number" && o === o && v <= G) {
            for (; u < v; ) {
              var _ = u + v >>> 1, k = t[_];
              k !== null && !yn(k) && (i ? k <= o : k < o) ? u = _ + 1 : v = _;
            }
            return v;
          }
          return Rc(t, o, dn, i);
        }
        function Rc(t, o, i, u) {
          var v = 0, _ = t == null ? 0 : t.length;
          if (_ === 0)
            return 0;
          o = i(o);
          for (var k = o !== o, T = o === null, W = yn(o), Y = o === r; v < _; ) {
            var te = rs((v + _) / 2), ie = i(t[te]), be = ie !== r, Ee = ie === null, Me = ie === ie, We = yn(ie);
            if (k)
              var Ie = u || Me;
            else Y ? Ie = Me && (u || be) : T ? Ie = Me && be && (u || !Ee) : W ? Ie = Me && be && !Ee && (u || !We) : Ee || We ? Ie = !1 : Ie = u ? ie <= o : ie < o;
            Ie ? v = te + 1 : _ = te;
          }
          return Zt(_, B);
        }
        function _f(t, o) {
          for (var i = -1, u = t.length, v = 0, _ = []; ++i < u; ) {
            var k = t[i], T = o ? o(k) : k;
            if (!i || !Kn(T, W)) {
              var W = T;
              _[v++] = k === 0 ? 0 : k;
            }
          }
          return _;
        }
        function Ef(t) {
          return typeof t == "number" ? t : yn(t) ? ae : +t;
        }
        function bn(t) {
          if (typeof t == "string")
            return t;
          if (Oe(t))
            return ct(t, bn) + "";
          if (yn(t))
            return nf ? nf.call(t) : "";
          var o = t + "";
          return o == "0" && 1 / t == -pe ? "-0" : o;
        }
        function Jr(t, o, i) {
          var u = -1, v = Mt, _ = t.length, k = !0, T = [], W = T;
          if (i)
            k = !1, v = Bn;
          else if (_ >= s) {
            var Y = o ? null : uv(t);
            if (Y)
              return Ki(Y);
            k = !1, v = $a, W = new Eo();
          } else
            W = o ? [] : T;
          e:
            for (; ++u < _; ) {
              var te = t[u], ie = o ? o(te) : te;
              if (te = i || te !== 0 ? te : 0, k && ie === ie) {
                for (var be = W.length; be--; )
                  if (W[be] === ie)
                    continue e;
                o && W.push(ie), T.push(te);
              } else v(W, ie, i) || (W !== T && W.push(ie), T.push(te));
            }
          return T;
        }
        function Ic(t, o) {
          o = Qr(o, t);
          var i = -1, u = o.length;
          if (!u)
            return !0;
          for (; ++i < u; ) {
            var v = Gn(o[i]);
            if (v === "__proto__" && !Qe.call(t, "__proto__") || (v === "constructor" || v === "prototype") && i < u - 1)
              return !1;
          }
          var _ = Qf(t, o);
          return _ == null || delete _[Gn(Nn(o))];
        }
        function Rf(t, o, i, u) {
          return Ya(t, o, i(Io(t, o)), u);
        }
        function fs(t, o, i, u) {
          for (var v = t.length, _ = u ? v : -1; (u ? _-- : ++_ < v) && o(t[_], _, t); )
            ;
          return i ? Ln(t, u ? 0 : _, u ? _ + 1 : v) : Ln(t, u ? _ + 1 : 0, u ? v : _);
        }
        function If(t, o) {
          var i = t;
          return i instanceof Be && (i = i.value()), Co(o, function(u, v) {
            return v.func.apply(v.thisArg, Rn([u], v.args));
          }, i);
        }
        function kc(t, o, i) {
          var u = t.length;
          if (u < 2)
            return u ? Jr(t[0]) : [];
          for (var v = -1, _ = $(u); ++v < u; )
            for (var k = t[v], T = -1; ++T < u; )
              T != v && (_[v] = Za(_[v] || k, t[T], o, i));
          return Jr(Ut(_, 1), o, i);
        }
        function kf(t, o, i) {
          for (var u = -1, v = t.length, _ = o.length, k = {}; ++u < v; ) {
            var T = u < _ ? o[u] : r;
            i(k, t[u], T);
          }
          return k;
        }
        function Mc(t) {
          return It(t) ? t : [];
        }
        function Lc(t) {
          return typeof t == "function" ? t : dn;
        }
        function Qr(t, o) {
          return Oe(t) ? t : Hc(t, o) ? [t] : r1(et(t));
        }
        var ev = He;
        function eo(t, o, i) {
          var u = t.length;
          return i = i === r ? u : i, !o && i >= u ? t : Ln(t, o, i);
        }
        var Mf = zm || function(t) {
          return Nt.clearTimeout(t);
        };
        function Lf(t, o) {
          if (o)
            return t.slice();
          var i = t.length, u = Yd ? Yd(i) : new t.constructor(i);
          return t.copy(u), u;
        }
        function Nc(t) {
          var o = new t.constructor(t.byteLength);
          return new Ji(o).set(new Ji(t)), o;
        }
        function tv(t, o) {
          var i = o ? Nc(t.buffer) : t.buffer;
          return new t.constructor(i, t.byteOffset, t.byteLength);
        }
        function nv(t) {
          var o = new t.constructor(t.source, vo.exec(t));
          return o.lastIndex = t.lastIndex, o;
        }
        function rv(t) {
          return Ga ? ft(Ga.call(t)) : {};
        }
        function Nf(t, o) {
          var i = o ? Nc(t.buffer) : t.buffer;
          return new t.constructor(i, t.byteOffset, t.length);
        }
        function Tf(t, o) {
          if (t !== o) {
            var i = t !== r, u = t === null, v = t === t, _ = yn(t), k = o !== r, T = o === null, W = o === o, Y = yn(o);
            if (!T && !Y && !_ && t > o || _ && k && W && !T && !Y || u && k && W || !i && W || !v)
              return 1;
            if (!u && !_ && !Y && t < o || Y && i && v && !u && !_ || T && i && v || !k && v || !W)
              return -1;
          }
          return 0;
        }
        function ov(t, o, i) {
          for (var u = -1, v = t.criteria, _ = o.criteria, k = v.length, T = i.length; ++u < k; ) {
            var W = Tf(v[u], _[u]);
            if (W) {
              if (u >= T)
                return W;
              var Y = i[u];
              return W * (Y == "desc" ? -1 : 1);
            }
          }
          return t.index - o.index;
        }
        function Af(t, o, i, u) {
          for (var v = -1, _ = t.length, k = i.length, T = -1, W = o.length, Y = At(_ - k, 0), te = $(W + Y), ie = !u; ++T < W; )
            te[T] = o[T];
          for (; ++v < k; )
            (ie || v < _) && (te[i[v]] = t[v]);
          for (; Y--; )
            te[T++] = t[v++];
          return te;
        }
        function Of(t, o, i, u) {
          for (var v = -1, _ = t.length, k = -1, T = i.length, W = -1, Y = o.length, te = At(_ - T, 0), ie = $(te + Y), be = !u; ++v < te; )
            ie[v] = t[v];
          for (var Ee = v; ++W < Y; )
            ie[Ee + W] = o[W];
          for (; ++k < T; )
            (be || v < _) && (ie[Ee + i[k]] = t[v++]);
          return ie;
        }
        function ln(t, o) {
          var i = -1, u = t.length;
          for (o || (o = $(u)); ++i < u; )
            o[i] = t[i];
          return o;
        }
        function rr(t, o, i, u) {
          var v = !i;
          i || (i = {});
          for (var _ = -1, k = o.length; ++_ < k; ) {
            var T = o[_], W = u ? u(i[T], t[T], T, i, t) : r;
            W === r && (W = t[T]), v ? tr(i, T, W) : Ka(i, T, W);
          }
          return i;
        }
        function av(t, o) {
          return rr(t, Wc(t), o);
        }
        function iv(t, o) {
          return rr(t, Zf(t), o);
        }
        function hs(t, o) {
          return function(i, u) {
            var v = Oe(i) ? Fe : k5, _ = o ? o() : {};
            return v(i, t, ke(u, 2), _);
          };
        }
        function sa(t) {
          return He(function(o, i) {
            var u = -1, v = i.length, _ = v > 1 ? i[v - 1] : r, k = v > 2 ? i[2] : r;
            for (_ = t.length > 3 && typeof _ == "function" ? (v--, _) : r, k && Qt(i[0], i[1], k) && (_ = v < 3 ? r : _, v = 1), o = ft(o); ++u < v; ) {
              var T = i[u];
              T && t(o, T, u, _);
            }
            return o;
          });
        }
        function Pf(t, o) {
          return function(i, u) {
            if (i == null)
              return i;
            if (!cn(i))
              return t(i, u);
            for (var v = i.length, _ = o ? v : -1, k = ft(i); (o ? _-- : ++_ < v) && u(k[_], _, k) !== !1; )
              ;
            return i;
          };
        }
        function Df(t) {
          return function(o, i, u) {
            for (var v = -1, _ = ft(o), k = u(o), T = k.length; T--; ) {
              var W = k[t ? T : ++v];
              if (i(_[W], W, _) === !1)
                break;
            }
            return o;
          };
        }
        function sv(t, o, i) {
          var u = o & R, v = Xa(t);
          function _() {
            var k = this && this !== Nt && this instanceof _ ? v : t;
            return k.apply(u ? i : this, arguments);
          }
          return _;
        }
        function Ff(t) {
          return function(o) {
            o = et(o);
            var i = ea(o) ? Vn(o) : r, u = i ? i[0] : o.charAt(0), v = i ? eo(i, 1).join("") : o.slice(1);
            return u[t]() + v;
          };
        }
        function la(t) {
          return function(o) {
            return Co(D1(P1(o).replace(jl, "")), t, "");
          };
        }
        function Xa(t) {
          return function() {
            var o = arguments;
            switch (o.length) {
              case 0:
                return new t();
              case 1:
                return new t(o[0]);
              case 2:
                return new t(o[0], o[1]);
              case 3:
                return new t(o[0], o[1], o[2]);
              case 4:
                return new t(o[0], o[1], o[2], o[3]);
              case 5:
                return new t(o[0], o[1], o[2], o[3], o[4]);
              case 6:
                return new t(o[0], o[1], o[2], o[3], o[4], o[5]);
              case 7:
                return new t(o[0], o[1], o[2], o[3], o[4], o[5], o[6]);
            }
            var i = ia(t.prototype), u = t.apply(i, o);
            return Ct(u) ? u : i;
          };
        }
        function lv(t, o, i) {
          var u = Xa(t);
          function v() {
            for (var _ = arguments.length, k = $(_), T = _, W = ca(v); T--; )
              k[T] = arguments[T];
            var Y = _ < 3 && k[0] !== W && k[_ - 1] !== W ? [] : qr(k, W);
            if (_ -= Y.length, _ < i)
              return Bf(
                t,
                o,
                ps,
                v.placeholder,
                r,
                k,
                Y,
                r,
                r,
                i - _
              );
            var te = this && this !== Nt && this instanceof v ? u : t;
            return ye(te, this, k);
          }
          return v;
        }
        function Wf(t) {
          return function(o, i, u) {
            var v = ft(o);
            if (!cn(o)) {
              var _ = ke(i, 3);
              o = Ft(o), i = function(T) {
                return _(v[T], T, v);
              };
            }
            var k = t(o, i, u);
            return k > -1 ? v[_ ? o[k] : k] : r;
          };
        }
        function Hf(t) {
          return Cr(function(o) {
            var i = o.length, u = i, v = kn.prototype.thru;
            for (t && o.reverse(); u--; ) {
              var _ = o[u];
              if (typeof _ != "function")
                throw new In(c);
              if (v && !k && bs(_) == "wrapper")
                var k = new kn([], !0);
            }
            for (u = k ? u : i; ++u < i; ) {
              _ = o[u];
              var T = bs(_), W = T == "wrapper" ? Dc(_) : r;
              W && $c(W[0]) && W[1] == (A | M | O | z) && !W[4].length && W[9] == 1 ? k = k[bs(W[0])].apply(k, W[3]) : k = _.length == 1 && $c(_) ? k[T]() : k.thru(_);
            }
            return function() {
              var Y = arguments, te = Y[0];
              if (k && Y.length == 1 && Oe(te))
                return k.plant(te).value();
              for (var ie = 0, be = i ? o[ie].apply(this, Y) : te; ++ie < i; )
                be = o[ie].call(this, be);
              return be;
            };
          });
        }
        function ps(t, o, i, u, v, _, k, T, W, Y) {
          var te = o & A, ie = o & R, be = o & N, Ee = o & (M | I), Me = o & se, We = be ? r : Xa(t);
          function Ie() {
            for (var ze = arguments.length, Ge = $(ze), wn = ze; wn--; )
              Ge[wn] = arguments[wn];
            if (Ee)
              var en = ca(Ie), xn = wm(Ge, en);
            if (u && (Ge = Af(Ge, u, v, Ee)), _ && (Ge = Of(Ge, _, k, Ee)), ze -= xn, Ee && ze < Y) {
              var kt = qr(Ge, en);
              return Bf(
                t,
                o,
                ps,
                Ie.placeholder,
                i,
                Ge,
                kt,
                T,
                W,
                Y - ze
              );
            }
            var Zn = ie ? i : this, Rr = be ? Zn[t] : t;
            return ze = Ge.length, T ? Ge = kv(Ge, T) : Me && ze > 1 && Ge.reverse(), te && W < ze && (Ge.length = W), this && this !== Nt && this instanceof Ie && (Rr = We || Xa(Rr)), Rr.apply(Zn, Ge);
          }
          return Ie;
        }
        function $f(t, o) {
          return function(i, u) {
            return D5(i, t, o(u), {});
          };
        }
        function gs(t, o) {
          return function(i, u) {
            var v;
            if (i === r && u === r)
              return o;
            if (i !== r && (v = i), u !== r) {
              if (v === r)
                return u;
              typeof i == "string" || typeof u == "string" ? (i = bn(i), u = bn(u)) : (i = Ef(i), u = Ef(u)), v = t(i, u);
            }
            return v;
          };
        }
        function Tc(t) {
          return Cr(function(o) {
            return o = ct(o, vn(ke())), He(function(i) {
              var u = this;
              return t(o, function(v) {
                return ye(v, u, i);
              });
            });
          });
        }
        function ms(t, o) {
          o = o === r ? " " : bn(o);
          var i = o.length;
          if (i < 2)
            return i ? Ec(o, t) : o;
          var u = Ec(o, ns(t / ta(o)));
          return ea(o) ? eo(Vn(u), 0, t).join("") : u.slice(0, t);
        }
        function cv(t, o, i, u) {
          var v = o & R, _ = Xa(t);
          function k() {
            for (var T = -1, W = arguments.length, Y = -1, te = u.length, ie = $(te + W), be = this && this !== Nt && this instanceof k ? _ : t; ++Y < te; )
              ie[Y] = u[Y];
            for (; W--; )
              ie[Y++] = arguments[++T];
            return ye(be, v ? i : this, ie);
          }
          return k;
        }
        function zf(t) {
          return function(o, i, u) {
            return u && typeof u != "number" && Qt(o, i, u) && (i = u = r), o = Er(o), i === r ? (i = o, o = 0) : i = Er(i), u = u === r ? o < i ? 1 : -1 : Er(u), j5(o, i, u, t);
          };
        }
        function vs(t) {
          return function(o, i) {
            return typeof o == "string" && typeof i == "string" || (o = Tn(o), i = Tn(i)), t(o, i);
          };
        }
        function Bf(t, o, i, u, v, _, k, T, W, Y) {
          var te = o & M, ie = te ? k : r, be = te ? r : k, Ee = te ? _ : r, Me = te ? r : _;
          o |= te ? O : D, o &= ~(te ? D : O), o & L || (o &= -4);
          var We = [
            t,
            o,
            v,
            Ee,
            ie,
            Me,
            be,
            T,
            W,
            Y
          ], Ie = i.apply(r, We);
          return $c(t) && e1(Ie, We), Ie.placeholder = u, t1(Ie, t, o);
        }
        function Ac(t) {
          var o = Tt[t];
          return function(i, u) {
            if (i = Tn(i), u = u == null ? 0 : Zt(De(u), 292), u && ef(i)) {
              var v = (et(i) + "e").split("e"), _ = o(v[0] + "e" + (+v[1] + u));
              return v = (et(_) + "e").split("e"), +(v[0] + "e" + (+v[1] - u));
            }
            return o(i);
          };
        }
        var uv = oa && 1 / Ki(new oa([, -0]))[1] == pe ? function(t) {
          return new oa(t);
        } : nu;
        function Vf(t) {
          return function(o) {
            var i = jt(o);
            return i == vt ? cc(o) : i == ut ? Im(o) : ym(o, t(o));
          };
        }
        function xr(t, o, i, u, v, _, k, T) {
          var W = o & N;
          if (!W && typeof t != "function")
            throw new In(c);
          var Y = u ? u.length : 0;
          if (Y || (o &= -97, u = v = r), k = k === r ? k : At(De(k), 0), T = T === r ? T : De(T), Y -= v ? v.length : 0, o & D) {
            var te = u, ie = v;
            u = v = r;
          }
          var be = W ? r : Dc(t), Ee = [
            t,
            o,
            i,
            u,
            v,
            te,
            ie,
            _,
            k,
            T
          ];
          if (be && Ev(Ee, be), t = Ee[0], o = Ee[1], i = Ee[2], u = Ee[3], v = Ee[4], T = Ee[9] = Ee[9] === r ? W ? 0 : t.length : At(Ee[9] - Y, 0), !T && o & (M | I) && (o &= -25), !o || o == R)
            var Me = sv(t, o, i);
          else o == M || o == I ? Me = lv(t, o, T) : (o == O || o == (R | O)) && !v.length ? Me = cv(t, o, i, u) : Me = ps.apply(r, Ee);
          var We = be ? Sf : e1;
          return t1(We(Me, Ee), t, o);
        }
        function Uf(t, o, i, u) {
          return t === r || Kn(t, ra[i]) && !Qe.call(u, i) ? o : t;
        }
        function Gf(t, o, i, u, v, _) {
          return Ct(t) && Ct(o) && (_.set(o, t), us(t, o, r, Gf, _), _.delete(o)), t;
        }
        function dv(t) {
          return ei(t) ? r : t;
        }
        function Kf(t, o, i, u, v, _) {
          var k = i & y, T = t.length, W = o.length;
          if (T != W && !(k && W > T))
            return !1;
          var Y = _.get(t), te = _.get(o);
          if (Y && te)
            return Y == o && te == t;
          var ie = -1, be = !0, Ee = i & E ? new Eo() : r;
          for (_.set(t, o), _.set(o, t); ++ie < T; ) {
            var Me = t[ie], We = o[ie];
            if (u)
              var Ie = k ? u(We, Me, ie, o, t, _) : u(Me, We, ie, t, o, _);
            if (Ie !== r) {
              if (Ie)
                continue;
              be = !1;
              break;
            }
            if (Ee) {
              if (!rc(o, function(ze, Ge) {
                if (!$a(Ee, Ge) && (Me === ze || v(Me, ze, i, u, _)))
                  return Ee.push(Ge);
              })) {
                be = !1;
                break;
              }
            } else if (!(Me === We || v(Me, We, i, u, _))) {
              be = !1;
              break;
            }
          }
          return _.delete(t), _.delete(o), be;
        }
        function fv(t, o, i, u, v, _, k) {
          switch (i) {
            case an:
              if (t.byteLength != o.byteLength || t.byteOffset != o.byteOffset)
                return !1;
              t = t.buffer, o = o.buffer;
            case on:
              return !(t.byteLength != o.byteLength || !_(new Ji(t), new Ji(o)));
            case he:
            case re:
            case $t:
              return Kn(+t, +o);
            case ee:
              return t.name == o.name && t.message == o.message;
            case rt:
            case st:
              return t == o + "";
            case vt:
              var T = cc;
            case ut:
              var W = u & y;
              if (T || (T = Ki), t.size != o.size && !W)
                return !1;
              var Y = k.get(t);
              if (Y)
                return Y == o;
              u |= E, k.set(t, o);
              var te = Kf(T(t), T(o), u, v, _, k);
              return k.delete(t), te;
            case pt:
              if (Ga)
                return Ga.call(t) == Ga.call(o);
          }
          return !1;
        }
        function hv(t, o, i, u, v, _) {
          var k = i & y, T = Oc(t), W = T.length, Y = Oc(o), te = Y.length;
          if (W != te && !k)
            return !1;
          for (var ie = W; ie--; ) {
            var be = T[ie];
            if (!(k ? be in o : Qe.call(o, be)))
              return !1;
          }
          var Ee = _.get(t), Me = _.get(o);
          if (Ee && Me)
            return Ee == o && Me == t;
          var We = !0;
          _.set(t, o), _.set(o, t);
          for (var Ie = k; ++ie < W; ) {
            be = T[ie];
            var ze = t[be], Ge = o[be];
            if (u)
              var wn = k ? u(Ge, ze, be, o, t, _) : u(ze, Ge, be, t, o, _);
            if (!(wn === r ? ze === Ge || v(ze, Ge, i, u, _) : wn)) {
              We = !1;
              break;
            }
            Ie || (Ie = be == "constructor");
          }
          if (We && !Ie) {
            var en = t.constructor, xn = o.constructor;
            en != xn && "constructor" in t && "constructor" in o && !(typeof en == "function" && en instanceof en && typeof xn == "function" && xn instanceof xn) && (We = !1);
          }
          return _.delete(t), _.delete(o), We;
        }
        function Cr(t) {
          return Bc(Jf(t, r, s1), t + "");
        }
        function Oc(t) {
          return ff(t, Ft, Wc);
        }
        function Pc(t) {
          return ff(t, un, Zf);
        }
        var Dc = os ? function(t) {
          return os.get(t);
        } : nu;
        function bs(t) {
          for (var o = t.name + "", i = aa[o], u = Qe.call(aa, o) ? i.length : 0; u--; ) {
            var v = i[u], _ = v.func;
            if (_ == null || _ == t)
              return v.name;
          }
          return o;
        }
        function ca(t) {
          var o = Qe.call(S, "placeholder") ? S : t;
          return o.placeholder;
        }
        function ke() {
          var t = S.iteratee || eu;
          return t = t === eu ? gf : t, arguments.length ? t(arguments[0], arguments[1]) : t;
        }
        function ys(t, o) {
          var i = t.__data__;
          return xv(o) ? i[typeof o == "string" ? "string" : "hash"] : i.map;
        }
        function Fc(t) {
          for (var o = Ft(t), i = o.length; i--; ) {
            var u = o[i], v = t[u];
            o[i] = [u, v, Yf(v)];
          }
          return o;
        }
        function ko(t, o) {
          var i = _m(t, o);
          return pf(i) ? i : r;
        }
        function pv(t) {
          var o = Qe.call(t, So), i = t[So];
          try {
            t[So] = r;
            var u = !0;
          } catch {
          }
          var v = Yi.call(t);
          return u && (o ? t[So] = i : delete t[So]), v;
        }
        var Wc = dc ? function(t) {
          return t == null ? [] : (t = ft(t), Xe(dc(t), function(o) {
            return Jd.call(t, o);
          }));
        } : ru, Zf = dc ? function(t) {
          for (var o = []; t; )
            Rn(o, Wc(t)), t = Qi(t);
          return o;
        } : ru, jt = Jt;
        (fc && jt(new fc(new ArrayBuffer(1))) != an || Ba && jt(new Ba()) != vt || hc && jt(hc.resolve()) != zt || oa && jt(new oa()) != ut || Va && jt(new Va()) != bt) && (jt = function(t) {
          var o = Jt(t), i = o == Ue ? t.constructor : r, u = i ? Mo(i) : "";
          if (u)
            switch (u) {
              case Ym:
                return an;
              case Xm:
                return vt;
              case Jm:
                return zt;
              case Qm:
                return ut;
              case e5:
                return bt;
            }
          return o;
        });
        function gv(t, o, i) {
          for (var u = -1, v = i.length; ++u < v; ) {
            var _ = i[u], k = _.size;
            switch (_.type) {
              case "drop":
                t += k;
                break;
              case "dropRight":
                o -= k;
                break;
              case "take":
                o = Zt(o, t + k);
                break;
              case "takeRight":
                t = At(t, o - k);
                break;
            }
          }
          return { start: t, end: o };
        }
        function mv(t) {
          var o = t.match(Br);
          return o ? o[1].split(Vr) : [];
        }
        function jf(t, o, i) {
          o = Qr(o, t);
          for (var u = -1, v = o.length, _ = !1; ++u < v; ) {
            var k = Gn(o[u]);
            if (!(_ = t != null && i(t, k)))
              break;
            t = t[k];
          }
          return _ || ++u != v ? _ : (v = t == null ? 0 : t.length, !!v && Rs(v) && Sr(k, v) && (Oe(t) || Lo(t)));
        }
        function vv(t) {
          var o = t.length, i = new t.constructor(o);
          return o && typeof t[0] == "string" && Qe.call(t, "index") && (i.index = t.index, i.input = t.input), i;
        }
        function qf(t) {
          return typeof t.constructor == "function" && !Ja(t) ? ia(Qi(t)) : {};
        }
        function bv(t, o, i) {
          var u = t.constructor;
          switch (o) {
            case on:
              return Nc(t);
            case he:
            case re:
              return new u(+t);
            case an:
              return tv(t, i);
            case ot:
            case Wr:
            case qt:
            case Wn:
            case Yt:
            case pr:
            case gn:
            case gr:
            case Hn:
              return Nf(t, i);
            case vt:
              return new u();
            case $t:
            case st:
              return new u(t);
            case rt:
              return nv(t);
            case ut:
              return new u();
            case pt:
              return rv(t);
          }
        }
        function yv(t, o) {
          var i = o.length;
          if (!i)
            return t;
          var u = i - 1;
          return o[u] = (i > 1 ? "& " : "") + o[u], o = o.join(i > 2 ? ", " : " "), t.replace($l, `{
/* [wrapped with ` + o + `] */
`);
        }
        function wv(t) {
          return Oe(t) || Lo(t) || !!(Qd && t && t[Qd]);
        }
        function Sr(t, o) {
          var i = typeof t;
          return o = o ?? H, !!o && (i == "number" || i != "symbol" && ka.test(t)) && t > -1 && t % 1 == 0 && t < o;
        }
        function Qt(t, o, i) {
          if (!Ct(i))
            return !1;
          var u = typeof o;
          return (u == "number" ? cn(i) && Sr(o, i.length) : u == "string" && o in i) ? Kn(i[o], t) : !1;
        }
        function Hc(t, o) {
          if (Oe(t))
            return !1;
          var i = typeof t;
          return i == "number" || i == "symbol" || i == "boolean" || t == null || yn(t) ? !0 : xt.test(t) || !Kt.test(t) || o != null && t in ft(o);
        }
        function xv(t) {
          var o = typeof t;
          return o == "string" || o == "number" || o == "symbol" || o == "boolean" ? t !== "__proto__" : t === null;
        }
        function $c(t) {
          var o = bs(t), i = S[o];
          if (typeof i != "function" || !(o in Be.prototype))
            return !1;
          if (t === i)
            return !0;
          var u = Dc(i);
          return !!u && t === u[0];
        }
        function Cv(t) {
          return !!qd && qd in t;
        }
        var Sv = ji ? _r : ou;
        function Ja(t) {
          var o = t && t.constructor, i = typeof o == "function" && o.prototype || ra;
          return t === i;
        }
        function Yf(t) {
          return t === t && !Ct(t);
        }
        function Xf(t, o) {
          return function(i) {
            return i == null ? !1 : i[t] === o && (o !== r || t in ft(i));
          };
        }
        function _v(t) {
          var o = _s(t, function(u) {
            return i.size === m && i.clear(), u;
          }), i = o.cache;
          return o;
        }
        function Ev(t, o) {
          var i = t[1], u = o[1], v = i | u, _ = v < (R | N | A), k = u == A && i == M || u == A && i == z && t[7].length <= o[8] || u == (A | z) && o[7].length <= o[8] && i == M;
          if (!(_ || k))
            return t;
          u & R && (t[2] = o[2], v |= i & R ? 0 : L);
          var T = o[3];
          if (T) {
            var W = t[3];
            t[3] = W ? Af(W, T, o[4]) : T, t[4] = W ? qr(t[3], b) : o[4];
          }
          return T = o[5], T && (W = t[5], t[5] = W ? Of(W, T, o[6]) : T, t[6] = W ? qr(t[5], b) : o[6]), T = o[7], T && (t[7] = T), u & A && (t[8] = t[8] == null ? o[8] : Zt(t[8], o[8])), t[9] == null && (t[9] = o[9]), t[0] = o[0], t[1] = v, t;
        }
        function Rv(t) {
          var o = [];
          if (t != null)
            for (var i in ft(t))
              o.push(i);
          return o;
        }
        function Iv(t) {
          return Yi.call(t);
        }
        function Jf(t, o, i) {
          return o = At(o === r ? t.length - 1 : o, 0), function() {
            for (var u = arguments, v = -1, _ = At(u.length - o, 0), k = $(_); ++v < _; )
              k[v] = u[o + v];
            v = -1;
            for (var T = $(o + 1); ++v < o; )
              T[v] = u[v];
            return T[o] = i(k), ye(t, this, T);
          };
        }
        function Qf(t, o) {
          return o.length < 2 ? t : Io(t, Ln(o, 0, -1));
        }
        function kv(t, o) {
          for (var i = t.length, u = Zt(o.length, i), v = ln(t); u--; ) {
            var _ = o[u];
            t[u] = Sr(_, i) ? v[_] : r;
          }
          return t;
        }
        function zc(t, o) {
          if (!(o === "constructor" && typeof t[o] == "function") && o != "__proto__")
            return t[o];
        }
        var e1 = n1(Sf), Qa = Vm || function(t, o) {
          return Nt.setTimeout(t, o);
        }, Bc = n1(X5);
        function t1(t, o, i) {
          var u = o + "";
          return Bc(t, yv(u, Mv(mv(u), i)));
        }
        function n1(t) {
          var o = 0, i = 0;
          return function() {
            var u = Zm(), v = Z - (u - i);
            if (i = u, v > 0) {
              if (++o >= ne)
                return arguments[0];
            } else
              o = 0;
            return t.apply(r, arguments);
          };
        }
        function ws(t, o) {
          var i = -1, u = t.length, v = u - 1;
          for (o = o === r ? u : o; ++i < o; ) {
            var _ = _c(i, v), k = t[_];
            t[_] = t[i], t[i] = k;
          }
          return t.length = o, t;
        }
        var r1 = _v(function(t) {
          var o = [];
          return t.charCodeAt(0) === 46 && o.push(""), t.replace(Bt, function(i, u, v, _) {
            o.push(v ? _.replace(Ia, "$1") : u || i);
          }), o;
        });
        function Gn(t) {
          if (typeof t == "string" || yn(t))
            return t;
          var o = t + "";
          return o == "0" && 1 / t == -pe ? "-0" : o;
        }
        function Mo(t) {
          if (t != null) {
            try {
              return qi.call(t);
            } catch {
            }
            try {
              return t + "";
            } catch {
            }
          }
          return "";
        }
        function Mv(t, o) {
          return Pe(J, function(i) {
            var u = "_." + i[0];
            o & i[1] && !Mt(t, u) && t.push(u);
          }), t.sort();
        }
        function o1(t) {
          if (t instanceof Be)
            return t.clone();
          var o = new kn(t.__wrapped__, t.__chain__);
          return o.__actions__ = ln(t.__actions__), o.__index__ = t.__index__, o.__values__ = t.__values__, o;
        }
        function Lv(t, o, i) {
          (i ? Qt(t, o, i) : o === r) ? o = 1 : o = At(De(o), 0);
          var u = t == null ? 0 : t.length;
          if (!u || o < 1)
            return [];
          for (var v = 0, _ = 0, k = $(ns(u / o)); v < u; )
            k[_++] = Ln(t, v, v += o);
          return k;
        }
        function Nv(t) {
          for (var o = -1, i = t == null ? 0 : t.length, u = 0, v = []; ++o < i; ) {
            var _ = t[o];
            _ && (v[u++] = _);
          }
          return v;
        }
        function Tv() {
          var t = arguments.length;
          if (!t)
            return [];
          for (var o = $(t - 1), i = arguments[0], u = t; u--; )
            o[u - 1] = arguments[u];
          return Rn(Oe(i) ? ln(i) : [i], Ut(o, 1));
        }
        var Av = He(function(t, o) {
          return It(t) ? Za(t, Ut(o, 1, It, !0)) : [];
        }), Ov = He(function(t, o) {
          var i = Nn(o);
          return It(i) && (i = r), It(t) ? Za(t, Ut(o, 1, It, !0), ke(i, 2)) : [];
        }), Pv = He(function(t, o) {
          var i = Nn(o);
          return It(i) && (i = r), It(t) ? Za(t, Ut(o, 1, It, !0), r, i) : [];
        });
        function Dv(t, o, i) {
          var u = t == null ? 0 : t.length;
          return u ? (o = i || o === r ? 1 : De(o), Ln(t, o < 0 ? 0 : o, u)) : [];
        }
        function Fv(t, o, i) {
          var u = t == null ? 0 : t.length;
          return u ? (o = i || o === r ? 1 : De(o), o = u - o, Ln(t, 0, o < 0 ? 0 : o)) : [];
        }
        function Wv(t, o) {
          return t && t.length ? fs(t, ke(o, 3), !0, !0) : [];
        }
        function Hv(t, o) {
          return t && t.length ? fs(t, ke(o, 3), !0) : [];
        }
        function $v(t, o, i, u) {
          var v = t == null ? 0 : t.length;
          return v ? (i && typeof i != "number" && Qt(t, o, i) && (i = 0, u = v), T5(t, o, i, u)) : [];
        }
        function a1(t, o, i) {
          var u = t == null ? 0 : t.length;
          if (!u)
            return -1;
          var v = i == null ? 0 : De(i);
          return v < 0 && (v = At(u + v, 0)), Gi(t, ke(o, 3), v);
        }
        function i1(t, o, i) {
          var u = t == null ? 0 : t.length;
          if (!u)
            return -1;
          var v = u - 1;
          return i !== r && (v = De(i), v = i < 0 ? At(u + v, 0) : Zt(v, u - 1)), Gi(t, ke(o, 3), v, !0);
        }
        function s1(t) {
          var o = t == null ? 0 : t.length;
          return o ? Ut(t, 1) : [];
        }
        function zv(t) {
          var o = t == null ? 0 : t.length;
          return o ? Ut(t, pe) : [];
        }
        function Bv(t, o) {
          var i = t == null ? 0 : t.length;
          return i ? (o = o === r ? 1 : De(o), Ut(t, o)) : [];
        }
        function Vv(t) {
          for (var o = -1, i = t == null ? 0 : t.length, u = {}; ++o < i; ) {
            var v = t[o];
            tr(u, v[0], v[1]);
          }
          return u;
        }
        function l1(t) {
          return t && t.length ? t[0] : r;
        }
        function Uv(t, o, i) {
          var u = t == null ? 0 : t.length;
          if (!u)
            return -1;
          var v = i == null ? 0 : De(i);
          return v < 0 && (v = At(u + v, 0)), Qo(t, o, v);
        }
        function Gv(t) {
          var o = t == null ? 0 : t.length;
          return o ? Ln(t, 0, -1) : [];
        }
        var Kv = He(function(t) {
          var o = ct(t, Mc);
          return o.length && o[0] === t[0] ? yc(o) : [];
        }), Zv = He(function(t) {
          var o = Nn(t), i = ct(t, Mc);
          return o === Nn(i) ? o = r : i.pop(), i.length && i[0] === t[0] ? yc(i, ke(o, 2)) : [];
        }), jv = He(function(t) {
          var o = Nn(t), i = ct(t, Mc);
          return o = typeof o == "function" ? o : r, o && i.pop(), i.length && i[0] === t[0] ? yc(i, r, o) : [];
        });
        function qv(t, o) {
          return t == null ? "" : Gm.call(t, o);
        }
        function Nn(t) {
          var o = t == null ? 0 : t.length;
          return o ? t[o - 1] : r;
        }
        function Yv(t, o, i) {
          var u = t == null ? 0 : t.length;
          if (!u)
            return -1;
          var v = u;
          return i !== r && (v = De(i), v = v < 0 ? At(u + v, 0) : Zt(v, u - 1)), o === o ? Mm(t, o, v) : Gi(t, zd, v, !0);
        }
        function Xv(t, o) {
          return t && t.length ? yf(t, De(o)) : r;
        }
        var Jv = He(c1);
        function c1(t, o) {
          return t && t.length && o && o.length ? Sc(t, o) : t;
        }
        function Qv(t, o, i) {
          return t && t.length && o && o.length ? Sc(t, o, ke(i, 2)) : t;
        }
        function e4(t, o, i) {
          return t && t.length && o && o.length ? Sc(t, o, r, i) : t;
        }
        var t4 = Cr(function(t, o) {
          var i = t == null ? 0 : t.length, u = gc(t, o);
          return Cf(t, ct(o, function(v) {
            return Sr(v, i) ? +v : v;
          }).sort(Tf)), u;
        });
        function n4(t, o) {
          var i = [];
          if (!(t && t.length))
            return i;
          var u = -1, v = [], _ = t.length;
          for (o = ke(o, 3); ++u < _; ) {
            var k = t[u];
            o(k, u, t) && (i.push(k), v.push(u));
          }
          return Cf(t, v), i;
        }
        function Vc(t) {
          return t == null ? t : qm.call(t);
        }
        function r4(t, o, i) {
          var u = t == null ? 0 : t.length;
          return u ? (i && typeof i != "number" && Qt(t, o, i) ? (o = 0, i = u) : (o = o == null ? 0 : De(o), i = i === r ? u : De(i)), Ln(t, o, i)) : [];
        }
        function o4(t, o) {
          return ds(t, o);
        }
        function a4(t, o, i) {
          return Rc(t, o, ke(i, 2));
        }
        function i4(t, o) {
          var i = t == null ? 0 : t.length;
          if (i) {
            var u = ds(t, o);
            if (u < i && Kn(t[u], o))
              return u;
          }
          return -1;
        }
        function s4(t, o) {
          return ds(t, o, !0);
        }
        function l4(t, o, i) {
          return Rc(t, o, ke(i, 2), !0);
        }
        function c4(t, o) {
          var i = t == null ? 0 : t.length;
          if (i) {
            var u = ds(t, o, !0) - 1;
            if (Kn(t[u], o))
              return u;
          }
          return -1;
        }
        function u4(t) {
          return t && t.length ? _f(t) : [];
        }
        function d4(t, o) {
          return t && t.length ? _f(t, ke(o, 2)) : [];
        }
        function f4(t) {
          var o = t == null ? 0 : t.length;
          return o ? Ln(t, 1, o) : [];
        }
        function h4(t, o, i) {
          return t && t.length ? (o = i || o === r ? 1 : De(o), Ln(t, 0, o < 0 ? 0 : o)) : [];
        }
        function p4(t, o, i) {
          var u = t == null ? 0 : t.length;
          return u ? (o = i || o === r ? 1 : De(o), o = u - o, Ln(t, o < 0 ? 0 : o, u)) : [];
        }
        function g4(t, o) {
          return t && t.length ? fs(t, ke(o, 3), !1, !0) : [];
        }
        function m4(t, o) {
          return t && t.length ? fs(t, ke(o, 3)) : [];
        }
        var v4 = He(function(t) {
          return Jr(Ut(t, 1, It, !0));
        }), b4 = He(function(t) {
          var o = Nn(t);
          return It(o) && (o = r), Jr(Ut(t, 1, It, !0), ke(o, 2));
        }), y4 = He(function(t) {
          var o = Nn(t);
          return o = typeof o == "function" ? o : r, Jr(Ut(t, 1, It, !0), r, o);
        });
        function w4(t) {
          return t && t.length ? Jr(t) : [];
        }
        function x4(t, o) {
          return t && t.length ? Jr(t, ke(o, 2)) : [];
        }
        function C4(t, o) {
          return o = typeof o == "function" ? o : r, t && t.length ? Jr(t, r, o) : [];
        }
        function Uc(t) {
          if (!(t && t.length))
            return [];
          var o = 0;
          return t = Xe(t, function(i) {
            if (It(i))
              return o = At(i.length, o), !0;
          }), sc(o, function(i) {
            return ct(t, oc(i));
          });
        }
        function u1(t, o) {
          if (!(t && t.length))
            return [];
          var i = Uc(t);
          return o == null ? i : ct(i, function(u) {
            return ye(o, r, u);
          });
        }
        var S4 = He(function(t, o) {
          return It(t) ? Za(t, o) : [];
        }), _4 = He(function(t) {
          return kc(Xe(t, It));
        }), E4 = He(function(t) {
          var o = Nn(t);
          return It(o) && (o = r), kc(Xe(t, It), ke(o, 2));
        }), R4 = He(function(t) {
          var o = Nn(t);
          return o = typeof o == "function" ? o : r, kc(Xe(t, It), r, o);
        }), I4 = He(Uc);
        function k4(t, o) {
          return kf(t || [], o || [], Ka);
        }
        function M4(t, o) {
          return kf(t || [], o || [], Ya);
        }
        var L4 = He(function(t) {
          var o = t.length, i = o > 1 ? t[o - 1] : r;
          return i = typeof i == "function" ? (t.pop(), i) : r, u1(t, i);
        });
        function d1(t) {
          var o = S(t);
          return o.__chain__ = !0, o;
        }
        function N4(t, o) {
          return o(t), t;
        }
        function xs(t, o) {
          return o(t);
        }
        var T4 = Cr(function(t) {
          var o = t.length, i = o ? t[0] : 0, u = this.__wrapped__, v = function(_) {
            return gc(_, t);
          };
          return o > 1 || this.__actions__.length || !(u instanceof Be) || !Sr(i) ? this.thru(v) : (u = u.slice(i, +i + (o ? 1 : 0)), u.__actions__.push({
            func: xs,
            args: [v],
            thisArg: r
          }), new kn(u, this.__chain__).thru(function(_) {
            return o && !_.length && _.push(r), _;
          }));
        });
        function A4() {
          return d1(this);
        }
        function O4() {
          return new kn(this.value(), this.__chain__);
        }
        function P4() {
          this.__values__ === r && (this.__values__ = E1(this.value()));
          var t = this.__index__ >= this.__values__.length, o = t ? r : this.__values__[this.__index__++];
          return { done: t, value: o };
        }
        function D4() {
          return this;
        }
        function F4(t) {
          for (var o, i = this; i instanceof is; ) {
            var u = o1(i);
            u.__index__ = 0, u.__values__ = r, o ? v.__wrapped__ = u : o = u;
            var v = u;
            i = i.__wrapped__;
          }
          return v.__wrapped__ = t, o;
        }
        function W4() {
          var t = this.__wrapped__;
          if (t instanceof Be) {
            var o = t;
            return this.__actions__.length && (o = new Be(this)), o = o.reverse(), o.__actions__.push({
              func: xs,
              args: [Vc],
              thisArg: r
            }), new kn(o, this.__chain__);
          }
          return this.thru(Vc);
        }
        function H4() {
          return If(this.__wrapped__, this.__actions__);
        }
        var $4 = hs(function(t, o, i) {
          Qe.call(t, i) ? ++t[i] : tr(t, i, 1);
        });
        function z4(t, o, i) {
          var u = Oe(t) ? gt : N5;
          return i && Qt(t, o, i) && (o = r), u(t, ke(o, 3));
        }
        function B4(t, o) {
          var i = Oe(t) ? Xe : uf;
          return i(t, ke(o, 3));
        }
        var V4 = Wf(a1), U4 = Wf(i1);
        function G4(t, o) {
          return Ut(Cs(t, o), 1);
        }
        function K4(t, o) {
          return Ut(Cs(t, o), pe);
        }
        function Z4(t, o, i) {
          return i = i === r ? 1 : De(i), Ut(Cs(t, o), i);
        }
        function f1(t, o) {
          var i = Oe(t) ? Pe : Xr;
          return i(t, ke(o, 3));
        }
        function h1(t, o) {
          var i = Oe(t) ? it : cf;
          return i(t, ke(o, 3));
        }
        var j4 = hs(function(t, o, i) {
          Qe.call(t, i) ? t[i].push(o) : tr(t, i, [o]);
        });
        function q4(t, o, i, u) {
          t = cn(t) ? t : da(t), i = i && !u ? De(i) : 0;
          var v = t.length;
          return i < 0 && (i = At(v + i, 0)), Is(t) ? i <= v && t.indexOf(o, i) > -1 : !!v && Qo(t, o, i) > -1;
        }
        var Y4 = He(function(t, o, i) {
          var u = -1, v = typeof o == "function", _ = cn(t) ? $(t.length) : [];
          return Xr(t, function(k) {
            _[++u] = v ? ye(o, k, i) : ja(k, o, i);
          }), _;
        }), X4 = hs(function(t, o, i) {
          tr(t, i, o);
        });
        function Cs(t, o) {
          var i = Oe(t) ? ct : mf;
          return i(t, ke(o, 3));
        }
        function J4(t, o, i, u) {
          return t == null ? [] : (Oe(o) || (o = o == null ? [] : [o]), i = u ? r : i, Oe(i) || (i = i == null ? [] : [i]), wf(t, o, i));
        }
        var Q4 = hs(function(t, o, i) {
          t[i ? 0 : 1].push(o);
        }, function() {
          return [[], []];
        });
        function e3(t, o, i) {
          var u = Oe(t) ? Co : Vd, v = arguments.length < 3;
          return u(t, ke(o, 4), i, v, Xr);
        }
        function t3(t, o, i) {
          var u = Oe(t) ? hm : Vd, v = arguments.length < 3;
          return u(t, ke(o, 4), i, v, cf);
        }
        function n3(t, o) {
          var i = Oe(t) ? Xe : uf;
          return i(t, Es(ke(o, 3)));
        }
        function r3(t) {
          var o = Oe(t) ? of : q5;
          return o(t);
        }
        function o3(t, o, i) {
          (i ? Qt(t, o, i) : o === r) ? o = 1 : o = De(o);
          var u = Oe(t) ? R5 : Y5;
          return u(t, o);
        }
        function a3(t) {
          var o = Oe(t) ? I5 : J5;
          return o(t);
        }
        function i3(t) {
          if (t == null)
            return 0;
          if (cn(t))
            return Is(t) ? ta(t) : t.length;
          var o = jt(t);
          return o == vt || o == ut ? t.size : xc(t).length;
        }
        function s3(t, o, i) {
          var u = Oe(t) ? rc : Q5;
          return i && Qt(t, o, i) && (o = r), u(t, ke(o, 3));
        }
        var l3 = He(function(t, o) {
          if (t == null)
            return [];
          var i = o.length;
          return i > 1 && Qt(t, o[0], o[1]) ? o = [] : i > 2 && Qt(o[0], o[1], o[2]) && (o = [o[0]]), wf(t, Ut(o, 1), []);
        }), Ss = Bm || function() {
          return Nt.Date.now();
        };
        function c3(t, o) {
          if (typeof o != "function")
            throw new In(c);
          return t = De(t), function() {
            if (--t < 1)
              return o.apply(this, arguments);
          };
        }
        function p1(t, o, i) {
          return o = i ? r : o, o = t && o == null ? t.length : o, xr(t, A, r, r, r, r, o);
        }
        function g1(t, o) {
          var i;
          if (typeof o != "function")
            throw new In(c);
          return t = De(t), function() {
            return --t > 0 && (i = o.apply(this, arguments)), t <= 1 && (o = r), i;
          };
        }
        var Gc = He(function(t, o, i) {
          var u = R;
          if (i.length) {
            var v = qr(i, ca(Gc));
            u |= O;
          }
          return xr(t, u, o, i, v);
        }), m1 = He(function(t, o, i) {
          var u = R | N;
          if (i.length) {
            var v = qr(i, ca(m1));
            u |= O;
          }
          return xr(o, u, t, i, v);
        });
        function v1(t, o, i) {
          o = i ? r : o;
          var u = xr(t, M, r, r, r, r, r, o);
          return u.placeholder = v1.placeholder, u;
        }
        function b1(t, o, i) {
          o = i ? r : o;
          var u = xr(t, I, r, r, r, r, r, o);
          return u.placeholder = b1.placeholder, u;
        }
        function y1(t, o, i) {
          var u, v, _, k, T, W, Y = 0, te = !1, ie = !1, be = !0;
          if (typeof t != "function")
            throw new In(c);
          o = Tn(o) || 0, Ct(i) && (te = !!i.leading, ie = "maxWait" in i, _ = ie ? At(Tn(i.maxWait) || 0, o) : _, be = "trailing" in i ? !!i.trailing : be);
          function Ee(kt) {
            var Zn = u, Rr = v;
            return u = v = r, Y = kt, k = t.apply(Rr, Zn), k;
          }
          function Me(kt) {
            return Y = kt, T = Qa(ze, o), te ? Ee(kt) : k;
          }
          function We(kt) {
            var Zn = kt - W, Rr = kt - Y, H1 = o - Zn;
            return ie ? Zt(H1, _ - Rr) : H1;
          }
          function Ie(kt) {
            var Zn = kt - W, Rr = kt - Y;
            return W === r || Zn >= o || Zn < 0 || ie && Rr >= _;
          }
          function ze() {
            var kt = Ss();
            if (Ie(kt))
              return Ge(kt);
            T = Qa(ze, We(kt));
          }
          function Ge(kt) {
            return T = r, be && u ? Ee(kt) : (u = v = r, k);
          }
          function wn() {
            T !== r && Mf(T), Y = 0, u = W = v = T = r;
          }
          function en() {
            return T === r ? k : Ge(Ss());
          }
          function xn() {
            var kt = Ss(), Zn = Ie(kt);
            if (u = arguments, v = this, W = kt, Zn) {
              if (T === r)
                return Me(W);
              if (ie)
                return Mf(T), T = Qa(ze, o), Ee(W);
            }
            return T === r && (T = Qa(ze, o)), k;
          }
          return xn.cancel = wn, xn.flush = en, xn;
        }
        var u3 = He(function(t, o) {
          return lf(t, 1, o);
        }), d3 = He(function(t, o, i) {
          return lf(t, Tn(o) || 0, i);
        });
        function f3(t) {
          return xr(t, se);
        }
        function _s(t, o) {
          if (typeof t != "function" || o != null && typeof o != "function")
            throw new In(c);
          var i = function() {
            var u = arguments, v = o ? o.apply(this, u) : u[0], _ = i.cache;
            if (_.has(v))
              return _.get(v);
            var k = t.apply(this, u);
            return i.cache = _.set(v, k) || _, k;
          };
          return i.cache = new (_s.Cache || wr)(), i;
        }
        _s.Cache = wr;
        function Es(t) {
          if (typeof t != "function")
            throw new In(c);
          return function() {
            var o = arguments;
            switch (o.length) {
              case 0:
                return !t.call(this);
              case 1:
                return !t.call(this, o[0]);
              case 2:
                return !t.call(this, o[0], o[1]);
              case 3:
                return !t.call(this, o[0], o[1], o[2]);
            }
            return !t.apply(this, o);
          };
        }
        function h3(t) {
          return g1(2, t);
        }
        var p3 = ev(function(t, o) {
          o = o.length == 1 && Oe(o[0]) ? ct(o[0], vn(ke())) : ct(Ut(o, 1), vn(ke()));
          var i = o.length;
          return He(function(u) {
            for (var v = -1, _ = Zt(u.length, i); ++v < _; )
              u[v] = o[v].call(this, u[v]);
            return ye(t, this, u);
          });
        }), Kc = He(function(t, o) {
          var i = qr(o, ca(Kc));
          return xr(t, O, r, o, i);
        }), w1 = He(function(t, o) {
          var i = qr(o, ca(w1));
          return xr(t, D, r, o, i);
        }), g3 = Cr(function(t, o) {
          return xr(t, z, r, r, r, o);
        });
        function m3(t, o) {
          if (typeof t != "function")
            throw new In(c);
          return o = o === r ? o : De(o), He(t, o);
        }
        function v3(t, o) {
          if (typeof t != "function")
            throw new In(c);
          return o = o == null ? 0 : At(De(o), 0), He(function(i) {
            var u = i[o], v = eo(i, 0, o);
            return u && Rn(v, u), ye(t, this, v);
          });
        }
        function b3(t, o, i) {
          var u = !0, v = !0;
          if (typeof t != "function")
            throw new In(c);
          return Ct(i) && (u = "leading" in i ? !!i.leading : u, v = "trailing" in i ? !!i.trailing : v), y1(t, o, {
            leading: u,
            maxWait: o,
            trailing: v
          });
        }
        function y3(t) {
          return p1(t, 1);
        }
        function w3(t, o) {
          return Kc(Lc(o), t);
        }
        function x3() {
          if (!arguments.length)
            return [];
          var t = arguments[0];
          return Oe(t) ? t : [t];
        }
        function C3(t) {
          return Mn(t, x);
        }
        function S3(t, o) {
          return o = typeof o == "function" ? o : r, Mn(t, x, o);
        }
        function _3(t) {
          return Mn(t, w | x);
        }
        function E3(t, o) {
          return o = typeof o == "function" ? o : r, Mn(t, w | x, o);
        }
        function R3(t, o) {
          return o == null || sf(t, o, Ft(o));
        }
        function Kn(t, o) {
          return t === o || t !== t && o !== o;
        }
        var I3 = vs(bc), k3 = vs(function(t, o) {
          return t >= o;
        }), Lo = hf(/* @__PURE__ */ (function() {
          return arguments;
        })()) ? hf : function(t) {
          return Et(t) && Qe.call(t, "callee") && !Jd.call(t, "callee");
        }, Oe = $.isArray, M3 = Ui ? vn(Ui) : F5;
        function cn(t) {
          return t != null && Rs(t.length) && !_r(t);
        }
        function It(t) {
          return Et(t) && cn(t);
        }
        function L3(t) {
          return t === !0 || t === !1 || Et(t) && Jt(t) == he;
        }
        var to = Um || ou, N3 = xo ? vn(xo) : W5;
        function T3(t) {
          return Et(t) && t.nodeType === 1 && !ei(t);
        }
        function A3(t) {
          if (t == null)
            return !0;
          if (cn(t) && (Oe(t) || typeof t == "string" || typeof t.splice == "function" || to(t) || ua(t) || Lo(t)))
            return !t.length;
          var o = jt(t);
          if (o == vt || o == ut)
            return !t.size;
          if (Ja(t))
            return !xc(t).length;
          for (var i in t)
            if (Qe.call(t, i))
              return !1;
          return !0;
        }
        function O3(t, o) {
          return qa(t, o);
        }
        function P3(t, o, i) {
          i = typeof i == "function" ? i : r;
          var u = i ? i(t, o) : r;
          return u === r ? qa(t, o, r, i) : !!u;
        }
        function Zc(t) {
          if (!Et(t))
            return !1;
          var o = Jt(t);
          return o == ee || o == me || typeof t.message == "string" && typeof t.name == "string" && !ei(t);
        }
        function D3(t) {
          return typeof t == "number" && ef(t);
        }
        function _r(t) {
          if (!Ct(t))
            return !1;
          var o = Jt(t);
          return o == Le || o == qe || o == ve || o == St;
        }
        function x1(t) {
          return typeof t == "number" && t == De(t);
        }
        function Rs(t) {
          return typeof t == "number" && t > -1 && t % 1 == 0 && t <= H;
        }
        function Ct(t) {
          var o = typeof t;
          return t != null && (o == "object" || o == "function");
        }
        function Et(t) {
          return t != null && typeof t == "object";
        }
        var C1 = Jo ? vn(Jo) : $5;
        function F3(t, o) {
          return t === o || wc(t, o, Fc(o));
        }
        function W3(t, o, i) {
          return i = typeof i == "function" ? i : r, wc(t, o, Fc(o), i);
        }
        function H3(t) {
          return S1(t) && t != +t;
        }
        function $3(t) {
          if (Sv(t))
            throw new Ae(l);
          return pf(t);
        }
        function z3(t) {
          return t === null;
        }
        function B3(t) {
          return t == null;
        }
        function S1(t) {
          return typeof t == "number" || Et(t) && Jt(t) == $t;
        }
        function ei(t) {
          if (!Et(t) || Jt(t) != Ue)
            return !1;
          var o = Qi(t);
          if (o === null)
            return !0;
          var i = Qe.call(o, "constructor") && o.constructor;
          return typeof i == "function" && i instanceof i && qi.call(i) == Wm;
        }
        var jc = q ? vn(q) : z5;
        function V3(t) {
          return x1(t) && t >= -H && t <= H;
        }
        var _1 = oe ? vn(oe) : B5;
        function Is(t) {
          return typeof t == "string" || !Oe(t) && Et(t) && Jt(t) == st;
        }
        function yn(t) {
          return typeof t == "symbol" || Et(t) && Jt(t) == pt;
        }
        var ua = xe ? vn(xe) : V5;
        function U3(t) {
          return t === r;
        }
        function G3(t) {
          return Et(t) && jt(t) == bt;
        }
        function K3(t) {
          return Et(t) && Jt(t) == _t;
        }
        var Z3 = vs(Cc), j3 = vs(function(t, o) {
          return t <= o;
        });
        function E1(t) {
          if (!t)
            return [];
          if (cn(t))
            return Is(t) ? Vn(t) : ln(t);
          if (za && t[za])
            return Rm(t[za]());
          var o = jt(t), i = o == vt ? cc : o == ut ? Ki : da;
          return i(t);
        }
        function Er(t) {
          if (!t)
            return t === 0 ? t : 0;
          if (t = Tn(t), t === pe || t === -pe) {
            var o = t < 0 ? -1 : 1;
            return o * P;
          }
          return t === t ? t : 0;
        }
        function De(t) {
          var o = Er(t), i = o % 1;
          return o === o ? i ? o - i : o : 0;
        }
        function R1(t) {
          return t ? Ro(De(t), 0, U) : 0;
        }
        function Tn(t) {
          if (typeof t == "number")
            return t;
          if (yn(t))
            return ae;
          if (Ct(t)) {
            var o = typeof t.valueOf == "function" ? t.valueOf() : t;
            t = Ct(o) ? o + "" : o;
          }
          if (typeof t != "string")
            return t === 0 ? t : +t;
          t = Ud(t);
          var i = Se.test(t);
          return i || bo.test(t) ? Yo(t.slice(2), i ? 2 : 8) : mr.test(t) ? ae : +t;
        }
        function I1(t) {
          return rr(t, un(t));
        }
        function q3(t) {
          return t ? Ro(De(t), -H, H) : t === 0 ? t : 0;
        }
        function et(t) {
          return t == null ? "" : bn(t);
        }
        var Y3 = sa(function(t, o) {
          if (Ja(o) || cn(o)) {
            rr(o, Ft(o), t);
            return;
          }
          for (var i in o)
            Qe.call(o, i) && Ka(t, i, o[i]);
        }), k1 = sa(function(t, o) {
          rr(o, un(o), t);
        }), M1 = sa(function(t, o, i, u) {
          rr(o, un(o), t, u);
        }), qc = sa(function(t, o, i, u) {
          rr(o, Ft(o), t, u);
        }), X3 = Cr(gc);
        function J3(t, o) {
          var i = ia(t);
          return o == null ? i : af(i, o);
        }
        var Q3 = He(function(t, o) {
          t = ft(t);
          var i = -1, u = o.length, v = u > 2 ? o[2] : r;
          for (v && Qt(o[0], o[1], v) && (u = 1); ++i < u; )
            for (var _ = o[i], k = un(_), T = -1, W = k.length; ++T < W; ) {
              var Y = k[T], te = t[Y];
              (te === r || Kn(te, ra[Y]) && !Qe.call(t, Y)) && (t[Y] = _[Y]);
            }
          return t;
        }), e6 = He(function(t) {
          return t.push(r, Gf), ye(L1, r, t);
        });
        function t6(t, o) {
          return $d(t, ke(o, 3), nr);
        }
        function n6(t, o) {
          return $d(t, ke(o, 3), vc);
        }
        function r6(t, o) {
          return t == null ? t : mc(t, ke(o, 3), un);
        }
        function o6(t, o) {
          return t == null ? t : df(t, ke(o, 3), un);
        }
        function a6(t, o) {
          return t && nr(t, ke(o, 3));
        }
        function i6(t, o) {
          return t && vc(t, ke(o, 3));
        }
        function s6(t) {
          return t == null ? [] : cs(t, Ft(t));
        }
        function l6(t) {
          return t == null ? [] : cs(t, un(t));
        }
        function Yc(t, o, i) {
          var u = t == null ? r : Io(t, o);
          return u === r ? i : u;
        }
        function c6(t, o) {
          return t != null && jf(t, o, A5);
        }
        function Xc(t, o) {
          return t != null && jf(t, o, O5);
        }
        var u6 = $f(function(t, o, i) {
          o != null && typeof o.toString != "function" && (o = Yi.call(o)), t[o] = i;
        }, Qc(dn)), d6 = $f(function(t, o, i) {
          o != null && typeof o.toString != "function" && (o = Yi.call(o)), Qe.call(t, o) ? t[o].push(i) : t[o] = [i];
        }, ke), f6 = He(ja);
        function Ft(t) {
          return cn(t) ? rf(t) : xc(t);
        }
        function un(t) {
          return cn(t) ? rf(t, !0) : U5(t);
        }
        function h6(t, o) {
          var i = {};
          return o = ke(o, 3), nr(t, function(u, v, _) {
            tr(i, o(u, v, _), u);
          }), i;
        }
        function p6(t, o) {
          var i = {};
          return o = ke(o, 3), nr(t, function(u, v, _) {
            tr(i, v, o(u, v, _));
          }), i;
        }
        var g6 = sa(function(t, o, i) {
          us(t, o, i);
        }), L1 = sa(function(t, o, i, u) {
          us(t, o, i, u);
        }), m6 = Cr(function(t, o) {
          var i = {};
          if (t == null)
            return i;
          var u = !1;
          o = ct(o, function(_) {
            return _ = Qr(_, t), u || (u = _.length > 1), _;
          }), rr(t, Pc(t), i), u && (i = Mn(i, w | g | x, dv));
          for (var v = o.length; v--; )
            Ic(i, o[v]);
          return i;
        });
        function v6(t, o) {
          return N1(t, Es(ke(o)));
        }
        var b6 = Cr(function(t, o) {
          return t == null ? {} : K5(t, o);
        });
        function N1(t, o) {
          if (t == null)
            return {};
          var i = ct(Pc(t), function(u) {
            return [u];
          });
          return o = ke(o), xf(t, i, function(u, v) {
            return o(u, v[0]);
          });
        }
        function y6(t, o, i) {
          o = Qr(o, t);
          var u = -1, v = o.length;
          for (v || (v = 1, t = r); ++u < v; ) {
            var _ = t == null ? r : t[Gn(o[u])];
            _ === r && (u = v, _ = i), t = _r(_) ? _.call(t) : _;
          }
          return t;
        }
        function w6(t, o, i) {
          return t == null ? t : Ya(t, o, i);
        }
        function x6(t, o, i, u) {
          return u = typeof u == "function" ? u : r, t == null ? t : Ya(t, o, i, u);
        }
        var T1 = Vf(Ft), A1 = Vf(un);
        function C6(t, o, i) {
          var u = Oe(t), v = u || to(t) || ua(t);
          if (o = ke(o, 4), i == null) {
            var _ = t && t.constructor;
            v ? i = u ? new _() : [] : Ct(t) ? i = _r(_) ? ia(Qi(t)) : {} : i = {};
          }
          return (v ? Pe : nr)(t, function(k, T, W) {
            return o(i, k, T, W);
          }), i;
        }
        function S6(t, o) {
          return t == null ? !0 : Ic(t, o);
        }
        function _6(t, o, i) {
          return t == null ? t : Rf(t, o, Lc(i));
        }
        function E6(t, o, i, u) {
          return u = typeof u == "function" ? u : r, t == null ? t : Rf(t, o, Lc(i), u);
        }
        function da(t) {
          return t == null ? [] : lc(t, Ft(t));
        }
        function R6(t) {
          return t == null ? [] : lc(t, un(t));
        }
        function I6(t, o, i) {
          return i === r && (i = o, o = r), i !== r && (i = Tn(i), i = i === i ? i : 0), o !== r && (o = Tn(o), o = o === o ? o : 0), Ro(Tn(t), o, i);
        }
        function k6(t, o, i) {
          return o = Er(o), i === r ? (i = o, o = 0) : i = Er(i), t = Tn(t), P5(t, o, i);
        }
        function M6(t, o, i) {
          if (i && typeof i != "boolean" && Qt(t, o, i) && (o = i = r), i === r && (typeof o == "boolean" ? (i = o, o = r) : typeof t == "boolean" && (i = t, t = r)), t === r && o === r ? (t = 0, o = 1) : (t = Er(t), o === r ? (o = t, t = 0) : o = Er(o)), t > o) {
            var u = t;
            t = o, o = u;
          }
          if (i || t % 1 || o % 1) {
            var v = tf();
            return Zt(t + v * (o - t + Wa("1e-" + ((v + "").length - 1))), o);
          }
          return _c(t, o);
        }
        var L6 = la(function(t, o, i) {
          return o = o.toLowerCase(), t + (i ? O1(o) : o);
        });
        function O1(t) {
          return Jc(et(t).toLowerCase());
        }
        function P1(t) {
          return t = et(t), t && t.replace(Vo, xm).replace(ql, "");
        }
        function N6(t, o, i) {
          t = et(t), o = bn(o);
          var u = t.length;
          i = i === r ? u : Ro(De(i), 0, u);
          var v = i;
          return i -= o.length, i >= 0 && t.slice(i, v) == o;
        }
        function T6(t) {
          return t = et(t), t && Ne.test(t) ? t.replace(sn, Cm) : t;
        }
        function A6(t) {
          return t = et(t), t && mn.test(t) ? t.replace(Vt, "\\$&") : t;
        }
        var O6 = la(function(t, o, i) {
          return t + (i ? "-" : "") + o.toLowerCase();
        }), P6 = la(function(t, o, i) {
          return t + (i ? " " : "") + o.toLowerCase();
        }), D6 = Ff("toLowerCase");
        function F6(t, o, i) {
          t = et(t), o = De(o);
          var u = o ? ta(t) : 0;
          if (!o || u >= o)
            return t;
          var v = (o - u) / 2;
          return ms(rs(v), i) + t + ms(ns(v), i);
        }
        function W6(t, o, i) {
          t = et(t), o = De(o);
          var u = o ? ta(t) : 0;
          return o && u < o ? t + ms(o - u, i) : t;
        }
        function H6(t, o, i) {
          t = et(t), o = De(o);
          var u = o ? ta(t) : 0;
          return o && u < o ? ms(o - u, i) + t : t;
        }
        function $6(t, o, i) {
          return i || o == null ? o = 0 : o && (o = +o), jm(et(t).replace(Ra, ""), o || 0);
        }
        function z6(t, o, i) {
          return (i ? Qt(t, o, i) : o === r) ? o = 1 : o = De(o), Ec(et(t), o);
        }
        function B6() {
          var t = arguments, o = et(t[0]);
          return t.length < 3 ? o : o.replace(t[1], t[2]);
        }
        var V6 = la(function(t, o, i) {
          return t + (i ? "_" : "") + o.toLowerCase();
        });
        function U6(t, o, i) {
          return i && typeof i != "number" && Qt(t, o, i) && (o = i = r), i = i === r ? U : i >>> 0, i ? (t = et(t), t && (typeof o == "string" || o != null && !jc(o)) && (o = bn(o), !o && ea(t)) ? eo(Vn(t), 0, i) : t.split(o, i)) : [];
        }
        var G6 = la(function(t, o, i) {
          return t + (i ? " " : "") + Jc(o);
        });
        function K6(t, o, i) {
          return t = et(t), i = i == null ? 0 : Ro(De(i), 0, t.length), o = bn(o), t.slice(i, i + o.length) == o;
        }
        function Z6(t, o, i) {
          var u = S.templateSettings;
          i && Qt(t, o, i) && (o = r), t = et(t), o = qc({}, o, u, Uf);
          var v = qc({}, o.imports, u.imports, Uf), _ = Ft(v), k = lc(v, _);
          Pe(_, function(Ie) {
            if (er.test(Ie))
              throw new Ae(h);
          });
          var T, W, Y = 0, te = o.interpolate || yo, ie = "__p += '", be = uc(
            (o.escape || yo).source + "|" + te.source + "|" + (te === Ye ? Xt : yo).source + "|" + (o.evaluate || yo).source + "|$",
            "g"
          ), Ee = "//# sourceURL=" + (Qe.call(o, "sourceURL") ? (o.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++ec + "]") + `
`;
          t.replace(be, function(Ie, ze, Ge, wn, en, xn) {
            return Ge || (Ge = wn), ie += t.slice(Y, xn).replace(Uo, Sm), ze && (T = !0, ie += `' +
__e(` + ze + `) +
'`), en && (W = !0, ie += `';
` + en + `;
__p += '`), Ge && (ie += `' +
((__t = (` + Ge + `)) == null ? '' : __t) +
'`), Y = xn + Ie.length, Ie;
          }), ie += `';
`;
          var Me = Qe.call(o, "variable") && o.variable;
          if (!Me)
            ie = `with (obj) {
` + ie + `
}
`;
          else if (er.test(Me))
            throw new Ae(d);
          ie = (W ? ie.replace(Bo, "") : ie).replace(Hr, "$1").replace($r, "$1;"), ie = "function(" + (Me || "obj") + `) {
` + (Me ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (T ? ", __e = _.escape" : "") + (W ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + ie + `return __p
}`;
          var We = F1(function() {
            return Je(_, Ee + "return " + ie).apply(r, k);
          });
          if (We.source = ie, Zc(We))
            throw We;
          return We;
        }
        function j6(t) {
          return et(t).toLowerCase();
        }
        function q6(t) {
          return et(t).toUpperCase();
        }
        function Y6(t, o, i) {
          if (t = et(t), t && (i || o === r))
            return Ud(t);
          if (!t || !(o = bn(o)))
            return t;
          var u = Vn(t), v = Vn(o), _ = Gd(u, v), k = Kd(u, v) + 1;
          return eo(u, _, k).join("");
        }
        function X6(t, o, i) {
          if (t = et(t), t && (i || o === r))
            return t.slice(0, jd(t) + 1);
          if (!t || !(o = bn(o)))
            return t;
          var u = Vn(t), v = Kd(u, Vn(o)) + 1;
          return eo(u, 0, v).join("");
        }
        function J6(t, o, i) {
          if (t = et(t), t && (i || o === r))
            return t.replace(Ra, "");
          if (!t || !(o = bn(o)))
            return t;
          var u = Vn(t), v = Gd(u, Vn(o));
          return eo(u, v).join("");
        }
        function Q6(t, o) {
          var i = ue, u = ce;
          if (Ct(o)) {
            var v = "separator" in o ? o.separator : v;
            i = "length" in o ? De(o.length) : i, u = "omission" in o ? bn(o.omission) : u;
          }
          t = et(t);
          var _ = t.length;
          if (ea(t)) {
            var k = Vn(t);
            _ = k.length;
          }
          if (i >= _)
            return t;
          var T = i - ta(u);
          if (T < 1)
            return u;
          var W = k ? eo(k, 0, T).join("") : t.slice(0, T);
          if (v === r)
            return W + u;
          if (k && (T += W.length - T), jc(v)) {
            if (t.slice(T).search(v)) {
              var Y, te = W;
              for (v.global || (v = uc(v.source, et(vo.exec(v)) + "g")), v.lastIndex = 0; Y = v.exec(te); )
                var ie = Y.index;
              W = W.slice(0, ie === r ? T : ie);
            }
          } else if (t.indexOf(bn(v), T) != T) {
            var be = W.lastIndexOf(v);
            be > -1 && (W = W.slice(0, be));
          }
          return W + u;
        }
        function eb(t) {
          return t = et(t), t && En.test(t) ? t.replace(zr, Lm) : t;
        }
        var tb = la(function(t, o, i) {
          return t + (i ? " " : "") + o.toUpperCase();
        }), Jc = Ff("toUpperCase");
        function D1(t, o, i) {
          return t = et(t), o = i ? r : o, o === r ? Em(t) ? Am(t) : mm(t) : t.match(o) || [];
        }
        var F1 = He(function(t, o) {
          try {
            return ye(t, r, o);
          } catch (i) {
            return Zc(i) ? i : new Ae(i);
          }
        }), nb = Cr(function(t, o) {
          return Pe(o, function(i) {
            i = Gn(i), tr(t, i, Gc(t[i], t));
          }), t;
        });
        function rb(t) {
          var o = t == null ? 0 : t.length, i = ke();
          return t = o ? ct(t, function(u) {
            if (typeof u[1] != "function")
              throw new In(c);
            return [i(u[0]), u[1]];
          }) : [], He(function(u) {
            for (var v = -1; ++v < o; ) {
              var _ = t[v];
              if (ye(_[0], this, u))
                return ye(_[1], this, u);
            }
          });
        }
        function ob(t) {
          return L5(Mn(t, w));
        }
        function Qc(t) {
          return function() {
            return t;
          };
        }
        function ab(t, o) {
          return t == null || t !== t ? o : t;
        }
        var ib = Hf(), sb = Hf(!0);
        function dn(t) {
          return t;
        }
        function eu(t) {
          return gf(typeof t == "function" ? t : Mn(t, w));
        }
        function lb(t) {
          return vf(Mn(t, w));
        }
        function cb(t, o) {
          return bf(t, Mn(o, w));
        }
        var ub = He(function(t, o) {
          return function(i) {
            return ja(i, t, o);
          };
        }), db = He(function(t, o) {
          return function(i) {
            return ja(t, i, o);
          };
        });
        function tu(t, o, i) {
          var u = Ft(o), v = cs(o, u);
          i == null && !(Ct(o) && (v.length || !u.length)) && (i = o, o = t, t = this, v = cs(o, Ft(o)));
          var _ = !(Ct(i) && "chain" in i) || !!i.chain, k = _r(t);
          return Pe(v, function(T) {
            var W = o[T];
            t[T] = W, k && (t.prototype[T] = function() {
              var Y = this.__chain__;
              if (_ || Y) {
                var te = t(this.__wrapped__), ie = te.__actions__ = ln(this.__actions__);
                return ie.push({ func: W, args: arguments, thisArg: t }), te.__chain__ = Y, te;
              }
              return W.apply(t, Rn([this.value()], arguments));
            });
          }), t;
        }
        function fb() {
          return Nt._ === this && (Nt._ = Hm), this;
        }
        function nu() {
        }
        function hb(t) {
          return t = De(t), He(function(o) {
            return yf(o, t);
          });
        }
        var pb = Tc(ct), gb = Tc(gt), mb = Tc(rc);
        function W1(t) {
          return Hc(t) ? oc(Gn(t)) : Z5(t);
        }
        function vb(t) {
          return function(o) {
            return t == null ? r : Io(t, o);
          };
        }
        var bb = zf(), yb = zf(!0);
        function ru() {
          return [];
        }
        function ou() {
          return !1;
        }
        function wb() {
          return {};
        }
        function xb() {
          return "";
        }
        function Cb() {
          return !0;
        }
        function Sb(t, o) {
          if (t = De(t), t < 1 || t > H)
            return [];
          var i = U, u = Zt(t, U);
          o = ke(o), t -= U;
          for (var v = sc(u, o); ++i < t; )
            o(i);
          return v;
        }
        function _b(t) {
          return Oe(t) ? ct(t, Gn) : yn(t) ? [t] : ln(r1(et(t)));
        }
        function Eb(t) {
          var o = ++Fm;
          return et(t) + o;
        }
        var Rb = gs(function(t, o) {
          return t + o;
        }, 0), Ib = Ac("ceil"), kb = gs(function(t, o) {
          return t / o;
        }, 1), Mb = Ac("floor");
        function Lb(t) {
          return t && t.length ? ls(t, dn, bc) : r;
        }
        function Nb(t, o) {
          return t && t.length ? ls(t, ke(o, 2), bc) : r;
        }
        function Tb(t) {
          return Bd(t, dn);
        }
        function Ab(t, o) {
          return Bd(t, ke(o, 2));
        }
        function Ob(t) {
          return t && t.length ? ls(t, dn, Cc) : r;
        }
        function Pb(t, o) {
          return t && t.length ? ls(t, ke(o, 2), Cc) : r;
        }
        var Db = gs(function(t, o) {
          return t * o;
        }, 1), Fb = Ac("round"), Wb = gs(function(t, o) {
          return t - o;
        }, 0);
        function Hb(t) {
          return t && t.length ? ic(t, dn) : 0;
        }
        function $b(t, o) {
          return t && t.length ? ic(t, ke(o, 2)) : 0;
        }
        return S.after = c3, S.ary = p1, S.assign = Y3, S.assignIn = k1, S.assignInWith = M1, S.assignWith = qc, S.at = X3, S.before = g1, S.bind = Gc, S.bindAll = nb, S.bindKey = m1, S.castArray = x3, S.chain = d1, S.chunk = Lv, S.compact = Nv, S.concat = Tv, S.cond = rb, S.conforms = ob, S.constant = Qc, S.countBy = $4, S.create = J3, S.curry = v1, S.curryRight = b1, S.debounce = y1, S.defaults = Q3, S.defaultsDeep = e6, S.defer = u3, S.delay = d3, S.difference = Av, S.differenceBy = Ov, S.differenceWith = Pv, S.drop = Dv, S.dropRight = Fv, S.dropRightWhile = Wv, S.dropWhile = Hv, S.fill = $v, S.filter = B4, S.flatMap = G4, S.flatMapDeep = K4, S.flatMapDepth = Z4, S.flatten = s1, S.flattenDeep = zv, S.flattenDepth = Bv, S.flip = f3, S.flow = ib, S.flowRight = sb, S.fromPairs = Vv, S.functions = s6, S.functionsIn = l6, S.groupBy = j4, S.initial = Gv, S.intersection = Kv, S.intersectionBy = Zv, S.intersectionWith = jv, S.invert = u6, S.invertBy = d6, S.invokeMap = Y4, S.iteratee = eu, S.keyBy = X4, S.keys = Ft, S.keysIn = un, S.map = Cs, S.mapKeys = h6, S.mapValues = p6, S.matches = lb, S.matchesProperty = cb, S.memoize = _s, S.merge = g6, S.mergeWith = L1, S.method = ub, S.methodOf = db, S.mixin = tu, S.negate = Es, S.nthArg = hb, S.omit = m6, S.omitBy = v6, S.once = h3, S.orderBy = J4, S.over = pb, S.overArgs = p3, S.overEvery = gb, S.overSome = mb, S.partial = Kc, S.partialRight = w1, S.partition = Q4, S.pick = b6, S.pickBy = N1, S.property = W1, S.propertyOf = vb, S.pull = Jv, S.pullAll = c1, S.pullAllBy = Qv, S.pullAllWith = e4, S.pullAt = t4, S.range = bb, S.rangeRight = yb, S.rearg = g3, S.reject = n3, S.remove = n4, S.rest = m3, S.reverse = Vc, S.sampleSize = o3, S.set = w6, S.setWith = x6, S.shuffle = a3, S.slice = r4, S.sortBy = l3, S.sortedUniq = u4, S.sortedUniqBy = d4, S.split = U6, S.spread = v3, S.tail = f4, S.take = h4, S.takeRight = p4, S.takeRightWhile = g4, S.takeWhile = m4, S.tap = N4, S.throttle = b3, S.thru = xs, S.toArray = E1, S.toPairs = T1, S.toPairsIn = A1, S.toPath = _b, S.toPlainObject = I1, S.transform = C6, S.unary = y3, S.union = v4, S.unionBy = b4, S.unionWith = y4, S.uniq = w4, S.uniqBy = x4, S.uniqWith = C4, S.unset = S6, S.unzip = Uc, S.unzipWith = u1, S.update = _6, S.updateWith = E6, S.values = da, S.valuesIn = R6, S.without = S4, S.words = D1, S.wrap = w3, S.xor = _4, S.xorBy = E4, S.xorWith = R4, S.zip = I4, S.zipObject = k4, S.zipObjectDeep = M4, S.zipWith = L4, S.entries = T1, S.entriesIn = A1, S.extend = k1, S.extendWith = M1, tu(S, S), S.add = Rb, S.attempt = F1, S.camelCase = L6, S.capitalize = O1, S.ceil = Ib, S.clamp = I6, S.clone = C3, S.cloneDeep = _3, S.cloneDeepWith = E3, S.cloneWith = S3, S.conformsTo = R3, S.deburr = P1, S.defaultTo = ab, S.divide = kb, S.endsWith = N6, S.eq = Kn, S.escape = T6, S.escapeRegExp = A6, S.every = z4, S.find = V4, S.findIndex = a1, S.findKey = t6, S.findLast = U4, S.findLastIndex = i1, S.findLastKey = n6, S.floor = Mb, S.forEach = f1, S.forEachRight = h1, S.forIn = r6, S.forInRight = o6, S.forOwn = a6, S.forOwnRight = i6, S.get = Yc, S.gt = I3, S.gte = k3, S.has = c6, S.hasIn = Xc, S.head = l1, S.identity = dn, S.includes = q4, S.indexOf = Uv, S.inRange = k6, S.invoke = f6, S.isArguments = Lo, S.isArray = Oe, S.isArrayBuffer = M3, S.isArrayLike = cn, S.isArrayLikeObject = It, S.isBoolean = L3, S.isBuffer = to, S.isDate = N3, S.isElement = T3, S.isEmpty = A3, S.isEqual = O3, S.isEqualWith = P3, S.isError = Zc, S.isFinite = D3, S.isFunction = _r, S.isInteger = x1, S.isLength = Rs, S.isMap = C1, S.isMatch = F3, S.isMatchWith = W3, S.isNaN = H3, S.isNative = $3, S.isNil = B3, S.isNull = z3, S.isNumber = S1, S.isObject = Ct, S.isObjectLike = Et, S.isPlainObject = ei, S.isRegExp = jc, S.isSafeInteger = V3, S.isSet = _1, S.isString = Is, S.isSymbol = yn, S.isTypedArray = ua, S.isUndefined = U3, S.isWeakMap = G3, S.isWeakSet = K3, S.join = qv, S.kebabCase = O6, S.last = Nn, S.lastIndexOf = Yv, S.lowerCase = P6, S.lowerFirst = D6, S.lt = Z3, S.lte = j3, S.max = Lb, S.maxBy = Nb, S.mean = Tb, S.meanBy = Ab, S.min = Ob, S.minBy = Pb, S.stubArray = ru, S.stubFalse = ou, S.stubObject = wb, S.stubString = xb, S.stubTrue = Cb, S.multiply = Db, S.nth = Xv, S.noConflict = fb, S.noop = nu, S.now = Ss, S.pad = F6, S.padEnd = W6, S.padStart = H6, S.parseInt = $6, S.random = M6, S.reduce = e3, S.reduceRight = t3, S.repeat = z6, S.replace = B6, S.result = y6, S.round = Fb, S.runInContext = F, S.sample = r3, S.size = i3, S.snakeCase = V6, S.some = s3, S.sortedIndex = o4, S.sortedIndexBy = a4, S.sortedIndexOf = i4, S.sortedLastIndex = s4, S.sortedLastIndexBy = l4, S.sortedLastIndexOf = c4, S.startCase = G6, S.startsWith = K6, S.subtract = Wb, S.sum = Hb, S.sumBy = $b, S.template = Z6, S.times = Sb, S.toFinite = Er, S.toInteger = De, S.toLength = R1, S.toLower = j6, S.toNumber = Tn, S.toSafeInteger = q3, S.toString = et, S.toUpper = q6, S.trim = Y6, S.trimEnd = X6, S.trimStart = J6, S.truncate = Q6, S.unescape = eb, S.uniqueId = Eb, S.upperCase = tb, S.upperFirst = Jc, S.each = f1, S.eachRight = h1, S.first = l1, tu(S, (function() {
          var t = {};
          return nr(S, function(o, i) {
            Qe.call(S.prototype, i) || (t[i] = o);
          }), t;
        })(), { chain: !1 }), S.VERSION = a, Pe(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(t) {
          S[t].placeholder = S;
        }), Pe(["drop", "take"], function(t, o) {
          Be.prototype[t] = function(i) {
            i = i === r ? 1 : At(De(i), 0);
            var u = this.__filtered__ && !o ? new Be(this) : this.clone();
            return u.__filtered__ ? u.__takeCount__ = Zt(i, u.__takeCount__) : u.__views__.push({
              size: Zt(i, U),
              type: t + (u.__dir__ < 0 ? "Right" : "")
            }), u;
          }, Be.prototype[t + "Right"] = function(i) {
            return this.reverse()[t](i).reverse();
          };
        }), Pe(["filter", "map", "takeWhile"], function(t, o) {
          var i = o + 1, u = i == le || i == ge;
          Be.prototype[t] = function(v) {
            var _ = this.clone();
            return _.__iteratees__.push({
              iteratee: ke(v, 3),
              type: i
            }), _.__filtered__ = _.__filtered__ || u, _;
          };
        }), Pe(["head", "last"], function(t, o) {
          var i = "take" + (o ? "Right" : "");
          Be.prototype[t] = function() {
            return this[i](1).value()[0];
          };
        }), Pe(["initial", "tail"], function(t, o) {
          var i = "drop" + (o ? "" : "Right");
          Be.prototype[t] = function() {
            return this.__filtered__ ? new Be(this) : this[i](1);
          };
        }), Be.prototype.compact = function() {
          return this.filter(dn);
        }, Be.prototype.find = function(t) {
          return this.filter(t).head();
        }, Be.prototype.findLast = function(t) {
          return this.reverse().find(t);
        }, Be.prototype.invokeMap = He(function(t, o) {
          return typeof t == "function" ? new Be(this) : this.map(function(i) {
            return ja(i, t, o);
          });
        }), Be.prototype.reject = function(t) {
          return this.filter(Es(ke(t)));
        }, Be.prototype.slice = function(t, o) {
          t = De(t);
          var i = this;
          return i.__filtered__ && (t > 0 || o < 0) ? new Be(i) : (t < 0 ? i = i.takeRight(-t) : t && (i = i.drop(t)), o !== r && (o = De(o), i = o < 0 ? i.dropRight(-o) : i.take(o - t)), i);
        }, Be.prototype.takeRightWhile = function(t) {
          return this.reverse().takeWhile(t).reverse();
        }, Be.prototype.toArray = function() {
          return this.take(U);
        }, nr(Be.prototype, function(t, o) {
          var i = /^(?:filter|find|map|reject)|While$/.test(o), u = /^(?:head|last)$/.test(o), v = S[u ? "take" + (o == "last" ? "Right" : "") : o], _ = u || /^find/.test(o);
          v && (S.prototype[o] = function() {
            var k = this.__wrapped__, T = u ? [1] : arguments, W = k instanceof Be, Y = T[0], te = W || Oe(k), ie = function(ze) {
              var Ge = v.apply(S, Rn([ze], T));
              return u && be ? Ge[0] : Ge;
            };
            te && i && typeof Y == "function" && Y.length != 1 && (W = te = !1);
            var be = this.__chain__, Ee = !!this.__actions__.length, Me = _ && !be, We = W && !Ee;
            if (!_ && te) {
              k = We ? k : new Be(this);
              var Ie = t.apply(k, T);
              return Ie.__actions__.push({ func: xs, args: [ie], thisArg: r }), new kn(Ie, be);
            }
            return Me && We ? t.apply(this, T) : (Ie = this.thru(ie), Me ? u ? Ie.value()[0] : Ie.value() : Ie);
          });
        }), Pe(["pop", "push", "shift", "sort", "splice", "unshift"], function(t) {
          var o = Zi[t], i = /^(?:push|sort|unshift)$/.test(t) ? "tap" : "thru", u = /^(?:pop|shift)$/.test(t);
          S.prototype[t] = function() {
            var v = arguments;
            if (u && !this.__chain__) {
              var _ = this.value();
              return o.apply(Oe(_) ? _ : [], v);
            }
            return this[i](function(k) {
              return o.apply(Oe(k) ? k : [], v);
            });
          };
        }), nr(Be.prototype, function(t, o) {
          var i = S[o];
          if (i) {
            var u = i.name + "";
            Qe.call(aa, u) || (aa[u] = []), aa[u].push({ name: o, func: i });
          }
        }), aa[ps(r, N).name] = [{
          name: "wrapper",
          func: r
        }], Be.prototype.clone = t5, Be.prototype.reverse = n5, Be.prototype.value = r5, S.prototype.at = T4, S.prototype.chain = A4, S.prototype.commit = O4, S.prototype.next = P4, S.prototype.plant = F4, S.prototype.reverse = W4, S.prototype.toJSON = S.prototype.valueOf = S.prototype.value = H4, S.prototype.first = S.prototype.head, za && (S.prototype[za] = D4), S;
      }), na = Om();
      br ? ((br.exports = na)._ = na, Xo._ = na) : Nt._ = na;
    }).call(fC);
  })(oi, oi.exports)), oi.exports;
}
var pC = hC(), gC = (e) => {
  switch (e) {
    case "success":
      return bC;
    case "info":
      return wC;
    case "warning":
      return yC;
    case "error":
      return xC;
    default:
      return null;
  }
}, mC = Array(12).fill(0), vC = ({ visible: e, className: n }) => de.createElement("div", { className: ["sonner-loading-wrapper", n].filter(Boolean).join(" "), "data-visible": e }, de.createElement("div", { className: "sonner-spinner" }, mC.map((r, a) => de.createElement("div", { className: "sonner-loading-bar", key: `spinner-bar-${a}` })))), bC = de.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, de.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z", clipRule: "evenodd" })), yC = de.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", height: "20", width: "20" }, de.createElement("path", { fillRule: "evenodd", d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z", clipRule: "evenodd" })), wC = de.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, de.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z", clipRule: "evenodd" })), xC = de.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, de.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z", clipRule: "evenodd" })), CC = de.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, de.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), de.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })), SC = () => {
  let [e, n] = de.useState(document.hidden);
  return de.useEffect(() => {
    let r = () => {
      n(document.hidden);
    };
    return document.addEventListener("visibilitychange", r), () => window.removeEventListener("visibilitychange", r);
  }, []), e;
}, Vu = 1, _C = class {
  constructor() {
    this.subscribe = (e) => (this.subscribers.push(e), () => {
      let n = this.subscribers.indexOf(e);
      this.subscribers.splice(n, 1);
    }), this.publish = (e) => {
      this.subscribers.forEach((n) => n(e));
    }, this.addToast = (e) => {
      this.publish(e), this.toasts = [...this.toasts, e];
    }, this.create = (e) => {
      var n;
      let { message: r, ...a } = e, s = typeof e?.id == "number" || ((n = e.id) == null ? void 0 : n.length) > 0 ? e.id : Vu++, l = this.toasts.find((d) => d.id === s), c = e.dismissible === void 0 ? !0 : e.dismissible;
      return this.dismissedToasts.has(s) && this.dismissedToasts.delete(s), l ? this.toasts = this.toasts.map((d) => d.id === s ? (this.publish({ ...d, ...e, id: s, title: r }), { ...d, ...e, id: s, dismissible: c, title: r }) : d) : this.addToast({ title: r, ...a, dismissible: c, id: s }), s;
    }, this.dismiss = (e) => (this.dismissedToasts.add(e), e || this.toasts.forEach((n) => {
      this.subscribers.forEach((r) => r({ id: n.id, dismiss: !0 }));
    }), this.subscribers.forEach((n) => n({ id: e, dismiss: !0 })), e), this.message = (e, n) => this.create({ ...n, message: e }), this.error = (e, n) => this.create({ ...n, message: e, type: "error" }), this.success = (e, n) => this.create({ ...n, type: "success", message: e }), this.info = (e, n) => this.create({ ...n, type: "info", message: e }), this.warning = (e, n) => this.create({ ...n, type: "warning", message: e }), this.loading = (e, n) => this.create({ ...n, type: "loading", message: e }), this.promise = (e, n) => {
      if (!n) return;
      let r;
      n.loading !== void 0 && (r = this.create({ ...n, promise: e, type: "loading", message: n.loading, description: typeof n.description != "function" ? n.description : void 0 }));
      let a = e instanceof Promise ? e : e(), s = r !== void 0, l, c = a.then(async (h) => {
        if (l = ["resolve", h], de.isValidElement(h)) s = !1, this.create({ id: r, type: "default", message: h });
        else if (RC(h) && !h.ok) {
          s = !1;
          let p = typeof n.error == "function" ? await n.error(`HTTP error! status: ${h.status}`) : n.error, m = typeof n.description == "function" ? await n.description(`HTTP error! status: ${h.status}`) : n.description;
          this.create({ id: r, type: "error", message: p, description: m });
        } else if (n.success !== void 0) {
          s = !1;
          let p = typeof n.success == "function" ? await n.success(h) : n.success, m = typeof n.description == "function" ? await n.description(h) : n.description;
          this.create({ id: r, type: "success", message: p, description: m });
        }
      }).catch(async (h) => {
        if (l = ["reject", h], n.error !== void 0) {
          s = !1;
          let p = typeof n.error == "function" ? await n.error(h) : n.error, m = typeof n.description == "function" ? await n.description(h) : n.description;
          this.create({ id: r, type: "error", message: p, description: m });
        }
      }).finally(() => {
        var h;
        s && (this.dismiss(r), r = void 0), (h = n.finally) == null || h.call(n);
      }), d = () => new Promise((h, p) => c.then(() => l[0] === "reject" ? p(l[1]) : h(l[1])).catch(p));
      return typeof r != "string" && typeof r != "number" ? { unwrap: d } : Object.assign(r, { unwrap: d });
    }, this.custom = (e, n) => {
      let r = n?.id || Vu++;
      return this.create({ jsx: e(r), id: r, ...n }), r;
    }, this.getActiveToasts = () => this.toasts.filter((e) => !this.dismissedToasts.has(e.id)), this.subscribers = [], this.toasts = [], this.dismissedToasts = /* @__PURE__ */ new Set();
  }
}, pn = new _C(), EC = (e, n) => {
  let r = n?.id || Vu++;
  return pn.addToast({ title: e, ...n, id: r }), r;
}, RC = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", IC = EC, kC = () => pn.toasts, MC = () => pn.getActiveToasts(), I0 = Object.assign(IC, { success: pn.success, info: pn.info, warning: pn.warning, error: pn.error, custom: pn.custom, message: pn.message, promise: pn.promise, dismiss: pn.dismiss, loading: pn.loading }, { getHistory: kC, getToasts: MC });
function LC(e, { insertAt: n } = {}) {
  if (typeof document > "u") return;
  let r = document.head || document.getElementsByTagName("head")[0], a = document.createElement("style");
  a.type = "text/css", n === "top" && r.firstChild ? r.insertBefore(a, r.firstChild) : r.appendChild(a), a.styleSheet ? a.styleSheet.cssText = e : a.appendChild(document.createTextNode(e));
}
LC(`:where(html[dir="ltr"]),:where([data-sonner-toaster][dir="ltr"]){--toast-icon-margin-start: -3px;--toast-icon-margin-end: 4px;--toast-svg-margin-start: -1px;--toast-svg-margin-end: 0px;--toast-button-margin-start: auto;--toast-button-margin-end: 0;--toast-close-button-start: 0;--toast-close-button-end: unset;--toast-close-button-transform: translate(-35%, -35%)}:where(html[dir="rtl"]),:where([data-sonner-toaster][dir="rtl"]){--toast-icon-margin-start: 4px;--toast-icon-margin-end: -3px;--toast-svg-margin-start: 0px;--toast-svg-margin-end: -1px;--toast-button-margin-start: 0;--toast-button-margin-end: auto;--toast-close-button-start: unset;--toast-close-button-end: 0;--toast-close-button-transform: translate(35%, -35%)}:where([data-sonner-toaster]){position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1: hsl(0, 0%, 99%);--gray2: hsl(0, 0%, 97.3%);--gray3: hsl(0, 0%, 95.1%);--gray4: hsl(0, 0%, 93%);--gray5: hsl(0, 0%, 90.9%);--gray6: hsl(0, 0%, 88.7%);--gray7: hsl(0, 0%, 85.8%);--gray8: hsl(0, 0%, 78%);--gray9: hsl(0, 0%, 56.1%);--gray10: hsl(0, 0%, 52.3%);--gray11: hsl(0, 0%, 43.5%);--gray12: hsl(0, 0%, 9%);--border-radius: 8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:none;z-index:999999999;transition:transform .4s ease}:where([data-sonner-toaster][data-lifted="true"]){transform:translateY(-10px)}@media (hover: none) and (pointer: coarse){:where([data-sonner-toaster][data-lifted="true"]){transform:none}}:where([data-sonner-toaster][data-x-position="right"]){right:var(--offset-right)}:where([data-sonner-toaster][data-x-position="left"]){left:var(--offset-left)}:where([data-sonner-toaster][data-x-position="center"]){left:50%;transform:translate(-50%)}:where([data-sonner-toaster][data-y-position="top"]){top:var(--offset-top)}:where([data-sonner-toaster][data-y-position="bottom"]){bottom:var(--offset-bottom)}:where([data-sonner-toast]){--y: translateY(100%);--lift-amount: calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);filter:blur(0);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:none;overflow-wrap:anywhere}:where([data-sonner-toast][data-styled="true"]){padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px #0000001a;width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}:where([data-sonner-toast]:focus-visible){box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast][data-y-position="top"]){top:0;--y: translateY(-100%);--lift: 1;--lift-amount: calc(1 * var(--gap))}:where([data-sonner-toast][data-y-position="bottom"]){bottom:0;--y: translateY(100%);--lift: -1;--lift-amount: calc(var(--lift) * var(--gap))}:where([data-sonner-toast]) :where([data-description]){font-weight:400;line-height:1.4;color:inherit}:where([data-sonner-toast]) :where([data-title]){font-weight:500;line-height:1.5;color:inherit}:where([data-sonner-toast]) :where([data-icon]){display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}:where([data-sonner-toast][data-promise="true"]) :where([data-icon])>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}:where([data-sonner-toast]) :where([data-icon])>*{flex-shrink:0}:where([data-sonner-toast]) :where([data-icon]) svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}:where([data-sonner-toast]) :where([data-content]){display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;cursor:pointer;outline:none;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}:where([data-sonner-toast]) :where([data-button]):focus-visible{box-shadow:0 0 0 2px #0006}:where([data-sonner-toast]) :where([data-button]):first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}:where([data-sonner-toast]) :where([data-cancel]){color:var(--normal-text);background:rgba(0,0,0,.08)}:where([data-sonner-toast][data-theme="dark"]) :where([data-cancel]){background:rgba(255,255,255,.3)}:where([data-sonner-toast]) :where([data-close-button]){position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast] [data-close-button]{background:var(--gray1)}:where([data-sonner-toast]) :where([data-close-button]):focus-visible{box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast]) :where([data-disabled="true"]){cursor:not-allowed}:where([data-sonner-toast]):hover :where([data-close-button]):hover{background:var(--gray2);border-color:var(--gray5)}:where([data-sonner-toast][data-swiping="true"]):before{content:"";position:absolute;left:-50%;right:-50%;height:100%;z-index:-1}:where([data-sonner-toast][data-y-position="top"][data-swiping="true"]):before{bottom:50%;transform:scaleY(3) translateY(50%)}:where([data-sonner-toast][data-y-position="bottom"][data-swiping="true"]):before{top:50%;transform:scaleY(3) translateY(-50%)}:where([data-sonner-toast][data-swiping="false"][data-removed="true"]):before{content:"";position:absolute;inset:0;transform:scaleY(2)}:where([data-sonner-toast]):after{content:"";position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}:where([data-sonner-toast][data-mounted="true"]){--y: translateY(0);opacity:1}:where([data-sonner-toast][data-expanded="false"][data-front="false"]){--scale: var(--toasts-before) * .05 + 1;--y: translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}:where([data-sonner-toast])>*{transition:opacity .4s}:where([data-sonner-toast][data-expanded="false"][data-front="false"][data-styled="true"])>*{opacity:0}:where([data-sonner-toast][data-visible="false"]){opacity:0;pointer-events:none}:where([data-sonner-toast][data-mounted="true"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}:where([data-sonner-toast][data-removed="true"][data-front="true"][data-swipe-out="false"]){--y: translateY(calc(var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="false"]){--y: translateY(40%);opacity:0;transition:transform .5s,opacity .2s}:where([data-sonner-toast][data-removed="true"][data-front="false"]):before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y, 0px)) translate(var(--swipe-amount-x, 0px));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width: 600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-theme=light]{--normal-bg: #fff;--normal-border: var(--gray4);--normal-text: var(--gray12);--success-bg: hsl(143, 85%, 96%);--success-border: hsl(145, 92%, 91%);--success-text: hsl(140, 100%, 27%);--info-bg: hsl(208, 100%, 97%);--info-border: hsl(221, 91%, 91%);--info-text: hsl(210, 92%, 45%);--warning-bg: hsl(49, 100%, 97%);--warning-border: hsl(49, 91%, 91%);--warning-text: hsl(31, 92%, 45%);--error-bg: hsl(359, 100%, 97%);--error-border: hsl(359, 100%, 94%);--error-text: hsl(360, 100%, 45%)}[data-sonner-toaster][data-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg: #000;--normal-border: hsl(0, 0%, 20%);--normal-text: var(--gray1)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg: #fff;--normal-border: var(--gray3);--normal-text: var(--gray12)}[data-sonner-toaster][data-theme=dark]{--normal-bg: #000;--normal-bg-hover: hsl(0, 0%, 12%);--normal-border: hsl(0, 0%, 20%);--normal-border-hover: hsl(0, 0%, 25%);--normal-text: var(--gray1);--success-bg: hsl(150, 100%, 6%);--success-border: hsl(147, 100%, 12%);--success-text: hsl(150, 86%, 65%);--info-bg: hsl(215, 100%, 6%);--info-border: hsl(223, 100%, 12%);--info-text: hsl(216, 87%, 65%);--warning-bg: hsl(64, 100%, 6%);--warning-border: hsl(60, 100%, 12%);--warning-text: hsl(46, 87%, 65%);--error-bg: hsl(358, 76%, 10%);--error-border: hsl(357, 89%, 16%);--error-text: hsl(358, 100%, 81%)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success],[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info],[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning],[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error],[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size: 16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:nth-child(1){animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}to{opacity:.15}}@media (prefers-reduced-motion){[data-sonner-toast],[data-sonner-toast]>*,.sonner-loading-bar{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}
`);
function $s(e) {
  return e.label !== void 0;
}
var NC = 3, TC = "32px", AC = "16px", k0 = 4e3, OC = 356, PC = 14, DC = 20, FC = 200;
function jn(...e) {
  return e.filter(Boolean).join(" ");
}
function WC(e) {
  let [n, r] = e.split("-"), a = [];
  return n && a.push(n), r && a.push(r), a;
}
var HC = (e) => {
  var n, r, a, s, l, c, d, h, p, m, b;
  let { invert: w, toast: g, unstyled: x, interacting: y, setHeights: E, visibleToasts: R, heights: N, index: L, toasts: M, expanded: I, removeToast: O, defaultRichColors: D, closeButton: A, style: z, cancelButtonStyle: se, actionButtonStyle: ue, className: ce = "", descriptionClassName: ne = "", duration: Z, position: le, gap: X, loadingIcon: ge, expandByDefault: pe, classNames: H, icons: P, closeButtonAriaLabel: ae = "Close toast", pauseWhenPageIsHidden: U } = e, [B, G] = de.useState(null), [J, Q] = de.useState(null), [j, ve] = de.useState(!1), [he, re] = de.useState(!1), [me, ee] = de.useState(!1), [Le, qe] = de.useState(!1), [vt, $t] = de.useState(!1), [Re, Ue] = de.useState(0), [zt, St] = de.useState(0), rt = de.useRef(g.duration || Z || k0), ut = de.useRef(null), st = de.useRef(null), pt = L === 0, Qn = L + 1 <= R, bt = g.type, _t = g.dismissible !== !1, on = g.className || "", an = g.descriptionClassName || "", ot = de.useMemo(() => N.findIndex((Ne) => Ne.toastId === g.id) || 0, [N, g.id]), Wr = de.useMemo(() => {
    var Ne;
    return (Ne = g.closeButton) != null ? Ne : A;
  }, [g.closeButton, A]), qt = de.useMemo(() => g.duration || Z || k0, [g.duration, Z]), Wn = de.useRef(0), Yt = de.useRef(0), pr = de.useRef(0), gn = de.useRef(null), [gr, Hn] = le.split("-"), Bo = de.useMemo(() => N.reduce((Ne, je, lt) => lt >= ot ? Ne : Ne + je.height, 0), [N, ot]), Hr = SC(), $r = g.invert || w, zr = bt === "loading";
  Yt.current = de.useMemo(() => ot * X + Bo, [ot, Bo]), de.useEffect(() => {
    rt.current = qt;
  }, [qt]), de.useEffect(() => {
    ve(!0);
  }, []), de.useEffect(() => {
    let Ne = st.current;
    if (Ne) {
      let je = Ne.getBoundingClientRect().height;
      return St(je), E((lt) => [{ toastId: g.id, height: je, position: g.position }, ...lt]), () => E((lt) => lt.filter((Ye) => Ye.toastId !== g.id));
    }
  }, [E, g.id]), de.useLayoutEffect(() => {
    if (!j) return;
    let Ne = st.current, je = Ne.style.height;
    Ne.style.height = "auto";
    let lt = Ne.getBoundingClientRect().height;
    Ne.style.height = je, St(lt), E((Ye) => Ye.find((Kt) => Kt.toastId === g.id) ? Ye.map((Kt) => Kt.toastId === g.id ? { ...Kt, height: lt } : Kt) : [{ toastId: g.id, height: lt, position: g.position }, ...Ye]);
  }, [j, g.title, g.description, E, g.id]);
  let sn = de.useCallback(() => {
    re(!0), Ue(Yt.current), E((Ne) => Ne.filter((je) => je.toastId !== g.id)), setTimeout(() => {
      O(g);
    }, FC);
  }, [g, O, E, Yt]);
  de.useEffect(() => {
    if (g.promise && bt === "loading" || g.duration === 1 / 0 || g.type === "loading") return;
    let Ne;
    return I || y || U && Hr ? (() => {
      if (pr.current < Wn.current) {
        let je = (/* @__PURE__ */ new Date()).getTime() - Wn.current;
        rt.current = rt.current - je;
      }
      pr.current = (/* @__PURE__ */ new Date()).getTime();
    })() : rt.current !== 1 / 0 && (Wn.current = (/* @__PURE__ */ new Date()).getTime(), Ne = setTimeout(() => {
      var je;
      (je = g.onAutoClose) == null || je.call(g, g), sn();
    }, rt.current)), () => clearTimeout(Ne);
  }, [I, y, g, bt, U, Hr, sn]), de.useEffect(() => {
    g.delete && sn();
  }, [sn, g.delete]);
  function En() {
    var Ne, je, lt;
    return P != null && P.loading ? de.createElement("div", { className: jn(H?.loader, (Ne = g?.classNames) == null ? void 0 : Ne.loader, "sonner-loader"), "data-visible": bt === "loading" }, P.loading) : ge ? de.createElement("div", { className: jn(H?.loader, (je = g?.classNames) == null ? void 0 : je.loader, "sonner-loader"), "data-visible": bt === "loading" }, ge) : de.createElement(vC, { className: jn(H?.loader, (lt = g?.classNames) == null ? void 0 : lt.loader), visible: bt === "loading" });
  }
  return de.createElement("li", { tabIndex: 0, ref: st, className: jn(ce, on, H?.toast, (n = g?.classNames) == null ? void 0 : n.toast, H?.default, H?.[bt], (r = g?.classNames) == null ? void 0 : r[bt]), "data-sonner-toast": "", "data-rich-colors": (a = g.richColors) != null ? a : D, "data-styled": !(g.jsx || g.unstyled || x), "data-mounted": j, "data-promise": !!g.promise, "data-swiped": vt, "data-removed": he, "data-visible": Qn, "data-y-position": gr, "data-x-position": Hn, "data-index": L, "data-front": pt, "data-swiping": me, "data-dismissible": _t, "data-type": bt, "data-invert": $r, "data-swipe-out": Le, "data-swipe-direction": J, "data-expanded": !!(I || pe && j), style: { "--index": L, "--toasts-before": L, "--z-index": M.length - L, "--offset": `${he ? Re : Yt.current}px`, "--initial-height": pe ? "auto" : `${zt}px`, ...z, ...g.style }, onDragEnd: () => {
    ee(!1), G(null), gn.current = null;
  }, onPointerDown: (Ne) => {
    zr || !_t || (ut.current = /* @__PURE__ */ new Date(), Ue(Yt.current), Ne.target.setPointerCapture(Ne.pointerId), Ne.target.tagName !== "BUTTON" && (ee(!0), gn.current = { x: Ne.clientX, y: Ne.clientY }));
  }, onPointerUp: () => {
    var Ne, je, lt, Ye;
    if (Le || !_t) return;
    gn.current = null;
    let Kt = Number(((Ne = st.current) == null ? void 0 : Ne.style.getPropertyValue("--swipe-amount-x").replace("px", "")) || 0), xt = Number(((je = st.current) == null ? void 0 : je.style.getPropertyValue("--swipe-amount-y").replace("px", "")) || 0), Bt = (/* @__PURE__ */ new Date()).getTime() - ((lt = ut.current) == null ? void 0 : lt.getTime()), Vt = B === "x" ? Kt : xt, mn = Math.abs(Vt) / Bt;
    if (Math.abs(Vt) >= DC || mn > 0.11) {
      Ue(Yt.current), (Ye = g.onDismiss) == null || Ye.call(g, g), Q(B === "x" ? Kt > 0 ? "right" : "left" : xt > 0 ? "down" : "up"), sn(), qe(!0), $t(!1);
      return;
    }
    ee(!1), G(null);
  }, onPointerMove: (Ne) => {
    var je, lt, Ye, Kt;
    if (!gn.current || !_t || ((je = window.getSelection()) == null ? void 0 : je.toString().length) > 0) return;
    let xt = Ne.clientY - gn.current.y, Bt = Ne.clientX - gn.current.x, Vt = (lt = e.swipeDirections) != null ? lt : WC(le);
    !B && (Math.abs(Bt) > 1 || Math.abs(xt) > 1) && G(Math.abs(Bt) > Math.abs(xt) ? "x" : "y");
    let mn = { x: 0, y: 0 };
    B === "y" ? (Vt.includes("top") || Vt.includes("bottom")) && (Vt.includes("top") && xt < 0 || Vt.includes("bottom") && xt > 0) && (mn.y = xt) : B === "x" && (Vt.includes("left") || Vt.includes("right")) && (Vt.includes("left") && Bt < 0 || Vt.includes("right") && Bt > 0) && (mn.x = Bt), (Math.abs(mn.x) > 0 || Math.abs(mn.y) > 0) && $t(!0), (Ye = st.current) == null || Ye.style.setProperty("--swipe-amount-x", `${mn.x}px`), (Kt = st.current) == null || Kt.style.setProperty("--swipe-amount-y", `${mn.y}px`);
  } }, Wr && !g.jsx ? de.createElement("button", { "aria-label": ae, "data-disabled": zr, "data-close-button": !0, onClick: zr || !_t ? () => {
  } : () => {
    var Ne;
    sn(), (Ne = g.onDismiss) == null || Ne.call(g, g);
  }, className: jn(H?.closeButton, (s = g?.classNames) == null ? void 0 : s.closeButton) }, (l = P?.close) != null ? l : CC) : null, g.jsx || ga(g.title) ? g.jsx ? g.jsx : typeof g.title == "function" ? g.title() : g.title : de.createElement(de.Fragment, null, bt || g.icon || g.promise ? de.createElement("div", { "data-icon": "", className: jn(H?.icon, (c = g?.classNames) == null ? void 0 : c.icon) }, g.promise || g.type === "loading" && !g.icon ? g.icon || En() : null, g.type !== "loading" ? g.icon || P?.[bt] || gC(bt) : null) : null, de.createElement("div", { "data-content": "", className: jn(H?.content, (d = g?.classNames) == null ? void 0 : d.content) }, de.createElement("div", { "data-title": "", className: jn(H?.title, (h = g?.classNames) == null ? void 0 : h.title) }, typeof g.title == "function" ? g.title() : g.title), g.description ? de.createElement("div", { "data-description": "", className: jn(ne, an, H?.description, (p = g?.classNames) == null ? void 0 : p.description) }, typeof g.description == "function" ? g.description() : g.description) : null), ga(g.cancel) ? g.cancel : g.cancel && $s(g.cancel) ? de.createElement("button", { "data-button": !0, "data-cancel": !0, style: g.cancelButtonStyle || se, onClick: (Ne) => {
    var je, lt;
    $s(g.cancel) && _t && ((lt = (je = g.cancel).onClick) == null || lt.call(je, Ne), sn());
  }, className: jn(H?.cancelButton, (m = g?.classNames) == null ? void 0 : m.cancelButton) }, g.cancel.label) : null, ga(g.action) ? g.action : g.action && $s(g.action) ? de.createElement("button", { "data-button": !0, "data-action": !0, style: g.actionButtonStyle || ue, onClick: (Ne) => {
    var je, lt;
    $s(g.action) && ((lt = (je = g.action).onClick) == null || lt.call(je, Ne), !Ne.defaultPrevented && sn());
  }, className: jn(H?.actionButton, (b = g?.classNames) == null ? void 0 : b.actionButton) }, g.action.label) : null));
};
function M0() {
  if (typeof window > "u" || typeof document > "u") return "ltr";
  let e = document.documentElement.getAttribute("dir");
  return e === "auto" || !e ? window.getComputedStyle(document.documentElement).direction : e;
}
function $C(e, n) {
  let r = {};
  return [e, n].forEach((a, s) => {
    let l = s === 1, c = l ? "--mobile-offset" : "--offset", d = l ? AC : TC;
    function h(p) {
      ["top", "right", "bottom", "left"].forEach((m) => {
        r[`${c}-${m}`] = typeof p == "number" ? `${p}px` : p;
      });
    }
    typeof a == "number" || typeof a == "string" ? h(a) : typeof a == "object" ? ["top", "right", "bottom", "left"].forEach((p) => {
      a[p] === void 0 ? r[`${c}-${p}`] = d : r[`${c}-${p}`] = typeof a[p] == "number" ? `${a[p]}px` : a[p];
    }) : h(d);
  }), r;
}
yt(function(e, n) {
  let { invert: r, position: a = "bottom-right", hotkey: s = ["altKey", "KeyT"], expand: l, closeButton: c, className: d, offset: h, mobileOffset: p, theme: m = "light", richColors: b, duration: w, style: g, visibleToasts: x = NC, toastOptions: y, dir: E = M0(), gap: R = PC, loadingIcon: N, icons: L, containerAriaLabel: M = "Notifications", pauseWhenPageIsHidden: I } = e, [O, D] = de.useState([]), A = de.useMemo(() => Array.from(new Set([a].concat(O.filter((U) => U.position).map((U) => U.position)))), [O, a]), [z, se] = de.useState([]), [ue, ce] = de.useState(!1), [ne, Z] = de.useState(!1), [le, X] = de.useState(m !== "system" ? m : typeof window < "u" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), ge = de.useRef(null), pe = s.join("+").replace(/Key/g, "").replace(/Digit/g, ""), H = de.useRef(null), P = de.useRef(!1), ae = de.useCallback((U) => {
    D((B) => {
      var G;
      return (G = B.find((J) => J.id === U.id)) != null && G.delete || pn.dismiss(U.id), B.filter(({ id: J }) => J !== U.id);
    });
  }, []);
  return de.useEffect(() => pn.subscribe((U) => {
    if (U.dismiss) {
      D((B) => B.map((G) => G.id === U.id ? { ...G, delete: !0 } : G));
      return;
    }
    setTimeout(() => {
      lh.flushSync(() => {
        D((B) => {
          let G = B.findIndex((J) => J.id === U.id);
          return G !== -1 ? [...B.slice(0, G), { ...B[G], ...U }, ...B.slice(G + 1)] : [U, ...B];
        });
      });
    });
  }), []), de.useEffect(() => {
    if (m !== "system") {
      X(m);
      return;
    }
    if (m === "system" && (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? X("dark") : X("light")), typeof window > "u") return;
    let U = window.matchMedia("(prefers-color-scheme: dark)");
    try {
      U.addEventListener("change", ({ matches: B }) => {
        X(B ? "dark" : "light");
      });
    } catch {
      U.addListener(({ matches: G }) => {
        try {
          X(G ? "dark" : "light");
        } catch (J) {
          console.error(J);
        }
      });
    }
  }, [m]), de.useEffect(() => {
    O.length <= 1 && ce(!1);
  }, [O]), de.useEffect(() => {
    let U = (B) => {
      var G, J;
      s.every((Q) => B[Q] || B.code === Q) && (ce(!0), (G = ge.current) == null || G.focus()), B.code === "Escape" && (document.activeElement === ge.current || (J = ge.current) != null && J.contains(document.activeElement)) && ce(!1);
    };
    return document.addEventListener("keydown", U), () => document.removeEventListener("keydown", U);
  }, [s]), de.useEffect(() => {
    if (ge.current) return () => {
      H.current && (H.current.focus({ preventScroll: !0 }), H.current = null, P.current = !1);
    };
  }, [ge.current]), de.createElement("section", { ref: n, "aria-label": `${M} ${pe}`, tabIndex: -1, "aria-live": "polite", "aria-relevant": "additions text", "aria-atomic": "false", suppressHydrationWarning: !0 }, A.map((U, B) => {
    var G;
    let [J, Q] = U.split("-");
    return O.length ? de.createElement("ol", { key: U, dir: E === "auto" ? M0() : E, tabIndex: -1, ref: ge, className: d, "data-sonner-toaster": !0, "data-theme": le, "data-y-position": J, "data-lifted": ue && O.length > 1 && !l, "data-x-position": Q, style: { "--front-toast-height": `${((G = z[0]) == null ? void 0 : G.height) || 0}px`, "--width": `${OC}px`, "--gap": `${R}px`, ...g, ...$C(h, p) }, onBlur: (j) => {
      P.current && !j.currentTarget.contains(j.relatedTarget) && (P.current = !1, H.current && (H.current.focus({ preventScroll: !0 }), H.current = null));
    }, onFocus: (j) => {
      j.target instanceof HTMLElement && j.target.dataset.dismissible === "false" || P.current || (P.current = !0, H.current = j.relatedTarget);
    }, onMouseEnter: () => ce(!0), onMouseMove: () => ce(!0), onMouseLeave: () => {
      ne || ce(!1);
    }, onDragEnd: () => ce(!1), onPointerDown: (j) => {
      j.target instanceof HTMLElement && j.target.dataset.dismissible === "false" || Z(!0);
    }, onPointerUp: () => Z(!1) }, O.filter((j) => !j.position && B === 0 || j.position === U).map((j, ve) => {
      var he, re;
      return de.createElement(HC, { key: j.id, icons: L, index: ve, toast: j, defaultRichColors: b, duration: (he = y?.duration) != null ? he : w, className: y?.className, descriptionClassName: y?.descriptionClassName, invert: r, visibleToasts: x, closeButton: (re = y?.closeButton) != null ? re : c, interacting: ne, position: U, style: y?.style, unstyled: y?.unstyled, classNames: y?.classNames, cancelButtonStyle: y?.cancelButtonStyle, actionButtonStyle: y?.actionButtonStyle, removeToast: ae, toasts: O.filter((me) => me.position == j.position), heights: z.filter((me) => me.position == j.position), setHeights: se, expandByDefault: l, gap: R, loadingIcon: N, expanded: ue, pauseWhenPageIsHidden: I, swipeDirections: e.swipeDirections });
    })) : null;
  }));
});
const Uu = async (e, n = pC.noop) => {
  if (!window.document.hasFocus()) {
    I0.error("Unable to copy to clipboard");
    return;
  }
  try {
    if (typeof ClipboardItem < "u" && navigator.clipboard?.write) {
      const a = new ClipboardItem({
        "text/plain": Promise.resolve(e).then((d) => new Blob([d], { type: "text/plain" }))
      });
      let s = () => {
      }, l = () => {
      };
      const c = new Promise((d, h) => {
        s = d, l = h;
      });
      return setTimeout(() => {
        navigator.clipboard.write([a]).then(n).then(s).catch(l);
      }, 0), c;
    }
    await Promise.resolve(e).then((a) => navigator.clipboard?.writeText(a)), n();
  } catch {
    I0.error("Unable to copy to clipboard");
  }
}, yu = 768;
function zC() {
  const [e, n] = C.useState(void 0);
  return C.useEffect(() => {
    const r = window.matchMedia(`(max-width: ${yu - 1}px)`), a = () => {
      n(window.innerWidth < yu);
    };
    return r.addEventListener("change", a), n(window.innerWidth < yu), () => r.removeEventListener("change", a);
  }, []), !!e;
}
const BC = fr(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-control bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
), ag = C.forwardRef(
  ({ className: e, variant: n, size: r, asChild: a = !1, disabled: s, tabIndex: l, ...c }, d) => {
    const h = a ? Wo : "button", p = mo(l, s);
    return /* @__PURE__ */ f(
      h,
      {
        className: fe(BC({ variant: n, size: r, className: e })),
        ref: d,
        ...c,
        disabled: s,
        tabIndex: p
      }
    );
  }
);
ag.displayName = "Button";
const VC = fr(
  fe(
    "flex h-10 w-full rounded-md border border-control read-only:border-button bg-foreground/[.026] px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground-muted read-only:text-foreground-light",
    "focus:border-control focus-ring disabled:cursor-not-allowed disabled:text-foreground-muted",
    "aria-[] aria-[invalid=true]:bg-destructive-200 aria-[invalid=true]:border-destructive-400 aria-[invalid=true]:focus:border-destructive aria-[invalid=true]:focus-visible:border-destructive"
  ),
  {
    variants: {
      size: {
        ...rg
      }
    },
    defaultVariants: {
      size: og
    }
  }
), zo = C.forwardRef(
  ({ className: e, type: n, size: r = "small", ...a }, s) => /* @__PURE__ */ f("input", { type: n, ref: s, ...a, className: fe(VC({ size: r }), e) })
);
zo.displayName = "Input";
const ig = C.forwardRef(({ className: e, orientation: n = "horizontal", decorative: r = !0, ...a }, s) => /* @__PURE__ */ f(
  Z2,
  {
    ref: s,
    decorative: r,
    orientation: n,
    className: fe(
      "shrink-0 bg-border-muted",
      n === "horizontal" ? "h-px w-full" : "h-full w-px",
      e
    ),
    ...a
  }
));
ig.displayName = Z2.displayName;
const UC = j8, GC = C.forwardRef(({ disabled: e, tabIndex: n, ...r }, a) => {
  const s = mo(n, e);
  return /* @__PURE__ */ f(hp, { ref: a, ...r, disabled: e, tabIndex: s });
});
GC.displayName = hp.displayName;
const sg = ({ side: e, children: n, ...r }) => /* @__PURE__ */ f(pp, { ...r, children: n });
sg.displayName = pp.displayName;
const lg = C.forwardRef(({ className: e, children: n, ...r }, a) => /* @__PURE__ */ f(
  gp,
  {
    className: fe(
      "fixed inset-0 z-50 bg-alternative/90 backdrop-blur-xs transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
      e
    ),
    ...r,
    ref: a
  }
));
lg.displayName = gp.displayName;
const KC = fe([
  "fixed z-50 scale-100 gap-4 bg-popover opacity-100 shadow-lg",
  "data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:duration-300"
]), ZC = fr(KC, {
  variants: {
    side: {
      top: "data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top w-full border-b inset-x-0 top-0",
      bottom: "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom w-full border-t inset-x-0 bottom-0",
      left: "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left h-full border-r inset-y-0 left-0",
      right: "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right h-full border-l inset-y-0 right-0"
    },
    size: {
      content: "",
      default: "",
      sm: "",
      lg: "",
      xl: "",
      xxl: "",
      full: ""
    }
  },
  compoundVariants: [
    {
      side: ["top", "bottom"],
      size: "content",
      class: "max-h-screen"
    },
    {
      side: ["top", "bottom"],
      size: "default",
      class: "h-1/3"
    },
    {
      side: ["top", "bottom"],
      size: "sm",
      class: "h-1/4"
    },
    {
      side: ["top", "bottom"],
      size: "lg",
      class: "h-1/2"
    },
    {
      side: ["top", "bottom"],
      size: "xl",
      class: "h-5/6"
    },
    {
      side: ["top", "bottom"],
      size: "full",
      class: "h-screen"
    },
    {
      side: ["right", "left"],
      size: "content",
      class: "max-w-screen"
    },
    {
      side: ["right", "left"],
      size: "default",
      class: "lg:w-1/3"
    },
    {
      side: ["right", "left"],
      size: "sm",
      class: "lg:w-1/4"
    },
    {
      side: ["right", "left"],
      size: "lg",
      class: "lg:w-1/2"
    },
    {
      side: ["right", "left"],
      size: "xl",
      class: "lg:w-4/6"
    },
    {
      side: ["right", "left"],
      size: "xxl",
      class: "w-5/6"
    },
    {
      side: ["right", "left"],
      size: "full",
      class: "w-screen"
    }
  ],
  defaultVariants: {
    side: "right",
    size: "default"
  }
}), cg = C.forwardRef(({ side: e, size: n, className: r, children: a, showClose: s = !0, hasOverlay: l = !0, ...c }, d) => /* @__PURE__ */ V(sg, { side: e, children: [
  l && /* @__PURE__ */ f(lg, {}),
  /* @__PURE__ */ V(
    mp,
    {
      ref: d,
      className: fe(ZC({ side: e, size: n }), r),
      tabIndex: void 0,
      ...c,
      children: [
        a,
        s ? /* @__PURE__ */ V(
          q8,
          {
            className: fe(
              "absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus-ring disabled:pointer-events-none data-[state=open]:bg-secondary",
              "hit-area-6"
            ),
            children: [
              /* @__PURE__ */ f(Mh, { className: "h-4 w-4" }),
              /* @__PURE__ */ f("span", { className: "sr-only", children: "Close" })
            ]
          }
        ) : null
      ]
    }
  )
] }));
cg.displayName = mp.displayName;
const jC = C.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ f(vp, { ref: r, className: fe("text-lg text-foreground", e), ...n }));
jC.displayName = vp.displayName;
const qC = C.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ f(
  bp,
  {
    ref: r,
    className: fe("text-sm text-foreground-light", e),
    ...n
  }
));
qC.displayName = bp.displayName;
function L0({ className: e, ...n }) {
  return /* @__PURE__ */ f("div", { className: fe("animate-pulse rounded-md bg-muted", e), ...n });
}
const ug = aC, Ll = (e) => /* @__PURE__ */ f(iC, { ...e }), Nl = C.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ f(X2, { ref: r, ...n, className: fe(e) })), Si = C.forwardRef(({ className: e, sideOffset: n = 4, ...r }, a) => (
  // TooltipPortal was added because in some cases the tooltip was rendered behind other elements. This is a known issue
  // in shadcn/ui https://github.com/shadcn-ui/ui/issues/129. Radix UI has portal in its examples.
  /* @__PURE__ */ f(sC, { children: /* @__PURE__ */ f(
    ng,
    {
      ref: a,
      sideOffset: n,
      ...r,
      className: fe(
        "z-50 overflow-hidden rounded-md border bg-alternative px-3 py-1.5 text-xs text-foreground shadow-md animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
        e
      )
    }
  ) })
));
Si.displayName = ng.displayName;
const YC = "sidebar:state", XC = 3600 * 24 * 7, JC = "13rem", QC = "18rem", eS = "3rem", dg = C.createContext(null);
function Tl() {
  const e = C.useContext(dg);
  if (!e)
    throw new Error("useSidebar must be used within a SidebarProvider.");
  return e;
}
const fg = C.forwardRef(
  ({
    defaultOpen: e = !0,
    open: n,
    onOpenChange: r,
    className: a,
    style: s,
    children: l,
    ...c
  }, d) => {
    const h = zC(), [p, m] = C.useState(!1), [b, w] = C.useState(e), g = n ?? b, x = C.useCallback(
      (N) => {
        const L = typeof N == "function" ? N(g) : N;
        r ? r(L) : w(L), document.cookie = `${YC}=${L}; path=/; max-age=${XC}`;
      },
      [r, g]
    ), y = C.useCallback(() => h ? m((N) => !N) : x((N) => !N), [h, x, m]), E = g ? "expanded" : "collapsed", R = C.useMemo(
      () => ({
        state: E,
        open: g,
        setOpen: x,
        isMobile: h,
        openMobile: p,
        setOpenMobile: m,
        toggleSidebar: y
      }),
      [E, g, x, h, p, m, y]
    );
    return /* @__PURE__ */ f(dg.Provider, { value: R, children: /* @__PURE__ */ f(ug, { delayDuration: 0, children: /* @__PURE__ */ f(
      "div",
      {
        style: {
          "--sidebar-width": JC,
          "--sidebar-width-icon": eS,
          ...s
        },
        className: fe(
          "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
          a
        ),
        ref: d,
        ...c,
        children: l
      }
    ) }) });
  }
);
fg.displayName = "SidebarProvider";
const tS = C.forwardRef(
  ({
    overflowing: e = !1,
    side: n = "left",
    variant: r = "sidebar",
    collapsible: a = "offcanvas",
    className: s,
    children: l,
    ...c
  }, d) => {
    const { isMobile: h, state: p, openMobile: m, setOpenMobile: b } = Tl();
    return a === "none" ? /* @__PURE__ */ f(
      "div",
      {
        className: fe(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
          s
        ),
        ref: d,
        ...c,
        children: l
      }
    ) : h ? /* @__PURE__ */ f(UC, { open: m, onOpenChange: b, ...c, children: /* @__PURE__ */ f(
      cg,
      {
        "data-sidebar": "sidebar",
        "data-mobile": "true",
        className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
        style: {
          "--sidebar-width": QC
        },
        side: n,
        children: /* @__PURE__ */ f("div", { className: "flex h-full w-full flex-col", children: l })
      }
    ) }) : /* @__PURE__ */ V(
      "div",
      {
        ref: d,
        className: fe(
          e ? "w-12" : "",
          "relative group peer hidden md:block text-sidebar-foreground",
          "shrink-0"
        ),
        "data-state": p,
        "data-collapsible": p === "collapsed" ? a : "",
        "data-variant": r,
        "data-side": n,
        children: [
          /* @__PURE__ */ f(
            "div",
            {
              className: fe(
                e ? "absolute top-0" : "relative",
                "duration-100 h-full w-(--sidebar-width) bg-transparent transition-[width] ease-linear",
                "group-data-[collapsible=offcanvas]:w-0",
                "group-data-[side=right]:rotate-180",
                r === "floating" || r === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
              )
            }
          ),
          /* @__PURE__ */ f(
            "div",
            {
              className: fe(
                "absolute top-0 h-full",
                // sidebar custom changes - We have also removed 'fixed', and 'h-svh'
                //
                "duration-100 inset-y-0 z-10 hidden w-(--sidebar-width) transition-[left,right,width] ease-linear md:flex",
                n === "left" ? "left-0 group-data-[collapsible=offcanvas]:-left-(--sidebar-width)" : "right-0 group-data-[collapsible=offcanvas]:-right-(--sidebar-width)",
                // Adjust the padding for floating and inset variants.
                r === "floating" || r === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
                s
              ),
              ...c,
              children: /* @__PURE__ */ f(
                "div",
                {
                  "data-sidebar": "sidebar",
                  className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm",
                  children: l
                }
              )
            }
          )
        ]
      }
    );
  }
);
tS.displayName = "Sidebar";
const nS = C.forwardRef(({ className: e, onClick: n, ...r }, a) => {
  const { toggleSidebar: s } = Tl();
  return /* @__PURE__ */ V(
    ag,
    {
      ref: a,
      "data-sidebar": "trigger",
      variant: "ghost",
      size: "icon",
      className: fe("h-7 w-7", e),
      onClick: (l) => {
        n?.(l), s();
      },
      ...r,
      children: [
        /* @__PURE__ */ f(s7, {}),
        /* @__PURE__ */ f("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
});
nS.displayName = "SidebarTrigger";
const rS = C.forwardRef(
  ({ className: e, ...n }, r) => {
    const { toggleSidebar: a } = Tl();
    return /* @__PURE__ */ f(
      "button",
      {
        ref: r,
        "data-sidebar": "rail",
        "aria-label": "Toggle Sidebar",
        tabIndex: -1,
        onClick: a,
        title: "Toggle Sidebar",
        className: fe(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          e
        ),
        ...n
      }
    );
  }
);
rS.displayName = "SidebarRail";
const oS = C.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ f(
    "main",
    {
      ref: r,
      className: fe(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm",
        e
      ),
      ...n
    }
  )
);
oS.displayName = "SidebarInset";
const aS = C.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ f(
  zo,
  {
    ref: r,
    "data-sidebar": "input",
    className: fe(
      "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
      e
    ),
    ...n
  }
));
aS.displayName = "SidebarInput";
const iS = C.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ f(
    "div",
    {
      ref: r,
      "data-sidebar": "header",
      className: fe("flex flex-col gap-2 p-2", e),
      ...n
    }
  )
);
iS.displayName = "SidebarHeader";
const sS = C.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ f(
    "div",
    {
      ref: r,
      "data-sidebar": "footer",
      className: fe("flex flex-col gap-2 p-2", e),
      ...n
    }
  )
);
sS.displayName = "SidebarFooter";
const lS = C.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ f(
  ig,
  {
    ref: r,
    "data-sidebar": "separator",
    className: fe("mx-2 w-auto bg-sidebar-border", e),
    ...n
  }
));
lS.displayName = "SidebarSeparator";
const hg = C.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ f(
    "div",
    {
      ref: r,
      "data-sidebar": "content",
      className: fe(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        e
      ),
      ...n
    }
  )
);
hg.displayName = "SidebarContent";
const cS = C.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ f(
    "div",
    {
      ref: r,
      "data-sidebar": "group",
      className: fe("relative flex w-full min-w-0 flex-col p-2", e),
      ...n
    }
  )
);
cS.displayName = "SidebarGroup";
const uS = C.forwardRef(({ className: e, asChild: n = !1, ...r }, a) => /* @__PURE__ */ f(
  n ? Wo : "div",
  {
    ref: a,
    "data-sidebar": "group-label",
    className: fe(
      "duration-100 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-hidden ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-5 [&>svg]:shrink-0",
      "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
      e
    ),
    ...r
  }
));
uS.displayName = "SidebarGroupLabel";
const dS = C.forwardRef(({ className: e, asChild: n = !1, disabled: r, tabIndex: a, ...s }, l) => {
  const c = n ? Wo : "button", d = mo(a, r);
  return /* @__PURE__ */ f(
    c,
    {
      ref: l,
      "data-sidebar": "group-action",
      className: fe(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-5 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        e
      ),
      ...s,
      disabled: r,
      tabIndex: d
    }
  );
});
dS.displayName = "SidebarGroupAction";
const fS = C.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ f(
    "div",
    {
      ref: r,
      "data-sidebar": "group-content",
      className: fe("w-full text-sm", e),
      ...n
    }
  )
);
fS.displayName = "SidebarGroupContent";
const hS = C.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ f(
    "ul",
    {
      ref: r,
      "data-sidebar": "menu",
      className: fe("flex w-full min-w-0 flex-col gap-1", e),
      ...n
    }
  )
);
hS.displayName = "SidebarMenu";
const pg = C.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ f(
    "li",
    {
      ref: r,
      "data-sidebar": "menu-item",
      className: fe("group/menu-item relative", e),
      ...n
    }
  )
);
pg.displayName = "SidebarMenuItem";
const pS = fr(
  fe(
    "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md py-2 px-1.5 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent/50 active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent/50 data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-5 [&>svg]:shrink-0 text-foreground-lighter data-[active=true]:text-foreground"
  ),
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
      },
      hasIcon: {
        true: "group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:pl-1.5! group-data-[collapsible=icon]:pr-2!",
        false: ""
      },
      isLoading: {
        // When data necessary to check whether an item should be disabled is not yet available, override the styles to avoid
        // showing the disabled state just for a moment
        true: "disabled:opacity-100 aria-disabled:opacity-100",
        // If the item is not loading, fallback to the default styles so that disabled state is handled properly
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hasIcon: !0
    }
  }
), gg = C.forwardRef(
  ({
    asChild: e = !1,
    isActive: n = !1,
    variant: r = "default",
    size: a = "default",
    hasIcon: s = !0,
    isLoading: l = !1,
    tooltip: c,
    className: d,
    ...h
  }, p) => {
    const m = e ? Wo : "button", { isMobile: b, state: w } = Tl(), { disabled: g, tabIndex: x, ...y } = h, E = mo(x, g), R = /* @__PURE__ */ f(
      m,
      {
        ref: p,
        "data-sidebar": "menu-button",
        "data-size": a,
        "data-active": n,
        "data-has-icon": s,
        className: fe(pS({ variant: r, size: a, hasIcon: s, isLoading: l }), d),
        ...y,
        disabled: g,
        tabIndex: E
      }
    );
    return c ? (typeof c == "string" && (c = {
      children: c
    }), /* @__PURE__ */ V(Ll, { children: [
      /* @__PURE__ */ f(Nl, { asChild: !0, children: R }),
      /* @__PURE__ */ f(
        Si,
        {
          side: "right",
          align: "center",
          hidden: w !== "collapsed" || b,
          ...c
        }
      )
    ] })) : R;
  }
);
gg.displayName = "SidebarMenuButton";
const gS = C.forwardRef(({ className: e, asChild: n = !1, showOnHover: r = !1, disabled: a, tabIndex: s, ...l }, c) => {
  const d = n ? Wo : "button", h = mo(s, a);
  return /* @__PURE__ */ f(
    d,
    {
      ref: c,
      "data-sidebar": "menu-action",
      className: fe(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-5 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        r && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        e
      ),
      ...l,
      disabled: a,
      tabIndex: h
    }
  );
});
gS.displayName = "SidebarMenuAction";
const mS = C.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ f(
    "div",
    {
      ref: r,
      "data-sidebar": "menu-badge",
      className: fe(
        "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        e
      ),
      ...n
    }
  )
);
mS.displayName = "SidebarMenuBadge";
const vS = C.forwardRef(({ className: e, showIcon: n = !1, ...r }, a) => {
  const s = C.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, []);
  return /* @__PURE__ */ V(
    "div",
    {
      ref: a,
      "data-sidebar": "menu-skeleton",
      className: fe("rounded-md h-8 flex gap-2 px-2 items-center", e),
      ...r,
      children: [
        n && /* @__PURE__ */ f(L0, { className: "size-4 rounded-md", "data-sidebar": "menu-skeleton-icon" }),
        /* @__PURE__ */ f(
          L0,
          {
            className: "h-4 flex-1 max-w-(--skeleton-width)",
            "data-sidebar": "menu-skeleton-text",
            style: {
              "--skeleton-width": s
            }
          }
        )
      ]
    }
  );
});
vS.displayName = "SidebarMenuSkeleton";
const bS = C.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ f(
    "ul",
    {
      ref: r,
      "data-sidebar": "menu-sub",
      className: fe(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        e
      ),
      ...n
    }
  )
);
bS.displayName = "SidebarMenuSub";
const yS = C.forwardRef(
  ({ ...e }, n) => /* @__PURE__ */ f("li", { ref: n, ...e })
);
yS.displayName = "SidebarMenuSubItem";
const wS = C.forwardRef(({ asChild: e = !1, size: n = "md", isActive: r, className: a, ...s }, l) => /* @__PURE__ */ f(
  e ? Wo : "a",
  {
    ref: l,
    "data-sidebar": "menu-sub-button",
    "data-size": n,
    "data-active": r,
    className: fe(
      "flex h-6 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-hidden ring-sidebar-ring hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent/50 active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
      "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
      n === "sm" && "text-xs",
      n === "md" && "text-sm",
      "group-data-[collapsible=icon]:hidden",
      a
    ),
    ...s
  }
));
wS.displayName = "SidebarMenuSubButton";
const xS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, CS = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().trim(), SS = (e) => e.replace(/-([a-z])/g, (n, r) => r.toUpperCase()).trim(), _S = (e) => {
  const n = {};
  for (const [r, a] of Object.entries(e)) {
    const s = r.includes("-") ? SS(r) : r;
    n[s] = a;
  }
  return n;
}, Ve = (e, n, r) => {
  const a = yt(
    ({ color: s, size: l = 24, strokeWidth: c, absoluteStrokeWidth: d, className: h = "", children: p, ...m }, b) => lr(
      "svg",
      {
        ref: b,
        ...xS,
        ...r,
        width: l,
        height: l,
        ...s !== void 0 && { stroke: s },
        ...c !== void 0 && {
          strokeWidth: d ? Number(c) * 24 / Number(l) : c
        },
        className: ["lucide", `lucide-${CS(e)}`, h].join(" "),
        ...m
      },
      [
        ...n.map(
          ([w, g]) => lr(w, _S(g))
        ),
        ...Array.isArray(p) ? p : [p]
      ]
    )
  );
  return a.displayName = `${e}`, a;
};
Ve(
  "RESTApi",
  [
    [
      "path",
      {
        d: "M3.20947 12.1052C3.20947 13.4403 3.50715 14.706 4.03977 15.8394M11.9997 3.31494C10.6391 3.31494 9.35066 3.62408 8.20085 4.17594M20.7899 12.1052C20.7899 10.7566 20.4862 9.47898 19.9435 8.33694M11.9997 20.8954C13.3576 20.8954 14.6436 20.5875 15.7917 20.0377M15.7917 20.0377C16.3334 20.818 17.236 21.3289 18.2578 21.3289C19.9147 21.3289 21.2578 19.9857 21.2578 18.3289C21.2578 16.672 19.9147 15.3289 18.2578 15.3289C16.601 15.3289 15.2578 16.672 15.2578 18.3289C15.2578 18.9639 15.4551 19.5528 15.7917 20.0377ZM4.03977 15.8394C3.24022 16.3782 2.71436 17.2921 2.71436 18.3289C2.71436 19.9857 4.0575 21.3289 5.71436 21.3289C7.37121 21.3289 8.71436 19.9857 8.71436 18.3289C8.71436 16.672 7.37121 15.3289 5.71436 15.3289C5.09422 15.3289 4.51803 15.517 4.03977 15.8394ZM8.20085 4.17594C7.66158 3.3789 6.74915 2.85498 5.71436 2.85498C4.0575 2.85498 2.71436 4.19813 2.71436 5.85498C2.71436 7.51183 4.0575 8.85498 5.71436 8.85498C7.37121 8.85498 8.71436 7.51183 8.71436 5.85498C8.71436 5.23292 8.52503 4.65508 8.20085 4.17594ZM19.9435 8.33694C20.7368 7.79709 21.2578 6.88688 21.2578 5.85498C21.2578 4.19813 19.9147 2.85498 18.2578 2.85498C16.601 2.85498 15.2578 4.19813 15.2578 5.85498C15.2578 7.51183 16.601 8.85498 18.2578 8.85498C18.8828 8.85498 19.4631 8.66388 19.9435 8.33694Z",
        key: "xusdjk"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "ExampleTemplate",
  [
    ["path", { d: "M3.5 13h6", key: "p1my2r" }],
    ["path", { d: "m2 16 4.5-9 4.5 9", key: "ndf0b3" }],
    ["path", { d: "M18 7v9", key: "pknjwm" }],
    ["path", { d: "m14 12 4 4 4-4", key: "buelq4" }]
  ],
  {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
);
Ve(
  "AnalyticsBucket",
  [
    [
      "path",
      {
        d: "M20 20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V8C22 7.46957 21.7893 6.96086 21.4142 6.58579C21.0391 6.21071 20.5304 6 20 6H12.1C11.7655 6.00328 11.4355 5.92261 11.1403 5.76538C10.8451 5.60815 10.594 5.37938 10.41 5.1L9.6 3.9C9.41789 3.62347 9.16997 3.39648 8.8785 3.2394C8.58702 3.08231 8.26111 3.00005 7.93 3H4C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20Z",
        key: "1fllth"
      }
    ],
    ["path", { d: "M7.5 9V16", key: "1muhf2" }],
    ["path", { d: "M10.5 12.5L10.5 16", key: "19mfck" }],
    ["path", { d: "M13.5 14.5L13.5 16", key: "10gg8b" }],
    ["path", { d: "M16.5 11V16", key: "gfrkai" }]
  ],
  {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
);
Ve(
  "ApiDocs",
  [
    [
      "path",
      {
        d: "M7.44434 14.3347H16.4443M7.44434 11.3347H16.4443M7.44434 17.3347H13.4443M19.4994 8.50714V19.1052C19.4994 20.2097 18.6039 21.1052 17.4994 21.1052H6.5C5.39543 21.1052 4.5 20.2097 4.5 19.1052V5.10596C4.5 4.00139 5.39543 3.10596 6.5 3.10596H14.0723L19.4994 8.50714ZM19.4465 8.48193L14.0704 3.10596L14.0701 7.48186C14.0701 8.03418 14.5178 8.48193 15.0701 8.48193L19.4465 8.48193Z",
        key: "2ysat9"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
const ES = Ve(
  "Auth",
  [
    [
      "path",
      {
        d: "M5.24121 15.0674H12.7412M5.24121 15.0674V18.0674H12.7412V15.0674M5.24121 15.0674V12.0674H12.7412V15.0674M15 7.60547V4.60547C15 2.94861 13.6569 1.60547 12 1.60547C10.3431 1.60547 9 2.94861 9 4.60547V7.60547M5.20898 9.60547L5.20898 19.1055C5.20898 20.21 6.10441 21.1055 7.20898 21.1055H16.709C17.8136 21.1055 18.709 20.21 18.709 19.1055V9.60547C18.709 8.5009 17.8136 7.60547 16.709 7.60547L7.20899 7.60547C6.10442 7.60547 5.20898 8.5009 5.20898 9.60547Z",
        key: "h65u22"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "Axiom",
  [
    [
      "path",
      {
        d: "M 23.824492,16.101047 18.697784,7.5269656 C 18.462679,7.1329038 17.883366,6.8104899 17.410325,6.8104899 h -3.200668 c -0.743945,0 -1.048898,-0.5065215 -0.67786,-1.125563 L 15.287074,2.75713 C 15.42634,2.5247735 15.426012,2.2387191 15.286324,2.0066059 15.146542,1.7744969 14.888473,1.6315507 14.609187,1.6315507 h -4.465049 c -0.4729825,0 -1.0535554,0.3216893 -1.290197,0.7148795 L 0.17762774,16.761293 c -0.23673156,0.393192 -0.23682129,1.036667 -3.6307e-4,1.429919 L 2.4097502,21.90405 c 0.3720043,0.618588 0.9820278,0.61931 1.3555632,0.0015 l 1.7443949,-2.884388 c 0.3736551,-0.617749 0.9835605,-0.617029 1.3555637,0.0015 l 1.5815041,2.630191 c 0.2364309,0.393185 0.8169143,0.714938 1.2899274,0.714938 H 20.05443 c 0.472831,0 1.053407,-0.321753 1.289869,-0.715004 l 2.477607,-4.120324 c 0.236463,-0.393283 0.237603,-1.037479 0.0025,-1.431569 z m -6.923723,-0.412663 c 0.369656,0.619824 0.06344,1.127037 -0.680475,1.127037 H 8.1947483 c -0.7439152,0 -1.0482959,-0.50619 -0.6762645,-1.124755 L 11.534323,9.0120892 c 0.371972,-0.6185912 0.980616,-0.6185912 1.352588,3e-5 z",
        fill: "currentColor",
        key: "8eugby"
      }
    ]
  ],
  { fill: "none", stroke: "none" }
);
Ve(
  "BigQuery",
  [
    [
      "path",
      {
        d: "M7.48981 17.898L7.48981 9.65308M10.8368 18.7552L10.8368 7.53063M14.1837 18.0205V12.0204M21 21.0817L16.4286 16.5103M18.7552 10.8776C18.7552 15.2282 15.2282 18.7552 10.8776 18.7552C6.52691 18.7552 3 15.2282 3 10.8776C3 6.52691 6.52691 3 10.8776 3C15.2282 3 18.7552 6.52691 18.7552 10.8776Z",
        key: "odzl1c"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }
);
Ve(
  "BoxPlus",
  [
    [
      "path",
      {
        d: "M20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998",
        key: "nj2e2u"
      }
    ],
    ["path", { d: "M3.3 7L12 12L20.7 7", key: "kvxu76" }],
    ["path", { d: "M12 22V12", key: "d0xqtd" }],
    ["path", { d: "M19 14V20", key: "1dhl6z" }],
    ["path", { d: "M16 17H22", key: "3xswwu" }]
  ],
  {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
);
Ve(
  "BucketPlus",
  [
    ["path", { d: "M19 13V19", key: "1ewk5i" }],
    ["path", { d: "M16 16H22", key: "qkkdxb" }],
    [
      "path",
      {
        d: "M13.5 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H7.93C8.26111 3.00005 8.58702 3.08231 8.8785 3.2394C9.16997 3.39648 9.41789 3.62347 9.6 3.9L10.41 5.1C10.594 5.37938 10.8451 5.60815 11.1403 5.76538C11.4355 5.92261 11.7655 6.00328 12.1 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V10",
        key: "zt8kw3"
      }
    ]
  ],
  {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
);
Ve(
  "Chatgpt",
  [
    [
      "path",
      {
        d: "M20.5647 10.1815C21.0185 8.8202 20.8627 7.3302 20.138 6.09079C19.0476 4.19442 16.8532 3.21915 14.713 3.67292C13.7581 2.60283 12.39 1.99328 10.9542 2.00006C8.76659 2.00006 6.82281 3.40879 6.14554 5.48801C4.73681 5.77924 3.52449 6.6597 2.81335 7.90588C1.71617 9.80225 1.96676 12.1863 3.43644 13.8117C2.98267 15.173 3.13844 16.663 3.86312 17.8957C4.95354 19.7988 7.1479 20.7741 9.29486 20.3203C10.243 21.3904 11.6111 22.0067 13.047 21.9999C15.2345 21.9999 17.1783 20.5912 17.8556 18.512C19.2643 18.2208 20.4766 17.3403 21.181 16.0941C22.285 14.1978 22.0344 11.8138 20.5647 10.1883V10.1815ZM19.007 6.74774C19.4404 7.50629 19.603 8.39352 19.454 9.25366C19.4269 9.23334 19.3727 9.20625 19.3388 9.18593L15.3565 6.8832C15.1533 6.76806 14.9027 6.76806 14.6995 6.8832L10.0331 9.57875V7.60111L13.8868 5.37288C15.6815 4.33665 17.9707 4.95297 19.007 6.74774ZM10.0331 10.8588L11.9972 9.72097L13.9613 10.8588V13.1277L11.9972 14.2655L10.0331 13.1277V10.8588ZM10.9474 3.30719C11.8279 3.30719 12.6745 3.61197 13.3517 4.1741C13.3246 4.18765 13.2705 4.22151 13.2298 4.24183L9.24745 6.53779C9.04427 6.65293 8.92236 6.86965 8.92236 7.1067V12.4978L7.20886 11.509V7.05252C7.20886 4.98006 8.88172 3.30719 10.9542 3.30042L10.9474 3.30719ZM3.95117 8.56284C4.3914 7.80429 5.07544 7.22184 5.90172 6.91706V11.6512C5.90172 11.8883 6.02363 12.0982 6.22681 12.2201L10.8865 14.9089L9.16618 15.9045L5.31926 13.683C3.53126 12.6468 2.91494 10.3576 3.95117 8.56284ZM5.00094 17.2523C4.56072 16.5005 4.40494 15.6065 4.55394 14.7463C4.58103 14.7667 4.63522 14.7938 4.66908 14.8141L8.65145 17.1168C8.85463 17.2319 9.10522 17.2319 9.3084 17.1168L13.968 14.4213V16.3989L10.1144 18.6204C8.31958 19.6498 6.0304 19.0403 4.99417 17.2523H5.00094ZM13.0537 20.6928C12.18 20.6928 11.3267 20.388 10.6562 19.8259C10.6833 19.8124 10.7442 19.7785 10.7781 19.7582L14.7605 17.4622C14.9636 17.3471 15.0923 17.1303 15.0855 16.8933V11.509L16.799 12.4978V16.9475C16.799 19.0199 15.1194 20.6996 13.0537 20.6996V20.6928ZM20.0567 15.4372C19.6165 16.1957 18.9257 16.7782 18.1062 17.0762V12.342C18.1062 12.105 17.9843 11.8883 17.7811 11.7731L13.1147 9.07756L14.8282 8.08875L18.6819 10.3102C20.4766 11.3464 21.0862 13.6356 20.05 15.4304L20.0567 15.4372Z",
        fill: "currentColor",
        key: "vyxlm7"
      }
    ]
  ],
  { fill: "none", stroke: "none" }
);
Ve(
  "Claude",
  [
    [
      "path",
      {
        d: "M5.92381 15.2988L9.85798 13.0912L9.92381 12.8988L9.85798 12.7924H9.66558L9.00735 12.7519L6.75925 12.6912L4.80988 12.6102L2.92127 12.5089L2.44533 12.4076L1.99976 11.8203L2.04533 11.5266L2.44533 11.2583L3.01748 11.3089L4.2833 11.395L6.18203 11.5266L7.55925 11.6076L9.59976 11.8203H9.92381L9.96938 11.6886L9.85798 11.6076L9.77191 11.5266L7.80735 10.195L5.68077 8.78737L4.56684 7.97724L3.96431 7.56711L3.66052 7.1823L3.52887 6.3418L4.07571 5.73927L4.80988 5.7899L4.99722 5.84053L5.74153 6.41268L7.3314 7.64306L9.40735 9.17218L9.71115 9.42534L9.83267 9.33927L9.84786 9.27851L9.71115 9.05066L8.58203 7.01015L7.37697 4.9342L6.84026 4.07344L6.69849 3.55699C6.64786 3.34433 6.61241 3.16712 6.61241 2.94939L7.2352 2.10382L7.5795 1.99243L8.40988 2.10382L8.75925 2.40762L9.27571 3.58737L10.1111 5.4456L11.4074 7.97218L11.7871 8.72154L11.9896 9.41522L12.0656 9.62787H12.1972V9.50635L12.3036 8.08357L12.501 6.33673L12.6934 4.08863L12.7592 3.45572L13.0732 2.69623L13.696 2.2861L14.182 2.51901L14.582 3.09117L14.5263 3.46079L14.2884 5.00509L13.8225 7.42534L13.5187 9.0456H13.696L13.8985 8.84306L14.7187 7.75446L16.096 6.03294L16.7036 5.34939L17.4124 4.59496L17.8681 4.23547H18.7289L19.3618 5.17724L19.0782 6.14939L18.1922 7.27344L17.458 8.22534L16.4048 9.64306L15.7466 10.7772L15.8074 10.8684L15.9643 10.8532L18.3441 10.3469L19.6301 10.114L21.1643 9.85066L21.858 10.1747L21.9339 10.5038L21.6605 11.1772L20.02 11.5823L18.096 11.9671L15.2301 12.6456L15.1947 12.6709L15.2352 12.7215L16.5263 12.8431L17.0782 12.8734H18.4301L20.9466 13.0608L21.6048 13.4962L21.9998 14.0279L21.9339 14.4329L20.9213 14.9494L19.5542 14.6253L16.3643 13.8658L15.2706 13.5924H15.1187V13.6836L16.0301 14.5747L17.701 16.0836L19.7922 18.0279L19.8985 18.5089L19.6301 18.8886L19.3466 18.8481L17.5086 17.4658L16.7998 16.8431L15.1947 15.4912H15.0884V15.6329L15.458 16.1747L17.4124 19.1114L17.5137 20.0127L17.3719 20.3064L16.8656 20.4836L16.3086 20.3823L15.1643 18.7772L13.9846 16.9696L13.0327 15.3494L12.9162 15.4152L12.3542 21.4658L12.0909 21.7747L11.4833 22.0076L10.977 21.6228L10.7086 21L10.977 19.7696L11.301 18.1646L11.5643 16.8886L11.8023 15.3038L11.9441 14.7772L11.9339 14.7418L11.8175 14.757L10.6225 16.3975L8.80482 18.8532L7.36684 20.3924L7.02254 20.5291L6.42507 20.2203L6.48077 19.6684L6.81495 19.1772L8.80482 16.6456L10.0048 15.076L10.7795 14.1696L10.7744 14.038H10.7289L5.44279 17.4709L4.50102 17.5924L4.09596 17.2127L4.14659 16.5899L4.339 16.3874L5.92887 15.2937L5.92381 15.2988Z",
        fill: "currentColor",
        key: "1ps7sa"
      }
    ]
  ],
  { fill: "none", stroke: "none" }
);
Ve(
  "ClickHouse",
  [["path", { d: "M3 3V21M7.5 3V21M12 3V21M16.5 3V21M21 10V14", key: "tw32au" }]],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }
);
const RS = Ve(
  "Database",
  [
    ["path", { d: " M5.56774 9.70642H18.4547V15.7064H5.56774V9.70642Z", key: "g5hndz" }],
    [
      "path",
      {
        d: ` M4.5 16.7094C4.5 16.1571 4.94772 15.7094 5.5 15.7094H18.5C19.0523 15.7094 19.5 16.1571 19.5
        16.7094V20.7094C19.5 21.2616 19.0523 21.7094 18.5 21.7094H5.5C4.94772 21.7094 4.5 21.2616 4.5
        20.7094V16.7094Z`,
        key: "1m5ehm"
      }
    ],
    [
      "path",
      {
        d: "M4.5 4.70679C4.5 4.1545 4.94772 3.70679 5.5 3.70679H18.5C19.0523 3.70679 19.5 4.1545 19.5 4.70679V8.70679C19.5 9.25907 19.0523 9.70679 18.5 9.70679H5.5C4.94772 9.70679 4.5 9.25907 4.5 8.70679V4.70679Z",
        key: "1w4kbe"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "Datadog",
  [
    [
      "path",
      {
        d: "M19.57 17.04l-1.997-1.316-1.665 2.782-1.937-.567-1.706 2.604.087.82 9.274-1.71-.538-5.794zm-8.649-2.498l1.488-.204c.241.108.409.15.697.223.45.117.97.23 1.741-.16.18-.088.553-.43.704-.625l6.096-1.106.622 7.527-10.444 1.882zm11.325-2.712l-.602.115L20.488 0 .789 2.285l2.427 19.693 2.306-.334c-.184-.263-.471-.581-.96-.989-.68-.564-.44-1.522-.039-2.127.53-1.022 3.26-2.322 3.106-3.956-.056-.594-.15-1.368-.702-1.898-.02.22.017.432.017.432s-.227-.289-.34-.683c-.112-.15-.2-.199-.319-.4-.085.233-.073.503-.073.503s-.186-.437-.216-.807c-.11.166-.137.48-.137.48s-.241-.69-.186-1.062c-.11-.323-.436-.965-.343-2.424.6.421 1.924.321 2.44-.439.171-.251.288-.939-.086-2.293-.24-.868-.835-2.16-1.066-2.651l-.028.02c.122.395.374 1.223.47 1.625.293 1.218.372 1.642.234 2.204-.116.488-.397.808-1.107 1.165-.71.358-1.653-.514-1.713-.562-.69-.55-1.224-1.447-1.284-1.883-.062-.477.275-.763.445-1.153-.243.07-.514.192-.514.192s.323-.334.722-.624c.165-.109.262-.178.436-.323a9.762 9.762 0 0 0-.456.003s.42-.227.855-.392c-.318-.014-.623-.003-.623-.003s.937-.419 1.678-.727c.509-.208 1.006-.147 1.286.257.367.53.752.817 1.569.996.501-.223.653-.337 1.284-.509.554-.61.99-.688.99-.688s-.216.198-.274.51c.314-.249.66-.455.66-.455s-.134.164-.259.426l.03.043c.366-.22.797-.394.797-.394s-.123.156-.268.358c.277-.002.838.012 1.056.037 1.285.028 1.552-1.374 2.045-1.55.618-.22.894-.353 1.947.68.903.888 1.609 2.477 1.259 2.833-.294.295-.874-.115-1.516-.916a3.466 3.466 0 0 1-.716-1.562 1.533 1.533 0 0 0-.497-.85s.23.51.23.96c0 .246.03 1.165.424 1.68-.039.076-.057.374-.1.43-.458-.554-1.443-.95-1.604-1.067.544.445 1.793 1.468 2.273 2.449.453.927.186 1.777.416 1.997.065.063.976 1.197 1.15 1.767.306.994.019 2.038-.381 2.685l-1.117.174c-.163-.045-.273-.068-.42-.153.08-.143.241-.5.243-.572l-.063-.111c-.348.492-.93.97-1.414 1.245-.633.359-1.363.304-1.838.156-1.348-.415-2.623-1.327-2.93-1.566 0 0-.01.191.048.234.34.383 1.119 1.077 1.872 1.56l-1.605.177.759 5.908c-.337.048-.39.071-.757.124-.325-1.147-.946-1.895-1.624-2.332-.599-.384-1.424-.47-2.214-.314l-.05.059a2.851 2.851 0 0 1 1.863.444c.654.413 1.181 1.481 1.375 2.124.248.822.42 1.7-.248 2.632-.476.662-1.864 1.028-2.986.237.3.481.705.876 1.25.95.809.11 1.577-.03 2.106-.574.452-.464.69-1.434.628-2.456l.714-.104.258 1.834 11.827-1.424zM15.05 6.848c-.034.075-.085.125-.007.37l.004.014.013.032.032.073c.14.287.295.558.552.696.067-.011.136-.019.207-.023.242-.01.395.028.492.08.009-.048.01-.119.005-.222-.018-.364.072-.982-.626-1.308-.264-.122-.634-.084-.757.068a.302.302 0 0 1 .058.013c.186.066.06.13.027.207m1.958 3.392c-.092-.05-.52-.03-.821.005-.574.068-1.193.267-1.328.372-.247.191-.135.523.047.66.511.382.96.638 1.432.575.29-.038.546-.497.728-.914.124-.288.124-.598-.058-.698m-5.077-2.942c.162-.154-.805-.355-1.556.156-.554.378-.571 1.187-.041 1.646.053.046.096.078.137.104a4.77 4.77 0 0 1 1.396-.412c.113-.125.243-.345.21-.745-.044-.542-.455-.456-.146-.749",
        key: "13qbml"
      }
    ]
  ],
  { fill: "currentColor", stroke: "none" }
);
Ve(
  "EdgeFunctions",
  [
    [
      "path",
      {
        d: "M18 12.1055C18 15.4192 15.3137 18.1055 12 18.1055C8.6863 18.1055 6.00001 15.4192 6.00001 12.1055C6.00001 8.79176 8.6863 6.10547 12 6.10547C15.3137 6.10547 18 8.79176 18 12.1055Z",
        key: "1vv84o"
      }
    ],
    [
      "path",
      {
        d: "M21.3999 5.70154C21.3999 7.35839 20.0568 8.70154 18.3999 8.70154C16.7431 8.70154 15.3999 7.35839 15.3999 5.70154C15.3999 4.04468 16.7431 2.70154 18.3999 2.70154C20.0568 2.70154 21.3999 4.04468 21.3999 5.70154Z",
        key: "1vzce8"
      }
    ],
    [
      "path",
      {
        d: "M8.62216 18.4363C8.62216 20.0932 7.27902 21.4363 5.62216 21.4363C3.96531 21.4363 2.62216 20.0932 2.62216 18.4363C2.62216 16.7795 3.96531 15.4363 5.62216 15.4363C7.27902 15.4363 8.62216 16.7795 8.62216 18.4363Z",
        key: "s8poqq"
      }
    ],
    [
      "path",
      {
        d: "M3.18121 16.2691C2.58401 15.0065 2.25 13.595 2.25 12.1055C2.25 6.72069 6.61522 2.35547 12 2.35547C13.4893 2.35547 14.9005 2.68937 16.163 3.28638M7.68679 20.852C8.98715 21.4944 10.4514 21.8555 12 21.8555C17.3848 21.8555 21.75 17.4902 21.75 12.1055C21.75 10.6162 21.4161 9.20493 20.8191 7.94242",
        key: "xs92pm"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "Elastic",
  [
    [
      "path",
      {
        fill: "#0B64DD",
        stroke: "#fff",
        "stroke-width": "1.2",
        d: "M27.565 11.242c5.1 1.94 4.872 9.396-.245 11.127l-.162.055-.167-.039-5.28-1.238-.268-.063-.127-.244-1.4-2.69-.217-.417.352-.31 6.904-6.07.272-.24.338.13Z",
        key: "el1"
      }
    ],
    [
      "path",
      {
        fill: "#9ADC30",
        stroke: "#fff",
        "stroke-width": "1.2",
        d: "m22.047 21.239 4.8 1.125.316.074.11.304.066.19c.623 1.964-.26 3.78-1.652 4.797-1.434 1.048-3.51 1.32-5.182.022l-.29-.225.069-.361 1.037-5.454.117-.615.61.143Z",
        key: "el2"
      }
    ],
    [
      "path",
      {
        fill: "#1BA9F5",
        stroke: "#fff",
        "stroke-width": "1.2",
        d: "m5.01 9.63 5.267 1.255.283.067.122.264 1.235 2.65.187.4-.328.298-6.733 6.1-.272.248-.345-.132C1.939 19.83.72 17.456.752 15.153c.032-2.308 1.321-4.644 3.932-5.508l.162-.054.165.039Z",
        key: "el3"
      }
    ],
    [
      "path",
      {
        fill: "#F04E98",
        stroke: "#fff",
        "stroke-width": "1.2",
        d: "M6.281 4.32c1.416-1.08 3.48-1.387 5.222-.069l.297.226-.07.366-1.053 5.474-.118.615-.609-.144-4.8-1.137-.316-.075-.11-.306c-.709-1.967.149-3.876 1.557-4.95Z",
        key: "el4"
      }
    ],
    [
      "path",
      {
        fill: "#02BCB7",
        stroke: "#fff",
        "stroke-width": "1.2",
        d: "m12.466 14.433 7.03 3.211.188.086.095.183 1.555 2.985.096.184-.04.206-1.165 6.101-.024.122-.068.103c-2.68 3.958-6.902 4.71-10.268 3.26-3.356-1.447-5.834-5.07-5.126-9.736l.033-.21.158-.144 6.884-6.25.293-.265.36.164Z",
        key: "el5"
      }
    ],
    [
      "path",
      {
        fill: "#FEC514",
        stroke: "#fff",
        "stroke-width": "1.2",
        d: "M11.892 4.41C14.438.676 18.741.105 22.134 1.54c3.392 1.433 5.99 4.92 5.102 9.362l-.039.2-.153.133-7.066 6.213-.293.258-.353-.163-7.002-3.21-.201-.093-.094-.2-1.38-2.988-.081-.177.037-.19L11.8 4.633l.023-.121.07-.102Z",
        key: "el6"
      }
    ]
  ],
  { fill: "none", stroke: "none", viewBox: "0 0 32 32" }
);
Ve(
  "FilesBucket",
  [
    [
      "path",
      {
        d: "M3.99988 20H19.9999C20.5303 20 21.039 19.7893 21.4141 19.4142C21.7892 19.0391 21.9999 18.5304 21.9999 18V8C21.9999 7.46957 21.7892 6.96086 21.4141 6.58579C21.039 6.21071 20.5303 6 19.9999 6H12.0699C11.7405 5.9983 11.4166 5.91525 11.127 5.75824C10.8374 5.60123 10.5911 5.37512 10.4099 5.1L9.58988 3.9C9.4087 3.62488 9.16237 3.39877 8.87278 3.24176C8.58319 3.08475 8.25929 3.0017 7.92988 3H3.99988C3.46944 3 2.96074 3.21071 2.58566 3.58579C2.21059 3.96086 1.99988 4.46957 1.99988 5V18C1.99988 19.1 2.89988 20 3.99988 20Z",
        key: "1y2yg5"
      }
    ],
    ["path", { d: "M5 10.5H19", key: "eibh4o" }]
  ],
  {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
);
Ve(
  "Grafana",
  [
    [
      "path",
      {
        d: "M23.02 10.59a8.578 8.578 0 0 0-.862-3.034 8.911 8.911 0 0 0-1.789-2.445c.337-1.342-.413-2.505-.413-2.505-1.292-.08-2.113.4-2.416.62-.052-.02-.102-.044-.154-.064-.22-.089-.446-.172-.677-.247-.231-.073-.47-.14-.711-.197a9.867 9.867 0 0 0-.875-.161C14.557.753 12.94 0 12.94 0c-1.804 1.145-2.147 2.744-2.147 2.744l-.018.093c-.098.029-.2.057-.298.088-.138.042-.275.094-.413.143-.138.055-.275.107-.41.166a8.869 8.869 0 0 0-1.557.87l-.063-.029c-2.497-.955-4.716.195-4.716.195-.203 2.658.996 4.33 1.235 4.636a11.608 11.608 0 0 0-.607 2.635C1.636 12.677.953 15.014.953 15.014c1.926 2.214 4.171 2.351 4.171 2.351.003-.002.006-.002.006-.005.285.509.615.994.986 1.446.156.19.32.371.488.548-.704 2.009.099 3.68.099 3.68 2.144.08 3.553-.937 3.849-1.173a9.784 9.784 0 0 0 3.164.501h.08l.055-.003.107-.002.103-.005.003.002c1.01 1.44 2.788 1.646 2.788 1.646 1.264-1.332 1.337-2.653 1.337-2.94v-.058c0-.02-.003-.039-.003-.06.265-.187.52-.387.758-.6a7.875 7.875 0 0 0 1.415-1.7c1.43.083 2.437-.885 2.437-.885-.236-1.49-1.085-2.216-1.264-2.354l-.018-.013-.016-.013a.217.217 0 0 1-.031-.02c.008-.092.016-.18.02-.27.011-.162.016-.323.016-.48v-.253l-.005-.098-.008-.135a1.891 1.891 0 0 0-.01-.13c-.003-.042-.008-.083-.013-.125l-.016-.124-.018-.122a6.215 6.215 0 0 0-2.032-3.73 6.015 6.015 0 0 0-3.222-1.46 6.292 6.292 0 0 0-.85-.048l-.107.002h-.063l-.044.003-.104.008a4.777 4.777 0 0 0-3.335 1.695c-.332.4-.592.84-.768 1.297a4.594 4.594 0 0 0-.312 1.817l.003.091c.005.055.007.11.013.164a3.615 3.615 0 0 0 .698 1.82 3.53 3.53 0 0 0 1.827 1.282c.33.098.66.14.971.137.039 0 .078 0 .114-.002l.063-.003c.02 0 .041-.003.062-.003.034-.002.065-.007.099-.01.007 0 .018-.003.028-.003l.031-.005.06-.008a1.18 1.18 0 0 0 .112-.02c.036-.008.072-.013.109-.024a2.634 2.634 0 0 0 .914-.415c.028-.02.056-.041.085-.065a.248.248 0 0 0 .039-.35.244.244 0 0 0-.309-.06l-.078.042c-.09.044-.184.083-.283.116a2.476 2.476 0 0 1-.475.096c-.028.003-.054.006-.083.006l-.083.002c-.026 0-.054 0-.08-.002l-.102-.006h-.012l-.024.006c-.016-.003-.031-.003-.044-.006-.031-.002-.06-.007-.091-.01a2.59 2.59 0 0 1-.724-.213 2.557 2.557 0 0 1-.667-.438 2.52 2.52 0 0 1-.805-1.475 2.306 2.306 0 0 1-.029-.444l.006-.122v-.023l.002-.031c.003-.021.003-.04.005-.06a3.163 3.163 0 0 1 1.352-2.29 3.12 3.12 0 0 1 .937-.43 2.946 2.946 0 0 1 .776-.101h.06l.07.002.045.003h.026l.07.005a4.041 4.041 0 0 1 1.635.49 3.94 3.94 0 0 1 1.602 1.662 3.77 3.77 0 0 1 .397 1.414l.005.076.003.075c.002.026.002.05.002.075 0 .024.003.052 0 .07v.065l-.002.073-.008.174a6.195 6.195 0 0 1-.08.639 5.1 5.1 0 0 1-.267.927 5.31 5.31 0 0 1-.624 1.13 5.052 5.052 0 0 1-3.237 2.014 4.82 4.82 0 0 1-.649.066l-.039.003h-.287a6.607 6.607 0 0 1-1.716-.265 6.776 6.776 0 0 1-3.4-2.274 6.75 6.75 0 0 1-.746-1.15 6.616 6.616 0 0 1-.714-2.596l-.005-.083-.002-.02v-.056l-.003-.073v-.096l-.003-.104v-.07l.003-.163c.008-.22.026-.45.054-.678a8.707 8.707 0 0 1 .28-1.355c.128-.444.286-.872.473-1.277a7.04 7.04 0 0 1 1.456-2.1 5.925 5.925 0 0 1 .953-.763c.169-.111.343-.213.524-.306.089-.05.182-.091.273-.135.047-.02.093-.042.138-.062a7.177 7.177 0 0 1 .714-.267l.145-.045c.049-.015.098-.026.148-.041.098-.029.197-.052.296-.076.049-.013.1-.02.15-.033l.15-.032.151-.028.076-.013.075-.01.153-.024c.057-.01.114-.013.171-.023l.169-.021c.036-.003.073-.008.106-.01l.073-.008.036-.003.042-.002c.057-.003.114-.008.171-.01l.086-.006h.023l.037-.003.145-.007a7.999 7.999 0 0 1 1.708.125 7.917 7.917 0 0 1 2.048.68 8.253 8.253 0 0 1 1.672 1.09l.09.077.089.078c.06.052.114.107.171.159.057.052.112.106.166.16.052.055.107.107.159.164a8.671 8.671 0 0 1 1.41 1.978c.012.026.028.052.04.078l.04.078.075.156c.023.051.05.1.07.153l.065.15a8.848 8.848 0 0 1 .45 1.34.19.19 0 0 0 .201.142.186.186 0 0 0 .172-.184c.01-.246.002-.532-.024-.856z",
        key: "hopart"
      }
    ]
  ],
  { fill: "currentColor", stroke: "none" }
);
Ve(
  "Graphql",
  [
    [
      "path",
      {
        d: "M11.9007 3.76857L19.0007 7.86775V16.0661M11.9007 3.76857L4.80072 7.86775V16.0661M11.9007 3.76857L19.0007 16.0661M11.9007 3.76857L4.80072 16.0661M19.0007 16.0661L11.9007 20.1653L4.80072 16.0661M19.0007 16.0661H4.80072M6.0164 16.1322C6.0164 16.7895 5.48358 17.3223 4.82631 17.3223C4.16905 17.3223 3.63623 16.7895 3.63623 16.1322C3.63623 15.4749 4.16905 14.9421 4.82631 14.9421C5.48358 14.9421 6.0164 15.4749 6.0164 16.1322ZM5.28912 16.1322C5.28912 16.3878 5.08192 16.595 4.82631 16.595C4.57071 16.595 4.3635 16.3878 4.3635 16.1322C4.3635 15.8766 4.57071 15.6694 4.82631 15.6694C5.08192 15.6694 5.28912 15.8766 5.28912 16.1322ZM20.2974 16.1322C20.2974 16.7895 19.7646 17.3223 19.1073 17.3223C18.45 17.3223 17.9172 16.7895 17.9172 16.1322C17.9172 15.4749 18.45 14.9421 19.1073 14.9421C19.7646 14.9421 20.2974 15.4749 20.2974 16.1322ZM19.5701 16.1322C19.5701 16.3878 19.3629 16.595 19.1073 16.595C18.8517 16.595 18.6445 16.3878 18.6445 16.1322C18.6445 15.8766 18.8517 15.6694 19.1073 15.6694C19.3629 15.6694 19.5701 15.8766 19.5701 16.1322ZM6.0164 7.86775C6.0164 8.52501 5.48358 9.05783 4.82631 9.05783C4.16905 9.05783 3.63623 8.52501 3.63623 7.86775C3.63623 7.21048 4.16905 6.67766 4.82631 6.67766C5.48358 6.67766 6.0164 7.21048 6.0164 7.86775ZM5.28912 7.86775C5.28912 8.12335 5.08192 8.33056 4.82631 8.33056C4.57071 8.33056 4.3635 8.12335 4.3635 7.86775C4.3635 7.61214 4.57071 7.40494 4.82631 7.40494C5.08192 7.40494 5.28912 7.61214 5.28912 7.86775ZM20.2974 7.86775C20.2974 8.52501 19.7646 9.05783 19.1073 9.05783C18.45 9.05783 17.9172 8.52501 17.9172 7.86775C17.9172 7.21048 18.45 6.67766 19.1073 6.67766C19.7646 6.67766 20.2974 7.21048 20.2974 7.86775ZM19.5701 7.86775C19.5701 8.12335 19.3629 8.33056 19.1073 8.33056C18.8517 8.33056 18.6445 8.12335 18.6445 7.86775C18.6445 7.61214 18.8517 7.40494 19.1073 7.40494C19.3629 7.40494 19.5701 7.61214 19.5701 7.86775ZM13.1569 3.76857C13.1569 4.42584 12.6241 4.95866 11.9668 4.95866C11.3095 4.95866 10.7767 4.42584 10.7767 3.76857C10.7767 3.11131 11.3095 2.57849 11.9668 2.57849C12.6241 2.57849 13.1569 3.11131 13.1569 3.76857ZM12.4296 3.76857C12.4296 4.02418 12.2224 4.23138 11.9668 4.23138C11.7112 4.23138 11.504 4.02418 11.504 3.76857C11.504 3.51297 11.7112 3.30576 11.9668 3.30576C12.2224 3.30576 12.4296 3.51297 12.4296 3.76857ZM13.1569 20.1653C13.1569 20.8225 12.6241 21.3553 11.9668 21.3553C11.3095 21.3553 10.7767 20.8225 10.7767 20.1653C10.7767 19.508 11.3095 18.9752 11.9668 18.9752C12.6241 18.9752 13.1569 19.508 13.1569 20.1653ZM12.4296 20.1653C12.4296 20.4209 12.2224 20.6281 11.9668 20.6281C11.7112 20.6281 11.504 20.4209 11.504 20.1653C11.504 19.9097 11.7112 19.7025 11.9668 19.7025C12.2224 19.7025 12.4296 19.9097 12.4296 20.1653Z",
        key: "cx9hfh"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "Home",
  [
    [
      "path",
      {
        d: "M9.43414 20.803V13.0557C9.43414 12.5034 9.88186 12.0557 10.4341 12.0557H14.7679C15.3202 12.0557 15.7679 12.5034 15.7679 13.0557V20.803M12.0181 3.48798L5.53031 7.9984C5.26145 8.18532 5.10114 8.49202 5.10114 8.81948L5.10117 18.803C5.10117 19.9075 5.9966 20.803 7.10117 20.803H18.1012C19.2057 20.803 20.1012 19.9075 20.1012 18.803L20.1011 8.88554C20.1011 8.55988 19.9426 8.25462 19.6761 8.06737L13.1639 3.49088C12.8204 3.24951 12.3627 3.24836 12.0181 3.48798Z",
        key: "1bkqgr"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "InsertCode",
  [
    [
      "path",
      {
        d: "M-20437 -11142H12131V-11144H-20437V-11142ZM12132 -11141V7113H12134V-11141H12132ZM12131 7114H-20437V7116H12131V7114ZM-20438 7113V-11141H-20440V7113H-20438ZM-20437 7114C-20437.6 7114 -20438 7113.55 -20438 7113H-20440C-20440 7114.66 -20438.7 7116 -20437 7116V7114ZM12132 7113C12132 7113.55 12131.6 7114 12131 7114V7116C12132.7 7116 12134 7114.66 12134 7113H12132ZM12131 -11142C12131.6 -11142 12132 -11141.6 12132 -11141H12134C12134 -11142.7 12132.7 -11144 12131 -11144V-11142ZM-20437 -11144C-20438.7 -11144 -20440 -11142.7 -20440 -11141H-20438C-20438 -11141.6 -20437.6 -11142 -20437 -11142V-11144Z",
        fill: "white",
        "fill-opacity": "0.1",
        key: "iaqtc1"
      }
    ],
    ["path", { d: "M22.8437 8.69499L19.5369 12.0018L22.8438 15.3086", key: "1jwljd" }],
    ["rect", { x: "0.5", y: "14.0625", width: "16", height: "8", rx: "1", key: "hj20ku" }],
    ["rect", { x: "0.5", y: "1.9375", width: "16", height: "8", rx: "1", key: "s8jbkj" }]
  ],
  {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
);
Ve(
  "Integrations",
  [
    [
      "path",
      {
        d: "M17.2661 3.23254V10.7325M13.5161 6.98291L21.0161 6.98291M11.0391 16.9508C11.0391 19.1752 9.23585 20.9784 7.01147 20.9784C4.7871 20.9784 2.98389 19.1752 2.98389 16.9508C2.98389 14.7264 4.7871 12.9232 7.01147 12.9232C9.23585 12.9232 11.0391 14.7264 11.0391 16.9508ZM21.0161 19.8568V14.3568C21.0161 13.8045 20.5684 13.3568 20.0161 13.3568H14.5161C13.9638 13.3568 13.5161 13.8045 13.5161 14.3568V19.8568C13.5161 20.4091 13.9638 20.8568 14.5161 20.8568H20.0161C20.5684 20.8568 21.0161 20.4091 21.0161 19.8568ZM4.26221 10.7325H9.76221C10.3145 10.7325 10.7622 10.2848 10.7622 9.73254V4.23254C10.7622 3.68026 10.3145 3.23254 9.76221 3.23254H4.26221C3.70992 3.23254 3.26221 3.68026 3.26221 4.23254V9.73254C3.26221 10.2848 3.70992 10.7325 4.26221 10.7325Z",
        key: "3dnck7"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "Last9",
  [
    [
      "path",
      {
        "fill-rule": "evenodd",
        "clip-rule": "evenodd",
        d: "M23.9431 13.1737L22.7487 13.0575C22.7826 12.709 22.8 12.3552 22.8 11.9971C22.8 11.6389 22.7826 11.2852 22.7487 10.9366L23.9431 10.8204C23.9807 11.2075 24 11.6 24 11.9971C24 12.3941 23.9807 12.7866 23.9431 13.1737ZM23.4862 8.5125L22.3378 8.8604C22.131 8.17807 21.8585 7.52413 21.5273 6.90588L22.5852 6.3393C22.9532 7.02642 23.2563 7.75356 23.4862 8.5125ZM21.2765 4.38423L20.3493 5.14603C19.9 4.59913 19.398 4.09711 18.851 3.64777L19.6129 2.72059C20.2201 3.21954 20.7775 3.7696 21.2765 4.38423ZM17.6577 1.41188L17.0912 2.4697C16.4729 2.13857 15.819 1.86601 15.1366 1.65928L15.4846 0.510829C16.2435 0.74076 16.9706 1.04384 17.6577 1.41188ZM13.1767 0.0540262L13.0604 1.24839C12.7119 1.21446 12.3581 1.19707 12 1.19707C11.6419 1.19707 11.2881 1.21446 10.9396 1.24839L10.8233 0.0540263C11.2104 0.0163507 11.603 -0.00292969 12 -0.00292969C12.397 -0.00292969 12.7895 0.0163507 13.1767 0.0540262ZM8.51538 0.510829L8.86332 1.65928C8.181 1.86601 7.52706 2.13857 6.90882 2.4697L6.34224 1.41188C7.02936 1.04384 7.7565 0.74076 8.51538 0.510829ZM4.38716 2.72059L5.14895 3.64777C4.60207 4.09711 4.10004 4.59913 3.6507 5.14603L2.72352 4.38423C3.22247 3.7696 3.77253 3.21954 4.38716 2.72059ZM1.41481 6.3393L2.47263 6.90588C2.14151 7.52413 1.86895 8.17807 1.6622 8.8604L0.513793 8.5125C0.743688 7.75356 1.04677 7.02642 1.41481 6.3393ZM0.0569559 10.8204C0.0192803 11.2075 0 11.6 0 11.9971C0 12.3941 0.0192804 12.7866 0.056956 13.1737L1.25131 13.0575C1.21739 12.709 1.2 12.3552 1.2 11.9971C1.2 11.6389 1.21739 11.2852 1.25131 10.9366L0.0569559 10.8204ZM0.513794 15.4817L1.6622 15.1337C1.86895 15.816 2.14151 16.4699 2.47263 17.0882L1.41481 17.6547C1.04677 16.9676 0.743688 16.2405 0.513794 15.4817ZM2.72352 19.6098L3.6507 18.848C4.10004 19.3949 4.60207 19.8969 5.14895 20.3463L4.38716 21.2735C3.77253 20.7745 3.22247 20.2245 2.72352 19.6098ZM6.34224 22.5821L6.90882 21.5243C7.52706 21.8555 8.181 22.128 8.86332 22.3347L8.51538 23.4832C7.7565 23.2533 7.02936 22.9502 6.34224 22.5821ZM10.8233 23.9401L10.9396 22.7457C11.2881 22.7797 11.6419 22.797 12 22.797C12.3581 22.797 12.7119 22.7797 13.0604 22.7457L13.1767 23.9401C12.7895 23.9778 12.397 23.9971 12 23.9971C11.603 23.9971 11.2104 23.9778 10.8233 23.9401ZM15.4846 23.4832L15.1366 22.3347C15.819 22.128 16.4729 21.8555 17.0912 21.5243L17.6577 22.5821C16.9706 22.9502 16.2435 23.2533 15.4846 23.4832ZM19.6129 21.2735L18.851 20.3463C19.398 19.8969 19.9 19.3949 20.3493 18.848L21.2765 19.6098C20.7775 20.2245 20.2201 20.7745 19.6129 21.2735ZM22.5852 17.6547L21.5273 17.0882C21.8585 16.4699 22.131 15.816 22.3378 15.1337L23.4862 15.4817C23.2563 16.2405 22.9532 16.9676 22.5852 17.6547Z",
        fill: "currentColor",
        key: "1bcx6p"
      }
    ],
    [
      "path",
      {
        d: "M7.2 9.66642C7.2 12.3994 9.07812 14.293 11.7242 14.293C12.1222 14.293 12.4992 14.2237 12.8483 14.1335L9.38532 19.1971H12.4224L15.7318 14.3277C16.9605 12.5104 17.554 11.1023 17.568 9.60402C17.575 6.552 15.1732 4.79707 12.3316 4.79707C9.3504 4.79707 7.2 6.74622 7.2 9.66642ZM10.1044 9.56238C10.1044 8.1543 11.026 7.14156 12.3456 7.14156C13.6721 7.14156 14.6077 8.1543 14.6077 9.57624C14.6077 10.9843 13.6721 11.9832 12.3456 11.9832C11.026 11.9832 10.1044 10.9843 10.1044 9.56238Z",
        fill: "currentColor",
        key: "1vyu7g"
      }
    ]
  ],
  { fill: "none", stroke: "none" }
);
Ve(
  "Logs",
  [
    [
      "path",
      {
        d: "M4.5 5.20679H4.53713M7.46241 5.21707H19.5M4.5 9.65839H4.53713M7.46241 9.66868H19.5M4.52692 14.164H4.53713M7.46241 14.1742H19.5M4.52692 18.7068L4.53713 18.6965M7.46241 18.7068H19.5",
        key: "2ab8w8"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "Otlp",
  [
    [
      "path",
      {
        d: "M12.68 13.09c-.984 .984-.984 2.58 0 3.564.984.984 2.58.984 3.564 0 .984-.984.984-2.58 0-3.564-.984-.984-2.58-.984-3.564 0zm2.664 2.666a1.246 1.246 0 0 1-1.764 0 1.246 1.246 0 0 1 0-1.764 1.246 1.246 0 0 1 1.764 0c.487.485.487 1.277 0 1.764zM16.205.688l-1.544 1.544a.782.782 0 0 0 0 1.102l6.028 6.028a.782.782 0 0 0 1.102 0l1.544-1.544c.302-.302.302-.799 0-1.101l-6.028-6.028a.78.78 0 0 0-1.102 0zM5.388 20.418a.706.706 0 0 0 0-.996l-.784-.784a.706.706 0 0 0-.996 0l-1.621 1.621-.003.002-.445-.445c-.246-.246-.647-.246-.891 0-.246.246-.246.647 0 .891l2.671 2.671a.629.629 0 0 0 .89 0c.244-.246.246-.647 0-.89l-.445-.445.003-.002zm0 0",
        key: "i7z0x6"
      }
    ],
    [
      "path",
      {
        d: "M13.555 5.121 10.126 8.55c-.305.305-.305.806 0 1.111l2.119 2.119c1.497-1.078 3.596-.944 4.943.404l1.715-1.715c.304-.305.304-.806 0-1.111l-3.429-3.429a.785.785 0 0 0-1.11 0zM11.353 12.673l-1.251-1.251c-.293-.293-.773-.293-1.066 0l-4.411 4.413a.757.757 0 0 0 0 1.066l2.5 2.5a.757.757 0 0 0 1.066 0l2.837-2.842c-.6-1.24-.492-2.735.325-3.886zm0 0",
        key: "5ytdqc"
      }
    ]
  ],
  { fill: "currentColor", stroke: "none" }
);
Ve(
  "Postgres",
  [
    [
      "path",
      {
        d: "M11.5466 3.23108C11.2704 3.23108 11.0466 3.45494 11.0466 3.73108C11.0466 4.00722 11.2704 4.23108 11.5466 4.23108V3.23108ZM20.6569 19.5046C20.6569 19.2285 20.433 19.0046 20.1569 19.0046C19.8808 19.0046 19.6569 19.2285 19.6569 19.5046H20.6569ZM19.6569 15.9656C19.6569 16.2417 19.8808 16.4656 20.1569 16.4656C20.433 16.4656 20.6569 16.2417 20.6569 15.9656H19.6569ZM13.0119 19.5536C12.959 19.2826 12.6964 19.1058 12.4254 19.1586C12.1544 19.2115 11.9775 19.4741 12.0304 19.7452L13.0119 19.5536ZM9.87381 18.8565L9.37381 18.8565V18.8565H9.87381ZM4.20721 5.29932L3.73784 5.12699L3.73784 5.127L4.20721 5.29932ZM2.52527 9.88046L2.0559 9.70814L2.0559 9.70814L2.52527 9.88046ZM3.24922 12.6873L2.92176 13.0651L2.92176 13.0651L3.24922 12.6873ZM4.40334 13.6875L4.07588 14.0653L4.07588 14.0653L4.40334 13.6875ZM5.00971 15.0154L4.50971 15.0154L4.50971 15.0154L5.00971 15.0154ZM5.00969 16.8536L5.50969 16.8536L5.50969 16.8536L5.00969 16.8536ZM9.87385 10.6661L9.37385 10.6661L9.37385 10.6661L9.87385 10.6661ZM11.9399 6.90783C12.136 6.71339 12.1373 6.39681 11.9429 6.20073C11.7484 6.00464 11.4319 6.00331 11.2358 6.19774L11.9399 6.90783ZM17.841 18.7506L17.8409 18.2506L17.8409 18.2506L17.841 18.7506ZM23.0676 19.2506C23.3437 19.2506 23.5676 19.0267 23.5675 18.7506C23.5675 18.4744 23.3437 18.2506 23.0675 18.2506L23.0676 19.2506ZM13.0171 15.2446C12.8955 14.9967 12.5959 14.8943 12.348 15.016C12.1001 15.1376 11.9978 15.4372 12.1194 15.6851L13.0171 15.2446ZM11.5466 4.23108H12.608V3.23108H11.5466V4.23108ZM19.6569 19.5046C19.6569 21.0264 18.2467 22.2606 16.3033 22.2606V23.2606C18.6165 23.2606 20.6569 21.7449 20.6569 19.5046H19.6569ZM12.608 4.23108C16.501 4.23108 19.6569 7.38698 19.6569 11.28H20.6569C20.6569 6.8347 17.0533 3.23108 12.608 3.23108V4.23108ZM19.6569 11.28V15.9656H20.6569V11.28H19.6569ZM16.3033 22.2606C14.6727 22.2606 13.313 21.0964 13.0119 19.5536L12.0304 19.7452C12.4214 21.7485 14.1852 23.2606 16.3033 23.2606V22.2606ZM11.6552 3.22339H6.46459V4.22339H11.6552V3.22339ZM3.73784 5.127L2.0559 9.70814L2.99464 10.0528L4.67658 5.47164L3.73784 5.127ZM2.92176 13.0651L4.07588 14.0653L4.7308 13.3096L3.57668 12.3094L2.92176 13.0651ZM4.50971 15.0154L4.50969 16.8536L5.50969 16.8536L5.50971 15.0154L4.50971 15.0154ZM10.3739 10.6661C10.3739 9.25463 10.9376 7.90166 11.9399 6.90783L11.2358 6.19774C10.0442 7.37934 9.37387 8.98795 9.37385 10.6661L10.3739 10.6661ZM2.0559 9.70814C1.61893 10.8983 1.96363 12.2348 2.92176 13.0651L3.57668 12.3094C2.9326 11.7512 2.70089 10.8529 2.99464 10.0528L2.0559 9.70814ZM8.44319 20.7872C9.50944 20.7872 10.3738 19.9228 10.3738 18.8565H9.37381C9.37381 19.3705 8.95716 19.7872 8.44319 19.7872V20.7872ZM8.44319 19.7872C6.82305 19.7872 5.50967 18.4738 5.50969 16.8536L4.50969 16.8536C4.50966 19.026 6.27075 20.7872 8.44319 20.7872V19.7872ZM4.07588 14.0653C4.35142 14.3041 4.50972 14.6508 4.50971 15.0154L5.50971 15.0154C5.50972 14.3608 5.22552 13.7384 4.7308 13.3096L4.07588 14.0653ZM6.46459 3.22339C5.24643 3.22339 4.15768 3.98347 3.73784 5.12699L4.67658 5.47164C4.95188 4.7218 5.66581 4.22339 6.46459 4.22339V3.22339ZM17.841 19.2506L23.0676 19.2506L23.0675 18.2506L17.8409 18.2506L17.841 19.2506ZM12.1194 15.6851C13.1905 17.8676 15.4098 19.2507 17.841 19.2506L17.8409 18.2506C15.7913 18.2507 13.9201 17.0846 13.0171 15.2446L12.1194 15.6851ZM10.3738 18.8565L10.3739 10.6661L9.37385 10.6661L9.37381 18.8565L10.3738 18.8565Z",
        key: "1mbkmc"
      }
    ],
    [
      "path",
      {
        d: "M15.7151 11.2056C15.7151 11.6257 16.0556 11.9663 16.4758 11.9663C16.8959 11.9663 17.2365 11.6257 17.2365 11.2056C17.2365 10.7854 16.8959 10.4448 16.4758 10.4448C16.0556 10.4448 15.7151 10.7854 15.7151 11.2056Z",
        key: "1vir92"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "Realtime",
  [
    [
      "path",
      {
        d: "M8.04273 1.58203V5.32205M5.24354 5.32205L2.04712 2.02791M5.24354 7.90979H1.57764M15.3776 15.5507L21.079 14.1316C21.5417 14.0164 21.5959 13.3806 21.1595 13.1887L8.00828 7.40586C7.59137 7.22254 7.16643 7.64661 7.3489 8.06389L13.0321 21.0607C13.2224 21.496 13.8556 21.4454 13.9743 20.9854L15.3776 15.5507Z",
        key: "1w2oqg"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "ReplaceCode",
  [
    [
      "path",
      {
        d: "M-20403 -11142H12165V-11144H-20403V-11142ZM12166 -11141V7113H12168V-11141H12166ZM12165 7114H-20403V7116H12165V7114ZM-20404 7113V-11141H-20406V7113H-20404ZM-20403 7114C-20403.6 7114 -20404 7113.55 -20404 7113H-20406C-20406 7114.66 -20404.7 7116 -20403 7116V7114ZM12166 7113C12166 7113.55 12165.6 7114 12165 7114V7116C12166.7 7116 12168 7114.66 12168 7113H12166ZM12165 -11142C12165.6 -11142 12166 -11141.6 12166 -11141H12168C12168 -11142.7 12166.7 -11144 12165 -11144V-11142ZM-20403 -11144C-20404.7 -11144 -20406 -11142.7 -20406 -11141H-20404C-20404 -11141.6 -20403.6 -11142 -20403 -11142V-11144Z",
        "fill-opacity": "0.1",
        key: "g9kgmq"
      }
    ],
    [
      "rect",
      {
        x: "6.44531",
        y: "14.1133",
        width: "15.8455",
        height: "7.91818",
        rx: "3.95909",
        key: "1evqnx"
      }
    ],
    [
      "path",
      {
        d: "M10.5896 10.0195L18.2148 10.0195C19.0433 10.0195 19.7148 9.34796 19.7148 8.51953L19.7148 3.59225C19.7148 2.76383 19.0433 2.09226 18.2148 2.09226L5.99609 2.09226",
        key: "ty8khj"
      }
    ],
    ["path", { d: "M5.98902 10.4656V5.78906H1.3125", key: "1a8pc0" }],
    [
      "path",
      {
        d: "M3.27111 13.6133V13.6133C1.61515 12.3914 1.47948 9.96446 2.98894 8.56564L5.99609 5.77891",
        key: "uu2l9q"
      }
    ]
  ],
  {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
);
Ve(
  "Reports",
  [
    [
      "path",
      {
        d: "M3.03479 9.0849L8.07241 4.0575C8.46296 3.66774 9.0954 3.66796 9.48568 4.05799L14.0295 8.59881C14.42 8.98912 15.053 8.98901 15.4435 8.59857L20.5877 3.45418M16.4996 3.01526H19.9996C20.5519 3.01526 20.9996 3.46297 20.9996 4.01526V7.51526M2.99963 12.0153L2.99963 20.1958C2.99963 20.7481 3.44735 21.1958 3.99963 21.1958L20.0004 21.1958C20.5527 21.1958 21.0004 20.7481 21.0004 20.1958V9.88574M8.82532 9.87183L8.82531 21.1958M15.1754 15.0746V21.1949",
        key: "1g8azg"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "Sentry",
  [
    [
      "path",
      {
        d: "M13.91 2.505c-.873-1.448-2.972-1.448-3.844 0L6.904 7.92a15.478 15.478 0 0 1 8.53 12.811h-2.221A13.301 13.301 0 0 0 5.784 9.814l-2.926 5.06a7.65 7.65 0 0 1 4.435 5.848H2.194a.365.365 0 0 1-.298-.534l1.413-2.402a5.16 5.16 0 0 0-1.614-.913L.296 19.275a2.182 2.182 0 0 0 .812 2.999 2.24 2.24 0 0 0 1.086.288h6.983a9.322 9.322 0 0 0-3.845-8.318l1.11-1.922a11.47 11.47 0 0 1 4.95 10.24h5.915a17.242 17.242 0 0 0-7.885-15.28l2.244-3.845a.37.37 0 0 1 .504-.13c.255.14 9.75 16.708 9.928 16.9a.365.365 0 0 1-.327.543h-2.287c.029.612.029 1.223 0 1.831h2.297a2.206 2.206 0 0 0 1.922-3.31z",
        key: "1ysbk7"
      }
    ]
  ],
  { fill: "currentColor", stroke: "none", strokeLinecap: "round", strokeLinejoin: "round" }
);
Ve(
  "Settings",
  [
    [
      "path",
      {
        d: "M19.0222 9.24778C18.7686 8.63209 18.9226 7.90445 19.0085 7.24413C19.0745 6.73688 18.9158 6.20546 18.5306 5.8112C18.1561 5.42795 17.6471 5.25574 17.1517 5.29628C16.465 5.35248 15.6993 5.49169 15.0673 5.2171C15.0337 5.20249 15 5.18812 14.9661 5.17399C14.3637 4.92272 13.9467 4.33388 13.548 3.81707C13.211 3.38025 12.6823 3.09888 12.088 3.09888C11.4954 3.09888 10.9681 3.37859 10.631 3.81318C10.2309 4.32895 9.81229 4.91673 9.20918 5.1664C9.17044 5.18244 9.13187 5.19879 9.09347 5.21545C8.46538 5.48794 7.70569 5.35157 7.02328 5.29619C6.5283 5.25601 6.01978 5.42825 5.64558 5.8112C5.26693 6.19871 5.10715 6.71872 5.16447 7.21806C5.24116 7.88619 5.39313 8.62174 5.13657 9.2434C4.89276 9.83417 4.31732 10.2511 3.8084 10.6377C3.36536 10.9743 3.07928 11.5068 3.07928 12.1061C3.07928 12.706 3.36595 13.239 3.80978 13.5755C4.31844 13.9612 4.8932 14.3775 5.13676 14.9675C5.39353 15.5896 5.24077 16.3258 5.16315 16.9943C5.1051 17.4943 5.26479 18.0153 5.64401 18.4034C6.01864 18.7868 6.5279 18.959 7.02343 18.9183C7.70705 18.8621 8.46835 18.7243 9.09777 18.9969C9.13378 19.0125 9.16993 19.0278 9.20622 19.0429C9.81052 19.2933 10.2294 19.8832 10.6298 20.4005C10.9669 20.8359 11.4947 21.1163 12.088 21.1163C12.683 21.1163 13.2122 20.8343 13.5491 20.3966C13.9481 19.8783 14.3654 19.2873 14.969 19.0353C15.0005 19.0221 15.0318 19.0088 15.0631 18.9952C15.6963 18.7205 16.4636 18.8612 17.1516 18.9182C17.6475 18.9592 18.1572 18.7871 18.5321 18.4034C18.9179 18.0085 19.0765 17.4761 19.0098 16.9682C18.9229 16.3076 18.7682 15.5793 19.022 14.9632C19.2634 14.3774 19.836 13.9664 20.346 13.5906C20.8013 13.255 21.0967 12.715 21.0967 12.1061C21.0967 11.4977 20.8019 10.9582 20.3474 10.6226C19.8372 10.2458 19.2638 9.83426 19.0222 9.24778Z",
        key: "102x66"
      }
    ],
    [
      "path",
      {
        d: "M12.0002 15.1051C13.657 15.1051 15.0002 13.762 15.0002 12.1051C15.0002 10.4482 13.657 9.1051 12.0002 9.1051C10.3433 9.1051 9.00018 10.4482 9.00018 12.1051C9.00018 13.762 10.3433 15.1051 12.0002 15.1051Z",
        key: "153c57"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
const IS = Ve(
  "SqlEditor",
  [
    [
      "path",
      {
        d: "M7.89844 8.4342L11.5004 12.0356L7.89844 15.6375M12 15.3292H16.5M5 21.1055H19C20.1046 21.1055 21 20.21 21 19.1055V5.10547C21 4.0009 20.1046 3.10547 19 3.10547H5C3.89543 3.10547 3 4.0009 3 5.10547V19.1055C3 20.21 3.89543 21.1055 5 21.1055Z",
        key: "orzc99"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
), kS = Ve(
  "Storage",
  [
    [
      "path",
      {
        d: "M19.4995 11.3685V8.50725L14.0723 3.10584H5.49951C4.94722 3.10584 4.49951 3.55355 4.49951 4.10584V9.1051M19.4468 8.48218L14.0701 3.10547L14.0701 7.48218C14.0701 8.03446 14.5178 8.48218 15.0701 8.48218L19.4468 8.48218ZM6.86675 9.1051H3.96045C3.40816 9.1051 2.96045 9.55282 2.96045 10.1051V19.1051C2.96045 20.2097 3.85588 21.1051 4.96045 21.1051H18.9604C20.065 21.1051 20.9604 20.2097 20.9604 19.1051V12.3685C20.9604 11.8162 20.5127 11.3685 19.9605 11.3685H9.98622C9.72382 11.3685 9.47194 11.2654 9.28489 11.0813L7.56808 9.39226C7.38103 9.20824 7.12915 9.1051 6.86675 9.1051Z",
        key: "1liyj6"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
), MS = Ve(
  "TableEditor",
  [
    [
      "path",
      {
        d: "M2.9707 15.3494L20.9707 15.355M20.9405 9.61588H2.99699M8.77661 9.61588V21.1367M20.9405 5.85547V19.1367C20.9405 20.2413 20.0451 21.1367 18.9405 21.1367H4.99699C3.89242 21.1367 2.99699 20.2413 2.99699 19.1367V5.85547C2.99699 4.7509 3.89242 3.85547 4.99699 3.85547H18.9405C20.0451 3.85547 20.9405 4.7509 20.9405 5.85547Z",
        key: "1qrasg"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "User",
  [
    [
      "path",
      {
        d: "M7.06473 19.6328C4.61648 18.0244 3 15.2537 3 12.1055C3 7.13491 7.02944 3.10547 12 3.10547C16.9706 3.10547 21 7.13491 21 12.1055C21 15.2537 19.4273 18.0094 16.979 19.6178M16.9799 22.2844V19.7136C16.9799 17.0258 14.8011 14.8469 12.1133 14.8469C9.42547 14.8469 7.24658 17.0258 7.24658 19.7136V22.2844M15 11.8469C15 13.5038 13.6569 14.8469 12 14.8469C10.3431 14.8469 9 13.5038 9 11.8469C9 10.1901 10.3431 8.84692 12 8.84692C13.6569 8.84692 15 10.1901 15 11.8469Z",
        key: "173y10"
      }
    ]
  ],
  { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }
);
Ve(
  "VectorBucket",
  [
    [
      "path",
      {
        d: "M19.9999 20C20.5303 20 21.039 19.7893 21.4141 19.4142C21.7892 19.0391 21.9999 18.5304 21.9999 18V8C21.9999 7.46957 21.7892 6.96086 21.4141 6.58579C21.039 6.21071 20.5303 6 19.9999 6H12.0999C11.7654 6.00328 11.4354 5.92261 11.1402 5.76538C10.8449 5.60815 10.5938 5.37938 10.4099 5.1L9.59988 3.9C9.41777 3.62347 9.16985 3.39648 8.87838 3.2394C8.5869 3.08231 8.26099 3.00005 7.92988 3H3.99988C3.46944 3 2.96074 3.21071 2.58566 3.58579C2.21059 3.96086 1.99988 4.46957 1.99988 5V18C1.99988 18.5304 2.21059 19.0391 2.58566 19.4142C2.96074 19.7893 3.46944 20 3.99988 20H19.9999Z",
        key: "12tuto"
      }
    ],
    [
      "path",
      {
        d: "M11.7833 15.2197V19.5M11.7833 15.2197L16.8327 12.2868M11.7833 15.2197L6.73425 12.2869M6.73425 12.2869V15.7965M6.73425 12.2869V12.2568L9.75885 10.5M16.8328 15.8272V12.2568L13.8083 10.5",
        key: "hnf5b7"
      }
    ]
  ],
  {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
);
function LS(e, n) {
  if (e instanceof RegExp) return { keys: !1, pattern: e };
  var r, a, s, l, c = [], d = "", h = e.split("/");
  for (h[0] || h.shift(); s = h.shift(); )
    r = s[0], r === "*" ? (c.push(r), d += s[1] === "?" ? "(?:/(.*))?" : "/(.*)") : r === ":" ? (a = s.indexOf("?", 1), l = s.indexOf(".", 1), c.push(s.substring(1, ~a ? a : ~l ? l : s.length)), d += ~a && !~l ? "(?:/([^/]+?))?" : "/([^/]+?)", ~l && (d += (~a ? "?" : "") + "\\" + s.substring(l))) : d += "/" + s;
  return {
    keys: c,
    pattern: new RegExp("^" + d + (n ? "(?=$|/)" : "/?$"), "i")
  };
}
const NS = C.useInsertionEffect, TS = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u", AS = TS ? C.useLayoutEffect : C.useEffect, OS = NS || AS, mg = (e) => {
  const n = C.useRef([e, (...r) => n[0](...r)]).current;
  return OS(() => {
    n[0] = e;
  }), n[1];
}, PS = "popstate", Ed = "pushState", Rd = "replaceState", DS = "hashchange", N0 = [
  PS,
  Ed,
  Rd,
  DS
], FS = (e) => {
  for (const n of N0)
    addEventListener(n, e);
  return () => {
    for (const n of N0)
      removeEventListener(n, e);
  };
}, vg = (e, n) => Q8.useSyncExternalStore(FS, e, n), T0 = () => location.search, WS = ({ ssrSearch: e } = {}) => vg(
  T0,
  // != null checks for both null and undefined, but allows empty string ""
  // This allows proper hydration: server renders with ssrSearch="?foo",
  // client hydrates with just <Router /> and reads from location.search
  e != null ? () => e : T0
), A0 = () => location.pathname, HS = ({ ssrPath: e } = {}) => vg(
  A0,
  // != null checks for both null and undefined, but allows empty string ""
  // This allows proper hydration: server renders with ssrPath="/foo",
  // client hydrates with just <Router /> and reads from location.pathname
  e != null ? () => e : A0
), $S = (e, { replace: n = !1, state: r = null } = {}) => history[n ? Rd : Ed](r, "", e), zS = (e = {}) => [HS(e), $S], O0 = /* @__PURE__ */ Symbol.for("wouter_v3");
if (typeof history < "u" && typeof window[O0] > "u") {
  for (const e of [Ed, Rd]) {
    const n = history[e];
    history[e] = function() {
      const r = n.apply(this, arguments), a = new Event(e);
      return a.arguments = arguments, dispatchEvent(a), r;
    };
  }
  Object.defineProperty(window, O0, { value: !0 });
}
const BS = (e, n) => n.toLowerCase().indexOf(e.toLowerCase()) ? "~" + n : n.slice(e.length) || "/", bg = (e = "") => e === "/" ? "" : e, VS = (e, n) => e[0] === "~" ? e.slice(1) : bg(n) + e, US = (e = "", n) => BS(P0(bg(e)), P0(n)), P0 = (e) => {
  try {
    return decodeURI(e);
  } catch {
    return e;
  }
}, yg = {
  hook: zS,
  searchHook: WS,
  parser: LS,
  base: "",
  // this option is used to override the current location during SSR
  ssrPath: void 0,
  ssrSearch: void 0,
  // optional context to track render state during SSR
  ssrContext: void 0,
  // customizes how `href` props are transformed for <Link />
  hrefs: (e) => e,
  // wraps navigate calls, useful for view transitions
  aroundNav: (e, n, r) => e(n, r)
}, wg = Fr(yg), _a = () => Nr(wg), xg = {}, Cg = Fr(xg), GS = () => Nr(Cg), Al = (e) => {
  const [n, r] = e.hook(e);
  return [
    US(e.base, n),
    mg(
      (a, s) => e.aroundNav(r, VS(a, e.base), s)
    )
  ];
}, Ol = () => Al(_a()), Sg = (e, n, r, a) => {
  const { pattern: s, keys: l } = n instanceof RegExp ? { keys: !1, pattern: n } : e(n || "*", a), c = s.exec(r) || [], [d, ...h] = c;
  return d !== void 0 ? [
    !0,
    (() => {
      const p = l !== !1 ? Object.fromEntries(l.map((b, w) => [b, h[w]])) : c.groups;
      let m = { ...h };
      return p && Object.assign(m, p), m;
    })(),
    // the third value if only present when parser is in "loose" mode,
    // so that we can extract the base path for nested routes
    ...a ? [d] : []
  ] : [!1, null];
}, _g = ({ children: e, ...n }) => {
  const r = _a(), a = n.hook ? yg : r;
  let s = a;
  const [l, c = n.ssrSearch ?? ""] = n.ssrPath?.split("?") ?? [];
  l && (n.ssrSearch = c, n.ssrPath = l), n.hrefs = n.hrefs ?? n.hook?.hrefs, n.searchHook = n.searchHook ?? n.hook?.searchHook;
  let d = Ht({}), h = d.current, p = h;
  for (let m in a) {
    const b = m === "base" ? (
      /* base is special case, it is appended to the parent's base */
      a[m] + (n[m] ?? "")
    ) : n[m] ?? a[m];
    h === p && b !== p[m] && (d.current = p = { ...p }), p[m] = b, (b !== a[m] || b !== s[m]) && (s = p);
  }
  return lr(wg.Provider, { value: s, children: e });
}, D0 = ({ children: e, component: n }, r) => n ? lr(n, { params: r }) : typeof e == "function" ? e(r) : e, KS = (e) => {
  let n = Ht(xg);
  const r = n.current;
  return n.current = // Update cache if number of params changed or any value changed
  Object.keys(e).length !== Object.keys(r).length || Object.entries(e).some(([a, s]) => s !== r[a]) ? e : r;
}, si = ({ path: e, nest: n, match: r, ...a }) => {
  const s = _a(), [l] = Al(s), [c, d, h] = (
    // `match` is a special prop to give up control to the parent,
    // it is used by the `Switch` to avoid double matching
    r ?? Sg(s.parser, e, l, n)
  ), p = KS({ ...GS(), ...d });
  if (!c) return null;
  const m = h ? lr(_g, { base: h }, D0(a, p)) : D0(a, p);
  return lr(Cg.Provider, { value: p, children: m });
}, ZS = yt((e, n) => {
  const r = _a(), [a, s] = Al(r), {
    to: l = "",
    href: c = l,
    onClick: d,
    asChild: h,
    children: p,
    className: m,
    /* eslint-disable no-unused-vars */
    replace: b,
    state: w,
    transition: g,
    /* eslint-enable no-unused-vars */
    ...x
  } = e, y = mg((R) => {
    R.ctrlKey || R.metaKey || R.altKey || R.shiftKey || R.button !== 0 || (d?.(R), R.defaultPrevented || (R.preventDefault(), s(c, e)));
  }), E = r.hrefs(
    c[0] === "~" ? c.slice(1) : r.base + c,
    r
    // pass router as a second argument for convinience
  );
  return h && ga(p) ? ju(p, { onClick: y, href: E }) : lr("a", {
    ...x,
    onClick: y,
    href: E,
    // `className` can be a function to apply the class if this link is active
    className: m?.call ? m(a === c) : m,
    children: p,
    ref: n
  });
}), Eg = (e) => Array.isArray(e) ? e.flatMap(
  (n) => Eg(n && n.type === zb ? n.props.children : n)
) : [e], Rg = ({ children: e, location: n }) => {
  const r = _a(), [a] = Al(r);
  for (const s of Eg(e)) {
    let l = 0;
    if (ga(s) && // we don't require an element to be of type Route,
    // but we do require it to contain a truthy `path` prop.
    // this allows to use different components that wrap Route
    // inside of a switch, for example <AnimatedRoute />.
    (l = Sg(
      r.parser,
      s.props.path,
      n || a,
      s.props.nest
    ))[0])
      return ju(s, { match: l });
  }
  return null;
}, To = ({
  Icon: e,
  label: n,
  disabled: r,
  href: a,
  onClick: s
}) => {
  const [l] = Ol(), c = a ? l.startsWith(a) : !1;
  return /* @__PURE__ */ f(pg, { children: /* @__PURE__ */ f(ZS, { href: a ?? "", onClick: s, asChild: !0, children: /* @__PURE__ */ V(
    gg,
    {
      className: "text-sm cursor-pointer",
      size: "default",
      isActive: c,
      tooltip: n,
      disabled: r,
      children: [
        /* @__PURE__ */ f(e, { strokeWidth: 1.5, "aria-hidden": "true", focusable: "false" }),
        /* @__PURE__ */ f("span", { className: "sr-only", children: n })
      ]
    }
  ) }) });
};
function jS({
  projectName: e,
  nonProdLabel: n,
  backHref: r,
  backLabel: a
}) {
  return /* @__PURE__ */ V("header", { className: "flex h-12 items-center justify-between p-4 border-b", children: [
    /* @__PURE__ */ V("div", { className: "flex items-center gap-2", children: [
      r && /* @__PURE__ */ V(
        "a",
        {
          href: r,
          className: "flex items-center gap-1 text-sm text-foreground-light hover:text-foreground",
          children: [
            /* @__PURE__ */ f($9, { className: "size-4", "aria-hidden": "true" }),
            /* @__PURE__ */ f("span", { children: a ?? "Back" })
          ]
        }
      ),
      r && /* @__PURE__ */ f(iu, {}),
      /* @__PURE__ */ f(P9, {}),
      /* @__PURE__ */ f(iu, {}),
      /* @__PURE__ */ f("span", { className: "text-sm font-medium", children: e }),
      /* @__PURE__ */ f(iu, {}),
      /* @__PURE__ */ f(
        Rt,
        {
          className: "rounded-full",
          variant: "default",
          icon: /* @__PURE__ */ f(l7, { className: "rotate-90" }),
          disabled: !0,
          children: "Connect"
        }
      )
    ] }),
    /* @__PURE__ */ V("div", { className: "flex items-center gap-2", children: [
      n && /* @__PURE__ */ f(Ml, { variant: "warning", children: n }),
      /* @__PURE__ */ f(
        dC,
        {
          placeholder: "Search...",
          className: fe(
            "hidden md:flex md:min-w-32 xl:min-w-32 rounded-full bg-transparent",
            "[&_.command-shortcut>div]:border-none",
            "[&_.command-shortcut>div]:pr-2",
            "[&_.command-shortcut>div]:bg-transparent",
            "[&_.command-shortcut>div]:text-foreground-lighter"
          )
        }
      ),
      /* @__PURE__ */ f(
        Rt,
        {
          className: "rounded-full p-0 group size-[32px]",
          variant: "outline",
          size: "tiny",
          disabled: !0,
          children: /* @__PURE__ */ f(Z9, { className: "size-4 text-foreground-light" })
        }
      ),
      /* @__PURE__ */ f(
        Rt,
        {
          className: "rounded-full p-0 group size-[32px]",
          variant: "outline",
          size: "tiny",
          disabled: !0,
          children: /* @__PURE__ */ f(a7, { className: "size-4 text-foreground-light" })
        }
      )
    ] })
  ] });
}
function qS({ children: e, ...n }) {
  return /* @__PURE__ */ V(ug, { children: [
    /* @__PURE__ */ f(jS, { ...n }),
    /* @__PURE__ */ V("main", { className: "flex h-[calc(100vh-48px)] w-screen min-w-0 overflow-hidden", children: [
      /* @__PURE__ */ f(YS, {}),
      e
    ] })
  ] });
}
function YS() {
  const e = qu();
  return /* @__PURE__ */ f("div", { className: "flex flex-col border-r", children: /* @__PURE__ */ f(fg, { children: /* @__PURE__ */ V(hg, { className: "p-2 gap-0.5", children: [
    /* @__PURE__ */ f(To, { Icon: r7, label: "Home", disabled: !0 }),
    /* @__PURE__ */ f(To, { Icon: MS, label: "Table Editor", href: "/editor" }),
    /* @__PURE__ */ f(To, { Icon: IS, label: "SQL Editor", disabled: !0 }),
    /* @__PURE__ */ f("div", { className: "h-px bg-border-muted my-2" }),
    /* @__PURE__ */ f(To, { Icon: RS, label: "Database", disabled: !0 }),
    /* @__PURE__ */ f(
      To,
      {
        Icon: ES,
        label: "Authentication",
        href: "/auth",
        disabled: !e.auth?.enabled
      }
    ),
    /* @__PURE__ */ f(To, { Icon: kS, label: "Storage", disabled: !0 }),
    /* @__PURE__ */ f("div", { className: "h-px bg-border-muted my-2" }),
    /* @__PURE__ */ f(To, { Icon: d7, label: "Project Settings", disabled: !0 })
  ] }) }) });
}
function Ig({ children: e }) {
  return /* @__PURE__ */ f("div", { className: "px-5 py-2 border-b h-[42px]", children: typeof e == "string" ? /* @__PURE__ */ f("h3", { className: "font-medium", children: e }) : e });
}
function kg({ header: e, children: n }) {
  return /* @__PURE__ */ V("div", { className: "w-72 shrink-0 border-r bg-dash-sidebar", children: [
    /* @__PURE__ */ f(Ig, { children: e }),
    /* @__PURE__ */ f("div", { className: "flex flex-col grow gap-3", children: n })
  ] });
}
function An(e, n, r) {
  const a = typeof e.colSpan == "function" ? e.colSpan(r) : 1;
  if (Number.isInteger(a) && a > 1 && (!e.frozen || e.idx + a - 1 <= n)) return a;
}
function XS(e) {
  e.stopPropagation();
}
function ai(e, n = "instant") {
  e?.scrollIntoView({
    inline: "nearest",
    block: "nearest",
    behavior: n
  });
}
function Id(e) {
  let n = !1;
  const r = {
    ...e,
    preventGridDefault() {
      n = !0;
    },
    isGridDefaultPrevented() {
      return n;
    }
  };
  return Object.setPrototypeOf(r, Object.getPrototypeOf(e)), r;
}
const JS = /* @__PURE__ */ new Set([
  "Unidentified",
  "Alt",
  "AltGraph",
  "CapsLock",
  "Control",
  "Fn",
  "FnLock",
  "Meta",
  "NumLock",
  "ScrollLock",
  "Shift",
  "Tab",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  "Insert",
  "ContextMenu",
  "Escape",
  "Pause",
  "Play",
  "PrintScreen",
  "F1",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12"
]);
function kd(e) {
  return (e.ctrlKey || e.metaKey) && e.key !== "Control";
}
const QS = 86;
function e_(e, n) {
  return kd(e) && (e.keyCode !== QS || n) ? !1 : !JS.has(e.key);
}
function t_({ key: e, target: n }) {
  return e === "Tab" && (n instanceof HTMLInputElement || n instanceof HTMLTextAreaElement || n instanceof HTMLSelectElement) ? n.closest(".rdg-editor-container")?.querySelectorAll("input, textarea, select").length === 1 : !1;
}
function Mg(e) {
  const n = e === "rtl";
  return {
    leftKey: n ? "ArrowRight" : "ArrowLeft",
    rightKey: n ? "ArrowLeft" : "ArrowRight"
  };
}
const n_ = "rdg-7-0-0-beta-58-fa71d63e";
function r_(e) {
  return e.map(({ key: n, idx: r, minWidth: a, maxWidth: s }) => /* @__PURE__ */ f("div", {
    className: n_,
    style: {
      gridColumnStart: r + 1,
      minWidth: a,
      maxWidth: s
    },
    "data-measuring-cell-key": n
  }, n));
}
function o_({ selectedPosition: e, columns: n, rows: r }) {
  const a = n[e.idx], s = r[e.rowIdx];
  return Lg(a, s);
}
function Lg(e, n) {
  return e.renderEditCell != null && (typeof e.editable == "function" ? e.editable(n) : e.editable) !== !1;
}
function a_({ rows: e, topSummaryRows: n, bottomSummaryRows: r, rowIdx: a, mainHeaderRowIdx: s, lastFrozenColumnIndex: l, column: c }) {
  const d = n?.length ?? 0;
  if (a === s) return An(c, l, { type: "HEADER" });
  if (n && a > s && a <= d + s) return An(c, l, {
    type: "SUMMARY",
    row: n[a + d]
  });
  if (a >= 0 && a < e.length) {
    const h = e[a];
    return An(c, l, {
      type: "ROW",
      row: h
    });
  }
  if (r) return An(c, l, {
    type: "SUMMARY",
    row: r[a - e.length]
  });
}
function i_({ moveUp: e, moveNext: n, cellNavigationMode: r, columns: a, colSpanColumns: s, rows: l, topSummaryRows: c, bottomSummaryRows: d, minRowIdx: h, mainHeaderRowIdx: p, maxRowIdx: m, currentPosition: { idx: b, rowIdx: w }, nextPosition: g, lastFrozenColumnIndex: x, isCellWithinBounds: y }) {
  let { idx: E, rowIdx: R } = g;
  const N = a.length, L = (O) => {
    for (const D of s) {
      const A = D.idx;
      if (A > E) break;
      const z = a_({
        rows: l,
        topSummaryRows: c,
        bottomSummaryRows: d,
        rowIdx: R,
        mainHeaderRowIdx: p,
        lastFrozenColumnIndex: x,
        column: D
      });
      if (z && E > A && E < z + A) {
        E = A + (O ? z : 0);
        break;
      }
    }
  }, M = (O) => O.level + p, I = () => {
    if (n) {
      let O = a[E].parent;
      for (; O !== void 0; ) {
        const D = M(O);
        if (R === D) {
          E = O.idx + O.colSpan;
          break;
        }
        O = O.parent;
      }
    } else if (e) {
      let O = a[E].parent, D = !1;
      for (; O !== void 0; ) {
        const A = M(O);
        if (R >= A) {
          E = O.idx, R = A, D = !0;
          break;
        }
        O = O.parent;
      }
      D || (E = b, R = w);
    }
  };
  if (y(g) && (L(n), R < p && I()), r === "CHANGE_ROW" && (E === N ? R !== m && (E = 0, R += 1) : E === -1 && (R !== h && (R -= 1, E = N - 1), L(!1))), R < p && E > -1 && E < N) {
    let O = a[E].parent;
    const D = R;
    for (R = p; O !== void 0; ) {
      const A = M(O);
      A >= D && (R = A, E = O.idx), O = O.parent;
    }
  }
  return {
    idx: E,
    rowIdx: R
  };
}
function s_({ maxColIdx: e, minRowIdx: n, maxRowIdx: r, selectedPosition: { rowIdx: a, idx: s }, shiftKey: l }) {
  return l ? s === 0 && a === n : s === e && a === r;
}
const l_ = "rdg-7-0-0-beta-58-85c48527", Ng = `rdg-cell ${l_}`, c_ = "rdg-7-0-0-beta-58-17a9a6d4", u_ = `rdg-cell-frozen ${c_}`, d_ = "rdg-7-0-0-beta-58-bfba19bc", f_ = "rdg-7-0-0-beta-58-7abddb3e", h_ = `rdg-cell-drag-handle ${d_}`;
function Md(e) {
  return { "--rdg-grid-row-start": e };
}
function Tg(e, n, r) {
  const a = n + 1, s = `calc(${r - 1} * var(--rdg-header-row-height))`;
  return e.parent === void 0 ? {
    insetBlockStart: 0,
    gridRowStart: 1,
    gridRowEnd: a,
    paddingBlockStart: s
  } : {
    insetBlockStart: `calc(${n - r} * var(--rdg-header-row-height))`,
    gridRowStart: a - r,
    gridRowEnd: a,
    paddingBlockStart: s
  };
}
function Ea(e, n = 1) {
  const r = e.idx + 1;
  return {
    gridColumnStart: r,
    gridColumnEnd: r + n,
    insetInlineStart: e.frozen ? `var(--rdg-frozen-left-${e.idx})` : void 0
  };
}
function Mr(...e) {
  let n = "";
  for (const r of e) if (r) {
    if (typeof r == "string") n += ` ${r}`;
    else if (typeof r == "object")
      for (const a in r) r[a] && (n += ` ${a}`);
  }
  return n.trimStart();
}
function xa(e, ...n) {
  return Mr(Ng, { [u_]: e.frozen }, ...n);
}
const { min: pi, max: il, floor: F0, sign: p_, abs: g_ } = Math;
function wu(e) {
  if (typeof e != "function") throw new Error("Please specify the rowKeyGetter prop to use selection");
}
function Ld(e, { minWidth: n, maxWidth: r }) {
  return e = il(e, n), typeof r == "number" && r >= n ? pi(e, r) : e;
}
function Ag(e, n) {
  return e.parent === void 0 ? n : e.level - e.parent.level;
}
const m_ = "rdg-checkbox-input rdg-7-0-0-beta-58-3b807ead";
function v_({ onChange: e, indeterminate: n, ...r }) {
  function a(s) {
    e(s.target.checked, s.nativeEvent.shiftKey);
  }
  return /* @__PURE__ */ f("input", {
    ref: (s) => {
      s && (s.indeterminate = n === !0);
    },
    type: "checkbox",
    className: m_,
    onChange: a,
    ...r
  });
}
function b_(e) {
  try {
    return e.row[e.column.key];
  } catch {
    return null;
  }
}
const Og = Fr(void 0);
function Pl() {
  return Nr(Og);
}
function Nd({ value: e, tabIndex: n, indeterminate: r, disabled: a, onChange: s, "aria-label": l, "aria-labelledby": c }) {
  const d = Pl().renderCheckbox;
  return d({
    "aria-label": l,
    "aria-labelledby": c,
    tabIndex: n,
    indeterminate: r,
    disabled: a,
    checked: e,
    onChange: s
  });
}
const Td = Fr(void 0), Pg = Fr(void 0);
function Dg() {
  const e = Nr(Td), n = Nr(Pg);
  if (e === void 0 || n === void 0) throw new Error("useRowSelection must be used within renderCell");
  return {
    isRowSelectionDisabled: e.isRowSelectionDisabled,
    isRowSelected: e.isRowSelected,
    onRowSelectionChange: n
  };
}
const Fg = Fr(void 0), Wg = Fr(void 0);
function y_() {
  const e = Nr(Fg), n = Nr(Wg);
  if (e === void 0 || n === void 0) throw new Error("useHeaderRowSelection must be used within renderHeaderCell");
  return {
    isIndeterminate: e.isIndeterminate,
    isRowSelected: e.isRowSelected,
    onRowSelectionChange: n
  };
}
const sl = "rdg-select-column";
function w_(e) {
  const { isIndeterminate: n, isRowSelected: r, onRowSelectionChange: a } = y_();
  return /* @__PURE__ */ f(Nd, {
    "aria-label": "Select All",
    tabIndex: e.tabIndex,
    indeterminate: n,
    value: r,
    onChange: (s) => {
      a({ checked: n ? !1 : s });
    }
  });
}
function x_(e) {
  const { isRowSelectionDisabled: n, isRowSelected: r, onRowSelectionChange: a } = Dg();
  return /* @__PURE__ */ f(Nd, {
    "aria-label": "Select",
    tabIndex: e.tabIndex,
    disabled: n,
    value: r,
    onChange: (s, l) => {
      a({
        row: e.row,
        checked: s,
        isShiftClick: l
      });
    }
  });
}
function C_(e) {
  const { isRowSelected: n, onRowSelectionChange: r } = Dg();
  return /* @__PURE__ */ f(Nd, {
    "aria-label": "Select Group",
    tabIndex: e.tabIndex,
    value: n,
    onChange: (a) => {
      r({
        row: e.row,
        checked: a,
        isShiftClick: !1
      });
    }
  });
}
const S_ = {
  key: sl,
  name: "",
  width: 35,
  minWidth: 35,
  maxWidth: 35,
  resizable: !1,
  sortable: !1,
  frozen: !0,
  renderHeaderCell(e) {
    return /* @__PURE__ */ f(w_, { ...e });
  },
  renderCell(e) {
    return /* @__PURE__ */ f(x_, { ...e });
  },
  renderGroupCell(e) {
    return /* @__PURE__ */ f(C_, { ...e });
  }
}, __ = "rdg-7-0-0-beta-58-56a248e4", E_ = "rdg-header-sort-name rdg-7-0-0-beta-58-7fad8c83";
function R_({ column: e, sortDirection: n, priority: r }) {
  return e.sortable ? /* @__PURE__ */ f(I_, {
    sortDirection: n,
    priority: r,
    children: e.name
  }) : e.name;
}
function I_({ sortDirection: e, priority: n, children: r }) {
  const a = Pl().renderSortStatus;
  return /* @__PURE__ */ V("span", {
    className: __,
    children: [/* @__PURE__ */ f("span", {
      className: E_,
      children: r
    }), /* @__PURE__ */ f("span", { children: a({
      sortDirection: e,
      priority: n
    }) })]
  });
}
const k_ = "auto", M_ = 50;
function L_({ rawColumns: e, defaultColumnOptions: n, getColumnWidth: r, viewportWidth: a, scrollLeft: s, enableVirtualization: l }) {
  const c = n?.width ?? k_, d = n?.minWidth ?? M_, h = n?.maxWidth ?? void 0, p = n?.renderCell ?? b_, m = n?.renderHeaderCell ?? R_, b = n?.sortable ?? !1, w = n?.resizable ?? !1, g = n?.draggable ?? !1, { columns: x, colSpanColumns: y, lastFrozenColumnIndex: E, headerRowsCount: R } = Pt(() => {
    let A = -1, z = 1;
    const se = [];
    ue(e, 1);
    function ue(ne, Z, le) {
      for (const X of ne) {
        if ("children" in X) {
          const H = {
            name: X.name,
            parent: le,
            idx: -1,
            colSpan: 0,
            level: 0,
            headerCellClass: X.headerCellClass
          };
          ue(X.children, Z + 1, H);
          continue;
        }
        const ge = X.frozen ?? !1, pe = {
          ...X,
          parent: le,
          idx: 0,
          level: 0,
          frozen: ge,
          width: X.width ?? c,
          minWidth: X.minWidth ?? d,
          maxWidth: X.maxWidth ?? h,
          sortable: X.sortable ?? b,
          resizable: X.resizable ?? w,
          draggable: X.draggable ?? g,
          renderCell: X.renderCell ?? p,
          renderHeaderCell: X.renderHeaderCell ?? m
        };
        se.push(pe), ge && A++, Z > z && (z = Z);
      }
    }
    se.sort(({ key: ne, frozen: Z }, { key: le, frozen: X }) => ne === sl ? -1 : le === sl ? 1 : Z ? X ? 0 : -1 : X ? 1 : 0);
    const ce = [];
    return se.forEach((ne, Z) => {
      ne.idx = Z, Hg(ne, Z, 0), ne.colSpan != null && ce.push(ne);
    }), {
      columns: se,
      colSpanColumns: ce,
      lastFrozenColumnIndex: A,
      headerRowsCount: z
    };
  }, [
    e,
    c,
    d,
    h,
    p,
    m,
    w,
    b,
    g
  ]), { templateColumns: N, layoutCssVars: L, totalFrozenColumnWidth: M, columnMetrics: I } = Pt(() => {
    const A = /* @__PURE__ */ new Map();
    let z = 0, se = 0;
    const ue = [];
    for (const ne of x) {
      let Z = r(ne);
      typeof Z == "number" ? Z = Ld(Z, ne) : Z = ne.minWidth, ue.push(`${Z}px`), A.set(ne, {
        width: Z,
        left: z
      }), z += Z;
    }
    if (E !== -1) {
      const ne = A.get(x[E]);
      se = ne.left + ne.width;
    }
    const ce = {};
    for (let ne = 0; ne <= E; ne++) {
      const Z = x[ne];
      ce[`--rdg-frozen-left-${Z.idx}`] = `${A.get(Z).left}px`;
    }
    return {
      templateColumns: ue,
      layoutCssVars: ce,
      totalFrozenColumnWidth: se,
      columnMetrics: A
    };
  }, [
    r,
    x,
    E
  ]), [O, D] = Pt(() => {
    if (!l) return [0, x.length - 1];
    const A = s + M, z = s + a, se = x.length - 1, ue = pi(E + 1, se);
    if (A >= z) return [ue, ue];
    let ce = ue;
    for (; ce < se; ) {
      const { left: Z, width: le } = I.get(x[ce]);
      if (Z + le > A) break;
      ce++;
    }
    let ne = ce;
    for (; ne < se; ) {
      const { left: Z, width: le } = I.get(x[ne]);
      if (Z + le >= z) break;
      ne++;
    }
    return [il(ue, ce - 1), pi(se, ne + 1)];
  }, [
    I,
    x,
    E,
    s,
    M,
    a,
    l
  ]);
  return {
    columns: x,
    colSpanColumns: y,
    colOverscanStartIdx: O,
    colOverscanEndIdx: D,
    templateColumns: N,
    layoutCssVars: L,
    headerRowsCount: R,
    lastFrozenColumnIndex: E,
    totalFrozenColumnWidth: M
  };
}
function Hg(e, n, r) {
  if (r < e.level && (e.level = r), e.parent !== void 0) {
    const { parent: a } = e;
    a.idx === -1 && (a.idx = n), a.colSpan += 1, Hg(a, n, r - 1);
  }
}
function N_(e, n, r, a, s, l, c, d, h) {
  const [p, m] = Ze(null), [b, w] = Ze(null), [g, x] = Ze(s), y = e.length === n.length, E = y && s !== g, R = [...r], N = [];
  for (const { key: O, idx: D, width: A } of n) {
    const z = l.get(O);
    O === p?.key ? (R[D] = p.width === "max-content" ? p.width : `${p.width}px`, N.push(O)) : typeof A == "string" && z?.type !== "resized" && (E || b?.has(O) === !0 || z === void 0) && (R[D] = A, N.push(O));
  }
  const L = R.join(" ");
  co(M);
  function M() {
    if (x(s), N.length === 0) return;
    const O = new Map(l);
    let D = !1;
    for (const A of N) {
      const z = xu(a, A);
      D ||= z !== l.get(A)?.width, z === void 0 ? O.delete(A) : O.set(A, {
        type: "measured",
        width: z
      });
    }
    if (p !== null) {
      const A = p.key, z = l.get(A)?.width, se = xu(a, A);
      se !== void 0 && z !== se && (D = !0, O.set(A, {
        type: "resized",
        width: se
      })), m(null);
    }
    D && c(O);
  }
  function I(O, D) {
    const { key: A } = O;
    if (li(() => {
      if (y) {
        const z = /* @__PURE__ */ new Set();
        for (const { key: se, width: ue } of n) A !== se && typeof ue == "string" && l.get(se)?.type !== "resized" && z.add(se);
        w(z);
      }
      m({
        key: A,
        width: D
      }), h(typeof D == "number");
    }), w(null), d) {
      const z = l.get(A)?.width, se = typeof D == "number" ? D : xu(a, A);
      se !== void 0 && se !== z && d(O, se);
    }
  }
  return {
    gridTemplateColumns: L,
    handleColumnResize: I
  };
}
function xu(e, n) {
  const r = `[data-measuring-cell-key="${CSS.escape(n)}"]`;
  return e.current?.querySelector(r)?.getBoundingClientRect().width;
}
function T_() {
  const e = Ht(null), [n, r] = Ze(1), [a, s] = Ze(1), [l, c] = Ze(0);
  return co(() => {
    const { ResizeObserver: d } = window;
    if (d == null) return;
    const { clientWidth: h, clientHeight: p, offsetWidth: m, offsetHeight: b } = e.current, { width: w, height: g } = e.current.getBoundingClientRect(), x = b - p, y = w - m + h, E = g - x;
    r(y), s(E), c(x);
    const R = new d((N) => {
      const L = N[0].contentBoxSize[0], { clientHeight: M, offsetHeight: I } = e.current;
      li(() => {
        r(L.inlineSize), s(L.blockSize), c(I - M);
      });
    });
    return R.observe(e.current), () => {
      R.disconnect();
    };
  }, []), [
    e,
    n,
    a,
    l
  ];
}
function fn(e) {
  const n = Ht(e);
  co(() => {
    n.current = e;
  });
  const r = Tu((...a) => {
    n.current(...a);
  }, []);
  return e && r;
}
function _i(e) {
  const [n, r] = Ze(!1);
  n && !e && r(!1);
  function a(s) {
    if (s.target === s.currentTarget) {
      const l = s.currentTarget.querySelector('[tabindex="0"]');
      l !== null ? (l.focus({ preventScroll: !0 }), r(!0)) : r(!1);
    } else r(!0);
  }
  return {
    tabIndex: e && !n ? 0 : -1,
    childTabIndex: e ? 0 : -1,
    onFocus: e ? a : void 0
  };
}
function A_({ columns: e, colSpanColumns: n, rows: r, topSummaryRows: a, bottomSummaryRows: s, colOverscanStartIdx: l, colOverscanEndIdx: c, lastFrozenColumnIndex: d, rowOverscanStartIdx: h, rowOverscanEndIdx: p }) {
  const m = Pt(() => {
    if (l === 0) return 0;
    let b = l;
    const w = (g, x) => x !== void 0 && g + x > l ? (b = g, !0) : !1;
    for (const g of n) {
      const x = g.idx;
      if (x >= b || w(x, An(g, d, { type: "HEADER" }))) break;
      for (let y = h; y <= p; y++) {
        const E = r[y];
        if (w(x, An(g, d, {
          type: "ROW",
          row: E
        }))) break;
      }
      if (a != null) {
        for (const y of a) if (w(x, An(g, d, {
          type: "SUMMARY",
          row: y
        }))) break;
      }
      if (s != null) {
        for (const y of s) if (w(x, An(g, d, {
          type: "SUMMARY",
          row: y
        }))) break;
      }
    }
    return b;
  }, [
    h,
    p,
    r,
    a,
    s,
    l,
    d,
    n
  ]);
  return Pt(() => {
    const b = [];
    for (let w = 0; w <= c; w++) {
      const g = e[w];
      w < m && !g.frozen || b.push(g);
    }
    return b;
  }, [
    m,
    c,
    e
  ]);
}
function O_({ rows: e, rowHeight: n, clientHeight: r, scrollTop: a, enableVirtualization: s }) {
  const { totalRowHeight: l, gridTemplateRows: c, getRowTop: d, getRowHeight: h, findRowIdx: p } = Pt(() => {
    if (typeof n == "number") return {
      totalRowHeight: n * e.length,
      gridTemplateRows: ` repeat(${e.length}, ${n}px)`,
      getRowTop: (N) => N * n,
      getRowHeight: () => n,
      findRowIdx: (N) => F0(N / n)
    };
    let w = 0, g = "", x = null, y = 0;
    const E = e.map((N, L) => {
      const M = n(N), I = {
        top: w,
        height: M
      };
      return w += M, x === null ? (x = M, y = 1) : x === M ? y++ : (y > 1 ? g += `repeat(${y}, ${x}px) ` : g += `${x}px `, x = M, y = 1), L === e.length - 1 && (y > 1 ? g += `repeat(${y}, ${x}px)` : g += `${x}px`), I;
    }), R = (N) => il(0, pi(e.length - 1, N));
    return {
      totalRowHeight: w,
      gridTemplateRows: g,
      getRowTop: (N) => E[R(N)].top,
      getRowHeight: (N) => E[R(N)].height,
      findRowIdx(N) {
        let L = 0, M = E.length - 1;
        for (; L <= M; ) {
          const I = L + F0((M - L) / 2), O = E[I].top;
          if (O === N) return I;
          if (O < N ? L = I + 1 : O > N && (M = I - 1), L > M) return M;
        }
        return 0;
      }
    };
  }, [n, e]);
  let m = 0, b = e.length - 1;
  if (s) {
    const g = p(a), x = p(a + r);
    m = il(0, g - 4), b = pi(e.length - 1, x + 4);
  }
  return {
    rowOverscanStartIdx: m,
    rowOverscanEndIdx: b,
    totalRowHeight: l,
    gridTemplateRows: c,
    getRowTop: d,
    getRowHeight: h,
    findRowIdx: p
  };
}
const P_ = "rdg-cell-dragged-over rdg-7-0-0-beta-58-35ccb4c8";
function D_({ column: e, colSpan: n, isCellSelected: r, isDraggedOver: a, row: s, rowIdx: l, className: c, onMouseDown: d, onCellMouseDown: h, onClick: p, onCellClick: m, onDoubleClick: b, onCellDoubleClick: w, onContextMenu: g, onCellContextMenu: x, onRowChange: y, selectCell: E, style: R, ...N }) {
  const { tabIndex: L, childTabIndex: M, onFocus: I } = _i(r), { cellClass: O } = e;
  c = xa(e, { [P_]: a }, typeof O == "function" ? O(s) : O, c);
  const D = Lg(e, s);
  function A(le) {
    E({
      rowIdx: l,
      idx: e.idx
    }, { enableEditor: le });
  }
  function z(le, X) {
    let ge = !1;
    if (X) {
      const pe = Id(le);
      X({
        rowIdx: l,
        row: s,
        column: e,
        selectCell: A
      }, pe), ge = pe.isGridDefaultPrevented();
    }
    return ge;
  }
  function se(le) {
    d?.(le), z(le, h) || A();
  }
  function ue(le) {
    p?.(le), z(le, m);
  }
  function ce(le) {
    b?.(le), z(le, w) || A(!0);
  }
  function ne(le) {
    g?.(le), z(le, x);
  }
  function Z(le) {
    y(e, le);
  }
  return /* @__PURE__ */ f("div", {
    role: "gridcell",
    "aria-colindex": e.idx + 1,
    "aria-colspan": n,
    "aria-selected": r,
    "aria-readonly": !D || void 0,
    tabIndex: L,
    className: c,
    style: {
      ...Ea(e, n),
      ...R
    },
    onClick: ue,
    onMouseDown: se,
    onDoubleClick: ce,
    onContextMenu: ne,
    onFocus: I,
    ...N,
    children: e.renderCell({
      column: e,
      row: s,
      rowIdx: l,
      isCellEditable: D,
      tabIndex: M,
      onRowChange: Z
    })
  });
}
const F_ = ho(D_);
function W_(e, n) {
  return /* @__PURE__ */ f(F_, { ...n }, e);
}
const H_ = typeof scheduler == "object" && typeof scheduler.postTask == "function", $_ = "rdg-7-0-0-beta-58-46f9ea88";
function z_({ column: e, colSpan: n, row: r, rowIdx: a, onRowChange: s, closeEditor: l, onKeyDown: c, navigate: d }) {
  const h = Ht(void 0), p = Ht(void 0), m = Ht(void 0), b = e.editorOptions?.commitOnOutsideClick ?? !0, w = Vb(() => {
    y(!0, !1);
  });
  co(() => {
    if (!b) return;
    function L(I) {
      if (h.current = I, H_) {
        const O = new AbortController(), { signal: D } = O;
        p.current = O, scheduler.postTask(w, {
          priority: "user-blocking",
          signal: D
        }).catch(() => {
        });
      } else m.current = requestAnimationFrame(w);
    }
    function M(I) {
      h.current === I && w();
    }
    return addEventListener("mousedown", L, { capture: !0 }), addEventListener("mousedown", M), () => {
      removeEventListener("mousedown", L, { capture: !0 }), removeEventListener("mousedown", M), g();
    };
  }, [b]);
  function g() {
    h.current = void 0, p.current !== void 0 && (p.current.abort(), p.current = void 0), m.current !== void 0 && (cancelAnimationFrame(m.current), m.current = void 0);
  }
  function x(L) {
    if (c) {
      const M = Id(L);
      if (c({
        mode: "EDIT",
        row: r,
        column: e,
        rowIdx: a,
        navigate() {
          d(L);
        },
        onClose: y
      }, M), M.isGridDefaultPrevented()) return;
    }
    L.key === "Escape" ? y() : L.key === "Enter" ? y(!0) : t_(L) && d(L);
  }
  function y(L = !1, M = !0) {
    L ? s(r, !0, M) : l(M);
  }
  function E(L, M = !1) {
    s(L, M, M);
  }
  const { cellClass: R } = e, N = xa(e, "rdg-editor-container", !e.editorOptions?.displayCellContent && $_, typeof R == "function" ? R(r) : R);
  return /* @__PURE__ */ f("div", {
    role: "gridcell",
    "aria-colindex": e.idx + 1,
    "aria-colspan": n,
    "aria-selected": !0,
    className: N,
    style: Ea(e, n),
    onKeyDown: x,
    onMouseDownCapture: g,
    children: e.renderEditCell != null && /* @__PURE__ */ V(Fn, { children: [e.renderEditCell({
      column: e,
      row: r,
      rowIdx: a,
      onRowChange: E,
      onClose: y
    }), e.editorOptions?.displayCellContent && e.renderCell({
      column: e,
      row: r,
      rowIdx: a,
      isCellEditable: !0,
      tabIndex: -1,
      onRowChange: E
    })] })
  });
}
function B_({ column: e, rowIdx: n, isCellSelected: r, selectCell: a }) {
  const { tabIndex: s, onFocus: l } = _i(r), { colSpan: c } = e, d = Ag(e, n), h = e.idx + 1;
  function p() {
    a({
      idx: e.idx,
      rowIdx: n
    });
  }
  return /* @__PURE__ */ f("div", {
    role: "columnheader",
    "aria-colindex": h,
    "aria-colspan": c,
    "aria-rowspan": d,
    "aria-selected": r,
    tabIndex: s,
    className: Mr(Ng, e.headerCellClass),
    style: {
      ...Tg(e, n, d),
      gridColumnStart: h,
      gridColumnEnd: h + c
    },
    onFocus: l,
    onMouseDown: p,
    children: e.name
  });
}
const V_ = "rdg-7-0-0-beta-58-2a7e240d", U_ = "rdg-cell-resizable rdg-7-0-0-beta-58-1893dc0f", G_ = "rdg-resize-handle rdg-7-0-0-beta-58-4e60db91", K_ = "rdg-cell-draggable", Z_ = "rdg-cell-dragging rdg-7-0-0-beta-58-3e1a4ad4", j_ = "rdg-cell-drag-over rdg-7-0-0-beta-58-51abd8b8", q_ = "rdg-7-0-0-beta-58-c8d7aa64";
function Y_({ column: e, colSpan: n, rowIdx: r, isCellSelected: a, onColumnResize: s, onColumnResizeEnd: l, onColumnsReorder: c, sortColumns: d, onSortColumnsChange: h, selectCell: p, shouldFocusGrid: m, direction: b, draggedColumnKey: w, setDraggedColumnKey: g }) {
  const [x, y] = Ze(!1), E = Ht(null), R = w === e.key, N = Ag(e, r), { tabIndex: L, childTabIndex: M, onFocus: I } = _i(m || a), O = d?.findIndex((re) => re.columnKey === e.key), D = O !== void 0 && O > -1 ? d[O] : void 0, A = D?.direction, z = D !== void 0 && d.length > 1 ? O + 1 : void 0, se = A && !z ? A === "ASC" ? "ascending" : "descending" : void 0, { sortable: ue, resizable: ce, draggable: ne } = e, Z = xa(e, e.headerCellClass, {
    [V_]: ue,
    [U_]: ce,
    [K_]: ne,
    [Z_]: R,
    [j_]: x
  });
  function le(re) {
    if (h == null) return;
    const { sortDescendingFirst: me } = e;
    if (D === void 0) {
      const ee = {
        columnKey: e.key,
        direction: me ? "DESC" : "ASC"
      };
      h(d && re ? [...d, ee] : [ee]);
    } else {
      let ee;
      if ((me === !0 && A === "DESC" || me !== !0 && A === "ASC") && (ee = {
        columnKey: e.key,
        direction: A === "ASC" ? "DESC" : "ASC"
      }), re) {
        const Le = [...d];
        ee ? Le[O] = ee : Le.splice(O, 1), h(Le);
      } else h(ee ? [ee] : []);
    }
  }
  function X(re) {
    I?.(re), m && p({
      idx: 0,
      rowIdx: r
    });
  }
  function ge() {
    p({
      idx: e.idx,
      rowIdx: r
    });
  }
  function pe(re) {
    ue && le(re.ctrlKey || re.metaKey);
  }
  function H(re) {
    const { key: me } = re;
    if (ue && (me === " " || me === "Enter"))
      re.preventDefault(), le(re.ctrlKey || re.metaKey);
    else if (ce && kd(re) && (me === "ArrowLeft" || me === "ArrowRight")) {
      re.stopPropagation();
      const { width: ee } = re.currentTarget.getBoundingClientRect(), { leftKey: Le } = Mg(b), qe = Ld(ee + (me === Le ? -10 : 10), e);
      qe !== ee && s(e, qe);
    }
  }
  function P(re) {
    li(() => {
      g(e.key);
    }), re.dataTransfer.setDragImage(E.current, 0, 0), re.dataTransfer.dropEffect = "move";
  }
  function ae() {
    g(void 0);
  }
  function U(re) {
    re.preventDefault(), re.dataTransfer.dropEffect = "move";
  }
  function B(re) {
    y(!1), re.preventDefault(), c?.(w, e.key);
  }
  function G(re) {
    W0(re) && y(!0);
  }
  function J(re) {
    W0(re) && y(!1);
  }
  let Q, j;
  ne && (Q = {
    draggable: !0,
    onDragStart: P,
    onDragEnd: ae
  }, w !== void 0 && w !== e.key && (j = {
    onDragOver: U,
    onDragEnter: G,
    onDragLeave: J,
    onDrop: B
  }));
  const ve = {
    ...Tg(e, r, N),
    ...Ea(e, n)
  }, he = e.renderHeaderCell({
    column: e,
    sortDirection: A,
    priority: z,
    tabIndex: M
  });
  return /* @__PURE__ */ V(Fn, { children: [R && /* @__PURE__ */ f("div", {
    ref: E,
    style: ve,
    className: xa(e, e.headerCellClass, q_),
    children: he
  }), /* @__PURE__ */ V("div", {
    role: "columnheader",
    "aria-colindex": e.idx + 1,
    "aria-colspan": n,
    "aria-rowspan": N,
    "aria-selected": a,
    "aria-sort": se,
    tabIndex: L,
    className: Z,
    style: ve,
    onMouseDown: ge,
    onFocus: X,
    onClick: pe,
    onKeyDown: H,
    ...Q,
    ...j,
    children: [he, ce && /* @__PURE__ */ f(X_, {
      direction: b,
      column: e,
      onColumnResize: s,
      onColumnResizeEnd: l
    })]
  })] });
}
function X_({ direction: e, column: n, onColumnResize: r, onColumnResizeEnd: a }) {
  const s = Ht(void 0), l = e === "rtl";
  function c(m) {
    if (m.pointerType === "mouse" && m.buttons !== 1) return;
    m.preventDefault();
    const { currentTarget: b, pointerId: w } = m;
    b.setPointerCapture(w);
    const { right: g, left: x } = b.parentElement.getBoundingClientRect();
    s.current = l ? m.clientX - x : g - m.clientX;
  }
  function d(m) {
    const b = s.current;
    if (b === void 0) return;
    const { width: w, right: g, left: x } = m.currentTarget.parentElement.getBoundingClientRect();
    let y = l ? g + b - m.clientX : m.clientX + b - x;
    y = Ld(y, n), w > 0 && y !== w && r(n, y);
  }
  function h() {
    a(), s.current = void 0;
  }
  function p() {
    r(n, "max-content");
  }
  return /* @__PURE__ */ f("div", {
    "aria-hidden": !0,
    className: G_,
    onClick: XS,
    onPointerDown: c,
    onPointerMove: d,
    onLostPointerCapture: h,
    onDoubleClick: p
  });
}
function W0(e) {
  const n = e.relatedTarget;
  return !e.currentTarget.contains(n);
}
const J_ = "rdg-7-0-0-beta-58-3c083f1b", Ad = `rdg-row ${J_}`, Q_ = "rdg-7-0-0-beta-58-3fe773c3", Dl = "rdg-row-selected", eE = "rdg-7-0-0-beta-58-97ce3fde", tE = "rdg-top-summary-row", nE = "rdg-bottom-summary-row", rE = "rdg-7-0-0-beta-58-0dbd5994", $g = `rdg-header-row ${rE}`;
function oE({ headerRowClass: e, rowIdx: n, columns: r, onColumnResize: a, onColumnResizeEnd: s, onColumnsReorder: l, sortColumns: c, onSortColumnsChange: d, lastFrozenColumnIndex: h, selectedCellIdx: p, selectCell: m, shouldFocusGrid: b, direction: w }) {
  const [g, x] = Ze(), y = [];
  for (let E = 0; E < r.length; E++) {
    const R = r[E], N = An(R, h, { type: "HEADER" });
    N !== void 0 && (E += N - 1), y.push(/* @__PURE__ */ f(Y_, {
      column: R,
      colSpan: N,
      rowIdx: n,
      isCellSelected: p === R.idx,
      onColumnResize: a,
      onColumnResizeEnd: s,
      onColumnsReorder: l,
      onSortColumnsChange: d,
      sortColumns: c,
      selectCell: m,
      shouldFocusGrid: b && E === 0,
      direction: w,
      draggedColumnKey: g,
      setDraggedColumnKey: x
    }, R.key));
  }
  return /* @__PURE__ */ f("div", {
    role: "row",
    "aria-rowindex": n,
    className: Mr($g, { [Dl]: p === -1 }, e),
    children: y
  });
}
var aE = ho(oE);
function iE({ rowIdx: e, level: n, columns: r, selectedCellIdx: a, selectCell: s }) {
  const l = [], c = /* @__PURE__ */ new Set();
  for (const d of r) {
    let { parent: h } = d;
    if (h !== void 0) {
      for (; h.level > n && h.parent !== void 0; )
        h = h.parent;
      if (h.level === n && !c.has(h)) {
        c.add(h);
        const { idx: p } = h;
        l.push(/* @__PURE__ */ f(B_, {
          column: h,
          rowIdx: e,
          isCellSelected: a === p,
          selectCell: s
        }, p));
      }
    }
  }
  return /* @__PURE__ */ f("div", {
    role: "row",
    "aria-rowindex": e,
    className: $g,
    children: l
  });
}
var sE = ho(iE);
function lE({ className: e, rowIdx: n, gridRowStart: r, selectedCellIdx: a, isRowSelectionDisabled: s, isRowSelected: l, draggedOverCellIdx: c, lastFrozenColumnIndex: d, row: h, viewportColumns: p, selectedCellEditor: m, onCellMouseDown: b, onCellClick: w, onCellDoubleClick: g, onCellContextMenu: x, rowClass: y, onRowChange: E, selectCell: R, style: N, ...L }) {
  const M = Pl().renderCell, I = fn((D, A) => {
    E(D, n, A);
  });
  e = Mr(Ad, `rdg-row-${n % 2 === 0 ? "even" : "odd"}`, { [Dl]: a === -1 }, y?.(h, n), e);
  const O = [];
  for (let D = 0; D < p.length; D++) {
    const A = p[D], { idx: z } = A, se = An(A, d, {
      type: "ROW",
      row: h
    });
    se !== void 0 && (D += se - 1);
    const ue = a === z;
    ue && m ? O.push(m) : O.push(M(A.key, {
      column: A,
      colSpan: se,
      row: h,
      rowIdx: n,
      isDraggedOver: c === z,
      isCellSelected: ue,
      onCellMouseDown: b,
      onCellClick: w,
      onCellDoubleClick: g,
      onCellContextMenu: x,
      onRowChange: I,
      selectCell: R
    }));
  }
  return /* @__PURE__ */ f(Td, {
    value: Pt(() => ({
      isRowSelected: l,
      isRowSelectionDisabled: s
    }), [s, l]),
    children: /* @__PURE__ */ f("div", {
      role: "row",
      className: e,
      style: {
        ...Md(r),
        ...N
      },
      ...L,
      children: O
    })
  });
}
const cE = ho(lE);
function uE(e, n) {
  return /* @__PURE__ */ f(cE, { ...n }, e);
}
function dE({ scrollToPosition: { idx: e, rowIdx: n }, gridRef: r, setScrollToCellPosition: a }) {
  const s = Ht(null);
  return co(() => {
    ai(s.current, "auto");
  }), co(() => {
    function l() {
      a(null);
    }
    const c = new IntersectionObserver(l, {
      root: r.current,
      threshold: 1
    });
    return c.observe(s.current), () => {
      c.disconnect();
    };
  }, [r, a]), /* @__PURE__ */ f("div", {
    ref: s,
    style: {
      gridColumn: e === void 0 ? "1/-1" : e + 1,
      gridRow: n === void 0 ? "1/-1" : n + 2
    }
  });
}
const fE = "rdg-sort-arrow rdg-7-0-0-beta-58-3d5115f3";
function hE({ sortDirection: e, priority: n }) {
  return /* @__PURE__ */ V(Fn, { children: [pE({ sortDirection: e }), gE({ priority: n })] });
}
function pE({ sortDirection: e }) {
  return e === void 0 ? null : /* @__PURE__ */ f("svg", {
    viewBox: "0 0 12 8",
    width: "12",
    height: "8",
    className: fE,
    "aria-hidden": !0,
    children: /* @__PURE__ */ f("path", { d: e === "ASC" ? "M0 8 6 0 12 8" : "M0 0 6 8 12 0" })
  });
}
function gE({ priority: e }) {
  return e;
}
const mE = "rdg-7-0-0-beta-58-ccd2e5d9", vE = `rdg ${mE}`, bE = "rdg-7-0-0-beta-58-e9b0e1c9", yE = `rdg-viewport-dragging ${bE}`, wE = "rdg-7-0-0-beta-58-dbb8b3c5", xE = "rdg-7-0-0-beta-58-e9f55541", CE = "rdg-7-0-0-beta-58-d907aa87";
function SE({ column: e, colSpan: n, row: r, rowIdx: a, isCellSelected: s, selectCell: l }) {
  const { tabIndex: c, childTabIndex: d, onFocus: h } = _i(s), { summaryCellClass: p } = e, m = xa(e, CE, typeof p == "function" ? p(r) : p);
  function b() {
    l({
      rowIdx: a,
      idx: e.idx
    });
  }
  return /* @__PURE__ */ f("div", {
    role: "gridcell",
    "aria-colindex": e.idx + 1,
    "aria-colspan": n,
    "aria-selected": s,
    tabIndex: c,
    className: m,
    style: Ea(e, n),
    onMouseDown: b,
    onFocus: h,
    children: e.renderSummaryCell?.({
      column: e,
      row: r,
      tabIndex: d
    })
  });
}
var _E = ho(SE);
const EE = "rdg-7-0-0-beta-58-0b90c82c", RE = "rdg-7-0-0-beta-58-d0520eab", IE = `rdg-summary-row ${EE}`;
function kE({ rowIdx: e, gridRowStart: n, row: r, viewportColumns: a, top: s, bottom: l, lastFrozenColumnIndex: c, selectedCellIdx: d, isTop: h, selectCell: p, "aria-rowindex": m }) {
  const b = [];
  for (let w = 0; w < a.length; w++) {
    const g = a[w], x = An(g, c, {
      type: "SUMMARY",
      row: r
    });
    x !== void 0 && (w += x - 1);
    const y = d === g.idx;
    b.push(/* @__PURE__ */ f(_E, {
      column: g,
      colSpan: x,
      row: r,
      rowIdx: e,
      isCellSelected: y,
      selectCell: p
    }, g.key));
  }
  return /* @__PURE__ */ f("div", {
    role: "row",
    "aria-rowindex": m,
    className: Mr(Ad, `rdg-row-${e % 2 === 0 ? "even" : "odd"}`, IE, {
      [Dl]: d === -1,
      [`${tE} ${RE}`]: h,
      [nE]: !h
    }),
    style: {
      ...Md(n),
      "--rdg-summary-row-top": s !== void 0 ? `${s}px` : void 0,
      "--rdg-summary-row-bottom": l !== void 0 ? `${l}px` : void 0
    },
    children: b
  });
}
var H0 = ho(kE);
function ME(e) {
  const { ref: n, columns: r, rows: a, topSummaryRows: s, bottomSummaryRows: l, rowKeyGetter: c, onRowsChange: d, rowHeight: h, headerRowHeight: p, summaryRowHeight: m, columnWidths: b, onColumnWidthsChange: w, selectedRows: g, isRowSelectionDisabled: x, onSelectedRowsChange: y, sortColumns: E, onSortColumnsChange: R, defaultColumnOptions: N, onCellMouseDown: L, onCellClick: M, onCellDoubleClick: I, onCellContextMenu: O, onCellKeyDown: D, onSelectedCellChange: A, onScroll: z, onColumnResize: se, onColumnsReorder: ue, onFill: ce, onCellCopy: ne, onCellPaste: Z, enableVirtualization: le, renderers: X, className: ge, style: pe, rowClass: H, headerRowClass: P, direction: ae, role: U, "aria-label": B, "aria-labelledby": G, "aria-description": J, "aria-describedby": Q, "aria-rowcount": j, "data-testid": ve, "data-cy": he } = e, re = Pl(), me = U ?? "grid", ee = h ?? 35, Le = p ?? (typeof ee == "number" ? ee : 35), qe = m ?? (typeof ee == "number" ? ee : 35), vt = X?.renderRow ?? re?.renderRow ?? uE, $t = X?.renderCell ?? re?.renderCell ?? W_, Re = X?.renderSortStatus ?? re?.renderSortStatus ?? hE, Ue = X?.renderCheckbox ?? re?.renderCheckbox ?? v_, zt = X?.noRowsFallback ?? re?.noRowsFallback, St = le ?? !0, rt = ae ?? "ltr", [ut, st] = Ze(0), [pt, Qn] = Ze(0), [bt, _t] = Ze(() => b ?? /* @__PURE__ */ new Map()), [on, an] = Ze(!1), [ot, Wr] = Ze(!1), [qt, Wn] = Ze(void 0), [Yt, pr] = Ze(null), [gn, gr] = Ze(!1), [Hn, Bo] = Ze(-1), Hr = b != null && w != null && !on, $r = Hr ? b : bt, zr = Hr ? (q) => {
    _t(q), w(q);
  } : _t, sn = Tu((q) => $r.get(q.key)?.width ?? q.width, [$r]), [En, Ne, je, lt] = T_(), { columns: Ye, colSpanColumns: Kt, lastFrozenColumnIndex: xt, headerRowsCount: Bt, colOverscanStartIdx: Vt, colOverscanEndIdx: mn, templateColumns: Ra, layoutCssVars: Hl, totalFrozenColumnWidth: $l } = L_({
    rawColumns: r,
    defaultColumnOptions: N,
    getColumnWidth: sn,
    scrollLeft: pt,
    viewportWidth: Ne,
    enableVirtualization: St
  }), Br = s?.length ?? 0, Vr = l?.length ?? 0, Ei = Br + Vr, er = Bt + Br, Ia = Bt - 1, Xt = -er, vo = Xt + Ia, mr = a.length + Vr - 1, [Se, Ur] = Ze(() => ({
    idx: -1,
    rowIdx: Xt - 1,
    mode: "SELECT"
  })), bo = Ht(null), ka = me === "treegrid", Vo = Bt * Le, yo = Ei * qe, Uo = je - Vo - yo, Gr = g != null && y != null, { leftKey: zl, rightKey: Ri } = Mg(rt), Ii = j ?? Bt + a.length + Ei, ki = Pt(() => ({
    renderCheckbox: Ue,
    renderSortStatus: Re,
    renderCell: $t
  }), [
    Ue,
    Re,
    $t
  ]), Mi = Pt(() => {
    let q = !1, oe = !1;
    if (c != null && g != null && g.size > 0) {
      for (const xe of a)
        if (g.has(c(xe)) ? q = !0 : oe = !0, q && oe) break;
    }
    return {
      isRowSelected: q && !oe,
      isIndeterminate: q && oe
    };
  }, [
    a,
    g,
    c
  ]), { rowOverscanStartIdx: Kr, rowOverscanEndIdx: wo, totalRowHeight: Ma, gridTemplateRows: Bl, getRowTop: Li, getRowHeight: Ni, findRowIdx: Go } = O_({
    rows: a,
    rowHeight: ee,
    clientHeight: Uo,
    scrollTop: ut,
    enableVirtualization: St
  }), $n = A_({
    columns: Ye,
    colSpanColumns: Kt,
    colOverscanStartIdx: Vt,
    colOverscanEndIdx: mn,
    lastFrozenColumnIndex: xt,
    rowOverscanStartIdx: Kr,
    rowOverscanEndIdx: wo,
    rows: a,
    topSummaryRows: s,
    bottomSummaryRows: l
  }), { gridTemplateColumns: La, handleColumnResize: Vl } = N_(Ye, $n, Ra, En, Ne, $r, zr, se, an), Ti = ka ? -1 : 0, zn = Ye.length - 1, Na = Fa(Se), Ko = Wa(Se), Ai = Le + Ma + yo + lt, Oi = fn(Vl), Ta = fn(Yl), Ul = fn(ue), Pi = fn(R), Aa = fn(L), Oa = fn(M), Zr = fn(I), Di = fn(O), Fi = fn(Kl), Gl = fn(Hi), Wi = fn(qo), Zo = fn(jr), Pa = fn(nc), jo = Tu((q = !0) => {
    const oe = $0(En.current);
    oe !== null && (q && ai(oe), oe.focus({ preventScroll: !0 }));
  }, [En]);
  co(() => {
    gn && (bo.current !== null && Se.idx === -1 ? (bo.current.focus({ preventScroll: !0 }), ai(bo.current)) : jo(), gr(!1));
  }, [
    gn,
    jo,
    Se.idx
  ]), Bb(n, () => ({
    element: En.current,
    scrollToCell({ idx: q, rowIdx: oe }) {
      const xe = q !== void 0 && q > xt && q < Ye.length ? q : void 0, ye = oe !== void 0 && vr(oe) ? oe : void 0;
      (xe !== void 0 || ye !== void 0) && pr({
        idx: xe,
        rowIdx: ye
      });
    },
    selectCell: jr
  }));
  function Kl(q) {
    if (!y) return;
    wu(c);
    const oe = new Set(g);
    for (const xe of a) {
      if (x?.(xe) === !0) continue;
      const ye = c(xe);
      q.checked ? oe.add(ye) : oe.delete(ye);
    }
    y(oe);
  }
  function Hi(q) {
    if (!y) return;
    wu(c);
    const { row: oe, checked: xe, isShiftClick: ye } = q;
    if (x?.(oe) === !0) return;
    const Fe = new Set(g), Pe = c(oe), it = a.indexOf(oe);
    if (Bo(it), xe ? Fe.add(Pe) : Fe.delete(Pe), ye && Hn !== -1 && Hn !== it && Hn < a.length) {
      const gt = p_(it - Hn);
      for (let Xe = Hn + gt; Xe !== it; Xe += gt) {
        const Mt = a[Xe];
        x?.(Mt) !== !0 && (xe ? Fe.add(c(Mt)) : Fe.delete(c(Mt)));
      }
    }
    y(Fe);
  }
  function Zl(q) {
    const { idx: oe, rowIdx: xe, mode: ye } = Se;
    if (ye === "EDIT") return;
    if (D && vr(xe)) {
      const it = a[xe], gt = Id(q);
      if (D({
        mode: "SELECT",
        row: it,
        column: Ye[oe],
        rowIdx: xe,
        selectCell: jr
      }, gt), gt.isGridDefaultPrevented()) return;
    }
    if (!(q.target instanceof Element)) return;
    const Fe = q.target.closest(".rdg-cell") !== null, Pe = ka && q.target === bo.current;
    if (!(!Fe && !Pe))
      switch (q.key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
        case "Tab":
        case "Home":
        case "End":
        case "PageUp":
        case "PageDown":
          Xo(q);
          break;
        default:
          Da(q);
          break;
      }
  }
  function $i(q) {
    const { scrollTop: oe, scrollLeft: xe } = q.currentTarget;
    li(() => {
      st(oe), Qn(g_(xe));
    }), z?.(q);
  }
  function qo(q, oe, xe) {
    typeof d == "function" && xe !== a[oe] && d(a.with(oe, xe), {
      indexes: [oe],
      column: q
    });
  }
  function zi() {
    Se.mode === "EDIT" && qo(Ye[Se.idx], Se.rowIdx, Se.row);
  }
  function jl(q) {
    if (!Ko) return;
    const { idx: oe, rowIdx: xe } = Se;
    ne?.({
      row: a[xe],
      column: Ye[oe]
    }, q);
  }
  function ql(q) {
    if (!Z || !d || !Yo(Se)) return;
    const { idx: oe, rowIdx: xe } = Se, ye = Ye[oe];
    qo(ye, xe, Z({
      row: a[xe],
      column: ye
    }, q));
  }
  function Da(q) {
    if (!Ko) return;
    const oe = a[Se.rowIdx], { key: xe, shiftKey: ye } = q;
    if (Gr && ye && xe === " ") {
      wu(c);
      const Fe = c(oe);
      Hi({
        row: oe,
        checked: !g.has(Fe),
        isShiftClick: !1
      }), q.preventDefault();
      return;
    }
    Yo(Se) && e_(q, Z != null) && Ur(({ idx: Fe, rowIdx: Pe }) => ({
      idx: Fe,
      rowIdx: Pe,
      mode: "EDIT",
      row: oe,
      originalRow: oe
    }));
  }
  function Yl() {
    on && (w?.($r), an(!1));
  }
  function Xl(q) {
    q.preventDefault(), !(q.pointerType === "mouse" && q.buttons !== 1) && (Wr(!0), q.currentTarget.setPointerCapture(q.pointerId));
  }
  function Jl(q) {
    const oe = En.current, xe = Go(ut - (Vo + Br * qe) + q.clientY - oe.getBoundingClientRect().top);
    Wn(xe);
    const ye = er + xe + 1;
    ai(oe.querySelector(`:scope > [aria-rowindex="${ye}"] > [aria-colindex="${Se.idx + 1}"]`));
  }
  function Ql() {
    if (Wr(!1), qt === void 0) return;
    const { rowIdx: q } = Se, [oe, xe] = q < qt ? [q + 1, qt + 1] : [qt, q];
    at(oe, xe), Wn(void 0);
  }
  function ec() {
    jo(!1);
  }
  function dt(q) {
    q.stopPropagation(), at(Se.rowIdx + 1, a.length);
  }
  function at(q, oe) {
    if (d == null) return;
    const { rowIdx: xe, idx: ye } = Se, Fe = Ye[ye], Pe = a[xe], it = [...a], gt = [];
    for (let Xe = q; Xe < oe; Xe++) if (Yo({
      rowIdx: Xe,
      idx: ye
    })) {
      const Mt = ce({
        columnKey: Fe.key,
        sourceRow: Pe,
        targetRow: a[Xe]
      });
      Mt !== a[Xe] && (it[Xe] = Mt, gt.push(Xe));
    }
    gt.length > 0 && d(it, {
      indexes: gt,
      column: Fe
    });
  }
  function Bi(q) {
    return q >= Ti && q <= zn;
  }
  function vr(q) {
    return q >= 0 && q < a.length;
  }
  function Fa({ idx: q, rowIdx: oe }) {
    return oe >= Xt && oe <= mr && Bi(q);
  }
  function tc({ idx: q, rowIdx: oe }) {
    return vr(oe) && q >= 0 && q <= zn;
  }
  function Wa({ idx: q, rowIdx: oe }) {
    return vr(oe) && Bi(q);
  }
  function Yo(q) {
    return tc(q) && o_({
      columns: Ye,
      rows: a,
      selectedPosition: q
    });
  }
  function jr(q, oe) {
    if (!Fa(q)) return;
    zi();
    const xe = z0(Se, q);
    if (oe?.enableEditor && Yo(q)) {
      const ye = a[q.rowIdx];
      Ur({
        ...q,
        mode: "EDIT",
        row: ye,
        originalRow: ye
      });
    } else xe ? ai($0(En.current)) : (gr(oe?.shouldFocusCell === !0), Ur({
      ...q,
      mode: "SELECT"
    }));
    A && !xe && A({
      rowIdx: q.rowIdx,
      row: vr(q.rowIdx) ? a[q.rowIdx] : void 0,
      column: Ye[q.idx]
    });
  }
  function nc({ idx: q, rowIdx: oe }) {
    jr({
      rowIdx: Xt + oe - 1,
      idx: q
    });
  }
  function Nt(q, oe, xe) {
    const { idx: ye, rowIdx: Fe } = Se, Pe = Na && ye === -1;
    switch (q) {
      case "ArrowUp":
        return {
          idx: ye,
          rowIdx: Fe - 1
        };
      case "ArrowDown":
        return {
          idx: ye,
          rowIdx: Fe + 1
        };
      case zl:
        return {
          idx: ye - 1,
          rowIdx: Fe
        };
      case Ri:
        return {
          idx: ye + 1,
          rowIdx: Fe
        };
      case "Tab":
        return {
          idx: ye + (xe ? -1 : 1),
          rowIdx: Fe
        };
      case "Home":
        return Pe ? {
          idx: ye,
          rowIdx: Xt
        } : {
          idx: 0,
          rowIdx: oe ? Xt : Fe
        };
      case "End":
        return Pe ? {
          idx: ye,
          rowIdx: mr
        } : {
          idx: zn,
          rowIdx: oe ? mr : Fe
        };
      case "PageUp": {
        if (Se.rowIdx === Xt) return Se;
        const it = Li(Fe) + Ni(Fe) - Uo;
        return {
          idx: ye,
          rowIdx: it > 0 ? Go(it) : 0
        };
      }
      case "PageDown": {
        if (Se.rowIdx >= a.length) return Se;
        const it = Li(Fe) + Uo;
        return {
          idx: ye,
          rowIdx: it < Ma ? Go(it) : a.length - 1
        };
      }
      default:
        return Se;
    }
  }
  function Xo(q) {
    const { key: oe, shiftKey: xe } = q;
    let ye = "NONE";
    if (oe === "Tab") {
      if (s_({
        shiftKey: xe,
        maxColIdx: zn,
        minRowIdx: Xt,
        maxRowIdx: mr,
        selectedPosition: Se
      })) {
        zi();
        return;
      }
      ye = "CHANGE_ROW";
    }
    q.preventDefault();
    const Fe = Nt(oe, kd(q), xe);
    z0(Se, Fe) || jr(i_({
      moveUp: oe === "ArrowUp",
      moveNext: oe === Ri || oe === "Tab" && !xe,
      columns: Ye,
      colSpanColumns: Kt,
      rows: a,
      topSummaryRows: s,
      bottomSummaryRows: l,
      minRowIdx: Xt,
      mainHeaderRowIdx: vo,
      maxRowIdx: mr,
      lastFrozenColumnIndex: xt,
      cellNavigationMode: ye,
      currentPosition: Se,
      nextPosition: Fe,
      isCellWithinBounds: Fa
    }), { shouldFocusCell: !0 });
  }
  function br(q) {
    if (qt === void 0) return;
    const { rowIdx: oe } = Se;
    return (oe < qt ? oe < q && q <= qt : oe > q && q >= qt) ? Se.idx : void 0;
  }
  function Vi() {
    if (ce == null || Se.mode === "EDIT" || !Wa(Se)) return;
    const { idx: q, rowIdx: oe } = Se, xe = Ye[q];
    if (xe.renderEditCell == null || xe.editable === !1) return;
    const ye = oe === mr, Fe = sn(xe), Pe = xe.colSpan?.({
      type: "ROW",
      row: a[oe]
    }) ?? 1, { insetInlineStart: it, ...gt } = Ea(xe, Pe), Xe = "calc(var(--rdg-drag-handle-size) * -0.5 + 1px)", Mt = xe.idx + Pe - 1 === zn;
    return /* @__PURE__ */ f("div", {
      style: {
        ...gt,
        gridRowStart: er + oe + 1,
        marginInlineEnd: Mt ? void 0 : Xe,
        marginBlockEnd: ye ? void 0 : Xe,
        insetInlineStart: it ? `calc(${it} + ${Fe}px + var(--rdg-drag-handle-size) * -0.5 - 1px)` : void 0
      },
      className: Mr(h_, xe.frozen && f_),
      onPointerDown: Xl,
      onPointerMove: ot ? Jl : void 0,
      onLostPointerCapture: ot ? Ql : void 0,
      onClick: ec,
      onDoubleClick: dt
    });
  }
  function Ha(q) {
    if (!Wa(Se) || Se.rowIdx !== q || Se.mode === "SELECT") return;
    const { idx: oe, row: xe } = Se, ye = Ye[oe], Fe = An(ye, xt, {
      type: "ROW",
      row: xe
    }), Pe = ye.editorOptions?.closeOnExternalRowChange ?? !0, it = (Xe) => {
      gr(Xe), Ur(({ idx: Mt, rowIdx: Bn }) => ({
        idx: Mt,
        rowIdx: Bn,
        mode: "SELECT"
      }));
    }, gt = (Xe, Mt, Bn) => {
      Mt ? li(() => {
        qo(ye, Se.rowIdx, Xe), it(Bn);
      }) : Ur((ct) => ({
        ...ct,
        row: Xe
      }));
    };
    return Pe && a[Se.rowIdx] !== Se.originalRow && it(!1), /* @__PURE__ */ f(z_, {
      column: ye,
      colSpan: Fe,
      row: xe,
      rowIdx: q,
      onRowChange: gt,
      closeEditor: it,
      onKeyDown: D,
      navigate: Xo
    }, ye.key);
  }
  function Dt(q) {
    const oe = Se.idx === -1 ? void 0 : Ye[Se.idx];
    return oe !== void 0 && Se.rowIdx === q && !$n.includes(oe) ? Se.idx > mn ? [...$n, oe] : [
      ...$n.slice(0, xt + 1),
      oe,
      ...$n.slice(xt + 1)
    ] : $n;
  }
  function Ui() {
    const q = [], { idx: oe, rowIdx: xe } = Se, ye = Ko && xe < Kr ? Kr - 1 : Kr, Fe = Ko && xe > wo ? wo + 1 : wo;
    for (let Pe = ye; Pe <= Fe; Pe++) {
      const it = Pe === Kr - 1 || Pe === wo + 1, gt = it ? xe : Pe;
      let Xe = $n;
      const Mt = oe === -1 ? void 0 : Ye[oe];
      Mt !== void 0 && (it ? Xe = [Mt] : Xe = Dt(gt));
      const Bn = a[gt], ct = er + gt + 1;
      let Rn = gt, Co = !1;
      typeof c == "function" && (Rn = c(Bn), Co = g?.has(Rn) ?? !1), q.push(vt(Rn, {
        "aria-rowindex": er + gt + 1,
        "aria-selected": Gr ? Co : void 0,
        rowIdx: gt,
        row: Bn,
        viewportColumns: Xe,
        isRowSelectionDisabled: x?.(Bn) ?? !1,
        isRowSelected: Co,
        onCellMouseDown: Aa,
        onCellClick: Oa,
        onCellDoubleClick: Zr,
        onCellContextMenu: Di,
        rowClass: H,
        gridRowStart: ct,
        selectedCellIdx: xe === gt ? oe : void 0,
        draggedOverCellIdx: br(gt),
        lastFrozenColumnIndex: xt,
        onRowChange: Wi,
        selectCell: Zo,
        selectedCellEditor: Ha(gt)
      }));
    }
    return q;
  }
  (Se.idx > zn || Se.rowIdx > mr) && (Ur({
    idx: -1,
    rowIdx: Xt - 1,
    mode: "SELECT"
  }), Wn(void 0)), Hr && bt !== b && _t(b);
  let xo = `repeat(${Bt}, ${Le}px)`;
  Br > 0 && (xo += ` repeat(${Br}, ${qe}px)`), a.length > 0 && (xo += Bl), Vr > 0 && (xo += ` repeat(${Vr}, ${qe}px)`);
  const Jo = Se.idx === -1 && Se.rowIdx !== Xt - 1;
  return /* @__PURE__ */ V("div", {
    role: me,
    "aria-label": B,
    "aria-labelledby": G,
    "aria-description": J,
    "aria-describedby": Q,
    "aria-multiselectable": Gr ? !0 : void 0,
    "aria-colcount": Ye.length,
    "aria-rowcount": Ii,
    tabIndex: -1,
    className: Mr(vE, { [yE]: ot }, ge),
    style: {
      ...pe,
      scrollPaddingInlineStart: Se.idx > xt || Yt?.idx !== void 0 ? `${$l}px` : void 0,
      scrollPaddingBlock: vr(Se.rowIdx) || Yt?.rowIdx !== void 0 ? `${Vo + Br * qe}px ${Vr * qe}px` : void 0,
      gridTemplateColumns: La,
      gridTemplateRows: xo,
      "--rdg-header-row-height": `${Le}px`,
      "--rdg-scroll-height": `${Ai}px`,
      ...Hl
    },
    dir: rt,
    ref: En,
    onScroll: $i,
    onKeyDown: Zl,
    onCopy: jl,
    onPaste: ql,
    "data-testid": ve,
    "data-cy": he,
    children: [
      /* @__PURE__ */ V(Og, {
        value: ki,
        children: [/* @__PURE__ */ f(Wg, {
          value: Fi,
          children: /* @__PURE__ */ V(Fg, {
            value: Mi,
            children: [Array.from({ length: Ia }, (q, oe) => /* @__PURE__ */ f(sE, {
              rowIdx: oe + 1,
              level: -Ia + oe,
              columns: Dt(Xt + oe),
              selectedCellIdx: Se.rowIdx === Xt + oe ? Se.idx : void 0,
              selectCell: Pa
            }, oe)), /* @__PURE__ */ f(aE, {
              headerRowClass: P,
              rowIdx: Bt,
              columns: Dt(vo),
              onColumnResize: Oi,
              onColumnResizeEnd: Ta,
              onColumnsReorder: Ul,
              sortColumns: E,
              onSortColumnsChange: Pi,
              lastFrozenColumnIndex: xt,
              selectedCellIdx: Se.rowIdx === vo ? Se.idx : void 0,
              selectCell: Pa,
              shouldFocusGrid: !Na,
              direction: rt
            })]
          })
        }), a.length === 0 && zt ? zt : /* @__PURE__ */ V(Fn, { children: [
          s?.map((q, oe) => {
            const xe = Bt + 1 + oe, ye = vo + 1 + oe, Fe = Se.rowIdx === ye, Pe = Vo + qe * oe;
            return /* @__PURE__ */ f(H0, {
              "aria-rowindex": xe,
              rowIdx: ye,
              gridRowStart: xe,
              row: q,
              top: Pe,
              bottom: void 0,
              viewportColumns: Dt(ye),
              lastFrozenColumnIndex: xt,
              selectedCellIdx: Fe ? Se.idx : void 0,
              isTop: !0,
              selectCell: Zo
            }, oe);
          }),
          /* @__PURE__ */ f(Pg, {
            value: Gl,
            children: Ui()
          }),
          l?.map((q, oe) => {
            const xe = er + a.length + oe + 1, ye = a.length + oe, Fe = Se.rowIdx === ye, Pe = Uo > Ma ? je - qe * (l.length - oe) : void 0, it = Pe === void 0 ? qe * (l.length - 1 - oe) : void 0;
            return /* @__PURE__ */ f(H0, {
              "aria-rowindex": Ii - Vr + oe + 1,
              rowIdx: ye,
              gridRowStart: xe,
              row: q,
              top: Pe,
              bottom: it,
              viewportColumns: Dt(ye),
              lastFrozenColumnIndex: xt,
              selectedCellIdx: Fe ? Se.idx : void 0,
              isTop: !1,
              selectCell: Zo
            }, oe);
          })
        ] })]
      }),
      Vi(),
      r_($n),
      ka && /* @__PURE__ */ f("div", {
        ref: bo,
        tabIndex: Jo ? 0 : -1,
        className: Mr(wE, {
          [xE]: !vr(Se.rowIdx),
          [Q_]: Jo,
          [eE]: Jo && xt !== -1
        }),
        style: { gridRowStart: Se.rowIdx + er + 1 }
      }),
      Yt !== null && /* @__PURE__ */ f(dE, {
        scrollToPosition: Yt,
        setScrollToCellPosition: pr,
        gridRef: En
      })
    ]
  });
}
function $0(e) {
  return e.querySelector(':scope > [role="row"] > [tabindex="0"]');
}
function z0(e, n) {
  return e.idx === n.idx && e.rowIdx === n.rowIdx;
}
function LE({ id: e, groupKey: n, childRows: r, isExpanded: a, isCellSelected: s, column: l, row: c, groupColumnIndex: d, isGroupByColumn: h, toggleGroup: p }) {
  const { tabIndex: m, childTabIndex: b, onFocus: w } = _i(s);
  function g() {
    p(e);
  }
  const x = h && d === l.idx;
  return /* @__PURE__ */ f("div", {
    role: "gridcell",
    "aria-colindex": l.idx + 1,
    "aria-selected": s,
    tabIndex: m,
    className: xa(l),
    style: {
      ...Ea(l),
      cursor: x ? "pointer" : "default"
    },
    onMouseDown: (y) => {
      y.preventDefault();
    },
    onClick: x ? g : void 0,
    onFocus: w,
    children: (!h || x) && l.renderGroupCell?.({
      groupKey: n,
      childRows: r,
      column: l,
      row: c,
      isExpanded: a,
      tabIndex: b,
      toggleGroup: g
    })
  }, l.key);
}
var NE = ho(LE);
const TE = "rdg-group-row rdg-7-0-0-beta-58-e74a2be3";
function AE({ className: e, row: n, rowIdx: r, viewportColumns: a, selectedCellIdx: s, isRowSelected: l, selectCell: c, gridRowStart: d, groupBy: h, toggleGroup: p, isRowSelectionDisabled: m, ...b }) {
  const w = a[0].key === sl ? n.level + 1 : n.level;
  function g() {
    c({
      rowIdx: r,
      idx: -1
    }, { shouldFocusCell: !0 });
  }
  return /* @__PURE__ */ f(Td, {
    value: Pt(() => ({
      isRowSelectionDisabled: !1,
      isRowSelected: l
    }), [l]),
    children: /* @__PURE__ */ f("div", {
      role: "row",
      "aria-level": n.level + 1,
      "aria-setsize": n.setSize,
      "aria-posinset": n.posInSet + 1,
      "aria-expanded": n.isExpanded,
      className: Mr(Ad, TE, `rdg-row-${r % 2 === 0 ? "even" : "odd"}`, s === -1 && Dl, e),
      onMouseDown: g,
      style: Md(d),
      ...b,
      children: a.map((x) => /* @__PURE__ */ f(NE, {
        id: n.id,
        groupKey: n.groupKey,
        childRows: n.childRows,
        isExpanded: n.isExpanded,
        isCellSelected: s === x.idx,
        column: x,
        row: n,
        groupColumnIndex: w,
        toggleGroup: p,
        isGroupByColumn: h.includes(x.key)
      }, x.key))
    })
  });
}
ho(AE);
const OE = 100, PE = 9, DE = /* @__PURE__ */ new Set([
  "int",
  "int2",
  "int4",
  "int8",
  "integer",
  "smallint",
  "bigint",
  "serial",
  "smallserial",
  "bigserial",
  "numeric",
  "decimal",
  "real",
  "float",
  "float4",
  "float8",
  "double",
  "double precision",
  "money"
]), FE = /* @__PURE__ */ new Set([
  "date",
  "time",
  "timetz",
  "timestamp",
  "timestamptz",
  "datetime",
  "time with time zone",
  "time without time zone",
  "timestamp with time zone",
  "timestamp without time zone"
]), WE = /* @__PURE__ */ new Set(["bool", "boolean"]), HE = (e) => {
  const n = e.trim().toLowerCase();
  return DE.has(n) || WE.has(n) ? 120 : FE.has(n) ? 150 : 250;
}, $E = (e) => {
  if (e.width !== void 0) return e.width;
  const n = String(e.type ?? ""), r = (e.name.length + n.length) * PE;
  return Math.max(HE(n), r);
}, zE = (e) => e.map((n) => ({
  columnKey: n.column,
  direction: n.ascending ? "ASC" : "DESC"
})), BE = ({
  onChange: e,
  checked: n,
  indeterminate: r,
  disabled: a,
  ...s
}) => /* @__PURE__ */ f("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ f(
  "input",
  {
    type: "checkbox",
    className: "cursor-pointer accent-foreground",
    ref: (l) => {
      l && (l.indeterminate = r ?? !1);
    },
    checked: n,
    disabled: a,
    onChange: (l) => e(l.target.checked, l.nativeEvent.shiftKey),
    ...s
  }
) }), VE = ({
  row: e,
  column: n,
  onRowChange: r,
  onClose: a
}) => /* @__PURE__ */ f(
  "input",
  {
    className: "h-full w-full border-none bg-transparent p-0 text-grid leading-[inherit] text-foreground shadow-none outline-none focus:ring-0",
    value: String(e[n.key] ?? ""),
    onChange: (s) => r({ ...e, [n.key]: s.target.value }),
    onBlur: () => a(!0),
    autoFocus: !0
  }
), UE = (e) => e.map((n) => ({
  column: String(n.columnKey),
  ascending: n.direction === "ASC"
})), GE = ({
  columns: e,
  data: n,
  rowKeyField: r,
  rowKeyGetter: a,
  readOnly: s = !1,
  height: l = "100%",
  className: c,
  isLoading: d = !1,
  isError: h = !1,
  errorMessage: p = "Unable to load table rows.",
  emptyMessage: m = "This table is empty",
  currentSort: b = [],
  selectedRows: w,
  onSortChange: g,
  onSelectedRowsChange: x,
  onUpdateRow: y
}) => {
  const E = (M) => /* @__PURE__ */ V("div", { className: "flex flex-row items-center gap-2 h-full", children: [
    /* @__PURE__ */ V("span", { className: "text-foreground text-xs leading-4 flex items-center gap-1", children: [
      M.isPrimaryKey && /* @__PURE__ */ f(o7, { size: 14, strokeWidth: 2, className: "text-brand rotate-45 mr-0.5" }),
      M.name
    ] }),
    /* @__PURE__ */ f("span", { className: "text-foreground-lighter leading-3", children: String(M.type) })
  ] }), R = Pt(
    () => [
      ...!s && x ? [S_] : [],
      ...e.map((M) => {
        const I = !s && M.editable === !0;
        return {
          key: M.key,
          name: E(M),
          width: $E(M),
          minWidth: OE,
          sortable: M.sortable !== !1,
          resizable: !0,
          editable: I,
          renderEditCell: I ? VE : void 0,
          renderCell: ({ row: O }) => {
            const D = O[M.key];
            return (
              // no font-size here: `.rdg-cell` sets --text-grid (13px), which
              // is what upstream's formatters rely on and what the editor
              // uses, so the cell reads identically in both states
              /* @__PURE__ */ f("div", { className: "h-full flex items-center", children: D == null ? /* @__PURE__ */ f("span", { className: "opacity-50", children: "NULL" }) : typeof D == "object" ? /* @__PURE__ */ f("span", { className: "font-mono", children: JSON.stringify(D) }) : /* @__PURE__ */ f("span", { children: String(D) }) })
            );
          }
        };
      })
    ],
    [e, x, s]
  ), N = (M, I) => {
    if (y)
      for (const O of I.indexes) {
        const D = M[O], A = n[O];
        !D || !A || y(D, A);
      }
  }, L = !d && !h && n.length === 0;
  return /* @__PURE__ */ V(
    "div",
    {
      className: fe("relative flex flex-col bg-background-muted min-w-0", c),
      style: { height: l },
      children: [
        (d || h || L) && /* @__PURE__ */ V("div", { className: "absolute inset-0 z-1 flex items-center justify-center bg-background-muted/85 text-sm text-foreground-light", children: [
          d && /* @__PURE__ */ f("p", { children: "Loading table rows..." }),
          h && /* @__PURE__ */ f("p", { children: p }),
          L && /* @__PURE__ */ f("p", { children: m })
        ] }),
        /* @__PURE__ */ f(
          ME,
          {
            className: "grow overscroll-none border-none",
            renderers: { renderCheckbox: BE },
            columns: R,
            rows: n,
            rowHeight: 35,
            headerRowHeight: 34,
            rowKeyGetter: (M) => {
              if (a) return a(M);
              const I = M[r];
              return typeof I == "number" || typeof I == "string" ? I : JSON.stringify(M);
            },
            sortColumns: zE(b),
            onSortColumnsChange: (M) => g?.(UE(M)),
            selectedRows: x ? w : void 0,
            onSelectedRowsChange: x ? (M) => x(new Set(M)) : void 0,
            onRowsChange: N,
            defaultColumnOptions: {
              sortable: !0,
              resizable: !0
            }
          }
        )
      ]
    }
  );
}, KE = ({
  page: e,
  totalPages: n,
  totalRows: r,
  pageSize: a,
  pageSizeOptions: s,
  onPageChange: l,
  onPageSizeChange: c
}) => {
  const d = r === 0 ? 0 : (e - 1) * a + 1, h = Math.min(e * a, r);
  return /* @__PURE__ */ V("div", { className: "flex items-center justify-between px-2 py-1.5", children: [
    /* @__PURE__ */ V("div", { className: "text-xs text-foreground-lighter", children: [
      d,
      "-",
      h,
      " of ",
      r
    ] }),
    /* @__PURE__ */ V("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ f(
        "select",
        {
          value: a,
          onChange: (p) => c(Number(p.target.value)),
          className: "h-[26px] rounded-md border border-strong bg-alternative py-0 px-2 appearance-none text-xs text-foreground",
          children: s.map((p) => /* @__PURE__ */ V("option", { value: p, children: [
            p,
            " rows"
          ] }, p))
        }
      ),
      /* @__PURE__ */ f(
        Rt,
        {
          variant: "text",
          size: "tiny",
          icon: /* @__PURE__ */ f(U9, { className: "h-4 w-4" }),
          disabled: e <= 1,
          onClick: () => l(Math.max(1, e - 1))
        }
      ),
      /* @__PURE__ */ V("span", { className: "text-xs text-foreground-light", children: [
        "Page ",
        e,
        " of ",
        n
      ] }),
      /* @__PURE__ */ f(
        Rt,
        {
          variant: "text",
          size: "tiny",
          icon: /* @__PURE__ */ f(fl, { className: "h-4 w-4" }),
          disabled: e >= n,
          onClick: () => l(Math.min(n, e + 1))
        }
      )
    ] })
  ] });
}, Dr = ({
  modal: e = !1,
  ...n
}) => /* @__PURE__ */ f(Fx, { modal: e, ...n }), ur = C.forwardRef(({ disabled: e, tabIndex: n, ...r }, a) => {
  const s = mo(n, e);
  return /* @__PURE__ */ f(
    D2,
    {
      ref: a,
      ...r,
      disabled: e,
      tabIndex: s
    }
  );
});
ur.displayName = D2.displayName;
const ZE = Hx, jE = C.forwardRef(({ className: e, inset: n, children: r, ...a }, s) => /* @__PURE__ */ V(
  U2,
  {
    ref: s,
    className: fe(
      "flex cursor-default select-none items-center rounded-xs pl-2 pr-1 py-1.5 text-xs outline-hidden focus:bg-overlay-hover data-[state=open]:bg-overlay-hover",
      n && "pl-8",
      e
    ),
    ...a,
    children: [
      r,
      /* @__PURE__ */ f(fl, { className: "ml-auto! shrink-0 text-foreground-lighter", size: 12 })
    ]
  }
));
jE.displayName = U2.displayName;
const qE = C.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ f(
  G2,
  {
    ref: r,
    className: fe(
      "z-50 min-w-32 overflow-hidden rounded-md border border-overlay bg-overlay p-1 text-foreground-light shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      e
    ),
    ...n
  }
));
qE.displayName = G2.displayName;
const dr = C.forwardRef(({ className: e, sideOffset: n = 4, ...r }, a) => /* @__PURE__ */ f(Wx, { children: /* @__PURE__ */ f(
  F2,
  {
    ref: a,
    sideOffset: n,
    className: fe(
      "z-50 min-w-32 overflow-hidden rounded-md border border-overlay bg-overlay p-1 text-foreground-light shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-64",
      e
    ),
    ...r
  }
) }));
dr.displayName = F2.displayName;
const Dn = C.forwardRef(({ className: e, inset: n, ...r }, a) => /* @__PURE__ */ f(
  H2,
  {
    ref: a,
    className: fe(
      "relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-xs outline-hidden transition-colors focus:bg-overlay-hover focus:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      n && "pl-8",
      e
    ),
    ...r
  }
));
Dn.displayName = H2.displayName;
const YE = C.forwardRef(({ className: e, children: n, checked: r, ...a }, s) => /* @__PURE__ */ V(
  $2,
  {
    ref: s,
    className: fe(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-xs outline-hidden transition-colors focus:bg-overlay-hover data-disabled:pointer-events-none data-disabled:opacity-50",
      e
    ),
    checked: r,
    ...a,
    children: [
      /* @__PURE__ */ f("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ f(B2, { children: /* @__PURE__ */ f(V9, { className: "h-4 w-4" }) }) }),
      n
    ]
  }
));
YE.displayName = $2.displayName;
const zg = C.forwardRef(({ className: e, children: n, ...r }, a) => /* @__PURE__ */ V(
  z2,
  {
    ref: a,
    className: fe(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-xs outline-hidden transition-colors focus:bg-overlay-hover data-disabled:pointer-events-none data-disabled:opacity-50",
      e
    ),
    ...r,
    children: [
      /* @__PURE__ */ f("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ f(B2, { children: /* @__PURE__ */ f(j9, { className: "h-2 w-2 fill-current" }) }) }),
      n
    ]
  }
));
zg.displayName = z2.displayName;
const Bg = C.forwardRef(({ className: e, inset: n, ...r }, a) => /* @__PURE__ */ f(
  W2,
  {
    ref: a,
    className: fe("px-2 py-1.5 text-xs text-foreground-lighter", n && "pl-8", e),
    ...r
  }
));
Bg.displayName = W2.displayName;
const Vg = C.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ f(
  V2,
  {
    ref: r,
    className: fe("-mx-1 my-1 h-px bg-border-overlay", e),
    ...n
  }
));
Vg.displayName = V2.displayName;
const Ug = ({
  onInsertRow: e,
  onInsertColumn: n,
  onImportCsv: r,
  onOpenInsertPanel: a
}) => {
  const s = e !== void 0 || n !== void 0 || r !== void 0;
  function l() {
    a ? a() : e?.();
  }
  return s ? /* @__PURE__ */ V(
    Dr,
    {
      onOpenChange: (c) => {
        c && a?.();
      },
      children: [
        /* @__PURE__ */ f(ur, { asChild: !0, children: /* @__PURE__ */ f(Rt, { variant: "primary", size: "tiny", iconRight: /* @__PURE__ */ f(ci, { strokeWidth: 1.5 }), children: "Insert" }) }),
        /* @__PURE__ */ V(dr, { side: "bottom", align: "end", children: [
          e && /* @__PURE__ */ V(Dn, { className: "group space-x-2", onClick: l, children: [
            /* @__PURE__ */ V("div", { className: "-mt-2 pr-1.5", children: [
              /* @__PURE__ */ f("div", { className: "border border-foreground-lighter w-[15px] h-[4px]" }),
              /* @__PURE__ */ f("div", { className: "border border-foreground-lighter w-[15px] h-[4px] my-[2px]" }),
              /* @__PURE__ */ f("div", { className: "border border-foreground-light w-[15px] h-[4px]" })
            ] }),
            /* @__PURE__ */ V("div", { children: [
              /* @__PURE__ */ f("p", { children: "Insert row" }),
              /* @__PURE__ */ f("p", { className: "text-foreground-light", children: "Insert a new row into this table" })
            ] })
          ] }),
          n && /* @__PURE__ */ V(Dn, { className: "group space-x-2", onClick: n, children: [
            /* @__PURE__ */ V("div", { className: "flex -mt-2 pr-1.5", children: [
              /* @__PURE__ */ f("div", { className: "border border-foreground-lighter w-[4px] h-[15px]" }),
              /* @__PURE__ */ f("div", { className: "border border-foreground-lighter w-[4px] h-[15px] mx-[2px]" }),
              /* @__PURE__ */ f("div", { className: "border border-foreground-light w-[4px] h-[15px]" })
            ] }),
            /* @__PURE__ */ V("div", { children: [
              /* @__PURE__ */ f("p", { children: "Insert column" }),
              /* @__PURE__ */ f("p", { className: "text-foreground-light", children: "Insert a new column into this table" })
            ] })
          ] }),
          r && /* @__PURE__ */ V(Dn, { className: "group space-x-2", onClick: r, children: [
            /* @__PURE__ */ V("div", { className: "relative -mt-2", children: [
              /* @__PURE__ */ f(Q9, { size: 18, strokeWidth: 1.5, className: "-translate-x-[2px]" }),
              /* @__PURE__ */ f(
                B9,
                {
                  className: "absolute bottom-0 right-0 translate-y-1 opacity-100 bg-brand-400 rounded-full text-brand",
                  strokeWidth: 3,
                  size: 12
                }
              )
            ] }),
            /* @__PURE__ */ V("div", { children: [
              /* @__PURE__ */ f("p", { children: "Import data from CSV" }),
              /* @__PURE__ */ f("p", { className: "text-foreground-light", children: "Insert new rows from a CSV" })
            ] })
          ] })
        ] })
      ]
    }
  ) : null;
}, Gg = ({ columns: e, currentSort: n, onSortChange: r }) => {
  const a = e.filter((l) => l.sortable !== !1), s = (l, c) => {
    r?.([{ column: l, ascending: c }]);
  };
  return /* @__PURE__ */ V(Dr, { children: [
    /* @__PURE__ */ f(ur, { asChild: !0, children: /* @__PURE__ */ f(Rt, { variant: n.length > 0 ? "link" : "text", size: "tiny", icon: /* @__PURE__ */ f(i7, {}), children: n.length > 0 ? `Sorted by ${n.length} rule${n.length > 1 ? "s" : ""}` : "Sort" }) }),
    /* @__PURE__ */ V(dr, { align: "start", className: "w-64", children: [
      /* @__PURE__ */ f(Bg, { children: "Sort rows" }),
      /* @__PURE__ */ f(Vg, {}),
      a.map((l) => /* @__PURE__ */ V("div", { children: [
        /* @__PURE__ */ V(Dn, { onClick: () => s(l.key, !0), children: [
          /* @__PURE__ */ f(z9, { className: "mr-2 h-4 w-4" }),
          l.name,
          " (ascending)"
        ] }),
        /* @__PURE__ */ V(Dn, { onClick: () => s(l.key, !1), children: [
          /* @__PURE__ */ f(H9, { className: "mr-2 h-4 w-4" }),
          l.name,
          " (descending)"
        ] })
      ] }, l.key)),
      a.length === 0 && /* @__PURE__ */ f(Dn, { disabled: !0, children: "No sortable columns available" })
    ] })
  ] });
}, Kg = Fr({
  type: "text"
}), XE = (e) => {
  const { type: n } = e, r = {
    type: n
  };
  return /* @__PURE__ */ f(Kg.Provider, { value: r, children: e.children });
}, Zg = () => {
  const e = Nr(Kg);
  if (e === void 0)
    throw new Error("MenuContext must be used within a MenuContextProvider.");
  return e;
};
function gi({ children: e, className: n, ulClassName: r, style: a, type: s = "text" }) {
  return /* @__PURE__ */ f(
    "nav",
    {
      role: "menu",
      "aria-label": "Sidebar",
      "aria-orientation": "vertical",
      "aria-labelledby": "options-menu",
      className: n,
      style: a,
      children: /* @__PURE__ */ f(XE, { type: s, children: /* @__PURE__ */ f("ul", { className: r, children: e }) })
    }
  );
}
const JE = fr(
  fe(
    // focus-ring: when the item itself is focused.
    // group-focus-visible: when a wrapping Link/button (e.g. ProductMenu) is the
    // focus target — cannot use focus-ring here (utility targets :focus-visible
    // on the same element).
    "cursor-pointer flex space-x-3 items-center focus-visible:z-10 group",
    "focus-ring",
    "group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background"
  ),
  {
    variants: {
      type: {
        text: "py-1",
        border: "px-4 py-1",
        pills: "my-px px-3 py-[3px] rounded-md transition-colors active:bg-sidebar-accent/50"
      },
      active: {
        true: "font-semibold z-10",
        false: "font-normal border-default group-hover:border-foreground-muted"
      }
    },
    compoundVariants: [
      {
        type: "text",
        active: !0,
        className: "text-foreground-muted"
      },
      {
        type: "border",
        active: !0,
        className: "text-foreground-muted border-l border-brand group-hover:border-brand"
      },
      {
        type: "border",
        active: !1,
        className: "border-l"
      },
      {
        type: "pills",
        active: !0,
        className: "bg-sidebar-accent text-foreground-lighter"
      },
      {
        type: "pills",
        active: !1,
        className: "hover:bg-sidebar-accent/50"
      }
    ],
    defaultVariants: {
      active: !1
    }
  }
);
function QE({ children: e, icon: n, active: r, onClick: a, style: s, className: l }) {
  const { type: c } = Zg();
  return /* @__PURE__ */ V(
    "li",
    {
      role: "menuitem",
      className: fe("outline-hidden", JE({ type: c, active: r }), l),
      style: s,
      onClick: a,
      "aria-current": r ? "page" : void 0,
      children: [
        n && /* @__PURE__ */ f(
          "div",
          {
            className: fe("transition truncate text-sm min-w-fit", {
              "text-foreground-lighter group-hover:text-foreground-light": !r,
              "text-foreground": r
            }),
            children: n
          }
        ),
        /* @__PURE__ */ f(
          "div",
          {
            className: fe("transition truncate text-sm w-full", {
              "text-foreground-light group-hover:text-foreground": !r,
              "text-foreground font-semibold": r
            }),
            children: e
          }
        )
      ]
    }
  );
}
function eR({ children: e, icon: n, title: r }) {
  const { type: a } = Zg();
  return /* @__PURE__ */ V(
    "div",
    {
      className: fe("flex space-x-3 mb-2 font-normal", {
        "px-3": a === "pills"
      }),
      children: [
        n && /* @__PURE__ */ f("span", { className: "text-foreground-lighter", children: n }),
        /* @__PURE__ */ f("span", { className: "text-sm text-foreground-lighter w-full", children: r }),
        e
      ]
    }
  );
}
gi.Item = QE;
gi.Group = eR;
const tR = D7, jg = C.forwardRef(({ disabled: e, tabIndex: n, ...r }, a) => {
  const s = mo(n, e);
  return /* @__PURE__ */ f(
    ed,
    {
      ref: a,
      ...r,
      disabled: e,
      tabIndex: s
    }
  );
});
jg.displayName = ed.displayName;
const nR = Dh;
var Cu = { exports: {} };
var B0;
function rR() {
  return B0 || (B0 = 1, (function(e) {
    (function() {
      var n = {}.hasOwnProperty;
      function r() {
        for (var l = "", c = 0; c < arguments.length; c++) {
          var d = arguments[c];
          d && (l = s(l, a(d)));
        }
        return l;
      }
      function a(l) {
        if (typeof l == "string" || typeof l == "number")
          return l;
        if (typeof l != "object")
          return "";
        if (Array.isArray(l))
          return r.apply(null, l);
        if (l.toString !== Object.prototype.toString && !l.toString.toString().includes("[native code]"))
          return l.toString();
        var c = "";
        for (var d in l)
          n.call(l, d) && l[d] && (c = s(c, d));
        return c;
      }
      function s(l, c) {
        return c ? l ? l + " " + c : l + c : l;
      }
      e.exports ? (r.default = r, e.exports = r) : window.classNames = r;
    })();
  })(Cu)), Cu.exports;
}
var oR = rR();
const qs = /* @__PURE__ */ yp(oR);
var zs = { exports: {} }, Bs = { exports: {} }, tt = {};
var V0;
function aR() {
  if (V0) return tt;
  V0 = 1;
  var e = typeof Symbol == "function" && Symbol.for, n = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, a = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, s = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, l = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, c = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, d = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, h = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, p = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, m = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, b = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, w = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, g = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, x = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, y = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, E = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, R = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, N = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
  function L(I) {
    if (typeof I == "object" && I !== null) {
      var O = I.$$typeof;
      switch (O) {
        case n:
          switch (I = I.type, I) {
            case h:
            case p:
            case a:
            case l:
            case s:
            case b:
              return I;
            default:
              switch (I = I && I.$$typeof, I) {
                case d:
                case m:
                case x:
                case g:
                case c:
                  return I;
                default:
                  return O;
              }
          }
        case r:
          return O;
      }
    }
  }
  function M(I) {
    return L(I) === p;
  }
  return tt.AsyncMode = h, tt.ConcurrentMode = p, tt.ContextConsumer = d, tt.ContextProvider = c, tt.Element = n, tt.ForwardRef = m, tt.Fragment = a, tt.Lazy = x, tt.Memo = g, tt.Portal = r, tt.Profiler = l, tt.StrictMode = s, tt.Suspense = b, tt.isAsyncMode = function(I) {
    return M(I) || L(I) === h;
  }, tt.isConcurrentMode = M, tt.isContextConsumer = function(I) {
    return L(I) === d;
  }, tt.isContextProvider = function(I) {
    return L(I) === c;
  }, tt.isElement = function(I) {
    return typeof I == "object" && I !== null && I.$$typeof === n;
  }, tt.isForwardRef = function(I) {
    return L(I) === m;
  }, tt.isFragment = function(I) {
    return L(I) === a;
  }, tt.isLazy = function(I) {
    return L(I) === x;
  }, tt.isMemo = function(I) {
    return L(I) === g;
  }, tt.isPortal = function(I) {
    return L(I) === r;
  }, tt.isProfiler = function(I) {
    return L(I) === l;
  }, tt.isStrictMode = function(I) {
    return L(I) === s;
  }, tt.isSuspense = function(I) {
    return L(I) === b;
  }, tt.isValidElementType = function(I) {
    return typeof I == "string" || typeof I == "function" || I === a || I === p || I === l || I === s || I === b || I === w || typeof I == "object" && I !== null && (I.$$typeof === x || I.$$typeof === g || I.$$typeof === c || I.$$typeof === d || I.$$typeof === m || I.$$typeof === E || I.$$typeof === R || I.$$typeof === N || I.$$typeof === y);
  }, tt.typeOf = L, tt;
}
var nt = {};
var U0;
function iR() {
  return U0 || (U0 = 1, process.env.NODE_ENV !== "production" && (function() {
    var e = typeof Symbol == "function" && Symbol.for, n = e ? /* @__PURE__ */ Symbol.for("react.element") : 60103, r = e ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, a = e ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, s = e ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, l = e ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, c = e ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, d = e ? /* @__PURE__ */ Symbol.for("react.context") : 60110, h = e ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, p = e ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, m = e ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, b = e ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, w = e ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, g = e ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, x = e ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, y = e ? /* @__PURE__ */ Symbol.for("react.block") : 60121, E = e ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, R = e ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, N = e ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
    function L(ee) {
      return typeof ee == "string" || typeof ee == "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      ee === a || ee === p || ee === l || ee === s || ee === b || ee === w || typeof ee == "object" && ee !== null && (ee.$$typeof === x || ee.$$typeof === g || ee.$$typeof === c || ee.$$typeof === d || ee.$$typeof === m || ee.$$typeof === E || ee.$$typeof === R || ee.$$typeof === N || ee.$$typeof === y);
    }
    function M(ee) {
      if (typeof ee == "object" && ee !== null) {
        var Le = ee.$$typeof;
        switch (Le) {
          case n:
            var qe = ee.type;
            switch (qe) {
              case h:
              case p:
              case a:
              case l:
              case s:
              case b:
                return qe;
              default:
                var vt = qe && qe.$$typeof;
                switch (vt) {
                  case d:
                  case m:
                  case x:
                  case g:
                  case c:
                    return vt;
                  default:
                    return Le;
                }
            }
          case r:
            return Le;
        }
      }
    }
    var I = h, O = p, D = d, A = c, z = n, se = m, ue = a, ce = x, ne = g, Z = r, le = l, X = s, ge = b, pe = !1;
    function H(ee) {
      return pe || (pe = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.")), P(ee) || M(ee) === h;
    }
    function P(ee) {
      return M(ee) === p;
    }
    function ae(ee) {
      return M(ee) === d;
    }
    function U(ee) {
      return M(ee) === c;
    }
    function B(ee) {
      return typeof ee == "object" && ee !== null && ee.$$typeof === n;
    }
    function G(ee) {
      return M(ee) === m;
    }
    function J(ee) {
      return M(ee) === a;
    }
    function Q(ee) {
      return M(ee) === x;
    }
    function j(ee) {
      return M(ee) === g;
    }
    function ve(ee) {
      return M(ee) === r;
    }
    function he(ee) {
      return M(ee) === l;
    }
    function re(ee) {
      return M(ee) === s;
    }
    function me(ee) {
      return M(ee) === b;
    }
    nt.AsyncMode = I, nt.ConcurrentMode = O, nt.ContextConsumer = D, nt.ContextProvider = A, nt.Element = z, nt.ForwardRef = se, nt.Fragment = ue, nt.Lazy = ce, nt.Memo = ne, nt.Portal = Z, nt.Profiler = le, nt.StrictMode = X, nt.Suspense = ge, nt.isAsyncMode = H, nt.isConcurrentMode = P, nt.isContextConsumer = ae, nt.isContextProvider = U, nt.isElement = B, nt.isForwardRef = G, nt.isFragment = J, nt.isLazy = Q, nt.isMemo = j, nt.isPortal = ve, nt.isProfiler = he, nt.isStrictMode = re, nt.isSuspense = me, nt.isValidElementType = L, nt.typeOf = M;
  })()), nt;
}
var G0;
function qg() {
  return G0 || (G0 = 1, process.env.NODE_ENV === "production" ? Bs.exports = aR() : Bs.exports = iR()), Bs.exports;
}
var Su, K0;
function sR() {
  if (K0) return Su;
  K0 = 1;
  var e = Object.getOwnPropertySymbols, n = Object.prototype.hasOwnProperty, r = Object.prototype.propertyIsEnumerable;
  function a(l) {
    if (l == null)
      throw new TypeError("Object.assign cannot be called with null or undefined");
    return Object(l);
  }
  function s() {
    try {
      if (!Object.assign)
        return !1;
      var l = new String("abc");
      if (l[5] = "de", Object.getOwnPropertyNames(l)[0] === "5")
        return !1;
      for (var c = {}, d = 0; d < 10; d++)
        c["_" + String.fromCharCode(d)] = d;
      var h = Object.getOwnPropertyNames(c).map(function(m) {
        return c[m];
      });
      if (h.join("") !== "0123456789")
        return !1;
      var p = {};
      return "abcdefghijklmnopqrst".split("").forEach(function(m) {
        p[m] = m;
      }), Object.keys(Object.assign({}, p)).join("") === "abcdefghijklmnopqrst";
    } catch {
      return !1;
    }
  }
  return Su = s() ? Object.assign : function(l, c) {
    for (var d, h = a(l), p, m = 1; m < arguments.length; m++) {
      d = Object(arguments[m]);
      for (var b in d)
        n.call(d, b) && (h[b] = d[b]);
      if (e) {
        p = e(d);
        for (var w = 0; w < p.length; w++)
          r.call(d, p[w]) && (h[p[w]] = d[p[w]]);
      }
    }
    return h;
  }, Su;
}
var _u, Z0;
function Od() {
  if (Z0) return _u;
  Z0 = 1;
  var e = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return _u = e, _u;
}
var Eu, j0;
function Yg() {
  return j0 || (j0 = 1, Eu = Function.call.bind(Object.prototype.hasOwnProperty)), Eu;
}
var Ru, q0;
function lR() {
  if (q0) return Ru;
  q0 = 1;
  var e = function() {
  };
  if (process.env.NODE_ENV !== "production") {
    var n = /* @__PURE__ */ Od(), r = {}, a = /* @__PURE__ */ Yg();
    e = function(l) {
      var c = "Warning: " + l;
      typeof console < "u" && console.error(c);
      try {
        throw new Error(c);
      } catch {
      }
    };
  }
  function s(l, c, d, h, p) {
    if (process.env.NODE_ENV !== "production") {
      for (var m in l)
        if (a(l, m)) {
          var b;
          try {
            if (typeof l[m] != "function") {
              var w = Error(
                (h || "React class") + ": " + d + " type `" + m + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof l[m] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
              );
              throw w.name = "Invariant Violation", w;
            }
            b = l[m](c, m, h, d, null, n);
          } catch (x) {
            b = x;
          }
          if (b && !(b instanceof Error) && e(
            (h || "React class") + ": type specification of " + d + " `" + m + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof b + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          ), b instanceof Error && !(b.message in r)) {
            r[b.message] = !0;
            var g = p ? p() : "";
            e(
              "Failed " + d + " type: " + b.message + (g ?? "")
            );
          }
        }
    }
  }
  return s.resetWarningCache = function() {
    process.env.NODE_ENV !== "production" && (r = {});
  }, Ru = s, Ru;
}
var Iu, Y0;
function cR() {
  if (Y0) return Iu;
  Y0 = 1;
  var e = qg(), n = sR(), r = /* @__PURE__ */ Od(), a = /* @__PURE__ */ Yg(), s = /* @__PURE__ */ lR(), l = function() {
  };
  process.env.NODE_ENV !== "production" && (l = function(d) {
    var h = "Warning: " + d;
    typeof console < "u" && console.error(h);
    try {
      throw new Error(h);
    } catch {
    }
  });
  function c() {
    return null;
  }
  return Iu = function(d, h) {
    var p = typeof Symbol == "function" && Symbol.iterator, m = "@@iterator";
    function b(P) {
      var ae = P && (p && P[p] || P[m]);
      if (typeof ae == "function")
        return ae;
    }
    var w = "<<anonymous>>", g = {
      array: R("array"),
      bigint: R("bigint"),
      bool: R("boolean"),
      func: R("function"),
      number: R("number"),
      object: R("object"),
      string: R("string"),
      symbol: R("symbol"),
      any: N(),
      arrayOf: L,
      element: M(),
      elementType: I(),
      instanceOf: O,
      node: se(),
      objectOf: A,
      oneOf: D,
      oneOfType: z,
      shape: ce,
      exact: ne
    };
    function x(P, ae) {
      return P === ae ? P !== 0 || 1 / P === 1 / ae : P !== P && ae !== ae;
    }
    function y(P, ae) {
      this.message = P, this.data = ae && typeof ae == "object" ? ae : {}, this.stack = "";
    }
    y.prototype = Error.prototype;
    function E(P) {
      if (process.env.NODE_ENV !== "production")
        var ae = {}, U = 0;
      function B(J, Q, j, ve, he, re, me) {
        if (ve = ve || w, re = re || j, me !== r) {
          if (h) {
            var ee = new Error(
              "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
            );
            throw ee.name = "Invariant Violation", ee;
          } else if (process.env.NODE_ENV !== "production" && typeof console < "u") {
            var Le = ve + ":" + j;
            !ae[Le] && // Avoid spamming the console because they are often not actionable except for lib authors
            U < 3 && (l(
              "You are manually calling a React.PropTypes validation function for the `" + re + "` prop on `" + ve + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            ), ae[Le] = !0, U++);
          }
        }
        return Q[j] == null ? J ? Q[j] === null ? new y("The " + he + " `" + re + "` is marked as required " + ("in `" + ve + "`, but its value is `null`.")) : new y("The " + he + " `" + re + "` is marked as required in " + ("`" + ve + "`, but its value is `undefined`.")) : null : P(Q, j, ve, he, re);
      }
      var G = B.bind(null, !1);
      return G.isRequired = B.bind(null, !0), G;
    }
    function R(P) {
      function ae(U, B, G, J, Q, j) {
        var ve = U[B], he = X(ve);
        if (he !== P) {
          var re = ge(ve);
          return new y(
            "Invalid " + J + " `" + Q + "` of type " + ("`" + re + "` supplied to `" + G + "`, expected ") + ("`" + P + "`."),
            { expectedType: P }
          );
        }
        return null;
      }
      return E(ae);
    }
    function N() {
      return E(c);
    }
    function L(P) {
      function ae(U, B, G, J, Q) {
        if (typeof P != "function")
          return new y("Property `" + Q + "` of component `" + G + "` has invalid PropType notation inside arrayOf.");
        var j = U[B];
        if (!Array.isArray(j)) {
          var ve = X(j);
          return new y("Invalid " + J + " `" + Q + "` of type " + ("`" + ve + "` supplied to `" + G + "`, expected an array."));
        }
        for (var he = 0; he < j.length; he++) {
          var re = P(j, he, G, J, Q + "[" + he + "]", r);
          if (re instanceof Error)
            return re;
        }
        return null;
      }
      return E(ae);
    }
    function M() {
      function P(ae, U, B, G, J) {
        var Q = ae[U];
        if (!d(Q)) {
          var j = X(Q);
          return new y("Invalid " + G + " `" + J + "` of type " + ("`" + j + "` supplied to `" + B + "`, expected a single ReactElement."));
        }
        return null;
      }
      return E(P);
    }
    function I() {
      function P(ae, U, B, G, J) {
        var Q = ae[U];
        if (!e.isValidElementType(Q)) {
          var j = X(Q);
          return new y("Invalid " + G + " `" + J + "` of type " + ("`" + j + "` supplied to `" + B + "`, expected a single ReactElement type."));
        }
        return null;
      }
      return E(P);
    }
    function O(P) {
      function ae(U, B, G, J, Q) {
        if (!(U[B] instanceof P)) {
          var j = P.name || w, ve = H(U[B]);
          return new y("Invalid " + J + " `" + Q + "` of type " + ("`" + ve + "` supplied to `" + G + "`, expected ") + ("instance of `" + j + "`."));
        }
        return null;
      }
      return E(ae);
    }
    function D(P) {
      if (!Array.isArray(P))
        return process.env.NODE_ENV !== "production" && (arguments.length > 1 ? l(
          "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
        ) : l("Invalid argument supplied to oneOf, expected an array.")), c;
      function ae(U, B, G, J, Q) {
        for (var j = U[B], ve = 0; ve < P.length; ve++)
          if (x(j, P[ve]))
            return null;
        var he = JSON.stringify(P, function(me, ee) {
          var Le = ge(ee);
          return Le === "symbol" ? String(ee) : ee;
        });
        return new y("Invalid " + J + " `" + Q + "` of value `" + String(j) + "` " + ("supplied to `" + G + "`, expected one of " + he + "."));
      }
      return E(ae);
    }
    function A(P) {
      function ae(U, B, G, J, Q) {
        if (typeof P != "function")
          return new y("Property `" + Q + "` of component `" + G + "` has invalid PropType notation inside objectOf.");
        var j = U[B], ve = X(j);
        if (ve !== "object")
          return new y("Invalid " + J + " `" + Q + "` of type " + ("`" + ve + "` supplied to `" + G + "`, expected an object."));
        for (var he in j)
          if (a(j, he)) {
            var re = P(j, he, G, J, Q + "." + he, r);
            if (re instanceof Error)
              return re;
          }
        return null;
      }
      return E(ae);
    }
    function z(P) {
      if (!Array.isArray(P))
        return process.env.NODE_ENV !== "production" && l("Invalid argument supplied to oneOfType, expected an instance of array."), c;
      for (var ae = 0; ae < P.length; ae++) {
        var U = P[ae];
        if (typeof U != "function")
          return l(
            "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + pe(U) + " at index " + ae + "."
          ), c;
      }
      function B(G, J, Q, j, ve) {
        for (var he = [], re = 0; re < P.length; re++) {
          var me = P[re], ee = me(G, J, Q, j, ve, r);
          if (ee == null)
            return null;
          ee.data && a(ee.data, "expectedType") && he.push(ee.data.expectedType);
        }
        var Le = he.length > 0 ? ", expected one of type [" + he.join(", ") + "]" : "";
        return new y("Invalid " + j + " `" + ve + "` supplied to " + ("`" + Q + "`" + Le + "."));
      }
      return E(B);
    }
    function se() {
      function P(ae, U, B, G, J) {
        return Z(ae[U]) ? null : new y("Invalid " + G + " `" + J + "` supplied to " + ("`" + B + "`, expected a ReactNode."));
      }
      return E(P);
    }
    function ue(P, ae, U, B, G) {
      return new y(
        (P || "React class") + ": " + ae + " type `" + U + "." + B + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + G + "`."
      );
    }
    function ce(P) {
      function ae(U, B, G, J, Q) {
        var j = U[B], ve = X(j);
        if (ve !== "object")
          return new y("Invalid " + J + " `" + Q + "` of type `" + ve + "` " + ("supplied to `" + G + "`, expected `object`."));
        for (var he in P) {
          var re = P[he];
          if (typeof re != "function")
            return ue(G, J, Q, he, ge(re));
          var me = re(j, he, G, J, Q + "." + he, r);
          if (me)
            return me;
        }
        return null;
      }
      return E(ae);
    }
    function ne(P) {
      function ae(U, B, G, J, Q) {
        var j = U[B], ve = X(j);
        if (ve !== "object")
          return new y("Invalid " + J + " `" + Q + "` of type `" + ve + "` " + ("supplied to `" + G + "`, expected `object`."));
        var he = n({}, U[B], P);
        for (var re in he) {
          var me = P[re];
          if (a(P, re) && typeof me != "function")
            return ue(G, J, Q, re, ge(me));
          if (!me)
            return new y(
              "Invalid " + J + " `" + Q + "` key `" + re + "` supplied to `" + G + "`.\nBad object: " + JSON.stringify(U[B], null, "  ") + `
Valid keys: ` + JSON.stringify(Object.keys(P), null, "  ")
            );
          var ee = me(j, re, G, J, Q + "." + re, r);
          if (ee)
            return ee;
        }
        return null;
      }
      return E(ae);
    }
    function Z(P) {
      switch (typeof P) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !P;
        case "object":
          if (Array.isArray(P))
            return P.every(Z);
          if (P === null || d(P))
            return !0;
          var ae = b(P);
          if (ae) {
            var U = ae.call(P), B;
            if (ae !== P.entries) {
              for (; !(B = U.next()).done; )
                if (!Z(B.value))
                  return !1;
            } else
              for (; !(B = U.next()).done; ) {
                var G = B.value;
                if (G && !Z(G[1]))
                  return !1;
              }
          } else
            return !1;
          return !0;
        default:
          return !1;
      }
    }
    function le(P, ae) {
      return P === "symbol" ? !0 : ae ? ae["@@toStringTag"] === "Symbol" || typeof Symbol == "function" && ae instanceof Symbol : !1;
    }
    function X(P) {
      var ae = typeof P;
      return Array.isArray(P) ? "array" : P instanceof RegExp ? "object" : le(ae, P) ? "symbol" : ae;
    }
    function ge(P) {
      if (typeof P > "u" || P === null)
        return "" + P;
      var ae = X(P);
      if (ae === "object") {
        if (P instanceof Date)
          return "date";
        if (P instanceof RegExp)
          return "regexp";
      }
      return ae;
    }
    function pe(P) {
      var ae = ge(P);
      switch (ae) {
        case "array":
        case "object":
          return "an " + ae;
        case "boolean":
        case "date":
        case "regexp":
          return "a " + ae;
        default:
          return ae;
      }
    }
    function H(P) {
      return !P.constructor || !P.constructor.name ? w : P.constructor.name;
    }
    return g.checkPropTypes = s, g.resetWarningCache = s.resetWarningCache, g.PropTypes = g, g;
  }, Iu;
}
var ku, X0;
function uR() {
  if (X0) return ku;
  X0 = 1;
  var e = /* @__PURE__ */ Od();
  function n() {
  }
  function r() {
  }
  return r.resetWarningCache = n, ku = function() {
    function a(c, d, h, p, m, b) {
      if (b !== e) {
        var w = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
        );
        throw w.name = "Invariant Violation", w;
      }
    }
    a.isRequired = a;
    function s() {
      return a;
    }
    var l = {
      array: a,
      bigint: a,
      bool: a,
      func: a,
      number: a,
      object: a,
      string: a,
      symbol: a,
      any: a,
      arrayOf: s,
      element: a,
      elementType: a,
      instanceOf: s,
      node: a,
      objectOf: s,
      oneOf: s,
      oneOfType: s,
      shape: s,
      exact: s,
      checkPropTypes: r,
      resetWarningCache: n
    };
    return l.PropTypes = l, l;
  }, ku;
}
var J0;
function dR() {
  if (J0) return zs.exports;
  if (J0 = 1, process.env.NODE_ENV !== "production") {
    var e = qg(), n = !0;
    zs.exports = /* @__PURE__ */ cR()(e.isElement, n);
  } else
    zs.exports = /* @__PURE__ */ uR()();
  return zs.exports;
}
var fR = /* @__PURE__ */ dR();
const wt = /* @__PURE__ */ yp(fR);
function Pd(e) {
  return (Pd = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  })(e);
}
function Mu(e, n, r) {
  return n in e ? Object.defineProperty(e, n, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = r, e;
}
function Xg(e, n) {
  return (function(r) {
    if (Array.isArray(r)) return r;
  })(e) || (function(r, a) {
    var s = r == null ? null : typeof Symbol < "u" && r[Symbol.iterator] || r["@@iterator"];
    if (s != null) {
      var l, c, d = [], h = !0, p = !1;
      try {
        for (s = s.call(r); !(h = (l = s.next()).done) && (d.push(l.value), !a || d.length !== a); h = !0) ;
      } catch (m) {
        p = !0, c = m;
      } finally {
        try {
          h || s.return == null || s.return();
        } finally {
          if (p) throw c;
        }
      }
      return d;
    }
  })(e, n) || Dd(e, n) || (function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  })();
}
function On(e) {
  return (function(n) {
    if (Array.isArray(n)) return Gu(n);
  })(e) || (function(n) {
    if (typeof Symbol < "u" && n[Symbol.iterator] != null || n["@@iterator"] != null) return Array.from(n);
  })(e) || Dd(e) || (function() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  })();
}
function Dd(e, n) {
  if (e) {
    if (typeof e == "string") return Gu(e, n);
    var r = Object.prototype.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Gu(e, n) : void 0;
  }
}
function Gu(e, n) {
  (n == null || n > e.length) && (n = e.length);
  for (var r = 0, a = new Array(n); r < n; r++) a[r] = e[r];
  return a;
}
function hn(e, n) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!r) {
    if (Array.isArray(e) || (r = Dd(e)) || n) {
      r && (e = r);
      var a = 0, s = function() {
      };
      return { s, n: function() {
        return a >= e.length ? { done: !0 } : { done: !1, value: e[a++] };
      }, e: function(h) {
        throw h;
      }, f: s };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var l, c = !0, d = !1;
  return { s: function() {
    r = r.call(e);
  }, n: function() {
    var h = r.next();
    return c = h.done, h;
  }, e: function(h) {
    d = !0, l = h;
  }, f: function() {
    try {
      c || r.return == null || r.return();
    } finally {
      if (d) throw l;
    }
  } };
}
function Fd(e, n) {
  var r = {};
  for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && n.indexOf(a) < 0 && (r[a] = e[a]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function") {
    var s = 0;
    for (a = Object.getOwnPropertySymbols(e); s < a.length; s++) n.indexOf(a[s]) < 0 && Object.prototype.propertyIsEnumerable.call(e, a[s]) && (r[a[s]] = e[a[s]]);
  }
  return r;
}
var Q0 = { root: "tree", node: "tree-node", branch: "tree-node__branch", branchWrapper: "tree-branch-wrapper", leafListItem: "tree-leaf-list-item", leaf: "tree-node__leaf", nodeGroup: "tree-node-group" }, ar = { select: "SELECT", focus: "FOCUS", exclusiveSelect: "EXCLUSIVE_SELECT" }, hR = Object.freeze(Object.values(ar)), pR = Object.freeze(Object.values({ check: "check", select: "select" })), Wd = "COLLAPSE", Fl = "COLLAPSE_MANY", ll = "EXPAND", cl = "EXPAND_MANY", Hd = "HALF_SELECT", mi = "SELECT", Jg = "DESELECT", Wl = "TOGGLE", ul = "TOGGLE_SELECT", kr = "SELECT_MANY", Qg = "EXCLUSIVE_CHANGE_SELECT_MANY", nn = "FOCUS", em = "CLEAR_FOCUS", tm = "BLUR", gR = "DISABLE", mR = "ENABLE", nm = "CLEAR_MANUALLY_TOGGLED", rm = "CONTROLLED_SELECT_MANY", om = "UPDATE_TREE_STATE_WHEN_DATA_CHANGED", Oo = function() {
}, Lu = function() {
  for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++) n[r] = arguments[r];
  return function(a) {
    for (var s = 0, l = n; s < l.length; s++) {
      var c = l[s];
      if (c && c(a), a.defaultPrevented) break;
    }
  };
}, ao = function(e, n) {
  var r, a = /* @__PURE__ */ new Set(), s = hn(e);
  try {
    for (s.s(); !(r = s.n()).done; ) {
      var l = r.value;
      n.has(l) || a.add(l);
    }
  } catch (c) {
    s.e(c);
  } finally {
    s.f();
  }
  return a;
}, Vs = function(e, n) {
  return new Set([].concat(On(ao(e, n)), On(ao(n, e))));
}, eh = function(e) {
  var n = Ht();
  return Wt((function() {
    n.current = e;
  }), [e]), n.current;
}, Gt = function(e, n) {
  var r;
  return !!(!((r = ht(e, n).children) === null || r === void 0) && r.length);
}, Lr = function(e, n) {
  return ht(e, n).parent;
}, vR = function(e, n, r) {
  for (var a = n, s = []; ; ) {
    var l = Lr(e, a);
    if (l === 0 || l == null || l != null && r.has(l)) break;
    s.push(l), a = l;
  }
  return s;
}, lo = function(e, n, r) {
  var a = [];
  return (function s(l, c) {
    var d = ht(l, c);
    if (d.children != null) {
      var h, p = hn(d.children.filter((function(b) {
        return !r.has(b);
      })));
      try {
        for (p.s(); !(h = p.n()).done; ) {
          var m = h.value;
          a.push(m), s(l, m);
        }
      } catch (b) {
        p.e(b);
      } finally {
        p.f();
      }
    }
  })(e, n), a;
}, am = function(e, n) {
  var r = ht(e, n);
  return r.children == null ? [] : r.children;
}, im = function(e, n, r) {
  var a = Lr(e, n);
  if (a != null) {
    var s = ht(e, a), l = s.children.indexOf(n) + r;
    if (s.children[l]) return s.children[l];
  }
  return null;
}, Ku = function(e, n, r) {
  var a = ht(e, n);
  for (Sn(e).id === n && (a = ht(e, ht(e, n).children[ht(e, n).children.length - 1])); r.has(a.id) && Gt(e, a.id); ) a = ht(e, a.children[a.children.length - 1]);
  return a.id;
}, Zu = function(e, n, r) {
  if (n === Sn(e).children[0]) return null;
  var a = im(e, n, -1);
  return a == null ? Lr(e, n) : Ku(e, a, r);
}, ii = function(e, n, r) {
  var a = ht(e, n).id;
  if (Gt(e, a) && r.has(a)) return ht(e, a).children[0];
  for (; ; ) {
    var s = im(e, a, 1);
    if (s != null) return s;
    if ((a = Lr(e, a)) == null) return null;
  }
}, sm = function(e) {
  var n = e.data, r = e.expandedIds, a = e.from, s = e.to, l = [], c = n.length, d = 0, h = a;
  if (l.push(a), a < s) for (; d < c && ((h = ii(n, h, r)) != null && l.push(h), h != null && h !== s); ) d += 1;
  else if (a > s) for (; d < c && ((h = Zu(n, h, r)) != null && l.push(h), h != null && h !== s); ) d += 1;
  return l;
}, bR = function(e) {
  var n = e.isSelected, r = e.isDisabled, a = e.multiSelect;
  return r || a ? n : !!n || void 0;
}, yR = function(e) {
  var n = e.isSelected, r = e.isDisabled, a = e.isHalfSelected, s = e.multiSelect;
  return r ? n : a ? "mixed" : s ? n : !!n || void 0;
}, io = function(e, n, r) {
  return n.concat.apply(n, On(n.filter((function(a) {
    return Gt(e, a);
  })).map((function(a) {
    return lo(e, a, r);
  }))));
}, wR = function(e, n, r) {
  n != null ? window.navigator.userAgent.match(/Trident/) ? setTimeout((function() {
    return !n.contains(document.activeElement) && r();
  }), 0) : !n.contains(e.nativeEvent.relatedTarget) && r() : console.warn("ref not set on <ul>");
}, xR = function(e, n, r) {
  var a = am(e, n);
  return Gt(e, n) && !r.has(n) && a.length === 1 && a.every((function(s) {
    return r.has(s);
  }));
}, lm = function(e, n, r, a) {
  var s = (function(c, d, h) {
    return Gt(c, d) && h.has(d) && lo(c, d, /* @__PURE__ */ new Set()).some((function(p) {
      return h.has(p);
    }));
  })(e, n, r), l = (function(c, d, h) {
    var p = am(c, d);
    return Gt(c, d) && h.has(d) && p.length === 1 && p.every((function(m) {
      return h.has(m);
    }));
  })(e, n, r);
  return (function(c, d, h, p) {
    var m = lo(c, d, /* @__PURE__ */ new Set());
    return Gt(c, d) && h.has(d) && m.every((function(b) {
      return h.has(b);
    })) && m.every((function(b) {
      return !p.has(b);
    }));
  })(e, n, r, a) ? ul : s && !l ? Hd : ul;
}, Sn = function(e) {
  var n = e.find((function(r) {
    return r.parent === null;
  }));
  if (!n) throw Error("TreeView data must contain parent node.");
  return n;
}, ht = function(e, n) {
  var r = e.find((function(a) {
    return a.id === n;
  }));
  if (r == null) throw Error("Node with id=".concat(n, " doesn't exist in the tree."));
  return r;
}, th = function(e) {
  var n = Array.from(new Set(e));
  return e.length !== n.length;
}, CR = function(e, n) {
  switch (n.type) {
    case Wd:
      var r = new Set(e.expandedIds);
      return r.delete(n.id), Object.assign(Object.assign({}, e), { expandedIds: r, tabbableId: n.id, isFocused: !0, lastAction: n.type, lastInteractedWith: n.lastInteractedWith });
    case Fl:
      var a, s = new Set(e.expandedIds), l = hn(n.ids);
      try {
        for (l.s(); !(a = l.n()).done; ) {
          var c = a.value;
          s.delete(c);
        }
      } catch (H) {
        l.e(H);
      } finally {
        l.f();
      }
      return Object.assign(Object.assign({}, e), { expandedIds: s, lastAction: n.type, lastInteractedWith: n.lastInteractedWith });
    case ll:
      var d = new Set(e.expandedIds);
      return d.add(n.id), Object.assign(Object.assign({}, e), { expandedIds: d, tabbableId: n.id, isFocused: !0, lastAction: n.type, lastInteractedWith: n.lastInteractedWith });
    case cl:
      var h = new Set([].concat(On(e.expandedIds), On(n.ids)));
      return Object.assign(Object.assign({}, e), { expandedIds: h, lastAction: n.type, lastInteractedWith: n.lastInteractedWith });
    case Wl:
      var p = new Set(e.expandedIds);
      return e.expandedIds.has(n.id) ? p.delete(n.id) : p.add(n.id), Object.assign(Object.assign({}, e), { expandedIds: p, tabbableId: n.id, isFocused: !0, lastAction: n.type, lastInteractedWith: n.lastInteractedWith });
    case Hd:
      if (e.disabledIds.has(n.id)) return e;
      var m = new Set(e.halfSelectedIds), b = new Set(e.selectedIds);
      return m.add(n.id), b.delete(n.id), Object.assign(Object.assign({}, e), { selectedIds: b, halfSelectedIds: m, tabbableId: n.keepFocus ? e.tabbableId : n.id, lastAction: n.type, lastInteractedWith: n.lastInteractedWith, lastManuallyToggled: n.lastManuallyToggled, lastUserSelect: n.NotUserAction ? e.lastUserSelect : n.id });
    case mi:
      if (!n.NotUserAction && e.disabledIds.has(n.id)) return e;
      var w;
      n.multiSelect ? (w = new Set(e.selectedIds)).add(n.id) : (w = /* @__PURE__ */ new Set()).add(n.id);
      var g = new Set(e.halfSelectedIds);
      g.delete(n.id);
      var x = n.keepFocus ? e.tabbableId : n.id, y = x === n.lastInteractedWith || n.NotUserAction !== !0;
      return Object.assign(Object.assign({}, e), { selectedIds: w, halfSelectedIds: g, tabbableId: x, isFocused: y, lastUserSelect: n.NotUserAction ? e.lastUserSelect : n.id, lastAction: n.type, lastInteractedWith: n.lastInteractedWith, lastManuallyToggled: n.lastManuallyToggled });
    case Jg:
      if (!n.NotUserAction && e.disabledIds.has(n.id)) return e;
      var E, R = new Set(e.selectedIds);
      return R.delete(n.id), n.multiSelect ? (E = new Set(e.halfSelectedIds)).delete(n.id) : E = /* @__PURE__ */ new Set(), Object.assign(Object.assign({}, e), { selectedIds: R, halfSelectedIds: E, tabbableId: n.keepFocus ? e.tabbableId : n.id, isFocused: !0, lastUserSelect: n.NotUserAction ? e.lastUserSelect : n.id, lastAction: n.type, lastInteractedWith: n.lastInteractedWith, lastManuallyToggled: n.lastManuallyToggled });
    case ul:
      if (e.disabledIds.has(n.id)) return e;
      var N, L = e.selectedIds.has(n.id);
      n.multiSelect ? (N = new Set(e.selectedIds), L ? N.delete(n.id) : N.add(n.id)) : (N = /* @__PURE__ */ new Set(), L || N.add(n.id));
      var M = new Set(e.halfSelectedIds);
      return M.delete(n.id), Object.assign(Object.assign({}, e), { selectedIds: N, halfSelectedIds: M, tabbableId: n.id, isFocused: !0, lastUserSelect: n.NotUserAction ? e.lastUserSelect : n.id, lastAction: n.type, lastInteractedWith: n.lastInteractedWith, lastManuallyToggled: n.lastManuallyToggled });
    case kr:
      var I, O = n.ids.filter((function(H) {
        return !e.disabledIds.has(H);
      }));
      if (n.multiSelect) {
        I = n.select ? new Set([].concat(On(e.selectedIds), On(O))) : ao(e.selectedIds, new Set(O));
        var D = ao(e.halfSelectedIds, I);
        return Object.assign(Object.assign({}, e), { selectedIds: I, halfSelectedIds: D, lastAction: n.type, lastInteractedWith: n.lastInteractedWith, lastManuallyToggled: n.lastManuallyToggled });
      }
      return e;
    case Qg:
      var A, z = n.ids.filter((function(H) {
        return !e.disabledIds.has(H);
      }));
      if (n.multiSelect) {
        A = n.select ? new Set(z) : ao(e.selectedIds, new Set(z));
        var se = ao(e.halfSelectedIds, A);
        return Object.assign(Object.assign({}, e), { selectedIds: A, halfSelectedIds: se, lastAction: n.type, lastInteractedWith: n.lastInteractedWith, lastManuallyToggled: n.lastManuallyToggled });
      }
      return e;
    case rm:
      var ue, ce = e.lastInteractedWith, ne = e.tabbableId;
      if (n.multiSelect) ue = new Set(n.ids), n.ids.length && (ce = n.ids[n.ids.length - 1], ne = n.ids[n.ids.length - 1]);
      else {
        ue = /* @__PURE__ */ new Set(), n.ids.length > 1 && console.warn("Tree in singleSelect mode, only the first item from selectedIds will be selected.");
        var Z = n.ids[0];
        Z && ue.add(Z), ce = Z ?? ce, ne = Z ?? ce;
      }
      var le = new Set(e.halfSelectedIds);
      n.ids.every((function(H) {
        return le.delete(H);
      }));
      var X = new Set(n.ids);
      return Object.assign(Object.assign({}, e), { selectedIds: ue, halfSelectedIds: le, controlledIds: X, isFocused: !0, lastAction: n.type, tabbableId: ne, lastInteractedWith: ce });
    case nn:
      return Object.assign(Object.assign({}, e), { tabbableId: n.id, isFocused: !0, lastAction: n.type, lastInteractedWith: n.lastInteractedWith });
    case tm:
      return Object.assign(Object.assign({}, e), { isFocused: !1 });
    case em:
      return Object.assign(Object.assign({}, e), { isFocused: !1, lastInteractedWith: null, tabbableId: n.id });
    case gR:
      var ge = new Set(e.disabledIds);
      return ge.add(n.id), Object.assign(Object.assign({}, e), { disabledIds: ge });
    case mR:
      var pe = new Set(e.disabledIds);
      return pe.delete(n.id), Object.assign(Object.assign({}, e), { disabledIds: pe });
    case nm:
      return Object.assign(Object.assign({}, e), { lastManuallyToggled: null });
    case om:
      return Object.assign(Object.assign({}, e), { tabbableId: n.tabbableId, lastInteractedWith: n.lastInteractedWith, lastManuallyToggled: n.lastManuallyToggled, lastUserSelect: n.lastUserSelect });
    default:
      throw new Error("Invalid action passed to the reducer");
  }
}, cm = function(e) {
  var n = e.element, r = e.dispatch, a = e.data, s = e.selectedIds, l = e.tabbableId, c = e.isFocused, d = e.expandedIds, h = e.disabledIds, p = e.halfSelectedIds, m = e.lastUserSelect, b = e.nodeRefs, w = e.leafRefs, g = e.baseClassNames, x = e.nodeRenderer, y = e.nodeAction, E = e.setsize, R = e.posinset, N = e.level, L = e.propagateCollapse, M = e.propagateSelect, I = e.multiSelect, O = e.togglableSelect, D = e.clickAction, A = e.state, z = function(Z) {
    if (!(Z.ctrlKey || Z.altKey || Z.shiftKey)) if (d.has(n.id) && L) {
      var le = [n.id].concat(On(lo(a, n.id, /* @__PURE__ */ new Set())));
      r({ type: Fl, ids: le, lastInteractedWith: n.id });
    } else r({ type: Wl, id: n.id, lastInteractedWith: n.id });
  }, se = function() {
    return r({ type: nn, id: n.id, lastInteractedWith: n.id });
  }, ue = function(Z) {
    if (Z.shiftKey) {
      var le = sm({ data: a, expandedIds: d, from: m, to: n.id }).filter((function(X) {
        return !h.has(X);
      }));
      le = M ? io(a, le, h) : le, r({ type: Qg, select: !0, multiSelect: I, ids: le, lastInteractedWith: n.id, lastManuallyToggled: n.id });
    } else Z.ctrlKey || D === ar.select ? (r({ type: O ? lm(a, n.id, s, h) : mi, id: n.id, multiSelect: I, lastInteractedWith: n.id, lastManuallyToggled: n.id }), M && !h.has(n.id) && r({ type: kr, ids: io(a, [n.id], h), select: !O || !s.has(n.id), multiSelect: I, lastInteractedWith: n.id, lastManuallyToggled: n.id })) : D === ar.exclusiveSelect ? r({ type: O ? ul : mi, id: n.id, multiSelect: !1, lastInteractedWith: n.id, lastManuallyToggled: n.id }) : D === ar.focus && r({ type: nn, id: n.id, lastInteractedWith: n.id });
  }, ce = function(Z) {
    var le;
    return qs(Z, (Mu(le = {}, "".concat(Z, "--expanded"), d.has(n.id)), Mu(le, "".concat(Z, "--selected"), s.has(n.id)), Mu(le, "".concat(Z, "--focused"), l === n.id && c), le));
  }, ne = y === "select" ? { "aria-selected": bR({ isSelected: s.has(n.id), isDisabled: h.has(n.id), multiSelect: I }) } : { "aria-checked": yR({ isSelected: s.has(n.id), isDisabled: h.has(n.id), isHalfSelected: p.has(n.id), multiSelect: I }) };
  return Gt(a, n.id) || n.isBranch ? de.createElement("li", Object.assign({ role: "treeitem", "aria-expanded": d.has(n.id), "aria-setsize": E, "aria-posinset": R, "aria-level": N, "aria-disabled": h.has(n.id), tabIndex: l === n.id ? 0 : -1, ref: function(Z) {
    b?.current != null && Z != null && (b.current[n.id] = Z);
  }, className: g.branchWrapper }, ne), de.createElement(de.Fragment, null, x({ element: n, isBranch: !0, isSelected: s.has(n.id), isHalfSelected: p.has(n.id), isExpanded: d.has(n.id), isDisabled: h.has(n.id), dispatch: r, getNodeProps: function() {
    var Z = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, le = Z.onClick;
    return { onClick: le == null ? Lu(ue, z, se) : Lu(le, se), className: qs(ce(g.node), g.branch), ref: function(X) {
      w?.current != null && (w.current[n.id] = X);
    } };
  }, setsize: E, posinset: R, level: N, handleSelect: ue, handleExpand: z, treeState: A }), de.createElement(SR, Object.assign({ getClasses: ce }, (function(Z) {
    return Z.setsize, Z.posinset, Fd(Z, ["setsize", "posinset"]);
  })(e))))) : de.createElement("li", { role: "none", className: ce(g.leafListItem) }, x({ element: n, isBranch: !1, isSelected: s.has(n.id), isHalfSelected: !1, isExpanded: !1, isDisabled: h.has(n.id), dispatch: r, getNodeProps: function() {
    var Z = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, le = Z.onClick;
    return Object.assign({ role: "treeitem", tabIndex: l === n.id ? 0 : -1, onClick: Lu(le ?? ue, se), ref: function(X) {
      b?.current != null && w?.current != null && (b.current[n.id] = X, w.current[n.id] = X);
    }, className: qs(ce(g.node), g.leaf), "aria-setsize": E, "aria-posinset": R, "aria-level": N, disabled: h.has(n.id), "aria-disabled": h.has(n.id) }, ne);
  }, setsize: E, posinset: R, level: N, handleSelect: ue, handleExpand: Oo, treeState: A }));
}, SR = function(e) {
  var n = e.data, r = e.element, a = e.expandedIds, s = e.getClasses, l = e.baseClassNames, c = e.level, d = Fd(e, ["data", "element", "expandedIds", "getClasses", "baseClassNames", "level"]);
  return de.createElement("ul", { role: "group", className: s(l.nodeGroup) }, a.has(r.id) && r.children.length > 0 && r.children.map((function(h, p) {
    return de.createElement(cm, Object.assign({ data: n, expandedIds: a, baseClassNames: l, key: "".concat(h, "-").concat(Pd(h)), element: ht(n, h), setsize: r.children.length, posinset: p + 1, level: c + 1 }, d));
  })));
}, _R = function(e) {
  var n = e.data, r = e.controlledSelectedIds, a = e.controlledExpandedIds, s = e.defaultExpandedIds, l = e.defaultSelectedIds, c = e.defaultDisabledIds, d = e.nodeRefs, h = e.leafRefs, p = e.onSelect, m = e.onNodeSelect, b = e.onExpand, w = e.onLoadData, g = e.togglableSelect, x = e.multiSelect, y = e.propagateSelect, E = e.propagateSelectUpwards, R = e.treeRef, N = e.focusedId, L = Sn(n), M = Xg(Ub(CR, { selectedIds: new Set(r || l), controlledIds: new Set(r), tabbableId: L.children[0], isFocused: !1, expandedIds: new Set(a || s), halfSelectedIds: /* @__PURE__ */ new Set(), lastUserSelect: L.children[0], lastInteractedWith: null, lastManuallyToggled: null, disabledIds: new Set(c) }), 2), I = M[0], O = M[1], D = I.selectedIds, A = I.expandedIds, z = I.disabledIds, se = I.tabbableId, ue = I.halfSelectedIds, ce = I.lastAction, ne = I.lastInteractedWith, Z = I.lastManuallyToggled, le = eh(D) || /* @__PURE__ */ new Set(), X = Vs(D, le);
  Wt((function() {
    var U;
    if (p != null && p !== Oo) {
      var B, G = hn(X);
      try {
        for (G.s(); !(B = G.n()).done; ) {
          var J = B.value, Q = Gt(n, J) || !!(!((U = ht(n, se)) === null || U === void 0) && U.isBranch);
          p({ element: ht(n, J), isBranch: Q, isExpanded: !!Q && A.has(J), isSelected: D.has(J), isDisabled: z.has(J), isHalfSelected: !!Q && ue.has(J), treeState: I });
        }
      } catch (j) {
        G.e(j);
      } finally {
        G.f();
      }
    }
  }), [n, D, A, z, ue, X, p, I]), Wt((function() {
    m != null && m !== Oo && Z != null && X.size && (m({ element: ht(n, Z), isSelected: D.has(Z), isBranch: Gt(n, Z), treeState: I }), O({ type: nm }));
  }), [Z, D, X]);
  var ge = eh(A) || /* @__PURE__ */ new Set();
  Wt((function() {
    var U = Vs(A, ge);
    if (b != null && b !== Oo) {
      var B, G = hn(U);
      try {
        for (G.s(); !(B = G.n()).done; ) {
          var J = B.value;
          b({ element: ht(n, J), isExpanded: A.has(J), isSelected: D.has(J), isDisabled: z.has(J), isHalfSelected: ue.has(J), treeState: I });
        }
      } catch (Q) {
        G.e(Q);
      } finally {
        G.f();
      }
    }
  }), [n, D, A, z, ue, ge, b, I]);
  var pe, H, P = (pe = n, H = Ht(), Wt((function() {
    H.current = pe;
  })), H.current || /* @__PURE__ */ new Map());
  Wt((function() {
    var U = Vs(A, ge);
    if (w) {
      var B, G = hn(U);
      try {
        for (G.s(); !(B = G.n()).done; ) {
          var J = B.value;
          w({ element: ht(n, J), isExpanded: A.has(J), isSelected: D.has(J), isDisabled: z.has(J), isHalfSelected: ue.has(J), treeState: I });
        }
      } catch (he) {
        G.e(he);
      } finally {
        G.f();
      }
      if (P !== n && g && y) {
        var Q, j = hn(A);
        try {
          for (j.s(); !(Q = j.n()).done; ) {
            var ve = Q.value;
            D.has(ve) && O({ type: kr, ids: io(n, [ve], z), select: !0, multiSelect: x, lastInteractedWith: ve });
          }
        } catch (he) {
          j.e(he);
        } finally {
          j.f();
        }
      }
    }
  }), [n, D, A, z, ue, ge, w, I]), Wt((function() {
    if (P !== n) {
      var U = Sn(n);
      U.children.length && O({ type: om, tabbableId: n.find((function(B) {
        return B.id === I.tabbableId;
      })) ? I.tabbableId : U.children[0], lastInteractedWith: n.find((function(B) {
        return B.id === I.lastInteractedWith;
      })) ? I.lastInteractedWith : null, lastManuallyToggled: n.find((function(B) {
        return B.id === I.lastManuallyToggled;
      })) ? I.lastManuallyToggled : null, lastUserSelect: n.find((function(B) {
        return B.id === I.lastUserSelect;
      })) ? I.lastUserSelect : U.children[0] });
    }
  }), [n]);
  var ae = Vs(new Set(r), D);
  return Wt((function() {
    var U = r || l;
    if (r && ae.size && O({ type: rm, ids: r, multiSelect: x }), U) {
      var B, G = hn(U);
      try {
        for (G.s(); !(B = G.n()).done; ) {
          var J = B.value;
          y && !z.has(J) && O({ type: kr, ids: io(n, [J], z), select: !0, multiSelect: x, lastInteractedWith: J });
        }
      } catch (Q) {
        G.e(Q);
      } finally {
        G.f();
      }
    }
  }), [r]), Wt((function() {
    var U = new Set(a), B = ao(U, ge), G = ao(ge, U);
    if (G.size) {
      var J, Q = hn(G);
      try {
        for (Q.s(); !(J = Q.n()).done; ) {
          var j = J.value;
          if (Gt(n, j) || ht(n, j).isBranch) {
            var ve = [j].concat(On(lo(n, j, /* @__PURE__ */ new Set())));
            O({ type: Fl, ids: ve, lastInteractedWith: j });
          }
        }
      } catch (Le) {
        Q.e(Le);
      } finally {
        Q.f();
      }
    }
    if (B.size) {
      var he, re = hn(B);
      try {
        for (re.s(); !(he = re.n()).done; ) {
          var me = he.value;
          if (Gt(n, me) || ht(n, me).isBranch) {
            var ee = Lr(n, me);
            O(ee ? { type: cl, ids: [me, ee], lastInteractedWith: me } : { type: ll, id: me, lastInteractedWith: me });
          }
        }
      } catch (Le) {
        re.e(Le);
      } finally {
        re.f();
      }
    }
  }), [a]), Wt((function() {
    if (E) {
      var U = new Set(On(X));
      ne && ce !== nn && ce !== Wd && ce !== ll && ce !== Wl && U.add(ne);
      var B = [];
      U.forEach((function(Re) {
        n.find((function(Ue) {
          return Ue.id === Re;
        })) || B.push(Re);
      })), B.forEach((function(Re) {
        return U.delete(Re);
      }));
      var G = (function(Re, Ue, zt, St, rt, ut) {
        var st, pt = { every: /* @__PURE__ */ new Set(), some: /* @__PURE__ */ new Set(), none: /* @__PURE__ */ new Set() }, Qn = hn(Ue);
        try {
          for (Qn.s(); !(st = Qn.n()).done; ) for (var bt = st.value; ; ) {
            var _t = Lr(Re, bt);
            if (_t === 0 || _t == null || _t != null && St.has(_t)) break;
            var on = ht(Re, _t).children.filter((function(ot) {
              return !St.has(ot);
            }));
            if (on.length === 0) break;
            if (on.some((function(ot) {
              return zt.has(ot) || pt.some.has(ot) && !pt.none.has(ot) || rt.has(ot) && !pt.none.has(ot);
            }))) on.every((function(ot) {
              return zt.has(ot);
            })) ? pt.every.add(_t) : pt.some.add(_t);
            else {
              var an = vR(Re, bt, St).find((function(ot) {
                return zt.has(ot);
              }));
              if (!ut && an) {
                lo(Re, an, St).forEach((function(ot) {
                  rt.has(ot) && pt.none.add(ot);
                }));
                break;
              }
              pt.none.add(_t);
            }
            bt = _t;
          }
        } catch (ot) {
          Qn.e(ot);
        } finally {
          Qn.f();
        }
        return pt;
      })(n, U, D, z, ue, x), J = G.every, Q = G.some, j = G.none;
      r && U.forEach((function(Re) {
        Gt(n, Re) && lo(n, Re, /* @__PURE__ */ new Set()).every((function(Ue) {
          return D.has(Ue);
        })) && J.add(Re);
      }));
      var ve, he = hn(J);
      try {
        for (he.s(); !(ve = he.n()).done; ) {
          var re = ve.value;
          D.has(re) || O({ type: mi, id: re, multiSelect: x || xR(n, re, D), keepFocus: !0, NotUserAction: !0, lastInteractedWith: ne });
        }
      } catch (Re) {
        he.e(Re);
      } finally {
        he.f();
      }
      var me, ee = hn(Q);
      try {
        for (ee.s(); !(me = ee.n()).done; ) {
          var Le = me.value;
          ue.has(Le) || O({ type: Hd, id: Le, lastInteractedWith: ne, keepFocus: !0, NotUserAction: !0 });
        }
      } catch (Re) {
        ee.e(Re);
      } finally {
        ee.f();
      }
      var qe, vt = hn(j);
      try {
        for (vt.s(); !(qe = vt.n()).done; ) {
          var $t = qe.value;
          (D.has($t) || ue.has($t)) && O({ type: Jg, id: $t, multiSelect: x, keepFocus: !0, NotUserAction: !0, lastInteractedWith: ne, lastManuallyToggled: Z });
        }
      } catch (Re) {
        vt.e(Re);
      } finally {
        vt.f();
      }
    }
  }), [n, x, E, D, A, z, ue, ce, le, X, ne, ae]), Wt((function() {
    if (ne != null && se != null && d?.current != null && h?.current != null && (R?.current == null || document.activeElement && R.current.contains(document.activeElement) || N)) {
      var U = d.current[se];
      (function(B) {
        B != null && B.scrollIntoView && B.scrollIntoView({ block: "nearest" });
      })(h.current[ne]), (function(B) {
        B != null && B.focus && B.focus({ preventScroll: !0 });
      })(U);
    }
  }), [se, d, h, ne]), Wt((function() {
    if (N || O({ type: em, id: L.children[0] }), N && n.find((function(B) {
      return B.id === N;
    }))) {
      var U = (function B(G, J) {
        var Q = Lr(G, J), j = Q && (Gt(G, Q) || ht(G, Q).isBranch);
        return Q && j ? [Q].concat(On(B(G, Q))) : [];
      })(n, N);
      U.length && O({ type: cl, ids: U, lastInteractedWith: N }), O({ type: nn, id: N, lastInteractedWith: N });
    }
  }), [N]), [I, O];
}, ER = de.forwardRef((function(e, n) {
  var r = e.data, a = e.selectedIds, s = e.nodeRenderer, l = e.onSelect, c = l === void 0 ? Oo : l, d = e.onNodeSelect, h = d === void 0 ? Oo : d, p = e.onExpand, m = p === void 0 ? Oo : p, b = e.onLoadData, w = e.className, g = w === void 0 ? "" : w, x = e.multiSelect, y = x !== void 0 && x, E = e.propagateSelect, R = E !== void 0 && E, N = e.propagateSelectUpwards, L = N !== void 0 && N, M = e.propagateCollapse, I = M !== void 0 && M, O = e.expandOnKeyboardSelect, D = O !== void 0 && O, A = e.togglableSelect, z = A !== void 0 && A, se = e.defaultExpandedIds, ue = se === void 0 ? [] : se, ce = e.defaultSelectedIds, ne = ce === void 0 ? [] : ce, Z = e.defaultDisabledIds, le = Z === void 0 ? [] : Z, X = e.clickAction, ge = X === void 0 ? ar.select : X, pe = e.nodeAction, H = pe === void 0 ? "select" : pe, P = e.expandedIds, ae = e.focusedId, U = e.onBlur, B = Fd(e, ["data", "selectedIds", "nodeRenderer", "onSelect", "onNodeSelect", "onExpand", "onLoadData", "className", "multiSelect", "propagateSelect", "propagateSelectUpwards", "propagateCollapse", "expandOnKeyboardSelect", "togglableSelect", "defaultExpandedIds", "defaultSelectedIds", "defaultDisabledIds", "clickAction", "nodeAction", "expandedIds", "focusedId", "onBlur"]);
  (function(re) {
    if (th(re.map((function(me) {
      return me.id;
    })))) throw Error("Multiple TreeView nodes have the same ID. IDs must be unique.");
    if (re.forEach((function(me) {
      if (me.id === me.parent) throw Error("Node with id=".concat(me.id, " has parent reference to itself."));
      if (th(me.children)) throw Error("Node with id=".concat(me.id, " contains duplicate ids in its children."));
    })), re.filter((function(me) {
      return me.parent === null;
    })).length === 0) throw Error("TreeView must have one root node.");
    if (re.filter((function(me) {
      return me.parent === null;
    })).length > 1) throw Error("TreeView can have only one root node.");
    Sn(re).children.length || console.warn("TreeView have no nodes to display.");
  })(r);
  var G = Ht({}), J = Ht({}), Q = Ht(null);
  n != null && (Q = n);
  var j = Xg(_R({ data: r, controlledSelectedIds: a, controlledExpandedIds: P, defaultExpandedIds: ue, defaultSelectedIds: ne, defaultDisabledIds: le, nodeRefs: G, leafRefs: J, onSelect: c, onNodeSelect: h, onExpand: m, onLoadData: b, togglableSelect: z, multiSelect: y, propagateSelect: R, propagateSelectUpwards: L, treeRef: Q, focusedId: ae }), 2), ve = j[0], he = j[1];
  return R = R && y, de.createElement("ul", Object.assign({ className: qs(Q0.root, g), role: "tree", "aria-multiselectable": H === "select" ? y : void 0, ref: Q, onBlur: function(re) {
    wR(re, Q.current, (function() {
      U && U({ treeState: ve, dispatch: he }), he({ type: tm });
    }));
  }, onKeyDown: RR({ data: r, tabbableId: ve.tabbableId, expandedIds: ve.expandedIds, selectedIds: ve.selectedIds, disabledIds: ve.disabledIds, halfSelectedIds: ve.halfSelectedIds, clickAction: ge, dispatch: he, propagateCollapse: I, propagateSelect: R, multiSelect: y, expandOnKeyboardSelect: D, togglableSelect: z }) }, B), Sn(r).children.map((function(re, me) {
    return de.createElement(cm, Object.assign({ key: "".concat(re, "-").concat(Pd(re)), data: r, element: ht(r, re), setsize: Sn(r).children.length, posinset: me + 1, level: 1 }, ve, { state: ve, dispatch: he, nodeRefs: G, leafRefs: J, baseClassNames: Q0, nodeRenderer: s, propagateCollapse: I, propagateSelect: R, propagateSelectUpwards: L, multiSelect: y, togglableSelect: z, clickAction: ge, nodeAction: H }));
  })));
})), RR = function(e) {
  var n = e.data, r = e.expandedIds, a = e.selectedIds, s = e.disabledIds, l = e.tabbableId, c = e.dispatch, d = e.propagateCollapse, h = e.propagateSelect, p = e.multiSelect, m = e.expandOnKeyboardSelect, b = e.togglableSelect, w = e.clickAction;
  return function(g) {
    var x = ht(n, l), y = x.id;
    if (g.ctrlKey) {
      if (g.key === "a" && w !== ar.focus) {
        g.preventDefault();
        var E = n.filter((function(ne) {
          return ne.parent !== null;
        })).map((function(ne) {
          return ne.id;
        })).filter((function(ne) {
          return !s.has(ne);
        }));
        c({ type: kr, multiSelect: p, select: Array.from(a).filter((function(ne) {
          return !s.has(ne);
        })).length !== E.length, ids: E, lastInteractedWith: x.id });
      } else if (g.shiftKey && (g.key === "Home" || g.key === "End") && w !== ar.focus) {
        var R = g.key === "Home" ? Sn(n).children[0] : Ku(n, y, r), N = sm({ data: n, expandedIds: r, from: y, to: R }).filter((function(ne) {
          return !s.has(ne);
        }));
        c({ type: kr, multiSelect: p, select: !0, ids: h ? io(n, N, s) : N }), c({ type: nn, id: R, lastInteractedWith: R });
      }
    } else {
      if (g.shiftKey) switch (g.key) {
        case "ArrowUp":
          g.preventDefault();
          var L = Zu(n, y, r);
          return void (L == null || s.has(L) || (w !== ar.focus && c({ type: kr, ids: h ? io(n, [L], s) : [L], select: !0, multiSelect: p, lastInteractedWith: L, lastManuallyToggled: L }), c({ type: nn, id: L, lastInteractedWith: L })));
        case "ArrowDown":
          g.preventDefault();
          var M = ii(n, y, r);
          return void (M == null || s.has(M) || (w !== ar.focus && c({ type: kr, ids: h ? io(n, [M], s) : [M], multiSelect: p, select: !0, lastInteractedWith: M, lastManuallyToggled: M }), c({ type: nn, id: M, lastInteractedWith: M })));
      }
      switch (g.key) {
        case "ArrowDown":
          g.preventDefault();
          var I = ii(n, y, r);
          return void (I != null && c({ type: nn, id: I, lastInteractedWith: I }));
        case "ArrowUp":
          g.preventDefault();
          var O = Zu(n, y, r);
          return void (O != null && c({ type: nn, id: O, lastInteractedWith: O }));
        case "ArrowLeft":
          if (g.preventDefault(), (Gt(n, y) || x.isBranch) && r.has(l)) if (d) {
            var D = [y].concat(On(lo(n, y, /* @__PURE__ */ new Set())));
            c({ type: Fl, ids: D, lastInteractedWith: x.id });
          } else c({ type: Wd, id: y, lastInteractedWith: y });
          else if (!Sn(n).children.includes(y)) {
            var A = Lr(n, y);
            if (A == null) throw new Error("parentId of root element is null");
            c({ type: nn, id: A, lastInteractedWith: A });
          }
          return;
        case "ArrowRight":
          return g.preventDefault(), void ((Gt(n, y) || x.isBranch) && (r.has(l) ? c({ type: nn, id: x.children[0], lastInteractedWith: x.children[0] }) : c({ type: ll, id: y, lastInteractedWith: y })));
        case "Home":
          g.preventDefault(), c({ type: nn, id: Sn(n).children[0], lastInteractedWith: Sn(n).children[0] });
          break;
        case "End":
          g.preventDefault();
          var z = Ku(n, Sn(n).id, r);
          return void c({ type: nn, id: z, lastInteractedWith: z });
        case "*":
          g.preventDefault();
          var se = Lr(n, y);
          if (se == null) throw new Error("parentId of element is null");
          var ue = ht(n, se).children.filter((function(ne) {
            return Gt(n, ne) || ht(n, ne).isBranch;
          }));
          return void c({ type: cl, ids: ue, lastInteractedWith: y });
        case "Enter":
        case " ":
        case "Spacebar":
          return g.preventDefault(), w === ar.focus ? void 0 : (c({ type: b ? lm(n, y, a, s) : mi, id: y, multiSelect: p, lastInteractedWith: y, lastManuallyToggled: y }), h && !s.has(x.id) && c({ type: kr, ids: io(n, [y], s), select: !b || !a.has(y), multiSelect: p, lastInteractedWith: y, lastManuallyToggled: y }), void (m && c({ type: Wl, id: y, lastInteractedWith: y })));
        default:
          if (g.key.length === 1) for (var ce = ii(n, y, r); ce !== y; ) if (ce != null) {
            if (ht(n, ce).name[0].toLowerCase() === g.key.toLowerCase()) return void c({ type: nn, id: ce, lastInteractedWith: y });
            ce = ii(n, ce, r);
          } else ce = Sn(n).children[0];
          return;
      }
    }
  };
};
ER.propTypes = { data: wt.array.isRequired, onSelect: wt.func, onNodeSelect: wt.func, onExpand: wt.func, className: wt.string, nodeRenderer: wt.func.isRequired, defaultExpandedIds: wt.array, defaultSelectedIds: wt.array, expandedIds: wt.array, selectedIds: wt.array, defaultDisabledIds: wt.array, propagateCollapse: wt.bool, propagateSelect: wt.bool, propagateSelectUpwards: wt.bool, multiSelect: wt.bool, expandOnKeyboardSelect: wt.bool, togglableSelect: wt.bool, nodeAction: wt.oneOf(pR), clickAction: wt.oneOf(hR), onBlur: wt.func, onLoadData: wt.func, focusedId: wt.oneOfType([wt.string, wt.number]) };
const nh = 14, rh = 16, um = fr(
  // [Joshen Temp]: aria-selected:text-foreground not working as aria-selected property not rendered in DOM,
  // [Joshen Temp]: aria-selected:!bg-selection not working as aria-selected property not rendered in DOM
  "group relative transition-colors h-[28px] flex items-center gap-3 text-sm cursor-pointer select-none text-foreground-light hover:bg-control aria-expanded:bg-transparent data-[state=open]:bg-transparent",
  // data-[state=open]:bg-control bg state for context menu open
  {
    variants: {
      isSelected: {
        true: "text-foreground !bg-selection",
        // bg state for context menu open
        false: ""
      },
      isOpened: {
        true: "bg-control",
        false: ""
      },
      isPreview: {
        true: "bg-control text-foreground",
        false: ""
      }
    }
  }
);
yt(
  ({
    level: e = 1,
    levelPadding: n = 38,
    isExpanded: r = !1,
    isOpened: a = !1,
    isBranch: s = !1,
    isSelected: l = !1,
    isPreview: c = !1,
    isLoading: d = !1,
    xPadding: h = 16,
    name: p = "",
    description: m,
    nameForTitle: b,
    icon: w,
    isEditing: g = !1,
    onEditSubmit: x,
    onDoubleClick: y,
    actions: E,
    ...R
  }, N) => {
    const L = b ?? (typeof p == "string" ? p : ""), [M, I] = Ze(L), O = Ht(null), D = Ht(0);
    Wt(() => {
      g ? (D.current = Number(/* @__PURE__ */ new Date()), setTimeout(() => {
        const H = O.current;
        H && (document.activeElement !== H && H.focus(), setTimeout(() => {
          const P = H.value, ae = P.lastIndexOf("."), U = 0, B = ae > 0 ? ae : P.length;
          try {
            H.setSelectionRange(U, B);
          } catch (G) {
            console.error("Could not set selection range", G);
          }
        }, 50));
      }, 200)) : I(L);
    }, [g, L]), Wt(() => {
      d || I(L);
    }, [d, L]);
    const A = (H) => {
      Number(/* @__PURE__ */ new Date()) - D.current < 400 ? (H.preventDefault(), O.current?.focus()) : x?.(M);
    }, z = (H) => {
      H.preventDefault(), x?.(M);
    }, {
      isDisabled: se,
      isHalfSelected: ue,
      handleSelect: ce,
      handleExpand: ne,
      treeState: Z,
      dispatch: le,
      ...X
    } = R, ge = m?.trim(), pe = ge ? `${L}
${ge}` : L;
    return /* @__PURE__ */ V(
      "div",
      {
        ref: N,
        title: pe,
        ...X,
        "aria-selected": l,
        "aria-expanded": !g && r,
        onDoubleClick: y,
        className: fe(
          um({ isSelected: l, isOpened: a, isPreview: c }),
          !!E && "pr-2",
          !g && !!E && "justify-between",
          R.className
        ),
        style: {
          paddingLeft: h + (e - 1) * n / 2,
          ...R.style
        },
        "data-treeview-is-branch": s,
        "data-treeview-level": e,
        children: [
          Array.from({ length: e - 1 }).map((H, P) => /* @__PURE__ */ f(
            "div",
            {
              style: {
                left: h + P * n / 2 + nh / 2
              },
              className: "absolute h-full w-px bg-border-strong"
            },
            P
          )),
          l && /* @__PURE__ */ f("div", { className: "absolute left-0 h-full w-0.5 bg-foreground" }),
          /* @__PURE__ */ V("div", { className: "flex items-center gap-x-3 truncate", children: [
            s ? /* @__PURE__ */ V(Fn, { children: [
              d ? /* @__PURE__ */ f(Js, { className: fe("text-foreground-muted animate-spin"), size: 14 }) : /* @__PURE__ */ f(
                fl,
                {
                  className: fe(
                    "text-foreground-muted",
                    "group-aria-selected:text-foreground-light",
                    "group-aria-expanded:text-foreground-light",
                    "transition-transform duration-200",
                    "group-aria-expanded:rotate-90"
                  ),
                  size: nh,
                  strokeWidth: 1.5
                }
              ),
              /* @__PURE__ */ f(
                IR,
                {
                  className: fe(
                    "transition-colors",
                    " text-foreground-muted",
                    "group-aria-selected:text-foreground-light",
                    "group-aria-expanded:text-foreground-light"
                  ),
                  isOpen: r,
                  size: rh,
                  strokeWidth: 1.5
                }
              )
            ] }) : w || /* @__PURE__ */ f(
              dm,
              {
                className: fe(
                  "transition-colors",
                  "fill-foreground-muted",
                  "group-aria-selected:fill-foreground",
                  "w-5 h-5 shrink-0"
                ),
                size: rh,
                strokeWidth: 1.5
              }
            ),
            /* @__PURE__ */ f("span", { className: fe(g && "hidden", "truncate text-sm"), children: p })
          ] }),
          !g && E,
          /* @__PURE__ */ f("form", { onSubmit: z, className: fe(!g && "hidden"), children: /* @__PURE__ */ f(
            zo,
            {
              autoFocus: !0,
              ref: O,
              onChange: (H) => {
                I(H.target.value);
              },
              onBlur: A,
              onKeyDownCapture: (H) => {
                H.key === "Enter" ? O.current?.blur() : H.key === "Escape" ? (I(L), x?.(L)) : H.stopPropagation();
              },
              className: "block w-full text-sm px-2 py-1 h-7",
              value: M
            }
          ) })
        ]
      }
    );
  }
);
const dm = yt((e, n) => /* @__PURE__ */ V("svg", { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...e, children: [
  /* @__PURE__ */ V("g", { clipPath: "url(#clip0_1018_49117)", children: [
    /* @__PURE__ */ f("path", { d: "M20.8457 14.4531V15.6348H17.8916V14.4531H20.8457ZM18.3311 8.52539V15.6348H16.9004V8.52539H18.3311Z" }),
    /* @__PURE__ */ f("path", { d: "M13.6865 14.5508L15.3857 16.084L14.4873 16.9092L12.8271 15.376L13.6865 14.5508ZM15.3564 11.5283V12.6318C15.3564 13.1429 15.2962 13.5938 15.1758 13.9844C15.0553 14.3717 14.8812 14.6956 14.6533 14.9561C14.4255 15.2132 14.1553 15.4069 13.8428 15.5371C13.5303 15.6673 13.1836 15.7324 12.8027 15.7324C12.4219 15.7324 12.0736 15.6673 11.7578 15.5371C11.4453 15.4069 11.1751 15.2132 10.9473 14.9561C10.7227 14.6956 10.5469 14.3717 10.4199 13.9844C10.2962 13.5938 10.2344 13.1429 10.2344 12.6318V11.5283C10.2344 11.0173 10.2962 10.568 10.4199 10.1807C10.5436 9.79329 10.7178 9.47103 10.9424 9.21387C11.1702 8.95345 11.4404 8.75814 11.7529 8.62793C12.0654 8.49447 12.4121 8.42773 12.793 8.42773C13.1771 8.42773 13.5254 8.49447 13.8379 8.62793C14.1504 8.75814 14.4206 8.95345 14.6484 9.21387C14.8796 9.47103 15.0553 9.79329 15.1758 10.1807C15.2962 10.568 15.3564 11.0173 15.3564 11.5283ZM13.9307 12.6318V11.5186C13.9307 11.1833 13.9062 10.8952 13.8574 10.6543C13.8086 10.4134 13.7354 10.2165 13.6377 10.0635C13.5433 9.91048 13.4245 9.79818 13.2812 9.72656C13.1413 9.65495 12.9785 9.61914 12.793 9.61914C12.6107 9.61914 12.4479 9.65495 12.3047 9.72656C12.1647 9.79818 12.0475 9.91048 11.9531 10.0635C11.8587 10.2165 11.7855 10.4134 11.7334 10.6543C11.6846 10.8952 11.6602 11.1833 11.6602 11.5186V12.6318C11.6602 12.9704 11.6846 13.2601 11.7334 13.501C11.7822 13.7419 11.8538 13.9404 11.9482 14.0967C12.0459 14.2497 12.1647 14.3636 12.3047 14.4385C12.4479 14.5101 12.6139 14.5459 12.8027 14.5459C12.985 14.5459 13.1462 14.5101 13.2861 14.4385C13.4294 14.3636 13.5482 14.2497 13.6426 14.0967C13.7402 13.9437 13.8118 13.7467 13.8574 13.5059C13.9062 13.2617 13.9307 12.9704 13.9307 12.6318Z" }),
    /* @__PURE__ */ f("path", { d: "M7.47266 13.7646C7.47266 13.6377 7.46126 13.5221 7.43848 13.418C7.41569 13.3138 7.36686 13.2178 7.29199 13.1299C7.22038 13.042 7.11458 12.9541 6.97461 12.8662C6.83789 12.7783 6.65885 12.6872 6.4375 12.5928C6.17383 12.4821 5.91829 12.3649 5.6709 12.2412C5.4235 12.1143 5.20052 11.9678 5.00195 11.8018C4.80339 11.6357 4.64551 11.4404 4.52832 11.2158C4.41439 10.988 4.35742 10.721 4.35742 10.415C4.35742 10.1156 4.41113 9.84375 4.51855 9.59961C4.62923 9.35547 4.78548 9.14714 4.9873 8.97461C5.18913 8.79883 5.42513 8.66374 5.69531 8.56934C5.96875 8.47493 6.27311 8.42773 6.6084 8.42773C7.06413 8.42773 7.45801 8.52214 7.79004 8.71094C8.12533 8.89974 8.38411 9.15853 8.56641 9.4873C8.75195 9.81608 8.84473 10.1937 8.84473 10.6201H7.41895C7.41895 10.4183 7.38965 10.2409 7.33105 10.0879C7.27572 9.93164 7.1862 9.80957 7.0625 9.72168C6.9388 9.63379 6.7793 9.58984 6.58398 9.58984C6.40169 9.58984 6.25033 9.62728 6.12988 9.70215C6.0127 9.77376 5.9248 9.87305 5.86621 10C5.81087 10.1237 5.7832 10.2637 5.7832 10.4199C5.7832 10.5371 5.81087 10.6429 5.86621 10.7373C5.9248 10.8285 6.00456 10.9115 6.10547 10.9863C6.20638 11.0579 6.3252 11.1279 6.46191 11.1963C6.60189 11.2646 6.75488 11.3314 6.9209 11.3965C7.24316 11.5234 7.52799 11.6634 7.77539 11.8164C8.02279 11.9661 8.22949 12.1354 8.39551 12.3242C8.56152 12.5098 8.68685 12.7197 8.77148 12.9541C8.85612 13.1885 8.89844 13.4554 8.89844 13.7549C8.89844 14.0511 8.84635 14.3213 8.74219 14.5654C8.64128 14.8063 8.49316 15.0146 8.29785 15.1904C8.10254 15.363 7.86654 15.4964 7.58984 15.5908C7.31641 15.6852 7.01042 15.7324 6.67188 15.7324C6.3431 15.7324 6.03223 15.6868 5.73926 15.5957C5.44629 15.5013 5.1875 15.3597 4.96289 15.1709C4.74154 14.9788 4.56738 14.7363 4.44043 14.4434C4.31348 14.1471 4.25 13.7972 4.25 13.3936H5.68066C5.68066 13.6084 5.70182 13.7923 5.74414 13.9453C5.78646 14.0951 5.85156 14.2155 5.93945 14.3066C6.02734 14.3945 6.13477 14.4613 6.26172 14.5068C6.39193 14.5492 6.54004 14.5703 6.70605 14.5703C6.89486 14.5703 7.0446 14.5345 7.15527 14.4629C7.26921 14.3913 7.35059 14.2952 7.39941 14.1748C7.44824 14.0544 7.47266 13.9176 7.47266 13.7646Z" }),
    /* @__PURE__ */ f(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M20.5 5.73438H4.5C3.11929 5.73438 2 6.85366 2 8.23438V16.5039C2 17.8846 3.11929 19.0039 4.5 19.0039H20.5C21.8807 19.0039 23 17.8846 23 16.5039V8.23438C23 6.85366 21.8807 5.73438 20.5 5.73438ZM4.5 4.23438C2.29086 4.23438 0.5 6.02524 0.5 8.23438V16.5039C0.5 18.713 2.29086 20.5039 4.5 20.5039H20.5C22.7091 20.5039 24.5 18.713 24.5 16.5039V8.23438C24.5 6.02524 22.7091 4.23438 20.5 4.23438H4.5Z"
      }
    )
  ] }),
  /* @__PURE__ */ f("defs", { children: /* @__PURE__ */ f("clipPath", { id: "clip0_1018_49117", children: /* @__PURE__ */ f("rect", { width: "24", height: "24", transform: "translate(0.5 0.269531)" }) }) })
] })), IR = yt(
  ({ isOpen: e, ...n }, r) => /* @__PURE__ */ f(e ? t7 : e7, { ref: r, ...n })
), fm = yt(({ ...e }, n) => /* @__PURE__ */ V(Ll, { children: [
  /* @__PURE__ */ f(Nl, { asChild: !0, children: /* @__PURE__ */ f(
    Dn,
    {
      ref: n,
      ...e,
      className: fe(e.className, "pointer-events-auto!"),
      onClick: (r) => {
        !e.disabled && e.onClick && e.onClick(r);
      },
      children: e.children
    }
  ) }),
  e.disabled && e.tooltip.content.text !== void 0 && /* @__PURE__ */ f(Si, { ...e.tooltip.content, children: e.tooltip.content.text })
] }));
fm.displayName = "DropdownMenuItemTooltip";
const oh = ({
  children: e,
  side: n,
  align: r,
  options: a,
  onSelect: s,
  className: l
}) => /* @__PURE__ */ V(Dr, { children: [
  /* @__PURE__ */ f(ur, { className: l, children: e }),
  /* @__PURE__ */ f(dr, { side: n, align: r, children: /* @__PURE__ */ V("div", { className: "overflow-auto", style: { maxHeight: "30vh" }, children: [
    a.length === 0 && /* @__PURE__ */ f("p", { children: "No more items" }),
    a.map((c) => /* @__PURE__ */ f(
      fm,
      {
        disabled: c.disabled,
        tooltip: { content: { side: "right", text: c.tooltip } },
        onClick: () => s(c.value),
        children: /* @__PURE__ */ V("div", { className: "flex items-center gap-2", children: [
          c.preLabel && /* @__PURE__ */ f("span", { className: "grow text-foreground-lighter", children: c.preLabel }),
          /* @__PURE__ */ f("span", { children: c.label }),
          c.postLabel && /* @__PURE__ */ f("span", { className: "text-foreground-lighter", children: c.postLabel })
        ] })
      },
      c.value
    ))
  ] }) })
] }), Nu = [
  { value: "=", label: "equals", preLabel: "[ = ]", abbrev: "eq" },
  { value: "<>", label: "not equal", preLabel: "[ <> ]", abbrev: "neq" },
  { value: ">", label: "greater than", preLabel: "[ > ]", abbrev: "gt" },
  { value: "<", label: "less than", preLabel: "[ < ]", abbrev: "lt" },
  {
    value: ">=",
    label: "greater than or equal",
    preLabel: "[ >= ]",
    abbrev: "gte"
  },
  {
    value: "<=",
    label: "less than or equal",
    preLabel: "[ <= ]",
    abbrev: "lte"
  },
  { value: "~~", label: "like operator", preLabel: "[ ~~ ]", abbrev: "like" },
  {
    value: "~~*",
    label: "ilike operator",
    preLabel: "[ ~~* ]",
    abbrev: "ilike"
  },
  {
    value: "in",
    label: "one of a list of values",
    preLabel: "[ in ]",
    abbrev: "in"
  },
  {
    value: "is",
    label: "checking for (null,not null,true,false)",
    preLabel: "[ is ]",
    abbrev: "is"
  }
], kR = ({ columns: e, filters: n, onFilterChange: r }) => {
  const [a, s] = Ze(e[0]?.key ?? ""), [l, c] = Ze(Nu[0]?.value ?? ""), [d, h] = Ze(""), p = Pt(() => e.filter((w) => w.key.length > 0), [e]), m = () => {
    r?.([
      ...n,
      {
        column: a,
        operator: l,
        value: d.trim(),
        linkOperator: n.length > 0 ? "AND" : void 0
      }
    ]), h("");
  }, b = (w) => {
    r && r(n.filter((g, x) => x !== w));
  };
  return /* @__PURE__ */ V(Dr, { children: [
    /* @__PURE__ */ f(ur, { asChild: !0, children: /* @__PURE__ */ f(Rt, { variant: "text", size: "tiny", icon: /* @__PURE__ */ f(Ju, {}), children: "Filter" }) }),
    /* @__PURE__ */ V(
      dr,
      {
        side: "bottom",
        align: "start",
        className: "w-120 p-0 border border-border-default bg-background-surface-100",
        children: [
          /* @__PURE__ */ f("div", { className: "p-2 border-b border-border-default", children: n.length === 0 ? /* @__PURE__ */ V("div", { className: "p-1 text-xs", children: [
            /* @__PURE__ */ f("p", { className: "text-foreground-light font-medium", children: "No filters applied to this view" }),
            /* @__PURE__ */ f("p", { className: "text-foreground-lighter mt-1", children: "Add a column below to filter the view" })
          ] }) : /* @__PURE__ */ V("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ f(
              oh,
              {
                align: "start",
                options: p.map((w) => ({
                  value: w.key,
                  label: w.name
                })),
                onSelect: (w) => s(w),
                children: /* @__PURE__ */ f(
                  Rt,
                  {
                    asChild: !0,
                    variant: "outline",
                    icon: /* @__PURE__ */ f("div", { className: "text-foreground-lighter", children: /* @__PURE__ */ f(ci, { strokeWidth: 1.5 }) }),
                    className: "w-32 justify-start",
                    children: /* @__PURE__ */ f("span", { children: p.find((w) => w.key === a)?.name ?? "" })
                  }
                )
              }
            ),
            /* @__PURE__ */ f(
              oh,
              {
                align: "start",
                options: Nu,
                onSelect: (w) => c(w),
                children: /* @__PURE__ */ f(
                  Rt,
                  {
                    asChild: !0,
                    variant: "outline",
                    icon: /* @__PURE__ */ f("div", { className: "text-foreground-lighter", children: /* @__PURE__ */ f(ci, { strokeWidth: 1.5 }) }),
                    children: /* @__PURE__ */ f("span", { children: Nu.find((w) => w.value === l)?.label ?? "" })
                  }
                )
              }
            ),
            /* @__PURE__ */ f(
              zo,
              {
                value: d,
                size: "tiny",
                onChange: (w) => h(w.target.value),
                placeholder: "Enter a value"
              }
            ),
            /* @__PURE__ */ f(
              Rt,
              {
                variant: "text",
                className: "px-1",
                icon: /* @__PURE__ */ f(Mh, { strokeWidth: 1.5 }),
                onClick: () => {
                  h(""), b(n.length - 1);
                }
              }
            )
          ] }) }),
          /* @__PURE__ */ V("div", { className: "p-2 flex items-center justify-between border-t border-border-default", children: [
            /* @__PURE__ */ f(
              Rt,
              {
                variant: "dashed",
                size: "tiny",
                icon: /* @__PURE__ */ f(c7, { className: "h-4 w-4" }),
                onClick: m,
                children: "Add filter"
              }
            ),
            /* @__PURE__ */ f(Rt, { variant: "default", size: "tiny", onClick: m, children: "Apply filter" })
          ] })
        ]
      }
    )
  ] });
}, MR = ({
  customHeader: e,
  columns: n,
  filters: r,
  currentSort: a,
  onSortChange: s,
  onInsertRow: l,
  onInsertColumn: c,
  onImportCsv: d,
  onOpenInsertPanel: h,
  onFilterChange: p,
  selectedCount: m,
  selectedRows: b,
  onBulkDeleteRows: w,
  onBulkCopyRows: g,
  onBulkExportRows: x
}) => {
  const y = m === 1 ? "Delete 1 row" : `Delete ${m} rows`;
  return /* @__PURE__ */ f("div", { className: "flex h-[44px] items-center justify-between bg-dash-sidebar dark:bg-surface-100 px-1.5 py-1.5 gap-2 overflow-x-auto border-b border-border-default", children: e || (m > 0 ? /* @__PURE__ */ V("div", { className: "flex items-center gap-2", children: [
    w && /* @__PURE__ */ f(
      Rt,
      {
        variant: "default",
        size: "tiny",
        icon: /* @__PURE__ */ f(h7, { className: "h-4 w-4" }),
        onClick: w,
        children: y
      }
    ),
    /* @__PURE__ */ V(Dr, { children: [
      /* @__PURE__ */ f(ur, { asChild: !0, children: /* @__PURE__ */ f(
        Rt,
        {
          variant: "default",
          size: "tiny",
          iconRight: /* @__PURE__ */ f(ci, { className: "h-4 w-4" }),
          children: "Copy"
        }
      ) }),
      /* @__PURE__ */ f(dr, { align: "start", className: "w-40", children: /* @__PURE__ */ f(Dn, { onClick: g, children: "Copy selected rows" }) })
    ] }),
    /* @__PURE__ */ V(Dr, { children: [
      /* @__PURE__ */ f(ur, { asChild: !0, children: /* @__PURE__ */ f(
        Rt,
        {
          variant: "default",
          size: "tiny",
          iconRight: /* @__PURE__ */ f(ci, { className: "h-4 w-4" }),
          children: "Export"
        }
      ) }),
      /* @__PURE__ */ f(dr, { align: "start", className: "w-40", children: /* @__PURE__ */ f(Dn, { onClick: x, children: "Export selected rows" }) })
    ] }),
    /* @__PURE__ */ V("span", { className: "text-xs text-foreground-lighter", children: [
      b.length,
      " selected"
    ] })
  ] }) : /* @__PURE__ */ V("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ f(
      kR,
      {
        columns: n,
        filters: r,
        onFilterChange: p
      }
    ),
    /* @__PURE__ */ f(Gg, { columns: n, currentSort: a, onSortChange: s }),
    /* @__PURE__ */ f("div", { className: "h-[20px] w-px border-r border-control" }),
    /* @__PURE__ */ f(
      Ug,
      {
        onInsertRow: l,
        onInsertColumn: c,
        onImportCsv: d,
        onOpenInsertPanel: h
      }
    )
  ] })) });
}, LR = ({ columns: e, filters: n, onFilterChange: r }) => {
  const [a, s] = Ze(e[0]?.key ?? ""), [l, c] = Ze("ilike"), [d, h] = Ze("AND"), [p, m] = Ze(""), b = Pt(() => e.filter((x) => x.key.length > 0), [e]), w = () => {
    if (!r || !a || !p.trim()) return;
    const x = n.length > 0;
    r([
      ...n,
      {
        column: a,
        operator: l,
        value: p.trim(),
        linkOperator: x ? d : void 0
      }
    ]), m("");
  }, g = (x) => {
    r && r(n.filter((y, E) => E !== x));
  };
  return /* @__PURE__ */ V("div", { className: "flex-1 min-w-0 flex items-center gap-2 overflow-hidden", children: [
    /* @__PURE__ */ V("div", { className: "hidden md:flex items-center gap-2 min-w-0", children: [
      /* @__PURE__ */ f(Ju, { className: "h-4 w-4 text-foreground-light shrink-0" }),
      /* @__PURE__ */ f(
        "select",
        {
          value: a,
          onChange: (x) => s(x.target.value),
          className: "h-[26px] rounded-md border border-strong bg-alternative px-2 text-xs text-foreground",
          children: b.map((x) => /* @__PURE__ */ f("option", { value: x.key, children: x.name }, x.key))
        }
      ),
      /* @__PURE__ */ V(
        "select",
        {
          value: l,
          onChange: (x) => c(x.target.value),
          className: "h-[26px] rounded-md border border-strong bg-alternative px-2 text-xs text-foreground",
          children: [
            /* @__PURE__ */ f("option", { value: "eq", children: "equals" }),
            /* @__PURE__ */ f("option", { value: "neq", children: "not equals" }),
            /* @__PURE__ */ f("option", { value: "ilike", children: "contains" }),
            /* @__PURE__ */ f("option", { value: "like", children: "like" }),
            /* @__PURE__ */ f("option", { value: "gt", children: "greater than" }),
            /* @__PURE__ */ f("option", { value: "lt", children: "less than" })
          ]
        }
      ),
      n.length > 0 && /* @__PURE__ */ V(
        "select",
        {
          value: d,
          onChange: (x) => h(x.target.value),
          className: "h-[26px] rounded-md border border-strong bg-alternative px-2 text-xs text-foreground",
          children: [
            /* @__PURE__ */ f("option", { value: "AND", children: "AND" }),
            /* @__PURE__ */ f("option", { value: "OR", children: "OR" })
          ]
        }
      ),
      /* @__PURE__ */ f(
        zo,
        {
          value: p,
          onChange: (x) => m(x.target.value),
          onKeyDown: (x) => {
            x.key === "Enter" && w();
          },
          className: "h-[26px] w-52 text-xs",
          placeholder: "Filter value"
        }
      ),
      /* @__PURE__ */ f(Rt, { variant: "default", size: "tiny", onClick: w, children: "Apply" })
    ] }),
    /* @__PURE__ */ f("div", { className: "flex min-w-0 items-center gap-1 overflow-x-auto", children: n.map((x, y) => /* @__PURE__ */ V(
      "button",
      {
        type: "button",
        onClick: () => g(y),
        className: "h-6 shrink-0 rounded-full border border-strong bg-muted px-2 text-xs text-foreground-light hover:text-foreground",
        children: [
          x.linkOperator ? `${x.linkOperator} ` : "",
          x.column,
          " ",
          x.operator,
          " ",
          x.value
        ]
      },
      `${x.column}-${x.operator}-${y}`
    )) })
  ] });
}, NR = ({
  customHeader: e,
  columns: n,
  filters: r,
  currentSort: a,
  onSortChange: s,
  onInsertRow: l,
  onInsertColumn: c,
  onImportCsv: d,
  onOpenInsertPanel: h,
  onFilterChange: p
}) => /* @__PURE__ */ f("div", { children: /* @__PURE__ */ V("div", { className: "flex h-10 items-center justify-between bg-dash-sidebar dark:bg-surface-100 px-1.5 py-1.5 gap-2 overflow-x-auto border-b border-border-default", children: [
  e || /* @__PURE__ */ f(LR, { columns: n, filters: r, onFilterChange: p }),
  /* @__PURE__ */ V("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ f(Gg, { columns: n, currentSort: a, onSortChange: s }),
    /* @__PURE__ */ f(
      Ug,
      {
        onInsertRow: l,
        onInsertColumn: c,
        onImportCsv: d,
        onOpenInsertPanel: h
      }
    )
  ] })
] }) });
function TR(e, n) {
  return {
    canSelect: !e,
    canDelete: !e && n
  };
}
const AR = ({
  columns: e,
  data: n,
  headerVariant: r = "old",
  currentSort: a,
  filters: s,
  isLoading: l,
  isError: c,
  errorMessage: d,
  emptyMessage: h,
  customHeader: p,
  className: m,
  height: b = "100%",
  rowKeyField: w = "id",
  rowKeyGetter: g,
  readOnly: x = !1,
  defaultPageSize: y = 25,
  pageSizeOptions: E = [10, 25, 50, 100],
  onUpdateRow: R,
  onSortChange: N,
  onInsertRow: L,
  onInsertColumn: M,
  onImportCsv: I,
  onOpenInsertPanel: O,
  onFilterChange: D,
  onBulkDeleteRows: A,
  onBulkCopyRows: z,
  onBulkExportRows: se
}) => {
  const [ue, ce] = Ze(n), [ne, Z] = Ze([]), [le, X] = Ze([]), [ge, pe] = Ze(/* @__PURE__ */ new Set()), [H, P] = Ze(1), [ae, U] = Ze(y), B = TR(x, A !== void 0);
  Wt(() => {
    ce(n);
  }, [n]), Wt(() => {
    !B.canSelect && ge.size > 0 && pe(/* @__PURE__ */ new Set());
  }, [B.canSelect, ge.size]);
  const G = Pt(() => a ?? ne, [a, ne]), J = Pt(() => s ?? le, [s, le]), Q = (Re) => {
    if (g) return g(Re);
    const Ue = Re[w];
    return typeof Ue == "number" || typeof Ue == "string" ? Ue : JSON.stringify(Re);
  }, j = Pt(() => {
    if (G.length === 0) return ue;
    const [Re] = G;
    return [...ue].sort((Ue, zt) => {
      const St = Ue[Re.column], rt = zt[Re.column];
      if (St === rt) return 0;
      if (St == null) return 1;
      if (rt == null) return -1;
      const ut = String(St), st = String(rt), pt = ut.localeCompare(st, void 0, {
        numeric: !0,
        sensitivity: "base"
      });
      return Re.ascending ? pt : -pt;
    });
  }, [ue, G]), ve = Pt(() => {
    if (J.length === 0) return j;
    let Re = [...j];
    return J.forEach((Ue, zt) => {
      const St = (rt) => {
        const ut = rt[Ue.column], st = String(ut ?? "").toLowerCase(), pt = String(Ue.value ?? "").toLowerCase();
        switch (Ue.operator) {
          case "eq":
            return st === pt;
          case "neq":
            return st !== pt;
          case "gt":
            return st > pt;
          case "lt":
            return st < pt;
          default:
            return st.includes(pt);
        }
      };
      if (zt === 0 || Ue.linkOperator !== "OR")
        Re = Re.filter(St);
      else {
        const rt = [...Re];
        j.forEach((ut) => {
          St(ut) && !rt.some((st) => Q(st) === Q(ut)) && rt.push(ut);
        }), Re = rt;
      }
    }), Re;
  }, [J, j]), he = Math.max(1, Math.ceil(ve.length / ae));
  Wt(() => {
    H > he && P(he);
  }, [H, he]);
  const re = Pt(() => {
    const Re = (H - 1) * ae;
    return ve.slice(Re, Re + ae);
  }, [ve, H, ae]), me = Pt(() => ve.filter((Re) => ge.has(Q(Re))), [ve, ge]), ee = (Re) => {
    Z(Re), N?.(Re);
  }, Le = (Re) => {
    X(Re), D?.(Re);
  }, qe = () => {
    me.length !== 0 && A?.(me, {
      resetSelectedRows: () => pe(/* @__PURE__ */ new Set())
    });
  }, vt = async () => {
    me.length !== 0 && (z?.(me), await Uu(JSON.stringify(me, null, 2)));
  }, $t = async () => {
    if (me.length === 0) return;
    se?.(me);
    const Re = Object.keys(me[0] ?? {}).join(","), Ue = me.map(
      (zt) => Object.values(zt).map((St) => `"${String(St ?? "").replaceAll('"', '""')}"`).join(",")
    );
    await Uu([Re, ...Ue].join(`
`));
  };
  return /* @__PURE__ */ V("div", { className: fe("sb-grid h-full flex flex-col min-w-0", m), children: [
    r === "new" ? /* @__PURE__ */ f(
      NR,
      {
        customHeader: p,
        columns: e,
        filters: J,
        currentSort: G,
        onSortChange: ee,
        onInsertRow: x ? void 0 : L,
        onInsertColumn: x ? void 0 : M,
        onImportCsv: x ? void 0 : I,
        onOpenInsertPanel: x ? void 0 : O,
        onFilterChange: Le
      }
    ) : /* @__PURE__ */ f(
      MR,
      {
        customHeader: p,
        columns: e,
        filters: J,
        currentSort: G,
        onSortChange: ee,
        onInsertRow: x ? void 0 : L,
        onInsertColumn: x ? void 0 : M,
        onImportCsv: x ? void 0 : I,
        onOpenInsertPanel: x ? void 0 : O,
        onFilterChange: Le,
        selectedCount: B.canSelect ? ge.size : 0,
        selectedRows: B.canSelect ? me : [],
        onBulkDeleteRows: B.canDelete ? qe : void 0,
        onBulkCopyRows: vt,
        onBulkExportRows: $t
      }
    ),
    /* @__PURE__ */ f(
      GE,
      {
        columns: e,
        data: re,
        rowKeyField: w,
        rowKeyGetter: g,
        readOnly: x,
        height: b,
        isLoading: l,
        isError: c,
        errorMessage: d,
        emptyMessage: h,
        currentSort: G,
        onSortChange: ee,
        selectedRows: B.canSelect ? ge : void 0,
        onSelectedRowsChange: B.canSelect ? pe : void 0,
        onUpdateRow: x ? void 0 : R
      }
    ),
    /* @__PURE__ */ f(
      KE,
      {
        page: H,
        totalPages: he,
        totalRows: ve.length,
        pageSize: ae,
        pageSizeOptions: E,
        onPageChange: P,
        onPageSizeChange: (Re) => {
          P(1), U(Re);
        }
      }
    )
  ] });
};
function OR(e) {
  if (typeof e == "string") return e;
  const n = e.query ? new URLSearchParams(e.query).toString() : "";
  return `${e.pathname ?? ""}${n ? `?${n}` : ""}${e.hash ?? ""}`;
}
const dl = yt(function({
  href: n,
  as: r,
  replace: a,
  scroll: s,
  shallow: l,
  passHref: c,
  prefetch: d,
  locale: h,
  legacyBehavior: p,
  onClick: m,
  target: b,
  ...w
}, g) {
  const [, x] = Ol(), y = _a(), E = OR(n), R = y.hrefs(E[0] === "~" ? E.slice(1) : y.base + E, y);
  function N(L) {
    m?.(L), !L.defaultPrevented && (L.button !== 0 || L.metaKey || L.ctrlKey || L.shiftKey || L.altKey || b && b !== "_self" || /^[a-z][a-z0-9+.-]*:/i.test(E) || (L.preventDefault(), x(E, { replace: a })));
  }
  return /* @__PURE__ */ f("a", { ...w, ref: g, href: R, target: b, onClick: N });
}), Ys = yt(
  ({ className: e, style: n, delayIndex: r = 0, animationDelay: a = 150 }, s) => /* @__PURE__ */ f(
    "div",
    {
      ref: s,
      className: fe("shimmering-loader rounded-sm py-3", e),
      style: {
        ...n,
        animationFillMode: "backwards",
        animationDelay: `${r * a}ms`
      }
    }
  )
);
Ys.displayName = "ShimmeringLoader";
yt(
  (e, n) => {
    const { className: r, ...a } = e;
    return /* @__PURE__ */ f(
      "span",
      {
        ref: n,
        ...a,
        className: fe(
          "w-full flex gap-1 items-center group px-3 text-sm font-normal font-mono uppercase text-lighter tracking-wide group-hover:not-disabled:text-foreground",
          r
        )
      }
    );
  }
);
yt(({ ...e }, n) => /* @__PURE__ */ f(tR, { ref: n, ...e, className: fe("w-full px-2 group", e.className) }));
yt(({ ...e }, n) => /* @__PURE__ */ V(
  jg,
  {
    ref: n,
    ...e,
    className: fe(
      "w-full flex gap-1 items-center group px-3 text-sm font-normal font-mono uppercase text-lighter tracking-wide",
      e.className
    ),
    children: [
      /* @__PURE__ */ f(
        fl,
        {
          className: "transition-all text-foreground-muted group-data-[state=open]:rotate-90",
          size: 16,
          strokeWidth: 1.5
        }
      ),
      /* @__PURE__ */ f("span", { className: "group-hover:not-disabled:text-foreground", children: e.title })
    ]
  }
));
yt(({ ...e }, n) => /* @__PURE__ */ f(
  nR,
  {
    ref: n,
    ...e,
    className: fe("w-full flex flex-col gap-0", e.className)
  }
));
yt(
  (e, n) => /* @__PURE__ */ f("div", { ref: n, ...e, className: fe("h-px bg-border-muted", e.className) })
);
yt(({ className: e, isActive: n, forceHoverState: r, ...a }, s) => /* @__PURE__ */ f(
  dl,
  {
    ref: s,
    ...a,
    "aria-current": n,
    className: fe(
      "text-sm",
      "h-7 pl-3 pr-2",
      "flex items-center justify-between rounded-md group relative",
      n ? "bg-selection" : "hover:bg-surface-200",
      r && "bg-surface-200",
      n ? "text-foreground" : "text-foreground-light hover:text-foreground",
      e
    )
  }
));
const PR = yt(({ isActive: e = !0, forceHoverState: n, isPreview: r, isOpened: a = !0, ...s }, l) => /* @__PURE__ */ V(
  dl,
  {
    ref: l,
    ...s,
    "aria-current": e,
    className: fe(
      um({
        isSelected: e && !r,
        isOpened: a && !r,
        isPreview: r
      }),
      "px-4",
      // forceHoverState && 'bg-surface-200',
      s.className
    ),
    children: [
      !r && e && /* @__PURE__ */ f("div", { className: "absolute left-0 h-full w-0.5 bg-foreground" }),
      s.children
    ]
  }
)), DR = yt(
  (e, n) => /* @__PURE__ */ f("div", { ref: n, ...e, className: fe("flex px-2 gap-2 items-center", e.className) })
), FR = yt(({ children: e, isLoading: n = !1, ...r }, a) => /* @__PURE__ */ V("label", { htmlFor: r.name, className: "relative w-full", children: [
  /* @__PURE__ */ f("span", { className: "sr-only", children: r["aria-labelledby"] }),
  /* @__PURE__ */ f(
    zo,
    {
      ref: a,
      type: "text",
      className: fe(
        "h-[32px] md:h-[28px] w-full",
        "text-base md:text-xs",
        "pl-7",
        "pr-7",
        "w-full",
        "rounded-sm",
        // 'bg-transparent',
        // 'border',
        // 'border-control',
        r.className
      ),
      ...r
    }
  ),
  e,
  n ? /* @__PURE__ */ f(
    Js,
    {
      className: "animate-spin absolute left-2 text-foreground-muted",
      style: { top: 7 },
      size: 14,
      strokeWidth: 1.5
    }
  ) : /* @__PURE__ */ f(
    kh,
    {
      className: "absolute left-2 top-0 bottom-0 my-auto text-foreground-muted",
      size: 14,
      strokeWidth: 1.5
    }
  )
] }));
yt(({ value: e, onValueChange: n, contentClassName: r, triggerClassName: a, ...s }, l) => /* @__PURE__ */ V(Dr, { modal: !1, children: [
  /* @__PURE__ */ V(Ll, { delayDuration: 0, children: [
    /* @__PURE__ */ f(
      ur,
      {
        asChild: !0,
        className: fe(
          "absolute right-1 top-[.4rem] md:top-[.3rem]",
          "text-foreground transition-colors hover:text-foreground data-[state=open]:text-foreground",
          a
        ),
        children: /* @__PURE__ */ f(Nl, { children: /* @__PURE__ */ f(G9, { size: 18, strokeWidth: 1 }) })
      }
    ),
    /* @__PURE__ */ f(Si, { side: "bottom", children: "Sort By" })
  ] }),
  /* @__PURE__ */ f(dr, { side: "bottom", align: "end", className: fe("w-48", r), children: /* @__PURE__ */ f(ZE, { value: e, onValueChange: n, children: s.children }) })
] }));
yt((e, n) => /* @__PURE__ */ f(zg, { ref: n, ...e }));
yt((e, n) => /* @__PURE__ */ V("div", { ref: n, ...e, className: fe("flex flex-col px-2 gap-1 pb-4", e.className), children: [
  /* @__PURE__ */ f(Ys, { className: "w-full h-7 rounded-md", delayIndex: 0 }),
  /* @__PURE__ */ f(Ys, { className: "w-full h-7 rounded-md", delayIndex: 1 }),
  /* @__PURE__ */ f(Ys, { className: "w-full h-7 rounded-md", delayIndex: 2 })
] }));
const WR = yt(({ illustration: e, title: n, description: r, actions: a, ...s }, l) => /* @__PURE__ */ f(
  "div",
  {
    ref: l,
    ...s,
    className: fe(
      "border border-muted bg-surface-100 dark:bg-surface-75 flex flex-col gap-y-3 items-center justify-center rounded-md px-5 py-4",
      s.className
    ),
    children: /* @__PURE__ */ V("div", { className: "w-full flex flex-col gap-y-1 items-center", children: [
      e,
      n && /* @__PURE__ */ f("p", { className: "text-xs text-foreground-light", children: n }),
      r && /* @__PURE__ */ f("p", { className: "text-xs text-foreground-lighter text-center", children: r }),
      a && /* @__PURE__ */ f("div", { className: "mt-2", children: a }),
      s.children
    ] })
  }
));
var Ao = /* @__PURE__ */ ((e) => (e.TABLE = "r", e.VIEW = "v", e.MATERIALIZED_VIEW = "m", e.FOREIGN_TABLE = "f", e.PARTITIONED_TABLE = "p", e))(Ao || {});
const HR = ({
  size: e = 15,
  strokeWidth: n = 1.5,
  className: r
}) => /* @__PURE__ */ f(
  u7,
  {
    size: e,
    strokeWidth: n,
    className: fe("transition-colors", r)
  }
), $R = ({
  type: e,
  size: n = 15,
  strokeWidth: r = 1.5,
  isActive: a,
  sqlSource: s
}) => e === "sql" && s === "logs" ? /* @__PURE__ */ f(
  HR,
  {
    size: n,
    strokeWidth: r,
    className: fe(
      "text-foreground-muted",
      "group-aria-selected:text-foreground",
      "w-4 h-4",
      "-ml-0.5"
    )
  }
) : e === "sql" ? /* @__PURE__ */ f(
  dm,
  {
    size: n,
    className: fe(
      "transition-colors",
      "fill-foreground-muted",
      "group-aria-selected:fill-foreground",
      "w-4 h-4",
      "-ml-0.5"
    ),
    strokeWidth: r
  }
) : e === Ao.TABLE ? /* @__PURE__ */ f(
  f7,
  {
    size: n,
    strokeWidth: r,
    className: fe(
      "text-foreground-muted group-hover:text-foreground-lighter group-aria-selected:text-foreground",
      a && "text-foreground-light",
      "transition-colors"
    )
  }
) : e === "schema" ? /* @__PURE__ */ f(n7, { size: n, strokeWidth: r }) : e === Ao.VIEW ? /* @__PURE__ */ f(
  J9,
  {
    size: n,
    strokeWidth: r,
    className: fe(
      "text-foreground-muted group-hover:text-foreground-lighter",
      a && "text-foreground-lighter",
      "transition-colors"
    )
  }
) : /* @__PURE__ */ f(
  "div",
  {
    className: fe(
      "flex items-center justify-center text-xs h-4 w-4 rounded-[2px] font-bold",
      e === Ao.FOREIGN_TABLE && "text-warning-600/80 dark:text-yellow-900 bg-yellow-500",
      e === Ao.MATERIALIZED_VIEW && "text-purple-1100 bg-purple-500",
      e === Ao.PARTITIONED_TABLE && "text-foreground-light bg-surface-400 dark:bg-border-stronger"
    ),
    children: Object.entries(Ao).find(([, l]) => l === e)?.[0]?.[0]?.toUpperCase()
  }
), zR = ({
  id: e,
  item: n,
  style: r,
  href: a = "#",
  onClick: s
}) => {
  const l = Number(e) === n.id;
  return /* @__PURE__ */ V(
    PR,
    {
      title: n.name,
      style: r,
      id: String(n.id),
      href: a,
      isActive: l,
      isPreview: !1,
      isOpened: l,
      onClick: s,
      className: "pl-4 pr-1",
      children: [
        /* @__PURE__ */ V(Ll, { disableHoverableContent: !0, children: [
          /* @__PURE__ */ f(Nl, { className: "min-w-4", children: /* @__PURE__ */ f($R, { type: n.type, isActive: l }) }),
          /* @__PURE__ */ f(Si, { side: "bottom", children: n.type })
        ] }),
        /* @__PURE__ */ f("div", { className: "relative flex w-full items-center gap-2 truncate overflow-hidden text-ellipsis whitespace-nowrap", children: /* @__PURE__ */ f("span", { className: "truncate text-sm transition", children: n.name }) }),
        l && /* @__PURE__ */ V(Dr, { children: [
          /* @__PURE__ */ f(
            ur,
            {
              asChild: !0,
              className: "text-transparent transition-all group-hover:text-foreground data-[state=open]:text-foreground",
              children: /* @__PURE__ */ f(
                Rt,
                {
                  variant: "text",
                  className: "h-6 w-6",
                  icon: /* @__PURE__ */ f(X9, { size: 14, strokeWidth: 2 }),
                  onClick: (c) => c.preventDefault()
                }
              )
            }
          ),
          /* @__PURE__ */ f(dr, { side: "bottom", align: "start", className: "w-44", children: /* @__PURE__ */ V(
            Dn,
            {
              className: "space-x-2",
              onClick: (c) => {
                c.stopPropagation(), Uu(n.name);
              },
              children: [
                /* @__PURE__ */ f(Y9, { size: 12 }),
                /* @__PURE__ */ f("span", { children: "Copy name" })
              ]
            },
            "copy-name"
          ) })
        ] })
      ]
    }
  );
}, BR = ({
  value: e = "public",
  onChange: n,
  schemas: r = ["public"]
}) => /* @__PURE__ */ V(Dr, { children: [
  /* @__PURE__ */ f(ur, { asChild: !0, children: /* @__PURE__ */ f(
    Rt,
    {
      size: "tiny",
      variant: "default",
      "data-testid": "schema-selector",
      className: "w-full [&>span]:w-full !pr-1 space-x-1",
      iconRight: /* @__PURE__ */ f(K9, { className: "text-foreground-muted", strokeWidth: 2, size: 14 }),
      children: e ? /* @__PURE__ */ V("div", { className: "w-full flex gap-1", children: [
        /* @__PURE__ */ f("p", { className: "text-foreground-lighter", children: "schema" }),
        /* @__PURE__ */ f("p", { className: "text-foreground", children: e === "*" ? "All schemas" : e })
      ] }) : /* @__PURE__ */ f("div", { className: "w-full flex gap-1", children: /* @__PURE__ */ f("p", { className: "text-foreground-lighter", children: "Choose a schema..." }) })
    }
  ) }),
  /* @__PURE__ */ f(dr, { children: r.map((a) => /* @__PURE__ */ f(Dn, { onClick: () => n(a), children: /* @__PURE__ */ f("p", { className: "text-foreground-lighter", children: a }) }, a)) })
] });
function VR() {
  const e = qu(), {
    rows: n,
    columns: r,
    sorts: a,
    entities: s,
    entityActiveId: l,
    filters: c,
    onEntityClick: d,
    entityHref: h,
    onUpdateRow: p,
    onInsertRow: m,
    onInsertColumn: b,
    onImportCsv: w,
    onOpenInsertPanel: g,
    onFilterChange: x,
    onBulkDeleteRows: y,
    setSorts: E,
    setFilters: R,
    schema: N = "public",
    schemas: L = ["public"],
    onChangeSchema: M,
    readOnly: I,
    rowKeyGetter: O
  } = e.editor ?? {};
  return /* @__PURE__ */ V(Fn, { children: [
    /* @__PURE__ */ V(kg, { header: "Table Editor", children: [
      /* @__PURE__ */ f("div", { className: "flex flex-col mx-4 mt-4", children: /* @__PURE__ */ f(
        BR,
        {
          value: N,
          schemas: L,
          onChange: M
        }
      ) }),
      /* @__PURE__ */ V(DR, { className: "mx-2 @container", children: [
        /* @__PURE__ */ f(
          FR,
          {
            name: "filter-search",
            "aria-labelledby": "filter-search",
            placeholder: "Search tables..."
          }
        ),
        /* @__PURE__ */ f(Rt, { variant: "dashed", className: "h-[28px] px-1.5", icon: /* @__PURE__ */ f(Ju, {}) })
      ] }),
      /* @__PURE__ */ f("div", { className: "flex flex-col grow gap-0", children: s?.filter((D) => D.schema === N).map((D) => /* @__PURE__ */ f(
        zR,
        {
          id: l,
          item: D,
          href: h?.(D),
          onClick: () => d?.(D)
        },
        D.id
      )) })
    ] }),
    l !== void 0 ? /* @__PURE__ */ f(
      AR,
      {
        columns: r ?? [],
        data: n ?? [],
        rowKeyField: "id",
        currentSort: a,
        filters: c,
        onSortChange: E,
        onFilterChange: x ?? R,
        onUpdateRow: p,
        onBulkDeleteRows: y,
        onInsertRow: m,
        onInsertColumn: b,
        onImportCsv: w,
        onOpenInsertPanel: g,
        readOnly: I,
        rowKeyGetter: O,
        emptyMessage: "No rows found",
        className: "grow"
      }
    ) : /* @__PURE__ */ f(
      WR,
      {
        className: "m-auto max-w-sm",
        title: "No table selected",
        description: "Choose a table from the sidebar to browse and edit its rows."
      }
    )
  ] });
}
const ah = ({ children: e }) => /* @__PURE__ */ f(Fn, { children: e }), UR = ({
  item: e,
  isActive: n,
  target: r = "_self",
  hoverText: a = "",
  onClick: s
}) => {
  const {
    name: l = "",
    url: c = "",
    icon: d,
    rightIcon: h,
    isExternal: p,
    label: m,
    disabled: b,
    shortcutId: w,
    isLoading: g
  } = e, x = /* @__PURE__ */ f(gi.Item, { icon: d, active: n, onClick: s, children: /* @__PURE__ */ V("div", { className: "flex w-full items-center justify-between gap-1", children: [
    /* @__PURE__ */ V(
      "div",
      {
        className: "flex items-center gap-1 min-w-0 flex-1",
        title: w ? void 0 : a || (typeof l == "string" ? l : ""),
        children: [
          /* @__PURE__ */ f("span", { className: "truncate flex-1 min-w-0", children: l }),
          m !== void 0 && /* @__PURE__ */ f(
            Ml,
            {
              className: "shrink-0",
              variant: m.toLowerCase() === "new" ? "success" : "warning",
              children: m
            }
          )
        ]
      }
    ),
    h && /* @__PURE__ */ f("div", { children: h })
  ] }) });
  if (g)
    return /* @__PURE__ */ f("div", { className: "pointer-events-none", children: x });
  if (b)
    return /* @__PURE__ */ f("div", { className: "opacity-50 pointer-events-none", children: x });
  if (c) {
    if (p) {
      const E = /* @__PURE__ */ f(Rt, { asChild: !0, block: !0, className: "justify-start!", variant: "text", size: "small", icon: d, children: /* @__PURE__ */ f(dl, { href: c, target: "_blank", rel: "noreferrer", children: l }) });
      return w ? /* @__PURE__ */ f(ah, { shortcutId: w, side: "right", delayDuration: 1e3, children: E }) : E;
    }
    const y = /* @__PURE__ */ f(dl, { href: c, className: "group block", target: r, onClick: s, children: x });
    return w ? /* @__PURE__ */ f(ah, { shortcutId: w, side: "right", delayDuration: 1e3, children: y }) : y;
  }
  return x;
}, GR = ({ page: e, menu: n, onItemClick: r }) => /* @__PURE__ */ f("div", { className: "flex flex-col space-y-4", children: /* @__PURE__ */ f(gi, { type: "pills", children: n.map((a, s) => /* @__PURE__ */ V("div", { children: [
  /* @__PURE__ */ f("div", { className: "my-4 space-y-4", children: /* @__PURE__ */ V("div", { className: "md:mx-3", children: [
    /* @__PURE__ */ f(
      gi.Group,
      {
        title: a.title ? /* @__PURE__ */ V("div", { className: "flex flex-col space-y-2 uppercase font-mono", children: [
          /* @__PURE__ */ f("span", { children: a.title }),
          a.isPreview && /* @__PURE__ */ f(Ml, { variant: "warning", children: "Not production ready" })
        ] }) : null
      }
    ),
    /* @__PURE__ */ f("div", { children: a.items.map((l) => {
      const c = l.pages ? l.pages.includes(e ?? "") : e === l.key;
      return /* @__PURE__ */ f(
        UR,
        {
          item: l,
          isActive: c,
          target: l.isExternal ? "_blank" : "_self",
          onClick: r
        },
        l.key
      );
    }) })
  ] }) }),
  s !== n.length - 1 && /* @__PURE__ */ f("div", { className: "h-px w-[calc(100%-1.5rem)] mx-auto md:w-full bg-border-overlay" })
] }, a.key || a.title)) }) });
function KR() {
  const [e] = Ol();
  return /* @__PURE__ */ V(Fn, { children: [
    /* @__PURE__ */ f(kg, { header: "Authentication", children: /* @__PURE__ */ f(
      GR,
      {
        page: e,
        menu: [
          {
            title: "Manage",
            items: [
              {
                name: "Users",
                key: "/users",
                url: "/users"
              }
            ]
          },
          {
            title: "Configuration",
            items: [
              {
                name: "Policies",
                key: "/policies",
                url: "/policies",
                disabled: !0
              }
            ]
          }
        ]
      }
    ) }),
    /* @__PURE__ */ f("div", { className: "grow", children: /* @__PURE__ */ V(Rg, { children: [
      /* @__PURE__ */ f(si, { path: "/users", component: ZR }),
      /* @__PURE__ */ f(si, { path: "*", children: "empty" })
    ] }) })
  ] });
}
function ZR() {
  return /* @__PURE__ */ V("div", { className: "grow", children: [
    /* @__PURE__ */ f(Ig, { children: "Users" }),
    /* @__PURE__ */ f("div", { className: "flex flex-col grow gap-3", children: "what" })
  ] });
}
function jR(e) {
  return e?.replace(/\/+$/, "");
}
function aI(e) {
  return /* @__PURE__ */ f(ch.Provider, { value: e, children: /* @__PURE__ */ f(_g, { base: jR(e.basePath), children: /* @__PURE__ */ f(qR, {}) }) });
}
function qR() {
  const e = qu(), [n, r] = Ol(), a = e.projectName ?? "Default Project";
  return Wt(() => {
    n === "/" && r("/editor");
  }, [n]), /* @__PURE__ */ f(
    qS,
    {
      projectName: a,
      nonProdLabel: e.header?.nonProdLabel,
      backHref: e.header?.backHref,
      backLabel: e.header?.backLabel,
      children: /* @__PURE__ */ V(Rg, { children: [
        /* @__PURE__ */ f(si, { path: "/editor/:table?", children: /* @__PURE__ */ f(VR, {}) }),
        e.auth?.enabled && /* @__PURE__ */ f(si, { path: "/auth", nest: !0, children: /* @__PURE__ */ f(KR, {}) }),
        /* @__PURE__ */ f(si, { children: /* @__PURE__ */ f("div", { className: "flex items-center justify-center w-full opacity-50", children: "Not found" }) })
      ] })
    }
  );
}
function YR(e) {
  const n = e.toLowerCase();
  return n.includes("json") ? "json" : n === "boolean" || n === "bool" ? "boolean" : /^(int|integer|bigint|smallint|tinyint|serial|bigserial)/.test(n) || /^(real|float|double|numeric|decimal)/.test(n) ? "number" : "text";
}
function iI(e) {
  const n = [];
  for (const r of e) {
    if (r.is_identity) continue;
    const a = r.type?.toLowerCase?.() ?? "text";
    n.push({
      name: r.name,
      dbType: r.type,
      nullable: r.nullable,
      hasDefault: r.default_value != null,
      defaultHint: r.default_value,
      valueKind: YR(a)
    });
  }
  return n;
}
function XR(e) {
  return e.trim();
}
function sI(e, n) {
  const r = {}, a = {};
  for (const s of n) {
    const l = e[s.name] ?? "", c = XR(l);
    if (c === "") {
      !s.nullable && !s.hasDefault && (r[s.name] = "Required");
      continue;
    }
    try {
      if (s.valueKind === "boolean")
        a[s.name] = c === "true" || c === "1" || c === "on";
      else if (s.valueKind === "number") {
        const d = s.dbType.toLowerCase();
        if (/^(int|integer|bigint|smallint|tinyint|serial|bigserial)/.test(d)) {
          const h = Number.parseInt(c, 10);
          if (Number.isNaN(h)) {
            r[s.name] = "Invalid integer";
            continue;
          }
          a[s.name] = h;
        } else {
          const h = Number.parseFloat(c);
          if (Number.isNaN(h)) {
            r[s.name] = "Invalid number";
            continue;
          }
          a[s.name] = h;
        }
      } else s.valueKind === "json" ? a[s.name] = JSON.parse(c) : a[s.name] = c;
    } catch {
      r[s.name] = s.valueKind === "json" ? "Invalid JSON" : "Invalid value";
    }
  }
  return { payload: a, errors: r };
}
function lI(e) {
  const n = {};
  for (const r of e)
    r.valueKind === "boolean" ? n[r.name] = r.nullable ? "" : "false" : n[r.name] = "";
  return n;
}
const Us = "flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-6 sm:py-0 py-2", JR = "text-sm text-foreground sm:mt-2 sm:w-44 sm:shrink-0 font-normal leading-snug", Gs = "min-w-0 flex-1 space-y-1";
function ih(e) {
  return !e.hasDefault || e.defaultHint == null ? void 0 : `Default: ${typeof e.defaultHint == "string" && e.defaultHint.length > 80 ? `${e.defaultHint.slice(0, 77)}…` : String(e.defaultHint)}`;
}
function QR({
  field: e,
  value: n,
  error: r,
  onChange: a
}) {
  const s = /* @__PURE__ */ V("label", { htmlFor: `insert-${e.name}`, className: JR, children: [
    /* @__PURE__ */ V("span", { className: "font-mono text-xs text-code", children: [
      e.name,
      e.nullable ? /* @__PURE__ */ f("span", {}) : /* @__PURE__ */ f("span", { className: "ml-1 opacity-50", children: "*" })
    ] }),
    /* @__PURE__ */ f("span", { className: "block text-foreground-lighter text-xs mt-0.5", children: e.dbType })
  ] }), l = r ? `insert-${e.name}-err` : void 0;
  if (e.valueKind === "boolean") {
    if (e.nullable)
      return /* @__PURE__ */ V("div", { className: Us, children: [
        s,
        /* @__PURE__ */ V("div", { className: Gs, children: [
          /* @__PURE__ */ V(
            "select",
            {
              id: `insert-${e.name}`,
              "aria-invalid": !!r,
              "aria-describedby": l,
              value: n,
              onChange: (h) => a(e.name, h.target.value),
              className: fe(
                "flex h-10 w-full rounded-md border border-control bg-foreground/[.026] px-3 py-2 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background-control focus-visible:ring-offset-2 focus-visible:ring-offset-foreground-muted",
                r && "border-destructive-400 bg-destructive-200/30"
              ),
              children: [
                /* @__PURE__ */ f("option", { value: "", children: "Default / null" }),
                /* @__PURE__ */ f("option", { value: "true", children: "true" }),
                /* @__PURE__ */ f("option", { value: "false", children: "false" })
              ]
            }
          ),
          r ? /* @__PURE__ */ f("p", { id: l, className: "text-sm text-destructive-600", children: r }) : null
        ] })
      ] });
    const d = n === "true" || n === "1";
    return /* @__PURE__ */ V("div", { className: Us, children: [
      s,
      /* @__PURE__ */ V("div", { className: Gs, children: [
        /* @__PURE__ */ V("label", { className: "flex cursor-pointer items-center gap-2 sm:mt-2", children: [
          /* @__PURE__ */ f(
            "input",
            {
              id: `insert-${e.name}`,
              type: "checkbox",
              checked: d,
              onChange: (h) => a(e.name, h.target.checked ? "true" : "false"),
              className: fe(
                "h-4 w-4 rounded border border-control bg-foreground/[.026]",
                "text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background-control focus-visible:ring-offset-2 focus-visible:ring-offset-foreground-muted"
              )
            }
          ),
          /* @__PURE__ */ f("span", { className: "text-sm text-foreground-light", children: d ? "true" : "false" })
        ] }),
        r ? /* @__PURE__ */ f("p", { id: l, className: "text-sm text-destructive-600", children: r }) : null
      ] })
    ] });
  }
  if (e.valueKind === "json")
    return /* @__PURE__ */ V("div", { className: Us, children: [
      s,
      /* @__PURE__ */ V("div", { className: Gs, children: [
        /* @__PURE__ */ f(
          "textarea",
          {
            id: `insert-${e.name}`,
            "aria-invalid": !!r,
            "aria-describedby": l,
            rows: 5,
            value: n,
            placeholder: ih(e) ?? "{}",
            onChange: (d) => a(e.name, d.target.value),
            className: fe(
              "flex min-h-[120px] w-full rounded-md border border-control bg-foreground/[.026] px-3 py-2 text-sm font-mono",
              "placeholder:text-foreground-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background-control focus-visible:ring-offset-2 focus-visible:ring-offset-foreground-muted",
              r && "border-destructive-400 bg-destructive-200/30"
            )
          }
        ),
        r ? /* @__PURE__ */ f("p", { id: l, className: "text-sm text-destructive-600", children: r }) : null
      ] })
    ] });
  const c = e.valueKind === "number" ? "number" : "text";
  return /* @__PURE__ */ V("div", { className: Us, children: [
    s,
    /* @__PURE__ */ V("div", { className: Gs, children: [
      /* @__PURE__ */ f(
        zo,
        {
          id: `insert-${e.name}`,
          type: c,
          inputMode: e.valueKind === "number" ? "decimal" : void 0,
          "aria-invalid": !!r,
          "aria-describedby": l,
          value: n,
          placeholder: ih(e),
          onChange: (d) => a(e.name, d.target.value)
        }
      ),
      r ? /* @__PURE__ */ f("p", { id: l, className: "text-sm text-destructive-600", children: r }) : null
    ] })
  ] });
}
function cI({
  fields: e,
  values: n,
  errors: r = {},
  onChange: a,
  onSubmit: s,
  className: l
}) {
  function c(d, h) {
    a({ ...n, [d]: h });
  }
  return e.length === 0 ? /* @__PURE__ */ f("p", { className: "text-sm text-foreground-light py-2", children: "No editable columns (all columns may be generated by the database)." }) : /* @__PURE__ */ V(
    "form",
    {
      className: fe("space-y-2", l),
      noValidate: !0,
      onSubmit: (d) => {
        d.preventDefault(), s?.();
      },
      children: [
        /* @__PURE__ */ f("button", { type: "submit", tabIndex: -1, className: "sr-only", "aria-hidden": "true", children: "Submit" }),
        /* @__PURE__ */ f("div", { className: "space-y-8 py-4", children: e.map((d) => /* @__PURE__ */ f(
          QR,
          {
            field: d,
            value: n[d.name] ?? "",
            error: r[d.name],
            onChange: c
          },
          d.name
        )) })
      ]
    }
  );
}
export {
  cI as InsertRowForm,
  aI as Studio,
  iI as buildInsertRowFormFields,
  lI as initialInsertFormValues,
  sI as parseInsertValues
};
