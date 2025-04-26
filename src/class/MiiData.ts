import { allocateArray } from "../util/allocateArray";
import { Ver3StoreData } from "./struct/FFLStoreData";
import { Ver3StoreDataToMiiCreatorV4Data as MiiCreatorV3DataToV4 } from "./struct/MiiCreatorV3Data";
import {
  EmptyMiiCreatorV4Data,
  type MiiCreatorV4Data
} from "./struct/MiiCreatorV4Data";

export default class Mii {
  beardColor!: number;
  beardType!: number;
  build!: number;
  createId!: object;
  eyeAspect!: number;
  eyebrowAspect!: number;
  eyebrowColor!: number;
  eyebrowRotate!: number;
  eyebrowScale!: number;
  eyebrowType!: number;
  eyebrowX!: number;
  eyebrowY!: number;
  eyeColor!: number;
  eyeRotate!: number;
  eyeScale!: number;
  eyeType!: number;
  eyeX!: number;
  eyeY!: number;
  facelineColor!: number;
  facelineMake!: number;
  facelineType!: number;
  facelineWrinkle!: number;
  favorite!: boolean;
  favoriteColor!: number;
  fontRegion!: number;
  gender!: number;
  glassColor!: number;
  glassScale!: number;
  glassType!: number;
  glassY!: number;
  hairColor!: number;
  hairFlip!: number;
  hairType!: number;
  height!: number;
  moleScale!: number;
  moleType!: number;
  moleX!: number;
  moleY!: number;
  mouthAspect!: number;
  mouthColor!: number;
  mouthScale!: number;
  mouthType!: number;
  mouthY!: number;
  mustacheScale!: number;
  mustacheType!: number;
  mustacheY!: number;
  nickname!: string;
  noseScale!: number;
  noseType!: number;
  noseY!: number;
  regionMove!: number;
  special!: boolean;

  constructor(initData: Uint8Array) {
    this.import(Mii.parseData(initData));
  }

  // decodes data of the following types and turns them into the internal data format
  // Switch CharInfo - .charinfo
  static parseData(input: Uint8Array): MiiCreatorV4Data {
    let data: MiiCreatorV4Data = EmptyMiiCreatorV4Data;
    let tempArray: Uint8Array;
    switch (input.length) {
      // 74/76 byte RFLStoreData - .rsd
      case 74:
      case 76:
        tempArray = allocateArray(96, input);
        data = MiiCreatorV3DataToV4(Ver3StoreData.unpack(tempArray));
        break;
      // 92/96-byte Ver3StoreData - .cfsd/.ffsd
      case 92:
      case 96:
      // 106/108-byte Mii Creator Data - .miic
      case 106:
      case 108:
        tempArray = allocateArray(108, input);
        data = MiiCreatorV3DataToV4(Ver3StoreData.unpack(tempArray));
        break;
    }

    return data;
  }

  import(data: MiiCreatorV4Data) {}
}
