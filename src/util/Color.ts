// Helper function to convert from sRGB Linear to sRGB
export function sRGB(c: number) {
  if (c <= 0.0031308) {
    return c * 12.92;
  } else {
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }
}

export function sRGBToLinear(srgb: number) {
  return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}
