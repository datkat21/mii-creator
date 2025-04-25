// These convert the actual indices into the positions used on the UI

import Html from "@datkat21/html";
import { FeatureSetType } from "../ui/components/MiiPagedFeatureSet";

// for example to be used with the CSS order property.
export const MiiEyeTable: number[][] = [
  // The real value is looked up and displayed here
  [2, 4, 0, 8, 39, 17, 1, 26, 16, 15, 27, 20],
  [33, 11, 19, 32, 9, 12, 23, 34, 21, 25, 40, 35],
  [5, 41, 13, 36, 37, 6, 24, 30, 31, 18, 28, 46],
  [7, 44, 38, 42, 45, 29, 3, 43, 22, 10, 14, 47],
  [48, 49, 50, 53, 59, 56, 54, 58, 57, 55, 51, 52]
];

export const MiiEyebrowTable: number[][] = [
  [6, 0, 12, 1, 9, 19, 7, 21, 8, 17, 5, 4],
  [11, 10, 2, 3, 14, 20, 15, 13, 22, 18, 16, 23]
];
export const MiiMouthTable: number[][] = [
  [23, 1, 19, 21, 22, 5, 0, 8, 10, 16, 6, 13],
  [7, 9, 2, 17, 3, 4, 15, 11, 20, 18, 14, 12],
  [27, 30, 24, 25, 29, 28, 26, 35, 31, 34, 33, 32]
];
export const MiiNoseTable: number[][] = [
  [1, 10, 2, 3, 6, 0, 5, 4, 8, 9, 7, 11],
  [13, 14, 12, 17, 16, 15]
];

export const MiiHairTable: number[][] = [
  [33, 47, 40, 37, 32, 107, 48, 51, 55, 70, 44, 66],
  [52, 50, 38, 49, 43, 31, 56, 68, 62, 115, 76, 119],
  [64, 81, 116, 121, 22, 58, 60, 87, 125, 117, 73, 75],
  [42, 89, 57, 54, 80, 34, 23, 86, 88, 118, 39, 36],
  [45, 67, 59, 65, 41, 30, 12, 16, 10, 82, 128, 129],
  [14, 95, 105, 100, 6, 20, 93, 102, 27, 4, 17, 110],
  [123, 8, 106, 72, 3, 21, 0, 98, 63, 90, 11, 120],
  [5, 74, 108, 94, 124, 25, 99, 69, 35, 13, 122, 113],
  [53, 24, 85, 83, 71, 131, 96, 101, 29, 7, 15, 112],
  [79, 1, 109, 127, 91, 26, 61, 103, 2, 77, 18, 92],
  [84, 9, 19, 130, 97, 104, 46, 78, 28, 114, 126, 111]
];

export const MiiSwitchColorTable = [
  [2, 24, 10, 23, 15, 20, 21, 25, 26, 27],
  [28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
  [38, 39, 40, 41, 42, 43, 44, 45, 46, 47],
  [48, 16, 49, 12, 50, 51, 52, 53, 54, 55],
  [56, 57, 58, 59, 13, 60, 61, 62, 63, 64],
  [65, 66, 67, 68, 69, 70, 71, 72, 73, 74],
  [5, 11, 75, 76, 77, 78, 79, 80, 81, 82],
  [14, 83, 6, 17, 7, 84, 85, 86, 87, 88],
  [1, 3, 89, 19, 90, 91, 22, 92, 93, 94],
  [8, 0, 95, 9, 18, 4, 96, 97, 98, 99]
];

export const MiiSwitchSkinColorTable: number[][] = [
  [0, 7, 1, 4, 5],
  [6, 3, 2, 8, 9]
];

// Converted from tables found in FFL
// FFLiCharInfo.cpp:269
// and checked w/ Mii Studio, seems OK

// subtracted by 4
export const MiiEyeRotationGroups: number[] = [
  -1, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, 0, -1, -1, 0, 0, 0, -1, -1, 0, -1, 0,
  -1, -1, 0, -1, 0, 0, -1, 0, 0, 0, -1, -1, -1, 0, 0, -1, -1, -1, 0, 0, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, -1, 0, 0, -1
];

// subtracted by 6
export const MiiEyebrowRotationGroups: number[] = [
  0, 0, -1, 1, 0, 1, 0, 1, -2, 1, 0, 2, -1, -1, 0, 0, 1, 1, 0, 0, -1, 0, 1, 0
];

// Extracted from Mii Studio - whether to allow hair flipping in UI or not based on if the hair is asymmetrical
export const MiiHairFlipTable = [
  1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0,
  0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
  1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1,
  0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0,
  1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1,
  1, 1
];

export function rearrangeArray(
  array: any[],
  lookupTable: Record<number, number> | number[][],
  separator = makeSeparatorGapThinDesktop
): any[] {
  let rearrangedArray: any[] = [];

  if (Array.isArray(lookupTable) && Array.isArray(lookupTable[0])) {
    // 2D array case (page-based sorting with separators)
    for (const page of lookupTable) {
      let pageItems = page
        .map((index) => array[index])
        .filter((i) => i !== undefined);
      if (rearrangedArray.length > 0 && pageItems.length > 0) {
        rearrangedArray.push(separator()); // Add separator between pages
      }
      rearrangedArray.push(...pageItems);
    }
  } else {
    // 1D mapping case (direct index reassignment)
    for (const realIndex in lookupTable) {
      const lookupIndex = (lookupTable as Record<number, number>)[realIndex];
      rearrangedArray[parseInt(realIndex)] = array[lookupIndex];
    }
    rearrangedArray = rearrangedArray.filter((i) => i !== undefined);
  }

  return rearrangedArray;
}

// Helper functions for UI, uhh most of these are the same
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
export const makeSeparatorGapThinDesktop: () => any = () => ({
  type: FeatureSetType.Misc,
  html: new Html("div").class("separator-gap-thin-desktop"),
  select() {}
});
export const makeSeparatorGapThinLaptop: () => any = () => ({
  type: FeatureSetType.Misc,
  html: new Html("div").class("separator-gap-thin-laptop"),
  select() {}
});
export const makeSeparatorGapThin = () =>
  new Html("div").class("separator-gap-thin");
export const makeHeaderFSI = (text: string) => ({
  type: FeatureSetType.Misc,
  html: new Html("div").text(text),
  select() {}
});
