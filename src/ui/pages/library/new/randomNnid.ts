import localforage from "localforage";
import { MiiEditor } from "../../../../class/MiiEditor";
import { Config } from "../../../../config";
import Loader from "../../../components/Loader";
import { _shutdown, Library, newMiiId, pushToServer } from "../../Library";

export const newFromRandonNNID = async () => {
  Loader.show();
  let random = await fetch(Config.apis.nnidRandomURL).then((j) => j.json());
  Loader.hide();

  _shutdown()();
  new MiiEditor(
    0,
    async (m, shouldSave) => {
      if (shouldSave === true) await localforage.setItem(await newMiiId(), m);
      await pushToServer();
      Library();
    },
    random.data
  );
};
