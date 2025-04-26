import localforage from "localforage";
import type Mii from "../../../external/mii-js/mii";
import Modal from "../../components/Modal";
import { _shutdown, Library, miiIconUrl, newMiiId } from "../Library";
import Html from "@datkat21/html";

export async function importMiiConfirmation(
  mii: Mii,
  source: string,
  title: string = "Mii Import"
) {
  var m2 = Modal.modal(
    title,
    "",
    "body",
    {
      text: "Cancel"
    },
    {
      text: "Don't Save"
    },
    {
      text: "Save",
      async callback(e) {
        const id = await newMiiId();
        await localforage.setItem(id, mii.encode().toString("base64"));
        _shutdown()();
        Library(id);
      }
    }
  );

  m2.qs(".modal-content")!.styleJs({ maxWidth: "100%", maxHeight: "100%" });
  m2.qs(".modal-body span")!.cleanup();

  m2.qs(".modal-body")!
    .style({ "align-items": "center", gap: "1.5rem" })
    .prependMany(
      new Html("span").text(`Do you want to save this Mii?`),
      new Html("small").text(source),
      new Html("span")
        .style({ "font-size": "20px" })
        .text(`${mii.miiName} has arrived!`),
      new Html("img")
        .attr({
          src: miiIconUrl(mii, "qr_code", "all_body_sugar", 260)
        })
        .style({
          width: "260px",
          height: "260px",
          "object-fit": "contain"
        })
    );
}
