import Html from "@datkat21/html";
import type { TabRenderInit } from "../../constants/TabRenderType";
import { Input } from "../components/Input";
import Mii from "../../class/MiiData";
import { BodyUpdateType, MiiEditor, RenderPart } from "../../class/MiiEditor";
import { decodeUTF16LE, encodeUTF16LE } from "../../util/dataConvert";

import { _ } from "../../util/Lang";
import {
  FeatureSetType,
  MiiPagedFeatureSet
} from "../components/MiiPagedFeatureSet";
import EditorIcons from "../../constants/EditorIcons";
import { makeSeparatorGapThinFSI } from "../../constants/MiiFeatureTable";
const __ = _();

export function MiscTab(data: TabRenderInit) {
  let tmpMii = new Mii(data.mii.export());
  const setProp = (prop: string, val: any) => {
    // i hate this
    if (MiiEditor.getCurrentEditor() !== null) {
      tmpMii = MiiEditor.getCurrentEditor()!.mii;
    }

    (tmpMii as any)[prop] = val;
    data.callback(tmpMii, false, RenderPart.Head, BodyUpdateType.None);
    return true;
  };
  data.container.appendMany(
    new Html("div")
      .style({
        padding: "1rem",
        display: "flex",
        "flex-direction": "column",
        gap: "1rem"
      })
      .appendMany(
        Input(
          // mii's name
          __("Name"),
          data.mii.nickname,
          // set
          (name) => setProp("nickname", name.trim()),
          // validate
          (name) => {
            const nameBuffer = encodeUTF16LE(name);

            // Empty string check
            let nameStr = decodeUTF16LE(nameBuffer);
            if (nameStr.trim() === "") return __("Name is empty");

            // Name length check
            if (nameBuffer.length > 0x14) return __("Name is too long");
            if (nameBuffer.length === 0) return __("Name is too short");

            return true;
          },
          data.editor
        ),
        Input(
          // mii's creator name
          __("Creator"),
          data.mii.creator,
          // set
          (creator) => setProp("creator", creator.trim()),
          // validate
          (name) => {
            const nameBuffer = encodeUTF16LE(name);

            // Empty string check
            let nameStr = decodeUTF16LE(nameBuffer);
            if (nameStr.length === 0) return true;
            if (nameStr.trim() === "") return __("Creator name is empty");

            // Name length check
            if (nameBuffer.length > 0x14) return __("Creator name is too long");

            return true;
          },
          data.editor
        )
      ),
    new Html("div")
      .class("input-group")
      .style({
        height: "max-content"
        // margin: "0 -16px 0 -16px",
        // width: "calc(100% + 32px)"
      })
      .appendMany(
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
                  forceRender: true,
                  part: RenderPart.Body,
                  bodyUpdateType: BodyUpdateType.ClothingUpdate,
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
                  part: RenderPart.Body,
                  bodyUpdateType: BodyUpdateType.ClothingUpdate,
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
                  part: RenderPart.Body,
                  bodyUpdateType: BodyUpdateType.ClothingUpdate,
                  soundOff: "select_color",
                  soundOn: "select_color"
                }
              ]
            }
          }
        })
      )
  );
}
