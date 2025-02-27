import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import {
  ForbiddenShirtPantColors,
  MiiFavoriteColorLookupTable,
  SwitchMiiColorTable
} from "../../constants/ColorTables";
import { ArrayNum } from "../../util/Numbers";
import type { TabRenderInit } from "../../constants/TabRenderType";
import { numToHex } from "../../util/NumberToHexString";
import { RenderPart } from "../../class/MiiEditor";
import {
  makeSeparatorGapThinFSI,
  makeSeparatorGapThinLaptop,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";

export function FavoriteColorTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        favoriteColor: {
          label: "Favorite Color",
          items: ArrayNum(12).map((k) => ({
            type: FeatureSetType.Icon,
            forceRender: true,
            value: k,
            color: numToHex(MiiFavoriteColorLookupTable[k]),
            part: RenderPart.Head
          }))
        },
        shirtColor: {
          label: "Shirt Color",
          header:
            "Shirt color is a CUSTOM property, and will not transfer to any other data formats.",
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: false,
              value: -1,
              icon: '<span class="disable-item">Disabled</span>',
              part: RenderPart.Face,
              property: "shirtColor",
              sound: "select_color"
            },
            makeSeparatorGapThinFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                forceRender: false,
                value: k,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Face,
                property: "shirtColor"
              })),
              MiiSwitchColorTable,
              makeSeparatorGapThinLaptop
            ).filter((n) => !ForbiddenShirtPantColors.includes(n.value))
          ]
        },
        pantsColor: {
          label: "Pants Color",
          header:
            "Pants color is a CUSTOM property, and will not transfer to any other data formats.",
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: false,
              value: -1,
              icon: '<span class="disable-item">Disabled</span>',
              part: RenderPart.Face,
              property: "pantsColor",
              sound: "select_color"
            },
            makeSeparatorGapThinFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                forceRender: false,
                value: k,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Face,
                property: "pantsColor"
              })),
              MiiSwitchColorTable,
              makeSeparatorGapThinLaptop
            ).filter((n) => !ForbiddenShirtPantColors.includes(n.value))
          ]
        }
      }
    })
  );
}
