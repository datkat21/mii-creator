export interface Offset {
  bytes: number;
  bits: number;
}

export interface Field<T extends any> {
  // Generic interface representing a field in a struct
  valueFromBytes(buf: ArrayBuffer, off?: Offset): T;
  bytesFromValue(val: T, buf?: ArrayBuffer, off?: Offset): ArrayBuffer;
  size?: number;
  width?: number;
  name?: string;
}

// Struct result type
export interface Struct {
  valueFromBytes(buf: ArrayBuffer, off?: Offset): any;
  bytesFromValue(val: any, buf?: ArrayBuffer, off?: Offset): ArrayBuffer;
  size?: number;
  width?: number;
  name?: string;
  pack: (val: any) => Uint8Array;
  unpack: (val: any) => any;
}
