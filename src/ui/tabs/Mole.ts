import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import { RenderPart } from "../../class/MiiEditor";

import { _ } from "../../util/Lang";
const __ = _();

export function MoleTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        mole: {
          label: __("Mole"),
          items: [
            {
              type: FeatureSetType.Switch,
              iconOff: __("Disable"),
              iconOn: __("Enable"),
              property: "moleType",
              part: RenderPart.Face,
              isNumber: true
            },
            {
              type: FeatureSetType.Range,
              property: "moleY",
              iconStart: EditorIcons.positionMoveUp,
              iconEnd: EditorIcons.positionMoveDown,
              soundStart: "position_down",
              soundEnd: "position_up",
              min: 0,
              max: 30,
              part: RenderPart.Face,
              inverse: true,
              label: data.useAccessibility ? __("Position") : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "moleX",
              iconStart: EditorIcons.positionPushIn,
              iconEnd: EditorIcons.positionPushOut,
              soundStart: "move_together",
              soundEnd: "move_apart",
              min: 0,
              max: 16,
              part: RenderPart.Face,

              label: data.useAccessibility ? __("Spacing") : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "moleScale",
              iconStart: EditorIcons.positionSizeDown,
              iconEnd: EditorIcons.positionSizeUp,
              soundStart: "scale_down",
              soundEnd: "scale_up",
              min: 0,
              max: 7,
              part: RenderPart.Face,
              label: data.useAccessibility ? __("Scale") : undefined
            }
          ]
        }
      }
    })
  );
}
