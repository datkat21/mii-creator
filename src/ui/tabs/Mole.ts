import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import { RenderPart } from "../../class/MiiEditor";

export function MoleTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        eyePosition: {
          label: "Position",
          items: [
            {
              type: FeatureSetType.Switch,
              iconOff: "Disable",
              iconOn: "Enable",
              property: "moleEnabled",
              part: RenderPart.Face
            },
            {
              type: FeatureSetType.Range,
              property: "moleYPosition",
              iconStart: EditorIcons.positionMoveUp,
              iconEnd: EditorIcons.positionMoveDown,
              soundStart: "position_down",
              soundEnd: "position_up",
              min: 0,
              max: 30,
              part: RenderPart.Face,
              inverse: true
            },
            {
              type: FeatureSetType.Range,
              property: "moleXPosition",
              iconStart: EditorIcons.positionPushIn,
              iconEnd: EditorIcons.positionPushOut,
              soundStart: "move_together",
              soundEnd: "move_apart",
              min: 0,
              max: 16,
              part: RenderPart.Face
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
              part: RenderPart.Face
            }
          ]
        }
      }
    })
  );
}
