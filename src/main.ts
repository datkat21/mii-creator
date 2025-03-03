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
import { Ver3StoreData } from "./class/struct/FFLStoreData.js";

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

// Load language stuff...
// await loadLang("es_ES");

// Make the theme ready before settings is initialized
document.documentElement.dataset.theme = "default";

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
//@ts-expect-error
window.FFLiCreateID = FFLiCreateID;
//@ts-expect-error
window.FFLiAuthorID = FFLiAuthorID;
//@ts-expect-error
window.FFLStoreData = Ver3StoreData;
