import { Config } from "../config";
import type Mii from "../external/mii-js/mii";

export class Mii2DRenderer {
  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  mii: Mii;

  #headImageFront!: HTMLImageElement;
  #headImageBack!: HTMLImageElement;
  #bodyImage!: HTMLImageElement;
  // #pantsImage!: HTMLImageElement;

  constructor(parent: HTMLElement, mii: Mii) {
    this.mii = mii;

    // init canvas images
    this.#headImageFront = new Image();
    this.#headImageBack = new Image();
    this.#bodyImage = new Image();
    // this.#pantsImage = new Image();

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    canvas.classList.add("renderer");
    parent.appendChild(canvas);

    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d")!;

    if (this.#ctx === null) {
      throw new Error("ctx is null when initializing 2D renderer");
    }

    this.init();
  }

  async init() {
    console.log("loading images");
    await this.updateImages();
    console.log("ready");
    this.render();
  }

  async updateImages() {
    const headImgURL = `${Config.renderer.renderFFLMakeIcon}&data=${this.mii
      .encodeStudio()
      .toString("hex")}&hatType=${this.mii.extHatType}&hatColor=${
      this.mii.extHatColor
    }&miiName=${encodeURIComponent(
      this.mii.miiName
    )}&creatorName=${encodeURIComponent(this.mii.creatorName)}`;

    // const bodyImgURL = `./assets/images/2d/m-body-0.png`;
    // const pantImageURL = `./assets/images/2d/m-legs-gray.png`;

    this.#headImageFront.src = headImgURL + "&splitMode=front";
    this.#headImageBack.src = headImgURL + "&splitMode=back";
    this.#bodyImage.src = this.mii.studioAssetUrlBody(); // bodyImgURL;
    // this.#pantsImage.src = pantImageURL;

    await Promise.all([
      new Promise((resolve) => {
        this.#headImageFront.onload = () => {
          console.log("Head image loaded");
          resolve(true);
        };
      }),
      new Promise((resolve) => {
        this.#headImageBack.onload = () => {
          console.log("Head image loaded");
          resolve(true);
        };
      }),
      new Promise((resolve) => {
        this.#bodyImage.onload = () => {
          console.log("Body image loaded");
          resolve(true);
        };
      })
      // new Promise((resolve) => {
      //   this.#pantsImage.onload = () => {
      //     console.log("Pant image loaded");
      //     resolve(true);
      //   };
      // }),
    ]);
  }

  render() {
    const bodyWidth =
      (this.mii.height * 1.7 + 220) * (0.003 * this.mii.build + 0.6);
    const bodyHeight = this.mii.height * 3.5 + 227;
    const bodyXPos = (this.#canvas.width - bodyWidth) / 2;
    const bodyYPos = this.#canvas.height - bodyHeight;
    const headYPos = bodyYPos - 400;

    console.log("render", bodyWidth, bodyHeight);

    // clear fill
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    this.#ctx.drawImage(
      this.#headImageBack,
      this.#canvas.width / 4,
      headYPos,
      this.#canvas.width / 2,
      this.#canvas.height / 2
    );
    this.#ctx.drawImage(
      this.#bodyImage,
      bodyXPos,
      bodyYPos,
      bodyWidth,
      bodyHeight
    );
    // this.#ctx.drawImage(
    //   this.#pantsImage,
    //   bodyXPos,
    //   bodyYPos,
    //   bodyWidth,
    //   bodyHeight
    // );
    this.#ctx.drawImage(
      this.#headImageFront,
      this.#canvas.width / 4,
      headYPos,
      this.#canvas.width / 2,
      this.#canvas.height / 2
    );
  }
}
