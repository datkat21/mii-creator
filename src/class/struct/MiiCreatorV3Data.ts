import _ from "../../external/struct-fu/lib";
import type { Struct } from "../../external/struct-fu/types/Generic";
import { Ver3StoreData } from "./FFLStoreData";
import {
  EmptyMiiCreatorV4Data,
  MiiCreatorOriginPlatform,
  MiiCreatorV4Data
} from "./MiiCreatorV4Data";

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
  // mii creator specific data
  _.uint8("ext_hat_type"),
  _.uint8("ext_hat_color"),
  _.uint8("ext_face_paint_color"),
  _.uint8("ext_shirt_color")
]) as Struct;

export function Ver3StoreDataToMiiCreatorV4Data(
  input: Ver3StoreData
): MiiCreatorV4Data {
  const data = EmptyMiiCreatorV4Data;

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
  data.authorId = input.author_id.data;
  data.beardColor = input.beard_color;
  data.beardType = input.beard_type;
  data.birthDay = input.birth_day;
  data.birthMonth = input.birth_month;
  data.build = input.build;
  data.eyeAspect = input.eye_aspect;
  data.eyebrowAspect = input.eyebrow_aspect;
  data.eyebrowColor = input.eyebrow_color;
  data.eyebrowRotate = input.eyebrow_rotate;
  data.eyebrowScale = input.eyebrow_scale;
  data.eyebrowType = input.eyebrow_type;
  data.eyebrowX = input.eyebrow_x;
  data.eyebrowY = input.eyebrow_y;
  data.eyeColor = input.eye_color;
  data.eyeRotate = input.eye_rotate;
  data.eyeScale = input.eye_scale;
  data.eyeType = input.eye_type;
  data.eyeX = input.eye_x;
  data.eyeY = input.eye_y;
  data.facelineColor = input.face_color;
  data.facelineMake = input.face_make;
  data.facelineType = input.face_type;
  data.facelineWrinkle = input.face_tex;
  data.favorite = input.favorite;
  data.favoriteColor = input.favorite_color;
  data.fontRegion = input.font_region;
  data.gender = input.gender;
  data.glassColor = input.glasses_color;
  data.glassScale = input.glasses_scale;
  data.glassType = input.glasses_type;
  data.glassY = input.glass_y;
  data.hairColor = input.hair_color;
  data.hairFlip = input.hair_flip;
  data.hairType = input.hair_type;
  data.height = input.height;
  data.moleScale = input.mole_scale;
  data.moleType = input.mole_type;
  data.moleX = input.mole_x;
  data.moleY = input.mole_y;
  data.mouthAspect = input.mouth_aspect;
  data.mouthColor = input.mouth_color;
  data.mouthScale = input.mouth_scale;
  data.mouthType = input.mouth_type;
  data.mouthY = input.mouth_y;
  data.mustacheScale = input.beard_scale;
  data.mustacheType = input.mustache_type;
  data.mustacheY = input.beard_y;
  data.noseScale = input.nose_scale;
  data.noseType = input.nose_type;
  data.noseY = input.nose_y;
  data.regionMove = input.region_move;
  data.special = Number(!input.create_id.flag_normal);

  return data;
}
