import Html from "@datkat21/html";
import localforage from "localforage";
import { Buffer } from "../../../../../node_modules/buffer";
import { MiiEditor } from "../../../../class/MiiEditor";
import { FFLiDatabaseRandom_Get } from "../../../../external/ffl/FFLiDatabaseRandom";
import Mii from "../../../../external/mii-js/mii";
import Modal from "../../../components/Modal";
import {
  _shutdown,
  Library,
  miiIconUrl,
  newMiiId,
  playLoadSound
} from "../../Library";
import { miiCreateDialog } from "./_dialog";

export const newFromLookalike = async () => {
  var m = Modal.modal(
    "Choose a look-alike",
    "",
    "body",
    {
      text: "Cancel",
      callback(e) {
        miiCreateDialog();
      }
    },
    {
      text: "Confirm"
    }
  );
  m.classOn("random-mii-grid");
  const container = m.qs(".modal-body")!;
  // Hide unused elements without deleting them
  container
    .qsa("span,.flex-group *")!
    .forEach((e) => e!.style({ display: "none" }));

  let randomMiiContainer = new Html("div")
    .class("random-mii-container")
    .appendTo(container);

  const group = container.qs(".flex-group")!;

  container.prepend(
    new Html("span")
      .style({
        width: "100%",
        padding: "14px 18px",
        background: "var(--hover)",
        color: "var(--text)",
        border: "1px solid var(--stroke)",
        "border-radius": "6px",
        "flex-shrink": "0"
      })
      .text(
        // arian wrote this for me.. because i didn't want to offend anyone having "race" in my mii creator😭
        "All of the options here are what Nintendo originally programmed in. Please let me know if you want more options added."
      )
  );

  new Html("button")
    .class("primary")
    .text("Reroll")
    .on("click", () => reroll())
    .appendTo(group);

  let options: Record<string, number> = {};

  function makeSelect(property: string, values: HTMLOptionElement[]) {
    console.log(values);
    return new Html("select").appendMany(...values).on("input", (e) => {
      options[property] = parseInt((e.target as HTMLSelectElement).value);
      if (options[property] === -1) delete options[property];

      console.log(options);
    });
  }

  group.prependMany(
    makeSelect("race", [
      new Option("Skin tone", "-1", true, true),
      new Option("(Random)", "-1"),
      new Option("Black", "0"),
      new Option("White", "1"),
      new Option("Asian", "2")
    ]),
    makeSelect("gender", [
      new Option("Gender", "-1", true, true),
      new Option("(Random)", "-1"),
      new Option("Male", "0"),
      new Option("Female", "1")
    ]),
    makeSelect("hairColor", [
      new Option("Hair color", "-1", true, true),
      new Option("(Random)", "-1"),
      new Option("Black", "0"),
      new Option("Brown", "1"),
      new Option("Red", "2"),
      new Option("Light brown", "3"),
      new Option("Gray", "4"),
      new Option("Green", "5"),
      new Option("Dirty blonde", "6"),
      new Option("Blonde", "7")
    ]),
    makeSelect("favoriteColor", [
      new Option("Favorite color", "-1", true, true),
      new Option("(Random)", "-1"),
      new Option("Red", "0"),
      new Option("Orange", "1"),
      new Option("Yellow", "2"),
      new Option("Lime", "3"),
      new Option("Green", "4"),
      new Option("Blue", "5"),
      new Option("Cyan", "6"),
      new Option("Pink", "7"),
      new Option("Purple", "8"),
      new Option("Brown", "9"),
      new Option("White", "10"),
      new Option("Black", "11")
    ]),
    makeSelect("eyeColor", [
      new Option("Eye color", "-1", true, true),
      new Option("(Random)", "-1"),
      new Option("Black", "0"),
      new Option("Gray", "1"),
      new Option("Brown", "2"),
      new Option("Hazel", "3"),
      new Option("Blue", "4"),
      new Option("Green", "5")
    ]),
    makeSelect("age", [
      new Option("Age", "-1", true, true),
      new Option("(Random)", "-1"),
      new Option("Child", "0"),
      new Option("Adult", "1"),
      new Option("Elder", "2")
    ])
  );

  function reroll() {
    randomMiiContainer.clear();
    for (let i = 0; i < 21; i++) {
      const randomMii = new Mii(
        Buffer.from(
          "AwEAAAAAAAAAAAAAgP9wmQAAAAAAAAAAAABNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMNn",
          "base64"
        )
      );
      FFLiDatabaseRandom_Get(randomMii, options);

      let button = new Html("button")
        .append(new Html("img").attr({ src: "" }))
        .appendTo(randomMiiContainer);

      miiIconUrl(randomMii, "lookalike").then((icon) => {
        playLoadSound();
        button.qs("img")?.attr({ src: icon });
      });

      const randomMiiB64 = randomMii.encode().toString("base64");

      button.on("click", () => {
        // Click the invisible "confirm" button to close the modal normally
        m.qs(".flex-group button")?.elm.click();
        _shutdown()();
        new MiiEditor(
          0,
          async (m, shouldSave) => {
            if (shouldSave === true)
              await localforage.setItem(await newMiiId(), m);
            Library();
          },
          randomMiiB64
        );
      });
    }
  }
  reroll();
};
