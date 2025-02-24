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
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";

export function GlassesTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      // hacky workaround for color palette
      onChange: (newMii, forceRender, renderPart) => {
        data.callback(newMii, forceRender, renderPart);
      },
      entries: {
        glassType: {
          label: "Type",
          items: ArrayNum(20).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.glasses[k],
            part: RenderPart.Head
          }))
        },
        glassesColor: {
          label: data.useAccessibility ? "Color" : EditorIcons.color,
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
              MiiSwitchColorTable
            )
          ]
        },
        glassesPosition: {
          label: "Position",
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
              label: data.useAccessibility ? "Position" : undefined
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
              label: data.useAccessibility ? "Scale" : undefined
            }
          ]
        }
      }
    })
  );
}
