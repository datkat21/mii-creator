import _ from "../../external/ffl.js/struct-fu-full";
import type { Struct } from "../../external/ffl.js/struct-fu";
import {
  EmptyMiiCreatorV4Data,
  type MiiCreatorV4Data
} from "./MiiCreatorV4Data";
import {
  Ver3EyeColorTable,
  Ver3FacelineColorTable,
  Ver3GlassColorTable,
  Ver3HairColorTable,
  Ver3MouthColorTable
} from "../../constants/ColorTables";

export const RFLCreateID = _.struct([_.uint8("data", 8)]) as Struct;

// example RCD
// 2A8A0062000000000000000000000000000000000000005AC00053D9A611223320047900694008C3486D8C58007298AB008A008A25040061000000000000000000000000000000000000

export const RFLCharData = _.struct([
  _.ubit("padding0", 1),
  _.ubit("gender", 1),
  _.ubit("birthMonth", 4),
  _.ubit("birthDay", 5),
  _.ubit("favoriteColor", 4),
  _.ubit("favorite", 1),
  _.char16be("name", 0x14),

  _.uint8("height"),
  _.uint8("build"),
  _.struct("create_id", [RFLCreateID]),

  _.ubit("faceType", 3),

  _.ubit("faceColor", 3),
  _.ubit("faceTex", 4),
  _.ubit("padding_2", 3),
  _.ubit("localonly", 1),
  _.ubit("type", 2),

  _.ubit("hairType", 7),
  _.ubit("hairColor", 3),
  _.ubit("hairFlip", 1),
  _.ubit("padding_3", 5),

  _.ubit("eyebrowType", 5),
  _.ubit("eyebrowRotate", 5),
  _.ubit("padding_4", 6),

  _.ubit("eyebrowColor", 3),
  _.ubit("eyebrowScale", 4),
  _.ubit("eyebrowY", 5),
  _.ubit("eyebrowX", 4),

  _.ubit("eyeType", 6),
  _.ubit("eyeRotate", 5),
  _.ubit("eyeY", 5),

  _.ubit("eyeColor", 3),
  _.ubit("eyeScale", 4),
  _.ubit("eyeX", 4),
  _.ubit("padding_5", 5),

  _.ubit("noseType", 4),
  _.ubit("noseScale", 4),
  _.ubit("noseY", 5),
  _.ubit("padding_6", 3),

  _.ubit("mouthType", 5),
  _.ubit("mouthColor", 2),
  _.ubit("mouthScale", 4),
  _.ubit("mouthY", 5),

  _.ubit("glassType", 4),
  _.ubit("glassColor", 3),
  _.ubit("glassScale", 4),
  _.ubit("glassY", 5),

  _.ubit("mustacheType", 2),
  _.ubit("beardType", 2),
  _.ubit("beardColor", 3),
  _.ubit("beardScale", 4),
  _.ubit("beardY", 5),

  _.ubit("moleType", 1),
  _.ubit("moleScale", 4),
  _.ubit("moleY", 5),
  _.ubit("moleX", 5),
  _.ubit("padding_8", 1),

  _.char16be("creatorName", 0x14)
]);

export const RFLStoreData = _.struct([
  _.struct([RFLCharData]),
  _.uint16("checksum")
]) as Struct;

export interface RFLStoreData extends RFLCharData {
  checksum: number;
}
export type RFLCharData = {
  padding0: number;
  gender: number;
  birthMonth: number;
  birthDay: number;
  favoriteColor: number;
  favorite: number;
  name: string;
  height: number;
  build: number;
  create_id: object;
  faceType: number;
  faceColor: number;
  faceTex: number;
  padding_2: number;
  localonly: number;
  type: number;
  hairType: number;
  hairColor: number;
  hairFlip: number;
  padding_3: number;
  eyebrowType: number;
  eyebrowRotate: number;
  padding_4: number;
  eyebrowColor: number;
  eyebrowScale: number;
  eyebrowY: number;
  eyebrowX: number;
  eyeType: number;
  eyeRotate: number;
  eyeY: number;
  eyeColor: number;
  eyeScale: number;
  eyeX: number;
  padding_5: number;
  noseType: number;
  noseScale: number;
  noseY: number;
  padding_6: number;
  mouthType: number;
  mouthColor: number;
  mouthScale: number;
  mouthY: number;
  glassType: number;
  glassColor: number;
  glassScale: number;
  glassY: number;
  mustacheType: number;
  beardType: number;
  beardColor: number;
  beardScale: number;
  beardY: number;
  moleType: number;
  moleScale: number;
  moleY: number;
  moleX: number;
  padding_8: number;
  creatorName: string;
};

// picked by hand but should work
export const Ver1ToVer3FacelineTex = [
  [0, 0],
  [1, 0],
  [6, 0],
  [9, 0],
  [0, 5],
  [0, 2],
  [0, 3],
  [0, 7],
  [0, 8],
  [10, 0],
  [0, 9],
  [0, 11]
];

export function RFLStoreDataToMiiCreatorV4Data(
  input: RFLStoreData
): MiiCreatorV4Data {
  const output: MiiCreatorV4Data = EmptyMiiCreatorV4Data();
  console.log("input rfl data:", input);
  output.beardColor = Ver3HairColorTable[input.beardColor];
  output.beardType = input.beardType;
  output.birthDay = input.birthDay;
  output.birthMonth = input.birthMonth;
  output.build = input.build;
  output.createId.set(RFLCreateID.pack(input.create_id), 0);
  output.creator = input.creatorName;
  output.eyeColor = Ver3EyeColorTable[input.eyeColor];
  output.eyeRotate = input.eyeRotate;
  output.eyeScale = input.eyeScale;
  output.eyeType = input.eyeType;
  output.eyeX = input.eyeX;
  output.eyeY = input.eyeY;
  output.eyebrowColor = Ver3HairColorTable[input.eyebrowColor];
  output.eyebrowRotate = input.eyebrowRotate;
  output.eyebrowScale = input.eyebrowScale;
  output.eyebrowType = input.eyebrowType;
  output.eyebrowX = input.eyebrowX;
  output.eyebrowY = input.eyebrowY;
  output.facelineColor = Ver3FacelineColorTable[input.faceColor];
  output.facelineType = input.faceType;
  output.facelineMake = Ver1ToVer3FacelineTex[input.faceTex][0];
  output.facelineWrinkle = Ver1ToVer3FacelineTex[input.faceTex][1];
  output.favorite = input.favorite;
  output.favoriteColor = input.favoriteColor;
  output.gender = input.gender;
  output.glassColor = Ver3GlassColorTable[input.glassColor];
  output.glassScale = input.glassScale;
  output.glassType = input.glassType;
  output.glassY = input.glassY;
  output.hairColor = Ver3HairColorTable[input.hairColor];
  output.hairFlip = input.hairFlip;
  output.hairType = input.hairType;
  output.height = input.height;
  output.moleScale = input.moleScale;
  output.moleType = input.moleType;
  output.moleX = input.moleX;
  output.moleY = input.moleY;
  output.mouthColor = Ver3MouthColorTable[input.mouthColor];
  output.mouthScale = input.mouthScale;
  output.mouthType = input.mouthType;
  output.mouthY = input.mouthY;
  output.mustacheScale = input.beardScale;
  output.mustacheType = input.mustacheType;
  output.mustacheY = input.beardY;
  output.noseScale = input.noseScale;
  output.noseType = input.noseType;
  output.noseY = input.noseY;
  output.nickname = input.name;
  output.creator = input.creatorName;

  // miic features
  output.facePaintColor = -1;
  output.hatCommonColor = -1;
  output.hatFavoriteColor = -1;
  output.hatType = -1;
  output.hideNose = 0;
  output.pantsColor = -1;
  output.personality = -1;
  output.shirtColor = -1;

  return output;
}
