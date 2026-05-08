import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import { BodyUpdateType, RenderPart } from "../../class/MiiEditor";

import { _ } from "../../util/Lang";
const __ = _();

export function ScaleTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        bodySize: {
          label: __("Scale"),
          items: [
            {
              type: FeatureSetType.Slider,
              property: "height",
              iconStart: EditorIcons.scaleShort,
              iconEnd: EditorIcons.scaleTall,
              min: 0,
              max: 127,
              forceRender: false,
              part: RenderPart.Body,
              bodyUpdateType: BodyUpdateType.RepositionCamera,
              soundStart: "vert_stretch_down",
              soundEnd: "vert_stretch_up",
              label: data.useAccessibility ? __("Height") : undefined
            },
            {
              type: FeatureSetType.Slider,
              property: "build",
              iconStart: EditorIcons.scaleThin,
              iconEnd: EditorIcons.scaleFat,
              min: 0,
              max: 127,
              forceRender: false,
              part: RenderPart.Body,
              bodyUpdateType: BodyUpdateType.RepositionCamera,
              soundStart: "vert_stretch_down",
              soundEnd: "vert_stretch_up",
              label: data.useAccessibility ? __("Build") : undefined
            }
          ]
        }
      }
    })
  );
}
