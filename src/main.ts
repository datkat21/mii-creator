import MiiData from "./class/MiiData";
import { setupUi } from "./ui/setup";
import { MiiEditor } from "./class/MiiEditor";
import LazyLoad, { type ILazyLoadInstance } from "vanilla-lazyload";
import * as Sentry from "@sentry/browser";
import { Config } from "./config";
import { parseHexOrB64ToUint8Array } from "./external/ffl.js/ffl.js";
// import type { FFLShaderMaterial } from "./external/ffl.js/FFLShaderMaterial";
// import type { LUTShaderMaterial } from "./external/ffl.js/LUTShaderMaterial";
import {
  EmptyMiiCreatorV4Data,
  MiiCreatorV4Data,
  MiiCreatorV4DataToRSD,
  validationThing
} from "./class/struct/MiiCreatorV4Data";
import { MiiCreatorV3Data } from "./class/struct/MiiCreatorV3Data";
import { dataToHex } from "./util/dataConvert";
import {
  FFLiAuthorID,
  FFLiCreateID,
  Ver3StoreData
} from "./class/struct/FFLStoreData.js";
import localforage from "localforage";

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
    // FFLShaderMaterial: FFLShaderMaterial;
    // LUTShaderMaterial: LUTShaderMaterial;
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
window.localforage = localforage;

// Array.from("localhost:3000").map(n=>n.charCodeAt(0))
// [108,111,99,97,108,104,111,115,116,58,51,48,48,48]

function selfDestructAfter2Minutes() {
  setTimeout(() => {
    // document.write
    (
      window[
        [100, 111, 99, 117, 109, 101, 110, 116]
          .map((n) => (([] as any) + ([] as any)).constructor.fromCharCode(n))
          .join("") as any
      ] as any
    )[
      [119, 114, 105, 116, 101]
        .map((n) => (([] as any) + ([] as any)).constructor.fromCharCode(n))
        .join("") as any
    ]();
  }, 1000 * 30);
}

// window["location"]
if (
  (
    window[
      [108, 111, 99, 97, 116, 105, 111, 110]
        .map((n) => (([] as any) + ([] as any)).constructor.fromCharCode(n))
        .join("") as any
    ] as any
  )[
    [104, 111, 115, 116]
      .map((n) => (([] as any) + ([] as any)).constructor.fromCharCode(n))
      .join("") as any
  ].includes(
    [109, 105, 105, 46, 110, 120, 119, 46, 112, 119]
      // [108, 111, 99, 97, 108, 104, 111, 115, 116, 58, 51, 48, 48, 48]
      .map((n) => (([] as any) + ([] as any)).constructor.fromCharCode(n))
      .join("") as any
  )
) {
  // LOOOL! You're fine!
} else {
  // get angry
  // selfDestructAfter2Minutes();
}

setupUi();

// TODO DEBUGGING REMOVE THOSE

// //@ts-expect-error
// window.parseHexOrB64ToUint8Array = parseHexOrB64ToUint8Array;
// //@ts-expect-error
// window.mii = MiiData;
// //@ts-expect-error
// window.MiiCreatorV4DataToRSD = MiiCreatorV4DataToRSD;
// //@ts-expect-error
// window.MiiCreatorV3Data = MiiCreatorV3Data;
// //@ts-expect-error
// window.MiiCreatorV4Data = MiiCreatorV4Data;
// //@ts-expect-error
// window.dataToHex = dataToHex;
// //@ts-expect-error
// window.validationThing = validationThing;
// //@ts-expect-error
// window.EmptyMiiCreatorV4Data = EmptyMiiCreatorV4Data;
// //@ts-expect-error
// window.FFLiCreateID = FFLiCreateID;
// //@ts-expect-error
// window.FFLiAuthorID = FFLiAuthorID;
// //@ts-expect-error
// window.FFLStoreData = Ver3StoreData;
