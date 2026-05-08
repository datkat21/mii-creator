import Html from "@datkat21/html";
import { playSound } from "../../class/audio/SoundManager";

let notifyBox: Html;

export default {
  show: function (
    title: string,
    description: string,
    callback?: () => any,
    callbackTitle = ""
  ) {
    if (notifyBox === undefined)
      notifyBox = new Html("div").class("notify-box").appendTo("body");

    let notifyTitle = new Html("div").class("notify-title").text(title);
    let notifyDescription = new Html("div")
      .class("notify-text")
      .text(description);

    playSound("notice");

    let notify = new Html("div")
      .class("notify", "slideIn")
      .appendMany(notifyTitle, notifyDescription)
      .appendTo(notifyBox);

    if (callback) {
      notify.append(
        new Html("button").on("click", callback).text(callbackTitle)
      );
    }
    setTimeout(() => {
      notify.classOff("slideIn").classOn("slideOut");
      setTimeout(() => {
        notify.cleanup();
      }, 500);
    }, 5000);
  }
};
