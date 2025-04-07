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
  makeSeparatorGapThinFSI,
  makeSeparatorGapThinLaptop,
  MiiSwitchColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";

import { _ } from "../../util/Lang";
const __ = _();

export function ExtHatTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        hatType: {
          label:
            // hat tab name
            __("Hat"),
          header: __(
            "%1 is a CUSTOM property, and will not transfer to any other data formats.",
            // Hat type warning label
            __("Hat type")
          ),
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: true,
              value: -1,
              icon: `<span class="disable-item">${__("Disabled")}</span>`,
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
          // hat color tab name
          label: __("Hat Color"),
          header: __(
            "%1 is a CUSTOM property, and will not transfer to any other data formats.",
            // Hat color warning label
            __("Hat color")
          ),
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: true,
              value: -1,
              icon: `<span class="disable-item">${__("Disabled")}</span>`,
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
              preSelectCallback: (mii) => {
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
                preSelectCallback: (mii) => {
                  mii.hatFavoriteColor = -1;
                  mii.hatCommonColor = k;
                }
              })) as FeatureSetIconItem[],
              MiiSwitchColorTable,
              makeSeparatorGapThinLaptop
            )
          ]
        }
      }
    })
  );
}
