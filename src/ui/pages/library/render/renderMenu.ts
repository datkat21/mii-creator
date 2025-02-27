import Html from "@datkat21/html";
import {
  CanvasTexture,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Mesh,
  type ShaderMaterial,
  type Texture
} from "three";
import { GLTFExporter } from "three/examples/jsm/Addons.js";
import { Mii3DScene, SetupType } from "../../../../class/3DScene";
import { sRGB } from "../../../../util/Color";
import { saveArrayBuffer } from "../../../../util/downloadLink";
import { getSetting } from "../../../../util/SettingsHelper";
import Modal from "../../../components/Modal";
import type { MiiLocalforage } from "../../Library";
import { customRender } from "./customRender";
import { miiRenderPresets } from "./renderPresets";
import { traverse3DMaterialFix } from "../util/3DModel";
import { traverseAddShader } from "../../../../class/3d/shader/ShaderUtils";
import type Mii from "../../../../class/MiiData";

export const miiRender = (mii: MiiLocalforage, miiData: Mii) => {
  Modal.modal(
    "Render Mii",
    "What would you like to do?",
    "body",
    {
      text: "Download 3D head model",
      async callback() {
        const holder = new Html("div").style({ opacity: "0" });
        const scene = new Mii3DScene(
          miiData,
          holder.elm,
          SetupType.Screenshot,
          (renderer) => {},
          true
        );
        // hide body
        scene.init().then(async () => {
          await scene.updateMiiHead();
          scene.getScene().getObjectByName("m")!.visible = false;
          scene.getScene().getObjectByName("f")!.visible = false;

          const shaderSetting = await getSetting("shaderType");
          // const bodyModelHands = await getSetting("bodyModelHands");

          if (shaderSetting === "none") {
            const result = await Modal.prompt(
              "Notice",
              "3D model export looks best when using the Wii U shader, which you aren't using.\nThis may result in incorrect color output. Do you still want to continue?",
              "body"
            );
            if (result === false) return;
          }

          // assuming shader isn't already present?
          // extremely hacky delay
          traverse3DMaterialFix(scene);
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(null);
            }, 250);
          });
          const exporter = new GLTFExporter();
          exporter.parse(
            scene.getScene(),
            (gltf) => {
              console.log("gltf", gltf);
              if (gltf instanceof ArrayBuffer) {
                saveArrayBuffer(gltf, miiData.nickname + "_head.glb");
              }
              scene.shutdown();
            },
            (error) => {
              console.error("Oops, something went wrong:", error);
            },
            {
              binary: true
            }
          );
        });
      }
    },
    {
      text: "Render presets",
      async callback() {
        miiRenderPresets(mii, miiData);
      }
    },
    {
      text: "Make your own render",
      async callback() {
        customRender(miiData);
      }
    },
    {
      text: "Cancel"
    }
  );
};
