// These convert the actual indices into the positions used on the UI

import Html from "@datkat21/html";
import { FeatureSetType } from "../ui/components/MiiPagedFeatureSet";

// for example to be used with the CSS order property.
export const MiiEyeTable: Record<number, number> = {
  // RealValue: DisplayedPosition
  0: 2,
  1: 6,
  2: 0,
  3: 42,
  4: 1,
  5: 24,
  6: 29,
  7: 36,
  8: 3,
  9: 16,
  10: 45
};
export const MiiHairTable: Record<number, number> = {
  33: 0,
  47: 1,
  40: 2,
  37: 3,
  32: 4,
  107: 5,
  48: 6,
  51: 7,
  55: 8,
  70: 9,
  44: 10,
  66: 11,
  52: 12,
  50: 13,
  38: 14,
  49: 15,
  43: 16,
  31: 17,
  56: 18,
  68: 19,
  62: 20,
  115: 21,
  76: 22,
  119: 23,
  64: 24,
  81: 25,
  116: 26,
  121: 27,
  22: 28,
  58: 29,
  60: 30,
  87: 31,
  125: 32,
  117: 33,
  73: 34,
  75: 35,
  42: 36,
  89: 37,
  57: 38,
  54: 39,
  80: 40,
  34: 41,
  23: 42,
  86: 43,
  88: 44,
  118: 45,
  39: 46,
  36: 47,
  45: 48,
  67: 49,
  59: 50,
  65: 51,
  41: 52,
  30: 53,
  12: 54,
  16: 55,
  10: 56,
  82: 57,
  128: 58,
  129: 59,
  14: 60,
  95: 61,
  105: 62,
  100: 63,
  6: 64,
  20: 65,
  93: 66,
  102: 67,
  27: 68,
  4: 69,
  17: 70,
  110: 71,
  123: 72,
  8: 73,
  106: 74,
  72: 75,
  3: 76,
  21: 77,
  0: 78,
  98: 79,
  63: 80,
  90: 81,
  11: 82,
  120: 83,
  5: 84,
  74: 85,
  108: 86,
  94: 87,
  124: 88,
  25: 89,
  99: 90,
  69: 91,
  35: 92,
  13: 93,
  122: 94,
  113: 95,
  53: 96,
  24: 97,
  85: 98,
  83: 99,
  71: 100,
  131: 101,
  96: 102,
  101: 103,
  29: 104,
  7: 105,
  15: 106,
  112: 107,
  79: 108,
  1: 109,
  109: 110,
  127: 111,
  91: 112,
  26: 113,
  61: 114,
  103: 115,
  2: 116,
  77: 117,
  18: 118,
  92: 119,
  84: 120,
  9: 121,
  19: 122,
  130: 123,
  97: 124,
  104: 125,
  46: 126,
  78: 127,
  28: 128,
  114: 129,
  126: 130,
  111: 131
};

export const MiiSwitchColorTable = [
  91, 80, 0, 81, 95, 60, 72, 74, 90, 93, 2, 61, 33, 44, 70, 4, 31, 73, 94, 83,
  5, 6, 86, 3, 1, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
  45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 62, 63, 64, 65,
  66, 67, 68, 69, 71, 75, 76, 77, 78, 79, 82, 84, 85, 87, 88, 89, 92, 96, 97,
  98, 99
];

export const MiiSwitchSkinColorTable: Record<number, number> = {
  0: 0,
  7: 1,
  1: 2,
  4: 3,
  5: 4,
  6: 5,
  3: 6,
  2: 7,
  8: 8,
  9: 9
};

export function rearrangeArray(
  array: any[],
  lookupTable: Record<number, number>
): any[] {
  let rearrangedArray: any[] = [];

  for (const index in lookupTable) {
    const newIndex = lookupTable[index];
    rearrangedArray[newIndex] = array[parseInt(index)];
  }

  rearrangedArray = rearrangedArray.filter((i) => i !== undefined);

  // console.log("rearranged:", rearrangedArray);

  return rearrangedArray;
}

export const makeSeparator = () => new Html("div").class("separator");
export const makeSeparatorFSI: () => any = () => ({
  type: FeatureSetType.Misc,
  html: new Html("div").class("separator"),
  select() {}
});
export const makeSeparatorGapFSI: () => any = () => ({
  type: FeatureSetType.Misc,
  html: new Html("div").class("separator-gap"),
  select() {}
});
export const makeSeparatorGapThinFSI: () => any = () => ({
  type: FeatureSetType.Misc,
  html: new Html("div").class("separator-gap-thin"),
  select() {}
});
export const makeSeparatorGapThin = () =>
  new Html("div").class("separator-gap-thin");
export const makeHeaderFSI = (text: string) => ({
  type: FeatureSetType.Misc,
  html: new Html("div").text(text),
  select() {}
});
