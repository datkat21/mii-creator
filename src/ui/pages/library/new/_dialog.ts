import Html from "@datkat21/html";
import Modal from "../../../components/Modal";
import { _shutdown, Library, newMiiId, pushToServer } from "../../Library";
import Mii from "../../../../class/MiiData";
import localforage from "localforage";
import { newFromScratch } from "./fromScratch";
import { newFromQRCode } from "./qrCode";
import { newFromNNID, newFromPNID } from "./nnidPnid";
import { newFromLookalike } from "./lookalike";
import { newFromRandonNNID } from "./randomNnid";
import { dataToBase64 } from "../../../../util/dataConvert";

import { _ } from "../../../../util/Lang";
import { parseHexOrB64ToUint8Array } from "../../../../external/ffl.js/ffl";
const __ = _();

export const miiCreateDialog = () => {
  const m = Modal.modal(
    __("Create Mii"),
    __("How would you like to create the Mii?"),
    "body",
    {
      text: __("From Scratch"),
      type: "primary",
      callback: () => {
        newFromScratch();
      }
    },
    {
      text: __("QR Code"),
      callback: () => {
        newFromQRCode();
      }
    },
    {
      text: __("Mii data file"),
      callback: () => {
        let id: string;
        let modal = Modal.modal(
          __("Mii data files import"),
          "",
          "body",
          {
            text: "Cancel",
            callback: () => {
              miiCreateDialog();
            }
          },
          {
            text: "Confirm",
            callback() {
              Library(id);
            }
          }
        );
        // hide buttons/labels
        modal
          .qsa(".modal-body .flex-group,.modal-body span")!
          .forEach((q) => q!.style({ display: "none" }));
        modal.qs(".modal-body")!.appendMany(
          new Html("span").text(
            __(
              "Import Mii data file(s) here. Supported formats: .ffsd/.cfsd, .miic, .charinfo, .rsd"
            )
          ),
          new Html("input")
            .attr({
              type: "file",
              accept:
                ".ffsd,.cfsd,.charinfo,.rsd," +
                // add unofficial formats
                ".miic,.mii,.miigx,.cfcd,.ufsd,.mnms,.nfcd",
              multiple: "on"
            })
            .style({ margin: "auto" })
            .on("change", async (e) => {
              const target = e.target as HTMLInputElement;
              console.log("Files", target.files);

              const f = new FileReader();

              let processed = 0;

              function loadFile(file: File) {
                return new Promise<void>((resolve) => {
                  f.readAsArrayBuffer(file);
                  f.onload = async () => {
                    const miiData = new Uint8Array(f.result as ArrayBuffer);

                    const mii = new Mii(miiData);

                    const miiDataToSave = dataToBase64(mii.export("miic"));

                    id = await newMiiId();

                    await localforage.setItem(id, miiDataToSave);
                    await pushToServer();
                    processed++;
                    resolve();
                  };
                });
              }
              for (const file of Array.from(target.files!)) {
                try {
                  await loadFile(file).catch((e) => {
                    throw e;
                  });
                } catch (e) {
                  Modal.alert(__("Error"), __("Invalid Mii data: $1", e));
                  console.error(e);
                  target.value = "";
                  continue;
                }
              }

              if (processed > 0) {
                _shutdown()();
                modal.qs(".modal-body button")!.elm.click();
              }
            })
        );
      }
    },
    {
      text: __("Raw Mii data"),
      callback: async () => {
        const result = await Modal.input(
          __("Raw Mii data import"),
          __("Paste raw Mii data here."),
          __("Hex/Base64 data"),
          "body"
        );

        if (result === false) return;

        const miiData = parseHexOrB64ToUint8Array(result);

        const mii = new Mii(miiData);

        const miiDataToSave = dataToBase64(mii.export("miic"));

        let id = await newMiiId();

        await localforage.setItem(id, miiDataToSave);
        await pushToServer();
        _shutdown()();
        Library(id);
      }
    },
    {
      text: __("Enter NNID/PNID"),
      callback: () => {
        Modal.modal(
          __("Enter NNID/PNID"),
          __("Select a service to look up"),
          "body",
          {
            text: "Cancel"
          },
          {
            text: __("Enter Nintendo Network ID"),
            callback(e) {
              newFromNNID();
            }
          },
          {
            text: __("Enter Pretendo Network ID"),
            callback(e) {
              newFromPNID();
            }
          }
        );
      }
    },
    {
      text: __("Choose a look-alike"),
      callback: () => {
        newFromLookalike();
      }
    },
    {
      text: __("Random NNID"),
      callback: () => {
        newFromRandonNNID();
      }
    },
    {
      text: "Cancel"
    }
  );
  m.qs(".modal-body")!.styleJs({ maxWidth: "600px" });
};
