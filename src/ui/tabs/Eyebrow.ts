import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import {
  MiiHairColorTable,
  SwitchMiiColorTable
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
import type Mii from "../../external/mii-js/mii";

export function EyebrowTab(data: TabRenderInit) {
  let mii: Mii = data.mii;
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      // hacky workaround for color palette
      onChange: (newMii, forceRender, renderPart) => {
        data.callback(newMii, forceRender, renderPart);
        mii = newMii;
      },
      entries: {
        eyebrowType: {
          label: "Type",
          items: ArrayNum(24).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.eyebrows[k],
            part: RenderPart.Face
          }))
        },
        eyebrowColor: {
          label: EditorIcons.color,
          validationProperty: "trueEyebrowColor",
          // EXTREMELY HACKY but works..
          validationFunction() {
            if (mii.trueEyebrowColor > 7) {
              return mii.trueEyebrowColor + 8;
            } else return mii.trueEyebrowColor;
          },
          items: [
            ...ArrayNum(8).map((k) => ({
              type: FeatureSetType.Icon,
              value: k,
              color: MiiHairColorTable[k],
              part: RenderPart.Face,
              property: "fflEyebrowColor"
            })),
            makeSeparatorFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k + 8,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Face,
                property: "extEyebrowColor"
              })),
              MiiSwitchColorTable
            )
          ]
        },
        eyebrowPosition: {
          label: "Position",
          items: [
            {
              type: FeatureSetType.Range,
              property: "eyebrowYPosition",
              iconStart: EditorIcons.positionMoveUp,
              iconEnd: EditorIcons.positionMoveDown,
              soundStart: "position_down",
              soundEnd: "position_up",
              min: 3,
              max: 18,
              part: RenderPart.Face,
              inverse: true
            },
            {
              type: FeatureSetType.Range,
              property: "eyebrowSpacing",
              iconStart: EditorIcons.positionPushIn,
              iconEnd: EditorIcons.positionPushOut,
              soundStart: "move_together",
              soundEnd: "move_apart",
              min: 0,
              max: 12,
              part: RenderPart.Face
            },
            {
              type: FeatureSetType.Range,
              property: "eyebrowRotation",
              iconStart: EditorIcons.positionRotateCW,
              iconEnd: EditorIcons.positionRotateCCW,
              soundStart: "rotate_cw",
              soundEnd: "rotate_ccw",
              min: 0,
              max: 11,
              part: RenderPart.Face,
              inverse: true
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
              part: RenderPart.Face
            },
            {
              type: FeatureSetType.Range,
              property: "eyebrowVerticalStretch",
              iconStart: EditorIcons.positionStretchIn,
              iconEnd: EditorIcons.positionStretchOut,
              soundStart: "vert_stretch_down",
              soundEnd: "vert_stretch_up",
              min: 0,
              max: 6,
              part: RenderPart.Face
            }
          ]
        }
      }
    })
  );
}
