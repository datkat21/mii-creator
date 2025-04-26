import Html from "@datkat21/html";
import type { TabRenderInit } from "../../constants/TabRenderType";
import { Buffer as Buf } from "../../../node_modules/buffer/index";
import { Input } from "../components/Input";
import Mii from "../../external/mii-js/mii";
import { RenderPart } from "../../class/MiiEditor";

export function MiscTab(data: TabRenderInit) {
  let tmpMii = new Mii(data.mii.encode());
  const setProp = (prop: string, val: any) => {
    (tmpMii as any)[prop] = val;
    data.callback(tmpMii, false, RenderPart.Head);
    return true;
  };
  data.container.append(
    new Html("div")
      .style({
        padding: "1rem",
        display: "flex",
        "flex-direction": "column",
        gap: "1rem"
      })
      .appendMany(
        Input(
          "Name",
          data.mii.miiName,
          // set
          (name) => setProp("miiName", name.trim()),
          // validate
          (name) => {
            const nameBuffer = Buf.from(name, "utf16le");

            // Empty string check
            let nameStr = nameBuffer.toString("utf16le");
            if (nameStr.trim() === "") return false;

            // Name length check
            if (nameBuffer.length <= 0x14 && nameBuffer.length !== 0)
              return true;

            return false;
          },
          data.editor
        ),
        Input(
          "Creator",
          data.mii.creatorName,
          // set
          (creator) => setProp("creatorName", creator.trim()),
          // validate
          (name) => {
            const nameBuffer = Buf.from(name, "utf16le");

            // Empty string check
            let nameStr = nameBuffer.toString("utf16le");
            if (nameStr.trim() === "") return false;

            // Name length check
            if (nameBuffer.length <= 0x14) return true;

            return false;
          },
          data.editor
        )
      )
  );
}
