import localforage from "localforage";
import { MiiEditor } from "../../../../class/MiiEditor";
import { Config } from "../../../../config";
import Loader from "../../../components/Loader";
import Modal from "../../../components/Modal";
import { _shutdown, Library, newMiiId, pushToServer } from "../../Library";
import { miiCreateDialog } from "./_dialog";

import { _ } from "../../../../util/Lang";
const __ = _();

export const newFromNNID = async () => {
  const input = await Modal.input(
    __("Nintendo Network ID"),
    __("Enter NNID of user.."),
    __("Username"),
    "body",
    false
  );
  if (input === false) {
    return miiCreateDialog();
  }

  Loader.show();

  let nnid = await fetch(Config.apis.nnidFetchURL(encodeURIComponent(input)));

  const result = await nnid.json();

  Loader.hide();
  if (result.error !== undefined) {
    await Modal.alert(__("Error"), __("Couldn't get Mii: %1", result.error));
    return;
  }

  _shutdown()();
  new MiiEditor(
    0,
    async (m, shouldSave) => {
      if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
      await pushToServer();
      Library();
    },
    result.data
  );
};

export const newFromPNID = async () => {
  const input = await Modal.input(
    __("Pretendo Network ID"),
    __("Enter PNID of user.."),
    __("Username"),
    "body",
    false
  );
  if (input === false) {
    return miiCreateDialog();
  }

  Loader.show();

  let pnid = await fetch(Config.apis.pnidFetchURL(encodeURIComponent(input)));

  Loader.hide();
  if (!pnid.ok) {
    await Modal.alert(
      __("Error"),
      __("Couldn't get Mii: %1", await pnid.text())
    );
    return;
  }

  _shutdown()();
  new MiiEditor(
    0,
    async (m, shouldSave) => {
      if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
      await pushToServer();
      Library();
    },
    (await pnid.json()).data
  );
};
