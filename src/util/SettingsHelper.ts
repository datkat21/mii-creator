import localforage from "localforage";
import { BodyType, ShaderType } from "../constants/BodyShaderTypes";
import Modal from "../ui/components/Modal";
import { replayUpdateNotice, Settings } from "../ui/pages/Settings";

import { _ } from "../util/Lang";
import { Config } from "../config";
import Html from "@datkat21/html";
import { choosePersonalMii, getAllMiis } from "../ui/pages/Library";
const __ = _();

/* Unused but here for translation purposes */
// Low resource file
__("Low");
// Middle resource file
__("Middle");
// High resource file
__("High");

type SettingsOption =
  | SettingsOptionCheckbox
  | SettingsOptionMulti
  | SettingsOptionNonMulti;

enum SettingsType {
  /** a on/off option */
  Checkbox,
  /** a multi select of options */
  Multi,
  /** multi that doesn't change a setting */
  NonConfigMulti
}

interface SettingBasic {
  /**
   * Large label text
   */
  label: string;
  /**
   * Small description text
   */
  description: string;
  /**
   * Function called as soon as the setting item is rendered.
   * Useful for displaying custom html data next to a setting option.
   * @param html Html instance of the settings item
   * @returns void
   */
  render?: (html: Html) => void;
  /**
   * Condition function whether to show or hide the setting.
   * Return true to keep it visible, false to hide it.
   * This is optional so if you don't provide this function, it will stay visible.
   * @param allSettings All current values of settings entries
   * @returns boolean
   */
  condition?: (allSettings: Record<string, any>) => boolean;
}

interface SettingsOptionCheckbox extends SettingBasic {
  type: SettingsType.Checkbox;
  default: boolean;
}

interface SettingsOptionMulti extends SettingBasic {
  type: SettingsType.Multi;
  default: string;
  choices: SettingsOptionMultiEntry[];
}

type SettingsOptionMultiEntry = {
  label: string;
  value: string;
  disabled?: boolean;
  /**
   * Adds a custom color picker to the settings item. Used only in one place,
   * and its implementation was pretty hacky.
   */
  isColor?: boolean;
};

interface SettingsOptionNonMulti extends SettingBasic {
  type: SettingsType.NonConfigMulti;
  choices: SettingsOptionNonMultiEntry[];
}

type SettingsOptionNonMultiEntry = {
  label: string;
  type?: string;
  select?: () => any;
  disabled?: boolean;
};

export {
  SettingsType,
  type SettingBasic,
  type SettingsOptionCheckbox,
  type SettingsOptionMulti,
  type SettingsOptionNonMulti,
  type SettingsOptionNonMultiEntry
};

export const settingsInfo: Record<string, SettingsOption> = {
  bgm: {
    type: SettingsType.Checkbox,
    label: __("Enable background music"),
    default: true,
    description: __("Toggle background music depending on the theme.")
  },
  sfx: {
    type: SettingsType.Checkbox,
    label: __("Enable sound effects"),
    default: true,
    description: __("Toggle sound effects for buttons and inputs.")
  },
  accessibilityFeature: {
    type: SettingsType.Checkbox,
    label: __("Enable accessibility features"),
    default: false,
    description: __("The editor UI will be tweaked to be more accessible.")
  },
  autoCloseCustomRender: {
    type: SettingsType.Checkbox,
    label: __("Auto-close custom render menu"),
    default: true,
    description: __(
      "The custom render menu will automatically close when pressing save."
    )
  },
  autoCloseQrScan: {
    type: SettingsType.Checkbox,
    label: __("Auto-close QR scan menu"),
    default: true,
    description: __(
      "The QR code scanner will disappear after a successful scan."
    )
  },
  allowQrCamera: {
    type: SettingsType.Checkbox,
    label: __("Allow using camera in QR scanner"),
    default: true,
    description: __(
      "When this is disabled, the camera won't be used and some errors may not appear."
    )
  },
  editMode: {
    type: SettingsType.Multi,
    label: __("Editing Mode"),
    description: __("Changes the default edit mode option."),
    default: "3d",
    choices: [
      { label: __("2D"), value: "2d" },
      { label: __("3D"), value: "3d" }
    ]
  },
  theme: {
    type: SettingsType.Multi,
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
    type: SettingsType.Multi,
    label: __("Resource Type"),
    default: String(Config.renderer.fflResourcePath.length - 1),
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
    type: SettingsType.Multi,
    label: __("Shader Type"),
    description: __(
      "Change the lighting used in icons, renders and the editor."
    ),
    default: ShaderType.WiiU,
    choices: [
      { label: __("No Lighting"), value: ShaderType.LightDisabled },
      { label: __("Simple"), value: ShaderType.ThreePhong },
      { label: __("Toon"), value: ShaderType.ThreeToon },
      { label: __("Wii U"), value: ShaderType.WiiU },
      { label: __("Wii U (Blinn)"), value: ShaderType.WiiUBlinn },
      { label: __("Wii U (Bright)"), value: ShaderType.WiiUFFLIconWithBody },
      { label: __("Wii U (Toon)"), value: ShaderType.WiiUToon },
      // { label: __("Switch (WIP)"), value: ShaderType.Switch, disabled: true },
      { label: __("Miitomo"), value: ShaderType.Miitomo },
      { label: __("Miitomo (Basic)"), value: ShaderType.MiitomoBasic }
    ]
  },
  toonShaderOutline: {
    type: SettingsType.Checkbox,
    label: __("Toon shader uses outline"),
    description: __("Apply toon outline to renders and 3D scene."),
    default: true,
    condition(allSettings) {
      return allSettings["shaderType"] === ShaderType.ThreeToon ? true : false;
    }
  },
  bodyModel: {
    type: SettingsType.Multi,
    label: __("Body Model"),
    description: __(
      "Pose selections are different depending on the body model you use."
    ),
    default: BodyType.WiiU,
    choices: [
      { label: __("Wii U"), value: BodyType.WiiU },
      { label: __("Switch"), value: BodyType.Switch, disabled: true },
      { label: __("Miitomo"), value: BodyType.Miitomo }
      // { label: __("StreetPass"), value: BodyType.StreetPass, disabled: true },
    ]
  },
  customRenderGreenScreen: {
    type: SettingsType.Multi,
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
  personalMii: {
    type: SettingsType.NonConfigMulti,
    label: __("Personal Mii"),
    description: __("Manage your choice of Personal Mii."),
    choices: [
      {
        label: __("Choose"),
        async select() {
          const miis = await getAllMiis();
          await choosePersonalMii(miis, true);
        }
      }
    ],
    render(html: Html) {
      // TODO: Make this show a preview of your current mii
      html.append(new Html("div").text("REAL"));
    }
  },
  saveData: {
    type: SettingsType.NonConfigMulti,
    label: __("Save Data"),
    description: __("Not implemented yet."),
    choices: [
      {
        label: __("Import"),
        // async select() {
        //   if (
        //     (await Modal.prompt(
        //       "WARNING",
        //       "This will overwrite ALL of your currently saved Miis and delete them forever!\nPlease back up your save data before using this option.\n\nAre you certain that you understand the risk?",
        //       "body"
        //     )) === false
        //   )
        //     return;

        //   const input = document.createElement("input");
        //   input.type = "file";
        //   input.accept = "application/json";
        //   document.body.appendChild(input);
        //   input.click();
        //   requestAnimationFrame(() => {
        //     document.body.removeChild(input);
        //   });
        //   input.addEventListener("change", async (e) => {
        //     if (input.files === null) return;
        //     if (input.files[0] === undefined) return;
        //     console.log(input.files);

        //     const reader = new FileReader();

        //     reader.onload = function (event) {
        //       const fileContent = event.target!.result;
        //       console.log(fileContent);
        //     };

        //     reader.onerror = function (event) {
        //       console.error("File reading error:", event);
        //     };

        //     reader.readAsText(input.files[0]);
        //   });
        // },
        disabled: true
      },
      {
        label: __("Export"),
        // async select() {
        //   let data: Record<string, string> = {};
        //   for (const key of (await localforage.keys()).filter((k) =>
        //     k.startsWith("mii")
        //   )) {
        //     console.log(key);
        //     data[key] = (await localforage.getItem(key)) as string;
        //   }
        //   console.log(data);
        //   const url = URL.createObjectURL(
        //     new Blob([JSON.stringify(data)], { type: "application/json" })
        //   );
        //   const a = document.createElement("a");
        //   a.href = url;
        //   a.target = "_blank";
        //   a.download = "mii-editor-save-data.json";
        //   document.body.appendChild(a);
        //   a.click();
        //   requestAnimationFrame(() => {
        //     a.remove();
        //   });
        // },
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
    type: SettingsType.NonConfigMulti,
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
    if (settingsInfo[key]) return (settingsInfo[key] as any).default;
    else return null;
  } else return result;
};

export const setSetting = async (key: string, value: any) => {
  return await localforage.setItem("settings_" + key, value);
};
