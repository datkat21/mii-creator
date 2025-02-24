import _ from "../../external/ffl.js/struct-fu-full";
import type { Struct } from "../../external/ffl.js/struct-fu";

export const FFLiCreateID = _.struct([
  _.ubit("flag_normal", 1),
  _.ubit("flag_1", 1),
  _.ubit("flag_temporary", 1),
  _.ubit("flag_3", 1),
  _.ubit("create_date1", 14), // 28-bit field
  _.ubit("create_date2", 14), // 28-bit field
  _.byte("base", 6)
]) as Struct;
export const date_timestamp = function (createID: any) {
  var val28 = (createID.create_date1 << 14) | createID.create_date2;
  var timestamp = val28 * 2 + 1262304000;
  return new Date(timestamp * 1000);
};
export const FFLiAuthorID = _.struct([_.byte("data", 8)]) as Struct;

// based on arian's FFLiMiiDataCore implementation
export const Ver3StoreData = _.struct([
  // 0x00: 32 bits
  _.ubitLE("mii_version", 8), // LSB
  _.ubitLE("copyable", 1),
  _.ubitLE("ng_word", 1),
  _.ubitLE("region_move", 2),
  _.ubitLE("font_region", 2),
  _.ubitLE("reserved_0", 2), // Unused padding
  _.ubitLE("room_index", 4),
  _.ubitLE("position_in_room", 4),
  _.ubitLE("author_type", 4),
  _.ubitLE("birth_platform", 3),
  _.ubitLE("reserved_1"), // Unused (MSB)

  // 0x04: author_id (8 bytes)
  _.struct("author_id", [FFLiAuthorID]),

  // 0x0C: creator_id (10 bytes)
  //_.byte('create_id', 10),
  _.struct("create_id", [FFLiCreateID]),

  // 0x16: padding (2 bytes)
  _.byte("reserved_2", 2),

  // 0x18: 16 bits for birthday and favorite
  _.ubitLE("gender", 1), // LSB
  _.ubitLE("birth_month", 4),
  _.ubitLE("birth_day", 5),
  _.ubitLE("favorite_color", 4),
  _.ubitLE("favorite", 1),
  _.ubitLE("padding_0", 1), // Placeholder (MSB)

  // 0x1A: name (UTF-16LE, 20 bytes)
  _.char16le("name", 20),

  // 0x2E: height and build
  _.uint8("height"),
  _.uint8("build"),

  // 0x30: 16 bits for face data
  _.ubitLE("localonly", 1), // LSB
  _.ubitLE("face_type", 4),
  _.ubitLE("face_color", 3),
  _.ubitLE("face_tex", 4),
  _.ubitLE("face_make", 4), // MSB

  // 0x32: 16 bits for hair data
  _.ubitLE("hair_type", 8), // LSB
  _.ubitLE("hair_color", 3),
  _.ubitLE("hair_flip", 1),
  _.ubitLE("padding_1", 4), // Unused padding (MSB)

  // 0x34: 16 bits for eye data
  _.ubitLE("eye_type", 6), // LSB
  _.ubitLE("eye_color", 3),
  _.ubitLE("eye_scale", 4),
  _.ubitLE("eye_aspect", 3), // MSB

  // 0x36: 16 bits for eye positioning
  _.ubitLE("eye_rotate", 5), // LSB
  _.ubitLE("eye_x", 4),
  _.ubitLE("eye_y", 5),
  _.ubitLE("padding_2", 2), // Unused padding (MSB)

  // 0x38: 16 bits for eyebrow data
  _.ubitLE("eyebrow_type", 5), // LSB
  _.ubitLE("eyebrow_color", 3),
  _.ubitLE("eyebrow_scale", 4),
  _.ubitLE("eyebrow_aspect", 3),
  _.ubitLE("padding_3", 1), // Unused padding (MSB)

  // 0x3A: 16 bits for eyebrow positioning
  _.ubitLE("eyebrow_rotate", 5), // LSB
  _.ubitLE("eyebrow_x", 4),
  _.ubitLE("eyebrow_y", 5),
  _.ubitLE("padding_4", 2), // Unused padding (MSB)

  // 0x3C: 16 bits for nose data
  _.ubitLE("nose_type", 5), // LSB
  _.ubitLE("nose_scale", 4),
  _.ubitLE("nose_y", 5),
  _.ubitLE("padding_5", 2), // Unused padding (MSB)

  // 0x3E: 16 bits for mouth data
  _.ubitLE("mouth_type", 6), // LSB
  _.ubitLE("mouth_color", 3),
  _.ubitLE("mouth_scale", 4),
  _.ubitLE("mouth_aspect", 3), // MSB

  // 0x40: 16 bits for mustache/mouth position
  _.ubitLE("mouth_y", 5), // LSB
  _.ubitLE("mustache_type", 3),
  _.ubitLE("padding_6", 8), // Unused padding (MSB)

  // 0x42: 16 bits for mustache/beard data
  _.ubitLE("beard_type", 3), // LSB
  _.ubitLE("beard_color", 3),
  _.ubitLE("beard_scale", 4),
  _.ubitLE("beard_y", 5),
  _.ubitLE("padding_7", 1), // Unused padding (MSB)

  // 0x44: 16 bits for glasses data
  _.ubitLE("glasses_type", 4), // LSB
  _.ubitLE("glasses_color", 3),
  _.ubitLE("glasses_scale", 4),
  _.ubitLE("glass_y", 5), // MSB

  // 0x46: 16 bits for mole data
  _.ubitLE("mole_type", 1), // LSB
  _.ubitLE("mole_scale", 4),
  _.ubitLE("mole_x", 5),
  _.ubitLE("mole_y", 5),
  _.ubitLE("padding_8", 1), // Unused padding (MSB)

  // FFLStoreData
  _.char16le("creator", 20),
  _.uint16le("padding_9"),
  _.uint16("checksum")
]) as Struct;

// Generate type data with this snippet
/*
var obj = Ver3StoreData.unpack(parseHexOrB64TextStringToUint8Array("..."))
var text="";

for (var key in obj) {
  text += `${key}: ${typeof obj[key]};\n`
}

console.log(text)
*/
export type Ver3StoreData = {
  mii_version: number;
  copyable: number;
  ng_word: number;
  region_move: number;
  font_region: number;
  reserved_0: number;
  room_index: number;
  position_in_room: number;
  author_type: number;
  birth_platform: number;
  reserved_1: number;
  author_id: FFLiAuthorID;
  create_id: FFLiCreateID;
  reserved_2: object;
  gender: number;
  birth_month: number;
  birth_day: number;
  favorite_color: number;
  favorite: number;
  padding_0: number;
  name: string;
  height: number;
  build: number;
  localonly: number;
  face_type: number;
  face_color: number;
  face_tex: number;
  face_make: number;
  hair_type: number;
  hair_color: number;
  hair_flip: number;
  padding_1: number;
  eye_type: number;
  eye_color: number;
  eye_scale: number;
  eye_aspect: number;
  eye_rotate: number;
  eye_x: number;
  eye_y: number;
  padding_2: number;
  eyebrow_type: number;
  eyebrow_color: number;
  eyebrow_scale: number;
  eyebrow_aspect: number;
  padding_3: number;
  eyebrow_rotate: number;
  eyebrow_x: number;
  eyebrow_y: number;
  padding_4: number;
  nose_type: number;
  nose_scale: number;
  nose_y: number;
  padding_5: number;
  mouth_type: number;
  mouth_color: number;
  mouth_scale: number;
  mouth_aspect: number;
  mouth_y: number;
  mustache_type: number;
  padding_6: number;
  beard_type: number;
  beard_color: number;
  beard_scale: number;
  beard_y: number;
  padding_7: number;
  glasses_type: number;
  glasses_color: number;
  glasses_scale: number;
  glass_y: number;
  mole_type: number;
  mole_scale: number;
  mole_x: number;
  mole_y: number;
  padding_8: number;
  creator: string;
  padding_9: number;
  checksum: number;
};

export type FFLiAuthorID = {
  data: Uint8Array;
};

export type FFLiCreateID = {
  flag_normal: number;
  flag_1: number;
  flag_temporary: number;
  flag_3: number;
  create_date1: number;
  create_date2: number;
  base: Uint8Array;
};

export function calculateCRC16(storeData: Uint8Array) {
  const data = storeData.subarray(0, 0x5e);
  console.log(data);

  let crc = 0x0000;

  for (const byte of data) {
    for (let bit = 7; bit >= 0; bit--) {
      const flag = (crc & 0x8000) != 0;
      crc = ((crc << 1) | ((byte >> bit) & 0x1)) ^ (flag ? 0x1021 : 0);
    }
  }

  for (let i = 16; i > 0; i--) {
    const flag = (crc & 0x8000) != 0;
    crc = (crc << 1) ^ (flag ? 0x1021 : 0);
  }

  return crc & 0xffff;
}
