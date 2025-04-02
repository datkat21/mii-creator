//Assume the language is english

import { createMiiRender, getAdditionalInfoFromMii, Mii } from "../../helper";
import { createCharModel, initCharModelTextures, parseHexOrB64ToUint8Array } from "../ffl.js/ffl";

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
      "No matches found."
    ],
    es: [
      "Selecciona un Mii.",
      "Invitados",
      "Cancelar",
      "Confirmar",
      "Buscar",
      "Resultados para:",
      "resultados",
      "No hay resultados."
    ]
  },
  open: async function (miiArray, selectorParam) {
    return new Promise((resolve, reject) => {
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

      console.log("canPreloadCharIcon: " + canPreloadCharIcon)
      var selectedMii = null;

      //Check selector parameters
      if (selectorParam) {
        //user can specificy if disable preloading
        //for performance reasons, i guess
        if (selectorParam.preload === false) {
          canPreloadCharIcon = false;
        }
      }

      miiArray.forEach((mii, index) => {
        if (index % 10 === 0) {
          pages++;
        }
      });

      const container =
        '<div id="mii-creator-selector-modal">' +
        '<div class="selector" style="display: none;">' +
        '<h1>' + getLoc(0) + '</h1>' +
        '<div class="mii-container guest" style="display: none;">' +
        '<div class="guest-label">' +
        getLoc(1) +
        '</div>' +
        /*miiArray.map(mii =>
          '<div class="mii">' +
          '<img src="/renderTest.png" >' +
          '<p>' + mii.miiName + '</p>' +
          '</div>'
        ).join('') +*/
        '</div>' +

        '<div class="mii-container">' +
        '</div>' +
        ' <div class="mii-container transition" style="display: none;">' +
        '<div class="mii" tabindex="-1"></div>'.repeat(10) +
        '</div>' +

        '<div class="mii-page-counter">' +
        '<span><b>1</b><span>/10</span></span>' +
        '</div>' +
        '<div class="button-navi">' +
        '<button class="prev" style="display:none;">◀</button>' +
        '<button class="next" style="display:none;">▶</button>' +
        '</div>' +
        '<div class="button-container">' +
        '<button class="cancel">Cancel</button>' +
        '<button disabled class="confirm">Confirm</button>' +
        '</div>' +
        '</div>' +
        '</div>'

      document.body.insertAdjacentHTML('beforeend', container);

      //Check now is valid, good!
      check = document.querySelector("#mii-creator-selector-modal");
      var selCont = check.querySelector(".selector");

      var pagesEl = check.querySelector(".mii-page-counter span>span");
      var pagesCurEl = check.querySelector(".mii-page-counter span>b");
      pagesEl.innerText = "/ " + pages;

      var arrowLeft = check.querySelector(".prev");
      var arrowRight = check.querySelector(".next");
      var confirmButton = check.querySelector(".confirm");
      var cancelButton = check.querySelector(".cancel")
      var miiCoUser = check.querySelector(".mii-container:not(.transition):not(.guest)");
      var miiTrs = check.querySelector(".mii-container.transition");

      if (pages > 1) {
        arrowRight.style.display = "block";
      }

      const dataArray = [];

      //TO AVOID THE HUGE ASS LAG SPIKE AT THE BEGINNING!
      if (canPreloadCharIcon) {
        // Preload all Mii icons first
        const iconPromises = miiArray.map((mii, index) => {
          return new Promise(async resolve => {
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
            resolve({ img: iconURL, name: miiData.nickname });
          });
        });

        Promise.all(iconPromises).then(async (icons) => {
          console.log("REAL");
          icons.forEach(e => dataArray.push(e));
          fillMiiContainer(miiArray, currentPage).then(data => {
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

      async function fillMiiContainer(miiArray, page) {
        console.log(page);

        const miisPerPage = 10;
        const startIndex = (page - 1) * miisPerPage;
        const selectedMiis = miiArray.slice(startIndex, startIndex + miisPerPage); // Get only the Miis for this page

        if (canPreloadCharIcon) {
          // Use preloaded icons
          var pageData = dataArray.slice(startIndex, startIndex + miisPerPage);
        } else {
          // Clear array and generate icons dynamically
          dataArray.length = 0; // Empty the array

          var pageDataPromises = selectedMiis.map(mii => {
            return new Promise(async(resolve) => {
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
              const miiPageData = { img: iconURL, name: miiData.nickname }
              dataArray.push(miiPageData);
              
              // charModel.dispose();
              return resolve(miiPageData);
            })
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
        return pageData.map((mii, i) => {
          const overallIndex = startIndex + i;
          const dataAttr = (mii.img && mii.name) ? ` data-mii-index="${overallIndex}"` : '';

          return `<div tabindex="0" class="mii"${dataAttr}>` +
            (mii.img ? `<img draggable="false" src="${mii.img}">` : '') +
            (mii.name ? `<p style="display: none;">${mii.name}</p>` : '') +
            `</div>`;
        }).join('');
      }

      function miiSelect(el) {
        var target = el;

        if (el.classList.contains("selected")) {
          return;
        }

        check.querySelectorAll(".mii").forEach(mii => {
          mii.classList.remove("selected");
          mii.querySelectorAll("p").forEach(m => {
            m.style.display = "none";
          });
        });

        target.classList.add("selected");

        if (target.hasAttribute("data-mii-index")) {
          selectedMii = {
            index: target.getAttribute("data-mii-index"),
            data: miiArray[parseInt(target.getAttribute("data-mii-index"))]
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

          miiTrs.addEventListener("animationend", function onAnimationEnd() {
            miiTrs.removeEventListener("animationend", onAnimationEnd);
            

            setTimeout(function () {
              miiCoUser.classList.remove("slideleft");
              miiTrs.classList.remove("slideleftb");
              miiTrs.style.display = "none";
              miiCoUser.innerHTML = "";
              currentPage++;
              fillMiiContainer(miiArray, currentPage).then(data => {                
                miiCoUser.innerHTML = data;

                updateMiiListener();
                pagesCurEl.innerText = currentPage;
                doTrioAtPaginEnd();
              });
            }, 0);

          }, { once: true });
        });

        arrowLeft.addEventListener("click", function () {
          lockArrowsForNation()
          miiCoUser.classList.add("slideright");
          miiTrs.style.display = "";
          miiTrs.classList.add("sliderightb");

          miiTrs.addEventListener("animationend", function onAnimationEnd() {
            miiTrs.removeEventListener("animationend", onAnimationEnd);

            setTimeout(function () {
              miiCoUser.classList.remove("slideright");
              miiTrs.classList.remove("sliderightb");
              miiTrs.style.display = "none";
              miiCoUser.innerHTML = "";
              currentPage--;
              fillMiiContainer(miiArray, currentPage).then(data => {
                miiCoUser.innerHTML = data;
                updateMiiListener();
                pagesCurEl.innerText = currentPage;
                doTrioAtPaginEnd();
              });
            }, 0);
          }, { once: true });
        })

        confirmButton.addEventListener("click", function onConfirm() {
          console.log("Confirm")
          if (selectorParam.soundManager) {
            selectorParam.soundManager.playSound("3ds_mii_selector_confirm");
          }
          check.style.pointerEvents = "none";

          confirmButton.removeEventListener("click", onConfirm);
          selCont.classList.add("finish");

          selCont.addEventListener("animationend", function onAnimationEnd() {
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

          }, { once: true });

        });

        cancelButton.addEventListener("click", function onCancel() {
          check.style.pointerEvents = "none";
          cancelButton.removeEventListener("click", onCancel);
          selCont.classList.add("finish");

          if (selectorParam.soundManager) {
            selectorParam.soundManager.playSound("3ds_mii_selector_cancel");
          }

          selCont.addEventListener("animationend", function onAnimationEnd() {
            selCont.removeEventListener("animationend", onAnimationEnd);
            setTimeout(function () {
              check.remove();
              // document.removeEventListener("keydown", MiiSelector.onKeyDown);
              // document.removeEventListener("keyup", MiiSelector.onKeyUp);
              reject("No Mii data selected by user.")
            }, 0);
          }, { once: true });
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
        if (selectedMii != null && check.querySelector('.mii[data-mii-index="' + selectedMii.index + '"]') && selectedMii.index) {
          check.querySelector('.mii[data-mii-index="' + selectedMii.index + '"]').classList.add("selected");
          check.querySelector('.mii[data-mii-index="' + selectedMii.index + '"]').querySelector("p").style.display = "";
          check.querySelector('.mii[data-mii-index="' + selectedMii.index + '"]').focus();
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
}

export function miiSelectorSetFflModule(module) {
  fflModule = module
}
export function miiSelectorSetRenderer(r) {
  renderer = r
}

//This shows an example of what the raw MiiSelector.open Function expects (Feel free to change, its just for demo purposes)
export var MiiExampleArray = [
  {
    miiData: "AwEAIE4vaoCzgYpzgN8ZmnGioS4CKAAAAVxtAGkAbQBvAAAAAAAAAAAAAAAAAEBAEhA8ABhoYxw3NEYUJBYZJg0AACmDYkhQbQBpAG0AbwAAAAAAAAAAAAAAAAAAAIZa",
  },
  {
    miiData: "AwEAMBs8xqsHR9PC3MXz5YXEaBemLwAAVllEAGEAdgBpAGQAIABKAG8AYQBxAE0wABBXAAJoRBgTZEUUgRIZZg4AACkAaGdQYgBpAGcAIABzAGEAbAB0AHkAAAAAALpc",
  },
  {
    miiData: "AwEAMHpnKmJS2hyMmWzpBSwQwXjnewAAV10GJkQAYQBuAGkAAAAAAAAAAAAAAEM5AJhlBR1pRBogNWQQRhKZZg4AACnTUiVNbwB3AG8AAAAAAAAAAAAAAAAAAAAAAGUR",
  },
  {
    miiData: "AwEAIDVEgCveHCqDgP9wmbYmSnvSxQAAAQBEAGEAbgBpAAAAAAAAAAAAAAAAADs3AgBVCx1pRBpANEUURhIPxA4AAClTWsNEAAAAAAAAAAAAAAAAAAAAAAAAAAAAALVb",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMEMonKDqgr79gP9wmedgoZvvAgAAABhCAGkAZwAgAEYAYQB0ACAARgB1AEBARpAkBlJoQxjSNEYUhBIRaA0AMCkgUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAANtQ",
  },
  {
    miiData: "AwEAMOFEOFJOyk8wgP9wmffiR6e5GwAAASRpACAAYQBtACAAcwB0AGUAdgBlAEBAAAQCBchoQxipNEcUYBIjaA0AKCkwUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMe4",
  }, {
    miiData: "AwEAMCT6d7wwhGkPgP9wmYg62JEwZgAAASRXAEEAUwBIAEMATwBPAEMASABJAEBAAJAyDx5pRBrqNEYWaxQCaQ4AOC0gWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM8Z",
  },
  {
    miiData: "AwEAMIZ+TgOPLn3egP9wmYebz4QHawAAAQBmAHUAYwBrAG4AIABjAHUAbgB0AEBAFDAGCwdoRBhjNEcSYBICaQ0AGClTUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADB6",
  },
  {
    miiData: "AwEAMN4cKEquh8u9gP9wmaTiJXkY+AAAASxXAFcAVwBXAFcAVwBXAFcAVwBXAEBAImACB3toQxrtNEUWYBRRaA4AOC1AWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMUM",
  },
  {
    miiData: "AwEAMN4cKEquh8u9gP9wmaTiJXkY+AAAASxXAFcAVwBXAFcAVwBXAFcAVwBXAEBAImACB3toQxrtNEUWYBRRaA4AOC1AWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMUM",
  },
  {
    miiData: "AwEAMN4cKEquh8u9gP9wmaTiJXkY+AAAASxXAFcAVwBXAFcAVwBXAFcAVwBXAEBAImACB3toQxrtNEUWYBRRaA4AOC1AWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMUM",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMEMonKDqgr79gP9wmedgoZvvAgAAABhCAGkAZwAgAEYAYQB0ACAARgB1AEBARpAkBlJoQxjSNEYUhBIRaA0AMCkgUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAANtQ",
  },
  {
    miiData: "AwEAMOFEOFJOyk8wgP9wmffiR6e5GwAAASRpACAAYQBtACAAcwB0AGUAdgBlAEBAAAQCBchoQxipNEcUYBIjaA0AKCkwUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMe4",
  }, {
    miiData: "AwEAMCT6d7wwhGkPgP9wmYg62JEwZgAAASRXAEEAUwBIAEMATwBPAEMASABJAEBAAJAyDx5pRBrqNEYWaxQCaQ4AOC0gWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM8Z",
  },
  {
    miiData: "AwEAMIZ+TgOPLn3egP9wmYebz4QHawAAAQBmAHUAYwBrAG4AIABjAHUAbgB0AEBAFDAGCwdoRBhjNEcSYBICaQ0AGClTUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADB6",
  },
  {
    miiData: "AwEAMN4cKEquh8u9gP9wmaTiJXkY+AAAASxXAFcAVwBXAFcAVwBXAFcAVwBXAEBAImACB3toQxrtNEUWYBRRaA4AOC1AWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMUM",
  },
  {
    miiData: "AwEAMNP+ZeK58uHykq9hUiwQwQO+iQAAAVxmAGIAagBuAAAAAAAAAAAAAAAAAH8AAgCAARRrRBggNEYUgRKBaA0AACkFUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbS",
  },
  {
    miiData: "AwEAIE4vaoCzgYpzgN8ZmnGioS4CKAAAAVxtAGkAbQBvAAAAAAAAAAAAAAAAAEBAEhA8ABhoYxw3NEYUJBYZJg0AACmDYkhQbQBpAG0AbwAAAAAAAAAAAAAAAAAAAIZa",
  },
  {
    miiData: "AwEAMBs8xqsHR9PC3MXz5YXEaBemLwAAVllEAGEAdgBpAGQAIABKAG8AYQBxAE0wABBXAAJoRBgTZEUUgRIZZg4AACkAaGdQYgBpAGcAIABzAGEAbAB0AHkAAAAAALpc",
  },
  {
    miiData: "AwEAMHpnKmJS2hyMmWzpBSwQwXjnewAAV10GJkQAYQBuAGkAAAAAAAAAAAAAAEM5AJhlBR1pRBogNWQQRhKZZg4AACnTUiVNbwB3AG8AAAAAAAAAAAAAAAAAAAAAAGUR",
  },
  {
    miiData: "AwEAIDVEgCveHCqDgP9wmbYmSnvSxQAAAQBEAGEAbgBpAAAAAAAAAAAAAAAAADs3AgBVCx1pRBpANEUURhIPxA4AAClTWsNEAAAAAAAAAAAAAAAAAAAAAAAAAAAAALVb",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMEMonKDqgr79gP9wmedgoZvvAgAAABhCAGkAZwAgAEYAYQB0ACAARgB1AEBARpAkBlJoQxjSNEYUhBIRaA0AMCkgUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAANtQ",
  },
  {
    miiData: "AwEAMOFEOFJOyk8wgP9wmffiR6e5GwAAASRpACAAYQBtACAAcwB0AGUAdgBlAEBAAAQCBchoQxipNEcUYBIjaA0AKCkwUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMe4",
  },
  {
    miiData: "AwEAMCT6d7wwhGkPgP9wmYg62JEwZgAAASRXAEEAUwBIAEMATwBPAEMASABJAEBAAJAyDx5pRBrqNEYWaxQCaQ4AOC0gWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM8Z",
  },
  {
    miiData: "AwEAMIZ+TgOPLn3egP9wmYebz4QHawAAAQBmAHUAYwBrAG4AIABjAHUAbgB0AEBAFDAGCwdoRBhjNEcSYBICaQ0AGClTUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADB6",
  },
  {
    miiData: "AwEAMN4cKEquh8u9gP9wmaTiJXkY+AAAASxXAFcAVwBXAFcAVwBXAFcAVwBXAEBAImACB3toQxrtNEUWYBRRaA4AOC1AWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMUM",
  },
  {
    miiData: "AwEAMNP+ZeK58uHykq9hUiwQwQO+iQAAAVxmAGIAagBuAAAAAAAAAAAAAAAAAH8AAgCAARRrRBggNEYUgRKBaA0AACkFUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbS",
  },
  {
    miiData: "AwEAIE4vaoCzgYpzgN8ZmnGioS4CKAAAAVxtAGkAbQBvAAAAAAAAAAAAAAAAAEBAEhA8ABhoYxw3NEYUJBYZJg0AACmDYkhQbQBpAG0AbwAAAAAAAAAAAAAAAAAAAIZa",
  },
  {
    miiData: "AwEAMBs8xqsHR9PC3MXz5YXEaBemLwAAVllEAGEAdgBpAGQAIABKAG8AYQBxAE0wABBXAAJoRBgTZEUUgRIZZg4AACkAaGdQYgBpAGcAIABzAGEAbAB0AHkAAAAAALpc",
  },
  {
    miiData: "AwEAMHpnKmJS2hyMmWzpBSwQwXjnewAAV10GJkQAYQBuAGkAAAAAAAAAAAAAAEM5AJhlBR1pRBogNWQQRhKZZg4AACnTUiVNbwB3AG8AAAAAAAAAAAAAAAAAAAAAAGUR",
  },
  {
    miiData: "AwEAIDVEgCveHCqDgP9wmbYmSnvSxQAAAQBEAGEAbgBpAAAAAAAAAAAAAAAAADs3AgBVCx1pRBpANEUURhIPxA4AAClTWsNEAAAAAAAAAAAAAAAAAAAAAAAAAAAAALVb",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMEMonKDqgr79gP9wmedgoZvvAgAAABhCAGkAZwAgAEYAYQB0ACAARgB1AEBARpAkBlJoQxjSNEYUhBIRaA0AMCkgUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAANtQ",
  },
  {
    miiData: "AwEAMCT6d7wwhGkPgP9wmYg62JEwZgAAASRXAEEAUwBIAEMATwBPAEMASABJAEBAAJAyDx5pRBrqNEYWaxQCaQ4AOC0gWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM8Z",
  },
  {
    miiData: "AwEAMIZ+TgOPLn3egP9wmYebz4QHawAAAQBmAHUAYwBrAG4AIABjAHUAbgB0AEBAFDAGCwdoRBhjNEcSYBICaQ0AGClTUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADB6",
  },
  {
    miiData: "AwEAMN4cKEquh8u9gP9wmaTiJXkY+AAAASxXAFcAVwBXAFcAVwBXAFcAVwBXAEBAImACB3toQxrtNEUWYBRRaA4AOC1AWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMUM",
  },
  {
    miiData: "AwEAMNP+ZeK58uHykq9hUiwQwQO+iQAAAVxmAGIAagBuAAAAAAAAAAAAAAAAAH8AAgCAARRrRBggNEYUgRKBaA0AACkFUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbS",
  },
  {
    miiData: "AwEAMCT6d7wwhGkPgP9wmYg62JEwZgAAASRXAEEAUwBIAEMATwBPAEMASABJAEBAAJAyDx5pRBrqNEYWaxQCaQ4AOC0gWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM8Z",
  },
  {
    miiData: "AwEAMIZ+TgOPLn3egP9wmYebz4QHawAAAQBmAHUAYwBrAG4AIABjAHUAbgB0AEBAFDAGCwdoRBhjNEcSYBICaQ0AGClTUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADB6",
  },
  {
    miiData: "AwEAMN4cKEquh8u9gP9wmaTiJXkY+AAAASxXAFcAVwBXAFcAVwBXAFcAVwBXAEBAImACB3toQxrtNEUWYBRRaA4AOC1AWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMUM",
  },
  {
    miiData: "AwEAMNP+ZeK58uHykq9hUiwQwQO+iQAAAVxmAGIAagBuAAAAAAAAAAAAAAAAAH8AAgCAARRrRBggNEYUgRKBaA0AACkFUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbS",
  },
  {
    miiData: "AwEAIE4vaoCzgYpzgN8ZmnGioS4CKAAAAVxtAGkAbQBvAAAAAAAAAAAAAAAAAEBAEhA8ABhoYxw3NEYUJBYZJg0AACmDYkhQbQBpAG0AbwAAAAAAAAAAAAAAAAAAAIZa",
  },
  {
    miiData: "AwEAMBs8xqsHR9PC3MXz5YXEaBemLwAAVllEAGEAdgBpAGQAIABKAG8AYQBxAE0wABBXAAJoRBgTZEUUgRIZZg4AACkAaGdQYgBpAGcAIABzAGEAbAB0AHkAAAAAALpc",
  },
  {
    miiData: "AwEAMHpnKmJS2hyMmWzpBSwQwXjnewAAV10GJkQAYQBuAGkAAAAAAAAAAAAAAEM5AJhlBR1pRBogNWQQRhKZZg4AACnTUiVNbwB3AG8AAAAAAAAAAAAAAAAAAAAAAGUR",
  },
  {
    miiData: "AwEAIDVEgCveHCqDgP9wmbYmSnvSxQAAAQBEAGEAbgBpAAAAAAAAAAAAAAAAADs3AgBVCx1pRBpANEUURhIPxA4AAClTWsNEAAAAAAAAAAAAAAAAAAAAAAAAAAAAALVb",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMEMonKDqgr79gP9wmedgoZvvAgAAABhCAGkAZwAgAEYAYQB0ACAARgB1AEBARpAkBlJoQxjSNEYUhBIRaA0AMCkgUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAANtQ",
  },
  {
    miiData: "AwEAMOFEOFJOyk8wgP9wmffiR6e5GwAAASRpACAAYQBtACAAcwB0AGUAdgBlAEBAAAQCBchoQxipNEcUYBIjaA0AKCkwUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMe4",
  },
  {
    miiData: "AwEAMCT6d7wwhGkPgP9wmYg62JEwZgAAASRXAEEAUwBIAEMATwBPAEMASABJAEBAAJAyDx5pRBrqNEYWaxQCaQ4AOC0gWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM8Z",
  },
  {
    miiData: "AwEAMIZ+TgOPLn3egP9wmYebz4QHawAAAQBmAHUAYwBrAG4AIABjAHUAbgB0AEBAFDAGCwdoRBhjNEcSYBICaQ0AGClTUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADB6",
  },
  {
    miiData: "AwEAMN4cKEquh8u9gP9wmaTiJXkY+AAAASxXAFcAVwBXAFcAVwBXAFcAVwBXAEBAImACB3toQxrtNEUWYBRRaA4AOC1AWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMUM",
  },
  {
    miiData: "AwEAMNP+ZeK58uHykq9hUiwQwQO+iQAAAVxmAGIAagBuAAAAAAAAAAAAAAAAAH8AAgCAARRrRBggNEYUgRKBaA0AACkFUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbS",
  },
  {
    miiData: "AwEAIE4vaoCzgYpzgN8ZmnGioS4CKAAAAVxtAGkAbQBvAAAAAAAAAAAAAAAAAEBAEhA8ABhoYxw3NEYUJBYZJg0AACmDYkhQbQBpAG0AbwAAAAAAAAAAAAAAAAAAAIZa",
  },
  {
    miiData: "AwEAMBs8xqsHR9PC3MXz5YXEaBemLwAAVllEAGEAdgBpAGQAIABKAG8AYQBxAE0wABBXAAJoRBgTZEUUgRIZZg4AACkAaGdQYgBpAGcAIABzAGEAbAB0AHkAAAAAALpc",
  },
  {
    miiData: "AwEAMHpnKmJS2hyMmWzpBSwQwXjnewAAV10GJkQAYQBuAGkAAAAAAAAAAAAAAEM5AJhlBR1pRBogNWQQRhKZZg4AACnTUiVNbwB3AG8AAAAAAAAAAAAAAAAAAAAAAGUR",
  },
  {
    miiData: "AwEAIDVEgCveHCqDgP9wmbYmSnvSxQAAAQBEAGEAbgBpAAAAAAAAAAAAAAAAADs3AgBVCx1pRBpANEUURhIPxA4AAClTWsNEAAAAAAAAAAAAAAAAAAAAAAAAAAAAALVb",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMCRqeFYxdlD/gP9wmSoBKL7iNwAAARBBAG4AbgBpAGUAAAAAAAAAAAAAAEBAApAuDUxpRBoNNEUUbRSjaA4AAC0hWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy9",
  },
  {
    miiData: "AwEAIBpSeGOa3Cm8gN8ZmsP6/intuwAAARRFAG0AaQBsAHkAAAAAAAAAAAAAAEBAAphUAztpQxghNGMQYRKBZg0AACnRUUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLB",
  },
  {
    miiData: "AwEAMG6DUOL5lfcpgP9wmWs/2Ob2SwAAAADhMKQwyTAgAKQw8zAgAO8w6jCqMEBAAAAhAQJoRBgmNEYUgRIXaA0AACkAUkhQ4TCkMMkwIACkMPMwIADvMOowqjAAAM+R",
  },
  {
    miiData: "AwEAMEMonKDqgr79gP9wmedgoZvvAgAAABhCAGkAZwAgAEYAYQB0ACAARgB1AEBARpAkBlJoQxjSNEYUhBIRaA0AMCkgUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAANtQ",
  },
  {
    miiData: "AwEAMOFEOFJOyk8wgP9wmffiR6e5GwAAASRpACAAYQBtACAAcwB0AGUAdgBlAEBAAAQCBchoQxipNEcUYBIjaA0AKCkwUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMe4",
  },
  {
    miiData: "AwEAMCT6d7wwhGkPgP9wmYg62JEwZgAAASRXAEEAUwBIAEMATwBPAEMASABJAEBAAJAyDx5pRBrqNEYWaxQCaQ4AOC0gWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM8Z",
  },
  {
    miiData: "AwEAMIZ+TgOPLn3egP9wmYebz4QHawAAAQBmAHUAYwBrAG4AIABjAHUAbgB0AEBAFDAGCwdoRBhjNEcSYBICaQ0AGClTUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADB6",
  },
  {
    miiData: "AwEAMN4cKEquh8u9gP9wmaTiJXkY+AAAASxXAFcAVwBXAFcAVwBXAFcAVwBXAEBAImACB3toQxrtNEUWYBRRaA4AOC1AWkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMUM",
  },
  {
    miiData: "AwEAMNP+ZeK58uHykq9hUiwQwQO+iQAAAVxmAGIAagBuAAAAAAAAAAAAAAAAAH8AAgCAARRrRBggNEYUgRKBaA0AACkFUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbS",
  },
]

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