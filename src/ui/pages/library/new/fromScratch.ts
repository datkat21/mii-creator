import localforage from "localforage";
import { MiiEditor, MiiGender } from "../../../../class/MiiEditor";
import Modal from "../../../components/Modal";
import { _shutdown, Library, newMiiId, pushToServer } from "../../Library";
import { miiCreateDialog } from "./_dialog";
import EditorIcons from "../../../../constants/EditorIcons";
import Html from "@datkat21/html";

import { _ } from "../../../../util/Lang";
const __ = _();

export const newFromScratch = () => {
  function cb(gender: MiiGender) {
    return () => {
      _shutdown()();
      new MiiEditor(gender, async (m, shouldSave) => {
        if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
        await pushToServer();
        Library();
      });
    };
  }

  var m = Modal.modal(
    __("Create Mii"),
    __("Select the Mii's gender"),
    "body",
    {
      text: __("Male"),
      callback: cb(MiiGender.Male)
    },
    {
      text: __("Female"),
      callback: cb(MiiGender.Female)
    },
    {
      text: "Cancel",
      callback: () => miiCreateDialog()
    }
  );

  // Add gender select icons
  const genderMaleButton = m.qs(".modal-body button:nth-child(1)")!;
  const genderFemaleButton = m.qs(".modal-body button:nth-child(2)")!;
  if (genderMaleButton) {
    genderMaleButton.classOn("gender-select-btn");
    genderMaleButton.prepend(new Html("span").html(EditorIcons.genderMaleLg));
  }
  if (genderFemaleButton) {
    genderFemaleButton.classOn("gender-select-btn");
    genderFemaleButton.prepend(
      new Html("span").html(EditorIcons.genderFemaleLg)
    );
  }
};
