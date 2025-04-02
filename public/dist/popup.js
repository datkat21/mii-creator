var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// node_modules/@datkat21/html/dist/html.js
/*!
Html library by datkat21 on GitHub. Licensed under MIT
https://github.com/datkat21/html
!*/

class Html {
  elm;
  constructor(elm) {
    if (elm instanceof HTMLElement)
      this.elm = elm;
    else
      this.elm = document.createElement(elm || "div");
  }
  text(val) {
    this.elm.innerText = val;
    return this;
  }
  html(val) {
    this.elm.innerHTML = val;
    return this;
  }
  cleanup() {
    this.elm.remove();
    return this;
  }
  query(selector) {
    return this.elm.querySelector(selector);
  }
  qs(query) {
    if (this.elm.querySelector(query))
      return Html.from(this.elm.querySelector(query));
    else
      return null;
  }
  qsa(query) {
    if (this.elm.querySelector(query))
      return Array.from(this.elm.querySelectorAll(query)).map((e) => Html.from(e));
    else
      return null;
  }
  id(val) {
    this.elm.id = val;
    return this;
  }
  class(...val) {
    for (let i = 0;i < val.length; i++)
      this.elm.classList.toggle(val[i]);
    return this;
  }
  classOn(...val) {
    for (let i = 0;i < val.length; i++)
      this.elm.classList.add(val[i]);
    return this;
  }
  classOff(...val) {
    for (let i = 0;i < val.length; i++)
      this.elm.classList.remove(val[i]);
    return this;
  }
  style(obj) {
    for (const key of Object.keys(obj))
      this.elm.style.setProperty(key, obj[key]);
    return this;
  }
  styleJs(obj) {
    for (const key of Object.keys(obj))
      this.elm.style[key] = obj[key];
    return this;
  }
  on(ev, cb) {
    this.elm.addEventListener(ev, cb);
    return this;
  }
  un(ev, cb) {
    this.elm.removeEventListener(ev, cb);
    return this;
  }
  getElement(element) {
    let p = element instanceof Html ? element.elm : element;
    if (typeof element === "string")
      p = document.querySelector(element);
    if (p instanceof HTMLElement)
      return p;
    else
      throw new Error("Invalid element type.");
  }
  appendTo(parent) {
    let p = this.getElement(parent);
    if (p instanceof HTMLElement)
      p.appendChild(this.elm);
    else
      throw new Error("Invalid parent element, exausted 3 checks.");
    return this;
  }
  prependTo(parent) {
    let p = this.getElement(parent);
    if (p instanceof HTMLElement)
      p.prepend(this.elm);
    return this;
  }
  append(elem) {
    let e = this.getElement(elem);
    if (e instanceof HTMLElement)
      this.elm.appendChild(e);
    else if (typeof elem === "string") {
      const newElem = document.createElement(elem);
      this.elm.appendChild(newElem);
      return new Html(newElem.tagName);
    }
    return this;
  }
  prepend(elem) {
    let e = this.getElement(elem);
    if (e instanceof HTMLElement)
      this.elm.prepend(e);
    else if (typeof elem === "string") {
      const newElem = document.createElement(elem);
      this.elm.prepend(newElem);
      return new Html(newElem.tagName);
    }
    return this;
  }
  appendMany(...elements) {
    for (const elem of elements)
      this.append(elem);
    return this;
  }
  prependMany(...elements) {
    for (const elem of elements)
      this.prepend(elem);
    return this;
  }
  clear() {
    this.elm.innerHTML = "";
    return this;
  }
  attr(obj) {
    for (let key in obj)
      if (obj[key] !== null && obj[key] !== undefined)
        this.elm.setAttribute(key, obj[key]);
      else
        this.elm.removeAttribute(key);
    return this;
  }
  val(str) {
    this.elm.value = str;
    return this;
  }
  getText() {
    return this.elm.innerText;
  }
  getHtml() {
    return this.elm.innerHTML;
  }
  getValue() {
    return this.elm.value;
  }
  swapRef(elm) {
    this.elm = elm;
    return this;
  }
  static from(elm) {
    const qs = () => Html.qs(elm);
    if (typeof elm === "string")
      return qs();
    return new Html(elm);
  }
  static qs(query) {
    if (document.querySelector(query))
      return Html.from(document.querySelector(query));
    return null;
  }
  static qsa(query) {
    if (document.querySelector(query))
      return Array.from(document.querySelectorAll(query)).map((e) => Html.from(e));
    return null;
  }
}

// src/popup.ts
(() => {
  if (!window.opener)
    return document.write();
  else {
    let cancel = function() {
      window.opener.postMessage({ type: "miic-auth-finalize", canceled: true }, "*");
      close();
    };
    let params = new URLSearchParams(location.search);
    const title = params.get("page_title");
    if (title === null)
      return;
    const req = params.get("type");
    if (req === null)
      return;
    let permissions = [];
    switch (req) {
      case "library" /* Library */:
        permissions.push("Personal Mii");
        permissions.push("Library");
        break;
      case "personal_mii_only" /* PersonalMiiOnly */:
        permissions.push("Personal Mii");
        break;
      default:
        return;
    }
    async function authorize() {
      let infoJson;
      switch (req) {
        case "library" /* Library */:
          infoJson = await fetch("/api/me").then((r) => r.json());
          if (infoJson.personal_mii.error)
            infoJson.personal_mii = null;
          if (infoJson.library)
            infoJson.library = JSON.parse(infoJson.library);
          break;
        case "personal_mii_only" /* PersonalMiiOnly */:
          let personal_mii = await fetch("/api/personal_mii").then((r) => r.json());
          if (personal_mii.error)
            personal_mii = null;
          infoJson = { personal_mii };
          break;
        default:
          window.opener.postMessage({ type: "miic-auth-finalize", canceled: true }, "*");
          close();
          return;
      }
      window.opener.postMessage({ type: "miic-auth-finalize", canceled: false, data: infoJson }, "*");
      close();
    }
    new Html("div").class("popup").appendMany(new Html("span").class("header").appendMany(new Html("span").class("title").text(title), new Html("br"), new Html("span").text("would like to access your Mii Creator data")), new Html("ul").class("permissions").appendMany(...permissions.map((n) => new Html("li").text(n))), new Html("span").class("confirmation").text("Is this OK?"), new Html("div").style({ display: "flex", gap: "1rem" }).appendMany(new Html("button").class("button").text("Cancel").on("click", cancel), new Html("button").class("button", "primary").text("Authorize").on("click", authorize))).appendTo("body");
  }
})();
