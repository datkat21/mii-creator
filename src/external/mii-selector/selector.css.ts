export default /*css*/ `* {
    font-family: 'nintendo_NTLG-DB_001' !important;
    --default-selector-width: 750px;
    --default-selector-height: 520px;
}

body {
    position: relative;
    font-size: 28px;
    line-height: 1.5;
    margin: 0;
    padding: 0;
    color: #323232;
    background: #fff;
    background-size: 10px;
    background-attachment: fixed;
    overflow-y: scroll;
}

#mii-creator-selector-modal *:focus-visible:not(.mii.selected:focus-visible){
    outline: none;
    box-shadow: 0px 0px 0px 3px #00c6f6 !important;
}

#mii-creator-selector-modal {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

@keyframes slideUp {
    0% {
        top: 100%;
    }
    85% {
        top: -3%; /* Slight overshoot */
    }
    95% {
        top: 1%; /* Small bounce back */
    }
    100% {
        top: 0%; /* Settle at final position */
    }
}

@keyframes slideDown {
    0% {
      top: 0%;
    }
    85% {
      top: 103%; /* Slight overshoot downward */
    }
    95% {
      top: 99%; /* Small bounce back upward */
    }
    100% {
      top: 100%; /* Settle at final position */
    }
  }
  


#mii-creator-selector-modal .selector {
    width: var(--default-selector-width);
    height: var(--default-selector-height);
    background: #ecf8f0;
    border-radius: 20px;
    box-shadow: inset 0px 0px 8px 1px #00000063;
    border: 2px solid #ecf8f0;
    box-sizing: border-box;
    position: relative;
    animation: slideUp 0.55s ease-in-out;
    overflow: hidden;
}

#mii-creator-selector-modal .selector.finish {
    animation: slideDown 0.55s ease-in-out forwards !important;
}

#mii-creator-selector-modal .button-navi {
    position: absolute;
    margin-top: 135px;
    top: 0;
    width: 100%;
    left: 0;
}

#mii-creator-selector-modal .button-navi button {
    height: 180px;
    font-size: 40px;
    text-shadow: 1px 2px #fff;
    color: #141914;
    width: 55px;
    border: 1.5px solid #68776d;
    cursor: pointer;
    transition: 0.02s;
    background: linear-gradient(#d3e1d3, #95aa95);
}

#mii-creator-selector-modal .button-navi button:active:not(:disabled) {
    text-shadow: 1px 2px #141914;
    background: linear-gradient(#24402f, #7d937f);
    color: #fff;
    border-color: #3e5846;
    width: 50px;
}

#mii-creator-selector-modal .button-navi button.prev{
    position: absolute;
    top: 0;
    left: 0;
    box-shadow: 2px 0px 3px 1px rgba(0, 0, 0, 0.30);
    border-top-right-radius: 13px;
    border-bottom-right-radius: 13px;
    border-left: none;
}

#mii-creator-selector-modal .button-navi button.next{
    position: absolute;
    top: 0;
    right: 0;
    box-shadow: -2px 1px 3px 1px rgba(0, 0, 0, 0.30);
    border-top-left-radius: 13px;
    border-bottom-left-radius: 13px;
    border-right: none;
}

#mii-creator-selector-modal .selector>h1 {
    text-align: center;
    margin: 5px;
    font-weight: normal;
    font-size: 32px;
}


#mii-creator-selector-modal .selector .mii-container {
    height: 60%;
    background: #fff;
    width: 90%;
    box-shadow: 0px 0px 3px 1px #d5dbd6;
    border-radius: 10px;
    margin: auto;
    margin-top: 25px;
    display: flex;
    align-content: center;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    left: 0px;
    position: relative;
}

#mii-creator-selector-modal .selector .mii-container.slideleft {
    animation: slideLeft 0.25s ease-in forwards;
}

#mii-creator-selector-modal .selector .mii-container.slideright {
    animation: slideRight 0.25s ease-in forwards;
}

#mii-creator-selector-modal .selector .mii-container.slideleftb {
    animation: slideLeftB 0.25s ease-in forwards;
}

#mii-creator-selector-modal .selector .mii-container.sliderightb {
    animation: slideRightB 0.25s ease-in forwards;
}

@keyframes slideLeft {
    from {
        left: 0%;
    }
    to {
        left: -100%;
    }
}

@keyframes slideRight {
    from {
        left: 0%;
    }
    to {
        left: 100%;
    }
}

@keyframes slideLeftB {
    from {
        left: 100%;
    }
    to {
        left: 0%;
    }
}

@keyframes slideRightB {
    from {
        left: -100%;
    }
    to {
        left: 0%;
    }
}

#mii-creator-selector-modal .selector .mii-container.guest {
    padding-left: 32%;
    box-sizing: border-box;
}

#mii-creator-selector-modal .selector .mii-container.transition {
    top: -60%;
    left: 100%;
    margin-top: 0;
}

#mii-creator-selector-modal .selector .mii-container.guest .guest-label{
    width: 230px;
    height: 280px;
    text-align: center;
    display: flex
;
    background: #e2f3e0;
    border-radius: 10px;
    position: absolute;
    left: 0;
    top: auto;
    margin-top: 15px;
    margin-left: 55px;
    color: #505050;
    justify-content: center;
    font-size: 30px;
    align-items: center;
}

#mii-creator-selector-modal .selector .mii-page-counter {
    margin-top: 15px;
    margin-right: 30px;
    position: absolute;
    right: 0;
    top: 75%;
    z-index: 5;
    width: auto;
    padding: 0px 20px;
    border-radius: 8px;
    font-size: 28px;
    box-shadow: -2px -2px 3px 1px rgba(255, 255, 255, 0.80) inset, 1px 1px 3px 1px rgb(0 0 0 / 22%) inset, 0px 0px 0px 1px rgb(0 0 0 / 33%);
    text-align: center;
    background: rgba(0, 0, 0, 0.10);
}

#mii-creator-selector-modal .selector .mii-page-counter>span>b{
    color: #0096ff;
    font-weight: normal;
    padding: 0px 12px;
}

#mii-creator-selector-modal .selector .mii-container .mii {
    width: 110px;
    margin: 5px;
    background: #e6f0e8;
    height: 130px;
    border: 3.5px solid #a0ad9e;
    border-radius: 10px;
    position: relative;
    cursor: pointer;
}

#mii-creator-selector-modal .selector .mii-container .mii:focus-visible {
    outline: none;
}

#mii-creator-selector-modal .selector .mii-container .mii.selected {
    border-color: #ffaf31;
    animation: glow 0.1s forwards ease-in-out;
    background: #fbbeaa;
}

@keyframes glow{
    0% {
        box-shadow: 1px 1px 4px #ffaf31 inset, 0px 0px 2px 0px #e5910f, inset 0px 0px 2px 2px #f2980a;
    }
    50% {
        box-shadow: 1px 1px 4px #ffaf31 inset, 0px 0px 6px 2px #e5910f, inset 0px 0px 2px 2px #f2980a;
    }
    100% {
        box-shadow: 1px 1px 4px #ffaf31 inset, 0px 0px 4px 1px #e5910f, inset 0px 0px 2px 2px #f2980a, inset 0px 0px 6px 2px #00000043;
    }
}

#mii-creator-selector-modal .selector .mii-container .mii>img {
    /* width: 120px; */
    position: absolute;
    /* left: -5px; */
    bottom: 0;
    pointer-events: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-drag: none;
    user-select: none;
    outline: none;
    animation: fadeIn 0.15s ease-in-out forwards;
    transform: translate(-50%, 0);
    width: 100%;
    height: 100%;
    left: 50%;
    object-fit: cover;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

#mii-creator-selector-modal .selector .mii-container .mii>p {
    display: block;
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    margin: auto;
    border-radius: 5px;
    width: auto;
    white-space: nowrap;
    font-size: 28px;
    min-width: 100px;
    padding: 3px 16px;
    text-align: center;
    z-index: 10;
    box-shadow: 0px 0px 1px 1.5px #9e9e9e, inset 0px 0px 5px 0px #afafaf;
    background: #fff;
    -webkit-user-drag: none;
    user-select: none;
    z-index: 10;

    color:#233f2e;
}

#mii-creator-selector-modal .selector .mii-container .mii>p::before {
  content: "";
  background-image: url("data:image/svg+xml,%3Csvg width='9' height='11' viewBox='0 0 9 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.5 11L4.5 2L8.5 11H0.5Z' fill='url(%23paint0_linear_1939_2)'/%3E%3Cpath d='M4.49997 3.23111L8 11H9L4.49997 0.76889L0 11H1L4.49997 3.23111Z' fill='%23A0A0A0'/%3E%3Cdefs%3E%3ClinearGradient id='paint0_linear_1939_2' x1='4.5' y1='2' x2='4.5' y2='11' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0.865385' stop-color='white'/%3E%3Cstop offset='1' stop-color='%23AFAFAF'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E");
  position: absolute;
  width: 20px;
  height: 24px;
  background-size: cover;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
  top: 100%;
  z-index: -1;
}

#mii-creator-selector-modal .selector .mii-container .mii:nth-child(1)>p,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(6)>p {
    left: -10%;
    transform: none;
}

#mii-creator-selector-modal .selector .mii-container .mii:nth-child(5)>p,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(10)>p {
    right: -10%;
    left: auto;
    transform: none;
}


/*
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(1)>p::before,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(6)>p::before {
    top: -100% !important;
    left: -10% !important;
    width: 100%;
    transform: translateY(100%) rotate(0deg) !important;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
}
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(5)>p::before,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(10)>p::before {
    top: -100% !important;
    left: -9% !important;
    width: 100%;
    transform: translateY(100%) rotate(0deg) !important;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
}

#mii-creator-selector-modal .selector .mii-container .mii:nth-child(5)>p::before {
    top: 100% !important;
  left: 50% !important;
    transform: translateX(-57%) rotate(180deg) !important;
}
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(1)>p::before {
    top: 100% !important;
  left: 50% !important;
    transform: translateX(-57%) rotate(180deg) !important;
}
*/

#mii-creator-selector-modal .selector .mii-container .mii:nth-child(6)>p,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(7)>p,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(8)>p,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(9)>p,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(10)>p {
    top: auto;
    bottom: -33px;
}

#mii-creator-selector-modal .selector .mii-container .mii:nth-child(6)>p::before,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(7)>p::before,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(8)>p::before,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(9)>p::before,
#mii-creator-selector-modal .selector .mii-container .mii:nth-child(10)>p::before {
    transform: translateX(-50%) translateY(100%);
    top: -100%;
}

#mii-creator-selector-modal .selector .button-container {
    width: 100%;
    position: absolute;
    display: flex;
    bottom: 0;
    left: 0;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: linear-gradient(#cfddcf, #889488);
    flex-direction: row;
    flex-wrap: nowrap;
}

#mii-creator-selector-modal .selector .button-container button{
    width: 50%;
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    text-shadow: 0px 2px #fff;
    font-size: 29px;
    height: 55px;
    border-top: 2px solid #44524b;
    box-sizing: border-box;
    transition: 0.02s;
    cursor: pointer;

    color: #141914;
}

#mii-creator-selector-modal .selector .button-container button:active:not(:disabled){ 
    text-shadow: 0px -2px #fff;
    background: linear-gradient(#879287, #bfd2bf);
}

#mii-creator-selector-modal .selector .button-container button.cancel{
    border-right: 1.5px solid #54625a;
    border-bottom-left-radius: 20px;
}

#mii-creator-selector-modal .selector .button-container button.confirm{
    border-left: 1.5px solid #54625a;
    border-bottom-right-radius: 20px;
}

#mii-creator-selector-modal .selector .button-container button.confirm:disabled{
    pointer-events: none;
    border-color: #aaaaaa;
    background: #bebebe;
    color: #adadad;
    text-shadow: none;
}

@media only screen and (max-width: 600px) {
    #mii-creator-selector-modal .selector {
        width: 90%;
    }
}`;
