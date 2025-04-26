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
