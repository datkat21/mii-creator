import Html from "@datkat21/html";
import type { TabRenderInit } from "../../constants/TabRenderType";
import { Input } from "../components/Input";
import Mii from "../../class/MiiData";
import { RenderPart } from "../../class/MiiEditor";
import { decodeUTF16LE, encodeUTF16LE } from "../../util/dataConvert";

export function MiscTab(data: TabRenderInit) {
  let tmpMii = new Mii(data.mii.export());
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
          data.mii.nickname,
          // set
          (name) => setProp("nickname", name.trim()),
          // validate
          (name) => {
            const nameBuffer = encodeUTF16LE(name);

            // Empty string check
            let nameStr = decodeUTF16LE(nameBuffer);
            if (nameStr.trim() === "") return "Name is empty";

            // Name length check
            if (nameBuffer.length >= 0x14) return "Name is too long";
            if (nameBuffer.length === 0) return "Name is too short";

            return true;
          },
          data.editor
        ),
        Input(
          "Creator",
          data.mii.creator,
          // set
          (creator) => setProp("creatorName", creator.trim()),
          // validate
          (name) => {
            const nameBuffer = encodeUTF16LE(name);

            // Empty string check
            let nameStr = decodeUTF16LE(nameBuffer);
            if (nameStr.trim() === "") return "Creator name is empty";

            // Name length check
            if (nameBuffer.length >= 0x14) return "Creator name is too long";

            return true;
          },
          data.editor
        )
      )
  );
}
