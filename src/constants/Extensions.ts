export const ExtHatNameList = [
  "Cap",
  "Beanie",
  "Top Hat",
  "Ribbon",
  "Bow",
  "Cat Ears",
  "Straw Hat",
  "Pot",
  "Bike Helmet"
];

export const ExtClothesList = [
  "LS+Pants",
  "SS+Shorts",
  "TT+Shorts",
  "LS+Pants"
];
export const ExtClothesMiitomoMeshAndTextureList = [
  {
    Shirt: "StudioLongShirt",
    Pants: "StudioPants",
    SkirtLong: "StudioLongSkirt"
    // Skirt: "StudioShortSkirt"
  },
  {
    Shirt: "StudioShortShirt",
    Shorts: "StudioShorts",
    Skirt: "StudioShortSkirt"
  },
  {
    Shirt: "StudioTank",
    Shorts: "StudioShorts_FlipFlops",
    Skirt: "StudioShortSkirt"
  },
  {
    Shirt: "StudioHoodieShirt",
    Pants: "StudioHoodiePants",
    SkirtMedium: "StudioMediumSkirt",
    Hoodie: "StudioHood"
  }
];

export enum HatType {
  HEAD,
  HAT,
  FACE_ONLY,
  FRONT,
  SIDE,
  TOP,
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
  HatType.SIDE, // Ribbon
  HatType.SIDE, // Bow
  HatType.HEAD, // Cat Ears
  HatType.HAT, // Straw Hat
  HatType.HAT, // Pot
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
