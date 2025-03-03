import Mii from "../class/MiiData";
import Html from "@datkat21/html";
import { TabList } from "../ui/components/TabList";
import EditorIcons from "../constants/EditorIcons";
import { CameraPosition, Mii3DScene } from "./3DScene";
import { EyeTab } from "../ui/tabs/Eye";
import { HeadTab } from "../ui/tabs/Head";
import type { TabBase } from "../constants/TabRenderType";
import { MiscTab } from "../ui/tabs/Misc";
import { NoseTab } from "../ui/tabs/Nose";
import { FavoriteColorTab } from "../ui/tabs/FavoriteColor";
import { MouthTab } from "../ui/tabs/Mouth";
import { HairTab } from "../ui/tabs/Hair";
import {
  MiiFavoriteColorIconTable,
  MiiFavoriteColorLookupTable,
  SwitchMiiColorTable,
  SwitchMiiColorTableLip
} from "../constants/ColorTables";
import { ScaleTab } from "../ui/tabs/Scale";
import Modal from "../ui/components/Modal";
import { playSound } from "./audio/SoundManager";
import { AddButtonSounds } from "../util/AddButtonSounds";
import { FacialHairTab } from "../ui/tabs/FacialHair";
import { MoleTab } from "../ui/tabs/Mole";
import { EyebrowTab } from "../ui/tabs/Eyebrow";
import { GlassesTab } from "../ui/tabs/Glasses";
import { Config } from "../config";
import { OptionsTab } from "../ui/tabs/Options";
import { ExtHatTab } from "../ui/tabs/ExtHat";
import { Mii2DRenderer } from "./2DRenderer";
import { getSetting } from "../util/SettingsHelper";
import { dataToBase64 } from "../util/dataConvert";
import { parseHexOrB64ToUint8Array } from "../external/ffl.js/ffl";

export enum MiiGender {
  Male,
  Female
}
export enum RenderMode {
  Canvas2DRenderer = 0,
  Canvas3DScene = 1
}
export type IconSet = {
  face: string[];
  makeup: string[];
  wrinkles: string[];
  eyebrows: string[];
  eyes: string[];
  nose: string[];
  mouth: string[];
  mustache: string[];
  goatee: string[];
  hair: string[];
  glasses: string[];
  hat: string[];
};

export enum RenderPart {
  Head,
  Face
}

let activeMii: Mii;
export const getMii = () => activeMii;
let currentEditor: MiiEditor | null = null;

export class MiiEditor {
  mii: Mii;
  icons!: IconSet;

  ui!: {
    base: Html;
    mii: Html;
    renderer: Mii2DRenderer;
    scene: Mii3DScene;
    tabList: Html;
    tabContent: Html;
  };

  dirty: boolean;
  ready: boolean;

  renderingMode!: RenderMode;
  onShutdown!: (mii: string, shutdownProperly?: boolean) => any | Promise<any>;
  errors: Map<string, { valid: boolean; reason: string }>;
  useAccessibility!: boolean;

  static getCurrentEditor() {
    return currentEditor;
  }

  constructor(
    gender: MiiGender,
    onShutdown?: (
      mii: string,
      shutdownProperly?: boolean
    ) => any | Promise<any>,
    init?: string
  ) {
    window.editor = this;
    currentEditor = this;

    document.dispatchEvent(new CustomEvent("editor-launch"));

    this.showLoadIndicator();
    this.dirty = false;
    this.ready = false;
    this.errors = new Map();

    // default male mii
    let initString =
      "BAUAAAAAAAAAAID/cJkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE0AaQBpAAAAAAAAAAAAAAAAAAAACAAAAAAAQAMDAQYEBgIKCAQEAgIMAAAAAP8AAAAACAQACgEAIf///0AABAACFAMTBBcNBAAKBAEJ//8A/wA=";
    if (gender === MiiGender.Female) {
      initString =
        "BAAAAAAAAAAAAIDfGZoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE0AaQBpAAAAAAAAAAAAAAAAAAAACAAAAAAAQAMDAQYEAAIKCAMEBAIMAAAAAP8AAAABCAQACgEADP///0AABAACFAMTBBcNBAAKBAEJ//8A/wA=";
    }
    if (init) initString = init;
    if (onShutdown) {
      this.onShutdown = onShutdown;
    }

    this.mii = new Mii(initString);
    activeMii = this.mii;

    this.#setupUi();
  }

  #loadInterval!: Timer;

  // Stuff relating to load indicator
  showLoadIndicator() {
    const check = () => {
      if (this.ready) {
        this.hideLoadIndicator();
        return;
      } else {
        // javascript moment
        if (this.ui)
          if (this.ui.mii)
            if (this.ui.mii.qs(".loader"))
              this.ui.mii.qs(".loader")!.classOn("active");
      }
      playSound("wait");
    };
    check();
    this.#loadInterval = setInterval(check, 1000);
  }
  hideLoadIndicator() {
    clearInterval(this.#loadInterval);
    if (this.ui.mii.qs(".loader")) {
      this.ui.mii.qs(".loader")!.classOff("active");
    }
  }

  async #setupUi() {
    const editMode = await getSetting("editMode");

    if (editMode === "2d") {
      this.renderingMode = RenderMode.Canvas2DRenderer;
    } else if (editMode === "3d") {
      if (Config.renderer.allow3DMode === true)
        this.renderingMode = RenderMode.Canvas3DScene;
      else this.renderingMode = RenderMode.Canvas2DRenderer;
    }

    const useAccessibility = await getSetting("accessibilityFeature");
    this.useAccessibility = useAccessibility;

    this.icons = await fetch("./dist/icons.json?t=" + Date.now()).then((j) =>
      j.json()
    );
    this.ui = {} as unknown as any;
    this.#setupBase();
    this.#updateCssVars();
    await this.#setupMii();
    this.#setupTabs();
    await this.render();
    this.ready = true;
  }
  #setupBase() {
    this.ui.base = new Html("div").class("ui-base").appendTo("body");
  }
  #renderModeText(RM: RenderMode) {
    switch (RM) {
      case RenderMode.Canvas2DRenderer:
        return "2D";
      case RenderMode.Canvas3DScene:
        return "3D";
    }
  }
  async #setupMii() {
    this.ui.mii = new Html("div").class("mii-holder").appendTo(this.ui.base);
    this.ui.mii.append(
      new Html("div").html(EditorIcons.loading).class("loader", "active")
    );
    let nextRenderMode = 0;
    switch (this.renderingMode) {
      case RenderMode.Canvas2DRenderer:
        if (Config.renderer.useRendererServer === true) this.#setup2D();
        else {
          await this.#setup3D();
          this.ui.scene.cameraPan = true;
          this.ui.scene.focusCameraUpdate();
        }
        nextRenderMode = RenderMode.Canvas3DScene;
        break;
      case RenderMode.Canvas3DScene:
        this.#setup3D();
        nextRenderMode = RenderMode.Canvas2DRenderer;
        break;
    }

    const renderModeToggle = AddButtonSounds(
      new Html("button")
        .class("render-mode-toggle")
        .style({ "z-index": "1" })
        .text(this.#renderModeText(nextRenderMode))
        .on("click", () => {
          if (Config.renderer.allow3DMode === false)
            return Modal.alert(
              "You can't use this feature",
              "Sorry, but you can't use this feature because 3D mode is disabled at the moment."
            );
          renderModeToggle.text(this.#renderModeText(this.renderingMode));
          switch (this.renderingMode) {
            case RenderMode.Canvas2DRenderer:
              this.renderingMode = RenderMode.Canvas3DScene;
              break;
            case RenderMode.Canvas3DScene:
              this.renderingMode = RenderMode.Canvas2DRenderer;
          }
          if (this.ui.scene && Config.renderer.useRendererServer === false) {
            this.ui.scene.cameraPan = !Boolean(this.renderingMode);
            this.ui.scene.focusCameraUpdate();
            console.log("why this Really not work :(", this.renderingMode);
            return;
          }
          this.render();
        })
        .appendTo(this.ui.mii)
    );
  }
  #setup2D() {
    // TODO: Actually support the 2D renderer
    // this.ui.renderer = new Mii2DRenderer(this.ui.mii.elm, this.mii);
    /* renderImage */
    new Html("img").attr({ crossorigin: "anonymous" }).appendTo(this.ui.mii);
  }
  async #setup3D() {
    this.ui.scene = new Mii3DScene(
      this.mii,
      this.ui.mii.elm,
      undefined,
      undefined,
      undefined,
      this
    );
    if (this.ui.scene && Config.renderer.useRendererServer === false) {
      this.ui.scene.cameraPan = Boolean(this.renderingMode);
      this.ui.scene.focusCameraUpdate();
      console.log("why this not work :(", this.renderingMode);
    }
    await this.ui.scene.init();
    this.ui.mii.append(this.ui.scene.getRendererElement());
    window.addEventListener("resize", () => {
      this.ui.scene.resize();
    });
    this.ui.scene.focusCamera(CameraPosition.MiiHead);
    this.ui.scene.getRendererElement().classList.add("ready");
    this.ui.mii.qs(".loader")!.classOff("active");
  }
  async #updateCssVars() {
    let glassesColor = SwitchMiiColorTable[this.mii.glassColor];

    let eyeColor = SwitchMiiColorTable[this.mii.eyeColor];
    let mouthColor = {
      top: SwitchMiiColorTableLip[this.mii.mouthColor],
      bottom: SwitchMiiColorTable[this.mii.mouthColor]
    };

    if (this.useAccessibility) {
      this.ui.base.style({
        "--eye-color": "#787880",
        "--icon-lip-color-top": "#780c0c",
        "--icon-lip-color-bottom": "#f00c08",
        "--icon-hair-tie":
          "#" +
          MiiFavoriteColorLookupTable[this.mii.favoriteColor]
            .toString(16)
            .padStart(6, "0"),
        "--icon-eyebrow-fill": "var(--text)",
        "--icon-hair-fill": "var(--text)",
        "--icon-facial-hair-fill": "#9b9b9b",
        "--icon-hat-fill": MiiFavoriteColorIconTable[0].top,
        "--icon-hat-stroke": MiiFavoriteColorIconTable[0].bottom,
        "--icon-custom-hat-fill": MiiFavoriteColorIconTable[0].top,
        "--icon-custom-hat-stroke": MiiFavoriteColorIconTable[0].bottom,
        "--icon-glasses-fill": "#787880",
        "--icon-glasses-shade": "#78788077"
      });
    } else {
      this.ui.base.style({
        "--eye-color": eyeColor,
        "--icon-lip-color-top": mouthColor.top,
        "--icon-lip-color-bottom": mouthColor.bottom,
        "--icon-hair-tie":
          "#" +
          MiiFavoriteColorLookupTable[this.mii.favoriteColor]
            .toString(16)
            .padStart(6, "0"),
        "--icon-eyebrow-fill": SwitchMiiColorTable[this.mii.eyebrowColor],
        "--icon-hair-fill": SwitchMiiColorTable[this.mii.hairColor],
        "--icon-facial-hair-fill": SwitchMiiColorTable[this.mii.beardColor],
        "--icon-hat-fill":
          MiiFavoriteColorIconTable[this.mii.favoriteColor].top,
        "--icon-hat-stroke":
          MiiFavoriteColorIconTable[this.mii.favoriteColor].bottom,
        "--icon-glasses-fill": glassesColor,
        "--icon-glasses-shade": glassesColor + "77"
      });
    }
  }
  #setupTabs() {
    const TabInit = (Tab: TabBase, CameraFocusPart: CameraPosition) => {
      return async (content: Html) => {
        if (this.ui.scene) this.ui.scene.focusCamera(CameraFocusPart);
        await Tab({
          container: content,
          callback: (mii, forceRender, renderPart) => {
            this.mii = mii;
            activeMii = mii;
            // use of forceRender forces reload of the head in 3D mode
            this.render(forceRender, renderPart);
            this.#updateCssVars();
            this.dirty = true;
          },
          icons: this.icons,
          mii: this.mii,
          editor: this,
          useAccessibility: this.useAccessibility
        });
        if (this.ui.scene) this.ui.scene.resize();
      };
    };

    const tabs = TabList([
      {
        icon: EditorIcons.head,
        select: TabInit(HeadTab, CameraPosition.MiiHead)
      },
      {
        icon: EditorIcons.hair,
        select: TabInit(HairTab, CameraPosition.MiiHead)
      },
      {
        icon: EditorIcons.hat,
        select: TabInit(ExtHatTab, CameraPosition.MiiHead)
      },
      {
        icon: EditorIcons.eyebrows,
        select: TabInit(EyebrowTab, CameraPosition.MiiHead)
      },
      {
        icon: EditorIcons.eyes,
        select: TabInit(EyeTab, CameraPosition.MiiHead)
      },
      {
        icon: EditorIcons.nose,
        select: TabInit(NoseTab, CameraPosition.MiiHead)
      },
      {
        icon: EditorIcons.mouth,
        select: TabInit(MouthTab, CameraPosition.MiiHead)
      },
      {
        icon: EditorIcons.facialHair,
        select: TabInit(FacialHairTab, CameraPosition.MiiHead)
      },
      {
        icon: EditorIcons.mole,
        select: TabInit(MoleTab, CameraPosition.MiiHead)
      },
      {
        icon: EditorIcons.glasses,
        select: TabInit(GlassesTab, CameraPosition.MiiHead)
      },
      {
        icon: EditorIcons.scale,
        select: TabInit(ScaleTab, CameraPosition.MiiFullBody)
      },
      {
        icon: EditorIcons.favoriteColor,
        select: TabInit(FavoriteColorTab, CameraPosition.MiiFullBody)
      },
      {
        icon: EditorIcons.gender,
        select: TabInit(OptionsTab, CameraPosition.MiiFullBody)
      },
      {
        icon: EditorIcons.details,
        select: TabInit(MiscTab, CameraPosition.MiiFullBody)
      },
      {
        icon: EditorIcons.save + "<span>Save</span>",
        type: "tab-save",
        select: () => {
          if (this.dirty === true)
            Modal.modal(
              "Save Mii",
              "Would you like to save?",
              "body",
              {
                text: "Save & Exit",
                callback: () => {
                  this.shutdown();
                }
              },
              {
                text: "Exit without Saving",
                callback: () => {
                  this.shutdown(false);
                }
              },
              {
                text: "Cancel"
              }
            );
          else
            Modal.modal(
              "Quitting Editor",
              "No changes were made. Are you sure you want to exit?",
              "body",
              {
                text: "Save & Exit",
                callback: () => {
                  this.shutdown();
                }
              },
              {
                text: "Exit without Saving",
                callback: () => {
                  this.shutdown(false);
                }
              },
              {
                text: "Cancel"
              }
            );
        },
        update: false
      }
    ]);
    this.ui.tabList = tabs.list;
    this.ui.tabContent = tabs.content;
    this.ui.base.appendMany(tabs.list, tabs.content);
  }

  async render(
    forceReloadHead: boolean = true,
    renderPart: RenderPart = RenderPart.Head
  ) {
    if (Config.renderer.allow3DMode === false)
      this.renderingMode = RenderMode.Canvas2DRenderer;
    // every "img" here should be changed to "canvas.renderer" for new 2d mode.
    switch (this.renderingMode) {
      case RenderMode.Canvas2DRenderer:
        if (Config.renderer.useRendererServer === false) {
          if (this.ui.mii.qs("canvas.scene") === null) {
            await this.#setup3D();
          }
          this.ui.mii.qs("canvas.scene")?.style({ display: "block" });
          this.ui.scene.mii = this.mii;
          if (forceReloadHead) {
            // reload head and body
            this.ui.scene.updateMiiHead(renderPart);
            this.ui.scene.sparkle();
          } else {
            // only reload body
            this.ui.scene.updateBody(true);
          }
          return;
        }
        if (this.ui.mii.qs("img") === null) {
          this.#setup2D();
        }
        if (this.ui.mii.qs("canvas.scene")) {
          this.ui.mii.qs("canvas.scene")?.style({ display: "none" });
        }
        this.ui.mii.qs("img")?.style({ display: "block" });

        let pantsColor: string = "gray";
        if (this.mii.special === 1) {
          pantsColor = "gold";
        }
        if (this.mii.favorite) {
          pantsColor = "red";
        }
        // replace for new 2d mode
        this.ui.mii
          .qs("img")
          ?.style({ display: "block" })
          .attr({
            src: `${
              Config.renderer.renderFullBodyURL
            }&data=${encodeURIComponent(this.mii.exportHex("studioData"))}&${
              Config.renderer.hatTypeParam
            }=${this.mii.hatType + Config.renderer.hatTypeAdd}&${
              Config.renderer.hatColorParam
            }=${
              (this.mii.hatFavoriteColor !== -1
                ? this.mii.hatFavoriteColor - 1
                : -1) + Config.renderer.hatColorAdd
            }&miic=${encodeURIComponent(
              dataToBase64(this.mii.export("miic"))
            )}&pantsColor=${pantsColor}`
          });
        // this.ui.renderer.mii = this.mii;
        // this.ui.renderer.render();
        break;
      case RenderMode.Canvas3DScene:
        if (this.ui.mii.qs("canvas.scene") === null) {
          await this.#setup3D();
        }
        if (this.ui.mii.qs("img")) {
          this.ui.mii.qs("img")?.style({ display: "none" });
        }
        this.ui.mii.qs("canvas.scene")?.style({ display: "block" });
        this.ui.scene.mii = this.mii;
        if (forceReloadHead) {
          // reload head and body
          this.ui.scene.updateMiiHead(renderPart);
          this.ui.scene.sparkle();
        } else {
          // only reload body
          this.ui.scene.updateBody(true);
        }
        break;
    }
  }
  #disableUI() {
    this.ui.mii.qs("button")!.classOn("disabled");
    this.ui.tabList.classOn("disabled");
    this.ui.tabContent.classOn("disabled");
  }
  async shutdown(shouldSave: boolean = true) {
    if (shouldSave) {
      if (Array.from(this.errors.values()).find((i) => i.valid === false)) {
        let errorList = [];
        for (const value of this.errors.values()) {
          if (value.valid === false) errorList.push(value.reason);
        }
        Modal.alert(
          "Notice",
          "You need to fix the following issues before you can save:\n\n" +
            errorList.map((e) => `• ${e}`).join("\n")
        );
        return;
      }

      if (this.renderingMode === RenderMode.Canvas3DScene) {
        await new Promise((resolve, reject) => {
          this.#disableUI();
          // Tell scene to change animation
          this.ui.scene.playEndingAnimation();
          setTimeout(() => {
            resolve(null);
          }, 1500);
        });
      }
    }

    if (this.#loadInterval) {
      clearInterval(this.#loadInterval);
    }

    this.ui.base.classOn("closing");
    setTimeout(() => {
      if (this.ui.scene) {
        this.ui.scene.shutdown();
      }
      this.ui.base.cleanup();
      if (this.onShutdown) {
        this.onShutdown(dataToBase64(this.mii.export("miic")), shouldSave);
      }

      document.dispatchEvent(new CustomEvent("editor-shutdown"));
      window.editor = null;
      currentEditor = null;
    }, 500);
  }
}
