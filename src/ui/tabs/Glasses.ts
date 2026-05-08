import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import {
  MiiGlassesColorTable,
  SwitchMiiColorTable,
  Ver3GlassColorTable
} from "../../constants/ColorTables";
import { ArrayNum } from "../../util/Numbers";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import { RenderPart } from "../../class/MiiEditor";
import {
  makeSeparatorFSI,
  makeSeparatorGapThinLaptop,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";

import { _ } from "../../util/Lang";
const __ = _();

export function GlassesTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      // hacky workaround for color palette
      onChange: (newMii, forceRender, renderPart, updateType) => {
        data.callback(newMii, forceRender, renderPart, updateType);
      },
      entries: {
        glassType: {
          label: __("Type"),
          items: ArrayNum(20).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.glasses[k],
            part: RenderPart.Head
          }))
        },
        glassesColor: {
          label: data.useAccessibility ? __("Color") : EditorIcons.color,
          items: [
            ...ArrayNum(6).map((k) => ({
              type: FeatureSetType.Icon,
              value: Ver3GlassColorTable[k],
              color: SwitchMiiColorTable[Ver3GlassColorTable[k]],
              part: RenderPart.Head,
              property: "glassColor"
            })),
            makeSeparatorFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Head,
                property: "glassColor"
              })),
              MiiSwitchColorTable,
              makeSeparatorGapThinLaptop
            )
          ]
        },
        glassesPosition: {
          label: __("Position"),
          items: [
            {
              type: FeatureSetType.Range,
              property: "glassY",
              iconStart: EditorIcons.positionMoveUp,
              iconEnd: EditorIcons.positionMoveDown,
              soundStart: "position_down",
              soundEnd: "position_up",
              min: 0,
              max: 20,
              part: RenderPart.Head,
              inverse: true,
              label: data.useAccessibility ? __("Position") : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "glassScale",
              iconStart: EditorIcons.positionSizeDown,
              iconEnd: EditorIcons.positionSizeUp,
              soundStart: "scale_down",
              soundEnd: "scale_up",
              min: 0,
              max: 7,
              part: RenderPart.Head,
              label: data.useAccessibility ? __("Scale") : undefined
            }
          ]
        }
      }
    })
  );
}
