import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import {
  MiiGlassesColorTable,
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

export function GlassesTab(data: TabRenderInit) {
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
        glassesType: {
          label: "Type",
          items: ArrayNum(20).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.glasses[k],
            part: RenderPart.Head
          }))
        },
        glassesColor: {
          label: EditorIcons.color,
          validationProperty: "trueGlassesColor",
          // EXTREMELY HACKY but works..
          validationFunction() {
            if (mii.trueGlassesColor > 5) {
              return mii.trueGlassesColor + 6;
            } else return mii.trueGlassesColor;
          },
          items: [
            ...ArrayNum(6).map((k) => ({
              type: FeatureSetType.Icon,
              value: k,
              color: MiiGlassesColorTable[k],
              part: RenderPart.Head,
              property: "fflGlassesColor"
            })),
            makeSeparatorFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k + 6,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Head,
                property: "extGlassColor"
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
              property: "glassesYPosition",
              iconStart: EditorIcons.positionMoveUp,
              iconEnd: EditorIcons.positionMoveDown,
              soundStart: "position_down",
              soundEnd: "position_up",
              min: 0,
              max: 20,
              part: RenderPart.Head,
              inverse: true
            },
            {
              type: FeatureSetType.Range,
              property: "glassesScale",
              iconStart: EditorIcons.positionSizeDown,
              iconEnd: EditorIcons.positionSizeUp,
              soundStart: "scale_down",
              soundEnd: "scale_up",
              min: 0,
              max: 7,
              part: RenderPart.Head
            }
          ]
        }
      }
    })
  );
}
