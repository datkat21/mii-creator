export const ExtHatNameList = [
  "Cap",
  "Beanie",
  "Top Hat",
  "Ribbon",
  "Bow",
  "Cat Ears",
  "Straw Hat",
  "Hijab",
  "Bike Helmet"
];

export const ExtClothesList = [
  "LS+Pants",
  "SS+Shorts",
  "TT+Shorts",
  "empty empty"
];

export enum HatType {
  HEAD,
  HAT,
  FACE_ONLY,
  BALD
}

export enum ClothesType {
  COLOR_MIXED,
  TEXTURE_COLOR
}

export const HatTypeList = [
  HatType.HAT, // Cap
  HatType.HAT, // Beanie
  HatType.HAT, // Top Hat
  HatType.HEAD, // Ribbon
  HatType.HEAD, // Bow
  HatType.HEAD, // Cat Ears
  HatType.HAT, // Straw Hat
  HatType.BALD, // Hijab
  HatType.HAT // Bike Helmet
];

export const ClothesTypeList = [
  ClothesType.COLOR_MIXED,
  ClothesType.COLOR_MIXED,
  ClothesType.COLOR_MIXED,
  ClothesType.COLOR_MIXED
  // ClothesType.TEXTURE_COLOR
];

export const ExtHatFullHeadList = [4, 5, 6];
