import Html from "@datkat21/html";
import EditorIcons from "../../constants/EditorIcons";

let loader: Html;

export default {
  show() {
    if (loader === undefined) {
      loader = new Html("div")
        .class("loader", "active")
        .html(EditorIcons.loading)
        .appendTo("body");
    } else {
      loader.classOn("active");
    }
  },
  hide() {
    if (loader) loader.classOff("active");
  }
};
