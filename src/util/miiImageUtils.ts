import qrjs from "../external/mii-frontend/qrjs.min.js";
import { encryptAndEncodeVer3StoreDataToQRCodeFormat } from "./EncodeQRCode";
import Mii from "../class/MiiData";
import { CameraPosition, Mii3DScene, SetupType } from "../class/3DScene";
import Html from "@datkat21/html";
import { Vector3 } from "three";
import { AddButtonSounds } from "./AddButtonSounds";
import { Config } from "../config";
import { getMiiIcon } from "../ui/pages/Library";
import { parseHexOrB64ToUint8Array } from "../external/ffl.js/ffl";
import EditorIcons from "../constants/EditorIcons";
import { MiiCreatorV4AppendData } from "../class/struct/MiiCreatorV4Data";
// import { getFFLWorkerMakeIcon } from "./FFLLoader";
import { ViewType } from "./camera.js";
import {
  ToVer3EyeColorTable,
  ToVer3FacelineColorTable,
  ToVer3GlassColorTable,
  ToVer3GlassTypeTable,
  ToVer3HairColorTable,
  ToVer3MouthColorTable,
  Ver3EyeColorTable,
  Ver3FacelineColorTable,
  Ver3GlassColorTable,
  Ver3HairColorTable,
  Ver3MouthColorTable
} from "../constants/ColorTables.js";
import { createMiiRender, iconRenderer } from "./IconRendering.js";
import { getFFL } from "./FFLLoader.js";

const makeQrCodeImage = async (mii: Mii): Promise<HTMLImageElement> => {
  let convertedVer3Data: Uint8Array, ver3QRData: Uint8Array | any[];

  const miiU8 = mii.export("ffsd_append_miic");

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

export const getBackground = async (
  extended: boolean
): Promise<HTMLImageElement> => {
  let url: string = "";
  if (extended) {
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
  mii: Mii,
  extendedColors: boolean = true
) => {
  let render: HTMLImageElement,
    renderPos = { y: 0, x: 0, width: 0, height: 0 };
  if (Config.renderer.useRendererServer) {
    render = await loadImage(
      `${Config.renderer.renderFullBodyAltURL}&data=${encodeURIComponent(
        mii.exportHex("studioData")
      )}&${Config.renderer.hatTypeParam}=${
        mii.hatType + 1 + Config.renderer.hatTypeAdd
      }&${Config.renderer.hatColorParam}=${
        mii.hatFavoriteColor - 1 + Config.renderer.hatColorAdd
      }`
    );
    renderPos = { x: 54, y: -54, width: 714, height: 953 };
  } else {
    // TODO
    // render
    let mii2 = new Mii(mii.export("studioData"));

    mii2.beardColor = Ver3HairColorTable[ToVer3HairColorTable[mii2.beardColor]];
    mii2.eyeColor = Ver3EyeColorTable[ToVer3EyeColorTable[mii2.eyeColor]];
    mii2.eyebrowColor =
      Ver3HairColorTable[ToVer3HairColorTable[mii2.eyebrowColor]];
    mii2.facelineColor =
      Ver3FacelineColorTable[ToVer3FacelineColorTable[mii2.facelineColor]];
    mii2.glassColor =
      Ver3GlassColorTable[ToVer3GlassColorTable[mii2.glassColor]];
    mii2.glassType = ToVer3GlassTypeTable[mii2.glassType];
    mii2.hairColor = Ver3HairColorTable[ToVer3HairColorTable[mii2.hairColor]];
    mii2.mouthColor =
      Ver3MouthColorTable[ToVer3MouthColorTable[mii2.mouthColor]];
    mii2.facePaintColor = -1;
    mii2.hatType = -1;
    mii2.clothesType = -1;
    mii2.shirtColor = -1;
    mii2.pantsColor = -1;
    mii2.shoesColor = -1;
    mii2.eyeSclera = 0;

    const renderResult = await getMiiIcon(
      mii2,
      "qr_code",
      "all_body_sugar",
      720,
      0,
      true
    );

    // Load in the image
    let imageURL: string = renderResult.url;
    const img = new Image(720, 720);
    img.src = imageURL;
    render = await new Promise((resolve) => {
      img.onload = () => {
        renderResult.dispose();
        return resolve(img);
      };
    });
    renderPos = { x: -65, y: -54, width: 952, height: 952 };
  }
  console.log("got render");
  const qrCodeSource = await makeQrCodeImage(mii);
  const background = await getBackground(extendedColors);

  let favoriteIcon: HTMLImageElement | undefined = undefined;
  if (mii.favorite === 1 || mii.special === 1) {
    console.log("loading favorite icon");
    favoriteIcon = await new Promise<HTMLImageElement>((resolve) => {
      var img = new Image();
      img.onload = function () {
        resolve(img);
      };

      if (mii.favorite === 1)
        img.src =
          "data:image/svg+xml," + encodeURIComponent(EditorIcons.favorite);
      if (mii.special === 1)
        img.src =
          "data:image/svg+xml," + encodeURIComponent(EditorIcons.special);
    });
    console.log("loaded favorite icon");
  }

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
  ctx.drawImage(
    render,
    renderPos.x,
    renderPos.y,
    renderPos.width,
    renderPos.height
  );
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

  // favorite icon (if exists)
  if (favoriteIcon) {
    ctx.drawImage(favoriteIcon, 1172, 480, 102, 102);
    console.log("drawing favorite icon");
  }

  // mii name
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '500 38px "NTLG", sans-serif';
  ctx.fillText(mii.nickname, 1005, 591);
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
  const creditIcon = await getMiiIcon(
    studioData,
    "creditIcon",
    "creditIcon",
    128
  );
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
          src: creditIcon.url
          // Config.renderer.renderHeadshotURLNoParams +
          // `?data=${encodeURIComponent(
          //   studioData
          // )}&type=variableiconbody&verifyCharInfo=0&shaderType=switch&width=96&source=credits&characterYRotate=8&bodyType=switch&` +
          // extra,
        })
        .on("load", creditIcon.dispose)
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
