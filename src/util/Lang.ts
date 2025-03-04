import i18n from "gettext.js";

export const localization = i18n();

export const _ = () => localization.gettext.bind(localization);

export async function loadLang(lang: string) {
  const json = await (await fetch(`/public/dist/lang/${lang}.json`)).json();
  localization.setMessages("messages", lang, json);
  localization.setLocale(lang);
}
