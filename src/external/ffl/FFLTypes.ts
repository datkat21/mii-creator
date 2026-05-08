export function FFLiiGetEyebrowRotateOffset(type: number) {
  const ROTATE = [
    6, 6, 5, 7, 6, 7, 6, 7, 4, 7, 6, 8, 5, 5, 6, 6, 7, 7, 6, 6, 5, 6, 7, 5,

    6, 6, 6, 6
  ];
  return 32 - ROTATE[type];
}

export enum FFLFavoriteColor {
  FFL_FAVORITE_COLOR_RED = 0,
  FFL_FAVORITE_COLOR_ORANGE = 1,
  FFL_FAVORITE_COLOR_YELLOW = 2,
  FFL_FAVORITE_COLOR_YELLOWGREEN = 3,
  FFL_FAVORITE_COLOR_GREEN = 4,
  FFL_FAVORITE_COLOR_BLUE = 5,
  FFL_FAVORITE_COLOR_SKYBLUE = 6,
  FFL_FAVORITE_COLOR_PINK = 7,
  FFL_FAVORITE_COLOR_PURPLE = 8,
  FFL_FAVORITE_COLOR_BROWN = 9,
  FFL_FAVORITE_COLOR_WHITE = 10,
  FFL_FAVORITE_COLOR_BLACK = 11,
  FFL_FAVORITE_COLOR_MAX = 12
}

export const FFL_PATH_MAX_LEN = 256;

export const FFL_FACE_TYPE_MAX = 12;
export const FFL_FACELINE_COLOR_MAX = 6;
export const FFL_FACE_LINE_MAX = 12;
export const FFL_FACE_MAKE_MAX = 12;
export const FFL_HAIR_TYPE_MAX = 132;
export const FFL_HAIR_COLOR_MAX = 8;
export const FFL_HAIR_DIR_MAX = 2;
export const FFL_EYE_TYPE_DATA_MAX = 60;
export const FFL_EYE_TYPE_TRUE_MAX = 80;
export const FFL_EYE_COLOR_MAX = 6;
export const FFL_EYE_SCALE_MAX = 8;
export const FFL_EYE_SCALE_Y_MAX = 7;
export const FFL_EYE_ROTATE_MAX = 8;
export const FFL_EYE_SPACING_MAX = 13;
export const FFL_EYE_POS_MAX = 19;
export const FFL_EYEBROW_TYPE_MAX = 28;
export const FFL_EYEBROW_COLOR_MAX = 8;
export const FFL_EYEBROW_SCALE_MAX = 9;
export const FFL_EYEBROW_SCALE_Y_MAX = 7;
export const FFL_EYEBROW_ROTATE_MAX = 12;
export const FFL_EYEBROW_SPACING_MAX = 13;
export const FFL_EYEBROW_POS_MIN = 3;
export const FFL_EYEBROW_POS_MAX = 19;
export const FFL_NOSE_TYPE_MAX = 18;
export const FFL_NOSE_SCALE_MAX = 9;
export const FFL_NOSE_POS_MAX = 19;
export const FFL_MOUTH_TYPE_DATA_MAX = 36;
export const FFL_MOUTH_TYPE_TRUE_MAX = 52;
export const FFL_MOUTH_COLOR_MAX = 5;
export const FFL_MOUTH_SCALE_MAX = 9;
export const FFL_MOUTH_SCALE_Y_MAX = 7;
export const FFL_MOUTH_POS_MAX = 19;
export const FFL_MUSTACHE_TYPE_MAX = 6;
export const FFL_BEARD_TYPE_MAX = 6;
export const FFL_BEARD_COLOR_MAX = 8;
export const FFL_MUSTACHE_SCALE_MAX = 9;
export const FFL_MUSTACHE_POS_MAX = 17;
export const FFL_GLASS_TYPE_MAX = 9;
export const FFL_GLASS_COLOR_MAX = 6;
export const FFL_GLASS_SCALE_MAX = 8;
export const FFL_GLASS_POS_MAX = 21;
export const FFL_MOLE_TYPE_MAX = 2;
export const FFL_MOLE_SCALE_MAX = 9;
export const FFL_MOLE_POS_X_MAX = 17;
export const FFL_MOLE_POS_Y_MAX = 31;

export const FFLI_FACELINE_COLOR_NUM = FFL_FACELINE_COLOR_MAX;
export const FFLI_HAIR_COLOR_NUM = FFL_HAIR_COLOR_MAX;
export const FFLI_EYE_COLOR_R_NUM = 3;
export const FFLI_EYE_COLOR_B_NUM = FFL_EYE_COLOR_MAX;
export const FFLI_GLASS_COLOR_NUM = FFL_GLASS_COLOR_MAX;
export const FFLI_MOUTH_COLOR_R_NUM = FFL_MOUTH_COLOR_MAX;
export const FFLI_MOUTH_COLOR_G_NUM = FFL_MOUTH_COLOR_MAX;
export const FFLI_FAVORITE_COLOR_NUM = 1;

export enum MiiExpression {
  Normal = 0,
  Smile = 1,
  Anger = 2,
  Sorrow = 3,
  Surprise = 4,
  Blink = 5,
  NormalOpenMouth = 6,
  SmileOpenMouth = 7,
  AngerOpenMouth = 8,
  SurpriseOpenMouth = 9,
  SorrowOpenMouth = 10,
  BlinkOpenMouth = 11,
  WinkLeftEyeOpen = 12,
  WinkRightEyeOpen = 13,
  WinkLeftEyeAndMouthOpen = 14,
  WinkRightEyeAndMouthOpen = 15,
  WinkLeftEyeOpenAndSmiling = 16,
  WinkRightEyeOpenAndSmiling = 17,
  Frustrated = 18,
  Bored = 19,
  BoredOpenMouth = 20,
  SighMouthStraight = 21,
  Sigh = 22,
  DisgustedMouthStraight = 23,
  Disgusted = 24,
  Love = 25,
  LoveMouthOpen = 26,
  DeterminedMouthStraight = 27,
  Determined = 28,
  CryMouthStraight = 29,
  Cry = 30,
  BigSmileMouthStraight = 31,
  BigSmile = 32,
  Cheeky = 33,
  ResolveEyesFunnyMouth = 35,
  ResolveEyesFunnyMouthOpen = 36,
  Smug = 37,
  SmugMouthOpen = 38,
  Resolve = 39,
  ResolveMouthOpen = 40,
  Unbelievable = 41,
  Cunning = 43,
  Raspberry = 45,
  Innocent = 47,
  Cat = 49,
  Dog = 51,
  Tasty = 53,
  MoneyMouthStraight = 55,
  Money = 56,
  ConfusedMouthStraight = 57,
  Confused = 58,
  CheerfulMouthStraight = 59,
  Cheerful = 60,
  Blank = 61,
  GrumbleMouthStraight = 63,
  Grumble = 64,
  MovedMouthStraight = 65,
  Moved = 66,
  SingingMouthSmall = 67,
  Singing = 68,
  Stunned = 69
}
