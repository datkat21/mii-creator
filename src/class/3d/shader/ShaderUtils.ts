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
  FFLShaderToonMaterial
} from "./FFLShaderAlternateMaterial";

// Worker-friendly copy of getSetting
const getSetting = async (key: string) => {
  const value = (await localforage.getItem("settings_" + key)) as any;

  // hack?
  if (value == null && key === "shaderType") {
    return "wiiu";
  }
  return value;
};

export function traverseAddShader(
  model: THREE.Group<THREE.Object3DEventMap>,
  mii: Mii
) {
  // Traverse the model to access its meshes
  model.traverse((n) => {
    const node = n as THREE.Mesh;
    if (node.isMesh) {
      traverseMesh(node, mii);
    }
  });
}
export async function traverseMesh(node: THREE.Mesh, mpCharInfo: Mii) {
  const shaderSetting = (await getSetting("shaderType")) as ShaderType;
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

  const overrides = await getMaterialOverridesFromShaderType();

  const params = {
    color: new THREE.Color(...modulateColor),
    modulateMode,
    modulateType: modulateType,
    map: originalMaterial.map || undefined,
    side,
    lightEnable: shaderSetting === ShaderType.LightDisabled ? false : true
  };

  switch (shaderSetting) {
    case ShaderType.WiiU:
      finalMat = new FFLShaderMaterial(params) as any;
      break;
    case ShaderType.Switch:
      throw new Error("This shader isn't supported yet");
    case ShaderType.LightDisabled:
      finalMat = new FFLShaderLightDisabledMaterial(params) as any;
      break;
    case ShaderType.Miitomo:
      finalMat = new LUTShaderMaterial(params) as any;
      break;
    case ShaderType.WiiUBlinn:
      finalMat = new FFLShaderBlinnMaterial(params) as any;
      break;
    case ShaderType.WiiUFFLIconWithBody:
      finalMat = new FFLShaderBrightMaterial(params) as any;
      break;
    case ShaderType.WiiUToon:
      finalMat = new FFLShaderToonMaterial(params) as any;
      break;
    default:
      throw new Error("This shader doesn't exist");
  }

  // Assign the custom material to the mesh
  node.material = finalMat;
}

export async function getMaterialOverridesFromShaderType(
  shader: string | undefined = undefined
): Promise<Partial<any> | null> {
  let shaderType = (shader || (await getSetting("shaderType"))) as ShaderType;
  switch (shaderType) {
    case ShaderType.WiiU:
      return null;
    case ShaderType.WiiUBlinn:
      return { customMaterial: FFLBlinnMaterial };
    case ShaderType.WiiUFFLIconWithBody:
      return {
        lightAmbient: cLightAmbientFFLIconWithBody,
        lightDiffuse: cLightDiffuseFFLIconWithBody,
        lightSpecular: cLightSpecularFFLIconWithBody,
        lightDirection: cLightDirFFLIconWithBody
      };
    case ShaderType.WiiUToon:
      return { customMaterial: FFLToonMaterial };
    case ShaderType.LightDisabled:
      return { lightEnable: false };
    case ShaderType.Switch:
      return null;
    case ShaderType.Miitomo:
      return null;
  }
}
export async function getShaderMaterialFromShaderType(type?: string) {
  const shaderType = (type || (await getSetting("shaderType"))) as ShaderType;
  switch (shaderType) {
    case ShaderType.WiiU:
      return FFLShaderMaterial;
    case ShaderType.LightDisabled:
      return FFLShaderLightDisabledMaterial;
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
      return LUTShaderMaterial;
  }
}
