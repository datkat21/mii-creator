import Html from "@datkat21/html";
import localforage from "localforage";
import Modal, { buttonsOkCancel } from "../components/Modal";
import Mii from "../../external/mii-js/mii";
import { Buffer } from "../../../node_modules/buffer/index";
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
import { getString as _ } from "../../l10n/manager";
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
  initCharModelTextures,
  parseHexOrB64ToUint8Array,
  ViewType
} from "../../external/ffl.js/ffl";
import { getFFL, getFFLWorkerExists, getFFLWorkerMakeIcon } from "../../main";
import { WebGLRenderer } from "three";
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

export const miiIconUrl = async (
  mii: Mii,
  source: string = "unknown",
  view: string = "variableiconbody",
  width: number = 180,
  index: number = 0
) => {
  if (Config.renderer.useRendererServer === false) {
    // Momentarily create CharModel
    let dataURL = "undefined",
      model: any;
    const dataU8 = mii.encodeStudio();

    if (getFFLWorkerExists()) {
      console.log("Asking worker thread for an icon plz!");
      const icon = await getFFLWorkerMakeIcon(dataU8, view);
      return icon;
    }

    try {
      model = createCharModel(
        dataU8,
        undefined,
        window.LUTShaderMaterial,
        getFFL(),
        false
      );
      initCharModelTextures(model, tmpRenderer);
      let realView = ViewType.MakeIcon;
      switch (view) {
        case "face":
        case "variableiconbody":
          realView = ViewType.MakeIcon;
          break;
        case "all_body_sugar":
          realView = ViewType.MakeIcon;
          break;
      }
      dataURL = await createCharModelIcon(
        model,
        tmpRenderer,
        realView,
        512,
        512
      );
      // console.log(`charModel for ${mii.miiName}:`, model);
    } catch (e) {
      console.error(`Library: Could not make icon for ${mii.miiName}: ${e}`);
    } finally {
      model.dispose();
      return dataURL;
    }
  }

  let url = Config.renderer.renderHeadshotURLNoParams;

  let params = new URLSearchParams();

  params.set("data", mii.encodeStudio().toString("hex"));
  // set shader type in query params
  adjustShaderQuery(params, currentShader);
  params.set("bodyType", currentBodyModel);
  params.set("type", view);
  params.set("width", width.toString());
  params.set("verifyCharInfo", "0");
  params.set("miic", encodeURIComponent(mii.encode().toString("base64")));
  params.set("version", Config.version.string);
  params.set("source", source ? "library" : "lookalike");
  params.set("index", index.toString());
  params.set(
    "pantsColor",
    mii.normalMii === false ? "gold" : mii.favorite === true ? "red" : "gray"
  );

  if (mii.extHatType !== 0) {
    params.set(
      Config.renderer.hatTypeParam,
      String(mii.extHatType + Config.renderer.hatTypeAdd)
    );
  }
  if (mii.extHatColor !== 0) {
    params.set(
      Config.renderer.hatColorParam,
      String(mii.extHatColor + Config.renderer.hatColorAdd)
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

  sidebar.append(new Html("h1").text(_("generic.app_title")));

  const libraryList = new Html("div").class("library-list").appendTo(container);

  const miis = await Promise.all(
    (await localforage.keys())
      .filter((k) => k.startsWith("mii-"))
      .sort((a, b) => Number(a.split("-")[1]!) - Number(b.split("-")[1]!))
      .map(async (k) => ({
        id: k,
        mii: (await localforage.getItem(k)) as string
      }))
  );

  if (miis.length === 0) {
    libraryList.append(
      new Html("div")
        .style({ position: "absolute", top: "2rem", left: "2rem" })
        .text("You have no Miis yet. Create one to get started!")
    );
  }
  let miiErrorCount = 0,
    miiCount = 0;
  for (const mii of miis) {
    let miiContainer = new Html("div").class("library-list-mii");

    AddButtonSounds(miiContainer);

    try {
      const miiData = new Mii(Buffer.from(mii.mii, "base64"));
      // prevent error when importing converted Wii-era data
      miiData.unknown1 = 0;
      miiData.unknown2 = 0;

      let specialMii = false;
      if (
        miiData.consoleMAC[0] === 47 &&
        miiData.consoleMAC[1] === 249 &&
        miiData.consoleMAC[2] === 22 &&
        miiData.consoleMAC[3] === 28 &&
        miiData.consoleMAC[4] === 250 &&
        miiData.consoleMAC[5] === 173
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
        "--color": MiiFavoriteColorIconTable[miiData.favoriteColor].top
      });

      let extraData = "";
      // hat
      if (miiData.extHatType !== 0) {
        extraData += `&${Config.renderer.hatTypeParam}=${encodeURIComponent(
          miiData.extHatType + Config.renderer.hatTypeAdd
        )}&${Config.renderer.hatColorParam}=${encodeURIComponent(
          miiData.extHatColor + Config.renderer.hatColorAdd
        )}`;
      }

      let miiImage = new Html("img").class("lazy").attr({
        // "src":
        //   (await miiIconUrl(
        //     miiData,
        //     "library",
        //     "variableiconbody",
        //     180,
        //     miiCount
        //   )) + extraData,
      });

      // "data-src":
      // (await miiIconUrl(
      //   miiData,
      //   "library",
      //   "variableiconbody",
      //   180,
      //   miiCount
      // )) + extraData,
      miiIconUrl(miiData, "library", "variableiconbody", 180, miiCount).then(
        (r) => {
          miiImage.attr({ src: r });
        }
      );

      // Special
      if (
        miiData.normalMii === false ||
        miiData.favorite === true ||
        specialMii
      ) {
        const star = new Html("i")
          .style({ position: "absolute", top: "-22px", right: "-18px" })

          .appendTo(miiContainer);

        if (miiData.favorite === true) {
          star.html(EditorIcons.favorite).style({ color: cPantsColorRedHex });
        }
        if (miiData.normalMii === false || specialMii) {
          star.html(EditorIcons.special).style({ color: cPantsColorGoldHex });
        }
      }

      let miiName = new Html("span").text(miiData.miiName);

      let miiEditCallback = miiSelect(mii, miiData, specialMii);

      miiContainer.on("click", async () => {
        if (hasMiiErrored === true) {
          Modal.modal(
            "Oops",
            "This Mii hasn't loaded correctly. Do you still want to try and manage it?",
            "body",
            {
              text: "Cancel"
            },
            {
              callback(e) {
                miiEditCallback();
              },
              text: "Yes"
            },
            {
              text: "No"
            }
          );
          return;
        }

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

      miiCount++;
    } catch (e: unknown) {
      console.log("Oops", e);
      miiErrorCount++;

      let miiImage = new Html("img").attr({
        src: "data:image/svg+xml," + encodeURIComponent(EditorIcons.error)
      });
      let miiName = new Html("span").text("?");

      miiContainer.appendMany(miiImage, miiName).appendTo(libraryList);

      miiContainer.on("click", async () => {
        Modal.modal(
          "Oops",
          "This Mii might be corrupted. Choose an option below.",
          "body",
          {
            text: "Cancel"
          },
          {
            text: "Download a copy",
            callback(e) {
              console.log(mii);
              saveArrayBuffer(
                Buffer.from(mii.mii, "base64").buffer,
                mii.id + ".miic"
              );
            }
          },
          {
            text: "Download a copy (Base64 encoded)",
            callback(e) {
              console.log(mii);
              saveArrayBuffer(
                Buffer.from(mii.mii).buffer,
                mii.id + ".miic.txt"
              );
            }
          },
          {
            text: "Delete",
            callback(e) {
              Modal.modal(
                "Warning",
                "Are you sure you want to delete this Mii?",
                "body",
                {
                  async callback(e) {
                    await localforage.removeItem(mii.id);
                    await shutdown();
                    Library();
                  },
                  text: "Yes",
                  type: "danger"
                },
                {
                  text: "No"
                }
              );
            }
          }
        );
      });
    }
  }

  if (miiErrorCount > 0) {
    Modal.modal(
      "Error",
      `It appears that ${miiErrorCount} of your Miis have failed to load. Their data may be corrupted.\n\nIf you'd like to try and recover the Mii data, you can select the Miis with errors and choose to either save a copy or delete them.`,
      "body",
      ...buttonsOkCancel
    );
  }

  window.LazyLoad.update();

  sidebar.appendMany(
    new Html("div").class("sidebar-buttons").appendMany(
      AddButtonSounds(
        new Html("button").text("Create Mii").on("click", async () => {
          miiCreateDialog();
        })
      ),
      AddButtonSounds(
        new Html("button").text("Settings").on("click", async () => {
          Settings();
        })
      )
    ),
    new Html("div").class("sidebar-credits").appendMany(
      new Html("div")
        .class("flex-group")
        .style({ width: "100%" })
        .appendMany(
          AddButtonSounds(new Html("button").text("More Options"))
          // AddButtonSounds(
          //   new Html("button")
          //     .text("Credits")
          //     .on("click", async () => {
          //       var m = Modal.modal(
          //         "Credits",
          //         "",
          //         "body",
          //         { text: "Cancel" },
          //         { text: "OK" }
          //       );
          //       m.qs(".modal-body span")!.cleanup();
          //       m.qs(".modal-content")!.style({
          //         "max-width": "100%",
          //         "max-height": "100%",
          //       });
          //       const mb = m.qs(".modal-body")!;
          //       m.qs(".modal-content")!.style({ position: "relative" });
          //       const container = new Html("div").class("col").prependTo(mb);
          //       new Html("span")
          //         .text("Check out the people behind Mii Creator!")
          //         .style({
          //           "font-size": "20px",
          //           "flex-shrink": "0",
          //           "margin-bottom": "-16px",
          //         })
          //         .prependTo(mb);

          //       // hey stop snooping! you'll ruin the fun :(
          //       new Html("a")
          //         .text("secret?")
          //         .style({
          //           "font-size": "10px",
          //           opacity: "0.3",
          //           cursor: "pointer",
          //           position: "absolute",
          //           bottom: "10px",
          //           right: "10px",
          //         })
          //         .on("click", (e) => {
          //           m.qs("button")?.elm.click();

          //           const mii = new Mii(
          //             Buffer.from(
          //               "A8EAwELycUHCpfBSXhcDbS/5Fhz6rQAAWS1KAGEAcwBtAGkAbgBlAAAAAAAAABw3ExB7ASFuQxwNZMcYAAgegg0AMEGzW4JtcwBvAHMAaQBnAG8AbgBhAGwAAAAAAMwDAAAAAAAAAAAAAAAA",
          //               "base64"
          //             )
          //           );
          //           importMiiConfirmation(mii, "Mii Creator (Special Mii)");
          //         })
          //         .appendTo(mb);

          //       createMiiCard(
          //         container,
          //         "Austin☆²¹ / Kat21",
          //         "datkat21",
          //         "https://github.com/datkat21",
          //         "Author of Mii Creator",
          //         "00070e555d5863674e53666975777c767c7d848b9299989f9ea1a8a9b5bc89e1e9efececf6ecf6ece8f3faf7fbfdfe"
          //       );
          //       createMiiCard(
          //         container,
          //         "Arian",
          //         "ariankordi",
          //         "https://github.com/ariankordi",
          //         'Creator of <a target="_blank" href="https://mii-unsecure.ariankordi.net">Mii Renderer (REAL)</a> and was a big help with debugging many issues',
          //         "080037030d020531020c030105040a0209000001000a011004010b0100662f04000214031603140d04000a020109"
          //       );
          //       createMiiCard(
          //         container,
          //         "obj",
          //         "objecty",
          //         "https://x.com/objecty_twitt",
          //         "Composed the music for the site",
          //         "00070e3b3f3c4649555e5c6675777a7a7f7e818890979ea5b4b7bebbbac188bdc6ced4ccd6cccfe3f5f8fffcff0513"
          //       );
          //       createMiiCard(
          //         container,
          //         "Timothy",
          //         "Timimimi",
          //         "https://github.com/Timiimiimii",
          //         "Modeled many of the custom hats and helped with debugging",
          //         "00070e3c4554575c616c6872818b909da0b1b7bec3cad0d78f93a1b1c0c78ce8f0f8fdf2f8f3f7ebebf6fdfcfffffb"
          //       );
          //       createMiiCard(
          //         container,
          //         "David J.",
          //         "dwyazzo90",
          //         "https://x.com/dwyazzo90",
          //         "Helped with design and created the Wii U theme",
          //         "0800450308040402020c0308060406020a0001000006000804000a0800326702010314031304190d04000a040109"
          //       );
          //     })
          //     .style({ flex: "1" })
          // ),
          // AddButtonSounds(
          //   new Html("button")
          //     .text("Help/Contact")
          //     .on("click", async () => {
          //       var m = Modal.modal(
          //         "Contact",
          //         "",
          //         "body",
          //         { text: "Cancel" },
          //         { text: "OK" }
          //       );
          //       m.qs(".modal-body span")!.cleanup();
          //       m.qs(".modal-content")!.style({
          //         "max-width": "100%",
          //         "max-height": "100%",
          //       });
          //       const mb = m.qs(".modal-body")!;
          //       m.qs(".modal-content")!.style({ position: "relative" });
          //       const container = new Html("div")
          //         .class("col")
          //         .style({ gap: "0" })
          //         .prependTo(mb);
          //       new Html("span")
          //         .text("Here's where you can contact the author, Kat21")
          //         .style({
          //           "font-size": "20px",
          //           "flex-shrink": "0",
          //           "margin-bottom": "-16px",
          //         })
          //         .prependTo(mb);

          //       // hey stop snooping! you'll ruin the fun :(
          //       new Html("a")
          //         .text("secret?")
          //         .style({
          //           "font-size": "10px",
          //           opacity: "0.3",
          //           cursor: "pointer",
          //           position: "absolute",
          //           bottom: "10px",
          //           left: "10px",
          //         })
          //         .on("click", (e) => {
          //           m.qs("button")?.elm.click();

          //           const mii = new Mii(
          //             Buffer.from(
          //               "AwEAwAAAAAAAAAAAAP91dC/5Fhz6rQAAAChiAG8AbwBlAHkAAAAAAAAAAAAAABRvEwBJBBJvQxgNVGUUABoTqAoAACmwUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8TAGMyCAAANgACC2QA",
          //               "base64"
          //             )
          //           );
          //           importMiiConfirmation(mii, "Mii Creator (Special Mii)");
          //         })
          //         .appendTo(mb);

          //       createIconCard(
          //         container,
          //         "E-mail (Preferred)",
          //         "mailto:datkat21.yt@gmail.com",
          //         "datkat21.yt@gmail.com",
          //         EditorIcons.contact_email
          //       );
          //       createIconCard(
          //         container,
          //         "Discord",
          //         "",
          //         "kat21",
          //         EditorIcons.contact_discord
          //       );
          //       createIconCard(
          //         container,
          //         "File an issue on GitHub",
          //         "https://github.com/datkat21/mii-creator",
          //         "datkat21/mii-creator",
          //         EditorIcons.contact_github
          //       );
          //     })
          //     .style({ flex: "1" })
          // )
        ),
      new Html("strong").text("This site is not affiliated with Nintendo."),
      new Html("small")
        .text(`${Config.version.string} (${Config.version.name})`)
        .style({ cursor: "pointer" })
        .on("click", () => {
          replayUpdateNotice();
        })
      // new Html("a")
      //   .text(`Privacy Policy`)
      //   .style({ cursor: "pointer" })
      //   .on("click", () => {
      //     Modal.modal(
      //       "Privacy Policy",
      //       // half copied from another website and with some chat gpt lol
      //       new Html("div").appendMany(
      //         new Html("h2").text("User Data"),
      //         new Html("ul").appendMany(
      //           new Html("li").text(
      //             "Mii Creator does not use cookies to store your Mii library"
      //           ),
      //           new Html("li").text(
      //             "Your Mii Creator save data is stored locally on your computer"
      //           ),
      //           new Html("li").text(
      //             "Mii Creator uses Cloudflare for anonymous site analytics"
      //           ),
      //           new Html("li").text(
      //             "Mii Creator uses Sentry/GlitchTip for anonymous error reporting"
      //           ),
      //           new Html("li").text(
      //             "User data such as IP address and user agent string is sent to Mii Creator's servers"
      //           ),
      //           new Html("li").text(
      //             "Mii data sent to Mii Creator's servers are logged for analytics and archival purposes"
      //           )
      //         ),
      //         new Html("h2").text("Security"),
      //         new Html("ul").appendMany(
      //           new Html("li").text(
      //             "Insecure (HTTP) requests are upgraded to secure (HTTPS) requests on Cloudflare's end"
      //           ),
      //           new Html("li").text(
      //             "Cloudflare may give users a page before accessing the website to ensure security"
      //           )
      //         ),
      //         new Html("h2").text("Law"),
      //         new Html("ul")
      //           .style({ "margin-bottom": "0" })
      //           .appendMany(
      //             new Html("li").text(
      //               "Mii Creator complies with all United States law including COPPA & DMCA, please use the contact e-mail to submit requests"
      //             ),
      //             new Html("li").text(
      //               "Mii Creator has not been served any gag orders, warrants, or court orders"
      //             ),
      //             new Html("li").text(
      //               "Mii Creator will never disclose user data to a third party unless required to do so by law"
      //             )
      //           )
      //       ),
      //       "body",
      //       ...buttonsOkCancel
      //     );
      //   })
      // new Html("strong").text("Please send any feedback or bug reports either through GitHub issues or to my email: datkat21.yt@gmail.com"),
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
      "Warning",
      "This Mii is using extended Switch colors, but those colors will never show up if you scan this QR Code anywhere outside of this app. Is this OK?",
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
      "Warning",
      'This Mii is using extended Switch colors and/or MiiCreator features, but those features will be lost when converting to FFSD.\nUse "Save MiiCreator data" or "Save CharInfo (Switch) data" if you want to keep the data.\nIs this OK?',
      "body",
      false
    );
    if (result === false) return false;
  }
  return true;
};
