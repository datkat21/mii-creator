import {
  FeatureSetType,
  MiiPagedFeatureSet,
  type FeatureSetIconItem
} from "../components/MiiPagedFeatureSet";
import type { TabRenderInit } from "../../constants/TabRenderType";
import { ArrayNum } from "../../util/Numbers";
import { BodyUpdateType, RenderPart } from "../../class/MiiEditor";
import {
  ForbiddenShirtPantColors,
  MiiFavoriteColorLookupTable,
  SwitchMiiColorTable
} from "../../constants/ColorTables";
import { numToHex } from "../../util/NumberToHexString";
import {
  makeSeparatorFSI,
  makeSeparatorGapThinFSI,
  makeSeparatorGapThinLaptop,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";

import { _ } from "../../util/Lang";
const __ = _();

export function ExtClothesTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        clothesType: {
          label:
            // hat tab name
            __("Clothes"),
          header: __(
            "%1 is a CUSTOM property, and will not transfer to any other data formats.",
            // Hat type warning label
            __("Clothes type")
          ),
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: true,
              value: -1,
              icon: `<span class="disable-item">${__("Disabled")}</span>`,
              part: RenderPart.Head,
              bodyUpdateType: BodyUpdateType.ClothingUpdate
            },
            makeSeparatorGapThinFSI(),
            ...ArrayNum(10)
              .slice(1)
              .map((k) => ({
                type: FeatureSetType.Icon as any,
                forceRender: true,
                bodyUpdateType: BodyUpdateType.ClothingUpdate,
                value: k - 1,
                icon: k,
                part: RenderPart.Head
              }))
          ]
        },
        shirtColor: {
          label: __("Shirt Color"),
          header: __(
            "%1 is a CUSTOM property, and will not transfer to any other data formats.",
            // Shirt color warning label
            __("Shirt color")
          ),
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: true,
              value: -1,
              icon: `<span class="disable-item">${__("Disabled")}</span>`,
              part: RenderPart.Body,
              bodyUpdateType: BodyUpdateType.ClothingUpdate,
              property: "shirtColor",
              sound: "select_color"
            },
            makeSeparatorGapThinFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                forceRender: true,
                value: k,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Body,
                bodyUpdateType: BodyUpdateType.ClothingUpdate,
                property: "shirtColor"
              })),
              MiiSwitchColorTable,
              makeSeparatorGapThinLaptop
            ).filter((n) => !ForbiddenShirtPantColors.includes(n.value))
          ]
        },
        pantsColor: {
          label: __("Pants Color"),
          header: __(
            "%1 is a CUSTOM property, and will not transfer to any other data formats.",
            // Pants color warning label
            __("Pants color")
          ),
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: false,
              value: -1,
              icon: `<span class="disable-item">${__("Disabled")}</span>`,
              part: RenderPart.Body,
              bodyUpdateType: BodyUpdateType.ClothingUpdate,
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
                part: RenderPart.Body,
                bodyUpdateType: BodyUpdateType.ClothingUpdate,
                property: "pantsColor"
              })),
              MiiSwitchColorTable,
              makeSeparatorGapThinLaptop
            ).filter((n) => !ForbiddenShirtPantColors.includes(n.value))
          ]
        },
        shoesColor: {
          label: __("Shoes Color"),
          header: __(
            "%1 is a CUSTOM property, and will not transfer to any other data formats.",
            // Pants color warning label
            __("Shoes color")
          ),
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: false,
              value: -1,
              icon: `<span class="disable-item">${__("Disabled")}</span>`,
              part: RenderPart.Body,
              bodyUpdateType: BodyUpdateType.ClothingUpdate,
              property: "shoesColor",
              sound: "select_color"
            },
            makeSeparatorGapThinFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                forceRender: false,
                value: k,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Body,
                bodyUpdateType: BodyUpdateType.ClothingUpdate,
                property: "shoesColor"
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
