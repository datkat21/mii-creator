import Html from "@datkat21/html";
import localforage from "localforage";
import { MiiEditor } from "../../../../class/MiiEditor";
import {
  FFLiDatabaseRandom_Get,
  RandomizeMii,
  type FFLiDatabaseRandom_GetInit
} from "../../../../external/ffl/FFLiDatabaseRandom";
import Mii from "../../../../class/MiiData";
import Modal from "../../../components/Modal";
import {
  _shutdown,
  Library,
  getMiiIcon,
  newMiiId,
  playLoadSound
} from "../../Library";
import { miiCreateDialog } from "./_dialog";
import { dataToBase64 } from "../../../../util/dataConvert";
import { AddButtonSounds } from "../../../../util/AddButtonSounds";

import { _ } from "../../../../util/Lang";
const __ = _();

export const newFromLookalike = async () => {
  var lookalikeModal = Modal.modal(
    __("Choose a look-alike"),
    "",
    "body",
    {
      text: "Cancel",
      callback(e) {
        miiCreateDialog();
      }
    },
    {
      text: __("Confirm")
    }
  );
  lookalikeModal.classOn("random-mii-grid");
  const container = lookalikeModal.qs(".modal-body")!;
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
        // Message used at the top of lookalike screen
        __(
          "All of the options here are what Nintendo originally programmed in. Please let me know if you want more options added."
        )
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
      new Option(
        // lookalike skin tone dropdown
        __("Skin tone"),
        "-1",
        true,
        true
      ),
      new Option(__("(Random)"), "-1"),
      new Option(
        // skin tone black
        __("Black"),
        "0"
      ),
      new Option(
        // skin tone white
        __("White"),
        "1"
      ),
      new Option(
        // skin tone asian
        __("Asian"),
        "2"
      )
    ]),
    makeSelect("gender", [
      new Option(__("Gender"), "-1", true, true),
      new Option(__("(Random)"), "-1"),
      new Option(__("Male"), "0"),
      new Option(__("Female"), "1")
    ]),
    makeSelect("hairColor", [
      new Option(__("Hair color"), "-1", true, true),
      new Option(__("(Random)"), "-1"),
      new Option(
        // hair color black
        __("Black"),
        "0"
      ),
      new Option(
        // hair color brown
        __("Brown"),
        "1"
      ),
      new Option(
        // hair color reddish
        __("Auburn"),
        "2"
      ),
      new Option(
        // hair color hazel
        __("Hazel"),
        "3"
      ),
      new Option(
        // hair color gray
        __("Gray"),
        "4"
      ),
      new Option(
        // hair color olive
        __("Olive"),
        "5"
      ),
      new Option(
        // hair color dark blond
        __("Medium-blonde"),
        "6"
      ),
      new Option(
        // hair color light blond
        __("Light-blonde"),
        "7"
      )
    ]),
    makeSelect("favoriteColor", [
      new Option(
        // lookalike favorite color dropdown
        __("Favorite color"),
        "-1",
        true,
        true
      ),
      new Option(__("(Random)"), "-1"),
      new Option(__("Red"), "0"),
      new Option(__("Orange"), "1"),
      new Option(__("Yellow"), "2"),
      new Option(__("Lime"), "3"),
      new Option(__("Green"), "4"),
      new Option(__("Blue"), "5"),
      new Option(__("Cyan"), "6"),
      new Option(__("Pink"), "7"),
      new Option(__("Purple"), "8"),
      new Option(__("Brown"), "9"),
      new Option(__("White"), "10"),
      new Option(__("Black"), "11")
    ]),
    makeSelect("eyeColor", [
      new Option(
        // lookalike eye color dropdown
        __("Eye color"),
        "-1",
        true,
        true
      ),
      new Option(__("(Random)"), "-1"),
      new Option(__("Black"), "0"),
      new Option(__("Gray"), "1"),
      new Option(__("Brown"), "2"),
      new Option(__("Hazel"), "3"),
      new Option(__("Blue"), "4"),
      new Option(__("Green"), "5")
    ]),
    makeSelect("age", [
      new Option(
        // lookalike age dropdown
        __("Age"),
        "-1",
        true,
        true
      ),
      new Option(__("(Random)"), "-1"),
      new Option(__("Child"), "0"),
      new Option(__("Adult"), "1"),
      new Option(__("Elder"), "2")
    ])
  );

  function reroll() {
    randomMiiContainer.clear();
    for (let i = 0; i < 24; i++) {
      const randomMii = new Mii(
        "AwEAAAAAAAAAAAAAgP9wmQAAAAAAAAAAAABNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMNn"
      );
      FFLiDatabaseRandom_Get(randomMii, options);

      let button = new Html("button")
        .append(new Html("img").attr({ src: "" }))
        .appendTo(randomMiiContainer);

      getMiiIcon(randomMii, "lookalike").then((icon) => {
        playLoadSound();
        button.qs("img")?.attr({ src: icon });
      });

      button.on("click", async () => {
        confirmOrReviseMii(randomMii, options, lookalikeModal);
      });
    }
  }
  reroll();
};

export function confirmOrReviseMii(
  mii: Mii,
  options: FFLiDatabaseRandom_GetInit,
  modalRef?: Html
) {
  const miiIcon = new Html("img").style({
    opacity: "0",
    width: "210px",
    height: "210px",
    transition: "opacity 0.35s ease"
  });

  getMiiIcon(mii, "lookalike_preview", "all_body_sugar", 210).then((icon) => {
    miiIcon.attr({ src: icon }).style({ opacity: "1" });
  });

  Modal.modal(
    // Confirmation message
    __("Is this OK?"),
    new Html("div").style({ margin: "0 auto" }).append(miiIcon),
    "body",
    // does nothing
    {
      text: "Cancel"
    },
    {
      text: __("Close"),
      type: "danger"
    },
    {
      text: __("Revise"),
      callback(e) {
        let currentMii = mii;

        const m = Modal.modal(
          "Revise",
          new Html("div").appendMany(
            new Html("span").style({ margin: "0 auto" }).text(
              // lookalike revise screen message
              __("Click any to reroll")
            ),
            new Html("div").class("menu").style({
              display: "flex",
              "flex-direction": "column",
              gap: "0.5rem"
            })
          ),
          "body",
          { text: "Cancel" },
          {
            text: __("Done"),
            callback(e) {
              confirmOrReviseMii(currentMii, options, modalRef);
            }
          }
        );

        m.qs(".modal-content")!.style({
          height: "max-content",
          "max-height": "100vh"
        });

        const menuDiv = m.qs(".menu")!;

        function regenerate() {
          menuDiv.clear();

          let rows: Mii[][] = [];
          for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;

            if (rows[row] === undefined) {
              rows[row] = [];
            }

            if (i === 4) {
              // Use the current version of the Mii for the middle icon
              rows[row][col] = currentMii;
            } else {
              // do random generation
              var mii = new Mii(currentMii.export());
              console.log("options:", options);
              RandomizeMii(mii, options);
              rows[row][col] = mii;
            }
          }

          // Populate
          for (const row of rows) {
            const rowElm = new Html("div")
              .style({ display: "flex", gap: "0.5rem" })
              .appendTo(menuDiv);

            for (const child of row) {
              const button = new Html("button").style({
                padding: "0"
              });
              const img = new Html("img")
                .style({
                  width: "108px",
                  height: "108px",
                  opacity: "0",
                  transition: "opacity 0.2s ease"
                })
                .appendTo(button);
              rowElm.append(button);

              button.on("click", (e) => {
                e.preventDefault();
                currentMii = child;
                requestAnimationFrame(() => {
                  regenerate();
                });
              });

              getMiiIcon(
                child,
                "lookalike_regenerate",
                "fflmakeicon",
                108
              ).then((icon) => {
                playLoadSound();
                img.attr({ src: icon }).style({ opacity: "1" });
              });
            }
          }
        }

        regenerate();
      }
    },
    {
      text: __("Done"),
      type: "primary",
      callback(e) {
        const randomMiiB64 = dataToBase64(mii.export("miic"));
        // Click the invisible "confirm" button to close the modal normally
        if (modalRef) modalRef.qs(".flex-group button")?.elm.click();
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
      }
    }
  );
}
