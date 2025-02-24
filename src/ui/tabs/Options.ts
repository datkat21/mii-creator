import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import { RenderPart } from "../../class/MiiEditor";
import { makeSeparatorGapThinFSI } from "../../constants/MiiFeatureTable";

export function OptionsTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        gender: {
          label: "Gender",
          items: [
            {
              type: FeatureSetType.Switch,
              iconOff: EditorIcons.genderMale,
              iconOn: EditorIcons.genderFemale,
              property: "gender",
              isNumber: true,
              forceRender: false,
              part: RenderPart.Face,
              soundOff: "select_misc",
              soundOn: "select_misc"
            }
          ]
        },
        favorite: {
          label: "Favorite/Special",
          items: [
            {
              type: FeatureSetType.Switch,
              iconOff: "Normal",
              iconOn: "Favorite",
              property: "favorite",
              isNumber: true,
              forceRender: false,
              part: RenderPart.Face,
              soundOff: "select_color",
              soundOn: "select_color"
            },
            makeSeparatorGapThinFSI(),
            {
              type: FeatureSetType.Switch,
              iconOff: "Normal",
              iconOn: "Special",
              property: "special",
              isNumber: true,
              forceRender: false,
              part: RenderPart.Face,
              soundOff: "select_color",
              soundOn: "select_color"
            }
          ]
        }
      }
    })
  );
}
