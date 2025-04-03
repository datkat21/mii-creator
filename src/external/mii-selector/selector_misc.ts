export const css = /*css*/ `* {
    font-family: 'nintendo_NTLG-DB_001' !important;
    --default-selector-width: 750px;
    --default-selector-height: 520px;
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
    line-height: 1.5;
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

#mii-creator-selector-modal .selector .mii-container .mii>p svg {
    width: 36px;
    height: 36px;
}
#mii-creator-selector-modal .selector .mii-container .mii>p {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
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

export const miiIconFavorite = `<svg width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.87914 15.4237L8.93213 14.88L9.17184 15.9453L11.3207 25.4956C11.3414 26.5901 11.9723 27.4324 12.8675 28.0586C13.7703 28.6899 14.991 29.1411 16.3056 29.4641C18.9374 30.1108 22.0979 30.2798 24.2801 30.24C26.4624 30.2798 29.6229 30.1108 32.2547 29.4641C33.5692 29.1411 34.79 28.6899 35.6927 28.0586C36.588 27.4324 37.2189 26.5901 37.2396 25.4956L39.3884 15.9453L39.636 14.8448L38.6714 15.4295L31.0959 20.0206L24.6414 12.6439L24.2677 12.2169L23.9086 12.6561L17.8861 20.021L9.87914 15.4237ZM36.2778 29.0877L36.3668 28.1968L35.5756 28.6157C31.6139 30.7131 27.4083 30.72 24.2801 30.72C21.1482 30.72 16.7051 30.7124 12.7447 28.6157L11.9534 28.1968L12.0425 29.0877L12.2804 31.4661C12.2944 32.3073 12.9852 32.9508 13.7746 33.4207C14.6088 33.9172 15.7367 34.3315 16.9561 34.6577C19.3834 35.307 22.2989 35.6395 24.2801 35.5209C26.2612 35.6396 29.1178 35.3069 31.4871 34.6569C32.6773 34.3303 33.7761 33.9153 34.5885 33.4175C35.3606 32.9443 36.0263 32.3002 36.0399 31.466L36.2778 29.0877Z" fill="url(#paint0_linear_1196_50)" stroke="white" stroke-width="0.96"/><defs><linearGradient id="paint0_linear_1196_50" x1="24.2801" y1="12.96" x2="39.1601" y2="35.04" gradientUnits="userSpaceOnUse"><stop stop-color="#EC0000"/><stop offset="0.955263" stop-color="#B50400"/></linearGradient></defs></svg>`;
export const miiIconSpecial = `<svg width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.3304 19.7505L9.36289 19.1592L9.61179 20.2654L11.7606 29.8157C11.7813 30.9102 12.4123 31.7525 13.3075 32.3786C14.2102 33.01 15.431 33.4611 16.7455 33.7842C19.3774 34.4309 22.5378 34.5999 24.7201 34.5601C26.9023 34.5999 30.0628 34.4309 32.6946 33.7842C34.0092 33.4611 35.2299 33.01 36.1327 32.3786C37.0279 31.7525 37.6588 30.9102 37.6796 29.8157L39.8284 20.2654L40.0693 19.1948L39.1196 19.7446L31.1139 24.3794L25.0924 16.9771L24.7325 16.5347L24.358 16.9649L17.9042 24.3789L10.3304 19.7505ZM36.7177 33.4078L36.8068 32.5169L36.0155 32.9358C32.0538 35.0332 27.8483 35.04 24.7201 35.04C21.5882 35.04 17.1451 35.0325 13.1847 32.9358L12.3934 32.5169L12.4825 33.4078L12.7203 35.7861C12.7343 36.6274 13.4252 37.2709 14.2146 37.7407C15.0488 38.2372 16.1766 38.6515 17.396 38.9777C19.8234 39.627 22.7389 39.9596 24.7201 39.8409C26.7011 39.9596 29.5578 39.627 31.9271 38.9769C33.1173 38.6504 34.216 38.2354 35.0284 37.7375C35.8005 37.2643 36.4663 36.6203 36.4799 35.7861L36.7177 33.4078Z" fill="url(#paint0_linear_1196_45)" stroke="white" stroke-width="0.96"/><circle cx="9.36001" cy="15.12" r="4.08" fill="#F48700" stroke="white" stroke-width="0.96"/><circle cx="24.7199" cy="12.2399" r="4.08" fill="#F79400" stroke="white" stroke-width="0.96"/><circle cx="40.08" cy="15.12" r="4.08" fill="#FCC000" stroke="white" stroke-width="0.96"/><defs><linearGradient id="paint0_linear_1196_45" x1="20.1601" y1="24" x2="37.9201" y2="41.76" gradientUnits="userSpaceOnUse"><stop stop-color="#F78E00"/><stop offset="0.11" stop-color="#FCBA00"/><stop offset="0.42" stop-color="#FCBA00"/><stop offset="0.63" stop-color="#EF4D00"/></linearGradient></defs></svg>`;
export const miiIconPersonal = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.5392 21.4997L22.6353 21.1837L22.3747 20.981L13.7347 14.261L13.0734 13.7467L12.9641 14.5773L11.8588 22.9773L11.8133 23.3233L12.1284 23.4733L20.1936 27.3133L20.6969 27.5529L20.8592 27.0196L22.5392 21.4997ZM24.6653 20.981L24.4046 21.1837L24.5008 21.4997L26.1808 27.0196L26.3431 27.5529L26.8463 27.3133L34.9116 23.4733L35.2267 23.3233L35.1812 22.9773L34.0759 14.5773L33.9666 13.7467L33.3053 14.261L24.6653 20.981Z" fill="url(#paint0_linear_1966_21)" stroke="white" stroke-width="0.96"/><path d="M6.98724 18.5683L5.90574 17.8433L6.25786 19.0968L9.57319 30.899C9.599 32.0679 10.2815 32.9687 11.254 33.641C12.2385 34.3217 13.5725 34.8096 15.0136 35.1597C17.8986 35.8605 21.3655 36.0439 23.76 36.0007C26.1544 36.0439 29.6213 35.8605 32.5064 35.1597C33.9475 34.8096 35.2815 34.3217 36.2659 33.641C37.2384 32.9687 37.9209 32.0679 37.9468 30.899L41.2621 19.0968L41.6142 17.8433L40.5327 18.5683L30.7313 25.1386H30.3405L24.1568 16.0501L23.76 15.4668L23.3631 16.0501L17.1794 25.1386H16.7886L6.98724 18.5683ZM36.8906 34.7872L36.9804 33.9002L36.1905 34.3136C31.8267 36.5973 27.1951 36.6041 23.76 36.6041C20.3211 36.6041 15.4284 36.5966 11.0658 34.3136L10.276 33.9002L10.3657 34.7872L10.6271 37.3709C10.6414 38.2643 11.3834 38.9527 12.2474 39.4611C13.1581 39.9969 14.3919 40.4452 15.7291 40.7988C18.3922 41.503 21.5906 41.8632 23.76 41.7342C25.9292 41.8632 29.0628 41.503 31.662 40.798C32.967 40.4441 34.1688 39.9951 35.0554 39.4579C35.9 38.9462 36.6154 38.2572 36.6293 37.3709L36.8906 34.7872Z" fill="url(#paint1_linear_1966_21)" stroke="white" stroke-width="0.96"/><circle cx="5.5199" cy="14.64" r="3.6" fill="#F48700" stroke="white" stroke-width="0.96"/><circle cx="23.7599" cy="12.2401" r="3.6" fill="#F79400" stroke="white" stroke-width="0.96"/><circle cx="13.68" cy="12.7201" r="2.64" fill="#EF9600" stroke="white" stroke-width="0.96"/><circle cx="34.3199" cy="12.7201" r="2.64" fill="#EF9600" stroke="white" stroke-width="0.96"/><circle cx="41.9999" cy="15.12" r="3.6" fill="#EF9600" stroke="white" stroke-width="0.96"/><defs><linearGradient id="paint0_linear_1966_21" x1="20.2045" y1="18.6886" x2="29.2193" y2="30.9992" gradientUnits="userSpaceOnUse"><stop stop-color="#EF9600"/><stop offset="0.63" stop-color="#EF9600"/></linearGradient><linearGradient id="paint1_linear_1966_21" x1="16.32" y1="22.0801" x2="32.4548" y2="38.1065" gradientUnits="userSpaceOnUse"><stop stop-color="#F4AD00"/><stop offset="0.29" stop-color="#FADF00"/><stop offset="0.665" stop-color="#FCE200"/><stop offset="1" stop-color="#EC7900"/></linearGradient></defs></svg>`;

export enum MiiSelectorMiiType {
  Regular,
  Favorite,
  Special,
  Personal
}
