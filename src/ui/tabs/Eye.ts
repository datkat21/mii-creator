import {
  FeatureSetType,
  MiiPagedFeatureSet,
  type FeatureSetIconItem
} from "../components/MiiPagedFeatureSet";
import {
  SwitchMiiColorTable,
  Ver3EyeColorTable
} from "../../constants/ColorTables";
import { ArrayNum } from "../../util/Numbers";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import { RenderPart } from "../../class/MiiEditor";
import {
  makeSeparatorFSI,
  makeSeparatorGapThinDesktop,
  makeSeparatorGapThinLaptop,
  MiiEyeTable,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";

import { _ } from "../../util/Lang";
const __ = _();

export function EyeTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        eyeType: {
          label: __("Type"),
          items: rearrangeArray(
            ArrayNum(60).map((k) => ({
              type: FeatureSetType.Icon,
              value: k,
              icon: data.icons.eyes[k],
              part: RenderPart.Face
            })),
            MiiEyeTable,
            makeSeparatorGapThinDesktop
          )
        },
        eyeColor: {
          label: data.useAccessibility ? __("Color") : EditorIcons.color,
          items: [
            ...ArrayNum(6).map(
              (k) =>
                ({
                  type: FeatureSetType.Icon,
                  value: Ver3EyeColorTable[k],
                  color: SwitchMiiColorTable[Ver3EyeColorTable[k]],
                  part: RenderPart.Face
                }) as FeatureSetIconItem
            ),
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
        eyeSclera: {
          label: __("Sclera"),
          items: [
            {
              type: FeatureSetType.Switch,
              part: RenderPart.Face,
              iconOff: __("Disabled"),
              iconOn: __("Enabled"),
              property: "eyeSclera",
              isNumber: true
            }
          ],
          header: __(
            "%1 is a CUSTOM property, and will not transfer to any other data formats.",
            // Hat type warning label
            __("Sclera fill")
          )
        },
        eyePosition: {
          label: __("Position"),
          items: [
            {
              type: FeatureSetType.Range,
              property: "eyeY",
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
              property: "eyeX",
              iconStart: EditorIcons.positionPushIn,
              iconEnd: EditorIcons.positionPushOut,
              soundStart: "move_together",
              soundEnd: "move_apart",
              min: 0,
              max: 12,
              part: RenderPart.Face,
              label: data.useAccessibility ? __("Spacing") : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "eyeRotate",
              iconStart: EditorIcons.positionRotateCW,
              iconEnd: EditorIcons.positionRotateCCW,
              soundStart: "rotate_cw",
              soundEnd: "rotate_ccw",
              min: 0,
              max: 7,
              part: RenderPart.Face,
              label: data.useAccessibility ? __("Rotation") : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "eyeScale",
              iconStart: EditorIcons.positionSizeDown,
              iconEnd: EditorIcons.positionSizeUp,
              soundStart: "scale_down",
              soundEnd: "scale_up",
              min: 0,
              max: 7,
              part: RenderPart.Face,
              label: data.useAccessibility ? __("Scale") : undefined
            },
            {
              type: FeatureSetType.Range,
              property: "eyeAspect",
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
