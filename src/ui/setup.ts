import localforage from "localforage";
import { getMusicManager } from "../class/audio/MusicManager";
import { getSoundManager } from "../class/audio/SoundManager";
import Modal, { buttonsOkCancel } from "./components/Modal";
import { Library } from "./pages/Library";
import Mii from "../class/MiiData";
import { MiiEditor } from "../class/MiiEditor";
import {
  // displayUpdateNotice,
  Settings,
  updateSettings
} from "./pages/Settings";
import { customRender } from "./pages/library/render/customRender";

import { _ } from "../util/Lang";
import { prepareFFL } from "../util/FFLLoader";
const __ = _();

export async function setupUi() {
  let mm = getMusicManager();
  getSoundManager();

  updateSettings(true);

  await prepareFFL();

  // displayUpdateNotice();

  function showBrowserWarning() {
    if (
      navigator.userAgent.includes("Firefox") &&
      sessionStorage.getItem("seen-firefox-notice") === null
    ) {
      sessionStorage.setItem("seen-firefox-notice", "yes");
      Modal.modal(
        __("Warning"),
        __(
          "You're using Mii Creator under Firefox. Using the Firefox browser WILL experience slowdowns and lag."
        ),
        "body",
        ...buttonsOkCancel
      );
    }
    if (
      navigator.userAgent.indexOf("Safari") != -1 &&
      navigator.userAgent.indexOf("Chrome") == -1 /*&&
      sessionStorage.getItem("seen-safari-notice") === null*/
    ) {
      // sessionStorage.setItem("seen-safari-notice", "yes");
      Modal.modal(
        __("Warning"),
        __(
          "You're using Mii Creator under Safari. Safari on iOS or iPadOS may experience instability with Mii Creator, causing the page to crash and refresh randomly. Some checks have been enabled to try and prevent the page from crashing right now. You have been warned."
        ),
        "body",
        ...buttonsOkCancel
      );
    }
  }

  if (
    navigator.userAgent.indexOf("Safari") != -1 &&
    navigator.userAgent.indexOf("Chrome") == -1
  ) {
    //@ts-expect-error
    window.browserMitigations = true;
    // alert("safari check PASSED");
  } else {
    // alert("safari check FAILED");
  }

  Modal.modal(
    __("Warning"),
    __(
      "You're using a BETA version of Mii Creator. Some features in development have been disabled, and bugs/glitches can occur.\n\n• Special Miis have been changed.\n• QR codes made from this version of Mii Creator can't be scanned back in.\n• Your Mii library now automatically syncs with the server and across devices."
    ),
    "body",
    {
      text: "Cancel",
      callback(e) {
        showBrowserWarning();
      }
    },
    {
      text: __("OK"),
      callback() {
        showBrowserWarning();
      }
    }
  );

  // for U theme
  let state: "main" | "edit" = "main";
  document.addEventListener("editor-launch", () => {
    state = "edit";
    setTimeout(() => {
      updateMusicVol();
    }, 100);
  });
  document.addEventListener("editor-shutdown", () => {
    state = "main";
    setTimeout(() => {
      updateMusicVol();
    }, 100);
  });

  function updateMusicVol() {
    if (mm.editGainNode === undefined) return;
    // a bit repetitive
    if (state === "main") {
      mm.mainGainNode.gain.linearRampToValueAtTime(
        -0.6,
        getMusicManager().audioContext.currentTime + 0.5
      );
      mm.editGainNode.gain.linearRampToValueAtTime(
        -1,
        getMusicManager().audioContext.currentTime + 0.5
      );
    }
    if (state === "edit") {
      mm.mainGainNode.gain.linearRampToValueAtTime(
        -1,
        getMusicManager().audioContext.currentTime + 0.5
      );
      mm.editGainNode.gain.linearRampToValueAtTime(
        -0.6,
        getMusicManager().audioContext.currentTime + 0.5
      );
    }
  }

  mm.initMusic();

  if (location.search !== "") {
    const searchParams = new URLSearchParams(location.search);

    // open editor with specific data
    if (searchParams.has("data")) {
      new MiiEditor(
        0,
        async (data, shutdownProperly) => {
          if (window.parent !== window.self) {
            // In iframe (UNTESTED)
            const miiData = new Mii(data);

            let headshot: string | null = null;
            let headOnly: string | null = null;
            let fullBody: string | null = null;

            if (shutdownProperly === true) {
              if (searchParams.has("renderTypes")) {
                const renderTypes = searchParams.get("renderTypes")!.split(",");

                // if (renderTypes.includes("headshot")) {
                //   headshot = (
                //     await getMiiRender(
                //       miiData,
                //       MiiCustomRenderType.Head,
                //       true,
                //       false
                //     )
                //   ).src;
                // }
                // if (renderTypes.includes("headOnly")) {
                //   headOnly = (
                //     await getMiiRender(
                //       miiData,
                //       MiiCustomRenderType.HeadOnly,
                //       true,
                //       false
                //     )
                //   ).src;
                // }
                // if (renderTypes.includes("fullBody")) {
                //   fullBody = (
                //     await getMiiRender(
                //       miiData,
                //       MiiCustomRenderType.Body,
                //       true,
                //       false
                //     )
                //   ).src;
                // }
              }
            }

            mm.mainGainNode.gain.linearRampToValueAtTime(
              -1,
              mm.audioContext.currentTime + 0.5
            );

            window.parent.postMessage(
              {
                type: "miic-data-finalize",
                properSave: shutdownProperly,
                data,
                name: miiData.nickname,
                creator: miiData.creator,
                headshot,
                headOnly,
                fullBody
              },
              searchParams.get("origin")!
            );
          } else {
            Library();
          }
        },
        searchParams.get("data")!
      );
    } else if (searchParams.has("select")) {
      alert(__("Selection library is currently not implemented yet"));
      throw new Error(__("Selection library is currently not implemented yet"));
      // const miiData = await SelectionLibrary();

      // console.log("selection:", miiData);

      // let headshot: string | null = null;
      // let headOnly: string | null = null;
      // let fullBody: string | null = null;

      // if (searchParams.has("renderTypes")) {
      //   const renderTypes = searchParams.get("renderTypes")!.split(",");

      //   if (renderTypes.includes("headshot")) {
      //     headshot = (
      //       await getMiiRender(miiData, MiiCustomRenderType.Head, true, false)
      //     ).src;
      //   }
      //   if (renderTypes.includes("headOnly")) {
      //     headOnly = (
      //       await getMiiRender(
      //         miiData,
      //         MiiCustomRenderType.HeadOnly,
      //         true,
      //         false
      //       )
      //     ).src;
      //   }
      //   if (renderTypes.includes("fullBody")) {
      //     fullBody = (
      //       await getMiiRender(miiData, MiiCustomRenderType.Body, true, false)
      //     ).src;
      //   }
      // }

      // window.parent.postMessage(
      //   {
      //     type: "miic-select",
      //     data: miiData.encode(),
      //     name: miiData.miiName,
      //     creator: miiData.creatorName,
      //     headshot,
      //     headOnly,
      //     fullBody
      //   },
      //   location.origin
      // );
    } else if (searchParams.has("custom-render-preview")) {
      // const miiData = new Mii(searchParams.get("custom-render-preview")!);
      // customRender(miiData);
    } else if (searchParams.has("settings")) {
      Settings();
    } else Library();
  } else Library();

  getSoundManager().setVolume(0.28);
  mm.setVolume(0.28);

  window.addEventListener("blur", () => {
    if (mm.mainGainNode) {
      mm.mainGainNode.gain.linearRampToValueAtTime(
        -1,
        getMusicManager().audioContext.currentTime + 0.5
      );
      if (mm.editGainNode) {
        mm.editGainNode.gain.linearRampToValueAtTime(
          -1,
          getMusicManager().audioContext.currentTime + 0.5
        );
      }
    } else getMusicManager().setVolume(0);
    getSoundManager().setVolume(0);
  });
  window.addEventListener("focus", () => {
    if (mm.mainGainNode) {
      if (state === "main") {
        mm.mainGainNode.gain.setValueAtTime(-1, mm.audioContext.currentTime);
        mm.mainGainNode.gain.linearRampToValueAtTime(
          -0.6,
          getMusicManager().audioContext.currentTime + 0.5
        );
      } else if (state === "edit") {
        if (mm.editGainNode) {
          mm.editGainNode.gain.setValueAtTime(-1, mm.audioContext.currentTime);
          mm.editGainNode.gain.linearRampToValueAtTime(
            -0.6,
            getMusicManager().audioContext.currentTime + 0.5
          );
        } else {
          mm.mainGainNode.gain.setValueAtTime(-1, mm.audioContext.currentTime);
          mm.mainGainNode.gain.linearRampToValueAtTime(
            -0.6,
            getMusicManager().audioContext.currentTime + 0.5
          );
        }
      }
    } else getMusicManager().setVolume(0);
    getSoundManager().setVolume(getSoundManager().previousVolume);
  });

  //@ts-expect-error
  window.MusicManager = getMusicManager();
  //@ts-expect-error
  window.soundManager = getSoundManager();

  // debugging options
  window.localforage = localforage;
  // window.Mii = Mii;
}
