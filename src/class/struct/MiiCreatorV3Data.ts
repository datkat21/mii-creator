import _ from "../../external/ffl.js/struct-fu-full";
import type { Struct } from "../../external/ffl.js/struct-fu";
import { FFLiAuthorID, FFLiCreateID, Ver3StoreData } from "./FFLStoreData";
import {
  EmptyMiiCreatorV4Data,
  MiiCreatorOriginPlatform,
  MiiCreatorV4Data
} from "./MiiCreatorV4Data";
import {
  Ver3EyeColorTable,
  Ver3GlassColorTable,
  Ver3HairColorTable,
  Ver3MouthColorTable
} from "../../constants/ColorTables";

export const MiiCreatorV3Data = _.struct([
  _.struct([Ver3StoreData]),

  // nfp store "extention" data (mii creator stores it like this)
  _.uint8("ext_faceline_color"),
  _.uint8("ext_hair_color"),
  _.uint8("ext_eye_color"),
  _.uint8("ext_eyebrow_color"),
  _.uint8("ext_mouth_color"),
  _.uint8("ext_beard_color"),
  _.uint8("ext_glass_color"),
  _.uint8("ext_glass_type"),
  // mii creator v3 specific data
  _.uint8("ext_hat_type"),
  _.uint8("ext_hat_color"),
  _.uint8("ext_face_paint_color"),
  _.uint8("ext_shirt_color")
]) as Struct;

export interface MiiCreatorV3Data extends Ver3StoreData {
  ext_faceline_color: number;
  ext_hair_color: number;
  ext_eye_color: number;
  ext_eyebrow_color: number;
  ext_mouth_color: number;
  ext_beard_color: number;
  ext_glass_color: number;
  ext_glass_type: number;
  // mii creator v3 specific data
  ext_hat_type: number;
  ext_hat_color: number;
  ext_face_paint_color: number;
  ext_shirt_color: number;
}

export function MiiCreatorV3DataToMiiCreatorV4Data(
  input: MiiCreatorV3Data
): MiiCreatorV4Data {
  const data = EmptyMiiCreatorV4Data();

  switch (input.birth_platform) {
    case 0:
      data.originPlatform = MiiCreatorOriginPlatform.RFL_Wii;
      break;
    case 1:
      data.originPlatform = MiiCreatorOriginPlatform.NFL_DS;
      break;
    case 2:
      data.originPlatform = MiiCreatorOriginPlatform.CFL_3DS;
      break;
    case 3:
      data.originPlatform = MiiCreatorOriginPlatform.FFL_Wii_U;
      break;
  }
  if (
    input.ext_beard_color ||
    input.ext_eye_color ||
    input.ext_eyebrow_color ||
    input.ext_face_paint_color ||
    input.ext_faceline_color ||
    input.ext_glass_color ||
    input.ext_glass_type ||
    input.ext_hair_color ||
    input.ext_hat_color ||
    input.ext_hat_type ||
    input.ext_mouth_color ||
    input.ext_shirt_color
  ) {
    // this is definitely mii creator data
    data.originPlatform = MiiCreatorOriginPlatform.Mii_Creator_v3;
  }
  // mii creator file format ver 3 stores missing common colors with value "0" which is bad, so fallback to ffl color as how miic v3 did it.
  data.authorId = input.author_id.data;
  data.beardColor =
    input.ext_beard_color || Ver3HairColorTable[input.beard_color];
  data.beardType = input.beard_type;
  data.birthDay = input.birth_day;
  data.birthMonth = input.birth_month;
  data.build = input.build;
  data.createId = FFLiCreateID.pack(input.create_id);
  data.creator = input.creator;
  data.eyeAspect = input.eye_aspect;
  data.eyebrowAspect = input.eyebrow_aspect;
  data.eyebrowColor =
    input.ext_eyebrow_color || Ver3HairColorTable[input.eyebrow_color];
  data.eyebrowRotate = input.eyebrow_rotate;
  data.eyebrowScale = input.eyebrow_scale;
  data.eyebrowType = input.eyebrow_type;
  data.eyebrowX = input.eyebrow_x;
  data.eyebrowY = input.eyebrow_y;
  data.eyeColor = input.ext_eye_color || Ver3EyeColorTable[input.eye_color];
  data.eyeRotate = input.eye_rotate;
  data.eyeScale = input.eye_scale;
  data.eyeType = input.eye_type;
  data.eyeX = input.eye_x;
  data.eyeY = input.eye_y;
  data.facelineColor = input.face_color;
  data.facelineMake = input.face_make;
  data.facelineType = input.face_type;
  data.facelineWrinkle = input.face_tex;
  data.facePaintColor = input.ext_face_paint_color - 1 || -1;
  data.favorite = input.favorite;
  data.favoriteColor = input.favorite_color;
  data.fontRegion = input.font_region;
  data.gender = input.gender;
  data.glassColor =
    input.ext_glass_color || Ver3GlassColorTable[input.glasses_color];
  data.glassScale = input.glasses_scale;
  data.glassType = input.ext_glass_type || input.glasses_type;
  data.glassY = input.glass_y;
  data.hairColor = input.ext_hair_color || Ver3HairColorTable[input.hair_color];
  data.hairFlip = input.hair_flip;
  data.hairType = input.hair_type;
  data.hatFavoriteColor =
    input.ext_hat_color !== 0 ? input.ext_hat_color - 1 : -1;
  data.hatType = input.ext_hat_type !== 0 ? input.ext_hat_type - 1 : -1;
  data.height = input.height;
  data.moleScale = input.mole_scale;
  data.moleType = input.mole_type;
  data.moleX = input.mole_x;
  data.moleY = input.mole_y;
  data.mouthAspect = input.mouth_aspect;
  data.mouthColor =
    input.ext_mouth_color || Ver3MouthColorTable[input.mouth_color];
  data.mouthScale = input.mouth_scale;
  data.mouthType = input.mouth_type;
  data.mouthY = input.mouth_y;
  data.mustacheScale = input.beard_scale;
  data.mustacheType = input.mustache_type;
  data.mustacheY = input.beard_y;
  data.nickname = input.name;
  data.noseScale = input.nose_scale;
  data.noseType = input.nose_type;
  data.noseY = input.nose_y;
  data.regionMove = input.region_move;
  if (input.create_id.flag_temporary !== 0)
    data.special = Number(!input.create_id.flag_normal);
  data.temporary = Number(input.create_id.flag_temporary);

  return data;
}
