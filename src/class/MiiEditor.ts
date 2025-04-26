import Mii from "../external/mii-js/mii";
import { Buffer } from "../../node_modules/buffer/index";
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
  MiiEyeColorTable,
  MiiFavoriteColorIconTable,
  MiiFavoriteColorLookupTable,
  MiiGlassesColorIconTable,
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

export enum MiiGender {
  Male,
  Female
}
export enum RenderMode {
  Canvas2DRenderer,
  Canvas3DScene
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
  errors: Map<string, boolean>;

  constructor(
    gender: MiiGender,
    onShutdown?: (
      mii: string,
      shutdownProperly?: boolean
    ) => any | Promise<any>,
    init?: string
  ) {
    window.editor = this;

    document.dispatchEvent(new CustomEvent("editor-launch"));

    this.showLoadIndicator();
    this.dirty = false;
    this.ready = false;
    this.errors = new Map();

    // default male mii
    let initString =
      "AwEAAAAAAAAAAAAAgP9wmQAAAAAAAAAAAABNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMNn";
    if (gender === MiiGender.Female) {
      initString =
        "AwEAAAAAAAAAAAAAgN8ZmgAAAAAAAAAAAQBNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAMAQRoQxggNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFik";
    }
    if (init) initString = init;
    if (onShutdown) {
      this.onShutdown = onShutdown;
    }

    getSetting("editMode").then((s) => {
      if (s === "2d") {
        this.renderingMode = RenderMode.Canvas2DRenderer;
      } else if (s === "3d") {
        if (Config.renderer.allow3DMode === true)
          this.renderingMode = RenderMode.Canvas3DScene;
        else this.renderingMode = RenderMode.Canvas2DRenderer;
      }
    });

    this.mii = new Mii(Buffer.from(initString, "base64") as unknown as Buffer);
    activeMii = this.mii;

    // Ensure that birthPlatform doesn't cause issues.
    if (this.mii.deviceOrigin === 0) this.mii.deviceOrigin = 4;
    // Enable allow copying so QR can be made.
    if (this.mii.allowCopying === false) this.mii.allowCopying = true;

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
        this.#setup2D();
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
    await this.ui.scene.init();
    this.ui.mii.append(this.ui.scene.getRendererElement());
    window.addEventListener("resize", () => {
      this.ui.scene.resize();
    });
    this.ui.scene.focusCamera(CameraPosition.MiiHead);
    this.ui.scene.getRendererElement().classList.add("ready");
    this.ui.mii.qs(".loader")!.classOff("active");
  }
  #updateCssVars() {
    let glassesColor: string;
    if (this.mii.trueGlassesColor > 5)
      glassesColor = SwitchMiiColorTable[this.mii.trueGlassesColor];
    else glassesColor = MiiGlassesColorIconTable[this.mii.trueGlassesColor].top;
    let eyeColor: string;
    if (this.mii.trueEyeColor > 6) {
      eyeColor = SwitchMiiColorTable[this.mii.trueEyeColor - 6];
    } else eyeColor = MiiEyeColorTable[this.mii.fflEyeColor];
    let mouthColor: { top: string; bottom: string };
    if (this.mii.trueMouthColor > 6) {
      mouthColor = {
        top: SwitchMiiColorTableLip[this.mii.trueMouthColor - 5],
        bottom: SwitchMiiColorTable[this.mii.trueMouthColor - 5]
      };
    } else
      mouthColor = {
        top: SwitchMiiColorTableLip[this.mii.fflMouthColor + 19],
        bottom: SwitchMiiColorTable[this.mii.fflMouthColor + 19]
      };

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
      "--icon-facial-hair-fill": SwitchMiiColorTable[this.mii.facialHairColor],
      "--icon-hat-fill": MiiFavoriteColorIconTable[this.mii.favoriteColor].top,
      "--icon-hat-stroke":
        MiiFavoriteColorIconTable[this.mii.favoriteColor].bottom,
      "--icon-glasses-fill": glassesColor,
      "--icon-glasses-shade": glassesColor + "77"
    });
  }
  #setupTabs() {
    const TabInit = (Tab: TabBase, CameraFocusPart: CameraPosition) => {
      return async (content: Html) => {
        if (this.ui.scene) this.ui.scene.focusCamera(CameraFocusPart);
        await Tab({
          container: content,
          callback: (mii, forceRender, renderPart) => {
            this.mii = mii;
            if (this.mii.normalMii === false) this.mii.disableSharing = true;
            else this.mii.disableSharing = false;
            activeMii = mii;
            // use of forceRender forces reload of the head in 3D mode
            this.render(forceRender, renderPart);
            if (this.ui.scene) this.ui.scene.sparkle();
            this.#updateCssVars();
            this.dirty = true;
          },
          icons: this.icons,
          mii: this.mii,
          editor: this
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
                  // If the Mii is special and we try to save, there's an error that we need to disable sharing
                  if (getMii().normalMii === false)
                    getMii().disableSharing = true;
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
        if (this.ui.mii.qs("img") === null) {
          this.#setup2D();
        }
        if (this.ui.mii.qs("canvas.scene")) {
          this.ui.mii.qs("canvas.scene")?.style({ display: "none" });
        }
        this.ui.mii.qs("img")?.style({ display: "block" });

        let pantsColor: string = "gray";
        if (this.mii.normalMii === false) {
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
            }&data=${encodeURIComponent(
              this.mii.encodeStudio().toString("hex")
            )}&${Config.renderer.hatTypeParam}=${
              this.mii.extHatType + Config.renderer.hatTypeAdd
            }&${Config.renderer.hatColorParam}=${
              this.mii.extHatColor + Config.renderer.hatColorAdd
            }&miic=${encodeURIComponent(
              this.mii.encode().toString("base64")
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
      if (Array.from(this.errors.values()).find((i) => i === true)) {
        let errorList = [];
        for (const [id, value] of this.errors.entries()) {
          if (value === true) errorList.push(id);
        }
        Modal.alert(
          "Error",
          "Will not save because there are problems with the following items:\n\n" +
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
      if (this.ui.mii.qs("canvas.scene")) {
        this.ui.scene.shutdown();
      }
      this.ui.base.cleanup();
      if (this.onShutdown) {
        this.onShutdown(
          Buffer.from(this.mii.encode()).toString("base64"),
          shouldSave
        );
      }

      document.dispatchEvent(new CustomEvent("editor-shutdown"));
    }, 500);
  }
}
