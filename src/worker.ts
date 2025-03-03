import { WebGLRenderer } from "three";
import * as FFL from "./external/ffl.js/ffl";
import {
  getMaterialOverridesFromShaderType,
  getShaderMaterialFromShaderType
} from "./class/3d/shader/ShaderUtils.js";
import type { MiiExpression } from "./external/ffl/FFLTypes.js";
import type { MiiCreatorAdditionalData } from "./external/ffl.js/MiiCreatorTypes.js";
import { loadBodyModels, loadHatModels } from "./util/ModelLoader.js";
import { createMiiRender, type RenderRequest } from "./util/IconRendering.js";

export type FFLWorkerMessage =
  | FFLWorkerInitializeMessage
  | FFLWorkerCreateIconMessage;

export type FFLWorkerInitializeMessage = {
  type: "Init"; // request type
  resourcePath: any; // Path to resource file
  offscreenCanvas: OffscreenCanvas; // Path to resource file
  devicePixelRatio: number;
};
export type FFLWorkerCreateIconMessage = {
  type: "MakeIcon"; // request type
  id: string; // random id
  request: RenderRequest;
  useBlob: boolean;
};

let FFLModule: any,
  offscreenCanvas: OffscreenCanvas,
  workerRenderer: WebGLRenderer,
  devicePixelRatio: number;

function log(...message: any[]) {
  console.log("[FFLWorker]", ...message);
}
function initRenderer() {
  workerRenderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: offscreenCanvas
  });
  // workerRenderer.setPixelRatio(devicePixelRatio);
}

// https://stackoverflow.com/a/30407959
//**blob to dataURL**
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    var a = new FileReader();
    a.onload = function (e) {
      resolve(e.target!.result as string);
    };
    a.readAsDataURL(blob);
  });
}

self.onmessage = async (e) => {
  log("Message received from main script", e);

  const input = e.data as FFLWorkerMessage;
  switch (input.type) {
    case "Init": {
      // The only solution I could find is just to load the ffl wasm module again but in the web worker.
      // Hopefully it and the resource are cached by the browser so it should load instantly?
      log("Loading FFL Module");
      FFLModule = (await import("./external/ffl.js/ffl-emscripten.js")).default
        .Module as any;
      log("Initialized Module!", FFLModule);
      log("Loading FFL Resource...");
      await loadBodyModels();
      await loadHatModels();
      await FFL.initializeFFLWithResource(input.resourcePath, FFLModule);
      log("Loaded FFL Resource!");
      offscreenCanvas = input.offscreenCanvas;
      devicePixelRatio = input.devicePixelRatio;
      initRenderer();
      // I'm ready! I'll tell main thread to continue.
      postMessage({ ready: true });
      break;
    }
    case "MakeIcon": {
      log("Call MakeIcon");
      var then = performance.now();
      // Momentarily create CharModel
      let result: { type: string; result: Blob | string } = {
        type: "dataURL",
        result: ""
      };
      try {
        log(
          "making icon for view",
          Object.keys(FFL.ViewType)[input.request.type]
        );
        const size = input.request.size * devicePixelRatio;

        result = await createMiiRender({
          ...input.request,
          renderer: workerRenderer,
          size,
          module: FFLModule
        });

        // console.log(`charModel for ${mii.miiName}:`, model);
      } catch (e) {
        console.error(`Worker error: Could not make icon`, e);
        postMessage({ id: input.id, result: null, error: e });
      } finally {
        var now = performance.now();

        // ignore these worker console logs it was 3am

        // Also, loading these in parallel is technically faster,
        // but they don't come by individually, instead all at once which feels..wrong.
        // At least it doesn't block the main thread.

        log(`Got it in ${(now - then).toFixed(0)}ms! Sending to main thread.`);

        var url: string | undefined = undefined;
        if (result !== undefined) {
          if (input.useBlob) {
            if (result.type === "blob") {
              url = URL.createObjectURL(result.result as Blob);
              setTimeout(() => {
                URL.revokeObjectURL(url!);
              }, 50_000);
            }
          } else {
            if (result.type === "blob") {
              url = await blobToDataURL(result.result as Blob);
            }
          }

          postMessage({
            id: input.id,
            result: url || result.result,
            error: null
          });
        }
      }
    }
  }
};
