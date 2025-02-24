import _ from "../../external/ffl.js/struct-fu-full";
import type { Struct } from "../../external/ffl.js/struct-fu";
import { RFLStoreData } from "./RFLStoreData";
import {
  calculateCRC16,
  FFLiAuthorID,
  FFLiCreateID,
  Ver3StoreData
} from "./FFLStoreData";
import {
  ToVer3EyeColorTable,
  ToVer3GlassColorTable,
  ToVer3GlassTypeTable,
  ToVer3HairColorTable,
  ToVer3MouthColorTable
} from "../../constants/ColorTables";
import { PropType, type Prop } from "./Props";

export const MiiCreatorV4Data = _.struct([
  _.uint8("miicVersion"),
  _.uint8("originPlatform"),
  _.byte("authorId", 8),
  _.byte("createId", 10),
  _.char16le("creator", 20),
  _.char16le("nickname", 20),
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
  _.uint8("hatFavoriteColor"),
  _.uint8("hatCommonColor"),
  _.uint8("hatType"),
  _.uint8("height"),
  _.uint8("hideNose"),
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
  _.uint8("personality"),
  _.uint8("regionMove"),
  _.uint8("shirtColor"),
  _.uint8("special")
]) as Struct;

export const MiiCreatorV4AppendData = _.struct([
  _.uint8("miicVersion"),

  // common colors
  _.uint8("eyebrowColor"),
  _.uint8("eyeColor"),
  _.uint8("facelineColor"),
  _.uint8("glassColor"),
  _.uint8("glassType"),
  _.uint8("hairColor"),
  _.uint8("mouthColor"),

  // miic specific fields
  _.uint8("birthYear"),
  _.uint8("facePaintColor"),
  _.uint8("hatCommonColor"),
  _.uint8("hatFavoriteColor"),
  _.uint8("hatType"),
  _.uint8("hideNose"), // unused
  _.uint8("originPlatform"), // unused
  _.uint8("pantsColor"),
  _.uint8("personality"),
  _.uint8("shirtColor")
]) as Struct;

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
  hatFavoriteColor: number;
  hatCommonColor: number;
  hatType: number;
  height: number;
  hideNose: number;
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
  personality: number;
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
  nn_mii_Switch = 4,
  Mii_Creator_v3 = 5,
  Mii_Creator_v4 = 5,
  Origin_Platform_Max = 6
}

// Uninitialized values will be -1
const EmptyMiiCreatorData: MiiCreatorV4Data = {
  miicVersion: 4,
  originPlatform: MiiCreatorOriginPlatform.Mii_Creator_v4,
  authorId: new Uint8Array(8),
  createId: new Uint8Array(10),
  creator: "???",
  nickname: "MISSING",
  beardColor: 0,
  beardType: 0,
  birthDay: 0,
  birthMonth: 0,
  birthYear: 0,
  build: 0,
  eyebrowAspect: 3,
  eyebrowColor: 0,
  eyebrowRotate: 0,
  eyebrowScale: 0,
  eyebrowType: 0,
  eyebrowX: 0,
  eyebrowY: 0,
  eyeAspect: 3,
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
  hatFavoriteColor: -1,
  hatCommonColor: -1,
  hatType: -1,
  height: 0,
  hideNose: 0,
  moleScale: 0,
  moleType: 0,
  moleX: 0,
  moleY: 0,
  mouthAspect: 3,
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
  personality: -1,
  regionMove: 0,
  shirtColor: -1,
  special: 0
};
export const EmptyMiiCreatorV4Data = () => ({ ...EmptyMiiCreatorData });

// functions to convert mii creator v4 data into other formats

// idk what this is
export function MiiCreatorV4DataToFFSD<B extends boolean>(
  input: MiiCreatorV4Data,
  pack: B,
  appendBytes?: boolean
): B extends true ? Uint8Array : Ver3StoreData;

export function MiiCreatorV4DataToFFSD(
  input: MiiCreatorV4Data,
  pack: boolean = false,
  appendBytes: boolean = false
): Uint8Array | Ver3StoreData {
  // TODO
  const output: Partial<Ver3StoreData> = {
    author_id: FFLiAuthorID.unpack(input.authorId),
    author_type: 0,
    beard_color: ToVer3HairColorTable[input.beardColor],
    beard_scale: input.mustacheScale,
    beard_type: input.beardType,
    beard_y: input.mustacheY,
    birth_day: input.birthDay,
    birth_month: input.birthMonth,
    birth_platform: Math.min(
      input.originPlatform,
      MiiCreatorOriginPlatform.FFL_Wii_U
    ),
    build: input.build,
    checksum: 0,
    copyable: 1,
    create_id: FFLiCreateID.unpack(input.createId),
    creator: input.creator,
    eye_aspect: input.eyeAspect,
    eye_color: ToVer3EyeColorTable[input.eyeColor],
    eye_rotate: input.eyeRotate,
    eye_scale: input.eyeScale,
    eye_type: input.eyeType,
    eye_x: input.eyeX,
    eye_y: input.eyeY,
    eyebrow_aspect: input.eyebrowAspect,
    eyebrow_color: ToVer3HairColorTable[input.eyebrowColor],
    eyebrow_rotate: input.eyebrowRotate,
    eyebrow_scale: input.eyebrowScale,
    eyebrow_type: input.eyebrowType,
    eyebrow_x: input.eyebrowX,
    eyebrow_y: input.eyebrowY,
    face_color: input.facelineColor,
    face_make: input.facelineMake,
    face_tex: input.facelineWrinkle,
    face_type: input.facelineType,
    favorite: input.favorite,
    favorite_color: input.favoriteColor,
    font_region: input.fontRegion,
    gender: input.gender,
    glass_y: input.glassY,
    glasses_color: ToVer3GlassColorTable[input.glassColor],
    glasses_scale: input.glassScale,
    glasses_type: ToVer3GlassTypeTable[input.glassType],
    hair_color: ToVer3HairColorTable[input.hairColor],
    hair_flip: input.hairFlip,
    hair_type: input.hairType,
    height: input.height,
    localonly: 0,
    mii_version: MiiCreatorOriginPlatform.FFL_Wii_U,
    mole_scale: input.moleScale,
    mole_type: input.moleType,
    mole_x: input.moleX,
    mole_y: input.moleY,
    mouth_aspect: input.mouthAspect,
    mouth_color: ToVer3MouthColorTable[input.mouthColor],
    mouth_scale: input.mouthScale,
    mouth_type: input.mouthType,
    mouth_y: input.mouthY,
    mustache_type: input.mustacheType,
    name: input.nickname,
    ng_word: 0,
    nose_scale: input.noseScale,
    nose_type: input.noseType,
    nose_y: input.noseY,
    // padding is skipped
    // room info not really needed
    position_in_room: 0,
    room_index: 0,
    region_move: 0
  };

  output.checksum = calculateCRC16(Ver3StoreData.pack(output));

  if (pack) {
    if (appendBytes) {
      const ffsdOutput = Ver3StoreData.pack(output);
      const appendedBytes = MiiCreatorV4AppendData.pack(input);

      const finalArray = new Uint8Array(
        ffsdOutput.length + appendedBytes.length
      );
      finalArray.set(ffsdOutput, 0);
      finalArray.set(appendedBytes, ffsdOutput.length);
      return finalArray;
    }
    return Ver3StoreData.pack(output);
  } else return output as Ver3StoreData;
}

// Tables provided by David J. (thanks!)
export const Ver3FaceTypeToVer1 = [0, 1, 2, 3, 4, 5, 6, 7, 2, 1, 4, 7];
export const Ver3FaceMakeToVer1FaceTex = [0, 1, 2, 2, 3, 2, 2, 3, 3];
export const Ver3FaceWrinkleToVer1FaceTex = [0, 1, 2, 2, 3, 2, 2, 3, 3];

export function MiiCreatorV4DataToRSD(
  input: MiiCreatorV4Data,
  pack: boolean = false
) {
  const output: RFLStoreData = {
    beardColor: input.beardColor,
    beardScale: input.mustacheScale,
    beardType: input.beardType,
    beardY: input.mustacheY,
    birthDay: input.birthDay,
    birthMonth: input.birthMonth,
    build: input.build,
    checksum: 0,
    create_id: input.createId,
    creatorName: input.creator,
    eyebrowColor: input.eyebrowColor,
    eyebrowRotate: input.eyebrowRotate,
    eyebrowScale: input.eyebrowScale,
    eyebrowType: input.eyebrowType,
    eyebrowX: input.eyebrowX,
    eyebrowY: input.eyebrowY,
    eyeColor: input.eyeColor,
    eyeRotate: input.eyeRotate,
    eyeScale: input.eyeScale,
    eyeType: input.eyeType,
    eyeX: input.eyeX,
    eyeY: input.eyeY,
    faceColor: input.facelineColor,
    faceTex: input.facelineMake,
    faceType: input.facelineType,
    favorite: input.favorite,
    favoriteColor: input.favoriteColor,
    gender: input.gender,
    glassColor: input.glassColor,
    glassScale: input.glassScale,
    glassType: input.glassType,
    glassY: input.glassY,
    hairColor: input.hairColor,
    hairFlip: input.hairFlip,
    hairType: input.hairType,
    height: input.height,
    localonly: 0,
    moleScale: input.moleScale,
    moleType: input.moleType,
    moleX: input.moleX,
    moleY: input.moleY,
    mouthColor: input.mouthColor,
    mouthScale: input.mouthScale,
    mouthType: input.mouthType,
    mouthY: input.mouthY,
    mustacheType: input.mustacheType,
    name: input.nickname,
    noseScale: input.noseScale,
    noseType: input.noseScale,
    noseY: input.noseY,
    padding0: 0,
    padding_2: 0,
    padding_3: 0,
    padding_4: 0,
    padding_5: 0,
    padding_6: 0,
    padding_8: 0,
    type: 0 // ???
  };
  if (pack) return RFLStoreData.pack(output);
  else return output;
}

export const validationThing: Partial<Record<keyof MiiCreatorV4Data, Prop>> = {
  beardColor: { type: PropType.Number, default: 0, min: 0, max: 99 },
  beardType: { type: PropType.Number, default: 0, min: 0, max: 5 },
  build: { type: PropType.Number, default: 64, min: 0, max: 127 },
  eyeAspect: { type: PropType.Number, default: 3, min: 0, max: 6 },
  eyeColor: { type: PropType.Number, default: 8, min: 0, max: 99 },
  eyeRotate: { type: PropType.Number, default: 4, min: 0, max: 7 },
  eyeScale: { type: PropType.Number, default: 4, min: 0, max: 7 },
  eyeType: { type: PropType.Number, default: 2, min: 0, max: 59 },
  eyeX: { type: PropType.Number, default: 2, min: 0, max: 12 },
  eyeY: { type: PropType.Number, default: 12, min: 0, max: 18 },
  eyebrowAspect: { type: PropType.Number, default: 3, min: 0, max: 6 },
  eyebrowColor: { type: PropType.Number, default: 1, min: 0, max: 99 },
  eyebrowRotate: { type: PropType.Number, default: 6, min: 0, max: 11 },
  eyebrowScale: { type: PropType.Number, default: 4, min: 0, max: 8 },
  eyebrowType: { type: PropType.Number, default: 6, min: 0, max: 24 },
  eyebrowX: { type: PropType.Number, default: 2, min: 0, max: 12 },
  eyebrowY: { type: PropType.Number, default: 10, min: 3, max: 18 },
  facelineColor: { type: PropType.Number, default: 0, min: 0, max: 9 },
  facelineMake: { type: PropType.Number, default: 0, min: 0, max: 11 },
  facelineType: { type: PropType.Number, default: 0, min: 0, max: 11 },
  facelineWrinkle: { type: PropType.Number, default: 0, min: 0, max: 11 },
  favoriteColor: { type: PropType.Number, default: 0, min: 0, max: 11 },
  fontRegion: { type: PropType.Number, default: 0, min: 0, max: 3 },
  gender: { type: PropType.Number, default: 0, min: 0, max: 1 },
  glassColor: { type: PropType.Number, default: 8, min: 0, max: 99 },
  glassScale: { type: PropType.Number, default: 4, min: 0, max: 7 },
  glassType: { type: PropType.Number, default: 0, min: 0, max: 19 },
  glassY: { type: PropType.Number, default: 10, min: 0, max: 20 },
  hairColor: { type: PropType.Number, default: 1, min: 0, max: 99 },
  hairFlip: { type: PropType.Number, default: 0, min: 0, max: 1 },
  hairType: { type: PropType.Number, default: 33, min: 0, max: 131 },
  height: { type: PropType.Number, default: 64, min: 0, max: 127 },
  miicVersion: { type: PropType.Number, default: 4, min: 0, max: 4 },
  moleScale: { type: PropType.Number, default: 4, min: 0, max: 8 },
  moleType: { type: PropType.Number, default: 0, min: 0, max: 1 },
  moleX: { type: PropType.Number, default: 2, min: 0, max: 16 },
  moleY: { type: PropType.Number, default: 20, min: 0, max: 30 },
  mouthAspect: { type: PropType.Number, default: 3, min: 0, max: 6 },
  mouthColor: { type: PropType.Number, default: 19, min: 0, max: 99 },
  mouthScale: { type: PropType.Number, default: 4, min: 0, max: 8 },
  mouthType: { type: PropType.Number, default: 23, min: 0, max: 35 },
  mouthY: { type: PropType.Number, default: 13, min: 0, max: 18 },
  mustacheScale: { type: PropType.Number, default: 4, min: 0, max: 8 },
  mustacheType: { type: PropType.Number, default: 0, min: 0, max: 5 },
  mustacheY: { type: PropType.Number, default: 10, min: 0, max: 16 },
  creator: { type: PropType.String, default: "", min: 0, max: 10 },
  nickname: { type: PropType.String, default: "Mii", min: 1, max: 10 },
  noseScale: { type: PropType.Number, default: 4, min: 0, max: 8 },
  noseType: { type: PropType.Number, default: 1, min: 0, max: 17 },
  noseY: { type: PropType.Number, default: 9, min: 0, max: 18 },
  regionMove: { type: PropType.Number, default: 0, min: 0, max: 3 },

  // mii creator v4 specific features
  authorId: {
    type: PropType.Array,
    default: [0, 0, 0, 0, 0, 0, 0, 0],
    size: 8,
    min: 0,
    max: 255
  },
  birthDay: { type: PropType.Number, default: 0, min: 0, max: 31 },
  birthMonth: { type: PropType.Number, default: 0, min: 0, max: 12 },
  birthYear: { type: PropType.Number, default: 0, min: 0, max: 9999 },
  createId: {
    type: PropType.Array,
    default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    size: 10,
    min: 0,
    max: 255
  },
  facePaintColor: { type: PropType.Number, default: -1, min: -1, max: 99 },
  favorite: { type: PropType.Number, default: 0, min: 0, max: 1 },
  hatCommonColor: { type: PropType.Number, default: -1, min: -1, max: 99 },
  hatFavoriteColor: { type: PropType.Number, default: -1, min: -1, max: 99 },
  hatType: { type: PropType.Number, default: -1, min: -1, max: 9 },
  hideNose: { type: PropType.Number, default: 0, min: 0, max: 1 },
  originPlatform: {
    type: PropType.Number,
    default: MiiCreatorOriginPlatform.Mii_Creator_v4,
    min: 0,
    max: MiiCreatorOriginPlatform.Origin_Platform_Max
  },
  pantsColor: { type: PropType.Number, default: -1, min: -1, max: 99 },
  personality: { type: PropType.Number, default: -1, min: -1, max: 255 },
  shirtColor: { type: PropType.Number, default: -1, min: -1, max: 99 },
  special: { type: PropType.Number, default: 0, min: 0, max: 1 }
};

export function validate(input: MiiCreatorV4Data) {
  let valid = true,
    reasons: string[] = [];

  (Object.keys(input) as (keyof MiiCreatorV4Data)[]).forEach((i) => {
    function fail(reason: string = i) {
      valid = false;
      reasons.push(reason);
    }
    const prop = validationThing[i]!;

    if (!prop) {
      alert("A prop is missing: " + i);
      return;
    }

    switch (prop.type) {
      case PropType.Number: {
        const value = input[i] as number;
        if (value < prop.min) fail();
        if (value > prop.max) fail();
        break;
      }
      case PropType.String: {
        const value = input[i] as string;
        if (value.trim().length < prop.min) fail();
        if (value.trim().length > prop.max) fail();
        break;
      }
      case PropType.Array: {
        // console.log("this isn't supported yet");
        const value = input[i] as Uint8Array;
        if (value.length !== prop.size)
          fail(`${i} size is ${value.length}, expected ${prop.size}`);

        // no idea what this is for if uint8arrays can only store bytes...
        // this also might fix if the array is tampered with
        if (
          Array.from(value).every((i) => i >= prop.min && i <= prop.max) ===
          false
        )
          fail();
        break;
      }
    }
  });

  if (valid) reasons.push("Valid");

  return { valid, reasons };
}
