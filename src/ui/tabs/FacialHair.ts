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

export function FacialHairTab(data: TabRenderInit) {
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
              property: "mustacheYPosition",
              iconStart: EditorIcons.positionMoveUp,
              iconEnd: EditorIcons.positionMoveDown,
              soundStart: "position_down",
              soundEnd: "position_up",
              min: 0,
              max: 16,
              part: RenderPart.Face,
              inverse: true
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
              part: RenderPart.Face
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
        facialHairColor: {
          label: EditorIcons.color,
          validationProperty: "trueFacialHairColor",
          // EXTREMELY HACKY but works..
          validationFunction() {
            if (mii.trueFacialHairColor > 7) {
              return mii.trueFacialHairColor + 8;
            } else return mii.trueFacialHairColor;
          },
          items: [
            ...ArrayNum(8).map((k) => ({
              type: FeatureSetType.Icon,
              value: k,
              color: MiiHairColorTable[k],
              part: RenderPart.Head,
              property: "fflHairColor"
            })),
            makeSeparatorFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k + 8,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Head,
                property: "extHairColor"
              })),
              MiiSwitchColorTable
            )
          ]
        }
      }
    })
  );
}
