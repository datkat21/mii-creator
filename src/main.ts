import MiiData from "./class/MiiData";
import { setupUi } from "./ui/setup";
import { MiiEditor } from "./class/MiiEditor";
import LazyLoad, { type ILazyLoadInstance } from "vanilla-lazyload";
import { langManager } from "./l10n/manager";
import * as Sentry from "@sentry/browser";
import { Config } from "./config";
import Modal, { buttonsOkCancel, closeModal } from "./ui/components/Modal";
import {
  FFLExpression,
  initializeFFLWithResource,
  parseHexOrB64ToUint8Array
} from "./external/ffl.js/ffl.js";
import type { FFLShaderMaterial } from "./external/ffl.js/FFLShaderMaterial.js";
import type { LUTShaderMaterial } from "./external/ffl.js/LUTShaderMaterial.js";
import type { FFLWorkerInitializeMessage, FFLWorkerMessage } from "./worker.js";
import {
  EmptyMiiCreatorV4Data,
  MiiCreatorV4Data,
  MiiCreatorV4DataToRSD,
  validationThing
} from "./class/struct/MiiCreatorV4Data.js";
import { MiiCreatorV3Data } from "./class/struct/MiiCreatorV3Data.js";
import { dataToHex } from "./util/dataConvert.js";
import Notify from "./ui/components/Notify.js";
import { loadBodyModels, loadHatModels } from "./util/ModelLoader.js";
import { defaultParams, type RenderRequest } from "./util/IconRendering.js";

declare global {
  interface Window {
    editor: MiiEditor | null;
    firstVisit: boolean;
    LazyLoad: ILazyLoadInstance;
    localforage: LocalForage;
    Mii: any;
    mii: MiiData;
    sentryOnLoad: any;

    // New stuff
    FFLShaderMaterial: FFLShaderMaterial;
    LUTShaderMaterial: LUTShaderMaterial;
  }
}

window.LazyLoad = new LazyLoad();

if (Config.apis.useSentry) {
  Sentry.init({
    dsn: Config.apis.sentryURL,
    tracesSampleRate: 0.01
  });
}

// Make the theme ready before settings is initialized
document.documentElement.dataset.theme = "default";

let FFL: any, FFLWorker: Worker | undefined;
export const getFFL = () => FFL;
export const getFFLWorker = () => FFLWorker;
export const getFFLWorkerExists = () => FFLWorker !== undefined;
export const getFFLWorkerMakeIcon = (
  request: Partial<RenderRequest>,
  useBlob: boolean = true
) => {
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

// Depending on config, load FFL.js
if (Config.renderer.useRendererServer === false) {
  var m = Modal.modal(
    "Notice",
    // TODO: Make a better message? 😅
    "Mii Creator is loading assets, please wait..."
  );

  FFL = (await import("./external/ffl.js/ffl-emscripten.js")).default
    .Module as any;

  console.log(FFL);
  console.log("We've got FFL!");

  // Import FFL.JS (c) 2025 Arian K. pro max Edition
  await loadBodyModels();
  await loadHatModels();
  await initializeFFLWithResource(Config.renderer.fflResourcePath, FFL);

  // TODO: CLEAN THIS UP so all the wasm/worker loading logic isn't in main.ts??? this was just a temp spot since its before everything else loads
  // Detect and use Web Workers/OffscreenCanvas if available, to optimize icon generation
  if (window.Worker) {
    if (window.OffscreenCanvas) {
      const tempOffscreenCanvas = document.createElement("canvas");
      const offscreenCanvas = tempOffscreenCanvas.transferControlToOffscreen();
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
          resourcePath: Config.renderer.fflResourcePath,
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
        "Your browser doesn't support OffscreenCanvas, so Mii Creator may experience lag.",
        "body",
        ...buttonsOkCancel
      );
    }
  } else {
    Modal.modal(
      "Notice",
      "Your browser doesn't support Web Workers, so Mii Creator may experience lag.",
      "body",
      ...buttonsOkCancel
    );
  }

  console.log("Ready!");

  closeModal(m);
}

langManager.getString("languages.en_US");
setupUi();

// TODO DEBUGGING REMOVE THOSE

//@ts-expect-error
window.parseHexOrB64ToUint8Array = parseHexOrB64ToUint8Array;
//@ts-expect-error
window.mii = MiiData;
//@ts-expect-error
window.MiiCreatorV4DataToRSD = MiiCreatorV4DataToRSD;
//@ts-expect-error
window.MiiCreatorV3Data = MiiCreatorV3Data;
//@ts-expect-error
window.MiiCreatorV4Data = MiiCreatorV4Data;
//@ts-expect-error
window.dataToHex = dataToHex;
//@ts-expect-error
window.validationThing = validationThing;
//@ts-expect-error
window.EmptyMiiCreatorV4Data = EmptyMiiCreatorV4Data;
