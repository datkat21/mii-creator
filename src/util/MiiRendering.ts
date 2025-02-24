import type { GLTF } from "three/examples/jsm/Addons.js";
// import Mii from "../external/mii-js/mii";
import Mii from "../class/MiiData";
import * as THREE from "three";
import { RandomInt } from "./Numbers";
import { cMaterialName } from "../class/3d/shader/fflShaderConst";
import {
  CharModel,
  convertStudioCharInfoToFFLiCharInfo,
  createCharModel,
  FFLCharModelDesc,
  FFLCharModelDescDefault,
  FFLiCharInfo,
  FFLModelFlag,
  initCharModelTextures,
  setMaskTextureHook,
  StudioCharInfo,
  updateCharModel
} from "../external/ffl.js/ffl";
import { getFFL } from "../main";
import { getTempRenderer } from "../ui/pages/Library";
import type { Mii3DScene } from "../class/3DScene";

export type GLTFLike = {
  animations: any[];
  asset: {};
  cameras: any[];
  parser: any;
  scene: THREE.Object3D;
  scenes: any[];
  userData: any;
};

function wait(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export type ModelFlag =
  | "NORMAL"
  | "HAT"
  | "FACE_ONLY"
  | "FLATTEN_NOSE"
  | "NEW_EXPRESSIONS"
  | "NEW_MASK_ONLY";

export async function getHeadModel(
  mii: Mii,
  Mii3DScene: Mii3DScene,
  modelFlag: ModelFlag,
  charModelRef?: CharModel,
  rendererRef?: THREE.WebGLRenderer,
  descOrExpFlag?: Object | any[] | Uint32Array | null
): Promise<GLTF> {
  // In the future, this could be hooked up to a custom rendering library (FFL under WASM or a custom asset loader)
  // For now, this will just return a cube with some FFL shader properties to test if it's working.

  const dataU8 = mii.export("studioData");

  const modelDesc = FFLCharModelDescDefault;
  modelDesc.resolution = 512;
  modelDesc.allExpressionFlag = new Uint32Array([1, 0, 0]);
  modelDesc.modelFlag = FFLModelFlag[modelFlag];

  let currentCharModel: CharModel | null;

  try {
    if (charModelRef) {
      if (!rendererRef)
        throw new Error("Missing renderer when trying to update CharModel");

      currentCharModel = charModelRef;

      // Create new charinfo data
      const studioCharInfo = StudioCharInfo.unpack(dataU8);
      const newCharInfo = FFLiCharInfo.pack(
        convertStudioCharInfoToFFLiCharInfo(studioCharInfo)
      );

      // update char model
      updateCharModel(currentCharModel, newCharInfo, rendererRef, modelDesc);
    } else {
      currentCharModel = createCharModel(
        dataU8,
        modelDesc,
        window.LUTShaderMaterial,
        // window.FFLShaderMaterial,
        getFFL(),
        false
      );
    }
    // Initialize textures for the new CharModel.
    initCharModelTextures(currentCharModel, Mii3DScene.getRenderer());
  } catch (err) {
    currentCharModel = null;
    alert(`Error creating/updating CharModel: ${err}`);
    console.error("Error creating/updating CharModel:", err);
    throw err;
  }

  const asset = {
    extras: {
      partsTransform: {
        hatTranslate: [0, 0, 0]
      }
    }
  };

  let scene = new THREE.Group();

  scene.add(currentCharModel.meshes);

  // GLTF-like object so that the code can still handle it sort of like one
  return {
    animations: [],
    asset,
    cameras: [],
    parser: {},
    scene,
    scenes: [scene],
    userData: {},
    CharModel: currentCharModel
  } as GLTFLike as GLTF;
}

export type MaskResult = {
  model: CharModel;
  img: string;
};

export async function getMaskTex(
  mii: Mii,
  Mii3DScene: Mii3DScene
): Promise<MaskResult> {
  // In the future, this could be hooked up to a custom rendering library (FFL under WASM or a custom asset loader)
  // For now, this will just return a cube with some FFL shader properties to test if it's working.

  const dataU8 = mii.export("studioData");

  const modelDesc = FFLCharModelDescDefault;
  modelDesc.resolution = 512;
  modelDesc.allExpressionFlag = new Uint32Array([1, 0, 0]);

  let currentCharModel: CharModel | null;

  var img = "";

  try {
    currentCharModel = createCharModel(
      dataU8,
      modelDesc,
      window.LUTShaderMaterial,
      // window.FFLShaderMaterial,
      getFFL(),
      false
    );

    // weird workaround to promisify the texture outcome?
    img = await new Promise((resolve) => {
      setMaskTextureHook((dataURL: any) => {
        resolve(dataURL.result);
      });
      // Initialize textures for the new CharModel.
      initCharModelTextures(currentCharModel!, Mii3DScene.getRenderer());
    });
  } catch (err) {
    currentCharModel = null;
    alert(`Error creating/updating CharModel: ${err}`);
    console.error("Error creating/updating CharModel:", err);
    throw err;
  }

  return { img, model: currentCharModel };
}
