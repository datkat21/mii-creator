import { WebGLRenderer } from "three";
import type Mii from "../../../../class/MiiData";
import { downloadLink, saveBlob } from "../../../../util/downloadLink";
import {
  createMiiRender,
  type RenderRequest
} from "../../../../util/IconRendering";

import Modal from "../../../components/Modal";
import type { MiiLocalforage } from "../../Library";
import { ViewType } from "../../../../external/ffl.js/ffl";
import { getFFL } from "../../../../util/FFLLoader";

export const miiRenderPresets = async (mii: MiiLocalforage, miiData: Mii) => {
  const renderer = new WebGLRenderer({ alpha: true });
  const miiRenderInfo: Omit<RenderRequest, "type" | "drawBody"> = {
    data: miiData.export("studioData"),
    module: getFFL(),
    renderer,
    characterYRotate: 0,
    expression: 0,
    modelFlag: 0,
    size: 1440,
    additionalInfo: {
      favorite: miiData.favorite,
      hatCommonColor: miiData.hatCommonColor,
      hatFavoriteColor: miiData.hatFavoriteColor,
      hatType: miiData.hatType,
      pantsColor: miiData.pantsColor,
      shirtColor: miiData.shirtColor,
      special: miiData.special,
      temporary: miiData.temporary
    }
  };
  Modal.modal(
    `Render options: ${miiData.nickname}`,
    "Choose a way to render this Mii",
    "body",
    {
      text: "Focus on head",
      async callback() {
        const renderImage = await createMiiRender({
          ...miiRenderInfo,
          type: ViewType.Face,
          drawBody: true
        });
        saveBlob(
          renderImage.result as Blob,
          `${miiData.nickname}_render_headshot_${Date.now()}.png`
        );
        renderer.dispose();
      }
    },
    {
      text: "Focus on full body",
      async callback() {
        const renderImage = await createMiiRender({
          ...miiRenderInfo,
          type: ViewType.AllBodySugar,
          drawBody: true
        });
        saveBlob(
          renderImage.result as Blob,
          `${miiData.nickname}_render_body_${Date.now()}.png`
        );
        renderer.dispose();
      }
    },
    {
      text: "Head only",
      async callback() {
        const renderImage = await createMiiRender({
          ...miiRenderInfo,
          type: ViewType.MakeIcon,
          drawBody: false
        });
        saveBlob(
          renderImage.result as Blob,
          `${miiData.nickname}_render_head_only_${Date.now()}.png`
        );
        renderer.dispose();
      }
    },
    {
      text: "Cancel"
    }
  );
};
