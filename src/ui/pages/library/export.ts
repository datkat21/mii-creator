import localforage from "localforage";
import Mii from "../../../class/MiiData";
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
import { dataToBase64 } from "../../../util/dataConvert";

import { _ } from "../../../util/Lang";
const __ = _();

export const miiExportData = async (mii: MiiLocalforage, miiData: Mii) => {
  Modal.modal(
    __("Export Mii"),
    __("How would you like to save the Mii?"),
    "body",
    {
      text: "Cancel"
    },
    {
      text: __("Save Mii Creator data"),
      async callback() {
        const blob = new Blob([miiData.export()]);
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = miiData.nickname + ".miic";
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
      text: __("Download other file types..."),
      callback(e) {
        Modal.modal(
          __("Other download types"),
          __("Choose a file type to download"),
          "body",
          {
            text: "Cancel",
            callback(e) {
              miiExportData(mii, miiData);
            }
          },
          {
            text: __("Download .CharInfo (Switch) file"),
            async callback() {
              //if (!(await miiColorConversionWarning(miiData))) return;
              const blob = new Blob([miiData.export("switchCharInfo")]);
              const url = URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.target = "_blank";
              a.download = miiData.nickname + ".charinfo";
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
            text: __("Download .FFSD (3DS/Wii U)"),
            async callback() {
              if (!(await miiFFSDWarning(miiData))) return;
              const blob = new Blob([miiData.export("ffsd")]);
              const url = URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.target = "_blank";
              a.download = miiData.nickname + ".ffsd";
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
            text: __("Download .RSD (Wii)"),
            async callback() {
              const blob = new Blob([miiData.export("rsd")]);
              const url = URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.target = "_blank";
              a.download = miiData.nickname + ".rsd";
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
      text: __("Save Mii as QR Code"),
      async callback() {
        if (!(await miiQRConversionWarning(miiData))) return;
        if (
          !(await Modal.prompt(
            __("Warning"),
            __(
              "Mii Creator QR codes won't save all of this Mii's data at the moment. Mii Creator will never be able to scan back these beta version QR codes and retain all the custom colors and other info. Is this OK?"
            ),
            "body",
            true
          ))
        )
          return;
        // hack: force FFL shader for QR codes by changing the setting
        // const setting = await getSetting("shaderType");
        // await localforage.setItem("settings_shaderType", "wiiu");
        const qrCodeImage = await QRCodeCanvas(
          miiData,
          miiData.hasExtendedColors()
        ); // extendedColors
        // await localforage.setItem("settings_shaderType", setting);
        downloadLink(qrCodeImage, `${miiData.nickname}_QR.png`);
      }
    },
    {
      text: __("Show other raw data formats"),
      async callback() {
        const modal = Modal.modal(
          __("Miscellaneous Output Formats"),
          __("Click inside a code block to select it."),
          "body",
          ...buttonsOkCancel
        );

        modal
          .qs(".modal-content")!
          .style({ "max-height": "100vh", "max-width": "600px" });
        modal.qs(".modal-body")!.prependMany(
          new Html("div").appendMany(
            new Html("span").class("h4").text("CharInfo (Switch) data (Hex)"),
            new Html("pre")
              .class("pre-wrap", "mb-0")
              .text(miiData.exportHex("switchCharInfo"))
          ),
          new Html("div").appendMany(
            new Html("span").class("h4").text("Mii Creator data (Base64)"),
            new Html("pre")
              .class("pre-wrap", "mb-0")
              .text(miiData.exportBase64("miic"))
          ),
          // new Html("div").appendMany(
          //   new Html("span")
          //     .class("h4")
          //     .text("FFSD + Mii Creator data (Base64)"),
          //   new Html("pre")
          //     .class("pre-wrap", "mb-0")
          //     .text(miiData.exportBase64("ffsd_append_miic"))
          // ),
          new Html("div").appendMany(
            new Html("span").class("h4").text("FFSD (Base64)"),
            new Html("pre")
              .class("pre-wrap", "mb-0")
              .text(miiData.exportBase64("ffsd"))
          ),
          new Html("div").appendMany(
            new Html("span").class("h4").text("FFSD (Hex)"),
            new Html("pre")
              .class("pre-wrap", "mb-0")
              .text(miiData.exportHex("ffsd"))
          ),
          new Html("div").appendMany(
            new Html("span").class("h4").text("Mii Studio data"),
            new Html("pre")
              .class("pre-wrap", "mb-0")
              .text(miiData.exportHex("studioData"))
          )
        );
      }
    }
  );
};
