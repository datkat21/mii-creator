export const numToHex = (num: number) =>
  "#" + num.toString(16).padStart(6, "0");

/**
 * Parses a string contaning either hex or Base64 representation
 * of bytes into a Uint8Array, stripping spaces.
 * @param {string} text - The input string, which can be either hex or Base64.
 * @returns {Uint8Array} The parsed Uint8Array.
 */
export function parseHexOrB64ToUint8Array(text: string) {
  let inputData;
  // Decode it to a Uint8Array whether it's hex or Base64
  const textData = stripSpaces(text);
  // Check if it's base 16 exclusively, otherwise assume Base64
  if (/^[0-9a-fA-F]+$/.test(textData)) {
    inputData = hexToUint8Array(textData);
  } else {
    inputData = base64ToUint8Array(textData);
  }
  return inputData;
}

/**
 * Removes all spaces from a string.
 * @param {string} str - The input string.
 * @returns {string} The string without spaces.
 */
function stripSpaces(str: string) {
  return str.replace(/\s+/g, "");
}

/**
 * Converts a hexadecimal string to a Uint8Array.
 * @param {string} hex - The hexadecimal string.
 * @returns {Uint8Array} The converted Uint8Array.
 */
function hexToUint8Array(hex: string) {
  const match = hex.match(/.{1,2}/g);
  // If match returned null, use an empty array.
  const arr = (match ? match : []).map(function (byte) {
    return parseInt(byte, 16);
  });
  return new Uint8Array(arr);
}

/**
 * Converts a Base64 or Base64-URL encoded string to a Uint8Array.
 * @param {string} base64 - The Base64-encoded string.
 * @returns {Uint8Array} The converted Uint8Array.
 */
function base64ToUint8Array(base64: string) {
  // Replace URL-safe Base64 characters
  const normalizedBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");
  // Custom function to pad the string with '=' manually
  /**
   * @param {string} str - The Base64 string to pad.
   * @returns {string} The padded Base64 string.
   */
  function padBase64(str: string) {
    while (str.length % 4 !== 0) {
      str += "=";
    }
    return str;
  }
  // Add padding if necessary.
  const paddedBase64 = padBase64(normalizedBase64);
  const binaryString = atob(paddedBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts a Uint8Array to a Base64 string.
 * @param {Array<number>} data - The Uint8Array to convert. TODO: check if Uint8Array truly can be used
 * @returns {string} The Base64-encoded string.
 */
function uint8ArrayToBase64(data: number[]) {
  return btoa(String.fromCharCode.apply(null, data));
}
