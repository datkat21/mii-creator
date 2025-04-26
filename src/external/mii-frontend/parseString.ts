export var stripSpaces = function (str: string) {
  return str.replace(/\s+/g, "");
};

export var hexToUint8Array = function (hex: string) {
  return new Uint8Array(
    hex.match(/.{1,2}/g)!.map(function (byte: string) {
      return parseInt(byte, 16);
    })
  );
};

export var base64ToUint8Array = function (base64: string) {
  // Replace URL-safe Base64 characters
  var normalizedBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");

  // Custom function to pad the string with '=' manually
  var padBase64 = function (str: string) {
    while (str.length % 4 !== 0) {
      str += "=";
    }
    return str;
  };
  // Add padding if necessary
  var paddedBase64 = padBase64(normalizedBase64);
  var binaryString = atob(paddedBase64);
  var len = binaryString.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export var parseHexOrB64TextStringToUint8Array = function (text: string) {
  var inputData;
  // decode it to a uint8array whether it's hex or base64
  var textData = stripSpaces(text);
  // check if it's base 16 exclusively, otherwise assume base64
  if (/^[0-9a-fA-F]+$/.test(textData)) inputData = hexToUint8Array(textData);
  else inputData = base64ToUint8Array(textData);

  return inputData;
};

export function dataToBase64(data: number[]) {
  return btoa(String.fromCharCode.apply(null, data));
  // return da1ta.toBase64();
  // return data.toBase64();
  // return btoa(String.fromCharCode.apply(null, data));
}
export function dataToHex(data: number[]) {
  return Array.from(data, (i: any) => i.toString(16).padStart(2, "0")).join("");
  //  data.toHex();
}
