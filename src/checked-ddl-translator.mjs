import { createHash } from 'node:crypto';

// Canonicalize all JSON-safe options; unknown options affect the key too.
function canonical(value, seen = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value || typeof value !== 'object' || seen.has(value) ||
      (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype)) {
    throw new Error('Translation artifacts require acyclic JSON-safe data');
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Object.getOwnPropertySymbols(value).length ||
      Object.entries(descriptors).some(([key, descriptor]) =>
        !(Array.isArray(value) && key === 'length') && (!descriptor.enumerable || !('value' in descriptor)))) {
    throw new Error('Translation artifacts require plain JSON data properties');
  }
  seen.add(value);
  let result;
  if (Array.isArray(value)) {
    if (Object.keys(value).length !== value.length ||
        Object.keys(value).some((key, index) => key !== String(index))) {
      throw new Error('Translation artifacts require dense JSON arrays');
    }
    result = value.map((item) => canonical(item, seen));
  } else {
    result = Object.create(null);
    for (const key of Object.keys(value).sort()) {
      if (value[key] !== undefined) result[key] = canonical(value[key], seen);
    }
  }
  seen.delete(value);
  return result;
}
const digest = (value) => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
export function translationInputHash(ddl, options) {
  if (typeof ddl !== 'string' || !options?.introspection) {
    throw new Error('Pretranslated DDL requires the exact SQL and current schema introspection');
  }
  return digest({ ddl, options });
}

export function translationRecord(ddl, options, result) {
  return {
    inputHash: translationInputHash(ddl, options),
    resultHash: digest(result),
    result,
  };
}

/**
 * Opt-in Node helper for trusted, build-time Lite translation artifacts.
 * Exact SQL, strictness, live schema, and runtime fingerprints must match.
 * A miss fails closed: it never substitutes stale metadata or invokes a parser.
 */
export function createCheckedDdlTranslator(artifact, runtimeFingerprint) {
  if (artifact?.formatVersion !== 1 || typeof runtimeFingerprint !== 'string' ||
      artifact.runtimeFingerprint !== runtimeFingerprint || !Array.isArray(artifact.entries)) {
    throw new Error('Pretranslated DDL artifact/runtime mismatch; rebuild the artifact');
  }
  const records = new Map();
  for (const entry of artifact.entries) {
    if (!/^[a-f0-9]{64}$/.test(entry?.inputHash ?? '') || records.has(entry.inputHash) ||
        entry.resultHash !== digest(entry.result) || typeof entry.result?.ddl !== 'string' ||
        !Array.isArray(entry.result?.rls?.tables) || !Array.isArray(entry.result?.rls?.policies) ||
        !entry.result?.schema || typeof entry.result.schema !== 'object' || Array.isArray(entry.result.schema)) {
      throw new Error('Invalid pretranslated DDL record; rebuild the artifact');
    }
    // Own the metadata: neither caller mutation nor Lite's rehydration changes this cache.
    records.set(entry.inputHash, structuredClone(entry.result));
  }
  return async (ddl, options) => {
    const result = records.get(translationInputHash(ddl, options));
    if (!result) throw new Error('Pretranslated DDL cache miss: SQL, strictness, or live schema changed; rebuild the artifact');
    return structuredClone(result);
  };
}
