import localforage from "localforage";
import type Mii from "../../../class/MiiData";
import Modal from "../../components/Modal";
import {
  _shutdown,
  Library,
  getMiiIcon,
  newMiiId,
  pushToServer
} from "../Library";
import Html from "@datkat21/html";
import { dataToBase64 } from "../../../util/dataConvert";

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
        await localforage.setItem(id, dataToBase64(mii.export()));
        await pushToServer();
        _shutdown()();
        Library(id);
      }
    }
  );

  m2.qs(".modal-content")!.styleJs({ maxWidth: "100%", maxHeight: "100%" });
  m2.qs(".modal-body span")!.cleanup();

  const icon = await getMiiIcon(mii, "import", "all_body_sugar", 260);

  m2.qs(".modal-body")!
    .style({ "align-items": "center", gap: "1.5rem" })
    .prependMany(
      new Html("span").text(`Do you want to save this Mii?`),
      new Html("small").text(source),
      new Html("span")
        .style({ "font-size": "20px" })
        .text(`${mii.nickname} has arrived!`),
      new Html("img")
        .attr({
          src: icon.url
        })
        .on("load", (await icon).dispose)
        .style({
          width: "260px",
          height: "260px",
          "object-fit": "contain"
        })
    );
}
