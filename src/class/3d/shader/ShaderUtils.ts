import * as THREE from "three";
import {
  cLightAmbientFFLIconWithBody,
  cLightDiffuseFFLIconWithBody,
  cLightDirFFLIconWithBody,
  cLightSpecularFFLIconWithBody,
  cMaterialName,
  FFLBlinnMaterial,
  FFLToonMaterial
} from "./fflShaderConst";
import { switchFragmentShader, switchVertexShader } from "./SwitchShader";
import {
  cBeardMaterials,
  cBodyMaterials,
  cFacelineMaterials,
  cGlassMaterial,
  cHairMaterials,
  cHatMaterials,
  cMaskMaterial,
  cNoseMaterials,
  cPantsMaterials,
  FFLI_NN_MII_COMMON_COLOR_MASK,
  type DrawParamMaterial
} from "./SwitchShaderMaterials";
// import type Mii from "../../../external/mii-js/mii";
import type Mii from "../../../class/MiiData";
import { ShaderType } from "../../../constants/BodyShaderTypes";
import FFLShaderMaterial from "../../../external/ffl.js/FFLShaderMaterial";
import LUTShaderMaterial from "../../../external/ffl.js/LUTShaderMaterial";
import localforage from "localforage";
import {
  FFLShaderBlinnMaterial,
  FFLShaderBrightMaterial,
  FFLShaderLightDisabledMaterial,
  FFLShaderToonMaterial,
  LUTShaderPretendoMaterial
} from "./FFLShaderAlternateMaterial";

// Worker-friendly copy of getSetting
export const getSettingSafe = async (key: string) => {
  const value = (await localforage.getItem("settings_" + key)) as any;

  // hack?
  if (value == null && key === "shaderType") {
    return "wiiu";
  }
  return value;
};

export function traverseAddShader(
  model: THREE.Group<THREE.Object3DEventMap>,
  shaderType: ShaderType
) {
  // Traverse the model to access its meshes
  model.traverse((n) => {
    const node = n as THREE.Mesh;
    if (node.isMesh) {
      traverseMesh(node, shaderType);
    }
  });
}
export async function traverseMesh(node: THREE.Mesh, shaderType: ShaderType) {
  const shaderSetting =
    shaderType || ((await getSettingSafe("shaderType")) as ShaderType);
  const originalMaterial = node.material as THREE.MeshBasicMaterial;

  // Access userData from geometry
  const userData = node.geometry.userData;

  if (userData.ignore !== undefined) {
    if (userData.ignore === 1) return;
  }

  // Retrieve modulateType and map to material parameters
  let modulateType = userData.modulateType;
  if (userData.modulateType === undefined)
    console.warn(`Mesh "${node.name}" is missing "modulateType" in userData.`);

  // HACK for now: disable lighting on mask, glass, noseline
  // (Because there is some lighting bug affecting
  // those that does not happen in FFL-Testing)
  const lightEnable = modulateType > 5 ? false : true;
  // Select material parameter based on the modulate type, default to faceline
  let materialParam: any =
    modulateType !== undefined
      ? modulateType && modulateType < 9
        ? FFLShaderMaterial.materialParams[modulateType]
        : FFLShaderMaterial.materialParams[0]
      : FFLShaderMaterial.materialParams[0];

  // Retrieve modulateMode, defaulting to constant color
  let modulateMode =
    userData.modulateMode === undefined ? 0 : userData.modulateMode;

  // Retrieve modulateColor (vec3)
  let modulateColor;
  if (!userData.modulateColor) {
    console.warn(`Mesh "${node.name}" is missing "modulateColor" in userData.`);
    // Default to red if missing
    modulateColor = new THREE.Vector4(1, 0, 0, 1);
  } else {
    modulateColor = new THREE.Vector4(...userData.modulateColor, 1);
  }
  THREE.ColorManagement.enabled = false;

  // Define macros based on the presence of textures
  const defines: Record<string, any> = {};

  // let tex: THREE.Texture | null = null;

  if (originalMaterial.map) {
    defines.USE_MAP = "";

    // try to fix it some more.. lol
    originalMaterial.map.colorSpace = THREE.LinearSRGBColorSpace;
    originalMaterial.needsUpdate = true;
  }

  // Function to Map FFLCullMode to three.js material side
  let side = originalMaterial.side;
  if (userData.cullMode !== undefined) {
    switch (userData.cullMode) {
      case 0: // FFL_CULL_MODE_NONE
        side = THREE.DoubleSide; // No culling
        break;
      case 1: // FFL_CULL_MODE_BACK
        side = THREE.FrontSide; // Cull back faces, render front
        break;
      case 2: // FFL_CULL_MODE_FRONT
        side = THREE.BackSide; // Cull front faces, render back
        break;
    }
  }

  let finalMat: THREE.Material;

  const isUsingShader = await isShaderMaterial();

  let modulate = isUsingShader
    ? {
        modulateMode,
        modulateType: modulateType,
        lightEnable: shaderSetting === ShaderType.LightDisabled ? false : true
      }
    : {};

  const params = {
    color: new THREE.Color(...modulateColor),
    ...modulate,
    map: originalMaterial.map || undefined,
    side
  };

  let shaderMaterial = await getShaderMaterialFromShaderType(shaderSetting);

  finalMat = new shaderMaterial(params) as any;
  // switch (shaderSetting) {
  //   case ShaderType.WiiU:
  //     finalMat = new FFLShaderMaterial(params) as any;
  //     break;
  //   case ShaderType.Switch:
  //     throw new Error("This shader isn't supported yet");
  //   case ShaderType.LightDisabled:
  //     finalMat = new FFLShaderLightDisabledMaterial(params) as any;
  //     break;
  //   case ShaderType.Miitomo:
  //     finalMat = new LUTShaderMaterial(params) as any;
  //     break;
  //   case ShaderType.MiitomoBasic:
  //     finalMat = new LUTShaderPretendoMaterial(params) as any;
  //     break;
  //   case ShaderType.WiiUBlinn:
  //     finalMat = new FFLShaderBlinnMaterial(params) as any;
  //     break;
  //   case ShaderType.WiiUFFLIconWithBody:
  //     finalMat = new FFLShaderBrightMaterial(params) as any;
  //     break;
  //   case ShaderType.WiiUToon:
  //     finalMat = new FFLShaderToonMaterial(params) as any;
  //     break;
  //   default:
  //     throw new Error("This shader doesn't exist");
  // }

  // Assign the custom material to the mesh
  node.material = finalMat;
}

export async function isShaderMaterial(
  shader: string | undefined = undefined
): Promise<boolean> {
  let shaderType = (shader ||
    (await getSettingSafe("shaderType"))) as ShaderType;
  switch (shaderType) {
    case ShaderType.WiiU:
    case ShaderType.WiiUBlinn:
    case ShaderType.WiiUFFLIconWithBody:
    case ShaderType.WiiUToon:
    case ShaderType.Switch:
    case ShaderType.Miitomo:
    case ShaderType.MiitomoBasic:
      return true;
    case ShaderType.LightDisabled:
    case ShaderType.ThreeToon:
    case ShaderType.ThreePhong:
      return false;
  }
}
export async function getShaderMaterialFromShaderType(type?: string) {
  const shaderType = (type ||
    (await getSettingSafe("shaderType"))) as ShaderType;
  switch (shaderType) {
    case ShaderType.WiiU:
      return FFLShaderMaterial;
    case ShaderType.LightDisabled:
      return THREE.MeshBasicMaterial;
    case ShaderType.WiiUBlinn:
      return FFLShaderBlinnMaterial;
    case ShaderType.WiiUFFLIconWithBody:
      return FFLShaderBrightMaterial;
    case ShaderType.WiiUToon:
      return FFLShaderToonMaterial;
    case ShaderType.Switch:
      // todo: switch should have its own material class?
      return FFLShaderMaterial;
    case ShaderType.Miitomo:
      // return LUTShaderMaterial;
      return LUTShaderMaterial;
    case ShaderType.MiitomoBasic:
      return LUTShaderPretendoMaterial;
    case ShaderType.ThreeToon:
      return THREE.MeshToonMaterial;
    case ShaderType.ThreePhong:
      return THREE.MeshPhongMaterial;
  }
}

const ThreeMaterialStandardLights = (scene: THREE.Scene) => {
  const intensity = Number(THREE.REVISION) >= 155 ? Math.PI : 1;
  const ambientLight = new THREE.AmbientLight(
    new THREE.Color(0.73, 0.73, 0.73),
    intensity
  );
  const directionalLight = new THREE.DirectionalLight(
    new THREE.Color(0.6, 0.6, 0.6),
    intensity
  );
  directionalLight.position.set(-0.455, 0.348, 0.5);

  ambientLight.name = "ambientLight";
  directionalLight.name = "directionalLight";

  scene.add(ambientLight, directionalLight);
};
const ThreeMaterialToonLights = (scene: THREE.Scene) => {
  const intensity = 2.5;
  const ambientLight = new THREE.AmbientLight(
    new THREE.Color(0.73, 0.73, 0.73),
    intensity
  );
  const directionalLight = new THREE.DirectionalLight(
    new THREE.Color(0.6, 0.6, 0.6),
    intensity
  );
  directionalLight.position.set(-0.255, 0.348, 0.5);

  ambientLight.name = "ambientLight";
  directionalLight.name = "directionalLight";

  scene.add(ambientLight, directionalLight);
};

export async function getSimpleMaterialAddLights(
  type?: string
): Promise<((scene: THREE.Scene) => any) | undefined> {
  const shaderType = (type ||
    (await getSettingSafe("shaderType"))) as ShaderType;
  switch (shaderType) {
    case ShaderType.WiiU:
    case ShaderType.WiiUBlinn:
    case ShaderType.WiiUFFLIconWithBody:
    case ShaderType.WiiUToon:
    case ShaderType.Switch:
    case ShaderType.Miitomo:
    case ShaderType.MiitomoBasic:
      return;
    case ShaderType.LightDisabled:
    case ShaderType.ThreePhong:
      return ThreeMaterialStandardLights;
    case ShaderType.ThreeToon:
      return ThreeMaterialToonLights;
  }
}
export function cleanupLights(scene: THREE.Scene) {
  let amb = scene.getObjectByName("ambientLight");
  let dir = scene.getObjectByName("directionalLight");

  if (amb) scene.remove(amb);
  if (dir) scene.remove(dir);
}
