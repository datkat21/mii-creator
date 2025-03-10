// https://jsfiddle.net/arian_/8gvynrdu/7/
import * as THREE from "three";
// import type { FFLMaterial } from "../../../external/ffl.js/FFLShaderMaterial";
// Material table for FFLDefaultShader mapping to FFLModulateType
// Reference: https://github.com/aboood40091/FFL-Testing/blob/master/src/Shader.cpp
export enum cMaterialName {
  FFL_MODULATE_TYPE_SHAPE_FACELINE,
  FFL_MODULATE_TYPE_SHAPE_BEARD,
  FFL_MODULATE_TYPE_SHAPE_NOSE,
  FFL_MODULATE_TYPE_SHAPE_FOREHEAD,
  FFL_MODULATE_TYPE_SHAPE_HAIR,
  FFL_MODULATE_TYPE_SHAPE_CAP,
  FFL_MODULATE_TYPE_SHAPE_MASK,
  FFL_MODULATE_TYPE_SHAPE_NOSELINE,
  FFL_MODULATE_TYPE_SHAPE_GLASS,
  FFL_MODULATE_TYPE_SHAPE_BODY,
  FFL_MODULATE_TYPE_SHAPE_PANTS
}

export const FFLBlinnMaterial = {
  specularMode: 0
};
export const FFLToonMaterial = {
  ambient: new THREE.Color(0.8, 0.8, 0.8),
  diffuse: new THREE.Color(0.8, 0.8, 0.8),
  specular: new THREE.Color(0.1, 0.1, 0.1),
  specularPower: 0.01,
  specularMode: 0
};

export const cLightAmbientFFLIconWithBody = new THREE.Color(0.5, 0.5, 0.5);
export const cLightDiffuseFFLIconWithBody = new THREE.Color(0.9, 0.9, 0.9);
export const cLightSpecularFFLIconWithBody = new THREE.Color(1.0, 1.0, 1.0);

export const cLightDirGlossy = new THREE.Vector3(-0.35, 1, 0.8);
export const cLightDirFFLIconWithBody = new THREE.Vector3(-0.5, 0.366, 0.785);
// export const cLightDir = new THREE.Vector3(0, 0, 1);
export const cRimColor = new THREE.Vector4(0.3, 0.3, 0.3, 1.0);
export const cRimPower = 2.0;

export type RGBColor = [number, number, number];

// thanks ariankordi for the values extracted below :)

// one of your own miis
export const cPantsColorGray: RGBColor = [0.25098, 0.27451, 0.30588];
// favorite/account mii
export const cPantsColorRed: RGBColor = [0.43922, 0.12549, 0.06275];
// foreign mii from other console
export const cPantsColorBlue: RGBColor = [0.15686, 0.25098, 0.47059];
// special mii created by N
export const cPantsColorGold: RGBColor = [0.75294, 0.62745, 0.18824];

// Simple shader color fixing
export const cPantsColorGrayLinear: RGBColor = [
  0.05126930067255049, 0.061246141699984984, 0.07618418934386001
];
export const cPantsColorRedLinear: RGBColor = [
  0.1620327698875954, 0.014443805936996105, 0.0051820344376627735
];
export const cPantsColorBlueLinear: RGBColor = [
  0.02121835054048093, 0.05126930067255049, 0.18782228580122498
];
export const cPantsColorGoldLinear: RGBColor = [
  0.5271132835871205, 0.3515313874944194, 0.02955820686563641
];

export const cPantsColorGrayHex = "#40464e";
export const cPantsColorRedHex = "#902010";
export const cPantsColorBlueHex = "#284078";
export const cPantsColorGoldHex = "#c0a030";

// Favorite colors (from color table) converted to FFL Shader colors:
export const MiiFavoriteFFLColorLookupTable: Record<number, RGBColor> = {
  0: [0.824, 0.118, 0.078],
  1: [1.0, 0.431, 0.098],
  2: [1.0, 0.847, 0.125],
  3: [0.471, 0.824, 0.125],
  4: [0.0, 0.471, 0.188],
  5: [0.039, 0.282, 0.706],
  6: [0.235, 0.667, 0.871],
  7: [0.961, 0.353, 0.49],
  8: [0.451, 0.157, 0.678],
  9: [0.282, 0.22, 0.094],
  10: [0.878, 0.878, 0.878],
  11: [0.094, 0.094, 0.078]
};
