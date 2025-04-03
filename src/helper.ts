import * as THREE from "three";
import {
  createMiiRender,
  type RenderRequest,
  type RenderRequestNonTemporaryResult
} from "./util/IconRendering";
import {
  loadBodyModels,
  loadClothesTextures,
  loadHatModels,
  setRoot
} from "./util/ModelLoader";
import {
  CharModel,
  initializeFFLWithResource,
  parseHexOrB64ToUint8Array,
  FFLiShapeType
} from "./external/ffl.js/ffl";
import Mii from "./class/MiiData";
import { dataToBase64, dataToHex } from "./util/dataConvert";
import { ForbiddenShirtPantColors } from "./constants/ColorTables";
import { ExtHatNameList } from "./constants/Extensions";
import { BodyType, ShaderType } from "./constants/BodyShaderTypes";
import Html from "@datkat21/html";
import type { MiiCreatorAdditionalData } from "./util/MiiCreatorTypes.js";
import {
  MiiExampleArray,
  MiiSelector,
  miiSelectorSetFflModule,
  miiSelectorSetRenderer
} from "./external/mii-selector/selector.js";

// if (this === undefined) {
//   console.log("Running in module scope");
// } else {
//   console.log("Running in script scope");
// }

let FFLModule: any,
  FFLWorker: Worker | undefined,
  userData: any,
  helperRenderer = new THREE.WebGLRenderer({ alpha: true });

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

let soundManager: SoundManager;

async function loadAssets(resourcePath: string, bodyType: string = "wiiu") {
  setRoot(root.origin + "/");
  console.debug("Loading body models..");
  await loadBodyModels(bodyType, true);
  console.debug("Loading hat models..");
  await loadHatModels();
  console.debug("Loading clothing textures..");
  await loadClothesTextures();
  soundManager = new SoundManager();
  console.debug("Loading sounds.");
  await loadBaseSounds(
    root.origin + "/assets/audio/miiSelector.zip",
    soundManager
  );
  console.debug("Loaded all resources.");

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

  init(request: CharModelRequest): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => {
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
          textureRenderer: helperRenderer,
          clothingLinearColors:
            request.clothingLinearColors === undefined
              ? true
              : request.clothingLinearColors
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

        resolve();
      }, 0);
    });
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
    this.mixer.update(delta); // <-- update animation

    // Force an update of all world matrices in the animated model
    this.bodyModel.updateMatrixWorld(true);

    let headBone = this.bodyModel.getObjectByName("head") as THREE.Bone;
    if (headBone === undefined)
      headBone = this.bodyModel.getObjectByName("Head") as THREE.Bone;

    if (!headBone) return alert("???");
    headBone.updateMatrixWorld(true);

    this.miiGroup.getWorldPosition(this.subPosition);
    headBone.matrixWorld.decompose(this.position, this.quaternion, this.scale);

    if (this.headModel) {
      // Copy the head bone's world position
      this.headModel.position.copy(this.position);
      // Convert the head bone's world position to the group's local space
      this.miiGroup.worldToLocal(this.headModel.position);

      // Set the head model's rotation from the head bone's quaternion
      this.headModel.setRotationFromQuaternion(this.quaternion);
    }
  }

  setExpression(expression: number, force: boolean = false) {
    if (force) {
      this.headModel.traverse((n) => {
        const m = n as THREE.Mesh;
        if (!m.isMesh) return;
        if (m.geometry.userData.modulateType !== FFLiShapeType.XLU_MASK) return;
        (m.material as THREE.MeshBasicMaterial).map =
          this.charModel._maskTargets[expression]!.texture;
      });
    } else {
      this.charModel.setExpression(expression);
    }
  }

  getExpressions() {
    return this.charModel._maskTargets
      .map((n, i) => (n !== null ? i : undefined))
      .filter((n) => n !== undefined);
  }

  // TODO: dispose
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
      .html(css)
      .appendTo("head");
  }
}

import { loadBaseSounds, SoundManager } from "./class/audio/SoundManager";
import { css, MiiSelectorMiiType } from "./external/mii-selector/selector_misc";

function requestMiiSelection() {
  console.log("userData:", userData);
  return new Promise((resolve) => {
    if (userData === undefined) return resolve(false);
    if (userData.library === null) return resolve(false);

    injectCss();

    new Html("div").id("mii-creator-selector-modal").appendTo("body");

    miiSelectorSetFflModule(FFLModule);
    miiSelectorSetRenderer(helperRenderer);
    MiiSelector.open(
      userData.library.map((n: any) => {
        let type = MiiSelectorMiiType.Regular;
        let mii = new Mii(n.mii);

        if (mii.favorite === 1) type = MiiSelectorMiiType.Favorite;
        if (mii.special === 1) type = MiiSelectorMiiType.Special;

        return { miiData: mii.export(), type };
      }),
      {
        allowGuest: true,
        soundManager,
        personalMii: userData.personal_mii.data
      }
    ).then((MiiResult) => {
      resolve(MiiResult);
    });

    // setTimeout(() => {
    //   resolve(true);
    // });

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
  ShaderType,
  soundManager
};
