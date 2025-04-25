import type { WebGLRenderer } from "three";
import {
  ClothesType,
  ClothesTypeList,
  ExtClothesList,
  ExtClothesMiitomoMeshAndTextureList
} from "../../constants/Extensions";
import {
  getShaderMaterialFromShaderType,
  isShaderMaterial
} from "./shader/ShaderUtils";
import { _THREE } from "../../util/PrepareThree";
import { BodyType } from "../../constants/BodyShaderTypes";

import type * as THREE from "three";
import { colorMixTexture } from "./shader/ColorMix";

/**
 * Helper for clothing rendering
 */
export async function clothingUpdate({
  gender,
  clothesType,
  renderer,
  bodyModel,
  shirtColor,
  pantsColor,
  shoesColor,
  facelineColor,
  clothesTextures,
  nBody,
  nLegs,
  bodyGroup,
  originalMaterial,
  customTexture,
  customTextureType,
  texResolution
}: {
  gender: number;
  clothesType: number;
  renderer: WebGLRenderer;
  bodyModel: string;
  shirtColor: THREE.Vector3 | number[];
  pantsColor: THREE.Vector3 | number[];
  shoesColor: THREE.Vector3 | number[];
  facelineColor: THREE.Color;
  clothesTextures: Record<string, THREE.Texture>;
  // References to body meshes
  nBody: THREE.Mesh;
  nLegs: THREE.Mesh;
  // used with miitomo meshes
  bodyGroup: THREE.Group;
  originalMaterial: any;
  customTexture?: THREE.Texture;
  customTextureType?: ClothesType;
  texResolution?: number;
}) {
  const THREE = _THREE();

  const suffix = gender == 1 ? "F" : "";
  const clothingEntry = clothesType;
  let key = `${bodyModel}_${ExtClothesList[clothingEntry]}${suffix}`;

  let shirtKey = key;

  async function loadClothingTexture(clothesKey: string) {
    let texture: THREE.Texture;
    switch (ClothesTypeList[clothingEntry]) {
      case ClothesType.COLOR_MIXED: {
        const colorMixR = new THREE.Vector4(...shirtColor, 1),
          colorMixG = new THREE.Vector4(...shoesColor, 1),
          colorMixB = new THREE.Vector4(...pantsColor, 1),
          colorMixA = new THREE.Color(facelineColor ? facelineColor : 0xffffff);

        // Replace pitch black with almost black.
        // const darkIntensity = 0.1;

        // if (colorMixR.x === 0 && colorMixR.y === 0 && colorMixR.z === 0)
        //   colorMixR.set(0.1, 0.1, 0.1);

        console.log("Clothing Texture Key:", clothesKey);
        texture = await colorMixTexture(
          clothesTextures[clothesKey],
          colorMixR,
          colorMixG,
          colorMixB,
          colorMixA,
          renderer,
          texResolution
        );

        // texture.flipY = false;
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // texture.needsUpdate = true;

        console.log("loaded shirt texture!");
        break;
      }
      case ClothesType.TEXTURE_COLOR: {
        texture = clothesTextures[clothesKey];
        break;
      }
      default:
        const errString = `An error occurred while loading clothing texture: Texture entry "${clothesKey}" doesn't exist in clothes table`;
        alert(errString);
        throw new Error(errString);
    }
    renderer.initTexture(texture);
    return texture;
  }

  let nBodyMat = nBody.material as any;
  let nLegsMat = nLegs.material as any;

  let isUsingShader = await isShaderMaterial();
  let clothesModulate = isUsingShader
    ? { modulateType: 9, modulateMode: 1, color: new THREE.Color(0xffffff) }
    : {};

  // this is the actual part where the clothing is loaded
  if (bodyModel !== BodyType.Miitomo) {
    if (clothesType === -1) {
      // LOL no Clothes for you.

      return;
    }
    const shirtTexture = await loadClothingTexture(shirtKey);
    const params = {
      ...clothesModulate,
      map: shirtTexture
    };
    const newBodyMat = new originalMaterial(params);
    nBody.material = newBodyMat as any;
    nLegs.material = newBodyMat as any;
  } else {
    if (clothesType === -1) {
      // LOL no Clothes for you.
      bodyGroup.traverse((object) => {
        if ((object as THREE.Mesh).isMesh !== true) return;
        const mesh = object as THREE.Mesh;

        const suffix = gender === 1 ? "f" : "m";

        if (mesh.name === `body_${suffix}` || mesh.name === `legs_${suffix}`) {
          mesh.visible = true;
        } else {
          mesh.visible = false;
        }
      });
      return;
    }

    if (!ExtClothesMiitomoMeshAndTextureList[clothingEntry])
      throw new Error("No clothing entry for index " + clothingEntry);

    const entry = ExtClothesMiitomoMeshAndTextureList[clothingEntry];
    const list = Object.keys(entry);

    let promises: Promise<void>[] = [];

    bodyGroup.traverse((object) => {
      // for (let i = 0; i < bodyGroup.children.length; i++) {
      // const object = bodyGroup.children[i];
      if ((object as THREE.Mesh).isMesh !== true) return;
      const mesh = object as THREE.Mesh;

      const entryMeshIndex = list.findIndex(
        (key) => object.name === `clothes_${gender === 1 ? "f" : "m"}_` + key
      );
      console.log(object.name, entryMeshIndex);
      if (entryMeshIndex === -1) {
        mesh.visible = false;
        return;
      } else {
        mesh.visible = true;
      }

      promises.push(
        new Promise(async (resolve) => {
          const shirtTexture = await loadClothingTexture(
            (entry as any)[list[entryMeshIndex]]
          );
          const params = {
            ...clothesModulate,
            map: shirtTexture
          };
          const newBodyMat = new originalMaterial(params);
          mesh.material = newBodyMat as any;
          resolve();
        })
      );

      // }
    });

    await Promise.all(promises);
    console.log("doneloading");
  }

  // Dispose of old materials as they should now be replaced
  nBodyMat.dispose();
  nLegsMat.dispose();
}
