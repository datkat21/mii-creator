import {
  CharModel,
  createAndRenderToTarget,
  createCharModel,
  FFLCharModelDescDefault,
  FFLExpression,
  FFLModelFlag,
  FFLResourceType,
  // getCameraForViewType,
  initCharModelTextures,
  makeExpressionFlag,
  parseHexOrB64ToUint8Array
} from "../external/ffl.js/ffl";
import {
  isShaderMaterial,
  getShaderMaterialFromShaderType,
  getSimpleMaterialAddLights
} from "../class/3d/shader/ShaderUtils";
import type { MiiCreatorAdditionalData } from "../util/MiiCreatorTypes";
import {
  getBodyModels,
  getClothesTextures,
  getHatModels,
  getLoadedBodyModelName,
  isStreetPass
} from "./ModelLoader";
import {
  cMaterialName,
  cPantsColorBlue,
  cPantsColorGold,
  cPantsColorGray,
  cPantsColorRed
} from "../class/3d/shader/fflShaderConst";
import {
  ClothesType,
  ClothesTypeList,
  ExtClothesList,
  HatType,
  HatTypeList
} from "../constants/Extensions";
import Mii from "../class/MiiData";
import {
  ForbiddenShirtPantColors,
  MiiFavoriteColorVec3Table,
  SwitchMiiColorTableSRGB
} from "../constants/ColorTables";
// import { streetpassHandScaling } from "./scaling";
import { ViewType, getCameraForViewType } from "./camera";
import { renderTargetToDataURL } from "./rendertarget";
import { ShaderType } from "../constants/BodyShaderTypes";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { colorMixTexture } from "../class/3d/shader/ColorMix";
import { loadBlobTextureWorker } from "../ui/pages/library/util/3DModel";
import FFLShaderMaterial from "../external/ffl.js/FFLShaderMaterial";
//@ts-expect-error shhhhhhh
import type * as THREE from "three";
import { _THREE } from "./PrepareThree";
import { clothingUpdate } from "../class/3d/ClothingHelper";

export const getAdditionalInfoFromMii = (miiData: Mii) =>
  ({
    hatCommonColor: miiData.hatCommonColor,
    hatFavoriteColor: miiData.hatFavoriteColor,
    hatType: miiData.hatType,
    pantsColor: miiData.pantsColor,
    shirtColor: miiData.shirtColor,
    favorite: miiData.favorite,
    special: miiData.special,
    temporary: miiData.temporary,
    eyeSclera: miiData.eyeSclera,
    clothesType: miiData.clothesType,
    shoesColor: miiData.shoesColor,
    wigType: miiData.wigType
  }) as MiiCreatorAdditionalData;

export const defaultParams: Partial<RenderRequest> = {
  type: ViewType.Face,
  expression: 0,
  characterYRotate: 0,
  modelFlag: FFLCharModelDescDefault,
  drawBody: true
};

const THREE = _THREE();
let renderer = new THREE.WebGLRenderer({
  alpha: true,
  powerPreference: "high-performance",
  antialias: false,
  stencil: false,
  depth: false
});
export const iconRenderer = () => renderer;

export interface RenderRequest {
  type: ViewType;
  expression: number | number[];
  data: Uint8Array | string;
  size: number;
  characterYRotate?: number;
  modelFlag?: any;
  renderer: THREE.WebGLRenderer;
  textureRenderer?: THREE.WebGLRenderer;
  drawBody: boolean;
  module: any;
  additionalInfo?: MiiCreatorAdditionalData;
  texResolution?: number;
  /**
   * Defines whether the render request is a temporary icon render (and uses a camera and render target.)
   */
  isTemporary?: boolean;
  shaderType?: ShaderType;
  clothingLinearColors?: boolean;
  bodyModelType?: IconBodyModelType;
}

export enum IconBodyModelType {
  low = "low",
  high = "high"
}

export const isWorker = () => typeof window === "undefined";

export type RenderRequestNonTemporaryResult = {
  bodyModel: THREE.Group;
  bodyModelBody: THREE.Mesh;
  bodyModelHands: THREE.Mesh;
  bodyModelLegs: THREE.Mesh;
  bodyModelAnims: THREE.AnimationClip[];
  charModel: CharModel;
  headModel: THREE.Group;
  miiGroup: THREE.Group;
};

// Helper function that is based on
// ffl.js createCharModelIcon and FFL-Testing
export function createMiiRender(
  request: RenderRequest
): Promise<{ type: string; result: string | Blob }> {
  return new Promise(async (resolve) => {
    // Parse input data
    let dataInput: Uint8Array;
    if (typeof request.data === "string")
      dataInput = parseHexOrB64ToUint8Array(request.data);
    else dataInput = request.data;

    let scene = new THREE.Scene();

    const isTemporary = request.isTemporary !== false;

    const mii = new Mii(dataInput);

    const localModule = request.module;

    if (localModule === undefined) throw new Error("Module NOT ready.");

    let modelFlag = FFLModelFlag.NORMAL;

    if (request.additionalInfo!.hatType !== -1) {
      switch (HatTypeList[request.additionalInfo!.hatType]) {
        case HatType.HAT:
          modelFlag = FFLModelFlag.HAT;
          break;
        case HatType.FACE_ONLY:
          modelFlag = FFLModelFlag.FACE_ONLY;
          break;
        case HatType.BALD:
          mii.hairType = 30;
          dataInput = mii.export("studioData");
          break;
      }
    }
    console.log(
      "miic additional info:",
      JSON.stringify(request.additionalInfo)
    );

    const shaderMaterial = await getShaderMaterialFromShaderType(
      request.shaderType
    );
    const isUsingShader = await isShaderMaterial(request.shaderType);

    let lights = await getSimpleMaterialAddLights(request.shaderType);
    if (lights) {
      lights(scene);
    }

    let texResolution = request.texResolution || 512;

    // Use a higher resolution texture
    if (request.size > 512) {
      texResolution = 1024;
    } else if (request.size > 1024) {
      texResolution = 2048;
    }

    let expressions = [];

    if (Array.isArray(request.expression)) {
      expressions.push(...request.expression);
    } else {
      expressions.push(
        isNaN(request.expression) ? FFLExpression.NORMAL : request.expression
      );
    }

    // Set up a temporary CharModel.
    const charModel = createCharModel(
      dataInput,
      {
        resolution: texResolution,
        resourceType: FFLResourceType.HIGH,
        allExpressionFlag: makeExpressionFlag(expressions),
        modelFlag
      },
      shaderMaterial as any,
      localModule,
      false
    );

    // QUICKLY Replace the material
    charModel._materialTextureClass = FFLShaderMaterial as any;
    charModel._materialClass = shaderMaterial;

    if (request.additionalInfo!.eyeSclera === 1 && mii.eyeColor !== 8) {
      self.eyeScleraHack = true;
    }

    initCharModelTextures(
      charModel,
      request.renderer,
      charModel._materialTextureClass
    );

    if (request.additionalInfo!.eyeSclera === 1 && mii.eyeColor !== 8) {
      self.eyeScleraHack = false;
    }

    // Create an offscreen scene for the icon.
    let miiGroup: THREE.Scene, headModel: THREE.Group;

    if (isTemporary) {
      miiGroup = scene;
      miiGroup.background = null; // Transparent background.
    } else {
      miiGroup = new THREE.Group() as any;
      headModel = new THREE.Group();
    }

    // Stuff related to hat and body rendering
    const gender = charModel._model.charInfo.personal.gender;
    const bodyScale = charModel.getBodyScale();

    let hatModel: THREE.Group;
    if (request.additionalInfo!.hatType !== -1) {
      let hatColor = [0, 0, 0];

      if (isTemporary)
        hatModel = getHatModels()[request.additionalInfo!.hatType].clone(true);
      else
        hatModel = getHatModels()[request.additionalInfo!.hatType].clone(true);

      // --- Calculate hat color

      // default = current favorite color
      hatColor =
        MiiFavoriteColorVec3Table[
          mii.favoriteColor % Object.keys(MiiFavoriteColorVec3Table).length
        ];

      // lazy overwrite
      if (request.additionalInfo!.hatFavoriteColor !== -1) {
        hatColor =
          MiiFavoriteColorVec3Table[request.additionalInfo!.hatFavoriteColor];
      }
      if (request.additionalInfo!.hatCommonColor !== -1) {
        hatColor =
          SwitchMiiColorTableSRGB[request.additionalInfo!.hatCommonColor];
      }

      console.log(
        "additional info:",
        request.additionalInfo,
        "hat model:",
        hatModel
      );
      hatModel.traverse((m) => {
        if ((m as THREE.Mesh).isMesh) {
          const oldMat = ((m as THREE.Mesh).material as THREE.MeshBasicMaterial)
            .map;

          let modulate = isUsingShader
            ? {
                modulateType: cMaterialName.FFL_MODULATE_TYPE_SHAPE_CAP,
                modulateMode: 2
              }
            : {};

          (m as THREE.Mesh as any).material = new shaderMaterial(
            {
              ...modulate,
              color: new THREE.Color(...hatColor),
              opacity: 1,
              map: oldMat!
            }!
          );
        }
      }) as any;

      if (isTemporary) {
        miiGroup.add(hatModel);
      } else {
        headModel!.add(hatModel);
      }

      // this could easier be done with a negative scale vector but eh
      const shiftPos = charModel.partsTransform.hatTranslate.y;
      if (request.drawBody) {
        if (isTemporary) {
          hatModel.position.set(0, bodyScale.y * 75 + shiftPos, 0);
        } else {
          hatModel.position.set(0, shiftPos, 0);
        }
      } else {
        charModel.partsTransform.hatTranslate.y;
        hatModel.position.set(0, shiftPos, 0);
      }
    }

    // Add meshes from the CharModel.
    const headMesh = charModel.meshes!.clone();
    if (isTemporary) {
      miiGroup.add(headMesh);
    } else {
      headModel!.add(headMesh);
    }

    let iconCamera: THREE.Camera;

    if (isTemporary)
      // Get camera based on viewType parameter.
      iconCamera = getCameraForViewType(
        request.type,
        undefined,
        undefined,
        bodyScale.y
      );

    let bodyModel: THREE.Group,
      bodyModelBody: THREE.Mesh,
      bodyModelHands: THREE.Mesh,
      bodyModelLegs: THREE.Mesh,
      bodyModelAnims: THREE.AnimationClip[];

    if (headModel! !== undefined) {
      miiGroup.add(headModel);
    }

    let prefix = "high";

    if (request.bodyModelType !== undefined) {
      prefix = request.bodyModelType;
    }

    if (request.drawBody && getBodyModels()[prefix + "M"] !== null) {
      switch (gender) {
        case 0: {
          if (isTemporary) bodyModel = getBodyModels()[prefix + "M"].scene;
          else
            bodyModel = SkeletonUtils.clone(
              getBodyModels()[prefix + "M"].scene
            ) as any;

          if (bodyModel === null)
            throw "Tried to make an icon before body models were loaded.";

          bodyModelBody = bodyModel.getObjectByName("body_m") as THREE.Mesh;
          bodyModelHands = bodyModel.getObjectByName("hands_m") as THREE.Mesh;
          bodyModelLegs = bodyModel.getObjectByName("legs_m") as THREE.Mesh;
          if (!isTemporary)
            bodyModelAnims = getBodyModels()[prefix + "M"].animations;
          break;
        }
        case 1: {
          if (isTemporary) bodyModel = getBodyModels()[prefix + "F"].scene;
          else
            bodyModel = SkeletonUtils.clone(
              getBodyModels()[prefix + "F"].scene
            ) as any;

          if (bodyModel === null)
            throw "Tried to make an icon before body models were loaded.";

          bodyModelBody = bodyModel.getObjectByName("body_f") as THREE.Mesh;
          bodyModelHands = bodyModel.getObjectByName("hands_f") as THREE.Mesh;
          bodyModelLegs = bodyModel.getObjectByName("legs_f") as THREE.Mesh;
          if (!isTemporary)
            bodyModelAnims = getBodyModels()[prefix + "F"].animations;
          break;
        }
        default:
          throw new Error(`Gender ${gender} is outisde range 0, 1`);
      }

      bodyModel.scale.set(bodyScale.x * 7, bodyScale.y * 7, bodyScale.z * 7);
      bodyModel.position.set(0, 0, 0);

      miiGroup.add(bodyModel);

      var shirtColor =
        MiiFavoriteColorVec3Table[
          mii.favoriteColor % Object.keys(MiiFavoriteColorVec3Table).length
        ];

      if (
        request.additionalInfo!.shirtColor !== -1 &&
        !ForbiddenShirtPantColors.includes(request.additionalInfo!.shirtColor)
      ) {
        shirtColor =
          SwitchMiiColorTableSRGB[request.additionalInfo!.shirtColor];
      }

      let modulate = isUsingShader
        ? {
            modulateType: cMaterialName.FFL_MODULATE_TYPE_SHAPE_BODY,
            modulateMode: 0
          }
        : {};

      bodyModelBody.material = new charModel._materialClass({
        ...modulate,
        color: new THREE.Color(...shirtColor),
        opacity: 1
      });

      if (bodyModelHands) bodyModelHands.material = bodyModelBody.material;

      var pantsColor = cPantsColorGray;
      var shoesColor: number[] = [1, 1, 1];

      // favorite/special check
      if (request.additionalInfo!.favorite === 1) {
        pantsColor = cPantsColorRed;
      }
      if (request.additionalInfo!.special === 1) {
        pantsColor = cPantsColorGold;
      }
      if (request.additionalInfo!.temporary === 1) {
        pantsColor = cPantsColorBlue;
      }

      if (
        request.additionalInfo!.pantsColor !== -1 &&
        !ForbiddenShirtPantColors.includes(request.additionalInfo!.pantsColor)
      ) {
        pantsColor =
          SwitchMiiColorTableSRGB[request.additionalInfo!.pantsColor];
      }

      if (
        request.additionalInfo!.shoesColor !== -1 &&
        !ForbiddenShirtPantColors.includes(request.additionalInfo!.shoesColor)
      ) {
        shoesColor =
          SwitchMiiColorTableSRGB[request.additionalInfo!.shoesColor];
      }

      modulate = isUsingShader
        ? {
            modulateType: cMaterialName.FFL_MODULATE_TYPE_SHAPE_PANTS,
            modulateMode: 0
          }
        : {};
      bodyModelLegs.material = new charModel._materialClass({
        ...modulate,
        color: new THREE.Color(...pantsColor),
        opacity: 1
      });

      const nBody = bodyModelBody;
      const nLegs = bodyModelLegs;

      THREE.ColorManagement.enabled = false;

      // CLOTHESSS
      if (
        request.additionalInfo!.clothesType !== undefined &&
        request.additionalInfo!.clothesType !== -1 &&
        request.bodyModelType !== IconBodyModelType.low &&
        (getLoadedBodyModelName() === "wiiu" ||
          getLoadedBodyModelName() === "miitomo") &&
        request.additionalInfo!.clothesType < ExtClothesList.length
      ) {
        console.log("LOADED BODY IS", getLoadedBodyModelName());
        await clothingUpdate({
          gender: mii.gender,
          clothesType: request.additionalInfo!.clothesType,
          renderer: request.textureRenderer || request.renderer,
          bodyModel: getLoadedBodyModelName(),
          shirtColor,
          pantsColor,
          shoesColor,
          facelineColor: charModel.facelineColor,
          clothesTextures: getClothesTextures(),
          nBody: bodyModelBody,
          nLegs: bodyModelLegs,
          bodyGroup: bodyModel,
          originalMaterial: charModel._materialClass,
          texResolution
        });
      } else {
        bodyModel.traverse((m) => {
          if ((m as THREE.Mesh).isMesh !== true) return;
          m.visible = false;
        });
        bodyModelBody.visible = true;
        bodyModelLegs.visible = true;
      }

      if (isTemporary) {
        headMesh.position.set(0, bodyScale.y * 75, 0);
      } else {
        headModel!.position.set(0, bodyScale.y * 75, 0);
      }

      if (isTemporary)
        switch (request.type) {
          case ViewType.Face:
          case ViewType.MakeIcon:
          case ViewType.IconFovy45:
          case ViewType.CreditIcon: {
            // Position the icon closer to the head
            iconCamera!.position.y += bodyScale.y * 76;
          }
        }

      if (request.bodyModelType === IconBodyModelType.low) {
        bodyModelHands.visible = false;
      }

      if (isStreetPass()) {
        // console.log("is streetpass");

        var scaleVec = new THREE.Vector3();
        bodyModel.getWorldScale(scaleVec);
        const handScaleX = (1 / scaleVec.x) * 5;
        const handScaleY = (1 / scaleVec.y) * 5;
        console.log(handScaleX, handScaleY);
        bodyModel
          .getObjectByName("handLPs")!
          .scale.set(handScaleX, handScaleY, handScaleX);
        bodyModel
          .getObjectByName("handRPs")!
          .scale.set(handScaleX, handScaleY, handScaleX);
        // streetpassHandScaling(bodyModel, );
      } else {
        // console.log("not streetpass");
      }
    }

    if (isTemporary) {
      const target = createAndRenderToTarget(
        miiGroup,
        iconCamera!,
        request.renderer,
        request.size,
        request.size
      );

      setTimeout(() => {
        const dataURL = renderTargetToDataURL(target, request.renderer);

        target.dispose(); // Dispose RenderTarget before returning.

        // Dispose temporary CharModel.
        charModel.dispose();

        // Dispose unused body/hat materials.
        if (request.drawBody) {
          (bodyModelBody!.material as THREE.Material).dispose();
          (bodyModelLegs!.material as THREE.Material).dispose();
        }

        // TODO: dispose hat material
        if (hatModel!) {
          hatModel.traverse((n) => {
            if (!(n as THREE.Mesh).isMesh) return;
            (n as THREE.Mesh).geometry.dispose();
            ((n as THREE.Mesh).material as THREE.MeshBasicMaterial).dispose();
          });
        }

        resolve(dataURL);
      }, 0);
    } else {
      return resolve({
        // assuming caller needs everything
        bodyModel: bodyModel!,
        bodyModelBody: bodyModelBody!,
        bodyModelHands: bodyModelHands!,
        bodyModelLegs: bodyModelLegs!,
        charModel: charModel,
        headModel: headModel!,
        miiGroup: miiGroup,
        bodyModelAnims: bodyModelAnims!
      } as any);
    }
  });
}
