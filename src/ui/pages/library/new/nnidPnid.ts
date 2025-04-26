import localforage from "localforage";
import { MiiEditor } from "../../../../class/MiiEditor";
import { Config } from "../../../../config";
import Loader from "../../../components/Loader";
import Modal from "../../../components/Modal";
import { _shutdown, Library, newMiiId } from "../../Library";
import { miiCreateDialog } from "./_dialog";

export const newFromNNID = async () => {
  const input = await Modal.input(
    "Nintendo Network ID",
    "Enter NNID of user..",
    "Username",
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
    await Modal.alert("Error", `Couldn't get Mii: ${result.error}`);
    return;
  }

  _shutdown()();
  new MiiEditor(
    0,
    async (m, shouldSave) => {
      if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
      Library();
    },
    result.data
  );
};

export const newFromPNID = async () => {
  const input = await Modal.input(
    "Pretendo Network ID",
    "Enter PNID of user..",
    "Username",
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
    await Modal.alert("Error", `Couldn't get Mii: ${await pnid.text()}`);
    return;
  }

  _shutdown()();
  new MiiEditor(
    0,
    async (m, shouldSave) => {
      if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
      Library();
    },
    (await pnid.json()).data
  );
};
