import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import { RenderPart } from "../../class/MiiEditor";

export function ScaleTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        bodySize: {
          label: "Scale",
          items: [
            {
              type: FeatureSetType.Slider,
              property: "height",
              iconStart: EditorIcons.scaleShort,
              iconEnd: EditorIcons.scaleTall,
              min: 0,
              max: 127,
              forceRender: false,
              part: RenderPart.Face,
              soundStart: "vert_stretch_down",
              soundEnd: "vert_stretch_up",
              label: data.useAccessibility ? "Height" : undefined
            },
            {
              type: FeatureSetType.Slider,
              property: "build",
              iconStart: EditorIcons.scaleThin,
              iconEnd: EditorIcons.scaleFat,
              min: 0,
              max: 127,
              forceRender: false,
              part: RenderPart.Face,
              soundStart: "vert_stretch_down",
              soundEnd: "vert_stretch_up",
              label: data.useAccessibility ? "Build" : undefined
            }
          ]
        }
      }
    })
  );
}
