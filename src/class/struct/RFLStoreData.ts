import _ from "../../external/struct-fu/lib";
import type { Field, Struct } from "../../external/struct-fu/types/Generic";

export const RFLCreateID = _.struct([
  _.uint8("data", 8) // RFL_CREATEID_LEN
]);

// example RCD
// 2A8A0062000000000000000000000000000000000000005AC00053D9A611223320047900694008C3486D8C58007298AB008A008A25040061000000000000000000000000000000000000

export const RFLCharData = _.struct([
  // typedef struct RFLiCharData {
  //     // at 0x0
  //     u16 padding0 : 1;
  _.ubit("padding0", 1),
  //     u16 sex : 1;
  _.ubit("gender", 1),
  //     u16 birthMonth : 4;
  _.ubit("birthMonth", 4),
  //     u16 birthDay : 5;
  _.ubit("birthDay", 5),
  //     u16 favoriteColor : 4;
  _.ubit("favoriteColor", 4),
  //     u16 favorite : 1;
  _.ubit("favorite", 1),

  //     wchar_t name[RFL_NAME_LEN]; // at 0x2
  _.char16be("name", 0x14),
  //     u8 height;                  // at 0x16
  _.uint8("height"),
  //     u8 build;                   // at 0x17
  _.uint8("build"),
  //     RFLCreateID createID;       // at 0x18
  _.struct("create_id", [RFLCreateID]),

  //     // at 0x20
  //     u16 faceType : 3;
  _.ubit("faceType", 3),
  //     u16 faceColor : 3;
  _.ubit("faceColor", 3),
  //     u16 faceTex : 4;
  _.ubit("faceTex", 4),
  //     u16 padding2 : 3;
  _.ubit("padding_2", 3),
  //     u16 localonly : 1;
  _.ubit("localonly", 1),
  //     u16 type : 2;
  _.ubit("type", 2),

  //     // at 0x22
  //     u16 hairType : 7;
  _.ubit("hairType", 7),
  //     u16 hairColor : 3;
  _.ubit("hairColor", 3),
  //     u16 hairFlip : 1;
  _.ubit("hairFlip", 1),
  //     u16 padding3 : 5;
  _.ubit("padding_3", 5),

  //     // at 0x24
  //     u16 eyebrowType : 5;
  _.ubit("eyebrowType", 5),
  //     u16 eyebrowRotate : 5;
  _.ubit("eyebrowRotate", 5),
  //     u16 padding4 : 6;
  _.ubit("padding_4", 6),

  //     // at 0x26
  //     u16 eyebrowColor : 3;
  _.ubit("eyebrowColor", 3),
  //     u16 eyebrowScale : 4;
  _.ubit("eyebrowScale", 4),
  //     u16 eyebrowY : 5;
  _.ubit("eyebrowY", 5),
  //     u16 eyebrowX : 4;
  _.ubit("eyebrowX", 4),

  //     // at 0x28
  //     u16 eyeType : 6;
  _.ubit("eyeType", 6),
  //     u16 eyeRotate : 5;
  _.ubit("eyeRotate", 5),
  //     u16 eyeY : 5;
  _.ubit("eyeY", 5),

  //     // at 0x2A
  //     u16 eyeColor : 3;
  _.ubit("eyeColor", 3),
  //     u16 eyeScale : 4;
  _.ubit("eyeScale", 4),
  //     u16 eyeX : 4;
  _.ubit("eyeX", 4),
  //     u16 padding5 : 5;
  _.ubit("padding_5", 5),

  //     // at 0x2C
  //     u16 noseType : 4;
  _.ubit("noseType", 4),
  //     u16 noseScale : 4;
  _.ubit("noseScale", 4),
  //     u16 noseY : 5;
  _.ubit("noseY", 5),
  //     u16 padding6 : 3;
  _.ubit("padding_6", 3),

  //     // at 0x2E
  //     u16 mouthType : 5;
  _.ubit("mouthType", 5),
  //     u16 mouthColor : 2;
  _.ubit("mouthColor", 2),
  //     u16 mouthScale : 4;
  _.ubit("mouthScale", 4),
  //     u16 mouthY : 5;
  _.ubit("mouthY", 5),

  //     // at 0x30
  //     u16 glassType : 4;
  _.ubit("glassType", 4),
  //     u16 glassColor : 3;
  _.ubit("glassColor", 3),
  //     u16 glassScale : 4;
  _.ubit("glassScale", 4),
  //     u16 glassY : 5;
  _.ubit("glassY", 5),

  //     // at 0x32
  //     u16 mustacheType : 2;
  _.ubit("mustacheType", 2),
  //     u16 beardType : 2;
  _.ubit("beardType", 2),
  //     u16 beardColor : 3;
  _.ubit("beardColor", 3),
  //     u16 beardScale : 4;
  _.ubit("beardScale", 4),
  //     u16 beardY : 5;
  _.ubit("beardY", 5),

  //     // at 0x34
  //     u16 moleType : 1;
  _.ubit("moleType", 1),
  //     u16 moleScale : 4;
  _.ubit("moleScale", 4),
  //     u16 moleY : 5;
  _.ubit("moleY", 5),
  //     u16 moleX : 5;
  _.ubit("moleX", 5),
  //     u16 padding8 : 1;
  _.ubit("padding_8", 1),

  //     wchar_t creatorName[RFL_CREATOR_LEN]; // at 0x36
  _.char16be("creatorName", 0x14)
  // } RFLiCharData;
]);

export const RFLStoreData = _.struct("RFLStoreData", [
  _.struct([RFLCharData]),
  _.uint16("checksum")
]) as Struct;

export type RFLStoreData = {
  RFLCharData: RFLCharData;
  checksum: number;
};
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
