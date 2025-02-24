import type { Struct } from "../../external/ffl.js/struct-fu";
import _ from "../../external/ffl.js/struct-fu-full";

export const StudioData = _.struct([
  _.uint8("beardColor"),
  _.uint8("beardType"),
  _.uint8("build"),
  _.uint8("eyeAspect"),
  _.uint8("eyeColor"),
  _.uint8("eyeRotate"),
  _.uint8("eyeScale"),
  _.uint8("eyeType"),
  _.uint8("eyeX"),
  _.uint8("eyeY"),
  _.uint8("eyebrowAspect"),
  _.uint8("eyebrowColor"),
  _.uint8("eyebrowRotate"),
  _.uint8("eyebrowScale"),
  _.uint8("eyebrowType"),
  _.uint8("eyebrowX"),
  _.uint8("eyebrowY"),
  _.uint8("facelineColor"),
  _.uint8("facelineMake"),
  _.uint8("facelineType"),
  _.uint8("facelineWrinkle"),
  _.uint8("favoriteColor"),
  _.uint8("gender"),
  _.uint8("glassColor"),
  _.uint8("glassScale"),
  _.uint8("glassType"),
  _.uint8("glassY"),
  _.uint8("hairColor"),
  _.uint8("hairFlip"),
  _.uint8("hairType"),
  _.uint8("height"),
  _.uint8("moleScale"),
  _.uint8("moleType"),
  _.uint8("moleX"),
  _.uint8("moleY"),
  _.uint8("mouthAspect"),
  _.uint8("mouthColor"),
  _.uint8("mouthScale"),
  _.uint8("mouthType"),
  _.uint8("mouthY"),
  _.uint8("mustacheScale"),
  _.uint8("mustacheType"),
  _.uint8("mustacheY"),
  _.uint8("noseScale"),
  _.uint8("noseType"),
  _.uint8("noseY")
]) as Struct;

export type StudioData = {
  beardColor: number;
  beardType: number;
  build: number;
  eyeAspect: number;
  eyeColor: number;
  eyeRotate: number;
  eyeScale: number;
  eyeType: number;
  eyeX: number;
  eyeY: number;
  eyebrowAspect: number;
  eyebrowColor: number;
  eyebrowRotate: number;
  eyebrowScale: number;
  eyebrowType: number;
  eyebrowX: number;
  eyebrowY: number;
  facelineColor: number;
  facelineMake: number;
  facelineType: number;
  facelineWrinkle: number;
  favoriteColor: number;
  gender: number;
  glassColor: number;
  glassScale: number;
  glassType: number;
  glassY: number;
  hairColor: number;
  hairFlip: number;
  hairType: number;
  height: number;
  moleScale: number;
  moleType: number;
  moleX: number;
  moleY: number;
  mouthAspect: number;
  mouthColor: number;
  mouthScale: number;
  mouthType: number;
  mouthY: number;
  mustacheScale: number;
  mustacheType: number;
  mustacheY: number;
  noseScale: number;
  noseType: number;
  noseY: number;
};
