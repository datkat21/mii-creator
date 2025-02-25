import Html from "@datkat21/html";
import Modal from "../../../components/Modal";
import { _shutdown, Library, newMiiId } from "../../Library";
import Mii from "../../../../class/MiiData";
import localforage from "localforage";
import { newFromScratch } from "./fromScratch";
import { newFromQRCode } from "./qrCode";
import { newFromNNID, newFromPNID } from "./nnidPnid";
import { newFromLookalike } from "./lookalike";
import { newFromRandonNNID } from "./randomNnid";
import { dataToBase64 } from "../../../../util/dataConvert";

export const miiCreateDialog = () => {
  const m = Modal.modal(
    "New Mii",
    "How would you like to create the Mii?",
    "body",
    {
      text: "From Scratch",
      type: "primary",
      callback: () => {
        newFromScratch();
      }
    },
    {
      text: "QR Code",
      callback: () => {
        newFromQRCode();
      }
    },
    {
      text: "Mii data file",
      callback: () => {
        let id: string;
        let modal = Modal.modal(
          "Mii data files import",
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
        modal
          .qsa(".modal-body .flex-group,.modal-body span")!
          .forEach((q) => q!.style({ display: "none" }));
        modal.qs(".modal-body")!.appendMany(
          new Html("span").text(
            "Import Mii data file(s) here. Supported formats: .ffsd/.cfsd, .miic, .charinfo, .rsd"
          ),
          new Html("input")
            .attr({ type: "file", accept: ".ffsd,.cfsd,.miic", multiple: "on" })
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
                  Modal.alert("Error", `Invalid Mii data: ${e}`);
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
      text: "Enter NNID/PNID",
      callback: () => {
        Modal.modal(
          "Enter NNID/PNID",
          "Select a service to look up",
          "body",
          {
            text: "Cancel"
          },
          {
            text: "Enter Nintendo Network ID",
            callback(e) {
              newFromNNID();
            }
          },
          {
            text: "Enter Pretendo Network ID",
            callback(e) {
              newFromPNID();
            }
          }
        );
      }
    },
    {
      text: "Choose a look-alike",
      callback: () => {
        newFromLookalike();
      }
    },
    {
      text: "Random NNID",
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
