import localforage from "localforage";
import type Mii from "../../../external/mii-js/mii";
import { getSetting } from "../../../util/SettingsHelper";
import Modal, { buttonsOkCancel } from "../../components/Modal";
import {
  miiFFSDWarning,
  miiQRConversionWarning,
  type MiiLocalforage
} from "../Library";
import { QRCodeCanvas } from "../../../util/miiImageUtils";
import { downloadLink } from "../../../util/downloadLink";
import Html from "@datkat21/html";

export const miiExportData = async (mii: MiiLocalforage, miiData: Mii) => {
  Modal.modal(
    "Export Mii",
    "How would you like to save the Mii?",
    "body",
    {
      text: "Cancel"
    },
    {
      text: "Save MiiCreator data",
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
      }
    },
    {
      text: "Download other file types...",
      callback(e) {
        Modal.modal(
          "Other download types",
          "Choose a file type to download",
          "body",
          {
            text: "Cancel",
            callback(e) {
              miiExportData(mii, miiData);
            }
          },
          {
            text: "Download FFSD file",
            async callback() {
              if (!(await miiFFSDWarning(miiData))) return;
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
            }
          },
          {
            text: "Download CharInfo (Switch) file",
            async callback() {
              //if (!(await miiColorConversionWarning(miiData))) return;
              const blob = new Blob([miiData.encodeCharInfoSwitch()]);
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
            }
          }
        );
      }
    },
    {
      text: "Save Mii as QR Code",
      async callback() {
        if (!(await miiQRConversionWarning(miiData))) return;
        // hack: force FFL shader for QR codes by changing the setting
        const setting = await getSetting("shaderType");
        await localforage.setItem("settings_shaderType", "wiiu");
        const qrCodeImage = await QRCodeCanvas(
          mii.mii,
          miiData.hasExtendedColors()
        ); // extendedColors
        await localforage.setItem("settings_shaderType", setting);
        downloadLink(qrCodeImage, `${miiData.miiName}_QR.png`);
      }
    },
    {
      text: "Show other raw data formats",
      async callback() {
        const modal = Modal.modal(
          "Miscellaneous Output Formats",
          "Click inside a code block to select it.",
          "body",
          ...buttonsOkCancel
        );

        modal
          .qs(".modal-content")!
          .style({ "max-height": "100vh", "max-width": "600px" });
        modal
          .qs(".modal-body")!
          .prependMany(
            new Html("div").appendMany(
              new Html("span").class("h4").text("CharInfo (Switch) data (Hex)"),
              new Html("pre")
                .class("pre-wrap", "mb-0")
                .text(miiData.encodeCharInfoSwitch().toString("hex"))
            ),
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
            )
          );
      }
    }
  );
};
