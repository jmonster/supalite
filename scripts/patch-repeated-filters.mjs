// Repeated query parameters remain conjunctive, including existing AND groups.
const patches = [
  [
    "n[r]?Object.assign(n[r],i):n[r]=i;",
    "__mergeFilter(n,r,i);"
  ],
  [
    "n[`$${t}`]=i;return",
    "n[`$${t}`]=t===\"and\"&&Object.hasOwn(n,\"$and\")&&Array.isArray(n.$and)?[...n.$and,...i]:i;return"
  ]
];

export function patchRepeatedFilters(input, mergerUrl) {
  let output = input;
  for (const [from, to] of patches) {
    if (output.split(from).length !== 2)
      throw new Error(`Expected exactly one repeated-filter integration seam: ${from}`);
    output = output.replace(from, () => to);
  }
  return `// Modified: preserve repeated PostgREST filters.\nimport {mergeFilter as __mergeFilter} from ${JSON.stringify(mergerUrl)};\n${output}`;
}
