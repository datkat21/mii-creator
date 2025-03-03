import type { GLTF } from "three/examples/jsm/Addons.js";
// import Mii from "../external/mii-js/mii";
import Mii from "../class/MiiData";
import * as THREE from "three";
import {
  CharModel,
  convertStudioCharInfoToFFLiCharInfo,
  createCharModel,
  FFLCharModelDescDefault,
  FFLiCharInfo,
  FFLModelFlag,
  initCharModelTextures,
  StudioCharInfo,
  updateCharModel
} from "../external/ffl.js/ffl";
import { getFFL } from "../main";
import {
  getMaterialOverridesFromShaderType,
  getShaderMaterialFromShaderType
} from "../class/3d/shader/ShaderUtils";

export type GLTFLike = {
  animations: any[];
  asset: {};
  cameras: any[];
  parser: any;
  scene: THREE.Object3D;
  scenes: any[];
  userData: any;
};

export type ModelFlag =
  | "NORMAL"
  | "HAT"
  | "FACE_ONLY"
  | "FLATTEN_NOSE"
  | "NEW_EXPRESSIONS"
  | "NEW_MASK_ONLY";

async function createOrUpdateCharModel(
  rendererRef: THREE.WebGLRenderer,
  modelDesc: any,
  newStudioData: Uint8Array,
  charModelRef?: CharModel
) {
  let currentCharModel: CharModel;
  if (charModelRef) {
    if (!rendererRef)
      throw new Error("Missing renderer when trying to update CharModel");

    currentCharModel = charModelRef;

    // Create new charinfo data
    const studioCharInfo = StudioCharInfo.unpack(newStudioData);
    const newCharInfo = FFLiCharInfo.pack(
      convertStudioCharInfoToFFLiCharInfo(studioCharInfo)
    );

    // update char model
    updateCharModel(currentCharModel, newCharInfo, rendererRef, modelDesc);
  } else {
    currentCharModel = createCharModel(
      newStudioData,
      modelDesc,
      await getShaderMaterialFromShaderType(),
      getFFL(),
      false,
      await getMaterialOverridesFromShaderType()
    );
  }

  return currentCharModel;
}

export async function getHeadModel(
  mii: Mii,
  rendererRef: THREE.WebGLRenderer,
  modelFlag?: ModelFlag,
  texResolution?: number
): Promise<GLTF> {
  const dataU8 = mii.export("studioData");

  const modelDesc = FFLCharModelDescDefault;
  modelDesc.resolution = 512;
  modelDesc.allExpressionFlag = new Uint32Array([1, 0, 0]);
  if (modelFlag) modelDesc.modelFlag = FFLModelFlag[modelFlag];
  if (texResolution) modelDesc.resolution = texResolution;

  let currentCharModel: CharModel | null;

  try {
    // currentCharModel = await createOrUpdateCharModel(
    //   rendererRef,
    //   modelDesc,
    //   dataU8,
    //   charModelRef
    // );

    currentCharModel = createCharModel(
      dataU8,
      modelDesc,
      await getShaderMaterialFromShaderType(),
      getFFL(),
      false,
      await getMaterialOverridesFromShaderType()
    );

    // Initialize textures for the new CharModel.
    initCharModelTextures(currentCharModel, rendererRef);
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
  img: THREE.DataTexture;
};

export async function getMaskTex(
  mii: Mii,
  rendererRef: THREE.WebGLRenderer,
  expressionFlag: Uint32Array = new Uint32Array([1, 0, 0])
): Promise<MaskResult> {
  const dataU8 = mii.export("studioData");

  const modelDesc = FFLCharModelDescDefault;
  modelDesc.resolution = 512;
  modelDesc.allExpressionFlag = expressionFlag;

  let currentCharModel: CharModel | null;

  var img: THREE.DataTexture;

  try {
    currentCharModel = createCharModel(
      dataU8,
      modelDesc,
      // shader doesn't matter here for our purpose
      window.LUTShaderMaterial,
      getFFL(),
      false,
      {}
    );

    // weird workaround to promisify the texture outcome?
    img = await new Promise((resolve) => {
      // Initialize textures for the new CharModel.
      initCharModelTextures(
        currentCharModel!,
        rendererRef,
        null,
        (dataTexture) => {
          resolve(dataTexture);
        }
      );
    });
  } catch (err) {
    currentCharModel = null;
    alert(`Error creating/updating CharModel: ${err}`);
    console.error("Error creating/updating CharModel:", err);
    throw err;
  }

  return { img, model: currentCharModel };
}
