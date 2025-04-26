// https://jsfiddle.net/arian_/8gvynrdu/7/
import * as THREE from "three";
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

export const FFLBlinnMaterial: Partial<FFLShaderMaterial> = {
  specularMode: 0
};
export const FFLGlossMaterial: Partial<FFLShaderMaterial> = {
  ambient: new THREE.Vector4(0.8, 0.8, 0.8, 1),
  diffuse: new THREE.Vector4(0.8, 0.8, 0.8, 1),
  specular: new THREE.Vector4(0.1, 0.1, 0.1, 1),
  specularPower: 0.01,
  specularMode: 0
};

export type FFLShaderMaterial = {
  ambient: THREE.Vector4;
  diffuse: THREE.Vector4;
  specular: THREE.Vector4;
  specularPower: number;
  specularMode: number;
};

export const cMaterialParam = [
  {
    // FFL_MODULATE_TYPE_SHAPE_FACELINE
    ambient: new THREE.Vector4(0.85, 0.75, 0.75, 1.0),
    diffuse: new THREE.Vector4(0.75, 0.75, 0.75, 1.0),
    specular: new THREE.Vector4(0.3, 0.3, 0.3, 1.0),
    specularPower: 1.2,
    specularMode: 0
  },
  {
    // FFL_MODULATE_TYPE_SHAPE_BEARD
    ambient: new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
    diffuse: new THREE.Vector4(0.7, 0.7, 0.7, 1.0),
    specular: new THREE.Vector4(0.0, 0.0, 0.0, 1.0),
    specularPower: 40.0,
    specularMode: 1
  },
  {
    // FFL_MODULATE_TYPE_SHAPE_NOSE
    ambient: new THREE.Vector4(0.9, 0.85, 0.85, 1.0),
    diffuse: new THREE.Vector4(0.75, 0.75, 0.75, 1.0),
    specular: new THREE.Vector4(0.22, 0.22, 0.22, 1.0),
    specularPower: 1.5,
    specularMode: 0
  },
  {
    // FFL_MODULATE_TYPE_SHAPE_FOREHEAD
    ambient: new THREE.Vector4(0.85, 0.75, 0.75, 1.0),
    diffuse: new THREE.Vector4(0.75, 0.75, 0.75, 1.0),
    specular: new THREE.Vector4(0.3, 0.3, 0.3, 1.0),
    specularPower: 1.2,
    specularMode: 0
  },
  {
    // FFL_MODULATE_TYPE_SHAPE_HAIR
    ambient: new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
    diffuse: new THREE.Vector4(0.7, 0.7, 0.7, 1.0),
    specular: new THREE.Vector4(0.35, 0.35, 0.35, 1.0),
    specularPower: 10.0,
    specularMode: 1
  },
  {
    // FFL_MODULATE_TYPE_SHAPE_CAP
    ambient: new THREE.Vector4(0.75, 0.75, 0.75, 1.0),
    diffuse: new THREE.Vector4(0.72, 0.72, 0.72, 1.0),
    specular: new THREE.Vector4(0.3, 0.3, 0.3, 1.0),
    specularPower: 1.5,
    specularMode: 0
  },
  {
    // FFL_MODULATE_TYPE_SHAPE_MASK
    ambient: new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
    diffuse: new THREE.Vector4(0.7, 0.7, 0.7, 1.0),
    specular: new THREE.Vector4(0.0, 0.0, 0.0, 1.0),
    specularPower: 40.0,
    specularMode: 1
  },
  {
    // FFL_MODULATE_TYPE_SHAPE_NOSELINE
    ambient: new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
    diffuse: new THREE.Vector4(0.7, 0.7, 0.7, 1.0),
    specular: new THREE.Vector4(0.0, 0.0, 0.0, 1.0),
    specularPower: 40.0,
    specularMode: 1
  },
  {
    // FFL_MODULATE_TYPE_SHAPE_GLASS
    ambient: new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
    diffuse: new THREE.Vector4(0.7, 0.7, 0.7, 1.0),
    specular: new THREE.Vector4(0.0, 0.0, 0.0, 1.0),
    specularPower: 40.0,
    specularMode: 1
  },

  {
    // body
    ambient: new THREE.Vector4(0.95622, 0.95622, 0.95622, 1.0),
    diffuse: new THREE.Vector4(0.49673, 0.49673, 0.49673, 1.0),
    specular: new THREE.Vector4(0.24099, 0.24099, 0.24099, 1.0),
    specularPower: 3.0,
    specularMode: 0
  },
  {
    // pants
    ambient: new THREE.Vector4(0.95622, 0.95622, 0.95622, 1.0),
    diffuse: new THREE.Vector4(1.08497, 1.08497, 1.08497, 1.0),
    specular: new THREE.Vector4(0.2409, 0.2409, 0.2409, 1.0),
    specularPower: 3.0,
    specularMode: 0
  }
];

// FFLDefaultShader default lighting parameters

export const cLightAmbient = new THREE.Vector4(0.73, 0.73, 0.73, 1.0);
export const cLightDiffuse = new THREE.Vector4(0.6, 0.6, 0.6, 1.0);
export const cLightSpecular = new THREE.Vector4(0.7, 0.7, 0.7, 1.0);

export const cLightAmbientFFLIconWithBody = new THREE.Vector4(
  0.5,
  0.5,
  0.5,
  1.0
);
export const cLightDiffuseFFLIconWithBody = new THREE.Vector4(
  0.9,
  0.9,
  0.9,
  1.0
);
export const cLightSpecularFFLIconWithBody = new THREE.Vector4(
  1.0,
  1.0,
  1.0,
  1.0
);

// NWF lighting
// export const cLightAmbient = new THREE.Vector4(0.5, 0.5, 0.5, 1.0);
// export const cLightDiffuse = new THREE.Vector4(0.9, 0.9, 0.9, 1.0);
// export const cLightSpecular = new THREE.Vector4(1.0, 1.0, 1.0, 1.0);

// Light direction derived from this vector: [-0.65, 0.36]
export const cLightDir = new THREE.Vector3(
  -0.4531539381,
  0.4226179123,
  0.7848858833
);
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
