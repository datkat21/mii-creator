import localforage from "localforage";
import { MiiEditor } from "../../../class/MiiEditor";
import type Mii from "../../../class/MiiData";
import Modal from "../../components/Modal";
import {
  _shutdown,
  Library,
  getMiiIcon,
  type MiiLocalforage
} from "../Library";
import Html from "@datkat21/html";
import { miiRender } from "./render/renderMenu";
import { miiExportData } from "./export";
import { confirmOrReviseMii } from "./new/lookalike";

export const miiSelect = (
  mii: MiiLocalforage,
  miiData: Mii,
  isSpecial: boolean
) => {
  return async () => {
    const modal = Modal.modal(
      miiData.nickname,
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
        text: "Revise",
        async callback() {
          confirmOrReviseMii(miiData, {
            gender: miiData.gender,
            isOriginalMii: true
          });
        }
      },
      {
        text: "Delete",
        async callback() {
          try {
            let scaredIcon = await getMiiIcon(
              miiData,
              "deletion",
              "face",
              256,
              10,
              false
            );
            let fearfulIcon = await getMiiIcon(
              miiData,
              "deletion",
              "face",
              256,
              30,
              false
            );
            let reliefIcon = await getMiiIcon(
              miiData,
              "deletion",
              "face",
              256,
              1,
              false
            );

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
              `Are you sure you want to delete ${miiData.nickname}?`,
              "body"
            );

            // button group
            tmpDeleteModal.qs(".modal-body")!.append(
              new Html("div").class("flex-group").appendMany(
                new Html("button")
                  .class("danger")
                  .text("Yes")
                  .on("click", () => {
                    destroy();
                    scaredMiiImage.attr({
                      src: fearfulIcon
                    });
                    setTimeout(async () => {
                      closeModal();
                      await localforage.removeItem(mii.id);
                      await _shutdown()();
                      Library();
                    }, 1000);
                  }),
                new Html("button").text("No").on("click", () => {
                  closeModal();
                })
              )
            );

            // center
            tmpDeleteModal.qs(".modal-body")!.classOn("flex-group");

            const scaredMiiImage = new Html("img")
              // surprised with open mouth expression
              .attr({ src: scaredIcon })
              .style({ width: "180px", margin: "-18px auto 0 auto" });

            tmpDeleteModal.qs(".modal-body")!.prepend(scaredMiiImage);
            tmpDeleteModal.qsa("button")!.forEach((item) => {
              const yes = item?.elm.classList.contains("danger");
              item!.on("pointerenter", () => {
                if (yes) {
                  scaredMiiImage.attr({
                    src: fearfulIcon
                  });
                } else {
                  scaredMiiImage.attr({
                    src: reliefIcon
                  });
                }
              });
              item!.on("pointerleave", () => {
                scaredMiiImage.attr({
                  src: scaredIcon
                });
              });
            });
          } catch (e) {
            console.log("FALL BACK");
            // fallback
            Modal.modal(
              "Warning",
              `Are you sure you want to delete ${miiData.nickname}?`,
              "body",
              {
                text: "Yes",
                type: "danger",
                async callback(e) {
                  await localforage.removeItem(mii.id);
                  await _shutdown()();
                  Library();
                }
              },
              { text: "No" }
            );
          }
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

    const miiBodyIcon = new Html("img").style({
      "object-fit": "cover",
      width: "240px",
      height: "240px",
      margin: "-18px auto 0 auto",
      transition: "opacity 0.3s ease",
      opacity: "0"
    });

    getMiiIcon(miiData, "preview", "all_body_sugar", 240).then((result) => {
      miiBodyIcon.attr({ src: result }).style({ opacity: "1" });
    });
    modal.qs(".modal-body")?.prepend(miiBodyIcon);
  };
};
