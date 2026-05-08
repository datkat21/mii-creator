// NOTE: there isn't a concrete way to determine the gamma type
// I don't know how it's being set OR if the decomp provides a way to set it
//static bool sGammaType = FFLiUseOffScreenSrgbFetch() ? 0 : 1;//1 : 0;
export const sGammaType = 1;

// MATERIALS SECTION!!!!!
// nn::mii::Material contains DrawParamMaterial

export type Color3 = [number, number, number];

export interface SpecularMaterial {
  color: Color3;
  factorA: number;
  factorB: number;
  shinness: number;
}

export interface RimLightMaterial {
  color: Color3;
  power: number;
  width: number;
}

export interface DrawParamMaterial {
  halfLambertFactor: number;
  sssSpecularBlendFactor: number;
  sssColor: Color3;
  specular: SpecularMaterial;
  rimLight: RimLightMaterial;
}

// material tables go in this order
export enum MaterialType {
  MaterialType_Mask = 0,
  MaterialType_Glass,
  MaterialType_Pants,
  MaterialType_Faceline,
  MaterialType_Nose,
  MaterialType_Body,
  MaterialType_Hat,
  MaterialType_Hair,
  MaterialType_Beard,
  MaterialType_Max
}

export const FFLI_NN_MII_COMMON_COLOR_MASK = 0x7fffffff;

export const cMaskMaterial: DrawParamMaterial = {
  halfLambertFactor: 0.0,
  sssSpecularBlendFactor: 1.0,
  sssColor: [0.0, 0.0, 0.0],
  specular: {
    color: [0.0, 0.0, 0.0],
    factorA: 0.0,
    factorB: 0.0,
    shinness: 0.1
  },
  rimLight: {
    color: [0.0, 0.0, 0.0],
    power: 1.0,
    width: 0.5
  }
};

export const cGlassMaterial: DrawParamMaterial = {
  halfLambertFactor: 0.35,
  sssSpecularBlendFactor: 1.0,
  sssColor: [0.0, 0.0, 0.0],
  specular: {
    color: [0.09804292, 0.09804292, 0.09804292],
    factorA: 0.3,
    factorB: 0.0,
    shinness: 30.0
  },
  rimLight: {
    color: [0.0, 0.0, 0.0],
    power: 1.0,
    width: 0.0
  }
}; // line 8
export const cPantsMaterials: DrawParamMaterial[] = [
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0, 0.0, 0.0],
    specular: {
      color: [0.01960913, 0.01960913, 0.01960913],
      factorA: 1.0,
      factorB: 0.02,
      shinness: 0.7
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 1.0,
      width: 0.5
    }
  }, // line 12
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0, 0.0, 0.1568674],
    specular: {
      color: [0.2352996, 0.1568674, 0.0],
      factorA: 1.0,
      factorB: 0.02,
      shinness: 0.7
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 1.0,
      width: 0.5
    }
  } // special pants color
];
export const cFacelineMaterials: DrawParamMaterial[] = [
  {
    halfLambertFactor: 0.4,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.6470634, 0.1333377, 0.0],
    specular: {
      color: [0.1764755, 0.08235628, 0.05882626],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.2627507, 0.1176511, 0.08627796],
      power: 2.0,
      width: 0.3
    }
  }, // line 17
  {
    halfLambertFactor: 0.4,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.6431419, 0.03529608, 0.0],
    specular: {
      color: [0.1372593, 0.09412124, 0.03921773],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.2352996, 0.1568674, 0.06666958],
      power: 2.0,
      width: 0.3
    }
  },
  {
    halfLambertFactor: 0.4,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.2941234, 0.0, 0.0],
    specular: {
      color: [0.1215728, 0.03921773, 0.01176563],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.2431428, 0.07843459, 0.0235309],
      power: 2.0,
      width: 0.3
    }
  },
  {
    halfLambertFactor: 0.4,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.6980433, 0.03921773, 0.0],
    specular: {
      color: [0.1137294, 0.05490454, 0.01960913],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.2352996, 0.1176511, 0.03921773],
      power: 2.0,
      width: 0.3
    }
  },
  {
    halfLambertFactor: 0.4,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.2000051, 0.01176563, 0.0],
    specular: {
      color: [0.1254943, 0.02745257, 0.01176563],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.250986, 0.05490454, 0.0235309],
      power: 2.0,
      width: 0.3
    }
  },
  {
    halfLambertFactor: 0.4,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.05882626, 0.00392195, 0.0],
    specular: {
      color: [0.03137433, 0.00784381, 0.00392195],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.250986, 0.06274787, 0.03137433],
      power: 2.0,
      width: 0.3
    }
  },
  {
    halfLambertFactor: 0.4,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.6549063, 0.1568674, 0.0],
    specular: {
      color: [0.1764755, 0.08235628, 0.05882626],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.2627507, 0.1215728, 0.08627796],
      power: 2.0,
      width: 0.3
    }
  },
  {
    halfLambertFactor: 0.4,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.5882402, 0.1098079, 0.03529608],
    specular: {
      color: [0.1372593, 0.07843459, 0.03921773],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.2352996, 0.1451026, 0.08235628],
      power: 2.0,
      width: 0.3
    }
  },
  {
    halfLambertFactor: 0.4,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.07843459, 0.00392195, 0.00392195],
    specular: {
      color: [0.05882626, 0.01960913, 0.00392195],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.2352996, 0.04706119, 0.01176563],
      power: 2.0,
      width: 0.3
    }
  },
  {
    halfLambertFactor: 0.4,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01960913, 0.0, 0.0],
    specular: {
      color: [0.01960913, 0.00784381, 0.00392195],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.2352996, 0.07843459, 0.03921773],
      power: 2.0,
      width: 0.3
    }
  } // line 26
];
export const cNoseMaterials: DrawParamMaterial[] = [
  {
    halfLambertFactor: 0.3,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.6470634, 0.1333377, 0.0],
    specular: {
      color: [0.1764755, 0.08235628, 0.05882626],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 0.55,
      width: 0.0
    }
  },
  {
    halfLambertFactor: 0.3,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.6431419, 0.03529608, 0.0],
    specular: {
      color: [0.1372593, 0.09412124, 0.03921773],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 0.55,
      width: 0.0
    }
  },
  {
    halfLambertFactor: 0.3,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.2941234, 0.0, 0.0],
    specular: {
      color: [0.1215728, 0.03921773, 0.01176563],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 0.55,
      width: 0.0
    }
  },
  {
    halfLambertFactor: 0.3,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.6980433, 0.03921773, 0.0],
    specular: {
      color: [0.1137294, 0.05490454, 0.01960913],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 0.55,
      width: 0.0
    }
  },
  {
    halfLambertFactor: 0.3,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.2000051, 0.01176563, 0.0],
    specular: {
      color: [0.1254943, 0.02745257, 0.01176563],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 0.55,
      width: 0.0
    }
  },
  {
    halfLambertFactor: 0.3,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.05882626, 0.00392195, 0.0],
    specular: {
      color: [0.03137433, 0.00784381, 0.00392195],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 0.55,
      width: 0.0
    }
  },
  {
    halfLambertFactor: 0.3,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.6549063, 0.1568674, 0.0],
    specular: {
      color: [0.1764755, 0.08235628, 0.05882626],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 0.55,
      width: 0.0
    }
  },
  {
    halfLambertFactor: 0.3,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.5882402, 0.1098079, 0.03529608],
    specular: {
      color: [0.1372593, 0.07843459, 0.03921773],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 0.55,
      width: 0.0
    }
  },
  {
    halfLambertFactor: 0.3,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.07843459, 0.00392195, 0.00392195],
    specular: {
      color: [0.05882626, 0.01960913, 0.00392195],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 0.55,
      width: 0.0
    }
  },
  {
    halfLambertFactor: 0.3,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01960913, 0.0, 0.0],
    specular: {
      color: [0.01960913, 0.00784381, 0.00392195],
      factorA: 2.6,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: {
      color: [0.0, 0.0, 0.0],
      power: 0.55,
      width: 0.0
    }
  } // line 39
];
export const cBodyMaterials: DrawParamMaterial[] = [
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.1647106, 0.01176563, 0.00392195],
    specular: {
      color: [0.1647106, 0.0235309, 0.01568734],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  }, // line 43
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.2745156, 0.0, 0.0],
    specular: {
      color: [0.2000051, 0.08627796, 0.01960913],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.0 }
  },
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.2000051, 0.08235628, 0.00392195],
    specular: {
      color: [0.2000051, 0.1686323, 0.0235309],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.0 }
  },
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.08235628, 0.0235309],
    specular: {
      color: [0.09412124, 0.1647106, 0.0235309],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.0 }
  },
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.04706119, 0.03529608],
    specular: {
      color: [0.0, 0.09412124, 0.03529608],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.0 }
  },
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.02745257, 0.1411809],
    specular: {
      color: [0.00784381, 0.05490454, 0.1411809],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.0 }
  },
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01176563, 0.06666958, 0.1725539],
    specular: {
      color: [0.04706119, 0.1725539, 0.2156916],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.0 }
  },
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.03529608, 0.09804292],
    specular: {
      color: [0.1921619, 0.07059128, 0.09804292],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.0 }
  },
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01960913, 0.01568734, 0.1333377],
    specular: {
      color: [0.09019956, 0.03137433, 0.1333377],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.0 }
  },
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.0, 0.01568734],
    specular: {
      color: [0.03137433, 0.01176563, 0.00392195],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.0 }
  }, // line 52
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04313947, 0.08627796, 0.1725539],
    specular: {
      color: [0.2196132, 0.1725539, 0.1725539],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.0 }
  },
  {
    halfLambertFactor: 0.5,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.0, 0.0],
    specular: {
      color: [0.01960913, 0.01960913, 0.01960913],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.0 }
  } // line 14
];
export const cHatMaterials: DrawParamMaterial[] = [
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.3333392, 0.0, 0.00392195],
    specular: {
      color: [0.2470644, 0.0, 0.00784381],
      factorA: 2.0,
      factorB: 0.0,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  }, // line 56
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.5098094, 0.2745156, 0.03921773],
    specular: {
      color: [0.2156916, 0.1451026, 0.02745257],
      factorA: 2.0,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.3921627, 0.1372593, 0.03921773],
    specular: {
      color: [0.2352996, 0.1176511, 0.03921773],
      factorA: 1.1,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.1176511, 0.3137313, 0.03921773],
    specular: {
      color: [0.1098079, 0.2470644, 0.01960913],
      factorA: 2.0,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.1176511, 0.05098281],
    specular: {
      color: [0.01960913, 0.1176511, 0.01960913],
      factorA: 2.0,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01960913, 0.05882626, 0.1960836],
    specular: {
      color: [0.00392195, 0.02745257, 0.2627507],
      factorA: 2.0,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.07843459, 0.2235348, 0.345104],
    specular: {
      color: [0.06274787, 0.1647106, 0.2392212],
      factorA: 2.0,
      factorB: 0.8,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.3137313, 0.05882626, 0.07843459],
    specular: {
      color: [0.2745156, 0.05882626, 0.07843459],
      factorA: 2.0,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.1176511, 0.02745257, 0.3411824],
    specular: {
      color: [0.08627796, 0.01176563, 0.1725539],
      factorA: 2.0,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.01960913, 0.00784381],
    specular: {
      color: [0.03921773, 0.01960913, 0.00784381],
      factorA: 2.0,
      factorB: 0.02,
      shinness: 2.0
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  }, // line 65
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.4862802, 0.4862802, 0.3921627],
    specular: {
      color: [0.1568674, 0.1568674, 0.1176511],
      factorA: 2.0,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  }, // line 28
  {
    halfLambertFactor: 0.6,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0, 0.0, 0.0],
    specular: {
      color: [0.00784381, 0.00784381, 0.00784381],
      factorA: 2.0,
      factorB: 0.02,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  } // line 29
];
export const cHairMaterials: DrawParamMaterial[] = [
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.00784381, 0.00392195, 0.00392195],
    specular: {
      color: [0.01960913, 0.01568734, 0.01568734],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  }, // line 69
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01176563, 0.00392195, 0.0],
    specular: {
      color: [0.1254943, 0.04706119, 0.00784381],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01568734, 0.00392195, 0.0],
    specular: {
      color: [0.1803971, 0.03529608, 0.00392195],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.00784381, 0.00392195],
    specular: {
      color: [0.2431428, 0.09019956, 0.01176563],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.0235309, 0.02745257],
    specular: {
      color: [0.1411809, 0.1411809, 0.1490242],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01176563, 0.01176563, 0.0],
    specular: {
      color: [0.1529458, 0.09412124, 0.00784381],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.01568734, 0.00392195],
    specular: {
      color: [0.2666723, 0.1372593, 0.01176563],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.03137433, 0.01176563],
    specular: {
      color: [0.407849, 0.250986, 0.04313947],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0, 0.0, 0.0],
    specular: {
      color: [0.01176563, 0.01176563, 0.01176563],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01960913, 0.01960913, 0.01960913],
    specular: {
      color: [0.1254943, 0.1333377, 0.1333377],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01960913, 0.01176563, 0.00784381],
    specular: {
      color: [0.2000051, 0.09412124, 0.0235309],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01568734, 0.01568734, 0.00784381],
    specular: {
      color: [0.1882403, 0.1451026, 0.02745257],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01176563, 0.01568734, 0.03137433],
    specular: {
      color: [0.08235628, 0.129416, 0.3294176],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.00784381, 0.01960913, 0.01568734],
    specular: {
      color: [0.06274787, 0.1725539, 0.1725539],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01568734, 0.00784381, 0.0],
    specular: {
      color: [0.1882403, 0.08627796, 0.00784381],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03137433, 0.0, 0.0],
    specular: {
      color: [0.3294176, 0.0235309, 0.00392195],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.00392195, 0.00784381, 0.01960913],
    specular: {
      color: [0.03529608, 0.07451299, 0.2039268],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03137433, 0.01568734, 0.0],
    specular: {
      color: [0.3294176, 0.1490242, 0.0],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.01960913, 0.01960913],
    specular: {
      color: [0.1411809, 0.1333377, 0.1215728],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.01568734, 0.0],
    specular: {
      color: [0.4235353, 0.1254943, 0.00392195],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0, 0.0, 0.0],
    specular: {
      color: [0.01960913, 0.01960913, 0.01960913],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.01176563, 0.01176563],
    specular: {
      color: [0.4784371, 0.1098079, 0.03921773],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.02745257, 0.01960913],
    specular: {
      color: [0.4705939, 0.2392212, 0.06666958],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.02745257, 0.01568734, 0.01176563],
    specular: {
      color: [0.2745156, 0.1254943, 0.03529608],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.00392195, 0.00392195],
    specular: {
      color: [0.2588292, 0.05882626, 0.01960913],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.01960913, 0.01960913],
    specular: {
      color: [0.4980448, 0.1803971, 0.05882626],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.03137433, 0.03137433],
    specular: {
      color: [0.4980448, 0.2392212, 0.09412124],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.03529608, 0.03529608],
    specular: {
      color: [0.4980448, 0.298045, 0.1058862],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01960913, 0.00784381, 0.00784381],
    specular: {
      color: [0.2235348, 0.07059128, 0.03137433],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.02745257, 0.00392195, 0.01176563],
    specular: {
      color: [0.298045, 0.04706119, 0.03529608],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.00392195, 0.01176563],
    specular: {
      color: [0.2705939, 0.03529608, 0.03529608],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03529608, 0.01176563, 0.01176563],
    specular: {
      color: [0.352947, 0.09412124, 0.03529608],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03529608, 0.00392195, 0.01568734],
    specular: {
      color: [0.3882412, 0.04706119, 0.04706119],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03137433, 0.01568734, 0.0235309],
    specular: {
      color: [0.345104, 0.129416, 0.07451299],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03529608, 0.01568734, 0.01960913],
    specular: {
      color: [0.3882412, 0.129416, 0.06274787],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.01960913, 0.02745257],
    specular: {
      color: [0.4902016, 0.1803971, 0.08627796],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.03137433, 0.03921773],
    specular: {
      color: [0.4941232, 0.2666723, 0.1176511],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.03921773, 0.03921773],
    specular: {
      color: [0.4980448, 0.3137313, 0.1254943],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.00784381, 0.00392195, 0.01176563],
    specular: {
      color: [0.09412124, 0.04313947, 0.03529608],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.00784381, 0.00784381, 0.01176563],
    specular: {
      color: [0.06274787, 0.06274787, 0.1176511],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01176563, 0.00392195, 0.01176563],
    specular: {
      color: [0.1490242, 0.03529608, 0.04313947],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01960913, 0.01176563, 0.03137433],
    specular: {
      color: [0.2156916, 0.1019645, 0.1019645],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.01568734, 0.03529608],
    specular: {
      color: [0.2588292, 0.1411809, 0.1058862],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03529608, 0.0235309, 0.03921773],
    specular: {
      color: [0.3764764, 0.2039268, 0.1176511],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03137433, 0.02745257, 0.03921773],
    specular: {
      color: [0.1960836, 0.2274563, 0.3921627],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03529608, 0.03137433, 0.04313947],
    specular: {
      color: [0.231378, 0.2666723, 0.4509861],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04313947, 0.03529608, 0.04706119],
    specular: {
      color: [0.278437, 0.298045, 0.4902016],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.03529608, 0.04313947],
    specular: {
      color: [0.2470644, 0.3058882, 0.4627508],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.00392195, 0.00392195, 0.01176563],
    specular: {
      color: [0.02745257, 0.04706119, 0.1254943],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0, 0.01176563, 0.01960913],
    specular: {
      color: [0.01960913, 0.09804292, 0.2000051],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.00784381, 0.0235309, 0.03921773],
    specular: {
      color: [0.04706119, 0.2039268, 0.4156921],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01568734, 0.03529608, 0.04706119],
    specular: {
      color: [0.1019645, 0.2823587, 0.4745156],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.03529608, 0.04313947],
    specular: {
      color: [0.1411809, 0.3058882, 0.4353],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.03137433, 0.04706119],
    specular: {
      color: [0.1607891, 0.2588292, 0.4902016],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.03529608, 0.04706119],
    specular: {
      color: [0.1529458, 0.2941234, 0.4902016],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03137433, 0.04313947, 0.04706119],
    specular: {
      color: [0.1882403, 0.352947, 0.4980448],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0, 0.00784381, 0.00784381],
    specular: {
      color: [0.01176563, 0.07059128, 0.1058862],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0, 0.01176563, 0.00784381],
    specular: {
      color: [0.0, 0.09412124, 0.1137294],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0, 0.01176563, 0.01568734],
    specular: {
      color: [0.01176563, 0.1215728, 0.1725539],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.00392195, 0.01960913, 0.01568734],
    specular: {
      color: [0.03921773, 0.1568674, 0.1921619],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.00784381, 0.0235309, 0.02745257],
    specular: {
      color: [0.05490454, 0.1960836, 0.2745156],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01176563, 0.03137433, 0.03137433],
    specular: {
      color: [0.09019956, 0.2705939, 0.345104],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.03529608, 0.02745257],
    specular: {
      color: [0.1411809, 0.3058882, 0.3098098],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.03921773, 0.03529608],
    specular: {
      color: [0.1490242, 0.3294176, 0.3764764],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.04313947, 0.03529608],
    specular: {
      color: [0.1568674, 0.3568686, 0.3568686],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0, 0.01176563, 0.00784381],
    specular: {
      color: [0.01960913, 0.1137294, 0.02745257],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01176563, 0.0235309, 0.0],
    specular: {
      color: [0.129416, 0.1882403, 0.0],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0, 0.01960913, 0.01568734],
    specular: {
      color: [0.00392195, 0.1803971, 0.05490454],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.00784381, 0.02745257, 0.01960913],
    specular: {
      color: [0.1058862, 0.2392212, 0.06274787],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01176563, 0.03137433, 0.00392195],
    specular: {
      color: [0.1451026, 0.2705939, 0.01176563],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.02745257, 0.03529608, 0.0],
    specular: {
      color: [0.2862803, 0.298045, 0.00392195],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01568734, 0.03529608, 0.0235309],
    specular: {
      color: [0.1921619, 0.3098098, 0.07843459],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.02745257, 0.04313947, 0.01176563],
    specular: {
      color: [0.3098098, 0.3490255, 0.03529608],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.02745257, 0.04313947, 0.0235309],
    specular: {
      color: [0.2941234, 0.345104, 0.07059128],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03529608, 0.04706119, 0.03137433],
    specular: {
      color: [0.3647118, 0.3764764, 0.09804292],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.02745257, 0.02745257, 0.00784381],
    specular: {
      color: [0.298045, 0.2274563, 0.0235309],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03137433, 0.02745257, 0.01568734],
    specular: {
      color: [0.3254961, 0.231378, 0.05490454],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.03529608, 0.00784381],
    specular: {
      color: [0.4000058, 0.298045, 0.03137433],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.03529608, 0.0235309],
    specular: {
      color: [0.4000058, 0.2902018, 0.07843459],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.03921773, 0.0235309],
    specular: {
      color: [0.4235353, 0.3176529, 0.07451299],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.03921773, 0.01960913],
    specular: {
      color: [0.4156921, 0.3372608, 0.06274787],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.04313947, 0.0235309],
    specular: {
      color: [0.4156921, 0.3607903, 0.07451299],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.04706119, 0.02745257],
    specular: {
      color: [0.4235353, 0.3921627, 0.09019956],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.01176563, 0.0],
    specular: {
      color: [0.2431428, 0.1058862, 0.0],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04313947, 0.03529608, 0.0235309],
    specular: {
      color: [0.4509861, 0.2902018, 0.07059128],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.04313947, 0.01176563],
    specular: {
      color: [0.4980448, 0.352947, 0.04313947],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.04313947, 0.0235309],
    specular: {
      color: [0.4902016, 0.345104, 0.07451299],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.04313947, 0.02745257],
    specular: {
      color: [0.4823586, 0.3647118, 0.09019956],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.04706119, 0.02745257],
    specular: {
      color: [0.4902016, 0.3882412, 0.09019956],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03137433, 0.01176563, 0.00392195],
    specular: {
      color: [0.3254961, 0.1176511, 0.01568734],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.02745257, 0.0],
    specular: {
      color: [0.4980448, 0.2352996, 0.00392195],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03921773, 0.02745257, 0.01960913],
    specular: {
      color: [0.407849, 0.2431428, 0.05882626],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.03137433, 0.01960913],
    specular: {
      color: [0.4980448, 0.278437, 0.05882626],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04706119, 0.03529608, 0.02745257],
    specular: {
      color: [0.4980448, 0.3019665, 0.08235628],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04313947, 0.03921773, 0.03137433],
    specular: {
      color: [0.4470646, 0.3215744, 0.1019645],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.01176563, 0.01176563, 0.01176563],
    specular: {
      color: [0.07843459, 0.07843459, 0.07843459],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.02745257, 0.02745257, 0.02745257],
    specular: {
      color: [0.1843188, 0.1843188, 0.1843188],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.03529608, 0.03529608, 0.03529608],
    specular: {
      color: [0.2235348, 0.2235348, 0.2235348],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.04313947, 0.03921773, 0.03921773],
    specular: {
      color: [0.2588292, 0.250986, 0.2431428],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.45,
    sssSpecularBlendFactor: 1.0,
    sssColor: [0.0235309, 0.0235309, 0.0235309],
    specular: {
      color: [0.00392195, 0.00392195, 0.00392195],
      factorA: 1.0,
      factorB: 0.06,
      shinness: 0.8
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  } // line 168
];
export const cBeardMaterials: DrawParamMaterial[] = [
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.00784381, 0.00392195, 0.00392195],
    specular: {
      color: [0.01960913, 0.01568734, 0.01568734],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  }, // line 172
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01176563, 0.00392195, 0.0],
    specular: {
      color: [0.1254943, 0.04706119, 0.00784381],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01568734, 0.00392195, 0.0],
    specular: {
      color: [0.1803971, 0.03529608, 0.00392195],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.00784381, 0.00392195],
    specular: {
      color: [0.2431428, 0.09019956, 0.01176563],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.0235309, 0.02745257],
    specular: {
      color: [0.1411809, 0.1411809, 0.1490242],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01176563, 0.01176563, 0.0],
    specular: {
      color: [0.1529458, 0.09412124, 0.00784381],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.01568734, 0.00392195],
    specular: {
      color: [0.2666723, 0.1372593, 0.01176563],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03921773, 0.03137433, 0.01176563],
    specular: {
      color: [0.407849, 0.250986, 0.04313947],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.0, 0.0],
    specular: {
      color: [0.01176563, 0.01176563, 0.01176563],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01960913, 0.01960913, 0.01960913],
    specular: {
      color: [0.1254943, 0.1333377, 0.1333377],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01960913, 0.01176563, 0.00784381],
    specular: {
      color: [0.2000051, 0.09412124, 0.0235309],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01568734, 0.01568734, 0.00784381],
    specular: {
      color: [0.1882403, 0.1451026, 0.02745257],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01176563, 0.01568734, 0.03137433],
    specular: {
      color: [0.08235628, 0.129416, 0.3294176],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.00784381, 0.01960913, 0.01568734],
    specular: {
      color: [0.06274787, 0.1725539, 0.1725539],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01568734, 0.00784381, 0.0],
    specular: {
      color: [0.1882403, 0.08627796, 0.00784381],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03137433, 0.0, 0.0],
    specular: {
      color: [0.3294176, 0.0235309, 0.00392195],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.00392195, 0.00784381, 0.01960913],
    specular: {
      color: [0.03529608, 0.07451299, 0.2039268],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03137433, 0.01568734, 0.0],
    specular: {
      color: [0.3294176, 0.1490242, 0.0],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.01960913, 0.01960913],
    specular: {
      color: [0.1411809, 0.1333377, 0.1215728],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03921773, 0.01568734, 0.0],
    specular: {
      color: [0.4235353, 0.1254943, 0.00392195],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.0, 0.0],
    specular: {
      color: [0.01960913, 0.01960913, 0.01960913],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.01176563, 0.01176563],
    specular: {
      color: [0.4784371, 0.1098079, 0.03921773],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.02745257, 0.01960913],
    specular: {
      color: [0.4705939, 0.2392212, 0.06666958],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.02745257, 0.01568734, 0.01176563],
    specular: {
      color: [0.2745156, 0.1254943, 0.03529608],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.00392195, 0.00392195],
    specular: {
      color: [0.2588292, 0.05882626, 0.01960913],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.01960913, 0.01960913],
    specular: {
      color: [0.4980448, 0.1803971, 0.05882626],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.03137433, 0.03137433],
    specular: {
      color: [0.4980448, 0.2392212, 0.09412124],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.03529608, 0.03529608],
    specular: {
      color: [0.4980448, 0.298045, 0.1058862],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01960913, 0.00784381, 0.00784381],
    specular: {
      color: [0.2235348, 0.07059128, 0.03137433],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.02745257, 0.00392195, 0.01176563],
    specular: {
      color: [0.298045, 0.04706119, 0.03529608],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.00392195, 0.01176563],
    specular: {
      color: [0.2705939, 0.03529608, 0.03529608],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03529608, 0.01176563, 0.01176563],
    specular: {
      color: [0.352947, 0.09412124, 0.03529608],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03529608, 0.00392195, 0.01568734],
    specular: {
      color: [0.3882412, 0.04706119, 0.04706119],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03137433, 0.01568734, 0.0235309],
    specular: {
      color: [0.345104, 0.129416, 0.07451299],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03529608, 0.01568734, 0.01960913],
    specular: {
      color: [0.3882412, 0.129416, 0.06274787],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.01960913, 0.02745257],
    specular: {
      color: [0.4902016, 0.1803971, 0.08627796],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.03137433, 0.03921773],
    specular: {
      color: [0.4941232, 0.2666723, 0.1176511],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.03921773, 0.03921773],
    specular: {
      color: [0.4980448, 0.3137313, 0.1254943],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.00784381, 0.00392195, 0.01176563],
    specular: {
      color: [0.09412124, 0.04313947, 0.03529608],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.00784381, 0.00784381, 0.01176563],
    specular: {
      color: [0.06274787, 0.06274787, 0.1176511],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01176563, 0.00392195, 0.01176563],
    specular: {
      color: [0.1490242, 0.03529608, 0.04313947],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01960913, 0.01176563, 0.03137433],
    specular: {
      color: [0.2156916, 0.1019645, 0.1019645],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.01568734, 0.03529608],
    specular: {
      color: [0.2588292, 0.1411809, 0.1058862],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03529608, 0.0235309, 0.03921773],
    specular: {
      color: [0.3764764, 0.2039268, 0.1176511],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03137433, 0.02745257, 0.03921773],
    specular: {
      color: [0.1960836, 0.2274563, 0.3921627],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03529608, 0.03137433, 0.04313947],
    specular: {
      color: [0.231378, 0.2666723, 0.4509861],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04313947, 0.03529608, 0.04706119],
    specular: {
      color: [0.278437, 0.298045, 0.4902016],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03921773, 0.03529608, 0.04313947],
    specular: {
      color: [0.2470644, 0.3058882, 0.4627508],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.00392195, 0.00392195, 0.01176563],
    specular: {
      color: [0.02745257, 0.04706119, 0.1254943],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.01176563, 0.01960913],
    specular: {
      color: [0.01960913, 0.09804292, 0.2000051],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.00784381, 0.0235309, 0.03921773],
    specular: {
      color: [0.04706119, 0.2039268, 0.4156921],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01568734, 0.03529608, 0.04706119],
    specular: {
      color: [0.1019645, 0.2823587, 0.4745156],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.03529608, 0.04313947],
    specular: {
      color: [0.1411809, 0.3058882, 0.4353],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.03137433, 0.04706119],
    specular: {
      color: [0.1607891, 0.2588292, 0.4902016],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.03529608, 0.04706119],
    specular: {
      color: [0.1529458, 0.2941234, 0.4902016],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03137433, 0.04313947, 0.04706119],
    specular: {
      color: [0.1882403, 0.352947, 0.4980448],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.00784381, 0.00784381],
    specular: {
      color: [0.01176563, 0.07059128, 0.1058862],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.01176563, 0.00784381],
    specular: {
      color: [0.0, 0.09412124, 0.1137294],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.01176563, 0.01568734],
    specular: {
      color: [0.01176563, 0.1215728, 0.1725539],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.00392195, 0.01960913, 0.01568734],
    specular: {
      color: [0.03921773, 0.1568674, 0.1921619],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.00784381, 0.0235309, 0.02745257],
    specular: {
      color: [0.05490454, 0.1960836, 0.2745156],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01176563, 0.03137433, 0.03137433],
    specular: {
      color: [0.09019956, 0.2705939, 0.345104],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.03529608, 0.02745257],
    specular: {
      color: [0.1411809, 0.3058882, 0.3098098],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.03921773, 0.03529608],
    specular: {
      color: [0.1490242, 0.3294176, 0.3764764],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.04313947, 0.03529608],
    specular: {
      color: [0.1568674, 0.3568686, 0.3568686],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.01176563, 0.00784381],
    specular: {
      color: [0.01960913, 0.1137294, 0.02745257],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01176563, 0.0235309, 0.0],
    specular: {
      color: [0.129416, 0.1882403, 0.0],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0, 0.01960913, 0.01568734],
    specular: {
      color: [0.00392195, 0.1803971, 0.05490454],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.00784381, 0.02745257, 0.01960913],
    specular: {
      color: [0.1058862, 0.2392212, 0.06274787],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01176563, 0.03137433, 0.00392195],
    specular: {
      color: [0.1451026, 0.2705939, 0.01176563],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.02745257, 0.03529608, 0.0],
    specular: {
      color: [0.2862803, 0.298045, 0.00392195],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01568734, 0.03529608, 0.0235309],
    specular: {
      color: [0.1921619, 0.3098098, 0.07843459],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.02745257, 0.04313947, 0.01176563],
    specular: {
      color: [0.3098098, 0.3490255, 0.03529608],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.02745257, 0.04313947, 0.0235309],
    specular: {
      color: [0.2941234, 0.345104, 0.07059128],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03529608, 0.04706119, 0.03137433],
    specular: {
      color: [0.3647118, 0.3764764, 0.09804292],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.02745257, 0.02745257, 0.00784381],
    specular: {
      color: [0.298045, 0.2274563, 0.0235309],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03137433, 0.02745257, 0.01568734],
    specular: {
      color: [0.3254961, 0.231378, 0.05490454],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03921773, 0.03529608, 0.00784381],
    specular: {
      color: [0.4000058, 0.298045, 0.03137433],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03921773, 0.03529608, 0.0235309],
    specular: {
      color: [0.4000058, 0.2902018, 0.07843459],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03921773, 0.03921773, 0.0235309],
    specular: {
      color: [0.4235353, 0.3176529, 0.07451299],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03921773, 0.03921773, 0.01960913],
    specular: {
      color: [0.4156921, 0.3372608, 0.06274787],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03921773, 0.04313947, 0.0235309],
    specular: {
      color: [0.4156921, 0.3607903, 0.07451299],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03921773, 0.04706119, 0.02745257],
    specular: {
      color: [0.4235353, 0.3921627, 0.09019956],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.01176563, 0.0],
    specular: {
      color: [0.2431428, 0.1058862, 0.0],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04313947, 0.03529608, 0.0235309],
    specular: {
      color: [0.4509861, 0.2902018, 0.07059128],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.04313947, 0.01176563],
    specular: {
      color: [0.4980448, 0.352947, 0.04313947],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.04313947, 0.0235309],
    specular: {
      color: [0.4902016, 0.345104, 0.07451299],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.04313947, 0.02745257],
    specular: {
      color: [0.4823586, 0.3647118, 0.09019956],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.04706119, 0.02745257],
    specular: {
      color: [0.4902016, 0.3882412, 0.09019956],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03137433, 0.01176563, 0.00392195],
    specular: {
      color: [0.3254961, 0.1176511, 0.01568734],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.02745257, 0.0],
    specular: {
      color: [0.4980448, 0.2352996, 0.00392195],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03921773, 0.02745257, 0.01960913],
    specular: {
      color: [0.407849, 0.2431428, 0.05882626],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.03137433, 0.01960913],
    specular: {
      color: [0.4980448, 0.278437, 0.05882626],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04706119, 0.03529608, 0.02745257],
    specular: {
      color: [0.4980448, 0.3019665, 0.08235628],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04313947, 0.03921773, 0.03137433],
    specular: {
      color: [0.4470646, 0.3215744, 0.1019645],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.01176563, 0.01176563, 0.01176563],
    specular: {
      color: [0.07843459, 0.07843459, 0.07843459],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.02745257, 0.02745257, 0.02745257],
    specular: {
      color: [0.1843188, 0.1843188, 0.1843188],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.03529608, 0.03529608, 0.03529608],
    specular: {
      color: [0.2235348, 0.2235348, 0.2235348],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.04313947, 0.03921773, 0.03921773],
    specular: {
      color: [0.2588292, 0.250986, 0.2431428],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  },
  {
    halfLambertFactor: 0.2,
    sssSpecularBlendFactor: 0.0,
    sssColor: [0.0235309, 0.0235309, 0.0235309],
    specular: {
      color: [0.00392195, 0.00392195, 0.00392195],
      factorA: 1.0,
      factorB: 0.0,
      shinness: 1.3
    },
    rimLight: { color: [0.0, 0.0, 0.0], power: 1.0, width: 0.5 }
  } // line 271
];

// NOTE: WHERE DOES THIS COME FROM? just taken from a render
export const cLightDir = [-0.12279, 0.70711, 0.69636, 1.0];
export const cLightColor = [1.0, 1.0, 1.0, 1.0];
