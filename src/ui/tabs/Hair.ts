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
  makeSeparatorGapThinLaptop,
  MiiHairTable,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";

import { _ } from "../../util/Lang";
const __ = _();

export function HairTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      // hacky workaround for color palette
      onChange: (newMii, forceRender, renderPart, updateType) => {
        data.callback(newMii, forceRender, renderPart, updateType);
      },
      entries: {
        hairType: {
          label: __("Type"),
          items: rearrangeArray(
            ArrayNum(132).map((k) => ({
              type: FeatureSetType.Icon,
              value: k,
              icon: data.icons.hair[k],
              part: RenderPart.Head
            })),
            MiiHairTable,
            makeSeparatorGapThinDesktop
          )
        },
        hairColor: {
          label: data.useAccessibility ? __("Color") : EditorIcons.color,
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
              MiiSwitchColorTable,
              makeSeparatorGapThinLaptop
            )
          ]
        },
        hairPosition: {
          label: __("Hair Flip"),
          items: [
            {
              type: FeatureSetType.Switch,
              iconOff: data.useAccessibility
                ? __("Unflipped")
                : EditorIcons.positionHairFlip,
              iconOn: data.useAccessibility
                ? __("Flipped")
                : EditorIcons.positionHairFlipped,
              property: "hairFlip",
              part: RenderPart.Head
            }
          ]
        }
      }
    })
  );
}
