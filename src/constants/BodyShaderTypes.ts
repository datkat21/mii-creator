// Types mapping to strings stored in settings
// and sent to the backend renderer.

export enum BodyType {
  WiiU = "wiiu",
  Switch = "switch",
  Miitomo = "miitomo",
  StreetPass = "streetpass"
}
// All body types are supported by backend renderer for now

export enum ShaderType {
  WiiU = "wiiu",
  Switch = "switch",
  LightDisabled = "lightDisabled",
  Miitomo = "miitomo",
  MiitomoBasic = "miitomo_basic",
  WiiUBlinn = "wiiu_blinn",
  WiiUFFLIconWithBody = "wiiu_ffliconwithbody",
  WiiUToon = "wiiu_toon"
}

export function adjustShaderQuery(params: URLSearchParams, shader: ShaderType) {
  switch (shader) {
    case ShaderType.WiiU:
    case ShaderType.Switch:
    case ShaderType.Miitomo:
      // share the same type string so can be used directly
      params.set("shaderType", shader);
      break;
    case ShaderType.WiiUFFLIconWithBody:
      params.set("shaderType", "ffliconwithbody");
      break;
    case ShaderType.WiiUToon:
      params.set("shaderType", "wiiu");
      break;
    case ShaderType.WiiUBlinn:
      params.set("shaderType", "wiiu_blinn");
      break;
    case ShaderType.LightDisabled:
      params.set("shaderType", "wiiu");
      params.set("lightEnable", "0");
      break;
    default:
      console.warn(`unknown shader type: ${shader}`);
  }
}
