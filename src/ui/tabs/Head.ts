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
        faceType: {
          label: EditorIcons.face,
          items: ArrayNum(12).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.face[k],
            part: RenderPart.Head
          }))
        },
        makeupType: {
          label: EditorIcons.face_makeup,
          items: ArrayNum(12).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.makeup[k],
            part: RenderPart.Head
          }))
        },
        wrinklesType: {
          label: EditorIcons.face_wrinkles,
          items: ArrayNum(12).map((k) => ({
            type: FeatureSetType.Icon,
            value: k,
            icon: data.icons.wrinkles[k],
            part: RenderPart.Head
          }))
        },
        skinColor: {
          label: EditorIcons.color,
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
              MiiSwitchSkinColorTable
            ).slice(0, 5),
            makeSeparatorGapThinFSI(),
            ...rearrangeArray(
              ArrayNum(10).map((k) => ({
                type: FeatureSetType.Icon,
                value: k,
                color: MiiSwitchSkinColorList[k],
                part: RenderPart.Head
              })),
              MiiSwitchSkinColorTable
            ).slice(5)
          ]
        },
        extFacePaintColor: {
          label: EditorIcons.face_paint,
          header:
            "Face paint is a CUSTOM property, and will not transfer to any other data formats.",
          items: [
            {
              type: FeatureSetType.Icon,
              forceRender: true,
              value: 0,
              icon: '<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">\n<g id="eyebrows-24">\n<path id="Vector" d="M25.9999 42.0501C34.8862 42.0501 42.0899 34.8464 42.0899 25.9601C42.0899 17.0739 34.8862 9.87012 25.9999 9.87012C17.1137 9.87012 9.90991 17.0739 9.90991 25.9601C9.90991 34.8464 17.1137 42.0501 25.9999 42.0501Z" fill="var(--icon-head-fill)" stroke="var(--icon-head-stroke)" stroke-width="2.48"/>\n</g>\n</svg>\n',
              part: RenderPart.Head
            },
            ...rearrangeArray(
              ArrayNum(100).map((k) => ({
                type: FeatureSetType.Icon,
                value: k + 1,
                // icon: `<span style="display:flex;justify-content:center;align-items:center;position:relative;z-index:1;">${k}</span>`,
                color: SwitchMiiColorTable[k],
                part: RenderPart.Head,
                property: "extFacePaintColor"
              })),
              MiiSwitchColorTable
            )
          ]
        }
      }
    })
  );
}
