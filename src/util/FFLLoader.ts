import Modal, { buttonsOkCancel, closeModal } from "../ui/components/Modal";
import Notify from "../ui/components/Notify";
import { loadBodyModels, loadHatModels } from "../util/ModelLoader";
import { defaultParams, type RenderRequest } from "../util/IconRendering";

import type {
  FFLWorkerInitializeMessage,
  FFLWorkerMessage
} from "../worker.js";
import { Config } from "../config.js";
import { initializeFFLWithResource } from "../external/ffl.js/ffl.js";
import { getSetting } from "./SettingsHelper.js";

let FFL: any, FFLWorker: Worker | undefined;
export const getFFL = () => FFL;
export const getFFLWorker = () => FFLWorker;
export const getFFLWorkerExists = () => FFLWorker !== undefined;
export const getFFLWorkerMakeIcon = (
  request: Partial<RenderRequest>,
  useBlob: boolean = true
): Promise<string> => {
  if (FFLWorker === undefined)
    throw new Error("FFL worker told to make icon, but it wasn't initialized");

  return new Promise((resolve, reject) => {
    sendMessageToWorker({
      type: "MakeIcon",
      useBlob,
      request: {
        ...defaultParams,
        ...request
      }
    } as FFLWorkerMessage)
      .then((resp) => resolve(resp))
      .catch((err) => reject(err));
  });
};
let sendMessageToWorker: (data: any) => Promise<any>;

export async function prepareFFL() {
  // Depending on config, load FFL.js
  if (Config.renderer.useRendererServer === false) {
    var m = Modal.modal(
      "Notice",
      // TODO: Make a better message? 😅
      // Displayed in a modal while loading resource files.
      "Mii Creator is loading assets, please wait..."
    );

    FFL = (await import("../external/ffl.js/ffl-emscripten.js")).default
      .Module as any;

    console.log(FFL);
    console.log("We've got FFL!");

    // Import FFL.JS (c) 2025 Arian K. pro max Edition
    await loadBodyModels();
    await loadHatModels();
    await initializeFFLWithResource(
      Config.renderer.fflResourcePath[await getSetting("resourceType")],
      FFL
    );

    // TODO: CLEAN THIS UP so all the wasm/worker loading logic isn't in main.ts??? this was just a temp spot since its before everything else loads
    // Detect and use Web Workers/OffscreenCanvas if available, to optimize icon generation
    if (window.Worker) {
      if (window.OffscreenCanvas) {
        const tempOffscreenCanvas = document.createElement("canvas");
        const offscreenCanvas =
          tempOffscreenCanvas.transferControlToOffscreen();
        FFLWorker = new Worker("./dist/worker.js", { type: "module" });

        // chat gpt
        sendMessageToWorker = (data: any) => {
          return new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36).substring(7);

            function handleMessage(event: MessageEvent) {
              const { id, result, error } = event.data;
              if (id === requestId) {
                FFLWorker!.removeEventListener("message", handleMessage);
                if (error) {
                  Notify.show("Worker error", error);
                  resolve(null);
                } else resolve(result);
              }
            }

            FFLWorker!.addEventListener("message", handleMessage);
            FFLWorker!.postMessage({ id: requestId, ...data });
          });
        };

        // unfortunately, the worker has to load ffl wasm on its own
        FFLWorker.postMessage(
          {
            type: "Init",
            resourcePath:
              Config.renderer.fflResourcePath[await getSetting("resourceType")],
            offscreenCanvas,
            devicePixelRatio: window.devicePixelRatio
          } as FFLWorkerInitializeMessage,
          // transfer the offscreen canvas over
          [offscreenCanvas]
        );
        await new Promise<void>((resolve) => {
          FFLWorker!.onmessage = (e) => {
            if (e.data.ready) {
              resolve();
            }
          };
        });
      } else {
        Modal.modal(
          "Notice",
          
            "Your browser doesn't support OffscreenCanvas, so Mii Creator may experience lag."
          ,
          "body",
          ...buttonsOkCancel
        );
      }
    } else {
      Modal.modal(
        "Notice",
        
          "Your browser doesn't support Web Workers, so Mii Creator may experience lag."
        ,
        "body",
        ...buttonsOkCancel
      );
    }

    console.log("Ready!");

    closeModal(m);
  }
}
