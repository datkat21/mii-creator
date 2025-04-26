import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import EditorIcons from "../../constants/EditorIcons";
import { SwitchMiiColorTable } from "../../constants/ColorTables";
import type { TabRenderInit } from "../../constants/TabRenderType";
import { ArrayNum } from "../../util/Numbers";
import { RenderPart } from "../../class/MiiEditor";
import {
  makeSeparatorFSI,
  MiiHairTable,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";
import type Mii from "../../external/mii-js/mii";

export function HairTab(data: TabRenderInit) {
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
        hairType: {
          label: "Type",
          items: rearrangeArray(
            ArrayNum(132).map((k) => ({
              type: FeatureSetType.Icon,
              value: k,
              icon: data.icons.hair[k], // `<img src="./assets/images/hair/${k}.png" width="84" height="84" />`,
              part: RenderPart.Head
            })),
            MiiHairTable
          )
        },
        hairColor: {
          label: EditorIcons.color,
          validationProperty: "trueHairColor",
          // EXTREMELY HACKY but works..
          validationFunction() {
            if (mii.trueHairColor > 7) {
              return mii.trueHairColor + 8;
            } else return mii.trueHairColor;
          },
          items: [
            ...ArrayNum(8).map((k) => ({
              type: FeatureSetType.Icon,
              value: k,
              color: SwitchMiiColorTable[k],
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
        },
        hairPosition: {
          label: "Position",
          items: [
            {
              type: FeatureSetType.Switch,
              iconOff: EditorIcons.positionHairFlip,
              iconOn: EditorIcons.positionHairFlipped,
              property: "flipHair",
              part: RenderPart.Head
            }
          ]
        }
      }
    })
  );
}
