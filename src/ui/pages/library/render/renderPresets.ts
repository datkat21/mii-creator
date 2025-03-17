import { WebGLRenderer } from "three";
import type Mii from "../../../../class/MiiData";
import { downloadLink, saveBlob } from "../../../../util/downloadLink";
import {
  createMiiRender,
  type RenderRequest
} from "../../../../util/IconRendering";

import Modal from "../../../components/Modal";
import type { MiiLocalforage } from "../../Library";
import { getFFL } from "../../../../util/FFLLoader";

import { _ } from "../../../../util/Lang";
import { ViewType } from "../../../../util/camera";
const __ = _();

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
      temporary: miiData.temporary,
      eyeSclera: miiData.eyeSclera
    }
  };
  Modal.modal(
    // Render options: Mii name
    __("Render options: %1", miiData.nickname),
    __("Choose a way to render this Mii"),
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
          // mii render (head) file name - e.g. 'Mii_render_headshot_2025-03-06T14:40:20.310Z.png'
          __("%1_render_headshot_%2.png", miiData.nickname, new Date().toJSON())
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
          // mii render (body) file name - e.g. 'Mii_render_body_2025-03-06T14:40:20.310Z.png'
          __("%1_render_body_%2.png", miiData.nickname, new Date().toJSON())
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
          // mii render (head only) file name - e.g. 'Mii_render_head_only_2025-03-06T14:40:20.310Z.png'
          __(
            "%1_render_head_only_%2.png",
            miiData.nickname,
            new Date().toJSON()
          )
        );
        renderer.dispose();
      }
    },
    {
      text: "Cancel"
    }
  );
};
