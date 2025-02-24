import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import {
  MiiHairColorTable,
  SwitchMiiColorTable,
  Ver3HairColorTable
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

export function FacialHairTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        mustacheType: {
          label: "Mustache",
          items: ArrayNum(6).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.mustache[k],
            part: RenderPart.Face
          }))
        },
        mustachePosition: {
          label: "Position",
          items: [
            {
              type: FeatureSetType.Range,
              property: "mustacheY",
              iconStart: EditorIcons.positionMoveUp,
              iconEnd: EditorIcons.positionMoveDown,
              soundStart: "position_down",
              soundEnd: "position_up",
              min: 0,
              max: 16,
              part: RenderPart.Face,
              inverse: true,
              label: data.useAccessibility ? "Position" : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "mustacheScale",
              iconStart: EditorIcons.positionSizeDown,
              iconEnd: EditorIcons.positionSizeUp,
              soundStart: "scale_down",
              soundEnd: "scale_up",
              min: 0,
              max: 8,
              part: RenderPart.Face,
              label: data.useAccessibility ? "Scale" : undefined
            }
          ]
        },
        beardType: {
          label: "Goatee",
          items: ArrayNum(6).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.goatee[k],
            part: RenderPart.Head
          }))
        },
        beardColor: {
          label: data.useAccessibility ? "Color" : EditorIcons.color,
          items: [
            ...ArrayNum(8).map((k) => ({
              type: FeatureSetType.Icon,
              value: Ver3HairColorTable[k],
              color: SwitchMiiColorTable[Ver3HairColorTable[k]],
              part: RenderPart.Head,
              property: "beardColor"
            })),
            makeSeparatorFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Head,
                property: "beardColor"
              })),
              MiiSwitchColorTable,
              makeSeparatorGapThinLaptop
            )
          ]
        }
      }
    })
  );
}
