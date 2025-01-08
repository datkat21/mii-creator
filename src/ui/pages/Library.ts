import Html from "@datkat21/html";
import localforage, { config } from "localforage";
import { MiiEditor, MiiGender, RenderPart } from "../../class/MiiEditor";
import Modal from "../components/Modal";
import Mii from "../../external/mii-js/mii";
import { Buffer } from "../../../node_modules/buffer/index";
import Loader from "../components/Loader";
import { AddButtonSounds } from "../../util/AddButtonSounds";
import {
  getMiiRender,
  MiiCustomRenderType,
  QRCodeCanvas,
} from "../../util/miiImageUtils";
import { Link } from "../components/Link";
import { Config } from "../../config";
import EditorIcons from "../../constants/EditorIcons";
import { CameraPosition, Mii3DScene, SetupType } from "../../class/3DScene";
import {
  FeatureSetType,
  MiiPagedFeatureSet,
} from "../components/MiiPagedFeatureSet";
import { downloadLink, saveArrayBuffer } from "../../util/downloadLink";
import { ArrayNum } from "../../util/NumberArray";
import {
  MeshStandardMaterial,
  type Mesh,
  type ShaderMaterial,
  type Texture,
} from "three";
import {
  cPantsColorGoldHex,
  cPantsColorRedHex,
} from "../../class/3d/shader/fflShaderConst";
import { MiiFavoriteColorIconTable } from "../../constants/ColorTables";
import { getString as _ } from "../../l10n/manager";
import { FFLiDatabaseRandom_Get } from "../../external/ffl/FFLiDatabaseRandom";
import { Settings } from "./Settings";
import { getSetting } from "../../util/SettingsHelper";
import { GLTFExporter } from "three/examples/jsm/Addons.js";
export const savedMiiCount = async () =>
  (await localforage.keys()).filter((k) => k.startsWith("mii-")).length;
export const newMiiId = async () =>
  `mii-${Date.now()}-${await savedMiiCount()}`;
export const miiIconUrl = (mii: Mii) =>
  `${Config.renderer.renderHeadshotURLNoParams}?data=${mii
    .encodeStudio()
    .toString(
      "hex"
    )}&shaderType=0&type=variableiconbody&width=180&verifyCharInfo=0&miic=${encodeURIComponent(
    mii.encode().toString("base64")
  )}`;

export async function Library(highlightMiiId?: string) {
  function shutdown(): Promise<void> {
    return new Promise((resolve) => {
      container.class("fadeOut");
      setTimeout(() => {
        container.cleanup();
        resolve();
      }, 500);
    });
  }

  const container = new Html("div").class("mii-library").appendTo("body");

  const sidebar = new Html("div").class("library-sidebar").appendTo(container);

  sidebar.append(new Html("h1").text(_("generic.app_title")));

  const libraryList = new Html("div").class("library-list").appendTo(container);

  const miis = await Promise.all(
    (
      await localforage.keys()
    )
      .filter((k) => k.startsWith("mii-"))
      .sort((a, b) => Number(a.split("-")[1]!) - Number(b.split("-")[1]!))
      .map(async (k) => ({
        id: k,
        mii: (await localforage.getItem(k)) as string,
      }))
  );

  if (miis.length === 0) {
    libraryList.append(
      new Html("div")
        .style({ position: "absolute", top: "2rem", left: "2rem" })
        .text("You have no Miis yet. Create one to get started!")
    );
  }
  for (const mii of miis) {
    let miiContainer = new Html("div").class("library-list-mii");

    AddButtonSounds(miiContainer);

    const miiData = new Mii(Buffer.from(mii.mii, "base64"));

    try {
      // prevent error when importing converted Wii-era data
      miiData.unknown1 = 0;
      miiData.unknown2 = 0;

      // if (miiData)
      //   console.log(
      //     miiData.miiName + "'s birthPlatform:",
      //     miiData.deviceOrigin
      //   );

      miiContainer.style({
        "--color": MiiFavoriteColorIconTable[miiData.favoriteColor].top,
      });

      let extraData = "";
      // hat
      if (miiData.extHatType !== 0) {
        extraData += `&hatType=${encodeURIComponent(
          miiData.extHatType
        )}&hatColor=${encodeURIComponent(miiData.extHatColor)}`;
      }

      let miiImage = new Html("img").class("lazy").attr({
        "data-src": miiIconUrl(miiData) + extraData,
      });

      // Special
      if (miiData.normalMii === false || miiData.favorite === true) {
        const star = new Html("i")
          .style({ position: "absolute", top: "-22px", right: "-18px" })

          .appendTo(miiContainer);

        if (miiData.normalMii === false) {
          star.html(EditorIcons.special).style({ color: cPantsColorGoldHex });
        }
        if (miiData.favorite === true) {
          star.html(EditorIcons.favorite).style({ color: cPantsColorRedHex });
        }
      }

      let miiName = new Html("span").text(miiData.miiName);

      let miiEditCallback = miiEdit(mii, shutdown, miiData);

      miiContainer.on("click", async () => {
        if (hasMiiErrored === true) {
          let result = await Modal.prompt(
            "Oops",
            "This Mii hasn't loaded correctly. Do you still want to try and manage it?"
          );
          if (result === false) return;
        }

        miiEditCallback();
      });

      let hasMiiErrored = false;

      miiImage.on("error", () => {
        // prevent looping error load
        if (hasMiiErrored === true) return;
        miiImage.attr({
          src: "data:image/svg+xml," + encodeURIComponent(EditorIcons.error),
        });
        hasMiiErrored = true;
      });

      miiContainer.appendMany(miiImage, miiName).appendTo(libraryList);

      requestAnimationFrame(() => {
        if (highlightMiiId !== undefined) {
          if (highlightMiiId === mii.id) {
            miiContainer.classOn("highlight");

            setTimeout(() => {
              miiContainer.classOff("highlight");
            }, 2000);

            const mc = miiContainer.elm;
            mc.closest(".library-list")!.scroll({
              top:
                mc.getBoundingClientRect().top +
                mc.getBoundingClientRect().height,
              behavior: "smooth",
            });
          }
        }
      });
    } catch (e: unknown) {
      console.log("Oops", e);
    }
  }
  window.LazyLoad.update();

  sidebar.appendMany(
    new Html("div").class("sidebar-buttons").appendMany(
      AddButtonSounds(
        new Html("button").text("Create New").on("click", async () => {
          miiCreateDialog(shutdown);
        })
      ),
      AddButtonSounds(
        new Html("button").text("Settings").on("click", async () => {
          // await shutdown();
          Settings();
        })
      )
    ),
    new Html("div")
      .class("sidebar-credits")
      .appendMany(
        new Html("span").text("Credits"),
        AddButtonSounds(
          Link(
            "Source code by datkat21",
            "https://github.com/datkat21/mii-maker-real"
          )
        ),
        AddButtonSounds(
          Link(
            "Mii Rendering API by ariankordi",
            "https://mii-unsecure.ariankordi.net"
          )
        ),
        AddButtonSounds(
          Link("Mii Maker Music by objecty", "https://x.com/objecty_twitt")
        ),
        AddButtonSounds(
          Link("Wii U theme by dwyazzo90", "https://x.com/dwyazzo90")
        ),
        new Html("strong").text("This site is not affiliated with Nintendo.")
      )
  );
}

type MiiLocalforage = {
  id: string;
  mii: string;
};

const miiCreateDialog = (shutdown: Function) => {
  Modal.modal(
    "Create New",
    "How would you like to create the Mii?",
    "body",
    {
      text: "From Scratch",
      callback: () => {
        miiCreateFromScratch(shutdown);
      },
    },
    {
      text: "Enter PNID",
      callback: () => {
        miiCreatePNID(shutdown);
      },
    },
    {
      text: "Choose a look-alike",
      callback: () => {
        miiCreateRandomFFL(shutdown);
      },
    },
    {
      text: "Random NNID",
      callback: () => {
        miiCreateRandom(shutdown);
      },
    },
    {
      text: "Import FFSD/MiiCreator data",
      callback: () => {
        let id: string;
        let modal = Modal.modal(
          "Import FFSD/MiiCreator data",
          "",
          "body",
          {
            text: "Cancel",
            callback: () => {
              miiCreateDialog(shutdown);
            },
          },
          {
            text: "Confirm",
            callback() {
              Library(id);
            },
          }
        );
        modal
          .qsa(".modal-body .flex-group,.modal-body span")!
          .forEach((q) => q!.style({ display: "none" }));
        modal.qs(".modal-body")!.appendMany(
          new Html("span").text("Select a FFSD or .miic file to import"),
          new Html("input")
            .attr({ type: "file", accept: ".ffsd,.cfsd,.miic" })
            .style({ margin: "auto" })
            .on("change", (e) => {
              const target = e.target as HTMLInputElement;
              console.log("Files", target.files);

              const f = new FileReader();

              f.readAsArrayBuffer(target.files![0]);
              f.onload = async () => {
                try {
                  // prevent error when importing converted Wii-era data
                  const miiData = Buffer.from(f.result as ArrayBuffer);

                  const mii = new Mii(miiData);

                  const miiDataToSave = mii.encode().toString("base64");

                  id = await newMiiId();

                  await localforage.setItem(id, miiDataToSave);

                  modal.qs(".modal-body button")!.elm.click();
                } catch (e) {
                  Modal.alert("Error", `Invalid Mii data: ${e}`);
                  target.value = "";
                }
              };
            })
        );
      },
    },
    {
      text: "Cancel",
      callback: () => {},
    }
  );
};
const miiCreateFromScratch = (shutdown: Function) => {
  function cb(gender: MiiGender) {
    return () => {
      shutdown();
      new MiiEditor(gender, async (m, shouldSave) => {
        if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
        Library();
      });
    };
  }

  Modal.modal(
    "Create New",
    "Select the Mii's gender",
    "body",
    {
      text: "Male",
      callback: cb(MiiGender.Male),
    },
    {
      text: "Female",
      callback: cb(MiiGender.Female),
    },
    {
      text: "Cancel",
      callback: () => miiCreateDialog(shutdown),
    }
  );
};
const miiCreatePNID = async (shutdown: Function) => {
  const input = await Modal.input(
    "Create New",
    "Enter PNID of user..",
    "Username",
    "body",
    false
  );
  if (input === false) {
    return miiCreateDialog(shutdown);
  }

  Loader.show();

  let pnid = await fetch(
      Config.dataFetch.pnidFetchURL(encodeURIComponent(input))
  );

  Loader.hide();
  if (!pnid.ok) {
    await Modal.alert("Error", `Couldn't get Mii: ${await pnid.text()}`);
    return Library();
  }

  shutdown();
  new MiiEditor(
    0,
    async (m, shouldSave) => {
      if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
      Library();
    },
    (await pnid.json()).data
  );
};
const miiCreateRandom = async (shutdown: Function) => {
  Loader.show();
  let random = await fetch(
    Config.dataFetch.nnidRandomURL
  ).then((j) => j.json());
  Loader.hide();

  shutdown();
  new MiiEditor(
    0,
    async (m, shouldSave) => {
      if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
      Library();
    },
    random.data
  );
};
const miiCreateRandomFFL = async (shutdown: Function) => {
  var m = Modal.modal("Choose a look-alike", "", "body", {
    text: "Cancel",
    callback(e) {},
  });
  m.classOn("random-mii-grid");
  const container = m.qs(".modal-body")!;
  container.clear();
  for (let i = 0; i < 21; i++) {
    const randomMii = new Mii(
      Buffer.from(
        "AwEAAAAAAAAAAAAAgP9wmQAAAAAAAAAAAABNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMNn",
        "base64"
      )
    );
    FFLiDatabaseRandom_Get(randomMii);

    let button = new Html("button")
      .append(new Html("img").attr({ src: miiIconUrl(randomMii) }))
      .appendTo(container);

    const randomMiiB64 = randomMii.encode().toString("base64");

    button.on("click", () => {
      m.qs("button")?.elm.click();
      shutdown();
      new MiiEditor(
        0,
        async (m, shouldSave) => {
          if (shouldSave === true)
            await localforage.setItem(await newMiiId(), m);
          Library();
        },
        randomMiiB64
      );
    });
  }
};
const miiEdit = (mii: MiiLocalforage, shutdown: () => any, miiData: Mii) => {
  return () => {
    const modal = Modal.modal(
      "Mii Options",
      "What would you like to do?",
      "body",
      {
        text: "Edit",
        async callback() {
          await shutdown();
          new MiiEditor(
            0,
            async (m, shouldSave) => {
              if (shouldSave === true) await localforage.setItem(mii.id, m);
              Library();
            },
            mii.mii
          );
        },
      },
      {
        text: "Delete",
        async callback() {
          let tmpDeleteModal = await Modal.modal(
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
              type: "danger",
            },
            {
              callback(e) {
                /* ... */
              },
              text: "No",
            }
          );

          modal
            .qs(".modal-body")
            ?.prepend(
              new Html("img")
                .attr({ src: miiIconUrl(miiData) })
                .style({ width: "180px", margin: "-18px auto 0 auto" })
            );
        },
      },
      {
        text: "Export/Download Data",
        async callback() {
          miiExportDownload(mii, miiData);
        },
      },
      {
        text: "Render",
        async callback() {
          miiExport(mii, miiData);
        },
      },
      {
        text: "Cancel",
        async callback() {},
      }
    );
    modal
      .qs(".modal-body")
      ?.prepend(
        new Html("img")
          .attr({ src: miiIconUrl(miiData) })
          .style({ width: "180px", margin: "-18px auto 0 auto" })
      );
  };
};

const miiColorConversionWarning = async (miiData: Mii) => {
  if (miiData.hasExtendedColors() === true) {
    let result = await Modal.prompt(
      "Warning",
      "This Mii is using extended Switch colors that will be lost in the conversion to Wii U/3DS format. Are you sure you want to continue?",
      "body",
      false
    );
    if (result === false) return false;
  }
  return true;
};

const miiExport = (mii: MiiLocalforage, miiData: Mii) => {
  Modal.modal(
    "Mii Export",
    "What would you like to do?",
    "body",
    {
      text: "Generate Wii U/3DS compatible QR code",
      async callback() {
        if (!(await miiColorConversionWarning(miiData))) return;
        // hack: force FFL shader for QR codes by changing the setting
        const setting = await getSetting("shaderType");
        await localforage.setItem("settings_shaderType", "wiiu");
        const qrCodeImage = await QRCodeCanvas(mii.mii, false);
        await localforage.setItem("settings_shaderType", setting);
        downloadLink(qrCodeImage, `${miiData.miiName}_QR_ffsd.png`);
      },
    },
    {
      text: "Mii Creator QR code",
      async callback() {
        // hack: force FFL shader for QR codes by changing the setting
        const setting = await getSetting("shaderType");
        await localforage.setItem("settings_shaderType", "wiiu");
        const qrCodeImage = await QRCodeCanvas(mii.mii, true);
        await localforage.setItem("settings_shaderType", setting);
        downloadLink(qrCodeImage, `${miiData.miiName}_QR_miic.png`);
      },
    },
    {
      text: "Render an image",
      async callback() {
        miiExportRender(mii, miiData);
      },
    },
    {
      text: "Make your own render",
      async callback() {
        customRender(miiData);
      },
    },
    {
      text: "Cancel",
      async callback() {},
    }
  );
};

const miiExportRender = async (mii: MiiLocalforage, miiData: Mii) => {
  Modal.modal(
    `Render options: ${miiData.miiName}`,
    "Choose a way to render this Mii",
    "body",
    {
      text: "Focus on head",
      async callback() {
        const renderImage = await getMiiRender(
          miiData,
          MiiCustomRenderType.Head
        );
        downloadLink(
          renderImage.src,
          `${miiData.miiName}_render_headshot_${Date.now()}.png`
        );
      },
    },
    {
      text: "Focus on full body",
      async callback() {
        const renderImage = await getMiiRender(
          miiData,
          MiiCustomRenderType.Body
        );
        downloadLink(
          renderImage.src,
          `${miiData.miiName}_render_body_${Date.now()}.png`
        );
      },
    },
    {
      text: "Head only",
      async callback() {
        const renderImage = await getMiiRender(
          miiData,
          MiiCustomRenderType.HeadOnly
        );
        downloadLink(
          renderImage.src,
          `${miiData.miiName}_render_head_only_${Date.now()}.png`
        );
      },
    },
    {
      text: "Cancel",
      callback() {},
    }
  );
};

const miiExportDownload = async (mii: MiiLocalforage, miiData: Mii) => {
  Modal.modal(
    "Mii Export",
    "How would you like to save the Mii?",
    "body",
    {
      text: "Cancel",
      callback() {},
    },
    {
      text: "Save MiiCreator data (Recommended)",
      async callback() {
        const blob = new Blob([miiData.encode()]);
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = miiData.miiName + ".miic";
        document.body.appendChild(a);
        a.click();

        requestAnimationFrame(() => {
          a.remove();
        });

        // free URL after some time
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 2000);
      },
    },
    {
      text: "Download 3D head model",
      async callback() {
        const holder = new Html("div").style({ opacity: "0" });
        const scene = new Mii3DScene(
          miiData,
          holder.elm,
          SetupType.Screenshot,
          (renderer) => {},
          true
        );
        // hide body
        scene.init().then(() => {
          scene.getScene().getObjectByName("m")!.visible = false;
          scene.getScene().getObjectByName("f")!.visible = false;

          const exporter = new GLTFExporter();
          exporter.parse(
            scene.getScene(),
            (gltf) => {
              console.log("gltf", gltf);
              if (gltf instanceof ArrayBuffer) {
                saveArrayBuffer(gltf, miiData.miiName + "_head.glb");
              }
              scene.shutdown();
            },
            (error) => {
              console.error("Oops, something went wrong:", error);
            },
            {
              binary: true,
            }
          );
        });
      },
    },
    {
      text: "Download FFSD file",
      async callback() {
        if (!(await miiColorConversionWarning(miiData))) return;
        const blob = new Blob([miiData.encodeFFSD()]);
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = miiData.miiName + ".ffsd";
        document.body.appendChild(a);
        a.click();

        requestAnimationFrame(() => {
          a.remove();
        });

        // free URL after some time
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 2000);
      },
    },
    {
      text: "Download Charinfo file",
      async callback() {
        //if (!(await miiColorConversionWarning(miiData))) return;
        const blob = new Blob([miiData.encodeCharinfo()]);
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = miiData.miiName + ".charinfo";
        document.body.appendChild(a);
        a.click();

        requestAnimationFrame(() => {
          a.remove();
        });

        // free URL after some time
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 2000);
      },
    },
    {
      text: "Show other raw data formats",
      async callback() {
        if (!(await miiColorConversionWarning(miiData))) return;
        const modal = Modal.modal(
          "Miscellaneous Output Formats",
          "Click inside a code block to select it.",
          "body",
          { callback() {}, text: "Cancel" },
          { callback() {}, text: "OK" }
        );

        modal
          .qs(".modal-content")!
          .style({ "max-height": "unset", "max-width": "600px" });
        modal
          .qs(".modal-body")!
          .prependMany(
            new Html("div").appendMany(
              new Html("span").class("h4").text("MiiC (Base64)"),
              new Html("pre")
                .class("pre-wrap", "mb-0")
                .text(miiData.encode().toString("base64"))
            ),
            new Html("div").appendMany(
              new Html("span").class("h4").text("FFSD (Base64)"),
              new Html("pre")
                .class("pre-wrap", "mb-0")
                .text(miiData.encodeFFSD().toString("base64"))
            ),
            new Html("div").appendMany(
              new Html("span").class("h4").text("FFSD (Hex)"),
              new Html("pre")
                .class("pre-wrap", "mb-0")
                .text(miiData.encodeFFSD().toString("hex"))
            ),
            new Html("div").appendMany(
              new Html("span").class("h4").text("Mii Studio data"),
              new Html("pre")
                .class("pre-wrap", "mb-0")
                .text(miiData.encodeStudio().toString("hex"))
            ),
            new Html("div").appendMany(
              new Html("span").class("h4").text("Charinfo data (Hex)"),
              new Html("pre")
                .class("pre-wrap", "mb-0")
                .text(miiData.encodeCharinfo().toString("hex"))
            )
          );
      },
    }
  );
};

export async function customRender(miiData: Mii) {
  const modal = Modal.modal("Prepare Render", "", "body", {
    callback: () => {},
    text: "Cancel",
  });
  const body = modal.qs(".modal-body")!.classOn("responsive-row-lg").clear();
  modal.qs(".modal-content")!.styleJs({
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
  });
  let parent = new Html("div")
    .style({
      display: "flex",
      flex: "1",
      background: "var(--container)",
      "border-radius": "12px",
      "flex-shrink": "0",
      height: "100%",
      overflow: "hidden",
      "justify-content": "center",
      "align-items": "center",
    })
    .appendTo(body);
  let parentBox = new Html("div")
    .style({ "aspect-ratio": "1 / 1", height: "100%" })
    .appendTo(parent);
  let tabsContent = new Html("div")
    .classOn("tab-content")
    .style({ flex: "1", height: "100%", overflow: "auto" })
    .appendTo(body);

  let configuration = {
    fov: 30,
    pose: 0,
    expression: 0,
    renderWidth: 720,
    renderHeight: 720,
    cameraPosition: 1,
  };

  const base64Data = miiData.encodeStudio().toString("hex");

  const expressionDuplicateList = [34, 42, 44, 46, 48, 50, 52, 54, 61, 62];

  let poseListPerBodyModel: Record<string, number> = {
    wii: 4,
    wiiu: 14,
    switch: 5,
  };

  let bodyModelSetting = (await getSetting("bodyModel")) as string;

  let poseCount = 0;
  if (bodyModelSetting in poseListPerBodyModel) {
    poseCount = poseListPerBodyModel[bodyModelSetting] + 1;
  }

  console.log(bodyModelSetting);

  // very hacky way to use feature set to create tabs
  MiiPagedFeatureSet({
    mii: configuration,
    miiIsNotMii: true,
    entries: {
      page1: {
        label: "Camera",
        header:
          "Use mouse or touch to move the camera around.\n\nIf you like this site, please consider sharing it with others and crediing me when you post your renders! 🙂",
        items: [
          {
            type: FeatureSetType.Slider,
            property: "fov",
            iconStart: "FOV",
            iconEnd: "",
            min: 5,
            max: 70,
            part: RenderPart.Face,
          },
        ],
      },
      pose: {
        label: "Pose",
        header:
          "Change the Body Model option in Settings to get many different options of poses!\n\nUse option 0 here for the default animation.",
        items: ArrayNum(poseCount).map((k) => ({
          type: FeatureSetType.Icon,
          value: k,
          icon: String(k),
          part: RenderPart.Head,
        })),
      },
      expression: {
        label: "Expression",
        items: ArrayNum(70)
          .filter((n) => !expressionDuplicateList.includes(n))
          .map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: `<img class="lazy" width=128 height=128 data-src="https://mii-renderer.nxw.pw/miis/image.png?width=128&scale=1&data=${encodeURIComponent(
              base64Data
            )}&expression=${k}&type=fflmakeicon&verifyCharInfo=0">`,
            part: RenderPart.Head,
          })),
      },
      page2: {
        label: "Render",
        header:
          "Let's face it, you've been waiting for this feature, right? Well, it's not coming yet. I'm looking at you, LHI2010.\n\nCheck back in, hmm, maybe a few more months, heh...\n\nPsst.. If you like digging through these menus so much, why not check the settings to change your shader?",
        items: [
          {
            type: FeatureSetType.Text,
            property: "renderWidth",
            part: RenderPart.Face,
            label: "Width",
          },
          {
            type: FeatureSetType.Text,
            property: "renderHeight",
            part: RenderPart.Face,
            label: "Height",
          },
        ],
      },
    },
    onChange(mii, forceRender, part) {
      configuration = mii as any;
      updateConfiguration();
      console.log("updated", configuration);
    },
  })
    .style({ height: "auto" })
    .appendTo(tabsContent);

  new Html("button")
    .text("Download PNG")
    .on("click", finalizeRender)
    .appendTo(tabsContent);

  new Html("button")
    .text("Download 3D model")
    .on("click", save3DModel)
    .appendTo(tabsContent);

  window.addEventListener("resize", () => {
    scene.resize();
  });

  const scene = new Mii3DScene(
    miiData,
    parentBox.elm,
    SetupType.Screenshot,
    (renderer) => {}
  );

  //@ts-expect-error testing
  window.scene = scene;

  let oldConfiguration: any = {
    fov: 30,
    pose: 0,
    expression: 0,
    renderWidth: 720,
    renderHeight: 720,
    cameraPosition: 1,
  };

  function updateConfiguration() {
    scene.getCamera()!.fov = configuration.fov;
    scene.getCamera()!.updateProjectionMatrix();
    switch (configuration.cameraPosition) {
      case 0:
        scene.focusCamera(CameraPosition.MiiHead);
        break;
      case 1:
        scene.focusCamera(CameraPosition.MiiFullBody);
        break;
    }

    scene.traverseAddFaceMaterial(
      scene.getHead() as Mesh,
      `&data=${encodeURIComponent(base64Data)}&expression=${
        configuration.expression
      }&width=896&verifyCharInfo=0`
    );

    const pose = "Pose." + String(configuration.pose).padStart(2, "0");

    if (scene.animations.get(`${scene.type}-${pose}`)) {
      scene.swapAnimation(pose);
    } else {
      scene.swapAnimation("Wait");
    }

    oldConfiguration = configuration;
  }

  //@ts-expect-error
  window.scene = scene;

  scene.init().then(() => {
    scene.updateBody();
    scene.focusCamera(CameraPosition.MiiFullBody, true, false);
    parentBox.append(scene.getRendererElement());
  });

  const rendererElm = scene.getRendererElement();

  function finalizeRender() {
    rendererElm.toBlob((blob) => {
      const image = new Image(rendererElm.width, rendererElm.height);
      image.src = URL.createObjectURL(blob!);
      console.log("Temporary render URL:", image.src);
      image.onload = () => {
        downloadLink(
          image.src,
          `${miiData.miiName}_all_body_${new Date().toJSON()}.png`
        );
        scene.shutdown();
        parent.cleanup();
        modal.qs("button")?.elm.click();
      };
    });
  }

  async function save3DModel() {
    const shaderSetting = await getSetting("shaderType");
    // Firstly, fix up the materials?
    scene.getScene().traverse((o) => {
      if ((o as Mesh).isMesh !== true) return;

      const m = o as Mesh;

      console.log(m.name, m.geometry.userData);

      // this depends on shader setting..
      let map: Texture | null = null;
      const userData = m.geometry.userData;

      if (
        // Both of these internally use FFL shader
        shaderSetting === "wiiu" ||
        shaderSetting === "lightDisabled"
      ) {
        map = (m.material as ShaderMaterial).uniforms.s_texture.value;
      } else if (shaderSetting === "switch") {
        // Can't remember what the uniform for texture is on switch
      } else {
        // Prevent warning by assigning map to null if it is null
        if ((m.material as MeshStandardMaterial).map !== null)
          map = (m.material as MeshStandardMaterial).map;
      }

      // Just use modulateColor from the userData
      // because i can't be asked
      function rgbaToHex(rgba: [number, number, number]) {
        const [r, g, b] = rgba;
        const intR = Math.round(r * 255);
        const intG = Math.round(g * 255);
        const intB = Math.round(b * 255);
        const hexR = intR.toString(16).padStart(2, "0");
        const hexG = intG.toString(16).padStart(2, "0");
        const hexB = intB.toString(16).padStart(2, "0");
        return Number(`0x${hexR}${hexG}${hexB}`);
      }

      m.material = new MeshStandardMaterial({
        color: rgbaToHex(userData.modulateColor),
        metalness: 1,
        roughness: 1,

        // For texture
        alphaTest: 0.5,
        map: map,
      });
    });

    const exporter = new GLTFExporter();
    exporter.parse(
      scene.getScene(),
      (gltf) => {
        console.log("gltf", gltf);
        if (gltf instanceof ArrayBuffer) {
          saveArrayBuffer(
            gltf,
            `${miiData.miiName}_all_body_${new Date().toJSON()}.glb`
          );
        }
        scene.shutdown();
        parent.cleanup();
        modal.qs("button")?.elm.click();
      },
      (error) => {
        console.error("Oops, something went wrong:", error);
      },
      {
        binary: true,
      }
    );
  }
}
