import Modal, { buttonsOkCancel, closeModal } from "../ui/components/Modal";
import Notify from "../ui/components/Notify";
import {
  loadBodyModels,
  loadClothesTextures,
  loadHatModels
} from "../util/ModelLoader";
import { _, loadLang } from "./Lang";
import { Config } from "../config.js";
import { initializeFFL } from "../external/ffl.js/ffl.js";
import { getSetting } from "./SettingsHelper.js";
import type Html from "@datkat21/html";

const __ = _();

let FFLModule: any;
export const getFFL = () => FFLModule;

let currentLoadingModal: Html;
export const getCurrentLoadingModal = () => currentLoadingModal;

export async function prepareFFL() {
  // Depending on config, load FFL.js
  if (Config.renderer.useRendererServer !== false) {
    return console.log("why do you");
  }

  currentLoadingModal = Modal.modal(
    __("Notice"),
    // TODO: Make a better message? 😅
    // Displayed in a modal while loading resource files.
    __("Mii Creator is loading assets, please wait...")
  );

  FFLModule = (await import("../external/ffl.js/ffl-emscripten.js")).default;

  FFLModule = await FFLModule({
    locateFile: (path: string) => {
      return "/dist/" + path;
    }
  });

  console.log(FFLModule);
  console.log("We've got FFL!");

  // Import FFL.JS (c) 2025 Arian K. macOS Edition
  await loadBodyModels();
  await loadHatModels();
  // for some reason
  await loadClothesTextures();

  const fflResourceFile = await fetch(
    Config.renderer.fflResourcePath[await getSetting("resourceType")]
  );

  let { module } = await initializeFFL(fflResourceFile, FFLModule);
  FFLModule = module;

  console.log("Ready!");

  closeModal(currentLoadingModal);
}
