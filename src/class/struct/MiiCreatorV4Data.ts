import _ from "../../external/struct-fu/lib";
import type { Struct } from "../../external/struct-fu/types/Generic";

export const MiiCreatorV4Data = _.struct([
  _.uint8("miicVersion"),
  _.uint8("originPlatform"),
  _.byte("authorId", 8),
  _.byte("createId", 10),
  _.char16le("creator", 22),
  _.char16le("nickname", 22),
  _.uint8("beardColor"),
  _.uint8("beardType"),
  _.uint8("birthDay"),
  _.uint8("birthMonth"),
  _.uint16("birthYear"),
  _.uint8("build"),
  _.uint8("eyeAspect"),
  _.uint8("eyebrowAspect"),
  _.uint8("eyebrowColor"),
  _.uint8("eyebrowRotate"),
  _.uint8("eyebrowScale"),
  _.uint8("eyebrowType"),
  _.uint8("eyebrowX"),
  _.uint8("eyebrowY"),
  _.uint8("eyeColor"),
  _.uint8("eyeRotate"),
  _.uint8("eyeScale"),
  _.uint8("eyeType"),
  _.uint8("eyeX"),
  _.uint8("eyeY"),
  _.uint8("facelineColor"),
  _.uint8("facelineMake"),
  _.uint8("facelineType"),
  _.uint8("facelineWrinkle"),
  _.uint8("facePaintColor"),
  _.uint8("favorite"),
  _.uint8("favoriteColor"),
  _.uint8("fontRegion"),
  _.uint8("gender"),
  _.uint8("glassColor"),
  _.uint8("glassScale"),
  _.uint8("glassType"),
  _.uint8("glassY"),
  _.uint8("hairColor"),
  _.uint8("hairFlip"),
  _.uint8("hairType"),
  _.uint8("hatColor"),
  _.uint8("hatType"),
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
  _.uint8("noseY"),
  _.uint8("pantsColor"),
  _.uint8("regionMove"),
  _.uint8("shirtColor"),
  _.uint8("special"),
]) as Struct;

//@ts-expect-error
window.MiiCreatorV4Data = MiiCreatorV4Data;

export type MiiCreatorV4Data = {
  miicVersion: number;
  originPlatform: number;
  authorId: Uint8Array;
  createId: Uint8Array;
  creator: string;
  nickname: string;
  beardColor: number;
  beardType: number;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  build: number;
  eyeAspect: number;
  eyebrowAspect: number;
  eyebrowColor: number;
  eyebrowRotate: number;
  eyebrowScale: number;
  eyebrowType: number;
  eyebrowX: number;
  eyebrowY: number;
  eyeColor: number;
  eyeRotate: number;
  eyeScale: number;
  eyeType: number;
  eyeX: number;
  eyeY: number;
  facelineColor: number;
  facelineMake: number;
  facelineType: number;
  facelineWrinkle: number;
  facePaintColor: number;
  favorite: number;
  favoriteColor: number;
  fontRegion: number;
  gender: number;
  glassColor: number;
  glassScale: number;
  glassType: number;
  glassY: number;
  hairColor: number;
  hairFlip: number;
  hairType: number;
  hatColor: number;
  hatType: number;
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
  pantsColor: number;
  regionMove: number;
  shirtColor: number;
  special: number;
};

export enum MiiCreatorOriginPlatform {
  Unknown = -1,
  RFL_Wii = 0,
  NFL_DS = 1,
  CFL_3DS = 2,
  FFL_Wii_U = 3,
  nnmii_Switch = 4,
  Mii_Creator = 5,
}

// Uninitialized values will be -1 unless
export const EmptyMiiCreatorV4Data: MiiCreatorV4Data = {
  miicVersion: 4,
  originPlatform: MiiCreatorOriginPlatform.Mii_Creator,
  authorId: new Uint8Array(8),
  createId: new Uint8Array(10),
  creator: "",
  nickname: "",
  beardColor: 0,
  beardType: 0,
  birthDay: 0,
  birthMonth: 0,
  birthYear: 0,
  build: 0,
  eyeAspect: 0,
  eyebrowAspect: 0,
  eyebrowColor: 0,
  eyebrowRotate: 0,
  eyebrowScale: 0,
  eyebrowType: 0,
  eyebrowX: 0,
  eyebrowY: 0,
  eyeColor: 0,
  eyeRotate: 0,
  eyeScale: 0,
  eyeType: 0,
  eyeX: 0,
  eyeY: 0,
  facelineColor: 0,
  facelineMake: 0,
  facelineType: 0,
  facelineWrinkle: 0,
  facePaintColor: -1,
  favorite: 0,
  favoriteColor: 0,
  fontRegion: 0,
  gender: 0,
  glassColor: 0,
  glassScale: 0,
  glassType: 0,
  glassY: 0,
  hairColor: 0,
  hairFlip: 0,
  hairType: 0,
  hatColor: -1,
  hatType: -1,
  height: 0,
  moleScale: 0,
  moleType: 0,
  moleX: 0,
  moleY: 0,
  mouthAspect: 0,
  mouthColor: 0,
  mouthScale: 0,
  mouthType: 0,
  mouthY: 0,
  mustacheScale: 0,
  mustacheType: 0,
  mustacheY: 0,
  noseScale: 0,
  noseType: 0,
  noseY: 0,
  pantsColor: -1,
  regionMove: 0,
  shirtColor: -1,
  special: 0,
};
