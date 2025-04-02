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
var imageLoader = new THREE.ImageBitmapLoader();
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
export async function loadBodyModels(
  input?: string,
  alsoLoadStreetPass: boolean = false
) {
  if (Object.keys(bodyModels).length > 0) {
    // todo: dispose them? idk
    bodyModels = {};
  }
  bodyType =
    input || (await localforage.getItem("settings_bodyModel")) || "wiiu";
  bodyModelName = bodyType;

  if (bodyType === BodyType.StreetPass) {
    isStreetPassBody = true;
  }

  if (bodyModels.highM) {
    bodyModels.highM.scene.traverse((o: any) => {
      if (o.isMesh) {
        o.dispose();
      }
    });
  }
  if (bodyModels.highF) {
    bodyModels.highF.scene.traverse((o: any) => {
      if (o.isMesh) {
        o.dispose();
      }
    });
  }

  bodyModels.highM = await loadBodyModel(makeModelPath("M", bodyType));
  bodyModels.highF = await loadBodyModel(makeModelPath("F", bodyType));

  if (alsoLoadStreetPass) {
    bodyModels.lowM = await loadBodyModel(makeModelPath("M", "streetpass"));
    bodyModels.lowF = await loadBodyModel(makeModelPath("F", "streetpass"));
  }
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

export async function loadClothesTextures() {
  clothesTextures = {};
  imageLoader.setOptions({ imageOrientation: "flipY" });

  // Load hat models bundle
  const data = await fetch(
    root + "assets/images/mii_clothes_textures_bundle.zip"
  ).then((j) => j.blob());
  console.log("Got it");
  const zip = await JSZip.loadAsync(data);
  console.log("Got zip");
  let promises = [];
  const fileList = Object.keys(zip.files);
  for (const file of fileList) {
    promises.push(zip.files[file].async("blob"));
  }
  const resolves = await Promise.all(promises);
  console.log("Got files");
  for (let i = 0; i < fileList.length; i++) {
    const url = URL.createObjectURL(resolves[i]);
    let result: any;

    console.log("Loading texture");
    result = new THREE.CanvasTexture(await imageLoader.loadAsync(url));
    // (result as THREE.Texture).flipY = true;
    console.log("Loading texture done");

    const fileName = fileList[i].split(".");
    fileName.pop();
    clothesTextures[fileName.join(".")] = result;
    console.log("Loading " + fileName.join("."));

    URL.revokeObjectURL(url);
  }
  console.log("Done");
}

// Cloneable models used
let bodyModels: Record<string, GLTF | null> = {
  highM: null,
  highF: null,
  lowM: null,
  lowF: null
};
let bodyModelName: string = "wiiu";
let hatModels: THREE.Group[] = [];
let clothesTextures: Record<string, THREE.Texture> = {};

let isStreetPassBody = false;

export const isStreetPass = () => isStreetPassBody;
export const getBodyModels = () => bodyModels as Record<string, GLTF>;
export const getHatModels = () => hatModels;
export const getLoadedBodyModelName = () => bodyModelName;
export const getClothesTextures = () => clothesTextures;
