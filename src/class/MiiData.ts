// import Notify from "../ui/components/Notify";
import { allocateArray } from "../util/allocateArray";
import { dataToBase64, dataToHex } from "../util/dataConvert";
import { randomizeUint8Array } from "../util/Numbers";
import {
  FFLiAuthorID,
  FFLiCreateID,
  Ver3StoreData
} from "./struct/FFLStoreData";
import {
  MiiCreatorV3Data,
  MiiCreatorV3DataToMiiCreatorV4Data as MiiCreatorV3DataToV4
} from "./struct/MiiCreatorV3Data";
import {
  EmptyMiiCreatorV4Data,
  MiiCreatorOriginPlatform,
  MiiCreatorV4Data,
  MiiCreatorV4DataToFFSD,
  validate
} from "./struct/MiiCreatorV4Data";
import { NnMiiCharInfo } from "./struct/NnMiiCharInfo";
import {
  RFLStoreData,
  RFLStoreDataToMiiCreatorV4Data
} from "./struct/RFLStoreData";
import { StudioData } from "./struct/StudioData";

import { _ } from "../util/Lang";
import { parseHexOrB64ToUint8Array } from "../util/NumberToHexString";
const __ = _();

export type MiiDataExportType =
  | "rsd"
  | "miic"
  | "studioData"
  | "switchCharInfo"
  | "ffsd"
  | "ffsd_append_miic";

export default class Mii {
  miicVersion!: number;
  originPlatform!: number;
  authorId!: Uint8Array;
  createId!: Uint8Array;
  creator!: string;
  nickname!: string;
  beardColor!: number;
  beardType!: number;
  birthDay!: number;
  birthMonth!: number;
  birthYear!: number;
  build!: number;
  clothesType!: number;
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
  eyeSclera!: number;
  eyeType!: number;
  eyeX!: number;
  eyeY!: number;
  facelineColor!: number;
  facelineMake!: number;
  facelineType!: number;
  facelineWrinkle!: number;
  facePaintColor!: number;
  favorite!: number;
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
  hatCommonColor!: number;
  hatFavoriteColor!: number;
  hatType!: number;
  height!: number;
  wigType!: number;
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
  temporary!: number;
  noseScale!: number;
  noseType!: number;
  noseY!: number;
  pantsColor!: number;
  personality!: number;
  regionMove!: number;
  shirtColor!: number;
  shoesColor!: number;
  special!: number;
  valid!: boolean;

  // create
  constructor(initData: Uint8Array | string) {
    let importData: Uint8Array;

    if (typeof initData === "string")
      importData = parseHexOrB64ToUint8Array(initData);
    else importData = initData;

    this.import(Mii.parseData(importData));
  }

  /** decodes data of the following types and turns them into the internal data format */
  static parseData(input: Uint8Array): MiiCreatorV4Data {
    let data: MiiCreatorV4Data = EmptyMiiCreatorV4Data();
    let tempArray: Uint8Array;
    switch (input.length) {
      // Mii Studio data (decoded)
      case 46:
      case 47:
        tempArray = allocateArray(48, input);
        data = { ...EmptyMiiCreatorV4Data(), ...StudioData.unpack(tempArray) };
        data.originPlatform = MiiCreatorOriginPlatform.Mii_Creator_v4;
        data.nickname = "Mii";
        data.creator = "";
        break;
      // 74/76 byte RFLStoreData - .rsd
      case 74:
      case 76:
        tempArray = allocateArray(96, input);
        data = RFLStoreDataToMiiCreatorV4Data(RFLStoreData.unpack(tempArray));
        break;
      // 87-88 byte nn::mii::CharInfo - .charinfo
      case 87:
      case 88:
        tempArray = allocateArray(88, input);
        const d = NnMiiCharInfo.unpack(tempArray) as NnMiiCharInfo;

        var tmpCreateId = new Uint8Array(10);
        tmpCreateId.set(d.createId.slice(0, 10), 0);
        d.createId = tmpCreateId;

        data = { ...data, ...d };

        // split CharInfo's CreateID
        data.createId.set(d.createId.slice(0, 10), 0);
        data.authorId.set(d.createId.slice(10), 0);
        data.creator = "";
        data.originPlatform = MiiCreatorOriginPlatform.nn_mii_Switch;
        break;
      // 92/94/96-byte Ver3StoreData - .cfsd/.ffsd
      case 92:
      case 94:
      case 96:
        tempArray = allocateArray(108, input);
        data = MiiCreatorV3DataToV4(
          MiiCreatorV3Data.unpack(
            MiiCreatorV3Data.pack(Ver3StoreData.unpack(tempArray) as any)
          )
        );
        break;
      // 104/106/108-byte Mii Creator Data - .miic
      case 104: // + extension colors
      case 106: // + hat color/type
      case 108: // + shirt color/face paint
        tempArray = allocateArray(108, input);
        data = MiiCreatorV3DataToV4(MiiCreatorV3Data.unpack(tempArray));
        break;
      // 114-byte mii creator v4 extension data
      case 114:
        tempArray = allocateArray(123, input);
        data = MiiCreatorV3DataToV4(
          MiiCreatorV3Data.unpack(
            MiiCreatorV3Data.pack(Ver3StoreData.unpack(tempArray) as any)
          )
        );
        break;
      // mii creator v4 data
      case 122:
      case 123:
      case 124:
      case 125:
      case 126:
        tempArray = allocateArray(126, input);
        data = MiiCreatorV4Data.unpack(tempArray);
        if (input.length < 126) {
          data.shoesColor = -1;
        }
        if (input.length < 125) {
          data.clothesType = -1;
        }
        break;
      default:
        throw new Error(
          __("Mii data type not supported (%1 bytes)", input.length)
        );
    }

    // HACK: struct-fu is returning uint of -1 as 255,
    // so we will replace those back here
    if (data.facePaintColor === 255) data.facePaintColor = -1;
    if (data.hatCommonColor === 255) data.hatCommonColor = -1;
    if (data.hatFavoriteColor === 255) data.hatFavoriteColor = -1;
    if (data.hatType === 255) data.hatType = -1;
    if (data.pantsColor === 255) data.pantsColor = -1;
    if (data.personality === 255) data.personality = -1;
    if (data.shirtColor === 255) data.shirtColor = -1;
    if (data.wigType === 255) data.wigType = -1;
    if (data.clothesType === 255) data.clothesType = -1;
    if (data.shoesColor === 255) data.shoesColor = -1;

    // console.log("new data:", data);

    return data;
  }
  static parseDataBinary(input: Uint8Array) {
    const data = Mii.parseData(input);
    return MiiCreatorV4Data.pack(data);
  }

  /** Returns an object version of the current fields */
  #getObject(
    override: Partial<Record<keyof MiiCreatorV4Data, any>> | null = null
  ) {
    return {
      miicVersion: this.miicVersion,
      originPlatform: this.originPlatform,
      authorId: this.authorId,
      createId: this.createId,
      creator: this.creator,
      nickname: this.nickname,
      beardColor: this.beardColor,
      beardType: this.beardType,
      birthDay: this.birthDay,
      birthMonth: this.birthMonth,
      birthYear: this.birthYear,
      build: this.build,
      clothesType: this.clothesType,
      eyeAspect: this.eyeAspect,
      eyebrowAspect: this.eyebrowAspect,
      eyebrowColor: this.eyebrowColor,
      eyebrowRotate: this.eyebrowRotate,
      eyebrowScale: this.eyebrowScale,
      eyebrowType: this.eyebrowType,
      eyebrowX: this.eyebrowX,
      eyebrowY: this.eyebrowY,
      eyeColor: this.eyeColor,
      eyeRotate: this.eyeRotate,
      eyeScale: this.eyeScale,
      eyeSclera: this.eyeSclera,
      eyeType: this.eyeType,
      eyeX: this.eyeX,
      eyeY: this.eyeY,
      facelineColor: this.facelineColor,
      facelineMake: this.facelineMake,
      facelineType: this.facelineType,
      facelineWrinkle: this.facelineWrinkle,
      facePaintColor: this.facePaintColor,
      favorite: this.favorite,
      favoriteColor: this.favoriteColor,
      fontRegion: this.fontRegion,
      gender: this.gender,
      glassColor: this.glassColor,
      glassScale: this.glassScale,
      glassType: this.glassType,
      glassY: this.glassY,
      hairColor: this.hairColor,
      hairFlip: this.hairFlip,
      hairType: this.hairType,
      hatCommonColor: this.hatCommonColor,
      hatFavoriteColor: this.hatFavoriteColor,
      hatType: this.hatType,
      height: this.height,
      wigType: this.wigType,
      moleScale: this.moleScale,
      moleType: this.moleType,
      moleX: this.moleX,
      moleY: this.moleY,
      mouthAspect: this.mouthAspect,
      mouthColor: this.mouthColor,
      mouthScale: this.mouthScale,
      mouthType: this.mouthType,
      mouthY: this.mouthY,
      mustacheScale: this.mustacheScale,
      mustacheType: this.mustacheType,
      mustacheY: this.mustacheY,
      temporary: this.temporary,
      noseScale: this.noseScale,
      noseType: this.noseType,
      noseY: this.noseY,
      pantsColor: this.pantsColor,
      personality: this.personality,
      regionMove: this.regionMove,
      shirtColor: this.shirtColor,
      shoesColor: this.shoesColor,
      special: this.special,
      ...override
    };
  }

  #getNicknameSafe() {
    if (this.nickname.trim() !== "") return this.nickname;
    else return "A Mii";
  }

  /** validate state of current fields */
  verify(): { valid: boolean; reasons: string[] } {
    return validate(this.#getObject());
  }
  validate() {
    const verify = this.verify();
    if (verify.valid === true) this.valid = true;
    else {
      this.valid = false;
      console.warn(
        `${this.#getNicknameSafe()} has invalid data:`,
        verify.reasons.join(", ")
      );
      console.warn(this.export());
      throw new Error(
        `Mii data for ${this.nickname} is not valid: ${verify.reasons.join(
          ", "
        )}`
      );
    }
  }

  /** import existing miic v4 data */
  import(data: MiiCreatorV4Data) {
    this.miicVersion = data.miicVersion;
    this.originPlatform = data.originPlatform;
    this.authorId = data.authorId;
    this.createId = data.createId;
    this.creator = data.creator;
    this.nickname = data.nickname;
    this.beardColor = data.beardColor;
    this.beardType = data.beardType;
    this.birthDay = data.birthDay;
    this.birthMonth = data.birthMonth;
    this.birthYear = data.birthYear;
    this.build = data.build;
    this.clothesType = data.clothesType;
    this.eyeAspect = data.eyeAspect;
    this.eyebrowAspect = data.eyebrowAspect;
    this.eyebrowColor = data.eyebrowColor;
    this.eyebrowRotate = data.eyebrowRotate;
    this.eyebrowScale = data.eyebrowScale;
    this.eyebrowType = data.eyebrowType;
    this.eyebrowX = data.eyebrowX;
    this.eyebrowY = data.eyebrowY;
    this.eyeColor = data.eyeColor;
    this.eyeRotate = data.eyeRotate;
    this.eyeScale = data.eyeScale;
    this.eyeSclera = data.eyeSclera;
    this.eyeType = data.eyeType;
    this.eyeX = data.eyeX;
    this.eyeY = data.eyeY;
    this.facelineColor = data.facelineColor;
    this.facelineMake = data.facelineMake;
    this.facelineType = data.facelineType;
    this.facelineWrinkle = data.facelineWrinkle;
    this.facePaintColor = data.facePaintColor;
    this.favorite = data.favorite;
    this.favoriteColor = data.favoriteColor;
    this.fontRegion = data.fontRegion;
    this.gender = data.gender;
    this.glassColor = data.glassColor;
    this.glassScale = data.glassScale;
    this.glassType = data.glassType;
    this.glassY = data.glassY;
    this.hairColor = data.hairColor;
    this.hairFlip = data.hairFlip;
    this.hairType = data.hairType;
    this.hatFavoriteColor = data.hatFavoriteColor;
    this.hatCommonColor = data.hatCommonColor;
    this.hatType = data.hatType;
    this.height = data.height;
    this.wigType = data.wigType;
    this.moleScale = data.moleScale;
    this.moleType = data.moleType;
    this.moleX = data.moleX;
    this.moleY = data.moleY;
    this.mouthAspect = data.mouthAspect;
    this.mouthColor = data.mouthColor;
    this.mouthScale = data.mouthScale;
    this.mouthType = data.mouthType;
    this.mouthY = data.mouthY;
    this.mustacheScale = data.mustacheScale;
    this.mustacheType = data.mustacheType;
    this.mustacheY = data.mustacheY;
    this.noseScale = data.noseScale;
    this.noseType = data.noseType;
    this.noseY = data.noseY;
    this.pantsColor = data.pantsColor;
    this.personality = data.personality;
    this.regionMove = data.regionMove;
    this.shirtColor = data.shirtColor;
    this.special = data.special;
    this.shoesColor = data.shoesColor;
    this.temporary = data.temporary;

    if (
      this.originPlatform === MiiCreatorOriginPlatform.CFL_3DS ||
      this.originPlatform === MiiCreatorOriginPlatform.FFL_Wii_U
    ) {
      // Parse CreateID just in case
      const createId = FFLiCreateID.unpack(this.createId) as FFLiCreateID;

      if (!createId.flag_normal) {
        this.special = 1;
        // console.warn("Special flag is being overridden due to CreateID.");
      }
      if (createId.flag_temporary) {
        this.special = 0;
        this.temporary = 1;
        // console.warn("Temporary flag is being set due to CreateID.");
      }
    }

    this.fixInternalIDs();
  }

  /** outputs in specific format */
  export(outputFormat: MiiDataExportType = "miic"): Uint8Array {
    // this.validate();
    this.fixInternalIDs();
    switch (outputFormat) {
      case "rsd":
        throw new Error("RSD format is not yet supported.");
      default:
      case "miic":
        return MiiCreatorV4Data.pack(this.#getObject());
      // This is decoded studio data and also invalid if face paint is used,
      // maybe provide a normal studio data export that is encoded properly?
      case "studioData":
        return StudioData.pack(
          this.#getObject({
            facelineColor:
              this.facePaintColor !== -1
                ? this.facePaintColor + 10
                : this.facelineColor
          })
        );
      case "switchCharInfo":
        return NnMiiCharInfo.pack(this.#getObject() as any);
      case "ffsd":
        return MiiCreatorV4DataToFFSD(this.#getObject(), true);
      case "ffsd_append_miic":
        return MiiCreatorV4DataToFFSD(this.#getObject(), true, true);
    }
  }

  exportHex(outputFormat: MiiDataExportType) {
    const data = this.export(outputFormat);
    return dataToHex(data);
  }

  exportBase64(outputFormat: MiiDataExportType) {
    const data = this.export(outputFormat);
    return dataToBase64(data);
  }

  hasExtendedColors(): boolean {
    // TODO: implement a check for non-ver3 colors
    // return true;
    return false;
  }

  // helper function to fix bad AuthorID/CreateID.
  // (3DS/Wii U systems will complain)
  // Easiest solution is to just randomize them
  fixInternalIDs() {
    let createId = FFLiCreateID.unpack(this.createId) as FFLiCreateID;
    const authorId = this.authorId;
    const CREATEID_IS_EMPTY = Array.from(createId.base).every((e) => e === 0);

    // If empty, randomize CreateID base value
    if (CREATEID_IS_EMPTY) {
      createId.base = randomizeUint8Array(createId.base);

      // save modified create id
      this.createId = FFLiCreateID.pack(createId);

      // apply bit mask thing idk what this is
      this.createId[0] = (this.createId[0] & 0b00001111) | 0b11010000;

      // continue modifying current createId
      createId = FFLiCreateID.unpack(this.createId) as FFLiCreateID;
    }

    // If empty, randomize AuthorID value
    if (Array.from(authorId).every((e) => e === 0)) {
      this.authorId = randomizeUint8Array(authorId);
    }

    // Correctly set special flag depending on special data
    if (createId.flag_normal === 0 && this.special === 0) {
      createId.flag_normal = 1;
    }
    if (createId.flag_normal === 1 && this.special === 1) {
      createId.flag_normal = 0;
    }
    // this code sucks
    if (createId.flag_temporary === 0 && this.temporary === 1) {
      createId.flag_temporary = 1;
    }
    if (createId.flag_temporary === 1 && this.temporary === 0) {
      createId.flag_temporary = 0;
    }

    if (!CREATEID_IS_EMPTY) {
      // fix createid by unsetting temporary flag after we parsed it.
      this.createId[0] &= ~0b00100000;

      // continue modifying current createId
      createId = FFLiCreateID.unpack(this.createId) as FFLiCreateID;
    }

    // Re-pack CreateID value
    this.createId = FFLiCreateID.pack(createId);
  }
}
