import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import type { TabRenderInit } from "../../constants/TabRenderType";
import EditorIcons from "../../constants/EditorIcons";
import { RenderPart } from "../../class/MiiEditor";
import { makeSeparatorGapThinFSI } from "../../constants/MiiFeatureTable";

import { _ } from "../../util/Lang";
const __ = _();

export function OptionsTab(data: TabRenderInit) {
  data.container.append(
    MiiPagedFeatureSet({
      mii: data.mii,
      onChange: data.callback,
      entries: {
        gender: {
          label: __("Gender"),
          items: [
            {
              type: FeatureSetType.Switch,
              iconOff: data.useAccessibility
                ? __("Male")
                : EditorIcons.genderMale,
              iconOn: data.useAccessibility
                ? __("Female")
                : EditorIcons.genderFemale,
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
          label: __("Favorite/Special"),
          items: [
            {
              type: FeatureSetType.Switch,
              iconOff: __("Normal"),
              iconOn: __("Favorite"),
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
              iconOff: __("Normal"),
              iconOn: __("Special"),
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
