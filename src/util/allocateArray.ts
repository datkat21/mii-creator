export function allocateArray(size: number, data: Uint8Array) {
  if (data.length > size)
    throw new RangeError(
      `Tried to fill ${data.length} bytes into a ${size}-byte array`
    );

  let array = new Uint8Array(size);

  // not sure how else to fill the data and remain 0's
  for (var i = 0; i < data.length; i++) {
    array[i] = data[i];
  }

  return array;
}
