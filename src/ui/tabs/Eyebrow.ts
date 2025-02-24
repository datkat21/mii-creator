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
  makeSeparatorGapThinDesktop,
  makeSeparatorGapThinLaptop,
  MiiEyebrowTable,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";

export function EyebrowTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        eyebrowType: {
          label: "Type",
          items: rearrangeArray(
            ArrayNum(24).map((k) => ({
              type: FeatureSetType.Icon,
              value: k,
              icon: data.icons.eyebrows[k],
              part: RenderPart.Face
            })),
            MiiEyebrowTable,
            makeSeparatorGapThinDesktop
          )
        },
        eyebrowColor: {
          label: data.useAccessibility ? "Color" : EditorIcons.color,
          items: [
            ...ArrayNum(8).map((k) => ({
              type: FeatureSetType.Icon,
              value: Ver3HairColorTable[k],
              color: SwitchMiiColorTable[Ver3HairColorTable[k]],
              part: RenderPart.Face
            })),
            makeSeparatorFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Face
              })),
              MiiSwitchColorTable,
              makeSeparatorGapThinLaptop
            )
          ]
        },
        eyebrowPosition: {
          label: "Position",
          items: [
            {
              type: FeatureSetType.Range,
              property: "eyebrowY",
              iconStart: EditorIcons.positionMoveUp,
              iconEnd: EditorIcons.positionMoveDown,
              soundStart: "position_down",
              soundEnd: "position_up",
              min: 3,
              max: 18,
              part: RenderPart.Face,
              inverse: true,
              label: data.useAccessibility ? "Position" : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "eyebrowX",
              iconStart: EditorIcons.positionPushIn,
              iconEnd: EditorIcons.positionPushOut,
              soundStart: "move_together",
              soundEnd: "move_apart",
              min: 0,
              max: 12,
              part: RenderPart.Face,
              label: data.useAccessibility ? "Spacing" : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "eyebrowRotate",
              iconStart: EditorIcons.positionRotateCW,
              iconEnd: EditorIcons.positionRotateCCW,
              soundStart: "rotate_cw",
              soundEnd: "rotate_ccw",
              min: 0,
              max: 11,
              part: RenderPart.Face,
              inverse: true,
              label: data.useAccessibility ? "Rotation" : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "eyebrowScale",
              iconStart: EditorIcons.positionSizeDown,
              iconEnd: EditorIcons.positionSizeUp,
              soundStart: "scale_down",
              soundEnd: "scale_up",
              min: 0,
              max: 8,
              part: RenderPart.Face,
              label: data.useAccessibility ? "Scale" : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "eyebrowAspect",
              iconStart: EditorIcons.positionStretchIn,
              iconEnd: EditorIcons.positionStretchOut,
              soundStart: "vert_stretch_down",
              soundEnd: "vert_stretch_up",
              min: 0,
              max: 6,
              part: RenderPart.Face,
              label: data.useAccessibility ? "Stretch" : undefined
            }
          ]
        }
      }
    })
  );
}
