import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import { MiiFavoriteColorLookupTable } from "../../constants/ColorTables";
import { ArrayNum } from "../../util/Numbers";
import type { TabRenderInit } from "../../constants/TabRenderType";
import { numToHex } from "../../util/NumberToHexString";
import { RenderPart } from "../../class/MiiEditor";

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
        }
      }
    })
  );
}
