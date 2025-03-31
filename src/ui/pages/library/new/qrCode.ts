import Html from "@datkat21/html";
import Mii from "../../../../class/MiiData";
import {
  initQrCam,
  QrScanDataType,
  QrScannerError,
  setQRCallback,
  startScanner
} from "../../../../util/DecodeQRCode";
import { getSetting } from "../../../../util/SettingsHelper";
import Modal from "../../../components/Modal";
import { importMiiConfirmation } from "../importDialog";
import { miiCreateDialog } from "./_dialog";

import { _ } from "../../../../util/Lang";
const __ = _();

export const newFromQRCode = async () => {
  let qrReturnToMenu = true;
  const m = Modal.modal(__("Scan QR Code"), "", "body", {
    text: "Cancel",
    callback: () => {
      m.qs("#stop-camera")!.elm.click();
      if (qrReturnToMenu) miiCreateDialog();
    }
  });

  const mb = m.qs(".modal-body")!;

  // delete the button container
  m.qs(".modal-body")!
    .qsa("*")!
    .forEach((item) => item!.cleanup());
  m.qs(".modal-content")?.styleJs({ maxHeight: "100%", maxWidth: "600px" });

  mb.appendMany(
    // camera stuff container
    new Html("div").classOn("col").appendMany(
      new Html("span").attr({ for: "cam-list" }).text(__("Select camera:")),
      new Html("select")
        .id("cam-list")
        .appendMany(
          new Html("option")
            .attr({ value: "environment", selected: "yes" })
            .text(__("Back Camera (default)")),
          new Html("option")
            .attr({ value: "user" })
            .text(__("User/Front Facing Camera")),
          new Html("option")
            .attr({ value: "device-camera", disabled: true })
            .text(__("(Open the camera for more options)"))
        ),
      new Html("div")
        .class("flex-group")
        .appendMany(
          new Html("button").id("start-camera").text(__("Start camera")),
          new Html("button").id("stop-camera").text(__("Stop camera"))
        ),
      new Html("video").id("qr-video").styleJs({ maxWidth: "100%" }),
      new Html("span").id("file-upload").text(__("Or upload an image:")),
      new Html("input").attr({
        type: "file",
        id: "file-input",
        accept: "image/*"
      })
    )
  );

  startScanner(mb.qs("#cam-list")!.elm);
  initQrCam(
    mb.qs("#cam-list")!.elm,
    mb.qs("#start-camera")!.elm as HTMLButtonElement,
    mb.qs("#stop-camera")!.elm as HTMLButtonElement,
    mb.qs("#file-input")!.elm as HTMLInputElement
  );

  if ((await getSetting("allowQrCamera")) === false) {
    // Hide unused items if camera isn't allowed
    mb.qsa('span[for="cam-list"], #cam-list, .flex-group, video')!.forEach(
      (e) => e!.style({ display: "none" })
    );
    // prevent video element from taking up space
    mb.qs("video")!.style({ position: "fixed" });
    mb.qs("span#file-upload")!.text(
      __("Camera is disabled in settings.\n\nUpload an image:")
    );
  }

  // confirmation function
  async function qrImportConfirmation(mii: Mii, source: string) {
    const shouldClose = await getSetting("autoCloseQrScan");
    if (shouldClose) {
      // hack to close modal and stop scanner
      qrReturnToMenu = false;
      m.qs(".modal-header button")?.elm.click();
    }
    importMiiConfirmation(mii, source, __("Mii QR Scanned"));
  }

  // initialize qr callback for data handling
  setQRCallback((data: Uint8Array, dataType: QrScanDataType) => {
    try {
      var mii: Mii;
      switch (dataType) {
        case QrScanDataType.GenericWiiU3ds:
          mii = new Mii(data);
          qrImportConfirmation(mii, __("3DS/Wii U QR Code"));
          break;
        case QrScanDataType.ExtraDataTL:
          Modal.alert(
            __("Notice"),
            new Html("span").html(
              __(
                'Tomodachi Life QR codes aren\'t supported yet. Use <a href="https://mii-unsecure.ariankordi.net" target="_blank">%1</a> to scan it.',
                __("Mii Renderer (REAL)")
              )
            )
          );
          break;
        case QrScanDataType.ExtraDataMiiC:
          mii = new Mii(data);
          qrImportConfirmation(mii, __("Mii Creator QR Code"));
          break;
      }
    } catch (e) {
      QrScannerError(
        __(
          "An error occurred when reading the data.\nPlease check the console for more information."
        )
      );
      console.error(e);
    }
  });
};
