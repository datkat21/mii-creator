//Assume the language is english
import { createMiiRender, getAdditionalInfoFromMii, Mii } from "../../helper";
import {
  MiiSelectorMiiType
} from "./selector_misc";

// This is David J.'s Mii Selector code courtesy of dwyazzo90,
// implemented into Mii Creator for inclusion with the Mii Creator JS API.

function escapeHTML(str) {
  return new Option(str).innerHTML;
}

//PLEASE ADD LOCALIZATION PROPERLY, MAKE IT GENERAL AND NOT REGION BASED.
const lang = "en";

export var MiiSelector = {
  loc: {
    //No region localization, its just a few strings.
    en: [
      "Select a Mii.",
      "Guests",
      "Cancel",
      "Confirm",
      "Search",
      "Matches for:",
      "results",
      "No matches found.",
      "Guest "
    ],
    es: [
      "Selecciona un Mii.",
      "Invitados",
      "Cancelar",
      "Confirmar",
      "Buscar",
      "Resultados para:",
      "resultados",
      "No hay resultados.",
      "Invitado "
    ]
  },
  /**
   * @param {any[]} miiArray
   * @param {any} selectorParam
   * @returns
   */
  open: async function (miiArray, selectorParam) {
    return new Promise((resolve, reject) => {
      if (selectorParam.personalMii) {
        miiArray.unshift({
          miiData: selectorParam.personalMii,
          type: MiiSelectorMiiType.Personal
        });
      }

      function getLoc(index) {
        return MiiSelector.loc[lang][index];
      }

      var check = document.querySelector("#mii-creator-selector-modal");
      if (check != null || check != undefined) {
        check.remove();
      }

      var pages = 0;
      var currentPage = 1;
      //Preloading only if user has 100 or less miis
      var canPreloadCharIcon = miiArray.length <= 100;

      console.log("canPreloadCharIcon: " + canPreloadCharIcon);
      var selectedMii = null;

      //user can specificy if disable preloading
      //for performance reasons, i guess
      if (selectorParam && selectorParam.preload === false) {
        canPreloadCharIcon = false;
      }

      miiArray.forEach((mii, index) => {
        if (index % 10 === 0) {
          pages++;
        }
      });

      let guestMiis = [];
      const guestMiiIcons = [];
      //Init Guest Miis
    if (selectorParam && selectorParam.allowGuest === true && selectorParam.guestData) {
      if (selectorParam.guestData) {
        guestMiis.push(
          ...selectorParam.guestData.map((guest, index) => {
            let guestMii = new Mii(guest);
            guestMii.nickname = getLoc(8) + String.fromCharCode(65 + index);
            return { miiData: guestMii.export() };
          })
        );

        const iconPromises = guestMiis.map((mii, index) => {
          return new Promise(async (resolve) => {
            const miiData = new Mii(mii.miiData);
            const data = miiData.export("studioData");

            const icon = await createMiiRender({
              data,
              drawBody: true,
              size: 124,
              module: fflModule,
              expression: 13,
              additionalInfo: getAdditionalInfoFromMii(miiData),
              shaderType: "wiiu_blinn",
              renderer,
              bodyModelType: "low",
              texResolution: 128,
              type: 0
            });
            // const charModel = createCharModel(data, null, FFLShaderMaterial, fflModule);

            // initCharModelTextures(charModel, renderer);
            // const icon = createCharModelIcon(charModel, renderer, ViewType.MakeIcon, 200, 200);

            var iconURL = URL.createObjectURL(icon.result);

            // charModel.dispose();
            resolve({ img: iconURL, name: miiData.nickname });
          });
        });

        Promise.all(iconPromises).then(async (icons) => {
          icons.forEach((e) => guestMiiIcons.push(e));
          afterGuestMiiInit();
        });
      }
    } else {
      afterGuestMiiInit();
    }

      const container =
        '<div id="mii-creator-selector-modal">' +
        '<div class="selector" style="display: none;">' +
        "<h1>" +
        getLoc(0) +
        "</h1>" +
        '<div class="mii-container guest" style="display: none;">' +
        '<div class="guest-label">' +
        getLoc(1) +
        "</div>" +
        '<div class="guest-miis">' +
        "</div>" +
        "</div>" +
        '<div class="mii-container">' +
        "</div>" +
        ' <div class="mii-container transition" style="display: none;">' +
        '<div class="mii" tabindex="-1"></div>'.repeat(10) +
        "</div>" +
        '<div class="mii-page-counter">' +
        "<span><b>1</b><span></span></span>" +
        "</div>" +
        '<button class="mii-guest-button" style="display: none;">' +
        '<span>' + getLoc(1) + '</span>' +
        '</button>' +
        '<div class="button-navi">' +
        '<button class="prev" style="display:none;">◀</button>' +
        '<button class="next" style="display:none;">▶</button>' +
        '</div>' +
        '<div class="button-container">' +
        '<button class="cancel">' + getLoc(2) + '</button>' +
        '<button disabled class="confirm">' + getLoc(3) + '</button>' +
        "</div>" +
        "</div>" +
        "</div>";

      document.body.insertAdjacentHTML("beforeend", container);

      //Check now is valid, good!
      check = document.querySelector("#mii-creator-selector-modal");
      var selCont = check.querySelector(".selector");

      var pagesCounter = check.querySelector(".mii-page-counter");
      var pagesEl = check.querySelector(".mii-page-counter span>span");
      var pagesCurEl = check.querySelector(".mii-page-counter span>b");
      pagesEl.innerText = "/ " + pages;

      var guestButton = check.querySelector(".mii-guest-button");
      var arrowButtonContainer = check.querySelector(".button-navi");
      var arrowLeft = check.querySelector(".prev");
      var arrowRight = check.querySelector(".next");
      var confirmButton = check.querySelector(".confirm");
      var cancelButton = check.querySelector(".cancel");
      var miiCoUser = check.querySelector(
        ".mii-container:not(.transition):not(.guest)"
      );
      var miiGuests = check.querySelector(".mii-container.guest");
      var miiTrs = check.querySelector(".mii-container.transition");

      if (pages > 1) {
        arrowRight.style.display = "block";
      }

      if (selectorParam && selectorParam.allowGuest === true) {
        guestButton.style.display = "block";
      }

      const dataArray = [];

      //TO AVOID THE HUGE ASS LAG SPIKE AT THE BEGINNING!

      //After making the guest mii icons
      function afterGuestMiiInit() {

        if (selectorParam && selectorParam.allowGuest === true && selectorParam.guestData) {
        miiGuests.querySelector(".guest-miis").innerHTML += guestMiiIcons.map((guest, index) =>
          '<div tabindex="0" class="mii guest" data-guest-mii-index="' + index + '">' +
            '<img draggable="false" src="' + guest.img + '">' +
            '<p style="display: none;">' + guest.name + '</p>' +
          '</div>'
        ).join('');
      }

        if (canPreloadCharIcon) {
          // Preload all Mii icons first
          const iconPromises = miiArray.map((mii, index) => {
            return new Promise(async (resolve) => {
              const miiData = new Mii(mii.miiData);
              const data = miiData.export("studioData");
  
              const icon = await createMiiRender({
                data,
                drawBody: true,
                size: 124,
                module: fflModule,
                additionalInfo: getAdditionalInfoFromMii(miiData),
                shaderType: "wiiu_blinn",
                renderer,
                bodyModelType: "low",
                texResolution: 128,
                type: 0
              });
              // const charModel = createCharModel(data, null, FFLShaderMaterial, fflModule);
  
              // initCharModelTextures(charModel, renderer);
              // const icon = createCharModelIcon(charModel, renderer, ViewType.MakeIcon, 200, 200);
  
              var iconURL = URL.createObjectURL(icon.result);
  
              // charModel.dispose();
              resolve({ img: iconURL, name: miiData.nickname, type: mii.type });
            });
          });
  
          Promise.all(iconPromises).then(async (icons) => {
            console.log("REAL");
            icons.forEach((e) => dataArray.push(e));
            fillMiiContainer(miiArray, currentPage).then((data) => {
              miiCoUser.innerHTML = data;
              selCont.style.display = "block";
              updateMiiListener();
              initButtonListener();
            });
          });
        } else {
          fillMiiContainer(miiArray, currentPage).then((data) => {
            miiCoUser.innerHTML = data;
            selCont.style.display = "block";
            updateMiiListener();
            initButtonListener();
          });
        }
      }

      async function fillMiiContainer(miiArray, page) {
        console.log(page);

        const miisPerPage = 10;
        const startIndex = (page - 1) * miisPerPage;
        const selectedMiis = miiArray.slice(
          startIndex,
          startIndex + miisPerPage
        ); // Get only the Miis for this page

        if (canPreloadCharIcon) {
          // Use preloaded icons
          var pageData = dataArray.slice(startIndex, startIndex + miisPerPage);
        } else {
          // Clear array and generate icons dynamically
          dataArray.length = 0; // Empty the array

          var pageDataPromises = selectedMiis.map((mii) => {
            return new Promise(async (resolve) => {
              const miiData = new Mii(mii.miiData);
              const data = miiData.export("studioData");

              const icon = await createMiiRender({
                data,
                drawBody: true,
                size: 124,
                module: fflModule,
                additionalInfo: getAdditionalInfoFromMii(miiData),
                shaderType: "wiiu_blinn",
                renderer,
                bodyModelType: "low",
                texResolution: 128,
                type: 0
              });

              var iconURL = URL.createObjectURL(icon.result);
              // const charModel = createCharModel(data, null, FFLShaderMaterial, fflModule);

              // initCharModelTextures(charModel, renderer);
              // const icon = createCharModelIcon(charModel, renderer, ViewType.MakeIcon, 200, 200);
              const miiPageData = {
                img: iconURL,
                name: miiData.nickname,
                type: mii.type
              };
              dataArray.push(miiPageData);

              // charModel.dispose();
              return resolve(miiPageData);
            });
          });
          console.log("page data promises list", pageDataPromises);

          pageData = await Promise.all(pageDataPromises);
          console.log("page data overwrite promises", pageData);
        }

        // Fill with empty placeholders if less than 10 Miis
        while (pageData.length < miisPerPage) {
          pageData.push({ img: "", name: "" });
        }

        // Map to HTML with conditional data-mii-index attribute
        return pageData
          .map((mii, i) => {
            const overallIndex = startIndex + i;
            const dataAttr =
              mii.img && mii.name ? ` data-mii-index="${overallIndex}"` : "";

            let miiClass = "";

            switch (mii.type) {
              case MiiSelectorMiiType.Favorite:
                miiClass = "favorite";
                break;
              case MiiSelectorMiiType.Special:
                miiClass = "special";
                break;
              case MiiSelectorMiiType.Personal:
                miiClass = "personal";
                break;
            }

            return (
              `<div tabindex="0" class="mii"${dataAttr}>` +
              (mii.img ? `<img draggable="false" src="${mii.img}">` : "") +
              (mii.name
                ? `<p class="${miiClass}" style="display: none;"><span>${escapeHTML(
                  mii.name
                )}</span></p>`
                : "") +
              `</div>`
            );
          })
          .join("");
      }

      function miiSelect(el) {
        var target = el;

        if (el.classList.contains("selected")) {
          return;
        }

        check.querySelectorAll(".mii").forEach((mii) => {
          mii.classList.remove("selected");
          mii.querySelectorAll("p").forEach((m) => {
            m.style.display = "none";
          });
        });

        target.classList.add("selected");

        if (target.hasAttribute("data-mii-index") || target.hasAttribute("data-guest-mii-index")) {

          let data;
          let index;
          if (target.classList.contains("guest")) {
            index = target.getAttribute("data-guest-mii-index")
            data = guestMiis[parseInt(target.getAttribute("data-guest-mii-index"))]
          } else {
            index = target.getAttribute("data-mii-index")
            data = miiArray[parseInt(target.getAttribute("data-mii-index"))]
          }
          
          selectedMii = {
            index: index,
            data: data,
            type: target.classList.contains("guest") ? "guest": "normal"
          };

          console.log(selectedMii);

          target.querySelector("p").style.display = "";
          confirmButton.disabled = false;
        } else {
          selectedMii = null;
          confirmButton.disabled = true;
        }

        if (selectorParam.soundManager) {
          selectorParam.soundManager.playSound("3ds_mii_selector_select");
        }
      }

      function updateMiiListener() {
        check.querySelectorAll(".mii").forEach(function (mii) {
          mii.addEventListener("click", function (event) {
            miiSelect(this);
          });
          mii.addEventListener("focus", function (event) {
            miiSelect(this);
          });
        });
      }

      function initButtonListener() {
        arrowRight.addEventListener("click", function () {
          lockArrowsForNation();
          miiCoUser.classList.add("slideleft");
          miiTrs.style.display = "";
          miiTrs.classList.add("slideleftb");

          miiTrs.addEventListener(
            "animationend",
            function onAnimationEnd() {
              miiTrs.removeEventListener("animationend", onAnimationEnd);

              setTimeout(function () {
                miiCoUser.classList.remove("slideleft");
                miiTrs.classList.remove("slideleftb");
                miiTrs.style.display = "none";
                miiCoUser.innerHTML = "";
                currentPage++;
                fillMiiContainer(miiArray, currentPage).then((data) => {
                  miiCoUser.innerHTML = data;

                  updateMiiListener();
                  pagesCurEl.innerText = currentPage;
                  doTrioAtPaginEnd();
                });
              }, 0);
            },
            { once: true }
          );
        });

        arrowLeft.addEventListener("click", function () {
          lockArrowsForNation();
          miiCoUser.classList.add("slideright");
          miiTrs.style.display = "";
          miiTrs.classList.add("sliderightb");

          miiTrs.addEventListener(
            "animationend",
            function onAnimationEnd() {
              miiTrs.removeEventListener("animationend", onAnimationEnd);

              setTimeout(function () {
                miiCoUser.classList.remove("slideright");
                miiTrs.classList.remove("sliderightb");
                miiTrs.style.display = "none";
                miiCoUser.innerHTML = "";
                currentPage--;
                fillMiiContainer(miiArray, currentPage).then((data) => {
                  miiCoUser.innerHTML = data;
                  updateMiiListener();
                  pagesCurEl.innerText = currentPage;
                  doTrioAtPaginEnd();
                });
              }, 0);
            },
            { once: true }
          );
        });

        if (selectorParam && selectorParam.allowGuest === true && selectorParam.guestData) {

          guestButton.addEventListener("click", function () {
            if (selectorParam.soundManager) {
              selectorParam.soundManager.playSound("3ds_mii_selector_select");
            }
            
            if (miiGuests.style.display === "none") {
              guestButton.classList.add("selected");
              arrowButtonContainer.style.display = "none";
              miiCoUser.style.display = "none";
              miiGuests.style.display = "";
              pagesCounter.style.display = "none";
            } else {
              guestButton.classList.remove("selected");
              miiGuests.style.display = "none";
              miiCoUser.style.display = "";
              pagesCounter.style.display = "";
              arrowButtonContainer.style.display = "";
            }
          });
        }

        confirmButton.addEventListener("click", function onConfirm() {
          console.log("Confirm");
          if (selectorParam.soundManager) {
            selectorParam.soundManager.playSound("3ds_mii_selector_confirm");
          }
          check.style.pointerEvents = "none";

          confirmButton.removeEventListener("click", onConfirm);
          selCont.classList.add("finish");

          selCont.addEventListener(
            "animationend",
            function onAnimationEnd() {
              selCont.removeEventListener("animationend", onAnimationEnd);
              setTimeout(function () {
                check.remove();
                // document.removeEventListener("keydown", MiiSelector.onKeyDown);
                // document.removeEventListener("keyup", MiiSelector.onKeyUp);
                if (selectedMii != null) {
                  resolve({ mii: selectedMii.data });
                } else {
                  reject("User hasnt selected Mii");
                }
              }, 0);
            },
            { once: true }
          );
        });

        cancelButton.addEventListener("click", function onCancel() {
          check.style.pointerEvents = "none";
          cancelButton.removeEventListener("click", onCancel);
          selCont.classList.add("finish");

          if (selectorParam.soundManager) {
            selectorParam.soundManager.playSound("3ds_mii_selector_cancel");
          }

          selCont.addEventListener(
            "animationend",
            function onAnimationEnd() {
              selCont.removeEventListener("animationend", onAnimationEnd);
              setTimeout(function () {
                check.remove();
                // document.removeEventListener("keydown", MiiSelector.onKeyDown);
                // document.removeEventListener("keyup", MiiSelector.onKeyUp);
                reject("No Mii data selected by user.");
              }, 0);
            },
            { once: true }
          );
        });
      }

      function doTrioAtPaginEnd() {
        //Sorry for the timeout it fixes it
        ifSelectedMiiRestore();
        updateArrowsForNation();
        unlockArrowsForNation();
      }

      function updateArrowsForNation() {
        // Hide/show arrows based on the current page
        if (currentPage === pages) {
          arrowRight.style.display = "none"; // Hide right arrow on the last page
          arrowLeft.style.display = ""; // Show left arrow
        } else if (currentPage === 1) {
          arrowLeft.style.display = "none"; // Hide left arrow on the first page
          arrowRight.style.display = ""; // Show right arrow
        } else {
          arrowLeft.style.display = ""; // Show both arrows for middle pages
          arrowRight.style.display = "";
        }
      }

      function ifSelectedMiiRestore() {
        if (
          selectedMii != null &&
          check.querySelector(
            '.mii[data-mii-index="' + selectedMii.index + '"]'
          ) &&
          selectedMii.index &&
          selectedMii.type === "normal"
        ) {
          check
            .querySelector('.mii[data-mii-index="' + selectedMii.index + '"]')
            .classList.add("selected");
          check
            .querySelector('.mii[data-mii-index="' + selectedMii.index + '"]')
            .querySelector("p").style.display = "";
          check
            .querySelector('.mii[data-mii-index="' + selectedMii.index + '"]')
            .focus();
        }
      }

      function lockArrowsForNation() {
        if (selectorParam.soundManager) {
          selectorParam.soundManager.playSound("3ds_mii_selector_page");
        }
        arrowRight.disabled = true;
        arrowLeft.disabled = true;
        arrowLeft.style.opacity = "0.5";
        arrowLeft.style.filter = "grayscale(100%)";
        arrowRight.style.opacity = "0.5";
        arrowRight.style.filter = "grayscale(100%)";
      }

      function unlockArrowsForNation() {
        arrowLeft.style.opacity = "1";
        arrowLeft.style.filter = "none";
        arrowRight.style.opacity = "1";
        arrowRight.style.filter = "none";
        arrowRight.disabled = false;
        arrowLeft.disabled = false;
      }
    });
  }
};

export function miiSelectorSetFflModule(module) {
  fflModule = module;
}
export function miiSelectorSetRenderer(r) {
  renderer = r;
}

//This shows an example of what the raw MiiSelector.open Function expects (Feel free to change, its just for demo purposes)
export var MiiExampleArray = [
  {
    miiData:
      "AwEAIE4vaoCzgYpzgN8ZmnGioS4CKAAAAVxtAGkAbQBvAAAAAAAAAAAAAAAAAEBAEhA8ABhoYxw3NEYUJBYZJg0AACmDYkhQbQBpAG0AbwAAAAAAAAAAAAAAAAAAAIZa"
  },
  {
    miiData:
      "AwEAMBs8xqsHR9PC3MXz5YXEaBemLwAAVllEAGEAdgBpAGQAIABKAG8AYQBxAE0wABBXAAJoRBgTZEUUgRIZZg4AACkAaGdQYgBpAGcAIABzAGEAbAB0AHkAAAAAALpc"
  },
  {
    miiData:
      "AwEAMHpnKmJS2hyMmWzpBSwQwXjnewAAV10GJkQAYQBuAGkAAAAAAAAAAAAAAEM5AJhlBR1pRBogNWQQRhKZZg4AACnTUiVNbwB3AG8AAAAAAAAAAAAAAAAAAAAAAGUR"
  },
  {
    miiData:
      "AwEAIDVEgCveHCqDgP9wmbYmSnvSxQAAAQBEAGEAbgBpAAAAAAAAAAAAAAAAADs3AgBVCx1pRBpANEUURhIPxA4AAClTWsNEAAAAAAAAAAAAAAAAAAAAAAAAAAAAALVb"
  },
];

// var renderer = new THREE.WebGLRenderer({
//   alpha: true // Needed for icons with transparent backgrounds.
// });

var fflModule;
var renderer;

//Assuming HTML has loaded
//please wrap the selector in the Mii Creator JS module (for kat)
// document.addEventListener("DOMContentLoaded", async function () {

//   var init = await initializeFFLWithResource(window.ModuleFFL);

//   if (!init || !init.module) {
//     throw new Error("FFL.js init error")
//   }

//   fflModule = init.module;

//   document.querySelector("#testOpen").addEventListener("click", async function () {

//     try {
//       var MiiResult = await MiiSelector.open(MiiExampleArray, {
//         allowGuest: true,
//       })

//       console.log(MiiResult.mii);

//     } catch (e) {
//       console.log(e)
//     }

//   })

// })