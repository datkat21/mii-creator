import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import { ArrayNum } from "../../util/Numbers";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import {
  MiiMouthColorTable,
  SwitchMiiColorTable
} from "../../constants/ColorTables";
import { RenderPart } from "../../class/MiiEditor";
import {
  makeSeparatorFSI,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";
import type Mii from "../../external/mii-js/mii";

export function MouthTab(data: TabRenderInit) {
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
        mouthType: {
          label: "Type",
          items: ArrayNum(36).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.mouth[k],
            part: RenderPart.Face
          }))
        },
        mouthColor: {
          label: EditorIcons.color,
          validationProperty: "trueMouthColor",
          // EXTREMELY HACKY but works..
          validationFunction() {
            if (mii.trueMouthColor > 4) {
              return mii.trueMouthColor + 5;
            } else return mii.trueMouthColor;
          },
          items: [
            ...ArrayNum(5).map((k) => ({
              type: FeatureSetType.Icon,
              value: k,
              color: MiiMouthColorTable[k],
              part: RenderPart.Face,
              property: "fflMouthColor"
            })),
            makeSeparatorFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k + 5,
                color: SwitchMiiColorTable[k],
                // icon: `<span style="display:flex;justify-content:center;align-items:center;position:relative;z-index:1;">${k}</span>`,
                part: RenderPart.Face,
                property: "extMouthColor"
              })),
              MiiSwitchColorTable
            )
          ]
        },
        mouthPosition: {
          label: "Position",
          items: [
            {
              type: FeatureSetType.Range,
              property: "mouthYPosition",
              iconStart: EditorIcons.positionMoveUp,
              iconEnd: EditorIcons.positionMoveDown,
              soundStart: "position_down",
              soundEnd: "position_up",
              min: 0,
              max: 18,
              part: RenderPart.Face,
              inverse: true
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
              part: RenderPart.Face
            },
            {
              type: FeatureSetType.Range,
              property: "mouthHorizontalStretch",
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
