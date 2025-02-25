import { AddButtonSounds } from "../../util/AddButtonSounds";
import Modal from "../components/Modal";
import Html from "@datkat21/html";
import localforage from "localforage";
import { getMusicManager } from "../../class/audio/MusicManager";
import { getSoundManager } from "../../class/audio/SoundManager";
import {
  getSetting,
  setSetting,
  settingsInfo
} from "../../util/SettingsHelper";
import { adjustShaderQuery } from "../../constants/BodyShaderTypes";
import { Config } from "../../config";
import Notify from "../components/Notify";

let needsToNotify = true;

export const updateSettings = async (force: boolean = false) => {
  function askRefreshNotice() {
    if (needsToNotify && force === false) {
      Notify.show(
        "Refresh to apply changes",
        "Icons won't be affected until you reload.",
        () => {
          location.reload();
        },
        "Refresh"
      );
      needsToNotify = false;
      setTimeout(() => {
        needsToNotify = true;
      }, 5000);
    }
  }
  // Background Music
  let useBgm = await localforage.getItem("settings_bgm");
  if (useBgm === true) getMusicManager().unmute();
  else if (useBgm === false) getMusicManager().mute();
  // Sound Effects
  let useSfx = await localforage.getItem("settings_sfx");
  if (useSfx === true) getSoundManager().unmute();
  else if (useSfx === false) getSoundManager().mute();

  const wiiu = await localforage.getItem("settings_wiiu");
  // Migrate old Wii U theme setting
  if (wiiu) {
    await localforage.removeItem("settings_wiiu");
    await localforage.setItem("settings_theme", "wiiu");
  }

  const theme = await localforage.getItem("settings_theme");
  if (theme === null) {
    await setSetting("theme", "default");
  } else if (theme === "wiiu") {
    await setSetting("theme", "default");
  }

  // Theme selector
  document.documentElement.dataset.theme = String(
    await localforage.getItem("settings_theme")
  );
  if (
    prevSetting["theme"] !== (await localforage.getItem("settings_theme")) ||
    force
  ) {
    setTimeout(async () => {
      document.dispatchEvent(new CustomEvent("theme-change"));
    }, 33.33);
  }

  // Update library images on shader type change
  if (
    prevSetting["shaderType"] !==
    (await localforage.getItem("settings_shaderType"))
  ) {
    console.log("shaderType changed!!!");
    askRefreshNotice();
    // update all images that used shader
    let currentShader = await getSetting("shaderType");
    document.dispatchEvent(new CustomEvent("library-shader-update"));
    if (Html.qsa("img[data-src]") !== null)
      Html.qsa("img[data-src]")!.forEach((img) => {
        const image = img!.elm as HTMLImageElement;
        const source = image.src.trim() || image.dataset.src!;
        let sourceToUpdate = image.src.trim() !== "" ? "src" : "data-src";
        console.log(sourceToUpdate);
        if (!source.includes("?")) return;
        const params = new URLSearchParams(source.split("?").pop());

        params.delete("shaderType");
        params.delete("lightEnable");

        // set shader type in query params
        adjustShaderQuery(params, currentShader);

        if (sourceToUpdate === "src") {
          image.src = `${source.split("?")[0]}?${params.toString()}`;
        } else if (sourceToUpdate === "data-src") {
          image.dataset.src = `${source.split("?")[0]}?${params.toString()}`;
        }
      });
  }
  // copy paste spaghetti code for body model too
  if (
    prevSetting["bodyModel"] !==
    (await localforage.getItem("settings_bodyModel"))
  ) {
    console.log("bodyModel changed!!!");
    askRefreshNotice();
    // update all images that used shader
    let bodyType = await getSetting("bodyModel");
    document.dispatchEvent(new CustomEvent("library-body-update"));
    if (Html.qsa("img[data-src]") !== null)
      Html.qsa("img[data-src]")!.forEach((img) => {
        const image = img!.elm as HTMLImageElement;
        const source = image.src.trim() || image.dataset.src!;
        let sourceToUpdate = image.src.trim() !== "" ? "src" : "data-src";
        if (!source.includes("?")) return;
        const params = new URLSearchParams(source.split("?").pop());

        params.delete("bodyType");

        // assuming the bodyType string is supported on the server
        params.set("bodyType", bodyType);

        if (sourceToUpdate === "src") {
          image.src = `${source.split("?")[0]}?${params.toString()}`;
        } else if (sourceToUpdate === "data-src") {
          image.dataset.src = `${source.split("?")[0]}?${params.toString()}`;
        }
      });
  }
};

let prevSetting: Record<string, any> = {};

const prefix = "settings_";

for (const key in settingsInfo) {
  let prefixedKey = prefix + key;
  prevSetting[key] = await localforage.getItem(prefixedKey);
}

export async function Settings() {
  const modal = Modal.modal("Settings", "", "body", {
    text: "Cancel"
  });

  const modalBody = modal.qs(".modal-body")!.clear();
  // fix wii u theme center-aligning items
  modalBody.elm.style.setProperty("align-items", "flex-start", "important");
  modalBody.elm.style.setProperty("max-width", "600px");

  async function checkConditions() {
    const items = [...elements];

    const allSettings: Record<string, any> = {};

    for (const key in settingsInfo) {
      allSettings[key] = await getSetting(key);
    }

    for (const [key, element] of items) {
      if (settingsInfo[key].condition) {
        let result = settingsInfo[key].condition(allSettings);

        if (result === true) {
          element.style.display = "flex";
        } else {
          element.style.display = "none";
        }
      }
    }
  }

  let elements: Map<string, HTMLElement> = new Map();

  for (const key in settingsInfo) {
    let prefixedKey = prefix + key;

    if ((await localforage.getItem(prefixedKey)) === null) {
      await localforage.setItem(prefixedKey, settingsInfo[key].default);
    }

    prevSetting[key] = await localforage.getItem(prefixedKey);

    switch (settingsInfo[key].type) {
      case "checkbox":
        const checkboxDiv = new Html("div").class("col").appendMany(
          new Html("div")
            .class("flex-group")
            .style({ "justify-content": "flex-start" })
            .appendMany(
              AddButtonSounds(
                new Html("input")
                  .attr({
                    id: prefixedKey,
                    type: "checkbox",
                    checked:
                      (await localforage.getItem(prefixedKey)) === true
                        ? true
                        : undefined
                  })
                  .on("input", async (e) => {
                    prevSetting[key] = await localforage.getItem(prefixedKey);
                    await localforage.setItem(
                      prefixedKey,
                      (e.target as HTMLInputElement).checked
                    );
                    updateSettings();
                    checkConditions();
                  }),
                "hover",
                "select_misc"
              ),
              new Html("label")
                .attr({ for: prefixedKey })
                .text(settingsInfo[key].label)
            ),
          new Html("small").text(settingsInfo[key].description)
        );
        elements.set(key, checkboxDiv.elm);
        modalBody.append(checkboxDiv);
        break;
      case "multi":
        const val = await localforage.getItem(prefixedKey);
        let options = await Promise.all(
          settingsInfo[key].choices.map(async (c: any) => {
            let colorSpan: Html | undefined = undefined;

            let isActive = false;

            if (typeof c.isColor !== "undefined") {
              colorSpan = new Html("span").style({
                width: "1.2em",
                height: "1.2em",
                "border-radius": "6px"
              });
              colorSpan.style({
                "background-color": "var(--hover)",
                border: "1px solid var(--stroke)"
              });
              const value = await localforage.getItem(prefixedKey)!;
              if (typeof value === "string") {
                if (value.startsWith("#")) {
                  colorSpan.style({ "background-color": value });
                  isActive = true;
                }
              }
            }

            const multiButton = new Html("button")
              .class(
                c.value === val || isActive
                  ? "selected-setting"
                  : (undefined as any)
              )
              .attr({ "data-setting": prefixedKey })
              .text(c.label)
              .on("click", async (e) => {
                prevSetting[key] = String(
                  await localforage.getItem(prefixedKey)
                );
                let isActive = false;
                if (typeof c.isColor !== "undefined") {
                  // Prompt a color selection
                  const color = new Html("input")
                    .attr({ type: "color" })
                    .style({ position: "fixed", opacity: "0" })
                    .appendTo("body");
                  if (prevSetting[key].startsWith("#")) {
                    color.val(prevSetting[key]);
                    isActive = true;
                  }
                  color.elm.click();

                  // set dependent on this
                  color.on("change", (e) => {
                    localforage.setItem(prefixedKey, color.getValue());
                    if (colorSpan)
                      colorSpan.style({ "background-color": color.getValue() });
                    color.cleanup();
                    isActive = true;
                  });
                } else {
                  await localforage.setItem(prefixedKey, c.value);
                }
                updateSettings();
                checkConditions();
                const t = e.target as HTMLElement;
                t.parentElement!.querySelectorAll(
                  `[data-setting="${prefixedKey}"]`
                ).forEach((p) => {
                  p.classList.remove("selected-setting");
                });
                if (c.isColor !== undefined) {
                  if (isActive) {
                    t.classList.add("selected-setting");
                  }
                  const color = String(await localforage.getItem(prefixedKey));
                  if (colorSpan) colorSpan.style({ "background-color": color });
                } else t.classList.add("selected-setting");
              });

            if (colorSpan !== undefined) {
              colorSpan.prependTo(multiButton);
            }

            const button = AddButtonSounds(multiButton, "hover", "select_misc");

            if (c.disabled) {
              button.attr({ disabled: true });
            }

            return button;
          })
        );

        let multiDiv = new Html("div").class("col").appendMany(
          new Html("label").text(settingsInfo[key].label),
          new Html("small").text(settingsInfo[key].description),
          new Html("div")
            .class("flex-group")
            .style({ "justify-content": "flex-start" })
            .appendMany(...options)
        );
        elements.set(key, multiDiv.elm);
        modalBody.append(multiDiv);
        break;
      case "non-settings-multi":
        const nonSettingsMulti = new Html("div").class("col").appendMany(
          new Html("label").text(settingsInfo[key].label),
          new Html("small").text(settingsInfo[key].description),
          new Html("div")
            .class("flex-group")
            .style({ "justify-content": "flex-start" })
            .appendMany(
              ...settingsInfo[key].choices.map((c: any) => {
                const button = AddButtonSounds(
                  new Html("button")
                    .attr({ disabled: c.disabled })
                    .class(c.type)
                    .text(c.label)
                    .on("click", async (e) => {
                      c.select();
                    }),
                  "hover",
                  "select_misc"
                );

                if (c.disabled) {
                  button.attr({ disabled: true });
                }

                return button;
              })
            )
        );
        elements.set(key, nonSettingsMulti.elm);
        modalBody.append(nonSettingsMulti);
        break;
    }
  }

  await checkConditions();
}

export async function replayUpdateNotice() {
  await setSetting(`has-seen-${Config.version.string}`, false);
  displayUpdateNotice();
  // Modal.modal(
  //   "Notice",
  //   "This display the update notice again. Do you want to continue?",
  //   "body",
  //   { text: "Cancel" },
  //   {
  //     text: "Yes",
  //     async callback(e) {
  //       await setSetting(`has-seen-${Config.version.string}`, false);
  //       displayUpdateNotice();
  //     },
  //   },
  //   { text: "No" }
  // );
}

export async function displayUpdateNotice() {
  const seenKey = `has-seen-${Config.version.string}`;
  const seenValue = await getSetting(seenKey);
  const notSeenLatest = seenValue === false || seenValue === null;

  // https://stackoverflow.com/a/326076
  const isInIframe = window.self !== window.top;

  // Should the user see the update popup?
  const shouldSeeNotice =
    // Do not show to first time users
    !window.firstVisit && // NOTE: src/l10n/manager.ts
    // undefined = l10n manager did not run?, false = language key is null (never ran site)
    !isInIframe && // Do not show to API users
    // Show if has-seen key doesn't exist
    notSeenLatest;

  console.log(
    `notSeenLatest: ${notSeenLatest}\nfirstVisit: ${window.firstVisit}\nshould see update notice?: ${shouldSeeNotice}`
  );

  if (window.firstVisit && !isInIframe) {
    // First time? You have "seen" the current version
    await setSetting(seenKey, true);
  } else if (shouldSeeNotice) {
    let m = Modal.modal(
      `New Update: ${Config.version.string}`,
      "Yes new update", // placeholder will be replaced
      "body",
      {
        text: "OK"
      },
      {
        text: "Cancel"
      }
    );

    await setSetting(`has-seen-${Config.version.string}`, true);

    m.qs(".modal-body span")!.cleanup();
    // free vulnerability for you
    m.qs(".modal-body")!.prepend(
      new Html("div")
        .style({ "max-width": "720px" })
        .html(Config.version.changelog)
    );
    // Modify <a> tags in the changelog
    m.qsa("a")!.forEach((b) => {
      if (b === null) return;
      AddButtonSounds(b);
      b.attr({ target: "_blank" });
    });
  }
}
