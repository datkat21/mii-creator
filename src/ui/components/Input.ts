import Html from "@datkat21/html";
import type { MiiEditor } from "../../class/MiiEditor";

// helper input text box to work with the editor ui
export function Input(
  label: string,
  value: string,
  callback: (s: string) => any,
  validate?: (s: string) => string | true,
  editor?: MiiEditor
): Html {
  let id = String(performance.now());

  function checkValidity(value: any) {
    if (editor) {
      editor.dirty = true;
      if (validate) {
        const result = validate(value);
        if (result === true) {
          input.classOff("invalid");
          if (editor)
            editor.errors.set(label, {
              valid: true,
              reason: "Valid"
            });
          callback(value);
        } else {
          input.classOn("invalid");
          if (editor)
            editor.errors.set(label, {
              valid: false,
              reason: String(result)
            });
        }
      }
    }
  }
  let input: Html = new Html("input")
    .id(id)
    .attr({ type: "text", value: value })
    .on("input", (e) => {
      const target = e.target as HTMLInputElement;
      checkValidity(target.value);
    });
  if (validate) validate(value);
  return new Html("div")
    .class("input-group")
    .appendMany(new Html("label").attr({ for: id }).text(label), input);
}
