// Adapted from my language manager used in Cherry Tree TV
import localforage from "localforage";

const langValue = (await localforage.getItem("language")) as string;
let lang = langValue || "en_US";
let strings: Record<string, any> = {};

export const langList = ["en_US"];

async function setLanguage(lang: string, isFirst: boolean) {
  if (isFirst) {
    // call when page first opens?
    // HACK: get value of language since it
    // is always set and use as indicator
    // if this is the user's first visit.
    window.firstVisit = langValue === null; // bool
  }
  // initialize the key to default
  if (isFirst && langValue === null) {
    await localforage.setItem("language", lang);
  }

  try {
    // this will fail if the lang doesn't exist:
    let languageModule = (await import(`./lang/${lang}.js`)).default;
    if (isFirst) {
      // do not await on first set
      localforage.setItem("language", lang);
    } else {
      await localforage.setItem("language", lang);
    }
    strings = languageModule;
  } catch (e) {
    console.log("Failed to load strings!");
  }
}

await setLanguage(lang, true); // isFirst = true

export const langManager = {
  async setLanguage(lang: string) {
    setLanguage(lang, false); // isFirst = false
  },
  getLanguage() {
    return lang;
  },
  getString(path: string, replacements: Record<string, any> = {}) {
    const parts = path.split(".");
    let current = strings;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        return path as string;
      }
      current = current[part];
    }
    if (typeof current === "string") {
      for (const key in replacements) {
        current = current.replace(`%${key}%`, replacements[key]);
      }
    }
    if (current === null || current === undefined) {
      return path as string;
    }
    return current as any as string;
  }
};
export const getString = (
  path: string,
  replacements: Record<string, any> = {}
) => langManager.getString(path, replacements);

//@ts-expect-error
window.langManager = langManager;
//@ts-expect-error
window.getString = getString;
