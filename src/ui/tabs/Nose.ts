import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import { ArrayNum } from "../../util/Numbers";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import { RenderPart } from "../../class/MiiEditor";

export function NoseTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        noseType: {
          label: "Type",
          items: ArrayNum(18).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.nose[k],
            part: RenderPart.Head
          }))
        },
        nosePosition: {
          label: "Position",
          items: [
            {
              type: FeatureSetType.Range,
              property: "noseYPosition",
              iconStart: EditorIcons.positionMoveUp,
              iconEnd: EditorIcons.positionMoveDown,
              soundStart: "position_down",
              soundEnd: "position_up",
              min: 0,
              max: 18,
              part: RenderPart.Head,
              inverse: true
            },
            {
              type: FeatureSetType.Range,
              property: "noseScale",
              iconStart: EditorIcons.positionSizeDown,
              iconEnd: EditorIcons.positionSizeUp,
              soundStart: "scale_down",
              soundEnd: "scale_up",
              min: 0,
              max: 8,
              part: RenderPart.Head
            }
          ]
        }
      }
    })
  );
}
