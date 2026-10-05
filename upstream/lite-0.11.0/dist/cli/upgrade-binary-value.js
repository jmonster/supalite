/** Serialize binary driver values without treating their bytes as JSON. */
export function formatBinaryValue(value) {
  let bytes;
  if (value instanceof ArrayBuffer) {
    bytes = new Uint8Array(value);
  } else if (ArrayBuffer.isView(value)) {
    // Buffer, typed-array slices, and DataView can share a larger allocation.
    bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  } else {
    return undefined;
  }
  let hex = "";
  for (const byte of bytes) hex += byte.toString(16).padStart(2, "0");
  return `decode('${hex}', 'hex')`;
}
