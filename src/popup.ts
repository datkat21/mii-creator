import Html from "@datkat21/html";
enum RequestType {
  Library = "library",
  PersonalMiiOnly = "personal_mii_only"
}

(() => {
  if (!window.opener) return document.write();
  else {
    let params = new URLSearchParams(location.search);

    const title = params.get("page_title");
    if (title === null) return;
    const req = params.get("type");
    if (req === null) return;

    let permissions = [];

    switch (req) {
      case RequestType.Library:
        permissions.push("Personal Mii");
        permissions.push("Library");
        break;
      case RequestType.PersonalMiiOnly:
        permissions.push("Personal Mii");
        break;
      default:
        return;
    }

    function cancel() {
      window.opener.postMessage(
        { type: "miic-auth-finalize", canceled: true },
        "*"
      );
      close();
    }
    async function authorize() {
      let infoJson: any;
      switch (req) {
        case RequestType.Library:
          infoJson = await fetch("/api/me").then((r) => r.json());
          if (infoJson.personal_mii.error) infoJson.personal_mii = null;
          break;
        case RequestType.PersonalMiiOnly:
          let personal_mii = await fetch("/api/personal_mii").then((r) =>
            r.json()
          );
          if (personal_mii.error) personal_mii = null;
          infoJson = { personal_mii };
          break;
        default:
          window.opener.postMessage(
            { type: "miic-auth-finalize", canceled: true },
            "*"
          );
          close();
          return;
      }
      window.opener.postMessage(
        { type: "miic-auth-finalize", canceled: false, data: infoJson },
        "*"
      );
      close();
    }

    new Html("div")
      .class("popup")
      .appendMany(
        new Html("span")
          .class("header")
          .appendMany(
            new Html("span").class("title").text(title),
            new Html("br"),
            new Html("span").text("would like to access your Mii Creator data")
          ),
        new Html("ul")
          .class("permissions")
          .appendMany(...permissions.map((n) => new Html("li").text(n))),
        new Html("span").class("confirmation").text("Is this OK?"),
        new Html("div")
          .style({ display: "flex", gap: "1rem" })
          .appendMany(
            new Html("button")
              .class("button")
              .text("Cancel")
              .on("click", cancel),
            new Html("button")
              .class("button", "primary")
              .text("Authorize")
              .on("click", authorize)
          )
      )

      .appendTo("body");
  }
})();
