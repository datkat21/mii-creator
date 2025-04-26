import Html from "@datkat21/html";
import type CameraControls from "camera-controls";
import { Color, Vector3, type Mesh } from "three";
import { GLTFExporter } from "three/examples/jsm/Addons.js";
import { Buffer } from "../../../../../node_modules/buffer";
import {
  CameraPosition,
  Mii3DScene,
  SetupType
} from "../../../../class/3DScene";
import { RenderPart } from "../../../../class/MiiEditor";
import { Config } from "../../../../config";
import Mii from "../../../../external/mii-js/mii";
import { AddButtonSounds } from "../../../../util/AddButtonSounds";
import { downloadLink, saveArrayBuffer } from "../../../../util/downloadLink";
import { ArrayNum } from "../../../../util/Numbers";
import { getSetting } from "../../../../util/SettingsHelper";
import {
  FeatureSetType,
  MiiPagedFeatureSet,
  type FeatureSetEntry
} from "../../../components/MiiPagedFeatureSet";
import Modal from "../../../components/Modal";
import { importMiiConfirmation } from "../importDialog";
import { traverse3DMaterialFix } from "../util/3DModel";
import { cMaterialName } from "../../../../class/3d/shader/fflShaderConst";

enum ExpressionModifier {
  HideNose,
  HideNoseAndMask
}

const expressionTable: {
  name: string;
  id: string;
  modifier?: ExpressionModifier;
}[] = [
  { name: "Normal", id: "normal" },
  { name: "Smile", id: "smile" },
  { name: "Anger", id: "anger" },
  { name: "Sorrow", id: "sorrow" },
  { name: "Surprise", id: "surprise" },
  { name: "Blink", id: "blink" },
  { name: "Normal (open mouth)", id: "normal_open_mouth" },
  { name: "Smile (open mouth)", id: "smile_open_mouth" },
  { name: "Anger (open mouth)", id: "anger_open_mouth" },
  { name: "Surprise (open mouth)", id: "surprise_open_mouth" },
  { name: "Sorrow (open mouth)", id: "sorrow_open_mouth" },
  { name: "Blink (open mouth)", id: "blink_open_mouth" },
  { name: "Wink (left eye open)", id: "wink_left" },
  { name: "Wink (right eye open)", id: "wink_right" },
  { name: "Wink (left eye and mouth open)", id: "wink_left_open_mouth" },
  { name: "Wink (right eye and mouth open)", id: "wink_right_open_mouth" },
  { name: "Wink (left eye open and smiling)", id: "like_wink_left" },
  { name: "Wink (right eye open and smiling)", id: "like_wink_right" },
  { name: "Frustrated", id: "frustrated" },
  { name: "Bored", id: "19" },
  { name: "Bored open mouth", id: "20" },
  { name: "Sigh mouth straight", id: "21" },
  { name: "Sigh", id: "22" },
  { name: "Disgusted mouth straight", id: "23" },
  { name: "Disgusted", id: "24" },
  { name: "Love", id: "25" },
  { name: "Love mouth open", id: "26" },
  { name: "Determined mouth straight", id: "27" },
  { name: "Determined", id: "28" },
  { name: "Cry mouth straight", id: "29" },
  { name: "Cry", id: "30" },
  { name: "Big smile mouth straight", id: "31" },
  { name: "Big smile", id: "32" },
  { name: "Cheeky", id: "33" },
  { name: "Resolve eyes funny mouth", id: "35" },
  { name: "Resolve eyes funny mouth open", id: "36" },
  { name: "Smug", id: "37" },
  { name: "Smug mouth open", id: "38" },
  { name: "Resolve", id: "39" },
  { name: "Resolve mouth open", id: "40" },
  { name: "Unbelievable", id: "41" },
  { name: "Cunning", id: "43" },
  { name: "Raspberry", id: "45" },
  { name: "Innocent", id: "47" },
  { name: "Cat", id: "49", modifier: ExpressionModifier.HideNose },
  { name: "Dog", id: "51", modifier: ExpressionModifier.HideNose },
  { name: "Tasty", id: "53" },
  { name: "Money mouth straight", id: "55" },
  { name: "Money", id: "56" },
  { name: "Confused mouth straight", id: "57" },
  { name: "Confused", id: "58" },
  { name: "Cheerful mouth straight", id: "59" },
  { name: "Cheerful", id: "60" },
  { name: "Blank", id: "61", modifier: ExpressionModifier.HideNoseAndMask },
  { name: "Grumble mouth straight", id: "63" },
  { name: "Grumble", id: "64" },
  { name: "Moved mouth straight", id: "65" },
  { name: "Moved (aka pleading face)", id: "66" },
  { name: "Singing mouth small", id: "67" },
  { name: "Singing", id: "68" },
  { name: "Stunned", id: "69" }
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
    maxHeight: "100%"
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
    expression: "normal",
    renderWidth: 720,
    renderHeight: 720,
    cameraPosition: 1,
    animSpeed: 100
  };

  const base64Data = miiData.encodeStudio().toString("hex");

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
      label: "Camera",
      header:
        "Use mouse or touch to move the camera around.\nUsing touch, rotate the camera around with one finger, and drag with two fingers to pan. Pinch with two fingers to zoom.\nIf you like this site, please consider sharing it with others and credit me or the site when you post your renders! 🙂",
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
            new Html("label").text("Position"),
            new Html("div").class("flex-group").appendMany(
              new Html("button").text("Center horizontally").on("click", () => {
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
              new Html("button").text("Center vertically").on("click", () => {
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
              new Html("button").text("Reset").on("click", () => {
                const newPosition = scene.focusCamera(
                  CameraPosition.MiiFullBody,
                  true,
                  false,
                  true
                )!;
                scene
                  .getControls()
                  .moveTo(newPosition.x, newPosition.y, newPosition.z);
              })
            ),
            new Html("label").text("Rotate"),
            new Html("div").class("flex-group").appendMany(
              new Html("button").text("Up").on("click", () => {
                scene
                  .getControls()
                  .rotateTo(
                    controls.azimuthAngle,
                    controls.polarAngle - rotationFactor
                  );
              }),
              new Html("button").text("Down").on("click", () => {
                scene
                  .getControls()
                  .rotateTo(
                    controls.azimuthAngle,
                    controls.polarAngle + rotationFactor
                  );
              }),
              new Html("button").text("Left").on("click", () => {
                scene
                  .getControls()
                  .rotateTo(
                    controls.azimuthAngle - rotationFactor,
                    controls.polarAngle
                  );
              }),
              new Html("button").text("Right").on("click", () => {
                scene
                  .getControls()
                  .rotateTo(
                    controls.azimuthAngle + rotationFactor,
                    controls.polarAngle
                  );
              }),
              new Html("button").text("Reset").on("click", () => {
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
      label: "Pose",
      header: new Html("div").appendMany(
        new Html("span").html(
          'Change the Body Model option in Settings to get many different options of poses!<br/><br/>Do you like the Mii that does the poses? His name is "dummy".&nbsp;'
        ),
        new Html("a").text("Click here").on("click", (e) => {
          // goodbye custom render :(
          scene.shutdown();
          parent.cleanup();
          modal.qs("button")?.elm.click();

          // easter egg !!!!!
          const mii = new Mii(
            Buffer.from(
              "A0EAwAAAAAAAAAAAgP9wmS/5Fhz6rQAAAABkAHUAbQBtAHkAAAAAAAAAAAAAAEBAEgAeARJoYxoHA2YWIRQTZgwAAAEAUkhQTQBpAGkAQwByAGUAYQB0AG8AcgAAAK6gAAAICAAAAAAAAGQA",
              "base64"
            )
          );
          importMiiConfirmation(mii, "Mii Creator (Special Mii)");
        }),
        new Html("span").html("&nbsp;to obtain him in your library :)")
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
      label: "Expression",
      items: expressionTable.map((k) => ({
        type: FeatureSetType.Icon,
        value: String(k.id),
        icon: `<img class="lazy" width=128 height=128 data-src="${
          Config.renderer.renderHeadshotURLNoParams
        }?width=128&scale=1&data=${encodeURIComponent(base64Data)}&expression=${
          k.id
        }&type=fflmakeicon&verifyCharInfo=0" title="${k.name}">`,
        part: RenderPart.Head
      }))
    },
    animation: {
      label: "Animation",
      header:
        "This usually only applies to Miitomo body model which has animations for its poses.",
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
      .text(playing ? "Pause Animation" : "Pause Animation")
      .on("click", () => {
        if (playing === true) {
          playing = false;
        } else {
          playing = true;
        }
        scene.anim.forEach((anim) => {
          if (playing === true) {
            anim.paused = false;
            pauseButton.text("Pause Animation");
          } else {
            anim.paused = true;
            pauseButton.text("Play Animation");
          }
        });
      })
      .appendTo(tabsContent)
  );

  new Html("button")
    .text("Download PNG")
    .on("click", finalizeRender)
    .appendTo(tabsContent);

  new Html("button")
    .text("Download 3D model")
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
    expression: 0,
    renderWidth: 720,
    renderHeight: 720,
    cameraPosition: 1,
    animSpeed: 1
  };

  function updateConfiguration() {
    scene.getCamera()!.fov = configuration.fov;
    scene.getCamera()!.updateProjectionMatrix();
    switch (configuration.cameraPosition) {
      case 0:
        scene.focusCamera(CameraPosition.MiiHead);
        break;
      case 1:
        scene.focusCamera(CameraPosition.MiiFullBody);
        break;
    }

    // Only update expression when expression is changed.
    // console.log(oldConfiguration.expression, configuration.expression);
    if (oldConfiguration.expression !== configuration.expression) {
      scene.traverseAddFaceMaterial(
        scene.getHead() as Mesh,
        `&data=${encodeURIComponent(base64Data)}&expression=${
          configuration.expression
        }&width=896&verifyCharInfo=0`
      );
    }

    const expr = expressionTable.find((e) => e.id === configuration.expression);

    if (expr)
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
          pauseButton.text("Pause Animation");
        } else {
          anim.paused = true;
          pauseButton.text("Play Animation");
        }
      });
    }

    scene.focusCamera(CameraPosition.MiiFullBody, true, false);
    parentBox.append(scene.getRendererElement());
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
          `${miiData.miiName}_all_body_${new Date().toJSON()}.png`
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
    const shaderSetting = await getSetting("shaderType");
    // const bodyModelHands = await getSetting("bodyModelHands");

    if (shaderSetting === "none") {
      const result = await Modal.prompt(
        "Notice",
        "3D model export looks best when using the Wii U shader, which you aren't using.\nThis may result in incorrect color output. Do you still want to continue?",
        "body"
      );
      if (result === false) return;
    }

    // fix up the materials
    const mats = await traverse3DMaterialFix(scene);
    let i = 0;

    const exporter = new GLTFExporter();
    exporter.parse(
      scene.getScene(),
      (gltf) => {
        console.log("gltf", gltf);
        if (gltf instanceof ArrayBuffer) {
          saveArrayBuffer(
            gltf,
            `${miiData.miiName}_all_body_${new Date().toJSON()}.glb`
          );
        }
        if (shouldClose) {
          scene.shutdown();
          parent.cleanup();
          modal.qs("button")?.elm.click();
        } else {
          // Revert back all materials.
          i = 0;
          scene.getScene().traverse((o) => {
            if ((o as Mesh).isMesh !== true) return;

            const m = o as Mesh;

            m.material = mats.get(i);

            i++;
          });
        }
      },
      (error) => {
        console.error("Oops, something went wrong:", error);
      },
      {
        binary: true
      }
    );
  }
}
