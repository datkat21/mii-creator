import { WebGLRenderer } from "three";
import * as FFL from "./external/ffl.js/ffl";
import { LUTShaderMaterial } from "./external/ffl.js/LUTShaderMaterial.js";

export type FFLWorkerMessage =
  | FFLWorkerInitializeMessage
  | FFLWorkerCreateIconMessage;

export type FFLWorkerInitializeMessage = {
  type: "Init"; // request type
  resourcePath: any; // Path to resource file
  offscreenCanvas: OffscreenCanvas; // Path to resource file
};
export type FFLWorkerCreateIconMessage = {
  type: "MakeIcon"; // request type
  data: Uint8Array; // commonly studio data?
  view: string; // commonly studio data?
  id: string; // random id
};

let FFLModule: any,
  offscreenCanvas: OffscreenCanvas,
  workerRenderer: WebGLRenderer;

function log(...message: any[]) {
  console.log("[FFLWorker]", ...message);
}
function initRenderer() {
  workerRenderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: offscreenCanvas
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
      await FFL.loadBodyModels();
      await FFL.initializeFFLWithResource(input.resourcePath, FFLModule);
      log("Loaded FFL Resource!");
      offscreenCanvas = input.offscreenCanvas;
      initRenderer();
      // I'm ready! I'll tell main thread to continue.
      postMessage({ ready: true });
      break;
    }
    case "MakeIcon": {
      log("Call MakeIcon");
      var then = performance.now();
      // Momentarily create CharModel
      let dataURL: { type: string; result: Blob | string } = {
          type: "dataURL",
          result: ""
        },
        model: any;
      try {
        const dataU8 = input.data;
        model = FFL.createCharModel(
          dataU8,
          undefined,
          LUTShaderMaterial,
          FFLModule,
          false
        );
        FFL.initCharModelTextures(model, workerRenderer);
        let realView = FFL.ViewType.MakeIcon;
        switch (input.view) {
          case "face":
          case "variableiconbody":
            realView = FFL.ViewType.MakeIcon;
            break;
          case "all_body_sugar":
            realView = FFL.ViewType.MakeIcon;
            break;
        }
        dataURL = await FFL.createCharModelIcon(
          model,
          workerRenderer,
          realView,
          512,
          512
        );
        // console.log(`charModel for ${mii.miiName}:`, model);
      } catch (e) {
        console.error(`Library error: Could not make icon`, e);
      } finally {
        model.dispose();
        var now = performance.now();

        // ignore these worker console logs it was 3am

        // Also, loading these in parallel is technically faster,
        // but they don't come by individually, instead all at once which feels..wrong.
        // At least it doesn't block the main thread.

        log(`Got it in ${(now - then).toFixed(0)}ms! Sending to main thread.`);

        var url: string | undefined = undefined;
        if (dataURL.type === "blob") {
          url = URL.createObjectURL(dataURL.result as Blob);
          setTimeout(() => {
            URL.revokeObjectURL(url!);
          }, 500);
        }

        postMessage({ id: input.id, result: url || dataURL.result });
      }
    }
  }
};
