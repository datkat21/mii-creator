export const ArrayNum = (number: number) => Array.from(Array(number).keys());
export const RandomInt = (max: number) => Math.floor(Math.random() * max);

export function randomizeUint8Array(arr: Uint8Array) {
  if (!(arr instanceof Uint8Array)) {
    throw new TypeError("Expected a Uint8Array");
  }

  function randomize() {
    // Fallback to Math.random (not cryptographically secure)
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }

  if (typeof window !== "undefined") {
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(arr);
    } else randomize();
  } else {
    randomize();
  }
  return arr;
}
