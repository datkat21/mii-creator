// import { DataTexture, RGBAFormat, UnsignedByteType, type Texture } from "three";
import { _THREE } from "../../../util/PrepareThree";
const THREE = _THREE();
//@ts-expect-error shhh
import type * as THREE from "three";
import type { RGBColor } from "../shader/fflShaderConst";

export function multiplyTexture(tex: THREE.Texture, color: RGBColor) {
  const canvas = document.createElement("canvas");
  canvas.width = tex.image.width;
  canvas.height = tex.image.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(tex.image, 0, 0);

  // Get the image data and modify pixel colors
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] * color[0];
    data[i + 1] = data[i + 1] * color[1];
    data[i + 2] = data[i + 2] * color[2];
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  // Create a new texture from the modified canvas
  const modifiedTexture = new THREE.DataTexture(
    imageData.data,
    canvas.width,
    canvas.height,
    THREE.RGBAFormat,
    THREE.UnsignedByteType
  );
  modifiedTexture.repeat = tex.repeat;
  modifiedTexture.wrapS = tex.wrapS;
  modifiedTexture.wrapT = tex.wrapT;
  modifiedTexture.needsUpdate = true;

  return modifiedTexture;
}
