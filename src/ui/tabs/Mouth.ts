import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import { ArrayNum } from "../../util/Numbers";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import {
  MiiMouthColorTable,
  SwitchMiiColorTable,
  Ver3MouthColorTable
} from "../../constants/ColorTables";
import { RenderPart } from "../../class/MiiEditor";
import {
  makeSeparatorFSI,
  makeSeparatorGapThinDesktop,
  makeSeparatorGapThinLaptop,
  MiiMouthTable,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";

import { _ } from "../../util/Lang";
const __ = _();

export function MouthTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      // hacky workaround for color palette
      onChange: (newMii, forceRender, renderPart, updateType) => {
        data.callback(newMii, forceRender, renderPart, updateType);
      },
      entries: {
        mouthType: {
          label: __("Type"),
          items: rearrangeArray(
            ArrayNum(36).map((k) => ({
              type: FeatureSetType.Icon,
              value: k,
              icon: data.icons.mouth[k],
              part: RenderPart.Face
            })),
            MiiMouthTable,
            makeSeparatorGapThinDesktop
          )
        },
        mouthColor: {
          label: data.useAccessibility ? __("Color") : EditorIcons.color,
          items: [
            ...ArrayNum(5).map((k) => ({
              type: FeatureSetType.Icon,
              value: Ver3MouthColorTable[k],
              color: SwitchMiiColorTable[Ver3MouthColorTable[k]],
              part: RenderPart.Face,
              property: "mouthColor"
            })),
            makeSeparatorFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Face,
                property: "mouthColor"
              })),
              MiiSwitchColorTable,
              makeSeparatorGapThinLaptop
            )
          ]
        },
        mouthPosition: {
          label: __("Position"),
          items: [
            {
              type: FeatureSetType.Range,
              property: "mouthY",
              iconStart: EditorIcons.positionMoveUp,
              iconEnd: EditorIcons.positionMoveDown,
              soundStart: "position_down",
              soundEnd: "position_up",
              min: 0,
              max: 18,
              part: RenderPart.Face,
              inverse: true,
              label: data.useAccessibility ? __("Position") : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "mouthScale",
              iconStart: EditorIcons.positionSizeDown,
              iconEnd: EditorIcons.positionSizeUp,
              soundStart: "scale_down",
              soundEnd: "scale_up",
              min: 0,
              max: 8,
              part: RenderPart.Face,
              label: data.useAccessibility ? __("Scale") : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "mouthAspect",
              iconStart: EditorIcons.positionStretchIn,
              iconEnd: EditorIcons.positionStretchOut,
              soundStart: "vert_stretch_down",
              soundEnd: "vert_stretch_up",
              min: 0,
              max: 6,
              part: RenderPart.Face,
              label: data.useAccessibility ? __("Stretch") : undefined
            }
          ]
        }
      }
    })
  );
}
