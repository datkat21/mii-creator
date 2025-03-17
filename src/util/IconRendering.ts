import * as THREE from "three";
import {
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
  getMaterialOverridesFromShaderType,
  getShaderMaterialFromShaderType
} from "../class/3d/shader/ShaderUtils";
import type { MiiCreatorAdditionalData } from "../util/MiiCreatorTypes";
import { getBodyModels, getHatModels, isStreetpass } from "./ModelLoader";
import {
  cMaterialName,
  cPantsColorBlue,
  cPantsColorGold,
  cPantsColorGray,
  cPantsColorRed
} from "../class/3d/shader/fflShaderConst";
import { HatType, HatTypeList } from "../constants/Extensions";
import Mii from "../class/MiiData";
import {
  ForbiddenShirtPantColors,
  MiiFavoriteColorVec3Table,
  SwitchMiiColorTableSRGB
} from "../constants/ColorTables";
import { streetpassHandScaling } from "./scaling";
import { ViewType, getCameraForViewType } from "./camera";
import { renderTargetToDataURL } from "./rendertarget";

export const defaultParams: Partial<RenderRequest> = {
  type: ViewType.Face,
  expression: 0,
  characterYRotate: 0,
  modelFlag: FFLCharModelDescDefault,
  drawBody: true
};

export interface RenderRequest {
  type: ViewType;
  expression: number;
  data: Uint8Array | string;
  size: number;
  characterYRotate: number;
  modelFlag: any;
  renderer: THREE.WebGLRenderer;
  drawBody: boolean;
  module: any;
  additionalInfo?: MiiCreatorAdditionalData;
}

export const isWorker = () => typeof window === "undefined";

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

    const shaderMaterial = await getShaderMaterialFromShaderType();
    const shaderOverrides = await getMaterialOverridesFromShaderType();

    let texResolution = 512;

    // Use a higher resolution texture
    if (request.size > 512) {
      texResolution = 1024;
    } else if (request.size > 1024) {
      texResolution = 2048;
    }

    // Set up a temporary CharModel.
    const charModel = createCharModel(
      dataInput,
      {
        resolution: texResolution,
        resourceType: FFLResourceType.HIGH,
        allExpressionFlag: makeExpressionFlag([
          isNaN(request.expression) ? FFLExpression.NORMAL : request.expression
        ]),
        modelFlag
      },
      shaderMaterial as any,
      localModule,
      false
    );

    initCharModelTextures(charModel, request.renderer);

    // Create an offscreen scene for the icon.
    const iconScene = new THREE.Scene();
    iconScene.background = null; // Transparent background.

    // Stuff related to hat and body rendering
    const gender = charModel._model.charInfo.personal.gender;
    const bodyScale = charModel.getBodyScale();

    if (request.additionalInfo!.hatType !== -1) {
      let hatColor = [0, 0, 0];

      const model = getHatModels()[request.additionalInfo!.hatType];

      // --- Calculate hat color

      // default = current favorite color
      hatColor = MiiFavoriteColorVec3Table[mii.favoriteColor];

      // lazy overwrite
      if (request.additionalInfo!.hatFavoriteColor !== -1) {
        hatColor =
          MiiFavoriteColorVec3Table[request.additionalInfo!.hatFavoriteColor];
      }
      if (request.additionalInfo!.hatCommonColor !== -1) {
        hatColor =
          SwitchMiiColorTableSRGB[request.additionalInfo!.hatCommonColor];
      }

      model.traverse((m) => {
        if ((m as THREE.Mesh).isMesh) {
          const oldMat = ((m as THREE.Mesh).material as THREE.MeshBasicMaterial)
            .map;
          (m as THREE.Mesh as any).material = new shaderMaterial(
            {
              modulateType: cMaterialName.FFL_MODULATE_TYPE_SHAPE_CAP,
              modulateMode: 2,
              ...shaderOverrides,
              color: new THREE.Color(...hatColor),
              opacity: 1,
              map: oldMat!
            }!
          );
        }
      }) as any;

      iconScene.add(model);

      // this could easier be done with a negative scale vector but eh
      const shiftPos = charModel.partsTransform.hatTranslate.y;
      if (request.drawBody) {
        model.position.set(0, bodyScale.y * 75 + shiftPos, 0);
      } else {
        charModel.partsTransform.hatTranslate.y;
        model.position.set(0, shiftPos, 0);
      }
    }

    // Add meshes from the CharModel.
    const headMesh = charModel.meshes!.clone();
    iconScene.add(headMesh);

    // Get camera based on viewType parameter.
    const iconCamera = getCameraForViewType(
      request.type,
      undefined,
      undefined,
      bodyScale.y
    );

    let bodyModel: THREE.Group,
      bodyModelBody: THREE.Mesh,
      bodyModelHands: THREE.Mesh,
      bodyModelLegs: THREE.Mesh;

    if (request.drawBody && getBodyModels().m !== null) {
      switch (gender) {
        case 0: {
          bodyModel = getBodyModels().m;

          if (bodyModel === null)
            throw "Tried to make an icon before body models were loaded.";

          bodyModelBody = bodyModel.getObjectByName("body_m") as THREE.Mesh;
          bodyModelHands = bodyModel.getObjectByName("hands_m") as THREE.Mesh;
          bodyModelLegs = bodyModel.getObjectByName("legs_m") as THREE.Mesh;
          break;
        }
        case 1: {
          bodyModel = getBodyModels().f;

          if (bodyModel === null)
            throw "Tried to make an icon before body models were loaded.";

          bodyModelBody = bodyModel.getObjectByName("body_f") as THREE.Mesh;
          bodyModelHands = bodyModel.getObjectByName("hands_f") as THREE.Mesh;
          bodyModelLegs = bodyModel.getObjectByName("legs_f") as THREE.Mesh;
          break;
        }
        default:
          throw new Error(`Gender ${gender} is outisde range 0, 1`);
      }

      bodyModel.scale.set(bodyScale.x * 7, bodyScale.y * 7, bodyScale.z * 7);
      bodyModel.position.set(0, 0, 0);

      iconScene.add(bodyModel);

      var shirtColor = MiiFavoriteColorVec3Table[mii.favoriteColor];

      if (
        request.additionalInfo!.shirtColor !== -1 &&
        !ForbiddenShirtPantColors.includes(request.additionalInfo!.shirtColor)
      ) {
        shirtColor =
          SwitchMiiColorTableSRGB[request.additionalInfo!.shirtColor];
      }

      bodyModelBody.material = new charModel._materialClass({
        // ...charModel._materialParams,
        modulateType: cMaterialName.FFL_MODULATE_TYPE_SHAPE_BODY,
        modulateMode: 0,
        color: new THREE.Color(...shirtColor),
        opacity: 1
      });

      if (bodyModelHands) bodyModelHands.material = bodyModelBody.material;

      var pantsColor = cPantsColorGray;

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

      bodyModelLegs.material = new charModel._materialClass({
        // ...charModel._materialParams,
        modulateType: cMaterialName.FFL_MODULATE_TYPE_SHAPE_PANTS,
        modulateMode: 0,
        color: new THREE.Color(...pantsColor),
        opacity: 1
      });

      headMesh.position.set(0, bodyScale.y * 75, 0);

      switch (request.type) {
        case ViewType.Face:
        case ViewType.MakeIcon:
        case ViewType.IconFovy45:
        case ViewType.CreditIcon: {
          // Position the icon closer to the head
          iconCamera.position.y += bodyScale.y * 76;
        }
      }

      if (isStreetpass()) {
        console.log("is streetpass");

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
        console.log("not streetpass");
      }
    }

    const target = createAndRenderToTarget(
      iconScene,
      iconCamera,
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

      resolve(dataURL);
    }, 0);
  });
}
