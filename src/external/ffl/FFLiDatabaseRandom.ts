import { FFLiiGetEyeRotateOffset } from "./FFLiCharInfo";
import {
  RANDOM_PARTS_ARRAY_EYE_COLOR,
  RANDOM_PARTS_ARRAY_EYE_TYPE,
  RANDOM_PARTS_ARRAY_EYEBROW_TYPE,
  RANDOM_PARTS_ARRAY_FACE_LINE,
  RANDOM_PARTS_ARRAY_FACE_MAKEUP,
  RANDOM_PARTS_ARRAY_FACE_TYPE,
  RANDOM_PARTS_ARRAY_FACELINE_COLOR,
  RANDOM_PARTS_ARRAY_HAIR_COLOR,
  RANDOM_PARTS_ARRAY_HAIR_TYPE,
  RANDOM_PARTS_ARRAY_MOUTH_TYPE,
  RANDOM_PARTS_ARRAY_NOSE_TYPE
} from "./RandomParts";
import Mii from "../../class/MiiData";
import {
  FFL_MOUTH_COLOR_MAX,
  FFLFavoriteColor,
  FFLiiGetEyebrowRotateOffset
} from "./FFLTypes";
import { MiiCreatorOriginPlatform } from "../../class/struct/MiiCreatorV4Data";
import {
  Ver3EyeColorTable,
  Ver3GlassColorTable,
  Ver3HairColorTable,
  Ver3MouthColorTable
} from "../../constants/ColorTables";

function DetermineParam(
  pGender: FFLGender,
  pAge: FFLAge,
  pRace: FFLRace
): [FFLGender, FFLAge, FFLRace] {
  let gender: FFLGender = pGender,
    age: FFLAge = pAge,
    race: FFLRace = pRace;

  if (pGender == FFLGender.FFL_GENDER_MAX) {
    // u32 rnd = m_pRandomContext->Random(FFL_GENDER_MAX);
    const rnd = Math.floor(Math.random() * 2);
    gender = rnd == 0 ? FFLGender.FFL_GENDER_MALE : FFLGender.FFL_GENDER_FEMALE;
  }

  if (pAge == FFLAge.FFL_AGE_MAX) {
    // u32 rnd = m_pRandomContext->Random(10);
    // assuming the random is ceil of 1-10
    const rnd = Math.floor(Math.random() * 10);
    age =
      rnd < 4
        ? FFLAge.FFL_AGE_CHILD
        : rnd < 8
          ? FFLAge.FFL_AGE_ADULT
          : FFLAge.FFL_AGE_ELDER;
  }

  if (pRace == FFLRace.FFL_RACE_MAX) {
    // u32 rnd = m_pRandomContext->Random(10);
    const rnd = Math.floor(Math.random() * 10);
    race =
      rnd < 4
        ? FFLRace.FFL_RACE_ASIAN
        : rnd < 8
          ? FFLRace.FFL_RACE_WHITE
          : FFLRace.FFL_RACE_BLACK;
  }

  return [gender, age, race];
}

export enum FFLAge {
  FFL_AGE_CHILD = 0,
  FFL_AGE_ADULT = 1,
  FFL_AGE_ELDER = 2,
  FFL_AGE_MAX = 3
}
export enum FFLGender {
  FFL_GENDER_MALE = 0,
  FFL_GENDER_FEMALE = 1,
  FFL_GENDER_MAX = 2
}
export enum FFLRace {
  FFL_RACE_BLACK = 0,
  FFL_RACE_WHITE = 1,
  FFL_RACE_ASIAN = 2,
  FFL_RACE_MAX = 3
}

function GetRandomGlassType(age: FFLAge) {
  let target = Math.floor(Math.random() * 100);
  let type = 0;
  while (target >= RANDOM_GLASS_TYPE[age][type]) type++;

  return type;
}

export function GetRandomParts(array: any[]) {
  return array[1][Math.floor(Math.random() * array[0])];
}

const RANDOM_GLASS_TYPE: any[] = [
  [90, 94, 96, 100, 0, 0, 0, 0, 0],
  [83, 86, 90, 93, 94, 96, 98, 100, 0],
  [78, 83, 0, 93, 0, 0, 98, 100, 0]
];

// set these fields to "lock in" options when generating a random Mii
export interface FFLiDatabaseRandom_GetInit {
  age?: FFLAge;
  gender?: FFLGender;
  race?: FFLRace;
  /** 0-11 */
  favoriteColor?: number;
  /** 0-7 */
  hairColor?: number;
  /** 0-5 */
  eyeColor?: number;
}

// void FFLiDatabaseRandom::Get(FFLiCharInfo* pCharInfo, FFLGender gender, FFLAge age, FFLRace race)
export function FFLiDatabaseRandom_Get(
  pCharInfo: Mii,
  fixedSettings: FFLiDatabaseRandom_GetInit
) {
  // {
  let [pGender, pAge, pRace] = [
    FFLGender.FFL_GENDER_MAX,
    FFLAge.FFL_AGE_MAX,
    FFLRace.FFL_RACE_MAX
  ];
  let [gender, age, race] = DetermineParam(pGender, pAge, pRace);

  if (fixedSettings.age !== undefined) {
    age = fixedSettings.age;
  }
  if (fixedSettings.gender !== undefined) {
    gender = fixedSettings.gender;
  }
  if (fixedSettings.race !== undefined) {
    race = fixedSettings.race;
  }

  console.log("Gender,age,race", gender, age, race);

  //     pCharInfo.miiVersion = 3;
  pCharInfo.originPlatform = MiiCreatorOriginPlatform.FFL_Wii_U;
  //     s32 basePositionY = 0;
  let basePositionY = 0;
  //     if (gender == FFL_GENDER_FEMALE || age == FFL_AGE_CHILD)
  //         basePositionY = m_pRandomContext->Random(3);
  if (gender == FFLGender.FFL_GENDER_FEMALE || age == FFLAge.FFL_AGE_CHILD)
    basePositionY = Math.floor(Math.random() * 3);
  //     pCharInfo.faceType = GetRandomParts(RANDOM_PARTS_ARRAY_FACE_TYPE[gender][age][race], m_pRandomContext);
  //     pCharInfo.facelineColor = GetRandomParts(RANDOM_PARTS_ARRAY_FACELINE_COLOR[gender][race], m_pRandomContext);
  //     pCharInfo.faceLine = GetRandomParts(RANDOM_PARTS_ARRAY_FACE_LINE[gender][age][race], m_pRandomContext);
  //     pCharInfo.faceMakeup = GetRandomParts(RANDOM_PARTS_ARRAY_FACE_MAKEUP[gender][age][race], m_pRandomContext);
  //     pCharInfo.hairType = GetRandomParts(RANDOM_PARTS_ARRAY_HAIR_TYPE[gender][age][race], m_pRandomContext);
  //     pCharInfo.hairColor = GetRandomParts(RANDOM_PARTS_ARRAY_HAIR_COLOR[race][age], m_pRandomContext);
  //     pCharInfo.hairDir = m_pRandomContext->Random(FFL_HAIR_DIR_MAX);
  //     pCharInfo.eyeType = GetRandomParts(RANDOM_PARTS_ARRAY_EYE_TYPE[gender][age][race], m_pRandomContext);
  //     pCharInfo.eyeColor = GetRandomParts(RANDOM_PARTS_ARRAY_EYE_COLOR[race], m_pRandomContext);
  //     pCharInfo.eyeScale = 4;
  //     pCharInfo.eyeScaleY = 3;
  //     s32 eyeRotateOffsetTarget;
  pCharInfo.facelineType = GetRandomParts(
    RANDOM_PARTS_ARRAY_FACE_TYPE[gender][age][race]
  );
  pCharInfo.facelineColor = GetRandomParts(
    RANDOM_PARTS_ARRAY_FACELINE_COLOR[gender][race]
  );
  pCharInfo.facelineWrinkle = GetRandomParts(
    RANDOM_PARTS_ARRAY_FACE_LINE[gender][age][race]
  );
  pCharInfo.facelineMake = GetRandomParts(
    RANDOM_PARTS_ARRAY_FACE_MAKEUP[gender][age][race]
  );
  pCharInfo.hairType = GetRandomParts(
    RANDOM_PARTS_ARRAY_HAIR_TYPE[gender][age][race]
  );
  pCharInfo.hairColor =
    Ver3HairColorTable[
      GetRandomParts(RANDOM_PARTS_ARRAY_HAIR_COLOR[race][age])
    ];
  if (fixedSettings.hairColor !== undefined) {
    pCharInfo.hairColor = Ver3HairColorTable[fixedSettings.hairColor];
  }
  pCharInfo.hairFlip = Math.ceil(Math.random() * 2) - 1;
  pCharInfo.eyeType = GetRandomParts(
    RANDOM_PARTS_ARRAY_EYE_TYPE[gender][age][race]
  );
  pCharInfo.eyeColor =
    Ver3EyeColorTable[GetRandomParts(RANDOM_PARTS_ARRAY_EYE_COLOR[race])];
  if (fixedSettings.eyeColor !== undefined) {
    pCharInfo.eyeColor = Ver3EyeColorTable[fixedSettings.eyeColor];
  }
  pCharInfo.eyeScale = 4;
  pCharInfo.eyeAspect = 3;
  let eyeRotateOffsetTarget: number;
  if (gender == FFLGender.FFL_GENDER_MALE) {
    pCharInfo.eyeRotate = 4;
    eyeRotateOffsetTarget = FFLiiGetEyeRotateOffset(2);
  } else {
    pCharInfo.eyeRotate = 3;
    eyeRotateOffsetTarget = FFLiiGetEyeRotateOffset(4);
  }
  const eyeRotateOffsetBase = FFLiiGetEyeRotateOffset(pCharInfo.eyeType);
  pCharInfo.eyeX = 2;
  pCharInfo.eyeY = basePositionY + 12;
  pCharInfo.eyeRotate += eyeRotateOffsetTarget - eyeRotateOffsetBase;
  pCharInfo.eyebrowType = GetRandomParts(
    RANDOM_PARTS_ARRAY_EYEBROW_TYPE[gender][age][race]
  );
  pCharInfo.eyebrowColor = pCharInfo.hairColor;
  pCharInfo.eyebrowScale = 4;
  pCharInfo.eyebrowAspect = 3;
  pCharInfo.eyebrowRotate = 6;
  pCharInfo.eyebrowX = 2;
  let eyebrowRotateOffsetTarget;
  if (race == FFLRace.FFL_RACE_ASIAN) {
    pCharInfo.eyebrowY = basePositionY + 9;
    eyebrowRotateOffsetTarget = FFLiiGetEyebrowRotateOffset(6);
  } else {
    pCharInfo.eyebrowY = basePositionY + 10;
    eyebrowRotateOffsetTarget = FFLiiGetEyebrowRotateOffset(0);
  }
  const eyebrowRotateOffsetBase = FFLiiGetEyebrowRotateOffset(
    pCharInfo.eyebrowType
  );
  pCharInfo.eyebrowRotate +=
    eyebrowRotateOffsetTarget - eyebrowRotateOffsetBase;
  pCharInfo.noseType = GetRandomParts(
    RANDOM_PARTS_ARRAY_NOSE_TYPE[gender][age][race]
  );
  pCharInfo.noseScale = gender == FFLGender.FFL_GENDER_MALE ? 4 : 3;
  pCharInfo.noseY = basePositionY + 9;
  pCharInfo.mouthType = GetRandomParts(
    RANDOM_PARTS_ARRAY_MOUTH_TYPE[gender][age][race]
  );
  pCharInfo.mouthColor =
    Ver3MouthColorTable[
      gender == FFLGender.FFL_GENDER_MALE
        ? 0
        : Math.floor(Math.random() * FFL_MOUTH_COLOR_MAX)
    ];
  pCharInfo.mouthScale = 4;
  pCharInfo.mouthAspect = 3;
  pCharInfo.mouthY = basePositionY + 13;
  let mustacheType, beardType, mustachePositionY;
  if (
    gender == FFLGender.FFL_GENDER_MALE &&
    (age == FFLAge.FFL_AGE_ADULT || age == FFLAge.FFL_AGE_ELDER) &&
    Math.floor(Math.random() * 10) < 2
  ) {
    mustacheType = 0;
    let randomBeardType = false;
    switch (Math.floor(Math.random() * 3)) {
      case 0:
        randomBeardType = true;
        break;
      //@ts-ignore fallthrough
      case 2:
        randomBeardType = true; // fall-through
      case 1:
        mustacheType = Math.floor(Math.random() * 5) + 1;
        break;
    }
    beardType = randomBeardType ? Math.floor(Math.random() * 5) + 1 : 0;
    mustachePositionY = 10;
  } else {
    mustacheType = 0;
    beardType = 0;
    mustachePositionY = basePositionY + 10;
  }
  pCharInfo.mustacheType = mustacheType;
  pCharInfo.beardType = beardType;
  pCharInfo.beardColor = pCharInfo.hairColor;
  pCharInfo.mustacheScale = 4;
  pCharInfo.mustacheY = mustachePositionY;
  pCharInfo.glassType = GetRandomGlassType(age);
  pCharInfo.glassColor = Ver3GlassColorTable[Math.floor(Math.random() * 6)];
  pCharInfo.glassScale = 4;
  pCharInfo.glassY = basePositionY + 10;
  pCharInfo.moleType = 0;
  pCharInfo.moleScale = 4;
  pCharInfo.moleX = 2;
  pCharInfo.moleY = 20;
  pCharInfo.height = 64;
  pCharInfo.build = 64;
  pCharInfo.nickname = "no name";
  // creator name is unset
  pCharInfo.gender = gender;
  pCharInfo.birthMonth = 0;
  pCharInfo.birthDay = 0;
  pCharInfo.favoriteColor = Math.floor(
    Math.random() * FFLFavoriteColor.FFL_FAVORITE_COLOR_MAX
  );
  if (fixedSettings.favoriteColor !== undefined) {
    pCharInfo.favoriteColor = fixedSettings.favoriteColor;
  }
  pCharInfo.favorite = 0;
}

//@ts-expect-error Debugging
window.mii = Mii;
//@ts-expect-error Debugging
window.FFLiDatabaseRandom_Get = FFLiDatabaseRandom_Get;
