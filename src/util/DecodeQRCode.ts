// Most if not all of this code is based on arian's jsfiddle, then ported to TypeScript by kat21 for use in mii creator
// https://jsfiddle.net/arian_/ckya346z/12/
import sjcl from "../external/mii-frontend/sjcl.min.js";
import QrScanner from "../external/mii-frontend/qr-scanner.umd.min.js";
// unused temporarily because it isn't loading the extra data correctly from TL qr codes from my testing
import {
  MiiTLHairSprayToSwitchColor,
  SwitchMiiColorTable
} from "../constants/ColorTables.js";
import Modal from "../ui/components/Modal.js";
import { getSetting } from "./SettingsHelper.js";
import { dataToBase64, dataToHex } from "./dataConvert.js";

// AES keys
const AES_CCM_KEY_HEX = "59FC817E6446EA6190347B20E9BDCE52";
const AES_CTR_KEY_HEX = "30819F300D06092A864886F70D010101";

// Converted AES-CCM key for sjcl
const AES_CCM_KEY_BITS = sjcl.codec.hex.toBits(AES_CCM_KEY_HEX);

const crypto = window.crypto;
const sc = crypto.subtle;

export function QrScannerError(message: string) {
  // hack
  if (message === "Camera not found.") {
    message +=
      "\nCheck your browser settings and make sure it isn't disabled.\nIf you don't have a camera, you can disable the option in Mii Creator settings.";
  }

  var m = Modal.modal(
    "QR Scanner Error",
    message,
    "body",
    {
      text: "Cancel"
    },
    {
      text: "OK"
    }
  );
  m.qs(".modal-content")!.styleJs({ minWidth: "360px" });
}

// let currentQrData = new Uint8Array();
// let currentQrExtraData = new Uint8Array();

// Utility: Hex <-> Uint8Array conversion
function hexToUint8Array(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, 2), 16);
  }
  return bytes;
}

function uint8ArrayToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Utility: Base64 <-> Uint8Array conversion
function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper function to check if a string is valid hex
function isHex(str: string) {
  const hexRegex = /^[0-9A-Fa-f]+$/;
  return hexRegex.test(str);
}

// Helper function to check if a string is valid base64
function isBase64(str: string) {
  try {
    atob(str); // `atob` will throw an error if the string is not valid base64
    return true;
  } catch (e) {
    return false;
  }
}

// CRC16 and CRC32 utilities
function crc16(data: Uint8Array<ArrayBuffer>) {
  let crc = 0xffff;
  for (let byte of data) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return crc & 0xffff;
}

// Define the polynomial used in CRC-32/CKSUM
const CRC32_CKSUM_POLYNOMIAL = 0x04c11db7;

// Create a table for CRC-32/CKSUM lookup
let crc32CksumTable = new Uint32Array(256);

// Generate the CRC-32/CKSUM table
function generateCrc32CksumTable() {
  for (let i = 0; i < 256; i++) {
    let crc = i << 24;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x80000000) {
        crc = (crc << 1) ^ CRC32_CKSUM_POLYNOMIAL;
      } else {
        crc = crc << 1;
      }
    }
    crc32CksumTable[i] = crc >>> 0; // Ensure the value is an unsigned 32-bit integer
  }
}

// Call the table generation function
generateCrc32CksumTable();

// CRC-32/CKSUM function
function crc32(input: string | any[] | Uint8Array<ArrayBuffer>) {
  let crc = 0x00000000; // Initial value for CRC-32/CKSUM
  for (let i = 0; i < input.length; i++) {
    const byte = (input[i] ^ (crc >>> 24)) & 0xff;
    crc = (crc32CksumTable[byte] ^ (crc << 8)) >>> 0;
  }
  return (crc ^ 0xffffffff) >>> 0; // XOR with 0xFFFFFFFF at the end and ensure it's unsigned
}

// AES-CCM Decryption (using private ctrMode function)
function decryptAesCcm(
  encryptedData: string | any[] | Uint8Array<ArrayBuffer>
) {
  if (encryptedData.length < 112) {
    throw new Error(
      "Mii QR codes should be 112 or more bytes long, yours is " +
        encryptedData.length
    );
  }

  const nonce = encryptedData.slice(0, 8);
  const encryptedContent = encryptedData.slice(8);

  const cipher = new sjcl.cipher.aes(AES_CCM_KEY_BITS);

  const encryptedBits = sjcl.codec.bytes.toBits(Array.from(encryptedContent));
  const nonceBits = sjcl.codec.bytes.toBits([...nonce, 0, 0, 0, 0]);

  const tlen = 128; // Tag length in bits
  const out = sjcl.bitArray.clamp(
    encryptedBits,
    sjcl.bitArray.bitLength(encryptedBits) - tlen
  );

  const ctrDecrypt = sjcl.mode.ccm._ctrMode || sjcl.mode.ccm.C;
  const decryptedBits = ctrDecrypt(cipher, out, nonceBits, [], tlen, 3);

  const decryptedBytes = sjcl.codec.bytes.fromBits(decryptedBits.data);
  const decryptedSlice = new Uint8Array(decryptedBytes).slice(0, 0x58);

  return new Uint8Array([
    ...decryptedSlice.slice(0, 12),
    ...nonce,
    ...decryptedSlice.slice(12)
  ]);
}

// AES-CTR Decryption (for extra data)
async function decryptAesCtr(
  encryptedData: Uint8Array<ArrayBuffer>,
  iv: Uint8Array<ArrayBuffer>
) {
  // Calls to SubtleCr*pto (window.cr*pto.subtle):
  const key = await sc.importKey(
    "raw",
    hexToUint8Array(AES_CTR_KEY_HEX),
    { name: "AES-CTR" },
    false,
    ["decrypt"]
  );
  const decrypted = await sc.decrypt(
    { name: "AES-CTR", counter: iv, length: 128 },
    key,
    encryptedData.buffer
  );
  return new Uint8Array(decrypted);
}

function extractUTF16LEText(data: string | any[], startOffset: number) {
  const length = 20;
  let endPosition = startOffset;

  // Determine the byte order based on the isBigEndian flag
  const decoder = new TextDecoder("utf-16le");

  // Find the position of the null terminator (0x00 0x00)
  while (endPosition < startOffset + length) {
    if (data[endPosition] === 0x00 && data[endPosition + 1] === 0x00) {
      break;
    }
    endPosition += 2; // Move in 2-byte increments (UTF-16)
  }

  // Extract and decode the name bytes
  const nameBytes = data.slice(startOffset, endPosition);
  return decoder.decode(nameBytes as any);
}
function getNameFromCFSD(data: any) {
  return extractUTF16LEText(data, 0x1a);
}
function getFormattedTime() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}_${String(
    now.getHours()
  ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(
    now.getSeconds()
  ).padStart(2, "0")}`;
}

function getExtraDataGenericName(data: string | any[]) {
  switch (data.length) {
    case 40:
      return "miitomo-data";
    case 240:
      return "tomodachi-life-data";
    case 192:
      return "miitopia-data";
    default:
      break;
  }
}

// QR Code Generation
// export async function generateQrCode() {
//   // const baseData = new Uint8Array(); // hexEditorBaseInput.saveToArray();
//   const encryptedBase = encryptAesCcm(currentQrData);

//   // const extraData:any[] = []; // hexEditorExtraInput.saveToArray();
//   let qrData = encryptedBase;

//   if (currentQrExtraData.length > 0) {
//     // Append CRC32 for extra data
//     const dataForCRC32 = new Uint8Array([...encryptedBase, ...extraData]);
//     console.log(
//       "data into crc32:",
//       uint8ArrayToHex(dataForCRC32).replace(/(.{2})/g, "$1 ")
//     );
//     const crc32Val = crc32(dataForCRC32);
//     const crc32Bytes = new Uint8Array([
//       crc32Val & 0xff,
//       (crc32Val >> 8) & 0xff,
//       (crc32Val >> 16) & 0xff,
//       (crc32Val >> 24) & 0xff,
//     ]);
//     console.log(
//       "crc32: ",
//       uint8ArrayToHex(crc32Bytes).replace(/(.{2})/g, "$1 ")
//     );
//     const extraDataWithCRC32 = new Uint8Array([...currentQrExtraData, ...crc32Bytes]);
//     const { encryptedData, iv } = await encryptAesCtr(extraDataWithCRC32);
//     qrData = new Uint8Array([...qrData, ...iv, ...encryptedData]);
//     console.log(qrData);
//   }

//   const qrContainer = document.getElementById("qr-code-container");
//   qrContainer.firstElementChild.src = QRCode.generatePNG(qrData, {
//     margin: null,
//   });
// }

// QR Code Scanner for decoding
let cameraScanner: any;

export async function startScanner(camList: HTMLElement) {
  console.log("startScanner()");
  cameraScanner = new QrScanner(
    document.getElementById("qr-video"),
    (result: any) => handleQrCode(result),
    {
      onDecodeError: (error: string | null) => {
        if (error === "No QR code found") return;
        console.log("QR scan error:", error);
      },
      highlightScanRegion: true,
      highlightCodeOutline: true
    }
  );

  // const camList = document.getElementById("cam-list");
  const allowCam = await getSetting("allowQrCamera");
  if (allowCam) {
    cameraScanner
      .start()
      .then(() => {
        // List cameras after the scanner started to avoid listCamera's stream and the scanner's stream being requested
        // at the same time which can result in listCamera's unconstrained stream also being offered to the scanner.
        // Note that we can also start the scanner after listCameras, we just have it this way around in the demo to
        // start the scanner earlier.
        const existingCameras =
          document.getElementsByClassName("device-camera");
        Array.from(existingCameras).forEach((camera) => {
          // go ahead and remove all existing cameras to repopulate camera list
          camera.remove();
        });
        QrScanner.listCameras(true)
          .then((cameras: any[]) =>
            cameras.forEach((camera: { id: string; label: string }) => {
              const option = document.createElement("option");
              option.value = camera.id;
              option.text = camera.label;
              option.className = "device-camera";
              camList.appendChild(option);
            })
          )
          .catch((e) => {
            QrScannerError(e);
            console.error(e);
          });
      })
      .catch((e: any) => {
        QrScannerError(e);
        console.error(e);
      });
  } else {
    // ignore camera list and only display non-cam related errors
    cameraScanner.start().catch((e: any) => {
      if (e !== "Camera not found.") QrScannerError(e);
    });
  }
}

export async function initQrCam(
  camList: HTMLElement,
  startCamera: HTMLButtonElement,
  stopCamera: HTMLButtonElement,
  fileInput: HTMLInputElement
) {
  console.log("initQrCam()");
  let allowCam = await getSetting("allowQrCamera");

  const disableCam = () => {
    camList.style.display = "none";
    startCamera.style.display = "none";
    stopCamera.style.display = "none";
  };

  if (allowCam) {
    QrScanner.hasCamera()
      .then((hasCamera: any) => {
        if (hasCamera === false) {
          disableCam();
        }
      })
      .catch((e) => {
        QrScannerError(e);
        console.error(e);
      });
  } else disableCam();

  camList.addEventListener("change", (event) => {
    cameraScanner.setCamera((event.target as any).value);
  });

  startCamera.addEventListener("click", () => {
    try {
      cameraScanner = new QrScanner(
        document.getElementById("qr-video"),
        (result: any) => handleQrCode(result)
      );
      cameraScanner.start().catch((e: any) => {
        QrScannerError(e);
        console.error(e);
      });
    } catch (e: any) {
      QrScannerError(e);
      console.error(e);
    }
  });

  stopCamera.addEventListener("click", () => {
    if (cameraScanner) cameraScanner.stop();
  });

  fileInput.addEventListener("change", (event) => {
    const file = (event.target as HTMLInputElement).files![0];
    if (file) {
      QrScanner.scanImage(file, { returnDetailedScanResult: true }).then(
        (result: any) => handleQrCode(result)
      );
    }
  });
}

export enum QrScanDataType {
  GenericWiiU3ds,
  ExtraDataTL,
  ExtraDataMiiC
}

var qrCallback: (data: Uint8Array, type: QrScanDataType) => any;
export function setQRCallback(
  fn: (data: Uint8Array, type: QrScanDataType) => any
) {
  qrCallback = fn;
}

function handleQrCode(result: { bytes: any; noQrCode: any }) {
  if (!result || !result.bytes) return;

  if (result.noQrCode) {
    return;
  }

  cameraScanner.stop();

  const qrData = new Uint8Array(result.bytes);
  console.log(dataToHex(qrData));

  const decryptedData = decryptAesCcm(qrData.slice(0, 112)); // First 112 bytes are AES-CCM
  const decryptedStoreDataBuf = decryptedData;

  console.log("Decrypted QR Store Data:", dataToBase64(decryptedStoreDataBuf));

  // hexEditorBaseOutput.loadFromArray(decryptedData);
  // document.getElementById("extra-data-warning").style.display = "none";

  if (qrData.length > 112) {
    console.log("Has extra data");
    const iv = qrData.slice(112, 128);
    const encryptedExtra = qrData.slice(128, -4);
    decryptAesCtr(encryptedExtra, iv)
      .then((decryptedExtraData) => {
        console.log("Scanned Extra Data:", dataToHex(decryptedExtraData));

        if (decryptedExtraData.length === 240) {
          qrCallback(decryptedStoreDataBuf, QrScanDataType.ExtraDataTL);
          // QrScannerError(
          //   "Tomodachi Life codes won't retain hair dye info yet."
          // );
          // ⬇️ literally the hair dye code
          // const hairSpray = decryptedExtraData[0x43];
          // console.log("Hair spray original value: 0x" + hairSpray.toString(16));
          // if (hairSpray > 0x80) {
          //   // Recreate the hair spray value from an offset:
          //   // (0x81 + (20)*2).toString(16)
          //   const hairSprayIndex = (hairSpray - 0x81) / 2;
          //   const hairSprayEntry = MiiTLHairSprayToSwitchColor[hairSprayIndex];
          //   const m = SwitchMiiColorTable[hairSprayEntry];
          //   console.log(
          //     `Hair spray value: %c0x${hairSpray.toString(16)}`,
          //     `color:${m}`
          //   );
          // } else {
          //   console.log("Hair spray is not used");
          // }
        }
      })
      .catch((error) => {
        console.error(
          "Something went wrong decrypting the QR extra data",
          error
        );
        console.log("Attempting to load QR extra data anyways:");
        const extDataBuf = Buffer.from(qrData.slice(112));
        console.log(extDataBuf.toString("base64"));
        if (extDataBuf.length === 10 || extDataBuf.length === 12) {
          console.log("This is probably miic data");
          // put together the data
          var newArray = new Uint8Array(
            decryptedStoreDataBuf.length + extDataBuf.length
          );
          newArray.set(decryptedStoreDataBuf);
          newArray.set(extDataBuf, decryptedStoreDataBuf.length);
          qrCallback(newArray, QrScanDataType.ExtraDataMiiC);
        }
      });
  } else {
    console.log("No extra data");
    qrCallback(decryptedStoreDataBuf, QrScanDataType.GenericWiiU3ds);
  }
}

// Utility function to convert 16-bit checksum to byte array
function toByteArray(num: number) {
  return [(num >> 8) & 0xff, num & 0xff];
}
