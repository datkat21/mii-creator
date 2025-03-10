import FFLShaderMaterial from "../../../external/ffl.js/FFLShaderMaterial";
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
    (this as any).uniforms.u_material_ambient.value = FFLToonMaterial.ambient;
    (this as any).uniforms.u_material_diffuse.value = FFLToonMaterial.diffuse;
    (this as any).uniforms.u_material_specular.value = FFLToonMaterial.specular;
    (this as any).uniforms.u_material_specular_power.value =
      FFLToonMaterial.specularPower;
    (this as any).uniforms.u_material_specular_mode.value =
      FFLToonMaterial.specularMode;
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

export {
  FFLShaderBlinnMaterial,
  FFLShaderLightDisabledMaterial,
  FFLShaderBrightMaterial,
  FFLShaderToonMaterial
};
