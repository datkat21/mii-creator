import Html from "@datkat21/html";
import { GLTFExporter } from "three/examples/jsm/Addons.js";
import { Mii3DScene, SetupType } from "../../../../class/3DScene";
import { saveArrayBuffer } from "../../../../util/downloadLink";
import { getSetting } from "../../../../util/SettingsHelper";
import Modal, { buttonsOkCancel } from "../../../components/Modal";
import type { MiiLocalforage } from "../../Library";
import { customRender } from "./customRender";
import { miiRenderPresets } from "./renderPresets";
import { traverse3DMaterialFix } from "../util/3DModel";
import type Mii from "../../../../class/MiiData";

import { _ } from "../../../../util/Lang";
const __ = _();

export const miiRender = (mii: MiiLocalforage, miiData: Mii) => {
  Modal.modal(
    __("Render Mii"),
    __("What would you like to do?"),
    "body",
    {
      text: __("Download 3D head model"),
      async callback() {
        Modal.modal(
          __("Warning"),
          __(
            "3D model download has been disabled due to some buggy normals exporting going on at the moment.\nIn the meantime, you can use Arian's Mii Renderer to get head models.\nSorry about that."
          ),
          "body",
          ...buttonsOkCancel
        );
        // const holder = new Html("div").style({ opacity: "0" });
        // const scene = new Mii3DScene(
        //   miiData,
        //   holder.elm,
        //   SetupType.Screenshot,
        //   (renderer) => {},
        //   true
        // );
        // // hide body
        // scene.init().then(async () => {
        //   scene.texResolution = 1024;
        //   await scene.updateMiiHead();
        //   scene.getScene().getObjectByName("m")!.visible = false;
        //   scene.getScene().getObjectByName("f")!.visible = false;

        //   // assuming shader isn't already present?
        //   // extremely hacky delay
        //   traverse3DMaterialFix(scene);
        //   await new Promise((resolve) => {
        //     setTimeout(() => {
        //       resolve(null);
        //     }, 250);
        //   });
        //   const exporter = new GLTFExporter();
        //   exporter.parse(
        //     scene.getScene(),
        //     (gltf) => {
        //       console.log("gltf", gltf);
        //       if (gltf instanceof ArrayBuffer) {
        //         saveArrayBuffer(
        //           gltf,
        //           // mii head model file name - e.g. 'Mii_head_1741271879076.glb'
        //           __("%1_head_%2.glb", miiData.nickname, new Date().toJSON())
        //         );
        //       }
        //       scene.shutdown();
        //     },
        //     (error) => {
        //       console.error("Oops, something went wrong:", error);
        //     },
        //     {
        //       binary: true
        //     }
        //   );
        // });
      }
    },
    {
      text: __("Render presets"),
      async callback() {
        miiRenderPresets(mii, miiData);
      }
    },
    {
      text: __("Custom render"),
      async callback() {
        // Modal.modal(
        //   __("Warning"),
        //   __(
        //     "Custom render mode has been temporarily disabled while I work out some issues regarding expressions.\nSorry about that."
        //   ),
        //   "body",
        //   ...buttonsOkCancel
        // );
        customRender(miiData);
      }
    },
    {
      text: "Cancel"
    }
  );
};
