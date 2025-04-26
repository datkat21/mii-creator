import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import { RenderPart } from "../../class/MiiEditor";

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
          label: "Favorite",
          items: [
            {
              type: FeatureSetType.Switch,
              iconOff: "No",
              iconOn: "Yes",
              property: "favorite",
              isNumber: false,
              forceRender: false,
              part: RenderPart.Face,
              soundOff: "select_color",
              soundOn: "select_color"
            }
          ]
        },
        isSpecial: {
          label: "Type",
          items: [
            {
              type: FeatureSetType.Switch,
              iconOff: "Special",
              iconOn: "Normal",
              property: "normalMii",
              isNumber: false,
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
