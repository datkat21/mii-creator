import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import EditorIcons from "../../constants/EditorIcons";
import {
  MiiSkinColorTable,
  MiiSwitchSkinColorList,
  SwitchMiiColorTable
} from "../../constants/ColorTables";
import type { TabRenderInit } from "../../constants/TabRenderType";
import { ArrayNum } from "../../util/Numbers";
import { RenderPart } from "../../class/MiiEditor";
import {
  makeSeparatorFSI,
  makeSeparatorGapThinDesktop,
  makeSeparatorGapThinFSI,
  MiiSwitchColorTable,
  MiiSwitchSkinColorTable,
  rearrangeArray
} from "../../constants/MiiFeatureTable";

export function HeadTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        facelineType: {
          label: data.useAccessibility ? "Shape" : EditorIcons.face,
          items: ArrayNum(12).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.face[k],
            part: RenderPart.Head
          }))
        },
        facelineMake: {
          label: data.useAccessibility ? "Makeup" : EditorIcons.face_makeup,
          items: ArrayNum(12).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.makeup[k],
            part: RenderPart.Head
          }))
        },
        facelineWrinkle: {
          label: data.useAccessibility ? "Wrinkles" : EditorIcons.face_wrinkles,
          items: ArrayNum(12).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.wrinkles[k],
            part: RenderPart.Head
          }))
        },
        facelineColor: {
          label: data.useAccessibility ? "Color" : EditorIcons.color,
          items: [
            ...ArrayNum(6).map((k) => ({
              type: FeatureSetType.Icon,
              value: k,
              color: MiiSkinColorTable[k],
              part: RenderPart.Head
            })),
            makeSeparatorFSI(),
            ...rearrangeArray(
              ArrayNum(10).map((k) => ({
                type: FeatureSetType.Icon,
                value: k,
                color: MiiSwitchSkinColorList[k],
                part: RenderPart.Head
              })),
              MiiSwitchSkinColorTable,
              makeSeparatorGapThinFSI
            )
          ]
        },
        facePaintColor: {
          label: data.useAccessibility ? "Face Paint" : EditorIcons.face_paint,
          header:
            "Face paint is a CUSTOM property, and will not transfer to any other data formats.",
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: true,
              value: -1,
              icon: '<span class="disable-item">Disabled</span>',
              part: RenderPart.Head
            },
            makeSeparatorGapThinFSI(),
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k,
                // icon: `<span style="display:flex;justify-content:center;align-items:center;position:relative;z-index:1;">${k}</span>`,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Head
              })),
              MiiSwitchColorTable,
              makeSeparatorGapThinDesktop
            )
          ]
        }
      }
    })
  );
}
