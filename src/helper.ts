import * as THREE from "three";
import {
  createMiiRender,
  type RenderRequest,
  type RenderRequestNonTemporaryResult
} from "./util/IconRendering";
import {
  getBodyModels,
  getHatModels,
  loadBodyModels,
  loadClothesTextures,
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
import type { MiiCreatorAdditionalData } from "./util/MiiCreatorTypes.js";

// if (this === undefined) {
//   console.log("Running in module scope");
// } else {
//   console.log("Running in script scope");
// }

let FFLModule: any,
  FFLWorker: Worker | undefined,
  userData: any,
  helperRenderer = new THREE.WebGLRenderer();

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

const getAdditionalInfoFromMii = (miiData: Mii) =>
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
  console.debug("Loading clothing textures..");
  await loadClothesTextures();
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
    const {
      bodyModel,
      bodyModelAnims,
      bodyModelBody,
      bodyModelHands,
      bodyModelLegs,
      charModel,
      headModel,
      miiGroup
    } = (await createMiiRender({
      ...request,
      module: FFLModule,
      isTemporary: false,
      renderer: request.renderer,
      textureRenderer: helperRenderer
    })) as any as RenderRequestNonTemporaryResult;

    this.bodyModel = bodyModel;
    this.bodyModelBody = bodyModelBody;
    this.bodyModelHands = bodyModelHands;
    this.bodyModelLegs = bodyModelLegs;
    this.charModel = charModel;
    this.headModel = headModel;
    this.miiGroup = miiGroup;

    if (request.useAnimation) {
      this.mixer = new THREE.AnimationMixer(bodyModel);
      this.clips = new Map();

      for (const clip of bodyModelAnims!) {
        this.clips.set(clip.name, this.mixer.clipAction(clip));
      }
    }
  }

  subPosition!: THREE.Vector3;
  subScale!: THREE.Vector3;
  position!: THREE.Vector3;
  quaternion!: THREE.Quaternion;
  scale!: THREE.Vector3;

  mixerUpdate(delta: number) {
    // Extract the position and rotation from the matrix
    if (!this.subPosition) this.subPosition = new THREE.Vector3();
    if (!this.subScale) this.subScale = new THREE.Vector3();
    if (!this.position) this.position = new THREE.Vector3();
    if (!this.quaternion) this.quaternion = new THREE.Quaternion();
    if (!this.scale) this.scale = new THREE.Vector3();
    this.mixer.update(delta);

    let headBone = this.bodyModel.getObjectByName("head") as THREE.Bone;
    if (headBone === undefined)
      headBone = this.bodyModel.getObjectByName("Head") as THREE.Bone;

    if (!headBone) return alert("???");
    headBone.updateMatrixWorld(true);

    this.miiGroup.getWorldPosition(this.subPosition);
    headBone.matrixWorld.decompose(this.position, this.quaternion, this.scale);

    if (this.headModel) {
      // Instead of subtracting the group's position manually:
      // this.headModel.position.copy(this.position);
      // this.headModel.position.sub(this.subPosition);

      // Copy the head bone's world position
      this.headModel.position.copy(this.position);
      // Convert the head bone's world position to the group's local space
      this.miiGroup.worldToLocal(this.headModel.position);

      // Set the head model's rotation from the head bone's quaternion
      this.headModel.setRotationFromQuaternion(this.quaternion);
    }

    this.miiGroup.getWorldPosition(this.subPosition);
    headBone.matrixWorld.decompose(this.position, this.quaternion, this.scale);

    if (this.headModel) {
      // Instead of subtracting the group's position manually:
      // this.headModel.position.copy(this.position);
      // this.headModel.position.sub(this.subPosition);

      // Copy the head bone's world position
      this.headModel.position.copy(this.position);
      // Convert the head bone's world position to the group's local space
      this.miiGroup.worldToLocal(this.headModel.position);

      // Set the head model's rotation from the head bone's quaternion
      this.headModel.setRotationFromQuaternion(this.quaternion);
    }

    this.miiGroup.getWorldPosition(this.subPosition);
    headBone.matrixWorld.decompose(this.position, this.quaternion, this.scale);

    if (this.headModel) {
      // Instead of subtracting the group's position manually:
      // this.headModel.position.copy(this.position);
      // this.headModel.position.sub(this.subPosition);

      // Copy the head bone's world position
      this.headModel.position.copy(this.position);
      // Convert the head bone's world position to the group's local space
      this.miiGroup.worldToLocal(this.headModel.position);

      // Set the head model's rotation from the head bone's quaternion
      this.headModel.setRotationFromQuaternion(this.quaternion);
    }

    this.miiGroup.getWorldPosition(this.subPosition);
    headBone.matrixWorld.decompose(this.position, this.quaternion, this.scale);

    if (this.headModel) {
      // Instead of subtracting the group's position manually:
      // this.headModel.position.copy(this.position);
      // this.headModel.position.sub(this.subPosition);

      // Copy the head bone's world position
      this.headModel.position.copy(this.position);
      // Convert the head bone's world position to the group's local space
      this.miiGroup.worldToLocal(this.headModel.position);

      // Set the head model's rotation from the head bone's quaternion
      this.headModel.setRotationFromQuaternion(this.quaternion);
    }

    this.miiGroup.getWorldPosition(this.subPosition);
    headBone.matrixWorld.decompose(this.position, this.quaternion, this.scale);

    if (this.headModel) {
      // Instead of subtracting the group's position manually:
      // this.headModel.position.copy(this.position);
      // this.headModel.position.sub(this.subPosition);

      // Copy the head bone's world position
      this.headModel.position.copy(this.position);
      // Convert the head bone's world position to the group's local space
      this.miiGroup.worldToLocal(this.headModel.position);

      // Set the head model's rotation from the head bone's quaternion
      this.headModel.setRotationFromQuaternion(this.quaternion);
    }

    this.miiGroup.getWorldPosition(this.subPosition);
    headBone.matrixWorld.decompose(this.position, this.quaternion, this.scale);

    if (this.headModel) {
      // Instead of subtracting the group's position manually:
      // this.headModel.position.copy(this.position);
      // this.headModel.position.sub(this.subPosition);

      // Copy the head bone's world position
      this.headModel.position.copy(this.position);
      // Convert the head bone's world position to the group's local space
      this.miiGroup.worldToLocal(this.headModel.position);

      // Set the head model's rotation from the head bone's quaternion
      this.headModel.setRotationFromQuaternion(this.quaternion);
    }

    this.miiGroup.getWorldPosition(this.subPosition);
    headBone.matrixWorld.decompose(this.position, this.quaternion, this.scale);

    if (this.headModel) {
      // Instead of subtracting the group's position manually:
      // this.headModel.position.copy(this.position);
      // this.headModel.position.sub(this.subPosition);

      // Copy the head bone's world position
      this.headModel.position.copy(this.position);
      // Convert the head bone's world position to the group's local space
      this.miiGroup.worldToLocal(this.headModel.position);

      // Set the head model's rotation from the head bone's quaternion
      this.headModel.setRotationFromQuaternion(this.quaternion);
    }

    this.miiGroup.getWorldPosition(this.subPosition);
    headBone.matrixWorld.decompose(this.position, this.quaternion, this.scale);

    if (this.headModel) {
      // Instead of subtracting the group's position manually:
      // this.headModel.position.copy(this.position);
      // this.headModel.position.sub(this.subPosition);

      // Copy the head bone's world position
      this.headModel.position.copy(this.position);
      // Convert the head bone's world position to the group's local space
      this.miiGroup.worldToLocal(this.headModel.position);

      // Set the head model's rotation from the head bone's quaternion
      this.headModel.setRotationFromQuaternion(this.quaternion);
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
