import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import EditorIcons from "../../constants/EditorIcons";
import {
  SwitchMiiColorTable,
  Ver3HairColorTable
} from "../../constants/ColorTables";
import type { TabRenderInit } from "../../constants/TabRenderType";
import { ArrayNum } from "../../util/Numbers";
import { RenderPart } from "../../class/MiiEditor";
import {
  makeSeparatorFSI,
  makeSeparatorGapThinDesktop,
  MiiHairTable,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";
import type Mii from "../../class/MiiData";

export function HairTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      // hacky workaround for color palette
      onChange: (newMii, forceRender, renderPart) => {
        data.callback(newMii, forceRender, renderPart);
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
            MiiHairTable,
            makeSeparatorGapThinDesktop
          )
        },
        hairColor: {
          label: EditorIcons.color,
          items: [
            ...ArrayNum(8).map((k) => ({
              type: FeatureSetType.Icon,
              value: Ver3HairColorTable[k],
              color: SwitchMiiColorTable[Ver3HairColorTable[k]],
              part: RenderPart.Head
            })),
            makeSeparatorFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Head
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
              property: "hairFlip",
              part: RenderPart.Head
            }
          ]
        }
      }
    })
  );
}
