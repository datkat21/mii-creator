import Html from "@datkat21/html";
import type CameraControls from "camera-controls";
import { Color, Vector3, type Mesh } from "three";
import { GLTFExporter } from "three/examples/jsm/Addons.js";
import {
  CameraPosition,
  Mii3DScene,
  SetupType
} from "../../../../class/3DScene";
import { RenderPart } from "../../../../class/MiiEditor";
import { Config } from "../../../../config";
// import Mii from "../../../../external/mii-js/mii";
import Mii from "../../../../class/MiiData";
import { AddButtonSounds } from "../../../../util/AddButtonSounds";
import { downloadLink, saveArrayBuffer } from "../../../../util/downloadLink";
import { ArrayNum } from "../../../../util/Numbers";
import { getSetting } from "../../../../util/SettingsHelper";
import {
  FeatureSetType,
  MiiPagedFeatureSet,
  type FeatureSetEntry,
  type FeatureSetIconItem
} from "../../../components/MiiPagedFeatureSet";
import Modal from "../../../components/Modal";
import { importMiiConfirmation } from "../importDialog";
import { traverse3DMaterialFix } from "../util/3DModel";
import { cMaterialName } from "../../../../class/3d/shader/fflShaderConst";
import { getMiiIcon } from "../../Library";
import { parseHexOrB64ToUint8Array } from "../../../../external/ffl.js/ffl";

import { _ } from "../../../../util/Lang";
const __ = _();

enum ExpressionModifier {
  HideNose,
  HideNoseAndMask
}

const expressionTable: {
  name: string;
  id: number;
  modifier?: ExpressionModifier;
}[] = [
  { name: "Normal", id: 0 },
  { name: "Smile", id: 1 },
  { name: "Anger", id: 2 },
  { name: "Sorrow", id: 3 },
  { name: "Surprise", id: 4 },
  { name: "Blink", id: 5 },
  { name: "Normal (open mouth)", id: 6 },
  { name: "Smile (open mouth)", id: 7 },
  { name: "Anger (open mouth)", id: 8 },
  { name: "Surprise (open mouth)", id: 9 },
  { name: "Sorrow (open mouth)", id: 10 },
  { name: "Blink (open mouth)", id: 11 },
  { name: "Wink (left eye open)", id: 12 },
  { name: "Wink (right eye open)", id: 13 },
  { name: "Wink (left eye and mouth open)", id: 14 },
  { name: "Wink (right eye and mouth open)", id: 15 },
  { name: "Wink (left eye open and smiling)", id: 16 },
  { name: "Wink (right eye open and smiling)", id: 17 },
  { name: "Frustrated", id: 18 },
  { name: "Bored", id: 19 },
  { name: "Bored open mouth", id: 20 },
  { name: "Sigh mouth straight", id: 21 },
  { name: "Sigh", id: 22 },
  { name: "Disgusted mouth straight", id: 23 },
  { name: "Disgusted", id: 24 },
  { name: "Love", id: 25 },
  { name: "Love mouth open", id: 26 },
  { name: "Determined mouth straight", id: 27 },
  { name: "Determined", id: 28 },
  { name: "Cry mouth straight", id: 29 },
  { name: "Cry", id: 30 },
  { name: "Big smile mouth straight", id: 31 },
  { name: "Big smile", id: 32 },
  { name: "Cheeky", id: 33 },
  { name: "Resolve eyes funny mouth", id: 35 },
  { name: "Resolve eyes funny mouth open", id: 36 },
  { name: "Smug", id: 37 },
  { name: "Smug mouth open", id: 38 },
  { name: "Resolve", id: 39 },
  { name: "Resolve mouth open", id: 40 },
  { name: "Unbelievable", id: 41 },
  { name: "Cunning", id: 43 },
  { name: "Raspberry", id: 45 },
  { name: "Innocent", id: 47 },
  { name: "Cat", id: 49, modifier: ExpressionModifier.HideNose },
  { name: "Dog", id: 51, modifier: ExpressionModifier.HideNose },
  { name: "Tasty", id: 53 },
  { name: "Money mouth straight", id: 55 },
  { name: "Money", id: 56 },
  { name: "Confused mouth straight", id: 57 },
  { name: "Confused", id: 58 },
  { name: "Cheerful mouth straight", id: 59 },
  { name: "Cheerful", id: 60 },
  { name: "Blank", id: 61, modifier: ExpressionModifier.HideNoseAndMask },
  { name: "Grumble mouth straight", id: 63 },
  { name: "Grumble", id: 64 },
  { name: "Moved mouth straight", id: 65 },
  { name: "Moved (aka pleading face)", id: 66 },
  { name: "Singing mouth small", id: 67 },
  { name: "Singing", id: 68 },
  { name: "Stunned", id: 69 }
];

export async function customRender(miiData: Mii) {
  const modal = Modal.modal("Custom Render", "", "body", {
    text: "Cancel"
  });
  const body = modal.qs(".modal-body")!.classOn("responsive-row-lg").clear();
  modal.qs(".modal-content")!.styleJs({
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    backgroundColor: "var(--container-solid)"
  });
  let parent = new Html("div")
    .style({
      display: "flex",
      flex: "1",
      background: "var(--container-solid)",
      "border-radius": "12px",
      "flex-shrink": "0",
      height: "100%",
      overflow: "hidden",
      "justify-content": "center",
      "align-items": "center"
    })
    .appendTo(body);
  let parentBox = new Html("div")
    .style({ "aspect-ratio": "1 / 1", height: "100%" })
    .appendTo(parent);
  let tabsContent = new Html("div")
    .classOn("tab-content")
    .style({ flex: "1", height: "100%", overflow: "auto" })
    .appendTo(body);

  let configuration = {
    fov: 30,
    pose: 0,
    expression: "0",
    renderWidth: 720,
    renderHeight: 720,
    animSpeed: 100
  };

  const miiDataHex = miiData.exportHex("studioData");

  let poseListPerBodyModel: Record<string, number> = {
    wii: 4,
    wiiu: 14,
    switch: 5,
    miitomo: 16
  };

  let bodyModelSetting = (await getSetting("bodyModel")) as string;

  let poseCount = 0;
  if (bodyModelSetting in poseListPerBodyModel) {
    poseCount = poseListPerBodyModel[bodyModelSetting] + 1;
  }

  console.log(bodyModelSetting);

  let controls: CameraControls,
    rotationFactor = Math.PI / 8;

  const e: Record<string, FeatureSetEntry> = {
    camera: {
      label: __("Camera"),
      header: new Html("span").html(
        __(
          "Use mouse or touch to move the camera around.\nUsing touch, rotate the camera around with one finger, and drag with two fingers to pan. Pinch with two fingers to zoom.\nIf you like this site, <b>PLEASE</b> consider sharing it with others by <b>crediting the site</b> when you post your renders! 😉"
        )
      ),
      headerIsHtml: true,
      items: [
        {
          type: FeatureSetType.Slider,
          property: "fov",
          iconStart: "FOV",
          iconEnd: "",
          min: 5,
          max: 90,
          part: RenderPart.Face
        },
        {
          type: FeatureSetType.Misc,
          html: new Html("div").class("flex-group", "col").appendMany(
            new Html("label").text(__("Position")),
            new Html("div").class("flex-group").appendMany(
              new Html("button").text(__("Center X")).on("click", () => {
                const newPosition = scene.focusCamera(
                  CameraPosition.MiiFullBody,
                  true,
                  false,
                  true
                )!;
                let target = new Vector3();
                controls.getTarget(target);
                target.x = newPosition.x;
                controls.moveTo(target.x, target.y, target.z);
              }),
              new Html("button").text(__("Center Y")).on("click", () => {
                const newPosition = scene.focusCamera(
                  CameraPosition.MiiFullBody,
                  true,
                  false,
                  true
                )!;
                let target = new Vector3();
                controls.getTarget(target);
                target.y = newPosition.y;
                controls.moveTo(target.x, target.y, target.z);
              }),
              new Html("button").text(__("Center to body")).on("click", () => {
                scene.focusCamera(CameraPosition.MiiFullBody, true, false)!;
              }),
              new Html("button").text(__("Center to head")).on("click", () => {
                scene.focusCamera(CameraPosition.MiiHead, true, false)!;
              })
            ),
            new Html("label").text(__("Rotate")),
            new Html("div").class("flex-group").appendMany(
              new Html("button").text(__("Up")).on("click", () => {
                scene
                  .getControls()
                  .rotateTo(
                    controls.azimuthAngle,
                    controls.polarAngle - rotationFactor
                  );
              }),
              new Html("button").text(__("Down")).on("click", () => {
                scene
                  .getControls()
                  .rotateTo(
                    controls.azimuthAngle,
                    controls.polarAngle + rotationFactor
                  );
              }),
              new Html("button").text(__("Left")).on("click", () => {
                scene
                  .getControls()
                  .rotateTo(
                    controls.azimuthAngle - rotationFactor,
                    controls.polarAngle
                  );
              }),
              new Html("button").text(__("Right")).on("click", () => {
                scene
                  .getControls()
                  .rotateTo(
                    controls.azimuthAngle + rotationFactor,
                    controls.polarAngle
                  );
              }),
              new Html("button").text(__("Reset")).on("click", () => {
                controls.rotateTo(0, Math.PI / 2);
              })
            )
          ),
          select() {}
        }
      ]
    },
    // TODO
    // scene: {
    //   label: "Scene",
    //   header: "Change the default background color in Settings.",
    //   items: [
    //     {
    //       type: FeatureSetType.Misc,
    //       html: new Html("div")
    //         .class("input-group")
    //         .appendMany(
    //           new Html("label").text("H"),
    //           new Html("button").text("H"),
    //           new Html("button").text("H"),
    //           new Html("button").text("H")
    //         ),
    //       select() {
    //         /* ... */
    //       },
    //     },
    //   ],
    // },
    pose: {
      label: __("Pose"),
      header: new Html("div").appendMany(
        new Html("span").html(
          __(
            "Change the Body Model option in Settings to get many different options of poses!"
          ) +
            "<br/><br/>" +
            __(
              'Do you like the Mii that does the poses? His name is "dummy".'
            ) +
            "&nbsp;"
        ),
        new Html("a").text(__("Click here")).on("click", (e) => {
          // goodbye custom render :(
          scene.shutdown();
          parent.cleanup();
          modal.qs("button")?.elm.click();

          // easter egg !!!!!
          const mii = new Mii(
            parseHexOrB64ToUint8Array(
              "BAUajXYYt5uiVoD/cJkq8RYY+sFNAGkAaQBDAHIAZQBhAHQAbwByAGQAdQBtAG0AeQAAAAAAAAAAAAAACAAAAAAAQAMACAYDBwMLCAMEEgMNAAAJAGMAAAAACAQACgEAHv///0AABAACFAMTAxMMBAAAAQEKX/8A/wEA"
            )
          );
          importMiiConfirmation(mii, __("Mii Creator (Special Mii)"));
        }),
        new Html("span").html("&nbsp;" + __("to obtain him in your library :)"))
      ),
      headerIsHtml: true,
      items: ArrayNum(poseCount).map((k) => ({
        type: FeatureSetType.Icon,
        value: k,
        // icon: String(k),
        icon:
          k === 0
            ? "None"
            : `<img src="assets/images/poses/${bodyModelSetting}/${String(
                k
              ).padStart(2, "0")}.png" height=120>`,
        part: RenderPart.Head
      }))
    },
    expression: {
      label: __("Expression"),
      items: []
    },
    animation: {
      label: __("Animation"),
      header: __("Control the animation speed."),
      items: [
        {
          type: FeatureSetType.Slider,
          property: "animSpeed",
          part: RenderPart.Face,
          iconStart: "0x",
          iconEnd: "2x",
          min: 0,
          max: 200
        }
      ]
    }
  };

  expressionTable.forEach(async (k) => {
    let iconTag;

    if (Config.renderer.useRendererServer) {
      iconTag = `<img class="lazy" width=128 height=128 data-src="${
        Config.renderer.renderHeadshotURLNoParams
      }?width=128&scale=1&data=${encodeURIComponent(miiDataHex)}&expression=${
        k.id
      }&type=fflmakeicon&verifyCharInfo=0" title="${k.name}">`;
    } else {
      const icon = await getMiiIcon(
        miiData,
        "customRender",
        "fflmakeicon",
        128,
        k.id,
        false
      ).catch((e) => {
        console.error("oh noes, Icon didnt Load", e);
      });
      iconTag = `<img class="lazy" width=128 height=128 data-src="${icon}" title="${k.name}">`;
    }

    const expressionItem = {
      type: FeatureSetType.Icon,
      value: String(k.id),
      icon: iconTag,
      part: RenderPart.Head
    };
    e["expression"].items.push(expressionItem as FeatureSetIconItem);
  });

  // very hacky way to use feature set to create tabs
  MiiPagedFeatureSet({
    mii: configuration,
    miiIsNotMii: true,
    entries: e as any,
    onChange(mii, forceRender, part) {
      configuration = mii as any;
      updateConfiguration();
      // console.log("updated", configuration);
      oldConfiguration = Object.assign({}, configuration);
    }
  })
    .style({ height: "auto" })
    .appendTo(tabsContent);

  let playing = true;

  // Don't automatically play animations on Wii U body model
  if (bodyModelSetting === "wiiu") playing = false;

  let pauseButton = AddButtonSounds(
    new Html("button")
      .text(playing ? __("Pause Animation") : __("Pause Animation"))
      .on("click", () => {
        if (playing === true) {
          playing = false;
        } else {
          playing = true;
        }
        scene.anim.forEach((anim) => {
          if (playing === true) {
            anim.paused = false;
            pauseButton.text(__("Pause Animation"));
          } else {
            anim.paused = true;
            pauseButton.text(__("Play Animation"));
          }
        });
      })
      .appendTo(tabsContent)
  );

  new Html("button")
    .text(__("Download PNG"))
    .on("click", finalizeRender)
    .appendTo(tabsContent);

  new Html("button")
    .text(__("Download 3D model"))
    .on("click", save3DModel)
    .appendTo(tabsContent);

  function resize() {
    let { width, height } = parentBox.elm.getBoundingClientRect();

    if (width < 1024) {
      width = 1024;
    }
    if (height < 1024) {
      height = 1024;
    }

    scene.resize(width, height); // min. 1024x1024px
    scene.getRendererElement().style.height = "100%";
    scene.getRendererElement().style.width = "unset";
  }

  window.addEventListener("resize", () => {
    resize();
  });

  const scene = new Mii3DScene(
    miiData,
    parentBox.elm,
    SetupType.Screenshot,
    (renderer) => {}
  );
  controls = scene.getControls();

  //@ts-expect-error testing
  window.scene = scene;

  // Background color
  const useGreenScreen = await getSetting("customRenderGreenScreen");
  if (useGreenScreen !== "off") {
    let color: string = useGreenScreen;
    switch (useGreenScreen) {
      case "green":
        color = "#00ff00";
        break;
      case "blue":
        color = "#0000ff";
        break;
      case "white":
        color = "#ffffff";
        break;
      case "black":
        color = "#000000";
        break;
    }

    scene.getScene().background = new Color(color);
  }

  let oldConfiguration: any = {
    fov: 30,
    pose: 0,
    expression: "0",
    renderWidth: 720,
    renderHeight: 720,
    animSpeed: 1
  };

  function updateConfiguration() {
    scene.getCamera()!.fov = configuration.fov;
    scene.getCamera()!.updateProjectionMatrix();

    // Only update expression when expression is changed.
    // console.log(oldConfiguration.expression, configuration.expression);
    if (oldConfiguration.expression !== configuration.expression) {
      scene.traverseAddFaceMaterial(
        scene.getHead() as Mesh,
        `&data=${encodeURIComponent(miiDataHex)}&expression=${
          configuration.expression
        }&width=896&verifyCharInfo=0`
      );
    }

    const expr = expressionTable.find(
      (e) => e.id === parseInt(configuration.expression as any as string)
    );
    // console.log(configuration);

    if (expr) {
      // console.log(expr);
      if (typeof expr.modifier !== "undefined") {
        switch (expr.modifier) {
          case ExpressionModifier.HideNose:
            // should be hiding the nose
            scene.getHead()!.traverse((o) => {
              if ((o as Mesh).isMesh !== true) return;
              const m = o as Mesh;
              const modulateType = m.geometry.userData.modulateType;

              if (
                modulateType === cMaterialName.FFL_MODULATE_TYPE_SHAPE_NOSE ||
                modulateType === cMaterialName.FFL_MODULATE_TYPE_SHAPE_NOSELINE
              ) {
                m.visible = false;
              } else {
                m.visible = true;
              }
            });
            break;
          case ExpressionModifier.HideNoseAndMask:
            // should be hiding the nose and the mask
            scene.getHead()!.traverse((o) => {
              if ((o as Mesh).isMesh !== true) return;
              const m = o as Mesh;
              const modulateType = m.geometry.userData.modulateType;

              if (
                modulateType === cMaterialName.FFL_MODULATE_TYPE_SHAPE_MASK ||
                modulateType === cMaterialName.FFL_MODULATE_TYPE_SHAPE_NOSE ||
                modulateType === cMaterialName.FFL_MODULATE_TYPE_SHAPE_NOSELINE
              ) {
                m.visible = false;
              } else {
                m.visible = true;
              }
            });
            break;
        }
      } else {
        scene.getHead()!.traverse((o) => {
          if ((o as Mesh).isMesh !== true) return;
          const m = o as Mesh;
          m.visible = true;
        });
      }
    }

    const pose = "Pose." + String(configuration.pose).padStart(2, "0");

    if (scene.animations.get(`${scene.type}-${pose}`)) {
      scene.swapAnimation(pose);
      if (playing === false) {
        scene.anim.forEach((a) => (a.paused = true));
      }
    } else {
      scene.swapAnimation("Wait");
      if (playing === false) {
        scene.anim.forEach((a) => (a.paused = true));
      }
    }
    scene.anim.forEach((a) => {
      a.timeScale = configuration.animSpeed / 100;
    });

    // Fix animations being too fast
    scene.anim.get(scene.type)!.timeScale *= 0.5;
  }

  //@ts-expect-error
  window.scene = scene;

  scene.init().then(async () => {
    await scene.updateMiiHead();

    if (playing === false) {
      scene.anim.forEach((anim) => {
        if (playing === true) {
          anim.paused = false;
          pauseButton.text(__("Pause Animation"));
        } else {
          anim.paused = true;
          pauseButton.text(__("Play Animation"));
        }
      });
    }

    scene.focusCamera(CameraPosition.MiiFullBody, true, false);
    parentBox.append(scene.getRendererElement());

    scene.resize();
  });

  let shouldClose = await getSetting("autoCloseCustomRender");

  const rendererElm = scene.getRendererElement();

  function finalizeRender() {
    rendererElm.toBlob((blob) => {
      const image = new Image(rendererElm.width, rendererElm.height);
      image.src = URL.createObjectURL(blob!);
      image.onload = () => {
        downloadLink(
          image.src,
          // mii custom render file name - e.g. 'Mii_custom_render_2025-03-06T14:40:20.310Z.png'
          __("%1_custom_render_%2.png", miiData.nickname, new Date().toJSON())
        );
        if (shouldClose) {
          scene.shutdown();
          parent.cleanup();
          modal.qs("button")?.elm.click();
        }
      };
    });
  }

  async function save3DModel() {
    alert("This option doesn't work at the moment, please try again later.");
    // const shaderSetting = await getSetting("shaderType");

    // if (shaderSetting === "none") {
    //   return;
    // }

    // // fix up the materials
    // const mats = await traverse3DMaterialFix(scene);
    // let i = 0;

    // const exporter = new GLTFExporter();
    // exporter.parse(
    //   scene.getScene(),
    //   (gltf) => {
    //     console.log("gltf", gltf);
    //     if (gltf instanceof ArrayBuffer) {
    //       saveArrayBuffer(
    //         gltf,
    //         `${miiData.nickname}_${__("all_body")}_${new Date().toJSON()}.glb`
    //       );
    //     }
    //     if (shouldClose) {
    //       scene.shutdown();
    //       parent.cleanup();
    //       modal.qs("button")?.elm.click();
    //     } else {
    //       // Revert back all materials.
    //       i = 0;
    //       scene.getScene().traverse((o) => {
    //         if ((o as Mesh).isMesh !== true) return;

    //         const m = o as Mesh;

    //         m.material = mats.get(i);

    //         i++;
    //       });
    //     }
    //   },
    //   (error) => {
    //     console.error("Oops, something went wrong:", error);
    //   },
    //   {
    //     binary: true
    //   }
    // );
  }
}
