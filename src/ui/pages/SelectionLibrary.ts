import Html from "@datkat21/html";
import localforage from "localforage";
import { MiiEditor, MiiGender } from "../../class/MiiEditor";
import Modal from "../components/Modal";
import Mii from "../../external/mii-js/mii";
import { Buffer } from "../../../node_modules/buffer/index";
import Loader from "../components/Loader";
import { AddButtonSounds } from "../../util/AddButtonSounds";
import { Config } from "../../config";
import EditorIcons from "../../constants/EditorIcons";
import {
  cPantsColorGoldHex,
  cPantsColorRedHex
} from "../../class/3d/shader/fflShaderConst";
import { MiiFavoriteColorIconTable } from "../../constants/ColorTables";
import { FFLiDatabaseRandom_Get } from "../../external/ffl/FFLiDatabaseRandom";
export const savedMiiCount = async () =>
  (await localforage.keys()).filter((k) => k.startsWith("mii-")).length;
export const newMiiId = async () =>
  `mii-${await savedMiiCount()}-${Date.now()}`;
export const miiIconUrl = (mii: Mii) =>
  `${Config.renderer.renderHeadshotURLNoParams}?data=${mii
    .encodeStudio()
    .toString("hex")}&shaderType=wiiu&type=face&width=180&verifyCharInfo=0`;

export function SelectionLibrary(highlightMiiId?: string): Promise<Mii> {
  return new Promise(async (resolve, reject) => {
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

    const libraryList = new Html("div")
      .class("library-list")
      .appendTo(container);

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
      libraryList.appendMany(
        new Html("div")
          .style({ position: "absolute", top: "2rem", left: "2rem" })
          .text("You have no Miis yet. Create one to get started!"),
        AddButtonSounds(
          new Html("button")
            .style({ position: "absolute", top: "4rem", left: "2rem" })
            .text("Create New")
            .on("click", async () => {
              await shutdown();
              miiCreateDialog();
            })
        )
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

        let miiImage = new Html("img").class("lazy").attr({
          "data-src": miiIconUrl(miiData)
        });

        // Special
        if (miiData.normalMii === false || miiData.favorite === true) {
          const star = new Html("i")
            .style({ position: "absolute", top: "0", right: "0" })

            .appendTo(miiContainer);

          if (miiData.normalMii === false) {
            star.html(EditorIcons.special).style({ color: cPantsColorGoldHex });
          }
          if (miiData.favorite === true) {
            star.html(EditorIcons.favorite).style({ color: cPantsColorRedHex });
          }
        }
        // hat
        if (miiData.extHatType !== 0) {
          const hat = new Html("i")
            .style({ position: "absolute", top: "0", left: "0" })
            .appendTo(miiContainer);
          hat.html(EditorIcons.hat).style({
            color:
              miiData.extHatColor !== 0
                ? MiiFavoriteColorIconTable[miiData.extHatColor - 1].top
                : MiiFavoriteColorIconTable[miiData.favoriteColor].top
          });
        }

        let miiName = new Html("span").text(miiData.miiName);

        let miiEditCallback = () => {
          const modal = Modal.modal(
            "Mii Options",
            "What would you like to do?",
            "body",
            {
              text: "Select",
              async callback() {
                await shutdown();
                resolve(miiData);
              }
            },
            {
              text: "Cancel"
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
            src: "data:image/svg+xml," + encodeURIComponent(EditorIcons.error)
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
                behavior: "smooth"
              });
            }
          }
        });
      } catch (e: unknown) {
        console.log("Oops", e);
      }
    }
    window.LazyLoad.update();
  });
}

type MiiLocalforage = {
  id: string;
  mii: string;
};

const miiCreateDialog = () => {
  Modal.modal(
    "Create New",
    "How would you like to create the Mii?",
    "body",
    {
      text: "From Scratch",
      callback: miiCreateFromScratch
    },
    {
      text: "Enter PNID",
      callback: miiCreatePNID
    },
    {
      text: "Random Mii",
      callback: miiCreateRandomFFL
    },
    {
      text: "Random NNID",
      callback: miiCreateRandom
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
            callback: miiCreateDialog
          },
          {
            text: "Confirm",
            callback() {
              SelectionLibrary(id);
            }
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
      }
    },
    {
      text: "Cancel",
      callback: () => SelectionLibrary()
    }
  );
};
const miiCreateFromScratch = () => {
  function cb(gender: MiiGender) {
    return () => {
      new MiiEditor(gender, async (m, shouldSave) => {
        if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
        SelectionLibrary();
      });
    };
  }

  Modal.modal(
    "Create New",
    "Select the Mii's gender",
    "body",
    {
      text: "Male",
      callback: cb(MiiGender.Male)
    },
    {
      text: "Female",
      callback: cb(MiiGender.Female)
    },
    {
      text: "Cancel",
      callback: () => miiCreateDialog()
    }
  );
};
const miiCreatePNID = async () => {
  const input = await Modal.input(
    "Create New",
    "Enter PNID of user..",
    "Username",
    "body",
    false
  );
  if (input === false) {
    return miiCreateDialog();
  }

  Loader.show();

  let pnid = await fetch(Config.apis.pnidFetchURL(encodeURIComponent(input)));

  Loader.hide();
  if (!pnid.ok) {
    await Modal.alert("Error", `Couldn't get Mii: ${await pnid.text()}`);
    return SelectionLibrary();
  }

  new MiiEditor(
    0,
    async (m, shouldSave) => {
      if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
      SelectionLibrary();
    },
    (await pnid.json()).data
  );
};
const miiCreateRandom = async () => {
  Loader.show();
  let random = await fetch(Config.apis.nnidRandomURL).then((j) => j.json());
  Loader.hide();

  new MiiEditor(
    0,
    async (m, shouldSave) => {
      if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
      SelectionLibrary();
    },
    random.data
  );
};
const miiCreateRandomFFL = async () => {
  const editMii = new Mii(
    Buffer.from(
      "AwEAAAAAAAAAAAAAgP9wmQAAAAAAAAAAAABNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMNn",
      "base64"
    )
  );

  FFLiDatabaseRandom_Get(editMii, {});

  new MiiEditor(
    0,
    async (m, shouldSave) => {
      if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
      SelectionLibrary();
    },
    editMii.encode().toString("base64")
  );
};
