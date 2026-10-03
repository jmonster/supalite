import { createHash } from "node:crypto";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "node_modules/@supabase/lite");
export const baseline = {
  name: "@supabase/lite",
  version: "0.11.0",
  integrity:
    "sha512-F7Z/um+cAedEECNhVffMM04Rl25pmJUiJp3jqW4tKmij2A+Us24r3CyIRjeuhW+fNnTvJQVIshNn6tDb3oB52g==",
  indexSha256:
    "f5cf75c6bcb10cec0c175cd4a8237b831368f7dbfc77e12652b965dde6a5685d",
};
const pkg = JSON.parse(await readFile(resolve(source, "package.json"), "utf8"));
const lock = JSON.parse(
  await readFile(resolve(root, "package-lock.json"), "utf8"),
);
const input = await readFile(resolve(source, "dist/index.js"), "utf8");
const checksum = createHash("sha256").update(input).digest("hex");
if (
  pkg.name !== baseline.name ||
  pkg.version !== baseline.version ||
  checksum !== baseline.indexSha256 ||
  lock.packages["node_modules/@supabase/lite"]?.integrity !== baseline.integrity
) {
  throw new Error(
    "Unsupported baseline: expected the exact published @supabase/lite 0.11.0 artifact. Refusing to patch.",
  );
}

// Surgical seams: retain raw containment literals; dispatch positive/NOT
// predicates; preserve repeated filters and existing AND groups. All untouched bytes remain original.
const patches = [
  ['return tm(t,{...r,dialect:e,db:s.db??r.db,introspection:s.introspection,schema:s.schema,requestSchema:s.requestSchema})}', 'return __jsonbCheck(tm(t,{...r,dialect:e,db:s.db??r.db,introspection:s.introspection,schema:s.schema,requestSchema:s.requestSchema}),e)}'],
  ["n[r]?Object.assign(n[r],i):n[r]=i;", "__jsonbMerge(n,r,i);"],
  [
    "n[`$${t}`]=i;return",
    'n[`$${t}`]=t==="and"&&Array.isArray(n.$and)?[...n.$and,...i]:i;return',
  ],
  [
    "return n?{$not:{[a]:u}}:{[a]:u}",
    "return n?{$not:__jsonbMark({[a]:u},a,i)}:__jsonbMark({[a]:u},a,i)",
  ],
  [
    "for(let[l,c]of Object.entries(o)){if(xt(c))",
    "for(let[l,c]of Object.entries(o)){let __j=__jsonbTry(s,l,c,n,o,{parsePath:_n,reference:fe});if(__j){r.push(__j);continue}if(xt(c))",
  ],
  [
    "for(let[f,d]of Object.entries(u))if(a)",
    "for(let[f,d]of Object.entries(u))if(__jsonbTry(s,f,d,n,u,{parsePath:_n,reference:fe})){r.push(t.not(__jsonbTry(s,f,d,n,u,{parsePath:_n,reference:fe})))}else if(a)",
  ],
];
let output = input;
for (const [from, to] of patches) {
  if (output.split(from).length !== 2)
    throw new Error(`Expected exactly one integration seam: ${from}`);
  output = output.replace(from, () => to);
}
const adapterUrl = pathToFileURL(resolve(root, "dist/lite-adapter.js")).href;
const mergerUrl = pathToFileURL(resolve(root, "dist/merge-filters.js")).href;
output = `// Modified by supalite-jsonb-parity: SQLite JSONB containment integration.\nimport {markJsonbLiteral as __jsonbMark,tryJsonbContainment as __jsonbTryImpl,assertJsonbQueryLimits as __jsonbQueryLimits} from ${JSON.stringify(adapterUrl)};\nimport {mergeFilter as __jsonbMerge} from ${JSON.stringify(mergerUrl)};\nfunction __jsonbError(error){if(error?.code==="54000")throw new Ie({httpStatus:400,code:error.code,message:error.message,details:null,hint:"Reduce the JSONB filter size or depth."});throw error}\nfunction __jsonbTry(...args){try{return __jsonbTryImpl(...args)}catch(error){__jsonbError(error)}}\nfunction __jsonbCheck(query,dialect){if(dialect==="sqlite"){try{__jsonbQueryLimits(query.compile())}catch(error){__jsonbError(error)}}return query}\n${output}`;
for (const flavor of ["baseline", "patched"]) {
  const target = resolve(
    root,
    ".generated",
    flavor,
    "node_modules/@supabase/lite",
  );
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
  if (flavor === "patched")
    await writeFile(resolve(target, "dist/index.js"), output);
}
await writeFile(
  resolve(root, ".generated/provenance.json"),
  JSON.stringify(
    {
      ...baseline,
      description:
        "Reconstructed development harness over the published npm distribution; not recovered upstream TypeScript sources.",
      patchedIndexSha256: createHash("sha256").update(output).digest("hex"),
      patches: patches.length,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Prepared exact baseline and patched copy (${patches.length} checked planner seams)`,
);
