import JSZip from "jszip";
import localforage from "localforage";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { BodyType } from "../constants/BodyShaderTypes";

//! NOTE: THIS ASSUMES THE ROOT IS THE PUBLIC FOLDER
var gltfLoader = new GLTFLoader();
function makeModelPath(gender: string, modelName: string) {
  return `/assets/models/miiBody${gender}_${modelName}.glb`;
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

  return scene;
}

let bodyType = "wiiu";
export async function loadBodyModels() {
  if (Object.keys(bodyModels).length > 0) {
    // todo: dispose them? idk
    bodyModels = {};
  }
  bodyType = (await localforage.getItem("settings_bodyModel")) || "wiiu";

  if (bodyType === BodyType.StreetPass) {
    isStreetpassBody = true;
  }

  if (bodyModels.m) {
    bodyModels.m.traverse((o: any) => {
      if (o.isMesh) {
        o.dispose();
      }
    });
  }
  if (bodyModels.f) {
    bodyModels.f.traverse((o: any) => {
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
  const data = await fetch("/assets/models/hat_models_bundle.zip").then((j) =>
    j.blob()
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
let bodyModels: Record<string, THREE.Group | null> = {
  m: null,
  f: null
};
let hatModels: THREE.Group[] = [];

let isStreetpassBody = false;

export const isStreetpass = () => isStreetpassBody;
export const getBodyModels = () => bodyModels as Record<"m" | "f", THREE.Group>;
export const getHatModels = () => hatModels;
