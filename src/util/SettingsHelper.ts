import localforage from "localforage";
import { BodyType, ShaderType } from "../constants/BodyShaderTypes";
import Modal from "../ui/components/Modal";
import { replayUpdateNotice } from "../ui/pages/Settings";

export const settingsInfo: Record<string, any> = {
  bgm: {
    type: "checkbox",
    label: "Background Music",
    default: true,
    description: "Toggle background music depending on the theme."
  },
  sfx: {
    type: "checkbox",
    label: "Sound Effects",
    default: true,
    description: "Toggle sound effects for buttons and inputs."
  },
  accessibilityFeature: {
    type: "checkbox",
    label: "Enable accessibility features",
    default: false,
    description: "The editor UI will be tweaked to be more accessible."
  },
  autoCloseCustomRender: {
    type: "checkbox",
    label: "Auto-close custom render menu",
    default: true,
    description:
      "The custom render menu will automatically close when pressing save."
  },
  autoCloseQrScan: {
    type: "checkbox",
    label: "Auto-close QR scan menu",
    default: true,
    description: "The QR code scanner will disappear after a successful scan."
  },
  allowQrCamera: {
    type: "checkbox",
    label: "Allow using camera in QR scanner",
    default: true,
    description:
      "When this is disabled, the camera won't be used and some errors may not appear."
  },

  editMode: {
    type: "multi",
    label: "Editing Mode",
    description: "Changes the default edit mode option.",
    default: "3d",
    choices: [
      { label: "2D", value: "2d" },
      { label: "3D (default)", value: "3d" }
    ]
  },
  theme: {
    type: "multi",
    label: "Theme",
    default: "default",
    description:
      "When this is set to default, your device's color theme preferences will be used.",
    choices: [
      { label: "Default", value: "default" },
      { label: "Wii U", value: "wiiu" }
    ]
  },
  shaderType: {
    type: "multi",
    label: "Shader Type",
    description: "Change the lighting used in icons, renders and the editor.",
    default: ShaderType.Miitomo,
    choices: [
      { label: "No Lighting", value: ShaderType.LightDisabled },
      { label: "Toon", value: ShaderType.WiiUToon },
      { label: "Wii U (Default)", value: ShaderType.WiiU },
      { label: "Wii U (Blinn)", value: ShaderType.WiiUBlinn },
      { label: "Wii U (Alt)", value: ShaderType.WiiUFFLIconWithBody },
      { label: "Switch (WIP)", value: ShaderType.Switch, disabled: true },
      { label: "Miitomo", value: ShaderType.Miitomo }
    ]
  },
  bodyModel: {
    type: "multi",
    label: "Body Model",
    description:
      "Pose selections are different depending on the body model you use.\n* Does not apply to 2D mode.",
    default: BodyType.WiiU,
    choices: [
      { label: "Wii U (default)", value: BodyType.WiiU },
      { label: "Switch", value: BodyType.Switch, disabled: true },
      { label: "Miitomo", value: BodyType.Miitomo }
    ]
  },
  bodyModelHands: {
    type: "checkbox",
    label: "Color hands to skin tone",
    default: false,
    description:
      "The hands of the body will match the Mii's skin tone.\n* Does not apply to 2D mode."
  },
  customRenderGreenScreen: {
    type: "multi",
    label: "Use background in custom render",
    default: "off",
    description: "The custom render will have a solid color background.",
    choices: [
      { label: "Disabled", value: "off" },
      { label: "Green", value: "green" },
      { label: "Blue", value: "blue" },
      { label: "Black", value: "black" },
      { label: "White", value: "white" },
      { label: "Custom", value: "custom", isColor: true }
    ]
  },
  saveData: {
    type: "non-settings-multi",
    label: "Save Data",
    description: "Not implemented yet.",
    choices: [
      {
        label: "Import",
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
        label: "Export",
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
        label: "Delete",
        type: "danger",
        async select() {},
        disabled: true
      }
    ]
  },
  updateNotices: {
    type: "non-settings-multi",
    label: "Update Notices",
    description: "View the last update notice if you missed it.",
    choices: [
      {
        label: "Review update notice",
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
