import * as THREE from "three";
import { createMiiRender, type RenderRequest } from "./util/IconRendering";
import {
  getBodyModels,
  getHatModels,
  loadBodyModels,
  loadHatModels,
  setRoot
} from "./util/ModelLoader";
import {
  CharModel,
  FFLExpression,
  FFLModelFlag,
  FFLResourceType,
  initializeFFLWithResource,
  createCharModel,
  initCharModelTextures,
  makeExpressionFlag,
  parseHexOrB64ToUint8Array
} from "./external/ffl.js/ffl";
import Mii from "./class/MiiData";
import { dataToBase64, dataToHex } from "./util/dataConvert";
import {
  ForbiddenShirtPantColors,
  MiiFavoriteColorVec3Table,
  SwitchMiiColorTableSRGB
} from "./constants/ColorTables";
import {
  cMaterialName,
  cPantsColorBlue,
  cPantsColorGold,
  cPantsColorGray,
  cPantsColorRed
} from "./class/3d/shader/fflShaderConst";
import { ExtHatNameList, HatType, HatTypeList } from "./constants/Extensions";
import {
  getMaterialOverridesFromShaderType,
  getShaderMaterialFromShaderType
} from "./class/3d/shader/ShaderUtils";
import { BodyType, ShaderType } from "./constants/BodyShaderTypes";
import Html from "@datkat21/html";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

if (this === undefined) {
  console.log("Running in module scope");
} else {
  console.log("Running in script scope");
}

let FFLModule: any, FFLWorker: Worker | undefined, userData: any;

// function log(...content: string[]) {
//   console.debug("[miic helper]", ...content);
// }

const GUEST_MII_DATA = [
  "BAM5i2G9mwPpOoAAAADs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEEAAAAAAAAACAAAAAAAQAMDCAYEBgIKCAQEAgIMBAAAAP8ABAAACAQACggARP///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BAOFdPR8ZsuhdoAAAAHs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEIAAAAAAAAACAAAAAAAQAMDBgYEBgIKDAQEAgIMAAAAAP8ABQAACAQACgYAN////0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BAM2I3afbKlshYAAAALs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEMAAAAAAAAACAAAAAAAQAMDAQYEBgIKCAQEAgIMAQAAAP8AAAAACAQACgEAIf///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BAN9s2CERcxd8IAAAAPs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEQAAAAAAAAACAAAAAAAQAMDCAYEAAIKCAMEBAIMAgAAAP8AAgABCAQACggAGP///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BAP3BYyHQ6gZsoAAAATs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEUAAAAAAAAACAAAAAAAQAMDBwYEAAIKDQMEBAIMAAAAAP8ABgABCAQACgcADv///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BANfFfqpycZfsoAAAAXs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEYAAAAAAAAACAAAAAAAQAMDAQYEAAIKCAMEBAIMAAAAAP8ABwABCAQACgEADP///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",

  "BAVIEyyDkVU1GYD/cJm7kTTHqf8AAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEcAAAAAAAAACAAAAAAAQAMDCAYEBgIKCAQEAgIMBQAAAP8ACwAACAQACggAKv///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BAWUIlPmHJkY0oD/cJmB+j7p1g8AAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEgAAAAAAAAACAAAAAAAQAMDDgYEBgIKCQQEAgIMBwAAAP8ACQAACAQACg4APv///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BAVlJYmsV8fzIID/cJmJvGY0ejIAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEkAAAAAAAAACAAAAAAAQAMDAwYEBgIKCAQEAgIMBgAAAP8AAQAACAQACgMAef///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BABEp+/5p6E6GoDfGZofZsl0BT8AAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEoAAAAAAAAACAAAAAAAQAMDCAYEAAIKCAMEBAIMCAAAAP8AAwABCAQACggAB////0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BABEp+/5p6E6GoDfGZofZsl0BT8AAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEsAAAAAAAAACAAAAAAAQAMDDgYEAAIKCwMEBAIMBwAAAP8ACgABCAQACg4AX////0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BABEp+/5p6E6GoDfGZofZsl0BT8AAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEwAAAAAAAAACAAAAAAAQAMDBgYEAAIKCAMEBAIMBgAAAP8ACAABCAQACgYADP///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA=="
];

function getFFLModule() {
  return FFLModule;
}

const getAdditionalInfoFromMii = (miiData: Mii) => ({
  hatCommonColor: miiData.hatCommonColor,
  hatFavoriteColor: miiData.hatFavoriteColor,
  hatType: miiData.hatType,
  pantsColor: miiData.pantsColor,
  shirtColor: miiData.shirtColor,
  favorite: miiData.favorite,
  special: miiData.special,
  temporary: miiData.temporary,
  eyeSclera: miiData.eyeSclera
});

let root: URL;
try {
  if (import.meta) {
    root = new URL(import.meta.url);
  } else {
    throw new Error("HUH");
  }
} catch (e) {
  alert("SCRIPT SCOPE");
}

async function loadAssets(resourcePath: string, bodyType: string = "wiiu") {
  setRoot(root.origin + "/");
  console.debug("Loading body models..");
  await loadBodyModels(bodyType);
  console.debug("Loading hat models..");
  await loadHatModels();
  console.debug("Loaded all extra models.");

  FFLModule = (await import("./external/ffl.js/ffl-emscripten.js")).default;

  FFLModule = await FFLModule({
    locateFile: (path: string) => {
      return root.origin + "/dist/" + path;
    }
  });

  let m = await initializeFFLWithResource(FFLModule, resourcePath);
  FFLModule = m.module;
  console.debug("Loaded FFL.js!");
}

interface CharModelRequest extends RenderRequest {
  respectBodyColors: boolean;
  shaderType: string;
  useAnimation: boolean;
}

class MiiCreatorCharModel {
  // Entire group.
  miiGroup!: THREE.Group;
  // FFL CharModel.
  charModel!: CharModel;

  // Only head part of group.
  headModel!: THREE.Group;
  // Only body part of group.
  bodyModel!: THREE.Group;
  // Body meshes
  bodyModelBody!: THREE.Mesh;
  bodyModelHands!: THREE.Mesh;
  bodyModelLegs!: THREE.Mesh;

  mixer!: THREE.AnimationMixer;
  clips!: Map<string, THREE.AnimationAction>;

  constructor() {}

  async init(request: CharModelRequest) {
    // Parse input data
    let dataInput: Uint8Array;
    if (typeof request.data === "string")
      dataInput = parseHexOrB64ToUint8Array(request.data);
    else dataInput = request.data;

    const mii = new Mii(dataInput);

    const localModule = FFLModule;

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
    const shaderOverrides = await getMaterialOverridesFromShaderType(
      request.shaderType
    );

    let texResolution = 512;

    // Use a higher resolution texture
    if (request.size > 512) {
      texResolution = 1024;
    } else if (request.size > 1024) {
      texResolution = 2048;
    }

    if (request.texResolution) {
      texResolution = request.texResolution;
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
    this.charModel = charModel;

    if (request.additionalInfo!.eyeSclera === 1 && mii.eyeColor !== 8) {
      self.eyeScleraHack = true;
    }

    initCharModelTextures(charModel, request.renderer);

    if (request.additionalInfo!.eyeSclera === 1 && mii.eyeColor !== 8) {
      self.eyeScleraHack = false;
    }

    // Create an offscreen scene for the icon.
    this.miiGroup = new THREE.Group();
    this.headModel = new THREE.Group();

    // Stuff related to hat and body rendering
    const gender = charModel._model.charInfo.personal.gender;
    const bodyScale = charModel.getBodyScale();

    if (request.additionalInfo!.hatType !== -1) {
      let hatColor = [0, 0, 0];

      const hatModel =
        getHatModels()[request.additionalInfo!.hatType].clone(true);

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

      hatModel.traverse((m) => {
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

      this.headModel.add(hatModel);

      // this could easier be done with a negative scale vector but eh
      const shiftPos = charModel.partsTransform.hatTranslate.y;
      if (request.drawBody) {
        hatModel.position.set(0, bodyScale.y * 75 + shiftPos, 0);
      } else {
        charModel.partsTransform.hatTranslate.y;
        hatModel.position.set(0, shiftPos, 0);
      }
    }

    // Add meshes from the CharModel.
    const headMesh = charModel.meshes!.clone();
    this.headModel.add(headMesh);

    let bodyModel: THREE.Group,
      bodyModelBody: THREE.Mesh,
      bodyModelHands: THREE.Mesh,
      bodyModelLegs: THREE.Mesh,
      bodyModelAnims: THREE.AnimationClip[];

    this.miiGroup.add(this.headModel);

    if (request.drawBody && getBodyModels().m !== null) {
      switch (gender) {
        case 0: {
          bodyModel = SkeletonUtils.clone(getBodyModels().m.scene) as any;

          if (bodyModel === null)
            throw "Tried to make an icon before body models were loaded.";

          bodyModelBody = bodyModel.getObjectByName("body_m") as THREE.Mesh;
          bodyModelHands = bodyModel.getObjectByName("hands_m") as THREE.Mesh;
          bodyModelLegs = bodyModel.getObjectByName("legs_m") as THREE.Mesh;
          if (request.useAnimation) {
            bodyModelAnims = getBodyModels().m.animations;
          }
          break;
        }
        case 1: {
          bodyModel = SkeletonUtils.clone(getBodyModels().f.scene) as any;

          if (bodyModel === null)
            throw "Tried to make an icon before body models were loaded.";

          bodyModelBody = bodyModel.getObjectByName("body_f") as THREE.Mesh;
          bodyModelHands = bodyModel.getObjectByName("hands_f") as THREE.Mesh;
          bodyModelLegs = bodyModel.getObjectByName("legs_f") as THREE.Mesh;
          if (request.useAnimation) {
            bodyModelAnims = getBodyModels().f.animations;
          }
          break;
        }
        default:
          throw new Error(`Gender ${gender} is outisde range 0, 1`);
      }

      bodyModel.scale.set(bodyScale.x * 7, bodyScale.y * 7, bodyScale.z * 7);

      this.miiGroup.add(bodyModel);
      bodyModel.position.set(0, 0, 0);

      var shirtColor =
        MiiFavoriteColorVec3Table[
          mii.favoriteColor % Object.keys(MiiFavoriteColorVec3Table).length
        ];

      if (
        request.additionalInfo!.shirtColor !== -1 &&
        !ForbiddenShirtPantColors.includes(
          request.additionalInfo!.shirtColor
        ) &&
        request.respectBodyColors !== false
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
        !ForbiddenShirtPantColors.includes(
          request.additionalInfo!.pantsColor
        ) &&
        request.respectBodyColors !== false
      ) {
        pantsColor =
          SwitchMiiColorTableSRGB[request.additionalInfo!.pantsColor];
      }

      bodyModelLegs.material = new charModel._materialClass({
        modulateType: cMaterialName.FFL_MODULATE_TYPE_SHAPE_PANTS,
        modulateMode: 0,
        color: new THREE.Color(...pantsColor),
        opacity: 1
      });

      // headMesh.position.set(0, bodyScale.y * 73, 0);
      headMesh.position.set(0, bodyScale.y * 75, 0);

      this.bodyModel = bodyModel;
      this.bodyModelBody = bodyModelBody;
      this.bodyModelHands = bodyModelHands;
      this.bodyModelLegs = bodyModelLegs;

      if (request.useAnimation) {
        this.mixer = new THREE.AnimationMixer(bodyModel);
        this.clips = new Map();

        for (const clip of bodyModelAnims!) {
          this.clips.set(clip.name, this.mixer.clipAction(clip));
        }
      }
    }
  }

  mixerUpdate(delta: number) {
    this.mixer.update(delta);

    let headBone = this.bodyModel.getObjectByName("head") as THREE.Bone;
    if (headBone === undefined)
      headBone = this.bodyModel.getObjectByName("Head") as THREE.Bone;

    if (!headBone) return alert("???");
    headBone.updateMatrixWorld(true);

    // Extract the position and rotation from the matrix
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    headBone.matrixWorld.decompose(position, quaternion, scale);
    if (this.headModel) {
      // Set the head model's position and rotation
      this.headModel.position.copy(position);
      this.headModel.setRotationFromQuaternion(quaternion);
    }
  }

  setExpression(expression: number) {
    this.charModel.setExpression(expression);
  }

  // TODO: multiple expressionFlag, setExpression, dispose
}

function centerPopupWindow(url: string, title: string, w: number, h: number) {
  const left = screen.width / 2 - w / 2;
  const top = screen.height / 2 - h / 2;
  return window.open(
    url,
    title,
    `width=${w}, height=${h}, top=${top}, left=${left}`
  );
}

enum RequestType {
  Library = "library",
  PersonalMiiOnly = "personal_mii_only"
}

function requestUserData(type: RequestType, pageTitle = document.title) {
  return new Promise((resolve) => {
    let append = new URLSearchParams();

    switch (type) {
      case RequestType.Library:
        append.set("type", RequestType.Library);
        append.set("page_title", pageTitle);
        break;
      case RequestType.PersonalMiiOnly:
        append.set("type", RequestType.PersonalMiiOnly);
        append.set("page_title", pageTitle);
        break;
      default:
        throw new Error("Invalid request type.");
    }

    centerPopupWindow(
      root.origin + "/popup.html?" + append.toString(),
      "Mii Creator Login",
      800,
      600
    );

    const messageListener = (event: MessageEvent) => {
      if (event.data === undefined) return;
      if (event.data.type === undefined) return;
      if (event.data.type !== "miic-auth-finalize") return;
      if (event.data.canceled === true)
        return resolve({ canceled: true, data: null });

      window.removeEventListener("message", messageListener);

      userData = event.data.data;
      resolve({ canceled: false, data: event.data.data });
    };

    window.addEventListener("message", messageListener);
  });
}

function injectCss() {
  if (Html.qs("head>#mii-creator-helper-styles") === null) {
    new Html("style")
      .id("mii-creator-helper-styles")
      .html(
        /*css*/ `
.mch-select-modal {
  background: #0007;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
`
      )
      .appendTo("head");
  }
}

function requestMiiSelection() {
  return new Promise((resolve) => {
    injectCss();
    const container = new Html("div")
      .class("mch-select-modal")
      .appendTo("body");
    new Html("div").text("Select a Mii.").appendTo(container);

    setTimeout(() => {
      resolve(true);
    });

    // if (userData === undefined) return resolve(false);
    // if (userData.personal_mii === null) return resolve(false);
    // if (userData.library === null) return resolve(false);
  });
}

export {
  BodyType,
  createMiiRender,
  dataToBase64,
  dataToHex,
  ExtHatNameList,
  ForbiddenShirtPantColors,
  getAdditionalInfoFromMii,
  getFFLModule,
  GUEST_MII_DATA,
  loadAssets,
  Mii,
  requestMiiSelection as miiSelect,
  MiiCreatorCharModel,
  parseHexOrB64ToUint8Array,
  RequestType,
  requestUserData,
  ShaderType
};
