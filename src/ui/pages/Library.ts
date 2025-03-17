import Html from "@datkat21/html";
import localforage from "localforage";
import Modal, { buttonsOkCancel } from "../components/Modal";
import Mii from "../../class/MiiData";
import { AddButtonSounds } from "../../util/AddButtonSounds";
import { createIconCard, createMiiCard } from "../../util/miiImageUtils";
import { Config } from "../../config";
import EditorIcons from "../../constants/EditorIcons";
import { saveArrayBuffer } from "../../util/downloadLink";
import { RandomInt } from "../../util/Numbers";
import {
  cPantsColorGoldHex,
  cPantsColorRedHex
} from "../../class/3d/shader/fflShaderConst";
import { MiiFavoriteColorIconTable } from "../../constants/ColorTables";
import { _ } from "../../util/Lang";
const __ = _();
import { replayUpdateNotice, Settings } from "./Settings";
import {
  adjustShaderQuery,
  ShaderType,
  BodyType
} from "../../constants/BodyShaderTypes";
import { getSetting } from "../../util/SettingsHelper";
import { playSound } from "../../class/audio/SoundManager";
import { miiSelect } from "./library/select";
import { miiCreateDialog } from "./library/new/_dialog";
import { importMiiConfirmation } from "./library/importDialog";
import {
  createCharModel,
  createCharModelIcon,
  FFLExpression,
  initCharModelTextures,
  parseHexOrB64ToUint8Array
} from "../../external/ffl.js/ffl";
import { WebGLRenderer } from "three";
import { MiiExpression } from "../../external/ffl/FFLTypes";
import Notify from "../components/Notify";
import { dataToBase64 } from "../../util/dataConvert";
import {
  getFFL,
  getFFLWorkerExists,
  getFFLWorkerMakeIcon
} from "../../util/FFLLoader";
import { ViewType } from "../../util/camera";
import LUTShaderMaterial from "../../external/ffl.js/LUTShaderMaterial";
export const savedMiiCount = async () =>
  (await localforage.keys()).filter((k) => k.startsWith("mii-")).length;
export const newMiiId = async () =>
  `mii-${Date.now()}-${await savedMiiCount()}`;
export const playLoadSound = () => {
  setTimeout(() => {
    // only play 50% of the time lol
    if (RandomInt(2) !== 0) return;
    playSound(`load${RandomInt(4) + 1}`);
  }, RandomInt(200));
};

let tmpRenderer: WebGLRenderer;
export const getTempRenderer = () => tmpRenderer;

var canvas = document.createElement("canvas");
document.body.appendChild(canvas);
tmpRenderer = new WebGLRenderer({ alpha: true, preserveDrawingBuffer: true });

export const getMiiIcon = async (
  mii: Mii | string,
  source: string = "unknown",
  view: string = "variableiconbody",
  size: number = 180,
  expression: number = 0,
  useBlob: boolean = true
) => {
  let m: string = "",
    drawBody = true,
    type = ViewType.Face;
  switch (view) {
    case "creditIcon":
      type = ViewType.CreditIcon;
      break;
    case "face":
    case "variableiconbody":
      type = ViewType.Face;
      break;
    case "fflmakeicon":
      type = ViewType.MakeIcon;
      drawBody = false;
      break;
    case "all_body":
      type = ViewType.AllBody;
      break;
    case "all_body_sugar":
      type = ViewType.AllBodySugar;
      break;
  }

  console.log("icon view:", Object.keys(ViewType)[type]);

  if (Config.renderer.useRendererServer === false) {
    // Momentarily create CharModel
    let dataURL = "undefined",
      model: any,
      data: Uint8Array,
      miiData: Mii;

    if (typeof mii === "string") {
      data = parseHexOrB64ToUint8Array(mii);
      miiData = new Mii(data);
    } else {
      data = mii.export("studioData");
      miiData = mii;
    }

    if (getFFLWorkerExists()) {
      console.log("Asking worker thread for an icon plz!");
      const icon = await getFFLWorkerMakeIcon(
        {
          data,
          type,
          expression,
          additionalInfo: {
            hatCommonColor: miiData.hatCommonColor,
            hatFavoriteColor: miiData.hatFavoriteColor,
            hatType: miiData.hatType,
            pantsColor: miiData.pantsColor,
            shirtColor: miiData.shirtColor,
            favorite: miiData.favorite,
            special: miiData.special,
            temporary: miiData.temporary,
            eyeSclera: miiData.eyeSclera
          },
          drawBody,
          size
        },
        useBlob
      );
      return icon;
    }

    try {
      alert("this doesn't work at the moment sorry try again later");
      // model = createCharModel(
      //   data,
      //   null,
      //   FFLShaderMaterial,
      //   getFFL(),
      //   false
      // );
      initCharModelTextures(model, tmpRenderer);
      let realView = ViewType.IconFovy45;
      dataURL = await createCharModelIcon(
        model,
        tmpRenderer,
        realView,
        512,
        512
        // drawBody
      );
      // console.log(`charModel for ${mii.miiName}:`, model);
    } catch (e) {
      let name = "";
      if (typeof mii !== "string") {
        name = mii.nickname;
      }
      console.error(`Library: Could not make icon for ${name}: ${e}`);
    } finally {
      model.dispose();
      return dataURL;
    }
  }

  if (typeof mii === "string") return;

  let url = Config.renderer.renderHeadshotURLNoParams;

  let params = new URLSearchParams();

  params.set("data", mii.exportHex("studioData"));
  // set shader type in query params
  adjustShaderQuery(params, currentShader);
  params.set("bodyType", currentBodyModel);
  params.set("type", view);
  params.set("width", size.toString());
  params.set("verifyCharInfo", "0");
  params.set("miic", encodeURIComponent(mii.exportHex("miic")));
  params.set("version", Config.version.string);
  params.set("source", source ? "library" : "lookalike");
  params.set(
    "pantsColor",
    mii.special === 1 ? "gold" : mii.favorite === 1 ? "red" : "gray"
  );

  if (mii.hatType !== -1) {
    params.set(
      Config.renderer.hatTypeParam,
      String(mii.hatType + 1 + Config.renderer.hatTypeAdd)
    );
  }
  if (mii.hatFavoriteColor !== -1) {
    params.set(
      Config.renderer.hatColorParam,
      String(mii.hatFavoriteColor + Config.renderer.hatColorAdd)
    );
  }

  // params.set(
  //   "lightXDirection",
  //   "0"
  // );
  // params.set(
  //   "lightYDirection",
  //   "0"
  // );
  // params.set(
  //   "lightZDirection",
  //   "57"
  // );

  return `${url}?${params.toString()}`;
};

let currentShader: ShaderType = ShaderType.WiiU;
document.addEventListener("library-shader-update", async () => {
  currentShader = await getSetting("shaderType");
});
let currentBodyModel: BodyType = BodyType.WiiU;
document.addEventListener("library-body-update", async () => {
  currentBodyModel = await getSetting("bodyModel");
});
let shutdown: () => any = () => {
  console.log("Shutdown was called but was not set yet!");
};
export const _shutdown = () => shutdown;
export async function pushToServer() {
  const miis = await Promise.all(
    (await localforage.keys())
      .filter((k) => k.startsWith("mii-"))
      .sort((a, b) => Number(a.split("-")[1]!) - Number(b.split("-")[1]!))
      .map(async (k) => ({
        id: k,
        mii: (await localforage.getItem(k)) as string
      }))
  );

  // Push
  await fetch("/api/sync_library", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ miis })
  })
    .then(async (e) => {
      if (!e.ok) {
        const text = await e.text();
        alert("REQ FAILED - Unable to sync library data: " + text);
        console.error("Failed to sync library data: " + e);
      }
    })
    .catch((e) => {
      alert("ERROR - Unable to sync library data: " + e);
      console.error("Failed to sync library data: " + e);
    });
}
async function choosePersonalMii() {
  alert("choosssee");
  const personalMiiChooseModal = Modal.modal(
    "Notice",
    "Select a Mii to be your Personal Mii. This can be used across apps.",
    "body",
    {
      text: __("Cancel")
    },
    {
      text: __("Confirm")
    }
  );
  personalMiiChooseModal.classOn("random-mii-grid");
}
export async function Library(highlightMiiId?: string) {
  currentShader = await getSetting("shaderType");
  currentBodyModel = await getSetting("bodyModel");
  function shutdownReal(): Promise<void> {
    return new Promise((resolve) => {
      container.class("fadeOut");
      setTimeout(() => {
        container.cleanup();
        resolve();
      }, 500);
    });
  }
  shutdown = shutdownReal;

  const container = new Html("div").class("mii-library").appendTo("body");

  const sidebar = new Html("div").class("library-sidebar").appendTo(container);

  sidebar.append(new Html("h1").text(__("Mii Creator")));

  const libraryList = new Html("div").class("library-list").appendTo(container);

  // Pull
  let miisJson = await fetch("/api/sync_library", {
    headers: { accept: "application/json" }
  }).then((j) => j.json());

  let miis: any = [];

  if (miisJson === null) {
    miisJson = [];

    // Fallback to checking your local storage data
    miis = await Promise.all(
      (await localforage.keys())
        .filter((k) => k.startsWith("mii-"))
        .sort((a, b) => Number(a.split("-")[1]!) - Number(b.split("-")[1]!))
        .map(async (k) => ({
          id: k,
          mii: (await localforage.getItem(k)) as string
        }))
    );
  } else {
    miis = miisJson;
  }

  console.log(miisJson);

  if (miis.length === 0) {
    libraryList.append(
      new Html("div")
        .style({ position: "absolute", top: "2rem", left: "2rem" })
        .text(__("You don't have any Miis. Create one to get started!"))
    );
  } else {
    await fetch("/api/personal_mii").then((e) => {
      if (!e.ok) {
        // not ok
        choosePersonalMii();
      }
    });
  }

  let miiErrorCount = 0,
    miiCount = 0;
  for (const mii of miis) {
    // if localforage item isn't set already
    localforage.setItem(mii.id, mii.mii);

    let miiContainer = new Html("div").class("library-list-mii");

    AddButtonSounds(miiContainer);

    let miiData: Mii | null = null;
    try {
      miiData = new Mii(mii.mii);

      miiData.validate();

      console.log("MII DATA GOT:", miiData);
      // prevent error when importing converted Wii-era data
      // miiData.unknown1 = 0;
      // miiData.unknown2 = 0;

      let specialMii = false;
      if (
        miiData.createId[4] === 42 &&
        miiData.createId[5] === 241 &&
        miiData.createId[6] === 22 &&
        miiData.createId[7] === 24 &&
        miiData.createId[8] === 250 &&
        miiData.createId[9] === 193
      ) {
        miiContainer
          .classOn("highlight")
          .style({ "--selection-color": "#ffbf00" });
        specialMii = true;
      }

      // if (miiData)
      //   console.log(
      //     miiData.miiName + "'s birthPlatform:",
      //     miiData.deviceOrigin
      //   );

      miiContainer.style({
        "--color":
          MiiFavoriteColorIconTable[
            miiData.favoriteColor %
              Object.keys(MiiFavoriteColorIconTable).length
          ].top
      });

      let extraData = "";
      // hat
      if (miiData.hatType !== 0 - 1) {
        extraData += `&${Config.renderer.hatTypeParam}=${encodeURIComponent(
          miiData.hatType + 1 + Config.renderer.hatTypeAdd
        )}&${Config.renderer.hatColorParam}=${encodeURIComponent(
          miiData.hatFavoriteColor + Config.renderer.hatColorAdd
        )}`;
      }

      let miiImage = new Html("img")
        .attr({
          // "src":
          //   (await miiIconUrl(
          //     miiData,
          //     "library",
          //     "variableiconbody",
          //     180,
          //     miiCount
          //   )) + extraData,
        })
        .style({ opacity: "0", transition: "opacity 0.3s ease" });

      // TODO: make lazy loading work again?

      function loadIcon() {
        getMiiIcon(
          miiData!,
          "library",
          "variableiconbody",
          180,
          MiiExpression.Normal
        )
          .then((r) => {
            miiImage.attr({ src: r }).style({ opacity: "1" });
          })
          .catch((e) => {
            Notify.show(
              __("Notice"),
              __("Failed to load %1's icon", miiData!.nickname)
            );
          });
      }

      //@ts-expect-error
      if (window.browserMitigations !== undefined) {
        // alert("browser mitigations enabled");
        setTimeout(() => {
          loadIcon();
        }, miiCount * 100);
      } else {
        // alert("browser mitigations disabled");
        loadIcon();
      }

      // Special
      if (miiData.special === 1 || miiData.favorite === 1 || specialMii) {
        const star = new Html("i")
          .style({ position: "absolute", top: "-22px", right: "-18px" })

          .appendTo(miiContainer);

        if (miiData.favorite === 1) {
          star.html(EditorIcons.favorite).style({ color: cPantsColorRedHex });
        }
        if (miiData.special === 1 || specialMii) {
          star.html(EditorIcons.special).style({ color: cPantsColorGoldHex });
        }
      }

      let miiName = new Html("span").text(miiData.nickname);

      let miiEditCallback = miiSelect(mii, miiData, specialMii);

      miiContainer.on("click", async () => {
        miiEditCallback();
      });

      let hasMiiErrored = false;

      miiImage.on("error", () => {
        // prevent looping error load
        if (hasMiiErrored === true) return;
        miiImage.attr({
          src: "data:image/svg+xml," + encodeURIComponent(EditorIcons.error)
        });
        hasMiiErrored = true;
      });
      miiImage.on("load", () => {
        playLoadSound();
      });

      miiContainer.appendMany(miiImage, miiName).appendTo(libraryList);

      requestAnimationFrame(() => {
        if (highlightMiiId !== undefined) {
          if (highlightMiiId === mii.id) {
            miiContainer.classOn("highlight");

            setTimeout(() => {
              if (specialMii === false) miiContainer.classOff("highlight");
            }, 2000);

            const mc = miiContainer.elm;
            mc.closest(".library-list")!.scroll({
              top:
                mc.getBoundingClientRect().top +
                mc.getBoundingClientRect().height,
              behavior: "smooth"
            });
          }
        }
      });
    } catch (e: unknown) {
      console.log("Oops", e);
      miiErrorCount++;

      let miiImage = new Html("img").attr({
        src: "data:image/svg+xml," + encodeURIComponent(EditorIcons.error)
      });
      let miiName = new Html("span").text(
        // missing mii name
        __("?")
      );

      if (miiData !== null) {
        if (miiData.nickname.trim() !== "") miiName.text(miiData.nickname);
      }

      miiContainer.appendMany(miiImage, miiName).appendTo(libraryList);

      miiContainer.on("click", async () => {
        Modal.modal(
          __("Warning"),
          __("This Mii might be corrupted. Choose an option below."),
          "body",
          {
            text: "Cancel"
          },
          {
            text: __("Download a copy"),
            callback(e) {
              console.log(mii);
              saveArrayBuffer(
                parseHexOrB64ToUint8Array(mii.mii).buffer,
                mii.id + ".miic"
              );
            }
          },
          {
            text: __("Download a copy (Base64 encoded)"),
            callback(e) {
              console.log(mii);
              saveArrayBuffer(
                dataToBase64(parseHexOrB64ToUint8Array(mii.mii)),
                mii.id + ".miic.txt"
              );
            }
          },
          {
            text: __("Delete"),
            callback(e) {
              Modal.modal(
                __("Warning"),
                __("Are you sure you want to delete this Mii?"),
                "body",
                {
                  async callback(e) {
                    await localforage.removeItem(mii.id);
                    await pushToServer();
                    await shutdown();
                    Library();
                  },
                  text: __("Yes"),
                  type: "danger"
                },
                {
                  text: __("No")
                }
              );
            }
          }
        );
      });
    }
    miiCount++;
  }

  if (miiErrorCount > 0) {
    Modal.modal(
      __("Error"),
      __(
        "It appears that %1 of your Miis have failed to load. Their data may be corrupted.\n\nIf you'd like to try and recover the Mii data, you can select the Miis with errors and choose to either save a copy or delete them.",
        miiErrorCount
      ),
      "body",
      ...buttonsOkCancel
    );
  }

  window.LazyLoad.update();

  sidebar.appendMany(
    new Html("div").class("sidebar-buttons").appendMany(
      AddButtonSounds(
        new Html("button").text(__("Create Mii")).on("click", async () => {
          miiCreateDialog();
        })
      ),
      AddButtonSounds(
        new Html("button").text(__("More Options")).on("click", async () => {
          Modal.modal(
            __("More Options"),
            __("Select an option."),
            "body",
            {
              text: "Cancel"
            },
            {
              text: __("Settings"),
              callback(e) {
                Settings();
              }
            },
            {
              text: __("Credits"),
              callback(e) {
                var m = Modal.modal(
                  __("Credits"),
                  "",
                  "body",
                  { text: "Cancel" },
                  { text: "OK" }
                );
                m.qs(".modal-body span")!.cleanup();
                m.qs(".modal-content")!.style({
                  "max-width": "100%",
                  "max-height": "100%"
                });
                const mb = m.qs(".modal-body")!;
                m.qs(".modal-content")!.style({ position: "relative" });
                const container = new Html("div").class("col").prependTo(mb);
                new Html("span")
                  .text(__("Check out the people behind Mii Creator!"))
                  .style({
                    "font-size": "20px",
                    "flex-shrink": "0",
                    "margin-bottom": "-16px"
                  })
                  .prependTo(mb);

                // hey stop snooping! you'll ruin the fun :(
                new Html("a")
                  .text(
                    // Text for when finding a Secret Mii
                    __("secret?")
                  )
                  .style({
                    "font-size": "10px",
                    opacity: "0.3",
                    cursor: "pointer",
                    position: "absolute",
                    bottom: "10px",
                    right: "10px"
                  })
                  .on("click", (e) => {
                    m.qs("button")?.elm.click();

                    const mii = new Mii(
                      parseHexOrB64ToUint8Array(
                        "BANtKwIiiUS3tZw1sDcq8RYY+sFjAGgAYQByAGwAaQBuAGUAAAAAAGMAaABhAHIAbABpAG4AZQAAAAAACAALAQAAJgMDAQYEAAIKCwQEGwIMAAkBAP8BAAABCAQACgYAZf///0wABAACFAMTARMNBAAKBAEJEP8A/wEA"
                      )
                    );
                    importMiiConfirmation(
                      mii,
                      // Label under secret Mii's name
                      __("Mii Creator (Special Mii)")
                    );
                  })
                  .appendTo(mb);

                createMiiCard(
                  container,
                  // Kat21's name
                  __("Austin☆²¹ / Kat21"),
                  "datkat21",
                  "https://github.com/datkat21",
                  // Kat21's attribution
                  __("Lead developer of Mii Creator"),
                  "000040030c040320020c0407050213030a0000000008000804000a07003e5303010a09031303130d04000a030d0a"
                );
                createMiiCard(
                  container,
                  // Arian's name
                  __("Arian"),
                  "ariankordi",
                  "https://github.com/ariankordi",
                  // Arian's attribution
                  __(
                    'Creator of <a target="_blank" href="https://mii-unsecure.ariankordi.net">Mii Renderer (REAL)</a>, made FFL.js and ported Miitomo shader, and was a big help with debugging many issues'
                  ),
                  "080037030d020531020c030105040a0209000001000a011004010b0100662f04000214031603140d04000a020109"
                );
                createMiiCard(
                  container,
                  // obj (objecty)'s name
                  __("obj"),
                  "objecty",
                  "https://x.com/objecty_twitt",
                  // obj (objecty)'s attribution
                  __("Composed the music for Mii Creator"),
                  "00003a030a030407020b030805040902080400010000000804000a0800403e02010311031304130d04000a040109"
                );
                createMiiCard(
                  container,
                  // Timothy's name
                  __("Timothy"),
                  "Timimimi",
                  "https://github.com/Timiimiimii",
                  // Timothy's attribution
                  __(
                    "Modeled many of the custom hats and helped with debugging"
                  ),
                  "00003b0208040206040d0308050206040a0100020003005f03090b0800426d01010e16031403130f04000804070b "
                );
                createMiiCard(
                  container,
                  // David J.'s name
                  __("David J."),
                  "dwyazzo90",
                  "https://x.com/dwyazzo90",
                  // David J.'s attribution
                  __(
                    "Helped with design, localization, and created the Wii U theme"
                  ),
                  "0800450308040402020c0308060406020a0001000006000804000a0800326702010314031304190d04000a040109"
                );
                createMiiCard(
                  container,
                  // Raymond's name
                  __("raymond"),
                  "raymonable",
                  "https://github.com/raymonable",
                  // Raymond's attribution
                  __(
                    "Helped with initial development for client-side rendering"
                  ),
                  "0800400308040402020c0301050400020a0000000000000804000a01004b4004000214031303190d04000a040109"
                );
              }
            },
            {
              text: __("Contact"),
              callback(e) {
                var m = Modal.modal(
                  "Contact",
                  "",
                  "body",
                  { text: "Cancel" },
                  { text: "OK" }
                );
                m.qs(".modal-body span")!.cleanup();
                m.qs(".modal-content")!.style({
                  "max-width": "100%",
                  "max-height": "100%"
                });
                const mb = m.qs(".modal-body")!;
                m.qs(".modal-content")!.style({ position: "relative" });
                const container = new Html("div")
                  .class("col")
                  .style({ gap: "0" })
                  .prependTo(mb);
                new Html("span")
                  .text(__("Here's where you can contact the author, Kat21"))
                  .style({
                    "font-size": "20px",
                    "flex-shrink": "0",
                    "margin-bottom": "-16px"
                  })
                  .prependTo(mb);

                // hey stop snooping! you'll ruin the fun :(
                new Html("a")
                  .text(__("secret?"))
                  .style({
                    "font-size": "10px",
                    opacity: "0.3",
                    cursor: "pointer",
                    position: "absolute",
                    bottom: "10px",
                    left: "10px"
                  })
                  .on("click", (e) => {
                    m.qs("button")?.elm.click();

                    const mii = new Mii(
                      parseHexOrB64ToUint8Array(
                        "BAWl18qbeYiSbgD/dXQq8RYY+sFrAGEAdAAyADEAAAAAAAAAAAAAAGIAbwBvAGUAeQAAAAAAAAAAAAAACAAAAAAAbwMECAYEDQMLMwMHEgIMAAAJAGMACgAANgMACmMASf83ARQABAACFAYTAxMKBAAKAAANN/8AYwEA"
                      )
                    );
                    importMiiConfirmation(mii, __("Mii Creator (Special Mii)"));
                  })
                  .appendTo(mb);

                createIconCard(
                  container,
                  __("E-mail (Preferred)"),
                  "mailto:datkat21.yt@gmail.com",
                  "datkat21.yt@gmail.com",
                  EditorIcons.contact_email
                );
                createIconCard(
                  container,
                  __("Discord"),
                  "",
                  "kat21",
                  EditorIcons.contact_discord
                );
                // createIconCard(
                //   container,
                //   __("File an issue on GitHub"),
                //   "https://github.com/datkat21/mii-creator",
                //   "datkat21/mii-creator",
                //   EditorIcons.contact_github
                // );
              }
            },
            {
              text: __("Manual"),
              callback(e) {
                Modal.alert(
                  __("Notice"),
                  __("The manual isn't finished yet. Please come back later.")
                );
              }
            }
          );
        })
      )
    ),
    new Html("div").class("sidebar-credits").appendMany(
      new Html("strong").text(__("This site is not affiliated with Nintendo.")),
      new Html("small")
        .html(
          `Mii Creator ${Config.version.string} by kat21 (<b>${Config.version.name}</b>)`
        )
        .style({ cursor: "pointer" })
        .on("click", () => {
          replayUpdateNotice();
        }),
      // new Html("strong").text("Please send any feedback or bug reports either through GitHub issues or to my email: datkat21.yt@gmail.com"),
      AddButtonSounds(
        new Html("a")
          .html(
            `<img style='height:48px' src="./assets/images/update_notice/update_notice_image_01.png">Subscribe to my YouTube channel!`
          )
          .attr({ href: "https://youtube.com/@ngx3", target: "_blank" })
          .styleJs({
            gap: "12px",
            display: "flex",
            alignItems: "center",
            cursor: "pointer"
          })
      )
    )
  );
}

export type MiiLocalforage = {
  id: string;
  mii: string;
};

export const miiQRConversionWarning = async (miiData: Mii) => {
  if (miiData.hasExtendedColors() === true) {
    let result = await Modal.prompt(
      __("Warning"),
      __(
        "This Mii is using extended Switch colors, but those colors will never show up if you scan this QR Code anywhere outside of this app. Is this OK?"
      ),
      "body",
      false
    );
    if (result === false) return false;
  }
  return true;
};

export const miiFFSDWarning = async (miiData: Mii) => {
  if (miiData.hasExtendedColors() === true) {
    let result = await Modal.prompt(
      __("Warning"),
      __(
        'This Mii is using extended Switch colors and/or Mii Creator features, but those features will be lost when converting to FFSD.\nUse "Save Mii Creator data" if you want to keep the data.\nIs this OK?'
      ),
      "body",
      false
    );
    if (result === false) return false;
  }
  return true;
};
