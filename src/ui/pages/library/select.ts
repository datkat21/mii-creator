import localforage from "localforage";
import { MiiEditor } from "../../../class/MiiEditor";
import type Mii from "../../../external/mii-js/mii";
import Modal from "../../components/Modal";
import {
  _shutdown,
  Library,
  miiIconUrl,
  type MiiLocalforage
} from "../Library";
import Html from "@datkat21/html";
import { miiRender } from "./render/renderMenu";
import { miiExportData } from "./export";

export const miiSelect = (
  mii: MiiLocalforage,
  miiData: Mii,
  isSpecial: boolean
) => {
  return async () => {
    const modal = Modal.modal(
      miiData.miiName,
      "What would you like to do?",
      "body",
      {
        text: "Edit",
        async callback() {
          if (isSpecial) {
            Modal.modal(
              "Nope",
              "You can't edit Special Miis obtained through Mii Creator.",
              "body",
              { text: "Cancel" },
              { text: "OK" }
            );
          } else {
            await _shutdown()();
            new MiiEditor(
              0,
              async (m, shouldSave) => {
                if (shouldSave === true) await localforage.setItem(mii.id, m);
                Library();
              },
              mii.mii
            );
          }
        }
      },
      {
        text: "Delete",
        async callback() {
          let scaredIcon: Blob,
            fearfulIcon: Blob,
            reliefIcon: Blob,
            scaredIconURL: string,
            fearfulIconURL: string,
            reliefIconURL: string;

          scaredIcon = await (
            await fetch((await miiIconUrl(miiData)) + "&expression=10")
          ).blob();
          fearfulIcon = await (
            await fetch((await miiIconUrl(miiData)) + "&expression=30")
          ).blob();
          reliefIcon = await (
            await fetch((await miiIconUrl(miiData)) + "&expression=1")
          ).blob();

          scaredIconURL = URL.createObjectURL(scaredIcon);
          fearfulIconURL = URL.createObjectURL(fearfulIcon);
          reliefIconURL = URL.createObjectURL(reliefIcon);

          function release() {
            URL.revokeObjectURL(scaredIconURL);
            URL.revokeObjectURL(fearfulIconURL);
            URL.revokeObjectURL(reliefIconURL);
          }
          function destroy() {
            // cry about it
            disableModal();
            scaredMiiImage.classOn("rotateAndCry");
          }

          function closingCallback() {
            tmpDeleteModal
              .qs(".modal-body")!
              .qsa("*")!
              .forEach((a) => a!.attr({ disabled: true, tabindex: "-1" }));
          }
          function disableModal() {
            closingCallback();
          }
          function closeModal() {
            tmpDeleteModal.class("closing");
            closingCallback();
            setTimeout(() => {
              tmpDeleteModal.cleanup();
            }, 350);
          }

          let tmpDeleteModal = Modal.modal(
            "Warning",
            `Are you sure you want to delete ${miiData.miiName}?`,
            "body"
          );

          // button group
          tmpDeleteModal.qs(".modal-body .flex-group")!.appendMany(
            new Html("button")
              .class("danger")
              .text("Yes")
              .on("click", () => {
                destroy();
                scaredMiiImage.attr({
                  src: fearfulIconURL
                });
                setTimeout(async () => {
                  closeModal();
                  release();
                  await localforage.removeItem(mii.id);
                  await _shutdown()();
                  Library();
                }, 1000);
              }),
            new Html("button").text("No").on("click", () => {
              closeModal();
              release();
            })
          );

          // center
          tmpDeleteModal.qs(".modal-body")!.classOn("flex-group");

          const scaredMiiImage = new Html("img")
            // surprised with open mouth expression
            .attr({ src: scaredIconURL })
            .style({ width: "180px", margin: "-18px auto 0 auto" });

          tmpDeleteModal.qs(".modal-body")!.prepend(scaredMiiImage);
          tmpDeleteModal.qsa("button")!.forEach((item) => {
            const yes = item?.elm.classList.contains("danger");
            item!.on("pointerenter", () => {
              if (yes) {
                scaredMiiImage.attr({
                  src: fearfulIconURL
                });
              } else {
                scaredMiiImage.attr({
                  src: reliefIconURL
                });
              }
            });
            item!.on("pointerleave", () => {
              scaredMiiImage.attr({
                src: scaredIconURL
              });
            });
          });
        }
      },
      {
        text: "Export/Download Data",
        async callback() {
          miiExportData(mii, miiData);
        }
      },
      {
        text: "Render",
        async callback() {
          miiRender(mii, miiData);
        }
      },
      {
        text: "Cancel"
      }
    );

    modal.qs(".modal-body")?.prepend(
      new Html("img")
        .attr({
          src: await miiIconUrl(miiData, "preview", "all_body_sugar", 240)
        })
        .style({
          "object-fit": "contain",
          width: "180px",
          height: "240px",
          margin: "-18px auto 0 auto"
        })
    );
  };
};
