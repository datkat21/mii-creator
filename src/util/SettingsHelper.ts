import localforage from "localforage";
import { BodyType, ShaderType } from "../constants/BodyShaderTypes";
import Modal from "../ui/components/Modal";
import { replayUpdateNotice } from "../ui/pages/Settings";

import { _ } from "../util/Lang";
import { Config } from "../config";
const __ = _();

/* Unused but here for translation purposes */
// Low resource file
__("Low");
// Middle resource file
__("Middle");
// High resource file
__("High");

export const settingsInfo: Record<string, any> = {
  bgm: {
    type: "checkbox",
    label: __("Enable background music"),
    default: true,
    description: __("Toggle background music depending on the theme.")
  },
  sfx: {
    type: "checkbox",
    label: __("Enable sound effects"),
    default: true,
    description: __("Toggle sound effects for buttons and inputs.")
  },
  accessibilityFeature: {
    type: "checkbox",
    label: __("Enable accessibility features"),
    default: false,
    description: __("The editor UI will be tweaked to be more accessible.")
  },
  autoCloseCustomRender: {
    type: "checkbox",
    label: __("Auto-close custom render menu"),
    default: true,
    description: __(
      "The custom render menu will automatically close when pressing save."
    )
  },
  autoCloseQrScan: {
    type: "checkbox",
    label: __("Auto-close QR scan menu"),
    default: true,
    description: __(
      "The QR code scanner will disappear after a successful scan."
    )
  },
  allowQrCamera: {
    type: "checkbox",
    label: __("Allow using camera in QR scanner"),
    default: true,
    description: __(
      "When this is disabled, the camera won't be used and some errors may not appear."
    )
  },
  editMode: {
    type: "multi",
    label: __("Editing Mode"),
    description: __("Changes the default edit mode option."),
    default: "3d",
    choices: [
      { label: __("2D"), value: "2d" },
      { label: __("3D"), value: "3d" }
    ]
  },
  theme: {
    type: "multi",
    label: __("Theme"),
    default: "default",
    description: __(
      "When this is set to Normal, your device's color theme preferences will be used."
    ),
    choices: [
      { label: __("Normal"), value: "default" },
      { label: __("Wii U"), value: "wiiu", disabled: true }
    ]
  },
  resourceType: {
    type: "multi",
    label: __("Resource Type"),
    default: Config.renderer.fflResourcePath.length - 1,
    description: __(
      "This changes model/texture quality.\n* Low resource cannot use some shader features."
    ),
    choices: [
      ...Config.renderer.fflResourcesNames.map((n, i) => ({
        label: __(n),
        value: String(i)
      }))
    ]
  },
  shaderType: {
    type: "multi",
    label: __("Shader Type"),
    description: __(
      "Change the lighting used in icons, renders and the editor."
    ),
    default: ShaderType.Miitomo,
    choices: [
      { label: __("No Lighting"), value: ShaderType.LightDisabled },
      { label: __("Toon"), value: ShaderType.WiiUToon },
      { label: __("Wii U"), value: ShaderType.WiiU },
      { label: __("Wii U (Blinn)"), value: ShaderType.WiiUBlinn },
      { label: __("Wii U (Bright)"), value: ShaderType.WiiUFFLIconWithBody },
      { label: __("Switch (WIP)"), value: ShaderType.Switch, disabled: true },
      { label: __("Miitomo"), value: ShaderType.Miitomo }
    ]
  },
  bodyModel: {
    type: "multi",
    label: __("Body Model"),
    description: __(
      "Pose selections are different depending on the body model you use."
    ),
    default: BodyType.WiiU,
    choices: [
      { label: __("Wii U"), value: BodyType.WiiU },
      { label: __("Switch"), value: BodyType.Switch, disabled: true },
      { label: __("Miitomo"), value: BodyType.Miitomo },
      { label: __("StreetPass"), value: BodyType.StreetPass }
    ]
  },
  bodyModelHands: {
    type: "checkbox",
    label: __("Color hands to skin tone"),
    default: false,
    description: __("The hands of the body will match the Mii's skin tone.")
  },
  customRenderGreenScreen: {
    type: "multi",
    label: __("Use background in custom render"),
    default: "off",
    description: __("The custom render will have a solid color background."),
    choices: [
      { label: __("Disabled"), value: "off" },
      { label: __("Green"), value: "green" },
      { label: __("Blue"), value: "blue" },
      { label: __("Black"), value: "black" },
      { label: __("White"), value: "white" },
      { label: __("Custom"), value: "custom", isColor: true }
    ]
  },
  saveData: {
    type: "non-settings-multi",
    label: __("Save Data"),
    description: __("Not implemented yet."),
    choices: [
      {
        label: __("Import"),
        async select() {
          if (
            (await Modal.prompt(
              "WARNING",
              "This will overwrite ALL of your currently saved Miis and delete them forever!\nPlease back up your save data before using this option.\n\nAre you certain that you understand the risk?",
              "body"
            )) === false
          )
            return;

          const input = document.createElement("input");
          input.type = "file";
          input.accept = "application/json";
          document.body.appendChild(input);
          input.click();
          requestAnimationFrame(() => {
            document.body.removeChild(input);
          });
          input.addEventListener("change", async (e) => {
            if (input.files === null) return;
            if (input.files[0] === undefined) return;
            console.log(input.files);

            const reader = new FileReader();

            reader.onload = function (event) {
              const fileContent = event.target!.result;
              console.log(fileContent);
            };

            reader.onerror = function (event) {
              console.error("File reading error:", event);
            };

            reader.readAsText(input.files[0]);
          });
        },
        disabled: true
      },
      {
        label: __("Export"),
        async select() {
          let data: Record<string, string> = {};
          for (const key of (await localforage.keys()).filter((k) =>
            k.startsWith("mii")
          )) {
            console.log(key);
            data[key] = (await localforage.getItem(key)) as string;
          }
          console.log(data);
          const url = URL.createObjectURL(
            new Blob([JSON.stringify(data)], { type: "application/json" })
          );
          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          a.download = "mii-editor-save-data.json";
          document.body.appendChild(a);
          a.click();
          requestAnimationFrame(() => {
            a.remove();
          });
        },
        disabled: true
      },
      {
        label: __("Delete"),
        type: "danger",
        async select() {},
        disabled: true
      }
    ]
  },
  updateNotices: {
    type: "non-settings-multi",
    label: __("Update Notices"),
    description: __("View the last update notice if you missed it."),
    choices: [
      {
        label:
          // Action
          __("Review update notice"),
        select() {
          replayUpdateNotice();
        }
      }
    ]
  }
};

export const getSetting = async (key: string) => {
  const result = await localforage.getItem("settings_" + key);
  // Null fix
  if (result === null) {
    if (settingsInfo[key]) return settingsInfo[key].default;
    else return null;
  } else return result;
};

export const setSetting = async (key: string, value: any) => {
  return await localforage.setItem("settings_" + key, value);
};
