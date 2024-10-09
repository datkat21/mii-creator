import Html from "@datkat21/html";
import localforage from "localforage";
import { MiiEditor, MiiGender } from "../../class/MiiEditor";
import { MainMenu } from "./MainMenu";
import Modal from "../components/Modal";
import Mii from "../../external/mii-js/mii";
import { Buffer } from "../../../node_modules/buffer/index";
import Loader from "../components/Loader";
import { playSound } from "../../class/audio/SoundManager";
import { AddButtonSounds } from "../../util/AddButtonSounds";

export async function Library() {
  function shutdown(): Promise<void> {
    return new Promise((resolve) => {
      container.class("fadeOut");
      setTimeout(() => {
        container.cleanup();
        resolve();
      }, 500);
    });
  }

  const container = new Html("div").class("mii-library").appendTo("body");

  const sidebar = new Html("div").class("library-sidebar").appendTo(container);

  const libraryList = new Html("div").class("library-list").appendTo(container);

  const miis = await Promise.all(
    (
      await localforage.keys()
    )
      .filter((k) => k.startsWith("mii-"))
      .map(async (k) => ({
        id: k,
        mii: (await localforage.getItem(k)) as string,
      }))
  );

  for (const mii of miis) {
    let miiContainer = new Html("div")
      .class("library-list-mii")
      .on("click", miiEdit(mii, shutdown));

    AddButtonSounds(miiContainer);

    const miiData = new Mii(Buffer.from(mii.mii, "base64"));

    try {
      miiData.validate();

      let miiImage = new Html("img").attr({
        src: `https://mii-unsecure.ariankordi.net/miis/image.png?data=${encodeURIComponent(
          mii.mii
        )}&shaderType=2&type=face&width=180&verifyCharInfo=0`,
      });
      let miiName = new Html("span").text(miiData.miiName);

      miiContainer.appendMany(miiImage, miiName).appendTo(libraryList);
    } catch (e: unknown) {
      console.log("Oops", e);
    }
  }

  AddButtonSounds(
    new Html("button")
      .text("Main Menu")
      .on("click", async () => {
        await shutdown();
        MainMenu();
      })
      .appendTo(sidebar)
  );
  AddButtonSounds(
    new Html("button")
      .text("Create New")
      .on("click", async () => {
        await shutdown();
        miiCreateDialog();
      })
      .appendTo(sidebar)
  );
}

type MiiLocalforage = {
  id: string;
  mii: string;
};

const miiCreateDialog = () => {
  Modal.modal(
    "Create New",
    "How would you like to create the Mii?",
    "body",
    {
      text: "From Scratch",
      callback: miiCreateFromScratch,
    },
    {
      text: "Enter PNID",
      callback: miiCreatePNID,
    },
    {
      text: "Random",
      callback: miiCreateRandom,
    },
    {
      text: "Cancel",
      callback: () => Library(),
    }
  );
};
const miiCreateFromScratch = () => {
  function cb(gender: MiiGender) {
    return () => {
      new MiiEditor(gender, async (m, shouldSave) => {
        if (shouldSave === true)
          await localforage.setItem("mii-" + Date.now(), m);
        Library();
      });
    };
  }

  Modal.modal(
    "Create New",
    "Select the Mii's gender",
    "body",
    {
      text: "Male",
      callback: cb(MiiGender.Male),
    },
    {
      text: "Female",
      callback: cb(MiiGender.Female),
    },
    {
      text: "Cancel",
      callback: () => miiCreateDialog(),
    }
  );
};
const miiCreatePNID = async () => {
  const input = await Modal.input(
    "Create New",
    "Enter PNID of user..",
    "Username",
    "body",
    false
  );
  if (input === false) {
    return miiCreateDialog();
  }

  Loader.show();

  let pnid = await fetch(
    `https://mii-unsecure.ariankordi.net/mii_data/${encodeURIComponent(
      input
    )}?api_id=1`
  );

  Loader.hide();
  if (!pnid.ok) {
    await Modal.alert("Error", `Couldn't get Mii: ${await pnid.text()}`);
    return Library();
  }

  new MiiEditor(
    0,
    async (m, shouldSave) => {
      if (shouldSave === true)
        await localforage.setItem("mii-" + Date.now(), m);
      Library();
    },
    (await pnid.json()).data
  );
};
const miiCreateRandom = async () => {
  Loader.show();
  let random = await fetch(
    "https://mii-unsecure.ariankordi.net/mii_data_random"
  ).then((j) => j.json());
  Loader.hide();

  new MiiEditor(
    0,
    async (m) => {
      await localforage.setItem("mii-" + Date.now(), m);
      Library();
    },
    random.data
  );
};
const miiEdit = (mii: MiiLocalforage, shutdown: () => any) => {
  return () => {
    Modal.modal(
      "Mii Maker Web",
      "What would you like to do?",
      "body",
      {
        text: "Edit",
        async callback() {
          await shutdown();
          new MiiEditor(
            0,
            async (m) => {
              await localforage.setItem(mii.id, m);
              Library();
            },
            mii.mii
          );
        },
      },
      {
        text: "Delete",
        async callback() {
          await localforage.removeItem(mii.id);
          await shutdown();
          Library();
        },
      },
      {
        text: "Cancel",
        async callback() {
          /* ... */
        },
      }
    );
  };
};