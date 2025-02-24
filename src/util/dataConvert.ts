export function dataToBase64(data: Uint8Array) {
  return btoa(String.fromCharCode.apply(null, data as any));
}
export function dataToHex(data: Uint8Array) {
  return Array.from(data, (i) => i.toString(16).padStart(2, "0")).join("");
}

export function encodeUTF16LE(str: string) {
  // Allocate an ArrayBuffer with enough bytes (2 bytes per character)
  const buffer = new ArrayBuffer(str.length * 2);
  const view = new DataView(buffer);

  // Write each character's UTF-16 code unit into the buffer in little-endian order.
  for (let i = 0; i < str.length; i++) {
    view.setUint16(i * 2, str.charCodeAt(i), true); // 'true' forces little-endian
  }

  // Return a Uint8Array view of the buffer for byte-level operations.
  return new Uint8Array(buffer);
}
export function decodeUTF16LE(bytes: Uint8Array) {
  // Create a DataView on the provided Uint8Array. This handles offsets correctly.
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let result = "";

  // Read 2 bytes at a time in little-endian order and convert them to characters.
  for (let i = 0; i < view.byteLength; i += 2) {
    result += String.fromCharCode(view.getUint16(i, true)); // 'true' for little-endian
  }

  return result;
}
