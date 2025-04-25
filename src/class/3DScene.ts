import { _THREE } from "../util/PrepareThree";
const THREE = _THREE();
//@ts-expect-error shhh
import type * as THREE from "three";
// make sure types work with the patched GLTF loader
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import CameraControls from "camera-controls";
// import Mii from "../external/mii-js/mii";
import Mii from "../class/MiiData";
import {
  MiiFavoriteColorLookupTable,
  MiiFavoriteColorVec3Table,
  MiiSwitchSkinColorSRGB,
  SwitchMiiColorTableSRGB,
  ForbiddenShirtPantColors
} from "../constants/ColorTables";
import {
  cPantsColorBlue,
  cPantsColorGold,
  cPantsColorGray,
  cPantsColorRed,
  MiiFavoriteFFLColorLookupTable
} from "./3d/shader/fflShaderConst";
import { BodyUpdateType, MiiEditor, RenderPart } from "./MiiEditor";
import { Config } from "../config";
import { getSoundManager } from "./audio/SoundManager";
import { SparkleParticle } from "./3d/effect/SparkleParticle";
import {
  ClothesType,
  ClothesTypeList,
  ExtClothesList,
  HatType,
  HatTypeList
} from "../constants/Extensions";
import {
  cleanupLights,
  getShaderMaterialFromShaderType,
  getSimpleMaterialAddLights,
  isShaderMaterial,
  traverseAddShader,
  traverseMesh
} from "./3d/shader/ShaderUtils";
import { getSetting } from "../util/SettingsHelper";
import { ShaderType } from "../constants/BodyShaderTypes";
import { getHeadModel, getMaskTex, type ModelFlag } from "../util/MiiRendering";
import {
  FFLModulateType,
  makeExpressionFlag,
  type CharModel
} from "../external/ffl.js/ffl";
import JSZip from "jszip";
import { streetpassHandScaling } from "../util/scaling";

import {
  OutlineEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  BlendFunction,
  OverrideMaterialManager
} from "postprocessing";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { clothingUpdate } from "./3d/ClothingHelper";
import { getClothesTextures } from "../util/ModelLoader";

export enum CameraPosition {
  MiiHead,
  MiiFullBody
}
export enum SetupType {
  Normal,
  Screenshot
}

export class Mii3DScene {
  #camera: THREE.PerspectiveCamera;
  #controls: CameraControls;
  #textureLoader: THREE.TextureLoader;
  #gltfLoader!: GLTFLoader;
  #scene: THREE.Scene;
  #renderer: THREE.WebGLRenderer;
  #parent: HTMLElement;
  charModel!: CharModel | null;
  mii: Mii;
  ready: boolean;
  headReady: boolean;
  mixer!: THREE.AnimationMixer;
  animators: Map<string, (n: number, f: number) => any>;
  animations: Map<string, THREE.AnimationClip>;
  setupType: SetupType;
  #initCallback?: (renderer: THREE.WebGLRenderer) => any;
  type: "m" | "f";
  cameraPan!: boolean;
  shaderOverride: boolean;
  bodyModel!: string;
  handColor!: [number, number, number];
  shaderType!: ShaderType;
  simpleShaderLegacyColors!: boolean;
  hatModels!: GLTF[];
  clothingTextures!: Record<string, THREE.Texture>;
  editor?: MiiEditor;
  camSetup!: () => void;
  texResolution: number;

  // #composer!: EffectComposer;
  // #pass!: EffectPass;
  // #effect!: OutlineEffect;

  constructor(
    mii: Mii,
    parent: HTMLElement,
    setupType: SetupType = SetupType.Normal,
    initCallback?: (renderer: THREE.WebGLRenderer) => any,
    // shaderOverride uses MeshStandardMaterial
    shaderOverride: boolean = false,
    editor?: MiiEditor
  ) {
    this.animations = new Map();
    this.animators = new Map();
    this.anim = new Map();
    this.#parent = parent;
    this.#scene = new THREE.Scene();
    this.#camera = new THREE.PerspectiveCamera(
      45,
      parent.offsetWidth / parent.offsetHeight,
      0.1,
      1000
    );
    this.ready = false;
    this.headReady = false;
    this.texResolution = 512;
    if (initCallback) this.#initCallback = initCallback;
    this.shaderOverride = shaderOverride;
    this.editor = editor;

    if (setupType === SetupType.Screenshot) {
      this.#renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
        // logarithmicDepthBuffer: true,
        // powerPreference: "high-performance",
        // stencil: false,
        // depth: false
      });
      this.texResolution = 1024;
    } else {
      this.#renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
        // powerPreference: "high-performance",
        // stencil: false,
        // depth: false
      });
    }

    // this.stats = new Stats();
    // document.body.appendChild(this.stats.dom);

    // To fix default materials colors looking washed out,
    // shouldn't affect shader colors
    this.#renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    this.getRendererElement().classList.add("scene");
    this.setupType = setupType;

    getSetting("bodyModel").then((type) => {
      this.bodyModel = type;
    });

    // // Simple toon shader effect composer setup
    // getSetting("toonShaderOutline").then((enabled) => {
    //   if (enabled === true) {
    //     const multisampling = Math.min(
    //       4,
    //       this.#renderer.capabilities.maxSamples
    //     );
    //     OverrideMaterialManager.workaroundEnabled = true;
    //     this.#composer = new EffectComposer(this.#renderer, { multisampling });
    //     this.#composer.addPass(new RenderPass(this.#scene, this.#camera));
    //     this.#effect = new OutlineEffect(this.#scene, this.#camera, {
    //       blendFunction: BlendFunction.ALPHA,
    //       patternScale: 40,
    //       visibleEdgeColor: 0x000000,
    //       hiddenEdgeColor: 0x22090a,
    //       resolutionScale: 0.75,
    //       blur: false,
    //       xRay: false,
    //       multisampling,
    //       resolutionX: 512,
    //       resolutionY: 512,
    //       edgeStrength: 10
    //     });
    //     this.#pass = new EffectPass(this.#camera, this.#effect);
    //     this.#composer.addPass(this.#pass);
    //   }
    // });

    getSetting("shaderType").then((type) => {
      this.shaderType = type;
      getSetting("simpleShaderLegacyColors").then((val) => {
        this.simpleShaderLegacyColors = val;
      });
      this.#gltfLoader = new GLTFLoader();

      this.#gltfLoader.setMeshoptDecoder(MeshoptDecoder);

      if (type === "none") {
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const environmentMap = cubeTextureLoader.load([
          "./cube_map.png", // px.png
          "./cube_map.png", // nx.png
          "./cube_map.png", // py.png
          "./cube_map.png", // ny.png
          "./cube_map.png", // pz.png
          "./cube_map.png" // nz.png
        ]);
        this.#scene.environment = environmentMap;
        this.#scene.environmentIntensity = 1.25;

        const directionalLight = new THREE.DirectionalLight(0xebfeff, Math.PI);
        directionalLight.position.set(1, 0.1, 1);
        // directionalLight.visible = false;
        this.#scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0x666666, Math.PI / 16);
        // ambientLight.visible = false;
        this.#scene.add(ambientLight);
      } else if (type !== "lightDisabled") {
        this.#scene.environmentIntensity = 0;
      }

      // hack to make the camera focus correctly
      this.focusCamera(CameraPosition.MiiHead, true);
    });

    this.#renderer.setSize(512, 512);
    this.#renderer.setPixelRatio(window.devicePixelRatio);

    CameraControls.install({ THREE });

    this.#controls = new CameraControls(
      this.#camera,
      this.#renderer.domElement
    );
    if (setupType === SetupType.Normal) {
      this.camSetup = async () => {
        const canPan = this.cameraPan !== undefined ? this.cameraPan : false;

        // this.#controls.minAzimuthAngle = -0.6;
        // this.#controls.maxAzimuthAngle = 0.6;
        this.#controls.minAzimuthAngle = -Math.PI;
        this.#controls.maxAzimuthAngle = Math.PI;
        this.#controls.minPolarAngle = 0.98;
        this.#controls.maxPolarAngle = 1.8;

        if (canPan !== true) {
          console.log("canPan is not false:", canPan);
          this.#controls.mouseButtons.left = CameraControls.ACTION.ROTATE;
          this.#controls.mouseButtons.right = CameraControls.ACTION.NONE;
          this.#controls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
          this.#controls.touches.one = CameraControls.ACTION.TOUCH_ROTATE;
          this.#controls.touches.two = CameraControls.ACTION.TOUCH_DOLLY;
          this.#controls.touches.three = CameraControls.ACTION.NONE;
          this.#controls.enabled = true;
          this.#controls.minDistance = 10;
          this.#controls.maxDistance = 35;
          this.#controls.zoomTo(1);
          this.cameraPan = true;
        } else {
          console.log("canPan is True:", canPan);
          this.#controls.enabled = false;
          this.#controls.minDistance = 60;
          this.#controls.maxDistance = 140;
          this.#controls.dollyTo(380 / 10);
          this.#controls.zoomTo(2.5);
          this.cameraPan = false;
        }
      };
      this.camSetup();
    }

    if (setupType === SetupType.Screenshot) {
      // this.#controls.moveTo(0, 1.5, 0);
      this.#controls.dollyTo(40);
      this.#camera.fov = 30;

      // prevent too much zoom lol
      this.#controls.minDistance = 8;
      this.#controls.maxDistance = 300;
    } else {
      setTimeout(() => {
        this.focusCamera(CameraPosition.MiiHead, true);
      }, 200);
    }

    this.animators.set("cameraControls", (time, delta) => {
      this.#controls.update(delta);
    });

    this.#textureLoader = new THREE.TextureLoader();

    this.mii = mii;

    this.type = this.mii.gender === 0 ? "m" : "f";

    const clock = new THREE.Clock();

    const animate = (time: number) => {
      const delta = clock.getDelta();

      // this.stats.update();
      try {
        // if (this.#composer !== undefined) {
        // this.#composer.render(delta);
        // } else
        this.#renderer.render(this.#scene, this.#camera);
      } catch (e) {
        console.error(e);
      }
      // this is changed so the effect pass doesn't complain about "this" being undefined
      this.animators.forEach(function (f) {
        f(time, delta);
      });
    };

    this.#renderer.setClearAlpha(0);
    this.#renderer.setAnimationLoop(animate);

    this.#camera.aspect = this.#parent.offsetWidth / this.#parent.offsetHeight;
    this.#camera.updateProjectionMatrix();
    this.resize();
  }
  async #loadZip(
    path: string,
    out: keyof Mii3DScene,
    useKeys: boolean,
    type: "gltf" | "texture"
  ) {
    (this[out] as any) = [];

    // Load hat models bundle
    const data = await fetch(path).then((j) => j.blob());
    const zip = await JSZip.loadAsync(data);
    let promises = [];
    const fileList = Object.keys(zip.files);
    for (const file of fileList) {
      promises.push(zip.files[file].async("blob"));
    }
    const resolves = await Promise.all(promises);
    for (let i = 0; i < fileList.length; i++) {
      const url = URL.createObjectURL(resolves[i]);
      let result: any;
      if (type === "gltf") {
        result = await this.#gltfLoader.loadAsync(url);
      } else {
        result = await this.#textureLoader.loadAsync(url);
        (result as THREE.Texture).flipY = false;
      }
      if (useKeys) {
        const fileName = fileList[i].split(".");
        fileName.pop();
        (this[out] as any)[fileName.join(".")] = result;
      } else {
        (this[out] as any)[i] = result;
      }
      URL.revokeObjectURL(url);
    }
  }
  currentPosition!: CameraPosition;
  focusCamera(
    part: CameraPosition,
    force: boolean = false,
    transition: boolean = true,
    onlyReturn: boolean = false
  ) {
    this.#controls.smoothTime = 0.2;

    // don't re-position the camera if it is already in the correct location
    if (this.currentPosition === part && force === false) return;

    this.currentPosition = part;

    const pos = new THREE.Vector3();
    let body = this.#scene.getObjectByName(this.type)!,
      head = this.#scene.getObjectByName("MiiHead");

    const rotation = 0;

    if (part === CameraPosition.MiiFullBody) {
      if (body !== undefined && head !== undefined) {
        const box = new THREE.Box3().setFromObject(head);
        pos.y = box.max.y / 2;
      }
      if (onlyReturn === false) {
        let minInput = 0,
          maxInput = 127,
          minOutput = 38,
          maxOutput = 40;
        this.#controls.moveTo(pos.x, pos.y, pos.z, transition);
        this.#controls.rotateTo(rotation, Math.PI / 2, transition);
        if (this.cameraPan === false) {
          minOutput = 80;
          maxOutput = 96;
        }
        this.#controls.dollyTo(
          minOutput +
            ((this.mii.height - minInput) / (maxInput - minInput)) *
              (maxOutput - minOutput),
          transition
        );
      }
      return pos;
    } else if (part === CameraPosition.MiiHead) {
      switch (this.setupType) {
        case SetupType.Normal:
          if (body !== undefined) {
            const box = new THREE.Box3().setFromObject(body);
            pos.y = box.max.y - box.min.y;
          }
          if (onlyReturn === false) {
            this.#controls.moveTo(pos.x, pos.y + 2, pos.z, transition);
            this.#controls.rotateTo(rotation, Math.PI / 2, transition);
            this.#controls.dollyTo(25, transition);
            if (this.cameraPan === false) {
              this.#controls.moveTo(pos.x, pos.y + 1.75, pos.z, transition);
              this.#controls.dollyTo(65, transition);
            }
          }
          return pos;
        case SetupType.Screenshot:
          if (this.getHead() !== undefined) {
            const box = new THREE.Box3().setFromObject(this.getHead()!);
            pos.y = box.max.y - box.min.y;
          }
          this.#controls.moveTo(pos.x, pos.y + 1.75, pos.z, transition);
          this.#controls.rotateTo(rotation, Math.PI / 2, transition);
          this.#controls.dollyTo(30, transition);
          break;
      }
    }
  }
  focusCameraUpdate() {
    if (this.ready) this.camSetup();
    if (this.anim)
      switch (this.cameraPan) {
        case true:
          for (const [_, anim] of this.anim) {
            anim.timeScale = 0.5;
          }
          break;
        case false:
          for (const [_, anim] of this.anim) {
            anim.reset();
            anim.timeScale = 0;
          }
          break;
      }
    this.focusCamera(this.currentPosition, true, false);
  }
  playEndingAnimation() {
    this.#controls.enabled = false;
    this.focusCamera(CameraPosition.MiiFullBody, true);
    let heads = this.#scene.getObjectsByProperty("name", "MiiHead");
    for (const head of heads) {
      if (Config.renderer.useRendererServer) {
      }
      this.traverseAddFaceMaterial(
        head as THREE.Mesh,
        `&data=${encodeURIComponent(
          this.mii.exportHex("studioData")
        )}&expression=1&width=512`
      );
    }
    const type = this.mii.gender == 0 ? "m" : "f";
    this.animators.delete(`animation-${type}`);
    this.swapAnimation("Finish");
    getSoundManager().playSound("finish");
  }
  resize(
    width: number = this.#parent.offsetWidth,
    height: number = this.#parent.offsetHeight
  ) {
    this.resizeRendererToDisplaySize(width, height);

    // adjust ui depending on screen size
    let zoomValue = 1,
      widescreen = window.innerWidth > 960,
      is2DMode = !this.cameraPan;
    switch (this.currentPosition) {
      case CameraPosition.MiiHead:
        if (is2DMode) zoomValue = widescreen ? 2.5 : 3.25;
        else zoomValue = widescreen ? 1 : 1.25;
        break;
      case CameraPosition.MiiFullBody:
        if (is2DMode) zoomValue = widescreen ? 2.5 : 3.25;
        else zoomValue = 1;
        break;
    }

    if (this.setupType !== SetupType.Screenshot) {
      this.#controls.zoomTo(zoomValue, true);
    } else this.#controls.zoomTo(1);
  }
  // copied from three.js manual code lol
  resizeRendererToDisplaySize(width: number, height: number) {
    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();
    const canvas = this.#renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const w = Math.floor(canvas.clientWidth * pixelRatio);
    const h = Math.floor(canvas.clientHeight * pixelRatio);
    // const needResize = canvas.width !== w || canvas.height !== h;
    // if (needResize) {
    // }
    // return needResize;
    // if (this.#composer !== undefined) this.#composer.setSize(width, height);
    // else {
    this.#renderer.setSize(w, h, false);
    // }
  }
  preparing!: boolean;
  async init() {
    if (this.ready) return;
    if (this.preparing) return;
    this.preparing = true;
    this.ready = false;
    this.getRendererElement().style.opacity = "0";
    await this.#addBody();
    this.updateBody(BodyUpdateType.ClothingUpdate);

    this.swapAnimation("Wait", true);
    await this.#loadZip(
      "./assets/models/hat_models_bundle.zip",
      "hatModels",
      false,
      "gltf"
    );
    await this.#loadZip(
      "./assets/images/mii_clothes_textures_bundle.zip",
      "clothingTextures",
      true,
      "texture"
    );
    this.ready = true;
    this.preparing = false;
    this.resize();
    this.updateBody(BodyUpdateType.ClothingUpdate);
    if (this.setupType === SetupType.Screenshot) {
      this.#initCallback && this.#initCallback(this.#renderer);
      this.resize();
      requestAnimationFrame(() => {
        this.resize();
      });
      setTimeout(() => {
        this.resize();
      }, 0);
    } else {
      // weird hacky fix to correct the camera position at startup
      this.resize();
      setTimeout(() => {
        this.resize();
        this.focusCamera(CameraPosition.MiiHead, true, false);
      }, 500);
    }

    // this.#scene.fog = new THREE.FogExp2(0xff0000, 1);
    // let a = new THREE.PlaneGeometry(50, 50);
    // let m = new THREE.Mesh(
    //   a,
    //   new FFLShaderMaterial({
    //     color: new THREE.Color(0x00ff00),
    //     modulateMode: 0,
    //     modulateType: 0
    //   }) as any
    // );
    // m.rotation.set(-(Math.PI / 2), 0, 0);
    // this.#scene.add(m);
  }
  getRendererElement() {
    return this.#renderer.domElement;
  }
  anim!: Map<"m" | "f", THREE.AnimationAction>;
  currentAnim!: string;
  initAnimation(mesh: THREE.Object3D, id: string) {
    console.debug("playAnimation() called:", mesh, id);

    // weird hack to prevent random crash
    if (this.mixer === undefined)
      this.mixer = new THREE.AnimationMixer(this.#scene.getObjectByName("m")!);

    this.animators.set(id, (_time, delta) => {
      try {
        this.mixer.update(delta);
      } catch (e) {
        console.warn(e);
      }
    });
  }
  swapAnimation(newAnim: string, force: boolean = false) {
    if (newAnim === this.currentAnim) return;
    console.debug("swapAnimation() called:", newAnim);
    if (force !== true) {
      for (const [_, anim] of this.anim) {
        anim.fadeOut(0.2);
      }
    } else {
      for (const [_, anim] of this.anim) {
        anim.fadeOut(0).reset().stop();
      }
    }
    this.currentAnim = newAnim;
    let x: ("m" | "f")[] = ["m", "f"];
    for (const key of x) {
      let clip;

      try {
        clip = this.mixer.clipAction(
          this.animations.get(`${key}-${newAnim}`)!,
          this.#scene.getObjectByName(key)
        );
      } catch (e) {
        return;
      }
      this.anim.set(key, clip);
      this.anim
        .get(key)!
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1);

      // hack to prevent anim from being sped up
      if (newAnim === "Wait") {
        setTimeout(() => {
          this.anim.get(key)!.timeScale = 0.5;
        }, 33.33);
      }
      if (newAnim === "Finish") {
        setTimeout(() => {
          this.anim.get(key)!.timeScale = 0.8;
        }, 33.33);
      }

      if (force === false) {
        this.anim.get(key)!.fadeIn(0.2).play();
      } else {
        this.anim.get(key)!.play();
      }

      this.anim.get(key)!.timeScale = 1;
    }
  }
  async #addBody() {
    console.log("addBody()");
    const setupMiiBody = async (path: string, type: "m" | "f") => {
      const glb = await this.#gltfLoader.loadAsync(path);

      const clips = glb.animations;

      let armature = glb.scene.getObjectByName(type)!;

      this.mixer = new THREE.AnimationMixer(armature);
      for (const anim of clips) {
        this.animations.set(`${type}-${anim.name}`, anim);
      }

      glb.scene.name = `${type}-body-root`;

      // RAF WAS HERE
      this.#scene.add(glb.scene);

      // attempt to solve weird animations not working issue
      this.initAnimation(glb.scene.getObjectByName(type)!, `animation-${type}`);

      // Add materials to body and legs
      const gBodyMesh = glb.scene.getObjectByName(
        `body_${type}`
      )! as THREE.Mesh;
      gBodyMesh.geometry.userData = {
        cullMode: 1,
        modulateColor: MiiFavoriteFFLColorLookupTable[this.mii.favoriteColor],
        modulateMode: 0,
        modulateType: 9
      };
      if (this.shaderOverride)
        // Override material with a MeshStandardMaterial
        gBodyMesh.material = new THREE.MeshStandardMaterial({
          roughness: 1,
          metalness: 1,
          color: MiiFavoriteColorLookupTable[this.mii.favoriteColor]
        });
      // adds shader material
      else traverseMesh(gBodyMesh, this.shaderType);

      const gHandsMesh = glb.scene.getObjectByName(
        `hands_${type}`
      )! as THREE.Mesh;
      if (gHandsMesh) {
        gHandsMesh.geometry.userData = {
          cullMode: 1,
          modulateColor: MiiFavoriteFFLColorLookupTable[this.mii.favoriteColor],
          modulateMode: 0,
          modulateType: 9
        };
        if (this.shaderOverride)
          gHandsMesh.material = new THREE.MeshStandardMaterial({
            roughness: 1,
            metalness: 1,
            color: MiiFavoriteColorLookupTable[this.mii.favoriteColor]
          });
        // adds shader material
        else {
          traverseMesh(gHandsMesh, this.shaderType);
        }
      }

      const gLegsMesh = glb.scene.getObjectByName(
        `legs_${type}`
      )! as THREE.Mesh;
      gLegsMesh.geometry.userData = {
        cullMode: 1,
        modulateColor: cPantsColorGray,
        modulateMode: 0,
        modulateType: 10
      };
      if (this.shaderOverride)
        gLegsMesh.material = new THREE.MeshStandardMaterial({
          metalness: 1,
          roughness: 1,
          color: new THREE.Color(
            this.getPantsColor()[0],
            this.getPantsColor()[1],
            this.getPantsColor()[2]
          )
        });
      // adds shader material
      else traverseMesh(gLegsMesh, this.shaderType);

      if (this.#scene.getObjectByName("m"))
        this.#scene.getObjectByName("m")!.visible = false;
      if (this.#scene.getObjectByName("f"))
        this.#scene.getObjectByName("f")!.visible = false;

      glb.scene.rotation.set(0, 0, 0);
      console.log(`setupBody("${path}", "${type}")`);
    };

    const bodyModel = (await getSetting("bodyModel")) as string;

    const loaders = [
      setupMiiBody(`./assets/models/miiBodyM_${bodyModel}.glb`, "m"),
      setupMiiBody(`./assets/models/miiBodyF_${bodyModel}.glb`, "f")
    ];

    await Promise.all(loaders);

    console.log("READY");
  }
  getShirtColor() {
    return this.mii.shirtColor !== -1 && this.mii.shirtColor < 100
      ? SwitchMiiColorTableSRGB[this.mii.shirtColor]
      : MiiFavoriteFFLColorLookupTable[this.mii.favoriteColor];
  }
  getShoesColor() {
    return this.mii.shoesColor !== -1 && this.mii.shoesColor < 100
      ? SwitchMiiColorTableSRGB[this.mii.shoesColor]
      : [1, 1, 1];
  }
  getPantsColor() {
    if (
      this.mii.pantsColor !== -1 &&
      this.mii.pantsColor < 100 &&
      !ForbiddenShirtPantColors.includes(this.mii.pantsColor)
    ) {
      return SwitchMiiColorTableSRGB[this.mii.pantsColor];
    }

    if (this.mii.special) {
      return cPantsColorGold;
    }
    if (this.mii.favorite) {
      return cPantsColorRed;
    }
    if (this.mii.temporary) {
      return cPantsColorBlue;
    }
    return cPantsColorGray;
  }
  async updateBody(updateType: BodyUpdateType = BodyUpdateType.None) {
    if (!this.ready) return;
    this.resize();

    this.type = this.mii.gender === 0 ? "m" : "f";

    const bodyM = this.#scene.getObjectByName("m-body-root");
    const bodyF = this.#scene.getObjectByName("f-body-root");
    if (!bodyM) return;
    if (!bodyF) return;

    const build = this.mii.build;
    const height = this.mii.height;

    // Ported from FFL-Testing
    let scaleFactors = { x: 0, y: 0, z: 0 };
    // Note that 1.0 scale roughly
    // translates to 82 build/83 height.

    switch (Config.mii.scalingMode) {
      case "scaleLimit": // Limits scale to hide pants.
        // NOTE: even in wii u mii maker this still shows a few
        // pixels of the pants, but here without proper body scaling
        // this won't actually let you get away w/o pants
        let heightFactor = height / 128.0;
        scaleFactors.y = heightFactor * 0.55 + 0.6;
        scaleFactors.x = heightFactor * 0.3 + 0.6;
        scaleFactors.x =
          (heightFactor * 0.6 + 0.8 - scaleFactors.x) * (build / 128.0) +
          scaleFactors.x;
        break;
      case "scaleLimitClampY": // Same as above but clamps Y.
        heightFactor = height / 128.0;
        scaleFactors.y = heightFactor * 0.55 + 0.6;
        scaleFactors.x = heightFactor * 0.3 + 0.6;
        scaleFactors.x =
          (heightFactor * 0.6 + 0.8 - scaleFactors.x) * (build / 128.0) +
          scaleFactors.x;
        // Limit Y scale.
        scaleFactors.y = Math.min(scaleFactors.y, 1.0);
        break;
      case "scaleApply": // Scale seen on Wii U/Switch.
        // 0.47 / 128.0 = 0.003671875
        scaleFactors.x =
          (build * (height * 0.003671875 + 0.4)) / 128.0 +
          // 0.23 / 128.0 = 0.001796875
          height * 0.001796875 +
          0.4;
        // 0.77 / 128.0 = 0.006015625
        scaleFactors.y = height * 0.006015625 + 0.5;
        break;
    }

    scaleFactors.z = scaleFactors.x;

    let body = this.type === "m" ? bodyM : bodyF;

    const traverseBones = (object: THREE.Object3D) => {
      object.scale.set(scaleFactors.x, scaleFactors.y, scaleFactors.z);

      if (this.bodyModel === "streetpass") {
        streetpassHandScaling(body);
      }

      // this.#scene
      //   .getObjectByName("MiiHead")!
      //   .scale.set(
      //     0.12 / scaleFactors.x,
      //     0.12 / scaleFactors.y,
      //     0.12 / scaleFactors.z
      //   );
      // object.traverse((o: THREE.Object3D) => {
      //   if ((o as THREE.Bone).isBone) {
      //     // attempt at porting some bone scaling code.. disabled for now
      //     const bone = o as THREE.Bone;
      //     if (bone.name === "head") return;
      //     let boneScale = { x: 1, y: 1, z: 1 };
      //     switch (bone.name) {
      //       case "skl_root":
      //         break;
      //       case "chest":
      //       case "hip":
      //       case "foot_l1":
      //       case "foot_l2":
      //       case "foot_r1":
      //       case "foot_r2":
      //         boneScale.x = scaleFactors.x;
      //         boneScale.y = scaleFactors.y;
      //         boneScale.z = scaleFactors.z;
      //         break;
      //       case "arm_l1":
      //       case "arm_l2":
      //       case "arm_r1":
      //       case "arm_lr2":
      //         boneScale.x = scaleFactors.y;
      //         boneScale.y = scaleFactors.x;
      //         boneScale.z = scaleFactors.z;
      //         break;
      //       case "wrist_l":
      //       case "wrist_r":
      //       case "ankle_l":
      //       case "ankle_r":
      //         boneScale.x = scaleFactors.x;
      //         boneScale.y = scaleFactors.x;
      //         boneScale.z = scaleFactors.x;
      //         break;
      //       default:
      //         break;
      //       // case "chest":
      //       // case "chest_2":
      //       // case "hip":
      //       // case "foot_l1":
      //       // case "foot_l2":
      //       // case "foot_r1":
      //       // case "foot_r2":
      //       //   boneScale.x = scaleFactors.x;
      //       //   boneScale.y = scaleFactors.y;
      //       //   boneScale.z = scaleFactors.z;
      //       //   break;
      //       // case "arm_l1":
      //       // case "arm_l2":
      //       // case "elbow_l":
      //       // case "arm_r1":
      //       // case "arm_r2":
      //       // case "elbow_r":
      //       //   boneScale.x = scaleFactors.y;
      //       //   boneScale.y = scaleFactors.x;
      //       //   boneScale.z = scaleFactors.z;
      //       //   break;
      //       // case "wrist_l":
      //       // case "shoulder_l":
      //       // case "wrist_r":
      //       // case "shoulder_r":
      //       // case "ankle_l":
      //       // case "knee_l":
      //       // case "ankle_r":
      //       // case "knee_r":
      //       //   boneScale.x = scaleFactors.x;
      //       //   boneScale.y = scaleFactors.x;
      //       //   boneScale.z = scaleFactors.x;
      //       //   break;
      //       // case "head":
      //       //   boneScale.x = scaleFactors.x;
      //       //   boneScale.y = Math.min(scaleFactors.y, 1.0);
      //       //   boneScale.z = scaleFactors.z;
      //       //   break;
      //     }
      //     bone.scale.set(boneScale.x, boneScale.y, boneScale.z);
      //   }
      // });
    };

    const shaderSetting = await getSetting("shaderType");
    const bodyModel = await getSetting("bodyModel");

    const makeHeadBoneUpdate = (body: THREE.Object3D) => {
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      return () => {
        let headBone = body.getObjectByName("head") as THREE.Bone;
        if (headBone === undefined)
          headBone = body.getObjectByName("Head") as THREE.Bone;

        if (!headBone) return;
        headBone.updateMatrixWorld(true);

        // Extract the position and rotation from the matrix
        const position = new THREE.Vector3();

        headBone.matrixWorld.decompose(position, quaternion, scale);
        if (this.#scene.getObjectByName("MiiHead")!) {
          // Set the head model's position and rotation
          this.#scene.getObjectByName("MiiHead")!.position.copy(position);
          this.#scene
            .getObjectByName("MiiHead")!
            .setRotationFromQuaternion(quaternion);
          if (bodyModel === "miitomo") {
            // hacky
            this.#scene.getObjectByName("MiiHead")!.rotation.z -= Math.PI / 2;
          } else {
            this.#scene.getObjectByName("MiiHead")!.position.y += 0.1;
          }
        }
      };
    };

    const assignMaterial = async (
      bodyN: THREE.Object3D<THREE.Object3DEventMap>,
      type: string
    ) => {
      const hasShaderApplied =
        // (shaderSetting.startsWith("wiiu") ||
        //   shaderSetting === "lightDisabled") &&
        this.shaderOverride === false;

      const nBody = bodyN
        .getObjectByName(type)!
        .getObjectByName("body_" + type)! as THREE.Mesh;

      const nLegs = bodyN
        .getObjectByName(type)!
        .getObjectByName("legs_" + type)! as THREE.Mesh;

      if (updateType === BodyUpdateType.ClothingUpdate) {
        if (hasShaderApplied) {
          (nBody.material as any).color = new THREE.Color(
            ...this.getShirtColor()
          );
        }
        if (hasShaderApplied)
          (nLegs.material as any).color = new THREE.Color(
            ...this.getPantsColor()
          );

        if (this.mii.clothesType === -1) {
          const isUsingShader = await isShaderMaterial();
          let shirtModulate = isUsingShader
            ? { modulateMode: 0, modulateType: 9 }
            : {};
          let pantsModulate = isUsingShader
            ? { modulateMode: 0, modulateType: 10 }
            : {};
          (nBody.material as any) =
            new (await getShaderMaterialFromShaderType())({
              color: new THREE.Color(
                this.getShirtColor()[0],
                this.getShirtColor()[1],
                this.getShirtColor()[2]
              ),
              ...shirtModulate
            });
          (nLegs.material as any) =
            new (await getShaderMaterialFromShaderType())({
              color: new THREE.Color(
                this.getPantsColor()[0],
                this.getPantsColor()[1],
                this.getPantsColor()[2]
              ),
              ...pantsModulate
            });
        }

        // Clothing update should run anyways just to fix miitomo meshes visibility.
        await clothingUpdate({
          gender: this.mii.gender,
          clothesType: this.mii.clothesType,
          renderer: this.#renderer,
          bodyModel: this.bodyModel,
          shirtColor: this.getShirtColor(),
          pantsColor: this.getPantsColor(),
          shoesColor: this.getShoesColor(),
          facelineColor: this.charModel!.facelineColor,
          nBody: nBody,
          nLegs: nLegs,
          bodyGroup: this.#scene.getObjectByName(
            this.type
          )! as unknown as any as THREE.Group,
          clothesTextures: getClothesTextures(),
          originalMaterial: await getShaderMaterialFromShaderType()
        });
      }
    };

    switch (this.mii.gender) {
      // m
      case 0:
        bodyM.getObjectByName("m")!.visible = true;
        bodyF.getObjectByName("f")!.visible = false;

        // Attach head to head bone of body (not physically this time)
        this.animators.set("head_bone", makeHeadBoneUpdate(bodyM));

        // Scale each bone except for body
        traverseBones(bodyM);

        assignMaterial(bodyM, "m");
        break;
      // f
      case 1:
        bodyM.getObjectByName("m")!.visible = false;
        bodyF.getObjectByName("f")!.visible = true;

        // Attach head to head bone of body (not physically this time)
        this.animators.set("head_bone", makeHeadBoneUpdate(bodyF));

        // Scale each bone except for body
        traverseBones(bodyF);

        assignMaterial(bodyF, "f");
        break;
    }

    // Update camera smoothly when body scaling is changed in the editor
    if (updateType === BodyUpdateType.RepositionCamera)
      requestAnimationFrame(() => {
        this.focusCamera(this.currentPosition, true, true, false);
      });
    else
      requestAnimationFrame(() => {
        this.resize();
      });
  }
  debugGetScene() {
    return this.#scene;
  }
  fadeIn() {
    if (this.setupType === SetupType.Normal) {
      this.getRendererElement().style.opacity = "0";
      setTimeout(() => {
        this.getRendererElement().style.opacity = "1";
      }, 500);
    } else {
      // Screenshot mode only
      this.getRendererElement().style.opacity = "1";
    }
  }
  async updateMiiHead(renderPart: RenderPart = RenderPart.Head) {
    if (!this.ready) {
      console.log("first time loading head");
    }
    let head = this.#scene.getObjectsByProperty("name", "MiiHead");

    switch (renderPart) {
      case RenderPart.Head:
        try {
          // CUSTOM APP-SPECIFIC DATA
          const tmpMii = new Mii(this.mii.export("miic"));
          let params: Record<string, string> = {};
          if (this.mii.hatType !== -1) {
            // Custom hat model types
            switch (HatTypeList[this.mii.hatType]) {
              case HatType.HAT:
                params["modelType"] = "hat";
                break;
              case HatType.FACE_ONLY:
                params["modelType"] = "face_only";
                break;
              case HatType.BALD:
                // BALD HAIR!!!
                tmpMii.hairType = 30;
                break;
            }
          }
          params["verifyCharInfo"] = "0";
          let GLB: GLTF;
          if (Config.renderer.useRendererServer) {
            // TODO: FIX THIS FOR SERVER RENDERING LOL
            GLB = null as any;
            // GLB = await this.#gltfLoader.loadAsync(
            //   tmpMii.studioUrl({
            //     ext: "glb",
            //     texResolution: "512",
            //     miiName: this.mii.miiName,
            //     creatorName: this.mii.creatorName,
            //     miic: encodeURIComponent(this.mii.encode().toString("base64")),
            //     ...params
            //   } as unknown as any)
            // );
          } else {
            let modelType: ModelFlag = "NORMAL";

            switch (params.modelType) {
              case "hat":
                modelType = "HAT";
                break;
              case "face_only":
                modelType = "FACE_ONLY";
                break;
            }

            GLB = await getHeadModel(
              tmpMii,
              this.getRenderer(),
              modelType,
              this.texResolution
            );
          }

          GLB.scene.name = "MiiHead";
          // head is no longer attached to head bone physically, no more need to offset rotation
          // GLB.scene.rotation.set(-Math.PI / 2, 0, 0);
          // GLB.scene.scale.set(0.12, 0.12, 0.12);
          var headScale = 0.14;
          GLB.scene.scale.set(headScale, headScale, headScale);

          // enable shader on head
          if (head) {
            // if (this.#effect !== undefined)
            //   head.forEach((h) =>
            //     h.traverse((n) => {
            //       if (!(n as THREE.Mesh).isMesh) return;
            //       this.#effect.selection.delete(n);
            //     })
            //   );

            this.#scene.remove(...head);
            // hack to force remove head anyways
            this.#scene
              .getObjectsByProperty("name", "MiiHead")
              .forEach((obj) => {
                obj.parent!.remove(obj);
              });
          }
          console.debug("Adding head to scene");
          this.resize();

          this.#scene.add(GLB.scene);

          if (Config.renderer.useRendererServer)
            traverseAddShader(GLB.scene, this.shaderType);

          let lights = await getSimpleMaterialAddLights(this.shaderType);
          cleanupLights(this.#scene);
          if (lights) {
            lights(this.#scene);
          }

          // else {
          //   this.#pastCharModel = (GLB as any).CharModel;
          // }

          console.debug("Traversing shader now");

          const body = this.#scene.getObjectByName(this.type)!;

          let headBone = body.getObjectByName("head") as THREE.Bone;
          if (headBone === undefined)
            headBone = body.getObjectByName("Head") as THREE.Bone;

          if (!headBone) return;
          headBone.updateMatrixWorld(true);

          // Extract the position and rotation from the matrix
          const position = new THREE.Vector3();
          const quaternion = new THREE.Quaternion();
          const scale = new THREE.Vector3();

          headBone.matrixWorld.decompose(position, quaternion, scale);
          if (GLB.scene) {
            // Set the head model's position and rotation
            GLB.scene.position.copy(position);
            GLB.scene.setRotationFromQuaternion(quaternion);
            console.debug("Positioning head to body");
            // GLB.scene.rotation.x -= Math.PI / 2;
          }

          const bodyModelType = this.bodyModel;

          if (Config.renderer.useRendererServer === false) {
            if (this.charModel) {
              // console.log("Past Char Model:", this.#pastCharModel);
              if (this.charModel.dispose) {
                this.charModel.dispose();
                this.charModel = null;
              }
            }
            this.charModel = (GLB as any).CharModel;
          }

          // Hacky fix for head being snapped in the wrong direction for 1 frame
          if (bodyModelType === "miitomo") {
            GLB.scene.rotation.z -= Math.PI / 2;
          }

          try {
            if (this.mii.hatType !== -1) {
              let hatModel = this.hatModels[this.mii.hatType].scene.clone(true);

              hatModel.name = "HatScene";
              // hatModel.scene.renderOrder = -1;
              let i = 0;
              if (GLB.asset.extras.partsTransform.hatTranslate) {
                const vec = GLB.asset.extras.partsTransform.hatTranslate;
                hatModel.position.add(vec);

                // TODO: Hats
                switch (HatTypeList[this.mii.hatType]) {
                  case HatType.SIDE:
                    // const pos =
                    //   GLB.asset.extras.partsTransform.headSideTranslate;
                    // hatModel.position.set(0, 0, 0);
                    // hatModel.position.copy(pos);
                    // const [rx, ry, rz] =
                    //   GLB.asset.extras.partsTransform.headSideRotate;
                    // const rot = new THREE.Vector3(rx, ry, rz);
                    // hatModel.rotation.setFromVector3(rot);
                    break;
                  case HatType.FRONT:
                    break;
                  case HatType.TOP:
                    break;
                }
              }
              let shaderSetting = await getSetting("shaderType");
              hatModel.traverse((o: any) => {
                // "HatRoot" would be the name of the parent object to the hat if it is an armature
                if (o.name === "HatScene" || o.name === "HatRoot") return;

                if ((o as THREE.Mesh).isMesh) {
                  let m = o as THREE.Mesh;
                  const mat = m.material as THREE.MeshStandardMaterial;

                  // let tableToPullFrom = MiiFavoriteColorVec3Table;
                  // if (shaderSetting === "none") {
                  //   // bug: inaccurate colors
                  //   tableToPullFrom = MiiFavoriteColorVec3Table;

                  //   if (this.simpleShaderLegacyColors === true) {
                  //     tableToPullFrom = MiiFavoriteColorVec3Table;
                  //   }
                  // }
                  // const tex = multiplyTexture(
                  //   mat.map!,
                  //   tableToPullFrom[
                  //     this.mii.extHatColor !== 0
                  //       ? this.mii.extHatColor - 1
                  //       : this.mii.favoriteColor
                  //   ]
                  // );
                  // VERY HACKY SET HAT TEXTURE
                  // setTimeout(() => {
                  // (
                  //   m.material as THREE.ShaderMaterial
                  // ).uniforms.s_texture.value = tex;
                  // }, 16.66);
                  m.material = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    map: mat.map!
                  });
                  (m.material as THREE.MeshBasicMaterial).needsUpdate = true;
                  m.geometry.userData = {
                    // ignore: 1,
                    cullMode: 0,
                    modulateColor:
                      this.mii.hatCommonColor !== -1 &&
                      this.mii.hatCommonColor < 100
                        ? SwitchMiiColorTableSRGB[this.mii.hatCommonColor]
                        : MiiFavoriteColorVec3Table[
                            this.mii.hatFavoriteColor !== -1
                              ? this.mii.hatFavoriteColor
                              : this.mii.favoriteColor
                          ],
                    modulateMode: 5, //5,
                    modulateType: 5 //5,
                  };

                  i++;

                  if (Config.renderer.useRendererServer === false) {
                    // apply shader material!
                    // var mc = m.geometry.userData["modulateColor"];
                    traverseMesh(m, this.shaderType);
                    // m.material = new LUTShaderMaterial({
                    //   modulateMode: 0,
                    //   modulateType: 5,
                    //   modulateColor: [mc[0], mc[1], mc[2], 1],
                    //   map: tex,
                    // });
                  }
                }
              });

              GLB.scene.add(hatModel);
            }
          } catch (e) {
            console.error(
              "Hat type resulted in an error, but we're not going to let that stop the head from rendering!",
              e
            );
          }
        } catch (e) {
          console.error(e);
        }
        break;
      case RenderPart.Face:
        if (head.length > 0) {
          head.forEach((h) => {
            this.traverseAddFaceMaterial(
              h as THREE.Mesh,
              `&data=${encodeURIComponent(
                this.mii.exportHex("studioData")
              )}&width=512`
            );
          });
        }
        break;
    }

    // //@ts-expect-error
    // window.thisEffect = this.#effect;
    // //@ts-expect-error
    // window.thisComposer = this.#composer;
    // //@ts-expect-error
    // window.thisPass = this.#pass;

    const traverseHierarchy = (
      tree: THREE.Object3D<THREE.Object3DEventMap>
    ) => {
      tree.traverse((n) => {
        if (!(n as THREE.Mesh).isMesh) return;
        const modulateType = (n as THREE.Mesh).geometry.userData.modulateType;
        if (
          modulateType !== undefined &&
          (modulateType === FFLModulateType.SHAPE_MASK ||
            modulateType === FFLModulateType.SHAPE_GLASS)
        )
          return;

        // if (this.#effect !== undefined) this.#effect.selection.add(n);
      });
    };

    traverseHierarchy(this.getHead()!);
    traverseHierarchy(this.#scene.getObjectByName("m")!);
    traverseHierarchy(this.#scene.getObjectByName("f")!);

    if (this.headReady === false) this.fadeIn();
    this.headReady = true;
    // await this.updateBody();
    this.resize();
  }

  particles!: SparkleParticle[];
  lastSparkleTime!: number;
  sparkle() {
    if (!this.particles) this.particles = [];
    if (!this.lastSparkleTime) this.lastSparkleTime = 0;
    if (performance.now() - this.lastSparkleTime < 150) {
      return;
    }

    this.lastSparkleTime = performance.now();
    // remove all previous sparkles lol
    // this.animators
    //   .keys()
    //   .filter((p) => p.startsWith("particle_"))
    //   .forEach((key) => this.animators.delete(key));

    this.#textureLoader.load("./assets/images/star.png", (texture) => {
      const pos = new THREE.Vector3();
      const box = new THREE.Box3();
      if (this.#scene.getObjectByName("MiiHead") !== undefined) {
        this.#scene.getObjectByName("MiiHead")!.getWorldPosition(pos);
        box.setFromObject(this.#scene.getObjectByName("MiiHead")!);
      }
      let particle = new SparkleParticle(
        this.#scene,
        new THREE.Vector3(0, pos.y + box.min.y / 2, 2),
        texture
      );
      this.particles.push(particle);
      this.animators.set("particle_" + performance.now(), (_t, delta) =>
        particle.update(delta)
      );
      setTimeout(() => {
        this.particles.forEach((p, i) => {
          p.dispose();
        });
        this.particles = [];
        Array.from(this.animators.keys())
          .filter((p) => p.startsWith("particle_"))
          .forEach((key) => {
            this.animators.delete(key);
          });
      }, 1000);
    });
  }
  getHead() {
    return this.#scene.getObjectByName("MiiHead");
  }
  traverseAddFaceMaterial(node: THREE.Mesh, urlParams: string) {
    // Dispose of old head materials
    node.traverse((c) => {
      let child = c as THREE.Mesh;
      if (child.isMesh) {
        if (child.geometry.userData) {
          const data = child.geometry.userData as {
            cullMode: number;
            modulateColor: number[];
            modulateMode: number;
            modulateType: number;
          };
          if (data.modulateMode) {
            if (data.modulateType === 6) {
              // found face!!
              (async () => {
                const mat = child.material as THREE.MeshBasicMaterial;
                const oldMat = mat;

                var loadUrl: string | null =
                  Config.renderer.renderFaceURL + urlParams;
                let tex: THREE.Texture;

                if (Config.renderer.useRendererServer === false) {
                  console.log("READY");
                  const params = new URLSearchParams(urlParams);
                  let expressionFlag = new Uint32Array([
                    1, 0, 0
                  ]) as Uint32Array<ArrayBufferLike>;

                  if (params.has("expression")) {
                    expressionFlag = makeExpressionFlag(
                      Number(params.get("expression")!)
                    );
                  }
                  console.log(
                    "Expression:",
                    params.get("expression"),
                    expressionFlag
                  );
                  const { img, model } = await getMaskTex(
                    this.mii,
                    this.getRenderer(),
                    expressionFlag
                  );
                  console.log("DONE");
                  loadUrl = null;
                  tex = img;
                  model.dispose();
                } else {
                  tex = await this.#textureLoader.loadAsync(loadUrl);
                }

                if (tex) {
                  tex.flipY = false;
                  // Initialize the texture on the GPU to prevent lag frames
                  this.#renderer.initTexture(tex);

                  (child.material as THREE.MeshBasicMaterial)!.map = tex;
                  (child.material as THREE.MeshBasicMaterial)!.transparent = true;

                  // child.material = new THREE.MeshBasicMaterial({
                  //   map: tex,
                  //   // emissiveIntensity: 1,
                  //   transparent: true,
                  //   // metalness: 1,
                  //   // toneMapped: true,
                  //   alphaTest: 0.5
                  // });

                  // Now... Replace it with shader material
                  // traverseMesh(child, this.mii);

                  oldMat.dispose();
                }
              })();
            }
          }
        }
      }
    });
  }

  // screenshot mode helper utils
  // also used for debugging
  getCamera() {
    return this.#camera;
  }
  getControls() {
    return this.#controls;
  }
  getScene() {
    return this.#scene;
  }
  getRenderer() {
    return this.#renderer;
  }

  shutdown() {
    // this.stats.dom.parentElement!.removeChild(this.stats.dom);
    // this.stats.end();
    Array.from(this.animators.keys()).forEach((k) => {
      this.animators.delete(k);
    });
  }
}
