import { Color, Vector3, Vector4 } from "three";
import FFLShaderMaterial from "../../../external/ffl.js/FFLShaderMaterial";
import LUTShaderMaterial from "../../../external/ffl.js/LUTShaderMaterial";
import {
  cLightAmbientFFLIconWithBody,
  cLightDiffuseFFLIconWithBody,
  cLightDirFFLIconWithBody,
  cLightDirGlossy,
  cLightSpecularFFLIconWithBody,
  FFLToonMaterial
} from "./fflShaderConst";

/**
 * Variant of FFLShaderMaterial that forces specular mode to Blinn-Phong.
 * @augments {FFLShaderMaterial}
 */
class FFLShaderBlinnMaterial extends FFLShaderMaterial {
  /**
   * Constructs an FFLShaderMaterial instance.
   * @param {import('three').ShaderMaterialParameters & import('../FFLShaderMaterial').FFLShaderMaterialParameters} [options] - Parameters for the material.
   */
  constructor(options = {}) {
    options = Object.assign(
      {
        useSpecularModeBlinn: true
      },
      options
    );
    super(options); // Construct the extended class.
    // Adjust specular power, which is the reflection point, to be larger.
    if (this.uniforms.u_material_specular_power)
      this.uniforms.u_material_specular_power.value = 2.0;
  }
}

class FFLShaderLightDisabledMaterial extends FFLShaderMaterial {
  /**
   * Constructs an FFLShaderMaterial instance.
   * @param {import('three').ShaderMaterialParameters & import('../FFLShaderMaterial').FFLShaderMaterialParameters} [options] - Parameters for the material.
   */
  constructor(options = {}) {
    options = Object.assign(
      {
        lightEnable: false
      },
      options
    );
    super(options); // Construct the extended class.
  }
}

// import type {FFLShaderMaterialParameters } from "../../../external/ffl.js/FFLShaderMaterial";

class FFLShaderToonMaterial extends FFLShaderMaterial {
  constructor(options: any = {}) {
    options = Object.assign({}, options);
    super(options);
    // Adjust material
    (this as any).uniforms.u_light_dir.value = cLightDirGlossy;
    if ((this as any).uniforms.u_material_ambient) {
      (this as any).uniforms.u_material_ambient.value = FFLToonMaterial.ambient;
      (this as any).uniforms.u_material_diffuse.value = FFLToonMaterial.diffuse;
      (this as any).uniforms.u_material_specular.value =
        FFLToonMaterial.specular;
      (this as any).uniforms.u_material_specular_power.value =
        FFLToonMaterial.specularPower;
      (this as any).uniforms.u_material_specular_mode.value =
        FFLToonMaterial.specularMode;
    }
  }
}

class FFLShaderBrightMaterial extends FFLShaderMaterial {
  constructor(options: any = {}) {
    options = Object.assign({}, options);
    super(options);
    // Adjust material
    (this as any).uniforms.u_light_dir.value = cLightDirFFLIconWithBody;
    (this as any).uniforms.u_light_ambient.value = cLightAmbientFFLIconWithBody;
    (this as any).uniforms.u_light_diffuse.value = cLightDiffuseFFLIconWithBody;
    (this as any).uniforms.u_light_specular.value =
      cLightSpecularFFLIconWithBody;
  }
}

class LUTShaderPretendoMaterial extends LUTShaderMaterial {
  constructor(options: any = {}) {
    options = Object.assign({}, options);
    super(options);
    // Adjust material

    // (this as any).lightDirection
    // (this as any).lightDirection = new Vector3(0, 1, 1);
    // (this as any).uniforms.uDirLightDirAndType0.value = new Vector4(
    //   0,
    //   0.5,
    //   1,
    //   -1
    // );
    // (this as any).uniforms.uDirLightDirAndType1.value = new Vector4(
    //   0,
    //   -0.7,
    //   1,
    //   -1
    // );
    // (this as any).uniforms.uHSLightGroundColor.value = new Color(0.5, 0.5, 0.5);
    // (this as any).uniforms.uHSLightSkyColor.value = new Color(0.5, 0.5, 0.5);
    // (this as any).uniforms.uDirLightColor0.value = new Color(0.4, 0.4, 0.4);
    // (this as any).uniforms.uDirLightColor1.value = new Color(0.4, 0.4, 0.4);
    // (this as any).lightDirection = new Vector3(0, 1, 1);
    (this as any).uniforms.uDirLightDirAndType0.value = new Vector4(
      -0.2,
      0.5,
      0.8,
      -1.0
    );
    (this as any).uniforms.uDirLightDirAndType1.value = new Vector4(
      0.0,
      -0.19612,
      0.98058,
      -1.0
    );
    (this as any).uniforms.uHSLightGroundColor.value = new Color(
      0xe1b997
    ).convertLinearToSRGB();
    (this as any).uniforms.uHSLightSkyColor.value = new Color(
      0xe1d6ce
    ).convertLinearToSRGB();
    (this as any).uniforms.uDirLightColor0.value = new Color(
      0x5a5353
    ).convertLinearToSRGB();
    (this as any).uniforms.uDirLightColor1.value = new Color(
      0x1a1818
    ).convertLinearToSRGB();
  }
}

export {
  FFLShaderBlinnMaterial,
  FFLShaderLightDisabledMaterial,
  FFLShaderBrightMaterial,
  FFLShaderToonMaterial,
  LUTShaderPretendoMaterial
};
