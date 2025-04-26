import _ from "../../external/struct-fu/lib";
import type { Field, Struct } from "../../external/struct-fu/types/Generic";

export const NnMiiCharInfo = _.struct([
  _.byte("createId", 16),
  /* null terminated */
  _.char16le("nickname", 22),
  _.uint8("fontRegion"),
  _.uint8("favoriteColor"),
  _.uint8("gender"),
  _.uint8("height"),
  _.uint8("build"),
  /* special or not */
  _.uint8("type"),
  _.uint8("regionMove"),
  _.uint8("facelineType"),
  _.uint8("facelineColor"),
  _.uint8("facelineWrinkle"),
  _.uint8("facelineMake"),
  _.uint8("hairType"),
  _.uint8("hairColor"),
  _.uint8("hairFlip"),
  _.uint8("eyeType"),
  _.uint8("eyeColor"),
  _.uint8("eyeScale"),
  _.uint8("eyeAspect"),
  _.uint8("eyeRotate"),
  _.uint8("eyeX"),
  _.uint8("eyeY"),
  _.uint8("eyebrowType"),
  _.uint8("eyebrowColor"),
  _.uint8("eyebrowScale"),
  _.uint8("eyebrowAspect"),
  _.uint8("eyebrowRotate"),
  _.uint8("eyebrowX"),
  _.uint8("eyebrowY"),
  _.uint8("noseType"),
  _.uint8("noseScale"),
  _.uint8("noseY"),
  _.uint8("mouthType"),
  _.uint8("mouthColor"),
  _.uint8("mouthScale"),
  _.uint8("mouthAspect"),
  _.uint8("mouthY"),
  _.uint8("beardColor"),
  _.uint8("beardType"),
  _.uint8("mustacheType"),
  _.uint8("mustacheScale"),
  _.uint8("mustacheY"),
  _.uint8("glassType"),
  _.uint8("glassColor"),
  _.uint8("glassScale"),
  _.uint8("glassY"),
  _.uint8("moleType"),
  _.uint8("moleScale"),
  _.uint8("moleX"),
  _.uint8("moleY"),
  /* always zero */
  _.uint8("reserved")
]) as Struct;
export type NnMiiCharInfo = {
  createId: object;
  nickname: string;
  fontRegion: number;
  favoriteColor: number;
  gender: number;
  height: number;
  build: number;
  type: number;
  regionMove: number;
  facelineType: number;
  facelineColor: number;
  facelineWrinkle: number;
  facelineMake: number;
  hairType: number;
  hairColor: number;
  hairFlip: number;
  eyeType: number;
  eyeColor: number;
  eyeScale: number;
  eyeAspect: number;
  eyeRotate: number;
  eyeX: number;
  eyeY: number;
  eyebrowType: number;
  eyebrowColor: number;
  eyebrowScale: number;
  eyebrowAspect: number;
  eyebrowRotate: number;
  eyebrowX: number;
  eyebrowY: number;
  noseType: number;
  noseScale: number;
  noseY: number;
  mouthType: number;
  mouthColor: number;
  mouthScale: number;
  mouthAspect: number;
  mouthY: number;
  beardColor: number;
  beardType: number;
  mustacheType: number;
  mustacheScale: number;
  mustacheY: number;
  glassType: number;
  glassColor: number;
  glassScale: number;
  glassY: number;
  moleType: number;
  moleScale: number;
  moleX: number;
  moleY: number;
  reserved: number;
};
