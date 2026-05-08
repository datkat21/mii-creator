function makeFrame(params: string, fullscreen: boolean) {
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

// UNFINISHED, DO NOT USE YET
export default {
  configuration: {
    music: true
  },
  async editMii(
    data: string = "AwEAAAAAAAAAAAAAgP9wmQAAAAAAAAAAAABNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMNn",
    fullscreen: boolean = true,
    renderTypes: string[] = ["headshot"]
  ) {
    return new Promise((resolve, reject) => {
      const frame = makeFrame(
        `data=${encodeURIComponent(data)}&renderTypes=${renderTypes
          .map((r) => encodeURIComponent(r))
          .join(",")}&origin=${encodeURIComponent(location.origin)}`,
        fullscreen
      );

      function resizeCallback() {
        if (fullscreen) {
          frame.style.width = `${window.innerWidth}px`;
          frame.style.height = `${window.innerHeight}px`;
        }
      }
      function postmessageCallback(event: Event) {
        // TS-specific hack
        let evt = event as MessageEvent<any>;
        if (evt.data === undefined) return;
        if (evt.data.type === undefined) return;
        if (evt.data.type !== "miic-data-finalize") return;

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
  async selectMii(
    fullscreen: boolean = true,
    renderTypes: string[] = ["headshot"]
  ) {
    return new Promise((resolve, reject) => {
      const frame = makeFrame(
        `select=yes&renderTypes=${renderTypes
          .map((r) => encodeURIComponent(r))
          .join(",")}`,
        fullscreen
      );

      function resizeCallback() {
        if (fullscreen) {
          frame.style.width = `${window.innerWidth}px`;
          frame.style.height = `${window.innerHeight}px`;
        }
      }
      function postmessageCallback(event: Event) {
        // TS-specific hack
        let evt = event as MessageEvent<any>;
        if (evt.data === undefined) return;
        if (evt.data.type === undefined) return;
        if (evt.data.type !== "miic-select") return;

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
  newMii(gender: "male" | "female" = "male") {
    switch (gender) {
      case "male":
        return this.editMii(
          "AwEAAAAAAAAAAAAAgP9wmQAAAAAAAAAAAABNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMNn"
        );
      case "female":
        return this.editMii(
          "AwEAAAAAAAAAAAAAgN8ZmgAAAAAAAAAAAQBNAGkAaQAAAAAAAAAAAAAAAAAAAEBAAAAMAQRoQxggNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFik"
        );
    }
  },
  configure(newConfiguration: Record<string, any>) {
    // Set music state
    if (
      newConfiguration.music !== undefined &&
      typeof newConfiguration.music === "boolean"
    ) {
      this.configuration.music = newConfiguration.music;
    }
  }
};
