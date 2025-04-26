import type Mii from "../../../../external/mii-js/mii";
import { downloadLink } from "../../../../util/downloadLink";
import {
  getMiiRender,
  MiiCustomRenderType
} from "../../../../util/miiImageUtils";
import Modal from "../../../components/Modal";
import type { MiiLocalforage } from "../../Library";

export const miiRenderPresets = async (mii: MiiLocalforage, miiData: Mii) => {
  Modal.modal(
    `Render options: ${miiData.miiName}`,
    "Choose a way to render this Mii",
    "body",
    {
      text: "Focus on head",
      async callback() {
        const renderImage = await getMiiRender(
          miiData,
          MiiCustomRenderType.Head
        );
        downloadLink(
          renderImage.src,
          `${miiData.miiName}_render_headshot_${Date.now()}.png`
        );
      }
    },
    {
      text: "Focus on full body",
      async callback() {
        const renderImage = await getMiiRender(
          miiData,
          MiiCustomRenderType.Body
        );
        downloadLink(
          renderImage.src,
          `${miiData.miiName}_render_body_${Date.now()}.png`
        );
      }
    },
    {
      text: "Head only",
      async callback() {
        const renderImage = await getMiiRender(
          miiData,
          MiiCustomRenderType.HeadOnly
        );
        downloadLink(
          renderImage.src,
          `${miiData.miiName}_render_head_only_${Date.now()}.png`
        );
      }
    },
    {
      text: "Cancel"
    }
  );
};
