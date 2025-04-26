import sjcl from "../external/mii-frontend/sjcl.min.js";

const crc16 = function crc16(data: any) {
  let crc = 0;
  let msb = crc >> 8;
  let lsb = crc & 0xff;

  for (let i = 0; i < data.length; i++) {
    let c = data[i];
    let x = c ^ msb;
    x ^= x >> 4;
    msb = (lsb ^ (x >> 3) ^ (x << 4)) & 0xff;
    lsb = (x ^ (x << 5)) & 0xff;
  }

  crc = (msb << 8) + lsb;
  return crc;
};

// taken from the mii renderer frontend code

export const encryptAndEncodeVer3StoreDataToQRCodeFormat = (
  data: Uint8Array
) => {
  // NOTE: uses sjcl and assumes it is loaded
  const nonce = data.slice(12, 20);
  console.log(
    "nonce:",
    Array.from(nonce)
      .map((s) => s.toString(16))
      .join("")
  );
  let content = [...data.slice(0, 12), ...data.slice(20)];
  console.log("content:", content.map((s) => s.toString(16)).join(""));

  // checksum the data, overriding the previous checksum it may have had
  const checksumContent = [
    ...data.slice(0, 12),
    ...nonce,
    ...data.slice(20, -2)
  ];
  console.log(
    "checksumContent:",
    checksumContent.map((s) => s.toString(16)).join("")
  );
  const newChecksum = crc16(new Uint8Array(checksumContent));
  console.log("checksum:", newChecksum.toString(16));
  // pack the uint16 checksum into an array
  const newChecksumArray = [(newChecksum >> 8) & 0xff, newChecksum & 0xff];
  content = [...content.slice(0, -2), ...newChecksumArray];

  //const cipher =  new sjcl.cipher.aes(sjcl.codec.hex.toBits('59FC817E6446EA6190347B20E9BDCE52'));
  const cipher = new sjcl.cipher.aes([
    1509720446, 1682369121, -1875608800, -373436846
  ]);

  const paddedContent = new Uint8Array([...content, ...new Array(8).fill(0)]);
  const paddedContentBits = sjcl.codec.bytes.toBits(Array.from(paddedContent));
  // nonce has to be padded
  const nonceBits = sjcl.codec.bytes.toBits([...nonce, 0, 0, 0, 0]);

  const encryptedBits = sjcl.mode.ccm.encrypt(
    cipher,
    paddedContentBits,
    nonceBits,
    [],
    128
  );
  const encryptedBytes = sjcl.codec.bytes.fromBits(encryptedBits);

  const correctEncryptedContentLength = encryptedBytes.length - 8 - 16;
  const encryptedContentCorrected = encryptedBytes.slice(
    0,
    correctEncryptedContentLength
  );
  const tag = encryptedBytes.slice(encryptedBytes.length - 16);

  // construct and return an array
  const result = [...nonce, ...encryptedContentCorrected, ...tag];
  // note: not a uint8array because qrjs takes arrays natively
  return result;
};
