import * as THREE from "three";
import { createMiiRender, type RenderRequest } from "./util/IconRendering";
import { CharModel, parseHexOrB64ToUint8Array } from "./external/ffl.js/ffl";
import Mii from "./class/MiiData";
import { dataToBase64, dataToHex } from "./util/dataConvert";
import { ForbiddenShirtPantColors } from "./constants/ColorTables";
import { ExtHatNameList } from "./constants/Extensions";
import { BodyType, ShaderType } from "./constants/BodyShaderTypes";
declare function getFFLModule(): any;
declare const getAdditionalDataFromMii: (miiData: Mii) => {
  hatCommonColor: number;
  hatFavoriteColor: number;
  hatType: number;
  pantsColor: number;
  shirtColor: number;
  favorite: number;
  special: number;
  temporary: number;
  eyeSclera: number;
};
declare function loadAssets(resourcePath: string): Promise<void>;
interface CharModelRequest extends RenderRequest {
  followShirtPantsColor: boolean;
  shaderMaterial: string;
}
declare class MiiCreatorCharModel {
  miiGroup: THREE.Group;
  charModel: CharModel;
  constructor(request: CharModelRequest);
}
export {
  BodyType,
  createMiiRender,
  dataToBase64,
  dataToHex,
  ExtHatNameList,
  ForbiddenShirtPantColors,
  getAdditionalDataFromMii,
  getFFLModule,
  loadAssets,
  Mii,
  MiiCreatorCharModel,
  parseHexOrB64ToUint8Array,
  ShaderType
};
