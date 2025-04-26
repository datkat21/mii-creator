import Html from "@datkat21/html";
import Modal from "../../../components/Modal";
import { _shutdown, Library, newMiiId } from "../../Library";
import Mii from "../../../../external/mii-js/mii";
import localforage from "localforage";
import { Buffer } from "../../../../../node_modules/buffer";
import { newFromScratch } from "./fromScratch";
import { newFromQRCode } from "./qrCode";
import { newFromNNID, newFromPNID } from "./nnidPnid";
import { newFromLookalike } from "./lookalike";
import { newFromRandonNNID } from "./randomNnid";

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
      text: "FFSD/MiiCreator data",
      callback: () => {
        let id: string;
        let modal = Modal.modal(
          "Import FFSD/MiiCreator data",
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

                  _shutdown()();
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
