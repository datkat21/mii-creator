import Mii from "./mii";

// Parse Mii data
const miiData =
  "AwEAMLrDTIqIpLZhlH8Ps6TA4eK42QAAAFAOMHPgSQBtAG8AcgBhAHPgDzAAAGsrAgA5AQJoRBgm\r\nNEYUgRIWaA0AACmGAUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG7s";
const mii = new Mii(Buffer.from(miiData, "base64"));

// Encode as Mii Studio Mii
let encoded = mii.encodeStudio();
console.log(encoded.toString("base64"));

// Get Mii Studio render URL
let studioUrl = mii.studioUrl({
  type: "all_body"
});
console.log(studioUrl);

mii.height = 10;
studioUrl = mii.studioUrl({
  type: "all_body"
});
console.log(studioUrl);

// Change Mii data
mii.hairType = 2;

// Render with custom options
studioUrl = mii.studioUrl({
  width: 512,
  bgColor: "131733FF"
});
console.log(studioUrl);

// Encode as Wii U/3DS Mii
encoded = mii.encode();
console.log(encoded.toString("base64"));

// Get Mii Studio asset URL
console.log(mii.studioAssetUrlGlasses());

// Error on invalid Mii data
mii.hairColor = 9999;
encoded = mii.encode(); // AssertionError [ERR_ASSERTION]: Invalid Mii hair color. Got 9999, expected 0-7
