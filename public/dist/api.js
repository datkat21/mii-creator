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

// src/api.ts
function makeFrame(params, fullscreen) {
  const frame = document.createElement("iframe");
  if (fullscreen) {
    frame.style.width = `100%`;
    frame.style.height = `100%`;
    frame.style.top = "0";
    frame.style.left = "0";
    frame.style.border = "0";
    frame.style.position = "fixed";
    frame.style.zIndex = "99999";
    document.body.appendChild(frame);
  }
  frame.src = `${import.meta.url.replace("dist/api.js", "")}?${params}`;
  return frame;
}
var api_default = {
  configuration: {
    music: true
  },
  async editMii(data = "AwEAAAAAAAAAAAAAgP9wmQAAAAAAAAAAAABNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMNn", fullscreen = true, renderTypes = ["headshot"]) {
    return new Promise((resolve, reject) => {
      const frame = makeFrame(`data=${encodeURIComponent(data)}&renderTypes=${renderTypes.map((r) => encodeURIComponent(r)).join(",")}&origin=${encodeURIComponent(location.origin)}`, fullscreen);
      function resizeCallback() {
        if (fullscreen) {
          frame.style.width = `${window.innerWidth}px`;
          frame.style.height = `${window.innerHeight}px`;
        }
      }
      function postmessageCallback(event) {
        let evt = event;
        if (evt.data === undefined)
          return;
        if (evt.data.type === undefined)
          return;
        if (evt.data.type !== "miic-data-finalize")
          return;
        frame.style.transition = "opacity 0.5s linear";
        frame.style.opacity = "0";
        setTimeout(() => {
          frame.remove();
          window.removeEventListener("resize", resizeCallback);
          window.removeEventListener("onmessage", postmessageCallback);
          resolve(evt.data);
        }, 500);
      }
      window.addEventListener("resize", resizeCallback);
      window.addEventListener("message", postmessageCallback);
    });
  },
  async selectMii(fullscreen = true, renderTypes = ["headshot"]) {
    return new Promise((resolve, reject) => {
      const frame = makeFrame(`select=yes&renderTypes=${renderTypes.map((r) => encodeURIComponent(r)).join(",")}`, fullscreen);
      function resizeCallback() {
        if (fullscreen) {
          frame.style.width = `${window.innerWidth}px`;
          frame.style.height = `${window.innerHeight}px`;
        }
      }
      function postmessageCallback(event) {
        let evt = event;
        if (evt.data === undefined)
          return;
        if (evt.data.type === undefined)
          return;
        if (evt.data.type !== "miic-select")
          return;
        frame.style.transition = "opacity 0.5s linear";
        frame.style.opacity = "0";
        setTimeout(() => {
          frame.remove();
          window.removeEventListener("resize", resizeCallback);
          window.removeEventListener("onmessage", postmessageCallback);
          resolve(evt.data);
        }, 500);
      }
      window.addEventListener("resize", resizeCallback);
      window.addEventListener("message", postmessageCallback);
    });
  },
  newMii(gender = "male") {
    switch (gender) {
      case "male":
        return this.editMii("AwEAAAAAAAAAAAAAgP9wmQAAAAAAAAAAAABNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMNn");
      case "female":
        return this.editMii("AwEAAAAAAAAAAAAAgN8ZmgAAAAAAAAAAAQBNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAMAQRoQxggNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFik");
    }
  },
  configure(newConfiguration) {
    if (newConfiguration.music !== undefined && typeof newConfiguration.music === "boolean") {
      this.configuration.music = newConfiguration.music;
    }
  }
};
export {
  api_default as default
};
