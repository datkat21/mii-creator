import qrjs from "../external/mii-frontend/qrjs.min.js";
import { encryptAndEncodeVer3StoreDataToQRCodeFormat } from "./EncodeQRCode";
import Mii from "../class/MiiData";
import { CameraPosition, Mii3DScene, SetupType } from "../class/3DScene";
import Html from "@datkat21/html";
import { Vector3 } from "three";
import { AddButtonSounds } from "./AddButtonSounds";
import { Config } from "../config";
import { getMiiIcon } from "../ui/pages/Library";
import { parseHexOrB64ToUint8Array } from "../external/ffl.js/ffl.js";

const makeQrCodeImage = async (mii: string): Promise<HTMLImageElement> => {
  let convertedVer3Data: Uint8Array, ver3QRData: Uint8Array | any[];

  const miiU8 = parseHexOrB64ToUint8Array(mii);

  convertedVer3Data = new Mii(miiU8).export("ffsd");

  ver3QRData = encryptAndEncodeVer3StoreDataToQRCodeFormat(convertedVer3Data);
  // Append any data after the first 96 bytes (fixed by the function above)
  ver3QRData = new Uint8Array([...ver3QRData, ...miiU8.subarray(96)]); // May or may not append nothing.
  // ... after the encrypted portion (appending after that should still be safe to scan)

  const png = qrjs.generatePNG(ver3QRData, { margin: 0 });

  const img = new Image(431, 431);
  img.src = URL.createObjectURL(await (await fetch(png)).blob());
  return new Promise((resolve) => {
    img.onload = () => {
      return resolve(img);
    };
  });
};

export enum MiiCustomRenderType {
  Head,
  HeadOnly,
  Body
}

export const getMiiRender = async (
  mii: Mii,
  type: MiiCustomRenderType,
  useExtendedColors: boolean = true,
  useBlob: boolean = true
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    let tmpMii = new Mii(mii.export());

    // if (useExtendedColors === false) {
    //   tmpMii.trueEyeColor = tmpMii.fflEyeColor;
    //   tmpMii.trueEyebrowColor = tmpMii.fflEyebrowColor;
    //   tmpMii.trueFacialHairColor = tmpMii.fflFacialHairColor;
    //   tmpMii.trueGlassesColor = tmpMii.fflGlassesColor;
    //   tmpMii.trueGlassesType = tmpMii.fflGlassesType;
    //   tmpMii.trueHairColor = tmpMii.fflHairColor;
    //   tmpMii.trueMouthColor = tmpMii.fflMouthColor;
    //   tmpMii.trueSkinColor = tmpMii.fflSkinColor;

    //   tmpMii.extEyeColor = tmpMii.fflEyeColor + 8;
    //   tmpMii.extHairColor = tmpMii.fflHairColor;
    //   tmpMii.extFacelineColor = tmpMii.fflSkinColor;
    //   tmpMii.extBeardColor = tmpMii.fflFacialHairColor;
    //   tmpMii.extEyebrowColor = tmpMii.fflEyebrowColor;
    //   tmpMii.extGlassColor = 0;
    //   tmpMii.extGlassType = tmpMii.fflGlassesType;
    //   tmpMii.extHatColor = 0;
    //   tmpMii.extHatType = 0;
    // }

    let parent = new Html("div")
      .style({
        width: "720px",
        height: "720px",
        opacity: "0"
        // position: "fixed",
      })
      .appendTo("body");
    const scene = new Mii3DScene(tmpMii, parent.elm, SetupType.Screenshot);
    scene.init().then(async () => {
      await scene.updateBody();
      await scene.updateMiiHead();
      // swap pose for render
      scene.anim.forEach((a) => {
        a.timeScale = 0;
        // a.stop();
        // a.reset();
      });
      scene.swapAnimation("Pose.01");

      let scn = scene.getScene()!,
        cam = scene.getCamera()!,
        ctl = scene.getControls()!,
        pos = new Vector3();
      switch (type) {
        case MiiCustomRenderType.Head:
          // zoom in on head
          setTimeout(() => {
            scene.focusCamera(0, true, false);
            ctl.dollyTo(50);
            cam.fov = 15;
            cam.updateProjectionMatrix();
          }, 300);
          break;
        case MiiCustomRenderType.HeadOnly:
          // hide body from view
          scn.getObjectByName("body_m")!.visible = false;
          scn.getObjectByName("hands_m")!.visible = false;
          scn.getObjectByName("legs_m")!.visible = false;
          scn.getObjectByName("body_f")!.visible = false;
          scn.getObjectByName("hands_f")!.visible = false;
          scn.getObjectByName("legs_f")!.visible = false;
          // Get the bounding box of the object
          scene.focusCamera(CameraPosition.MiiHead, true, false);
          ctl.dollyTo(40);
          cam.fov = 15;
          cam.updateProjectionMatrix();
          break;
        case MiiCustomRenderType.Body:
          // default screenshot camera position
          scene.focusCamera(CameraPosition.MiiFullBody, true, false);
          ctl.dollyTo(90, false);
          cam.fov = 15;
          cam.updateProjectionMatrix();
          break;
      }

      parent.append(scene.getRendererElement());

      const renderer = scene.getRenderer();
      setTimeout(() => {
        if (useBlob)
          renderer.domElement.toBlob((blob) => {
            const image = new Image(
              renderer.domElement.width,
              renderer.domElement.height
            );
            image.src = URL.createObjectURL(blob!);
            console.log("Temporary render URL:", image.src);
            image.onload = () => {
              resolve(image);
              scene.shutdown();
              parent.cleanup();
            };
          });
        else {
          const url = renderer.domElement.toDataURL("png", 100);
          const image = new Image(
            renderer.domElement.width,
            renderer.domElement.height
          );
          image.src = url;
          image.onload = () => {
            resolve(image);
            scene.shutdown();
            parent.cleanup();
          };
        }
      }, 500);
    });
  });
};

export const getBackground = async (
  isMiic: boolean
): Promise<HTMLImageElement> => {
  let url: string = "";
  if (isMiic) {
    url = "./assets/images/bg_qr_miic.png";
  } else {
    url = "./assets/images/bg_qr_wiiu.png";
  }
  const blob = await (await fetch(url)).blob();
  const img = new Image(1280, 720);
  img.src = URL.createObjectURL(blob);
  return new Promise((resolve) => {
    img.onload = () => {
      return resolve(img);
    };
  });
};

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
    };
  });
}

export const QRCodeCanvas = async (
  mii: string,
  extendedColors: boolean = true
) => {
  const miiData = new Mii(mii);
  let render: HTMLImageElement;
  if (Config.renderer.useRendererServer) {
    render = await loadImage(
      `${Config.renderer.renderFullBodyAltURL}&data=${encodeURIComponent(
        miiData.exportHex("studioData")
      )}&${Config.renderer.hatTypeParam}=${
        miiData.hatType + 1 + Config.renderer.hatTypeAdd
      }&${Config.renderer.hatColorParam}=${
        miiData.hatFavoriteColor - 1 + Config.renderer.hatColorAdd
      }`
    );
  } else {
    // TODO
    // render
  }
  const qrCodeSource = await makeQrCodeImage(mii);
  const background = await getBackground(extendedColors);

  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d")!;

  // background
  ctx.drawImage(background, 0, 0);
  // mark
  ctx.font = '500 24px "NTLG", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#cccccc";
  ctx.fillText(`${location.origin}`, 32, 667);
  // version mark
  ctx.font = '500 24px "NTLG", sans-serif';
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#cccccc";
  ctx.fillText(`Made with Mii Creator ${Config.version.string}`, 1248, 667);
  ctx.drawImage(render, 54, -54, 714, 953);
  // qr code container
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(769, 79, 463, 463, [16, 16, 0, 0]);
  ctx.fill();
  ctx.drawImage(qrCodeSource, 797, 107, 408, 408);
  // name container
  ctx.fillStyle = "#707070";
  ctx.beginPath();
  ctx.roundRect(769, 542, 463, 99, [0, 0, 16, 16]);
  ctx.fill();
  // mii name
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '500 38px "NTLG", sans-serif';
  ctx.fillText(miiData.nickname, 1005, 591);
  const canvasPngImage = canvas.toDataURL("png", 100);
  return canvasPngImage;
};

// This recreates the html from the update changelog
export async function createMiiCard(
  parent: Html | HTMLElement,
  name: string,
  username: string,
  link: string,
  message: string,
  studioData: string,
  extra: string = ""
) {
  new Html("div")
    .class("flex-group")
    .style({
      gap: "0",
      "justify-content": "flex-start",
      "text-align": "left"
    })
    .appendMany(
      new Html("img")
        .attr({
          width: 96,
          draggable: "false",
          src: await getMiiIcon(studioData, "creditIcon", "creditIcon", 128)
          // Config.renderer.renderHeadshotURLNoParams +
          // `?data=${encodeURIComponent(
          //   studioData
          // )}&type=variableiconbody&verifyCharInfo=0&shaderType=switch&width=96&source=credits&characterYRotate=8&bodyType=switch&` +
          // extra,
        })
        .style({ width: "96px", height: "96px" }),
      new Html("div")
        .class("col")
        .style({ gap: "12px", flex: "1" })
        .appendMany(
          new Html("small")
            .appendMany(
              new Html("span").text(name).style({
                display: "inline",
                width: "max-content"
              }),
              AddButtonSounds(
                new Html("a")
                  .text(`(@${username})`)
                  .attr({ target: "_blank", href: link })
              )
            )
            .style({ display: "flex", gap: "8px" }),
          new Html("div").html(message)
        )
    )
    .appendTo(parent);
}
export function createIconCard(
  parent: Html | HTMLElement,
  name: string,
  link: string,
  message: string,
  icon: string
) {
  let msg: Html;
  if (link !== "") {
    msg = new Html("a").attr({ href: link, target: "_blank" }).html(message);
  } else {
    msg = new Html("div").html(message);
  }

  new Html("div")
    .class("flex-group")
    .style({
      gap: "0",
      "justify-content": "flex-start",
      "text-align": "left"
    })
    .appendMany(
      new Html("div").html(icon).style({ width: "96px", height: "96px" }),
      new Html("div")
        .class("col")
        .style({ gap: "12px", flex: "1" })
        .appendMany(
          new Html("small")
            .appendMany(
              new Html("span").text(name).style({
                display: "inline",
                width: "max-content"
              })
            )
            .style({ display: "flex", gap: "8px" }),
          msg
        )
    )
    .appendTo(parent);
}
