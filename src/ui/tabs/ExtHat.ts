import {
  FeatureSetType,
  MiiPagedFeatureSet,
  type FeatureSetIconItem
} from "../components/MiiPagedFeatureSet";
import type { TabRenderInit } from "../../constants/TabRenderType";
import { ArrayNum } from "../../util/Numbers";
import { RenderPart } from "../../class/MiiEditor";
import {
  MiiFavoriteColorLookupTable,
  SwitchMiiColorTable
} from "../../constants/ColorTables";
import { numToHex } from "../../util/NumberToHexString";
import {
  makeSeparatorFSI,
  makeSeparatorGapThinDesktop,
  makeSeparatorGapThinFSI,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";

export function ExtHatTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        hatType: {
          label: "Hat",
          header:
            "Hat type is a CUSTOM property, and will not transfer to any other data formats.",
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: true,
              value: -1,
              icon: '<span class="disable-item">Disabled</span>',
              part: RenderPart.Head
            },
            makeSeparatorGapThinFSI(),
            ...ArrayNum(10)
              .slice(1)
              .map((k) => ({
                type: FeatureSetType.Icon as any,
                forceRender: true,
                value: k - 1,
                icon: data.icons.hat[k - 1],
                part: RenderPart.Head
              }))
          ]
        },
        hatColor: {
          label: "Hat Color",
          header:
            "Hat color is a CUSTOM property, and will not transfer to any other data formats.",
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: true,
              value: -1,
              icon: '<span class="disable-item">Disabled</span>',
              part: RenderPart.Head,
              property: ["hatFavoriteColor", "hatCommonColor"],
              selectedCondition: () =>
                data.mii.hatCommonColor === -1 &&
                data.mii.hatFavoriteColor === -1
            },
            makeSeparatorGapThinFSI(),
            ...(ArrayNum(12).map((k) => ({
              type: FeatureSetType.Icon as any,
              forceRender: true,
              value: k,
              color: numToHex(MiiFavoriteColorLookupTable[k]),
              part: RenderPart.Head,
              property: "hatFavoriteColor",
              selectedCallback: (mii) => {
                mii.hatFavoriteColor = k;
                mii.hatCommonColor = -1;
              }
            })) as FeatureSetIconItem[]),
            makeSeparatorFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Head,
                property: "hatCommonColor",
                selectedCallback: (mii) => {
                  mii.hatFavoriteColor = -1;
                  mii.hatCommonColor = k;
                }
              })) as FeatureSetIconItem[],
              MiiSwitchColorTable,
              makeSeparatorGapThinDesktop
            )
          ]
        }
      }
    })
  );
}
