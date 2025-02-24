import {
  CanvasTexture,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Mesh,
  type ShaderMaterial,
  type Texture
} from "three";
import type { Mii3DScene } from "../../../../class/3DScene";
import { getSetting } from "../../../../util/SettingsHelper";
import { sRGB } from "../../../../util/Color";
import { cMaterialName } from "../../../../class/3d/shader/fflShaderConst";
import * as THREE from "three";
import { ShaderType } from "../../../../constants/BodyShaderTypes";

export async function traverse3DMaterialFix(
  scene: Mii3DScene
): Promise<Map<number, any>> {
  const shaderSetting = await getSetting("shaderType");
  const bodyModelHands = await getSetting("bodyModelHands");
  return new Promise((resolve) => {
    let mats = new Map<number, any>();
    let count = 0;
    let total = 0;

    // count meshes (ai slop code ..)
    scene.getScene().traverse((o) => {
      if ((o as Mesh).isMesh !== true) return;
      const m = o as Mesh;
      if (m.material) {
        total++;
      }
    });

    scene.getScene().traverse((o) => {
      if ((o as Mesh).isMesh !== true) return;

      const m = o as Mesh;

      mats.set(count, m.material);

      console.log(m.name, m.geometry.userData);

      // this depends on shader setting..
      let map: Texture | null = null;
      const userData = m.geometry.userData;

      if (
        // Both of these internally use FFL shader
        shaderSetting.startsWith("wiiu") ||
        shaderSetting === ShaderType.LightDisabled ||
        shaderSetting === ShaderType.Miitomo
      ) {
        console.log(m.name, (m.material as MeshBasicMaterial).type);
        if ((m.material as MeshBasicMaterial).type !== "ShaderMaterial") return;

        map = (m.material as ShaderMaterial).uniforms.s_texture.value;

        if (map !== null) {
          // Wii U shader textures need to be converted from linear to sRGB

          // Create a temporary canvas
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;

          // Set canvas dimensions
          canvas.width = map.image.width;
          canvas.height = map.image.height;

          let image = map.image,
            isImageData = false;

          if (typeof map.image.data !== "undefined") {
            // assume multiplyTexture was used, so it's ImageData
            image = new ImageData(
              map.image.data,
              map.image.width,
              map.image.height
            );
            isImageData = true;
          }

          // Draw the texture to the canvas
          if (isImageData) context.putImageData(image, 0, 0);
          else context.drawImage(image, 0, 0);

          // Get image data from the canvas
          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          const data = imageData.data;

          // Convert from sRGB Linear to sRGB
          for (let i = 0; i < data.length; i += 4) {
            // Extract RGB components
            let r = data[i] / 255;
            let g = data[i + 1] / 255;
            let b = data[i + 2] / 255;

            // Convert from sRGB Linear to sRGB
            r = sRGB(r);
            g = sRGB(g);
            b = sRGB(b);

            // Convert back to 0-255 range
            data[i] = Math.round(r * 255);
            data[i + 1] = Math.round(g * 255);
            data[i + 2] = Math.round(b * 255);
          }

          // Update the canvas with the modified image data
          context.putImageData(imageData, 0, 0);

          const newMap = new CanvasTexture(canvas);

          // Make sure to apply previous map properties!
          newMap.flipY = map.flipY;
          newMap.wrapS = map.wrapS;
          newMap.wrapT = map.wrapS;

          // leak?
          map = newMap;
          map.needsUpdate = true;

          // await new Promise((resolve) => {
          //   createImageBitmap(canvas)
          //     .then((imageBitmap) => {
          //       // Assign the ImageBitmap to the map's source.data
          //       // map!.source.data = imageBitmap;
          //       console.log(map!.source.data);
          //       // Re-generate mipmaps
          //       map!.needsUpdate = true;
          //       resolve(true);
          //     })
          //     .catch((error) => {
          //       console.error("Error creating ImageBitmap:", error);
          //     });
          // });

          // Re-generate mipmaps
          map.needsUpdate = true;
        }
      } else if (shaderSetting === "switch") {
        // Can't remember what the uniform for texture is on switch
      } else {
        // Prevent warning by assigning map to null if it is null
        if ((m.material as MeshStandardMaterial).map !== null)
          map = (m.material as MeshStandardMaterial).map;

        // if (bodyModelHands) {
        //   if (m.name === "hands_m" || m.name === "hands_f") {
        //     (m.material as MeshBasicMaterial).color.set(
        //       new Color(...scene.handColor)
        //     );
        //   }
        // }
      }

      // Just use modulateColor from the userData
      // because i can't be asked
      function rgbaToHex(rgba: [number, number, number]) {
        const [r, g, b] = rgba;
        const intR = Math.round(r * 255);
        const intG = Math.round(g * 255);
        const intB = Math.round(b * 255);
        const hexR = intR.toString(16).padStart(2, "0");
        const hexG = intG.toString(16).padStart(2, "0");
        const hexB = intB.toString(16).padStart(2, "0");
        return Number(`0x${hexR}${hexG}${hexB}`);
      }

      // define params for the model material export
      let color: THREE.ColorRepresentation | undefined = rgbaToHex(
          userData.modulateColor
        ),
        metalness: number = 1,
        roughness: number = 1;

      if (m.parent) {
        if (m.parent.name.includes("Hat")) {
          // assume HatScene or HatRoot, we don't need a blend color
          color = undefined;
        }
      }

      if (bodyModelHands) {
        if (m.name === "hands_m" || m.name === "hands_f") {
          color = new THREE.Color(...scene.handColor);
        }
      }

      var mat = new MeshPhysicalMaterial({
        color,
        metalness,
        roughness,
        map: map,
        side: THREE.FrontSide
      });

      switch (userData.modulateType) {
        case cMaterialName.FFL_MODULATE_TYPE_SHAPE_MASK:
        case cMaterialName.FFL_MODULATE_TYPE_SHAPE_NOSELINE:
          mat.side = THREE.FrontSide;
          mat.transparent = true;
          break;
        case cMaterialName.FFL_MODULATE_TYPE_SHAPE_GLASS:
          mat.side = THREE.DoubleSide;
          mat.transparent = true;
          break;
        case cMaterialName.FFL_MODULATE_TYPE_SHAPE_PANTS:
          // get pants color from the scene
          const pantsColor = scene.getPantsColor();
          mat.color = new THREE.Color(
            pantsColor[0],
            pantsColor[1],
            pantsColor[2]
          );
          break;
      }

      m.material = mat;

      count++;

      if (count === total) {
        resolve(mats);
      }
    });
  });
}
