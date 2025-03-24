import JSZip from "jszip";
import localforage from "localforage";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/Addons.js";
import { BodyType } from "../constants/BodyShaderTypes";

//! NOTE: THIS ASSUMES THE ROOT IS THE PUBLIC FOLDER
let root = "/";
export const setRoot = (newRoot: string) => {
  root = newRoot;
};
var gltfLoader = new GLTFLoader();
function makeModelPath(gender: string, modelName: string) {
  return `${root}assets/models/miiBody${gender}_${modelName}.glb`;
}
async function loadBodyModel(modelPath: string) {
  const model = await gltfLoader.loadAsync(modelPath);

  var mixer = new THREE.AnimationMixer(model.scene);
  const scene = model.scene;

  if (model.animations.length > 0) {
    const idleClip = model.animations[0];
    const idleAnim = mixer.clipAction(idleClip, scene);
    idleAnim.stop();
    try {
      const clip = model.animations.find((a) => a.name === "Pose.01")!;
      const anim = mixer.clipAction(clip, scene);
      anim.play();
      anim.timeScale = 0;
      anim.paused = true;
      mixer.update(0);
    } catch (e) {}
  } else console.warn("Body model has no animations");

  return model;
}

let bodyType = "wiiu";
export async function loadBodyModels(input?: string) {
  if (Object.keys(bodyModels).length > 0) {
    // todo: dispose them? idk
    bodyModels = {};
  }
  bodyType =
    input || (await localforage.getItem("settings_bodyModel")) || "wiiu";

  if (bodyType === BodyType.StreetPass) {
    isStreetpassBody = true;
  }

  if (bodyModels.m) {
    bodyModels.m.scene.traverse((o: any) => {
      if (o.isMesh) {
        o.dispose();
      }
    });
  }
  if (bodyModels.f) {
    bodyModels.f.scene.traverse((o: any) => {
      if (o.isMesh) {
        o.dispose();
      }
    });
  }

  bodyModels.m = await loadBodyModel(makeModelPath("M", bodyType));
  bodyModels.f = await loadBodyModel(makeModelPath("F", bodyType));
}

export async function loadHatModels() {
  // Load hat models bundle
  // todo: dispose them? idk
  hatModels = [];
  const data = await fetch(root + "assets/models/hat_models_bundle.zip").then(
    (j) => j.blob()
  );
  const zip = await JSZip.loadAsync(data);
  let promises = [];
  const fileList = Object.keys(zip.files);
  for (const file of fileList) {
    promises.push(zip.files[file].async("blob"));
  }
  const resolves = await Promise.all(promises);
  for (let i = 0; i < fileList.length; i++) {
    console.log("File:", fileList[i]);
    const url = URL.createObjectURL(resolves[i]);
    const gltf = await gltfLoader.loadAsync(url);
    hatModels[i] = gltf.scene;
    URL.revokeObjectURL(url);
  }
}

// Cloneable models used
let bodyModels: Record<string, GLTF | null> = {
  m: null,
  f: null
};
let hatModels: THREE.Group[] = [];

let isStreetpassBody = false;

export const isStreetpass = () => isStreetpassBody;
export const getBodyModels = () => bodyModels as Record<"m" | "f", GLTF>;
export const getHatModels = () => hatModels;
